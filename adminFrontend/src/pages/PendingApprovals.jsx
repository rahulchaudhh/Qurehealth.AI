import { CheckCircle2, XCircle, Mail, Clock, ShieldCheck, Stethoscope, User } from 'lucide-react';
import HighlightText from '../components/common/HighlightText';

function PendingApprovals({ pendingDoctors, handleApprove, handleReject, actionLoading, getProfileImage, handleImageError, searchQuery = '' }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit mb-1">Pending Approvals</h1>
                    <p className="text-slate-500 text-sm">Review and verify doctor credentials before granting platform access.</p>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-xs font-black tracking-widest tabular-nums">
                    {pendingDoctors.length} PENDING
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-amber-500" />
                        Applications Queue
                    </h3>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {pendingDoctors.length === 0 ? 'All Clear' : `${pendingDoctors.length} awaiting review`}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pendingDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                                <CheckCircle2 size={24} className="text-emerald-500" />
                                            </div>
                                            <p className="text-slate-400 font-semibold text-sm">All applications have been processed</p>
                                            <p className="text-slate-300 text-xs">No pending approvals at this time</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pendingDoctors.map(doctor => (
                                    <tr key={doctor._id} className="hover:bg-slate-50/50 transition-colors group">
                                        {/* Doctor */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-slate-100 shrink-0 bg-slate-100">
                                                    <img
                                                        src={getProfileImage(doctor)}
                                                        alt={doctor.name}
                                                        className="w-full h-full object-cover"
                                                        onError={handleImageError}
                                                    />
                                                    <div className="absolute inset-0 items-center justify-center bg-indigo-50 text-indigo-400 hidden">
                                                        <User size={16} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        <HighlightText text={`Dr. ${doctor.name}`} highlight={searchQuery} />
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        <HighlightText text={doctor.email} highlight={searchQuery} />
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Specialization */}
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                <Stethoscope size={10} strokeWidth={3} />
                                                <HighlightText text={doctor.specialization || '—'} highlight={searchQuery} />
                                            </div>
                                        </td>

                                        {/* Experience */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock size={13} className="text-slate-300" />
                                                <span className="text-sm font-semibold">{doctor.experience || '—'} yrs</span>
                                            </div>
                                        </td>

                                        {/* Submitted */}
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-medium text-slate-400">
                                                {new Date(doctor.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(doctor._id)}
                                                    disabled={actionLoading === doctor._id}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {actionLoading === doctor._id
                                                        ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                        : <CheckCircle2 size={13} strokeWidth={3} />
                                                    }
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(doctor._id)}
                                                    disabled={actionLoading === doctor._id}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-lg hover:shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <XCircle size={13} strokeWidth={3} />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PendingApprovals;
