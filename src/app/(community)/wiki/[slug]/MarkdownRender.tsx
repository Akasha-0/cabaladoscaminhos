'use client';

// ============================================================================
// MarkdownRender — Client component para renderização de markdown (wiki)
// ============================================================================
// Implementação mínima — subheadings, listas, blockquote, code, bold/italic, links.
// Sem libs externas (já temos react-markdown installado opcionalmente —
// essa versão evita acoplar uma biblioteca grande pra Wave 36).
//
// Segurança: HTML é escapado. Não usamos dangerouslySetInnerHTML.
// ============================================================================

import { Fragment } from 'react';

interface Props {
  source: string;
}

export function MarkdownRender({ source }: Props) {
  return (
    <div className="prose prose-invert prose-violet max-w-none">
      {source.split('\n\n').map((paragraph, i) => {
        // Heading 1 (# text)
        if (paragraph.startsWith('# ')) {
          return (
            <h1 key={i} className="mt-8 mb-3 text-3xl font-bold text-slate-50 first:mt-0">
              {inlineFormat(paragraph.slice(2))}
            </h1>
          );
        }
        // Heading 2 (## text)
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={i} className="mt-8 mb-3 text-2xl font-bold text-slate-100">
              {inlineFormat(paragraph.slice(3))}
            </h2>
          );
        }
        // Heading 3 (### text)
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={i} className="mt-6 mb-2 text-xl font-semibold text-slate-100">
              {inlineFormat(paragraph.slice(4))}
            </h3>
          );
        }
        // Blockquote (> text)
        if (paragraph.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="my-4 border-l-4 border-violet-700 bg-violet-950/20 px-4 py-2 italic text-slate-300"
            >
              {inlineFormat(paragraph.slice(2))}
            </blockquote>
          );
        }
        // Code block (```\n...\n```)
        if (paragraph.startsWith('```')) {
          const lines = paragraph.split('\n');
          const code = lines.slice(1, -1).join('\n');
          return (
            <pre key={i} className="my-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm">
              <code className="text-slate-200">{code}</code>
            </pre>
          );
        }
        // Unordered list
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter((l) => l.startsWith('- '));
          return (
            <ul key={i} className="my-4 list-disc space-y-1 pl-6 text-slate-200">
              {items.map((item, j) => (
                <li key={j}>{inlineFormat(item.slice(2))}</li>
              ))}
            </ul>
          );
        }
        // Ordered list
        if (/^\d+\. /.test(paragraph)) {
          const items = paragraph.split('\n').filter((l) => /^\d+\. /.test(l));
          return (
            <ol key={i} className="my-4 list-decimal space-y-1 pl-6 text-slate-200">
              {items.map((item, j) => (
                <li key={j}>{inlineFormat(item.replace(/^\d+\. /, ''))}</li>
              ))}
            </ol>
          );
        }
        // Table (| header |\n| --- |\n| cell |\n)
        if (paragraph.includes('|') && paragraph.split('\n')[1]?.match(/^\|[\s-:|]+\|$/)) {
          const lines = paragraph.split('\n');
          const headers = lines[0].split('|').map((s) => s.trim()).filter(Boolean);
          const rows = lines.slice(2).map((l) => l.split('|').map((s) => s.trim()).filter(Boolean));
          return (
            <div key={i} className="my-4 overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>{headers.map((h, j) => <th key={j} className="border-b border-slate-800 px-3 py-2 text-left">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r, j) => (
                    <tr key={j} className="odd:bg-slate-950/50">
                      {r.map((c, k) => <td key={k} className="border-b border-slate-800/50 px-3 py-2 text-slate-200">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        // Paragraph
        return (
          <p key={i} className="my-3 text-base leading-relaxed text-slate-200">
            {inlineFormat(paragraph)}
          </p>
        );
      })}
    </div>
  );
}

// ============================================================================
// Inline formatting — **bold**, *italic*, `code`, [text](url)
// ============================================================================

function inlineFormat(text: string): React.ReactNode {
  const tokens: Array<{ type: 'text' | 'bold' | 'italic' | 'code' | 'link'; content: string; href?: string }> = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Match in priority order
    const matchers: Array<{
      regex: RegExp;
      type: 'bold' | 'italic' | 'code' | 'link';
      transform?: (m: RegExpExecArray) => string | { content: string; href: string };
    }> = [
      { regex: /\*\*(.+?)\*\*/, type: 'bold' },
      { regex: /`([^`]+)`/, type: 'code' },
      { regex: /\[([^\]]+)\]\(([^)]+)\)/, type: 'link', transform: (m) => ({ content: m[1], href: m[2] }) },
      { regex: /\*([^*]+)\*/, type: 'italic' },
    ];

    let earliest: { idx: number; len: number; type: 'bold' | 'italic' | 'code' | 'link'; match: RegExpExecArray } | null = null;

    for (const m of matchers) {
      const r = m.regex.exec(remaining);
      if (r && (earliest === null || r.index < earliest.idx)) {
        const transformResult = m.transform ? m.transform(r) : null;
        earliest = {
          idx: r.index,
          len: r[0].length,
          type: m.type,
          match: transformResult
            ? (Object.assign([...r], { _transform: transformResult }) as unknown as RegExpExecArray)
            : r,
        };
      }
    }

    if (!earliest) {
      tokens.push({ type: 'text', content: remaining });
      break;
    }

    if (earliest.idx > 0) {
      tokens.push({ type: 'text', content: remaining.slice(0, earliest.idx) });
    }

    if (earliest.type === 'link') {
      const transformResult = (earliest.match as unknown as { _transform: { content: string; href: string } })._transform;
      tokens.push({ type: 'link', content: transformResult.content, href: transformResult.href });
    } else {
      const content = earliest.match[1];
      tokens.push({ type: earliest.type as 'bold' | 'italic' | 'code', content });
    }

    remaining = remaining.slice(earliest.idx + earliest.len);
    keyCounter++;
  }

  return tokens.map((t, i) => {
    if (t.type === 'text') return <Fragment key={i}>{t.content}</Fragment>;
    if (t.type === 'bold') return <strong key={i} className="text-slate-50">{t.content}</strong>;
    if (t.type === 'italic') return <em key={i}>{t.content}</em>;
    if (t.type === 'code') return <code key={i} className="rounded bg-slate-800 px-1 py-0.5 text-violet-200">{t.content}</code>;
    if (t.type === 'link') {
      const isExternal = t.href?.startsWith('http');
      return (
        <a
          key={i}
          href={t.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-violet-300 hover:text-violet-200"
        >
          {t.content}
        </a>
      );
    }
    return null;
  });
}
