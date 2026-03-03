import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

function Settings() {
    const [logsLoading, setLogsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState([]);
    const [logsFilter, setLogsFilter] = useState({
        action: '',
        targetType: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        skip: 0,
        pages: 0
    });

    // Fetch System Logs
    const fetchLogs = async (skip = 0) => {
        try {
            setLogsLoading(true);
            const params = new URLSearchParams({
                limit: pagination.limit,
                skip: skip,
                ...(logsFilter.action && { action: logsFilter.action }),
                ...(logsFilter.targetType && { targetType: logsFilter.targetType }),
                ...(logsFilter.startDate && { startDate: logsFilter.startDate }),
                ...(logsFilter.endDate && { endDate: logsFilter.endDate })
            });

            const response = await axios.get(`/api/admin/logs/activity?${params}`);
            console.log('✅ Logs fetched:', response.data);
            setLogs(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('❌ Error fetching logs:', error);
            setMessage('Failed to load activity logs');
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(0);
    }, []);

    useEffect(() => {
        fetchLogs(0);
    }, [logsFilter]);

    const handleFilterChange = (key, value) => {
        setLogsFilter({ ...logsFilter, [key]: value });
    };

    const clearFilters = () => {
        setLogsFilter({
            action: '',
            targetType: '',
            startDate: '',
            endDate: ''
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-slate-900 font-outfit">Admin Settings</h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Configure platform-wide parameters and security.</p>
            </div>

            {message && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">{message}</span>
                </div>
            )}

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Database size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">System Logs</h2>
                        <p className="text-slate-600 text-sm">View comprehensive logs of all administrative actions and system events.</p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={logsFilter.action}
                        onChange={(e) => handleFilterChange('action', e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
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
                        onChange={(e) => handleFilterChange('targetType', e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="DOCTOR">Doctor</option>
                        <option value="PATIENT">Patient</option>
                        <option value="SYSTEM">System</option>
                    </select>

                    <input
                        type="date"
                        value={logsFilter.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    />

                    <input
                        type="date"
                        value={logsFilter.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                </div>

                <button
                    onClick={clearFilters}
                    className="mb-6 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Clear Filters
                </button>

                {logsLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                ) : logs.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Time</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Action</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Target</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Details</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log._id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600 text-xs">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium whitespace-nowrap">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-slate-900 font-medium">{log.targetName || log.targetType}</div>
                                                <div className="text-xs text-slate-500">{log.targetEmail}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">
                                                {log.details?.rejectionReason || 'Admin action'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    log.status === 'SUCCESS'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination.pages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} logs
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchLogs(Math.max(0, pagination.skip - pagination.limit))}
                                        disabled={pagination.skip === 0}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => fetchLogs(pagination.skip + pagination.limit)}
                                        disabled={pagination.skip + pagination.limit >= pagination.total}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        No activity logs found
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;
