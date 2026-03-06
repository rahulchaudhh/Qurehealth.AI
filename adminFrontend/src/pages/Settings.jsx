import { useState, useEffect, useCallback } from 'react';
import {
    Database, AlertCircle, Loader2, RefreshCw, Settings2,
    Activity, Clock, CheckCircle2, XCircle, ChevronLeft,
    ChevronRight, Trash2, Save, X
} from 'lucide-react';
import axios from '../api/axios';

// ─── Action badge colours ────────────────────────────────────────────────────
const ACTION_COLORS = {
    DOCTOR_APPROVED:               { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    DOCTOR_REJECTED:               { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
    DOCTOR_REGISTERED:             { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
    DOCTOR_DELETED:                { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200'    },
    VERIFICATION_CRITERIA_UPDATED: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200'  },
    SETTINGS_CHANGED:              { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
};
const actionColor = (action) => ACTION_COLORS[action] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight mt-2">{value ?? '—'}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-violet-600' : 'bg-gray-200'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

// ─── Clear Logs Confirmation Modal ────────────────────────────────────────────
function ClearLogsModal({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                        <Trash2 size={22} className="text-red-600" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mb-1">Clear Old Logs?</h2>
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                        This will permanently delete all activity logs older than <span className="font-semibold text-gray-700">30 days</span>. This action cannot be undone.
                    </p>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50">
                            Cancel
                        </button>
                        <button onClick={onConfirm} disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {isLoading ? <><Loader2 size={14} className="animate-spin" />Clearing…</> : 'Clear Logs'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
    if (!toast) return null;
    const isSuccess = toast.type === 'success';
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-4 duration-300
            ${isSuccess ? 'bg-white border-emerald-200 text-emerald-800' : 'bg-white border-red-200 text-red-800'}`}>
            {isSuccess
                ? <CheckCircle2 size={17} className="text-emerald-600 flex-shrink-0" />
                : <XCircle size={17} className="text-red-600 flex-shrink-0" />
            }
            <span>{toast.message}</span>
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
                <X size={15} />
            </button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Settings() {
    // ── System Stats ──────────────────────────────────────────────────────────
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // ── Verification Criteria ─────────────────────────────────────────────────
    const [criteria, setCriteria] = useState(null);
    const [criteriaForm, setCriteriaForm] = useState({
        minExperienceYears: 0,
        requireLicenseVerification: false,
        requireEducationProof: true,
        autoApproveIfCriteriaMet: false,
        maxPendingDoctors: 100,
        requiredSpecializations: ''
    });
    const [criteriaLoading, setCriteriaLoading] = useState(true);
    const [criteriaSaving, setCriteriaSaving] = useState(false);
    const [criteriaChanged, setCriteriaChanged] = useState(false);

    // ── Activity Logs ─────────────────────────────────────────────────────────
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsFilter, setLogsFilter] = useState({ action: '', targetType: '', startDate: '', endDate: '' });
    const [pagination, setPagination] = useState({ total: 0, limit: 20, skip: 0, pages: 0 });
    const [clearModal, setClearModal] = useState(false);
    const [clearLoading, setClearLoading] = useState(false);
    const [logsRefreshing, setLogsRefreshing] = useState(false);

    // ── Toast ─────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Fetch system stats ────────────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const res = await axios.get('/admin/stats/system');
            setStats(res.data.data);
        } catch (err) {
            console.error('❌ Stats:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // ── Fetch verification criteria ───────────────────────────────────────────
    const fetchCriteria = useCallback(async () => {
        try {
            setCriteriaLoading(true);
            const res = await axios.get('/admin/settings/verification-criteria');
            const d = res.data.data;
            setCriteria(d);
            setCriteriaForm({
                minExperienceYears: d.minExperienceYears ?? 0,
                requireLicenseVerification: d.requireLicenseVerification ?? false,
                requireEducationProof: d.requireEducationProof ?? true,
                autoApproveIfCriteriaMet: d.autoApproveIfCriteriaMet ?? false,
                maxPendingDoctors: d.maxPendingDoctors ?? 100,
                requiredSpecializations: (d.requiredSpecializations || []).join(', ')
            });
            setCriteriaChanged(false);
        } catch (err) {
            console.error('❌ Criteria:', err);
        } finally {
            setCriteriaLoading(false);
        }
    }, []);

    // ── Fetch logs ────────────────────────────────────────────────────────────
    const fetchLogs = useCallback(async (skip = 0, silent = false) => {
        try {
            if (!silent) setLogsLoading(true);
            const params = new URLSearchParams({
                limit: pagination.limit,
                skip,
                ...(logsFilter.action && { action: logsFilter.action }),
                ...(logsFilter.targetType && { targetType: logsFilter.targetType }),
                ...(logsFilter.startDate && { startDate: logsFilter.startDate }),
                ...(logsFilter.endDate && { endDate: logsFilter.endDate }),
            });
            const res = await axios.get(`/admin/logs/activity?${params}`);
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('❌ Logs:', err);
            showToast('Failed to load activity logs', 'error');
        } finally {
            setLogsLoading(false);
            setLogsRefreshing(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logsFilter, pagination.limit]);

    useEffect(() => { fetchStats(); fetchCriteria(); }, [fetchStats, fetchCriteria]);
    useEffect(() => { fetchLogs(0); }, [logsFilter]); // eslint-disable-line

    // ── Save criteria ─────────────────────────────────────────────────────────
    const handleSaveCriteria = async () => {
        try {
            setCriteriaSaving(true);
            const payload = {
                ...criteriaForm,
                minExperienceYears: Number(criteriaForm.minExperienceYears),
                maxPendingDoctors: Number(criteriaForm.maxPendingDoctors),
                requiredSpecializations: criteriaForm.requiredSpecializations
                    ? criteriaForm.requiredSpecializations.split(',').map(s => s.trim()).filter(Boolean)
                    : []
            };
            await axios.put('/admin/settings/verification-criteria', payload);
            await fetchCriteria();
            await fetchStats();
            showToast('Verification criteria saved successfully');
        } catch (err) {
            console.error('❌ Save criteria:', err);
            showToast('Failed to save criteria', 'error');
        } finally {
            setCriteriaSaving(false);
        }
    };

    const updateCriteriaForm = (key, value) => {
        setCriteriaForm(prev => ({ ...prev, [key]: value }));
        setCriteriaChanged(true);
    };

    // ── Clear old logs ────────────────────────────────────────────────────────
    const handleClearLogs = async () => {
        try {
            setClearLoading(true);
            const res = await axios.delete('/admin/logs/clear-old');
            setClearModal(false);
            showToast(res.data.message || 'Old logs cleared');
            fetchLogs(0);
        } catch (err) {
            console.error('❌ Clear logs:', err);
            showToast('Failed to clear logs', 'error');
        } finally {
            setClearLoading(false);
        }
    };

    // ── Filter helpers ────────────────────────────────────────────────────────
    const handleFilterChange = (key, value) => setLogsFilter(prev => ({ ...prev, [key]: value }));
    const clearFilters = () => setLogsFilter({ action: '', targetType: '', startDate: '', endDate: '' });
    const hasFilters = Object.values(logsFilter).some(Boolean);

    const handleLogsRefresh = () => {
        setLogsRefreshing(true);
        fetchLogs(0, true);
    };

    return (
        <div className="space-y-6 pb-10">

            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Admin Settings</h1>
                    <p className="text-xs text-gray-500 mt-1">Configure platform-wide parameters and manage system security.</p>
                </div>
                <button onClick={() => { fetchStats(); fetchCriteria(); fetchLogs(0); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RefreshCw size={13} />
                    Refresh
                </button>
            </div>

            {/* ── System Stats ─────────────────────────────────────── */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System Overview</p>
                {statsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                                <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
                                <div className="h-6 bg-gray-200 rounded w-12" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard label="Total Doctors" value={stats?.totalDoctors} sub="Registered on platform" />
                        <StatCard label="Approved Doctors" value={stats?.approvedDoctors} sub="Active & verified" />
                        <StatCard label="Pending Reviews" value={stats?.pendingDoctors} sub="Awaiting approval" />
                        <StatCard label="Actions Today" value={stats?.logsToday} sub="Admin log entries" />
                    </div>
                )}
            </div>

            {/* ── Verification Criteria ─────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Doctor Verification Criteria</h2>
                    <p className="text-xs text-gray-400 mt-1">
                        {criteria?.lastUpdatedAt
                            ? `Last updated ${new Date(criteria.lastUpdatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'Configure approval rules for new doctors'}
                    </p>
                    {criteriaChanged && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                            Unsaved changes
                        </span>
                    )}
                </div>

                {criteriaLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 size={24} className="text-violet-500 animate-spin" />
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Numeric fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Minimum Experience (years)
                                </label>
                                <input
                                    type="number"
                                    min="0" max="50"
                                    value={criteriaForm.minExperienceYears}
                                    onChange={e => updateCriteriaForm('minExperienceYears', e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-400 mt-1">Minimum years of clinical practice required.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Max Pending Doctors Queue
                                </label>
                                <input
                                    type="number"
                                    min="1" max="500"
                                    value={criteriaForm.maxPendingDoctors}
                                    onChange={e => updateCriteriaForm('maxPendingDoctors', e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-400 mt-1">Maximum doctors held in pending state at once.</p>
                            </div>
                        </div>

                        {/* Specializations */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Required Specializations <span className="font-normal text-gray-400">(comma separated)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Cardiology, Neurology, Dermatology"
                                value={criteriaForm.requiredSpecializations}
                                onChange={e => updateCriteriaForm('requiredSpecializations', e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-400 mt-1">Leave blank to allow all specializations.</p>
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    key: 'requireLicenseVerification',
                                    label: 'Require License Verification',
                                    desc: 'Doctor must upload a valid medical license.',
                                },
                                {
                                    key: 'requireEducationProof',
                                    label: 'Require Education Proof',
                                    desc: 'Doctor must submit degree/certificate.',
                                },
                                {
                                    key: 'autoApproveIfCriteriaMet',
                                    label: 'Auto-Approve on Criteria Met',
                                    desc: 'Automatically approves if all criteria pass.',
                                },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 leading-snug">{label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
                                    </div>
                                    <Toggle
                                        checked={criteriaForm[key]}
                                        onChange={v => updateCriteriaForm(key, v)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Save button */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                            {criteriaChanged && (
                                <button onClick={fetchCriteria}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                    Discard
                                </button>
                            )}
                            <button
                                onClick={handleSaveCriteria}
                                disabled={criteriaSaving || !criteriaChanged}
                                className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {criteriaSaving
                                    ? <><Loader2 size={14} className="animate-spin" />Saving…</>
                                    : <><Save size={14} />Save Changes</>
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Activity Logs ─────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Activity Logs</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {pagination.total > 0 ? `${pagination.total} total entries` : 'All administrative actions and system events'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleLogsRefresh} disabled={logsRefreshing}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <RefreshCw size={12} className={logsRefreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button onClick={() => setClearModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 size={12} />
                            Clear Old
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            value={logsFilter.action}
                            onChange={e => handleFilterChange('action', e.target.value)}
                            className="px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                        >
                            <option value="">All Actions</option>
                            <option value="DOCTOR_APPROVED">Doctor Approved</option>
                            <option value="DOCTOR_REJECTED">Doctor Rejected</option>
                            <option value="DOCTOR_REGISTERED">Doctor Registered</option>
                            <option value="DOCTOR_DELETED">Doctor Deleted</option>
                            <option value="VERIFICATION_CRITERIA_UPDATED">Criteria Updated</option>
                            <option value="SETTINGS_CHANGED">Settings Changed</option>
                        </select>

                        <select
                            value={logsFilter.targetType}
                            onChange={e => handleFilterChange('targetType', e.target.value)}
                            className="px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                        >
                            <option value="">All Types</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="PATIENT">Patient</option>
                            <option value="SYSTEM">System</option>
                        </select>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium">From</span>
                            <input type="date" value={logsFilter.startDate}
                                onChange={e => handleFilterChange('startDate', e.target.value)}
                                className="px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium">To</span>
                            <input type="date" value={logsFilter.endDate}
                                onChange={e => handleFilterChange('endDate', e.target.value)}
                                className="px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                            />
                        </div>

                        {hasFilters && (
                            <button onClick={clearFilters}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <X size={12} />
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                {logsLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 size={24} className="text-emerald-500 animate-spin" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                        <Database size={32} strokeWidth={1} />
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-500">No activity logs found</p>
                            <p className="text-xs mt-1">{hasFilters ? 'Try adjusting your filters' : 'Actions will appear here when performed'}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log) => {
                                        const ac = actionColor(log.action);
                                        return (
                                            <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                                                    <div className="font-medium text-gray-700">{new Date(log.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                    <div className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${ac.bg} ${ac.text} ${ac.border}`}>
                                                        {log.action?.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="text-xs font-semibold text-gray-800">{log.targetName || log.targetType || '—'}</div>
                                                    {log.targetEmail && <div className="text-xs text-gray-400 mt-0.5">{log.targetEmail}</div>}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-gray-500 max-w-xs">
                                                    <span className="line-clamp-2">{log.details?.rejectionReason || 'Admin action'}</span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {log.status === 'SUCCESS' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 size={11} />Success
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                                            <XCircle size={11} />Failed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
                            <p className="text-xs text-gray-500">
                                Showing <span className="font-semibold text-gray-700">{pagination.skip + 1}</span>–<span className="font-semibold text-gray-700">{Math.min(pagination.skip + pagination.limit, pagination.total)}</span> of <span className="font-semibold text-gray-700">{pagination.total}</span> logs
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchLogs(Math.max(0, pagination.skip - pagination.limit))}
                                    disabled={pagination.skip === 0}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={13} /> Prev
                                </button>
                                <span className="text-xs text-gray-500 tabular-nums">
                                    {Math.floor(pagination.skip / pagination.limit) + 1} / {Math.max(pagination.pages, 1)}
                                </span>
                                <button
                                    onClick={() => fetchLogs(pagination.skip + pagination.limit)}
                                    disabled={pagination.skip + pagination.limit >= pagination.total}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Clear Logs Modal ──────────────────────────────────── */}
            <ClearLogsModal
                isOpen={clearModal}
                onClose={() => !clearLoading && setClearModal(false)}
                onConfirm={handleClearLogs}
                isLoading={clearLoading}
            />

            {/* ── Toast ─────────────────────────────────────────────── */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}
