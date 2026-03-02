import React from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyNav from './CompanyNav';
import { HeartPulse, Brain, Shield, Users, ArrowRight, MapPin } from 'lucide-react';

export default function AboutPage() {
    const navigate = useNavigate();

    const values = [
        { icon: HeartPulse, title: 'Patient First', desc: 'Every decision starts with one question: does this help the patient? We build with empathy, not just technology.', color: 'text-rose-500', bg: 'bg-rose-50' },
        { icon: Brain, title: 'AI with Accountability', desc: 'Our AI is powerful, but always a guide — never a replacement for a licensed physician. We believe in transparent, explainable AI.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { icon: Shield, title: 'Privacy by Design', desc: 'Your health data is yours. We use AES-256 encryption, follow HIPAA-compliant practices, and never sell your data.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: Users, title: 'Inclusive Healthcare', desc: 'Quality healthcare should not depend on your district or income. We are building tools to close the specialist access gap across Nepal.', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const team = [
        { name: 'Rahul Chaudhary', role: 'Founder & CEO', avatar: 'R', bio: 'Full-stack engineer passionate about making healthcare accessible to every Nepali through technology.' },
        { name: 'Dr. Priya Shrestha', role: 'Chief Medical Officer', avatar: 'P', bio: 'MBBS, MD (Internal Medicine) · 12 years of clinical experience at leading hospitals in Kathmandu.' },
        { name: 'Anika Maharjan', role: 'Head of AI Research', avatar: 'A', bio: 'M.Tech (AI/ML) · Specializes in clinical NLP and diagnostic prediction models for South Asian populations.' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <CompanyNav />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-50 to-indigo-50/40">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-6">Our Story</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-outfit leading-tight">
                        Healthcare in Nepal<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">shouldn't be a privilege.</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Qurehealth.AI was founded with a single mission — use the power of artificial intelligence to give every person in Nepal,
                        regardless of location or income, access to world-class diagnostic guidance and specialist care.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-indigo-600 font-bold uppercase tracking-wide text-sm">Our Mission</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-6 font-outfit">
                            Making the right diagnosis accessible in 60 seconds
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Nepal has approximately 1 doctor for every 1,724 patients — one of the lowest ratios in South Asia.
                            In rural districts like Humla, Mugu, and Dolpa, many communities have no doctor within a day's travel.
                        </p>
                        <p className="text-slate-600 leading-relaxed mb-8">
                            We built Qurehealth.AI to close that gap. Our AI symptom checker provides instant preliminary guidance,
                            while our platform connects patients with verified specialists — in minutes, not weeks.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <span>Proudly built for Nepal · Serving patients across all 77 districts</span>
                        </div>
                        <button onClick={() => navigate('/contact')}
                            className="group inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all cursor-pointer">
                            Get in touch
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { value: '95%', label: 'AI Accuracy Rate' },
                            { value: '22+', label: 'Expert Doctors' },
                            { value: '100+', label: 'Patients Served' },
                            { value: '24/7', label: 'Always Available' },
                        ].map((s, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                <div className="text-3xl font-bold text-indigo-600 mb-2">{s.value}</div>
                                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nepal Context */}
            <section className="py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
                    {[
                        { stat: '1:1,724', label: 'Doctor-to-patient ratio in Nepal', sub: 'WHO recommends 1:1,000' },
                        { stat: '77', label: 'Districts we aim to serve', sub: 'From Kathmandu to Humla' },
                        { stat: '60s', label: 'Time to AI diagnosis', sub: 'No travel, no waiting room' },
                    ].map((s, i) => (
                        <div key={i} className="p-6">
                            <div className="text-4xl font-bold mb-2">{s.stat}</div>
                            <div className="font-semibold text-indigo-100 mb-1">{s.label}</div>
                            <div className="text-indigo-200 text-sm">{s.sub}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-indigo-600 font-bold uppercase tracking-wide text-sm">What We Stand For</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 font-outfit">Our Core Values</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {values.map((v, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 ${v.bg} rounded-xl flex items-center justify-center mb-4`}>
                                    <v.icon className={`w-6 h-6 ${v.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-indigo-600 font-bold uppercase tracking-wide text-sm">The Team</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 font-outfit">Built by people who care</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {team.map((t, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {t.avatar}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">{t.name}</h3>
                                <p className="text-indigo-600 text-sm font-medium mb-3">{t.role}</p>
                                <p className="text-slate-500 text-sm leading-relaxed">{t.bio}</p>
                            </div>
                        ))}
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
