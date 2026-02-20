import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import Toast from './Toast';
import BroadcastModal from './BroadcastModal';
import ConfirmModal from './ConfirmModal';
import NotificationDropdown from './NotificationDropdown';
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
    Link
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
    pending:   'bg-amber-50   text-amber-700  border-amber-200',
    confirmed: 'bg-green-50   text-green-700  border-green-200',
    completed: 'bg-blue-50    text-blue-700   border-blue-200',
    cancelled: 'bg-red-50     text-red-600    border-red-200',
};

function Avatar({ name = '', src, size = 9 }) {
    const s = size * 4;
    return (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-medium bg-slate-100 text-slate-600 overflow-hidden shrink-0`}>
            {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{name.charAt(0).toUpperCase()}</span>}
        </div>
    );
}

function Badge({ status }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${statusStyle[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {status}
        </span>
    );
}

function DoctorDashboard() {
    const { user, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats]                 = useState({ patients: 0, appointments: 0, tasks: 0 });
    const [appointments, setAppointments]   = useState([]);
    const [patients, setPatients]           = useState([]);
    const [view, setView]                   = useState('dashboard');
    const [loading, setLoading]             = useState(true);
    const [appointmentFilter, setAppointmentFilter] = useState('all');

    const [completionModal, setCompletionModal]   = useState({ isOpen: false, appointmentId: null });
    const [consultationData, setConsultationData] = useState({ diagnosis: '', prescription: '', doctorNotes: '' });
    const [savingConsultation, setSavingConsultation] = useState(false);

    // Accept appointment modal state (for Google Meet link)
    const [acceptModal, setAcceptModal] = useState({ isOpen: false, appointmentId: null });
    const [meetingLink, setMeetingLink] = useState('');
    const [savingAccept, setSavingAccept] = useState(false);

    const [profileData, setProfileData]   = useState({ name: '', phone: '', specialization: '', gender: 'other', imageFile: null });
    const [previewImage, setPreviewImage] = useState(null);
    const [toast, setToast]               = useState({ message: '', type: '', isVisible: false });

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
    const [notifications, setNotifications]   = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

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
            { name: 'Pending',   value: appointments.filter(a => a.status === 'pending').length,   color: '#f59e0b' },
            { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444' },
        ].filter(s => s.value > 0);
        return dist.length ? dist : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
    }, [appointments]);

    const genderDistribution = useMemo(() => {
        const counts = patients.reduce((acc, p) => { const k = p.gender || 'other'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
        const d = Object.keys(counts).map(k => ({ name: k, value: counts[k], color: k === 'male' ? '#3b82f6' : k === 'female' ? '#ec4899' : '#94a3b8' }));
        return d.length ? d : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
    }, [patients]);

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
            if (res.data.success) { updateUserProfile(res.data.data, res.data.token); showToast('Profile saved.'); }
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
        if (!u?.profilePicture) return null;
        return u.profilePicture.startsWith('data:') || u.profilePicture.startsWith('http')
            ? u.profilePicture : `http://localhost:5001/${u.profilePicture}`;
    };

    const navItems = [
        { id: 'dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={16} /> },
        { id: 'patients',     label: 'My Patients',  icon: <Users size={16} /> },
        { id: 'appointments', label: 'Appointments', icon: <CalendarDays size={16} />, badge: pendingCount },
        { id: 'schedule',     label: 'Schedule & Fee', icon: <Clock size={16} /> },
        { id: 'profile',      label: 'Edit Profile', icon: <UserCircle size={16} /> },
    ];

    const filteredAppts = appointments.filter(a => appointmentFilter === 'all' || a.status === appointmentFilter);

    return (
        <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

            {/* Sidebar */}
            <aside className="w-56 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20">
                <div className="h-14 flex items-center px-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center">
                            <Plus size={14} className="text-blue-600" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Qurehealth.AI</span>
                    </div>
                </div>

                <div className="px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium overflow-hidden shrink-0">
                            {profilePicSrc(user)
                                ? <img src={profilePicSrc(user)} alt="" className="w-full h-full object-cover" />
                                : <span>{user?.name?.charAt(0).toUpperCase()}</span>
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Dr. {user?.name?.replace(/^Dr\.?\s*/i, '')}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.specialization || 'Specialist'}</p>
                        </div>
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    </div>
                </div>

                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                view === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <span className={view === item.id ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge > 0 && (
                                <span className="ml-auto text-[10px] font-semibold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="px-3 py-3 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                        <LogOut size={16} className="text-gray-400" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <h1 className="text-sm font-semibold text-gray-900">
                        {view === 'dashboard' ? 'Overview' : view === 'patients' ? 'My Patients' : view === 'appointments' ? 'Schedule' : view === 'schedule' ? 'Schedule & Fee' : 'Edit Profile'}
                    </h1>
                    <div className="flex items-center gap-3">
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
                    </div>
                </header>

                <main className="flex-1 p-6">

                    {/* DASHBOARD */}
                    {view === 'dashboard' && (
                        <div className="space-y-5 max-w-6xl">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Total Patients',  value: stats.patients,     icon: <Users size={18} />,        color: 'text-blue-600',   bg: 'bg-blue-50'   },
                                    { label: 'Appointments',    value: stats.appointments, icon: <CalendarDays size={18} />, color: 'text-violet-600', bg: 'bg-violet-50' },
                                    { label: 'Completed',       value: stats.tasks,        icon: <CheckCircle2 size={18} />, color: 'text-green-600',  bg: 'bg-green-50'  },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-5">
                                        <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-4`}>{s.icon}</div>
                                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                        <p className="text-2xl font-semibold text-gray-900">{loading ? '—' : s.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                                    <p className="text-sm font-medium text-gray-900 mb-0.5">Appointment Activity</p>
                                    <p className="text-xs text-gray-400 mb-4">Daily volume — last 7 days</p>
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={growthData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                                <defs>
                                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={8} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', fontSize: 12 }} />
                                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
                                    <p className="text-sm font-medium text-gray-900 mb-0.5">Status Breakdown</p>
                                    <p className="text-xs text-gray-400 mb-2">All appointments</p>
                                    <div className="flex-1">
                                        <div className="h-44">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={statusDistribution} innerRadius={46} outerRadius={64} paddingAngle={3} dataKey="value">
                                                        {statusDistribution.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                                        <Label value={appointments.length} position="center"
                                                            content={({ viewBox: { cx, cy } }) => (
                                                                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                                    <tspan x={cx} y={cy} fontSize={20} fontWeight="600" fill="#111827">{appointments.length}</tspan>
                                                                    <tspan x={cx} y={cy + 15} fontSize={10} fill="#9ca3af">total</tspan>
                                                                </text>
                                                            )}
                                                        />
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1">
                                        {statusDistribution.map((s, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                                <span className="text-xs text-gray-500">{s.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">Recent Appointments</p>
                                    <button onClick={() => setView('appointments')} className="text-xs text-blue-600 hover:underline">View all</button>
                                </div>
                                {appointments.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-10">No appointments yet.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Patient</th>
                                                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Date & Time</th>
                                                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.slice(0, 5).map(apt => (
                                                <tr key={apt._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                                                    <td className="px-5 py-3 font-medium text-gray-800">{apt.patient?.name || 'Unknown'}</td>
                                                    <td className="px-5 py-3 text-gray-500 tabular-nums text-xs">{apt.date} · {apt.time}</td>
                                                    <td className="px-5 py-3"><Badge status={apt.status} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PATIENTS */}
                    {view === 'patients' && (
                        <div className="max-w-6xl">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{patients.length} patient{patients.length !== 1 ? 's' : ''}</p>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Name</th>
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Email</th>
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Phone</th>
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Gender</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center text-gray-400 py-10 text-sm">No patients found.</td></tr>
                                        ) : patients.map(p => (
                                            <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-medium shrink-0">
                                                            {p.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-500 text-xs">{p.email}</td>
                                                <td className="px-5 py-3.5 text-gray-500 text-xs">{p.phone || '—'}</td>
                                                <td className="px-5 py-3.5 text-gray-500 text-xs capitalize">{p.gender || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* APPOINTMENTS */}
                    {view === 'appointments' && (
                        <div className="max-w-6xl space-y-4">
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
                                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setAppointmentFilter(s)}
                                        className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                                            appointmentFilter === s
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        {s}
                                        {s !== 'all' && (
                                            <span className={`ml-1.5 ${appointmentFilter === s ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {appointments.filter(a => a.status === s).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Patient</th>
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Date</th>
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Time</th>
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Reason</th>
                                            <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                                            <th className="text-right text-xs font-medium text-gray-400 px-5 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAppts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center text-gray-400 py-14 text-sm">
                                                    No {appointmentFilter !== 'all' ? appointmentFilter : ''} appointments.
                                                </td>
                                            </tr>
                                        ) : filteredAppts.map(apt => (
                                            <tr key={apt._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 group">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-medium shrink-0">
                                                            {(apt.patient?.name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{apt.patient?.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-500 text-xs tabular-nums">{apt.date}</td>
                                                <td className="px-5 py-3.5 text-gray-500 text-xs tabular-nums">{apt.time}</td>
                                                <td className="px-5 py-3.5 text-gray-400 text-xs max-w-[160px] truncate italic">
                                                    {apt.reason ? `"${apt.reason}"` : '—'}
                                                </td>
                                                <td className="px-5 py-3.5"><Badge status={apt.status} /></td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {apt.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => { setAcceptModal({ isOpen: true, appointmentId: apt._id }); setMeetingLink(''); }}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                                                                >
                                                                    <CheckCircle2 size={12} /> Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                                                                >
                                                                    <XCircle size={12} /> Decline
                                                                </button>
                                                            </>
                                                        )}
                                                        {apt.status === 'confirmed' && (
                                                            <>
                                                                {apt.meetingLink && (
                                                                    <a
                                                                        href={apt.meetingLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                                                                        title="Open Meeting"
                                                                    >
                                                                        <Video size={12} /> Meet
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => setCompletionModal({ isOpen: true, appointmentId: apt._id })}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                                                                >
                                                                    <ClipboardList size={12} /> Complete
                                                                </button>
                                                            </>
                                                        )}
                                                        {['completed', 'cancelled'].includes(apt.status) && (
                                                            <button
                                                                onClick={() => handleDeleteClick(apt._id)}
                                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SCHEDULE & FEE */}
                    {view === 'schedule' && (
                        <div className="max-w-lg">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">Schedule & Fee Settings</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Set your availability and consultation fee</p>
                                </div>
                                <form onSubmit={handleSaveSchedule} className="p-6 space-y-5">
                                    {/* Fee */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Consultation Fee (NPR)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="50"
                                            value={scheduleData.fee}
                                            onChange={e => setScheduleData(s => ({ ...s, fee: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g. 1500"
                                        />
                                    </div>

                                    {/* Working Days */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">Working Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_DAYS.map(day => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                                                        scheduleData.days.includes(day)
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Time</label>
                                            <input
                                                type="time"
                                                value={scheduleData.startTime}
                                                onChange={e => setScheduleData(s => ({ ...s, startTime: e.target.value }))}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">End Time</label>
                                            <input
                                                type="time"
                                                value={scheduleData.endTime}
                                                onChange={e => setScheduleData(s => ({ ...s, endTime: e.target.value }))}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Slot Duration */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Slot Duration (minutes)</label>
                                        <select
                                            value={scheduleData.slotDuration}
                                            onChange={e => setScheduleData(s => ({ ...s, slotDuration: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={20}>20 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>60 minutes</option>
                                        </select>
                                    </div>

                                    {/* Preview */}
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                        <p className="text-xs text-blue-700 font-medium mb-1">Preview</p>
                                        <p className="text-xs text-blue-600">
                                            {scheduleData.days.length > 0
                                                ? `${scheduleData.days.map(d => d.slice(0, 3)).join(', ')} · ${scheduleData.startTime} – ${scheduleData.endTime} · ${scheduleData.slotDuration}min slots · NPR ${scheduleData.fee || 0}`
                                                : 'No working days selected'}
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="submit"
                                            disabled={savingSchedule}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors"
                                        >
                                            {savingSchedule ? 'Saving…' : 'Save Schedule'}
                                        </button>
                                    </div>
                                </form>
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
                                                <img src={previewImage || profilePicSrc(user)} alt="" className="w-full h-full object-cover" />
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
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(m => ({ ...m, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

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
