import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EventCardSkeleton } from '../../components/common/Loader';
import EventCard from '../../components/events/EventCard';
import SearchBar from '../../components/events/SearchBar';
import FilterPanel from '../../components/events/FilterPanel';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import eventService from '../../services/eventService';
import styles from './EventsPage.module.css';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await eventService.getPublicEvents({ search, category, location, sortBy, page, limit: 9 });
      setEvents(result.events);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
    } finally {
      setLoading(false);
    }
  }, [search, category, location, sortBy, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
      if (key !== 'page') newParams.delete('page');
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => updateParams({ page: newPage.toString() });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Explore Events</h1>
          <p className={styles.subtitle}>Find and register for amazing events</p>
        </div>
        <div className={styles.filters}>
          <SearchBar value={search} onChange={(value) => updateParams({ search: value })} placeholder="Search events..." />
          <FilterPanel category={category} setCategory={(v) => updateParams({ category: v })} location={location} setLocation={(v) => updateParams({ location: v })} sortBy={sortBy} setSortBy={(v) => updateParams({ sortBy: v })} categories={eventService.getCategories()} locations={eventService.getLocations()} onClear={() => setSearchParams({})} />
        </div>
        <p className={styles.resultsCount}>{loading ? 'Searching...' : `${totalCount} events found`}</p>
        <div className={styles.grid}>
          {loading ? [...Array(9)].map((_, i) => <EventCardSkeleton key={i} />) : events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
        {!loading && events.length === 0 && <EmptyState type="search" title="No events found" description="Try adjusting your search." action={() => setSearchParams({})} actionText="Clear Filters" />}
        {!loading && events.length > 0 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
      </div>
    </div>
  );
}
