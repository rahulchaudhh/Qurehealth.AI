import React, { useState } from 'react';
import { X, Send, AlertCircle, Radio, Users, UserCheck, Globe } from 'lucide-react';

const ActionModal = ({ isOpen, onClose, type, onAction, loading }) => {
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all');

    if (!isOpen) return null;

    const isBroadcast = type === 'broadcast';

    const handleSubmit = (e) => {
        e.preventDefault();
        onAction({ message, target });
        setMessage('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header: Soft and Airy */}
                <div className={`p-8 flex justify-between items-center ${isBroadcast ? 'bg-amber-50/40' : 'bg-rose-50/40'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isBroadcast ? 'bg-white text-amber-600 shadow-sm' : 'bg-white text-rose-600 shadow-sm'}`}>
                            {isBroadcast ? <Radio size={22} strokeWidth={2} /> : <AlertCircle size={22} strokeWidth={2} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                {isBroadcast ? 'System Broadcast' : 'Trigger Platform Alert'}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                {isBroadcast ? 'Send updates to your team and patients' : 'Emergency platform-wide alert'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/80 rounded-full transition-colors text-slate-300 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 pt-8">
                    {/* Target Selection for Broadcast: Casual & Visual */}
                    {isBroadcast && (
                        <div className="mb-8">
                            <label className="text-xs font-semibold text-slate-400 mb-4 block">Select Recipient Group</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'all', label: 'Everyone', icon: Globe },
                                    { id: 'doctors', label: 'Doctors', icon: UserCheck },
                                    { id: 'patients', label: 'Patients', icon: Users },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTarget(t.id)}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${target === t.id
                                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                                            }`}
                                    >
                                        <div className={`${target === t.id ? 'text-white' : 'text-slate-400'}`}>
                                            <t.icon size={20} strokeWidth={2} />
                                        </div>
                                        <span className="text-[11px] font-bold">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isBroadcast && (
                        <div className="mb-8 p-5 bg-rose-50/30 rounded-2xl border border-rose-100 border-dashed">
                            <div className="flex gap-3">
                                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                                    This will trigger a high-priority alert to **all users** instantly. Use only for critical updates.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Message Input: Simple & Clean */}
                    <div className="mb-10">
                        <label className="text-xs font-semibold text-slate-400 mb-4 block">What's the message?</label>
                        <textarea
                            required
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={isBroadcast ? "Share an update..." : "Emergency details..."}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-5 text-sm font-medium text-slate-900 outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-300 resize-none font-outfit"
                        />
                    </div>

                    {/* Footer Actions: Cascading Priority */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className={`flex-1 py-4 rounded-2xl text-xs font-black text-white transition-all flex items-center justify-center gap-2 shadow-xl ${isBroadcast
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                                } disabled:opacity-30 disabled:shadow-none hover:-translate-y-0.5`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isBroadcast ? 'Ship Broadcast' : 'Trigger Alert'}
                                    <Send size={16} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActionModal;
