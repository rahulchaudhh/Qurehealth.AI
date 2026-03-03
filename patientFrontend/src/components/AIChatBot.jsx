import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, Send, Bot, User, Minimize2, Maximize2, Sparkles, RefreshCw,
    AlertTriangle, History, ChevronLeft, Trash2, CalendarCheck, Globe
} from 'lucide-react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

/* ──────────────────────────────────────────────
   Quick suggestion chips shown on first open
────────────────────────────────────────────── */
const SUGGESTIONS = {
    en: [
        '🤒 I have a fever and headache',
        '💊 What medication for cold?',
        '🩺 How do I book a doctor?',
        '🚑 Is chest pain an emergency?',
        '😴 Tips for better sleep',
        '🧠 AI diagnosis explained',
    ],
    ne: [
        '🤒 मलाई ज्वरो र टाउको दुखेको छ',
        '💊 रुघाको लागि के औषधि?',
        '🩺 डाक्टर कसरी बुक गर्ने?',
        '🚑 छातीमा दुखाइ आपतकालीन हो?',
        '😴 राम्रो निद्राका लागि सुझाव',
        '🧠 AI निदान के हो?',
    ],
};

/* ──────────────────────────────────────────────
   Typing Dots animation
────────────────────────────────────────────── */
function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────
   "Book Doctor" CTA Button
────────────────────────────────────────────── */
function BookDoctorCTA({ specialty, onClick }) {
    return (
        <button
            onClick={onClick}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all w-fit"
        >
            <CalendarCheck className="w-3.5 h-3.5" />
            Book a {specialty}
        </button>
    );
}

/* ──────────────────────────────────────────────
   Single chat bubble
────────────────────────────────────────────── */
function ChatBubble({ msg, onBookDoctor }) {
    const isAI = msg.role === 'ai';
    return (
        <div className={`flex items-end gap-2 ${isAI ? '' : 'flex-row-reverse'} mb-3`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                ${isAI ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] rounded-2xl text-sm leading-relaxed shadow-sm
                ${isAI
                    ? 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                    : 'bg-indigo-600 text-white rounded-br-sm'}`}
            >
                <div className="px-4 py-2.5 whitespace-pre-wrap">{msg.text}</div>
                {msg.isEmergency && (
                    <div className="mx-3 mb-2 flex items-center gap-1.5 text-red-500 font-semibold text-xs bg-red-50 rounded-lg px-2.5 py-1.5 border border-red-200">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        Call <a href="tel:102" className="underline font-bold">102</a> immediately
                    </div>
                )}
                {msg.suggestedSpecialty && isAI && (
                    <div className="px-3 pb-2">
                        <BookDoctorCTA specialty={msg.suggestedSpecialty} onClick={() => onBookDoctor(msg.suggestedSpecialty)} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Chat History Sidebar
────────────────────────────────────────────── */
function ChatHistoryPanel({ sessions, onSelect, onDelete, onClose, loading }) {
    return (
        <div className="flex-1 overflow-y-auto bg-white">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <p className="font-semibold text-sm text-slate-800">Chat History</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-12">No past conversations</p>
            ) : (
                <div className="divide-y divide-slate-50">
                    {sessions.map(s => (
                        <div key={s._id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 group"
                            onClick={() => onSelect(s._id)}>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{s.title}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{s.lastMessage}</p>
                                <p className="text-[10px] text-slate-300 mt-1">
                                    {new Date(s.updatedAt).toLocaleDateString()} · {s.messageCount} msgs
                                </p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); onDelete(s._id); }}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded-full transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AIChatBot({ defaultOpen = false, lang: langProp = 'en' }) {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const isLoggedIn = !!authContext?.user;

    const [open, setOpen] = useState(defaultOpen);
    const [minimized, setMinimized] = useState(false);
    const [lang, setLang] = useState(langProp);
    const [showHistory, setShowHistory] = useState(false);
    const [historySessions, setHistorySessions] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const welcomeMsg = (l) => l === 'ne'
        ? "नमस्ते! म QureHealth AI हुँ 👋\nमैले तपाईंलाई लक्षण, स्वास्थ्य सल्लाह, वा डाक्टर खोज्नमा सहयोग गर्न सक्छु। के भन्नुहुन्छ?"
        : "Hi! I'm QureHealth AI 👋\nI can help with symptoms, health advice, or finding a doctor. What's on your mind?";

    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', text: welcomeMsg(langProp), isEmergency: false, suggestedSpecialty: null },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const msgIdRef = useRef(2);

    /* scroll to bottom on new message */
    useEffect(() => {
        if (open && !minimized && !showHistory) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open, minimized, showHistory]);

    /* focus input when opened */
    useEffect(() => {
        if (open && !minimized && !showHistory) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [open, minimized, showHistory]);

    /* show unread badge when closed */
    useEffect(() => {
        if (!open && messages.length > 1) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'ai') setHasUnread(true);
        }
    }, [messages, open]);

    /* Sync lang prop from parent */
    useEffect(() => { setLang(langProp); }, [langProp]);

    const clearUnread = () => setHasUnread(false);

    /* ── Navigate to Find Doctors with specialty pre-selected ── */
    const handleBookDoctor = useCallback((specialty) => {
        if (isLoggedIn) {
            navigate('/dashboard', { state: { page: 'doctors', specialty } });
        } else {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    /* ── Send message with SSE streaming ── */
    const sendMessage = useCallback(async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || loading) return;

        const userMsg = { id: msgIdRef.current++, role: 'user', text: trimmed, isEmergency: false, suggestedSpecialty: null };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Add a placeholder AI message that will be filled via streaming
        const aiMsgId = msgIdRef.current++;
        setMessages(prev => [...prev, {
            id: aiMsgId, role: 'ai', text: '', isEmergency: false, suggestedSpecialty: null, isStreaming: true,
        }]);

        try {
            // Build Gemini-compatible history from previous messages (exclude welcome & current)
            const history = messages
                .filter(m => m.id !== 1)
                .map(m => ({
                    role: m.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: m.text }],
                }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Send httpOnly cookies
                body: JSON.stringify({ message: trimmed, history, sessionId, lang }),
            });

            if (!response.ok) {
                // Read the actual error message from the server response body
                let errMsg = lang === 'ne'
                    ? 'माफ गर्नुहोस्, अहिले जडान गर्न समस्या भइरहेको छ। कृपया पछि पुनः प्रयास गर्नुहोस्।'
                    : "Sorry, I'm having trouble connecting right now. Please try again shortly.";
                try {
                    const errBody = await response.json();
                    if (errBody?.message) {
                        errMsg = errBody.message;
                    }
                } catch { /* use fallback message */ }
                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, text: errMsg, isStreaming: false } : m
                ));
                setLoading(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalSpecialty = null;
            let finalEmergency = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const parsed = JSON.parse(line.slice(6));

                        if (parsed.chunk) {
                            // Append streamed text to the placeholder message
                            setMessages(prev => prev.map(m =>
                                m.id === aiMsgId ? { ...m, text: m.text + parsed.chunk } : m
                            ));
                        }
                        if (parsed.sessionId) {
                            setSessionId(parsed.sessionId);
                        }
                        if (parsed.done) {
                            finalSpecialty = parsed.suggestedSpecialty || null;
                            finalEmergency = parsed.isEmergency || false;
                        }
                        if (parsed.error) {
                            setMessages(prev => prev.map(m =>
                                m.id === aiMsgId ? { ...m, text: parsed.error, isStreaming: false } : m
                            ));
                        }
                    } catch { /* skip malformed SSE lines */ }
                }
            }

            // Finalize the message with metadata
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                    ? { ...m, isStreaming: false, suggestedSpecialty: finalSpecialty, isEmergency: finalEmergency }
                    : m
            ));

        } catch {
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                    ? { ...m, text: lang === 'ne' ? 'माफ गर्नुहोस्, अहिले जडान गर्न समस्या भइरहेको छ।' : "Sorry, I'm having trouble connecting right now. Please try again shortly.", isStreaming: false }
                    : m
            ));
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, sessionId, lang]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const resetChat = () => {
        setMessages([{
            id: msgIdRef.current++,
            role: 'ai',
            text: welcomeMsg(lang),
            isEmergency: false,
            suggestedSpecialty: null,
        }]);
        setInput('');
        setSessionId(null);
    };

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'ne' : 'en';
        setLang(newLang);
        // Update welcome message if it's the only message
        if (messages.length === 1 && messages[0].id) {
            setMessages([{
                id: msgIdRef.current++,
                role: 'ai',
                text: welcomeMsg(newLang),
                isEmergency: false,
                suggestedSpecialty: null,
            }]);
        }
    };

    /* ── History functions ── */
    const loadHistory = useCallback(async () => {
        if (!isLoggedIn) return;
        setHistoryLoading(true);
        try {
            const { data } = await axios.get('/chat/history');
            setHistorySessions(data.data || []);
        } catch { /* silent */ }
        setHistoryLoading(false);
    }, [isLoggedIn]);

    const loadSession = useCallback(async (id) => {
        try {
            const { data } = await axios.get(`/chat/session/${id}`);
            const session = data.data;
            setSessionId(session._id);
            setLang(session.lang || 'en');
            setMessages([
                { id: msgIdRef.current++, role: 'ai', text: welcomeMsg(session.lang || 'en'), isEmergency: false, suggestedSpecialty: null },
                ...session.messages.map(m => ({
                    id: msgIdRef.current++,
                    role: m.role,
                    text: m.text,
                    isEmergency: m.isEmergency || false,
                    suggestedSpecialty: m.suggestedSpecialty || null,
                })),
            ]);
            setShowHistory(false);
        } catch { /* silent */ }
    }, []);

    const deleteSession = useCallback(async (id) => {
        try {
            await axios.delete(`/chat/session/${id}`);
            setHistorySessions(prev => prev.filter(s => s._id !== id));
            if (sessionId === id) resetChat();
        } catch { /* silent */ }
    }, [sessionId]);

    const openHistory = () => {
        loadHistory();
        setShowHistory(true);
    };

    /* ── Fab button (closed state) ── */
    if (!open) {
        return (
            <button
                onClick={() => { setOpen(true); clearUnread(); }}
                className="fixed bottom-6 left-6 z-[9997] w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-300/60 flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                aria-label="Open AI Health Assistant"
                title="Chat with QureHealth AI"
            >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>
        );
    }

    /* ── Chat window ── */
    return (
        <div
            className={`fixed bottom-6 left-6 z-[9997] flex flex-col rounded-2xl shadow-2xl shadow-indigo-200/60 border border-slate-200 bg-white transition-all duration-300 overflow-hidden
                ${minimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[540px]'}`}
            style={{ maxHeight: 'calc(100vh - 96px)' }}
        >
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">QureHealth AI</p>
                    <p className="text-indigo-200 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                        {lang === 'ne' ? 'अनलाइन · Gemini द्वारा संचालित' : 'Online · Powered by Gemini'}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {/* Language toggle */}
                    <button
                        onClick={toggleLang}
                        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        title={lang === 'en' ? 'नेपाली' : 'English'}
                    >
                        <Globe className="w-3.5 h-3.5" />
                    </button>
                    {/* History (only for logged-in users) */}
                    {isLoggedIn && (
                        <button
                            onClick={showHistory ? () => setShowHistory(false) : openHistory}
                            className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                            title="Chat History"
                        >
                            <History className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={resetChat}
                        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        title={lang === 'ne' ? 'नयाँ कुराकानी' : 'New chat'}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setMinimized(m => !m)}
                        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        title={minimized ? 'Expand' : 'Minimize'}
                    >
                        {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        title="Close"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {!minimized && (
                <>
                    {showHistory ? (
                        /* ── History Panel ── */
                        <ChatHistoryPanel
                            sessions={historySessions}
                            onSelect={loadSession}
                            onDelete={deleteSession}
                            onClose={() => setShowHistory(false)}
                            loading={historyLoading}
                        />
                    ) : (
                        <>
                            {/* ── Messages ── */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/60 space-y-1">
                                {messages.map(msg => (
                                    <ChatBubble key={msg.id} msg={msg} onBookDoctor={handleBookDoctor} />
                                ))}
                                {loading && messages[messages.length - 1]?.text === '' && (
                                    <div className="flex items-end gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm">
                                            <TypingDots />
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* ── Suggestion chips (only on fresh chat) ── */}
                            {messages.length === 1 && (
                                <div className="px-3 pt-2 pb-1 bg-slate-50/60 border-t border-slate-100 flex flex-wrap gap-1.5 flex-shrink-0">
                                    {(SUGGESTIONS[lang] || SUGGESTIONS.en).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            className="text-xs px-2.5 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-all whitespace-nowrap shadow-sm"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── Disclaimer ── */}
                            <p className="text-[10px] text-slate-400 text-center px-4 pt-1.5 pb-0 bg-white flex-shrink-0">
                                {lang === 'ne'
                                    ? '⚕️ AI मार्गदर्शन मात्र — व्यावसायिक चिकित्सा सल्लाहको विकल्प होइन।'
                                    : '⚕️ AI guidance only — not a substitute for professional medical advice.'}
                            </p>

                            {/* ── Input ── */}
                            <div className="flex items-end gap-2 px-3 py-3 bg-white border-t border-slate-100 flex-shrink-0">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={lang === 'ne' ? 'लक्षण, औषधि, डाक्टरको बारेमा सोध्नुहोस्…' : 'Ask about symptoms, medication, doctors…'}
                                    rows={1}
                                    className="flex-1 resize-none px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder:text-slate-400 text-slate-700 leading-relaxed max-h-24 overflow-y-auto"
                                    style={{ minHeight: '38px' }}
                                    onInput={e => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || loading}
                                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm hover:shadow-indigo-200"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
