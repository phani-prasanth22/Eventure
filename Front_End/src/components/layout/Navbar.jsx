import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut, Calendar, Settings, ChevronDown, Plus, ListChecks, LayoutDashboard, UsersRound, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Public nav links (always visible)
  const publicNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
  ];

  // User nav links (only when logged in as user)
  const userNavLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/my-events', label: 'My Registrations' },
  ];

  // Admin nav links (only when logged in as admin)
  const adminNavLinks = [
    { path: '/admin', label: 'Admin Dashboard' },
    { path: '/admin/event-approvals', label: 'Event Approvals' },
  ];

  const navLinks = [
    ...publicNavLinks,
    ...(isAuthenticated && !isAdmin ? userNavLinks : []),
    ...(isAdmin ? adminNavLinks : []),
  ];

  // Profile dropdown items
  const userDropdownItems = [
    { path: '/profile', icon: <User size={18} />, label: 'Profile' },
    { path: '/my-events', icon: <Calendar size={18} />, label: 'My Registrations' },
    { path: '/my-created-events', icon: <ListChecks size={18} />, label: 'My Created Events' },
    { path: '/create-event', icon: <Plus size={18} />, label: 'Create Event' },
  ];

  const adminDropdownItems = [
    { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Admin Dashboard' },
    { path: '/admin/event-approvals', icon: <FileText size={18} />, label: 'Event Approvals' },
    { path: '/admin/events', icon: <Calendar size={18} />, label: 'Events' },
    { path: '/admin/users', icon: <UsersRound size={18} />, label: 'Users' },
    { path: '/admin/registrations', icon: <ListChecks size={18} />, label: 'Registrations' },
  ];

  const dropdownItems = isAdmin ? adminDropdownItems : userDropdownItems;

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>E</span>
          <span className={styles.logoText}>Eventure</span>
        </Link>

        <div className={`${styles.links} ${isMenuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.link} ${location.pathname === link.path ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.themeBtn} onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {isAuthenticated ? (
            <div className={styles.profile}>
              <button className={styles.profileBtn} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                <span className={styles.roleBadge}>{user?.role === 'admin' ? 'Admin' : 'User'}</span>
                <ChevronDown size={16} className={`${styles.chevron} ${isProfileOpen ? styles.rotate : ''}`} />
              </button>
              {isProfileOpen && (
                <div className={styles.dropdown}>
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={styles.dropdownItem}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <hr className={styles.divider} />
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button variant="primary" size="sm">Register</Button></Link>
            </div>
          )}
          <button className={styles.menuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
