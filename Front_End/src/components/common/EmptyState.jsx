import { Calendar, Search, Users } from 'lucide-react';
import styles from './EmptyState.module.css';

const icons = { events: Calendar, search: Search, users: Users };

export default function EmptyState({ type = 'events', title = 'No items', description = '', action, actionText = 'Action' }) {
  const Icon = icons[type] || Calendar;
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}><Icon size={40} /></div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <button className={styles.action} onClick={action}>{actionText}</button>}
    </div>
  );
}
