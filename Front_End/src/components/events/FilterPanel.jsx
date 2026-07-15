import Select from '../common/Select';
import styles from './FilterPanel.module.css';

export default function FilterPanel({ category, setCategory, location, setLocation, sortBy, setSortBy, categories, locations, onClear }) {
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));
  const locationOptions = locations.map((l) => ({ value: l, label: l }));
  const sortOptions = [
    { value: 'date_asc', label: 'Date (Earliest)' },
    { value: 'date_desc', label: 'Date (Latest)' },
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'price_desc', label: 'Price (High to Low)' }
  ];

  return (
    <div className={styles.panel}>
      <Select options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="All Categories" className={styles.select} />
      <Select options={locationOptions} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="All Locations" className={styles.select} />
      <Select options={sortOptions} value={sortBy} onChange={(e) => setSortBy(e.target.value)} placeholder="Sort By" className={styles.select} />
    </div>
  );
}
