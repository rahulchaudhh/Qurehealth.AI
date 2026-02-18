import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MoreHorizontal, UserCheck, Clock, Users, ArrowUpRight } from 'lucide-react';
import HighlightText from '../common/HighlightText';

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

function Header({
    sidebarOpen, setSidebarOpen, showNotifications, setShowNotifications,
    hasUnreadNotifications, setHasUnreadNotifications,
    user, searchQuery, setSearchQuery, doctors = [], patients = []
}) {
    const navigate = useNavigate();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const notifications = useMemo(() => {
        const docNotifications = doctors.slice(0, 5).map(doc => ({
            id: doc._id,
            type: 'doctor',
            title: 'New Doctor Registered',
            message: `Dr. ${doc.name} has joined the platform.`,
            time: formatTimeAgo(doc.createdAt),
            timestamp: new Date(doc.createdAt).getTime(),
            icon: UserCheck,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        }));

        const patientNotifications = patients.slice(0, 5).map(p => ({
            id: p._id,
            type: 'patient',
            title: 'New Patient Registered',
            message: `${p.name} has created a new account.`,
            time: formatTimeAgo(p.createdAt),
            timestamp: new Date(p.createdAt).getTime(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        }));

        return [...docNotifications, ...patientNotifications]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
    }, [doctors, patients]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter suggestions based on query
    const suggestions = searchQuery.trim().length > 0 ? {
        doctors: doctors.filter(doc =>
            doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3),
        patients: patients.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3)
    } : { doctors: [], patients: [] };

    const totalSuggestions = suggestions.doctors.length + suggestions.patients.length;

    return (
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-40 relative">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <MoreHorizontal size={20} />
                </button>
                <div ref={searchRef} className="relative group">
                    <div className={`hidden md:flex items-center gap-2 bg-slate-50 border px-4 py-2 rounded-xl focus-within:ring-2 ring-indigo-500/20 transition-all w-96 ${showSuggestions && totalSuggestions > 0 ? 'border-indigo-200 shadow-lg' : 'border-slate-200'}`}>
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search analytics, doctors, or patients..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700 font-medium"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                    </div>

                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && totalSuggestions > 0 && (
                        <div className="absolute top-full left-0 mt-3 w-full bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            {suggestions.doctors.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <UserCheck size={12} className="text-indigo-400" /> Doctors
                                    </div>
                                    <div className="space-y-0.5">
                                        {suggestions.doctors.map(doc => (
                                            <button
                                                key={doc._id}
                                                onClick={() => {
                                                    setSearchQuery(doc.name);
                                                    setShowSuggestions(false);
                                                    navigate('/dashboard/doctors');
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-xl transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        {doc.name.charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs font-bold text-slate-800">
                                                            <HighlightText text={doc.name} highlight={searchQuery} />
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-medium">
                                                            <HighlightText text={doc.specialization} highlight={searchQuery} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {suggestions.patients.length > 0 && (
                                <div>
                                    <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} className="text-emerald-400" /> Patients
                                    </div>
                                    <div className="space-y-0.5">
                                        {suggestions.patients.map(p => (
                                            <button
                                                key={p._id}
                                                onClick={() => {
                                                    setSearchQuery(p.name);
                                                    setShowSuggestions(false);
                                                    navigate('/dashboard/patients');
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-xl transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs font-bold text-slate-800">
                                                            <HighlightText text={p.name} highlight={searchQuery} />
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-medium truncate w-48">
                                                            <HighlightText text={p.email} highlight={searchQuery} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) setHasUnreadNotifications(false);
                        }}
                        className={`p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-all relative ${showNotifications ? 'bg-slate-100 text-black shadow-inner' : ''}`}
                    >
                        <Bell size={20} />
                        {hasUnreadNotifications && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="px-6 py-2 border-b border-gray-50 flex justify-between items-center mb-2">
                                <h3 className="font-bold text-black text-sm">Notifications</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors ${hasUnreadNotifications ? 'text-rose-500 bg-rose-50' : 'text-gray-400 bg-gray-50'}`}>
                                    {hasUnreadNotifications ? '2 New' : '0 New'}
                                </span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-6 py-12 text-center">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No new notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 group">
                                            <div className="flex gap-4">
                                                <div className={`p-2 rounded-xl shrink-0 group-hover:scale-110 transition-transform ${n.bgColor} ${n.color}`}>
                                                    <n.icon size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">
                                                            {n.title}
                                                        </h4>
                                                        <span className="text-[9px] font-bold text-slate-300 tabular-nums uppercase">
                                                            {n.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="px-6 pt-3 mt-2">
                                <button
                                    onClick={() => {
                                        setShowNotifications(false);
                                        navigate('/dashboard/overview');
                                    }}
                                    className="w-full py-2.5 text-[10px] font-black text-black bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-[0.2em]"
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="text-right flex flex-col">
                        <span className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">Admin</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-indigo-50 shadow-md">
                        <img
                            src={user?.gender?.toLowerCase() === 'female' ? '/avatar_female.png' : '/avatar_male.png'}
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
