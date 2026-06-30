// ============================================================================
// AKASHA — Context Awareness (Wave 32 — 2026-06-30)
// ============================================================================
// Detecta 3 dimensões do contexto do usuário:
//   1. SENTIMENT (negativo/neutro/positivo) — adapta acolhimento
//   2. NÍVEL DE CONHECIMENTO (iniciante/intermediário/avançado)
//   3. INTENÇÃO (curiosidade/dor/ação/reflexão/celebração)
//
// Cada dimensão ajusta um trecho do system prompt para que a Akasha
// responda com o tom certo, sem mudar sua identidade.
//
// Heurística: regex + wordlists, sem chamar LLM. Roda em <5ms para
// mensagens típicas (<500 chars).
//
// Inspiração:
//   - Plutchik (1980) — modelo de 8 emoções básicas (simplificado para 3)
//   - Bloom's Taxonomy (níveis de conhecimento)
//   - User-Intent frameworks (Google, Bing search intent)
//
// Uso:
//   const ctx = detectContext("Tô muito ansioso, não sei o que fazer");
//   const promptAug = formatContextBlock(ctx);
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export type Sentiment = 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE';

export type KnowledgeLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type Intent =
  | 'SEEKING_COMFORT'    // "tô mal", "ansioso", "sofrendo"
  | 'SEEKING_GUIDANCE'   // "o que faço?", "como lidar?"
  | 'SEEKING_KNOWLEDGE'  // "o que é X?", "explique Y"
  | 'SEEKING_PRACTICE'   // "como pratico?", "exercício"
  | 'CELEBRATING'        // "consegui!", "obrigada", gratidão
  | 'CHALLENGING'        // "discordo", "isso é errado"
  | 'EXPLORING';         // neutro, curioso

export interface UserContext {
  sentiment: Sentiment;
  knowledge: KnowledgeLevel;
  intent: Intent;
  /** Confiança 0..1 (heurística) */
  confidence: number;
  /** Sinais detectados (palavras/frases que dispararam cada classificador) */
  signals: {
    sentiment: string[];
    knowledge: string[];
    intent: string[];
  };
  /** Tom recomendado (injetado no system prompt) */
  recommendedTone: string;
  /** Recomendações específicas (injetadas no system prompt) */
  recommendations: string[];
  /** Adaptações de jargão */
  jargonPolicy: 'AVOID' | 'EXPLAIN' | 'USE_FREELY';
}

// ============================================================================
// Sentiment detection
// ============================================================================

const NEGATIVE_SIGNAL = /\b(ansios[oa]|angustiad[oa]|deprimid[oa]|triste|sofrend[oa]|perdido|desesperado|desesperad[oa]|com med[oa]|com raiva|irritad[oa]|frustrad[oa]|cansad[oa]|exaust[oa]|sozinho|isolad[oa]|com vergonha|culpado|culpa|machuca|machucado|não aguento|não consigo|não sei o que fazer|tô mal|to mal|tô péssimo|to pessimo|horrível|horroroso|pessimo|p[ée]ssimo|desesperançado|desesperan[çc]a|abandonad[oa]|rejeitad[oa]|vulner[áa]vel|trauma|traumatizad[oa]|crise|p[áa]nico|ataque|chor[oa]r|chorei|choro|não durmo|não consigo dormir|insônia|insonia|perd[êe]i|perdi|luto|morte|suic[ií]dio|me machucar|tirar minha vida|não vale a pena|acabar com tudo)\b/i;
const POSITIVE_SIGNAL = /\b(obrigad[oa]|gr[áa]ças|grato|gratid[ãa]o|alegre|feliz|contente|animad[oa]|entusiasmad[oa]|empolgado|maravilhoso|incr[íi]vel|ótimo|otimo|excelente|fant[áa]stico|amor|am[áa]r|paix[ãa]o|paz|seren[oa]|tranquil[oa]|calmo|leve|bonito|esperança|esperan[çc]a|consegui|conquist[ei]|deu certo|funcion[ou]ou?|valeu a pena|recome[çc]o|renascimento|celebrar|celebra[çc][ãa]o|gratid[ãa]o|f[ée]|confian[çc]a|fé)\b/i;

const SENTIMENT_SIGNALS: Record<Sentiment, { positive: RegExp; negative: RegExp }> = {
  // negativo: dor, medo, raiva, frustração
  NEGATIVE: { positive: POSITIVE_SIGNAL, negative: NEGATIVE_SIGNAL },

  // positivo: gratidão, alegria, celebração
  POSITIVE: { positive: POSITIVE_SIGNAL, negative: NEGATIVE_SIGNAL },

  // neutro: sem sinal claro
  NEUTRAL: { positive: POSITIVE_SIGNAL, negative: NEGATIVE_SIGNAL },
};

/**
 * Detecta sentiment da mensagem. Função PURA.
 *
 * @returns {Sentiment, confidence, signals}
 */
export function detectSentiment(
  message: string,
): { sentiment: Sentiment; confidence: number; signals: string[] } {
  if (!message || message.length < 3) {
    return { sentiment: 'NEUTRAL', confidence: 0, signals: [] };
  }

  const negMatches = message.match(new RegExp(SENTIMENT_SIGNALS.NEGATIVE.negative.source, 'gi')) ?? [];
  const posMatches = message.match(new RegExp(SENTIMENT_SIGNALS.POSITIVE.positive.source, 'gi')) ?? [];

  const negCount = negMatches.length;
  const posCount = posMatches.length;

  if (negCount === 0 && posCount === 0) {
    return { sentiment: 'NEUTRAL', confidence: 0.5, signals: [] };
  }

  if (negCount > posCount) {
    return {
      sentiment: 'NEGATIVE',
      confidence: Math.min(0.5 + negCount * 0.1, 1.0),
      signals: negMatches,
    };
  }
  if (posCount > negCount) {
    return {
      sentiment: 'POSITIVE',
      confidence: Math.min(0.5 + posCount * 0.1, 1.0),
      signals: posMatches,
    };
  }

  // empate: neutro
  return {
    sentiment: 'NEUTRAL',
    confidence: 0.4,
    signals: [...negMatches, ...posMatches],
  };
}

// ============================================================================
// Knowledge-level detection
// ============================================================================

const KNOWLEDGE_SIGNALS: Record<KnowledgeLevel, RegExp> = {
  // iniciante: usa palavras leigas, pergunta "o que é", "como funciona"
  BEGINNER:
    /\b(o que (é|são|significa)?|como funciona|me explica|não (entendo|sei|conheço)|sou (nov[oa]|iniciante|leigo|principiante)|b[áa]sico|come[çc]ando|come[çc]ei (agora|recent)|simples|facinho|f[áa]cil de entender|explica (pra|para) mim|em portugu[êe]s|sem jarg[ãa]o)\b/i,

  // avançado: usa jargão técnico sem definir
  ADVANCED:
    /\b(default mode network|DMN|prefrontal cortex|amigdala|hipocampo|neuroplasticidade|synaptogenesis|qualia|epistemolog|fenomenolog|hermeneuti|cabala (te[óo]rica|l[úu]rica|pr[áa]tica)|sefirot (superiores|inferiores)|kether|chokmah|binah|chessed|guevurah|tiferet|netzach|hod|yesod|malchut|orunmil[áa]|iemanje?á?|ogum|ians[ãa]|xang[oô]|oxala|ob[áa]lua[çc][ãa]o|ex[ée]u|preto[\s-]?velho|caboclo|gira (de)|pena|pont[ãa]o|mediun[ie]dade|encosto|psilocibina|d[íi]mt|5[\s-]?MeO[\s-]?DMT|harmina|harmalina|iboga[ií]na|kundalini|shaktipat|prana|apana|samana|vyana|udana|nadis|ida|pingala|sushumna|sahasrara|ajna|anahata|manipura|svadhisthana|muladhara|dharma|karman|moksha|samsara|atman|brahman|ayni|tinku|ch[áa]ulla|n[áa]hua|ayahuasca|caapi|hoasca|jurema|peyote|teonan[áa]catl|amanita|iboga|tabernanthe|bnzw|rap[ée]|kambo|san pedro|wachuma|mescalina)\b/i,

  // intermediário: não tem sinal forte nem de um lado nem de outro
  INTERMEDIATE: /^$/, // nunca match — INTERMEDIATE é o default
};

/**
 * Detecta nível de conhecimento. Heurística simples baseada em jargão.
 */
export function detectKnowledgeLevel(
  message: string,
): { knowledge: KnowledgeLevel; confidence: number; signals: string[] } {
  if (!message || message.length < 3) {
    return { knowledge: 'BEGINNER', confidence: 0, signals: [] };
  }

  const advMatches = message.match(new RegExp(KNOWLEDGE_SIGNALS.ADVANCED.source, 'gi')) ?? [];
  const begMatches = message.match(new RegExp(KNOWLEDGE_SIGNALS.BEGINNER.source, 'gi')) ?? [];

  if (advMatches.length >= 2) {
    return { knowledge: 'ADVANCED', confidence: 0.8, signals: advMatches };
  }
  if (advMatches.length === 1 && begMatches.length === 0) {
    return { knowledge: 'ADVANCED', confidence: 0.6, signals: advMatches };
  }
  if (begMatches.length > 0) {
    return { knowledge: 'BEGINNER', confidence: 0.7, signals: begMatches };
  }
  return { knowledge: 'INTERMEDIATE', confidence: 0.5, signals: [] };
}

// ============================================================================
// Intent detection
// ============================================================================

// SENTIMENT_SIGNALS: workaround (não usado diretamente — ver detectSentiment)
// Mantido exportado caso outros módulos queiram iterar.
void SENTIMENT_SIGNALS;

const INTENT_SIGNALS: Record<Intent, RegExp> = {
  SEEKING_COMFORT: /\b(t[ôo] (mal|triste|ansios[oa]|sofrend[oa]|perdido)|preciso (de ajuda|conversar|algu[ée]m)|me (ajuda|socorre)|não aguento|não sei o que fazer|não consigo mais|estou (mal|horrível|pessimo)|tô carente|to carente|desabaf[oa]r|desabaf[oa]|chor[oa]r|chor[oa]|desesper[oa]|desesper[oa])\b/i,

  SEEKING_GUIDANCE: /\b(o que (devo|fa[çc]o|posso|eu faço)|como (lidar|sair|resolver|agir|proceder|reagir|reagir)|me (orienta|guia|conselha|d[áa] (uma|noção|dire[çc][ãa]o))|preciso (de uma|no[çc][ãa]o|dire[çc][ãa]o|orienta[çc][ãa]o)|o que voc[êe] (acha|faria|recomenda|sugere|indica)|conselho|orienta[çc][ãa]o)\b/i,

  SEEKING_KNOWLEDGE: /\b(o que (é|são|significa)|como funciona|me explica|explica pra mim|qual a (diferen[çc]a|rela[çc][ãa]o|conex[ãa]o)|existe (algo|algu[ée]m|uma)|hist[óo]ria (de|do|da)|origem (de|do|da)|conceito|defini[çc][ãa]o|teoria|filosofia|entender|compreender|aprender sobre|quero saber|queria saber|gostaria de saber|tem como voc[êe] me contar|me conte|me fala (sobre|da|do|de))\b/i,

  SEEKING_PRACTICE: /\b(como (pratic[oa]r?|fazer|fa[çc]o|come[çc]o|come[çc]ar|trein[oa]r|exercitar|funciona)|exerc[íi]cio|pr[áa]tica|rotina|ritual|t[ée]cnica|passo a passo|meditar|respirar|yoga|asana|pranayama|mantra|visualiza[çc][ãa]o|afirma[çc][ãa]o|di[áa]rio|journaling|como (fazer|fa[çc]o|come[çc]o))\b/i,

  CELEBRATING: /\b(obrigad[oa] (por|pela)|gr[áa]ças a|deu certo|funcion[ou]ou?|consegui|complet[ei]|terminei|finalizei|comemorei|celebr[oe]i|marco|conquista|vit[óo]ria|alcan[çc]ei|realizei|superei|cur[ei]ei|vitorioso)\b/i,

  CHALLENGING: /\b(discordo|não concordo|voc[êe] est[áa] (errado|equivocado)|isso n[ãa]o (faz sentido|é verdade|é correto)|achei (errado|fraco|simplista)|n[ãa]o gostei|propaganda|n[ãa]o é bem assim|me convenceu|n[ãa]o me convenceu|mas (n[ãa]o|na verdade)|por[ée]m|contudo|entretanto|por[ée]m|insatisfat[óo]ri[oa])\b/i,

  // default: explorando neutro
  EXPLORING: /.*/,
};

const INTENT_PRIORITY: Intent[] = [
  'SEEKING_COMFORT',
  'CELEBRATING',
  'CHALLENGING',
  'SEEKING_PRACTICE',
  'SEEKING_GUIDANCE',
  'SEEKING_KNOWLEDGE',
  'EXPLORING',
];

/**
 * Detecta intenção do usuário. Prioriza sinais emocionais sobre funcionais.
 */
export function detectIntent(
  message: string,
): { intent: Intent; confidence: number; signals: string[] } {
  if (!message || message.length < 3) {
    return { intent: 'EXPLORING', confidence: 0, signals: [] };
  }

  for (const intent of INTENT_PRIORITY) {
    if (intent === 'EXPLORING') continue;
    const re = INTENT_SIGNALS[intent];
    const matches = message.match(new RegExp(re.source, 'gi')) ?? [];
    if (matches.length > 0) {
      return {
        intent,
        confidence: Math.min(0.5 + matches.length * 0.15, 1.0),
        signals: matches,
      };
    }
  }

  return { intent: 'EXPLORING', confidence: 0.5, signals: [] };
}

// ============================================================================
// Combined detection
// ============================================================================

/**
 * Roda os 3 detectores e compõe UserContext.
 */
export function detectContext(message: string): UserContext {
  const sent = detectSentiment(message);
  const know = detectKnowledgeLevel(message);
  const intent = detectIntent(message);

  const { tone, recommendations, jargon } = adaptResponse(
    sent.sentiment,
    know.knowledge,
    intent.intent,
  );

  return {
    sentiment: sent.sentiment,
    knowledge: know.knowledge,
    intent: intent.intent,
    confidence: (sent.confidence + know.confidence + intent.confidence) / 3,
    signals: {
      sentiment: sent.signals,
      knowledge: know.signals,
      intent: intent.signals,
    },
    recommendedTone: tone,
    recommendations,
    jargonPolicy: jargon,
  };
}

// ============================================================================
// Adapter — gera tom e recomendações
// ============================================================================

function adaptResponse(
  sentiment: Sentiment,
  knowledge: KnowledgeLevel,
  intent: Intent,
): { tone: string; recommendations: string[]; jargon: UserContext['jargonPolicy'] } {
  const recs: string[] = [];
  let tone = 'acolhedor mas honesto';
  let jargon: UserContext['jargonPolicy'] = 'EXPLAIN';

  // Sentimento tem precedência
  if (sentiment === 'NEGATIVE' || intent === 'SEEKING_COMFORT') {
    tone = 'acolhedor, gentil, sem pressa, sem diagnosticar';
    recs.push('Comece validando o sentimento antes de oferecer informação.');
    recs.push('Sugira recursos da biblioteca, grupos, ou CVV (188) se houver crise.');
    recs.push('Não tente "resolver" — acolha primeiro.');
  } else if (sentiment === 'POSITIVE' || intent === 'CELEBRATING') {
    tone = 'caloroso, celebra junto, sem bajular';
    recs.push('Reconheça a conquista genuinamente (sem "Parabéns!" automático).');
    recs.push('Aprofunde — pergunte o que ajudou, registre o aprendizado.');
  } else if (intent === 'CHALLENGING') {
    tone = 'humilde, curioso, reconhece a objeção como válida';
    recs.push('Admita o limite do que você sabe.');
    recs.push('Ofereça perspectiva sem defensividade.');
  } else if (intent === 'SEEKING_PRACTICE') {
    tone = 'prático, didático, passo a passo';
    recs.push('Dê instrução concreta (passo 1, passo 2...).');
    recs.push('Liste contraindicações antes da prática.');
  } else if (intent === 'SEEKING_GUIDANCE') {
    tone = 'reflexivo, oferece múltiplas perspectivas sem decidir pelo usuário';
    recs.push('Apresente 2-3 caminhos possíveis.');
    recs.push('Faça pergunta de volta para o usuário chegar à própria resposta.');
  } else if (intent === 'SEEKING_KNOWLEDGE') {
    tone = 'didático, claro, com estrutura';
    recs.push('Resposta direta primeiro, contexto depois.');
    recs.push('Cite fontes (citation_system).');
  }

  // Knowledge ajusta jargão
  if (knowledge === 'BEGINNER') {
    jargon = 'AVOID';
    recs.push('Evite jargão técnico. Quando inevitável, explique com analogia.');
  } else if (knowledge === 'ADVANCED') {
    jargon = 'USE_FREELY';
    recs.push('Pode usar terminologia técnica sem definir termos básicos.');
  } else {
    jargon = 'EXPLAIN';
    recs.push('Termos técnicos: defina brevemente na primeira menção.');
  }

  return { tone, recommendations: recs, jargon };
}

// ============================================================================
// Format — bloco injetável no system prompt
// ============================================================================

/**
 * Formata UserContext como bloco Markdown para injetar no system prompt.
 * Aparece DEPOIS da constituição e ANTES do RAG (Wave 32 spec).
 */
export function formatContextBlock(ctx: UserContext): string {
  if (ctx.confidence < 0.3) {
    return ''; // não polui prompt se confiança muito baixa
  }

  const lines: string[] = ['', '## Contexto do usuário (Wave 32 — auto-detectado)'];

  lines.push(`**Sentimento:** ${ctx.sentiment}`);
  lines.push(`**Nível de conhecimento:** ${ctx.knowledge}`);
  lines.push(`**Intenção detectada:** ${ctx.intent}`);
  lines.push('');
  lines.push(`**Tom recomendado:** ${ctx.recommendedTone}`);
  lines.push(`**Política de jargão:** ${ctx.jargonPolicy}`);
  if (ctx.recommendations.length > 0) {
    lines.push('');
    lines.push('**Recomendações de resposta:**');
    for (const r of ctx.recommendations) {
      lines.push(`- ${r}`);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// Self-check
// ============================================================================

export function selfCheckContext(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Sentimento negativo
  const s1 = detectSentiment('Tô muito ansioso, não sei o que fazer');
  if (s1.sentiment !== 'NEGATIVE') {
    errors.push(`detectSentiment falhou: esperado NEGATIVE, obtido ${s1.sentiment}`);
  }

  // 2. Sentimento positivo
  const s2 = detectSentiment('Consegui! Obrigada pela ajuda!');
  if (s2.sentiment !== 'POSITIVE') {
    errors.push(`detectSentiment falhou: esperado POSITIVE, obtido ${s2.sentiment}`);
  }

  // 3. Sentimento neutro
  const s3 = detectSentiment('O que é meditação?');
  if (s3.sentiment !== 'NEUTRAL') {
    errors.push(`detectSentiment falhou: esperado NEUTRAL, obtido ${s3.sentiment}`);
  }

  // 4. Conhecimento iniciante
  const k1 = detectKnowledgeLevel('Sou iniciante, o que é Cabala?');
  if (k1.knowledge !== 'BEGINNER') {
    errors.push(`detectKnowledgeLevel falhou: esperado BEGINNER, obtido ${k1.knowledge}`);
  }

  // 5. Conhecimento avançado
  const k2 = detectKnowledgeLevel('Como kether se relaciona com binah no mundo de Atziluth?');
  if (k2.knowledge !== 'ADVANCED') {
    errors.push(`detectKnowledgeLevel falhou: esperado ADVANCED, obtido ${k2.knowledge}`);
  }

  // 6. Intenção conforto
  const i1 = detectIntent('Tô mal, preciso de ajuda');
  if (i1.intent !== 'SEEKING_COMFORT') {
    errors.push(`detectIntent falhou: esperado SEEKING_COMFORT, obtido ${i1.intent}`);
  }

  // 7. Intenção prática
  const i2 = detectIntent('Como pratico meditação mindfulness?');
  if (i2.intent !== 'SEEKING_PRACTICE') {
    errors.push(`detectIntent falhou: esperado SEEKING_PRACTICE, obtido ${i2.intent}`);
  }

  // 8. detectContext combina os 3 (sentiment > intent priority)
  const c1 = detectContext('Tô ansioso, como pratico?');
  if (c1.sentiment !== 'NEGATIVE') {
    errors.push(`detectContext não detectou NEGATIVE: ${c1.sentiment}`);
  }
  // Quando dor+prática coexistem, COMFORT tem prioridade (acolhe primeiro)
  if (c1.intent !== 'SEEKING_COMFORT') {
    errors.push(`detectContext deveria priorizar COMFORT em 'tô ansioso, como pratico': ${c1.intent}`);
  }

  // 9. formatContextBlock produz bloco
  const f1 = formatContextBlock(c1);
  if (!f1.includes('Tom recomendado') || !f1.includes('Contexto do usuário')) {
    errors.push('formatContextBlock não produziu bloco esperado');
  }

  // 10. Confiança baixa = bloco vazio
  const c2 = detectContext('a');
  if (formatContextBlock(c2).length > 0) {
    // confidence < 0.3 deve suprimir
    if (c2.confidence >= 0.3) {
      // ok, confidence alta
    } else {
      errors.push('formatContextBlock produziu bloco para confidence < 0.3');
    }
  }

  return { ok: errors.length === 0, errors };
}
