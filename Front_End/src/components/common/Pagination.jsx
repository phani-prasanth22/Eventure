import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const getPageNumbers = () => {
    const pages = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) pages.push(i);
    if (pages[0] > 1) { pages.unshift('...'); pages.unshift(1); }
    if (pages[pages.length - 1] < totalPages) { pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button className={styles.btn} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={18} /></button>
      <div className={styles.pages}>
        {getPageNumbers().map((p, i) => p === '...' ? <span key={i} className={styles.ellipsis}>...</span> : (
          <button key={p} className={`${styles.btn} ${styles.pageBtn} ${currentPage === p ? styles.active : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
      </div>
      <button className={styles.btn} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={18} /></button>
    </div>
  );
}
