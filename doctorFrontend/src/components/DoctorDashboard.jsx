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
    Plus,
    MoreHorizontal,
    Trash2
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

function DoctorDashboard() {
    const { user, logout, updateUserProfile, loading: authLoading } = useContext(AuthContext); // Assuming updateProfile might be needed or we reload
    const navigate = useNavigate();
    const [stats, setStats] = useState({ patients: 0, appointments: 0, tasks: 0 });
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'patients', 'appointments', 'profile'
    const [loading, setLoading] = useState(true);
    const [completionModal, setCompletionModal] = useState({ isOpen: false, appointmentId: null });
    const [consultationData, setConsultationData] = useState({ diagnosis: '', prescription: '', doctorNotes: '' });
    const [appointmentFilter, setAppointmentFilter] = useState('all');

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        specialization: '',
        gender: 'other',
        imageFile: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
    const [broadcastModal, setBroadcastModal] = useState({ isOpen: false, message: '', type: 'broadcast' });
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Processed Chart Data
    const growthData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(date => {
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
            // Appointments are stored with date string YYYY-MM-DD or similar. 
            // Checking view_file output from earlier (step 244/260), appointment has 'date' field.
            // Assuming 'date' is comparable string or we need to normalize.
            // Let's assume standard YYYY-MM-DD for now or simple string matching.
            // If appointment.date is "2024-02-18", good.
            const count = appointments.filter(a => a.date && a.date.startsWith(dateStr)).length;
            return {
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                value: count
            };
        });
    }, [appointments]);

    const statusDistribution = useMemo(() => [
        { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#10b981' },
        { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#f59e0b' },
        { name: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: '#6366f1' },
        { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444' },
    ].filter(s => s.value > 0), [appointments]);

    if (statusDistribution.length === 0 && !loading) {
        statusDistribution.push({ name: 'No Data', value: 1, color: '#f1f5f9' });
    }

    const genderDistribution = useMemo(() => {
        const counts = patients.reduce((acc, p) => {
            const g = (p.gender || 'Other').toLowerCase();
            const key = g.charAt(0).toUpperCase() + g.slice(1);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const data = Object.keys(counts).map(key => ({
            name: key,
            value: counts[key],
            color: key === 'Male' ? '#3b82f6' : key === 'Female' ? '#ec4899' : '#94a3b8'
        }));

        if (data.length === 0 && !loading) return [{ name: 'No Data', value: 1, color: '#f1f5f9' }];
        return data;
    }, [patients, loading]);

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = 'http://localhost:5173';
    };

    const runDataFetch_DELETED = null; // Removing this line since it's just context for the replacement

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await axios.get('/doctor/stats');
                setStats(statsRes.data.data);

                const appointmentsRes = await axios.get('/appointments/doctor');
                setAppointments(appointmentsRes.data.data);

                const patientsRes = await axios.get('/doctor/patients');
                setPatients(patientsRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        const checkNotifications = async () => {
            try {
                const res = await axios.get('/notifications');
                setNotifications(res.data.data); // Store all notifications

                const unread = res.data.data.filter(n => !n.isRead && (n.type === 'broadcast' || n.type === 'alert'));

                if (unread.length > 0) {
                    const latest = unread[0];
                    setBroadcastModal({
                        isOpen: true,
                        message: latest.message,
                        type: latest.type
                    });
                    // Mark as read immediately so it doesn't pop up again
                    await axios.put(`/notifications/${latest._id}/read`);

                    // Update local state to reflect read
                    setNotifications(prev => prev.map(n => n._id === latest._id ? { ...n, isRead: true } : n));
                }
            } catch (error) {
                console.error('Error checking notifications:', error);
            }
        };

        const handleMarkRead = async (id) => {
            try {
                await axios.put(`/notifications/${id}/read`);
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Error marking notification read:', error);
            }
        };

        if (user) {
            fetchData();
            checkNotifications(); // Immediate check

            // Poll every 15 seconds for new broadcasts/alerts
            const interval = setInterval(checkNotifications, 15000);

            // Init profile data
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                specialization: user.specialization || '',
                gender: user.gender || 'other',
                imageFile: null
            });

            return () => clearInterval(interval);
        }
    }, [user]);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const handleDeleteClick = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Appointment',
            message: 'Are you sure you want to remove this appointment from your list?',
            onConfirm: () => executeDelete(id)
        });
    };

    const executeDelete = async (id) => {
        try {
            await axios.delete(`/appointments/doctor/${id}`);
            const appointmentsRes = await axios.get('/appointments/doctor');
            setAppointments(appointmentsRes.data.data);
            Toast.fire({
                icon: 'success',
                title: 'Appointment removed'
            });
        } catch (error) {
            console.error('Error removing appointment:', error);
            Toast.fire({
                icon: 'error',
                title: 'Failed to remove appointment'
            });
        }
    };

    const updateAppointmentStatus = async (id, status, data = {}) => {
        try {
            await axios.put(`/appointments/${id}/status`, { status, ...data });
            const appointmentsRes = await axios.get('/appointments/doctor');
            setAppointments(appointmentsRes.data.data);
            const statsRes = await axios.get('/doctor/stats');
            setStats(statsRes.data.data);
            setToast({ message: 'Appointment status updated!', type: 'success', isVisible: true });
        } catch (error) {
            console.error('Error updating status:', error);
            setToast({ message: 'Failed to update status', type: 'error', isVisible: true });
        }
    };

    const handleOpenCompleteModal = (appointmentId) => {
        setCompletionModal({ isOpen: true, appointmentId });
    };

    const handleSubmitConsultation = async (e) => {
        e.preventDefault();
        await updateAppointmentStatus(completionModal.appointmentId, 'completed', consultationData);
        setCompletionModal({ isOpen: false, appointmentId: null });
        setConsultationData({ diagnosis: '', prescription: '', doctorNotes: '' });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('phone', profileData.phone);
            formData.append('specialization', profileData.specialization); // Note: Backend needs to support this or we add it
            formData.append('gender', profileData.gender);
            if (profileData.imageFile) {
                formData.append('profilePicture', profileData.imageFile);
            }

            const res = await axios.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                updateUserProfile(res.data.data, res.data.token);
                setToast({ message: 'Profile updated successfully!', type: 'success', isVisible: true });
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            setToast({ message: 'Failed to update profile', type: 'error', isVisible: true });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData({ ...profileData, imageFile: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Calculate Notification Count (Pending Appointments)
    const pendingCount = appointments.filter(apt => apt.status === 'pending').length;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Minimal Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20 transition-all duration-300">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-[#3b82f6] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-[#1e293b] font-outfit leading-none">
                        Qurehealth.AI</span>

                </div>

                <div className="px-4 mb-2">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden text-blue-600 font-bold">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture.startsWith('data:') || user.profilePicture.startsWith('http')
                                        ? user.profilePicture
                                        : `http://localhost:5001/${user.profilePicture}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{user?.name?.charAt(0) || 'D'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                Dr. {user?.name?.replace(/^Dr\.?\s*/i, '')}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.specialization || 'Specialist'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
                        { id: 'patients', label: 'My Patients', icon: <Users size={18} /> },
                        { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
                        { id: 'profile', label: 'Edit Profile', icon: <UserCircle size={18} /> }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-[#1e293b] hover:bg-gray-50"
                        >
                            <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                                {item.icon}
                            </span>
                            <span className="font-extrabold text-[15px] tracking-tight">{item.label}</span>
                            {view === item.id && (
                                <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-3 py-2.5 text-[#1e293b] hover:bg-gray-50 rounded-lg transition-colors">
                        <LogOut size={20} className="text-slate-400" />
                        <span className="font-extrabold text-[15px] tracking-tight">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 transition-all">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {view === 'dashboard' ? 'Overview' : view === 'patients' ? 'Patient Records' : view === 'appointments' ? 'Schedule' : 'Edit Profile'}
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Hello, Dr. {user?.name} </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-gray-600 shadow-sm border border-gray-100 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 relative"
                            >
                                <Bell size={20} fill="currentColor" className="text-amber-500" />
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {isNotificationOpen && (
                                <NotificationDropdown
                                    notifications={notifications}
                                    onMarkRead={handleMarkRead}
                                    onClose={() => setIsNotificationOpen(false)}
                                />
                            )}
                        </div>

                        {/* Profile User (Keeping existing) */}
                    </div>
                </header>

                {view === 'dashboard' && (
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Stats Grid - Smoother Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Total Patients', value: stats.patients, icon: <Users />, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
                                { label: 'Appointments', value: stats.appointments, icon: <Calendar />, color: 'bg-indigo-50 text-indigo-600', trend: '+5%' },
                                { label: 'Tasks Completed', value: stats.tasks, icon: <CheckCircle2 />, color: 'bg-emerald-50 text-emerald-600', trend: '+8%' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">{stat.trend}</span>
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Appointment Growth - Takes 2 Columns */}
                            <div className="lg:col-span-2 bg-white p-7 rounded-2xl shadow-sm border border-transparent">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Appointment Growth</h3>
                                        <p className="text-gray-400 text-xs mt-1">Daily appointment volume for the last 7 days.</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold">
                                        <TrendingUp size={14} />
                                        <span>+24.5%</span>
                                    </div>
                                </div>
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right Column - Stacked Charts */}
                            <div className="flex flex-col gap-6">
                                {/* Status Breakdown */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent flex flex-col items-center">
                                    <div className="w-full text-left mb-4">
                                        <h3 className="font-bold text-gray-800 text-lg">Status</h3>
                                        <p className="text-gray-400 text-xs">Appointment outcomes.</p>
                                    </div>
                                    <div className="h-[180px] w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusDistribution}
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {statusDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                    <Label
                                                        value={appointments.length}
                                                        position="center"
                                                        content={({ viewBox }) => {
                                                            const { cx, cy } = viewBox;
                                                            return (
                                                                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                                    <tspan x={cx} y={cy} className="text-xl font-bold fill-slate-800 font-outfit">{appointments.length}</tspan>
                                                                </text>
                                                            );
                                                        }}
                                                    />
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center w-full mt-2">
                                        {statusDistribution.slice(0, 4).map((s, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{s.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Demographics (Gender) */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent flex flex-col items-center">
                                    <div className="w-full text-left mb-4">
                                        <h3 className="font-bold text-gray-800 text-lg">Patients</h3>
                                        <p className="text-gray-400 text-xs">Gender distribution.</p>
                                    </div>
                                    <div className="h-[180px] w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={genderDistribution}
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    startAngle={180}
                                                    endAngle={0}
                                                    cy="70%"
                                                >
                                                    {genderDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Label
                                                    value={patients.length}
                                                    position="center"
                                                    dy={10}
                                                    content={({ viewBox }) => {
                                                        const { cx, cy } = viewBox;
                                                        return (
                                                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                                <tspan x={cx} y={cy - 20} className="text-xl font-bold fill-slate-800 font-outfit">{patients.length}</tspan>
                                                            </text>
                                                        );
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center w-full mt-[-20px]">
                                        {genderDistribution.map((g, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }}></div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{g.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Appointments Preview */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                                <button onClick={() => setView('appointments')} className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline">View All</button>
                            </div>
                            {appointments.length > 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-transparent overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                                <tr>
                                                    <th className="px-8 py-4">Patient</th>
                                                    <th className="px-8 py-4">Time</th>
                                                    <th className="px-8 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {appointments.slice(0, 5).map(apt => (
                                                    <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-8 py-4">
                                                            <div className="font-semibold text-gray-900">{apt.patient?.name}</div>
                                                        </td>
                                                        <td className="px-8 py-4 text-gray-500">{apt.date} • {apt.time}</td>
                                                        <td className="px-8 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                                apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                                }`}>{apt.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400">No recent activity found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Patients View */}
                {view === 'patients' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-8 py-5">Patient Name</th>
                                    <th className="px-8 py-5">Contact Info</th>
                                    <th className="px-8 py-5">Gender</th>
                                    <th className="px-8 py-5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {patients.length > 0 ? (
                                    patients.map(patient => (
                                        <tr key={patient._id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{patient.name}</div>
                                                        <div className="text-xs text-gray-400">ID: #{patient._id.slice(-6).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm text-gray-900">{patient.email}</div>
                                                <div className="text-xs text-gray-500">{patient.phone || 'No phone'}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="capitalize text-gray-700 text-sm">{patient.gender}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">Active</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-12 text-center text-gray-400">No patients found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Appointments View */}
                {view === 'appointments' && (
                    <div className="animate-fadeIn">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm inline-flex">
                            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setAppointmentFilter(status)}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${appointmentFilter === status
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {status}
                                    {status !== 'all' && (
                                        <span className={`ml-2 px-1.5 py-0.5 rounded-lg text-[10px] ${appointmentFilter === status ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {appointments.filter(a => a.status === status).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Appointments Grid */}
                        <div className="space-y-4">
                            {appointments.filter(a => appointmentFilter === 'all' || a.status === appointmentFilter).length > 0 ? (
                                appointments
                                    .filter(a => appointmentFilter === 'all' || a.status === appointmentFilter)
                                    .map(apt => (
                                        <div
                                            key={apt._id}
                                            className="p-4 bg-white rounded-xl hover:bg-gray-50 transition-all border border-gray-100 group shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {apt.patient?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm mb-0.5 group-hover:text-blue-600 transition-colors">
                                                        {apt.patient?.name || 'Unknown'}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            {apt.date}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-gray-400" />
                                                            {apt.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Clinical Reason - Show on larger screens */}
                                            <div className="hidden lg:block flex-1 mx-8">
                                                <p className="text-xs text-gray-500 italic truncate max-w-md">
                                                    "{apt.reason || 'Routine Checkup'}"
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${apt.status === 'confirmed' ? 'text-emerald-700 bg-emerald-50' :
                                                    apt.status === 'completed' ? 'text-blue-700 bg-blue-50' :
                                                        apt.status === 'cancelled' ? 'text-rose-700 bg-rose-50' :
                                                            'text-indigo-700 bg-indigo-50'
                                                    }`}>
                                                    {apt.status}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    {apt.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                                                                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                title="Accept"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                                                                className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                                                title="Decline"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleOpenCompleteModal(apt._id)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                                                        >
                                                            Identify & Treat
                                                        </button>
                                                    )}
                                                    {['completed', 'cancelled'].includes(apt.status) && (
                                                        <button
                                                            onClick={() => handleDeleteClick(apt._id)}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Remove from list"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-400 text-sm">No appointments found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Profile View */}
                {view === 'profile' && (
                    <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            {/* Profile Picture Upload */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    ) : user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture.startsWith('data:') || user.profilePicture.startsWith('http')
                                                ? user.profilePicture
                                                : `http://localhost:5001/${user.profilePicture}`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl text-gray-400">📷</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                                    />

                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                    <input
                                        type="text"
                                        value={profileData.specialization}
                                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        value={profileData.gender}
                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* Complete Appointment Modal */}
            {completionModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">Complete Consultation</h2>
                            <button onClick={() => setCompletionModal({ isOpen: false, appointmentId: null })} className="text-white/80 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitConsultation} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Viral Fever"
                                    value={consultationData.diagnosis}
                                    onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription / Medications</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder="e.g. Paracetamol 500mg - 3 times a day"
                                    value={consultationData.prescription}
                                    onChange={(e) => setConsultationData({ ...consultationData, prescription: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                                    placeholder="Advice or follow-up instructions..."
                                    value={consultationData.doctorNotes}
                                    onChange={(e) => setConsultationData({ ...consultationData, doctorNotes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setCompletionModal({ ...completionModal, isOpen: false })} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            {toast.isVisible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, isVisible: false })}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

            <BroadcastModal
                isOpen={broadcastModal.isOpen}
                onClose={() => setBroadcastModal({ ...broadcastModal, isOpen: false })}
                message={broadcastModal.message}
                type={broadcastModal.type}
            />
        </div>
    );
}

export default DoctorDashboard;
