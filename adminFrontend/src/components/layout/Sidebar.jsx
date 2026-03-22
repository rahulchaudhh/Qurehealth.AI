import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCheck, Calendar, Settings, LogOut, ShieldCheck, Radio
} from 'lucide-react';

function Sidebar({ sidebarOpen, pendingCount, handleLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const sideItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/admindashboard/overview' },
        { id: 'pending', label: 'Pending Approvals', icon: ShieldCheck, path: '/admindashboard/pending', count: pendingCount },
        { id: 'doctors', label: 'Doctors Directory', icon: UserCheck, path: '/admindashboard/doctors' },
        { id: 'patients', label: 'Patient Records', icon: Users, path: '/admindashboard/patients' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/admindashboard/appointments' },
        { id: 'communications', label: 'Communications', icon: Radio, path: '/admindashboard/communications' },
        { id: 'settings', label: 'Activity Logs', icon: Settings, path: '/admindashboard/settings' },
    ];

    const onSignOut = async () => {
        try {
            if (handleLogout && typeof handleLogout === 'function') {
                await handleLogout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out z-50`}>
            <div className="h-20 flex items-center px-6 gap-3">
                <img 
                    src="/qurehealth-logo.png" 
                    alt="Qurehealth.AI" 
                    className="h-9 w-auto object-contain flex-shrink-0"
                />
                {sidebarOpen && (
                    <div className="flex flex-col">
                        <span className="text-slate-900 font-black text-xl tracking-tighter leading-none">
                            Qurehealth<span className="text-slate-900">.AI</span>
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
                            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive ? 'bg-blue-50/50 text-blue-600' : 'text-[#475569] hover:text-[#1e293b] hover:bg-gray-50'}`}
                        >
                            <Icon size={20} className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} transition-colors`} />
                            {sidebarOpen && <span className={`font-medium text-sm ${isActive ? 'text-blue-600' : 'text-[#475569]'}`}>{item.label}</span>}
                            {item.count > 0 && sidebarOpen && (
                                <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
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
                    onClick={onSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all w-full"
                >
                    <LogOut size={20} className="text-slate-400" />
                    {sidebarOpen && <span className="font-medium text-sm text-gray-600">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
