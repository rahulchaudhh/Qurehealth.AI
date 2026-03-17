import { useState, useRef, useEffect } from 'react';
import { Phone, Trash2, UserRound, Mail, MoreHorizontal, Plus, Search, ChevronDown, ArrowUpDown, X, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import HighlightText from '../components/common/HighlightText';
import axios from '../api/axios';

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const cfg = {
        approved: { label: 'Approved', text: 'text-purple-700', bg: 'bg-purple-50' },
        rejected: { label: 'Rejected', text: 'text-red-700', bg: 'bg-red-50' },
        pending: { label: 'Pending', text: 'text-amber-700', bg: 'bg-amber-50' },
        suspended: { label: 'Suspended', text: 'text-gray-700', bg: 'bg-gray-100' },
    };
    const c = cfg[status] || cfg.pending;
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}

// ─── Actions Dropdown ─────────────────────────────────────────────────────────

function ActionsDropdown({ doctor, onViewProfile, onEdit, onSuspend, onDelete, isLoading }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-150"
                disabled={isLoading === doctor._id}
            >
                {isLoading === doctor._id
                    ? <span className="inline-block animate-spin text-sm">⟳</span>
                    : <MoreHorizontal size={16} />
                }
            </button>
            {open && (
                <div className="absolute -right-2 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button onClick={() => { setOpen(false); onViewProfile(doctor); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        View Profile
                    </button>
                    <button onClick={() => { setOpen(false); onEdit(doctor); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors">
                        Edit
                    </button>
                    <button onClick={() => { setOpen(false); onSuspend(doctor); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 border-t border-gray-100 transition-colors">
                        Suspend
                    </button>
                    <button onClick={() => { setOpen(false); onDelete(doctor._id); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 border-t border-gray-100 transition-colors">
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Sortable Header ──────────────────────────────────────────────────────────

function SortableHeader({ label, sortable = false }) {
    return (
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1.5 group cursor-pointer">
                <span>{label}</span>
                {sortable && <ArrowUpDown size={12} className="text-gray-300 group-hover:text-gray-400" />}
            </div>
        </th>
    );
}

// ─── Specializations ─────────────────────────────────────────────────────────

const SPECIALIZATIONS = [
    'Cardiologist', 'Dermatologist', 'Endocrinologist', 'Gastroenterologist',
    'General Physician', 'Gynecologist', 'Neurologist', 'Oncologist',
    'Ophthalmologist', 'Orthopedic Surgeon', 'Pediatrician', 'Psychiatrist',
    'Pulmonologist', 'Radiologist', 'Rheumatologist', 'Urologist',
    'ENT Specialist', 'Dentist', 'Pathologist', 'Nephrologist'
];

// ─── Add Doctor Modal (Full Page) ─────────────────────────────────────────────

function AddDoctorModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', experience: '', phone: '', gender: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.password || !form.specialization || !form.experience) {
            setError('Please fill in all required fields.'); return;
        }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await axios.post('/doctor/register', {
                name: form.name.trim(), email: form.email.trim().toLowerCase(),
                password: form.password, specialization: form.specialization,
                experience: Number(form.experience), phone: form.phone.trim(), gender: form.gender,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add doctor. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto" onClick={onClose}>
            <div onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Add Doctor</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Register a new doctor to the platform</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="max-w-3xl mx-auto px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span>
                            </div>
                        )}
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. rohan chaudhary"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email address"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Professional Details</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                                    <select name="specialization" value={form.specialization} onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900">
                                        <option value="">Select specialization</option>
                                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                                    <input name="experience" type="number" min="0" max="60" value={form.experience} onChange={handleChange} placeholder="e.g. 5"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact & Demographics</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="980000000000"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                    <select name="gender" value={form.gender} onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900">
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Account Security</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Minimum 6 characters"
                                        className="w-full px-4 py-2.5 pr-12 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 flex items-center justify-end gap-3 py-4 border-t border-gray-200 bg-white -mx-8 px-8">
                            <button type="button" onClick={onClose} disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Add Doctor</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── View / Edit Profile Modal ────────────────────────────────────────────────

function DoctorProfileModal({ doctor, mode, onClose, onSaved, getProfileImage, handleImageError }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        name: doctor.name || '', email: doctor.email || '',
        specialization: doctor.specialization || '', experience: doctor.experience || '',
        phone: doctor.phone || '', gender: doctor.gender || '', status: doctor.status || 'pending',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setError(''); setSuccess(''); };

    const handleSave = async () => {
        setError(''); setLoading(true);
        try {
            await axios.put(`/admin/doctors/${doctor._id}`, {
                name: form.name.trim(), specialization: form.specialization,
                experience: Number(form.experience), phone: form.phone.trim(),
                gender: form.gender, status: form.status,
            });
            setSuccess('Doctor updated successfully.');
            onSaved();
        } catch (err) { setError(err.response?.data?.error || 'Failed to update doctor.'); }
        finally { setLoading(false); }
    };

    const statusColors = {
        approved: 'bg-purple-50 text-purple-700', pending: 'bg-amber-50 text-amber-700',
        rejected: 'bg-red-50 text-red-700', suspended: 'bg-gray-100 text-gray-700',
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Profile' : 'Doctor Profile'}</h2>
                    <div className="w-9" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Doctor Header */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div className="w-20 h-20 flex-shrink-0 relative">
                        <img src={getProfileImage(doctor)} onError={handleImageError} alt={doctor.name}
                            className="w-full h-full rounded-full object-cover border border-gray-200" />
                        <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-700 font-bold items-center justify-center text-2xl border border-indigo-200 uppercase">
                            {doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xl font-semibold text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{doctor.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[doctor.status] || statusColors.pending}`}>
                                {doctor.status?.charAt(0).toUpperCase() + doctor.status?.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6"><AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span></div>}
                {success && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-6">{success}</div>}

                {/* Form */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            {isEdit ? <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                : <p className="text-sm text-gray-900 py-2.5">{form.name || '—'}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <p className="text-sm text-gray-600 py-2.5">{doctor.email || '—'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                            {isEdit ? (
                                <select name="specialization" value={form.specialization} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                    <option value="">Select</option>
                                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ) : <p className="text-sm text-gray-900 py-2.5">{form.specialization || '—'}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                            {isEdit ? <input name="experience" type="number" value={form.experience} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                : <p className="text-sm text-gray-900 py-2.5">{form.experience ? `${form.experience} years` : '—'}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            {isEdit ? <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                : <p className="text-sm text-gray-900 py-2.5">{form.phone || '—'}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            {isEdit ? (
                                <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                    <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                </select>
                            ) : <p className="text-sm text-gray-900 py-2.5 capitalize">{form.gender || '—'}</p>}
                        </div>
                    </div>

                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                <option value="pending">Pending</option><option value="approved">Approved</option>
                                <option value="rejected">Rejected</option><option value="suspended">Suspended</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {isEdit && (
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Suspend Confirm Modal ────────────────────────────────────────────────────

function SuspendModal({ doctor, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-xl border border-gray-200 shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={22} className="text-amber-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Suspend Doctor?</h2>
                    <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">{doctor.name}</span> will lose access to the platform.</p>
                </div>
                <div className="flex items-center gap-2 px-6 pb-5">
                    <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                        {loading ? <><Loader2 size={14} className="animate-spin" /> Suspending...</> : 'Suspend'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function DoctorsDirectory({ allDoctors, handleDeleteDoctor, actionLoading, getProfileImage, handleImageError, searchQuery = '', onRefresh }) {
    const [selectedDoctors, setSelectedDoctors] = useState(new Set());
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [profileModal, setProfileModal] = useState(null);
    const [suspendModal, setSuspendModal] = useState(null);
    const [suspendLoading, setSuspendLoading] = useState(false);

    const handleAddDoctor = () => setShowAddModal(true);
    const handleAddSuccess = () => { setShowAddModal(false); if (onRefresh) onRefresh(); };
    const handleViewProfile = (doctor) => setProfileModal({ doctor, mode: 'view' });
    const handleEdit = (doctor) => setProfileModal({ doctor, mode: 'edit' });
    const handleEditSaved = () => { setProfileModal(null); if (onRefresh) onRefresh(); };
    const handleSuspend = (doctor) => setSuspendModal(doctor);
    const handleSuspendConfirm = async () => {
        if (!suspendModal) return;
        setSuspendLoading(true);
        try {
            await axios.put(`/admin/doctors/${suspendModal._id}`, { status: 'suspended' });
            setSuspendModal(null);
            if (onRefresh) onRefresh();
        } catch (err) { console.error('Error suspending doctor:', err); }
        finally { setSuspendLoading(false); }
    };

    const handleSelectDoctor = (doctorId) => {
        const n = new Set(selectedDoctors);
        n.has(doctorId) ? n.delete(doctorId) : n.add(doctorId);
        setSelectedDoctors(n);
    };

    const filteredDoctors = allDoctors.filter(doctor => {
        const matchStatus = filterStatus === 'all' || doctor.status === filterStatus;
        const q = searchInput.toLowerCase();
        const matchSearch = !q || doctor.name?.toLowerCase().includes(q) || doctor.email?.toLowerCase().includes(q) || doctor.specialization?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const handleSelectAll = () => {
        setSelectedDoctors(selectedDoctors.size === filteredDoctors.length ? new Set() : new Set(filteredDoctors.map(d => d._id)));
    };

    const statusOptions = ['all', 'approved', 'pending', 'rejected', 'suspended'];
    const statusCounts = {
        all: allDoctors.length,
        approved: allDoctors.filter(d => d.status === 'approved').length,
        pending: allDoctors.filter(d => d.status === 'pending').length,
        rejected: allDoctors.filter(d => d.status === 'rejected').length,
        suspended: allDoctors.filter(d => d.status === 'suspended').length,
    };

    return (
        <>
            {showAddModal && <AddDoctorModal onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />}
            {profileModal && (
                <DoctorProfileModal
                    doctor={profileModal.doctor} mode={profileModal.mode}
                    onClose={() => setProfileModal(null)} onSaved={handleEditSaved}
                    getProfileImage={getProfileImage} handleImageError={handleImageError}
                />
            )}
            {suspendModal && (
                <SuspendModal doctor={suspendModal} onClose={() => setSuspendModal(null)}
                    onConfirm={handleSuspendConfirm} loading={suspendLoading} />
            )}

            <div className="space-y-4">
                {/* ── Page Header ──────────────────────────────────────── */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Doctors Directory</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage and monitor all registered doctors.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">{allDoctors.length}</div>
                            <div className="text-xs text-gray-500">Doctors</div>
                        </div>
                        <button onClick={handleAddDoctor}
                            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                            <Plus size={14} /> Add Doctor
                        </button>
                    </div>
                </div>

                {/* ── Filters ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                                placeholder="Search doctors, email, specialty..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                        </div>
                        <div className="relative shrink-0">
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                                {statusOptions.map(s => (
                                    <option key={s} value={s}>
                                        {s === 'all' ? `All (${statusCounts.all ?? 0})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s] ?? 0})`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap">{filteredDoctors.length} of {allDoctors.length}</p>
                </div>

                {/* ── Bulk Actions ─────────────────────────────────────── */}
                {selectedDoctors.size > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">{selectedDoctors.size} selected</span>
                        <div className="flex items-center gap-2 ml-auto">
                            <button className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete Selected</button>
                            <button onClick={() => setSelectedDoctors(new Set())} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Clear</button>
                        </div>
                    </div>
                )}

                {/* ── Table ────────────────────────────────────────────── */}
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <SortableHeader label="Doctor" sortable />
                                <SortableHeader label="Contact" />
                                <SortableHeader label="Specialization" sortable />
                                <SortableHeader label="Status" sortable />
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gray-50">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <UserRound size={22} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">No doctors found</p>
                                            <p className="text-xs text-gray-500">{searchInput ? `No results for "${searchInput}"` : 'Add your first doctor to get started.'}</p>
                                            {!searchInput && (
                                                <button onClick={handleAddDoctor}
                                                    className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                                                    <Plus size={14} /> Add Doctor
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map(doctor => (
                                    <tr key={doctor._id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors cursor-pointer relative">
                                        <td className="px-6 py-3" onClick={() => handleViewProfile(doctor)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 flex-shrink-0 relative">
                                                    <img src={getProfileImage(doctor)} onError={handleImageError} alt={doctor.name}
                                                        className="w-full h-full rounded-lg object-cover border border-gray-200" />
                                                    <div className="hidden w-full h-full rounded-lg bg-indigo-50 text-indigo-700 font-bold items-center justify-center text-[11px] border border-indigo-200 uppercase">
                                                        {doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        <HighlightText text={doctor.name} highlight={searchInput || searchQuery} />
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono">#{doctor._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3" onClick={() => handleViewProfile(doctor)}>
                                            <p className="text-sm text-gray-700 truncate max-w-[180px]">
                                                <HighlightText text={doctor.email} highlight={searchInput || searchQuery} />
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{doctor.phone || '—'}</p>
                                        </td>
                                        <td className="px-6 py-3" onClick={() => handleViewProfile(doctor)}>
                                            <p className="text-sm text-gray-700">
                                                <HighlightText text={doctor.specialization || '—'} highlight={searchInput || searchQuery} />
                                            </p>
                                        </td>
                                        <td className="px-6 py-3" onClick={() => handleViewProfile(doctor)}>
                                            <StatusBadge status={doctor.status} />
                                        </td>
                                        <td className="px-6 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <ActionsDropdown
                                                doctor={doctor} onViewProfile={handleViewProfile} onEdit={handleEdit}
                                                onSuspend={handleSuspend} onDelete={handleDeleteDoctor} isLoading={actionLoading}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Footer ───────────────────────────────────────────── */}
                {filteredDoctors.length > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <div>{selectedDoctors.size > 0 && <span className="font-medium">{selectedDoctors.size} selected</span>}</div>
                        <div className="font-medium">Showing {filteredDoctors.length} of {allDoctors.length} doctors</div>
                    </div>
                )}
            </div>
        </>
    );
}

export default DoctorsDirectory;
