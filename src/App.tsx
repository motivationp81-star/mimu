import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { StudioDrawers } from './components/StudioDrawers';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Message, StudioCategory } from './types';
import { Sparkles, Trash2, Download, Bot } from 'lucide-react';
import { VeoVideoModal } from './components/VeoVideoModal';
import { LyriaMusicModal } from './components/LyriaMusicModal';

const STORAGE_KEY = 'my_smart_ai_messages_v1';

const INITIAL_MESSAGE: Message = {
  id: 'init-msg-1',
  role: 'assistant',
  content: `Namaste! Main aapka personal AI Assistant hoon. Bataiye aaj kya banayein—cinematic video animation prompt, original song idea, creative brainstorm, ya koi daily task solve karna hai?

Aap directly Hinglish ya Hindi/English mein baat kar sakte hain, ya upar **Video Studio**, **Music Lab**, ya **Task Planner** tools use kar sakte hain! ✨`,
  timestamp: Date.now(),
  category: 'general',
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved messages:', e);
    }
    return [INITIAL_MESSAGE];
  });

  const [activeCategory, setActiveCategory] = useState<StudioCategory>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isVeoModalOpen, setIsVeoModalOpen] = useState(false);
  const [isLyriaModalOpen, setIsLyriaModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save messages:', e);
    }
  }, [messages]);

  // Auto-scroll on new messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, categoryOverride?: StudioCategory) => {
    const currentCategory = categoryOverride || activeCategory;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      category: currentCategory,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Filter out local greeting and previous errors so Gemini only sees real conversation turns
      const validMessages = newHistory
        .filter((m) => !m.error && m.id !== 'init-msg-1' && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Prepare request payload for /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: validMessages.length > 0 ? validMessages : [{ role: 'user', content: text }],
          category: currentCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errMsg = errorData.error || `Server error (${response.status})`;
        if (response.status === 401 || response.status === 403) {
          errMsg = 'Gemini API Key unauthorized (401). Kripya Google AI Studio ke Settings > Secrets panel mein valid GEMINI_API_KEY check karein, ya page ko refresh (Ctrl+F5) karein.';
        }
        throw new Error(errMsg);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp || Date.now(),
        category: currentCategory,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: error.message || 'Kuch takneeki kharabi aayi hai. Kripya thodi der baad dobara koshish karein.',
        timestamp: Date.now(),
        category: currentCategory,
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length > 1) {
      const confirmClear = window.confirm(
        'Kya aap naya conversation shuru karna chahte hain? Purani chat clear ho jayegi.'
      );
      if (!confirmClear) return;
    }
    const reset = [{ ...INITIAL_MESSAGE, timestamp: Date.now() }];
    setMessages(reset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
  };

  const handleExportChat = () => {
    const markdownContent = messages
      .map((m) => {
        const sender = m.role === 'user' ? '### 👤 You' : '### ✨ My Smart AI';
        const time = new Date(m.timestamp).toLocaleString();
        return `${sender} (${time})\n\n${m.content}\n\n---\n`;
      })
      .join('\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-smart-ai-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30">
      {/* Strict Top Bar Contract Header */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onNewChat={handleNewChat}
      />

      {/* Expandable Studio Presets & Builders Drawer */}
      <StudioDrawers
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onSubmitPrompt={(text, cat) => handleSendMessage(text, cat)}
        isLoading={isLoading}
        onOpenVeoModal={() => setIsVeoModalOpen(true)}
        onOpenLyriaModal={() => setIsLyriaModalOpen(true)}
      />

      {/* Main Chat Feed Viewport */}
      <main className="flex-1 overflow-y-auto px-2 md:px-6 py-4 space-y-2">
        <div className="max-w-4xl mx-auto flex flex-col justify-between min-h-full">
          {/* Top Session Action Controls */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-2 px-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Active Mode:</span>
              <span className="text-sky-400 capitalize">
                {activeCategory === 'general' ? 'All-in-One Studio' : `${activeCategory} Studio`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportChat}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                title="Download conversation markdown"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export MD</span>
              </button>

              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 space-y-4 py-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRetry={
                  message.error
                    ? () => {
                        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                        if (lastUser) handleSendMessage(lastUser.content);
                      }
                    : undefined
                }
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-sky-400 border border-slate-700/80">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-slate-800/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                  <span className="italic text-xs font-mono">
                    Ideas & prompts craft ho rahe hain Hinglish mein...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Floating Prompt & Voice Input Bar */}
      <ChatInput
        onSendMessage={(text) => handleSendMessage(text)}
        isLoading={isLoading}
        activeCategory={activeCategory}
      />

      {/* Veo 3 Video Generator Modal (Text to Video & Image to Video) */}
      <VeoVideoModal
        isOpen={isVeoModalOpen}
        onClose={() => setIsVeoModalOpen(false)}
        onShareToChat={(videoUrl, promptText) => {
          handleSendMessage(`Here is the generated Veo 3.1 video for prompt: "${promptText}"`, 'video');
          setIsVeoModalOpen(false);
        }}
      />

      {/* Lyria Music Generator Modal (30s Clips & Full Tracks) */}
      <LyriaMusicModal
        isOpen={isLyriaModalOpen}
        onClose={() => setIsLyriaModalOpen(false)}
        onShareToChat={(text) => {
          handleSendMessage(text, 'music');
          setIsLyriaModalOpen(false);
        }}
      />
    </div>
  );
}
