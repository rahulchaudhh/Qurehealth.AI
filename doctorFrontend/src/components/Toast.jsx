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
                        {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Note'}
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
