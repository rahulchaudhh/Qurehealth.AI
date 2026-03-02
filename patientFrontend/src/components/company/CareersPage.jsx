import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyNav from './CompanyNav';
import { Code2, Stethoscope, BarChart3, Megaphone, MapPin, Clock, ChevronDown } from 'lucide-react';

export default function CareersPage() {
    const navigate = useNavigate();
    const [openRole, setOpenRole] = useState(null);

    const departments = [
        { icon: Code2, name: 'Engineering', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { icon: Stethoscope, name: 'Clinical', color: 'text-rose-500', bg: 'bg-rose-50' },
        { icon: BarChart3, name: 'Data & AI', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: Megaphone, name: 'Marketing', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const roles = [
        { id: 1, title: 'Full-Stack Engineer (React / Node.js)', dept: 'Engineering', location: 'Remote · Nepal', type: 'Full-time', desc: 'Help us build and scale the core Qurehealth platform. You\'ll work on real-time chat, appointment booking, and AI integrations serving patients across Nepal.' },
        { id: 2, title: 'AI/ML Research Engineer', dept: 'Data & AI', location: 'Remote · Nepal', type: 'Full-time', desc: 'Improve our disease prediction model, explore LLM-based triage pipelines, and ship research into production for Nepali healthcare contexts.' },
        { id: 3, title: 'Clinical Content Writer (Nepali/English)', dept: 'Clinical', location: 'Remote · Flexible', type: 'Contract', desc: 'Work with our CMO to produce medically accurate patient education content in both Nepali and English, including symptom guides and health articles.' },
        { id: 4, title: 'Growth Marketing Associate', dept: 'Marketing', location: 'Kathmandu · Nepal', type: 'Full-time', desc: 'Own our organic growth — SEO, email, social, and partnership marketing. Work directly with the founder to grow Qurehealth across Nepal.' },
    ];

    const benefits = [
        { icon: '🌏', title: 'Remote First', desc: 'Work from anywhere in Nepal. We care about output, not office hours.' },
        { icon: '🏥', title: 'Health Coverage', desc: 'Free access to Qurehealth platform + health allowance for all employees.' },
        { icon: '📚', title: 'Learning Budget', desc: 'NPR 30,000/year for courses, books, and conferences of your choice.' },
        { icon: '⚡', title: 'High Impact', desc: 'Small team means your work ships fast and reaches real Nepali patients immediately.' },
        { icon: '🚀', title: 'ESOP', desc: 'Employee stock options available for all full-time team members from Day 1.' },
        { icon: '🎯', title: 'Flexible PTO', desc: 'Unlimited paid time off — take what you need, including all Nepali public holidays.' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <CompanyNav />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-50 to-purple-50/40">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wide mb-6">We're Hiring</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-outfit leading-tight">
                        Build the future of<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">healthcare in Nepal</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        Join a small, mission-driven team working to make quality healthcare accessible to every person across Nepal's 77 districts.
                    </p>
                    <a href="#openings" className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all">
                        View Open Roles
                    </a>
                </div>
            </section>

            {/* Departments */}
            <section className="py-16 px-6 border-b border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <p className="text-center text-sm text-slate-400 font-medium uppercase tracking-wide mb-8">Teams you can join</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {departments.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                                <div className={`w-12 h-12 ${d.bg} rounded-xl flex items-center justify-center`}>
                                    <d.icon className={`w-6 h-6 ${d.color}`} />
                                </div>
                                <span className="font-semibold text-slate-800 text-sm">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-indigo-600 font-bold uppercase tracking-wide text-sm">Perks & Benefits</span>
                        <h2 className="text-3xl font-bold text-slate-900 mt-3 font-outfit">Why you'll love working here</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {benefits.map((b, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="text-3xl mb-3">{b.icon}</div>
                                <h3 className="font-bold text-slate-900 mb-1">{b.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Roles */}
            <section id="openings" className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-indigo-600 font-bold uppercase tracking-wide text-sm">Open Positions</span>
                        <h2 className="text-3xl font-bold text-slate-900 mt-3 font-outfit">Find your role</h2>
                    </div>
                    <div className="space-y-4">
                        {roles.map((role) => (
                            <div key={role.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                                <button
                                    className="w-full text-left p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => setOpenRole(openRole === role.id ? null : role.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{role.title}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{role.location}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{role.type}</span>
                                                <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{role.dept}</span>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 mt-1 flex-shrink-0 transition-transform ${openRole === role.id ? 'text-indigo-600 rotate-180' : 'text-slate-300'}`} />
                                    </div>
                                </button>
                                {openRole === role.id && (
                                    <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                                        <p className="text-slate-600 leading-relaxed mb-4">{role.desc}</p>
                                        <a
                                            href={`mailto:careers@qurehealth.ai?subject=Application for ${role.title}`}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-all"
                                        >
                                            Apply Now
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-600 mb-4">Don't see your role? We're always looking for exceptional people in Nepal.</p>
                        <a href="mailto:careers@qurehealth.ai?subject=General Application"
                            className="text-indigo-600 font-semibold hover:underline">
                            Send us your resume →
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer strip */}
            <div className="border-t border-slate-100 py-6 px-6 text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Qurehealth AI · Built for Nepal ·{' '}
                <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors cursor-pointer">Home</button>
                {' · '}
                <button onClick={() => navigate('/contact')} className="hover:text-indigo-600 transition-colors cursor-pointer">Contact</button>
            </div>
        </div>
    );
}
