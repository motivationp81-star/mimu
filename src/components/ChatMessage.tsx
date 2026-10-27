import React, { useState, useEffect } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { MarkdownView } from './MarkdownView';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(message.timestamp));

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // Clean markdown syntax for speech
    const cleanSpeechText = message.content
      .replace(/```[\s\S]*?```/g, 'Prompt code block omitted.')
      .replace(/[#*`_>]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try finding an Indian English or Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN')) ||
      voices.find((v) => v.lang.includes('en-GB') || v.lang.includes('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 px-4 py-2 group">
        <div className="max-w-2xl">
          {/* User unboxed metadata */}
          <div className="flex items-center justify-end gap-2 text-xs text-slate-400 mb-1.5 font-mono tabular-nums">
            <span>You</span>
            <span aria-hidden="true">·</span>
            <span>{formattedTime}</span>
          </div>

          <div className="rounded-2xl rounded-tr-sm bg-sky-600 px-4 py-3 text-sm text-white shadow-md selection:bg-sky-900 leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start gap-3 px-4 py-3 group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm">
        <Sparkles className="h-4 w-4" />
      </div>

      <div className="max-w-3xl flex-1">
        {/* Assistant unboxed metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
          <span className="font-semibold text-sky-400">My Smart AI</span>
          <span aria-hidden="true">·</span>
          <span>Hinglish v3.8</span>
          {message.category && message.category !== 'general' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="capitalize text-slate-300 font-medium">{message.category}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formattedTime}</span>
        </div>

        {/* Bubble container */}
        <div className="relative rounded-2xl rounded-tl-sm border border-slate-800/80 bg-slate-900/90 p-4 shadow-sm backdrop-blur-sm">
          {message.error ? (
            <div className="space-y-2 text-rose-400 text-sm">
              <p>⚠️ {message.content}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors"
                >
                  Retry request
                </button>
              )}
            </div>
          ) : (
            <MarkdownView content={message.content} />
          )}

          {/* Quick Action Footer */}
          {!message.error && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <span>⚡ Powered by Gemini 3.8 Flash</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio TTS Button */}
                <button
                  type="button"
                  onClick={handleToggleSpeak}
                  title={isSpeaking ? 'Stop speaking' : 'Listen in Hinglish'}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                    isSpeaking
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-sky-400" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Listen</span>
                    </>
                  )}
                </button>

                {/* Copy Entire Response */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy whole response"
                  className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
