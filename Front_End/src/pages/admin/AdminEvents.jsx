import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import eventService from '../../services/eventService';
import styles from './AdminPages.module.css';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState('none');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', time: '', category: 'Technology', location: '', price: '', capacity: '', image: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const result = await eventService.getAllEvents({ limit: 50 });
      setEvents(result.events);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({ title: event.title, description: event.description, date: event.date, time: event.time, category: event.category, location: event.location, price: event.price.toString(), capacity: event.capacity.toString(), image: event.image });
    setShowModal('edit');
  };

  const openCreateModal = () => {
    setSelectedEvent(null);
    setFormData({ title: '', description: '', date: '', time: '', category: 'Technology', location: '', price: '', capacity: '', image: '' });
    setShowModal('create');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) await eventService.updateEvent(selectedEvent.id, formData);
      else await eventService.createEvent(formData);
      setShowModal('none');
      fetchEvents();
    } catch {
      console.error('Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await eventService.deleteEvent(selectedEvent.id);
      setShowModal('none');
      fetchEvents();
    } catch {
      console.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Event Management</h1>
          <p className={styles.subtitle}>Create, edit, and manage events</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={openCreateModal}>Create Event</Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Date</th>
              <th>Price</th>
              <th>Registrations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className={styles.loading}>Loading...</div></td></tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div className={styles.eventCell}>
                      <img src={event.image} alt={event.title} className={styles.eventImage} />
                      <div><div className={styles.eventTitle}>{event.title}</div><div className={styles.eventOrganizer}>{event.organizer}</div></div>
                    </div>
                  </td>
                  <td><span className={styles.category}>{event.category}</span></td>
                  <td>{event.date}</td>
                  <td>{event.price === 0 ? 'Free' : `$${event.price}`}</td>
                  <td>{event.registered}/{event.capacity}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openEditModal(event)}><Edit2 size={16} /></button>
                      <button className={styles.actionBtnDanger} onClick={() => { setSelectedEvent(event); setShowModal('delete'); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal === 'create' || showModal === 'edit'} onClose={() => setShowModal('none')} title={selectedEvent ? 'Edit Event' : 'Create Event'} size="lg">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}><label>Title</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>{eventService.getCategories().map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className={styles.formGroup}><label>Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>Time</label><input type="text" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="09:00 AM" required /></div>
            <div className={styles.formGroup}><label>Location</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>Price ($)</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div>
          </div>
          <div className={styles.formGroup}><label>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
          <div className={styles.formGroup}><label>Image URL</label><input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." /></div>
          <div className={styles.formActions}>
            <Button variant="ghost" type="button" onClick={() => setShowModal('none')}>Cancel</Button>
            <Button type="submit">{selectedEvent ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showModal === 'delete'} onClose={() => setShowModal('none')} title="Delete Event" size="sm">
        <div className={styles.deleteContent}>
          <p>Are you sure you want to delete <strong>{selectedEvent?.title}</strong>?</p>
          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={() => setShowModal('none')}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
