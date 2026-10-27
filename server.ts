import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const BASE_SYSTEM_PROMPT = `You are "My Smart AI", an advanced, friendly, witty, and exceptionally creative AI assistant and studio partner.
You always converse naturally in authentic, energetic Hinglish (natural mix of Hindi and English written in Latin script, exactly how modern creators and youth talk, e.g., "Arre waah!", "Bhai ye concept ekdum blockbuster hai!", "Chalo isko step-by-step break karte hain").

Your superpowers:
1. Video Animation Prompts (for Sora, Runway Gen-3, Luma Dream Machine, Kling, Pika, Midjourney video):
   - Provide rich, hyper-detailed prompt breakdowns:
     • Visual Scene & Subject Focus
     • Camera Movement & Angle (e.g., slow dolly zoom, low-angle tracking shot, high-speed FPV drone dive, Dutch angle, 35mm anamorphic lens)
     • Lighting & Atmosphere (e.g., cinematic volumetric golden hour haze, neon rain reflections, moody chiaroscuro)
     • Motion Dynamics, Speed & Physics
     • Ready-to-copy Master Prompt inside a code block!
2. Music & Audio Concepts (for Suno, Udio, Songwriting, Beatmaking):
   - Provide complete production concepts:
     • Genre & Fusion Style (e.g., Desi Lo-Fi Hip Hop, Cinematic Bollywood Synthwave, Punjabi Drill, Acoustic Sufi Indie)
     • Mood, BPM/Tempo, and Key
     • Instruments & Production Texture
     • Structured bilingual lyrics ([Intro], [Verse 1], [Pre-Chorus], [Chorus/Hook], [Drop/Bridge], [Outro])
     • Ready-to-copy AI Music Prompt tag
3. Creative Ideation & Content Strategy:
   - Viral YouTube/Reel hooks (first 3 seconds attention-grabber)
   - Visual storyboards, plot twists, catchy brand taglines, and marketing angles
4. Daily Tasks & Problem Solving:
   - Practical, realistic time-blocked action steps
   - Pre-written email drafts, professional WhatsApp replies, and decision frameworks

Tone Guidelines:
- Be warm, encouraging, smart, and direct.
- Never give dry robotic answers. Infuse personality, practical pro-tips, and clear formatting (bold text, clean bullet points, code blocks for copyable prompts).
- If the user talks in pure English or pure Hindi, you still maintain a friendly bilingual Hinglish flavor unless they explicitly ask for another language.
- Never ask the user to provide or configure an API key.`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Helper to get Gemini client dynamically
function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, category } = req.body;
    const clientKey = req.headers['x-gemini-key'] as string | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const aiClient = getGeminiClient(clientKey);
    if (!aiClient) {
      return res.status(401).json({
        error: 'Gemini API Key missing. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
      });
    }

    let categoryInstruction = '';
    if (category === 'video') {
      categoryInstruction = '\n\nFocus specifically on cinematic Video Animation prompts with camera movement, lighting, motion dynamics, and copyable prompt blocks.';
    } else if (category === 'music') {
      categoryInstruction = '\n\nFocus specifically on Music Concepts, BPM, instrumentation, genre style tags, and catchy structured lyrics.';
    } else if (category === 'task') {
      categoryInstruction = '\n\nFocus specifically on Daily Task solving: clear prioritised checklist, time estimates, and actionable solution drafts.';
    } else if (category === 'ideas') {
      categoryInstruction = '\n\nFocus specifically on viral creative brainstorming, unique angles, story hooks, and out-of-the-box concepts.';
    }

    // Sanitize contents for Gemini API:
    // 1. Filter out empty or error messages
    // 2. Map role 'assistant' -> 'model', 'user' -> 'user'
    // 3. Drop any leading 'model' messages (Gemini requires the first turn to be 'user')
    // 4. Merge consecutive same-role messages
    const rawContents = messages
      .filter((m: any) => m && m.content && typeof m.content === 'string' && !m.error)
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content.trim() }],
      }))
      .filter((m: { parts: { text: string }[] }) => m.parts[0].text.length > 0);

    // Drop leading model messages
    while (rawContents.length > 0 && rawContents[0].role === 'model') {
      rawContents.shift();
    }

    if (rawContents.length === 0) {
      return res.status(400).json({ error: 'No valid user messages found.' });
    }

    // Ensure valid alternating turns
    const sanitizedContents: typeof rawContents = [];
    for (const item of rawContents) {
      if (sanitizedContents.length === 0) {
        sanitizedContents.push(item);
      } else {
        const last = sanitizedContents[sanitizedContents.length - 1];
        if (last.role === item.role) {
          // Merge consecutive same-role messages
          last.parts[0].text += `\n\n${item.parts[0].text}`;
        } else {
          sanitizedContents.push(item);
        }
      }
    }

    // Attempt generation with primary model and automatic fallback on 503/high demand
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let replyText = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: sanitizedContents,
          config: {
            systemInstruction: BASE_SYSTEM_PROMPT + categoryInstruction,
            temperature: 0.8,
            topP: 0.95,
          },
        });

        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Attempt with ${modelName} failed:`, err.status || err.message);
        lastError = err;
        // If 401 or 403, key is unauthorized; do not loop endlessly
        if (err.status === 401 || err.status === 403) {
          break;
        }
      }
    }

    if (!replyText && lastError) {
      const statusCode = lastError.status || 500;
      let errorMsg = lastError.message || 'Error occurred while contacting Gemini.';
      if (statusCode === 401 || statusCode === 403) {
        errorMsg = 'API Key unauthorized (401/403). Please verify your Gemini API key in Settings > Secrets.';
      }
      return res.status(statusCode).json({ error: errorMsg });
    }

    const reply = replyText || 'Maaf karna dost, main jawab generate nahi kar paya. Ek baar dobara try karein?';

    res.json({
      reply,
      category: category || 'general',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Server-side error occurred while communicating with Gemini.',
    });
  }
});

// Dedicated structured prompt generator endpoint
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { type, details } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API Key is not configured on the server.',
      });
    }

    let promptContext = '';
    if (type === 'video') {
      promptContext = `User wants a top-tier cinematic video animation prompt.
Scene details: ${details.scene || 'Epic visual sequence'}
Camera Movement: ${details.camera || 'Dynamic cinematic tracking'}
Visual Style: ${details.style || 'Photorealistic 4K cinematic'}
Lighting & Mood: ${details.lighting || 'Golden hour dramatic volumetric rays'}
Platform: ${details.platform || 'Sora / Runway Gen-3 / Luma'}

Generate:
1. Quick friendly Hinglish reaction and creative feedback.
2. Structured breakdown (Scene, Camera Move, Lighting, Physics & Motion).
3. The Single Master Copy-Paste Prompt ready for AI Video Generator (in a markdown code block).
4. Pro-tips for best generation results.`;
    } else if (type === 'music') {
      promptContext = `User wants an original music production concept & lyrics.
Genre/Vibe: ${details.genre || 'Indie Pop Lo-Fi'}
Mood: ${details.mood || 'Nostalgic romantic'}
Tempo (BPM): ${details.bpm || '95 BPM'}
Language/Topic: ${details.topic || 'Midnight thoughts & city rain'}

Generate:
1. Quick friendly Hinglish intro.
2. Production blueprint (Key, BPM, Instruments, Sound design tips).
3. Ready-to-use Style Prompt for Suno / Udio (in a code block).
4. Full song structure with catchy bilingual Hinglish lyrics: [Intro], [Verse 1], [Chorus/Hook], [Drop], [Outro].`;
    } else if (type === 'task') {
      promptContext = `User needs help solving a daily task or planning workflow.
Task goal: ${details.task || 'Daily planning'}
Time available: ${details.timeAvailable || 'Today'}
Priority: ${details.priority || 'High'}

Generate:
1. Quick encouraging Hinglish breakdown.
2. Action Checklist with realistic time blocks.
3. Pre-written quick template (e.g. Email / Message / Outline if needed).
4. Instant next step to do right now in 5 minutes.`;
    } else {
      promptContext = `User needs creative brainstorming for: ${JSON.stringify(details)}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: promptContext }] }],
      config: {
        systemInstruction: BASE_SYSTEM_PROMPT,
        temperature: 0.85,
      },
    });

    res.json({
      result: response.text,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in prompt generation:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate prompt.',
    });
  }
});

// 1. Veo Video Generation (Text to Video & Image to Video)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType, aspectRatio, resolution } = req.body;
    const apiKey = (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required for video generation.' });
    }

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required.' });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const targetRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
    const targetResolution = resolution === '1080p' ? '1080p' : '720p';

    // Model: veo-3.1-fast-generate-preview (with fallback to veo-3.1-lite-generate-preview)
    const videoModels = ['veo-3.1-fast-generate-preview', 'veo-3.1-lite-generate-preview', 'veo-3.1-generate-preview'];
    let operation: any = null;
    let lastErr: any = null;

    for (const model of videoModels) {
      try {
        const payload: any = {
          model,
          prompt: prompt || 'Animate this scene with natural cinematic motion and high visual fidelity',
          config: {
            numberOfVideos: 1,
            resolution: targetResolution,
            aspectRatio: targetRatio,
          },
        };

        if (imageBase64) {
          // Clean base64 prefix if present
          const cleanBytes = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
          payload.image = {
            imageBytes: cleanBytes,
            mimeType: mimeType || 'image/png',
          };
        }

        operation = await aiClient.models.generateVideos(payload);
        if (operation?.name) break;
      } catch (err: any) {
        console.warn(`Video generation failed on model ${model}:`, err.message);
        lastErr = err;
        if (err.status === 403 || err.status === 400) break;
      }
    }

    if (!operation?.name) {
      const isPaidKeyIssue =
        lastErr?.status === 403 ||
        lastErr?.status === 400 ||
        lastErr?.message?.includes('quota') ||
        lastErr?.message?.includes('billing') ||
        lastErr?.message?.includes('Permission');

      return res.status(lastErr?.status || 500).json({
        error: lastErr?.message || 'Failed to start video generation.',
        requiresPaidKey: isPaidKeyIssue,
      });
    }

    res.json({
      operationName: operation.name,
      aspectRatio: targetRatio,
    });
  } catch (error: any) {
    console.error('Error starting video generation:', error);
    res.status(500).json({
      error: error.message || 'Error occurred starting video generation.',
    });
  }
});

// 2. Poll Video Operation Status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    const apiKey = (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;

    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await aiClient.operations.getVideosOperation({ operation: op });

    res.json({
      done: Boolean(updated.done),
      error: updated.error,
    });
  } catch (error: any) {
    console.error('Error polling video operation:', error);
    res.status(500).json({ error: error.message || 'Error polling video operation' });
  }
});

// 3. Download / Stream Finished Video
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    const apiKey = (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;

    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await aiClient.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found or video not ready yet.' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey! },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to download generated video.' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: error.message || 'Error downloading video' });
  }
});

// 4. Lyria Music Generation (Clip <= 30s or Pro Full-Length)
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt, isClip } = req.body;
    const apiKey = (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required for music generation.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Music prompt is required.' });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    // Short clips up to 30s: lyria-3-clip-preview, Full-length: lyria-3-pro-preview
    const model = isClip !== false ? 'lyria-3-clip-preview' : 'lyria-3-pro-preview';

    try {
      const responseStream = await aiClient.models.generateContentStream({
        model,
        contents: prompt,
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        throw new Error('No audio returned in Lyria stream.');
      }

      res.json({
        audioBase64,
        mimeType,
        lyrics,
        model,
        duration: isClip !== false ? 30 : 120,
      });
    } catch (modelErr: any) {
      console.warn('Lyria direct music generation encountered error:', modelErr.message);

      const isPaidKeyIssue =
        modelErr.status === 403 ||
        modelErr.status === 400 ||
        modelErr.message?.includes('quota') ||
        modelErr.message?.includes('billing') ||
        modelErr.message?.includes('Permission') ||
        modelErr.message?.includes('not found');

      // Generate a rich fallback song blueprint with Gemini 3.8 Flash
      const blueprintResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a complete song blueprint and lyrics in Hinglish for: "${prompt}".
Include BPM, musical key, instruments, and structured lyrics ([Intro], [Verse 1], [Chorus], [Drop], [Outro]).`,
      });

      return res.status(200).json({
        requiresPaidKey: isPaidKeyIssue,
        model,
        lyrics: blueprintResponse.text,
        error: modelErr.message,
        message: 'Lyria requires a billing-enabled paid API key. Here is your full song concept and blueprint!',
      });
    }
  } catch (error: any) {
    console.error('Error generating music:', error);
    res.status(500).json({ error: error.message || 'Failed to generate music' });
  }
});

// Setup Vite middleware in development, or serve dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

startServer();
