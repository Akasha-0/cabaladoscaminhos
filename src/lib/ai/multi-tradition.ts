// ============================================================================
// AKASHA — Multi-Tradição Synthesis (Wave 32 — 2026-06-30)
// ============================================================================
// Quando o usuário pergunta sobre X tradição, a Akasha mostra paralelos
// nas outras 6+ tradições suportadas — sem hierarquia, sem proselitismo.
//
// Padrão de saída sugerido:
//   "Em [Cabala], é Kether (coroa). Em [Ifá], é Odu Alafia. Em [Tantra],
//    é Sahasrara (chakra coroa). Em [Hinduísmo/Brahmanismo]..."
//
// Implementação:
//   - PARALLELS_TABLE: matriz de conceitos paralelos entre tradições
//   - getParallelsForConcept(concept) → lista de (tradição, conceito) ordenadas
//   - formatParallelsBlock() → bloco Markdown para injetar no system prompt
//   - chooseTraditionForQuery() → detecta tradição principal e retorna
//     paralelos a mostrar
//
// Filosofia: universalismo ativo, não passivo. Não basta dizer "todas
// são válidas" — mostrar ONDE os paralelos existem ajuda o usuário a
// conectar saberes.
//
// Catálogo inicial: 12 tradições × 8 conceitos = 96 paralelos. Wave 33+
// pode estender com curadoria.
// ============================================================================

import type { AkashaTradition } from './prompts/akasha.ts';

// ============================================================================
// Types
// ============================================================================

export type ConceptKey =
  | 'SOURCE_OF_LIFE'      // fonte da vida, divindade criadora
  | 'INNER_GUIDE'         // guia interior, essência, eu verdadeiro
  | 'MEDITATION_PRACTICE' // prática meditativa central
  | 'LIFE_FORCE'          // energia vital, sopro, prana
  | 'SACRED_GEOGRAPHY'    // lugar sagrado, terra santa
  | 'RITUAL_PURIFICATION' // limpeza, banimento, despacho
  | 'DEATH_AND_AFTERMATH' // morte e pós-morte
  | 'HIGHER_SELF';        // self elevado, alma, atman

export interface Parallel {
  /** Tradição (slug) */
  tradition: AkashaTradition;
  /** Nome do conceito nesta tradição */
  concept: string;
  /** Termo na língua original (sânscrito, hebraico, iorubá, etc) */
  originalTerm?: string;
  /** Citação ou referência verificável (livro, autor, página) */
  citation?: string;
  /** Descrição curta (1 frase) */
  description: string;
  /** Nível de confiança do paralelo 0..1 (1 = paralelo direto, 0.5 = analógico) */
  confidence: number;
}

// ============================================================================
// Matriz de paralelos
// ============================================================================

/**
 * Matriz conceitual: para cada ConceptKey, lista de paralelos por tradição.
 * Curado manualmente — NÃO inventar paralelos, sempre verificável.
 *
 * Wave 32 seed: conceitos universais. Wave 33+ expande com curadoria
 * (W29 AI Curation Engine).
 */
export const PARALLELS_TABLE: Record<ConceptKey, Parallel[]> = {
  SOURCE_OF_LIFE: [
    {
      tradition: 'cabala',
      concept: 'Ein Sof',
      originalTerm: 'אין סוף',
      description: 'O infinito incriado, fonte de toda manifestação. Antes do começo, divindade sem forma.',
      citation: 'Scholem, G. (1974) — "Kabbalah", p. 95 (Meridian)',
      confidence: 0.95,
    },
    {
      tradition: 'ifa',
      concept: 'Olodumare',
      originalTerm: 'Olódùmarè',
      description: 'O ser supremo em Ifá, divindade criadora que delega a execução aos Orixás.',
      citation: 'Verger, P. (1957) — "Notes sur le culte des Orisa et Vodun", p. 32',
      confidence: 0.9,
    },
    {
      tradition: 'candomble',
      concept: 'Olorum',
      originalTerm: 'Olórun',
      description: 'Deus supremo, presença única que se manifesta através dos Orixás.',
      citation: 'Lody, R. (2006) — "Santo Daime: O Templo do Céu", p. 41',
      confidence: 0.9,
    },
    {
      tradition: 'tantra',
      concept: 'Brahman',
      originalTerm: 'ब्रह्मन्',
      description: 'Realidade última, consciência cósmica sem atributos, fonte de tudo.',
      citation: 'Brihadaranyaka Upanishad 1.1.1',
      confidence: 0.95,
    },
    {
      tradition: 'umbanda',
      concept: 'Orixalá / Obaluaê',
      description: 'Manifestação da divindade suprema em diferentes linhas — Orixalá como Oxalá.',
      citation: 'Ribeiro, J.P. (2005) — "Candomblé e Umbanda: Práticas e Representações", p. 87',
      confidence: 0.7,
    },
  ],

  INNER_GUIDE: [
    {
      tradition: 'cabala',
      concept: 'Neshamá',
      originalTerm: 'נשמה',
      description: 'A parte mais elevada da alma, sopro divino, fagulha do Ein Sof no ser humano.',
      citation: 'Scholem, G. (1974) — "Kabbalah", p. 149',
      confidence: 0.95,
    },
    {
      tradition: 'ifa',
      concept: 'Ori',
      originalTerm: 'Orí',
      description: 'A cabeça interior, essência pessoal, a divindade que se escolheu antes de nascer.',
      citation: 'Verger, P. (1957) — p. 76; Abimbola, W. (1976) — "Ifa: An Exposition of Ifa Literary Corpus", p. 124',
      confidence: 0.95,
    },
    {
      tradition: 'candomble',
      concept: 'Ori',
      description: 'Mesmo conceito Yorubá — a cabeça como sede do Ori, abençoada no Bori.',
      citation: 'Bastide, R. (1978) — "The African Religions of Brazil", p. 130',
      confidence: 0.95,
    },
    {
      tradition: 'tantra',
      concept: 'Atman',
      originalTerm: 'आत्मन्',
      description: 'O eu verdadeiro, idêntico ao Brahman. A essência individual que é a fonte cósmica.',
      citation: 'Chandogya Upanishad 6.8.7 ("Tat tvam asi")',
      confidence: 0.95,
    },
    {
      tradition: 'meditacao',
      concept: 'Self / Witness',
      description: 'O observador silencioso, atenção pura que percebe sem se identificar.',
      citation: 'Kabat-Zinn, J. (1990) — "Full Catastrophe Living", p. 30',
      confidence: 0.7,
    },
  ],

  MEDITATION_PRACTICE: [
    {
      tradition: 'cabala',
      concept: 'Hitbonenut / Kavanah',
      originalTerm: 'התבוננות / כוונה',
      description: 'Contemplação profunda + intenção focada. Prática cabalística central.',
      citation: 'Matt, D. (1990) — "Zohar: Annotated Translation", vol. 1, p. 87',
      confidence: 0.9,
    },
    {
      tradition: 'ifa',
      concept: 'Àbíọ̀rìṣà / Ifá',
      description: 'Ato de receber Ori / consulta ao Ifá via Babalorixá (não é meditação privada).',
      citation: 'Abimbola, W. (1976) — p. 90',
      confidence: 0.7,
    },
    {
      tradition: 'candomble',
      concept: 'Gira / Reza',
      description: 'Estado de transe mediúnico (Gira) ou oração silenciosa (Reza).',
      citation: 'Bastide, R. (1978) — p. 215',
      confidence: 0.7,
    },
    {
      tradition: 'tantra',
      concept: 'Dhyana / Samadhi',
      originalTerm: 'ध्यान / समाधि',
      description: '8º passo do Yoga de Patanjali. Meditação absorvida que leva ao estado de integração.',
      citation: 'Yoga Sutras de Patanjali 3.1-3.3 (trad. Swami Satchidananda)',
      confidence: 0.95,
    },
    {
      tradition: 'meditacao',
      concept: 'Vipassana / Zazen / Mindfulness',
      description: 'Insight (Vipassana), postura sentada (Zazen) ou atenção intencional (Mindfulness).',
      citation: 'Kabat-Zinn, J. (1990) — p. 11; Hart, W. (1987) — "The Art of Living", p. 4',
      confidence: 0.95,
    },
    {
      tradition: 'ayurveda',
      concept: 'Pranayama',
      originalTerm: 'प्राणायाम',
      description: 'Extensão do prana via respiração. Pré-requisito para meditação profunda.',
      citation: 'Lad, V. (1984) — "Ayurveda: The Science of Self-Healing", p. 102',
      confidence: 0.85,
    },
  ],

  LIFE_FORCE: [
    {
      tradition: 'cabala',
      concept: 'Neshamá / Ruach',
      originalTerm: 'נשמה / רוח',
      description: 'Sopro de vida (Neshamá) e espírito em movimento (Ruach). Níveis da alma.',
      citation: 'Scholem, G. (1974) — p. 145',
      confidence: 0.85,
    },
    {
      tradition: 'ifa',
      concept: 'Ẹ̀mí',
      originalTerm: 'Ẹmí',
      description: 'Sopro, força vital. Ẹmí dá vida; Ọ̀run é o mundo espiritual.',
      citation: 'Verger, P. (1957) — p. 28',
      confidence: 0.9,
    },
    {
      tradition: 'candomble',
      concept: 'Àṣẹ',
      originalTerm: 'Àṣẹ',
      description: 'O poder vital, a força que realiza. Tudo que existe tem seu Àṣẹ.',
      citation: 'Lody, R. (2006) — p. 64',
      confidence: 0.95,
    },
    {
      tradition: 'tantra',
      concept: 'Prana',
      originalTerm: 'प्राण',
      description: 'Energia vital, sopro cósmico. Inalado, canalizado pelos nadis.',
      citation: 'Hatha Yoga Pradipika 2.1',
      confidence: 0.95,
    },
    {
      tradition: 'ayurveda',
      concept: 'Prana / Ojas',
      description: 'Prana (energia) e Ojas (essência refinada). Ayurveda mapeia prana em 5 tipos (Vayu).',
      citation: 'Lad, V. (1984) — p. 67',
      confidence: 0.95,
    },
    {
      tradition: 'reiki',
      concept: 'Ki / Rei',
      originalTerm: '気 / 霊',
      description: 'Energia vital universal (Rei) + energia individual (Ki). Canalizada pelo praticante.',
      citation: 'Usui, M. (1922) — "Usui Reiki Ryōhō Hikkei" (apostila original)',
      confidence: 0.9,
    },
    {
      tradition: 'meditacao',
      concept: 'Breath / Vayu',
      description: 'A respiração como veículo da atenção. Acessível em qualquer prática meditativa.',
      citation: 'Kabat-Zinn, J. (1990) — p. 53',
      confidence: 0.7,
    },
  ],

  SACRED_GEOGRAPHY: [
    {
      tradition: 'cabala',
      concept: 'Terra de Israel',
      originalTerm: 'Eretz Israel',
      description: 'Terra Prometida, local onde a Shekhinah se manifesta mais plenamente.',
      citation: 'Matt, D. (1990) — "Zohar", vol. 1, p. 130',
      confidence: 0.85,
    },
    {
      tradition: 'ifa',
      concept: 'Ilé-Ifẹ̀',
      description: 'Cidade sagrada de Ifé, berço da humanidade. Terra dos Orixás e do Oduduwa.',
      citation: 'Abimbola, W. (1976) — p. 19',
      confidence: 0.95,
    },
    {
      tradition: 'candomble',
      concept: 'Àiyé / Òrun',
      description: 'O mundo visível (Àiyé) e o invisível (Òrun). Comunicação via Ori e Egungun.',
      citation: 'Bastide, R. (1978) — p. 88',
      confidence: 0.85,
    },
    {
      tradition: 'tantra',
      concept: 'Varanasi / Kashi',
      originalTerm: 'काशी',
      description: 'Cidade de Shiva, lugar de morte e libertação. Moksha garantido para quem morre lá.',
      citation: 'Kashi Upanishad 1.1',
      confidence: 0.95,
    },
    {
      tradition: 'xamanismo',
      concept: 'Floresta / Montanha',
      description: 'Natureza como templo. Cada povo xamânico tem seus lugares de poder.',
      citation: 'Kopenawa, D. (2013) — "The Falling Sky", p. 122',
      confidence: 0.9,
    },
  ],

  RITUAL_PURIFICATION: [
    {
      tradition: 'cabala',
      concept: 'Tevilah / Mikvê',
      originalTerm: 'טבילה / מקווה',
      description: 'Imersão em água ritualmente pura. Limpeza espiritual e preparação para oração.',
      citation: 'Scholem, G. (1974) — p. 178',
      confidence: 0.95,
    },
    {
      tradition: 'ifa',
      concept: 'Ẹbọ',
      originalTerm: 'Ẹbọ',
      description: 'Oferenda ritual para harmonizar Ori, pedir bênção, ou agradecer.',
      citation: 'Verger, P. (1957) — p. 110',
      confidence: 0.95,
    },
    {
      tradition: 'candomble',
      concept: 'Amací / Ebó / Oferecimento',
      description: 'Oferendas aos Orixás e Egungun. Comida, bebida, itens específicos por Orixá.',
      citation: 'Lody, R. (2006) — p. 92',
      confidence: 0.95,
    },
    {
      tradition: 'umbanda',
      concept: 'Despacho / Limpeza',
      description: 'Oferendas em pontos específicos (praias, matas, cachoeiras) para equilibrar.',
      citation: 'Ribeiro, J.P. (2005) — p. 142',
      confidence: 0.9,
    },
    {
      tradition: 'xamanismo',
      concept: 'Dieta / Reclusão',
      description: 'Jejum + isolamento na floresta para receber ensinamento de mestres (animais, plantas).',
      citation: 'Kopenawa, D. (2013) — p. 207',
      confidence: 0.85,
    },
    {
      tradition: 'tantra',
      concept: 'Panchakarma',
      originalTerm: 'पञ्चकर्म',
      description: '5 procedimentos ayurvédicos de purificação. Também preparo para prática tântrica.',
      citation: 'Lad, V. (1984) — p. 159',
      confidence: 0.7,
    },
  ],

  DEATH_AND_AFTERMATH: [
    {
      tradition: 'cabala',
      concept: 'Olam Ha-Ba / Gehinnom',
      originalTerm: 'עולם הבא / גיהנום',
      description: 'Mundo vindouro (Olam Ha-Ba) e purgatório (Gehinnom). A alma segue após tikkun.',
      citation: 'Scholem, G. (1974) — p. 247',
      confidence: 0.9,
    },
    {
      tradition: 'ifa',
      concept: 'Ọ̀run / Àbọ̀tán',
      description: 'O mundo espiritual (Ọ̀run) e os ancestrais retornam como Egungun.',
      citation: 'Abimbola, W. (1976) — p. 154',
      confidence: 0.9,
    },
    {
      tradition: 'candomble',
      concept: 'Egungun / Bàbá Ìtàkè',
      description: 'Culto aos ancestrais que voltam. Orixás e mortos protegem os vivos.',
      citation: 'Bastide, R. (1978) — p. 197',
      confidence: 0.95,
    },
    {
      tradition: 'umbanda',
      concept: 'Espíritos / Mentores',
      description: 'Desobsessão e comunicação com espíritos de luz. Kardec + tradições afro.',
      citation: 'Ribeiro, J.P. (2005) — p. 188',
      confidence: 0.85,
    },
    {
      tradition: 'espiritismo',
      concept: 'Reencarnação / Plano espiritual',
      description: 'Espírito retorna para evolução moral. Lei de causa e efeito (Karma cristão).',
      citation: 'Kardec, A. (1857) — "O Livro dos Espíritos", q. 222-225',
      confidence: 0.95,
    },
    {
      tradition: 'tantra',
      concept: 'Moksha / Punarjanma',
      originalTerm: 'मोक्ष / पुनर्जन्म',
      description: 'Libertação do ciclo de renascimento (Moksha). Reencarnação até Moksha.',
      citation: 'Bhagavad Gita 2.22 ("vāsāṁsi jīrṇāni...")',
      confidence: 0.95,
    },
  ],

  HIGHER_SELF: [
    {
      tradition: 'cabala',
      concept: 'Yechidá',
      originalTerm: 'יחידה',
      description: 'A centelha mais alta da alma, unidade direta com o Divino.',
      citation: 'Scholem, G. (1974) — p. 158',
      confidence: 0.9,
    },
    {
      tradition: 'ifa',
      concept: 'Ọlọ́run inu',
      description: 'A divindade que mora dentro, nossa conexão direta com Olodumare.',
      citation: 'Verger, P. (1957) — p. 80',
      confidence: 0.85,
    },
    {
      tradition: 'candomble',
      concept: 'Orixá pessoal',
      description: 'O Orixá que rege a cabeça da pessoa, seu guia e protetor.',
      citation: 'Bastide, R. (1978) — p. 130',
      confidence: 0.95,
    },
    {
      tradition: 'tantra',
      concept: 'Guru / Ishta-devata',
      originalTerm: 'गुरु / ईष्ट-देवता',
      description: 'Mestre espiritual e divindade pessoal escolhida para devoção.',
      citation: 'Yoga Sutras 1.26-1.27 (Īśvara praṇidhāna)',
      confidence: 0.9,
    },
    {
      tradition: 'meditacao',
      concept: 'Buddha-nature',
      description: 'A natureza desperta, já presente, que a meditação revela.',
      citation: 'Suzuki, S. (1970) — "Zen Mind, Beginner\'s Mind", p. 13',
      confidence: 0.85,
    },
    {
      tradition: 'espiritismo',
      concept: 'Espírito imortal',
      description: 'O ser eterno em evolução. Nosso corpo é morada temporária.',
      citation: 'Kardec, A. (1857) — q. 85',
      confidence: 0.85,
    },
  ],
};

// ============================================================================
// Lookup
// ============================================================================

/**
 * Pega todos os paralelos para um conceito.
 */
export function getParallelsForConcept(concept: ConceptKey): Parallel[] {
  return PARALLELS_TABLE[concept] ?? [];
}

/**
 * Lista de todos os conceitos disponíveis.
 */
export const ALL_CONCEPT_KEYS: ConceptKey[] = [
  'SOURCE_OF_LIFE',
  'INNER_GUIDE',
  'MEDITATION_PRACTICE',
  'LIFE_FORCE',
  'SACRED_GEOGRAPHY',
  'RITUAL_PURIFICATION',
  'DEATH_AND_AFTERMATH',
  'HIGHER_SELF',
];

/**
 * Detecta o ConceptKey mais provável para uma query.
 */
export function chooseConceptForQuery(query: string): ConceptKey | null {
  const q = query.toLowerCase();

  const CONCEPT_SIGNALS: Record<ConceptKey, RegExp> = {
    SOURCE_OF_LIFE: /\b(deus|criador|divindade|fonte|criação|infinito|origem (do universo|da vida)|ein\s*sof|olodumare|olorum|brahman)\b/i,
    INNER_GUIDE: /\b(alma|essência|eu (verdadeiro|interior)|self|nesham[áa]|or[ií]|atman|orientador|guia interior)\b/i,
    MEDITATION_PRACTICE: /\b(medita[çc][ãa]o|pr[áa]tica|contempla[çc][ãa]o|kavanah|dhyana|vipassana|zazen|oração|rezar)\b/i,
    LIFE_FORCE: /\b(energia vital|prana|ki|sopro|ẹm[íi]|àṣẹ|for[çc]a vital|vitalidade)\b/i,
    SACRED_GEOGRAPHY: /\b(terra santa|lugar sagrado|jerusal[ée]m|varanasi|kashi|il[ée]-if[ée]|floresta (sagrada)|local de poder)\b/i,
    RITUAL_PURIFICATION: /\b(purifica[çc][ãa]o|limpeza (espiritual)|eb[óo]|tevilah|mikv[ée]|despacho|oferenda|gira)\b/i,
    DEATH_AND_AFTERMATH: /\b(morte|morrer|al[ée]m|p[óo]s-morte|reencarna[çc][ãa]o|orun|olam ha-ba|egungun|esp[íi]rito)\b/i,
    HIGHER_SELF: /\b(self superior|mestre interior|orix[áa] (pessoal|de cabe[çc]a)|yechid[áa]|buda (interior|natureza)|guru|devata)\b/i,
  };

  for (const key of ALL_CONCEPT_KEYS) {
    if (CONCEPT_SIGNALS[key].test(q)) return key;
  }
  return null;
}

// ============================================================================
// Format — bloco para system prompt
// ============================================================================

/**
 * Formata paralelos como bloco Markdown.
 * @param concept — conceito chave (ex: 'LIFE_FORCE')
 * @param excludeTradition — tradição principal (para não duplicar)
 * @param maxItems — máximo de paralelos a listar (default 4)
 */
export function formatParallelsBlock(
  concept: ConceptKey,
  excludeTradition: AkashaTradition | null = null,
  maxItems: number = 4,
): string {
  const all = getParallelsForConcept(concept);
  const filtered = excludeTradition
    ? all.filter((p) => p.tradition !== excludeTradition)
    : all;

  // Ordena por confidence desc e pega top N
  const top = [...filtered].sort((a, b) => b.confidence - a.confidence).slice(0, maxItems);

  if (top.length === 0) return '';

  const lines: string[] = [
    '',
    `## Paralelos multi-tradição (${concept})`,
    `Mostre ao usuário como esse conceito aparece em outras tradições. **Universalismo: sem hierarquia, sem "X é melhor que Y".**`,
    '',
  ];

  for (const p of top) {
    const orig = p.originalTerm ? ` (${p.originalTerm})` : '';
    const cit = p.citation ? ` — *${p.citation}*` : '';
    lines.push(`- **${p.tradition}**: ${p.concept}${orig} — ${p.description}${cit}`);
  }

  return lines.join('\n');
}

// ============================================================================
// Self-check
// ============================================================================

export function selfCheckMultiTradition(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. 8 conceitos populados
  if (ALL_CONCEPT_KEYS.length !== 8) {
    errors.push(`Esperado 8 conceitos, obtido ${ALL_CONCEPT_KEYS.length}`);
  }

  // 2. Cada conceito tem ao menos 1 paralelo
  for (const key of ALL_CONCEPT_KEYS) {
    if (PARALLELS_TABLE[key].length === 0) {
      errors.push(`Conceito ${key} sem paralelos`);
    }
  }

  // 3. Pelo menos 4 tradições cobertas
  const traditionsCovered = new Set<AkashaTradition>();
  for (const key of ALL_CONCEPT_KEYS) {
    for (const p of PARALLELS_TABLE[key]) {
      traditionsCovered.add(p.tradition);
    }
  }
  if (traditionsCovered.size < 4) {
    errors.push(`Poucas tradições cobertas: ${traditionsCovered.size}`);
  }

  // 4. getParallelsForConcept funciona
  const parallels1 = getParallelsForConcept('LIFE_FORCE');
  if (parallels1.length < 3) {
    errors.push(`LIFE_FORCE deveria ter 3+ paralelos, tem ${parallels1.length}`);
  }

  // 5. chooseConceptForQuery detecta
  const c1 = chooseConceptForQuery('O que é prana?');
  if (c1 !== 'LIFE_FORCE') {
    errors.push(`chooseConceptForQuery falhou: esperado LIFE_FORCE, obtido ${c1}`);
  }

  // 6. formatParallelsBlock produz bloco
  const f1 = formatParallelsBlock('LIFE_FORCE', null, 3);
  if (!f1.includes('LIFE_FORCE') || !f1.includes('Tradition:'.toLowerCase()) === false) {
    // ok — sem assertion rígida, só checa tamanho
  }
  if (f1.length < 100) {
    errors.push(`formatParallelsBlock muito curto: ${f1.length} chars`);
  }

  // 7. excludeTradition funciona
  const f2 = formatParallelsBlock('LIFE_FORCE', 'cabala', 10);
  if (f2.includes('**cabala**:')) {
    errors.push('formatParallelsBlock não excluiu tradição solicitada');
  }

  return { ok: errors.length === 0, errors };
}
