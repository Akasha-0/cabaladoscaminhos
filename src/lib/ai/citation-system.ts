// ============================================================================
// AKASHA — Citation System (Wave 32 — 2026-06-30)
// ============================================================================
// Toda afirmação médica/científica DEVE ter citação. O sistema:
//   1. Define um CitationShape tipado (DOI, PubMed, URL, TraditionSource)
//   2. Oferece formatadores (inline + lista final)
//   3. Faz parse de citações na resposta da Akasha
//   4. Mede citation_rate (% de afirmações que citam fonte)
//   5. Valida URL/DOI básico (sem rede — só sintaxe)
//
// Por que arquivo isolado:
//   - Acoplável a QUALQUER ponto que produza texto (chat, curation, coach)
//   - Pura função, sem I/O — testável em node:test sem DB nem rede
//   - Wave 32 spec: 80%+ afirmações científicas com citação
//
// Reuso (qualquer projeto de IA com fontes):
//   - extractCitations(text) → Citation[]
//   - formatCitationInline(c) → "[Citação: Title, Year](URL)"
//   - formatCitationList(c[]) → "## Referências\n1. ...\n2. ..."
//   - computeCitationRate(claims, citations) → 0..1
// ============================================================================

// ============================================================================
// Types
// ============================================================================

/**
 * Categoria de fonte. Inspirado em W30-5 (EvidenceSeed):
 *   - PEER_REVIEWED: paper indexado em PubMed/PubMed Central
 *   - DOI: identificador persistente de paper/jornal
 *   - URL: link verificável (página web, blog institucional, video)
 *   - TRADITION: livro/autor/página de tradição espiritual
 *   - INTERNAL: link interno (artigo da biblioteca Akasha)
 *   - ANECDOTAL: "pessoas relatam que..." (não é fonte, é observação)
 */
export type CitationSource =
  | 'PEER_REVIEWED'
  | 'DOI'
  | 'URL'
  | 'TRADITION'
  | 'INTERNAL'
  | 'ANECDOTAL';

export interface Citation {
  /** ID sintético — hash do source/identifier para deduplicação */
  id: string;
  /** Categoria de fonte */
  source: CitationSource;
  /** Identificador canônico (DOI, PMID, URL, slug interno, "Book p.42") */
  identifier: string;
  /** Título humano-legível (paper, livro, página) */
  title: string;
  /** Autor(es) — usado para renderizar "(Autor et al. ANO)" */
  authors?: string;
  /** Ano de publicação — usado para "(Autor et al. ANO)" */
  year?: number;
  /** Periódico / Journal (opcional) */
  venue?: string;
  /** Página/seção (tradições) */
  page?: string;
  /** URL para o leitor verificar (se houver) */
  url?: string;
  /** Contexto onde a citação aparece (opcional, setado pelo extractCitations) */
  contextQuote?: string;
  /** Posição na string original (offset do match) */
  startIndex?: number;
  /** Confiança do parser 0..1 (heurística) */
  confidence: number;
}

/**
 * Afirmação extraída do texto (claim). Não é I/O — heurística regex.
 */
export interface Claim {
  /** Texto da afirmação (frase ou trecho) */
  text: string;
  /** Categoria inferida */
  category: ClaimCategory;
  /** Se contém claim científica/médica (precisa citação) */
  requiresCitation: boolean;
  /** Posição inicial no texto */
  startIndex: number;
  /** Posição final no texto */
  endIndex: number;
}

export type ClaimCategory =
  | 'SCIENTIFIC'      // "Estudos mostram que..."
  | 'MEDICAL'         // "Pode causar", "trata", "cura"
  | 'PSYCHOLOGICAL'   // "Reduz ansiedade", "ajuda com depressão"
  | 'TRADITION'       // "No Candomblé, Orixá X..."
  | 'HISTORICAL'      // "Em 1950, Y aconteceu"
  | 'GENERAL'         // afirmação genérica
  | 'OPINION';        // "Eu acho", "na minha visão"

// ============================================================================
// Citation extraction
// ============================================================================

/**
 * Regex para os formatos mais comuns de citação inline.
 * Não cobre todos os formatos acadêmicos (ABNT, APA completos) — só o que
 * uma IA produziria naturalmente. Wave 33+ pode estender.
 */
type ExtractedCitation = Omit<Citation, 'id' | 'startIndex' | 'confidence' | 'source'>;

const CITATION_PATTERNS: Array<{
  source: CitationSource;
  pattern: RegExp;
  confidence: number;
  extract: (match: RegExpMatchArray) => ExtractedCitation;
}> = [
  // DOI: "10.1234/jama.2023.12345" ou "DOI: 10.1234/..." ou "https://doi.org/..."
  {
    source: 'DOI',
    pattern: /(?:DOI[:\s]+|https?:\/\/(?:dx\.)?doi\.org\/)?(10\.\d{4,9}\/[^\s,;\)]+)/gi,
    confidence: 0.9,
    extract: (m) => {
      const doi = m[1];
      const matched = m[0];
      const url = matched.startsWith('http') ? matched : `https://doi.org/${doi}`;
      return {
        identifier: doi,
        title: `DOI: ${doi}`,
        url,
      };
    },
  },

  // PubMed: "PMID: 12345" ou "pubmed.ncbi.nlm.nih.gov/12345"
  {
    source: 'PEER_REVIEWED',
    pattern: /(?:PMID[:\s]+|pubmed\.ncbi\.nlm\.nih\.gov\/)(\d{6,9})/gi,
    confidence: 0.95,
    extract: (m) => ({
      identifier: m[1],
      title: `PubMed: ${m[1]}`,
      url: `https://pubmed.ncbi.nlm.nih.gov/${m[1]}/`,
    }),
  },

  // "(Autor et al. ANO, Journal)" ou "Autor et al. ANO, Journal" — formato acadêmico inline
  {
    source: 'PEER_REVIEWED',
    pattern: /(?:\()?([A-ZÀ-Ú][a-zà-ú]+(?:\s+et\s+al\.)?)\s+(\d{4})(?:,\s*([A-ZÀ-Ú][A-Za-zÀ-ÿ\s&-]+?))?(?:\))?/g,
    confidence: 0.7,
    extract: (m) => {
      const author = m[1].replace(/\s+et\s+al\./, '').trim();
      const identifier = `${author}-${m[2]}`;
      const venue = m[3]?.trim();
      return {
        identifier,
        title: `${m[1]} (${m[2]})${venue ? `, ${venue}` : ''}`,
        authors: author,
        year: parseInt(m[2], 10),
        ...(venue ? { venue } : {}),
      };
    },
  },

  // "[Citação: Title, Year](URL)" — formato W32 explícito
  {
    source: 'URL',
    pattern: /\[Citação:\s*([^\]]+?),\s*(\d{4})\]\((https?:\/\/[^\s)]+)\)/gi,
    confidence: 1.0,
    extract: (m) => ({
      identifier: m[3],
      title: m[1].trim(),
      year: parseInt(m[2], 10),
      url: m[3],
    }),
  },

  // "[1]" ou "[Título]" — referência a item da lista de RAG
  {
    source: 'INTERNAL',
    pattern: /\[(\d+|[A-ZÀ-Ú][^\]]{5,60})\]/g,
    confidence: 0.5,
    extract: (m) => ({
      identifier: m[1],
      title: m[1],
    }),
  },

  // "https://..." ou "http://..." URLs científicas (pubmed, doi, nejm, etc)
  {
    source: 'URL',
    pattern: /(https?:\/\/(?:[a-z0-9-]+\.)+(?:pubmed|doi|nejm|jamanetwork|nature\.com|springer\.com|sciencedirect|frontiersin|plos\.org|cambridge\.org|oxford\.org)[^\s,;\)]*)/gi,
    confidence: 0.9,
    extract: (m) => ({
      identifier: m[1],
      title: m[1],
      url: m[1],
    }),
  },

  // Tradição: "Livro X, p.42" ou "Autor Y, página Z" ou "(Livro Santo Daime, cap. 3)"
  {
    source: 'TRADITION',
    pattern: /\(([A-ZÀ-Ú][^,()]+?),\s*(?:p[áa]gina\s*|p\.?\s*)(\d+(?:[\-\u2013]\d+)?)\)/g,
    confidence: 0.75,
    extract: (m) => ({
      identifier: `${m[1].trim()}-p${m[2]}`,
      title: m[1].trim(),
      page: m[2],
    }),
  },
];

/**
 * Extrai todas as citações encontradas em um texto.
 * Função PURA — sem I/O, sem rede. Use em auditoria pós-resposta.
 *
 * @param text — resposta da Akasha
 * @returns lista de Citation ordenada por posição no texto
 */
export function extractCitations(text: string): Citation[] {
  if (!text || text.length === 0) return [];

  const found: Citation[] = [];
  const seenIds = new Set<string>();

  for (const { source, pattern, confidence, extract } of CITATION_PATTERNS) {
    // Reset lastIndex global é responsabilidade do caller — recriar regex aqui
    const re = new RegExp(pattern.source, pattern.flags);
    let m: RegExpMatchArray | null;
    while ((m = re.exec(text)) !== null) {
      const extracted = extract(m);
      const id = `${source}:${extracted.identifier}`;
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const cit: Citation = {
        id,
        source,
        ...extracted,
        startIndex: m.index,
        confidence,
      };
      found.push(cit);
      // Evita loop infinito em zero-width
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }

  return found.sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0));
}

// ============================================================================
// Claim extraction
// ============================================================================

/**
 * Heurística simples para identificar afirmações que precisam de citação.
 * Quebra o texto em sentenças e classifica cada uma.
 *
 * IMPORTANTE: heurística. Não substitui revisão humana.
 */
export function extractClaims(text: string): Claim[] {
  if (!text || text.length === 0) return [];

  // Quebra em sentenças (heurística: ., !, ?, newline)
  const sentences: Array<{ text: string; startIndex: number }> = [];
  const sentenceRe = /[^.!?\n]+[.!?\n]?/g;
  let m: RegExpMatchArray | null;
  while ((m = sentenceRe.exec(text)) !== null) {
    const t = m[0].trim();
    if (t.length < 10) continue; // descarta fragmentos curtos
    sentences.push({ text: t, startIndex: m.index ?? 0 });
  }

  // Classificadores
  const SCIENTIFIC_RE = /\b(estudos?|pesquis[ae]s?|cientistas?|evid[êe]ncias?|meta[\s-]?an[áa]lise|peer[\s-]?review|publicado|publicaç[ãa]o)\b/i;
  const MEDICAL_RE = /\b(pode causar|causa|trata|cura|previne|reduz|efic[áa]z|seguro|perigoso|contraindica|d[óo]se|rem[ée]dio|medicament[oa]|sintoma|diagn[óo]stico|paciente|hospital)\b/i;
  const PSYCHOLOGICAL_RE = /\b(ansiedade|depress[ãa]o|trauma|burnout|estresse|aten[çc][ãa]o|emo[çc][ãa]o|mente|c[ée]rebro|neuro|psic[óo]log[oa]|terapia)\b/i;
  const TRADITION_RE = /\b(cabal[áa]|candombl[ée]|if[áa]|umbanda|tantra|hindu|budismo|crist[ãa]o|jud[áa]ico|xaman|suf[ií]|reiki|ayurveda|medita[çc][ãa]o|orix[áa]|orunmil[áa]|kundalini|sefirot|sephirot|astrolog|numerolog)\b/i;
  const HISTORICAL_RE = /\b(em\s+\d{4}|no\s+s[ée]culo\s+\w+|hist[óo]ric|originalmente|tradi[çc][ãa]o\s+de|h[áa]\s+mais\s+de)\b/i;
  const OPINION_RE = /\b(eu acho|na minha (vis[ãa]o|opini[ãa]o)|parece[- ]me|sinto que|acredito que)\b/i;

  return sentences.map(({ text: sent, startIndex }) => {
    let category: ClaimCategory = 'GENERAL';
    let requiresCitation = false;

    if (SCIENTIFIC_RE.test(sent)) {
      category = 'SCIENTIFIC';
      requiresCitation = true;
    } else if (MEDICAL_RE.test(sent)) {
      category = 'MEDICAL';
      requiresCitation = true;
    } else if (PSYCHOLOGICAL_RE.test(sent)) {
      category = 'PSYCHOLOGICAL';
      requiresCitation = true;
    } else if (TRADITION_RE.test(sent)) {
      category = 'TRADITION';
      requiresCitation = false; // tradição pode citar mas não é obrigatório
    } else if (HISTORICAL_RE.test(sent)) {
      category = 'HISTORICAL';
      requiresCitation = false;
    } else if (OPINION_RE.test(sent)) {
      category = 'OPINION';
      requiresCitation = false;
    }

    return {
      text: sent,
      category,
      requiresCitation,
      startIndex,
      endIndex: startIndex + sent.length,
    };
  });
}

// ============================================================================
// Citation rate — métrica Wave 32
// ============================================================================

/**
 * Calcula o citation_rate: % de claims que REQUEREM citação e têm
 * pelo menos uma citação dentro do raio de 200 chars.
 *
 * @returns valor 0..1 (1 = 100% das claims com citação)
 */
export function computeCitationRate(claims: Claim[], citations: Citation[]): number {
  if (claims.length === 0) return 1; // nada para citar = ok
  const required = claims.filter((c) => c.requiresCitation);
  if (required.length === 0) return 1;

  const RADIUS = 200; // chars de raio para associar citação à claim
  let cited = 0;

  for (const claim of required) {
    const hasCitation = citations.some(
      (cit) =>
        cit.startIndex !== undefined &&
        Math.abs(cit.startIndex - claim.startIndex) <= RADIUS,
    );
    if (hasCitation) cited++;
  }

  return cited / required.length;
}

// ============================================================================
// Formatters
// ============================================================================

/**
 * Formata uma citação no padrão inline Markdown:
 *   [Citação: Title, Year](URL)
 *   [Citação: Title, Year — Author](URL)   (se houver autor)
 *
 * Se não houver URL, usa formato curto: [Citação: Title, Year]
 */
export function formatCitationInline(c: Citation): string {
  const year = c.year ? `, ${c.year}` : '';
  const author = c.authors ? ` — ${c.authors}` : '';
  const label = `${c.title}${year}${author}`;
  if (c.url) {
    return `[Citação: ${label}](${c.url})`;
  }
  return `[Citação: ${label}]`;
}

/**
 * Formata lista de citações ao final da resposta, em formato Markdown.
 *
 *   ## Referências
 *
 *   1. [Title (Year, Author)](URL) — source
 *   2. ...
 */
export function formatCitationList(citations: Citation[]): string {
  if (citations.length === 0) return '';

  const dedup = dedupeCitations(citations);
  const lines = dedup.map((c, i) => {
    const parts: string[] = [];
    if (c.year) parts.push(String(c.year));
    if (c.authors) parts.push(c.authors);
    if (c.venue) parts.push(c.venue);
    if (c.page) parts.push(`p. ${c.page}`);

    const meta = parts.length > 0 ? ` (${parts.join(', ')})` : '';
    const label = `${c.title}${meta}`;
    const link = c.url ? `[${label}](${c.url})` : label;
    return `${i + 1}. ${link} — *${c.source}*`;
  });

  return `## Referências\n\n${lines.join('\n')}`;
}

/**
 * Dedupa citações por id (mesma fonte não aparece duas vezes).
 */
export function dedupeCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const c of citations) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

// ============================================================================
// Validation (sem rede — só sintaxe)
// ============================================================================

/**
 * Valida sintaxe de identificadores comuns (DOI, PMID, URL).
 * NÃO chama rede — valida só estrutura.
 *
 * @returns lista de issues (vazia = ok)
 */
export function validateCitation(c: Citation): string[] {
  const issues: string[] = [];

  if (c.source === 'DOI') {
    if (!/^10\.\d{4,9}\/[^\s]+$/.test(c.identifier)) {
      issues.push(`DOI malformado: ${c.identifier}`);
    }
  }

  if (c.source === 'PEER_REVIEWED' && /^\d{6,9}$/.test(c.identifier) === false) {
    issues.push(`PMID deve ser numérico 6-9 dígitos: ${c.identifier}`);
  }

  if (c.source === 'URL' || c.source === 'PEER_REVIEWED' || c.source === 'DOI') {
    if (!c.url) {
      issues.push(`URL ausente para fonte ${c.source}`);
    } else {
      try {
        const u = new URL(c.url);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') {
          issues.push(`URL com protocolo inválido: ${u.protocol}`);
        }
      } catch {
        issues.push(`URL inválida: ${c.url}`);
      }
    }
  }

  if (!c.title || c.title.length < 3) {
    issues.push('Título ausente ou muito curto');
  }

  return issues;
}

// ============================================================================
// Audit — Wave 32 high-level
// ============================================================================

export interface CitationAudit {
  /** Total de claims no texto */
  totalClaims: number;
  /** Claims que exigem citação (científica/médica/psicológica) */
  requiredClaims: number;
  /** Total de citações encontradas (raw, com duplicatas) */
  totalCitationsRaw: number;
  /** Citações únicas (após dedupe) */
  uniqueCitations: number;
  /** Citation rate 0..1 (target W32: ≥ 0.80) */
  citationRate: number;
  /** Citações validadas (sem issues de sintaxe) */
  validCitations: number;
  /** Issues estruturais (URL malformada, DOI inválido, etc) */
  structuralIssues: string[];
  /** Selo W32: GREEN se rate ≥ 0.80 e sem issues, YELLOW se ≥ 0.5, RED < 0.5 */
  seal: 'GREEN' | 'YELLOW' | 'RED';
}

/**
 * Auditoria completa de citações em uma resposta.
 * Função PURA — use em qualquer ponto (chat, curation, review).
 */
export function auditCitations(response: string): CitationAudit {
  const claims = extractClaims(response);
  const citations = extractCitations(response);
  const unique = dedupeCitations(citations);
  const required = claims.filter((c) => c.requiresCitation);
  const rate = computeCitationRate(claims, citations);

  const structuralIssues: string[] = [];
  let validCount = 0;
  for (const c of unique) {
    const issues = validateCitation(c);
    if (issues.length === 0) {
      validCount++;
    } else {
      structuralIssues.push(...issues.map((i) => `[${c.id}] ${i}`));
    }
  }

  let seal: 'GREEN' | 'YELLOW' | 'RED';
  if (rate >= 0.8 && structuralIssues.length === 0) {
    seal = 'GREEN';
  } else if (rate >= 0.5) {
    seal = 'YELLOW';
  } else {
    seal = 'RED';
  }

  return {
    totalClaims: claims.length,
    requiredClaims: required.length,
    totalCitationsRaw: citations.length,
    uniqueCitations: unique.length,
    citationRate: rate,
    validCitations: validCount,
    structuralIssues,
    seal,
  };
}

// ============================================================================
// Sanity check (boot)
// ============================================================================

/**
 * Self-check do módulo. Use em smoke tests.
 */
export function selfCheckCitation(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // Test: extractCitations acha DOI
  const t1 = 'Estudos (10.1234/jama.2023.12345) mostram que X é eficaz.';
  const c1 = extractCitations(t1);
  if (!c1.some((c) => c.source === 'DOI')) {
    errors.push('extractCitations não achou DOI');
  }

  // Test: extractCitations acha PubMed
  const t2 = 'Conforme PMID: 25177009 sobre meditação.';
  const c2 = extractCitations(t2);
  if (!c2.some((c) => c.source === 'PEER_REVIEWED')) {
    errors.push('extractCitations não achou PMID');
  }

  // Test: extractCitations acha (Autor et al. ANO)
  const t3 = 'Conforme Goyal et al. 2014, JAMA, meditação funciona.';
  const c3 = extractCitations(t3);
  if (!c3.some((c) => c.source === 'PEER_REVIEWED' && c.year === 2014)) {
    errors.push('extractCitations não achou (Autor et al. ANO)');
  }

  // Test: extractCitations acha [Citação: Title, Year](URL)
  const t4 = 'Ver [Citação: Mindfulness Meta-analysis, 2014](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/1809754)';
  const c4 = extractCitations(t4);
  if (!c4.some((c) => c.url === 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/1809754')) {
    errors.push('extractCitations não achou [Citação: ...](URL)');
  }

  // Test: extractClaims detecta SCIENTIFIC
  const t5 = 'Estudos mostram que meditação reduz ansiedade em 30% dos casos. Procure um profissional.';
  const claims5 = extractClaims(t5);
  if (!claims5.some((c) => c.category === 'SCIENTIFIC' && c.requiresCitation)) {
    errors.push('extractClaims não detectou SCIENTIFIC');
  }

  // Test: computeCitationRate = 1 quando todas as claims têm citação próxima
  const t6 = 'Estudos (Goyal et al. 2014) mostram que meditação reduz ansiedade. (Brewer et al. 2011) também.';
  const claims6 = extractClaims(t6);
  const cites6 = extractCitations(t6);
  const rate6 = computeCitationRate(claims6, cites6);
  if (rate6 < 0.5) {
    errors.push(`computeCitationRate muito baixo para texto citado: ${rate6}`);
  }

  // Test: computeCitationRate = 0 quando nenhuma claim tem citação
  const t7 = 'Estudos mostram que meditação reduz ansiedade. Pesquisas indicam que funciona.';
  const claims7 = extractClaims(t7);
  const cites7 = extractCitations(t7);
  const rate7 = computeCitationRate(claims7, cites7);
  if (rate7 > 0.3) {
    errors.push(`computeCitationRate alto demais para texto sem citação: ${rate7}`);
  }

  // Test: dedupeCitations funciona
  const c8 = extractCitations('DOI: 10.1234/x. (Goyal et al. 2014). DOI: 10.1234/x.');
  const u8 = dedupeCitations(c8);
  if (u8.length !== 2) {
    errors.push(`dedupeCitations falhou: esperado 2, obtido ${u8.length}`);
  }

  // Test: formatCitationInline
  const c9 = formatCitationInline({
    id: 'DOI:10.1234/x',
    source: 'DOI',
    identifier: '10.1234/x',
    title: 'Mindfulness',
    year: 2014,
    url: 'https://doi.org/10.1234/x',
    confidence: 1,
  });
  if (!c9.includes('Mindfulness') || !c9.includes('2014') || !c9.includes('https://doi.org/')) {
    errors.push(`formatCitationInline falhou: ${c9}`);
  }

  // Test: validateCitation rejeita DOI malformado
  const issues10 = validateCitation({
    id: 'DOI:bad',
    source: 'DOI',
    identifier: 'invalid',
    title: 'X',
    confidence: 1,
  } as Citation);
  if (issues10.length === 0) {
    errors.push('validateCitation não rejeitou DOI malformado');
  }

  return { ok: errors.length === 0, errors };
}
