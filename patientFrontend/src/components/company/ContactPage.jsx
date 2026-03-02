import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyNav from './CompanyNav';
import { Mail, MessageSquare, Users, MapPin, CheckCircle2, Send } from 'lucide-react';

export default function ContactPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1200));
        setLoading(false);
        setSubmitted(true);
    };

    const channels = [
        { icon: Mail, title: 'Email Support', detail: 'support@qurehealth.ai', sub: 'Response within 24 hours', href: 'mailto:support@qurehealth.ai', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { icon: Users, title: 'Careers Enquiries', detail: 'careers@qurehealth.ai', sub: 'For job applications', href: 'mailto:careers@qurehealth.ai', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: MessageSquare, title: 'Press & Media', detail: 'press@qurehealth.ai', sub: 'For media enquiries', href: 'mailto:press@qurehealth.ai', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const faqs = [
        { q: 'Is my health data safe?', a: 'Yes. We use AES-256 encryption for stored data and TLS 1.3 in transit. Your data is never sold or shared with third parties.' },
        { q: 'How accurate is the AI diagnosis?', a: 'Our Naïve Bayes model has ~95% accuracy on our test set. Always treat AI results as guidance only — consult a licensed doctor for diagnosis.' },
        { q: 'How do I book an appointment?', a: 'Register or log in, search for a doctor by specialty, and book directly from their profile. You\'ll get an email confirmation instantly.' },
        { q: 'Can I get a refund?', a: 'If a doctor cancels or no-shows, a full refund is issued automatically within 3–5 business days to your original payment method.' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <CompanyNav />

            {/* Hero */}
            <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-slate-50 to-rose-50/40">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wide mb-6">Contact Us</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-outfit leading-tight">
                        We'd love to<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">hear from you</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Have a question, feedback, or partnership idea? Drop us a message and we'll get back to you within one business day.
                    </p>
                </div>
            </section>

            {/* Channels */}
            <section className="py-12 px-6 border-b border-slate-100">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                    {channels.map((c, i) => (
                        <a key={i} href={c.href} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                            <div className={`w-11 h-11 ${c.bg} rounded-xl flex-shrink-0 flex items-center justify-center`}>
                                <c.icon className={`w-5 h-5 ${c.color}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 text-sm">{c.title}</p>
                                <p className={`text-sm font-medium mt-0.5 ${c.color}`}>{c.detail}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* Form + FAQ */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">

                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 font-outfit">Send us a message</h2>

                        {submitted ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                <h3 className="text-xl font-bold text-slate-900">Message sent!</h3>
                                <p className="text-slate-500 text-sm max-w-xs">We've received your message and will respond to <strong>{form.email}</strong> within 24 hours.</p>
                                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                    className="mt-2 text-indigo-600 text-sm font-semibold hover:underline cursor-pointer">
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                                        <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Hari Bahadur"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject</label>
                                    <select name="subject" value={form.subject} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm bg-white">
                                        <option value="">Select a topic</option>
                                        <option>General Enquiry</option>
                                        <option>Technical Support</option>
                                        <option>Doctor Onboarding</option>
                                        <option>Billing & Refunds</option>
                                        <option>Partnership</option>
                                        <option>Press / Media</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Message</label>
                                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Tell us how we can help..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm resize-none" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all cursor-pointer">
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 font-outfit">Frequently asked</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-semibold text-slate-900 mb-2 text-sm">{faq.q}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm mb-1">Qurehealth AI</p>
                                    <p className="text-slate-500 text-xs leading-relaxed">Nepal · Remote-first<br />support@qurehealth.ai</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer strip */}
            <div className="border-t border-slate-100 py-6 px-6 text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Qurehealth AI · Built for Nepal ·{' '}
                <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors cursor-pointer">Home</button>
                {' · '}
                <button onClick={() => navigate('/about')} className="hover:text-indigo-600 transition-colors cursor-pointer">About</button>
            </div>
        </div>
    );
}
