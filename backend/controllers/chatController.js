const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // For text-only input, use the gemini-2.5-flash model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are QureHealth AI, a helpful and empathetic medical assistant. You help patients with symptoms, finding doctors, and general health advice. Keep answers concise (under 100 words) but helpful. If it's an emergency, tell them to call 102 immediately." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am QureHealth AI, ready to assist with medical queries, symptom checking, and doctor recommendations safely and concisely." }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 150,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: text
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get response from AI',
            error: error.message
        });
    }
};

module.exports = {
    chatWithAI
};
