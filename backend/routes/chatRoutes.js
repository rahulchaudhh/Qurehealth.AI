const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    chatWithAI,
    getChatHistory,
    getChatSession,
    deleteChatSession,
} = require('../controllers/chatController');

/**
 * POST /api/chat — send message (works for both guests and logged-in users)
 * If an auth token is present, it attaches req.user for context-aware + save.
 * If no token, it still works as a guest chatbot.
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded;
    } catch { /* token invalid — proceed as guest */ }
    next();
};

router.post('/', optionalAuth, chatWithAI);

// ── Authenticated-only endpoints for chat history ──
router.get('/history', auth, getChatHistory);
router.get('/session/:id', auth, getChatSession);
router.delete('/session/:id', auth, deleteChatSession);

module.exports = router;
