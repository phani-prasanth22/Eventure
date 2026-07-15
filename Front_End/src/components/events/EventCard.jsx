import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import styles from './EventCard.module.css';

export default function EventCard({ event }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Guard: if date is missing or invalid, show fallback instead of crashing
  let formattedDate = 'Date TBD';
  if (event.date) {
    const parsed = new Date(event.date);
    if (!isNaN(parsed.getTime())) {
      formattedDate = format(parsed, 'MMM d, yyyy');
    }
  }

  const spotsLeft = (event.capacity ?? 0) - (event.registered ?? 0);
  const locationDisplay = event.location
    ? event.location.split(',')[0]
    : event.venue ?? 'Venue TBD';

  const handleShare = async (e) => {
    e.preventDefault();
    if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: `/events/${event.id}`,
      });
    }
  };

  return (
    <Link to={`/events/${event.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={event.image || event.banner || '/placeholder-event.jpg'}
          alt={event.title}
          className={styles.image}
        />
        <div className={styles.categoryBadge}>{event.category}</div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.organizer}>by {event.organizer ?? 'Organizer'}</p>
        <div className={styles.details}>
          <div className={styles.detail}>
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
          <div className={styles.detail}>
            <MapPin size={14} />
            <span>{locationDisplay}</span>
          </div>
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>
            {!event.price || Number(event.price) === 0 ? 'Free' : `$${event.price}`}
          </span>
          <div className={styles.spots}>
            <Users size={12} />
            <span className={spotsLeft <= 20 ? styles.lowSpots : ''}>
              {spotsLeft} spots left
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}