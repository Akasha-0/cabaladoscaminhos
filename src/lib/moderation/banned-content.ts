/**
 * ============================================================================
 * BANNED CONTENT CATALOG — Cabala dos Caminhos (Wave 36)
 * ============================================================================
 *
 * Catálogo central de vocabulário e padrões bloqueados pelo auto-moderation
 * pipeline. Quatro categorias:
 *
 *   - spam   → promoção comercial não-autorizada, clickbait, MLM
 *   - scam   → fraude financeira, golpe emocional, pirâmide
 *   - sacred → uso mercantilista ou gamificado de termos sagrados
 *   - hate   → discurso de ódio, discriminação, violência
 *
 * **Princípio universalista:** o filtro NÃO julga tradições. Bloqueia APENAS
 * (a) linguagem que mercantiliza o sagrado, (b) gamificação anti-respeito
 * (level/score/streak), (c) moderação punitiva visível, (d) golpes.
 *
 * Tudo aqui é case-insensitive e testado em PT-BR (80% do público-alvo).
 * Adições devem ser revisadas por Iyá (curador-mor) antes de entrar em prod.
 *
 * @see docs/MODERATION-AUTO-W36.md     — pipeline reference
 * @see docs/CULTURAL-SENSITIVITY-W29.md — tradição por tradição
 * ============================================================================
 */

// ============================================================================
// KEYWORD CATEGORIES
// ============================================================================

export const BANNED_KEYWORDS = {
  /**
   * Spam comercial não-autorizado.
   * Publicidade no feed sem ser marketplace verified vendor.
   */
  spam: [
    // PT-BR
    'compre agora',
    'clique aqui',
    'oferta imperdível',
    'promoção limitada',
    'desconto exclusivo',
    'frete grátis',
    'dinheiro fácil',
    'renda extra garantida',
    'trabalhe de casa',
    'seja nosso parceiro',
    'invista agora',
    'ganhe dinheiro',
    'multiplique seus ganhos',
    'saiu na mídia',
    'vagas abertas',
    'cadastre seu email',
    'saiba mais',
    // EN
    'click here',
    'buy now',
    'free money',
    'limited time offer',
    'exclusive deal',
    'make money fast',
    'work from home',
    'sign up now',
    'join thousands',
    // ES
    'compra ahora',
    'oferta limitada',
    'dinero fácil',
    'trabaja desde casa',
  ],

  /**
   * Scam / fraude financeira ou emocional.
   */
  scam: [
    'bitcoin doubler',
    'dobrador de bitcoin',
    'esquema ponzi',
    'pirâmide financeira',
    'fique rico rápido',
    'empréstimo sem consulta',
    'cpf negativado',
    'nome limpo',
    'aposta garantida',
    'palpite certeiro',
    'certeza absoluta',
    'sem risco nenhum',
    '100% garantido',
    'retorno garantido',
    'em 24 horas',
    'do dia pra noite',
    'criptomoeda garantida',
    'lucre com',
    'satoshi nakamoto me contatou',
    'ganhe bitcoin grátis',
    'airdrop grátis',
    'giveaway cripto',
    'envie bitcoin para',
    'endereço de carteira privado',
  ],

  /**
   * Termos sagrados em contexto mercantilista ou gamificado.
   * Universalismo: NÃO bloqueia o termo em si — bloqueia o padrão de uso.
   *
   * Categorias:
   *  - "level/achievement/score/streak" → gamificação anti-respeito
   *  - "strike/warning/mute/ban" → moderação punitiva visível (rede social genérica)
   *  - "amarre/vinculação" → prática manipulativa no marketplace
   */
  sacred: [
    // Gamificação
    'level up espiritual',
    'achievement espiritual',
    'pontuação mística',
    'streak de oração',
    'ranking de médiuns',
    'score kármico',
    'desbloqueie o próximo nível',
    'suba de nível espiritual',
    'XP sagrado',
    'moeda espiritual',
    'energia comprada',
    'crédito espiritual',
    // Moderação punitiva
    'você levou strike',
    'você foi mutado',
    'você foi banido',
    'aviso formal',
    'penalidade de karma',
    'castigo espiritual',
    // Mercado de manipulação
    'amarre de amor',
    'amarração amorosa',
    'vinculação amorosa',
    'amarre forte',
    'amarração definitiva',
    'regressão kármica paga',
    'limpeza espiritual cobrada',
    'feitiço sob encomenda',
    'trabalho espiritual garantido',
  ],

  /**
   * Discurso de ódio e discriminação.
   * Bloqueado em qualquer idioma; LGPD Art. 7 (dignidade).
   */
  hate: [
    // Orientação
    'viado',
    'sapatão',
    'bicha',
    'gay de',
    'lésbica de',
    // Religião
    'macumbeiro',
    'crente fanático',
    'ateu desgraçado',
    'judeu avarento',
    'muçulmano terrorista',
    'evangélico burro',
    'católico hipócrita',
    // Raça / etnia
    'preto de',
    'negro de',
    'favelado',
    'macaco',
    'branquelo',
    'índio preguiçoso',
    // Outros
    'deficiente inútil',
    'velho inútil',
    'gorda nojenta',
    // EN
    'faggot',
    'nigger',
    'kike',
    'spic',
    'chink',
    'tranny',
    'retard',
  ],
} as const;

export type BannedCategory = keyof typeof BANNED_KEYWORDS;

// ============================================================================
// REGEX PATTERNS — Cobertura sintática (não cabe em keyword list)
// ============================================================================

export const BANNED_PATTERNS: ReadonlyArray<{ pattern: RegExp; category: BannedCategory; reason: string }> = [
  // Promessas absolutas (cura, resultado, prosperidade)
  { pattern: /garanto\s+(que\s+)?(você|vc|vc\s+ira|vai)/i, category: 'scam', reason: 'garantia absoluta de resultado' },
  { pattern: /\b(cura|tratamento)\s+definitiv[ao]s?\s+(de|para|do|da)/i, category: 'scam', reason: 'promessa de cura definitiva' },
  { pattern: /protocolo\s+de\s+cura\s+alternativa/i, category: 'sacred', reason: 'protocolo de cura mercantilizado' },
  { pattern: /\b100%\s+(garantido|seguro|eficaz)\b/i, category: 'scam', reason: 'certeza absoluta' },
  { pattern: /\bsem\s+risco\s+(algum|zero|nenhum)/i, category: 'scam', reason: 'ausência total de risco' },

  // Mercado de cura/amor (anti-universalismo)
  { pattern: /amarra?\s+(de|para)\s+(amor|namorad[ao]|ex)/i, category: 'sacred', reason: 'amarração amorosa mercantilizada' },
  { pattern: /trabalho\s+espiritual\s+(por|pelo|valor|preço)\s+R\$/i, category: 'sacred', reason: 'espiritualidade com preço explícito' },
  { pattern: /\b(rezar|oração)\s+de\s+pago\b/i, category: 'sacred', reason: 'oração cobrada' },
  { pattern: /\b(karma|cura)\s+por\s+encomenda\b/i, category: 'sacred', reason: 'trabalho espiritual sob encomenda' },

  // URLs suspeitas (shorteners + cripto wallet)
  { pattern: /bit\.ly\/[a-z0-9]+/i, category: 'spam', reason: 'URL shortener suspeito' },
  { pattern: /tinyurl\.com\/[a-z0-9]+/i, category: 'spam', reason: 'URL shortener suspeito' },
  { pattern: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/, category: 'scam', reason: 'endereço bitcoin solicitado em texto público' },
  { pattern: /0x[a-fA-F0-9]{40}/, category: 'scam', reason: 'endereço ethereum solicitado em texto público' },

  // Spam de contato externo (pular plataforma)
  { pattern: /(chama\s+no\s+)?(zap|whats|telegram|tele)\s*[:：]?\s*\d{8,}/i, category: 'spam', reason: 'contato fora da plataforma (spam de WhatsApp)' },
  { pattern: /\bwhatsapp\s+(\d{2})\s*9?\d{4}-?\d{4}\b/i, category: 'spam', reason: 'número de WhatsApp em post público' },

  // URLs de venda paralela
  { pattern: /(shopee|aliexpress|amazon)\.com\/[a-z0-9-]+/i, category: 'spam', reason: 'link de marketplace paralelo' },

  // Texto todo em caixa-alta + exclamações (shouting)
  { pattern: /^[A-Z\s!]{30,}$/m, category: 'spam', reason: 'shouting (caps lock excessivo)' },
];

// ============================================================================
// LÉXICO SAGRADO — Proteção cultural (não bloqueia, mas sinaliza)
// ============================================================================

/**
 * Termos cujo uso é sagrado e qualquer mercantilização deve ser sinalizada
 * para revisão humana. A presença no texto NÃO dispara auto-flag — o pipeline
 * combina com padrões adjacentes (ex: "R$", "pix", "comprar").
 */
export const SACRED_TERMS_PROTECTED = [
  // Candomblé / Umbanda
  'orixá',
  'orixas',
  'ogun',
  'oxum',
  'iemanja',
  'xango',
  'iansã',
  'obaluaê',
  'omulu',
  'oxalá',
  'ogum',
  'oxóssi',
  'nanã',
  'iabá',
  'preto velho',
  'preto-velho',
  'caboclo',
  'exu',
  'pomba gira',
  'pombagira',
  // Cabala
  'árvore da vida',
  'sefirot',
  'sefirá',
  'kether',
  'chokmah',
  'binah',
  'tiferet',
  'malkuth',
  'shem hamephorash',
  // Astrologia
  'saturno',
  'plutão',
  'netuno',
  'ascendente',
  'meio-do-céu',
  'meio do ceu',
  'casa 12',
  // Tantra
  'kundalini',
  'shakti',
  'shiva',
  'chacra',
  'muladhara',
  // Ifá
  'orunmila',
  'ifa',
  'babalaô',
  'babalao',
  'iyawó',
  'iyawo',
  'ori',
  // Geral
  'akasha',
  'akáshico',
  'mediunidade',
  'mediúnico',
  'incorporação',
  'ponto riscado',
  'gira',
];

// ============================================================================
// DETECTION HELPERS
// ============================================================================

export interface KeywordMatch {
  category: BannedCategory;
  matched: string;
  reason: string;
}

export interface PatternMatch {
  category: BannedCategory;
  pattern: RegExp;
  reason: string;
}

/**
 * Procura keywords proibidas em texto (case-insensitive, sem regex).
 * Retorna todas as ocorrências; o pipeline decide a severidade.
 */
export function findBannedKeywords(text: string): KeywordMatch[] {
  const lower = text.toLowerCase();
  const matches: KeywordMatch[] = [];

  for (const [category, keywords] of Object.entries(BANNED_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        matches.push({ category: category as BannedCategory, matched: kw, reason: `keyword banned: ${kw}` });
      }
    }
  }

  return matches;
}

/**
 * Procura padrões regex proibidos.
 */
export function findBannedPatterns(text: string): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const { pattern, category, reason } of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      matches.push({ category, pattern, reason });
    }
  }

  return matches;
}

/**
 * Detecta presença de termos sagrados protegidos (não bloqueia — apenas
 * sinaliza para o pipeline cruzar com marcadores de mercantilização).
 */
export function findSacredTerms(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const term of SACRED_TERMS_PROTECTED) {
    if (lower.includes(term)) found.push(term);
  }
  return found;
}

/**
 * Sinaliza mercantilização de termos sagrados: termo sagrado + marcador
 * comercial (R$, pix, comprar, pagamento, R$X) na mesma frase.
 */
export function findSacredMercantilism(text: string): { term: string; snippet: string }[] {
  const sacredHits = findSacredTerms(text);
  if (sacredHits.length === 0) return [];

  // Marcadores de mercantilização (R$, pix, valor, preço, comprar, pagamento, venda)
  const mercantileMarker = /(R\$|pix|pixar|comprar|compra|preço|valor\s+R\$|pagamento|venda|vende|pago|paga)/i;
  const lines = text.split(/\n|(?<=[.!?])\s+/);
  const out: { term: string; snippet: string }[] = [];

  for (const line of lines) {
    if (!mercantileMarker.test(line)) continue;
    for (const term of sacredHits) {
      if (line.toLowerCase().includes(term)) {
        out.push({ term, snippet: line.trim().slice(0, 200) });
      }
    }
  }
  return out;
}