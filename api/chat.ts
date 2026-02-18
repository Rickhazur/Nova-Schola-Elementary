
import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, model, tools, tool_choice, response_format, stream } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Invalid request: 'messages' must be a non-empty array." });
        }

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const streamResponse = await openai.chat.completions.create({
                model: model || "gemini-2.0-flash",
                messages,
                tools,
                tool_choice,
                response_format,
                stream: true,
            });

            for await (const chunk of streamResponse) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }
            res.end();
        } else {
            const completion = await openai.chat.completions.create({
                model: model || "gemini-2.0-flash",
                messages,
                tools,
                tool_choice,
                response_format,
            });

            return res.status(200).json(completion);
        }

    } catch (err: any) {
        console.error("Gemini error:", err);
        return res.status(500).json({ error: "Error calling Gemini", details: err.message });
    }
}
