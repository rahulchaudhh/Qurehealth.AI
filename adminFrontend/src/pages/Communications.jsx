import { useState, useEffect } from 'react';
import { History, Radio, Bell, Trash2, Clock, Users, ArrowUpRight, Search, Filter } from 'lucide-react';
import axios from '../api/axios';

const formatTimeAgo = (date) => {
    if (!date) return 'Some time ago';
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString();
};

export default function Communications() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/admin/broadcast-history');
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching broadcast history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async (batchId) => {
        console.log('Attempting to stop pulse with batchId:', batchId);
        if (!window.confirm('Are you sure you want to stop this communication? It will be removed from all users\' dashboards instantly.')) return;

        try {
            const response = await axios.delete(`/admin/broadcast/${batchId}`);
            console.log('Stop response:', response.data);
            if (response.data.success) {
                setHistory(history.filter(item => item._id !== batchId));
            }
        } catch (error) {
            console.error('Error stopping broadcast:', error.response?.data || error.message);
            alert('Failed to stop communication. Please try again.');
        }
    };

    const filteredHistory = history.filter(item =>
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit mb-1">Communication Management</h1>
                    <p className="text-slate-500 text-sm">Monitor and control your platform-wide broadcasts and alerts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search pulses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History size={18} className="text-indigo-600" />
                        Recent Pulses
                    </h3>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {loading ? 'Refreshing...' : `${filteredHistory.length} active messages`}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Pulse</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                <Radio size={24} />
                                            </div>
                                            <p className="text-slate-400 font-medium">No active communications found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredHistory.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="max-w-md">
                                            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.message}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">ID: {item._id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${item.type === 'alert'
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                            : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                            }`}>
                                            {item.type === 'alert' ? <Bell size={10} strokeWidth={3} /> : <Radio size={10} strokeWidth={3} />}
                                            {item.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                        {i}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{item.recipientCount} Recipients</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} />
                                            <span className="text-xs font-medium">{formatTimeAgo(item.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button
                                            onClick={() => handleStop(item._id)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-lg hover:shadow-rose-100 transition-all active:scale-95 group"
                                        >
                                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                            Stop Pulse
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
