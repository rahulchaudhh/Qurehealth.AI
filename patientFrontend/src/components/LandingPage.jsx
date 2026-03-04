import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Brain, Video, ShieldCheck, Stethoscope, ArrowRight, Star, ChevronDown, ChevronUp,
    Clock, Users, Activity, BadgeCheck, Lock, Server, Zap, HeartPulse, Sparkles,
    CheckCircle2, MessageSquare, CalendarCheck, Search, Award, Menu, X,
    CheckCircle, Monitor, Globe
} from 'lucide-react';
import axios from '../api/axios';
import '../styles/Landing.css';
import AIChatBot from './AIChatBot';

/* ─── translations ─── */
const T = {
    en: {
        announcement: 'AI-Powered Diagnostics — Trusted by 100+ patients & 22+ specialists',
        tryFree: 'Try Free →',
        login: 'Log in',
        getStarted: 'Get Started',
        heroTitle1: 'Health Intelligence',
        heroTitle2: 'Reimagined.',
        heroSub: 'Describe your symptoms, get an instant AI diagnosis, and book a specialist — all in under 60 seconds.',
        heroCtaPrimary: 'Start Free Diagnosis',
        heroCtaSecondary: 'See How It Works',
        heroMicro: 'No credit card required · Free AI assessment · Book in 60 seconds',
        browseAll: 'Browse All Doctors',
        browseSub: 'Log in to view full profiles & book appointments',
        viewProfile: 'View Profile',
        filterAll: 'All',
        pricingBadge: 'Pricing',
        pricingTitle: 'Simple, Transparent Pricing',
        pricingSub: 'Start free. Upgrade when you need specialist care.',
        free: 'Free',
        pro: 'Consultation',
        month: '/visit',
        ctaTitle: 'Ready to prioritize your health?',
        ctaSub: 'Join our growing community of patients making smarter health decisions with AI-powered diagnostics.',
        createAccount: 'Get Started — Log In',
        whatsappLabel: 'Chat with us',
    },
    ne: {
        announcement: 'AI-संचालित निदान — १०० भन्दा बढी बिरामी र २२ भन्दा बढी विशेषज्ञको विश्वास',
        tryFree: 'निःशुल्क प्रयास गर्नुहोस् →',
        login: 'लगइन',
        getStarted: 'सुरु गर्नुहोस्',
        heroTitle1: 'स्वास्थ्य बुद्धिमत्ता',
        heroTitle2: 'नयाँ रूपमा।',
        heroSub: 'आफ्ना लक्षणहरू वर्णन गर्नुहोस्, तुरुन्त AI निदान पाउनुहोस्, र विशेषज्ञ बुक गर्नुहोस् — ६० सेकेन्डभित्र।',
        heroCtaPrimary: 'निःशुल्क निदान सुरु गर्नुहोस्',
        heroCtaSecondary: 'कसरी काम गर्छ हेर्नुहोस्',
        heroMicro: 'क्रेडिट कार्ड आवश्यक छैन · निःशुल्क AI मूल्यांकन · ६० सेकेन्डमा बुक गर्नुहोस्',
        browseAll: 'सबै डाक्टरहरू हेर्नुहोस्',
        browseSub: 'लग इन गरेर पूर्ण प्रोफाइल र अपोइन्टमेन्ट बुक गर्नुहोस्',
        viewProfile: 'प्रोफाइल हेर्नुहोस्',
        filterAll: 'सबै',
        pricingBadge: 'मूल्य निर्धारण',
        pricingTitle: 'सरल, पारदर्शी मूल्य निर्धारण',
        pricingSub: 'निःशुल्क सुरु गर्नुहोस्। विशेषज्ञ हेरचाह चाहिएमा अपग्रेड गर्नुहोस्।',
        free: 'निःशुल्क',
        pro: 'परामर्श',
        month: '/भेट',
        ctaTitle: 'आफ्नो स्वास्थ्यलाई प्राथमिकता दिन तयार हुनुहुन्छ?',
        ctaSub: 'AI-संचालित निदानको साथ स्मार्ट स्वास्थ्य निर्णय गर्ने बिरामीहरूको बढ्दो समुदायमा सामेल हुनुहोस्।',
        createAccount: 'सुरु गर्नुहोस् — लगइन',
        whatsappLabel: 'हामीसँग कुराकानी गर्नुहोस्',
    }
};

/* ─────────────────────────────── helpers ─────────────────────────────── */
const useInView = (options = {}) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.15, ...options });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
};

const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [ref, visible] = useInView();
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [visible, end, duration]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─────────────────────────── smooth-scroll ─────────────────────────── */
const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ═══════════════════════════════ COMPONENT ═══════════════════════════════ */
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [openFaq, setOpenFaq] = useState(null);
    const [topDoctors, setTopDoctors] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [lang, setLang] = useState('en');
    const [specFilter, setSpecFilter] = useState('All');
    const t = T[lang];
    const navigate = useNavigate();
    const { user, loading } = useContext(AuthContext);

    // redirect logged-in patients
    useEffect(() => {
        if (!loading && user && user.role === 'patient') navigate('/dashboard', { replace: true });
    }, [loading, user, navigate]);

    // scroll shadow + active section highlight
    useEffect(() => {
        const ids = ['features', 'how-it-works', 'doctors', 'testimonials', 'faq'];
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
            let found = '';
            for (const id of [...ids].reverse()) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= 120) { found = id; break; }
            }
            setActiveSection(found);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // fetch top doctors for preview
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get('/doctor/all');
                if (data.success) setTopDoctors(data.data.slice(0, 4));
            } catch { /* silent */ }
        })();
    }, []);

    const handleLogin = useCallback((e) => { e?.preventDefault(); navigate('/login'); }, [navigate]);
    const handleRegister = useCallback((e) => { e?.preventDefault(); navigate('/register'); }, [navigate]);
    // All CTAs redirect to login — users log in to access features, or register from the login page
    const handleCTA = handleLogin;

    const navLinks = [
        { href: '/about', label: 'About' },
        { href: '/careers', label: 'Careers' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
    ];

    // derived specializations for filter chips
    const specializations = ['All', ...Array.from(new Set(topDoctors.map(d => d.specialization).filter(Boolean)))];
    const filteredDoctors = specFilter === 'All' ? topDoctors : topDoctors.filter(d => d.specialization === specFilter);

    const faqs = [
        { q: 'Is my health data secure?', a: 'Absolutely. All data is encrypted end-to-end using AES-256 encryption. We follow HIPAA-compliant practices and never share your information with third parties without your explicit consent.' },
        { q: 'How accurate is the AI symptom checker?', a: 'Our Naive Bayes model is trained on over 4,000 clinical records and achieves 95% accuracy. It provides preliminary guidance — final diagnoses are always confirmed by licensed physicians.' },
        { q: 'Can I book a video consultation?', a: 'Yes! After the AI assessment, you can book a video consultation with a recommended specialist in just one click. Appointments are available 24/7.' },
        { q: 'What does it cost?', a: 'Creating an account and using the AI symptom checker is completely free. Consultation fees vary by doctor and are transparently displayed before booking.' },
        { q: 'How do I reschedule or cancel an appointment?', a: 'You can reschedule or cancel any upcoming appointment directly from your dashboard. Rescheduling lets you pick a new available slot from the same doctor.' },
    ];

    /* ════════════════════════════ RENDER ════════════════════════════ */
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative">

            {/* ── Aurora Background ── */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-200/30 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/30 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-[20%] w-[60%] h-[60%] bg-teal-200/30 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
            </div>

            {/* ══════════════ ANNOUNCEMENT BANNER ══════════════ */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white text-center text-sm py-2.5 font-medium relative z-[10000]">
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{t.announcement}</span>
                    <button onClick={handleCTA} className="ml-3 px-3 py-0.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors backdrop-blur-sm cursor-pointer">
                        {t.tryFree}
                    </button>
                </div>
            </div>

            {/* ══════════════ NAVBAR ══════════════ */}
            <nav className="fixed top-10 left-0 right-0 transition-all duration-300" style={{ zIndex: 9999 }}>
                <div className={`max-w-7xl mx-auto px-6 ${scrolled ? 'py-0' : 'py-2'}`}>
                    <div className={`backdrop-blur-xl bg-white/70 border border-white/50 shadow-sm rounded-full px-6 py-3 flex justify-between items-center transition-all duration-300 ${scrolled ? 'shadow-lg bg-white/90' : ''}`}>

                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <img src="/logo.png" alt="Qurehealth.AI" className="w-9 h-9 object-contain" />
                            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit">Qurehealth<span className="text-black">.AI</span></span>
                        </div>

                        {/* Nav Links — desktop */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                            {navLinks.map(l => (
                                <a key={l.href} href={l.href}
                                    className="transition-colors relative py-1 hover:text-indigo-600">
                                    {l.label}
                                </a>
                            ))}
                        </div>

                        {/* Auth + Language toggle + Hamburger */}
                        <div className="flex items-center gap-2">
                            {/* Language toggle */}
                            <button
                                onClick={() => setLang(l => l === 'en' ? 'ne' : 'en')}
                                className="hidden sm:flex items-center justify-center w-9 h-9 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all"
                                title="Switch language"
                            >
                                <Globe className="w-4 h-4" />
                            </button>

                            <div className="hidden sm:flex items-center overflow-hidden gap-0">
                                <button type="button" onClick={handleLogin}
                                    className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                                    {t.login}
                                </button>
                                <div className="text-slate-300 font-light">/</div>
                                <button type="button" onClick={handleRegister}
                                    className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                                    Register
                                </button>
                            </div>

                            {/* Hamburger — mobile */}
                            <button
                                onClick={() => setMobileOpen(o => !o)}
                                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile dropdown */}
                    {mobileOpen && (
                        <div className="md:hidden mt-2 mx-2 bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-5 flex flex-col gap-1">
                            {navLinks.map(l => (
                                <a key={l.href} href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                    {l.label}
                                </a>
                            ))}
                            <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
                                <button
                                    onClick={() => setLang(l => l === 'en' ? 'ne' : 'en')}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <Globe className="w-4 h-4" />
                                    {lang === 'en' ? 'नेपाली भाषामा हेर्नुहोस्' : 'View in English'}
                                </button>
                                <div className="flex items-center gap-0">
                                    <button type="button" onClick={() => { handleLogin(); setMobileOpen(false); }}
                                        className="flex-1 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all text-center">
                                        {t.login}
                                    </button>
                                    <div className="text-slate-300 font-light">/</div>
                                    <button type="button" onClick={() => { handleRegister(); setMobileOpen(false); }}
                                        className="flex-1 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all text-center">
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* ══════════════ HERO ══════════════ */}
            <section className="relative pt-52 pb-20 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default animate-fade-in-up">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                        The Future of Personal Healthcare
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-slate-900 mb-8 leading-[1.05] tracking-tight font-outfit animate-fade-in-up animation-delay-200">
                        {t.heroTitle1} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x">
                            {t.heroTitle2}
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up animation-delay-400">
                        {t.heroSub}
                    </p>

                    {/* Hero CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fade-in-up animation-delay-600">
                        <button onClick={handleCTA}
                            className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                            {t.heroCtaPrimary}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={scrollTo('how-it-works')}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer">
                            {t.heroCtaSecondary}
                        </button>
                    </div>

                    {/* Trust microcopy */}
                    <p className="text-sm text-slate-400 animate-fade-in-up animation-delay-800">
                        {t.heroMicro}
                    </p>
                </div>
            </section>

            {/* ══════════════ STATS BAR ══════════════ */}
            <section className="py-10 border-y border-slate-100 bg-white/60 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: 95, suffix: '%', label: 'AI Accuracy' },
                        { value: 100, suffix: '+', label: 'Patients Served' },
                        { value: 22, suffix: '+', label: 'Expert Doctors' },
                        { value: 24, suffix: '/7', label: 'Support Available' },
                    ].map((s, i) => (
                        <div key={i} className={`${i > 0 ? 'border-l border-slate-100' : ''}`}>
                            <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1 tabular-nums">
                                <AnimatedCounter end={s.value} suffix={s.suffix} />
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ VIDEO DEMO / PRODUCT SCREENSHOT ══════════════ */}
            <FadeInSection className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto text-center">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide rounded-full mb-4">Product Demo</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-outfit">See it in action</h2>
                    <p className="text-slate-500 mb-10 max-w-xl mx-auto">From symptom entry to specialist booking — watch how Qurehealth.AI works in under 60 seconds.</p>

                    {/* Browser mockup frame */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100 border border-slate-200 bg-white">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 border-b border-slate-200">
                            <span className="w-3 h-3 rounded-full bg-red-400"></span>
                            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                            <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-slate-400 text-left border border-slate-200">
                                app.qurehealth.ai/diagnose
                            </div>
                        </div>
                        {/* Screen content */}
                        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 md:p-12 min-h-[280px] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-400 rounded-full blur-[60px]"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 rounded-full blur-[60px]"></div>
                            </div>
                            {/* Simulated chat UI */}
                            <div className="relative z-10 w-full max-w-md space-y-3">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm text-slate-700 max-w-xs text-left">
                                        Hi! I'm your AI health assistant. What symptoms are you experiencing today?
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start justify-end">
                                    <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-sm text-white max-w-xs text-left">
                                        I have a headache, mild fever, and sore throat for 2 days.
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-600">
                                        You
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm text-slate-700 max-w-xs text-left">
                                        Based on your symptoms, this may be a viral upper respiratory infection. I recommend consulting an <span className="font-semibold text-indigo-600">ENT specialist</span>. Shall I find one near you?
                                    </div>
                                </div>
                            </div>
                            {/* CTA inside frame */}
                            <button onClick={handleCTA} className="relative z-10 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer">
                                <Monitor className="w-4 h-4" />
                                Try it yourself — Log in free
                            </button>
                        </div>
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ FEATURES ══════════════ */}
            <FadeInSection id="features" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader badge="Why Choose Us" title="Complete Health Ecosystem" subtitle="Everything you need for your well-being, integrated into one seamless platform." />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { Icon: Brain, bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600', title: 'AI Symptom Checker', desc: 'Get instant, accurate health assessments. Our Naive Bayes model analyzes your symptoms and suggests potential conditions with 95% accuracy.' },
                            { Icon: Video, bgColor: 'bg-purple-50', iconColor: 'text-purple-600', title: 'Video Consultations', desc: 'Connect with top specialists from home. High-quality video calls ensure you get the care you need without the commute.' },
                            { Icon: ShieldCheck, bgColor: 'bg-teal-50', iconColor: 'text-teal-600', title: 'Secure Health Records', desc: 'Your health data is encrypted end-to-end. Access your medical history, prescriptions, and lab results anytime, anywhere.' },
                        ].map((f, i) => (
                            <div key={i} className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-14 h-14 ${f.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <f.Icon className={`w-7 h-7 ${f.iconColor}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{f.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ FIND DOCTORS PREVIEW ══════════════ */}
            <FadeInSection id="doctors" className="py-24 px-6 bg-slate-50/80 relative">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader badge="Find Doctors" title="Meet Our Specialists" subtitle="Board-certified physicians ready to help. Create a free account to view all doctors and book instantly." />

                    {/* Specialization filter chips */}
                    {specializations.length > 1 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            {specializations.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSpecFilter(s)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                        specFilter === s
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {filteredDoctors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {filteredDoctors.map((doc, i) => (
                                <div key={doc._id || i} className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center flex flex-col">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                                        {doc.hasProfilePicture ? (
                                            <img src={`/api/doctor/${doc._id}/profile-picture`} alt={doc.name}
                                                className="w-full h-full object-cover rounded-full"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-2xl font-bold text-indigo-600">' + (doc.name?.charAt(0) || 'D') + '</span>'; }} />
                                        ) : (
                                            <span className="text-2xl font-bold text-indigo-600">{doc.name?.charAt(0) || 'D'}</span>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1">{doc.name || 'Doctor'}</h4>
                                    <p className="text-sm text-indigo-600 font-medium mb-2">{doc.specialization || 'General Medicine'}</p>
                                    {doc.experience && <p className="text-xs text-slate-400 mb-3">{doc.experience}+ years experience</p>}
                                    <div className="flex items-center justify-center gap-1 text-sm mb-3">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="font-medium text-slate-700">{doc.averageRating?.toFixed(1) || '5.0'}</span>
                                        <span className="text-slate-400 text-xs">({doc.totalReviews || 0})</span>
                                    </div>
                                    {doc.nextAvailableSlot && (
                                        <p className="mb-3 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Next: {new Date(doc.nextAvailableSlot).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => navigate(user ? `/doctor/${doc._id}` : '/login')}
                                        className="mt-auto w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold transition-colors cursor-pointer"
                                    >
                                        {t.viewProfile}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : topDoctors.length === 0 ? (
                        /* Skeleton cards when loading */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 text-center animate-pulse">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100" />
                                    <div className="h-4 w-28 mx-auto bg-slate-100 rounded mb-2" />
                                    <div className="h-3 w-20 mx-auto bg-slate-50 rounded mb-3" />
                                    <div className="h-3 w-16 mx-auto bg-slate-50 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400 mb-12">No doctors found for this specialization.</div>
                    )}

                    <div className="text-center">
                        <button onClick={handleCTA}
                            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                            <Search className="w-4 h-4" />
                            {t.browseAll}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="mt-3 text-sm text-slate-400">{t.browseSub}</p>
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ HOW IT WORKS ══════════════ */}
            <FadeInSection id="how-it-works" className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <SectionHeader badge="How It Works" title="Your Journey to Better Health" subtitle="From symptoms to specialist — in three simple steps." />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* connector line (desktop) */}
                        <div className="hidden md:block absolute top-16 left-[17%] right-[17%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

                        {[
                            { step: 1, Icon: Activity, title: 'Describe Symptoms', desc: 'Select your symptoms from our comprehensive list. The AI asks follow-up questions to accurately understand your condition.', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100', iconColor: 'text-indigo-600', badgeColor: 'text-indigo-600 bg-indigo-50' },
                            { step: 2, Icon: Brain, title: 'Get AI Analysis', desc: 'Receive a preliminary diagnosis and recommended specialty instantly. Our model processes thousands of data points in seconds.', bgColor: 'bg-purple-50', borderColor: 'border-purple-100', iconColor: 'text-purple-600', badgeColor: 'text-purple-600 bg-purple-50' },
                            { step: 3, Icon: CalendarCheck, title: 'Book a Specialist', desc: 'Choose from recommended specialists, pick a slot, and book — video or in-person. Confirmations are instant.', bgColor: 'bg-pink-50', borderColor: 'border-pink-100', iconColor: 'text-pink-600', badgeColor: 'text-pink-600 bg-pink-50' },
                        ].map((s, i) => (
                            <div key={i} className="relative text-center">
                                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${s.bgColor} border-2 ${s.borderColor} flex items-center justify-center shadow-sm relative z-10`}>
                                    <s.Icon className={`w-7 h-7 ${s.iconColor}`} />
                                </div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${s.badgeColor} mb-3`}>Step {s.step}</span>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                                <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">{s.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Interactive mockup card */}
                    <div className="mt-16 max-w-lg mx-auto relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-[2rem] transform rotate-2 blur-sm opacity-50"></div>
                        <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
                            <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                    <Stethoscope className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Dr. Sharma</div>
                                    <div className="text-sm text-slate-500">Cardiologist · 12 yrs exp</div>
                                </div>
                                <div className="ml-auto px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Available
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex -space-x-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                                </div>
                                <span className="text-sm font-medium text-slate-700">5.0 (48 reviews)</span>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm cursor-default">Book Appointment</button>
                                <button className="py-3 px-4 bg-slate-50 rounded-xl cursor-default">
                                    <Video className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ TESTIMONIALS ══════════════ */}
            <FadeInSection id="testimonials" className="py-24 px-6 bg-slate-50/80">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader badge="Testimonials" title="What Our Patients Say" subtitle="Real stories from real people who transformed their health with Qurehealth.AI" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Priya M.', role: 'Software Engineer', text: 'The AI diagnosed my condition in seconds — something I had been struggling to figure out for weeks. Booked a specialist the same day. Incredible experience!', rating: 5, avatar: 'P' },
                            { name: 'Rahul K.', role: 'Business Owner', text: 'Video consultations saved me hours of travel. The doctor was thorough, professional, and the entire booking process was seamless. Highly recommended.', rating: 5, avatar: 'R' },
                            { name: 'Anita S.', role: 'Teacher', text: 'I was worried about sharing my health data online, but the platform is very secure. The doctors are verified and the AI is surprisingly accurate. Love it!', rating: 5, avatar: 'A' },
                        ].map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                                    <div>
                                        <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                                        <div className="text-xs text-slate-400">{t.role}</div>
                                    </div>
                                    <BadgeCheck className="w-5 h-5 text-indigo-500 ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ TRUST BADGES ══════════════ */}
            <section className="py-16 px-6 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <p className="text-center text-sm font-medium text-slate-400 uppercase tracking-wide mb-8">Your data is protected by industry-leading standards</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { Icon: Lock, label: 'AES-256 Encryption', sub: 'End-to-end encrypted' },
                            { Icon: ShieldCheck, label: 'HIPAA Compliant', sub: 'Healthcare standard' },
                            { Icon: Server, label: '99.9% Uptime', sub: 'Reliable infrastructure' },
                            { Icon: BadgeCheck, label: 'Verified Doctors', sub: 'Board-certified only' },
                        ].map((b, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                                    <b.Icon className="w-6 h-6 text-slate-600" />
                                </div>
                                <div className="font-semibold text-slate-900 text-sm">{b.label}</div>
                                <div className="text-xs text-slate-400 mt-1">{b.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ FAQ ══════════════ */}
            <FadeInSection id="faq" className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <SectionHeader badge="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about Qurehealth.AI" />

                    <div className="space-y-3">
                        {faqs.map((f, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer">
                                    <span className="font-semibold text-slate-900 pr-4">{f.q}</span>
                                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                                </button>
                                <div className={`faq-answer ${openFaq === i ? 'faq-answer-open' : ''}`}>
                                    <p className="px-6 pb-5 text-slate-600 leading-relaxed">{f.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ PRICING ══════════════ */}
            <FadeInSection id="pricing" className="py-24 px-6 bg-slate-50/80">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader badge={t.pricingBadge} title={t.pricingTitle} subtitle={t.pricingSub} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {/* Free plan */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-slate-900">{t.free}</h3>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">Forever Free</span>
                            </div>
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-4xl font-bold text-slate-900">NPR 0</span>
                                <span className="text-slate-400 mb-1">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'AI symptom checker (unlimited)',
                                    'Preliminary AI diagnosis',
                                    'Browse specialist directory',
                                    'Health articles & tips',
                                    'Secure health profile',
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleCTA} className="w-full py-3 border-2 border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-semibold rounded-xl transition-all cursor-pointer">
                                Get Started — Log In
                            </button>
                        </div>

                        {/* Consultation plan */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl shadow-indigo-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <h3 className="text-xl font-bold text-white">{t.pro}</h3>
                                <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">Most Popular</span>
                            </div>
                            <div className="flex items-end gap-1 mb-6 relative z-10">
                                <span className="text-4xl font-bold text-white">NPR 500</span>
                                <span className="text-indigo-200 mb-1">{t.month}</span>
                            </div>
                            <ul className="space-y-3 mb-8 relative z-10">
                                {[
                                    'Everything in Free',
                                    'Video consultation with specialists',
                                    'Instant appointment booking',
                                    'Digital prescriptions',
                                    'Medical history & records',
                                    'Priority 24/7 support',
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-indigo-100">
                                        <CheckCircle className="w-4 h-4 text-white shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleCTA} className="relative z-10 w-full py-3 bg-white hover:bg-indigo-50 text-indigo-600 font-bold rounded-xl transition-all shadow-lg cursor-pointer">
                                Book a Consultation
                            </button>
                        </div>
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ ABOUT STRIP ══════════════ */}
            <FadeInSection id="about" className="py-24 px-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/40">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-indigo-600 font-bold uppercase tracking-wide text-sm">About Qurehealth.AI</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-5 font-outfit leading-tight">
                            Built to close Nepal's healthcare access gap
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Nepal has just 1 doctor for every 1,724 patients — one of the lowest ratios in South Asia. Millions in rural areas wait weeks to see a specialist, or never get access at all.
                        </p>
                        <p className="text-slate-600 leading-relaxed mb-8">
                            We built Qurehealth.AI to change that. Our AI symptom checker gives instant preliminary guidance while connecting patients with verified specialists in minutes, not weeks.
                        </p>
                        <div className="flex flex-wrap gap-4 mb-8">
                            {[
                                { value: '95%', label: 'AI Accuracy' },
                                { value: '22+', label: 'Expert Doctors' },
                                { value: '100+', label: 'Patients Helped' },
                                { value: '24/7', label: 'Always On' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-2xl px-5 py-3 border border-slate-100 shadow-sm text-center min-w-[90px]">
                                    <div className="text-xl font-bold text-indigo-600">{s.value}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <a href="/about" className="group inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg">
                            Our Full Story
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50', title: 'Patient First', desc: 'Every feature starts with one question: does this help the patient?' },
                            { icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'AI with Accountability', desc: 'Powerful AI guidance — always backed by licensed physicians.' },
                            { icon: Lock, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Privacy by Design', desc: 'AES-256 encryption. Your data is yours — never sold.' },
                            { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Inclusive Care', desc: 'Quality healthcare regardless of location or income.' },
                        ].map((v, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-10 h-10 ${v.bg} rounded-xl flex items-center justify-center mb-3`}>
                                    <v.icon className={`w-5 h-5 ${v.color}`} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">{v.title}</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ CONTACT STRIP ══════════════ */}
            <FadeInSection id="contact" className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader badge="Get In Touch" title="We'd love to hear from you" subtitle="Have a question, feedback, or just want to say hello? We respond within 24 hours." />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {[
                            { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'General Support', detail: 'support@qurehealth.ai', sub: 'For patient & account queries', href: 'mailto:support@qurehealth.ai' },
                            { icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Doctor Onboarding', detail: 'doctors@qurehealth.ai', sub: 'Join our specialist network', href: 'mailto:doctors@qurehealth.ai' },
                            { icon: Zap, color: 'text-green-600', bg: 'bg-green-50', title: 'WhatsApp Support', detail: '+977 9817831552', sub: 'Chat with us directly on WhatsApp', href: 'https://wa.me/9779817831552?text=Hello%20Qurehealth.AI' },
                        ].map((c, i) => (
                            <a key={i} href={c.href} className="flex items-start gap-4 p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                <div className={`w-12 h-12 ${c.bg} rounded-xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <c.icon className={`w-6 h-6 ${c.color}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 mb-0.5">{c.title}</p>
                                    <p className={`text-sm font-medium ${c.color}`}>{c.detail}</p>
                                    <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                    <div className="text-center">
                        <a href="/contact" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            Open Full Contact Page
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════════ CTA BANNER ══════════════ */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-[3rem] px-8 py-16 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
                    {/* bg orbs */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[50px] mix-blend-overlay animate-blob"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full blur-[50px] mix-blend-overlay animate-blob animation-delay-2000"></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-outfit">{t.ctaTitle}</h2>
                        <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
                            {t.ctaSub}
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button onClick={handleCTA} className="group px-8 py-4 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                                {t.createAccount}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={handleRegister} className="px-8 py-4 bg-transparent border border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-all cursor-pointer">
                                New here? Sign up
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════ FOOTER ══════════════ */}
            <footer className="bg-white border-t border-slate-200 text-slate-700 relative z-10">

                {/* Support strip */}
                <div className="border-b border-slate-100 py-4 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            Have questions?
                            <a href="mailto:support@qurehealth.ai" className="text-indigo-600 font-semibold hover:underline transition-all">
                                support@qurehealth.ai
                            </a>
                        </span>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> HIPAA Compliant</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> AES-256 Encrypted</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><Server className="w-3 h-3" /> 99.9% Uptime</span>
                        </div>
                    </div>
                </div>

                {/* Main footer grid */}
                <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-5 gap-12">

                    {/* Brand col — wider */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="Qurehealth.AI" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold font-outfit tracking-tight text-slate-900">Qurehealth<span className="text-black">.AI</span></span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
                            AI-powered diagnostics and instant specialist care — built to make quality healthcare accessible to everyone.
                        </p>

                        {/* Newsletter input */}
                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Stay in the loop</p>
                        <div className="flex gap-2 max-w-xs">
                            <input
                                type="email"
                                placeholder="you@email.com"
                                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder:text-slate-400"
                            />
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-colors cursor-pointer">
                                Subscribe
                            </button>
                        </div>
                    </div>

                    {/* Product links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 border-l-2 border-indigo-500 pl-3">Product</h4>
                        <ul className="space-y-3 text-slate-500 text-sm">
                            <li><a href="#features" onClick={scrollTo('features')} className="hover:text-indigo-600 transition-colors">Features</a></li>
                            <li><a href="#doctors" onClick={scrollTo('doctors')} className="hover:text-indigo-600 transition-colors">Find Doctors</a></li>
                            <li><a href="#how-it-works" onClick={scrollTo('how-it-works')} className="hover:text-indigo-600 transition-colors">How It Works</a></li>
                            <li><a href="#faq" onClick={scrollTo('faq')} className="hover:text-indigo-600 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 border-l-2 border-indigo-500 pl-3">Company</h4>
                        <ul className="space-y-3 text-slate-500 text-sm">
                            <li><a href="/about" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                            <li><a href="/careers" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                            <li><a href="/blog" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                            <li><a href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 border-l-2 border-indigo-500 pl-3">Legal</h4>
                        <ul className="space-y-3 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Qurehealth AI, Inc. All rights reserved.</p>

                        {/* Social icons */}
                        <div className="flex items-center gap-3">
                            {[
                                { label: 'Twitter / X', icon: 'X' },
                                { label: 'LinkedIn', icon: 'in' },
                                { label: 'Instagram', icon: 'IG' },
                            ].map(s => (
                                <a key={s.label} href="#" aria-label={s.label}
                                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 text-xs font-bold transition-all">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* ══════════════ AI CHATBOT WIDGET ══════════════ */}
            <div style={{position: 'fixed', right: '1.5rem', bottom: '1.5rem', left: 'auto', top: 'auto', zIndex: 9998}}>
                <AIChatBot lang={lang} />
            </div>
        </div>
    );
}

/* ─────────────────── Sub-components ─────────────────── */
function SectionHeader({ badge, title, subtitle }) {
    return (
        <div className="text-center mb-16">
            <span className="text-indigo-600 font-bold tracking-wide uppercase text-sm">{badge}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-6 font-outfit">{title}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">{subtitle}</p>
        </div>
    );
}

function FadeInSection({ children, className = '', id, ...rest }) {
    const [ref, visible] = useInView();
    return (
        <section ref={ref} id={id} className={`${className} transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} {...rest}>
            {children}
        </section>
    );
}
