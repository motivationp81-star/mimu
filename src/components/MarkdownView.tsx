import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks: ```lang\ncode\n```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-slate-200">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          let language = 'prompt';
          let codeBody = part.slice(3, -3);

          if (lines[0] && !lines[0].includes(' ') && lines.length > 1) {
            language = lines[0].trim() || 'prompt';
            codeBody = lines.slice(1).join('\n');
          }

          const cleanCode = codeBody.trim();

          return (
            <div
              key={index}
              className="my-3 overflow-hidden rounded-xl border border-sky-500/20 bg-slate-950/80 shadow-md backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-sky-400">
                  <Terminal className="h-3.5 w-3.5" />
                  {language.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(cleanCode, index)}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-sky-200 selection:bg-sky-500/30">
                <code>{cleanCode}</code>
              </pre>
            </div>
          );
        }

        // Render regular markdown text
        return <FormattedParagraphs key={index} text={part} />;
      })}
    </div>
  );
};

const FormattedParagraphs: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Heading 1
        if (line.startsWith('# ')) {
          return (
            <h1 key={idx} className="mt-4 mb-2 text-xl font-bold tracking-tight text-white">
              {formatInline(line.slice(2))}
            </h1>
          );
        }

        // Heading 2
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="mt-3 mb-1.5 text-lg font-semibold tracking-tight text-sky-300">
              {formatInline(line.slice(3))}
            </h2>
          );
        }

        // Heading 3
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="mt-2.5 mb-1 text-base font-semibold text-slate-100">
              {formatInline(line.slice(4))}
            </h3>
          );
        }

        // Unordered list item
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              <div className="flex-1 text-sm text-slate-200 leading-relaxed">
                {formatInline(bulletContent)}
              </div>
            </div>
          );
        }

        // Numbered list item
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-1">
              <span className="shrink-0 font-mono text-xs font-semibold text-sky-400">
                {numberedMatch[1]}.
              </span>
              <div className="flex-1 text-sm text-slate-200 leading-relaxed">
                {formatInline(numberedMatch[2])}
              </div>
            </div>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="my-2 border-l-2 border-sky-400/60 pl-3 italic text-slate-300 text-sm"
            >
              {formatInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-sm leading-relaxed text-slate-200">
            {formatInline(line)}
          </p>
        );
      })}
    </>
  );
};

// Formats inline bold (**text**), inline code (`code`), and italics (*text*)
function formatInline(text: string): React.ReactNode[] {
  // Regex splitting by bold, inline code
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-xs text-sky-300 border border-slate-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
