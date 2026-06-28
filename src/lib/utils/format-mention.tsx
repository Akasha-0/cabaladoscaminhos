// ============================================================================
// formatMention — detecta @mentions em texto e renderiza como links
// ============================================================================
// Função server-safe: retorna uma árvore de nós (string | link) que pode
// ser usada tanto no server (RSC) quanto no client. O componente recebe os
// nós e renderiza com <Link> do Next.js, mantendo a navegação SPA.
//
// Regras de detecção:
//   - @username — letras, dígitos, underscore, ponto, hífen; 3-30 chars.
//   - Limite: 10 menções por texto (evita spam/overhead).
//   - Não reconhece @ dentro de URLs (ex: https://x.com/@user) — a regex
//     exige word-boundary antes do @.
// ============================================================================

import React from 'react';
import Link from 'next/link';

export const MENTION_HANDLE_PATTERN = /(?:^|\s)@([a-zA-Z0-9_.-]{3,30})/g;
const MENTION_MAX_PER_TEXT = 10;

/**
 * Normaliza um handle removendo caracteres inválidos e truncando.
 * Aceita entrada crua do usuário (ex: "@João Silva") e devolve algo
 * URL-safe.
 */
export function normalizeMentionHandle(raw: string): string {
  return raw
    .replace(/^@/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 30);
}

/**
 * Valida handle: 3-30 chars, apenas [a-z0-9_.-].
 */
export function isValidMentionHandle(handle: string): boolean {
  return /^[a-z0-9_.-]{3,30}$/.test(handle);
}

/**
 * Extrai handles únicos encontrados em `text`. Ordem = primeira aparição.
 * Respeita o limite MENTION_MAX_PER_TEXT (trunca após o limite).
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];
  const found: string[] = [];
  const seen = new Set<string>();
  const regex = new RegExp(MENTION_HANDLE_PATTERN.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[1] ?? '';
    const handle = normalizeMentionHandle(raw);
    if (!isValidMentionHandle(handle)) continue;
    if (seen.has(handle)) continue;
    seen.add(handle);
    found.push(handle);
    if (found.length >= MENTION_MAX_PER_TEXT) break;
  }
  return found;
}

/**
 * Tipo do nó retornado por `formatMention`. Pode ser texto cru ou um nó
 * `mention` (que o caller renderiza como link).
 */
export type MentionNode =
  | { type: 'text'; value: string }
  | { type: 'mention'; handle: string };

/**
 * Decompõe `text` em nós de texto/mention. Não renderiza — só estrutura.
 * Use quando precisar de controle sobre a renderização (ex: Markdown custom).
 */
export function tokenizeMentions(text: string): MentionNode[] {
  if (!text) return [{ type: 'text', value: '' }];
  const nodes: MentionNode[] = [];
  const regex = new RegExp(MENTION_HANDLE_PATTERN.source, 'g');
  let cursor = 0;
  let count = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (count >= MENTION_MAX_PER_TEXT) break;
    // match.index aponta pro espaço (ou 0); handle começa em match.index + 1.
    const atIndex = match.index + (match[0].startsWith('@') ? 0 : 1);
    const handleRaw = match[1] ?? '';
    const handle = normalizeMentionHandle(handleRaw);
    if (!isValidMentionHandle(handle)) continue;

    if (atIndex > cursor) {
      nodes.push({ type: 'text', value: text.slice(cursor, atIndex) });
    }
    nodes.push({ type: 'mention', handle });
    cursor = atIndex + 1 + handleRaw.length;
    count++;
  }

  if (cursor < text.length) {
    nodes.push({ type: 'text', value: text.slice(cursor) });
  }

  return nodes.length === 0 ? [{ type: 'text', value: text }] : nodes;
}

/**
 * Renderiza texto com @mentions como links para `/u/[handle]`. Retorna uma
 * array de nós React (Fragment-friendly). Use quando precisar do JSX pronto:
 *
 *     {formatMention(text, { className: '...' })}
 */
export function formatMention(
  text: string,
  options: {
    /** className aplicada ao <Link> da menção. */
    className?: string;
    /** Abre em nova aba (default: false — navegação SPA). */
    external?: boolean;
  } = {}
): React.ReactNode {
  const nodes = tokenizeMentions(text);
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      return <React.Fragment key={i}>{node.value}</React.Fragment>;
    }
    const href = `/u/${node.handle}`;
    const cls = options.className;
    if (options.external) {
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          @{node.handle}
        </a>
      );
    }
    return (
      <Link key={i} href={href} className={cls}>
        @{node.handle}
      </Link>
    );
  });
}
