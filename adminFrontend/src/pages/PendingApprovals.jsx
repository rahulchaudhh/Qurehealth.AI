import { CheckCircle2, XCircle, Mail, Clock, ShieldCheck, Stethoscope, User, Check, X, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';
import HighlightText from '../components/common/HighlightText';

// ─── Status Badge Component ───────────────────────────────────────────────────

function StatusBadge({ status }) {
    const statusConfig = {
        pending: { 
            label: 'Pending', 
            text: 'text-gray-600', 
            bg: 'bg-gray-100'
        },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}

// ─── Action Buttons with Dropdown ────────────────────────────────────────────

function ApprovalActions({ doctor, onApprove, onReject, actionLoading }) {
    const isLoading = actionLoading === doctor._id;

    return (
        <div className="flex items-center justify-end gap-3">
            {/* Approve Button - Blue Indigo Style */}
            <button
                onClick={() => onApprove(doctor._id)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <><span className="inline-block animate-spin text-xs">⟳</span> Approving...</>
                ) : (
                    <>Approve</>
                )}
            </button>

            {/* Reject Button - Blue Indigo Style */}
            <button
                onClick={() => onReject(doctor._id)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <><span className="inline-block animate-spin text-xs">⟳</span> Rejecting...</>
                ) : (
                    <>Reject</>
                )}
            </button>
        </div>
    );
}

// ─── Doctor Detail Modal ─────────────────────────────────────────────────────

function DoctorDetailModal({ doctor, onClose, getProfileImage, handleImageError }) {
    if (!doctor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div
                className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-xl overflow-hidden max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 px-6 py-4 border-b border-gray-200 bg-white flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
                        <p className="text-xs text-gray-500 mt-1">Review complete doctor profile</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Profile Section */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-20 h-20 flex-shrink-0 relative">
                            <img
                                src={getProfileImage(doctor)}
                                onError={handleImageError}
                                alt={doctor.name}
                                className="w-full h-full rounded-lg object-cover border border-gray-200"
                            />
                            <div className="hidden w-full h-full rounded-lg bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-700 font-bold items-center justify-center text-2xl border border-indigo-200 uppercase">
                                {doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">{doctor.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{doctor.email}</p>
                            <p className="text-sm text-gray-600">{doctor.phone || 'No phone provided'}</p>
                            <StatusBadge status="pending" />
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Professional Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border border-gray-200 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Specialization</p>
                                <p className="text-sm font-medium text-gray-900">{doctor.specialization || '—'}</p>
                            </div>
                            <div className="p-3 border border-gray-200 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Experience</p>
                                <p className="text-sm font-medium text-gray-900">{doctor.experience || '—'} years</p>
                            </div>
                        </div>
                    </div>

                    {/* Application Date */}
                    <div className="p-3 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                            <Calendar size={12} />
                            Application Date
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                            {new Date(doctor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button onClick={onClose} className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function PendingApprovals({ pendingDoctors, handleApprove, handleReject, actionLoading, getProfileImage, handleImageError, searchQuery = '' }) {
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    return (
        <>
        {selectedDoctor && (
            <DoctorDetailModal
                doctor={selectedDoctor}
                onClose={() => setSelectedDoctor(null)}
                getProfileImage={getProfileImage}
                handleImageError={handleImageError}
            />
        )}

        <div className="space-y-4">
            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Pending Approvals</h1>
                    <p className="text-xs text-gray-500 mt-1">Review and approve doctor applications.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{pendingDoctors.length}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                    </div>
                </div>
            </div>

            {/* ── Empty State ──────────────────────────────────────────────── */}
            {pendingDoctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                        <CheckCircle2 size={28} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">All applications approved</p>
                    <p className="text-xs text-gray-500">No pending doctor approvals at this time.</p>
                </div>
            ) : (
                <>
                    {/* ── Table ────────────────────────────────────────────────── */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Experience</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingDoctors.map(doctor => (
                                    <tr key={doctor._id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedDoctor(doctor)}>
                                        {/* Doctor */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 flex-shrink-0 relative">
                                                <img
                                                    src={getProfileImage(doctor)}
                                                    onError={handleImageError}
                                                    alt={doctor.name}
                                                    className="w-full h-full rounded-lg object-cover border border-gray-200"
                                                />
                                                <div className="hidden w-full h-full rounded-lg bg-indigo-50 text-indigo-700 font-bold items-center justify-center text-[11px] border border-indigo-200 uppercase">
                                                    {doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
                                                </div>
                                            </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        <HighlightText text={doctor.name} highlight={searchQuery} />
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        <HighlightText text={doctor.email} highlight={searchQuery} />
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Specialization */}
                                        <td className="px-6 py-3">
                                            <p className="text-sm text-gray-700">
                                                <HighlightText text={doctor.specialization || '—'} highlight={searchQuery} />
                                            </p>
                                        </td>

                                        {/* Experience */}
                                        <td className="px-6 py-3">
                                            <p className="text-sm text-gray-700">{doctor.experience || '—'} years</p>
                                        </td>

                                        {/* Applied */}
                                        <td className="px-6 py-3">
                                            <p className="text-sm text-gray-600">
                                                {new Date(doctor.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </p>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <ApprovalActions
                                                doctor={doctor}
                                                onApprove={handleApprove}
                                                onReject={handleReject}
                                                actionLoading={actionLoading}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Footer ───────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <div>
                            Showing {pendingDoctors.length} pending {pendingDoctors.length === 1 ? 'application' : 'applications'}
                        </div>
                    </div>
                </>
            )}
        </div>
        </>
    );
}

export default PendingApprovals;
