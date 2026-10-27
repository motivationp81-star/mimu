import React, { useState } from 'react';
import {
  X,
  Music,
  Play,
  Pause,
  Download,
  Loader2,
  Sparkles,
  Volume2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface LyriaMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareToChat?: (text: string) => void;
}

export const LyriaMusicModal: React.FC<LyriaMusicModalProps> = ({
  isOpen,
  onClose,
  onShareToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isClip, setIsClip] = useState<boolean>(true); // true = 30s clip (lyria-3-clip-preview), false = full track (lyria-3-pro-preview)
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const quickStyles = [
    { label: 'Desi Lo-Fi Rain', desc: 'Chill nostalgic rain beats with soulful sitar and soft vinyl' },
    { label: 'Bollywood Synthwave', desc: '80s retro synth bass with dynamic dholak and punchy hook' },
    { label: 'Punjabi Drill 808', desc: 'Heavy sliding sub-bass, flute riff, high energy swagger' },
    { label: 'Acoustic Sufi Indie', desc: 'Warm acoustic guitar with emotional vocal melodies' },
    { label: 'Festival EDM Anthem', desc: 'Euphoric buildup with melodic lead drop at 128 BPM' },
  ];

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) {
      alert('Kripya music generate karne ke liye prompt likhein!');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setAudioUrl(null);
    setLyrics(null);
    setStatusMessage(
      isClip
        ? 'Generating 30s music clip with lyria-3-clip-preview...'
        : 'Composing full-length track with lyria-3-pro-preview...'
    );

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          isClip,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate music');
      }

      if (data.audioBase64) {
        // Convert base64 audio to Blob URL
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }

      if (data.lyrics) {
        setLyrics(data.lyrics);
      }

      if (data.message && !data.audioBase64) {
        setErrorMessage(data.message);
      }
    } catch (err: any) {
      console.error('Music generation error:', err);
      setErrorMessage(err.message || 'Music generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Lyria AI Music Studio</span>
                <span className="text-[11px] font-mono font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {isClip ? 'lyria-3-clip-preview' : 'lyria-3-pro-preview'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compose original audio tracks and bilingual song concepts with Google Lyria
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Generation Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsClip(true)}
                className={`p-3 text-left rounded-xl border transition-all ${
                  isClip
                    ? 'border-indigo-400 bg-indigo-500/15 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-indigo-300">Short Clip (Up to 30s)</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">lyria-3-clip-preview</div>
                <div className="text-[11px] text-slate-500 mt-1">Perfect for Reels, hooks & beats</div>
              </button>

              <button
                type="button"
                onClick={() => setIsClip(false)}
                className={`p-3 text-left rounded-xl border transition-all ${
                  !isClip
                    ? 'border-indigo-400 bg-indigo-500/15 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-indigo-300">Full-Length Track</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">lyria-3-pro-preview</div>
                <div className="text-[11px] text-slate-500 mt-1">Full arrangement with intro, verses & drop</div>
              </button>
            </div>
          </div>

          {/* Quick Style presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Quick Inspiration Styles
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickStyles.map((style, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(style.desc)}
                  className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300 hover:border-indigo-400 hover:text-white transition-colors"
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Music Prompt (Instruments, Mood, Tempo & Vibe)
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Generate a romantic late-night Desi Lo-Fi beat with acoustic guitar arpeggios, rain ambience, mellow 85 BPM drum groove, and melancholic melodies..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-200">Music Generation Status</p>
                <p className="mt-0.5 text-slate-300 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Audio Player Output */}
          {audioUrl && (
            <div className="space-y-3 rounded-xl border border-indigo-500/30 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4" />
                  Lyria Audio Player ({isClip ? '30s Clip' : 'Full Track'})
                </span>
                <a
                  href={audioUrl}
                  download="lyria-track.wav"
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded-md transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download WAV
                </a>
              </div>

              <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow hover:bg-indigo-400 transition"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full bg-indigo-500 rounded-full transition-all ${
                        isPlaying ? 'animate-pulse w-3/4' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Lyrics / Song Structure Blueprint */}
          {lyrics && (
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  Song Lyrics & Composition Blueprint
                </span>
                {onShareToChat && (
                  <button
                    type="button"
                    onClick={() => onShareToChat(lyrics)}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    Send to Chat
                  </button>
                )}
              </div>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                {lyrics}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isGenerating ? (
              <span className="flex items-center gap-2 text-indigo-400 animate-pulse font-mono">
                <Loader2 className="h-4 w-4 animate-spin" />
                {statusMessage}
              </span>
            ) : (
              <span>Powered by Google DeepMind Lyria</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleGenerateMusic}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Music...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{isClip ? 'Generate 30s Clip' : 'Generate Full Track'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
