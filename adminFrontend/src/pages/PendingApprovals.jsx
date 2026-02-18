import { CheckCircle2, XCircle, Mail, Clock } from 'lucide-react';
import HighlightText from '../components/common/HighlightText';

function PendingApprovals({ pendingDoctors, handleApprove, handleReject, actionLoading, getProfileImage, handleImageError, searchQuery = '' }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Pending Approvals</h1>
                    <p className="text-slate-500 mt-1 font-medium">Review medical credentials for verification.</p>
                </div>
                <div className="bg-slate-50 text-slate-900 border border-slate-200 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest tabular-nums font-outfit">
                    {pendingDoctors.length} APPLICATIONS
                </div>
            </div>

            {pendingDoctors.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-24 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                        <CheckCircle2 size={28} className="text-slate-900" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">System Clear</h3>
                    <p className="text-slate-400 mt-1 font-medium text-sm">All applications have been processed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {pendingDoctors.map(doctor => (
                        <div key={doctor._id} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex gap-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-1 ring-slate-100 shrink-0 relative">
                                <img
                                    src={getProfileImage(doctor)}
                                    alt={doctor.name}
                                    className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0"
                                    onError={handleImageError}
                                />
                                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors"></div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                                                <HighlightText text={doctor.name} highlight={searchQuery} />
                                            </h3>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-widest inline-block mt-2 border border-indigo-100/50">
                                                <HighlightText text={doctor.specialization} highlight={searchQuery} />
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(doctor._id)}
                                                disabled={actionLoading === doctor._id}
                                                className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-black/5"
                                                title="Approve"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleReject(doctor._id)}
                                                disabled={actionLoading === doctor._id}
                                                className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={12} className="text-slate-300" />
                                            <span className="text-slate-600 font-bold text-[10px] truncate max-w-[120px]">
                                                {doctor.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-slate-300" />
                                            <span className="text-slate-600 font-bold text-[10px]">
                                                {doctor.experience}Y EXPERIENCE
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-300 tabular-nums uppercase tracking-widest">
                                        SUBMITTED {new Date(doctor.createdAt).toLocaleDateString()}
                                    </span>
                                    <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
                                        Details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PendingApprovals;
