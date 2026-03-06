import { useMemo, useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Users, UserCheck, Calendar, Download, Filter,
    ArrowRight, ClipboardCheck,
    RefreshCw, ChevronDown, TrendingUp, Activity
} from 'lucide-react';
import HighlightText from '../components/common/HighlightText';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTimeAgo = (date) => {
    if (!date) return 'Some time ago';
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return past.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 tabular-nums mt-2">{value}</p>
            <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
        </div>
    );
}

// ─── Activity Type Badge ──────────────────────────────────────────────────────
const ACTIVITY_BADGE = {
    'Doctor Joined':   { bg: 'bg-indigo-50',  text: 'text-indigo-700',  label: 'Doctor'      },
    'New Patient':     { bg: 'bg-blue-50',    text: 'text-blue-700',    label: 'Patient'     },
    'New Application': { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Application' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
function Overview({ stats, searchQuery = '', allDoctors = [], allPatients = [], pendingDoctors = [] }) {
    const [viewAll, setViewAll] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterOpen, setFilterOpen] = useState(false);
    const [chartRange, setChartRange] = useState('Last 7 Days');

    // ── Export ────────────────────────────────────────────────────────────────
    const handleExport = () => {
        try {
            const sep = ',';
            const headers = ['Type', 'Title', 'Time', 'Timestamp'];
            const actRows = activities.map(a =>
                [`"${a.type}"`, `"${a.title}"`, `"${a.time}"`, a.timestamp].join(sep)
            );
            const metRows = [
                [''], ['SUMMARY METRICS'], ['Metric', 'Value'],
                ['Total Patients', stats?.patients || 0],
                ['Active Doctors',  stats?.doctors  || 0],
                ['Pending Approvals', stats?.pendingApprovals || 0],
            ].map(r => r.join(sep));

            const csv  = [headers.join(sep), ...actRows, ...metRows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `qurehealth_overview_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Export error:', e);
        }
    };

    // ── Activities ────────────────────────────────────────────────────────────
    const activities = useMemo(() => {
        const docs = allDoctors.map(d => ({
            type: 'Doctor Joined',
            title: `Dr. ${d.name} joined the platform`,
            time: formatTimeAgo(d.createdAt),
            timestamp: new Date(d.createdAt).getTime(),
            icon: UserCheck,
            color: 'text-indigo-600', bgColor: 'bg-indigo-50'
        }));
        const patients = allPatients.map(p => ({
            type: 'New Patient',
            title: `${p.name} registered`,
            time: formatTimeAgo(p.createdAt),
            timestamp: new Date(p.createdAt).getTime(),
            icon: Users,
            color: 'text-blue-600', bgColor: 'bg-blue-50'
        }));
        const pending = pendingDoctors.map(d => ({
            type: 'New Application',
            title: `Dr. ${d.name} applied for verification`,
            time: formatTimeAgo(d.createdAt),
            timestamp: new Date(d.createdAt).getTime(),
            icon: ClipboardCheck,
            color: 'text-amber-600', bgColor: 'bg-amber-50'
        }));
        return [...docs, ...patients, ...pending].sort((a, b) => b.timestamp - a.timestamp);
    }, [allDoctors, allPatients, pendingDoctors]);

    const filteredActivities = activities.filter(a => {
        const q = searchQuery.toLowerCase();
        const matchSearch = a.title.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
        if (filterCategory === 'all') return matchSearch;
        const map = { doctor: 'Doctor Joined', patient: 'New Patient', application: 'New Application' };
        return matchSearch && a.type === map[filterCategory];
    });
    const displayedActivities = viewAll ? filteredActivities : filteredActivities.slice(0, 7);

    // ── Chart Data ────────────────────────────────────────────────────────────
    const trendData = useMemo(() => [
        { name: 'Mon', appointments: 12 },
        { name: 'Tue', appointments: 19 },
        { name: 'Wed', appointments: 15 },
        { name: 'Thu', appointments: 22 },
        { name: 'Fri', appointments: 30 },
        { name: 'Sat', appointments: 25 },
        { name: 'Sun', appointments: 18 },
    ], []);

    const registrationData = useMemo(() => [
        { name: 'Mon', doctors: 2, patients: 8  },
        { name: 'Tue', doctors: 4, patients: 14 },
        { name: 'Wed', doctors: 1, patients: 10 },
        { name: 'Thu', doctors: 5, patients: 18 },
        { name: 'Fri', doctors: 3, patients: 22 },
        { name: 'Sat', doctors: 2, patients: 12 },
        { name: 'Sun', doctors: 1, patients: 7  },
    ], []);

    const statusColors = { pending: '#F97316', confirmed: '#FBBF24', completed: '#22C55E', cancelled: '#EF4444' };
    const pieData = [
        { name: 'Pending',   value: stats?.appointmentBreakdown?.pending   || 10 },
        { name: 'Confirmed', value: stats?.appointmentBreakdown?.confirmed  || 25 },
        { name: 'Completed', value: stats?.appointmentBreakdown?.completed  || 45 },
        { name: 'Cancelled', value: stats?.appointmentBreakdown?.cancelled  || 20 },
    ];
    const pieTotal = pieData.reduce((s, d) => s + d.value, 0) || 1;

    return (
        <div className="space-y-5 pb-6">

            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Platform Overview</h1>
                    <p className="text-xs text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
                </div>
            </div>

            {/* ── Stat Cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Patients" value={stats?.patients ?? 0} sub="Registered on platform" />
                <StatCard label="Active Doctors" value={stats?.doctors ?? 0} sub="Active & verified" />
                <StatCard label="Pending Approvals" value={stats?.pendingApprovals ?? 0} sub="Awaiting approval" />
                <StatCard label="Total Appointments" value={stats?.totalAppointments ?? 0} sub="Booked sessions" />
            </div>

            {/* ── Charts Row 1 ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Appointment Growth</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Weekly appointment volume</p>
                        </div>
                        <div className="relative">
                            <select
                                value={chartRange}
                                onChange={e => setChartRange(e.target.value)}
                                className="appearance-none pl-3 pr-7 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="p-5 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}    />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                                    cursor={{ stroke: '#4F46E5', strokeWidth: 1.5, strokeDasharray: '4 2' }}
                                />
                                <Area type="monotone" dataKey="appointments" stroke="#4F46E5"
                                    strokeWidth={2.5} fillOpacity={1} fill="url(#colorApp)" dot={false} activeDot={{ r: 5, fill: '#4F46E5' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Status Distribution</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Appointment breakdown</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={78}
                                    paddingAngle={4} dataKey="value" stroke="none">
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={Object.values(statusColors)[i]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                        {pieData.map((item, i) => {
                            const pct = Math.round((item.value / pieTotal) * 100);
                            const color = Object.values(statusColors)[i];
                            return (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                    <span className="text-xs text-gray-500 truncate">
                                        <span className="font-semibold text-gray-700">{item.name}</span>
                                        <span className="text-gray-400"> ({pct}%)</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Charts Row 2 ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Bar Chart — Doctor vs Patient registrations */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">New Registrations</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Doctors vs Patients — daily breakdown</p>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />Doctors</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />Patients</span>
                        </div>
                    </div>
                    <div className="p-5 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10} barGap={3}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                                    cursor={{ fill: '#F8FAFC' }}
                                />
                                <Bar dataKey="doctors"  fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="patients" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats mini-cards */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Quick Insights</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Key platform metrics</p>
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                        {[
                            {
                                label: 'Approval Rate',
                                value: stats?.doctors && (stats.doctors + (stats.pendingApprovals || 0)) > 0
                                    ? `${Math.round((stats.doctors / (stats.doctors + (stats.pendingApprovals || 0))) * 100)}%`
                                    : '—',
                                sub: 'Doctors verified',
                                icon: UserCheck,
                                color: 'text-indigo-600',
                                bg: 'bg-indigo-50',
                            },
                            {
                                label: 'Patients per Doctor',
                                value: stats?.doctors > 0
                                    ? (stats.patients / stats.doctors).toFixed(1)
                                    : '—',
                                sub: 'Avg load per doctor',
                                icon: Users,
                                color: 'text-blue-600',
                                bg: 'bg-blue-50',
                            },
                            {
                                label: 'Completion Rate',
                                value: pieTotal > 0
                                    ? `${Math.round(((stats?.appointmentBreakdown?.completed || 0) / pieTotal) * 100)}%`
                                    : '—',
                                sub: 'Appointments completed',
                                icon: Activity,
                                color: 'text-green-600',
                                bg: 'bg-green-50',
                            },
                            {
                                label: 'Cancellation Rate',
                                value: pieTotal > 0
                                    ? `${Math.round(((stats?.appointmentBreakdown?.cancelled || 0) / pieTotal) * 100)}%`
                                    : '—',
                                sub: 'Appointments cancelled',
                                icon: TrendingUp,
                                color: 'text-rose-600',
                                bg: 'bg-rose-50',
                            },
                        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
                                    <Icon size={16} strokeWidth={2} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                                    <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
                                    <p className="text-[10px] text-gray-400">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Recent Activity ───────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                        {filteredActivities.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{filteredActivities.length} entries</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setFilterOpen(v => !v)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors
                                    ${filterCategory !== 'all'
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Filter size={12} />
                                {filterCategory === 'all' ? 'Filter' : filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}
                            </button>
                            {filterOpen && (
                                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1"
                                    onMouseLeave={() => setFilterOpen(false)}>
                                    {['all', 'doctor', 'patient', 'application'].map(cat => (
                                        <button key={cat}
                                            onClick={() => { setFilterCategory(cat); setFilterOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors
                                                ${filterCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={handleExport}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                            <Download size={12} />
                            Export
                        </button>

                        <button onClick={() => setViewAll(v => !v)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                            {viewAll ? 'Show Less' : 'View All'}
                            <ArrowRight size={12} className={`transition-transform duration-200 ${viewAll ? 'rotate-90' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {displayedActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                            <p className="text-sm text-gray-500 font-medium">No activities found</p>
                            {searchQuery && (
                                <p className="text-xs text-gray-400">No results for "{searchQuery}"</p>
                            )}
                        </div>
                    ) : (
                        displayedActivities.map((activity, i) => {
                            const badge = ACTIVITY_BADGE[activity.type];
                            return (
                                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.bgColor} ${activity.color}`}>
                                            <activity.icon size={15} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                <HighlightText text={activity.title} highlight={searchQuery} />
                                            </p>
                                            <span className={`inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge?.bg} ${badge?.text}`}>
                                                <HighlightText text={badge?.label || activity.type} highlight={searchQuery} />
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium flex-shrink-0 ml-4">{activity.time}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Overview;
