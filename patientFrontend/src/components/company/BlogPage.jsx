import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyNav from './CompanyNav';
import { Clock, ArrowRight } from 'lucide-react';

const posts = [
    {
        id: 1,
        category: 'AI & Technology',
        title: 'How our Naïve Bayes model predicts diseases from symptoms with 95% accuracy',
        excerpt: 'We built our disease prediction engine on a custom-trained Naïve Bayes classifier trained on 4,920 patient cases. Here\'s a deep dive into the data, the model, and the tradeoffs we made.',
        author: 'Anika Maharjan',
        authorRole: 'Head of AI Research',
        avatar: 'A',
        readTime: '8 min read',
        date: 'Dec 18, 2024',
        color: 'from-indigo-500 to-purple-600',
        tags: ['AI', 'Machine Learning', 'Healthcare'],
    },
    {
        id: 2,
        category: 'Patient Stories',
        title: 'From Sindhupalchok to specialist: How Qurehealth reached rural Nepal',
        excerpt: 'A firsthand account of how a patient in Sindhupalchok used Qurehealth to identify early-stage diabetes and connect with a Kathmandu specialist — all from a smartphone.',
        author: 'Dr. Priya Shrestha',
        authorRole: 'Chief Medical Officer',
        avatar: 'P',
        readTime: '5 min read',
        date: 'Dec 10, 2024',
        color: 'from-rose-500 to-pink-600',
        tags: ['Patient Stories', 'Impact', 'Nepal'],
    },
    {
        id: 3,
        category: 'Product',
        title: 'Building real-time doctor-patient chat: Our WebSocket architecture',
        excerpt: 'We rebuilt our chat system on Socket.IO with end-to-end message delivery guarantees, online presence tracking, and typing indicators. Here\'s what we learned.',
        author: 'Rahul Chaudhary',
        authorRole: 'Founder & CEO',
        avatar: 'R',
        readTime: '6 min read',
        date: 'Nov 28, 2024',
        color: 'from-indigo-600 to-violet-700',
        tags: ['Engineering', 'Product'],
    },
    {
        id: 4,
        category: 'Healthcare',
        title: 'Nepal\'s doctor shortage — what the data shows and what AI can do about it',
        excerpt: 'Nepal has roughly 1 doctor per 1,724 people. We break down the district-level data, the barriers, and a realistic roadmap for how AI-assisted triage can bridge the gap.',
        author: 'Dr. Priya Shrestha',
        authorRole: 'Chief Medical Officer',
        avatar: 'P',
        readTime: '10 min read',
        date: 'Nov 15, 2024',
        color: 'from-purple-500 to-indigo-600',
        tags: ['Healthcare', 'Nepal', 'AI'],
    },
    {
        id: 5,
        category: 'Engineering',
        title: 'Securing patient data: Our multi-layer encryption and auth strategy',
        excerpt: 'Health data is the most sensitive data. We walk through how we use JWTs, bcrypt, AES-256 encryption, and role-based access control to keep patient records safe.',
        author: 'Rahul Chaudhary',
        authorRole: 'Founder & CEO',
        avatar: 'R',
        readTime: '7 min read',
        date: 'Oct 30, 2024',
        color: 'from-slate-600 to-slate-800',
        tags: ['Security', 'Engineering'],
    },
    {
        id: 6,
        category: 'Product',
        title: 'Why we redesigned our entire patient dashboard from scratch',
        excerpt: 'After talking to 50+ Nepali patients, we scrapped our original dashboard and rebuilt it around three principles: clarity, speed, and trust. Here\'s our design process.',
        author: 'Rahul Chaudhary',
        authorRole: 'Founder & CEO',
        avatar: 'R',
        readTime: '4 min read',
        date: 'Oct 12, 2024',
        color: 'from-orange-500 to-amber-500',
        tags: ['Design', 'Product'],
    },
];

const allCategories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

export default function BlogPage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);
    const featured = posts[0];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <CompanyNav />

            {/* Hero */}
            <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-slate-50 to-rose-50/40">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wide mb-6">Qurehealth Blog</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-outfit leading-tight">
                        Insights on AI,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">medicine & Nepal</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Deep dives from our engineering, clinical, and product teams — focused on healthcare in Nepal.
                    </p>
                </div>
            </section>

            {/* Featured Post */}
            <section className="py-12 px-6 border-b border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-6">Featured</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 p-8">
                        <div className={`rounded-2xl bg-gradient-to-br ${featured.color} p-8 flex items-end min-h-[220px]`}>
                            <span className="text-white/90 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">{featured.category}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                                <Clock className="w-3.5 h-3.5" />{featured.readTime}
                                <span>·</span>
                                <span>{featured.date}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 font-outfit leading-snug">{featured.title}</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                                    {featured.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{featured.author}</p>
                                    <p className="text-xs text-slate-400">{featured.authorRole}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap gap-2 mb-10">
                        {allCategories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                                    activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filtered.map(post => (
                            <div key={post.id} className="group rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer">
                                <div className={`h-32 bg-gradient-to-br ${post.color} relative`}>
                                    <span className="absolute bottom-3 left-3 text-xs font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">{post.category}</span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                        <Clock className="w-3 h-3" />{post.readTime}
                                        <span>·</span>
                                        <span>{post.date}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">{post.avatar}</div>
                                        <span className="text-xs font-medium text-slate-700">{post.author}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-3 font-outfit">Stay in the loop</h2>
                    <p className="text-indigo-100 mb-6">Get our latest articles on AI in healthcare in Nepal delivered to your inbox.</p>
                    <div className="flex gap-3 max-w-sm mx-auto">
                        <input type="email" placeholder="you@example.com" className="flex-1 px-4 py-2.5 rounded-full bg-white/20 text-white placeholder-indigo-200 outline-none focus:bg-white/30 transition-colors text-sm" />
                        <button className="px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-colors text-sm cursor-pointer">Subscribe</button>
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
