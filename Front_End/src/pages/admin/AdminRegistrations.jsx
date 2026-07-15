import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Ticket from '../../components/events/Ticket';
import registrationService from '../../services/registrationService';
import eventService from '../../services/eventService';
import styles from './AdminPages.module.css';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState('none');
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const result = await registrationService.getAllRegistrations({ limit: 50 });
      const enriched = await Promise.all(result.registrations.map(async (r) => {
        const event = await eventService.getEventById(r.eventId);
        return { ...r, event };
      }));
      setRegistrations(enriched);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReg) return;
    try {
      await registrationService.approveRegistration(selectedReg.id);
      setShowModal('none');
      fetchRegistrations();
    } catch {
      console.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!selectedReg) return;
    try {
      await registrationService.rejectRegistration(selectedReg.id);
      setShowModal('none');
      fetchRegistrations();
    } catch {
      console.error('Failed to reject');
    }
  };

  const filteredRegs = registrations.filter((r) => r.participantName.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Registration Management</h1>
          <p className={styles.subtitle}>View, approve, and manage registrations</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <input type="text" placeholder="Search registrations..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.table}>
        <table>
          <thead>
            <tr><th>Participant</th><th>Event</th><th>Ticket Code</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className={styles.loading}>Loading...</div></td></tr>
            ) : (
              filteredRegs.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{reg.participantName.charAt(0).toUpperCase()}</div>
                      <div><div className={styles.userName}>{reg.participantName}</div><div className={styles.userEmail}>{reg.email}</div></div>
                    </div>
                  </td>
                  <td>{reg.event?.title}</td>
                  <td><code className={styles.ticketCode}>{reg.ticketCode}</code></td>
                  <td><span className={`${styles.status} ${styles[reg.status]}`}>{reg.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      {reg.status === 'pending' && (
                        <>
                          <button className={styles.actionBtnSuccess} onClick={() => { setSelectedReg(reg); setShowModal('approve'); }}><CheckCircle size={16} /></button>
                          <button className={styles.actionBtnDanger} onClick={() => { setSelectedReg(reg); setShowModal('reject'); }}><XCircle size={16} /></button>
                        </>
                      )}
                      <button className={styles.actionBtn} onClick={() => { setSelectedReg(reg); setShowModal('view'); }}><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal === 'view'} onClose={() => setShowModal('none')} title="Ticket" size="sm">
        {selectedReg && selectedReg.event && <Ticket registration={selectedReg} event={selectedReg.event} />}
      </Modal>

      <Modal isOpen={showModal === 'approve'} onClose={() => setShowModal('none')} title="Approve Registration" size="sm">
        <div className={styles.deleteContent}>
          <p>Approve registration for <strong>{selectedReg?.participantName}</strong>?</p>
          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={() => setShowModal('none')}>Cancel</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal === 'reject'} onClose={() => setShowModal('none')} title="Reject Registration" size="sm">
        <div className={styles.deleteContent}>
          <p>Reject registration for <strong>{selectedReg?.participantName}</strong>?</p>
          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={() => setShowModal('none')}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
