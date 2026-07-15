import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, ClipboardList, LogOut, Menu, X, PlusCircle, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/events', label: 'Events', icon: <Calendar size={20} /> },
    { path: '/admin/events/create', label: 'Create Event', icon: <PlusCircle size={20} /> },
    { path: '/admin/event-approvals', label: 'Event Approvals', icon: <CheckSquare size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/registrations', label: 'Registrations', icon: <ClipboardList size={20} /> }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/admin/events') return location.pathname === '/admin/events' || (location.pathname.startsWith('/admin/events/edit') && path !== '/admin/events/create');
    return location.pathname === path;
  };

  return (
    <div className={styles.layout}>
      <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}><span className={styles.logoIcon}>E</span><span className={styles.logoText}>Admin</span></Link>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>{item.icon}<span>{item.label}</span></Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div><div className={styles.userName}>{user?.name}</div><div className={styles.userRole}>Administrator</div></div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={18} /><span>Logout</span></button>
        </div>
      </aside>
      <main className={styles.main}><Outlet /></main>
    </div>
  );
}
