import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CompanyNav() {
    const navigate = useNavigate();

    const links = [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Qurehealth.AI" className="w-8 h-8 object-contain" />
                    <span className="text-lg font-bold tracking-tight text-slate-800 font-outfit">
                        Qurehealth<span className="text-black">.AI</span>
                    </span>
                </div>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
                    {links.map(l => (
                        <a key={l.href} href={l.href}
                            className="hover:text-indigo-600 transition-colors py-1">
                            {l.label}
                        </a>
                    ))}
                </div>

                {/* Back to Home */}
                <button onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-full transition-all cursor-pointer border border-slate-100">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Home
                </button>
            </div>
        </nav>
    );
}
