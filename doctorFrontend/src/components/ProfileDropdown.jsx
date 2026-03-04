import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Calendar, Activity, Mail, Phone, ChevronRight } from 'lucide-react';

function ProfileDropdown({ user, onLogout, onEditProfile }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const profilePicSrc = () => {
        if (!user?.profilePicture) return null;
        return user.profilePicture.startsWith('data:') || user.profilePicture.startsWith('http')
            ? user.profilePicture : `http://localhost:5001/${user.profilePicture}`;
    };

    const avatarUrl = profilePicSrc()
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=6366f1&color=fff&size=128`;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
            >
                <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 shadow-sm flex-shrink-0"
                />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-900 leading-none">Dr. {user?.name?.replace(/^Dr\.?\s*/i, '')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Doctor</p>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

                    {/* Header: Avatar + Name */}
                    <div className="flex items-center gap-4 p-5 pb-4">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-base font-bold text-gray-900 truncate">Dr. {user?.name?.replace(/^Dr\.?\s*/i, '')}</p>
                            <p className="text-sm text-gray-500 truncate">@{(user?.name || 'doctor').replace(/\s+/g, '')}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Contact Info */}
                    <div className="px-5 py-4 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Mail size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{user?.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone size={16} className="text-gray-400 flex-shrink-0" />
                            <span>{user?.phone || 'Not set'}</span>
                        </div>
                        {user?.specialization && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Activity size={16} className="text-gray-400 flex-shrink-0" />
                                <span>{user.specialization}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Menu Items */}
                    <div className="px-3 py-3 space-y-1">
                        <button
                            onClick={() => { setIsOpen(false); onEditProfile(); }}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                            <User size={18} className="text-blue-500" />
                            My Profile
                        </button>
                        <button
                            onClick={() => { setIsOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                            <Calendar size={18} className="text-blue-500" />
                            My Appointments
                        </button>
                        <button
                            onClick={() => { setIsOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                            <Activity size={18} className="text-blue-500" />
                            My Activities
                        </button>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Logout */}
                    <div className="px-3 py-3">
                        <button
                            onClick={() => { setIsOpen(false); onLogout(); }}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                            <ChevronRight size={18} className="text-red-400" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileDropdown;
