import { format } from 'date-fns';
import styles from './Ticket.module.css';

export default function Ticket({ registration, event }) {
  let formattedDate = 'Date TBD';
  if (event?.date) {
    const parsed = new Date(event.date);
    if (!isNaN(parsed.getTime())) {
      formattedDate = format(parsed, 'EEEE, MMMM d, yyyy');
    }
  }

  const handleDownload = async () => {
    if (!registration.qrCode) return;
    const response = await fetch(registration.qrCode);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${registration.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.ticket}>
      <div className={styles.header}>
        <div className={styles.eventure}>EVENTURE</div>
        <div className={styles.badge}>ADMIT ONE</div>
      </div>

      <div className={styles.content}>
        <div className={styles.eventInfo}>
          <h3 className={styles.eventTitle}>{event?.title}</h3>
          <p className={styles.info}>{formattedDate}</p>
          <p className={styles.info}>{event?.location || event?.venue || 'Venue TBD'}</p>
          <p className={styles.info}>{event?.time || ''}</p>
        </div>

        <div className={styles.qrSection}>
          {registration.qrCode ? (
            <>
              <div className={styles.qr}>
                <img
                  src={registration.qrCode}
                  alt="Registration QR Code"
                  className={styles.qrImage}
                />
              </div>
              <div className={styles.code}>
                REG-{String(registration.id).padStart(6, '0')}
              </div>
            </>
          ) : (
            <div className={styles.qrPlaceholder}>QR not available</div>
          )}
        </div>
      </div>

      <div className={styles.participant}>
        <p><strong>{registration.fullName}</strong></p>
        <p>{registration.email}</p>
        {registration.college && <p>{registration.college}</p>}
        {registration.phone && <p>{registration.phone}</p>}
      </div>

      <div className={styles.footer}>
        <span className={styles.status}>
          Status: {registration.status?.toUpperCase()}
        </span>
        <span className={styles.registeredAt}>
          Registered: {registration.registeredAt
            ? new Date(registration.registeredAt).toLocaleDateString()
            : 'N/A'}
        </span>
      </div>

      {registration.qrCode && (
        <div className={styles.downloadWrapper}>
          <button className={styles.downloadBtn} onClick={handleDownload}>
            Download QR Ticket
          </button>
        </div>
      )}
    </div>
  );
}