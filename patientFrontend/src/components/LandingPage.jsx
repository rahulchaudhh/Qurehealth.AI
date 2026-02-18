import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogin = (e) => {
        if (e) e.preventDefault();
        navigate('/login');
    };

    const handleRegister = (e) => {
        if (e) e.preventDefault();
        navigate('/register');
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative">

            {/* Aurora Background Effects - pointer-events-none ensures clicks pass through */}
            <div className="fixed inset-0 -z-10 overflow-hidden" style={{ pointerEvents: 'none' }}>
                {/* Top Left Blob - Blue/Cyan */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-[120px] animate-blob" style={{ pointerEvents: 'none' }}></div>
                {/* Top Right Blob - Purple/Pink */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 rounded-full blur-[120px] animate-blob animation-delay-2000" style={{ pointerEvents: 'none' }}></div>
                {/* Bottom Blob - Teal/Green */}
                <div className="absolute -bottom-32 left-[20%] w-[60%] h-[60%] bg-teal-200/40 rounded-full blur-[120px] animate-blob animation-delay-4000" style={{ pointerEvents: 'none' }}></div>
            </div>

            {/* Navbar - Glassy & Pills */}
            <nav className="fixed top-4 left-0 right-0 transition-all duration-300" style={{ zIndex: 9999, pointerEvents: 'auto' }}>
                <div className={`max-w-7xl mx-auto px-6 ${scrolled ? 'py-0' : 'py-2'}`}>
                    <div className={`backdrop-blur-xl bg-white/70 border border-white/50 shadow-sm rounded-full px-6 py-3 flex justify-between items-center transition-all ${scrolled ? 'shadow-md' : ''}`}>

                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit">
                                Qurehealth.AI
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                            <a href="#doctors" className="hover:text-indigo-600 transition-colors">Find Doctors</a>
                        </div>

                        <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 10000 }}>
                            <button
                                type="button"
                                onClick={handleLogin}
                                className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer hover:bg-slate-50 rounded-full"
                                style={{ position: 'relative', zIndex: 10001 }}
                            >
                                Log in
                            </button>
                            <button
                                type="button"
                                onClick={handleRegister}
                                className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                                style={{ position: 'relative', zIndex: 10001 }}
                            >
                                Get Started
                            </button>
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

            {/* Stats Section */}
            <section className="py-10 border-y border-slate-100 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">95%</div>
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">AI Accuracy</div>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">100+</div>
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Patients healed</div>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">22+</div>
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Expert Doctors</div>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">24/7</div>
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Support Available</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-indigo-600 font-bold tracking-wide uppercase text-sm">Why Choose Us</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-6 font-outfit">Complete Health Ecosystem</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                            Everything you need for your well-being, integrated into one seamless platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                🤖
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">AI Symptom Checker</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Get instant, accurate health assessments. Our advanced AI model analyzes your symptoms and suggests potential conditions in seconds.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                📹
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Video Consultations</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Connect with top specialists from home. High-quality video calls ensure you get the care you need without the travel.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                🛡️
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Secure Records</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Your health data is encrypted and safe. Access your medical history, prescriptions, and lab results anytime, anywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-indigo-600 font-bold tracking-wide uppercase text-sm">How It Works</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-8 font-outfit">Your Journey to Better Health</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shrink-0 shadow-sm">1</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Describe Symptoms</h4>
                                        <p className="text-slate-600">Select your symptoms from the list. It asks relevant questions to understand your condition.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shrink-0 shadow-sm">2</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Get Instant Analysis</h4>
                                        <p className="text-slate-600">Receive a preliminary diagnosis and recommended specialty instantly from our AI model.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shrink-0 shadow-sm">3</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Book Expert Doctor</h4>
                                        <p className="text-slate-600">Choose from a list of recommended specialists and book an appointment in one click.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-[2rem] transform rotate-3 blur-sm"></div>
                            <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
                                {/* Doctor Card Mockup */}
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-6">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full"></div>
                                    <div>
                                        <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="ml-auto px-4 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">Available</div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 w-full bg-slate-100 rounded"></div>
                                    <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
                                    <div className="h-3 w-4/6 bg-slate-100 rounded"></div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <div className="h-10 w-full bg-indigo-600 rounded-xl"></div>
                                    <div className="h-10 w-12 bg-slate-100 rounded-xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[3rem] px-8 py-16 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
                    {/* Background Gradients/Pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[50px] mix-blend-overlay animate-blob"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full blur-[50px] mix-blend-overlay animate-blob animation-delay-2000"></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-outfit">Ready to prioritize your health?</h2>
                        <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
                            Join thousands of users who are making smarter health decisions with Qurehealth AI.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button onClick={handleRegister} className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-all transform hover:-translate-y-1 shadow-lg">
                                Create Free Account
                            </button>
                            <button onClick={handleLogin} className="px-8 py-4 bg-transparent border border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                                Log in
                            </button>
                        </div>
                    </div>
                </div>
            </section>



            {/* Footer - White Theme (Patient Centric) */}
            <footer className="bg-white text-slate-900 py-16 px-6 mt-20 relative z-10 border-t border-slate-200">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold font-outfit tracking-tight text-slate-900">Qurehealth.AI</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Empowering your health journey with advanced diagnostics and instant specialist care.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 font-outfit text-slate-900">Product</h4>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Find Doctors</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">AI Diagnostics</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 font-outfit text-slate-900">Company</h4>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 font-outfit text-slate-900">Legal</h4>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 mt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
                    <p>© 2025 Qurehealth AI. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
