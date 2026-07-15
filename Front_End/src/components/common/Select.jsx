import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

const Select = forwardRef(function Select({ label, error, options = [], placeholder = 'Select...', fullWidth = false, className = '', ...props }, ref) {
  return (
    <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={`${styles.selectWrapper} ${error ? styles.error : ''}`}>
        <select ref={ref} className={styles.select} {...props}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className={styles.icon} size={18} />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

export default Select;
