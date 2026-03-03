import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, AlertCircle, Save, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

function Settings() {
    const [activeTab, setActiveTab] = useState('security');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Security Rules State
    const [criteria, setCriteria] = useState({
        minExperienceYears: 0,
        requiredSpecializations: [],
        requireLicenseVerification: false,
        requireEducationProof: true,
        autoApproveIfCriteriaMet: false,
        maxPendingDoctors: 100
    });

    // System Logs State
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
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

    // Fetch Verification Criteria
    const fetchVerificationCriteria = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/settings/verification-criteria');
            console.log('✅ Criteria fetched:', response.data);
            setCriteria(response.data.data);
        } catch (error) {
            console.error('❌ Error fetching criteria:', error);
            setMessage('Failed to load verification criteria');
        } finally {
            setLoading(false);
        }
    };

    // Save Verification Criteria
    const saveVerificationCriteria = async () => {
        try {
            setSaving(true);
            const response = await axios.put('/api/admin/settings/verification-criteria', criteria);
            console.log('✅ Criteria saved:', response.data);
            setMessage('✅ Verification criteria saved successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('❌ Error saving criteria:', error);
            setMessage('❌ Failed to save verification criteria: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

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
            setMessage('Failed to load activity logs: ' + (error.response?.data?.error || error.message));
        } finally {
            setLogsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        console.log('📍 Settings component mounted');
        fetchVerificationCriteria();
    }, []);

    // Load logs when tab changes
    useEffect(() => {
        if (activeTab === 'logs') {
            console.log('📍 Loading logs tab');
            fetchLogs(0);
        }
    }, [activeTab]);

    // Reload logs when filters change
    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs(0);
        }
    }, [logsFilter]);

    // Handle specialization input
    const handleAddSpecialization = (spec) => {
        if (spec && !criteria.requiredSpecializations.includes(spec)) {
            setCriteria({
                ...criteria,
                requiredSpecializations: [...criteria.requiredSpecializations, spec]
            });
        }
    };

    const handleRemoveSpecialization = (spec) => {
        setCriteria({
            ...criteria,
            requiredSpecializations: criteria.requiredSpecializations.filter(s => s !== spec)
        });
    };

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

            {/* Message Alert */}
            {message && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">{message}</span>
                </div>
            )}

            {/* Tab Buttons */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'security'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-slate-900 border border-slate-100 hover:border-indigo-200'
                    }`}
                >
                    <ShieldCheck size={20} />
                    Security Rules
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'logs'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-white text-slate-900 border border-slate-100 hover:border-emerald-200'
                    }`}
                >
                    <Database size={20} />
                    System Logs
                </button>
            </div>

            {/* Security Rules Tab */}
            {activeTab === 'security' && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Doctor Verification Criteria</h2>
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Minimum Experience */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Minimum Experience (years)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={criteria.minExperienceYears}
                                    onChange={(e) => setCriteria({ ...criteria, minExperienceYears: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <p className="text-xs text-slate-500 mt-1">Doctors with less experience will not be approved</p>
                            </div>

                            {/* Required Specializations */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Required Specializations
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <select
                                        id="specSelect"
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select specialization...</option>
                                        <option>Cardiology</option>
                                        <option>Dermatology</option>
                                        <option>Orthopedics</option>
                                        <option>Neurology</option>
                                        <option>Ophthalmology</option>
                                        <option>ENT</option>
                                        <option>General Practice</option>
                                        <option>Pediatrics</option>
                                    </select>
                                    <button
                                        onClick={() => {
                                            const select = document.getElementById('specSelect');
                                            handleAddSpecialization(select.value);
                                            select.value = '';
                                        }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {criteria.requiredSpecializations.map((spec) => (
                                        <span
                                            key={spec}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {spec}
                                            <button
                                                onClick={() => handleRemoveSpecialization(spec)}
                                                className="text-indigo-600 hover:text-indigo-800 font-bold"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* License Verification */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="license"
                                    checked={criteria.requireLicenseVerification}
                                    onChange={(e) => setCriteria({ ...criteria, requireLicenseVerification: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <label htmlFor="license" className="font-medium text-slate-900">
                                    Require License Verification
                                </label>
                            </div>

                            {/* Education Proof */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="education"
                                    checked={criteria.requireEducationProof}
                                    onChange={(e) => setCriteria({ ...criteria, requireEducationProof: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <label htmlFor="education" className="font-medium text-slate-900">
                                    Require Education Proof (Certificate/Degree)
                                </label>
                            </div>

                            {/* Auto Approve */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="autoApprove"
                                    checked={criteria.autoApproveIfCriteriaMet}
                                    onChange={(e) => setCriteria({ ...criteria, autoApproveIfCriteriaMet: e.target.checked })}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                />
                                <label htmlFor="autoApprove" className="font-medium text-slate-900">
                                    Auto-Approve Doctors if All Criteria Met
                                </label>
                            </div>

                            {/* Max Pending Doctors */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Maximum Pending Doctor Applications
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={criteria.maxPendingDoctors}
                                    onChange={(e) => setCriteria({ ...criteria, maxPendingDoctors: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={saveVerificationCriteria}
                                disabled={saving}
                                className="mt-8 w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* System Logs Tab */}
            {activeTab === 'logs' && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Activity Logs</h2>

                    {/* Filters */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            value={logsFilter.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
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
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
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
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />

                        <input
                            type="date"
                            value={logsFilter.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    <button
                        onClick={clearFilters}
                        className="mb-6 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Clear Filters
                    </button>

                    {/* Logs Table */}
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
                                                <td className="px-4 py-3 text-slate-600">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
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

                            {/* Pagination */}
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
            )}
        </div>
    );
}

export default Settings;
