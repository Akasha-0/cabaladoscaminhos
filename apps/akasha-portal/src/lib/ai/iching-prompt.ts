/**
 * iching-prompt.ts — T10.5 (v0.0.4)
 *
 * Constrói o bloco "## HEXAGRAMA NATAL (I-CHING)" injetado no System Prompt
 * do oráculo (/api/akasha/consult) quando o usuário tem `ichingEnabled` e
 * um `ichingMap` cacheado.
 *
 * Princípio: conservador em conteúdo — só metadados estruturados do
 * hexagrama (nº, nome PT/ZH, trigramas, aspectos). NÃO inclui o corpo do
 * ritual markdown do Grimório nem interpretações profundas — isso é
 * responsabilidade do RAG (Camada 2/3) via grimoire/iching/.
 *
 * Doc 14 §2: I-Ching é 5º sistema opt-in. Doc 09 §5.3: cache no cadastro.
 */
import type { IChingMap } from '@akasha/core-iching';

/** Tipo de guarda — `IChingMap` válido precisa ter `hexagramNumber`. */
function isValidIchingMap(map: IChingMap | null | undefined): map is IChingMap & {
  hexagramNumber: number;
} {
  return !!map && typeof map.hexagramNumber === 'number';
}

/**
 * Renderiza a seção "## Hexagrama Natal (I-Ching)" para o System Prompt.
 * Devolve string vazia se `map` for null/undefined ou se faltarem dados
 * essenciais (sem hexagrama calculado). Idempotente.
 */
export function formatIchingSection(map: IChingMap | null | undefined): string {
  if (!isValidIchingMap(map)) return '';

  const hexNumber = map.hexagramNumber;
  const hexName = map.hexagramName ?? 'Desconhecido';
  const hexZh = map.hexagramChineseName ?? '—';
  const upper = map.upperTrigramName ?? '—';
  const lower = map.lowerTrigramName ?? '—';
  const aspects = map.aspects?.length ? map.aspects.join(', ') : '—';

  // Bloco multi-line com bullet points. Prefix com `\n` só se houver
  // seção anterior para não criar linha vazia sobrando.
  return `## Hexagrama Natal (I-Ching)
- Hexagrama: ${hexNumber} — ${hexName} (${hexZh})
- Trigrama superior: ${upper}
- Trigrama inferior: ${lower}
- Aspectos: ${aspects}
- Interpretação: considere o hexagrama como camada de sabedoria chinesa complementar aos 4 Pilares.`;
}
