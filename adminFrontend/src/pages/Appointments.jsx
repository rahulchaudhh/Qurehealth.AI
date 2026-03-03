import { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Clock, User, Stethoscope, Search, RefreshCw, AlertCircle,
    X, ChevronDown, Star, CreditCard, FileText, Phone, Mail,
    CheckCircle2, XCircle, Clock3, AlertTriangle, CheckCheck, Activity,
    ExternalLink, Edit3
} from 'lucide-react';
import axios from '../api/axios';

const STATUS_STYLES = {
    pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   icon: Clock3,        label: 'Pending'   },
    confirmed: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500',    icon: CheckCircle2,  label: 'Confirmed' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCheck,    label: 'Completed' },
    cancelled: { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    icon: XCircle,       label: 'Cancelled' },
    missed:    { bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400',   icon: AlertTriangle, label: 'Missed'    },
};

const PAYMENT_STYLES = {
    paid:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Paid'    },
    pending: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Pending' },
    failed:  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    label: 'Failed'  },
};

const STAT_CARDS = [
    { key: 'all',       label: 'Total',     icon: Activity,     bg: 'bg-indigo-50',  iconColor: 'text-indigo-600'  },
    { key: 'pending',   label: 'Pending',   icon: Clock3,       bg: 'bg-amber-50',   iconColor: 'text-amber-600'   },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, bg: 'bg-blue-50',    iconColor: 'text-blue-600'    },
    { key: 'completed', label: 'Completed', icon: CheckCheck,   bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle,      bg: 'bg-rose-50',    iconColor: 'text-rose-600'    },
];

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'missed'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateShort(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateLong(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function StarRating({ score }) {
    if (!score) return <span className="text-slate-300 text-xs">No rating</span>;
    return (
        <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
            ))}
            <span className="text-xs font-semibold text-slate-600 ml-1">{score}/5</span>
        </div>
    );
}

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
    const Icon = s.icon;
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
            <Icon size={10} />
            {s.label.toUpperCase()}
        </div>
    );
}

function PaymentBadge({ paymentStatus }) {
    const p = PAYMENT_STYLES[paymentStatus] || PAYMENT_STYLES.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${p.bg} ${p.text} ${p.border}`}>
            <CreditCard size={9} />
            {p.label}
        </span>
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
        setStatusUpdating(true);
        setStatusError('');
        setStatusSuccess('');
        try {
            await axios.put(`/admin/appointments/${appt._id}/status`, { status: selectedStatus });
            setStatusSuccess('Status updated successfully!');
            onStatusUpdated(appt._id, selectedStatus);
            setTimeout(() => setStatusSuccess(''), 2500);
        } catch (err) {
            setStatusError(err.response?.data?.error || 'Update failed. Please try again.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleBackdrop}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 font-outfit">Appointment Details</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {appt._id}</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="px-8 py-6 space-y-5">
                    {/* Patient & Doctor */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <User size={15} className="text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Patient</span>
                            </div>
                            <p className="font-bold text-slate-900">{appt.patient?.name || '—'}</p>
                            <div className="mt-2 space-y-1">
                                {appt.patient?.email && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={10} />{appt.patient.email}</div>}
                                {appt.patient?.phone && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={10} />{appt.patient.phone}</div>}
                            </div>
                        </div>
                        <div className="bg-indigo-50 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <Stethoscope size={15} className="text-indigo-600" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Doctor</span>
                            </div>
                            <p className="font-bold text-slate-900">{appt.doctor?.name ? `Dr. ${appt.doctor.name}` : '—'}</p>
                            <div className="mt-2 space-y-1">
                                {appt.doctor?.specialization && <p className="text-xs font-semibold text-indigo-500">{appt.doctor.specialization}</p>}
                                {appt.doctor?.email && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={10} />{appt.doctor.email}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Date, Time, Status, Payment */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Date & Time</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><Calendar size={13} className="text-slate-400" />{formatDateLong(appt.date)}</div>
                            {appt.time && <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1"><Clock size={11} />{appt.time}</div>}
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                            <StatusBadge status={appt.status} />
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment</p>
                            <PaymentBadge paymentStatus={appt.paymentStatus} />
                            {appt.paymentMethod && <p className="text-[10px] text-slate-400 mt-1 capitalize">{appt.paymentMethod}</p>}
                        </div>
                    </div>

                    {/* Reason */}
                    {appt.reason && (
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reason for Visit</p>
                            <p className="text-sm text-slate-700">{appt.reason}</p>
                        </div>
                    )}

                    {/* Diagnosis & Prescription */}
                    {(appt.diagnosis || appt.prescription) && (
                        <div className="grid grid-cols-2 gap-4">
                            {appt.diagnosis && (
                                <div className="bg-teal-50 rounded-2xl p-4">
                                    <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><FileText size={9} />Diagnosis</p>
                                    <p className="text-sm text-slate-700">{appt.diagnosis}</p>
                                </div>
                            )}
                            {appt.prescription && (
                                <div className="bg-violet-50 rounded-2xl p-4">
                                    <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><FileText size={9} />Prescription</p>
                                    <p className="text-sm text-slate-700">{appt.prescription}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Doctor Notes */}
                    {appt.doctorNotes && (
                        <div className="bg-amber-50 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Doctor Notes</p>
                            <p className="text-sm text-slate-700">{appt.doctorNotes}</p>
                        </div>
                    )}

                    {/* Rating */}
                    {appt.rating?.isRated && (
                        <div className="bg-yellow-50 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-2">Patient Rating</p>
                            <StarRating score={appt.rating.score} />
                            {appt.rating.feedback && <p className="text-sm text-slate-600 mt-2 italic">"{appt.rating.feedback}"</p>}
                        </div>
                    )}

                    {/* Meeting Link */}
                    {appt.meetingLink && (
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Meeting Link</p>
                            <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
                                <ExternalLink size={12} />{appt.meetingLink}
                            </a>
                        </div>
                    )}

                    {/* Admin Status Control */}
                    <div className="border-t border-slate-100 pt-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Edit3 size={11} />Admin Status Control
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <select
                                    value={selectedStatus}
                                    onChange={e => { setSelectedStatus(e.target.value); setStatusError(''); setStatusSuccess(''); }}
                                    className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                                >
                                    {['pending','confirmed','completed','cancelled','missed'].map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={statusUpdating || selectedStatus === appt.status}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                                    selectedStatus === appt.status
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 shadow-sm'
                                }`}
                            >
                                {statusUpdating ? <span className="flex items-center gap-1.5"><RefreshCw size={13} className="animate-spin" />Updating…</span> : 'Update Status'}
                            </button>
                        </div>
                        {statusError && <p className="text-xs text-rose-600 mt-2 flex items-center gap-1"><AlertCircle size={11} />{statusError}</p>}
                        {statusSuccess && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-semibold"><CheckCircle2 size={11} />{statusSuccess}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <tr className="border-b border-slate-50">
            {[140, 140, 110, 150, 80, 70, 80].map((w, i) => (
                <td key={i} className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded-full animate-pulse" style={{ width: w }} />
                </td>
            ))}
        </tr>
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
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const { data } = await axios.get('/admin/appointments');
            setAppointments(data.data ?? []);
        } catch (err) {
            setError('Failed to load appointments. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const handleStatusUpdated = (id, newStatus) => {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        if (selectedAppt?._id === id) setSelectedAppt(prev => ({ ...prev, status: newStatus }));
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-outfit">Appointments</h1>
                    <p className="text-slate-500 mt-1 text-sm">Monitor and manage all patient–doctor appointments across the platform.</p>
                </div>
                <button
                    onClick={() => fetchAppointments(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                {STAT_CARDS.map(card => {
                    const Icon = card.icon;
                    const isActive = statusFilter === card.key;
                    const count = counts[card.key] ?? 0;
                    return (
                        <button
                            key={card.key}
                            onClick={() => setStatusFilter(card.key)}
                            className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                                isActive
                                    ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-50 ring-2 ring-indigo-100'
                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.bg}`}>
                                <Icon size={18} className={card.iconColor} />
                            </div>
                            <p className="text-2xl font-black text-slate-900 leading-none mb-1">
                                {loading ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" /> : count}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search + Date + Status Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patient, doctor, reason…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-slate-700 placeholder-slate-400 shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
                        <Calendar size={12} className="text-slate-400" />
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs text-slate-600 bg-transparent focus:outline-none" />
                    </div>
                    <span className="text-slate-400 text-xs">—</span>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
                        <Calendar size={12} className="text-slate-400" />
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs text-slate-600 bg-transparent focus:outline-none" />
                    </div>
                    {(dateFrom || dateTo) && (
                        <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-rose-500 hover:text-rose-700 font-semibold">Clear</button>
                    )}
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto shrink-0">
                    {FILTERS.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                                statusFilter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {s}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {counts[s] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {error ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-3 text-rose-500">
                        <AlertCircle size={36} strokeWidth={1.5} />
                        <p className="text-sm font-semibold">{error}</p>
                        <button onClick={() => fetchAppointments()} className="text-xs text-blue-600 underline font-medium">Try again</button>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/70">
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-28 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <Calendar size={44} strokeWidth={1.2} />
                                            <p className="font-bold text-slate-600 text-base">No appointments found</p>
                                            <p className="text-sm">
                                                {search ? `No results for "${search}"` : `No ${statusFilter !== 'all' ? statusFilter : ''} appointments match your filters.`}
                                            </p>
                                            {hasFilters && (
                                                <button onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }} className="text-xs text-blue-600 underline font-semibold mt-1">
                                                    Clear all filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(appt => (
                                    <tr key={appt._id} onClick={() => setSelectedAppt(appt)} className="hover:bg-indigo-50/30 transition-all duration-150 cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><User size={15} className="text-blue-400" /></div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{appt.patient?.name || '—'}</div>
                                                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{appt.patient?.email || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><Stethoscope size={15} className="text-indigo-400" /></div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{appt.doctor?.name ? `Dr. ${appt.doctor.name}` : '—'}</div>
                                                    <div className="text-[10px] font-semibold text-indigo-400">{appt.doctor?.specialization || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Calendar size={11} className="text-slate-300" />{formatDateShort(appt.date)}</div>
                                            {appt.time && <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5"><Clock size={10} />{appt.time}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 max-w-[160px] truncate" title={appt.reason}>{appt.reason || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={appt.status} /></td>
                                        <td className="px-6 py-4"><PaymentBadge paymentStatus={appt.paymentStatus} /></td>
                                        <td className="px-6 py-4">
                                            {appt.rating?.isRated
                                                ? <StarRating score={appt.rating.score} />
                                                : <span className="text-[10px] text-slate-300 font-semibold">—</span>
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            {!loading && !error && (
                <div className="flex justify-between items-center mt-3 px-1">
                    <div>
                        {hasFilters && (
                            <button onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }} className="text-xs text-rose-400 hover:text-rose-600 underline font-medium">
                                Clear all filters
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                        Showing <span className="font-bold text-slate-600">{filtered.length}</span> of{' '}
                        <span className="font-bold text-slate-600">{appointments.length}</span> appointment{appointments.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}

            {/* Detail Modal */}
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
