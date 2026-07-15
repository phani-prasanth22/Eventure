import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Calendar, Clock, MapPin, Users, DollarSign,
  Send, Eye, ArrowLeft, X, PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';
import styles from './UserCreateEvent.module.css';

export default function UserCreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
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
      organizer: user?.name || '',
      schedule: [{ time: '', activity: '' }],
      rules: [''],
      speakers: [{ name: '', role: '', image: '' }],
    },
  });

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const event = await eventService.getEventById(id);
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
        organizer: event.organizer || user?.name || '',
        schedule: event.schedule?.length > 0 ? event.schedule : [{ time: '', activity: '' }],
        rules: event.rules?.length > 0 ? event.rules : [''],
        speakers: event.speakers?.length > 0 ? event.speakers : [{ name: '', role: '', image: '' }],
      });
    } catch (error) {
      console.error('Failed to load event:', error);
      toast.error('Failed to load event');
      navigate('/my-created-events');
    } finally {
      setLoading(false);
    }
  };

  const watchTitle = watch('title');
  const watchCategory = watch('category');
  const watchDate = watch('date');
  const watchTime = watch('time');
  const watchLocation = watch('location');
  const watchPrice = watch('price');
  const watchCapacity = watch('capacity');
  const watchImage = watch('image');
  const watchDescription = watch('description');

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
    if (schedule.length > 1) {
      setValue('schedule', schedule.filter((_, i) => i !== index));
    }
  };

  const addRule = () => {
    const rules = watch('rules');
    setValue('rules', [...rules, '']);
  };

  const removeRule = (index) => {
    const rules = watch('rules');
    if (rules.length > 1) {
      setValue('rules', rules.filter((_, i) => i !== index));
    }
  };

  const addSpeaker = () => {
    const speakers = watch('speakers');
    setValue('speakers', [...speakers, { name: '', role: '', image: '' }]);
  };

  const removeSpeaker = (index) => {
    const speakers = watch('speakers');
    if (speakers.length > 1) {
      setValue('speakers', speakers.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        category: data.category,
        venue: data.venue || data.location || 'TBD',
        event_date: data.date,
        event_time: data.time,
        registration_deadline: data.registrationDeadline
          ? data.registrationDeadline.split('T')[0]
          : data.date,
        max_capacity: parseInt(data.capacity) || 100,
        ticket_price: (parseFloat(data.price) || 0).toFixed(2),
      };

      if (isEditMode) {
        toast.error('Edit event is not connected yet');
        return;
      } else {
        await eventService.submitEventForApproval(eventData);
        toast.success('Event submitted for approval!');
      }

      navigate('/my-created-events');
    } catch (error) {
      console.error('Failed to submit event:', error);
      toast.error('Failed to submit event. Please try again.');
    } finally {
      setSubmitting(false);
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
          <Link to={isEditMode ? `/my-created-events` : '/my-created-events'} className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to My Events
          </Link>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
              <p className={styles.subtitle}>
                {isEditMode
                  ? 'Update your event and resubmit for approval.'
                  : 'Submit your event for approval. An admin will review it before it goes live.'}
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
            </div>
          </div>
        </div>

        <div className={styles.infoBanner}>
          <PlusCircle size={20} />
          <div>
            <strong>Event Approval Process</strong>
            <p>After submission, your event will be reviewed by an administrator. You will be notified via email once your event is approved or if any changes are needed.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.main}>
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
                  {errors.title && <span className={styles.error}>{errors.title.message}</span>}
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
                  {errors.description && <span className={styles.error}>{errors.description.message}</span>}
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
                    {errors.category && <span className={styles.error}>{errors.category.message}</span>}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Organizer Name</label>
                    <input
                      type="text"
                      {...register('organizer')}
                      placeholder="Your organization name"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

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
                    {errors.date && <span className={styles.error}>{errors.date.message}</span>}
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
                    {errors.time && <span className={styles.error}>{errors.time.message}</span>}
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
                    type="datetime-local"
                    {...register('registrationDeadline')}
                    className={styles.input}
                  />
                </div>
              </div>

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
                    {errors.location && <span className={styles.error}>{errors.location.message}</span>}
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

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Event Schedule</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
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
                        <button type="button" onClick={() => removeScheduleItem(index)} className={styles.removeBtn}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Speakers (Optional)</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
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
                      </div>
                      {watch('speakers').length > 1 && (
                        <button type="button" onClick={() => removeSpeaker(index)} className={styles.removeBtn}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Event Rules</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addRule}>
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
                        <button type="button" onClick={() => removeRule(index)} className={styles.removeBtn}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Submit for Approval</h2>
                <p className={styles.statusInfo}>
                  Your event will be submitted to administrators for review.
                </p>

                <Button
                  type="submit"
                  fullWidth
                  leftIcon={<Send size={18} />}
                  loading={submitting}
                  disabled={!formIsValid()}
                >
                  Submit Event
                </Button>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Pricing & Capacity</h2>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Ticket Price ($)</label>
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
                  {errors.capacity && <span className={styles.error}>{errors.capacity.message}</span>}
                </div>
              </div>

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
                  <span className={styles.hint}>Paste a URL from Pexels or your image host</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Event Preview" size="xl">
        <div className={styles.preview}>
          {watchImage && (
            <div className={styles.previewImage}>
              <img src={watchImage} alt="Preview" />
            </div>
          )}
          <div className={styles.previewContent}>
            <span className={styles.previewCategory}>{watchCategory || 'Category'}</span>
            <h2 className={styles.previewTitle}>{watchTitle || 'Untitled Event'}</h2>
            <p className={styles.previewDescription}>{watchDescription || 'No description provided'}</p>
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
    </div>
  );
}
