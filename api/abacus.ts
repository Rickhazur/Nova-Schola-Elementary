
import { VercelRequest, VercelResponse } from '@vercel/node';

const ABACUS_API_KEY = process.env.ABACUS_API_KEY;
const ABACUS_BASE_URL = 'https://api.abacus.ai/api/v0/chatLLM';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!ABACUS_API_KEY) {
        console.error('ABACUS_API_KEY is not configured');
        return res.status(500).json({ error: 'Service configuration error' });
    }

    try {
        const { messages, temperature, max_tokens } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "'messages' must be a non-empty array" });
        }

        const response = await fetch(ABACUS_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ABACUS_API_KEY}`,
            },
            body: JSON.stringify({ messages, temperature, max_tokens }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('Abacus API error:', response.status, errorText);
            return res.status(502).json({ error: 'Upstream service error' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (err: any) {
        console.error('Abacus proxy error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
