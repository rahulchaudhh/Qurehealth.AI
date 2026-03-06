import { useState, useEffect } from 'react';
import { Phone, Mail, Search, Download, MoreHorizontal, UserRound, X, Loader2, AlertTriangle, Calendar, ClipboardList, User, MapPin, Clock } from 'lucide-react';
import HighlightText from '../components/common/HighlightText';
import axios from '../api/axios';

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status = 'active' }) {
    const cfg = {
        active:    { label: 'Active',     text: 'text-teal-700',   bg: 'bg-teal-50'   },
        inactive:  { label: 'Inactive',   text: 'text-gray-700',   bg: 'bg-gray-100'  },
        suspended: { label: 'Suspended',  text: 'text-red-700',    bg: 'bg-red-50'    },
    };
    const c = cfg[status] || cfg.active;
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}

function AptStatusBadge({ status }) {
    const cfg = {
        completed:  { label: 'Completed',  text: 'text-blue-700',  bg: 'bg-blue-50'  },
        confirmed:  { label: 'Confirmed',  text: 'text-gray-700',  bg: 'bg-gray-100' },
        pending:    { label: 'Pending',    text: 'text-amber-700', bg: 'bg-amber-50' },
        cancelled:  { label: 'Cancelled', text: 'text-red-700',   bg: 'bg-red-50'   },
    };
    const c = cfg[status] || { label: status, text: 'text-gray-700', bg: 'bg-gray-100' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text} capitalize`}>
            {c.label}
        </span>
    );
}

// ─── Actions Dropdown ─────────────────────────────────────────────────────────

function ActionsDropdown({ patient, onViewDetails, onMedicalHistory, onDelete, isLoading }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-150"
                disabled={isLoading === patient._id}
            >
                {isLoading === patient._id
                    ? <Loader2 size={16} className="animate-spin" />
                    : <MoreHorizontal size={16} />
                }
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute -right-2 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        <button onClick={() => { setOpen(false); onViewDetails(patient); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <User size={14} className="text-gray-400" /> View Details
                        </button>
                        <button onClick={() => { setOpen(false); onMedicalHistory(patient); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors flex items-center gap-2">
                            <ClipboardList size={14} className="text-gray-400" /> Medical History
                        </button>
                        <button onClick={() => { setOpen(false); onDelete(patient); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-400" /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── View Details Modal ───────────────────────────────────────────────────────

function ViewDetailsModal({ patient, onClose, getProfileImage, handleImageError }) {
    const joined = patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    const dob    = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

    const fields = [
        { icon: Mail,     label: 'Email',         value: patient.email      || '—' },
        { icon: Phone,    label: 'Phone',          value: patient.phone      || '—' },
        { icon: User,     label: 'Gender',         value: patient.gender     || '—', capitalize: true },
        { icon: Calendar, label: 'Date of Birth',  value: dob },
        { icon: MapPin,   label: 'Address',        value: patient.address    || '—' },
        { icon: Clock,    label: 'Member Since',   value: joined },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col isolate" style={{background:'#ffffff'}} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-4 pb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Patient Details</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Full profile information</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>
                {/* Divider */}
                <div className="mx-6 border-t border-gray-100" />

                {/* Avatar + Name */}
                <div className="flex items-center gap-4 px-6 pt-5 pb-4 flex-shrink-0">
                    <img
                        src={getProfileImage(patient)}
                        onError={handleImageError}
                        alt={patient.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">ID: #{patient._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
                    {fields.map(({ icon: Icon, label, value, capitalize }) => (
                        <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium">{label}</p>
                                <p className={`text-sm font-semibold text-gray-900 mt-0.5 truncate ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 pb-5 flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose} className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Medical History Modal ────────────────────────────────────────────────────

function MedicalHistoryModal({ patient, onClose, getProfileImage, handleImageError }) {
    const [appointments, setAppointments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/admin/patients/${patient._id}/history`)
            .then(res => { setAppointments(res.data.data); setLoading(false); })
            .catch(() => { setError('Failed to load history.'); setLoading(false); });
    }, [patient._id]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Medical History</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Past appointments for <span className="font-semibold text-gray-700">{patient.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                            <span className="ml-3 text-sm text-gray-500 font-medium">Loading history…</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center py-16 gap-2">
                            <AlertTriangle size={24} className="text-red-400" />
                            <p className="text-sm font-medium text-red-600">{error}</p>
                        </div>
                    ) : !appointments?.length ? (
                        <div className="flex flex-col items-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                <ClipboardList size={22} className="text-gray-400" />
                            </div>
                            <p className="text-base font-semibold text-gray-900">No appointments found</p>
                            <p className="text-sm text-gray-500 font-medium">This patient has no appointment history.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map(apt => {
                                const aptDate = apt.date ? new Date(apt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
                                return (
                                    <div key={apt._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : 'Doctor'}
                                                    </p>
                                                    {apt.doctor?.specialization && (
                                                        <span className="text-xs text-gray-500 font-medium">· {apt.doctor.specialization}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Calendar size={11} className="text-gray-400" />
                                                        <span className="font-medium">{aptDate}</span>
                                                    </div>
                                                    {apt.time && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Clock size={11} className="text-gray-400" />
                                                            <span className="font-medium">{apt.time}</span>
                                                        </div>
                                                    )}
                                                    {apt.type && (
                                                        <span className="text-xs text-gray-500 capitalize font-medium">{apt.type}</span>
                                                    )}
                                                </div>
                                                {apt.reason && (
                                                    <p className="text-xs text-gray-600 mt-2 font-medium">
                                                        <span className="text-gray-400 font-semibold">Reason: </span>{apt.reason}
                                                    </p>
                                                )}
                                                {apt.diagnosis && (
                                                    <p className="text-xs text-gray-600 mt-1 font-medium">
                                                        <span className="text-gray-400 font-semibold">Diagnosis: </span>{apt.diagnosis}
                                                    </p>
                                                )}
                                                {apt.prescription && (
                                                    <p className="text-xs text-gray-600 mt-1 font-medium">
                                                        <span className="text-gray-400 font-semibold">Prescription: </span>{apt.prescription}
                                                    </p>
                                                )}
                                            </div>
                                            <AptStatusBadge status={apt.status} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 flex-shrink-0 border-t border-gray-100">
                    <button onClick={onClose} className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({ patient, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-xl border border-gray-200 shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={22} className="text-red-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mb-1">Delete Patient?</h2>
                    <p className="text-sm text-gray-500 font-medium">
                        <span className="font-bold text-gray-800">{patient.name}</span> will be permanently removed. This action cannot be undone.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-6 pb-5">
                    <button onClick={onClose} disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                        {loading ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete Patient'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function PatientRecords({ allPatients, handleDeletePatient, actionLoading, getProfileImage, handleImageError, searchQuery = '' }) {
    const [searchInput, setSearchInput]     = useState('');
    const [deleteModal, setDeleteModal]     = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [viewModal, setViewModal]         = useState(null);
    const [historyModal, setHistoryModal]   = useState(null);

    const handleExport = () => {
        try {
            const headers = ['Patient Name', 'Email', 'Phone', 'Gender', 'Status'];
            const rows = filtered.map(patient => [
                patient.name || '—', patient.email || '—', patient.phone || '—',
                patient.gender || '—', patient.status || 'active'
            ]);
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.setAttribute('href', URL.createObjectURL(blob));
            link.setAttribute('download', `patient_records_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) { console.error('Export failed:', err); }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal) return;
        setDeleteLoading(true);
        try {
            await handleDeletePatient(deleteModal._id);
            setDeleteModal(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = allPatients.filter(patient => {
        const q = searchInput.toLowerCase();
        return !q ||
            patient.name?.toLowerCase().includes(q) ||
            patient.email?.toLowerCase().includes(q) ||
            patient.phone?.toLowerCase().includes(q);
    });

    const stats = {
        total:     allPatients.length,
        active:    allPatients.filter(p => p.status === 'active' || !p.status).length,
        inactive:  allPatients.filter(p => p.status === 'inactive').length,
        suspended: allPatients.filter(p => p.status === 'suspended').length,
    };

    return (
        <div className="space-y-5">

            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
                <p className="text-sm text-gray-600 mt-1 font-medium">Manage and monitor all patient profiles.</p>
            </div>

            {/* ── Summary Bar ───────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex divide-x divide-gray-200">
                    {[
                        { key: 'total',     label: 'Total',     color: 'text-gray-900' },
                        { key: 'active',    label: 'Active',    color: 'text-teal-700' },
                        { key: 'inactive',  label: 'Inactive',  color: 'text-gray-600' },
                        { key: 'suspended', label: 'Suspended', color: 'text-red-700'  },
                    ].map(item => (
                        <div key={item.key} className="flex-1 px-4 py-3.5 text-center">
                            <div className={`text-2xl font-bold tabular-nums ${item.color}`}>
                                {stats[item.key] ?? 0}
                            </div>
                            <div className="text-sm font-medium text-gray-600 mt-1">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Search + Export ───────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search by name, email, or phone…"
                        className="w-full pl-9 pr-4 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                </div>
                <button onClick={handleExport}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <Download size={14} />
                    Export CSV
                </button>
                <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{filtered.length} of {allPatients.length}</p>
            </div>

            {/* ── Table ────────────────────────────────────────────── */}
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {['Patient', 'Email', 'Phone', 'Gender', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <UserRound size={22} className="text-gray-400" />
                                        </div>
                                        <p className="text-base font-semibold text-gray-900">No patients found</p>
                                        <p className="text-sm text-gray-600 font-medium">{searchInput ? `No results for "${searchInput}"` : 'No patients in the system.'}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(patient => (
                                <tr
                                    key={patient._id}
                                    className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors cursor-pointer"
                                    onClick={() => setViewModal(patient)}
                                >
                                    {/* Patient */}
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <img src={getProfileImage(patient)} onError={handleImageError} alt={patient.name}
                                                className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    <HighlightText text={patient.name} highlight={searchInput || searchQuery} />
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono">#{patient._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Email */}
                                    <td className="px-6 py-3.5">
                                        <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                                            <HighlightText text={patient.email} highlight={searchInput || searchQuery} />
                                        </p>
                                    </td>
                                    {/* Phone */}
                                    <td className="px-6 py-3.5">
                                        <p className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                                            <Phone size={12} className="text-gray-400 flex-shrink-0" />
                                            {patient.phone || '—'}
                                        </p>
                                    </td>
                                    {/* Gender */}
                                    <td className="px-6 py-3.5">
                                        <span className="text-sm text-gray-700 capitalize font-semibold">{patient.gender || '—'}</span>
                                    </td>
                                    {/* Status */}
                                    <td className="px-6 py-3.5">
                                        <StatusBadge status={patient.status} />
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                        <ActionsDropdown
                                            patient={patient}
                                            onViewDetails={setViewModal}
                                            onMedicalHistory={setHistoryModal}
                                            onDelete={setDeleteModal}
                                            isLoading={actionLoading}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Footer ────────────────────────────────────────────── */}
            {filtered.length > 0 && (
                <div className="flex items-center justify-between text-sm font-medium text-gray-700 px-1">
                    <div>
                        {searchInput && (
                            <button onClick={() => setSearchInput('')}
                                className="text-red-500 hover:text-red-700 font-semibold transition-colors">
                                Clear search
                            </button>
                        )}
                    </div>
                    <p>
                        Showing <span className="font-bold text-gray-900">{filtered.length}</span> of{' '}
                        <span className="font-bold text-gray-900">{allPatients.length}</span> patients
                    </p>
                </div>
            )}

            {/* ── Modals ───────────────────────────────────────────── */}
            {viewModal && (
                <ViewDetailsModal
                    patient={viewModal}
                    onClose={() => setViewModal(null)}
                    getProfileImage={getProfileImage}
                    handleImageError={handleImageError}
                />
            )}
            {historyModal && (
                <MedicalHistoryModal
                    patient={historyModal}
                    onClose={() => setHistoryModal(null)}
                    getProfileImage={getProfileImage}
                    handleImageError={handleImageError}
                />
            )}
            {deleteModal && (
                <DeleteModal
                    patient={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleDeleteConfirm}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
}

export default PatientRecords;