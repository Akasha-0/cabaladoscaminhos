// ============================================================
// MARKDOWN CONTENT RENDERER - CABALA DOS CAMINHOS
// ============================================================
// Shared React component for rendering markdown-like content
// in dashboard widgets.
//
// Clone group: d3e91824 (36 lines, 3 instances)
// Pattern: Component metric card rendering
// Files: life-areas page, DailyActionWidget, SwarmChatWidget
// ============================================================

import React from 'react';

export interface MarkdownContentProps {
  /** Markdown-like content string */
  content: string;
  /** Custom styling variant */
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Renders markdown-like content with support for:
 * - ## Headings (h2)
 * - ### Subheadings (h3)
 * - > Blockquotes
 * - **Bold** text
 * - Numbered lists
 * - Paragraphs
 * - Paragraphs
 */
export function MarkdownContent({
  content,
  variant = 'default',
}: MarkdownContentProps): React.ReactElement {
  const lines = content.split('\n');
  const rendered: React.ReactNode[] = [];

  // Styling variants
  const styles = {
    default: {
      heading: 'text-lg font-bold text-white mt-4 mb-2',
      subheading: 'text-base font-semibold text-amber-300 mt-4 mb-2 flex items-center gap-2',
      subheadingAccent: 'w-1 h-4 bg-amber-400 rounded',
      listItem: 'text-sm text-slate-300 leading-relaxed ml-3 mb-1',
      blockquote: 'border-l-2 border-amber-400/40 pl-2 my-1.5 italic text-sm text-slate-300',
      paragraph: 'text-sm text-slate-300 leading-relaxed mb-1.5',
      container: 'pt-2 border-t border-amber-500/10',
    },
    compact: {
      heading: 'text-sm font-semibold text-amber-300 mt-3 mb-1.5 flex items-center gap-1.5',
      subheadingAccent: 'w-0.5 h-3.5 bg-amber-400 rounded',
      subheading: 'text-xs font-semibold text-violet-300 mt-2 mb-1',
      listItem: 'text-xs text-slate-300 leading-relaxed ml-3 mb-1',
      blockquote: 'border-l-2 border-amber-400/40 pl-2 my-1.5 italic text-xs text-slate-300',
      paragraph: 'text-xs text-slate-300 leading-relaxed mb-1.5',
      container: 'pt-2 border-t border-amber-500/10',
    },
    detailed: {
      heading: 'text-xl font-bold text-white mt-6 mb-3',
      subheading: 'text-base font-semibold text-amber-300 mt-5 mb-2 flex items-center gap-2',
      subheadingAccent: 'w-1.5 h-5 bg-amber-400 rounded',
      listItem: 'text-base text-slate-300 leading-relaxed ml-4 mb-2',
      blockquote: 'border-l-3 border-amber-400/50 pl-3 my-2 italic text-base text-slate-300',
      paragraph: 'text-base text-slate-300 leading-relaxed mb-3',
      container: 'pt-3 border-t border-amber-500/15',
    },
  };

  const s = styles[variant];

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      rendered.push(
        <h2 key={i} className={s.heading}>
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      if (variant === 'default') {
        rendered.push(
          <h3 key={i} className="text-base font-semibold text-amber-300 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-400 rounded" />
            {line.replace('### ', '')}
          </h3>
        );
      } else if (variant === 'compact') {
        rendered.push(
          <h4 key={i} className={s.subheading}>
            {line.replace('### ', '')}
          </h4>
        );
      } else {
        rendered.push(
          <h3 key={i} className={s.subheading}>
            {line.replace('### ', '')}
          </h3>
        );
      }
    } else if (line.match(/^\d+\.\s/)) {
      rendered.push(
        <p key={i} className={s.listItem}>
          {line}
        </p>
      );
    } else if (line.startsWith('> ')) {
      rendered.push(
        <blockquote key={i} className={s.blockquote}>
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.trim() === '') {
      // Skip empty lines
    } else {
      // Process bold text **...**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const processed = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="text-white font-semibold">
              {part.replace(/\*\*/g, '')}
            </strong>
          );
        }
        return <span key={j}>{part}</span>;
      });
      rendered.push(
        <p key={i} className={s.paragraph}>
          {processed}
        </p>
      );
    }
  });

  return <div className={s.container}>{rendered}</div>;
}

/**
 * Simple insight content renderer (for API responses)
 */
export function renderInsightContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const rendered: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      rendered.push(
        <h3
          key={i}
          className="text-base font-semibold text-amber-300 mt-4 mb-2 flex items-center gap-2"
        >
          <span className="w-1 h-4 bg-amber-400 rounded" />
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      rendered.push(
        <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">
          {line.replace('# ', '')}
        </h2>
      );
    } else if (line.trim() === '') {
      // Skip empty lines
    } else {
      rendered.push(
        <p key={i} className="text-sm text-slate-300 leading-relaxed mb-1.5">
          {line}
        </p>
      );
    }
  });

  return rendered;
}
