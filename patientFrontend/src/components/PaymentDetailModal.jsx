import { X, CheckCircle2, AlertCircle, CreditCard, Calendar, Clock, User, Hash, Building2 } from 'lucide-react';

// Only two real payment methods in the app
const METHOD_CONFIG = {
    stripe:          { label: 'Credit / Debit Card', sub: 'Powered by Stripe', icon: CreditCard },
    card:            { label: 'Credit / Debit Card', sub: 'Powered by Stripe', icon: CreditCard },
    'pay-at-clinic': { label: 'Pay at Clinic',       sub: 'Cash or card at reception', icon: Building2 },
};

function Row({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28 flex-shrink-0">
                <Icon size={12} strokeWidth={2.5} className="text-gray-300" />
                {label}
            </span>
            <div className="text-sm font-semibold text-gray-800 text-right leading-snug">
                {children}
            </div>
        </div>
    );
}

export default function PaymentDetailModal({ appointment, onClose }) {
    const apt = appointment;
    const isPaid   = apt.paymentStatus === 'paid';
    const isFailed = apt.paymentStatus === 'failed';

    const fee    = apt.doctor?.fee ?? null;
    const method = apt.paymentMethod || 'pay-at-clinic';
    const mc     = METHOD_CONFIG[method] ?? METHOD_CONFIG['pay-at-clinic'];
    const MethodIcon = mc.icon;

    const fmtDate = (d) => d
        ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    const fmtDateTime = (d) => d
        ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : null;

    // Status config — blue/white palette only
    const statusCfg = isPaid
        ? { bg: 'bg-blue-50', iconBg: 'bg-blue-600', titleColor: 'text-blue-700', subColor: 'text-blue-400', icon: CheckCircle2, title: 'Payment Successful', sub: 'Your consultation fee has been received.' }
        : isFailed
        ? { bg: 'bg-gray-50',  iconBg: 'bg-gray-400',  titleColor: 'text-gray-700', subColor: 'text-gray-400', icon: AlertCircle,   title: 'Payment Failed',     sub: 'Payment could not be processed. Please retry.' }
        : { bg: 'bg-blue-50', iconBg: 'bg-blue-400', titleColor: 'text-blue-700', subColor: 'text-blue-400', icon: CreditCard,    title: 'Payment Pending',    sub: method === 'pay-at-clinic' ? 'Please pay at the clinic on the day of consultation.' : 'Your payment is being processed.' };

    const StatusIcon = statusCfg.icon;

    const statusBadge = isPaid
        ? 'bg-blue-600 text-white'
        : isFailed
        ? 'bg-gray-200 text-gray-600'
        : 'bg-blue-100 text-blue-600';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
        >
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">

                {/* ── Title bar ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 leading-none">Payment Details</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Consultation receipt</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* ── Status banner ── */}
                <div className={`flex items-center gap-3 px-5 py-4 ${statusCfg.bg}`}>
                    <span className={`w-9 h-9 rounded-full ${statusCfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon size={16} className="text-white" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0">
                        <p className={`text-sm font-bold leading-none ${statusCfg.titleColor}`}>
                            {statusCfg.title}
                        </p>
                        <p className={`text-xs mt-1 ${statusCfg.subColor}`}>
                            {statusCfg.sub}
                        </p>
                    </div>
                </div>

                {/* ── Rows ── */}
                <div className="px-5 pt-1 pb-2">
                    <Row icon={User} label="Doctor">
                        <span>{apt.doctor?.name || '—'}</span>
                        {apt.doctor?.specialization && (
                            <span className="block text-xs font-medium text-blue-500 mt-0.5">
                                {apt.doctor.specialization}
                            </span>
                        )}
                    </Row>

                    <Row icon={Calendar} label="Appointment">
                        <span>{fmtDate(apt.date)}</span>
                        <span className="block text-xs font-medium text-gray-400 mt-0.5">{apt.time}</span>
                    </Row>

                    <Row icon={MethodIcon} label="Method">
                        <span className="text-sm font-semibold text-gray-800">{mc.label}</span>
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">{mc.sub}</span>
                    </Row>

                    {apt.transactionId && (
                        <Row icon={Hash} label="Txn ID">
                            <span className="font-mono text-xs text-gray-500 break-all">{apt.transactionId}</span>
                        </Row>
                    )}

                    {isPaid && fmtDateTime(apt.paidAt) && (
                        <Row icon={Clock} label="Paid At">
                            <span>{fmtDateTime(apt.paidAt)}</span>
                        </Row>
                    )}
                </div>

                {/* ── Summary ── */}
                <div className="mx-5 mb-5 mt-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Charged</p>
                        <p className="text-xl font-black text-gray-900 mt-0.5">
                            {fee != null ? `NPR ${fee.toLocaleString()}` : '—'}
                        </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusBadge}`}>
                        {isPaid ? 'Paid' : isFailed ? 'Failed' : 'Pending'}
                    </span>
                </div>

                {/* ── Footer ── */}
                <div className="px-5 pb-5 pt-1 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
