import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Users, Search, Mail, Phone, Building,
  GraduationCap, Calendar, Ticket, FileSpreadsheet, CheckCircle,
  AlertCircle, XCircle, Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import teamService from '../../services/teamService';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import eventService from '../../services/eventService';
import registrationService from '../../services/registrationService';
import toast from 'react-hot-toast';
import styles from './EventAttendeesPage.module.css';

const StatusBadge = ({ status }) => {
  const config = {
    registered: {
      icon: <CheckCircle size={14} />,
      label: 'Registered',
      className: styles.confirmed,
    },
    cancelled: {
      icon: <Ban size={14} />,
      label: 'Cancelled',
      className: styles.cancelled,
    },
  };
  const { icon, label, className } = config[status] || config.pending;
  return (
    <span className={`${styles.statusBadge} ${className}`}>
      {icon}
      {label}
    </span>
  );
};

export default function EventAttendeesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, attendeesData] = await Promise.all([
          eventService.getEventById(id),
          registrationService.getEventAttendees(id, { page, limit: 50 })
        ]);

        setEvent(eventData);

        console.log("EVENT DATA:", eventData);
        console.log("ATTENDEES DATA:", attendeesData);

        setAttendees(attendeesData.registrations);
        setTotalPages(attendeesData.totalPages);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, page]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!event || !user || isAdmin) return;

      const isOrganizer =
        String(user.id) === String(event.created_by);

      if (isOrganizer) return;

      try {
        const assignedEvents = await teamService.getAssignedEvents();

        const isAssigned = assignedEvents.some(
          (e) => String(e.id) === String(event.id)
        );

        if (!isAssigned) {
          toast.error("You do not have permission to view this page");
          navigate("/events");
        }
      } catch (err) {
        navigate("/events");
      }
    };

    checkAccess();
  }, [event, user, isAdmin, navigate]);

  const filteredAttendees = attendees.filter(a => {
    const matchSearch = (
      a.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const downloadCSV = () => {
    setDownloading(true);
    try {
      const headers = [
        'Event Name',
        'Student Name',
        'Email',
        'Phone',
        'College',

        'Year',

        'Registration Date',

        'Registration Status',
      ];

      const rows = attendees.map(a => [
        event?.title || '',
        a.fullName,
        a.email,
        a.phone || 'N/A',
        a.college || 'N/A',
        a.year || 'N/A',
        a.registeredAt,
        a.status,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(r =>
          r.map(field =>
            `"${String(field).replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event?.title?.replace(/\s+/g, '_') || 'event'}_attendees.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Attendee list downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download attendee list');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!event) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to={`/events/${id}`} className={styles.backLink}>
              <ArrowLeft size={18} />
              <span>Back to Event</span>
            </Link>
            <h1 className={styles.title}>{event.title} – Attendees</h1>
            <p className={styles.subtitle}>
              {attendees.length} total registration{attendees.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              leftIcon={<FileSpreadsheet size={18} />}
              onClick={downloadCSV}
              loading={downloading}
            >
              Download CSV
            </Button>
          </div>
        </div>

        <div className={styles.eventCard}>
          <div className={styles.eventImage}>
            <img src={event.image} alt={event.title} />
          </div>
          <div className={styles.eventInfo}>
            <div className={styles.eventInfoRow}>
              <div className={styles.eventInfoItem}>
                <Calendar size={16} />
                <span>{event.date}</span>
              </div>
              <div className={styles.eventInfoItem}>
                <Users size={16} />
                <span>{event.registered || 0} / {event.capacity} registered</span>
              </div>
              <div className={styles.eventInfoItem}>
                <Mail size={16} />
                <span>{event.organizer}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, college"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredAttendees.length === 0 ? (
          <div className={styles.emptyWrapper}>
            <EmptyState
              icon={<Users size={48} />}
              title="No attendees found"
              description="No attendees match your current search or filters."
            />
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Student</th>
                    <th className={styles.th}>Email</th>
                    <th className={styles.th}>Phone</th>
                    <th className={styles.th}>College</th>
                    <th className={styles.th}>Year</th>
                    <th className={styles.th}>Registration</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee, index) => (
                    <tr key={attendee.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.studentCell}>
                          <div className={styles.studentAvatar}>
                            {attendee.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.studentName}>{attendee.fullName}</div>
                            <div className={styles.studentId}>#{index + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.emailCell}>
                          <Mail size={14} />
                          <span>{attendee.email}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.phoneCell}>
                          <Phone size={14} />
                          <span>{attendee.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.collegeCell}>
                          <div className={styles.collegeName}>{attendee.college || 'N/A'}</div>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.yearCell}>
                          <GraduationCap size={14} />
                          <span>{attendee.year || 'N/A'}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.dateCell}>
                          <Calendar size={14} />
                          <span>{attendee.registeredAt ? new Date(attendee.registeredAt).toLocaleString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <StatusBadge status={attendee.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {filteredAttendees.map((attendee, index) => (
                <div key={attendee.id} className={styles.mobileCard}>
                  <div className={styles.mobileHeader}>
                    <div className={styles.studentAvatar}>
                      {attendee.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.mobileNameRow}>
                      <div className={styles.studentName}>{attendee.fullName}</div>
                      <div className={styles.studentId}>#{index + 1}</div>
                    </div>
                    <StatusBadge status={attendee.status} />
                  </div>
                  <div className={styles.mobileBody}>
                    <div className={styles.mobileRow}>
                      <Mail size={14} />
                      <span>{attendee.email}</span>
                    </div>
                    <div className={styles.mobileRow}>
                      <Phone size={14} />
                      <span>{attendee.phone || 'N/A'}</span>
                    </div>
                    <div className={styles.mobileRow}>
                      <Building size={14} />
                      <span>{attendee.college || 'N/A'}</span>
                    </div>
                    <div className={styles.mobileRow}>
                      <GraduationCap size={14} />
                      <span>{attendee.year ? `– ${attendee.year}` : 'N/A'}</span>
                    </div>
                    <div className={styles.mobileRow}>
                      <Calendar size={14} />
                      <span>Registered: {attendee.registeredAt ? new Date(attendee.registeredAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
