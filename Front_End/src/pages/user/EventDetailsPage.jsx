import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Heart, Share2, AlertCircle, CheckCircle, XCircle, Ban, UsersRound } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';
import styles from './EventDetailsPage.module.css';

const StatusBadge = ({ status }) => {
  const config = {
    pending: { icon: <AlertCircle size={14} />, label: 'Pending Review', style: styles.pendingBadge },
    approved: { icon: <CheckCircle size={14} />, label: 'Approved', style: styles.approvedBadge },
    rejected: { icon: <XCircle size={14} />, label: 'Rejected', style: styles.rejectedBadge },
    cancelled: { icon: <Ban size={14} />, label: 'Cancelled', style: styles.cancelledBadge },
  };
  const { icon, label, style } = config[status] || config.pending;
  return (
    <span className={`${styles.badge} ${style}`}>
      {icon}
      {label}
    </span>
  );
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch {
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  if (loading) return <PageLoader />;
  if (!event) return null;

  const isOrganizer = isAuthenticated && user?.id === event.organizerId;
  const isApproved = event.status === 'approved';

  if (!isApproved && !isOrganizer && !isAdmin) {
    return (
      <div className={styles.page}>
        <div className={styles.container} style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <AlertCircle size={64} className={styles.notFoundIcon} />
          <h1 className={styles.notFoundTitle}>Event Not Available</h1>
          <p className={styles.notFoundText}>This event is not yet approved or is not available.</p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  let formattedDate = 'Date TBD';
  if (event.date) {
    const parsed = new Date(event.date);
    if (!isNaN(parsed.getTime())) {
      formattedDate = format(parsed, 'EEEE, MMMM d, yyyy');
    }
  }
  const spotsLeft = (event.capacity ?? 0) - (event.registered ?? 0);


  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: event.title, text: event.description, url: window.location.href });
    }
  };

  const handleRegister = () => {
    if (!isApproved) {
      toast.error('This event is not approved yet. You cannot register at this time.');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}/register` } } });
    } else {
      navigate(`/events/${id}/register`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src={event.image} alt={event.title} className={styles.heroImage} />
        <div className={styles.heroOverlay}>
          <div className={styles.container}>
            <Link to="/events" className={styles.backLink}><ArrowLeft size={16} /><span>Back to Events</span></Link>
            <div className={styles.heroContent}>
              <span className={styles.category}>{event.category}</span>
              <h1 className={styles.title}>{event.title}</h1>
              <p className={styles.organizer}>by {event.organizer}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            {!isApproved && (
              <div className={styles.approvalBanner}>
                <StatusBadge status={event.status} />
                {event.status === 'pending' && (
                  <p className={styles.approvalText}>This event is pending admin approval. It will be visible to the public once approved.</p>
                )}
                {event.status === 'rejected' && (
                  <>
                    <p className={styles.approvalText}>This event was rejected by an admin.</p>
                    {event.reviewNotes && (
                      <p className={styles.reviewNotes}><strong>Reason:</strong> {event.reviewNotes}</p>
                    )}
                  </>
                )}
                {event.status === 'cancelled' && (
                  <>
                    <p className={styles.approvalText}>This event has been cancelled by an admin.</p>
                    {event.reviewNotes && (
                      <p className={styles.reviewNotes}><strong>Reason:</strong> {event.reviewNotes}</p>
                    )}
                  </>
                )}
                {(isOrganizer || isAdmin) && (
                  <p className={styles.approvalText}>Only you can see this event because you are the organizer or an admin.</p>
                )}
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>About This Event</h2>
              <p className={styles.description}>{event.longDescription}</p>
            </div>

            {event.schedule?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Schedule</h2>
                <div className={styles.schedule}>
                  {event.schedule.map((item, i) => (
                    <div key={i} className={styles.scheduleItem}>
                      <div className={styles.scheduleTime}>{item.time}</div>
                      <div className={styles.scheduleActivity}>{item.activity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(event.speakers) && event.speakers.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Speakers</h2>
                <div className={styles.speakers}>
                  {event.speakers.map((speaker, i) => (
                    <div key={i} className={styles.speaker}>
                      <img src={speaker.image} alt={speaker.name} className={styles.speakerImage} />
                      <div>
                        <div className={styles.speakerName}>{speaker.name}</div>
                        <div className={styles.speakerRole}>{speaker.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.card}>
              <div className={styles.cardRow}><Calendar size={18} className={styles.cardIcon} /><div><div className={styles.cardLabel}>Date</div><div className={styles.cardValue}>{formattedDate}</div></div></div>
              <div className={styles.cardRow}><Clock size={18} className={styles.cardIcon} /><div><div className={styles.cardLabel}>Time</div><div className={styles.cardValue}>{event.time}</div></div></div>
              <div className={styles.cardRow}><MapPin size={18} className={styles.cardIcon} /><div><div className={styles.cardLabel}>Location</div><div className={styles.cardValue}>{event.venue}</div></div></div>
              <div className={styles.cardRow}><Users size={18} className={styles.cardIcon} /><div><div className={styles.cardLabel}>Availability</div><div className={styles.cardValue}>{spotsLeft} spots remaining</div></div></div>
              <div className={styles.price}>{event.price === 0 ? 'Free' : `$${event.price}`}</div>

              {!isApproved ? (
                <Button fullWidth size="lg" disabled>
                  {event.status === 'pending' ? 'Pending Approval' : 'Not Approved'}
                </Button>
              ) : (
                <Button fullWidth size="lg" onClick={handleRegister} disabled={spotsLeft <= 0}>
                  {spotsLeft <= 0 ? 'Sold Out' : 'Register Now'}
                </Button>
              )}

              <div className={styles.cardActions}>
                <Button variant="ghost" fullWidth leftIcon={<Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />} onClick={() => setIsWishlisted(!isWishlisted)}>{isWishlisted ? 'Saved' : 'Save'}</Button>
                <Button variant="ghost" fullWidth leftIcon={<Share2 size={18} />} onClick={handleShare}>Share</Button>
              </div>

              {(isOrganizer || isAdmin) && event.status === 'approved' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to={`/events/${id}/attendees`} className={styles.attendeesLink}>
                    <Button variant="outline" fullWidth leftIcon={<UsersRound size={18} />}>
                      View Attendees ({event.registered || 0})
                    </Button>
                  </Link>
                  <Link to={`/events/${id}/checkin`}>
                    <Button variant="outline" fullWidth leftIcon={<CheckCircle size={18} />}>
                      Check-In Scanner
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
