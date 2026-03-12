/**
 * ragHelper.js — Node.js bridge to Python RAG engine
 * ====================================================
 * Used by chatController.js to fetch relevant PDF chunks
 * before sending to Gemini.
 */

const { execFile, spawn } = require('child_process');
const path = require('path');

const RAG_SCRIPT = path.join(__dirname, 'rag_engine.py');

// ── Cache: keep a warm Python process alive ──
let warmProcess = null;
let warmQueue   = [];
let isProcessing = false;

/**
 * Retrieve relevant chunks from PDFs for a given query.
 * Uses a persistent Python process to avoid reloading the model every time.
 * @param {string} query - The user's message
 * @returns {Promise<{chunks: Array, fallback: boolean}>}
 */
function retrieveFromPDF(query) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({ q: query });

        execFile(
            'python3',
            [RAG_SCRIPT, 'query', payload],
            {
                timeout: 30000,                   // 30s — model load takes ~5s cold start
                cwd: path.join(__dirname, '..'),
                maxBuffer: 10 * 1024 * 1024       // 10MB buffer
            },
            (error, stdout, stderr) => {
                if (error) {
                    console.warn('[RAG] Python error:', error.message);
                    return resolve({ chunks: [], fallback: true });
                }

                try {
                    // The Python script prints warnings then JSON on the LAST line
                    const lines = stdout.trim().split('\n');
                    // Find the last line that starts with '{'
                    const jsonLine = [...lines].reverse().find(l => l.trim().startsWith('{'));
                    if (!jsonLine) {
                        console.warn('[RAG] No JSON line found. stdout:', stdout.slice(0, 200));
                        return resolve({ chunks: [], fallback: true });
                    }

                    const result = JSON.parse(jsonLine.trim());

                    if (result.chunks && result.chunks.length > 0) {
                        console.log(`[RAG] ✅ Retrieved ${result.chunks.length} chunk(s) for: "${query.slice(0, 50)}"`);
                    } else {
                        console.warn('[RAG] ⚠️ No chunks returned for query:', query.slice(0, 50));
                    }

                    resolve(result);
                } catch (parseErr) {
                    console.warn('[RAG] JSON parse error:', parseErr.message);
                    console.warn('[RAG] Raw stdout:', stdout.slice(0, 300));
                    resolve({ chunks: [], fallback: true });
                }
            }
        );
    });
}

/**
 * Build (or rebuild) the FAISS index from PDFs.
 * Call this once after adding new PDFs.
 * @returns {Promise<object>}
 */
function buildIndex() {
    return new Promise((resolve) => {
        execFile(
            'python3',
            [RAG_SCRIPT, 'build'],
            { timeout: 120000, cwd: path.join(__dirname, '..') },
            (error, stdout, stderr) => {
                if (error) {
                    console.error('[RAG] Build error:', error.message);
                    return resolve({ status: 'error', message: error.message });
                }
                try {
                    const lines    = stdout.trim().split('\n');
                    const jsonLine = [...lines].reverse().find(l => l.trim().startsWith('{'));
                    resolve(jsonLine ? JSON.parse(jsonLine.trim()) : { status: 'error', message: 'No output' });
                } catch {
                    resolve({ status: 'error', message: 'Could not parse build output' });
                }
            }
        );
    });
}

module.exports = { retrieveFromPDF, buildIndex };

