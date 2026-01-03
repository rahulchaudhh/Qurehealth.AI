import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

function DoctorDashboard() {
    const { user, logout, loading: authLoading } = useContext(AuthContext); // Assuming updateProfile might be needed or we reload
    const navigate = useNavigate();
    const [stats, setStats] = useState({ patients: 0, appointments: 0, tasks: 0 });
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'patients', 'appointments', 'profile'
    const [loading, setLoading] = useState(true);
    const [completionModal, setCompletionModal] = useState({ isOpen: false, appointmentId: null });
    const [consultationData, setConsultationData] = useState({ diagnosis: '', prescription: '', doctorNotes: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        specialization: '',
        gender: 'other',
        imageFile: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = 'http://localhost:5173';
    };

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

        if (user) {
            fetchData();
            // Init profile data
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                specialization: user.specialization || '',
                gender: user.gender || 'other',
                imageFile: null
            });
        }
    }, [user]);

    const updateAppointmentStatus = async (id, status, data = {}) => {
        try {
            await axios.put(`/appointments/${id}/status`, { status, ...data });
            const appointmentsRes = await axios.get('/appointments/doctor');
            setAppointments(appointmentsRes.data.data);
            const statsRes = await axios.get('/doctor/stats');
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
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
                alert('Profile updated successfully! PLease refresh to see changes.');
                // Optionally trigger a user reload logic here if AuthContext supports it
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            alert('Failed to update profile');
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
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Qurehealth<span className="text-blue-600">.AI</span>
                    </span>
                </div>

                <div className="px-4 mb-2">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden text-blue-600 font-bold">
                            {user?.profilePicture ? (
                                <img src={`http://localhost:5001/${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
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
                        { id: 'dashboard', label: 'Dashboard', icon: <rect width="7" height="9" x="3" y="3" rx="1" /> },
                        { id: 'patients', label: 'My Patients', icon: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> },
                        { id: 'appointments', label: 'Appointments', icon: <path d="M16 2v4" /> },
                        { id: 'profile', label: 'Edit Profile', icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                            ${view === item.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={view === item.id ? 'text-blue-600' : 'text-gray-500'}>
                                {item.icon}
                                {item.id === 'appointments' && <path d="M8 2v4M3 10h18" />}
                                {item.id === 'profile' && <circle cx="12" cy="7" r="4" />}
                            </svg>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 transition-all">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {view === 'dashboard' ? 'Overview' : view === 'patients' ? 'Patient Records' : view === 'appointments' ? 'Schedule' : 'Edit Profile'}
                        </h1>
                        <p className="text-gray-500 mt-1">Hello, Dr. {user?.name} 👋</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-600 shadow-sm border border-gray-200">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        <div className="relative group cursor-pointer" onClick={() => setView('appointments')}>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
                                <span className="text-xl">🔔</span>
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {pendingCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard View */}
                {view === 'dashboard' && (
                    <div className="space-y-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Total Patients', value: stats.patients, icon: '👥', color: 'bg-blue-100 text-blue-600', trend: '' },
                                { label: 'Appointments', value: stats.appointments, icon: '📅', color: 'bg-purple-100 text-purple-600', trend: '' },
                                { label: 'Tasks Completed', value: stats.tasks, icon: '✅', color: 'bg-green-100 text-green-600', trend: '' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Appointments Preview */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                                <button onClick={() => setView('appointments')} className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline">View All</button>
                            </div>
                            {appointments.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                        {appointments.length > 0 ? (
                            appointments.map(apt => (
                                <div key={apt._id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                                                {apt.patient?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{apt.patient?.name || 'Unknown'}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                    <span>📅 {apt.date}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span>⏰ {apt.time}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                                        <p className="text-sm text-gray-600 font-medium">Reason for visit:</p>
                                        <p className="text-sm text-gray-500 mt-1">{apt.reason || 'Routine Checkup'}</p>
                                    </div>

                                    <div className="flex gap-3">
                                        {apt.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateAppointmentStatus(apt._id, 'confirmed')} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all">
                                                    Accept
                                                </button>
                                                <button onClick={() => updateAppointmentStatus(apt._id, 'cancelled')} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        {apt.status === 'confirmed' && (
                                            <button onClick={() => handleOpenCompleteModal(apt._id)} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 hover:scale-[1.02] transition-all">
                                                Start Consultation
                                            </button>
                                        )}
                                        {['completed', 'cancelled'].includes(apt.status) && (
                                            <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium cursor-not-allowed">
                                                {apt.status === 'completed' ? 'Archived' : 'Cancelled'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                                <div className="text-4xl mb-4">📅</div>
                                <h3 className="text-lg font-bold text-gray-900">No Appointments</h3>
                                <p className="text-gray-500">Your schedule is currently empty.</p>
                            </div>
                        )}
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
                                        <img src={`http://localhost:5001/${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
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
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
        </div>
    );
}

export default DoctorDashboard;
