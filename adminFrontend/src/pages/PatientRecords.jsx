import { useState } from 'react';
import { Phone, Mail, Trash2, Search, RefreshCw, Download, MoreHorizontal, UserRound, X, Loader2, AlertTriangle } from 'lucide-react';
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

// ─── Actions Dropdown ─────────────────────────────────────────────────────────

function ActionsDropdown({ patient, onDelete, isLoading }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-150"
                disabled={isLoading === patient._id}
            >
                {isLoading === patient._id
                    ? <span className="inline-block animate-spin text-sm">⟳</span>
                    : <MoreHorizontal size={16} />
                }
            </button>
            {open && (
                <div className="absolute -right-2 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button onClick={() => { setOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        View Details
                    </button>
                    <button onClick={() => { setOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors">
                        Medical History
                    </button>
                    <button onClick={() => { setOpen(false); onDelete(patient._id); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 border-t border-gray-100 transition-colors">
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({ patient, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-xl border border-gray-200 shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={22} className="text-red-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Delete Patient?</h2>
                    <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">{patient.name}</span> will be permanently removed.</p>
                </div>
                <div className="flex items-center gap-2 px-6 pb-5">
                    <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                        {loading ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function PatientRecords({ allPatients, handleDeletePatient, actionLoading, getProfileImage, handleImageError, searchQuery = '' }) {
    const [searchInput, setSearchInput] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Add refresh logic here if needed
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleExport = () => {
        try {
            const headers = ['Patient Name', 'Email', 'Phone', 'Gender', 'Status'];
            const rows = filtered.map(patient => [
                patient.name || '—',
                patient.email || '—',
                patient.phone || '—',
                patient.gender || '—',
                patient.status || 'active'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `patient_records_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Export failed:', err);
        }
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
        total: allPatients.length,
        active: allPatients.filter(p => p.status === 'active' || !p.status).length,
        inactive: allPatients.filter(p => p.status === 'inactive').length,
        suspended: allPatients.filter(p => p.status === 'suspended').length,
    };

    return (
        <div className="space-y-5">

            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Patient Records</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage and monitor all patient profiles.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleRefresh} disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download size={13} />
                        Export
                    </button>
                </div>
            </div>

            {/* ── Summary Bar ───────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex divide-x divide-gray-200">
                    {[
                        { key: 'total', label: 'Total', color: 'text-gray-900' },
                        { key: 'active', label: 'Active', color: 'text-teal-700' },
                        { key: 'inactive', label: 'Inactive', color: 'text-gray-600' },
                        { key: 'suspended', label: 'Suspended', color: 'text-red-700' },
                    ].map(item => (
                        <div key={item.key} className="flex-1 px-4 py-3.5 text-center">
                            <div className={`text-xl font-semibold tabular-nums ${item.color}`}>
                                {stats[item.key] ?? 0}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search by name, email, or phone…"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap">{filtered.length} of {allPatients.length}</p>
            </div>

            {/* ── Table ────────────────────────────────────────────── */}
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {['Patient', 'Email', 'Phone', 'Gender', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
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
                                        <p className="text-sm font-medium text-gray-900">No patients found</p>
                                        <p className="text-xs text-gray-500">{searchInput ? `No results for "${searchInput}"` : 'No patients in the system.'}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(patient => (
                                <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors cursor-pointer">
                                    {/* Patient */}
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <img src={getProfileImage(patient)} onError={handleImageError} alt={patient.name}
                                                className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    <HighlightText text={patient.name} highlight={searchInput || searchQuery} />
                                                </p>
                                                <p className="text-xs text-gray-400 font-mono">#{patient._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Email */}
                                    <td className="px-6 py-3.5">
                                        <p className="text-sm text-gray-700 truncate max-w-[200px]">
                                            <HighlightText text={patient.email} highlight={searchInput || searchQuery} />
                                        </p>
                                    </td>
                                    {/* Phone */}
                                    <td className="px-6 py-3.5">
                                        <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                            <Phone size={12} className="text-gray-400 flex-shrink-0" />
                                            {patient.phone || '—'}
                                        </p>
                                    </td>
                                    {/* Gender */}
                                    <td className="px-6 py-3.5">
                                        <span className="text-sm text-gray-600 capitalize font-medium">{patient.gender || '—'}</span>
                                    </td>
                                    {/* Status */}
                                    <td className="px-6 py-3.5">
                                        <StatusBadge status={patient.status} />
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                        <ActionsDropdown
                                            patient={patient}
                                            onDelete={() => setDeleteModal(patient)}
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
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <div>
                        {searchInput && (
                            <button onClick={() => setSearchInput('')}
                                className="text-red-400 hover:text-red-600 font-medium transition-colors">
                                Clear search
                            </button>
                        )}
                    </div>
                    <p className="font-medium">
                        Showing <span className="text-gray-900">{filtered.length}</span> of{' '}
                        <span className="text-gray-900">{allPatients.length}</span> patients
                    </p>
                </div>
            )}

            {/* ── Delete Modal ──────────────────────────────────────── */}
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
