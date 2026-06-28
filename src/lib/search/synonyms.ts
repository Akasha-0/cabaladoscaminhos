// ============================================================================
// SEARCH SYNONYMS — Mapa de termos equivalentes (Wave 18)
// ============================================================================
// Pequeno dicionário de sinônimos para a busca PT-BR do Akasha. Estratégia:
//
//   - Cada chave é um "termo canônico" (slug curto que aparece no resultado)
//   - O array de `aliases` lista grafias/variantes que devem ser tratadas
//     como equivalentes quando aparecem na query do usuário.
//
// Como funciona:
//   1. Ao receber `q = "cabala"`, expandimos para ["cabala", "cabalá", "kabbalah"]
//   2. Cada termo vira um OR na tsquery
//   3. O ranking ainda usa o termo original — sinônimos só ampliam o match
//
// Casos cobertos (curados para o domínio espiritual do Akasha):
//   - Cabala    ↔ grafia em hebraico/português
//   - Meditação ↔ variações com/sem acento
//   - Tantra    ↔ grafia com/sem acento
//   - Xamanismo ↔ termo brasileiro, espanhol e raiz inglesa
//   - Reiki     ↔ com/sem 'i' final
//   - Astrologia ↔ abreviação coloquial
//
// Como estender:
//   1. Adicione uma entrada nova no array SYNONYMS
//   2. Mantenha a chave como slug canônico (sem acento, lowercase)
//   3. Liste todas as variações que você quer que deem match entre si
//
// Performance: o mapa é estático e pequeno (<20 entradas), então o custo
// de expandir a query é desprezível. Cada sinônimo adiciona 1 termo à
// tsquery; o GIN index mantém a busca sub-linear.
// ============================================================================

export interface SynonymEntry {
  /** Termo canônico (usado na expansão e em logs). Sempre lowercase, sem acento. */
  canonical: string;
  /** Lista de grafias equivalentes. Todas lowercase. Acentos são preservados
   *  aqui porque o motor já remove acentos na normalização (lib/community/search.ts). */
  aliases: string[];
}

export const SYNONYMS: SynonymEntry[] = [
  {
    canonical: 'cabala',
    aliases: ['cabala', 'cabalá', 'kabbalah', 'kabbala', 'qabalah'],
  },
  {
    canonical: 'meditacao',
    aliases: ['meditacao', 'meditação', 'meditação', 'meditation'],
  },
  {
    canonical: 'tantra',
    aliases: ['tantra', 'tântra'],
  },
  {
    canonical: 'xamanismo',
    aliases: ['xamanismo', 'shamanismo', 'xaman', 'shaman'],
  },
  {
    canonical: 'reiki',
    aliases: ['reiki', 'reik'],
  },
  {
    canonical: 'astrologia',
    aliases: ['astrologia', 'astro'],
  },
  {
    canonical: 'cristianismo',
    aliases: ['cristianismo', 'cristã', 'crista'],
  },
  {
    canonical: 'umbanda',
    aliases: ['umbanda', 'umbandista'],
  },
  {
    canonical: 'espiritismo',
    aliases: ['espiritismo', 'kardecismo', 'kardecista'],
  },
  {
    canonical: 'numerologia',
    aliases: ['numerologia', 'numerológico', 'numerologica'],
  },
  {
    canonical: 'tarot',
    aliases: ['tarot', 'tarô', 'taro'],
  },
];

/**
 * Normaliza uma string removendo acentos + lowercase.
 * Compartilhado entre busca e expansão de sinônimos.
 */
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Expande uma query em uma lista de termos equivalentes.
 *
 * Comportamento:
 *   - Recebe "cabalá"
 *   - Encontra a entrada com canonical="cabala"
 *   - Retorna ["cabalá", "cabala", "kabbalah", "kabbala", "qabalah"]
 *
 * Termos sem sinônimo entram sozinhos na lista.
 *
 * IMPORTANTE: a ordem importa — o termo original vem PRIMEIRO para que o
 * ranking dê peso ao que o usuário digitou. Os sinônimos expandem o match,
 * não substituem.
 */
export function expandSynonyms(q: string): string[] {
  const trimmed = q.trim();
  if (!trimmed) return [];

  const terms = trimmed.split(/\s+/);
  const expanded: string[] = [];

  for (const term of terms) {
    const norm = normalize(term);
    expanded.push(term); // termo original primeiro

    const entry = SYNONYMS.find(
      (e) => normalize(e.canonical) === norm || e.aliases.some((a) => normalize(a) === norm),
    );

    if (entry) {
      for (const alias of entry.aliases) {
        if (normalize(alias) !== norm && !expanded.includes(alias)) {
          expanded.push(alias);
        }
      }
    }
  }

  return expanded;
}

/**
 * Monta uma tsquery (portuguese) com expansão de sinônimos.
 * Termos são juntados com `|` (OR) dentro do mesmo espaço conceitual,
 * e `&` (AND) entre grupos.
 *
 * Exemplo:
 *   expandQueryTs("cabalá meditação")
 *   → "(cabalá | cabala | kabbalah | kabbala | qabalah) & (meditação | meditacao | meditation)"
 */
export function expandQueryTs(q: string): string {
  const groups = q.split(/\s+/).filter(Boolean);
  if (groups.length === 0) return "''";

  return groups
    .map((g) => {
      const terms = expandSynonyms(g);
      // Cada termo vira prefix match (cabalá:*) e é juntado com |
      return terms
        .map((t) => `${t.replace(/['\\()&|:!<>]/g, ' ').trim()}:*`)
        .filter(Boolean)
        .join(' | ');
    })
    .filter(Boolean)
    .map((g) => (g.includes('|') ? `(${g})` : g))
    .join(' & ');
}
