import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, placeholder = 'Search events...' }) {
  return (
    <div className={styles.wrapper}>
      <Search size={18} className={styles.searchIcon} />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={styles.input} />
      {value && <button type="button" onClick={() => onChange('')} className={styles.clearBtn}><X size={16} /></button>}
    </div>
  );
}
