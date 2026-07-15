import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/events/EventCard';
import { EventCardSkeleton } from '../../components/common/Loader';
import registrationService from '../../services/registrationService';
import eventService from '../../services/eventService';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regs = await registrationService.getUserRegistrations(user.id);
        const enriched = await Promise.all(regs.slice(0, 3).map(async (r) => {
          const event = await eventService.getEventById(r.eventId);
          return { ...r, event };
        }));
        setRegistrations(enriched);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const quickActions = [
    { label: 'Browse Events', icon: <Calendar size={20} />, href: '/events' },
    { label: 'My Events', icon: <CheckCircle size={20} />, href: '/my-events' },
    { label: 'Profile', icon: <Users size={20} />, href: '/profile' }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className={styles.subtitle}>Here's what's happening with your events</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.mainSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Upcoming Events</h2>
              <Link to="/my-events" className={styles.viewAll}>View All <ArrowRight size={16} /></Link>
            </div>
            <div className={styles.eventsList}>
              {loading ? [...Array(3)].map((_, i) => <EventCardSkeleton key={i} />) : registrations.length > 0 ? (
                registrations.map((reg) => <EventCard key={reg.id} event={reg.event} />)
              ) : (
                <div className={styles.empty}>
                  <Calendar size={40} />
                  <h3>No upcoming events</h3>
                  <Link to="/events"><button className={styles.browseBtn}>Browse Events</button></Link>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.quickActions}>
              <h3 className={styles.sidebarTitle}>Quick Actions</h3>
              <div className={styles.actionsList}>
                {quickActions.map((action, i) => (
                  <Link key={i} to={action.href} className={styles.actionItem}><span>{action.icon}</span><span>{action.label}</span></Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
