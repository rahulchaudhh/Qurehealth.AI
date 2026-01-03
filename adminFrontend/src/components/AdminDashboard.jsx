import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPendingDoctors = async () => {
        try {
            const { data } = await axios.get('/admin/pending-doctors');
            setPendingDoctors(data.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await axios.put(`/admin/approve-doctor/${id}`);
            // Remove from list
            setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
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
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            alert('Failed to reject doctor');
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white px-10 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg">
                        <span className="font-bold">A</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">Admin Panel</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Administrator</span>
                    <button onClick={handleLogout} className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-md text-sm font-medium">Logout</button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-10 px-5">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Approvals</h1>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : pendingDoctors.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                        No pending doctor registrations found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDoctors.map(doctor => (
                            <div key={doctor._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                            {doctor.profilePicture ? (
                                                <img
                                                    src={`http://localhost:5001/${doctor.profilePicture}`}
                                                    alt={doctor.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                doctor.name.charAt(0) || 'D'
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                                            <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold capitalize self-start">{doctor.status}</span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span>📧</span> {doctor.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>💼</span> {doctor.experience} Years Experience
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📞</span> {doctor.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>👤</span> {doctor.gender}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(doctor._id)}
                                        disabled={actionLoading === doctor._id}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === doctor._id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(doctor._id)}
                                        disabled={actionLoading === doctor._id}
                                        className="flex-1 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
