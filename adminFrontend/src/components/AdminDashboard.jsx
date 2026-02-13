import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'pending', 'doctors', 'patients'
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState(null);

    // Fetch functions remain the same
    const fetchPendingDoctors = async () => {
        try {
            const { data } = await axios.get('/admin/pending-doctors');
            setPendingDoctors(data.data);
        } catch (error) {
            console.error('Error fetching pending doctors:', error);
        }
    };

    const fetchAllDoctors = async () => {
        try {
            const { data } = await axios.get('/admin/doctors');
            setAllDoctors(data.data);
        } catch (error) {
            console.error('Error fetching all doctors:', error);
        }
    };

    const fetchAllPatients = async () => {
        try {
            const { data } = await axios.get('/admin/patients');
            setAllPatients(data.data);
        } catch (error) {
            console.error('Error fetching all patients:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/admin/dashboard-stats');
            setStats(data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchPendingDoctors(), fetchAllDoctors(), fetchAllPatients(), fetchStats()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await axios.put(`/admin/approve-doctor/${id}`);
            setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
            setAllDoctors(prev => prev.map(doc => doc._id === id ? { ...doc, status: 'approved', isApproved: true } : doc));
            fetchStats();
        } catch (error) {
            console.error('Error approving doctor:', error);
            alert('Failed to approve doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this doctor?')) return;
        setActionLoading(id);
        try {
            await axios.put(`/admin/reject-doctor/${id}`);
            setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
            setAllDoctors(prev => prev.map(doc => doc._id === id ? { ...doc, status: 'rejected', isApproved: false } : doc));
            fetchStats();
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            alert('Failed to reject doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeletePatient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;
        setActionLoading(id);
        try {
            await axios.delete(`/admin/delete-patient/${id}`);
            setAllPatients(prev => prev.filter(patient => patient._id !== id));
            fetchStats();
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Failed to delete patient');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return;
        setActionLoading(id);
        try {
            await axios.delete(`/doctor/${id}`);
            setAllDoctors(prev => prev.filter(doc => doc._id !== id));
            fetchStats();
        } catch (error) {
            console.error('Error deleting doctor:', error);
            alert('Failed to delete doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = 'http://localhost:5173';
    };

    const getProfileImage = (item) => {
        if (!item.profilePicture) return null;
        if (item.profilePicture.includes('avatar_male') || item.profilePicture.includes('avatar_female')) {
            return `/${item.profilePicture.split('/').pop()}`;
        }
        if (item.profilePicture.startsWith('http') || item.profilePicture.startsWith('data:')) {
            return item.profilePicture;
        }
        return `http://localhost:5001/${item.profilePicture}`;
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex'; // Show fallback
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden text-slate-900">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-teal-200/30 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/70 border border-white/50 shadow-sm rounded-2xl px-6 py-3 flex justify-between items-center transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-800">
                            Qurehealth<span className="text-indigo-600">.Admin</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-slate-200/60 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-semibold text-slate-600">Admin Mode</span>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm">
                                <img
                                    src={user?.gender?.toLowerCase() === 'female' ? '/avatar_female.png' : '/avatar_male.png'}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user?.name || 'Admin'}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Custom Tab Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white/60 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl shadow-sm inline-flex gap-1">
                        {[
                            { id: 'analytics', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
                            { id: 'pending', label: 'Pending Approvals', count: pendingDoctors.length, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
                            { id: 'doctors', label: 'All Doctors', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
                            { id: 'patients', label: 'Patients', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                                    ${activeTab === tab.id
                                        ? 'bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] text-indigo-600'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                    }
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-600 font-bold border border-red-200/50">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-[600px] transition-all duration-500 ease-in-out">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                            Loading dashboard data...
                        </div>
                    ) : activeTab === 'analytics' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Overview</h1>
                                <p className="text-slate-500">Real-time metrics for Qurehealth.AI</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</span>
                                    </div>
                                    <div className="text-4xl font-bold text-slate-800 mb-1">{stats?.patients || 0}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                        Active users on platform
                                    </div>
                                </div>

                                <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Doctors</span>
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold text-slate-800 mb-1">{stats?.doctors || 0}</div>
                                    <div className="text-sm text-slate-500">Verified specialists</div>
                                </div>

                                <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Appointments</span>
                                    </div>
                                    <div className="text-4xl font-bold text-slate-800 mb-1">{stats?.appointments || 0}</div>
                                    <div className="text-sm text-slate-500">Lifecycle sessions</div>
                                </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/60 p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                                    Appointment Status Distribution
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="p-4 bg-yellow-50/80 rounded-2xl border border-yellow-100/50">
                                        <div className="text-yellow-600 font-medium text-sm mb-2">Pending</div>
                                        <div className="text-3xl font-bold text-yellow-800">{stats?.appointmentBreakdown?.pending || 0}</div>
                                    </div>
                                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50">
                                        <div className="text-blue-600 font-medium text-sm mb-2">Confirmed</div>
                                        <div className="text-3xl font-bold text-blue-800">{stats?.appointmentBreakdown?.confirmed || 0}</div>
                                    </div>
                                    <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100/50">
                                        <div className="text-emerald-600 font-medium text-sm mb-2">Completed</div>
                                        <div className="text-3xl font-bold text-emerald-800">{stats?.appointmentBreakdown?.completed || 0}</div>
                                    </div>
                                    <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-100/50">
                                        <div className="text-rose-600 font-medium text-sm mb-2">Cancelled</div>
                                        <div className="text-3xl font-bold text-rose-800">{stats?.appointmentBreakdown?.cancelled || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'pending' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Pending Approvals</h1>
                                    <p className="text-slate-500">Review and verify new doctor registrations</p>
                                </div>
                            </div>

                            {pendingDoctors.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
                                    <p className="text-slate-500">No pending approvals at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingDoctors.map(doctor => (
                                        <div key={doctor._id} className="relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                            <div className="absolute top-6 right-6">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                    Awaiting
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-white p-1 shadow-inner relative overflow-hidden">
                                                    {doctor.profilePicture ? (
                                                        <>
                                                            <img
                                                                src={getProfileImage(doctor)}
                                                                alt={doctor.name}
                                                                className="w-full h-full object-cover rounded-xl"
                                                                onError={handleImageError}
                                                            />
                                                            <div className="absolute inset-0 bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl hidden">
                                                                {doctor.name.charAt(0)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                                                            {doctor.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{doctor.name}</h3>
                                                    <p className="text-indigo-600 font-medium text-sm">{doctor.specialization}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 transition-colors group-hover:bg-indigo-50/50 group-hover:border-indigo-100/50">
                                                    <svg className="text-slate-400 group-hover:text-indigo-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                    {doctor.experience} Years Experience
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 transition-colors group-hover:bg-indigo-50/50 group-hover:border-indigo-100/50">
                                                    <svg className="text-slate-400 group-hover:text-indigo-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                    <span className="truncate">{doctor.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 transition-colors group-hover:bg-indigo-50/50 group-hover:border-indigo-100/50">
                                                    <svg className="text-slate-400 group-hover:text-indigo-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                    {doctor.phone || 'N/A'}
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-auto">
                                                <button
                                                    onClick={() => handleApprove(doctor._id)}
                                                    disabled={actionLoading === doctor._id}
                                                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading === doctor._id ? 'Processing...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(doctor._id)}
                                                    disabled={actionLoading === doctor._id}
                                                    className="flex-1 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-slate-900 mb-1">{activeTab === 'doctors' ? 'All Registered Doctors' : 'Patient Directory'}</h1>
                                <p className="text-slate-500">{activeTab === 'doctors' ? 'Manage verified medical professionals' : 'View and manage registered patients'}</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                                {activeTab === 'doctors' && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>}
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(activeTab === 'doctors' ? allDoctors : allPatients).map(item => (
                                                <tr key={item._id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 p-0.5 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                                                {item.profilePicture ? (
                                                                    <>
                                                                        <img
                                                                            src={getProfileImage(item)}
                                                                            alt={item.name}
                                                                            className="w-full h-full object-cover rounded-full"
                                                                            onError={handleImageError}
                                                                        />
                                                                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm hidden">
                                                                            {item.name.charAt(0)}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                                        {item.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900">{item.name}</div>
                                                                <div className="text-xs text-slate-500">Joined {new Date(item.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-slate-700 font-medium">{item.email}</div>
                                                        <div className="text-xs text-slate-400">{item.phone || 'No phone'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {activeTab === 'doctors' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                {item.specialization}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-slate-600 capitalize">{item.gender}</span>
                                                        )}
                                                    </td>
                                                    {activeTab === 'doctors' && (
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'approved' ? 'bg-green-500' :
                                                                    item.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                                                    }`}></span>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => activeTab === 'doctors' ? handleDeleteDoctor(item._id) : handleDeletePatient(item._id)}
                                                            disabled={actionLoading === item._id}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                            title="Delete User"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(activeTab === 'doctors' ? allDoctors : allPatients).length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                        No records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
