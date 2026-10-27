# My Smart AI — Hinglish Creative & Productivity Assistant

An advanced, friendly AI companion designed for seamless natural Hinglish conversation, helping creators effortlessly craft video animation prompts, music and audio concepts, creative ideas, and daily productivity workflows.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Server-Side API Key Security**: We upgraded the prototype from client-side key entry to our recommended secure full-stack approach. The API key is securely handled by the backend server using the environment secret (`process.env.GEMINI_API_KEY`), so you never have to manually expose or paste your API key in the browser.

- **Confirmed Decision 1 (Language & Persona)**: Friendly, energetic creative partner communicating in natural, relatable conversational Hinglish (mixing Hindi and English naturally just like everyday creator conversations).
- **Confirmed Decision 2 (Specialized Creative Tools)**: Quick-action studio presets for Video Animation Prompts (camera movements, lighting, motion tags for Sora/Runway/Luma), Music Concepts (lyrics, genre, mood, tempo, Suno/Udio styles), and Daily Task Management alongside freeform conversation.
- **Confirmed Decision 3 (Visual Atmosphere)**: Sleek, high-contrast dark studio interface (`#0B0F19` deep space navy canvas with `#1E293B` structural slate surfaces and radiant sky blue / cyan accents) matching the user's prototype aesthetic while elevating it to a responsive, production-ready workspace.

---

## 1. Overview & Core Concept

- **What It Does**: A comprehensive conversational AI workspace that speaks natural Hinglish, offering instant one-click prompts for video animations, song lyrics and music arrangements, creative brainstorming, and smart task organization.
- **Target Audience / Persona**: Content creators, YouTubers, video editors, music producers, and daily power users who think and work in Hinglish and want rapid, high-caliber creative ideation without tedious prompt engineering.
- **Key Value**: Bridges the gap between raw creative ideas and high-performance production prompts, with natural bilingual rapport, persistent chat history, and one-click copyable formatted outputs.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Welcome & Zero-State**: Greets the user warmly in Hinglish (`"Namaste! Main aapka personal AI Assistant hoon. Bataiye aaj kya banayein—video prompt, song idea, ya daily task?"`).
2. **Quick Prompt Inspiration Bar**: Interactive studio chips for immediate actions:
   - 🎬 *Video Prompt Generator*: Sora/Runway-ready prompts with cinematic camera moves, lighting, fps, and atmospheric details.
   - 🎵 *Music Concept Studio*: Suno/Udio prompt blueprints, song structures (Hook, Verse, Drop), BPM, and bilingual lyrics.
   - 💡 *Creative Brainstormer*: YouTube video concepts, viral hook formulas, storyboards, and script outlines.
   - 📋 *Daily Task Solver*: Task prioritization, daily planner breakdown, email drafts, and quick problem solving.
3. **Conversational Stream & Interaction**: Smooth real-time message stream with markdown formatting, syntax highlighting, quick copy-to-clipboard buttons, and Hinglish audio TTS read-aloud playback.
4. **Conversation Management**: Clear chat, export conversation, and quick mode switches directly in the studio.

### Visual Identity & Theme
- **Color Palette & Discipline**:
  - *60% Dominant Canvas*: Deep cosmic dark `#090D16` and dark slate `#0F172A`.
  - *30% Structural Surfaces*: Subtle slate containers `#1E293B` with hairline borders (`rgba(255,255,255,0.08)`).
  - *10% Radiant Accents*: Vibrant Sky Blue `#38BDF8` and Indigo `#6366F1` concentrated at interactive focus states and primary send buttons.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` with balanced tracking.
  - Body & Hinglish Prose: `DM Sans` for crisp legibility and natural rhythm.
  - Telemetry & Prompts: `JetBrains Mono` with `tabular-nums` for code, technical prompt tokens, and timestamps.
- **Anti-Slop Discipline**: No decorative pulsing dots, no fake system latency tags, no static pill badge sandwiches. Clean unboxed metadata with subtle typographic separators (`·`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express Server with Gemini 3.8 Flash**
  - *Chosen Approach*: Node/Express backend (`server.ts`) proxying requests to `@google/genai` using `gemini-3.8-flash`.
  - *Why*: Injects the user's API key securely on the server side without browser exposure, supports robust error handling, and conforms to Google AI Studio best practices.
  - *Alternatives Considered*: Client-side API key input was rejected due to security risks and environment constraints.

- **Decision 2: Rich Dual-Mode Interface (Chat + Studio Quick Generators)**
  - *Chosen Approach*: Unified chat view paired with an accessible top studio bar and expandable quick generator drawers for specialized prompts (Video / Music / Tasks).
  - *Why*: Users can either chat freely in Hinglish or use guided form fields to build complex video camera movements or music arrangements without typing long prompts from scratch.

- **Decision 3: Local Storage Persistence with Instant Export**
  - *Chosen Approach*: Store session messages and custom presets in browser `localStorage` with JSON/Markdown export.
  - *Why*: Zero-latency persistence across browser reloads without requiring complex database logins.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Viewport                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Top Bar: Wordmark · Studio Mode · Session Clear      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Quick Studio Drawers (Video / Music / Ideas / Tasks) │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Scrollable Chat Feed (User & Hinglish AI Responses)   │  │
│  │  - Markdown rendering & code/prompt copy blocks       │  │
│  │  - Optional Audio TTS Playback (Web Speech / Gemini)  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Prompt Input Area + Multi-line Autosize + Send CTA   │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ POST /api/chat (JSON payload)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Full-Stack Express API                   │
│                                                             │
│  - System Prompt: Hinglish Conversational Companion & Pro  │
│  - Environment Secret: GEMINI_API_KEY                       │
│  - Google GenAI SDK: ai.models.generateContent             │
│    Model: 'gemini-3.8-flash'                                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (Authenticated)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini 3.8 API                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Model & Key Entities
- **Message**: `{ id: string, role: 'user' | 'assistant', content: string, timestamp: number, category?: 'general' | 'video' | 'music' | 'task' }`
- **StudioPreset**: `{ id: string, title: string, category: string, templatePrompt: string, icon: string }`
- **ChatSession**: `{ id: string, title: string, messages: Message[], createdAt: number }`

### Interactive Component & State Mapping
- `App.tsx`: Manages active conversation, category filters, and message state.
- `StudioToolbar`: Quick category triggers (Video Animation, Music Concept, Brainstorming, Daily Task).
- `ChatStream`: Auto-scrolling transcript with copyable prompt cards and audio speech playback.
- `InputBar`: Responsive textarea with shortcut buttons, keyboard shortcuts (`Enter` to send, `Shift+Enter` for newline), and active loading indicator.
- `server.ts`: Express endpoint `/api/chat` with robust system instructions enforcing warm, culturally attuned Hinglish, creative video direction formatting, and structured task breakdown.
