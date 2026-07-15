import { useState, useEffect } from 'react';
import { Ban, Trash2, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import userService from '../../services/userService';
import styles from './AdminPages.module.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState('none');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const result = await userService.getAllUsers({ limit: 50 });
      setUsers(result.users);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    try {
      if (selectedUser.status === 'banned') await userService.unbanUser(selectedUser.id);
      else await userService.banUser(selectedUser.id);
      setShowModal('none');
      fetchUsers();
    } catch {
      console.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.id);
      setShowModal('none');
      fetchUsers();
    } catch {
      console.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>View and manage registered users</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.table}>
        <table>
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className={styles.loading}>Loading...</div></td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className={user.status === 'banned' ? styles.bannedRow : ''}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                      <span className={styles.userName}>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`${styles.role} ${styles[user.role]}`}>{user.role}</span></td>
                  <td><span className={`${styles.status} ${styles[user.status]}`}>{user.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => { setSelectedUser(user); setShowModal('ban'); }} title={user.status === 'banned' ? 'Unban' : 'Ban'}>
                        {user.status === 'banned' ? <UserCheck size={16} /> : <Ban size={16} />}
                      </button>
                      <button className={styles.actionBtnDanger} onClick={() => { setSelectedUser(user); setShowModal('delete'); }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal === 'ban'} onClose={() => setShowModal('none')} title={selectedUser?.status === 'banned' ? 'Unban User' : 'Ban User'} size="sm">
        <div className={styles.deleteContent}>
          <p>{selectedUser?.status === 'banned' ? `Unban ${selectedUser?.name}?` : `Ban ${selectedUser?.name}?`}</p>
          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={() => setShowModal('none')}>Cancel</Button>
            <Button variant="danger" onClick={handleBan}>{selectedUser?.status === 'banned' ? 'Unban' : 'Ban'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal === 'delete'} onClose={() => setShowModal('none')} title="Delete User" size="sm">
        <div className={styles.deleteContent}>
          <p>Delete <strong>{selectedUser?.name}</strong>?</p>
          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={() => setShowModal('none')}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
