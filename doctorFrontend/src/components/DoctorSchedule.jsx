import { useState, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, CalendarDays, List,
    Clock, User, CheckCircle2, XCircle, AlertCircle,
    HelpCircle, Video, Eye, Search, Filter, ClipboardList
} from 'lucide-react';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
    confirmed: { label: 'Confirmed', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-500',   icon: CheckCircle2 },
    completed: { label: 'Completed', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', dot: 'bg-green-500',  icon: CheckCircle2 },
    pending:   { label: 'Pending',   bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', dot: 'bg-amber-400',  icon: HelpCircle   },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   dot: 'bg-red-400',    icon: XCircle      },
    missed:    { label: 'Missed',    bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',  dot: 'bg-gray-400',   icon: AlertCircle  },
};

function StatusPill({ status }) {
    const s = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
            {s.label}
        </span>
    );
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ appointments, onSelectAppointment }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--)
        cells.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    for (let d = 1; d <= daysInMonth; d++)
        cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++)
        cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });

    const aptsByDate = useMemo(() => {
        const map = {};
        appointments.forEach(apt => {
            if (!apt.date) return;
            const key = new Date(apt.date).toDateString();
            if (!map[key]) map[key] = [];
            map[key].push(apt);
        });
        return map;
    }, [appointments]);

    const today = new Date().toDateString();

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft size={16} className="text-gray-500" />
                    </button>
                    <h3 className="text-sm font-bold text-gray-900 w-36 text-center">{monthName}</h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight size={16} className="text-gray-500" />
                    </button>
                </div>
                <button onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    Today
                </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
                {cells.map((cell, idx) => {
                    const key  = cell.date.toDateString();
                    const apts = aptsByDate[key] || [];
                    const isToday = key === today;

                    return (
                        <div key={idx}
                            className={`min-h-[88px] p-1.5 border-b border-r border-gray-100
                                ${!cell.currentMonth ? 'bg-gray-50/60' : 'bg-white hover:bg-blue-50/20'}
                                transition-colors`}>
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 ml-auto
                                ${isToday ? 'bg-blue-600 text-white' : cell.currentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                                {cell.day}
                            </div>
                            <div className="space-y-0.5">
                                {apts.slice(0, 2).map(apt => {
                                    const s = STATUS_CFG[apt.status?.toLowerCase()] || STATUS_CFG.pending;
                                    const name = apt.patient?.name || 'Patient';
                                    return (
                                        <button key={apt._id}
                                            onClick={() => onSelectAppointment(apt)}
                                            className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold truncate
                                                ${s.bg} ${s.text} hover:opacity-75 transition-opacity`}>
                                            {apt.time ? apt.time.slice(0, 5) : ''} {name}
                                        </button>
                                    );
                                })}
                                {apts.length > 2 && (
                                    <button onClick={() => onSelectAppointment(apts[2])}
                                        className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
                                        +{apts.length - 2} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-gray-100 bg-gray-50/40">
                {Object.entries(STATUS_CFG).map(([key, s]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                        <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Appointment Detail Modal ─────────────────────────────────────────────────
function AppointmentPanel({ appointment, onClose, onMeet, onComplete, onAccept, onDecline }) {
    if (!appointment) return null;

    const aptDate = appointment.date
        ? new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
    const isMissed = appointment.status === 'pending' && appointment.date && new Date(appointment.date) < new Date().setHours(0, 0, 0, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Appointment Details</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">#{appointment._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <XCircle size={18} className="text-gray-400" />
                    </button>
                </div>
                <div className="mx-5 border-t border-gray-100" />

                <div className="px-5 py-4 space-y-2.5">
                    {[
                        { icon: User,         label: 'Patient', value: appointment.patient?.name || 'Unknown' },
                        { icon: CalendarDays, label: 'Date',    value: aptDate },
                        { icon: Clock,        label: 'Time',    value: appointment.time || '—' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{label}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                            </div>
                        </div>
                    ))}

                    {appointment.reason && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Reason</p>
                            <p className="text-sm font-semibold text-gray-900">{appointment.reason}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5 flex gap-2">
                    {appointment.status === 'pending' && !isMissed && (
                        <>
                            <button onClick={() => onDecline(appointment)}
                                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                                Decline
                            </button>
                            <button onClick={() => onAccept(appointment)}
                                className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                Accept
                            </button>
                        </>
                    )}
                    {appointment.status === 'confirmed' && (
                        <>
                            {appointment.meetingLink && (
                                <button onClick={() => onMeet(appointment)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Video size={13} /> Meet
                                </button>
                            )}
                            <button onClick={() => onComplete(appointment)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                <ClipboardList size={13} /> Complete
                            </button>
                        </>
                    )}
                    {!['pending', 'confirmed'].includes(appointment.status) && (
                        <button onClick={onClose}
                            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── List View ────────────────────────────────────────────────────────────────
export function ListView({ appointments, onSelectAppointment, onMeet, onComplete, onAccept, onDecline }) {
    const [search,       setSearch]       = useState('');
    const [activeStatus, setActiveStatus] = useState('all');
    const [dateFilter,   setDateFilter]   = useState('all');

    const STATUSES = ['all', 'confirmed', 'pending', 'completed', 'cancelled', 'missed'];
    const DATE_FILTERS = [
        { key: 'all',   label: 'All Time'  },
        { key: 'today', label: 'Today'     },
        { key: 'week',  label: 'This Week' },
        { key: 'month', label: 'This Month'},
    ];

    const filtered = useMemo(() => {
        const now   = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekEnd  = new Date(today); weekEnd.setDate(today.getDate() + 7);
        const monthEnd = new Date(today); monthEnd.setDate(today.getDate() + 30);

        return appointments.filter(apt => {
            const aptStatus = apt.status === 'pending' && apt.date && new Date(apt.date) < today
                ? 'missed' : apt.status?.toLowerCase();

            if (activeStatus !== 'all' && aptStatus !== activeStatus) return false;

            if (dateFilter !== 'all' && apt.date) {
                const d = new Date(apt.date);
                if (dateFilter === 'today' && d.toDateString() !== today.toDateString()) return false;
                if (dateFilter === 'week'  && (d < today || d > weekEnd))  return false;
                if (dateFilter === 'month' && (d < today || d > monthEnd)) return false;
            }

            if (search) {
                const q    = search.toLowerCase();
                const name = (apt.patient?.name || '').toLowerCase();
                const rsn  = (apt.reason || '').toLowerCase();
                if (!name.includes(q) && !rsn.includes(q)) return false;
            }

            return true;
        });
    }, [appointments, activeStatus, dateFilter, search]);

    // Group by status
    const grouped = useMemo(() => {
        if (activeStatus !== 'all') return { [activeStatus]: filtered };
        const g = {};
        filtered.forEach(apt => {
            const key = apt.status === 'pending' && apt.date && new Date(apt.date) < new Date().setHours(0,0,0,0)
                ? 'missed' : (apt.status?.toLowerCase() || 'pending');
            if (!g[key]) g[key] = [];
            g[key].push(apt);
        });
        return g;
    }, [filtered, activeStatus]);

    const statusOrder = ['confirmed', 'pending', 'completed', 'missed', 'cancelled'];

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by patient name or reason…"
                        className="w-full pl-9 pr-4 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Filter size={13} className="text-gray-400 flex-shrink-0" />
                    {STATUSES.map(s => {
                        const count = s === 'all'
                            ? appointments.length
                            : appointments.filter(a => {
                                const derived = a.status === 'pending' && a.date && new Date(a.date) < new Date().setHours(0,0,0,0) ? 'missed' : a.status?.toLowerCase();
                                return derived === s;
                              }).length;
                        const isActive = activeStatus === s;
                        return (
                            <button key={s} onClick={() => setActiveStatus(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
                                    }`}>
                                <span className="capitalize">{s === 'all' ? 'All' : s}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Date Quick Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <CalendarDays size={13} className="text-gray-400 flex-shrink-0" />
                    {DATE_FILTERS.map(f => (
                        <button key={f.key} onClick={() => setDateFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                ${dateFilter === f.key
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Count */}
            <p className="text-xs font-semibold text-gray-500 px-1">
                Showing <span className="text-gray-900">{filtered.length}</span> of{' '}
                <span className="text-gray-900">{appointments.length}</span> appointments
            </p>

            {/* Grouped List */}
            {filtered.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <CalendarDays size={22} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">No appointments found</p>
                    <p className="text-xs text-gray-500">Try adjusting your filters</p>
                </div>
            ) : (
                statusOrder.map(statusKey => {
                    const apts = grouped[statusKey];
                    if (!apts?.length) return null;
                    const cfg = STATUS_CFG[statusKey];

                    return (
                        <div key={statusKey} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            {/* Group Header */}
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{cfg.label}</span>
                                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
                                    {apts.length}
                                </span>
                            </div>

                            {/* Rows */}
                            {apts.map((apt, i) => {
                                const name     = apt.patient?.name || 'Unknown';
                                const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                const aptDate  = apt.date
                                    ? new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—';
                                const isMissed = apt.status === 'pending' && apt.date && new Date(apt.date) < new Date().setHours(0,0,0,0);

                                return (
                                    <div key={apt._id}
                                        className={`flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/60 transition-colors cursor-pointer
                                            ${i < apts.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        onClick={() => onSelectAppointment(apt)}>

                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-blue-600">{initials}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                    <CalendarDays size={10} /> {aptDate}
                                                </span>
                                                {apt.time && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                        <Clock size={10} /> {apt.time}
                                                    </span>
                                                )}
                                                {apt.reason && (
                                                    <span className="text-xs text-gray-400 truncate max-w-[120px]">
                                                        · {apt.reason}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                            {apt.status === 'pending' && !isMissed && (
                                                <>
                                                    <button onClick={() => onDecline(apt)}
                                                        className="px-2.5 py-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                                        Decline
                                                    </button>
                                                    <button onClick={() => onAccept(apt)}
                                                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                                        Accept
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'confirmed' && (
                                                <>
                                                    {apt.meetingLink && (
                                                        <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer"
                                                            className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                            onClick={e => e.stopPropagation()}>
                                                            Meet
                                                        </a>
                                                    )}
                                                    <button onClick={() => onComplete(apt)}
                                                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                                        Complete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })
            )}
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function DoctorSchedule({ appointments = [], onMeet, onComplete, onAccept, onDecline, calendarOnly = false, onSelectAppointment }) {
    const [view,        setView]        = useState('calendar');
    const [selectedApt, setSelectedApt] = useState(null);

    const handleSelect = onSelectAppointment || setSelectedApt;

    // calendarOnly mode — just render the calendar grid, no chrome
    if (calendarOnly) {
        return <CalendarView appointments={appointments} onSelectAppointment={handleSelect} />;
    }

    const counts = useMemo(() => {
        const today = new Date().toDateString();
        return {
            total:     appointments.length,
            today:     appointments.filter(a => a.date && new Date(a.date).toDateString() === today).length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            pending:   appointments.filter(a => a.status === 'pending').length,
        };
    }, [appointments]);

    return (
        <div className="space-y-5 pb-6">
            {/* Page Header */}
            <div className="pb-4 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-900">Appointments</h1>
                <p className="text-xs text-gray-500 mt-1">{appointments.length} total appointments</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total',     value: counts.total,     color: 'text-gray-900' },
                    { label: 'Today',     value: counts.today,     color: 'text-blue-600' },
                    { label: 'Confirmed', value: counts.confirmed, color: 'text-green-600' },
                    { label: 'Pending',   value: counts.pending,   color: 'text-amber-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center">
                        <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">
                    {view === 'calendar' ? 'Calendar View' : 'List View'}
                </p>
                <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                    <button onClick={() => setView('calendar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                            ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <CalendarDays size={13} /> Calendar
                    </button>
                    <button onClick={() => setView('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                            ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <List size={13} /> List
                    </button>
                </div>
            </div>

            {/* Views */}
            {view === 'calendar'
                ? <CalendarView appointments={appointments} onSelectAppointment={setSelectedApt} />
                : <ListView
                    appointments={appointments}
                    onSelectAppointment={setSelectedApt}
                    onMeet={onMeet}
                    onComplete={onComplete}
                    onAccept={onAccept}
                    onDecline={onDecline}
                  />
            }

            {/* Detail Modal */}
            {selectedApt && (
                <AppointmentPanel
                    appointment={selectedApt}
                    onClose={() => setSelectedApt(null)}
                    onMeet={(apt)     => { onMeet(apt);     setSelectedApt(null); }}
                    onComplete={(apt) => { onComplete(apt); setSelectedApt(null); }}
                    onAccept={(apt)   => { onAccept(apt);   setSelectedApt(null); }}
                    onDecline={(apt)  => { onDecline(apt);  setSelectedApt(null); }}
                />
            )}
        </div>
    );
}
