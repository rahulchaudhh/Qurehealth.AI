import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch functions
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

    const loadData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchPendingDoctors(), fetchAllDoctors(), fetchAllPatients(), fetchStats()]);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
        // Redirect to main landing page (Patient portal root)
        window.location.href = 'http://localhost:5173';
    };

    const getProfileImage = (item) => {
        if (item.profilePicture && (item.profilePicture.startsWith('http') || item.profilePicture.startsWith('data:'))) {
            return item.profilePicture;
        }
        if (item.hasProfilePicture) {
            return item.specialization
                ? `/api/doctor/${item._id}/profile-picture`
                : `/api/admin/patient/${item._id}/profile-picture`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`;
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
    };

    // Filtered data for search
    const filteredDoctors = allDoctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPatients = allPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPendingDoctors = pendingDoctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium font-outfit">Initialising Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-900 font-sans antialiased">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                pendingCount={pendingDoctors.length}
                handleLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    hasUnreadNotifications={hasUnreadNotifications}
                    setHasUnreadNotifications={setHasUnreadNotifications}
                    user={user}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    doctors={allDoctors}
                    patients={allPatients}
                />

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <Outlet context={{
                        stats,
                        pendingDoctors: filteredPendingDoctors,
                        allDoctors: filteredDoctors,
                        allPatients: filteredPatients,
                        actionLoading,
                        handleApprove,
                        handleReject,
                        handleDeleteDoctor,
                        handleDeletePatient,
                        getProfileImage,
                        handleImageError,
                        searchQuery
                    }} />
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;
