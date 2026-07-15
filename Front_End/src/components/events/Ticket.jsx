import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import Button from '../common/Button';
import styles from './Ticket.module.css';

export default function Ticket({ registration, event }) {
  return (
    <div className={styles.ticket}>
      <div className={styles.header}>
        <div className={styles.eventure}>EVENTURE</div>
        <div className={styles.badge}>ADMIT ONE</div>
      </div>
      <div className={styles.content}>
        <div className={styles.eventInfo}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <p className={styles.info}>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
          <p className={styles.info}>{event.location}</p>
        </div>
        <div className={styles.qrSection}>
          <div className={styles.qr}><QRCodeSVG value={registration.ticketCode} size={80} /></div>
          <div className={styles.code}>{registration.ticketCode}</div>
        </div>
      </div>
      <div className={styles.participant}>
        <p><strong>{registration.participantName}</strong></p>
        <p>{registration.email}</p>
      </div>
    </div>
  );
}
