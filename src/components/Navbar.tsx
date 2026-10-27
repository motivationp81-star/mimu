import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { StudioCategory } from '../types';

interface NavbarProps {
  activeCategory: StudioCategory;
  onSelectCategory: (category: StudioCategory) => void;
  onNewChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onNewChat,
}) => {
  const navTabs: { id: StudioCategory; label: string }[] = [
    { id: 'general', label: 'All Chat' },
    { id: 'video', label: 'Video Studio' },
    { id: 'music', label: 'Music Lab' },
    { id: 'task', label: 'Task Planner' },
    { id: 'ideas', label: 'Brainstorm' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 border-b border-slate-800/80 bg-slate-900/95 px-6 py-3.5 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          onSelectCategory('general');
        }}
        className="flex items-center gap-2 text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors"
      >
        <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
        <span>My Smart AI</span>
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        {navTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 text-xs md:text-sm ${
                isActive
                  ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-all hover:bg-sky-400 active:scale-95 whitespace-nowrap shrink-0 shadow-sm shadow-sky-500/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
};
