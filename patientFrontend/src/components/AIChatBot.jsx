import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, Bot, User, RefreshCw, AlertTriangle, History,
    ChevronLeft, Trash2, CalendarCheck, Globe, ChevronDown,
    Home, MessageCircle, Stethoscope, UserSearch,
    Info, Layers, Phone, Sparkles, Clock, MoreHorizontal
} from 'lucide-react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Typing dots
───────────────────────────────────────────── */
function TypingDots() {
    return (
        <div className="flex items-center gap-1.5 px-4 py-3">
            {[0, 0.18, 0.36].map((delay, i) => (
                <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s`, background: 'linear-gradient(135deg,#818cf8,#a78bfa)' }} />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Book Doctor pill
───────────────────────────────────────────── */
function BookDoctorCTA({ specialty, onClick }) {
    return (
        <button onClick={onClick}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all w-fit"
            style={{ background: 'rgba(99,102,241,.08)', borderColor: 'rgba(99,102,241,.25)', color: '#6366f1' }}>
            <CalendarCheck className="w-3.5 h-3.5" />
            Book a {specialty}
        </button>
    );
}

/* ─────────────────────────────────────────────
   Single chat bubble
───────────────────────────────────────────── */
function ChatBubble({ msg, onBookDoctor }) {
    const isAI = msg.role === 'ai';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
        <div className={`flex items-end gap-2 mb-4 ${isAI ? '' : 'flex-row-reverse'}`}>
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm"
                style={{ background: isAI ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#94a3b8,#64748b)' }}>
                {isAI ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3 h-3 text-white" />}
            </div>
            <div className={`max-w-[76%] flex flex-col gap-1 ${isAI ? '' : 'items-end'}`}>
                {msg.isEmergency && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl mb-0.5"
                        style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444' }}>
                        <AlertTriangle className="w-3 h-3" /> Emergency — Call 102
                    </div>
                )}
                <div className="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                        borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        background: isAI ? 'rgba(255,255,255,0.95)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: isAI ? '#1e293b' : '#fff',
                        border: isAI ? '1px solid rgba(226,232,240,0.8)' : 'none',
                        boxShadow: isAI ? '0 1px 8px rgba(0,0,0,0.06)' : '0 4px 12px rgba(99,102,241,0.3)',
                    }}>
                    {msg.text}
                    {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 rounded-sm ml-1 animate-pulse align-text-bottom"
                            style={{ background: '#818cf8' }} />
                    )}
                </div>
                <span className="text-[10px] text-slate-400 px-1">{time}</span>
                {isAI && msg.suggestedSpecialty && (
                    <BookDoctorCTA specialty={msg.suggestedSpecialty} onClick={() => onBookDoctor(msg.suggestedSpecialty)} />
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Chat History Panel
───────────────────────────────────────────── */
function ChatHistoryPanel({ sessions, onSelect, onDelete, onClose, loading }) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <p className="font-semibold text-sm text-slate-800">Conversation History</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
                        <p className="text-xs text-slate-400">Loading…</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(99,102,241,.08)' }}>
                            <Clock className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">No conversations yet</p>
                        <p className="text-xs text-slate-400">Your history will appear here</p>
                    </div>
                ) : (
                    <div className="p-2 flex flex-col gap-1">
                        {sessions.map(s => (
                            <div key={s._id} onClick={() => onSelect(s._id)}
                                className="px-3 py-2.5 rounded-xl cursor-pointer flex items-start gap-3 group transition-all hover:bg-slate-50 border border-transparent hover:border-indigo-100">
                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                                    style={{ background: 'rgba(99,102,241,.1)' }}>
                                    <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{s.title}</p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{s.lastMessage}</p>
                                    <p className="text-[10px] text-slate-300 mt-1">
                                        {new Date(s.updatedAt).toLocaleDateString()} · {s.messageCount} msgs
                                    </p>
                                </div>
                                <button onClick={e => { e.stopPropagation(); onDelete(s._id); }}
                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-all">
                                    <Trash2 className="w-3 h-3 text-red-400" />
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
   HOME SCREEN — Treeleaf-exact layout
───────────────────────────────────────────── */
const HOME_MENU = [
    { Icon: Stethoscope,   label: 'AI Diagnosis',    msg: 'I want an AI health diagnosis'          },
    { Icon: Info,          label: 'About Us',         msg: 'Tell me about QureHealth AI'            },
    { Icon: UserSearch,    label: 'Find Doctors',     msg: 'Help me find a doctor'                  },
    { Icon: CalendarCheck, label: 'Book Appt.',       msg: 'How do I book an appointment?'          },
    { Icon: Layers,        label: 'Services',         msg: 'What services does QureHealth offer?'   },
    { Icon: Phone,         label: 'Support',          msg: 'I need to contact support'              },
];

// QureHealth slate — professional muted color
const BTN_BG   = '#5a6c7d';
const BTN_SHD  = '0 4px 14px rgba(90,108,125,0.25)';

function HomeScreen({ lang, onMenuClick, onStartChat }) {
    return (
        <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#f3f4f6' }}>

            {/* ── Logo area (like Treeleaf big circle at top) ── */}
            <div className="flex flex-col items-center pt-7 pb-4 flex-shrink-0">
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: '2.5px solid #6366f1',
                            boxShadow: '0 0 0 6px rgba(99,102,241,0.08), 0 4px 20px rgba(99,102,241,0.2)'
                        }}>
                        <img src="/logo.png" alt="QureHealth"
                            className="w-16 h-16 object-contain"
                            onError={e => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display = 'flex';
                            }} />
                        {/* Fallback */}
                        <div style={{ display: 'none' }}
                            className="w-16 h-16 rounded-full items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: '' }}>
                        </div>
                        <Bot className="w-10 h-10 hidden" style={{ color: '#6366f1' }} />
                    </div>

                </div>
                <p className="mt-3 font-bold text-slate-800 text-sm tracking-wide">QureHealth AI</p>
                <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'ne' ? 'तपाईंको स्वास्थ्य सहायक' : 'Your AI Health Assistant'}
                </p>
            </div>

            {/* ── 2×3 grid (exactly like Treeleaf) ── */}
            <div className="px-4 grid grid-cols-3 gap-3 flex-shrink-0">
                {HOME_MENU.map(({ Icon, label, msg }) => (
                    <button key={label} onClick={() => onMenuClick(msg)}
                        className="flex flex-col items-center gap-2 py-4 px-1 rounded-2xl transition-all active:scale-95 hover:brightness-110"
                        style={{
                            background: BTN_BG,
                            boxShadow: BTN_SHD,
                        }}>
                        <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                        <span className="text-[10.5px] text-white font-semibold leading-tight text-center">{label}</span>
                    </button>
                ))}
            </div>

            {/* ── Message input (shown on home, sends and switches to chat) ── */}
            <div className="px-4 mt-4 flex-shrink-0">
                <StartChatInput lang={lang} onStartChat={onStartChat} onSend={onMenuClick} />
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-center gap-1.5 py-4 mt-auto flex-shrink-0">
                <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    <img src="/logo.png" alt="" className="w-full h-full object-contain"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <p className="text-[10px] text-slate-400">
                    Powered By <span className="font-semibold text-slate-400">QureHealth.AI</span>
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Inline quick-send bar on home screen
───────────────────────────────────────────── */
function StartChatInput({ lang, onStartChat, onSend }) {
    const [val, setVal] = React.useState('');
    const submit = () => {
        if (val.trim()) { onSend(val.trim()); setVal(''); }
        else onStartChat();
    };
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ background: '#ffffff', border: '1px solid rgba(226,232,240,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <button onClick={onStartChat} className="flex-shrink-0 text-slate-400 hover:text-indigo-500 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
            </button>
            <input
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(); }}
                placeholder={lang === 'ne' ? 'सन्देश लेख्नुहोस्…' : 'Message…'}
                className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
            />
            <button onClick={submit}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: val.trim() ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(226,232,240,0.7)' }}>
                <Send className="w-3.5 h-3.5" style={{ color: val.trim() ? '#fff' : '#94a3b8' }} />
            </button>
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

    const [open,           setOpen]           = useState(defaultOpen);
    const [lang,           setLang]           = useState(langProp);
    const [activeTab,      setActiveTab]      = useState('home');
    const [showHistory,    setShowHistory]    = useState(false);
    const [historySessions,setHistorySessions]= useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [sessionId,      setSessionId]      = useState(null);
    const [hasUnread,      setHasUnread]      = useState(false);
    const [messages,       setMessages]       = useState([]);
    const [input,          setInput]          = useState('');
    const [loading,        setLoading]        = useState(false);

    const bottomRef  = useRef(null);
    const inputRef   = useRef(null);
    const msgIdRef   = useRef(1);

    const welcomeMsg = (l) => l === 'ne'
        ? "नमस्ते! म QureHealth AI हुँ 👋\nमैले तपाईंलाई लक्षण, स्वास्थ्य सल्लाह, वा डाक्टर खोज्नमा सहयोग गर्न सक्छु।"
        : "Hi! I'm QureHealth AI 👋\nI can help with symptoms, health advice, or finding a doctor. What's on your mind?";

    // Init messages once
    useEffect(() => {
        setMessages([{ id: msgIdRef.current++, role: 'ai', text: welcomeMsg(langProp), isEmergency: false, suggestedSpecialty: null }]);
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

    const handleBookDoctor = useCallback((specialty) => {
        if (isLoggedIn) navigate('/dashboard', { state: { page: 'doctors', specialty } });
        else navigate('/login');
    }, [isLoggedIn, navigate]);

    const sendMessage = useCallback(async (text) => {
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

            const reader = response.body.getReader();
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

    const loadSession = useCallback(async (id) => {
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

    const deleteSession = useCallback(async (id) => {
        try {
            await axios.delete(`/chat/session/${id}`);
            setHistorySessions(prev => prev.filter(s => s._id !== id));
            if (sessionId === id) resetChat();
        } catch { /* */ }
    }, [sessionId]);

    /* ── FAB ── */
    if (!open) {
        return (
            <button
                onClick={() => { setOpen(true); setHasUnread(false); }}
                className="fixed bottom-6 right-6 z-[9997] w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 8px 32px rgba(99,102,241,.5)' }}
                aria-label="Open QureHealth AI">
                <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                {hasUnread && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
            </button>
        );
    }

    /* ── Widget ── */
    return (
        <div className="fixed bottom-6 right-6 z-[9997] flex flex-col overflow-hidden"
            style={{
                width: '340px', height: '560px', maxHeight: 'calc(100vh - 80px)',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(99,102,241,.12)',
                border: '1px solid rgba(226,232,240,0.6)',
                background: '#ffffff',
            }}>

            {/* ══ TOP BAR — thin, like Treeleaf "..." dots row ══ */}
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
                style={{ background: '#ffffff', borderBottom: '1px solid rgba(226,232,240,0.5)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-indigo-200 flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,.08)' }}>
                        <img src="/logo.png" alt="" className="w-full h-full object-contain"
                            onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 tracking-wide">QureHealth AI</span>
                </div>

                <div className="flex items-center gap-0.5">
                    <button onClick={toggleLang} title={lang === 'en' ? 'Nepali' : 'English'}
                        className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    {isLoggedIn && (
                        <button onClick={() => { showHistory ? setShowHistory(false) : (loadHistory(), setShowHistory(true)); }}
                            title="History" className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                            <History className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    )}
                    <button onClick={() => { resetChat(); setActiveTab('home'); }} title="New Chat"
                        className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button onClick={() => setOpen(false)} title="Close"
                        className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* ══ BODY ══ */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {showHistory ? (
                    <ChatHistoryPanel sessions={historySessions} onSelect={loadSession} onDelete={deleteSession}
                        onClose={() => setShowHistory(false)} loading={historyLoading} />
                ) : activeTab === 'home' ? (
                    <HomeScreen lang={lang} onMenuClick={sendMessage} onStartChat={() => setActiveTab('chat')} />
                ) : (
                    /* Chat view */
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-3 py-4"
                            style={{ background: 'linear-gradient(180deg,#f8fafc,#f1f5f9)' }}>
                            {messages.map(msg => (
                                <ChatBubble key={msg.id} msg={msg} onBookDoctor={handleBookDoctor} />
                            ))}
                            {loading && messages[messages.length - 1]?.text === '' && (
                                <div className="flex items-end gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                                        <Bot className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(226,232,240,0.8)',
                                        borderRadius: '4px 16px 16px 16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                                        <TypingDots />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Disclaimer */}
                        <div className="px-3 py-1.5 flex-shrink-0 text-center"
                            style={{ background: 'rgba(248,250,252,0.95)', borderTop: '1px solid rgba(226,232,240,0.4)' }}>
                            <span className="text-[9px] text-slate-400">
                                {lang === 'ne' ? '⚕️ AI सल्लाह मात्र — चिकित्सा विकल्प होइन।' : '⚕️ AI guidance only — not a substitute for medical advice.'}
                            </span>
                        </div>

                        {/* Input */}
                        <div className="flex items-end gap-2 px-3 py-3 flex-shrink-0"
                            style={{ background: '#fff', borderTop: '1px solid rgba(226,232,240,0.5)' }}>
                            <textarea ref={inputRef} value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={lang === 'ne' ? 'सन्देश लेख्नुहोस्…' : 'Ask about symptoms, doctors…'}
                                rows={1} disabled={loading}
                                className="flex-1 resize-none text-sm text-slate-700 placeholder:text-slate-400 leading-relaxed max-h-24 overflow-y-auto outline-none"
                                style={{
                                    minHeight: '36px', background: '#f1f5f9',
                                    border: '1px solid rgba(226,232,240,0.8)', borderRadius: '12px', padding: '8px 12px',
                                    transition: 'border-color 0.15s, box-shadow 0.15s'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(226,232,240,0.8)'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f1f5f9'; }}
                                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'; }} />
                            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                                className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                                style={{
                                    background: input.trim() && !loading ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(226,232,240,0.8)',
                                    boxShadow: input.trim() && !loading ? '0 4px 12px rgba(99,102,241,.35)' : 'none',
                                    cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                                }}>
                                <Send className="w-4 h-4" style={{ color: input.trim() && !loading ? '#fff' : '#94a3b8' }} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══ BOTTOM NAV ══ */}
            {!showHistory && (
                <div className="flex flex-shrink-0"
                    style={{ borderTop: '1px solid rgba(226,232,240,0.5)', background: '#fff' }}>
                    {[
                        { id: 'home', Icon: Home,          label: lang === 'ne' ? 'होम'     : 'Home'    },
                        { id: 'chat', Icon: MessageCircle, label: lang === 'ne' ? 'म्यासेज' : 'Message' },
                    ].map(({ id, Icon, label }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all relative"
                            style={{ color: activeTab === id ? '#6366f1' : '#94a3b8' }}>
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px] font-semibold">{label}</span>
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                                style={{ width: activeTab === id ? '24px' : '0px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                            {hasUnread && id === 'chat' && activeTab !== 'chat' && (
                                <span className="absolute top-2 right-[calc(50%-14px)] w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
