import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (isOpen) setIsExiting(false);
    }, [isOpen]);

    if (!isOpen && !isExiting) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        setIsExiting(true);
        setTimeout(onClose, 200); // Wait for animation
    };

    const styles = {
        danger: {
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            buttonBg: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
            icon: <Trash2 className="w-6 h-6" />,
        },
        warning: {
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            buttonBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
            icon: <AlertTriangle className="w-6 h-6" />,
        }
    };

    const currentStyle = styles[type] || styles.danger;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className={`
                    absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200
                    ${isExiting ? 'opacity-0' : 'opacity-100'}
                `}
                onClick={handleCancel}
            />

            {/* Modal Card */}
            <div className={`
                relative w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden
                transition-all duration-200 ease-out transform
                ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}>
                <div className="p-6">
                    <div className="flex gap-4 items-start">
                        {/* Icon */}
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center shrink-0
                            ${currentStyle.iconBg} ${currentStyle.iconColor}
                        `}>
                            {currentStyle.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h2 className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                                    {title}
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className="text-gray-400 hover:text-gray-600 transition-colors -mr-2 -mt-2 p-1.5 rounded-full hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-[15px] text-gray-500 mt-2 leading-relaxed">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${currentStyle.buttonBg}
                                    `}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
