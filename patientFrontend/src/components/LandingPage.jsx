import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative">

            {/* Aurora Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                {/* Top Left Blob - Blue/Cyan */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
                {/* Top Right Blob - Purple/Pink */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                {/* Bottom Blob - Teal/Green */}
                <div className="absolute -bottom-32 left-[20%] w-[60%] h-[60%] bg-teal-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar - Glassy & Pills */}
            <nav className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300`}>
                <div className={`max-w-7xl mx-auto px-6 ${scrolled ? 'py-0' : 'py-2'}`}>
                    <div className={`backdrop-blur-xl bg-white/70 border border-white/50 shadow-sm rounded-full px-6 py-3 flex justify-between items-center transition-all ${scrolled ? 'shadow-md' : ''}`}>

                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit">
                                Qurehealth<span className="text-indigo-600">.AI</span>
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                            <a href="#doctors" className="hover:text-indigo-600 transition-colors">Find Doctors</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-20 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                        The Future of Personal Healthcare
                    </div>

                    {/* Headline */}
                    <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-8 leading-[1] tracking-tight font-outfit">
                        Health Intelligence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x">
                            Reimagined.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                        Access world-class diagnostics, instant specialist connection, and real-time health monitoring using advanced AI.
                    </p>


                </div>


            </section>



            {/* Footer - Explicit Addition */}
            <footer className="bg-slate-50 text-slate-900 py-16 px-6 mt-20 relative z-10 border-t border-slate-200">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold font-outfit">Qurehealth.AI</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Empowering your health journey with advanced diagnostics and instant specialist care.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 font-outfit">Product</h4>
                        <ul className="space-y-4 text-slate-600 text-sm">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Find Doctors</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">AI Diagnostics</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 font-outfit">Company</h4>
                        <ul className="space-y-4 text-slate-600 text-sm">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 font-outfit">Legal</h4>
                        <ul className="space-y-4 text-slate-600 text-sm">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 mt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                    <p>© 2025 Qurehealth AI. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
