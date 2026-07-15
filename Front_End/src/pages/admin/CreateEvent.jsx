import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Calendar, Clock, MapPin, Users, DollarSign, Tag,
  Save, Send, Eye, ArrowLeft, Upload, X, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import eventService from '../../services/eventService';
import styles from './CreateEvent.module.css';

export default function CreateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingEvent, setExistingEvent] = useState(null);

  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      longDescription: '',
      category: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      venue: '',
      venueAddress: '',
      price: '',
      capacity: '',
      registrationDeadline: '',
      image: '',
      status: 'draft',
      organizer: user?.name || '',
      schedule: [{ time: '', activity: '' }],
      rules: [''],
      speakers: [{ name: '', role: '', image: '' }],
    },
  });

  const watchTitle = watch('title');
  const watchCategory = watch('category');
  const watchDate = watch('date');
  const watchTime = watch('time');
  const watchLocation = watch('location');
  const watchPrice = watch('price');
  const watchCapacity = watch('capacity');
  const watchImage = watch('image');
  const watchDescription = watch('description');

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const event = await eventService.getEventById(id);
      setExistingEvent(event);
      setImagePreview(event.image);
      reset({
        title: event.title || '',
        description: event.description || '',
        longDescription: event.longDescription || '',
        category: event.category || '',
        date: event.date || '',
        time: event.time || '',
        endTime: event.endTime || '',
        location: event.location || '',
        venue: event.venue || '',
        venueAddress: event.venueAddress || '',
        price: event.price?.toString() || '',
        capacity: event.capacity?.toString() || '',
        registrationDeadline: event.registrationDeadline || '',
        image: event.image || '',
        status: event.status || 'draft',
        organizer: event.organizer || user?.name || '',
        schedule: event.schedule?.length > 0 ? event.schedule : [{ time: '', activity: '' }],
        rules: event.rules?.length > 0 ? event.rules : [''],
        speakers: event.speakers?.length > 0 ? event.speakers : [{ name: '', role: '', image: '' }],
      });
    } catch (error) {
      console.error('Failed to load event:', error);
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setValue('image', url);
    setImagePreview(url);
  };

  const addScheduleItem = () => {
    const schedule = watch('schedule');
    setValue('schedule', [...schedule, { time: '', activity: '' }]);
  };

  const removeScheduleItem = (index) => {
    const schedule = watch('schedule');
    setValue('schedule', schedule.filter((_, i) => i !== index));
  };

  const addRule = () => {
    const rules = watch('rules');
    setValue('rules', [...rules, '']);
  };

  const removeRule = (index) => {
    const rules = watch('rules');
    setValue('rules', rules.filter((_, i) => i !== index));
  };

  const addSpeaker = () => {
    const speakers = watch('speakers');
    setValue('speakers', [...speakers, { name: '', role: '', image: '' }]);
  };

  const removeSpeaker = (index) => {
    const speakers = watch('speakers');
    setValue('speakers', speakers.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    console.log('FORM SUBMIT DATA:', data);
    setSaving(true);
    try {
      const eventData = {
        ...data,
        price: parseFloat(data.price) || 0,
        capacity: parseInt(data.capacity) || 100,
        registered: existingEvent?.registered || 0,
        schedule: data.schedule.filter(s => s.time && s.activity),
        rules: data.rules.filter(r => r.trim()),
        speakers: data.speakers.filter(s => s.name && s.role),
      };

      if (isEditMode) {
        await eventService.updateEvent(id, eventData);
      } else {
        await eventService.createEvent(eventData);
      }
      navigate('/admin/events');
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const data = watch();
    setSaving(true);
    try {
      const eventData = {
        ...data,
        status: 'draft',
        price: parseFloat(data.price) || 0,
        capacity: parseInt(data.capacity) || 100,
        registered: existingEvent?.registered || 0,
        schedule: data.schedule.filter(s => s.time && s.activity),
        rules: data.rules.filter(r => r.trim()),
        speakers: data.speakers.filter(s => s.name && s.role),
      };

      if (isEditMode) {
        await eventService.saveDraft(id, eventData);
      } else {
        await eventService.saveDraft(null, eventData);
      }
      navigate('/admin/events');
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const data = watch();
    setPublishing(true);
    try {
      const eventData = {
        ...data,
        status: 'published',
        price: parseFloat(data.price) || 0,
        capacity: parseInt(data.capacity) || 100,
        registered: existingEvent?.registered || 0,
        schedule: data.schedule.filter(s => s.time && s.activity),
        rules: data.rules.filter(r => r.trim()),
        speakers: data.speakers.filter(s => s.name && s.role),
      };

      if (isEditMode) {
        await eventService.updateEvent(id, eventData);
        await eventService.publishEvent(id);
      } else {
        const newEvent = await eventService.createEvent(eventData);
        await eventService.publishEvent(newEvent.id);
      }
      navigate('/admin/events');
    } catch (error) {
      console.error('Failed to publish event:', error);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(id);
      setShowDeleteModal(false);
      navigate('/admin/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const formIsValid = () => {
    return watchTitle && watchDescription && watchCategory && watchDate &&
      watchTime && watchLocation && watchCapacity;
  };

  if (loading) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/admin/events" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Events
          </Link>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>
                {isEditMode ? 'Edit Event' : 'Create New Event'}
              </h1>
              <p className={styles.subtitle}>
                {isEditMode
                  ? 'Update event details and settings'
                  : 'Fill in the details to create a new event'}
              </p>
            </div>
            <div className={styles.headerActions}>
              <Button
                variant="ghost"
                leftIcon={<Eye size={18} />}
                onClick={() => setShowPreview(true)}
                type="button"
              >
                Preview
              </Button>
              {isEditMode && (
                <Button
                  variant="ghost"
                  leftIcon={<Trash2 size={18} />}
                  onClick={() => setShowDeleteModal(true)}
                  type="button"
                  className={styles.deleteBtn}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.grid}>
            {/* Main Content */}
            <div className={styles.main}>
              {/* Basic Info Card */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Basic Information</h2>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Event Title <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    {...register('title', {
                      required: 'Event title is required',
                      minLength: { value: 5, message: 'Title must be at least 5 characters' }
                    })}
                    placeholder="Enter event title"
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                  />
                  {errors.title && (
                    <span className={styles.error}>{errors.title.message}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Short Description <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    {...register('description', {
                      required: 'Description is required',
                      minLength: { value: 20, message: 'Description must be at least 20 characters' }
                    })}
                    placeholder="Brief description for event cards"
                    rows={2}
                    className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                  />
                  {errors.description && (
                    <span className={styles.error}>{errors.description.message}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Full Description</label>
                  <textarea
                    {...register('longDescription')}
                    placeholder="Detailed description of your event"
                    rows={6}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      Category <span className={styles.required}>*</span>
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
                    >
                      <option value="">Select category</option>
                      {eventService.getCategories().map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className={styles.error}>{errors.category.message}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Organizer</label>
                    <input
                      type="text"
                      {...register('organizer')}
                      placeholder="Event organizer name"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Card */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Date & Time</h2>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      Event Date <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                    />
                    {errors.date && (
                      <span className={styles.error}>{errors.date.message}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      Start Time <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      {...register('time', { required: 'Start time is required' })}
                      placeholder="e.g., 09:00 AM"
                      className={`${styles.input} ${errors.time ? styles.inputError : ''}`}
                    />
                    {errors.time && (
                      <span className={styles.error}>{errors.time.message}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>End Time</label>
                    <input
                      type="text"
                      {...register('endTime')}
                      placeholder="e.g., 06:00 PM"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Registration Deadline</label>
                  <input
                    type="date"
                    {...register('registrationDeadline', { required: 'Registration deadline is required' })}
                    className={`${styles.input} ${errors.registrationDeadline ? styles.inputError : ''}`}
                  />
                  {errors.registrationDeadline && (
                    <span className={styles.error}>{errors.registrationDeadline.message}</span>
                  )}
                </div>
              </div>

              {/* Venue Card */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Venue Details</h2>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      Location (City) <span className={styles.required}>*</span>
                    </label>
                    <select
                      {...register('location', { required: 'Location is required' })}
                      className={`${styles.select} ${errors.location ? styles.inputError : ''}`}
                    >
                      <option value="">Select location</option>
                      {eventService.getLocations().map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.location && (
                      <span className={styles.error}>{errors.location.message}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Venue Name</label>
                    <input
                      type="text"
                      {...register('venue')}
                      placeholder="e.g., Convention Center"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Full Address</label>
                  <input
                    type="text"
                    {...register('venueAddress')}
                    placeholder="Street address, city, state, zip"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Schedule Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Event Schedule</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleItem}
                  >
                    + Add Item
                  </Button>
                </div>

                <div className={styles.dynamicList}>
                  {watch('schedule').map((_, index) => (
                    <div key={index} className={styles.scheduleItem}>
                      <input
                        type="text"
                        {...register(`schedule.${index}.time`)}
                        placeholder="Time"
                        className={styles.timeInput}
                      />
                      <input
                        type="text"
                        {...register(`schedule.${index}.activity`)}
                        placeholder="Activity description"
                        className={styles.activityInput}
                      />
                      {watch('schedule').length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScheduleItem(index)}
                          className={styles.removeBtn}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Speakers Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Speakers</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSpeaker}
                  >
                    + Add Speaker
                  </Button>
                </div>

                <div className={styles.dynamicList}>
                  {watch('speakers').map((_, index) => (
                    <div key={index} className={styles.speakerItem}>
                      <div className={styles.speakerFields}>
                        <input
                          type="text"
                          {...register(`speakers.${index}.name`)}
                          placeholder="Speaker name"
                          className={styles.speakerInput}
                        />
                        <input
                          type="text"
                          {...register(`speakers.${index}.role`)}
                          placeholder="Role/Company"
                          className={styles.speakerInput}
                        />
                        <input
                          type="url"
                          {...register(`speakers.${index}.image`)}
                          placeholder="Image URL (optional)"
                          className={styles.speakerInput}
                        />
                      </div>
                      {watch('speakers').length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpeaker(index)}
                          className={styles.removeBtn}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Event Rules</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRule}
                  >
                    + Add Rule
                  </Button>
                </div>

                <div className={styles.dynamicList}>
                  {watch('rules').map((_, index) => (
                    <div key={index} className={styles.ruleItem}>
                      <input
                        type="text"
                        {...register(`rules.${index}`)}
                        placeholder="Enter event rule"
                        className={styles.ruleInput}
                      />
                      {watch('rules').length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRule(index)}
                          className={styles.removeBtn}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
              {/* Publish Card */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Publish</h2>
                <p className={styles.statusInfo}>
                  Status: <span className={styles[watch('status') || 'draft']}>
                    {(watch('status') || 'draft').charAt(0).toUpperCase() + (watch('status') || 'draft').slice(1)}
                  </span>
                </p>

                <div className={styles.publishActions}>
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    leftIcon={<Save size={18} />}
                    onClick={handleSaveDraft}
                    loading={saving}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    leftIcon={<Send size={18} />}
                    onClick={handlePublish}
                    loading={publishing}
                    disabled={!formIsValid()}
                  >
                    Publish Event
                  </Button>
                </div>

                <div className={styles.divider} />

                <Button
                  type="submit"
                  fullWidth
                  loading={saving}
                  disabled={!isDirty}
                >
                  {isEditMode ? 'Update Event' : 'Save Event'}
                </Button>
              </div>

              {/* Pricing Card */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Pricing & Capacity</h2>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Ticket Price ($)
                  </label>
                  <div className={styles.priceInput}>
                    <DollarSign size={18} className={styles.inputIcon} />
                    <input
                      type="number"
                      {...register('price')}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={styles.input}
                    />
                  </div>
                  <span className={styles.hint}>Enter 0 for free events</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Maximum Capacity <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.priceInput}>
                    <Users size={18} className={styles.inputIcon} />
                    <input
                      type="number"
                      {...register('capacity', {
                        required: 'Capacity is required',
                        min: { value: 1, message: 'Capacity must be at least 1' }
                      })}
                      placeholder="100"
                      min="1"
                      className={`${styles.input} ${errors.capacity ? styles.inputError : ''}`}
                    />
                  </div>
                  {errors.capacity && (
                    <span className={styles.error}>{errors.capacity.message}</span>
                  )}
                  {isEditMode && existingEvent && (
                    <span className={styles.hint}>
                      {existingEvent.registered} already registered
                    </span>
                  )}
                </div>
              </div>

              {/* Image Card */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Banner Image</h2>

                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Event banner" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setValue('image', '');
                      }}
                      className={styles.removeImageBtn}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Image URL</label>
                  <input
                    type="url"
                    {...register('image')}
                    placeholder="https://example.com/image.jpg"
                    className={styles.input}
                    onChange={handleImageChange}
                  />
                  <span className={styles.hint}>
                    Paste a URL from Pexels or upload to your CDN
                  </span>
                </div>

                <div className={styles.imageSuggestions}>
                  <p className={styles.suggestionLabel}>Suggested images:</p>
                  <div className={styles.suggestedImages}>
                    {[
                      'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
                      'https://images.pexels.com/photos/1190138/pexels-photo-1190138.jpeg?auto=compress&cs=tinysrgb&w=800',
                      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
                    ].map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setValue('image', url);
                          setImagePreview(url);
                        }}
                        className={styles.suggestedImage}
                      >
                        <img src={url} alt={`Suggestion ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Event Preview"
        size="xl"
      >
        <div className={styles.preview}>
          {watchImage && (
            <div className={styles.previewImage}>
              <img src={watchImage} alt="Preview" />
            </div>
          )}
          <div className={styles.previewContent}>
            <span className={styles.previewCategory}>{watchCategory}</span>
            <h2 className={styles.previewTitle}>{watchTitle || 'Untitled Event'}</h2>
            <p className={styles.previewDescription}>
              {watchDescription || 'No description provided'}
            </p>
            <div className={styles.previewMeta}>
              <div className={styles.previewItem}>
                <Calendar size={16} />
                <span>{watchDate || 'No date set'}</span>
              </div>
              <div className={styles.previewItem}>
                <Clock size={16} />
                <span>{watchTime || 'No time set'}</span>
              </div>
              <div className={styles.previewItem}>
                <MapPin size={16} />
                <span>{watchLocation || 'No location set'}</span>
              </div>
              <div className={styles.previewItem}>
                <DollarSign size={16} />
                <span>{watchPrice ? `$${watchPrice}` : 'Free'}</span>
              </div>
              <div className={styles.previewItem}>
                <Users size={16} />
                <span>{watchCapacity ? `${watchCapacity} capacity` : 'No capacity set'}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Event"
        size="sm"
      >
        <div className={styles.deleteContent}>
          <p>Are you sure you want to delete this event?</p>
          <p className={styles.deleteWarning}>This action cannot be undone.</p>
          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
