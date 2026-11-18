import { GoogleGenAI, Type } from '@google/genai';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateDesignFromPrompt(params: {
  prompt: string;
  category: string;
  width: number;
  height: number;
}) {
  const ai = getAiClient();

  const systemInstruction = `You are an elite graphic designer and typographic director for Nova AI.
Given a user prompt and design category (${params.category}), produce a cohesive, modern, high-contrast visual composition for a ${params.width}x${params.height} canvas.
Return JSON with:
- title: concise 2-4 word project title
- backgroundColor: hex color (deep obsidian, slate, crisp alabaster, or rich editorial tone)
- accentColor: hex color for geometric shapes and highlights
- primaryColor: hex color for primary display typography (must have >= 4.5:1 contrast against backgroundColor)
- secondaryColor: hex color for supporting copy
- headline: crisp impactful display headline (2-6 words max)
- subheadline: supporting tagline or kicker (4-10 words)
- footerLabel: short brand mark or callout (2-4 words)
- fontFamily: one of "Plus Jakarta Sans", "DM Sans", "JetBrains Mono", "Georgia"
- layoutStyle: one of "editorial-split", "center-monolith", "minimal-badge", "bold-diagonal"
- svgIconPath: a single valid SVG <path d="..." /> string in a 0 0 100 100 viewBox representing an abstract geometric emblem relevant to the prompt (clean geometric vector, no text).`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Create a ${params.category} design for: ${params.prompt}`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          backgroundColor: { type: Type.STRING },
          accentColor: { type: Type.STRING },
          primaryColor: { type: Type.STRING },
          secondaryColor: { type: Type.STRING },
          headline: { type: Type.STRING },
          subheadline: { type: Type.STRING },
          footerLabel: { type: Type.STRING },
          fontFamily: { type: Type.STRING },
          layoutStyle: { type: Type.STRING },
          svgIconPath: { type: Type.STRING },
        },
        required: [
          'title',
          'backgroundColor',
          'accentColor',
          'primaryColor',
          'secondaryColor',
          'headline',
          'subheadline',
          'footerLabel',
          'fontFamily',
          'layoutStyle',
          'svgIconPath',
        ],
      },
    },
  });

  const text = (response.text ?? '{}').trim();
  return JSON.parse(text);
}

export async function generateReelScriptFromIdea(params: {
  idea: string;
  tone: string;
  accent: string;
}) {
  const ai = getAiClient();

  const systemInstruction = `You are a viral short-form video director for 9:16 Reels, Shorts, and TikTok.
Create a tightly paced 4-scene vertical video script (~20 seconds total) tailored for a ${params.accent} English narrator in a ${params.tone} tone.
Return JSON with:
- title: concise 3-5 word reel title
- hookScript: the complete spoken voiceover script across all 4 scenes combined (natural, punchy, 45-65 words total, starts with an irresistible 3-second scroll-stopping hook)
- scenes: array of exactly 4 objects, each with:
  - title: short scene label (2-3 words)
  - narration: spoken lines for this scene (10-18 words)
  - caption: ultra-punchy on-screen auto-caption (4-8 words max)
  - durationSec: integer between 4 and 6
  - accentColor: vibrant yet refined hex color
  - visualMood: concise 3-5 word visual direction
  - motionType: one of "zoom-in", "pan-left", "pan-right", "zoom-out"`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Write a viral 9:16 short video reel script for this idea: ${params.idea}`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hookScript: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                narration: { type: Type.STRING },
                caption: { type: Type.STRING },
                durationSec: { type: Type.INTEGER },
                accentColor: { type: Type.STRING },
                visualMood: { type: Type.STRING },
                motionType: { type: Type.STRING },
              },
              required: [
                'title',
                'narration',
                'caption',
                'durationSec',
                'accentColor',
                'visualMood',
                'motionType',
              ],
            },
          },
        },
        required: ['title', 'hookScript', 'scenes'],
      },
    },
  });

  const text = (response.text ?? '{}').trim();
  return JSON.parse(text);
}

export async function generateReelVoiceoverWav(params: {
  text: string;
  voiceName: string;
  speechStyle: string;
}) {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: params.text,
            speechMetadata: {
              style: params.speechStyle,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: params.voiceName },
        },
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        base64Audio: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? 'audio/wav',
      };
    }
  }

  throw new Error('Speech synthesis completed without returning audio data.');
}

export async function generateChatReply(params: {
  message: string;
  mode: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const ai = getAiClient();

  const systemInstruction = `You are Nova AI's Creative Studio Assistant (${params.mode} mode).
Help creators brainstorm graphic design concepts, viral short video hooks, brand copy, color palettes, typography pairings, and campaign ideas.
Keep responses structured, practical, concise, and immediately actionable.`;

  const formattedHistory = params.history.slice(-10).map((msg) => ({
    role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: msg.content }],
  }));

  const chat = ai.chats.create({
    model: 'gemini-4-hydrogen',
    history: formattedHistory,
    config: {
      systemInstruction,
    },
  });

  const response = await chat.sendMessage({
    message: params.message,
  });

  return response.text ?? 'I could not generate a response right now.';
}

export async function translateTextWithGemini(params: {
  text: string;
  targetLanguage: string;
}) {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Translate the following text accurately and naturally into ${params.targetLanguage}. Return only the translated text with no extra commentary:\n\n${params.text}`,
  });

  return (response.text ?? '').trim();
}
