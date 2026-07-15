import { useState } from 'react';
import { User, Lock, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [notifications, setNotifications] = useState({ email: true, push: false, reminders: true });
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> }
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <h2 className={styles.userName}>{user?.name}</h2>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
          <nav className={styles.nav}>
            {tabs.map((tab) => (
              <button key={tab.id} className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.icon}<span>{tab.label}</span></button>
            ))}
          </nav>
          <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={18} /><span>Log Out</span></button>
        </div>

        <div className={styles.main}>
          {message.text && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}
          {activeTab === 'profile' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Profile Information</h3>
              <form onSubmit={handleProfileUpdate} className={styles.form}>
                <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} leftIcon={<User size={18} />} fullWidth />
                <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} leftIcon={<User size={18} />} fullWidth />
                <Button type="submit" loading={loading}>Save Changes</Button>
              </form>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Notification Settings</h3>
              <div className={styles.sectionContent}>
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}><h4>Email Notifications</h4><p>Receive updates about events</p></div>
                  <label className={styles.toggle}><input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} /><span className={styles.slider} /></label>
                </div>
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}><h4>Event Reminders</h4><p>Get reminders before events</p></div>
                  <label className={styles.toggle}><input type="checkbox" checked={notifications.reminders} onChange={(e) => setNotifications({ ...notifications, reminders: e.target.checked })} /><span className={styles.slider} /></label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
