import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, Bot, RefreshCw, History,
    ChevronLeft, Trash2, CalendarCheck, Globe,
    MessageCircle, AlertTriangle, Clock,
    X, MoreVertical, Sparkles, Pencil,
    Smile, Paperclip, ChevronDown, Minimize2
} from 'lucide-react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Typing indicator
───────────────────────────────────────────── */
function TypingDots() {
    return (
        <div className="flex items-center gap-1 py-1 px-1">
            {[0, 0.15, 0.3].map((d, i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${d}s` }} />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Book Doctor button
───────────────────────────────────────────── */
function BookDoctorCTA({ specialty, onClick }) {
    return (
        <button onClick={onClick}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors">
            <CalendarCheck className="w-3 h-3" />
            Book a {specialty}
        </button>
    );
}

/* ─────────────────────────────────────────────
   Chat bubble  — Tidio style
   AI  → white card, left-aligned, with avatar
   User → dark violet pill, right-aligned
───────────────────────────────────────────── */
function ChatBubble({ msg, onBookDoctor }) {
    const isAI = msg.role === 'ai';
    return (
        <div className={`flex gap-2.5 mb-4 ${isAI ? 'items-end' : 'flex-row-reverse items-end'}`}>

            {/* AI avatar */}
            {isAI && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm">
                    <img src="/chatbot-icon.svg" alt="AI Bot" className="w-full h-full object-cover rounded-full" />
                </div>
            )}

            <div className={`flex flex-col gap-1 ${isAI ? 'max-w-[78%] items-start' : 'max-w-[78%] items-end'}`}>

                {/* Emergency badge */}
                {msg.isEmergency && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 mb-1">
                        <AlertTriangle className="w-3 h-3" /> Emergency — Call 102
                    </span>
                )}

                {isAI ? (
                    /* AI bubble — white card with shadow */
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                            {msg.isStreaming && (
                                <span className="inline-block w-0.5 h-[14px] bg-violet-500 ml-0.5 animate-pulse align-text-bottom rounded-sm" />
                            )}
                        </p>
                        {msg.suggestedSpecialty && (
                            <BookDoctorCTA specialty={msg.suggestedSpecialty} onClick={() => onBookDoctor(msg.suggestedSpecialty)} />
                        )}
                    </div>
                ) : (
                    /* User bubble — dark rounded pill */
                    <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap text-white"
                        style={{ background: 'linear-gradient(135deg,#6d28d9,#4f46e5)' }}>
                        {msg.text}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Quick reply buttons (shown after first AI msg on home)
───────────────────────────────────────────── */
function QuickReplies({ lang, onQuickMsg }) {
    const replies = [
        { label: lang === 'ne' ? 'लक्षण जाँच'   : 'Check symptoms',   msg: 'I want to check my symptoms'   },
        { label: lang === 'ne' ? 'डाक्टर खोज्'  : 'Find a doctor',    msg: 'Help me find a doctor'         },
        { label: lang === 'ne' ? 'औषधि जानकारी' : 'Medicine info',    msg: 'Tell me about a medicine'      },
        { label: lang === 'ne' ? 'अपोइन्टमेन्ट' : 'Book appointment', msg: 'How do I book an appointment?' },
    ];
    return (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
            {replies.map(r => (
                <button key={r.label} onClick={() => onQuickMsg(r.msg)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border-2 border-violet-500 text-violet-700 bg-white hover:bg-violet-50 transition-colors">
                    {r.label}
                </button>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Chat History Panel
───────────────────────────────────────────── */
function ChatHistoryPanel({ sessions, onSelect, onDelete, onClose, loading }) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <p className="font-semibold text-sm text-gray-700">Conversation History</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
                        <p className="text-xs text-gray-400">Loading…</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-1">
                            <Clock className="w-6 h-6 text-violet-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">No conversations yet</p>
                        <p className="text-xs text-gray-400">Your past chats will appear here</p>
                    </div>
                ) : (
                    <div className="py-2 px-2">
                        {sessions.map(s => (
                            <div key={s._id} onClick={() => onSelect(s._id)}
                                className="flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-white group transition-colors mb-1 border border-transparent hover:border-gray-200 hover:shadow-sm">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-700 truncate">{s.title}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{s.lastMessage}</p>
                                </div>
                                <button onClick={e => { e.stopPropagation(); onDelete(s._id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Home Screen  — matches Tidio layout
───────────────────────────────────────────── */
function HomeScreen({ lang, onStartChat, onQuickMsg }) {
    return (
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center gap-4">

                {/* Welcome card */}
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-6">
                    <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">AI Health Assistant</p>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {lang === 'ne' ? 'नमस्ते!' : 'Hello there!'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-5">
                        {lang === 'ne'
                            ? 'म कसरी मद्दत गर्न सक्छु?'
                            : "Nice to meet you. I'm here to help with your health questions."}
                    </p>
                    <button onClick={onStartChat}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[.98]"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                        {lang === 'ne' ? 'च्याट सुरु गर्नुहोस्' : 'Start chatting'}
                    </button>
                </div>

                {/* Quick reply section */}
                <div className="w-full">
                    <p className="text-xs text-gray-400 mb-2 text-left px-1">Quick topics</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: lang === 'ne' ? 'लक्षण जाँच'   : 'Check symptoms',   msg: 'I want to check my symptoms'   },
                            { label: lang === 'ne' ? 'डाक्टर खोज्'  : 'Find a doctor',    msg: 'Help me find a doctor'         },
                            { label: lang === 'ne' ? 'औषधि जानकारी' : 'Medicine info',    msg: 'Tell me about a medicine'      },
                            { label: lang === 'ne' ? 'अपोइन्टमेन्ट' : 'Book appointment', msg: 'How do I book an appointment?' },
                        ].map(({ label, msg }) => (
                            <button key={label} onClick={() => onQuickMsg(msg)}
                                className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-white border-2 border-violet-200 text-xs font-semibold text-violet-700 hover:bg-violet-50 hover:border-violet-400 transition-all">
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] text-gray-300 pb-3">
                Powered by <span className="font-medium text-gray-400">Your Health Assistant AI</span>
            </p>
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AIChatBot({ defaultOpen = false, lang: langProp = 'en' }) {
    const navigate   = useNavigate();
    const authCtx    = useContext(AuthContext);
    const isLoggedIn = !!authCtx?.user;

    const [open,            setOpen]            = useState(defaultOpen);
    const [lang,            setLang]            = useState(langProp);
    const [activeTab,       setActiveTab]       = useState('home');
    const [showHistory,     setShowHistory]     = useState(false);
    const [historySessions, setHistorySessions] = useState([]);
    const [historyLoading,  setHistoryLoading]  = useState(false);
    const [sessionId,       setSessionId]       = useState(null);
    const [hasUnread,       setHasUnread]       = useState(false);
    const [messages,        setMessages]        = useState([]);
    const [input,           setInput]           = useState('');
    const [loading,         setLoading]         = useState(false);
    const [menuOpen,        setMenuOpen]        = useState(false);

    const bottomRef = useRef(null);
    const inputRef  = useRef(null);
    const msgIdRef  = useRef(1);

    const welcomeMsg = l => l === 'ne'
        ? "नमस्ते! म Your Health Assistant AI हुँ।\nलक्षण, स्वास्थ्य सल्लाह, वा डाक्टर खोज्नमा सहयोग गर्न सक्छु।"
        : "Hi! I'm Your Health Assistant AI.\nI can help with symptoms, health advice, or finding a doctor. What's on your mind?";

    useEffect(() => {
        setMessages([{ id: msgIdRef.current++, role: 'ai', text: welcomeMsg(langProp), isEmergency: false, suggestedSpecialty: null }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (open && activeTab === 'chat' && !showHistory)
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open, activeTab, showHistory]);

    useEffect(() => {
        if (open && activeTab === 'chat' && !showHistory)
            setTimeout(() => inputRef.current?.focus(), 200);
    }, [open, activeTab, showHistory]);

    useEffect(() => {
        if (!open && messages.length > 1) {
            const last = messages[messages.length - 1];
            if (last.role === 'ai') setHasUnread(true);
        }
    }, [messages, open]);

    useEffect(() => { setLang(langProp); }, [langProp]);

    const handleBookDoctor = useCallback(specialty => {
        if (isLoggedIn) navigate('/patientdashboard', { state: { page: 'doctors', specialty } });
        else navigate('/login');
    }, [isLoggedIn, navigate]);

    const sendMessage = useCallback(async text => {
        const trimmed = (text || input).trim();
        if (!trimmed || loading) return;

        setActiveTab('chat');
        const userMsg = { id: msgIdRef.current++, role: 'user', text: trimmed, isEmergency: false, suggestedSpecialty: null };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const aiMsgId = msgIdRef.current++;
        setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', isEmergency: false, suggestedSpecialty: null, isStreaming: true }]);

        try {
            const history = messages.filter(m => m.id !== 1).map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: m.text }],
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: trimmed, history, sessionId, lang }),
            });

            if (!response.ok) {
                let errMsg = "Sorry, I'm having trouble connecting. Please try again.";
                try { const b = await response.json(); if (b?.message) errMsg = b.message; } catch { /* */ }
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: errMsg, isStreaming: false } : m));
                setLoading(false);
                return;
            }

            const reader  = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '', finalSpecialty = null, finalEmergency = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const p = JSON.parse(line.slice(6));
                        if (p.chunk)     setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: m.text + p.chunk } : m));
                        if (p.sessionId) setSessionId(p.sessionId);
                        if (p.done)      { finalSpecialty = p.suggestedSpecialty || null; finalEmergency = p.isEmergency || false; }
                        if (p.error)     setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: p.error, isStreaming: false } : m));
                    } catch { /* skip */ }
                }
            }
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, isStreaming: false, suggestedSpecialty: finalSpecialty, isEmergency: finalEmergency } : m
            ));
        } catch {
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, text: "Sorry, I'm having trouble connecting right now.", isStreaming: false } : m
            ));
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, sessionId, lang]);

    const handleKeyDown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    const resetChat = () => {
        setMessages([{ id: msgIdRef.current++, role: 'ai', text: welcomeMsg(lang), isEmergency: false, suggestedSpecialty: null }]);
        setInput('');
        setSessionId(null);
    };

    const toggleLang = () => {
        const nl = lang === 'en' ? 'ne' : 'en';
        setLang(nl);
        if (messages.length <= 1)
            setMessages([{ id: msgIdRef.current++, role: 'ai', text: welcomeMsg(nl), isEmergency: false, suggestedSpecialty: null }]);
    };

    const loadHistory = useCallback(async () => {
        if (!isLoggedIn) return;
        setHistoryLoading(true);
        try { const { data } = await axios.get('/chat/history'); setHistorySessions(data.data || []); } catch { /* */ }
        setHistoryLoading(false);
    }, [isLoggedIn]);

    const loadSession = useCallback(async id => {
        try {
            const { data } = await axios.get(`/chat/session/${id}`);
            const s = data.data;
            setSessionId(s._id);
            setLang(s.lang || 'en');
            setMessages([
                { id: msgIdRef.current++, role: 'ai', text: welcomeMsg(s.lang || 'en'), isEmergency: false, suggestedSpecialty: null },
                ...s.messages.map(m => ({ id: msgIdRef.current++, role: m.role, text: m.text, isEmergency: m.isEmergency || false, suggestedSpecialty: m.suggestedSpecialty || null })),
            ]);
            setShowHistory(false);
            setActiveTab('chat');
        } catch { /* */ }
    }, []);

    const deleteSession = useCallback(async id => {
        try {
            await axios.delete(`/chat/session/${id}`);
            setHistorySessions(prev => prev.filter(s => s._id !== id));
            if (sessionId === id) resetChat();
        } catch { /* */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    /* ── FAB ── */
    if (!open) {
        return (
            <button onClick={() => { setOpen(true); setHasUnread(false); }}
                className="fixed bottom-6 right-6 z-[9997] w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl relative"
                aria-label="Open Your Health Assistant AI">
                <img src="/chatbot-icon.svg" alt="AI Bot" className="w-full h-full object-cover rounded-full shadow-lg" />
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                )}
            </button>
        );
    }

    /* ── Widget ── */
    return (
        <div className="fixed bottom-6 right-6 z-[9997] flex flex-col overflow-hidden"
            style={{
                width: '370px', height: '600px', maxHeight: 'calc(100vh - 80px)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.10)',
            }}>

            {/* ── HEADER — Tidio-style dark violet with avatar + name + online status ── */}
            <div className="flex-shrink-0 px-4 pt-4 pb-5 relative"
                style={{ background: 'linear-gradient(135deg,#4c1d95,#312e81)' }}>

                {/* Wavy bottom edge */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-50"
                    style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.02)' }} />

                <div className="flex items-center gap-3 relative z-10">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <img src="/chatbot-icon.svg" alt="AI Bot" className="w-full h-full object-cover rounded-full" />
                    </div>

                    {/* Name + online status */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-tight">Your Health Assistant AI</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           
                        </div>
                    </div>

                    {/* 3-dot settings */}
                    <div className="relative">
                        <button onClick={() => setMenuOpen(p => !p)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                            <MoreVertical className="w-4 h-4 text-white/80" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-10 z-50 bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100"
                                style={{ minWidth: '190px' }}>
                                {[
                                    { icon: <Globe className="w-4 h-4" />,    label: lang === 'en' ? 'Switch to Nepali' : 'Switch to English', action: () => { toggleLang(); setMenuOpen(false); } },
                                    { icon: <Pencil className="w-4 h-4" />,   label: 'New Chat',     action: () => { resetChat(); setActiveTab('home'); setMenuOpen(false); } },
                                    isLoggedIn && { icon: <History className="w-4 h-4" />, label: 'Chat History', action: () => { loadHistory(); setShowHistory(true); setMenuOpen(false); } },
                                ].filter(Boolean).map((item, i) => (
                                    <button key={i} onClick={item.action}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 text-left transition-colors">
                                        <span className="text-gray-400">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Minimize / Close */}
                    <button onClick={() => setOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronDown className="w-5 h-5 text-white/80" />
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                {showHistory ? (
                    <ChatHistoryPanel sessions={historySessions} onSelect={loadSession} onDelete={deleteSession}
                        onClose={() => setShowHistory(false)} loading={historyLoading} />

                ) : activeTab === 'home' ? (
                    <HomeScreen lang={lang} onStartChat={() => setActiveTab('chat')} onQuickMsg={sendMessage} />

                ) : (
                    /* ── CHAT VIEW ── */
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4"
                            onClick={() => menuOpen && setMenuOpen(false)}>
                            {messages.map(msg => (
                                <ChatBubble key={msg.id} msg={msg} onBookDoctor={handleBookDoctor} />
                            ))}

                            {/* Typing dots */}
                            {loading && messages[messages.length - 1]?.text === '' && (
                                <div className="flex gap-2.5 mb-4 items-end">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm">
                                        <img src="/chatbot-icon.svg" alt="AI Bot" className="w-full h-full object-cover rounded-full" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                                        <TypingDots />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick reply buttons */}
                        {messages.length <= 2 && (
                            <QuickReplies lang={lang} onQuickMsg={sendMessage} />
                        )}

                        {/* ── INPUT BAR — Tidio style ── */}
                        <div className="flex-shrink-0 bg-white border-t border-gray-200">
                            <div className="flex items-end gap-2 px-3 py-3">
                                {/* Emoji */}
                                <button className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-colors">
                                    <Smile className="w-5 h-5" />
                                </button>

                                {/* Text input */}
                                <textarea ref={inputRef} value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={lang === 'ne' ? 'सन्देश लेख्नुहोस्…' : 'Enter your message…'}
                                    rows={1} disabled={loading}
                                    className="flex-1 resize-none text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
                                    style={{ minHeight: '22px', maxHeight: '88px', overflowY: 'auto', lineHeight: '1.5' }}
                                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 88) + 'px'; }} />

                                {/* Attachment */}
                                <button className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                {/* Send */}
                                <button onClick={() => sendMessage()}
                                    disabled={!input.trim() || loading}
                                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                    style={{
                                        background: input.trim() && !loading ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#e5e7eb',
                                        cursor: !input.trim() || loading ? 'default' : 'pointer',
                                        boxShadow: input.trim() && !loading ? '0 2px 8px rgba(109,40,217,0.4)' : 'none',
                                    }}>
                                    <Send className={`w-4 h-4 ${input.trim() && !loading ? 'text-white' : 'text-gray-400'}`} />
                                </button>
                            </div>
                            <p className="text-center text-[9px] text-gray-300 pb-2">
                                ⚕️ AI guidance only — not a substitute for medical advice
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
