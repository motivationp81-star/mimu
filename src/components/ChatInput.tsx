import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { StudioCategory } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  activeCategory: StudioCategory;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  activeCategory,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick contextual prompts based on active category
  const quickPrompts: Record<StudioCategory, string[]> = {
    general: [
      'Batao aaj kya banayein?',
      'Ek mast YouTube video idea do with viral hook',
      'Desi Lo-Fi song lyrics in Hinglish',
      'Cinematic FPV drone prompt for Sora',
    ],
    video: [
      'Cyberpunk Varanasi ghats at midnight with flying rickshaws',
      'Slow dolly zoom on Indian chef making street jalebi in golden hour',
      'Futuristic Mumbai metro hyper-lapse through neon rain',
      'Epic 360-degree orbit around royal Himalayan palace',
    ],
    music: [
      'Late night romantic Lo-Fi song in Hinglish with rain ambience',
      'High-energy Punjabi Drill track with 808 sub-bass and flute',
      'Soulful Acoustic Sufi indie ballad about finding peace',
      '80s Retro Bollywood Synthwave hook with catchy chorus',
    ],
    task: [
      'Aaj mere paas 4 ghante hain, client pitch aur emails kaise schedule karun?',
      'Ek professional but polite leave application WhatsApp message draft karo',
      'Burnout feel ho raha hai, aaj ka simple 3-step priority checklist do',
      'Daily 25-minute Pomodoro routine for video editing workflow',
    ],
    ideas: [
      'Top 5 viral Instagram Reels hooks for AI and productivity creators',
      'Unconventional sci-fi plot twist for a 2-minute short film',
      'Creative brand tagline for a modern Indian street-food startup',
      'Engaging quiz hook format to get 10x comments on YouTube Community',
    ],
  };

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Picks up Hindi/Hinglish phonetics well

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 180)}px`;
  };

  const handleQuickPromptClick = (text: string) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-900/90 p-4 backdrop-blur-md">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick prompt inspiration chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 no-scrollbar">
          <span className="flex items-center gap-1 font-medium text-slate-400 shrink-0">
            <Sparkles className="h-3 w-3 text-sky-400" />
            <span>Try:</span>
          </span>
          {quickPrompts[activeCategory].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPromptClick(prompt)}
              className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 text-slate-300 hover:border-sky-500/40 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Text Box */}
        <div className="relative flex items-end gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 p-2 shadow-inner focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="Apna prompt, sawal ya task yahan Hinglish mein likhein... (Enter to send, Shift+Enter for newline)"
            className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none selection:bg-sky-500/30 max-h-44 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 pb-1 pr-1 shrink-0">
            {/* Mic speech-to-text button */}
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? 'Listening... click to stop' : 'Speak in Hinglish (Mic)'}
              className={`rounded-lg p-2 transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Send CTA */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center rounded-lg bg-sky-500 p-2 text-slate-950 transition-all hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Keyboard shortcut footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span>Press ↵ Enter to send · Shift + ↵ for newline</span>
          <span className="tabular-nums">{input.length} chars</span>
        </div>
      </div>
    </div>
  );
};
