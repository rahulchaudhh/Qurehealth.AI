import { Phone, Settings, Trash2 } from 'lucide-react';
import HighlightText from '../components/common/HighlightText';

function DoctorsDirectory({ allDoctors, handleDeleteDoctor, actionLoading, getProfileImage, handleImageError, searchQuery = '' }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit">Doctors Directory</h1>
                    <p className="text-slate-500 mt-1">Manage and monitor doctor profiles on the platform.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr className="border-b border-slate-100">
                            <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Doctor Details</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contact Information</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Specialization</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Settings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {allDoctors.map(doctor => (
                            <tr key={doctor._id} className="group hover:bg-indigo-50/20 transition-all duration-200">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm relative shrink-0">
                                            <img
                                                src={getProfileImage(doctor)}
                                                alt={doctor.name}
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                            />
                                            <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-all"></div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">
                                                <HighlightText text={doctor.name} highlight={searchQuery} />
                                            </div>
                                            <div className="text-[10px] font-medium text-slate-400 mt-0.5">ID: {doctor._id.slice(-8).toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="text-sm font-semibold text-slate-700">
                                        <HighlightText text={doctor.email} highlight={searchQuery} />
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                        <Phone size={10} /> {doctor.phone || 'Not provided'}
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg">
                                        <HighlightText text={doctor.specialization} highlight={searchQuery} />
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all
                                        ${doctor.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            doctor.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${doctor.status === 'approved' ? 'bg-emerald-500' : doctor.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                        {doctor.status.toUpperCase()}
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                                            <Settings size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDoctor(doctor._id)}
                                            disabled={actionLoading === doctor._id}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DoctorsDirectory;
