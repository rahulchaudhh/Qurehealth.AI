import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, UserCheck, Calendar, ArrowUpRight, Download, Filter,
    Plus, Radio, Bell, History, ClipboardCheck, ArrowRight
} from 'lucide-react';
import HighlightText from '../components/common/HighlightText';
import ActionModal from '../components/common/ActionModal';
import axios from '../api/axios';

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

function Overview({ stats, searchQuery = '', allDoctors = [], allPatients = [], pendingDoctors = [] }) {
    const [viewAll, setViewAll] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: null });
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'doctor', 'patient', 'application'

    const handleExport = () => {
        try {
            const separator = ',';
            const headers = ['Type', 'Title', 'Time', 'Timestamp'];

            // Generate rows for activities
            const activityRows = activities.map(a => [
                `"${a.type}"`,
                `"${a.title}"`,
                `"${a.time}"`,
                a.timestamp
            ].join(separator));

            // Generate summary metrics
            const metricRows = [
                [''],
                ['SUMMARY METRICS'],
                ['Metric', 'Value'],
                ['Total Patients', stats?.patients || 0],
                ['Active Doctors', stats?.doctors || 0],
                ['Pending Approvals', stats?.pendingApprovals || 0]
            ].map(row => row.join(separator));

            const csvContent = [headers.join(separator), ...activityRows, ...metricRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `qurehealth_analytics_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export analytics. Please try again.');
        }
    };

    const [toast, setToast] = useState(null);

    const showToast = (msg, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAction = async ({ message, target }) => {
        setIsActionLoading(true);
        try {
            const endpoint = modal.type === 'broadcast' ? '/admin/broadcast' : '/admin/trigger-alert';
            await axios.post(endpoint, { message, target });
            setModal({ isOpen: false, type: null });
            showToast(`${modal.type === 'broadcast' ? 'Broadcast' : 'Alert'} sent successfully!`);
        } catch (error) {
            console.error(`Error sending ${modal.type}:`, error);
            showToast(`Failed to send ${modal.type}. ${error.response?.data?.error || 'Please try again.'}`, true);
        } finally {
            setIsActionLoading(false);
        }
    };

    const activities = useMemo(() => {
        const docActivities = allDoctors.map(doc => ({
            type: 'Doctor Joined',
            title: `Dr. ${doc.name} joined the platform`,
            time: formatTimeAgo(doc.createdAt),
            timestamp: new Date(doc.createdAt).getTime(),
            icon: UserCheck,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        }));

        const patientActivities = allPatients.map(p => ({
            type: 'New Patient',
            title: `${p.name} registered`,
            time: formatTimeAgo(p.createdAt),
            timestamp: new Date(p.createdAt).getTime(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        }));

        const pendingActivities = pendingDoctors.map(doc => ({
            type: 'New Application',
            title: `Dr. ${doc.name} applied for verification`,
            time: formatTimeAgo(doc.createdAt),
            timestamp: new Date(doc.createdAt).getTime(),
            icon: ClipboardCheck,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50'
        }));

        return [...docActivities, ...patientActivities, ...pendingActivities]
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [allDoctors, allPatients, pendingDoctors]);

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.type.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterCategory === 'all') return matchesSearch;

        const categoryMap = {
            doctor: 'Doctor Joined',
            patient: 'New Patient',
            application: 'New Application'
        };

        return matchesSearch && activity.type === categoryMap[filterCategory];
    });

    const displayedActivities = viewAll ? filteredActivities : filteredActivities.slice(0, 7);
    const trendData = useMemo(() => [
        { name: 'Mon', appointments: 12, users: 4 },
        { name: 'Tue', appointments: 19, users: 7 },
        { name: 'Wed', appointments: 15, users: 12 },
        { name: 'Thu', appointments: 22, users: 15 },
        { name: 'Fri', appointments: 30, users: 18 },
        { name: 'Sat', appointments: 25, users: 20 },
        { name: 'Sun', appointments: 18, users: 22 },
    ], []);

    const statusColors = {
        pending: '#F97316',
        confirmed: '#FBBF24',
        completed: '#22C55E',
        cancelled: '#EF4444'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Dashboard Heading */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-6 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">Platform Overview</h1>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setModal({ isOpen: true, type: 'broadcast' })}
                                className="flex items-center gap-2 px-1 py-1 text-slate-500 hover:text-amber-600 transition-all group"
                            >
                                <Radio size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" strokeWidth={2} />
                                <span className="text-xs font-semibold">Broadcast</span>
                            </button>

                            <button
                                onClick={() => setModal({ isOpen: true, type: 'alert' })}
                                className="flex items-center gap-2 px-1 py-1 text-slate-500 hover:text-rose-600 transition-all group"
                            >
                                <Bell size={16} className="text-slate-400 group-hover:text-rose-500 transition-colors" strokeWidth={2} />
                                <span className="text-xs font-semibold">Alerts</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            LIVE
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm">Welcome back. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group/filter">
                        <button className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all shadow-sm ${filterCategory !== 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <Filter size={16} /> {filterCategory === 'all' ? 'Filters' : `Filtered: ${filterCategory}`}
                        </button>

                        {/* Filter Dropdown */}
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all z-50 p-1">
                            {['all', 'doctor', 'patient', 'application'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${filterCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Metrics Cards: Casual Boutique Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Patients', val: stats?.patients || 0, trend: stats?.trends?.patients || '+0.0%' },
                    { label: 'Active Doctors', val: stats?.doctors || 0, trend: stats?.trends?.doctors || '+0.0%' },
                    { label: 'Pending Approvals', val: stats?.pendingApprovals || 0, trend: 'Action Needed' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between min-h-[170px] relative overflow-hidden group">
                        <div className="flex justify-between items-start z-10">
                            <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${stat.label === 'Pending Approvals'
                                ? 'bg-rose-50 text-rose-500'
                                : 'bg-emerald-50 text-emerald-500'
                                }`}>
                                {stat.trend}
                            </div>
                        </div>

                        <div className="mt-8 z-10">
                            <div className="text-4xl font-bold text-slate-900 tracking-tight leading-none group-hover:scale-105 transition-transform origin-left duration-500">
                                {stat.val}
                            </div>
                            <div className="w-8 h-1 bg-slate-100 mt-6 rounded-full group-hover:w-12 transition-all duration-500" />
                        </div>

                        {/* Subtle Background Detail */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50/50 rounded-full blur-3xl group-hover:bg-slate-100/50 transition-colors" />
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            Appointment Growth
                        </h3>
                        <select className="bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold p-1 px-2 text-slate-600 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#4F46E5', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="appointments" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorApp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Status Distribution</h3>
                        </div>
                        <div className="bg-gray-50 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest">
                            Live Updates
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[260px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Pending', value: stats?.appointmentBreakdown?.pending || 10 },
                                        { name: 'Confirmed', value: stats?.appointmentBreakdown?.confirmed || 25 },
                                        { name: 'Completed', value: stats?.appointmentBreakdown?.completed || 45 },
                                        { name: 'Cancelled', value: stats?.appointmentBreakdown?.cancelled || 20 },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill={statusColors.pending} />
                                    <Cell fill={statusColors.confirmed} />
                                    <Cell fill={statusColors.completed} />
                                    <Cell fill={statusColors.cancelled} />
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2">
                        {[
                            { key: 'pending', label: 'Pending' },
                            { key: 'confirmed', label: 'Confirmed' },
                            { key: 'completed', label: 'Completed' },
                            { key: 'cancelled', label: 'Cancelled' }
                        ].map((item) => {
                            const val = stats?.appointmentBreakdown?.[item.key] || 0;
                            const total = Object.values(stats?.appointmentBreakdown || {}).reduce((a, b) => a + b, 0) || 1;
                            const pct = Math.round((val / total) * 100);
                            return (
                                <div key={item.key} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[item.key] }}></div>
                                    <span className="text-xs font-medium text-gray-400">
                                        <span className="text-black font-bold">{item.label}</span> ({pct}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        Recent Activity
                    </h3>
                    <button
                        onClick={() => setViewAll(!viewAll)}
                        className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
                    >
                        {viewAll ? 'Show Less' : 'View All'} <ArrowRight size={12} className={`transition-transform duration-300 ${viewAll ? 'rotate-90' : ''}`} />
                    </button>
                </div>
                <div className="space-y-4">
                    {displayedActivities.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm font-medium">No activities match your search "{searchQuery}"</p>
                        </div>
                    ) : (
                        displayedActivities.map((activity, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${activity.bgColor} ${activity.color}`}>
                                        <activity.icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            <HighlightText text={activity.title} highlight={searchQuery} />
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                                            <HighlightText text={activity.type} highlight={searchQuery} />
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-400">{activity.time}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ActionModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, type: null })}
                type={modal.type}
                loading={isActionLoading}
                onAction={handleAction}
            />

            {/* Toast notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[70] px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${toast.isError ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
                    {toast.isError ? '⚠️' : '✓'} {toast.msg}
                </div>
            )}
        </div>
    );
}

export default Overview;
