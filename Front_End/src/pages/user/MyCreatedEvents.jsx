import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, DollarSign, Plus, Eye, Edit, AlertCircle, CheckCircle, XCircle, Ban, UsersRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import eventService from '../../services/eventService';
import styles from './MyCreatedEvents.module.css';

const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      icon: <AlertCircle size={14} />,
      label: 'Pending',
      className: styles.pending
    },
    approved: {
      icon: <CheckCircle size={14} />,
      label: 'Approved',
      className: styles.approved
    },
    rejected: {
      icon: <XCircle size={14} />,
      label: 'Rejected',
      className: styles.rejected
    },
    cancelled: {
      icon: <Ban size={14} />,
      label: 'Cancelled',
      className: styles.cancelled
    }
  };

  const { icon, label, className } = config[status] || config.pending;

  return (
    <span className={`${styles.statusBadge} ${className}`}>
      {icon}
      {label}
    </span>
  );
};

export default function MyCreatedEvents() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    // Only load when user.id is available
    if (user?.id) {
      loadEvents();
    }
  }, [activeTab, page, user?.id, isAuthenticated, navigate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (activeTab !== 'all') {
        params.approvalStatus = activeTab;
      }
      const result = await eventService.getOrganizerEvents(user.id, params);
      setEvents(result.events);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'All Events' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  if (loading && events.length === 0) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Created Events</h1>
            <p className={styles.subtitle}>Manage and track your event submissions</p>
          </div>
          <Link to="/create-event">
            <Button leftIcon={<Plus size={18} />}>Create New Event</Button>
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{events.length}</div>
            <div className={styles.statLabel}>Total Events</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statPending}>
              {events.filter(e => e.status === 'pending').length}
            </div>
            <div className={styles.statLabel}>Pending Review</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statApproved}>
              {events.filter(e => e.status === 'approved').length}
            </div>
            <div className={styles.statLabel}>Approved</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statRejected}>
              {events.filter(e => e.status === 'rejected').length}
            </div>
            <div className={styles.statLabel}>Rejected</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statCancelled}>
              {events.filter(e => e.status === 'cancelled').length}
            </div>
            <div className={styles.statLabel}>Cancelled</div>
          </div>
        </div>

        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} />}
            title="No events found"
            description="You haven't created any events yet. Start by creating your first event!"
            action={
              <Link to="/create-event">
                <Button leftIcon={<Plus size={18} />}>Create Your First Event</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className={styles.eventList}>
              {events.map(event => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventImage}>
                    <img
                      src={event.image || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={event.title}
                    />
                    <StatusBadge status={event.status} />
                  </div>

                  <div className={styles.eventContent}>
                    <div className={styles.eventHeader}>
                      <div>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        <span className={styles.eventCategory}>{event.category}</span>
                      </div>
                    </div>

                    <p className={styles.eventDescription}>{event.description}</p>

                    <div className={styles.eventMeta}>
                      <div className={styles.metaItem}>
                        <Calendar size={16} />
                        <span>{event.date}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{event.time}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <DollarSign size={16} />
                        <span>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>{event.registered || 0}/{event.capacity} registrations</span>
                      </div>
                    </div>

                    {((event.status === 'rejected' || event.status === 'cancelled')) && event.reviewNotes && (
                      <div className={`${styles.reviewNotes} ${event.status === 'cancelled' ? styles.cancelledNotes : ''}`}>
                        <AlertCircle size={16} />
                        <div>
                          <strong>{event.status === 'cancelled' ? 'Cancellation Reason' : 'Rejection Reason'}:</strong>
                          <p>{event.reviewNotes}</p>
                        </div>
                      </div>
                    )}

                    <div className={styles.eventActions}>
                      <Link to={`/events/${event.id}`}>
                        <Button variant="ghost" size="sm" leftIcon={<Eye size={16} />}>
                          View
                        </Button>
                      </Link>

                      {event.status === 'approved'  && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<UsersRound size={16} />}
                          onClick={() => navigate(`/events/${event.id}/attendees`)}
                        >
                          View Attendees ({event.registered || 0})
                        </Button>
                      )}

                      {event.status === 'pending' && (
                        <Link to={`/edit-event/${event.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Edit size={16} />}>
                            Edit
                          </Button>
                        </Link>
                      )}

                      {event.status === 'rejected' && (
                        <Link to={`/edit-event/${event.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Edit size={16} />}>
                            Edit & Resubmit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
