import { useState, useEffect, useCallback } from 'react';
import { 
    Radio, Bell, Trash2, Clock, Users, Search, AlertCircle, X, Loader2, MessageSquare, Zap, ArrowRight 
} from 'lucide-react';
import axios from '../api/axios';
import ActionModal from '../components/common/ActionModal';

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

// ─── Type Badge ───────────────────────────────────────────────────────────
function TypeBadge({ type }) {
    if (type === 'alert') {
        return (
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-700 bg-rose-100 border border-rose-200">
                    <Zap size={12} strokeWidth={2.5} />Alert
                </span>
            </div>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-100 border border-indigo-200">
            <Radio size={12} strokeWidth={2.5} />Broadcast
        </span>
    );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                    <div className="h-5 bg-gray-100 rounded-lg w-64 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <div className="h-3.5 bg-gray-100 rounded-lg w-32 animate-pulse"></div>
                <div className="h-3.5 bg-gray-100 rounded-lg w-32 animate-pulse"></div>
            </div>
        </div>
    );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isLoading, messagePreview }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                        <AlertCircle size={24} className="text-rose-600" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Stop Communication?</h2>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        This will immediately remove this communication. This action cannot be undone.
                    </p>
                    {messagePreview && (
                        <div className="mb-5 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Message Preview</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{messagePreview}</p>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50">
                            Cancel
                        </button>
                        <button onClick={onConfirm} disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95">
                            {isLoading ? <><Loader2 size={14} className="animate-spin" />Stopping</> : 'Stop'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Communications() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [modal, setModal] = useState({ isOpen: false, type: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, message: null });
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchHistory = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const response = await axios.get('/admin/broadcast-history');
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching broadcast history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleAction = async ({ message, target }) => {
        setIsActionLoading(true);
        try {
            const endpoint = modal.type === 'broadcast' ? '/admin/broadcast' : '/admin/trigger-alert';
            await axios.post(endpoint, { message, target });
            setModal({ isOpen: false, type: null });
            showToast(`${modal.type === 'broadcast' ? 'Broadcast' : 'Alert'} sent successfully!`);
            fetchHistory();
        } catch (error) {
            console.error(`Error sending ${modal.type}:`, error);
            showToast(`Failed to send ${modal.type}. ${error.response?.data?.error || 'Please try again.'}`, true);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteClick = (item) => {
        setDeleteModal({ isOpen: true, id: item._id, message: item.message });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        setIsActionLoading(true);
        try {
            const response = await axios.delete(`/admin/broadcast/${deleteModal.id}`);
            if (response.data.success) {
                setHistory(history.filter(item => item._id !== deleteModal.id));
                showToast('Communication stopped successfully');
            }
        } catch (error) {
            console.error('Error stopping broadcast:', error);
            showToast('Failed to stop communication. Please try again.', true);
        } finally {
            setIsActionLoading(false);
            setDeleteModal({ isOpen: false, id: null, message: null });
        }
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const counts = {
        all: history.length,
        broadcast: history.filter(i => i.type === 'broadcast').length,
        alert: history.filter(i => i.type === 'alert').length
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${toast.isError ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white border border-rose-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border border-emerald-500'}`}>
                    {toast.isError ? '⚠️' : '✨'} {toast.msg}
                </div>
            )}

            {/* Header Section */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Communications</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage platform-wide broadcasts and critical alerts to engage your users.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setModal({ isOpen: true, type: 'broadcast' })}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <Radio size={13} />
                        New Broadcast
                    </button>
                    <button
                        onClick={() => setModal({ isOpen: true, type: 'alert' })}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <Zap size={13} />
                        Send Alert
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search messages…"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
                    {['all', 'broadcast', 'alert'].map(type => (
                        <button key={type} onClick={() => setTypeFilter(type)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize ${
                                typeFilter === type
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            {type === 'all' ? 'All' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Communications Grid */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <MessageSquare size={32} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                    <div className="text-center max-w-sm">
                        <p className="text-xl font-bold text-gray-900 mb-1">No communications yet</p>
                        <p className="text-sm text-gray-600 mb-4">
                            {searchTerm ? `No results for "${searchTerm}"` : 'Create your first broadcast or alert to engage your users'}
                        </p>
                    </div>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredHistory.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                            {/* Gradient accent */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -mr-16 -mt-16 ${item.type === 'alert' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <TypeBadge type={item.type} />
                                <button onClick={() => handleDeleteClick(item)}
                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 size={18} strokeWidth={1.5} />
                                </button>
                            </div>

                            {/* Message */}
                            <h3 className="text-base font-bold text-gray-900 mb-4 line-clamp-2 leading-snug relative z-10">
                                {item.message}
                            </h3>

                            {/* Metadata */}
                            <div className="space-y-3 pt-4 border-t border-gray-200 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                                        <Users size={16} className="text-blue-600" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Recipients</p>
                                        <p className="text-sm font-bold text-gray-900">{item.recipientCount ?? 0} {item.recipientCount === 1 ? 'user' : 'users'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                        <Clock size={16} className="text-gray-600" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Sent</p>
                                        <p className="text-sm font-bold text-gray-900">{formatTimeAgo(item.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            {!loading && filteredHistory.length > 0 && (
                <div className="text-xs text-gray-500 text-center py-4">
                    Showing <span className="font-bold text-gray-900">{filteredHistory.length}</span> of{' '}
                    <span className="font-bold text-gray-900">{history.length}</span> communications
                </div>
            )}

            {/* Modals */}
            <ActionModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, type: null })}
                type={modal.type}
                onAction={handleAction}
                loading={isActionLoading}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, message: null })}
                onConfirm={handleDeleteConfirm}
                isLoading={isActionLoading}
                messagePreview={deleteModal.message}
            />
        </div>
    );
}
