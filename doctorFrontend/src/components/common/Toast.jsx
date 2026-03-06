import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    if (!message) return null;

    const styles = {
        success: {
            bg: 'bg-white/95',
            border: 'border-blue-100',
            text: 'text-slate-800',
            icon: (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-blue-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )
        },
        error: {
            bg: 'bg-white/95',
            border: 'border-red-100',
            text: 'text-slate-800',
            icon: (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-sm ring-1 ring-red-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            )
        },
        info: {
            bg: 'bg-white/95',
            border: 'border-slate-100',
            text: 'text-slate-800',
            icon: (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shadow-sm ring-1 ring-slate-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            )
        },
        broadcast: {
            bg: 'bg-amber-50/95',
            border: 'border-amber-200',
            text: 'text-amber-900',
            icon: (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm ring-1 ring-amber-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                </div>
            )
        },
        alert: {
            bg: 'bg-rose-50/95',
            border: 'border-rose-200',
            text: 'text-rose-900',
            icon: (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm ring-1 ring-rose-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            )
        }
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none p-4">
            <div
                className={`
                    pointer-events-auto flex items-center gap-4 px-6 py-5 
                    backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border 
                    transform transition-all duration-300 ease-out
                    ${currentStyle.bg} ${currentStyle.border}
                    ${isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0 animate-bounce-in'}
                    max-w-md w-full md:w-auto min-w-[340px]
                `}
                role="alert"
            >
                {currentStyle.icon}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base text-gray-900 mb-0.5 capitalize`}>
                        {type === 'success' ? 'Success' :
                            type === 'error' ? 'Error' :
                                type === 'broadcast' ? 'Announcement' :
                                    type === 'alert' ? 'System Alert' : 'Note'}
                    </h3>
                    <p className={`text-sm font-medium text-gray-500 leading-snug break-words`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={handleClose}
                    className={`
                        p-2 rounded-full transition-colors duration-200 text-gray-400
                        hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200
                    `}
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;
