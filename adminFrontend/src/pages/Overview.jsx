import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, UserCheck, Calendar, ArrowUpRight, Download, Filter,
    ArrowRight, ClipboardCheck
} from 'lucide-react';
import HighlightText from '../components/common/HighlightText';

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
        <div className="space-y-5">
            {/* Dashboard Heading */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Platform Overview</h1>
                    <p className="text-xs text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download size={13} />
                        Export
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Patients', val: stats?.patients || 0, trend: stats?.trends?.patients || '+0.0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Doctors', val: stats?.doctors || 0, trend: stats?.trends?.doctors || '+0.0%', icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Pending Approvals', val: stats?.pendingApprovals || 0, trend: 'Action Needed', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={18} strokeWidth={2} />
                            </div>
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${stat.label === 'Pending Approvals' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-black tracking-tight">
                                {stat.val}
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-black text-black flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
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

                <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h3 className="text-base font-black text-black">Status Distribution</h3>
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
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-black text-black flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block"></span>
                        Recent Activity
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Filter Dropdown */}
                        <div className="relative group/filter">
                            <button className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all shadow-sm ${filterCategory !== 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <Filter size={13} /> {filterCategory === 'all' ? 'Filter' : filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}
                            </button>
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all z-50 p-1">
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
                            onClick={() => setViewAll(!viewAll)}
                            className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
                        >
                            {viewAll ? 'Show Less' : 'View All'} <ArrowRight size={12} className={`transition-transform duration-300 ${viewAll ? 'rotate-90' : ''}`} />
                        </button>
                    </div>
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
        </div>
    );
}

export default Overview;
