const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/ChatSession');
const Patient = require('../models/Patient');
const { retrieveFromPDF } = require('../rag/ragHelper');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ─────────────────────────────────────────────
   Response Cache (saves tokens + speeds up repeated questions)
───────────────────────────────────────────── */
const responseCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

function getCacheKey(message, lang = 'en') {
    return `${message.trim().toLowerCase()}:${lang}`;
}

function getCachedResponse(message, lang) {
    const key = getCacheKey(message, lang);
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[CACHE] ✅ Hit for: "${message.slice(0, 40)}"`);
        return cached.response;
    }
    if (cached) responseCache.delete(key); // Expired
    return null;
}

function setCachedResponse(message, response, lang) {
    const key = getCacheKey(message, lang);
    responseCache.set(key, { response, timestamp: Date.now() });
}

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
        ? `\n\n--- PATIENT CONTEXT ---\n${patientContext}\n--- END PATIENT CONTEXT ---`
        : '';

    return [
        {
            role: 'user',
            parts: [{
                text: `You are QureHealth AI — a friendly health assistant for Qurehealth.AI platform.

YOUR BEHAVIOUR:
• For greetings (hi, hello, how are you): respond warmly and ask how you can help.
• For booking questions: guide them to use the "Book Appointment" button or browse doctors.
• For general health questions: give a helpful 2-3 line answer and suggest consulting a doctor.
• For emergencies (chest pain, stroke, breathing issues): say "Call 102 immediately".
• Always be helpful, friendly and complete your sentences fully.
• Never cut off mid-sentence.${langInstruction}${patientInfo}`
            }],
        },
        {
            role: 'model',
            parts: [{
                text: lang === 'ne'
                    ? 'नमस्ते! म QureHealth AI हुँ। तपाईंलाई कसरी मद्दत गर्न सक्छु?'
                    : 'Hello! I am QureHealth AI, your health assistant. How can I help you today?'
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

/* ─────────────────────────────────────────────
   Detect if message is a medical question
   Returns true only for medical queries
   so greetings/booking go straight to Gemini
───────────────────────────────────────────── */
const MEDICAL_KEYWORDS = /symptom|disease|condition|treatment|medicine|drug|surgery|pain|fever|cough|infection|cancer|diabetes|blood|heart|brain|lung|kidney|liver|bone|skin|eye|ear|throat|stomach|chest|headache|allerg|diagnos|dose|prescription|vitamin|vaccine|prognosis|definition|abscess|abortion|cervix|anatomy|procedure|therapy|wound|fracture|tumor|virus|bacteria|injury|syndrome|disorder|chronic|acute|benign|malignant|diagnosis|anatomy|organ|nerve|muscle|artery|vein|hormone|antibiot|inflammat|incision|drainage|swallow|digest|nausea|vomit|diarrhea|constipat|breath|respir|bleed|fracture|sprain|rash|itch|swell|dizzy|faint|seizure|paralys|numb|weak|fatigue|insomnia|depress|anxiety|psych|mental|bone|joint|spine|dental|gum|teeth|urin|bowel|stool|period|menstrual|pregnan|labor|birth|infant|pediatr|elder|geriatr|medic|clinic|hospital|doctor|physician|nurse|specialist|diagnos|prescri|tablet|capsule|injection|vaccine|dose|mg|ml/i;

function isMedicalQuestion(text) {
    return MEDICAL_KEYWORDS.test(text);
}

/* ═════════════════════════════════════════════
   POST /api/chat — STREAMING AI CHAT
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
            } catch { /* non-critical */ }
        }

        // ── SSE headers ──
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        // ── CHECK CACHE FIRST ──
        const cachedResponse = getCachedResponse(message, lang);
        if (cachedResponse) {
            for (const char of cachedResponse.text) {
                res.write(`data: ${JSON.stringify({ chunk: char })}\n\n`);
            }
            res.write(`data: ${JSON.stringify({ done: true, source: 'cache', suggestedSpecialty: cachedResponse.specialty, isEmergency: cachedResponse.isEmergency })}\n\n`);
            return res.end();
        }

        // ── STEP 1: Is this a medical question? ──
        const medicalQuery = isMedicalQuestion(message);

        // ── STEP 2: Only search PDF for medical questions ──
        let ragChunks = [];
        if (medicalQuery) {
            try {
                const ragResult = await retrieveFromPDF(message);
                if (!ragResult.fallback && ragResult.chunks?.length > 0) {
                    // Only use chunks with a good relevance score (lower = better in L2 distance)
                    ragChunks = ragResult.chunks.filter(c => c.score < 1.2);
                    console.log(`[RAG] Found ${ragChunks.length} relevant chunk(s) for medical query`);
                }
            } catch (ragErr) {
                console.warn('[RAG] Retrieval skipped:', ragErr.message);
            }
        } else {
            console.log('[RAG] Skipped — not a medical question');
        }

        // ── STEP 3: If good PDF match found → use Gemini to write a clean answer from PDF context ──
        if (ragChunks.length > 0) {
            console.log('[RAG] ✅ Polishing PDF chunks with Gemini');

            const rawContext = ragChunks.map(c => c.text).join('\n\n');

            const ragPrompt = `You are QureHealth AI, a friendly medical assistant.
Use ONLY the medical reference text below to answer the user's question in clear, easy-to-read language.
- Write in complete sentences.
- Use simple headings if helpful (e.g. **Definition**, **Treatment**).
- Remove any page numbers, timestamps, or file metadata from the source text.
- Keep the answer concise but complete (3-6 sentences or bullet points).
- End by suggesting the user consult a doctor if needed.

--- MEDICAL REFERENCE ---
${rawContext}
--- END REFERENCE ---

User question: ${message}`;

            const safetySettings = [
                { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ];

            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', safetySettings });

            let fullText = '';
            try {
                const result = await model.generateContentStream({
                    contents: [{ role: 'user', parts: [{ text: ragPrompt }] }],
                    generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
                });
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    fullText += chunkText;
                    res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
                }
            } catch (ragGeminiErr) {
                const isQuotaError = ragGeminiErr.status === 429 || /quota|rate.limit|too many|429/i.test(ragGeminiErr.message);
                if (isQuotaError) {
                    console.warn('[RAG] Quota hit — using cleaned PDF chunks');
                } else {
                    console.warn('[RAG] Gemini polish failed:', ragGeminiErr.message);
                }
                // Fall back to cleaned raw text (no tokens used)
                fullText = rawContext
                    .split('\n')
                    .filter(line => !/^\s*GEM\s*-|Page \d+|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line))
                    .join('\n')
                    .trim();
                res.write(`data: ${JSON.stringify({ chunk: fullText })}\n\n`);
            }

            const suggestedSpecialty = detectSpecialty(fullText);
            const isEmergency = /emergency|call\s*102|ambulance|chest\s*pain|stroke|heart\s*attack/i.test(fullText);

            // Save to MongoDB
            if (patientId) {
                try {
                    const userMsg = { role: 'user', text: message };
                    const aiMsg  = { role: 'ai', text: fullText, isEmergency, suggestedSpecialty };
                    if (sessionId) {
                        await ChatSession.findOneAndUpdate(
                            { _id: sessionId, patientId },
                            { $push: { messages: { $each: [userMsg, aiMsg] } }, $set: { updatedAt: new Date(), lang } }
                        );
                    } else {
                        const session = await ChatSession.create({ patientId, lang, messages: [userMsg, aiMsg] });
                        res.write(`data: ${JSON.stringify({ sessionId: session._id })}\n\n`);
                    }
                } catch (err) { console.error('Chat history save error:', err.message); }
            }

            // ── Cache the response ──
            setCachedResponse(message, { text: fullText, specialty: suggestedSpecialty, isEmergency }, lang);

            res.write(`data: ${JSON.stringify({ done: true, suggestedSpecialty, isEmergency, source: 'pdf+gemini' })}\n\n`);
            return res.end();
        }

        // ── STEP 4: No PDF match OR not medical → use Gemini ──
        console.log('[Gemini] Using Gemini for general/greeting/booking question');

        const systemHistory = buildSystemPrompt({ lang, patientContext });
        const fullHistory   = [...systemHistory, ...history];

        const safetySettings = [
            { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ];

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', safetySettings });
        const chat  = model.startChat({
            history: fullHistory,
            generationConfig: {
                maxOutputTokens: 300,   // enough for complete sentences
                temperature: 0.5,
            },
        });

        let fullText = '';
        try {
            const result = await chat.sendMessageStream(message);
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
            }
        } catch (streamErr) {
            const isQuotaError = streamErr.status === 429 || /quota|rate.limit|too many|429/i.test(streamErr.message);
            if (!isQuotaError) {
                console.warn('[Gemini] Streaming failed, trying non-stream:', streamErr.message);
            }
            try {
                const response = await chat.sendMessage(message);
                fullText = response.response.text();
                res.write(`data: ${JSON.stringify({ chunk: fullText })}\n\n`);
            } catch (fallbackErr) {
                const quotaErr = fallbackErr.status === 429 || /quota|rate.limit|too many|429/i.test(fallbackErr.message);
                if (quotaErr) {
                    console.warn('[Gemini] Quota hit — returning generic message');
                    fullText = '⏰ AI is temporarily busy. Your quota has been reached for today. Please try again after a few hours. For urgent health concerns, please contact a doctor directly.';
                } else {
                    throw fallbackErr;
                }
            }
        }

        const suggestedSpecialty = detectSpecialty(fullText);
        const isEmergency = /emergency|call\s*102|ambulance|chest\s*pain|stroke|heart\s*attack/i.test(fullText);

        // Save to MongoDB
        if (patientId) {
            try {
                const userMsg = { role: 'user', text: message };
                const aiMsg  = { role: 'ai', text: fullText, isEmergency, suggestedSpecialty };
                if (sessionId) {
                    await ChatSession.findOneAndUpdate(
                        { _id: sessionId, patientId },
                        { $push: { messages: { $each: [userMsg, aiMsg] } }, $set: { updatedAt: new Date(), lang } }
                    );
                } else {
                    const session = await ChatSession.create({ patientId, lang, messages: [userMsg, aiMsg] });
                    res.write(`data: ${JSON.stringify({ sessionId: session._id })}\n\n`);
                }
            } catch (err) { console.error('Chat history save error:', err.message); }
        }

        // ── Cache the response ──
        setCachedResponse(message, { text: fullText, specialty: suggestedSpecialty, isEmergency }, lang);

        res.write(`data: ${JSON.stringify({ done: true, suggestedSpecialty, isEmergency, source: 'gemini' })}\n\n`);
        res.end();

    } catch (error) {
        const isQuotaError = error.status === 429 || /quota|rate.limit|too many requests/i.test(error.message);
        console.error('Chat error:', isQuotaError ? 'Gemini quota hit' : error.message);
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: isQuotaError ? 'AI is temporarily busy, please try again.' : 'Error processing request' })}\n\n`);
            return res.end();
        }
        res.status(500).json({ success: false, message: 'Failed to get AI response' });
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
