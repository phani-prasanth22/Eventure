import styles from './Loader.module.css';

export default function Loader({ size = 'md', text }) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageSpinner} />
      <p className={styles.pageText}>Loading...</p>
    </div>
  );
}

export function Skeleton({ width, height, className = '' }) {
  return <div className={`${styles.skeleton} ${className}`} style={{ width, height }} />;
}

export function EventCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton height="200px" className={styles.cardImage} />
      <div className={styles.cardContent}>
        <Skeleton width="60%" height="1.25rem" />
        <Skeleton width="40%" height="0.875rem" />
        <Skeleton width="80%" height="0.875rem" />
      </div>
    </div>
  );
}
