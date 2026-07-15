import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>The page you're looking for doesn't exist.</p>
        <div className={styles.actions}>
          <Link to="/"><Button leftIcon={<Home size={18} />}>Go Home</Button></Link>
          <Button variant="ghost" leftIcon={<ArrowLeft size={18} />} onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    </div>
  );
}
