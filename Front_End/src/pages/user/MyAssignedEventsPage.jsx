import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Users, QrCode, Clock, CheckCircle
} from 'lucide-react';
import { PageLoader } from '../../components/common/Loader';
import teamService from '../../services/teamService';
import toast from 'react-hot-toast';
import styles from './MyAssignedEventsPage.module.css';

export default function MyAssignedEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await teamService.getAssignedEvents();
        setEvents(data);
      } catch {
        toast.error('Failed to load assigned events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Assigned Events</h1>
          <p className={styles.subtitle}>
            Events where you are assigned as a volunteer or lead.
          </p>
        </div>

        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={64} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No assigned events</h2>
            <p className={styles.emptyDesc}>
              You have not been assigned to any events yet.
              Contact the event organizer to get assigned.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={event.image || event.banner || '/placeholder-event.jpg'}
                    alt={event.title}
                    className={styles.image}
                  />
                  <span className={styles.categoryBadge}>{event.category}</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.organizer}>by {event.organizer}</p>

                  <div className={styles.metaList}>
                    <div className={styles.metaItem}>
                      <Calendar size={14} />
                      <span>{event.date || 'Date TBD'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <MapPin size={14} />
                      <span>{event.location || event.venue || 'Venue TBD'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock size={14} />
                      <span>{event.time || 'Time TBD'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Users size={14} />
                      <span>{event.capacity || 0} capacity</span>
                    </div>
                  </div>

                  <div className={styles.statusRow}>
                    <span className={`${styles.statusBadge} ${styles[event.status]}`}>
                      <CheckCircle size={12} />
                      {event.status}
                    </span>
                  </div>

                  <div className={styles.actions}>
                    <Link
                      to={`/events/${event.id}/checkin`}
                      className={styles.scanBtn}
                    >
                      <QrCode size={16} />
                      Open Scanner
                    </Link>
                    <Link
                      to={`/events/${event.id}/attendees`}
                      className={styles.attendeesBtn}
                    >
                      <Users size={16} />
                      Attendees
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}