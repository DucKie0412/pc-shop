import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { message } = await req.json();
    if (!message) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'No Gemini API key set' }, { status: 500 });
    }

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: message }]
            }],
        }),
    });

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    return NextResponse.json({ reply });
} 