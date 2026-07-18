import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, Calendar, DollarSign, ArrowUpRight,
  AlertCircle, CheckCircle, XCircle, Ban, Clock, ArrowRight,
  FileText, CheckSquare
} from 'lucide-react';
import eventService from '../../services/eventService';
import Button from '../../components/common/Button';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allEventsResult, pendingResult] = await Promise.all([
          eventService.getAllEvents({ page: 1, limit: 1000 }),
          eventService.getPendingApprovals({ limit: 5 }),
        ]);

        const allEvents = allEventsResult.events || [];

        const pendingCount = allEvents.filter(e => e.status === 'pending').length;
        const approvedCount = allEvents.filter(e => e.status === 'approved').length;
        const rejectedCount = allEvents.filter(e => e.status === 'rejected').length;
        const cancelledCount = allEvents.filter(e => e.status === 'cancelled').length;

        setStats({
          totalEvents: allEvents.length,
          totalUsers: 0,           // no endpoint yet
          totalRegistrations: 0,   // no endpoint yet
          pendingCount,
          approvedCount,
          rejectedCount,
          cancelledCount,
          revenue: 0,
        });

        setPendingEvents(pendingResult.events || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents || 0, icon: <Calendar size={24} />, color: '#3b82f6' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <Users size={24} />, color: '#22c55e' },
    { label: 'Registrations', value: stats.totalRegistrations || 0, icon: <TrendingUp size={24} />, color: '#f59e0b' },
    { label: 'Revenue', value: `$${(stats.revenue || 0).toLocaleString()}`, icon: <DollarSign size={24} />, color: '#8b5cf6' }
  ];

  const approvalStats = [
    { label: 'Pending Review', value: stats.pendingCount || 0, icon: <AlertCircle size={20} />, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Approved', value: stats.approvedCount || 0, icon: <CheckCircle size={20} />, color: '#10b981', bg: '#d1fae5' },
    { label: 'Rejected', value: stats.rejectedCount || 0, icon: <XCircle size={20} />, color: '#ef4444', bg: '#fee2e2' },
    { label: 'Cancelled', value: stats.cancelledCount || 0, icon: <Ban size={20} />, color: '#6b7280', bg: '#f3f4f6' }
  ];

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Loading dashboard data...</p>
        <div className={styles.statsGrid}>
          {statCards.map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.subtitle}>Overview of your event management system</p>

      <div className={styles.statsGrid}>
        {statCards.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: stat.color }}>{stat.icon}</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Event Approval Status</h2>
      <div className={styles.approvalGrid}>
        {approvalStats.map((stat, i) => (
          <div key={i} className={styles.approvalCard} style={{ background: stat.bg }}>
            <div className={styles.approvalIcon} style={{ color: stat.color }}>{stat.icon}</div>
            <div className={styles.approvalContent}>
              <div className={styles.approvalValue} style={{ color: stat.color }}>{stat.value}</div>
              <div className={styles.approvalLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard} onClick={() => navigate('/admin/event-approvals')}>
            <div className={styles.actionIcon} style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <CheckSquare size={24} />
            </div>
            <div className={styles.actionContent}>
              <div className={styles.actionTitle}>Review Events</div>
              <div className={styles.actionDesc}>Approve or reject pending event submissions</div>
            </div>
            <ArrowRight size={18} />
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/admin/events')}>
            <div className={styles.actionIcon} style={{ background: '#dbeafe', color: '#3b82f6' }}>
              <Calendar size={24} />
            </div>
            <div className={styles.actionContent}>
              <div className={styles.actionTitle}>Manage Events</div>
              <div className={styles.actionDesc}>View all events and their status</div>
            </div>
            <ArrowRight size={18} />
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/admin/users')}>
            <div className={styles.actionIcon} style={{ background: '#d1fae5', color: '#10b981' }}>
              <Users size={24} />
            </div>
            <div className={styles.actionContent}>
              <div className={styles.actionTitle}>Manage Users</div>
              <div className={styles.actionDesc}>View and manage user accounts</div>
            </div>
            <ArrowRight size={18} />
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/admin/registrations')}>
            <div className={styles.actionIcon} style={{ background: '#ede9fe', color: '#8b5cf6' }}>
              <FileText size={24} />
            </div>
            <div className={styles.actionContent}>
              <div className={styles.actionTitle}>Registrations</div>
              <div className={styles.actionDesc}>View all event registrations</div>
            </div>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className={styles.pendingSection}>
        <div className={styles.pendingHeader}>
          <h2 className={styles.sectionTitle}>Pending Event Requests</h2>
          {pendingEvents.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/event-approvals')}>
              View All <ArrowRight size={14} />
            </Button>
          )}
        </div>

        {pendingEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={32} style={{ color: '#10b981' }} />
            <p>All events have been reviewed! No pending requests.</p>
          </div>
        ) : (
          <div className={styles.pendingList}>
            {pendingEvents.map(event => (
              <div key={event.id} className={styles.pendingItem}>
                <div className={styles.pendingInfo}>
                  <div className={styles.pendingImage}>
                    <img src={event.image} alt={event.title} />
                  </div>
                  <div>
                    <div className={styles.pendingTitle}>{event.title}</div>
                    <div className={styles.pendingMeta}>
                      <span>by {event.organizer}</span>
                      <span className={styles.pendingCategory}>{event.category}</span>
                      <span className={styles.pendingDate}>{event.date}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate('/admin/event-approvals')}>
                  Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
