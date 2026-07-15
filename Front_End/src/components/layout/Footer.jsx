import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoIcon}>E</span>
              <span className={styles.logoText}>Eventure</span>
            </Link>
            <p className={styles.description}>Smart event management platform for creating, organizing, and managing memorable experiences.</p>
          </div>
          <div className={styles.links}>
            <h4 className={styles.title}>Quick Links</h4>
            <Link to="/" className={styles.link}>Home</Link>
            <Link to="/events" className={styles.link}>Events</Link>
          </div>
          <div className={styles.links}>
            <h4 className={styles.title}>Categories</h4>
            <Link to="/events?category=Technology" className={styles.link}>Technology</Link>
            <Link to="/events?category=Business" className={styles.link}>Business</Link>
          </div>
          <div className={styles.contact}>
            <h4 className={styles.title}>Contact Us</h4>
            <div className={styles.contactItem}><Mail size={16} /><span>support@eventure.com</span></div>
            <div className={styles.contactItem}><Phone size={16} /><span>+1 (555) 123-4567</span></div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Eventure. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
