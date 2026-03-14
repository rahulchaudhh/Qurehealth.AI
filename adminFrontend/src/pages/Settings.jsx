import { useState, useEffect, useCallback } from 'react';
import {
    Database, Loader2, RefreshCw, CheckCircle2, XCircle, ChevronLeft,
    ChevronRight, X
} from 'lucide-react';
import axios from '../api/axios';

const formatActionLabel = (action = '') =>
    action
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

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

    // ── Activity Logs ─────────────────────────────────────────────────────────
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsFilter, setLogsFilter] = useState({ action: '', targetType: '', startDate: '', endDate: '' });
    const [pagination, setPagination] = useState({ total: 0, limit: 20, skip: 0, pages: 0 });

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
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logsFilter, pagination.limit]);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchLogs(0); }, [logsFilter]); // eslint-disable-line

    // ── Filter helpers ────────────────────────────────────────────────────────
    const handleFilterChange = (key, value) => setLogsFilter(prev => ({ ...prev, [key]: value }));
    const clearFilters = () => setLogsFilter({ action: '', targetType: '', startDate: '', endDate: '' });
    const hasFilters = Object.values(logsFilter).some(Boolean);

    return (
        <div className="space-y-6 pb-10">

            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Activity Logs</h1>
                    <p className="text-xs text-gray-500 mt-1">Configure platform-wide parameters and manage system security.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        onChange={async (e) => {
                            const days = e.target.value;
                            if (!days) return;
                            if (!window.confirm(`Clear logs older than ${days} day(s)?`)) {
                                e.target.value = "";
                                return;
                            }
                            try {
                                const { data } = await axios.delete(`/admin/logs/clear-old?days=${days}`);
                                showToast(data.message || 'Logs cleared successfully');
                                fetchStats();
                                fetchLogs(0);
                            } catch (err) {
                                showToast('Failed to clear logs', 'error');
                            }
                            e.target.value = "";
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer focus:outline-none"
                    >
                        <option value="">Clear History</option>
                        <option value="1">Older than 1 Day</option>
                        <option value="7">Older than 7 Days</option>
                        <option value="30">Older than 30 Days</option>
                    </select>
                    <button onClick={() => { fetchStats(); fetchLogs(0); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw size={13} />
                        Refresh
                    </button>
                </div>
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

            {/* ── Activity Logs ─────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Activity Logs</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {pagination.total > 0 ? `${pagination.total} total entries` : 'All administrative actions and system events'}
                        </p>
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
                            <option value="PATIENT_DELETED">Patient Deleted</option>
                            <option value="APPOINTMENT_STATUS_UPDATED">Appointment Status Updated</option>
                            <option value="BROADCAST_SENT">Broadcast Sent</option>
                            <option value="ALERT_TRIGGERED">Alert Triggered</option>
                            <option value="BROADCAST_STOPPED">Broadcast Stopped</option>
                            <option value="SETTINGS_CHANGED">Settings Changed</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGIN_FAILURE">Login Failure</option>
                            <option value="PROFILE_UPDATED">Profile Updated</option>
                            <option value="PATIENT_REGISTERED">Patient Registered</option>
                            <option value="VERIFICATION_CRITERIA_UPDATED">Verification Criteria Updated</option>
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
                                        return (
                                            <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                                                    <div className="font-medium text-gray-700">{new Date(log.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                    <div className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center text-xs font-semibold text-gray-700">
                                                        {formatActionLabel(log.action)}
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
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                            <CheckCircle2 size={11} />Success
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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

            {/* ── Toast ─────────────────────────────────────────────── */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}
