import React from 'react';
import { Bell, Check, Clock, X } from 'lucide-react';

const NotificationDropdown = ({ notifications, onMarkRead, onClose }) => {
    if (!notifications) return null;

    return (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                        <Bell size={24} className="mb-2 opacity-20" />
                        <p className="text-xs font-medium">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((note) => (
                            <div
                                key={note._id}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${!note.isRead ? 'bg-blue-50/30' : ''}`}
                                onClick={() => onMarkRead(note._id)}
                            >
                                <div className="flex gap-3 items-start">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!note.isRead ? 'bg-blue-500' : 'bg-gray-200'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!note.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                            {note.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Clock size={10} className="text-gray-400" />
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    {!note.isRead && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="text-blue-600 p-1 hover:bg-blue-50 rounded"
                                                title="Mark as read"
                                            >
                                                <Check size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                    <button
                        onClick={() => notifications.forEach(n => !n.isRead && onMarkRead(n._id))}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 py-1 px-4 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
