import { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Clock, User, Stethoscope, Search, RefreshCw, AlertCircle,
    X, ChevronDown, Star, FileText, Phone, Mail,
    CheckCircle2, XCircle, Clock3, AlertTriangle, CheckCheck,
    ExternalLink, Edit3, Loader2, Download, MoreHorizontal
} from 'lucide-react';
import axios from '../api/axios';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
    pending:   { label: 'Pending',   text: 'text-amber-700',  bg: 'bg-amber-50'  },
    confirmed: { label: 'Confirmed', text: 'text-blue-700',   bg: 'bg-blue-50'   },
    completed: { label: 'Completed', text: 'text-teal-700',   bg: 'bg-teal-50'   },
    cancelled: { label: 'Cancelled', text: 'text-slate-600',  bg: 'bg-slate-100' },
    missed:    { label: 'Missed',    text: 'text-slate-500',  bg: 'bg-slate-100' },
};

const PAYMENT_CFG = {
    paid:    { label: 'Paid',    text: 'text-teal-700',   bg: 'bg-teal-50'   },
    pending: { label: 'Pending', text: 'text-slate-500',  bg: 'bg-slate-100' },
    failed:  { label: 'Failed',  text: 'text-orange-700', bg: 'bg-orange-50' },
};

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'missed'];

const SUMMARY_ITEMS = [
    { key: 'all',       label: 'Total'     },
    { key: 'pending',   label: 'Pending'   },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'missed',    label: 'Missed'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtLong(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const c = STATUS_CFG[status] || STATUS_CFG.pending;
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}

// ─── PaymentBadge ─────────────────────────────────────────────────────────────

function PaymentBadge({ status }) {
    const c = PAYMENT_CFG[status] || PAYMENT_CFG.pending;
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ score }) {
    if (!score) return <span className="text-xs text-gray-400">—</span>;
    return (
        <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={11} className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
            <span className="text-xs text-gray-500 ml-0.5">{score}</span>
        </div>
    );
}

// ─── SkeletonRow ──────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100">
            {[160, 150, 100, 140, 80, 60, 80].map((w, i) => (
                <td key={i} className="px-6 py-3.5">
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: w }} />
                </td>
            ))}
        </tr>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function AppointmentDetailModal({ appt, onClose, onStatusUpdated }) {
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(appt.status);
    const [statusError, setStatusError] = useState('');
    const [statusSuccess, setStatusSuccess] = useState('');

    const handleStatusUpdate = async () => {
        if (selectedStatus === appt.status) return;
        setStatusUpdating(true); setStatusError(''); setStatusSuccess('');
        try {
            await axios.put(`/admin/appointments/${appt._id}/status`, { status: selectedStatus });
            setStatusSuccess('Status updated successfully.');
            onStatusUpdated(appt._id, selectedStatus);
            setTimeout(() => setStatusSuccess(''), 2500);
        } catch (err) {
            setStatusError(err.response?.data?.error || 'Update failed. Please try again.');
        } finally { setStatusUpdating(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Appointment Details</h2>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{appt._id?.slice(-10).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Patient & Doctor */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <User size={11} />Patient
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{appt.patient?.name || '—'}</p>
                            <div className="mt-1.5 space-y-1">
                                {appt.patient?.email && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Mail size={10} className="flex-shrink-0" />{appt.patient.email}</p>}
                                {appt.patient?.phone && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Phone size={10} className="flex-shrink-0" />{appt.patient.phone}</p>}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <Stethoscope size={11} />Doctor
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{appt.doctor?.name ? `Dr. ${appt.doctor.name}` : '—'}</p>
                            <div className="mt-1.5 space-y-1">
                                {appt.doctor?.specialization && <p className="text-xs text-blue-600 font-medium">{appt.doctor.specialization}</p>}
                                {appt.doctor?.email && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Mail size={10} className="flex-shrink-0" />{appt.doctor.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Date / Status / Payment */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date & Time</p>
                            <p className="text-sm font-semibold text-gray-900">{fmtLong(appt.date)}</p>
                            {appt.time && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={10} />{appt.time}</p>}
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                            <StatusBadge status={appt.status} />
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</p>
                            <PaymentBadge status={appt.paymentStatus} />
                            {appt.paymentMethod && <p className="text-xs text-gray-400 mt-1 capitalize">{appt.paymentMethod}</p>}
                        </div>
                    </div>

                    {/* Reason */}
                    {appt.reason && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reason for Visit</p>
                            <p className="text-sm text-gray-700">{appt.reason}</p>
                        </div>
                    )}

                    {/* Diagnosis & Prescription */}
                    {(appt.diagnosis || appt.prescription) && (
                        <div className="grid grid-cols-2 gap-3">
                            {appt.diagnosis && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><FileText size={10} />Diagnosis</p>
                                    <p className="text-sm text-gray-700">{appt.diagnosis}</p>
                                </div>
                            )}
                            {appt.prescription && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><FileText size={10} />Prescription</p>
                                    <p className="text-sm text-gray-700">{appt.prescription}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Doctor Notes */}
                    {appt.doctorNotes && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Doctor Notes</p>
                            <p className="text-sm text-gray-700">{appt.doctorNotes}</p>
                        </div>
                    )}

                    {/* Rating */}
                    {appt.rating?.isRated && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Patient Rating</p>
                            <StarRating score={appt.rating.score} />
                            {appt.rating.feedback && <p className="text-sm text-gray-600 mt-2 italic">"{appt.rating.feedback}"</p>}
                        </div>
                    )}

                    {/* Meeting Link */}
                    {appt.meetingLink && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Meeting Link</p>
                            <a href={appt.meetingLink} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
                                <ExternalLink size={12} />{appt.meetingLink}
                            </a>
                        </div>
                    )}

                    {/* Status Control */}
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Edit3 size={11} />Update Status
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <select value={selectedStatus}
                                    onChange={e => { setSelectedStatus(e.target.value); setStatusError(''); setStatusSuccess(''); }}
                                    className="w-full appearance-none px-4 py-2.5 pr-9 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                                    {['pending','confirmed','completed','cancelled','missed'].map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <button onClick={handleStatusUpdate}
                                disabled={statusUpdating || selectedStatus === appt.status}
                                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {statusUpdating ? <><Loader2 size={13} className="animate-spin" />Updating…</> : 'Update Status'}
                            </button>
                        </div>
                        {statusError && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle size={11} />{statusError}</p>}
                        {statusSuccess && <p className="text-xs text-teal-600 mt-2 flex items-center gap-1"><CheckCircle2 size={11} />{statusSuccess}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchAppointments = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        setError('');
        try {
            const { data } = await axios.get('/admin/appointments');
            setAppointments(data.data ?? []);
        } catch (err) {
            setError('Failed to load appointments. Please try again.');
        } finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const handleStatusUpdated = (id, newStatus) => {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        if (selectedAppt?._id === id) setSelectedAppt(prev => ({ ...prev, status: newStatus }));
    };

    const handleExportAppointments = () => {
        try {
            const headers = ['Patient', 'Doctor', 'Date', 'Time', 'Reason', 'Status', 'Payment', 'Rating'];
            const rows = filtered.map(appt => [
                appt.patient?.name || '—',
                appt.doctor?.name || '—',
                appt.date || '—',
                appt.time || '—',
                appt.reason || '—',
                appt.status || '—',
                appt.paymentStatus || '—',
                appt.rating?.score || '—'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError('Failed to export appointments.');
        }
    };

    const filtered = appointments.filter(a => {
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            a.patient?.name?.toLowerCase().includes(q) ||
            a.doctor?.name?.toLowerCase().includes(q) ||
            a.doctor?.specialization?.toLowerCase().includes(q) ||
            a.reason?.toLowerCase().includes(q) ||
            a.patient?.email?.toLowerCase().includes(q);
        const matchFrom = !dateFrom || (a.date && a.date >= dateFrom);
        const matchTo = !dateTo || (a.date && a.date <= dateTo);
        return matchStatus && matchSearch && matchFrom && matchTo;
    });

    const counts = FILTERS.reduce((acc, s) => {
        acc[s] = s === 'all' ? appointments.length : appointments.filter(a => a.status === s).length;
        return acc;
    }, {});

    const hasFilters = search || statusFilter !== 'all' || dateFrom || dateTo;

    return (
        <div className="space-y-5">

            {/* ── Page Header ───────────────────────────────────────── */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Appointments</h1>
                    <p className="text-xs text-gray-500 mt-1">Monitor and manage all patient-doctor appointments.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchAppointments(true)} disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button onClick={handleExportAppointments}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download size={13} />
                        Export
                    </button>
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search patient, doctor, reason…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                </div>

                {/* Status dropdown */}
                <div className="relative shrink-0">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                        {FILTERS.map(s => (
                            <option key={s} value={s}>
                                {s === 'all' ? `All (${counts.all ?? 0})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s] ?? 0})`}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Date range */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                        <Calendar size={12} className="text-gray-400" />
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="text-xs text-gray-600 bg-transparent focus:outline-none" />
                    </div>
                    <span className="text-gray-400 text-xs">—</span>
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                        <Calendar size={12} className="text-gray-400" />
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="text-xs text-gray-600 bg-transparent focus:outline-none" />
                    </div>
                    {(dateFrom || dateTo) && (
                        <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                            className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
                    )}
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                {error ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
                        <AlertCircle size={32} strokeWidth={1.5} />
                        <p className="text-sm font-medium">{error}</p>
                        <button onClick={() => fetchAppointments()} className="text-xs text-blue-600 underline">Try again</button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                {['Patient','Doctor','Date & Time','Reason','Status','Payment','Rating'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Calendar size={22} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">No Appointments Found</p>
                                            <p className="text-xs text-gray-500">
                                                {search
                                                    ? `No results for "${search}"`
                                                    : `No ${statusFilter !== 'all' ? statusFilter : ''} appointments match your filters.`}
                                            </p>
                                            {hasFilters && (
                                                <button onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}
                                                    className="text-xs text-blue-600 hover:underline font-medium mt-1">
                                                    Clear all filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(appt => (
                                    <tr key={appt._id} onClick={() => setSelectedAppt(appt)}
                                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors duration-150 cursor-pointer">
                                        {/* Patient */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <User size={14} className="text-blue-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{appt.patient?.name || '—'}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[130px]">{appt.patient?.email || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Doctor */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                    <Stethoscope size={14} className="text-indigo-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {appt.doctor?.name ? `Dr. ${appt.doctor.name}` : '—'}
                                                    </p>
                                                    <p className="text-xs text-indigo-500 font-medium truncate">{appt.doctor?.specialization || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Date */}
                                        <td className="px-6 py-3.5">
                                            <p className="text-sm text-gray-700 font-medium whitespace-nowrap">{fmt(appt.date)}</p>
                                            {appt.time && (
                                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Clock size={10} />{appt.time}
                                                </p>
                                            )}
                                        </td>
                                        {/* Reason */}
                                        <td className="px-6 py-3.5">
                                            <p className="text-sm text-gray-600 max-w-[150px] truncate" title={appt.reason}>
                                                {appt.reason || '—'}
                                            </p>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-3.5">
                                            <StatusBadge status={appt.status} />
                                        </td>
                                        {/* Payment */}
                                        <td className="px-6 py-3.5">
                                            <PaymentBadge status={appt.paymentStatus} />
                                        </td>
                                        {/* Rating */}
                                        <td className="px-6 py-3.5">
                                            {appt.rating?.isRated
                                                ? <StarRating score={appt.rating.score} />
                                                : <span className="text-xs text-gray-300">—</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Footer ────────────────────────────────────────────── */}
            {!loading && !error && (
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <div>
                        {hasFilters && (
                            <button onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}
                                className="text-red-400 hover:text-red-600 font-medium transition-colors">
                                Clear all filters
                            </button>
                        )}
                    </div>
                    <p className="font-medium">
                        Showing <span className="text-gray-900">{filtered.length}</span> of{' '}
                        <span className="text-gray-900">{appointments.length}</span> appointments
                    </p>
                </div>
            )}

            {/* ── Detail Modal ──────────────────────────────────────── */}
            {selectedAppt && (
                <AppointmentDetailModal
                    appt={selectedAppt}
                    onClose={() => setSelectedAppt(null)}
                    onStatusUpdated={handleStatusUpdated}
                />
            )}
        </div>
    );
}

export default Appointments;
