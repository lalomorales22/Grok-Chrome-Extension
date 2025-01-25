/* 
   server.js
   =========
   Node.js backend server to handle requests to XAI Grok API.
*/

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Check for required environment variable
if (!process.env.XAI_API_KEY) {
    console.warn('Warning: XAI_API_KEY environment variable is not set.');
}

// Grok API integration
const grokClient = axios.create({
    baseURL: 'https://api.x.ai/v1',  // Updated to correct endpoint
    headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// Endpoint for Grok completions
app.post('/api/completion', async (req, res) => {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'No content provided for summarization.' });
    }

    if (!process.env.XAI_API_KEY) {
        return res.status(500).json({ error: 'API key not set on server.' });
    }

    try {
        const response = await grokClient.post('/chat/completions', {
            model: "grok-beta",  // Updated to correct model name
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that creates concise summaries. Keep summaries clear and focused on the main points."
                },
                {
                    role: "user",
                    content: `Please summarize the following text:\n\n${content}`
                }
            ],
            max_tokens: 500
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            return res.json({ 
                success: true,
                summary: response.data.choices[0].message.content 
            });
        } else {
            throw new Error('Unexpected API response structure');
        }
    } catch (err) {
        console.error('Error calling Grok API:', err.response ? err.response.data : err.message);
        return res.status(500).json({ 
            error: 'Failed to retrieve summary from Grok API.',
            details: err.response ? err.response.data : err.message
        });
    }
});

// Endpoint for Grok chat
app.post('/api/chat', async (req, res) => {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'No content provided for chat.' });
    }

    if (!process.env.XAI_API_KEY) {
        return res.status(500).json({ error: 'API key not set on server.' });
    }

    try {
        const response = await grokClient.post('/chat/completions', {
            model: "grok-beta",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that can chat about the summary. Use any 'Context' from the user to inform your answers."
                },
                {
                    role: "user",
                    content
                }
            ],
            max_tokens: 500
        });
        if (response.data && response.data.choices && response.data.choices[0]) {
            return res.json({
                success: true,
                chatReply: response.data.choices[0].message.content
            });
        } else {
            throw new Error('Unexpected API response structure');
        }
    } catch (err) {
        console.error('Error calling Grok API:', err.response ? err.response.data : err.message);
        return res.status(500).json({
            error: 'Failed to retrieve chat response from Grok API.',
            details: err.response ? err.response.data : err.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`XAI Summarizer backend running on http://localhost:${PORT}`);
    console.log('API Key present:', !!process.env.XAI_API_KEY);
});