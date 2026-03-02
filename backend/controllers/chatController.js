const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/ChatSession');
const Patient = require('../models/Patient');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ─────────────────────────────────────────────
   Specialty detection from AI responses
───────────────────────────────────────────── */
const SPECIALTY_PATTERNS = [
    { regex: /cardiolog/i, specialty: 'Cardiology' },
    { regex: /dermatolog/i, specialty: 'Dermatology' },
    { regex: /orthop[ae]dic|bone\s*specialist/i, specialty: 'Orthopedics' },
    { regex: /neurolog/i, specialty: 'Neurology' },
    { regex: /gynecolog|obstetrician/i, specialty: 'Gynecology' },
    { regex: /pediatric|child\s*specialist/i, specialty: 'Pediatrics' },
    { regex: /psychiatr|mental\s*health/i, specialty: 'Psychiatry' },
    { regex: /ophthalmolog|eye\s*specialist/i, specialty: 'Ophthalmology' },
    { regex: /ent|ear.*nose.*throat|otolaryngolog/i, specialty: 'ENT' },
    { regex: /gastroenterolog|stomach\s*specialist/i, specialty: 'Gastroenterology' },
    { regex: /pulmonolog|lung\s*specialist/i, specialty: 'Pulmonology' },
    { regex: /urolog/i, specialty: 'Urology' },
    { regex: /endocrinolog|diabetes\s*specialist/i, specialty: 'Endocrinology' },
    { regex: /oncolog|cancer/i, specialty: 'Oncology' },
    { regex: /general\s*physician|general\s*practitioner|GP/i, specialty: 'General Medicine' },
];

function detectSpecialty(text) {
    for (const { regex, specialty } of SPECIALTY_PATTERNS) {
        if (regex.test(text)) return specialty;
    }
    return null;
}

/* ─────────────────────────────────────────────
   Build system prompt (context-aware + language)
───────────────────────────────────────────── */
function buildSystemPrompt({ lang = 'en', patientContext = '' }) {
    const langInstruction = lang === 'ne'
        ? `\n• IMPORTANT: Respond in Nepali (नेपाली) language. Use Devanagari script. Keep medical terms in English if no Nepali equivalent exists.`
        : '';

    const patientInfo = patientContext
        ? `\n\n--- PATIENT CONTEXT (use this to personalize your advice) ---\n${patientContext}\n--- END PATIENT CONTEXT ---`
        : '';

    return [
        {
            role: 'user',
            parts: [{
                text: `You are QureHealth AI — a helpful, empathetic, and responsible medical assistant for Qurehealth.AI, a Nepal-based telehealth platform.
Your role:
• Help patients understand symptoms and get preliminary health guidance.
• When you recommend seeing a specialist, clearly mention the specialty name (e.g., "I recommend consulting a **Cardiologist**").
• Explain how to use Qurehealth.AI features (book appointments, symptom checker, etc.).
• Answer general health and wellness questions concisely (under 120 words per reply).
• Always recommend seeing a real doctor for serious concerns.
• If symptoms suggest an emergency (chest pain, stroke, severe breathing issues), urgently tell the user to call 102 immediately.
• Never diagnose definitively — always say "this may indicate" or "you should consult a doctor".
• Be warm, supportive, and avoid medical jargon.
• The platform is based in Nepal; be culturally sensitive and mention NPR pricing when relevant.${langInstruction}${patientInfo}`
            }],
        },
        {
            role: 'model',
            parts: [{
                text: lang === 'ne'
                    ? 'बुझेँ। म QureHealth AI हुँ, Qurehealth.AI मा बिरामीहरूलाई सहानुभूतिपूर्ण र सटीक स्वास्थ्य मार्गदर्शनमा सहयोग गर्न तयार छु।'
                    : 'Understood. I am QureHealth AI, ready to assist patients on Qurehealth.AI with empathetic, accurate, and concise medical guidance.'
            }],
        },
    ];
}

/* ─────────────────────────────────────────────
   Build patient context string from profile
───────────────────────────────────────────── */
function buildPatientContext(patient) {
    if (!patient) return '';
    const parts = [];
    if (patient.name) parts.push(`Name: ${patient.name}`);
    if (patient.gender) parts.push(`Gender: ${patient.gender}`);
    if (patient.dateOfBirth) {
        const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        parts.push(`Age: ${age} years`);
    }
    if (patient.bloodType) parts.push(`Blood Type: ${patient.bloodType}`);
    if (patient.allergies) parts.push(`Known Allergies: ${patient.allergies}`);
    if (patient.medicalConditions) parts.push(`Medical Conditions: ${patient.medicalConditions}`);
    if (patient.currentMedications) parts.push(`Current Medications: ${patient.currentMedications}`);
    return parts.join('\n');
}

/* ═════════════════════════════════════════════
   POST /api/chat — STREAMING AI CHAT
   Features: streaming SSE, multi-turn history,
   context-aware, language support, MongoDB save
═════════════════════════════════════════════ */
const chatWithAI = async (req, res) => {
    try {
        const { message, history = [], sessionId = null, lang = 'en' } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // ── Get patient context if authenticated ──
        let patientContext = '';
        let patientId = null;
        if (req.user?.id) {
            patientId = req.user.id;
            try {
                const patient = await Patient.findById(patientId).lean();
                patientContext = buildPatientContext(patient);
            } catch { /* non-critical — proceed without context */ }
        }

        // ── Build system prompt with language & patient context ──
        const systemHistory = buildSystemPrompt({ lang, patientContext });
        const fullHistory = [...systemHistory, ...history];

        // ── Start Gemini chat ──
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const chat = model.startChat({
            history: fullHistory,
            generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.7,
            },
        });

        // ── Stream the response via SSE ──
        const result = await chat.sendMessageStream(message);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        let fullText = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        }

        // ── Detect specialty & emergency in the full response ──
        const suggestedSpecialty = detectSpecialty(fullText);
        const isEmergency = /emergency|call\s*102|ambulance|chest\s*pain|stroke|heart\s*attack/i.test(fullText);

        // ── Save to MongoDB if user is authenticated ──
        let newSessionId = sessionId;
        if (patientId) {
            try {
                const userMessage = { role: 'user', text: message };
                const aiMessage = { role: 'ai', text: fullText, isEmergency, suggestedSpecialty };

                if (sessionId) {
                    await ChatSession.findOneAndUpdate(
                        { _id: sessionId, patientId },
                        {
                            $push: { messages: { $each: [userMessage, aiMessage] } },
                            $set: { updatedAt: new Date(), lang },
                        }
                    );
                } else {
                    const session = await ChatSession.create({
                        patientId,
                        lang,
                        messages: [userMessage, aiMessage],
                    });
                    newSessionId = session._id;
                    res.write(`data: ${JSON.stringify({ sessionId: session._id })}\n\n`);
                }
            } catch (err) {
                console.error('Chat history save error:', err.message);
            }
        }

        // ── Send completion event with metadata ──
        res.write(`data: ${JSON.stringify({
            done: true,
            suggestedSpecialty,
            isEmergency,
        })}\n\n`);

        res.end();

    } catch (error) {
        // Graceful handling for Gemini rate-limit / quota errors
        const isQuotaError = error.status === 429 || /quota|rate.limit|too many requests/i.test(error.message);
        if (isQuotaError) {
            console.warn('Gemini quota/rate limit hit — returning friendly message to client');
        } else {
            console.error('Gemini API Error:', error.message);
        }

        if (res.headersSent) {
            const errMsg = isQuotaError
                ? 'The AI assistant is temporarily busy. Please try again in a minute.'
                : 'AI response failed mid-stream';
            res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
            return res.end();
        }
        res.status(isQuotaError ? 429 : 500).json({
            success: false,
            message: isQuotaError
                ? 'The AI assistant is temporarily busy. Please try again in a minute.'
                : 'Failed to get response from AI',
        });
    }
};

/* ═════════════════════════════════════════════
   GET /api/chat/history — LIST CHAT SESSIONS
═════════════════════════════════════════════ */
const getChatHistory = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ patientId: req.user.id })
            .select('title lang createdAt updatedAt messages')
            .sort({ updatedAt: -1 })
            .limit(30)
            .lean();

        const result = sessions.map(s => ({
            _id: s._id,
            title: s.title,
            lang: s.lang,
            messageCount: s.messages.length,
            lastMessage: s.messages[s.messages.length - 1]?.text?.substring(0, 80) || '',
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
};

/* ═════════════════════════════════════════════
   GET /api/chat/session/:id — GET SESSION DETAIL
═════════════════════════════════════════════ */
const getChatSession = async (req, res) => {
    try {
        const session = await ChatSession.findOne({
            _id: req.params.id,
            patientId: req.user.id,
        }).lean();

        if (!session) {
            return res.status(404).json({ success: false, message: 'Chat session not found' });
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error('Get chat session error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat session' });
    }
};

/* ═════════════════════════════════════════════
   DELETE /api/chat/session/:id — DELETE SESSION
═════════════════════════════════════════════ */
const deleteChatSession = async (req, res) => {
    try {
        const result = await ChatSession.findOneAndDelete({
            _id: req.params.id,
            patientId: req.user.id,
        });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Chat session not found' });
        }

        res.status(200).json({ success: true, message: 'Chat session deleted' });
    } catch (error) {
        console.error('Delete chat session error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete chat session' });
    }
};

module.exports = {
    chatWithAI,
    getChatHistory,
    getChatSession,
    deleteChatSession,
};
