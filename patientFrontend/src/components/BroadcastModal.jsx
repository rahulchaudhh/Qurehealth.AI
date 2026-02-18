import React, { useState, useEffect } from 'react';
import { X, Bell, Megaphone } from 'lucide-react';

const BroadcastModal = ({ isOpen, onClose, message, type = 'broadcast' }) => {
    const [canClose, setCanClose] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (isOpen) {
            setCanClose(false);
            setCountdown(5);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanClose(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const styles = {
        broadcast: {
            text: 'text-amber-900',
            bg: 'bg-amber-50/50',
            icon: <Megaphone className="w-8 h-8 text-amber-600" />,
            title: 'Announcement',
            button: 'bg-indigo-600 hover:bg-indigo-700',
            accent: 'bg-amber-100'
        },
        alert: {
            text: 'text-rose-900',
            bg: 'bg-rose-50/50',
            icon: <Bell className="w-8 h-8 text-rose-600" />,
            title: 'System Alert',
            button: 'bg-rose-600 hover:bg-rose-700',
            accent: 'bg-rose-100'
        }
    };

    const currentStyle = styles[type] || styles.broadcast;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 text-slate-900">
            {/* Backdrop with a more organic blur */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-700"
                onClick={() => canClose && onClose()}
            />

            {/* Modal Container: More "Paper" like feel */}
            <div className={`
                relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]
                animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out
            `}>
                {/* Subtle top decoration instead of a harsh bar */}
                <div className={`h-1.5 w-full ${currentStyle.bg}`} />

                <div className="px-10 pt-14 pb-12 flex flex-col items-center">
                    {/* Integrated Icon treatment */}
                    <div className={`
                        w-16 h-16 rounded-3xl flex items-center justify-center mb-8
                        ${currentStyle.bg} border border-white/50 rotate-3
                    `}>
                        {currentStyle.icon}
                    </div>

                    {/* Content: Focused on readability and "air" */}
                    <div className="space-y-2 mb-10 text-center">
                        <span className="text-xs font-medium text-slate-400">
                            Platform Update
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {currentStyle.title}
                        </h2>
                        <p className="text-base text-slate-600 font-medium leading-relaxed px-2">
                            {message}
                        </p>
                    </div>

                    {/* Action: Refined, solid button */}
                    <div className="w-full space-y-4">
                        <button
                            onClick={onClose}
                            disabled={!canClose}
                            className={`
                                relative w-full py-4 rounded-2xl font-bold text-white text-sm tracking-wide
                                transition-all duration-300 transform active:scale-[0.98]
                                ${currentStyle.button} shadow-lg shadow-indigo-100
                                ${!canClose ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:shadow-indigo-200'}
                            `}
                        >
                            {canClose ? 'Got it' : `Read completely (${countdown}s)`}
                        </button>

                        {!canClose && (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-200 animate-bounce" />
                                <div className="w-1 h-1 rounded-full bg-slate-200 animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1 h-1 rounded-full bg-slate-200 animate-bounce [animation-delay:0.4s]" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastModal;
