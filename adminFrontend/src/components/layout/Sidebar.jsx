import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCheck, Calendar, Settings, LogOut, ShieldCheck, Radio
} from 'lucide-react';

function Sidebar({ sidebarOpen, pendingCount, handleLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const sideItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/overview' },
        { id: 'pending', label: 'Pending Approvals', icon: ShieldCheck, path: '/dashboard/pending', count: pendingCount },
        { id: 'doctors', label: 'Doctors Directory', icon: UserCheck, path: '/dashboard/doctors' },
        { id: 'patients', label: 'Patient Records', icon: Users, path: '/dashboard/patients' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
        { id: 'communications', label: 'Communications', icon: Radio, path: '/dashboard/communications' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out z-50`}>
            <div className="h-20 flex items-center gap-2 px-6">
                <div className="w-9 h-9 flex-shrink-0">
                    <img src="/logo.png" alt="Qurehealth.AI" className="w-full h-full object-contain" />
                </div>
                {sidebarOpen && (
                    <div className="flex flex-col">
                        <span className="text-[#1e293b] font-black text-xl tracking-tighter font-outfit leading-none">
                            Qurehealth<span className="text-[#1e293b]">.AI</span>
                        </span>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {sideItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive ? 'bg-blue-50/50 text-blue-600' : 'text-[#1e293b] hover:bg-gray-50'}`}
                        >
                            <Icon size={22} className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                            {sidebarOpen && <span className={`font-extrabold text-[15px] tracking-tight ${isActive ? 'text-blue-600' : ''}`}>{item.label}</span>}
                            {item.count > 0 && sidebarOpen && (
                                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {item.count}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-all w-full"
                >
                    <LogOut size={22} className="text-slate-400" />
                    {sidebarOpen && <span className="font-extrabold text-[15px] text-[#1e293b] tracking-tight">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
