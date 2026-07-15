import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Eye, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Ticket from '../../components/events/Ticket';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import registrationService from '../../services/registrationService';
import eventService from '../../services/eventService';
import styles from './MyEventsPage.module.css';

export default function MyEventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regs = await registrationService.getUserRegistrations();

        const enriched = await Promise.all(
          regs.map(async (r) => {
            const event = await eventService.getEventById(r.eventId);
            return { ...r, event };
          })
        );

        setRegistrations(enriched);
      } catch (error) {
        console.error('Failed to fetch registrations:', error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const filteredRegistrations = registrations.filter((r) => {
    if (activeTab === 'upcoming') return r.status === 'registered';
    if (activeTab === 'completed') return r.status === 'completed';
    return r.status === 'cancelled';
  });

  const handleCancel = async (id) => {
    try {
      await registrationService.cancelRegistration(id);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
      );
      setCancelModal(null);
    } catch (error) {
      console.error('Failed to cancel:', error.response?.data || error);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Events</h1>
            <p className={styles.subtitle}>Manage your event registrations</p>
          </div>
          <Link to="/events"><Button>Browse Events</Button></Link>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {filteredRegistrations.length === 0 ? (
            <EmptyState
              type="events"
              title="No events found"
              description={`No ${activeTab} events to show.`}
              action={() => navigate('/events')}
              actionText="Browse Events"
            />
          ) : (
            filteredRegistrations.map((reg) => (
              <div key={reg.id} className={styles.card}>
                <div className={styles.cardImage}>
                  <img src={reg.event.image} alt={reg.event.title} />
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <Link to={`/events/${reg.event.id}`} className={styles.cardTitle}>
                      {reg.event.title}
                    </Link>
                    <span className={`${styles.status} ${styles[reg.status]}`}>
                      {reg.status}
                    </span>
                  </div>

                  <div className={styles.cardDetails}>
                    <div className={styles.detail}>
                      <Calendar size={16} />
                      <span>{reg.event.date}</span>
                    </div>
                    <div className={styles.detail}>
                      <span>Ticket: {reg.ticketCode}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye size={16} />}
                      onClick={() => setSelectedTicket(reg)}
                    >
                      View Ticket
                    </Button>

                    {reg.status === 'registered' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<XCircle size={16} />}
                        onClick={() => setCancelModal(reg)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Your Ticket"
        size="sm"
      >
        {selectedTicket && <Ticket registration={selectedTicket} event={selectedTicket.event} />}
      </Modal>

      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Registration"
        size="sm"
      >
        {cancelModal && (
          <div className={styles.cancelContent}>
            <div className={styles.cancelIcon}>
              <AlertCircle size={32} />
            </div>
            <p>
              Are you sure you want to cancel your registration for{' '}
              <strong>{cancelModal.event.title}</strong>?
            </p>
            <div className={styles.cancelActions}>
              <Button variant="ghost" onClick={() => setCancelModal(null)}>
                Keep Registration
              </Button>
              <Button variant="danger" onClick={() => handleCancel(cancelModal.id)}>
                Yes, Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}