import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import Toast from './common/Toast';
import BroadcastModal from './modals/BroadcastModal';
import ConfirmModal from './modals/ConfirmModal';
import NotificationDropdown from './dropdowns/NotificationDropdown';
import ProfileDropdown from './dropdowns/ProfileDropdown';
import DoctorSchedule, { ListView } from './schedule/DoctorSchedule';
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserCircle,
    LogOut,
    Bell,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    Trash2,
    CalendarDays,
    ArrowUpRight,
    X,
    ClipboardList,
    Stethoscope,
    Plus,
    Video,
    Link,
    Search,
    MoreHorizontal
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Label
} from 'recharts';

const statusStyle = {
    pending: 'text-amber-600',
    confirmed: 'text-gray-700',
    completed: 'text-blue-600',
    cancelled: 'text-red-500',
    missed: 'text-gray-400',
};

function Avatar({ name = '', src, size = 9 }) {
    const s = size * 4;
    return (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-medium bg-slate-100 text-slate-600 overflow-hidden shrink-0`}>
            {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{name.charAt(0).toUpperCase()}</span>}
        </div>
    );
}

function Badge({ status, date }) {
    const isMissed = status === 'pending' && date && new Date(date) < new Date().setHours(0, 0, 0, 0);
    const display = isMissed ? 'missed' : status;
    return (
        <span className={`text-xs font-semibold capitalize ${statusStyle[display] || 'text-gray-500'}`}>
            {display}
        </span>
    );
}

function DoctorDashboard() {
    const { user, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ patients: 0, appointments: 0, tasks: 0 });
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [view, setView] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [appointmentFilter, setAppointmentFilter] = useState('all');
    const [aptView, setAptView] = useState('list'); // 'list' | 'calendar'
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [completionModal, setCompletionModal] = useState({ isOpen: false, appointmentId: null });
    const [consultationData, setConsultationData] = useState({ diagnosis: '', prescription: '', doctorNotes: '' });
    const [savingConsultation, setSavingConsultation] = useState(false);

    // Accept appointment modal state (for Google Meet link)
    const [acceptModal, setAcceptModal] = useState({ isOpen: false, appointmentId: null });
    const [meetingLink, setMeetingLink] = useState('');
    const [savingAccept, setSavingAccept] = useState(false);

    const [profileData, setProfileData] = useState({ name: '', phone: '', specialization: '', gender: 'other', imageFile: null });
    const [previewImage, setPreviewImage] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

    // Schedule state
    const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [scheduleData, setScheduleData] = useState({
        fee: 0,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30
    });
    const [savingSchedule, setSavingSchedule] = useState(false);
    const [broadcastModal, setBroadcastModal] = useState({ isOpen: false, message: '', type: 'broadcast' });
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [aptDetail, setAptDetail] = useState(null); // appointment detail modal
    const [patientDetail, setPatientDetail] = useState(null); // patient profile detail modal
    const [patientDetailLoading, setPatientDetailLoading] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const searchRef = useRef(null);

    const growthData = useMemo(() => {
        const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
        return last7.map(date => {
            const ds = date.toISOString().split('T')[0];
            return { name: date.toLocaleDateString('en-US', { weekday: 'short' }), value: appointments.filter(a => a.date?.startsWith(ds)).length };
        });
    }, [appointments]);

    const statusDistribution = useMemo(() => {
        const dist = [
            { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#3b82f6' },
            { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#22c55e' },
            { name: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: '#f59e0b' },
            { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444' },
        ].filter(s => s.value > 0);
        return dist.length ? dist : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
    }, [appointments]);

    const genderDistribution = useMemo(() => {
        const counts = patients.reduce((acc, p) => { const k = p.gender || 'other'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
        const d = Object.keys(counts).map(k => ({ name: k, value: counts[k], color: k === 'male' ? '#3b82f6' : k === 'female' ? '#ec4899' : '#94a3b8' }));
        return d.length ? d : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
    }, [patients]);

    // Today's appointments count
    const todayAppts = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return appointments.filter(a => a.date?.startsWith(today)).length;
    }, [appointments]);

    // This week's total appointments
    const weekTotal = useMemo(() => {
        return growthData.reduce((sum, day) => sum + day.value, 0);
    }, [growthData]);

    // Search suggestions
    const searchSuggestions = useMemo(() => {
        if (searchQuery.trim().length === 0) return [];
        const query = searchQuery.toLowerCase();

        const matchedPatients = patients
            .filter(p => p.name?.toLowerCase().includes(query) || p.email?.toLowerCase().includes(query))
            .slice(0, 5)
            .map(p => ({ ...p, type: 'patient' }));

        const matchedAppointments = appointments
            .filter(a => a.patientName?.toLowerCase().includes(query) || a.patient?.name?.toLowerCase().includes(query))
            .slice(0, 5)
            .map(a => ({ ...a, type: 'appointment' }));

        return [...matchedPatients, ...matchedAppointments];
    }, [searchQuery, patients, appointments]);

    // Click-outside handler for search
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAll = async () => {
        try {
            const [sRes, aRes, pRes] = await Promise.all([
                axios.get('/doctor/stats'),
                axios.get('/appointments/doctor'),
                axios.get('/doctor/patients'),
            ]);
            setStats(sRes.data.data);
            setAppointments(aRes.data.data);
            setPatients(pRes.data.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) { console.error(err); }
    };

    const fetchPatientDetail = async (patientId) => {
        setPatientDetailLoading(true);
        try {
            const { data } = await axios.get(`/doctor/patient/${patientId}`);
            setPatientDetail(data.data);
        } catch (err) {
            console.error('Error fetching patient detail:', err);
            showToast('Failed to load patient details', 'error');
        } finally {
            setPatientDetailLoading(false);
        }
    };

    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await axios.get('/notifications');
                setNotifications(res.data.data);
                const unread = res.data.data.filter(n => !n.isRead && (n.type === 'broadcast' || n.type === 'alert'));
                if (unread.length > 0) {
                    const latest = unread[0];
                    setBroadcastModal({ isOpen: true, message: latest.message, type: latest.type });
                    await axios.put(`/notifications/${latest._id}/read`);
                    setNotifications(prev => prev.map(n => n._id === latest._id ? { ...n, isRead: true } : n));
                }
            } catch (err) { console.error(err); }
        };
        if (user) {
            fetchAll();
            checkNotifications();
            setProfileData({ name: user.name || '', phone: user.phone || '', specialization: user.specialization || '', gender: user.gender || 'other', imageFile: null });
            // Load schedule from user object (comes from /doctor/me)
            if (user.availability) {
                setScheduleData({
                    fee: user.fee || 0,
                    days: user.availability.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    startTime: user.availability.startTime || '09:00',
                    endTime: user.availability.endTime || '17:00',
                    slotDuration: user.availability.slotDuration || 30
                });
            } else {
                setScheduleData(s => ({ ...s, fee: user.fee || 0 }));
            }
            const iv = setInterval(checkNotifications, 15000);
            return () => clearInterval(iv);
        }
    }, [user]);

    const showToast = (message, type = 'success') => setToast({ message, type, isVisible: true });

    const updateAppointmentStatus = async (id, status, data = {}) => {
        try {
            await axios.put(`/appointments/${id}/status`, { status, ...data });
            await fetchAll();
            showToast('Status updated successfully.');
        } catch (err) {
            console.error('Status update error:', err);
            showToast(err.response?.data?.error || err.message || 'Failed to update status', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Appointment',
            message: 'Remove this appointment from your schedule?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/appointments/doctor/${id}`);
                    await fetchAll();
                    showToast('Appointment removed.');
                } catch (err) { showToast(err.response?.data?.error || 'Failed to remove', 'error'); }
            }
        });
    };

    const handleDeclineClick = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Decline Appointment',
            message: 'Are you sure you want to decline this appointment? This action cannot be undone.',
            type: 'neutral',
            confirmText: 'Yes, Decline',
            cancelText: 'No, Keep it',
            onConfirm: async () => {
                await updateAppointmentStatus(id, 'cancelled');
            }
        });
    };

    const handleSubmitConsultation = async (e) => {
        e.preventDefault();
        setSavingConsultation(true);
        await updateAppointmentStatus(completionModal.appointmentId, 'completed', consultationData);
        setSavingConsultation(false);
        setCompletionModal({ isOpen: false, appointmentId: null });
        setConsultationData({ diagnosis: '', prescription: '', doctorNotes: '' });
    };

    const handleAcceptAppointment = async () => {
        setSavingAccept(true);
        await updateAppointmentStatus(acceptModal.appointmentId, 'confirmed', { meetingLink: meetingLink.trim() });
        setSavingAccept(false);
        setAcceptModal({ isOpen: false, appointmentId: null });
        setMeetingLink('');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('name', profileData.name);
            fd.append('phone', profileData.phone);
            fd.append('specialization', profileData.specialization);
            fd.append('gender', profileData.gender);
            if (profileData.imageFile) fd.append('profilePicture', profileData.imageFile);
            const res = await axios.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) { updateUserProfile(res.data.data); showToast('Profile saved.'); }
        } catch (err) { showToast(err.response?.data?.error || 'Failed to save', 'error'); }
    };

    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (f) { setProfileData(p => ({ ...p, imageFile: f })); setPreviewImage(URL.createObjectURL(f)); }
    };

    const handleSaveSchedule = async (e) => {
        e.preventDefault();
        if (scheduleData.days.length === 0) { showToast('Select at least one working day.', 'error'); return; }
        if (scheduleData.startTime >= scheduleData.endTime) { showToast('End time must be after start time.', 'error'); return; }
        setSavingSchedule(true);
        try {
            const res = await axios.put('/doctor/schedule', {
                fee: scheduleData.fee,
                days: scheduleData.days,
                startTime: scheduleData.startTime,
                endTime: scheduleData.endTime,
                slotDuration: scheduleData.slotDuration
            });
            if (res.data.success) showToast('Schedule saved successfully!');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to save schedule', 'error');
        } finally {
            setSavingSchedule(false);
        }
    };

    const toggleDay = (day) => {
        setScheduleData(s => ({
            ...s,
            days: s.days.includes(day) ? s.days.filter(d => d !== day) : [...s.days, day]
        }));
    };

    const handleLogout = () => { window.location.href = 'http://localhost:5173'; };
    const pendingCount = appointments.filter(a => a.status === 'pending').length;

    const profilePicSrc = (u) => {
        if (!u) return null;
        if (u.profilePicture) {
            return u.profilePicture.startsWith('data:') || u.profilePicture.startsWith('http')
                ? u.profilePicture : `http://localhost:5001/${u.profilePicture}`;
        }
        if (u._id) {
            return `http://localhost:5001/api/doctor/${u._id}/profile-picture`;
        }
        return null;
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { id: 'patients', label: 'My Patients', icon: <Users size={16} /> },
        { id: 'appointments', label: 'Appointments', icon: <CalendarDays size={16} />, badge: pendingCount },
        { id: 'schedule', label: 'Schedule & Fee', icon: <Clock size={16} /> },
        { id: 'profile', label: 'Edit Profile', icon: <UserCircle size={16} /> },
    ];

    const filteredAppts = appointments.filter(a => appointmentFilter === 'all' || a.status === appointmentFilter);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-full z-20 transition-all duration-300 ease-in-out`}>
                <div className="h-20 flex items-center px-6 gap-3">
                    <img src="/qurehealth-logo.png" alt="QureHealth.AI" className="h-9 w-auto object-contain flex-shrink-0" />
                    {sidebarOpen && (
                        <div className="flex flex-col">
                            <span className="text-slate-900 font-black text-xl tracking-tighter leading-none">
                                QureHealth<span className="text-slate-900">.AI</span>
                            </span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${view === item.id ? 'bg-blue-50/50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                                }`}
                        >
                            <span className={view === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}>{item.icon}</span>
                            {sidebarOpen && (
                                <>
                                    <span className={`font-medium text-sm ${view === item.id ? 'text-blue-600' : 'text-slate-600'}`}>{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${view === item.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                            {view === item.id && (
                                <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
                    {sidebarOpen && (
                        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all w-full">
                            <LogOut size={20} className="text-slate-400" />
                            <span className="font-medium text-sm text-gray-600">Sign Out</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Main */}
            <div className={`flex-1 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
                {/* Top bar */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        <h1 className="text-sm font-semibold text-gray-900">
                            {view === 'dashboard' ? 'Overview' : view === 'patients' ? 'My Patients' : view === 'appointments' ? 'Schedule' : view === 'schedule' ? 'Schedule & Fee' : 'Edit Profile'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div ref={searchRef} className="relative group hidden sm:block">
                            <div className={`flex items-center gap-2 bg-gray-50 border px-3 py-1.5 rounded-lg focus-within:ring-2 ring-blue-500/20 transition-all w-64 ${showSearchSuggestions && searchSuggestions.length > 0 ? 'border-blue-200 shadow-lg' : 'border-gray-200'}`}>
                                <Search size={16} className="text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-gray-700 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchSuggestions(true);
                                    }}
                                    onFocus={() => setShowSearchSuggestions(true)}
                                />
                            </div>

                            {/* Search Suggestions Dropdown */}
                            {showSearchSuggestions && searchSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-1">
                                        {searchSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSearchQuery(suggestion.name || suggestion.patientName);
                                                    setShowSearchSuggestions(false);
                                                    if (suggestion.type === 'appointment') setView('appointments');
                                                    else setView('patients');
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-all group"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                        {(suggestion.name || suggestion.patientName || '?').charAt(0)}
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <div className="text-xs font-bold text-gray-800 truncate">
                                                            {suggestion.name || suggestion.patientName || 'Unknown'}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-medium truncate">
                                                            {suggestion.type === 'appointment' && suggestion.date ? new Date(suggestion.date).toLocaleDateString() : suggestion.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowUpRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <span className="text-xs text-gray-400 hidden sm:block">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(v => !v)}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative"
                            >
                                <Bell size={16} />
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                )}
                            </button>
                            {isNotificationOpen && (
                                <NotificationDropdown notifications={notifications} onMarkRead={handleMarkRead} onClose={() => setIsNotificationOpen(false)} />
                            )}
                        </div>
                        <ProfileDropdown
                            user={user}
                            onLogout={handleLogout}
                            onEditProfile={() => setView('profile')}
                        />
                    </div>
                </header>

                <main className="flex-1 p-6">

                    {/* DASHBOARD */}
                    {view === 'dashboard' && (
                        <div className="space-y-5 pb-6">
                            {/* Page Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">{getGreeting()}, Dr. {user?.name?.replace(/^Dr\.?\s*/i, '')}</h1>
                                    <p className="text-xs text-gray-500 mt-1">Here's your activity overview for today.</p>
                                </div>
                            </div>

                            {/* Stat Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Patients', value: stats.patients, text: 'text-blue-600', trend: '+8%', trendUp: true },
                                    { label: 'Appointments', value: stats.appointments, text: 'text-violet-600', trend: '+12%', trendUp: true },
                                    { label: 'Completed', value: stats.tasks, text: 'text-green-600', trend: '+5%', trendUp: true },
                                    { label: "Today's Schedule", value: todayAppts, text: 'text-amber-600', trend: '+3%', trendUp: true },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className={`flex items-center gap-2 mb-3 ${s.text}`}>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{s.label}</p>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
                                            <span className={`text-xs font-semibold ${s.text}`}>{s.trend}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">this week</p>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Area Chart */}
                                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">Appointment Activity</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{weekTotal} appointments this week</p>
                                        </div>
                                        <span className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg bg-gray-50">Last 7 days</span>
                                    </div>
                                    <div className="p-5 h-[260px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="drAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} cursor={{ stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '4 2' }} />
                                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#drAreaGrad)" dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Donut Chart */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900">Status Breakdown</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">All appointments</p>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center min-h-[180px]">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <PieChart>
                                                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={52} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                                                    {statusDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                    <Label value={appointments.length} position="center"
                                                        content={({ viewBox: { cx, cy } }) => (
                                                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                                <tspan x={cx} y={cy} fontSize={22} fontWeight="700" fill="#111827">{appointments.length}</tspan>
                                                                <tspan x={cx} y={cy + 16} fontSize={10} fill="#9ca3af" fontWeight="500">total</tspan>
                                                            </text>
                                                        )}
                                                    />
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="px-5 pb-5 space-y-2 border-t border-gray-100 pt-4">
                                        {statusDistribution.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                                    <span className="text-xs text-gray-600 font-medium">{s.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-gray-900">{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Appointments */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Recent Appointments</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{appointments.length} total appointments</p>
                                    </div>
                                    <button onClick={() => setView('appointments')}
                                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                        View all <ArrowUpRight size={12} />
                                    </button>
                                </div>
                                {appointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                                        <CalendarDays size={32} strokeWidth={1} className="mb-2 text-gray-300" />
                                        <p className="text-sm text-gray-500 font-medium">No appointments yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {appointments.slice(0, 5).map(apt => {
                                            const isMissed = apt.status === 'pending' && apt.date && new Date(apt.date) < new Date().setHours(0, 0, 0, 0);
                                            const display = isMissed ? 'missed' : (apt.status || 'pending');
                                            const statusTextColor = {
                                                confirmed: 'text-blue-600',
                                                completed: 'text-green-600',
                                                pending: 'text-amber-600',
                                                cancelled: 'text-red-500',
                                                missed: 'text-gray-400',
                                            }[display] || 'text-gray-400';
                                            return (
                                                <div key={apt._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {(apt.patient?.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{apt.patient?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-400">{apt.date} · {apt.time}</p>
                                                    </div>
                                                    <span className={`text-xs font-semibold capitalize ${statusTextColor}`}>{display}</span>
                                                    <button onClick={() => setAptDetail(apt)} className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">View</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PATIENTS */}
                    {view === 'patients' && (
                        <div className="space-y-5 pb-6">
                            {/* Page Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">My Patients</h1>
                                    <p className="text-xs text-gray-500 mt-1">{patients.length} patient{patients.length !== 1 ? 's' : ''} registered under your care</p>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Total Patients', value: patients.length, text: 'text-blue-600' },
                                    { label: 'Male Patients', value: patients.filter(p => p.gender === 'male').length, text: 'text-indigo-600' },
                                    { label: 'Female Patients', value: patients.filter(p => p.gender === 'female').length, text: 'text-pink-600' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shrink-0 px-8">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                                            <p className="text-xl font-bold text-gray-900">{s.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Patients Table */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900">Patient List</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">All patients who have booked with you</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Patient</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Email</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Phone</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Gender</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patients.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-14 text-center">
                                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                                            <Users size={32} strokeWidth={1} className="text-gray-300" />
                                                            <p className="text-sm font-medium text-gray-500">No patients found</p>
                                                            <p className="text-xs text-gray-400">Patients will appear here once they book with you</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : patients.map(p => (
                                                <tr key={p._id} onClick={() => fetchPatientDetail(p._id)} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-colors cursor-pointer">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            {p.hasProfilePicture ? (
                                                                <img
                                                                    src={`/api/doctor/patient/${p._id}/profile-picture`}
                                                                    alt={p.name}
                                                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                                />
                                                            ) : null}
                                                            <div className={`w-8 h-8 rounded-full bg-blue-50 text-blue-600 items-center justify-center text-xs font-bold shrink-0 ${p.hasProfilePicture ? 'hidden' : 'flex'}`}>
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-gray-500">{p.email}</td>
                                                    <td className="px-5 py-3.5 text-xs text-gray-500">{p.phone || '—'}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize
                                                            ${p.gender === 'male' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                p.gender === 'female' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                                                    'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                            {p.gender || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                                            View <ArrowUpRight size={12} />
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* APPOINTMENTS */}
                    {view === 'appointments' && (
                        <div className="space-y-5 pb-6">
                            {/* Page Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">Appointments</h1>
                                    <p className="text-xs text-gray-500 mt-1">{appointments.length} total appointments</p>
                                </div>
                                {/* Calendar Toggle */}
                                <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                                    <button onClick={() => setAptView('list')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                                            ${aptView === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                        <MoreHorizontal size={13} /> List
                                    </button>
                                    <button onClick={() => setAptView('calendar')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                                            ${aptView === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                        <CalendarDays size={13} /> Calendar
                                    </button>
                                </div>
                            </div>

                            {aptView === 'calendar' ? (
                                <DoctorSchedule
                                    appointments={appointments}
                                    calendarOnly={true}
                                    onSelectAppointment={setAptDetail}
                                />
                            ) : (
                                <ListView
                                    appointments={appointments}
                                    onSelectAppointment={setAptDetail}
                                    onAccept={apt => { setAcceptModal({ isOpen: true, appointmentId: apt._id }); setMeetingLink(''); }}
                                    onDecline={apt => handleDeclineClick(apt._id)}
                                    onComplete={apt => setCompletionModal({ isOpen: true, appointmentId: apt._id })}
                                    onMeet={apt => apt.meetingLink && window.open(apt.meetingLink, '_blank')}
                                />
                            )}
                        </div>
                    )}

                    {/* SCHEDULE & FEE */}
                    {view === 'schedule' && (
                        <div className="space-y-5 pb-6">
                            {/* Page Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">Schedule & Fee</h1>
                                    <p className="text-xs text-gray-500 mt-1">Configure your availability and consultation fee</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {/* Form */}
                                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900">Availability Settings</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Set your working days, hours, and fees</p>
                                    </div>
                                    <form onSubmit={handleSaveSchedule} className="p-5 space-y-5">
                                        {/* Fee */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Consultation Fee (NPR)</label>
                                            <input
                                                type="number" min="0" step="50"
                                                value={scheduleData.fee}
                                                onChange={e => setScheduleData(s => ({ ...s, fee: e.target.value }))}
                                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g. 1500"
                                            />
                                        </div>

                                        {/* Working Days */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-2">Working Days</label>
                                            <div className="flex flex-wrap gap-2">
                                                {ALL_DAYS.map(day => (
                                                    <button key={day} type="button" onClick={() => toggleDay(day)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${scheduleData.days.includes(day)
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                            }`}>
                                                        {day.slice(0, 3)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Time Range */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Time</label>
                                                <input type="time" value={scheduleData.startTime}
                                                    onChange={e => setScheduleData(s => ({ ...s, startTime: e.target.value }))}
                                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Time</label>
                                                <input type="time" value={scheduleData.endTime}
                                                    onChange={e => setScheduleData(s => ({ ...s, endTime: e.target.value }))}
                                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        {/* Slot Duration */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slot Duration (minutes)</label>
                                            <select value={scheduleData.slotDuration}
                                                onChange={e => setScheduleData(s => ({ ...s, slotDuration: Number(e.target.value) }))}
                                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                                {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} minutes</option>)}
                                            </select>
                                        </div>

                                        <div className="flex justify-end pt-1">
                                            <button type="submit" disabled={savingSchedule}
                                                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
                                                {savingSchedule ? 'Saving…' : 'Save Schedule'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Preview Card */}
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">Your current schedule summary</p>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Working Days</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {scheduleData.days.length > 0 ? scheduleData.days.map(d => d.slice(0, 3)).join(', ') : 'None selected'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Working Hours</p>
                                                <p className="text-sm font-semibold text-gray-900">{scheduleData.startTime} – {scheduleData.endTime}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Slot Duration</p>
                                                <p className="text-sm font-semibold text-gray-900">{scheduleData.slotDuration} min slots</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Consultation Fee</p>
                                                <p className="text-sm font-semibold text-gray-900">NPR {scheduleData.fee || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROFILE */}
                    {view === 'profile' && (
                        <div className="max-w-lg">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">Profile Information</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Update your personal details</p>
                                </div>
                                <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                            {(previewImage || profilePicSrc(user)) ? (
                                                <img
                                                    src={previewImage || profilePicSrc(user)}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=6366f1&color=fff&size=128`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">Profile photo</p>
                                            <label className="cursor-pointer text-xs text-blue-600 hover:underline">
                                                Change photo
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Full Name', key: 'name', type: 'text' },
                                            { label: 'Phone', key: 'phone', type: 'tel' },
                                            { label: 'Specialization', key: 'specialization', type: 'text', full: true },
                                        ].map(f => (
                                            <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                                                <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                                                <input
                                                    type={f.type}
                                                    value={profileData[f.key]}
                                                    onChange={e => setProfileData(p => ({ ...p, [f.key]: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Gender</label>
                                            <select
                                                value={profileData.gender}
                                                onChange={e => setProfileData(p => ({ ...p, gender: e.target.value }))}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-1">
                                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                            Save changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Appointment Detail Modal */}
            {aptDetail && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={e => e.target === e.currentTarget && setAptDetail(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Appointment Details</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Full information for this appointment</p>
                            </div>
                            <button onClick={() => setAptDetail(null)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        {/* Patient info */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                                {(aptDetail.patient?.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900">{aptDetail.patient?.name || 'Unknown Patient'}</p>
                                <p className="text-xs text-gray-400">{aptDetail.patient?.email || '—'}</p>
                                {aptDetail.patient?.phone && <p className="text-xs text-gray-400">{aptDetail.patient.phone}</p>}
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="px-6 py-5 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 font-medium mb-1">Date</p>
                                <p className="text-sm font-bold text-gray-900 tabular-nums">{aptDetail.date || '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 font-medium mb-1">Time</p>
                                <p className="text-sm font-bold text-gray-900 tabular-nums">{aptDetail.time || '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 font-medium mb-1">Type</p>
                                <p className="text-sm font-bold text-gray-900 capitalize">{aptDetail.consultationType || 'In-person'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 font-medium mb-1">Patient Gender</p>
                                <p className="text-sm font-bold text-gray-900 capitalize">{aptDetail.patient?.gender || '—'}</p>
                            </div>
                        </div>

                        {aptDetail.reason && (
                            <div className="px-6 pb-4">
                                <p className="text-xs text-gray-400 font-medium mb-1.5">Reason for Visit</p>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-sm text-gray-700">{aptDetail.reason}</p>
                                </div>
                            </div>
                        )}

                        {aptDetail.meetingLink && (
                            <div className="px-6 pb-4">
                                <p className="text-xs text-gray-400 font-medium mb-1.5">Meeting Link</p>
                                <a href={aptDetail.meetingLink} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium truncate">
                                    <Video size={14} /> {aptDetail.meetingLink}
                                </a>
                            </div>
                        )}

                        {/* Footer actions */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2">
                            {aptDetail.status === 'pending' && !(aptDetail.date && new Date(aptDetail.date) < new Date().setHours(0, 0, 0, 0)) && (
                                <>
                                    <button
                                        onClick={() => { handleDeclineClick(aptDetail._id); setAptDetail(null); }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => { setAcceptModal({ isOpen: true, appointmentId: aptDetail._id }); setMeetingLink(''); setAptDetail(null); }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                        Accept
                                    </button>
                                </>
                            )}
                            {aptDetail.status === 'confirmed' && (
                                <button
                                    onClick={() => { setCompletionModal({ isOpen: true, appointmentId: aptDetail._id }); setAptDetail(null); }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                    <ClipboardList size={13} /> Mark Complete
                                </button>
                            )}
                            <button onClick={() => setAptDetail(null)}
                                className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accept Appointment Modal (Google Meet Link) */}
            {acceptModal.isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={e => e.target === e.currentTarget && setAcceptModal({ isOpen: false, appointmentId: null })}
                >
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Accept Appointment</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Add a Google Meet link for the consultation</p>
                            </div>
                            <button
                                onClick={() => setAcceptModal({ isOpen: false, appointmentId: null })}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Video size={13} className="text-blue-600" />
                                        Google Meet Link <span className="text-gray-400 font-normal">(optional)</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        value={meetingLink}
                                        onChange={e => setMeetingLink(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    Create a meeting at <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">meet.google.com</a> and paste the link here. The patient will see it in their dashboard.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setAcceptModal({ isOpen: false, appointmentId: null })}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAcceptAppointment}
                                    disabled={savingAccept}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-60 transition-colors inline-flex items-center gap-1.5"
                                >
                                    <CheckCircle2 size={14} />
                                    {savingAccept ? 'Confirming…' : 'Confirm & Accept'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Consultation Modal */}
            {completionModal.isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={e => e.target === e.currentTarget && setCompletionModal({ isOpen: false, appointmentId: null })}
                >
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Complete Consultation</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Add clinical details to mark this appointment as completed</p>
                            </div>
                            <button
                                onClick={() => setCompletionModal({ isOpen: false, appointmentId: null })}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitConsultation} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Diagnosis <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Viral fever"
                                    value={consultationData.diagnosis}
                                    onChange={e => setConsultationData(d => ({ ...d, diagnosis: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Prescription / Medications <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="e.g. Paracetamol 500mg — 3× daily for 5 days"
                                    value={consultationData.prescription}
                                    onChange={e => setConsultationData(d => ({ ...d, prescription: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                                <textarea
                                    rows={2}
                                    placeholder="Follow-up instructions, lifestyle advice…"
                                    value={consultationData.doctorNotes}
                                    onChange={e => setConsultationData(d => ({ ...d, doctorNotes: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setCompletionModal({ isOpen: false, appointmentId: null })}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingConsultation}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors"
                                >
                                    {savingConsultation ? 'Saving…' : 'Save record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast.isVisible && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
            )}

            <ConfirmModal
                {...confirmModal}
                onClose={() => setConfirmModal(m => ({ ...m, isOpen: false }))}
            />

            {/* ── Patient Detail Modal ── */}
            {(patientDetail || patientDetailLoading) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !patientDetailLoading && setPatientDetail(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        {patientDetailLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                                <p className="text-sm text-gray-500">Loading patient details...</p>
                            </div>
                        ) : patientDetail && (
                            <>
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white relative">
                                    <button onClick={() => setPatientDetail(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors">
                                        <X size={18} />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        {patientDetail.patient.hasProfilePicture ? (
                                            <img
                                                src={`/api/doctor/patient/${patientDetail.patient._id}/profile-picture`}
                                                alt={patientDetail.patient.name}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className={`w-14 h-14 rounded-full bg-white/20 items-center justify-center text-xl font-bold ${patientDetail.patient.hasProfilePicture ? 'hidden' : 'flex'}`}>
                                            {patientDetail.patient.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">{patientDetail.patient.name}</h2>
                                            <p className="text-sm text-blue-100">{patientDetail.patient.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-y-auto max-h-[calc(85vh-120px)] custom-scrollbar">
                                    {/* Patient Info Grid */}
                                    <div className="px-6 py-5 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Patient Information</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Phone', value: patientDetail.patient.phone || 'Not provided' },
                                                { label: 'Gender', value: patientDetail.patient.gender ? patientDetail.patient.gender.charAt(0).toUpperCase() + patientDetail.patient.gender.slice(1) : 'Not specified' },
                                                { label: 'Date of Birth', value: patientDetail.patient.dateOfBirth ? new Date(patientDetail.patient.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Not provided' },
                                                { label: 'Member Since', value: new Date(patientDetail.patient.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                                                { label: 'Total Visits', value: patientDetail.appointments.length },
                                                { label: 'Completed', value: patientDetail.appointments.filter(a => a.status === 'completed').length }
                                            ].map((item, i) => (
                                                <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                                                    <p className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</p>
                                                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Appointment History */}
                                    <div className="px-6 py-5">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Appointment History</h3>
                                        {patientDetail.appointments.length === 0 ? (
                                            <div className="text-center py-10 text-sm text-gray-400">No appointments found</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {patientDetail.appointments.map(apt => (
                                                    <div key={apt._id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} className="text-gray-400" />
                                                                <span className="text-sm font-semibold text-gray-800">
                                                                    {new Date(apt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                                <span className="text-xs text-gray-400">{apt.time}</span>
                                                            </div>
                                                            <span className={`text-xs font-semibold capitalize ${statusStyle[apt.status] || 'text-gray-500'}`}>
                                                                {apt.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-1"><span className="font-medium text-gray-600">Reason:</span> {apt.reason}</p>
                                                        {apt.diagnosis && <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">Diagnosis:</span> {apt.diagnosis}</p>}
                                                        {apt.prescription && <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium text-gray-600">Prescription:</span> {apt.prescription}</p>}
                                                        {apt.doctorNotes && <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium text-gray-600">Notes:</span> {apt.doctorNotes}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <BroadcastModal
                isOpen={broadcastModal.isOpen}
                onClose={() => setBroadcastModal(m => ({ ...m, isOpen: false }))}
                message={broadcastModal.message}
                type={broadcastModal.type}
            />
        </div>
    );
}

export default DoctorDashboard;
