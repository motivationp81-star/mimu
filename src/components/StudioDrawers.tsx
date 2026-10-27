import React, { useState } from 'react';
import { Clapperboard, Music, CheckSquare, Lightbulb, ChevronDown, ChevronUp, Sparkles, Wand2 } from 'lucide-react';
import { StudioCategory } from '../types';

interface StudioDrawersProps {
  activeCategory: StudioCategory;
  onSelectCategory: (cat: StudioCategory) => void;
  onSubmitPrompt: (text: string, category: StudioCategory) => void;
  isLoading: boolean;
  onOpenVeoModal?: () => void;
  onOpenLyriaModal?: () => void;
}

export const StudioDrawers: React.FC<StudioDrawersProps> = ({
  activeCategory,
  onSelectCategory,
  onSubmitPrompt,
  isLoading,
  onOpenVeoModal,
  onOpenLyriaModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Video state
  const [videoScene, setVideoScene] = useState('');
  const [videoCamera, setVideoCamera] = useState('FPV Drone high-speed swoop with low-angle tilt');
  const [videoStyle, setVideoStyle] = useState('Photorealistic 8K cinematic, 35mm anamorphic');
  const [videoLighting, setVideoLighting] = useState('Neon rain reflections & volumetric mist');
  const [videoPlatform, setVideoPlatform] = useState('Runway Gen-3 / Sora');

  // Music state
  const [musicGenre, setMusicGenre] = useState('Desi Lo-Fi Hip Hop');
  const [musicMood, setMusicMood] = useState('Late night nostalgic & rain ambience');
  const [musicBpm, setMusicBpm] = useState('85 BPM');
  const [musicTopic, setMusicTopic] = useState('');

  // Task state
  const [taskInput, setTaskInput] = useState('');
  const [taskTime, setTaskTime] = useState('2 Hours Sprint');
  const [taskPriority, setTaskPriority] = useState('High Impact First');

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoScene.trim()) return;
    const prompt = `Mujhe ek ultra-cinematic Video Animation prompt chahiye for ${videoPlatform}:
- Scene Concept: ${videoScene.trim()}
- Camera Movement: ${videoCamera}
- Visual Style: ${videoStyle}
- Lighting & Atmosphere: ${videoLighting}

Please provide ready-to-use prompt breakdown, camera physics tags, and the final single-line copy-paste prompt in Hinglish!`;
    onSubmitPrompt(prompt, 'video');
    setVideoScene('');
    setIsOpen(false);
  };

  const handleMusicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = musicTopic.trim() || 'Midnight thoughts, nostalgic city vibes';
    const prompt = `Mujhe ek original Music Concept aur Song Blueprint chahiye:
- Genre / Style: ${musicGenre}
- Mood: ${musicMood}
- Tempo: ${musicBpm}
- Topic / Lyrics theme: ${topic}

Please give Suno/Udio style prompt tags, production texture tips, and structured bilingual Hinglish lyrics ([Intro], [Verse 1], [Chorus/Hook], [Drop], [Outro]).`;
    onSubmitPrompt(prompt, 'music');
    setMusicTopic('');
    setIsOpen(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const prompt = `Bhai meri daily planning aur task solve karne mein help karo:
- My Goal/Task: ${taskInput.trim()}
- Time Available: ${taskTime}
- Strategy: ${taskPriority}

Please break this down into clear time-blocks, give me actionable next steps, and any pre-written message/email draft needed.`;
    onSubmitPrompt(prompt, 'task');
    setTaskInput('');
    setIsOpen(false);
  };

  const handleSparkClick = (ideaText: string) => {
    onSubmitPrompt(ideaText, 'ideas');
  };

  return (
    <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
      {/* Category Quick Tabs Bar */}
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onSelectCategory('general');
              setIsOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'general' && !isOpen
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Chat Dost</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategory('video');
              setIsOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'video'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clapperboard className="h-3.5 w-3.5 text-sky-400" />
            <span>Video Animation Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategory('music');
              setIsOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'music'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Music className="h-3.5 w-3.5 text-indigo-400" />
            <span>Music Concept Lab</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategory('task');
              setIsOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'task'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span>Daily Task Solver</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategory('ideas');
              setIsOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'ideas'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>Brainstorming</span>
          </button>
        </div>

        {/* Quick Generators & Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenVeoModal && (
            <button
              type="button"
              onClick={onOpenVeoModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/30 hover:bg-sky-500/25 transition-all shadow-sm"
              title="Veo 3.1 Video Generation (Text to Video & Image to Video)"
            >
              <Clapperboard className="h-3.5 w-3.5 text-sky-400" />
              <span>Veo 3 Video</span>
            </button>
          )}

          {onOpenLyriaModal && (
            <button
              type="button"
              onClick={onOpenLyriaModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/25 transition-all shadow-sm"
              title="Lyria Music Generation (30s Clips & Full Tracks)"
            >
              <Music className="h-3.5 w-3.5 text-indigo-400" />
              <span>Lyria Music</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition-colors shrink-0"
          >
            <span>{isOpen ? 'Close Tools' : 'Open Tools'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Studio Drawer */}
      {isOpen && (
        <div className="border-t border-slate-800/60 bg-slate-950/70 p-4 transition-all">
          <div className="max-w-4xl mx-auto">
            {/* VIDEO PROMPT GENERATOR */}
            {activeCategory === 'video' && (
              <form onSubmit={handleVideoSubmit} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="h-4 w-4 text-sky-400" />
                    <span className="text-sm font-semibold text-white">Cinematic Video Prompt Builder</span>
                  </div>
                  <span className="text-xs text-slate-400">For Sora · Runway Gen-3 · Luma · Kling</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Visual Scene Concept (Describe the action or subject)
                  </label>
                  <input
                    type="text"
                    value={videoScene}
                    onChange={(e) => setVideoScene(e.target.value)}
                    placeholder="e.g. Futuristic Cyberpunk Varanasi ghats at midnight with neon flying boats..."
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Camera Movement</label>
                    <select
                      value={videoCamera}
                      onChange={(e) => setVideoCamera(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-400"
                    >
                      <option>FPV Drone high-speed swoop with low-angle tilt</option>
                      <option>Slow 360-degree orbit with shallow depth of field</option>
                      <option>Dramatic Hitchcock Vertigo Dolly Zoom</option>
                      <option>High-speed tracking side-profile tracking shot</option>
                      <option>Slow-motion crane descending shot (120fps)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Lighting & Grade</label>
                    <select
                      value={videoLighting}
                      onChange={(e) => setVideoLighting(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-400"
                    >
                      <option>Neon rain reflections & volumetric mist</option>
                      <option>Golden hour warm atmospheric sunlight rays</option>
                      <option>Dramatic high-contrast film noir chiaroscuro</option>
                      <option>Moody overcast Scandinavian mist</option>
                      <option>Cyberpunk electric cyan and magenta glow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Visual Aesthetic</label>
                    <select
                      value={videoStyle}
                      onChange={(e) => setVideoStyle(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-400"
                    >
                      <option>Photorealistic 8K cinematic, 35mm anamorphic</option>
                      <option>Makoto Shinkai anime aesthetic with cloudscapes</option>
                      <option>Hyperrealistic Unreal Engine 5 render</option>
                      <option>Vintage 1970s Bollywood 16mm celluloid grain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Target Engine</label>
                    <select
                      value={videoPlatform}
                      onChange={(e) => setVideoPlatform(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-400"
                    >
                      <option>Runway Gen-3 / Sora</option>
                      <option>Luma Dream Machine</option>
                      <option>Kling AI Video</option>
                      <option>Pika Labs</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {onOpenVeoModal && (
                    <button
                      type="button"
                      onClick={onOpenVeoModal}
                      className="flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20 shadow-sm"
                    >
                      <Clapperboard className="h-3.5 w-3.5 text-sky-400" />
                      <span>Launch Veo 3 Video Generator</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || !videoScene.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Generate Video Prompt in Hinglish</span>
                  </button>
                </div>
              </form>
            )}

            {/* MUSIC CONCEPT LAB */}
            {activeCategory === 'music' && (
              <form onSubmit={handleMusicSubmit} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-white">Music Concept & Lyrics Studio</span>
                  </div>
                  <span className="text-xs text-slate-400">For Suno · Udio · Songwriting</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Song Story / Topic / Core Feeling
                  </label>
                  <input
                    type="text"
                    value={musicTopic}
                    onChange={(e) => setMusicTopic(e.target.value)}
                    placeholder="e.g. Chai at midnight, memories of old friendships, highway drive in Mumbai rain..."
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Genre & Fusion</label>
                    <select
                      value={musicGenre}
                      onChange={(e) => setMusicGenre(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-400"
                    >
                      <option>Desi Lo-Fi Hip Hop</option>
                      <option>Bollywood Indie Pop & Acoustic</option>
                      <option>Punjabi Drill with Heavy 808s</option>
                      <option>Sufi Rock & Electric Guitars</option>
                      <option>Synthwave 80s Retro Bollywood</option>
                      <option>Euphoric EDM Festival Anthem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Vibe & Mood</label>
                    <select
                      value={musicMood}
                      onChange={(e) => setMusicMood(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-400"
                    >
                      <option>Late night nostalgic & rain ambience</option>
                      <option>Heartbreak, melancholic & deep</option>
                      <option>High energy gym motivation & hype</option>
                      <option>Chill coffee shop Sunday morning</option>
                      <option>Romantic warm sunset confession</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tempo / BPM</label>
                    <select
                      value={musicBpm}
                      onChange={(e) => setMusicBpm(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-400"
                    >
                      <option>75 BPM (Slow Melancholic Lo-Fi)</option>
                      <option>85 BPM (Groovy Chill Hop)</option>
                      <option>105 BPM (Mid-tempo Indie Pop)</option>
                      <option>124 BPM (Club Dance / House)</option>
                      <option>140 BPM (High Energy Drill / Trap)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {onOpenLyriaModal && (
                    <button
                      type="button"
                      onClick={onOpenLyriaModal}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20 shadow-sm"
                    >
                      <Music className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Launch Lyria Music Generator</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
                  >
                    <Music className="h-3.5 w-3.5" />
                    <span>Generate Music Concept & Hinglish Lyrics</span>
                  </button>
                </div>
              </form>
            )}

            {/* DAILY TASK SOLVER */}
            {activeCategory === 'task' && (
              <form onSubmit={handleTaskSubmit} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Daily Task & Productivity Solver</span>
                  </div>
                  <span className="text-xs text-slate-400">Time-block · Action Steps · Drafts</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    What task do you want to solve or plan?
                  </label>
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="e.g. Complete client report, reply to 10 pending emails, prepare YouTube video script..."
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Time Available</label>
                    <select
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-400"
                    >
                      <option>45 Minute Quick Sprint</option>
                      <option>2 Hours Focused Block</option>
                      <option>Full Workday (8 Hours)</option>
                      <option>Weekend Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Execution Strategy</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-400"
                    >
                      <option>High Impact First (Eat the frog)</option>
                      <option>Quick Momentum Wins (Easy first)</option>
                      <option>Deep Focus Flow (Pomodoro 25/5)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isLoading || !taskInput.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Break Down & Solve in Hinglish</span>
                  </button>
                </div>
              </form>
            )}

            {/* CREATIVE BRAINSTORMING SPARKS */}
            {activeCategory === 'ideas' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">Instant Viral Sparks & Brainstorming</span>
                  </div>
                  <span className="text-xs text-slate-400">Click any card to start ideating immediately</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSparkClick(
                        'Mujhe YouTube Shorts aur Instagram Reels ke liye 5 viral tech & AI hooks batao with high retention rate.'
                      )
                    }
                    className="text-left p-3 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-amber-400/40 hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <div className="font-semibold text-amber-300 mb-0.5">🔥 Viral Video Hooks (Tech & AI)</div>
                    <div className="text-slate-400">First 3 seconds attention grabber hooks for Reels/Shorts</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSparkClick(
                        'Ek unique Sci-Fi short animation concept banao set in Mumbai 2085 with flying rickshaws and AI robots.'
                      )
                    }
                    className="text-left p-3 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-amber-400/40 hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <div className="font-semibold text-sky-300 mb-0.5">🚀 Sci-Fi Story Concept (Mumbai 2085)</div>
                    <div className="text-slate-400">Plot twist, characters, and futuristic aesthetic ideas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSparkClick(
                        'Desi cafe & streetwear brand ke liye 10 catchy, quirky Hinglish punchlines aur marketing slogans do.'
                      )
                    }
                    className="text-left p-3 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-amber-400/40 hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <div className="font-semibold text-emerald-300 mb-0.5">💡 Catchy Hinglish Slogans</div>
                    <div className="text-slate-400">Creative taglines for brands, cafes, and apparel</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSparkClick(
                        'Agar mere paas sirf 3 ghante hain aur 10 pending tasks hain, toh Pareto 80/20 rule use karke prioritize kaise karun?'
                      )
                    }
                    className="text-left p-3 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-amber-400/40 hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <div className="font-semibold text-indigo-300 mb-0.5">⚡ 80/20 Daily Time Crunch</div>
                    <div className="text-slate-400">Emergency prioritization framework for heavy workdays</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
