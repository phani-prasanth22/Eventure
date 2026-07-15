import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Clock, MapPin, Users, DollarSign, Eye, Check, X,
  AlertCircle, CheckCircle, XCircle, Search, Ban, UsersRound,
  Trash2, ChevronDown
} from 'lucide-react';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';
import styles from './AdminEventApproval.module.css';



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

export default function AdminEventApproval() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setselectedEvent] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    all: 0,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    loadEvents();
  }, [activeTab, page, searchTerm, isAdmin, navigate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Always fetch all admin events once
      const result = await eventService.getAllEvents({ page: 1, limit: 1000 });
      const allEvents = result.events || [];

      // 1) Set tab counts from ALL events
      setStatusCounts({
        pending: allEvents.filter(e => e.status === 'pending').length,
        approved: allEvents.filter(e => e.status === 'approved').length,
        rejected: allEvents.filter(e => e.status === 'rejected').length,
        cancelled: allEvents.filter(e => e.status === 'cancelled').length,
        all: allEvents.length,
      });

      // 2) Filter events for current tab
      let filtered = allEvents;
      if (activeTab !== 'all') {
        filtered = allEvents.filter(e => e.status === activeTab);
      }

      // 3) Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(event =>
          event.title?.toLowerCase().includes(q) ||
          event.organizer?.toLowerCase().includes(q)
        );
      }

      // 4) Pagination in frontend
      const limit = 10;
      const start = (page - 1) * limit;
      const paginatedEvents = filtered.slice(start, start + limit);

      setEvents(paginatedEvents);
      setTotalPages(Math.ceil(filtered.length / limit) || 1);

    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e) => {
    console.log('APPROVE CLICKED');
    console.log('selectedEvent:', selectedEvent);

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!selectedEvent) return;

    setActionLoading(selectedEvent.id);
    try {
      console.log('calling approveEvent...');
      await eventService.approveEvent(selectedEvent.id, reviewNotes);
      console.log('approveEvent success');

      toast.success('Event approved successfully');
      setShowApproveModal(false);
      setselectedEvent(null);
      setReviewNotes('');
      loadEvents();
    } catch (error) {
      console.error('Failed to approve event:', error);
      toast.error('Failed to approve event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent) return;
    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setActionLoading(selectedEvent.id);
    try {
      await eventService.rejectEvent(selectedEvent.id, reviewNotes);
      toast.success('Event rejected');
      setShowRejectModal(false);
      setselectedEvent(null);
      setReviewNotes('');
      loadEvents();
    } catch (error) {
      console.error('Failed to reject event:', error);
      toast.error('Failed to reject event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!selectedEvent) return;
    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    setActionLoading(selectedEvent.id);
    try {
      await eventService.cancelEvent(selectedEvent.id, reviewNotes);
      toast.success('Event cancelled');
      setShowCancelModal(false);
      setselectedEvent(null);
      setReviewNotes('');
      loadEvents();
    } catch (error) {
      console.error('Failed to cancel event:', error);
      toast.error('Failed to cancel event');
    } finally {
      setActionLoading(null);
    }
  };

  const openApproveModal = (event) => {
    setselectedEvent(event);
    setReviewNotes('');
    setShowApproveModal(true);
  };

  const openRejectModal = (event) => {
    setselectedEvent(event);
    setReviewNotes('');
    setShowRejectModal(true);
  };

  const openCancelModal = (event) => {
    setselectedEvent(event);
    setReviewNotes('');
    setShowCancelModal(true);
  };

  const openPreviewModal = (event) => {
    setselectedEvent(event);
    setShowPreviewModal(true);
  };

  const tabs = [
    { key: 'pending', label: 'Pending Review', count: statusCounts.pending },
    { key: 'approved', label: 'Approved', count: statusCounts.approved },
    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
    { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
    { key: 'all', label: 'All', count: statusCounts.all }
  ];

  const filteredEvents = events;

  if (loading && events.length === 0) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Event Approvals</h1>
            <p className={styles.subtitle}>Review and manage event submissions from organizers</p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statPending}>
              {statusCounts.pending}
            </div>
            <div className={styles.statLabel}>Pending Review</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statApproved}>
              {statusCounts.approved}
            </div>
            <div className={styles.statLabel}>Approved</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statRejected}>
              {statusCounts.rejected}
            </div>
            <div className={styles.statLabel}>Rejected</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber + ' ' + styles.statCancelled}>
              {statusCounts.cancelled}
            </div>
            <div className={styles.statLabel}>Cancelled</div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
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
                {tab.key !== 'all' && (
                  <span className={styles.tabCount}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={48} />}
            title={activeTab === 'pending' ? 'No pending events' : 'No events found'}
            description={activeTab === 'pending'
              ? 'All submitted events have been reviewed. Great job!'
              : 'No events match your current filters.'
            }
          />
        ) : (
          <>
            <div className={styles.eventList}>
              {filteredEvents.map(event => (
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
                        <div className={styles.organizerInfo}>
                          <span>by {event.organizer || 'Unknown'}</span>
                          <span className={styles.category}>{event.category}</span>
                        </div>
                      </div>
                      <div className={styles.dateInfo}>
                        <span className={styles.submittedLabel}>Submitted</span>
                        <span className={styles.submittedDate}>{event.createdAt}</span>
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
                        <span>Capacity: {event.capacity}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <UsersRound size={16} />
                        <span>{event.registered || 0} registered</span>
                      </div>
                    </div>

                    {event.reviewNotes && (event.status === 'approved' || event.status === 'rejected' || event.status === 'cancelled') && (
                      <div className={`${styles.reviewNotes} ${event.status === 'approved' ? styles.approvedNotes : (event.status === 'cancelled' ? styles.cancelledNotes : styles.rejectedNotes)}`}>
                        <AlertCircle size={16} />
                        <div>
                          <strong>{event.status === 'cancelled' ? 'Cancellation Reason' : 'Review Notes'}:</strong>
                          <p>{event.reviewNotes}</p>
                        </div>
                      </div>
                    )}

                    <div className={styles.eventActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye size={16} />}
                        onClick={() => openPreviewModal(event)}
                      >
                        View Details
                      </Button>

                      {event.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<UsersRound size={16} />}
                          onClick={() => navigate(`/events/${event.id}/attendees`)}
                        >
                          View Attendees
                        </Button>
                      )}

                      {event.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Check size={16} />}
                            onClick={() => openApproveModal(event)}
                            loading={actionLoading === event.id}
                            className={styles.approveBtn}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<X size={16} />}
                            onClick={() => openRejectModal(event)}
                            loading={actionLoading === event.id}
                            className={styles.rejectBtn}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {event.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Ban size={16} />}
                          onClick={() => openCancelModal(event)}
                          loading={actionLoading === event.id}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </Button>
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

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Event Details"
        size="xl"
      >
        {selectedEvent && (
          <div className={styles.preview}>
            {selectedEvent.image && (
              <div className={styles.previewImage}>
                <img src={selectedEvent.image} alt={selectedEvent.title} />
              </div>
            )}
            <div className={styles.previewContent}>
              <div className={styles.previewHeader}>
                <div>
                  <span className={styles.previewCategory}>{selectedEvent.category}</span>
                  <h2 className={styles.previewTitle}>{selectedEvent.title}</h2>
                  <p className={styles.previewOrganizer}>by {selectedEvent.organizer}</p>
                </div>
                <StatusBadge status={selectedEvent.status} />
              </div>

              <p className={styles.previewDescription}>{selectedEvent.description}</p>

              {selectedEvent.longDescription && (
                <div className={styles.previewSection}>
                  <h4>Full Description</h4>
                  <p>{selectedEvent.longDescription}</p>
                </div>
              )}

              <div className={styles.previewGrid}>
                <div className={styles.previewSection}>
                  <h4>Date & Time</h4>
                  <div className={styles.previewItem}><Calendar size={16} /> {selectedEvent.date}</div>
                  <div className={styles.previewItem}><Clock size={16} /> {selectedEvent.time}</div>
                  {selectedEvent.registrationDeadline && (
                    <div className={styles.previewItem}><AlertCircle size={16} /> Deadline: {selectedEvent.registrationDeadline}</div>
                  )}
                </div>

                <div className={styles.previewSection}>
                  <h4>Venue</h4>
                  <div className={styles.previewItem}><MapPin size={16} /> {selectedEvent.location}</div>
                  {selectedEvent.venue && (
                    <div className={styles.previewItem}>{selectedEvent.venue}</div>
                  )}
                  {selectedEvent.venueAddress && (
                    <div className={styles.previewItem}>{selectedEvent.venueAddress}</div>
                  )}
                </div>

                <div className={styles.previewSection}>
                  <h4>Tickets</h4>
                  <div className={styles.previewItem}><DollarSign size={16} /> {selectedEvent.price > 0 ? `$${selectedEvent.price}` : 'Free'}</div>
                  <div className={styles.previewItem}><Users size={16} /> Capacity: {selectedEvent.capacity}</div>
                  <div className={styles.previewItem}><UsersRound size={16} /> Registered: {selectedEvent.registered || 0}</div>
                </div>
              </div>

              {selectedEvent.schedule && selectedEvent.schedule.length > 0 && (
                <div className={styles.previewSection}>
                  <h4>Schedule</h4>
                  <div className={styles.scheduleList}>
                    {selectedEvent.schedule.map((item, i) => (
                      <div key={i} className={styles.scheduleItem}>
                        <span className={styles.scheduleTime}>{item.time}</span>
                        <span className={styles.scheduleActivity}>{item.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.rules && selectedEvent.rules.length > 0 && (
                <div className={styles.previewSection}>
                  <h4>Rules</h4>
                  <ul className={styles.rulesList}>
                    {selectedEvent.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Event"
        size="md"
      >
        <div className={styles.modalContent}>
          <p>Are you sure you want to approve <strong>"{selectedEvent?.title}"</strong>?</p>
          <p className={styles.modalHint}>This event will become publicly visible and open for registration.</p>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Review Notes (Optional)</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes for the organizer..."
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleApprove}
              loading={actionLoading === selectedEvent?.id}
            >
              Approve Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Event"
        size="md"
      >
        <div className={styles.modalContent}>
          <p>Are you sure you want to reject <strong>"{selectedEvent?.title}"</strong>?</p>
          <p className={styles.modalHint}>Please provide a reason for rejection to help the organizer improve their submission.</p>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Rejection Reason <span className={styles.required}>*</span></label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Explain why this event is being rejected..."
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={handleReject}
              loading={actionLoading === selectedEvent?.id}
            >
              Reject Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Event"
        size="md"
      >
        <div className={styles.modalContent}>
          <p>Are you sure you want to cancel <strong>"{selectedEvent?.title}"</strong>?</p>
          <p className={styles.modalHint}>This event will be removed from public listings. Existing attendees will be notified. Please provide a reason for cancellation.</p>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Cancellation Reason <span className={styles.required}>*</span></label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Explain why this event is being cancelled..."
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => setShowCancelModal(false)}>Close</Button>
            <Button type="button" variant="danger" onClick={handleCancel} loading={actionLoading === selectedEvent?.id}>
              Cancel Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
