import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, User, Mail, Phone, Building, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { PageLoader } from '../../components/common/Loader';
import Ticket from '../../components/events/Ticket';
import eventService from '../../services/eventService';
import registrationService from '../../services/registrationService';
import toast from 'react-hot-toast';
import styles from './EventRegistrationPage.module.css';

export default function EventRegistrationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [formData, setFormData] = useState({
    participantName: '',
    email: '',
    phone: '',
    college: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}/register` } } });
      return;
    }
    const fetchEvent = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
        setFormData({
          participantName: user?.name || '',
          email: user?.email || '',
          phone: '',
          college: '',
          notes: ''
        });
      } catch {
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isAuthenticated, navigate, user]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.participantName.trim().length < 2) {
      newErrors.participantName = 'Name is required';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (event?.status !== 'approved') {
      toast.error('This event is not approved yet. You cannot register at this time.');
      return;
    }

    setSubmitting(true);
    try {
      const reg = await registrationService.createRegistration({
        userId: user.id,
        eventId: id,
        fullName: formData.participantName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        year: '',
      });
      setRegistration(reg);
      setSuccess(true);
    } catch (error) {
      console.error('REGISTRATION ERROR:', error.response?.data || error);
      toast.error('Registration failed. Please try again.');

    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!event) return null;

  const isApproved = event.status === 'approved';

  if (!isApproved) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notApproved}>
            <AlertCircle size={64} className={styles.notApprovedIcon} />
            <h1 className={styles.notApprovedTitle}>Registration Not Available</h1>
            <p className={styles.notApprovedText}>
              This event is <strong>{event.status}</strong> and cannot be registered for at this time.
            </p>
            {event.status === 'pending' && (
              <p className={styles.notApprovedText}>Please wait for an admin to approve this event before registering.</p>
            )}
            {event.status === 'rejected' && event.reviewNotes && (
              <p className={styles.notApprovedText}><strong>Reason:</strong> {event.reviewNotes}</p>
            )}
            <div className={styles.notApprovedActions}>
              <Link to={`/events/${id}`}>
                <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>Back to Event</Button>
              </Link>
              <Link to="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success && event && registration) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successHeader}>
            <div className={styles.successIcon}><CheckCircle size={32} /></div>
            <h1 className={styles.successTitle}>Registration Successful!</h1>
            <p className={styles.successText}>You have successfully registered for {event.title}.</p>
          </div>
          <div className={styles.successContent}><Ticket registration={registration} event={event} /></div>
          <div className={styles.successActions}>
            <Link to="/my-events"><Button variant="outline">View My Events</Button></Link>
            <Link to="/events"><Button>Browse More Events</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.formSection}>
            <Link to={`/events/${id}`} className={styles.backLink}>Back to Event</Link>
            <h1 className={styles.title}>Register for Event</h1>
            <p className={styles.subtitle}>Complete the form below to register</p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input label="Participant Name" value={formData.participantName} onChange={(e) => setFormData({ ...formData, participantName: e.target.value })} placeholder="Enter your name" leftIcon={<User size={18} />} error={errors.participantName} fullWidth required />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter your email" leftIcon={<Mail size={18} />} error={errors.email} fullWidth required />
              <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter your phone" leftIcon={<Phone size={18} />} fullWidth />
              <Input
                label="College"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="Enter your college"
                leftIcon={<Building size={18} />}
                error={errors.college}
                fullWidth
                required
              />
              <div className={styles.textareaWrapper}>
                <label className={styles.textareaLabel}>Additional Notes</label>
                <textarea name="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any dietary restrictions, accessibility needs..." className={styles.textarea} rows={4} />
              </div>
              <Button type="submit" fullWidth size="lg" loading={submitting}>Complete Registration</Button>
            </form>
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              {event && (
                <>
                  <img src={event.image} alt={event.title} className={styles.summaryImage} />
                  <h4 className={styles.summaryEventTitle}>{event.title}</h4>
                  <p className={styles.summaryOrganizer}>by {event.organizer}</p>
                  <div className={styles.summaryPrice}><span>Ticket Price</span><span className={styles.priceValue}>{event.price === 0 ? 'Free' : `$${event.price}`}</span></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
