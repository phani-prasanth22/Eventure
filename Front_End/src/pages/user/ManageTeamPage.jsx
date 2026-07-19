import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, UserPlus, Trash2, Users,
  Mail, Shield, User, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import teamService from '../../services/teamService';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';
import styles from './ManageTeamPage.module.css';

export default function ManageTeamPage() {
  const { id: eventId } = useParams();
  const { user, isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [form, setForm] = useState({ email: '', role: 'volunteer' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventData, membersData] = await Promise.all([
        eventService.getEventById(eventId),
        teamService.getTeamMembers(eventId),
      ]);
      setEvent(eventData);
      setMembers(membersData);
    } catch (error) {
      toast.error('Failed to load team data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.email.trim()) {
      setFormError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError('Enter a valid email address.');
      return;
    }

    setAdding(true);
    try {
      const newMember = await teamService.addTeamMember(eventId, form.email, form.role);
      setMembers((prev) => [...prev, newMember]);
      setForm({ email: '', role: 'volunteer' });
      toast.success('Team member added successfully.');
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Failed to add team member.';
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveConfirm = (member) => {
    setConfirmRemove(member);
  };

  const handleRemove = async () => {
    if (!confirmRemove) return;
    setRemovingId(confirmRemove.id);
    try {
      await teamService.removeTeamMember(eventId, confirmRemove.id);
      setMembers((prev) => prev.filter((m) => m.id !== confirmRemove.id));
      toast.success('Team member removed.');
    } catch {
      toast.error('Failed to remove team member.');
    } finally {
      setRemovingId(null);
      setConfirmRemove(null);
    }
  };

  if (loading) return <PageLoader />;
  if (!event) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <Link to="/my-created-events" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to My Events
          </Link>
          <h1 className={styles.title}>Manage Team</h1>
          <p className={styles.subtitle}>
            <span className={styles.eventName}>{event.title}</span>
          </p>
        </div>

        <div className={styles.grid}>

          {/* Add Member Form */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>
              <UserPlus size={20} />
              Add Team Member
            </h2>
            <p className={styles.cardDesc}>
              Add volunteers or leads by their registered email address.
            </p>
            <form onSubmit={handleAdd} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="volunteer@example.com"
                    className={styles.input}
                    disabled={adding}
                  />
                </div>
                {formError && (
                  <span className={styles.fieldError}>{formError}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={styles.select}
                  disabled={adding}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <button
                type="submit"
                className={styles.addBtn}
                disabled={adding}
              >
                <UserPlus size={16} />
                {adding ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          </div>

          {/* Team Members List */}
          <div className={styles.listCard}>
            <h2 className={styles.cardTitle}>
              <Users size={20} />
              Team Members
              <span className={styles.count}>{members.length}</span>
            </h2>

            {members.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={48} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>No team members yet</p>
                <p className={styles.emptyDesc}>
                  Add volunteers or leads using the form.
                </p>
              </div>
            ) : (
              <div className={styles.memberList}>
                {members.map((member) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {(member.username || member.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>
                        {member.username || member.email}
                      </div>
                      <div className={styles.memberEmail}>{member.email}</div>
                    </div>
                    <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                      <Shield size={12} />
                      {member.role}
                    </span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveConfirm(member)}
                      disabled={removingId === member.id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className={styles.quickLinks}>
          <Link to={`/events/${eventId}/checkin`} className={styles.quickLink}>
            Open Check-In Scanner →
          </Link>
          <Link to={`/events/${eventId}/attendees`} className={styles.quickLink}>
            View Attendees →
          </Link>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmRemove && (
        <div className={styles.modalOverlay} onClick={() => setConfirmRemove(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <AlertCircle size={40} className={styles.modalIcon} />
            <h3 className={styles.modalTitle}>Remove Team Member?</h3>
            <p className={styles.modalText}>
              Are you sure you want to remove{' '}
              <strong>{confirmRemove.username || confirmRemove.email}</strong>{' '}
              from this event team?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setConfirmRemove(null)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleRemove}
                disabled={!!removingId}
              >
                {removingId ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}