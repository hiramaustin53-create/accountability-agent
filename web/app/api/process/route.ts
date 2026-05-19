import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { audioUrl } = await req.json();

    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 });
    }

    // 1. Fetch the audio file to send to Groq
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) throw new Error('Failed to download audio from storage');
    const audioBlob = await audioResponse.blob();

    // 2. Send to Groq for Transcription (Whisper)
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-large-v3');

    const groqTranscription = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!groqTranscription.ok) {
      const err = await groqTranscription.text();
      console.error('Groq Transcription Error:', err);
      throw new Error('Groq transcription failed');
    }

    const transcriptionData = await groqTranscription.json();
    const transcriptText = transcriptionData.text;

    // 3. Send Transcript to Groq for Action Extraction (LLM)
    const systemPrompt = `
      You are an expert project manager. Analyze the following meeting transcript.
      1. Provide a brief 'summary' of the meeting.
      2. Extract 'action_items'. Each item must have: 'description', 'assignee' (if mentioned, else 'Unknown'), 'deadline' (if mentioned, else 'TBD').
      Return ONLY valid JSON format: { "summary": "...", "action_items": [{ "description": "...", "assignee": "...", "deadline": "..." }] }
    `;

    const groqLLM = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Fast, free model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcriptText },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqLLM.ok) throw new Error('Groq LLM analysis failed');

    const llmData = await groqLLM.json();
    const content = llmData.choices[0].message.content;
    
    // Parse and return result
    const result = JSON.parse(content);
    
    return NextResponse.json({
      transcript: transcriptText,
      summary: result.summary,
      actions: result.action_items || []
    });

  } catch (error: any) {
    console.error('Process route error:', error);
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  }
}
