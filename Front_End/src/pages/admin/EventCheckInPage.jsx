import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    CheckCircle, XCircle, AlertCircle, Search,
    Camera, Keyboard, Users, UserCheck, Clock, Percent
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import checkinService from '../../services/checkinService';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';
import styles from './EventCheckInPage.module.css';
import teamService from '../../services/teamService';

const RESULT_TIMEOUT = 4000; // auto-clear result after 4 seconds

export default function EventCheckInPage() {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanMode, setScanMode] = useState('usb'); // 'camera' | 'usb'
    const [result, setResult] = useState(null); // scan result to display
    const [stats, setStats] = useState(null);
    const [usbInput, setUsbInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [processing, setProcessing] = useState(false);

    const scannerRef = useRef(null);
    const usbInputRef = useRef(null);
    const resultTimerRef = useRef(null);

    // Load event and initial stats
    useEffect(() => {
        const init = async () => {
            try {
                const [eventData, statsData] = await Promise.all([
                    eventService.getEventById(eventId),
                    checkinService.getStats(eventId),
                ]);
                setEvent(eventData);
                setStats(statsData);

                // Permission check
                // Permission check — allow admin, organizer, and assigned team members
                if (!isAdmin && String(user?.id) !== String(eventData?.created_by)) {
                    try {
                        const assignedEvents = await teamService.getAssignedEvents();
                        const isAssigned = assignedEvents.some(
                            (e) => String(e.id) === String(eventId)
                        );
                        if (!isAssigned) {
                            toast.error('You do not have permission to access this page.');
                            navigate('/events');
                        }
                    } catch {
                        toast.error('You do not have permission to access this page.');
                        navigate('/events');
                    }
                }
            } catch {
                toast.error('Failed to load event.');
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [eventId]);

    // Camera scanner setup
    useEffect(() => {
        if (scanMode !== 'camera') return;

        const scanner = new Html5QrcodeScanner('qr-reader', {
            fps: 10,
            qrbox: { width: 280, height: 280 },
        }, false);

        scanner.render(
            (decodedText) => {
                if (!processing) {
                    handleScan(decodedText);
                }
            },
            () => { } // ignore errors
        );

        scannerRef.current = scanner;

        return () => {
            scanner.clear().catch(() => { });
        };
    }, [scanMode, processing]);

    // Auto-focus USB input when in USB mode
    useEffect(() => {
        if (scanMode === 'usb' && usbInputRef.current) {
            usbInputRef.current.focus();
        }
    }, [scanMode]);

    const handleScan = async (qrData) => {
        if (processing || !qrData.trim()) return;
        setProcessing(true);
        setResult(null);

        try {
            const response = await checkinService.scanQR(eventId, qrData);
            setResult(response);
            if (response.stats) setStats(response.stats);
        } catch (error) {
            const errData = error?.response?.data;
            setResult({
                status: errData?.status || 'invalid_qr',
                message: errData?.message || 'Check-in failed.',
            });
        } finally {
            setProcessing(false);
            setUsbInput('');

            // Auto-clear result and refocus USB input
            clearTimeout(resultTimerRef.current);
            resultTimerRef.current = setTimeout(() => {
                setResult(null);
                if (scanMode === 'usb' && usbInputRef.current) {
                    usbInputRef.current.focus();
                }
            }, RESULT_TIMEOUT);
        }
    };

    const handleUsbSubmit = (e) => {
        e.preventDefault();
        if (usbInput.trim()) {
            handleScan(usbInput.trim());
        }
    };


    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim().length < 2) return;
        setSearching(true);
        try {
            const results = await checkinService.search(eventId, searchQuery);
            setSearchResults(results);
        } catch {
            toast.error('Search failed.');
        } finally {
            setSearching(false);
        }
    };

    const handleManualCheckIn = async (registrationId) => {
        try {
            const response = await checkinService.manualCheckIn(eventId, registrationId);
            setResult(response);
            if (response.stats) setStats(response.stats);
            setSearchResults([]);
            setSearchQuery('');
        } catch (error) {
            const errData = error?.response?.data;
            setResult({
                status: errData?.status || 'invalid_qr',
                message: errData?.message || 'Check-in failed.',
            });
        }
    };

    if (loading) return <PageLoader />;
    if (!event) return null;

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Event Check-In</h1>
                    <p className={styles.subtitle}>{event.title}</p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Users size={24} className={styles.statIcon} />
                            <div className={styles.statValue}>{stats.total_registered}</div>
                            <div className={styles.statLabel}>Total Registered</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.statGreen}`}>
                            <UserCheck size={24} className={styles.statIcon} />
                            <div className={styles.statValue}>{stats.checked_in}</div>
                            <div className={styles.statLabel}>Checked In</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.statOrange}`}>
                            <Clock size={24} className={styles.statIcon} />
                            <div className={styles.statValue}>{stats.remaining}</div>
                            <div className={styles.statLabel}>Remaining</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.statBlue}`}>
                            <Percent size={24} className={styles.statIcon} />
                            <div className={styles.statValue}>{stats.percentage}%</div>
                            <div className={styles.statLabel}>Attendance</div>
                        </div>
                    </div>
                )}

                {/* Scan Result */}
                {result && (
                    <div className={`${styles.resultCard} ${styles[result.status]}`}>
                        {result.status === 'success' && (
                            <>
                                <CheckCircle size={48} className={styles.resultIcon} />
                                <h2 className={styles.resultTitle}>✅ CHECK-IN SUCCESSFUL</h2>
                                <div className={styles.resultDetails}>
                                    <p><strong>Name:</strong> {result.registration?.full_name}</p>
                                    <p><strong>Email:</strong> {result.registration?.email}</p>
                                    <p><strong>College:</strong> {result.registration?.college}</p>
                                    <p><strong>Event:</strong> {result.registration?.event_title}</p>
                                    <p><strong>Time:</strong> {result.registration?.checked_in_at
                                        ? new Date(result.registration.checked_in_at).toLocaleString()
                                        : 'Now'}</p>
                                </div>
                            </>
                        )}
                        {result.status === 'already_checked' && (
                            <>
                                <AlertCircle size={48} className={styles.resultIcon} />
                                <h2 className={styles.resultTitle}>⚠️ ALREADY CHECKED IN</h2>
                                <div className={styles.resultDetails}>
                                    <p><strong>Name:</strong> {result.registration?.full_name}</p>
                                    <p><strong>First check-in:</strong> {result.registration?.checked_in_at
                                        ? new Date(result.registration.checked_in_at).toLocaleString()
                                        : 'Unknown'}</p>
                                </div>
                            </>
                        )}
                        {result.status === 'wrong_event' && (
                            <>
                                <XCircle size={48} className={styles.resultIcon} />
                                <h2 className={styles.resultTitle}>❌ WRONG EVENT</h2>
                                <p>{result.message}</p>
                            </>
                        )}
                        {!['success', 'already_checked', 'wrong_event'].includes(result.status) && (
                            <>
                                <XCircle size={48} className={styles.resultIcon} />
                                <h2 className={styles.resultTitle}>❌ INVALID QR</h2>
                                <p>{result.message}</p>
                            </>
                        )}
                    </div>
                )}

                {/* Mode Toggle */}
                <div className={styles.modeToggle}>
                    <button
                        className={`${styles.modeBtn} ${scanMode === 'usb' ? styles.active : ''}`}
                        onClick={() => setScanMode('usb')}
                    >
                        <Keyboard size={18} /> USB Scanner
                    </button>
                    <button
                        className={`${styles.modeBtn} ${scanMode === 'camera' ? styles.active : ''}`}
                        onClick={() => setScanMode('camera')}
                    >
                        <Camera size={18} /> Camera Scanner
                    </button>
                </div>

                {/* USB Scanner Mode */}
                {scanMode === 'usb' && (
                    <div className={styles.usbSection}>
                        <p className={styles.usbHint}>
                            Focus this field and scan with your USB QR scanner.
                            The scanner will submit automatically.
                        </p>
                        <form onSubmit={handleUsbSubmit} className={styles.usbForm}>
                            <input
                                ref={usbInputRef}
                                type="text"
                                value={usbInput}
                                onChange={(e) => setUsbInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUsbSubmit(e);
                                    }
                                }}
                                placeholder="Scan QR code here..."
                                className={styles.usbInput}
                                autoComplete="off"
                                disabled={processing}
                            />
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={processing || !usbInput.trim()}
                            >
                                {processing ? 'Checking...' : 'Check In'}
                            </button>
                        </form>
                    </div>
                )}
                {/* Camera Scanner Mode */}
                {scanMode === 'camera' && (
                    <div className={styles.cameraSection}>
                        <p className={styles.cameraHint}>
                            Point the camera at the attendee's QR code.
                        </p>
                        <div id="qr-reader" className={styles.qrReader} />
                    </div>
                )}

                {/* Manual Search Fallback */}
                <div className={styles.searchSection}>
                    <h3 className={styles.searchTitle}>
                        <Search size={18} /> Manual Search (Fallback for damaged QR)
                    </h3>
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or registration ID"
                            className={styles.searchInput}
                        />
                        <button
                            type="submit"
                            className={styles.searchBtn}
                            disabled={searching || searchQuery.trim().length < 2}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className={styles.searchResults}>
                            {searchResults.map((reg) => (
                                <div key={reg.id} className={styles.searchResult}>
                                    <div className={styles.searchResultInfo}>
                                        <strong>{reg.full_name}</strong>
                                        <span>{reg.email}</span>
                                        <span>{reg.college}</span>
                                        <span className={reg.checked_in ? styles.checkedInBadge : styles.pendingBadge}>
                                            {reg.checked_in ? '✅ Checked In' : '⏳ Not Checked In'}
                                        </span>
                                    </div>
                                    {!reg.checked_in && (
                                        <button
                                            className={styles.manualCheckInBtn}
                                            onClick={() => handleManualCheckIn(reg.id)}
                                        >
                                            Check In
                                        </button>
                                    )}

                                </div>

                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}