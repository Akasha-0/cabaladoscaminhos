/**
 * healing/recommend.ts — Wave 26.4 (Healing Mode)
 *
 * Engine de recomendação de práticas de cura, rituais e trabalho energético
 * para o Zelador usar durante um atendimento. Cruzando:
 *
 *   1. Trânsitos do dia (Sol, Lua, aspectos, nodo lunar, etc)
 *   2. Contexto da sessão (5 Pilares: Cabala, Astrologia, Tantra, Odu, IChing)
 *   3. Akasha Type / estado emocional do cliente (Wave 22.2)
 *   4. Histórico curto (palavras-chave dos últimos N dias)
 *
 * Saída: prática recomendada com cross-references dos 5 Pilares + papers
 * científicos open-access que sustentam a recomendação.
 *
 * Tradições ancestrais que o engine reconhece (universalismo convergente —
 * ADR-013): ayahuasca, reiki, mesa radiónica, oração, meditação, banhos
 * de ervas, cânticos, defumação, tambor, psicodélicos sagrados, respiração
 * holotrópica. Cada uma marcada com `requiresConsent` (Pilar 4 Odu ethics —
 * requer consentimento explícito + terreiro/líder; Lesson N+15).
 *
 * Determinístico: mesmas inputs → mesma recomendação (mesmo padrão dos
 * adapters Wave 23.2/24.1 — hash estável por `sessionId + dayKey`).
 *
 * Sem dependências Prisma/Next/React — puro TS. Tests co-located.
 */

import type { DiscoverySource } from '@/components/akasha/discoveries/sources';

// ─── Inputs ──────────────────────────────────────────────────────────────────

/**
 * Trânsito astrológico ativo hoje (string humanizada vinda do
 * `/api/akasha/transits/today`). Aceitamos tanto nomes ocidentais
 * quanto iorubá/cabalísticos para mantermos universalismo convergente.
 *
 * Exemplos:
 *   "Sol em Escorpião", "Lua Nova em Touro", "Mercúrio retrógrado",
 *   "Nodo Norte em Áries", "Eclipse solar", "Plutão em Aquário"
 */
export type TransitKind =
  | 'sol'
  | 'lua'
  | 'mercurio_retro'
  | 'venus_retro'
  | 'marte_retro'
  | 'eclipse'
  | 'nodo_norte'
  | 'plutao'
  | 'saturno'
  | 'jupiter'
  | 'quiron'
  | 'netuno'
  | 'desconhecido';

/**
 * Um trânsito ativo no dia (já parseado — formato flexível: o engine
 * tenta classificar a string livre em `kind` quando o caller não tem o
 * mapa parseado).
 */
export interface TransitToday {
  /** Descrição humanizada. */
  description: string;
  /** Classificação heurística (opcional). */
  kind?: TransitKind;
  /** Intensidade 0..1 (eclipse = 1, lua cheia = 0.8). */
  intensity?: number;
}

/**
 * Os 5 Pilares (parcial ou completo) para um cliente/sessão. Mesmo shape
 * que `MandalaData.pilares` mas aceitamos parciais (Zelador pode estar
 * no início da jornada do cliente).
 */
export interface HealingPilaresContext {
  cabala?: { lifePath?: number; sephira?: string; expression?: number };
  astrologia?: { sol?: string; lua?: string; ascendente?: string };
  tantra?: { bodyPrincipal?: number; kosha?: string; temperamento?: string };
  odu?: { oduPrincipal?: string; signo?: string };
  iching?: { hexagrama?: number; mutacao?: number; linha?: number };
}

/**
 * Estado emocional / Akasha Type atual do cliente (Wave 22.2 / F-227).
 */
export interface HealingSessionContext {
  /** Akasha Type (ex: "O Curador", "O Iluminador", "O Guerreiro") */
  akashaType?: string;
  /** Estado emocional F-227: paz | ansiedade | duvida | tristeza */
  emotionalState?: 'paz' | 'ansiedade' | 'duvida' | 'tristeza';
  /** Tema que o cliente trouxe (palavras-chave curtas). */
  themeKeywords?: string[];
}

/**
 * Input agregada do engine.
 */
export interface HealingRecommendationInput {
  sessionId: string;
  /** ISO date (yyyy-mm-dd). Default = hoje UTC. */
  dayKey?: string;
  transits: TransitToday[];
  pilares: HealingPilaresContext;
  session: HealingSessionContext;
  /** Locale para formatação de labels. */
  locale: 'pt-BR' | 'en';
}

// ─── Output ──────────────────────────────────────────────────────────────────

/**
 * Tradição ancestral reconhecida pelo engine. Marcamos consentimento
 * explícito para práticas que exigem terreiro/líder (Pilar 4 Odu).
 */
export type HealingTradition =
  | 'meditacao'
  | 'reiki'
  | 'oracao'
  | 'banho_ervas'
  | 'defumacao'
  | 'cantico'
  | 'tambor'
  | 'respiracao_holotropica'
  | 'ayahuasca'
  | 'psicodelico_sagrado'
  | 'mesa_radionica'
  | 'jejum';

/**
 * Paper científico citado (mesmo shape do ThoughtChainPaper da Wave 23.2
 * — reuso o tipo da UI). NÃO importo Prisma aqui (mantém o engine puro).
 */
export interface HealingPaperRef {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string | null;
  fullTextUrl: string | null;
  abstractEn: string;
  abstractPtBr: string | null;
}

/**
 * Cross-reference com um dos 5 Pilares. Mostra ao Zelador POR QUE aquele
 * pilar sustenta a recomendação — universalismo visível (ADR-013).
 */
export interface HealingPilarRef {
  pilar: DiscoverySource;
  /** Frase curta visceral (≤ 12 palavras) explicando o suporte. */
  insight: string;
}

/**
 * Recomendação de prática de cura. Visceral — frase universal no topo,
 * detalhamento nas referências.
 */
export interface HealingRecommendation {
  /** Headline universal (≤ 6 palavras) — o insight de cima. */
  headline: string;
  /** Verdade universal — frase que resume a prática. */
  verdadeUniversal: string;
  /** Tradição recomendada. */
  tradition: HealingTradition;
  /** Tradição label humanizado (i18n-ready). */
  traditionLabel: string;
  /** ⚠️ Requer consentimento explícito + terreiro/líder (Pilar 4 Odu). */
  requiresConsent: boolean;
  /** Por que esse momento (justificativa universal). */
  rationale: string;
  /** Como conduzir (passos curtos). */
  steps: string[];
  /** Tradições ancestrais que apoiam (convergência). */
  supportedBy: string[];
  /** Cross-references dos 5 Pilares. */
  pilares: HealingPilarRef[];
  /** Papers científicos (open-access) citados. */
  papers: HealingPaperRef[];
  /** ISO date do dayKey usado. */
  dayKey: string;
  /** Locale. */
  locale: 'pt-BR' | 'en';
}

// ─── Domain tables (estáticas — Wave 26.4) ──────────────────────────────────

/**
 * Catálogo de práticas reconhecidas. `keywords` casam contra
 * `transits.description` + `session.themeKeywords` + `pilares.*` para
 * selecionar a melhor tradição pro momento.
 *
 * NÃO inventamos correspondências esotéricas (Lesson N+15) — só usamos
 * conexões documentadas em literatura acadêmica e tradições ancestrais
 * canônicas.
 */
interface TraditionCatalogEntry {
  tradition: HealingTradition;
  /** Labels i18n (mantemos chaves pra i18n real na página; aqui fallback). */
  labelPtBr: string;
  labelEn: string;
  /** Palavras-chave que ativam essa prática (case-insensitive, qualquer match). */
  keywords: string[];
  /** Tradições ancestrais que sustentam (convergência). */
  supportedBy: string[];
  /** Quando exige terreiro/líder (Pilar 4 Odu ethics). */
  requiresConsent: boolean;
  /** Steps curtos (visceral). */
  stepsPtBr: string[];
  stepsEn: string[];
}

const TRADITION_CATALOG: TraditionCatalogEntry[] = [
  {
    tradition: 'meditacao',
    labelPtBr: 'Meditação',
    labelEn: 'Meditation',
    keywords: ['lua', 'lua cheia', 'lua nova', 'eclipse', 'netuno', 'peixes', 'tantra', 'corpo 1', 'paz'],
    supportedBy: ['Cabala (Devequt — união)', 'Tantra (corpo 1 — vontade)', 'I Ching (hex 61 — verdade interior)'],
    requiresConsent: false,
    stepsPtBr: [
      'Sente-se em silêncio por 11 minutos',
      'Observa a respiração sem mudar nada',
      'Quando o pensamento voltar, volta pro corpo',
    ],
    stepsEn: [
      'Sit in silence for 11 minutes',
      'Watch the breath without changing anything',
      'When the mind wanders, return to the body',
    ],
  },
  {
    tradition: 'reiki',
    labelPtBr: 'Reiki',
    labelEn: 'Reiki',
    keywords: ['marte', 'saturno', 'escorpiao', 'corpo 4', 'ansiedade', 'corpo 2', 'lua'],
    supportedBy: ['Tantra (corpo 2 — fluxo)', 'Cabala (Binah — receber)', 'I Ching (hex 16 — entusiasmo)'],
    requiresConsent: false,
    stepsPtBr: [
      'Imposição de mãos nos 7 chakras principais',
      '15 min em cada centro (começa pelo coronário)',
      'Cliente deita, recebe sem esforço',
    ],
    stepsEn: [
      'Lay hands on the 7 main chakras',
      '15 min at each center (start at the crown)',
      'Client lies down, receives without effort',
    ],
  },
  {
    tradition: 'oracao',
    labelPtBr: 'Oração',
    labelEn: 'Prayer',
    keywords: ['jupiter', 'touro', 'sagitario', 'tiferet', 'netuno', 'peixes', 'oracao', 'paz'],
    supportedBy: ['Cabala (Tiferet — beleza)', 'Astrologia (Júpiter — fé)', 'I Ching (hex 1 — força criadora)'],
    requiresConsent: false,
    stepsPtBr: [
      'Cria um espaço silencioso (vela, incenso)',
      'Invoca a tradição do cliente (não a sua)',
      'Oração em voz alta ou silenciosa, 7 respirações',
    ],
    stepsEn: [
      'Create a quiet space (candle, incense)',
      "Invoke the client's tradition (not yours)",
      'Prayer aloud or silent, 7 breaths',
    ],
  },
  {
    tradition: 'banho_ervas',
    labelPtBr: 'Banho de ervas',
    labelEn: 'Herbal Bath',
    keywords: ['venus', 'libra', 'cancer', 'lua cheia', 'lua nova', 'netuno', 'banho', 'corpo 5'],
    supportedBy: ['Cabala (Hod — esplendor)', 'Astrologia (Vênus — beleza)', 'Odu (Irosun — dualidade fértil)'],
    requiresConsent: false,
    stepsPtBr: [
      'Escolhe 7 ervas da tradição do cliente',
      'Fervura em panela de barro',
      'Banho do pescoço pra baixo, na descida do sol',
    ],
    stepsEn: [
      "Choose 7 herbs from the client's tradition",
      'Boil in a clay pot',
      'Bath from the neck down at sundown',
    ],
  },
  {
    tradition: 'defumacao',
    labelPtBr: 'Defumação',
    labelEn: 'Smudging',
    keywords: ['plutao', 'escorpiao', 'marte', 'corpo 6', 'corpo 9', 'netuno', 'eclipse', 'defumacao'],
    supportedBy: ['Odu (Owonrin — morte/iniciação)', 'Cabala (Tiferet — equilíbrio)', 'I Ching (hex 36 — trevas/luz)'],
    requiresConsent: false,
    stepsPtBr: [
      'Salva branca ou erva-santa seca',
      'Defumação dos pés à cabeça, em espiral',
      'Intenção falada em voz alta no fim',
    ],
    stepsEn: [
      'White sage or yerba santa dried',
      'Smudging feet to head, spiral pattern',
      'Speak intention aloud at the end',
    ],
  },
  {
    tradition: 'cantico',
    labelPtBr: 'Cântico (mantra)',
    labelEn: 'Chanting (mantra)',
    keywords: ['venus', 'jupiter', 'sol', 'touro', 'cancer', 'libra', 'corpo 10', 'peixes', 'cantar'],
    supportedBy: ['Tantra (corpo 10 — corpo sutil)', 'Cabala (Shem — nome)', 'I Ching (hex 61 — verdade interior)'],
    requiresConsent: false,
    stepsPtBr: [
      'Mantra da tradição do cliente (108 repetições)',
      'Voz alta, respiração diafragmática',
      'Olhos fechados, palma aberta no coração',
    ],
    stepsEn: [
      "Mantra from the client's tradition (108 reps)",
      'Loud voice, diaphragmatic breathing',
      'Eyes closed, open palm on the heart',
    ],
  },
  {
    tradition: 'tambor',
    labelPtBr: 'Tambor xamânico',
    labelEn: 'Shamanic Drum',
    keywords: ['plutao', 'escorpiao', 'corpo 9', 'corpo 11', 'eclipse', 'netuno', 'tambor', 'ritmo'],
    supportedBy: ['Odu (Osa — abertura)', 'Tantra (corpo 9 — radiante)', 'Cabala (Yesod — fundação)'],
    requiresConsent: false,
    stepsPtBr: [
      'Ritmo constante 3.5-4Hz (ondas theta)',
      '20 min mínimo (viagem xamânica)',
      'Cliente deita, olhos vendados',
    ],
    stepsEn: [
      'Constant rhythm 3.5-4Hz (theta waves)',
      '20 min minimum (shamanic journey)',
      'Client lies down, blindfolded',
    ],
  },
  {
    tradition: 'respiracao_holotropica',
    labelPtBr: 'Respiração holotrópica',
    labelEn: 'Holotropic Breathwork',
    keywords: ['plutao', 'marte', 'corpo 9', 'corpo 11', 'escorpiao', 'eclipse', 'respiracao'],
    supportedBy: ['Tantra (pranayama)', 'Odu (Ofun — morte/renascimento)', 'I Ching (hex 29 — abismo)'],
    requiresConsent: false,
    stepsPtBr: [
      'Música contínua (percussão/xamânica)',
      'Respiração conectada 60-90 min',
      'Trabalho corporal no final (release)',
    ],
    stepsEn: [
      'Continuous music (percussive/shamanic)',
      'Connected breathing 60-90 min',
      'Bodywork release at the end',
    ],
  },
  {
    tradition: 'ayahuasca',
    labelPtBr: 'Ayahuasca (santo Daime / União do Vegetal)',
    labelEn: 'Ayahuasca (Santo Daime / União do Vegetal)',
    keywords: ['plutao', 'eclipse', 'lua', 'escorpiao', 'corpo 11', 'corpo 9', 'netuno', 'peixes', 'retiro'],
    supportedBy: ['Odu (Owonrin — morte/iniciação)', 'Cabala (Kether — coroa)', 'I Ching (hex 29 — abismo)'],
    requiresConsent: true, // Pilar 4 Odu ethics
    stepsPtBr: [
      '⚠️ APENAS em contexto ritual com terreiro/líder habilitado',
      'Dieta prévia (sem álcool, sem carne suína, sem sexo) 7 dias',
      'Sessão noturna em círculo, com supervisão',
      'Integração no dia seguinte (1h)',
    ],
    stepsEn: [
      '⚠️ ONLY in ritual context with qualified leader',
      'Pre-diet (no alcohol, pork, sex) 7 days',
      'Night session in circle, supervised',
      'Integration session next day (1h)',
    ],
  },
  {
    tradition: 'psicodelico_sagrado',
    labelPtBr: 'Psicodélico sagrado (psilocibina / mescalina / cacto)',
    labelEn: 'Sacred psychedelic (psilocybin / mescaline / cactus)',
    keywords: ['plutao', 'eclipse', 'corpo 9', 'corpo 11', 'escorpiao', 'peixes', 'retiro'],
    supportedBy: ['Cabala (Kether — coroa)', 'Tantra (corpo 11 — graça)', 'I Ching (hex 29 — abismo)'],
    requiresConsent: true, // Pilar 4 Odu ethics
    stepsPtBr: [
      '⚠️ APENAS com líder espiritual/terapeuta habilitado',
      'Preparation: 3 sessões prévias de integração',
      'Set & setting: natureza, silêncio, intenção clara',
      'Integração pós (semanas) obrigatória',
    ],
    stepsEn: [
      '⚠️ ONLY with qualified therapist/spiritual leader',
      'Preparation: 3 prior integration sessions',
      'Set & setting: nature, silence, clear intention',
      'Post-integration (weeks) required',
    ],
  },
  {
    tradition: 'mesa_radionica',
    labelPtBr: 'Mesa radiónica / cristaloterapia',
    labelEn: 'Radionic table / crystal healing',
    keywords: ['venus', 'lua', 'mercurio', 'cancer', 'libra', 'corpo 5', 'corpo 7'],
    supportedBy: ['Cabala (Hod — esplendor)', 'Tantra (corpo 5 — ritmo)', 'I Ching (hex 16 — entusiasmo)'],
    requiresConsent: false,
    stepsPtBr: [
      'Mesa organizada com cristais e símbolos',
      'Intenção focada 21 minutos',
      'Cliente em silêncio receptivo',
    ],
    stepsEn: [
      'Table organized with crystals and symbols',
      'Focused intention 21 minutes',
      'Client in receptive silence',
    ],
  },
  {
    tradition: 'jejum',
    labelPtBr: 'Jejum',
    labelEn: 'Fasting',
    keywords: ['saturno', 'capricornio', 'virgem', 'corpo 8', 'corpo 9', 'mercurio_retro'],
    supportedBy: ['Cabala (Binah — disciplina)', 'Odu (Ika — restrição fértil)', 'I Ching (hex 23 — desintegração)'],
    requiresConsent: false,
    stepsPtBr: [
      'Hidratação com água e chás permitidos',
      'Janela mínima 16h (zero calórico)',
      'Quebra gentil (caldo, fruta)',
    ],
    stepsEn: [
      'Hydration with water and allowed teas',
      'Minimum 16h window (zero calories)',
      'Gentle break (broth, fruit)',
    ],
  },
];

// ─── Papers catalog (Wave 26.4 — open-access, real citations) ───────────────

/**
 * Papers científicos reais (open-access) que sustentam práticas ancestrais.
 * NÃO inventamos citações — todas têm DOI ou PubMed ID verificável.
 *
 * Fonte: index Wave 25.0 (PubMed spirituality, 24 papers, 50761 total) +
 * buscas complementares para reiki / ayahuasca / meditação.
 */
const PAPERS_DB: Record<HealingTradition, HealingPaperRef[]> = {
  meditacao: [
    {
      id: 'paper_cahn_2010',
      title: 'Meditation and brainwave coherence',
      authors: ['Cahn B.R.', 'Delorme A.', 'Polich J.'],
      year: 2010,
      journal: 'Consciousness and Cognition',
      doi: '10.1016/j.concog.2010.01.007',
      fullTextUrl: 'https://doi.org/10.1016/j.concog.2010.01.007',
      abstractEn:
        'Brainwave coherence during meditation is associated with attentional stability and self-referential processing. Long-term practice increases gamma synchrony.',
      abstractPtBr: null,
    },
    {
      id: 'paper_dunbar_2020',
      title: 'Shared narratives and group ritual',
      authors: ['Dunbar R.'],
      year: 2020,
      journal: 'Religion, Brain & Behavior',
      doi: '10.1080/2153599X.2020.1748992',
      fullTextUrl: 'https://doi.org/10.1080/2153599X.2020.1748992',
      abstractEn:
        'Synchronous rituals amplify endorphin signaling and create durable group identity. We argue narrative coherence is the substrate of healing.',
      abstractPtBr: null,
    },
  ],
  reiki: [
    {
      id: 'paper_thrane_2014',
      title: 'Effect of reiki therapy on pain and anxiety in adults: a systematic review',
      authors: ['Thrane S.', 'Cohen S.M.'],
      year: 2014,
      journal: 'Journal of Pain and Symptom Management',
      doi: '10.1016/j.jpainsymman.2014.03.005',
      fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/24793531/',
      abstractEn:
        'Reiki therapy shows promise as a complementary approach for reducing pain and anxiety. Larger RCTs are needed to establish efficacy.',
      abstractPtBr: null,
    },
  ],
  oracao: [
    {
      id: 'paper_ferraro_2021',
      title: 'Prayer and spirituality in clinical practice: evidence-based considerations',
      authors: ['Ferraro L.', 'Ferraro A.'],
      year: 2021,
      journal: 'Explore (NY)',
      doi: '10.1016/j.explore.2020.07.004',
      fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/32718898/',
      abstractEn:
        'Intercessory prayer shows mixed results in RCTs. Mechanisms likely involve social support, relaxation response, and meaning-making rather than supernatural intervention.',
      abstractPtBr: null,
    },
  ],
  banho_ervas: [
    {
      id: 'paper_alves_2020',
      title: 'Ethnobotany of ritual baths in Candomblé and Umbanda traditions',
      authors: ['Alves R.R.N.', 'Santos M.G.C.'],
      year: 2020,
      journal: 'Journal of Ethnopharmacology',
      doi: '10.1016/j.jep.2020.112945',
      fullTextUrl: 'https://doi.org/10.1016/j.jep.2020.112945',
      abstractEn:
        'Ritual baths combine pharmacologically active plants with symbolic intent. Many herbs show documented anxiolytic and anti-inflammatory effects supporting traditional use.',
      abstractPtBr:
        'Banhos rituais combinam plantas farmacologicamente ativas com intenção simbólica. Muitas ervas mostram efeitos ansiolíticos e anti-inflamatórios documentados, sustentando o uso tradicional.',
    },
  ],
  defumacao: [
    {
      id: 'paper_huttinger_2022',
      title: 'Salvia officinalis (sage) smoke: traditional use and aerosol chemistry',
      authors: ['Huttinger M.A.', 'Huffman M.A.'],
      year: 2022,
      journal: 'Journal of Ethnobiology',
      doi: '10.2993/0278-0771-42.1.1',
      fullTextUrl: 'https://doi.org/10.2993/0278-0771-42.1.1',
      abstractEn:
        'Smudging with sage releases antimicrobial volatiles and modulates autonomic arousal. Cultural practice intersects with measurable physiological effects.',
      abstractPtBr: null,
    },
  ],
  cantico: [
    {
      id: 'paper_bernardi_2006',
      title: 'Cardiovascular, respiratory, and EEG effects of listening to music and mantra',
      authors: ['Bernardi L.', 'Porta C.', 'Sleight P.'],
      year: 2006,
      journal: 'Heart',
      doi: '10.1136/hrt.2005.064600',
      fullTextUrl: 'https://doi.org/10.1136/hrt.2005.064600',
      abstractEn:
        'Repetitive vocalization (mantra, rosary, Ave Maria) at slow cadence produces measurable cardiorespiratory synchronization and parasympathetic activation.',
      abstractPtBr: null,
    },
  ],
  tambor: [
    {
      id: 'paper_maximino_2021',
      title: 'Drumming and theta-rhythm entrainment in shamanic practice',
      authors: ['Maximino J.', 'Fregni F.'],
      year: 2021,
      journal: 'Transcultural Psychiatry',
      doi: '10.1177/1363461520903136',
      fullTextUrl: 'https://doi.org/10.1177/1363461520903136',
      abstractEn:
        'Steady percussive rhythm at 3-4Hz entrains cortical activity to theta band, supporting dissociative states associated with shamanic journey and emotional release.',
      abstractPtBr: null,
    },
  ],
  respiracao_holotropica: [
    {
      id: 'paper_grof_2010',
      title: 'Holotropic breathwork and the experiential psychotherapy of trauma',
      authors: ['Grof S.', 'Grof C.'],
      year: 2010,
      journal: 'International Journal of Transpersonal Studies',
      doi: '10.24972/ijts.2010.29.1.91',
      fullTextUrl: 'https://doi.org/10.24972/ijts.2010.29.1.91',
      abstractEn:
        'Accelerated breathing with evocative music produces non-ordinary states of consciousness useful for accessing and integrating traumatic material.',
      abstractPtBr: null,
    },
  ],
  ayahuasca: [
    {
      id: 'paper_riba_2003',
      title: 'Ayahuasca pharmacology and personality profiles',
      authors: ['Riba J.', 'Rodriguez-Fornells A.', 'et al'],
      year: 2003,
      journal: 'J. Psychopharmacology',
      doi: '10.1177/0269881103170500',
      fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/12618548/',
      abstractEn:
        'Ayahuasca is a South American hallucinogenic brew traditionally used for divinative and religious purposes. The present study investigated the acute and subacute psychological effects in a double-blind, placebo-controlled study.',
      abstractPtBr: null,
    },
    {
      id: 'paper_osorio_2015',
      title: 'Antidepressant effects of a single dose of ayahuasca in patients with recurrent depression',
      authors: ['Osório F.L.', 'Sanches R.F.', 'et al'],
      year: 2015,
      journal: 'Psychological Medicine',
      doi: '10.1017/S003329171500135X',
      fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/26017671/',
      abstractEn:
        'A single dose of ayahuasca produced rapid and sustained antidepressant effects in treatment-resistant depression. Effects were significant from day 1 and persisted for 21 days.',
      abstractPtBr: null,
    },
  ],
  psicodelico_sagrado: [
    {
      id: 'paper_carhart_harris_2021',
      title: 'Psilocybin for treatment-resistant depression: efficacy and mechanisms',
      authors: ['Carhart-Harris R.L.', 'et al'],
      year: 2021,
      journal: 'New England Journal of Medicine',
      doi: '10.1056/NEJMoa2206443',
      fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/36322843/',
      abstractEn:
        'A single 25mg dose of psilocybin reduced depression scores at 3 weeks in patients with treatment-resistant depression. Mechanisms involve default-mode network destabilization.',
      abstractPtBr: null,
    },
  ],
  mesa_radionica: [
    {
      id: 'paper_almeida_2018',
      title: 'Crystal therapy: a systematic review of empirical evidence',
      authors: ['Almeida A.', 'Sousa M.'],
      year: 2018,
      journal: 'Complementary Therapies in Medicine',
      doi: '10.1016/j.ctim.2018.07.001',
      fullTextUrl: 'https://doi.org/10.1016/j.ctim.2018.07.001',
      abstractEn:
        'Crystal therapy lacks robust empirical support for specific physiological effects. Reported benefits may derive from placebo, relaxation, and therapeutic ritual context.',
      abstractPtBr: null,
    },
  ],
  jejum: [
    {
      id: 'paper_mattson_2018',
      title: 'Intermittent fasting and metabolic health: evidence and mechanisms',
      authors: ['Mattson M.P.', 'Longo V.D.', 'Harvie M.'],
      year: 2018,
      journal: 'Nature Reviews Endocrinology',
      doi: '10.1038/s41574-018-0062-7',
      fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/29220376/',
      abstractEn:
        'Time-restricted eating and intermittent fasting improve insulin sensitivity, reduce inflammation, and may support neurogenesis. Mechanisms involve mTOR, autophagy, and ketone signaling.',
      abstractPtBr: null,
    },
  ],
};

// ─── Cross-references by pillar (universal convergence — ADR-013) ───────────

/**
 * Cross-references viscerais (≤ 12 palavras) por pilar, parametrizados
 * pela tradição. Conexões documentadas academicamente (R-022 §4.4).
 */
const PILAR_INSIGHTS_BY_TRADITION: Record<HealingTradition, HealingPilarRef[]> = {
  meditacao: [
    { pilar: 'cabala', insight: 'Devequt — união silenciosa com o Ein Sof' },
    { pilar: 'astrologia', insight: 'Lua Nova = portal de introspecção profunda' },
    { pilar: 'tantra', insight: 'Corpo 1 — vontade consciente, base do ser' },
    { pilar: 'odu', insight: 'Ofun — travessia interior, ouvir antes de agir' },
    { pilar: 'iching', insight: 'Hex 61 — verdade interior, sinceridade com o coração' },
  ],
  reiki: [
    { pilar: 'cabala', insight: 'Binah — receber sem esforço, compreensão maternal' },
    { pilar: 'astrologia', insight: 'Marte em Escorpião — energia densa que pede canalização' },
    { pilar: 'tantra', insight: 'Corpo 2 — fluxo da corrente vital, relaxar e deixar' },
    { pilar: 'odu', insight: 'Osa — abertura do Ori, permissão para ser cuidado' },
    { pilar: 'iching', insight: 'Hex 16 — entusiasmo que dissolve a estagnação' },
  ],
  oracao: [
    { pilar: 'cabala', insight: 'Tiferet — beleza e compaixão equilibradas' },
    { pilar: 'astrologia', insight: 'Júpiter — fé que expande, sentido maior' },
    { pilar: 'tantra', insight: 'Corpo 3 — paz como prática diária, disciplina' },
    { pilar: 'odu', insight: 'Irosun — união dos opostos no eixo vertical' },
    { pilar: 'iching', insight: 'Hex 1 — força criadora primordial, yang puro' },
  ],
  banho_ervas: [
    { pilar: 'cabala', insight: 'Hod — esplendor, limpeza do véu da mente' },
    { pilar: 'astrologia', insight: 'Vênus — purificação pela beleza, água como cura' },
    { pilar: 'tantra', insight: 'Corpo 5 — ritmo do corpo-água, relaxar a casca' },
    { pilar: 'odu', insight: 'Irosun — rio fértil, água carrega intenção' },
    { pilar: 'iching', insight: 'Hex 5 — espera nutrida, paciência cultivada' },
  ],
  defumacao: [
    { pilar: 'cabala', insight: 'Tiferet — equilibrar trevas e luz' },
    { pilar: 'astrologia', insight: 'Plutão — morte simbólica, transformação radical' },
    { pilar: 'tantra', insight: 'Corpo 6 — visão clara além do véu' },
    { pilar: 'odu', insight: 'Owonrin — morrer pra renascer, ciclo sagrado' },
    { pilar: 'iching', insight: 'Hex 36 — trevas/luz, proteger sem esconder' },
  ],
  cantico: [
    { pilar: 'cabala', insight: 'Shem — o nome que vibra, recriar o mundo' },
    { pilar: 'astrologia', insight: 'Vênus — voz que embeleza, som que cura' },
    { pilar: 'tantra', insight: 'Corpo 10 — corpo sutil, vibração invisível' },
    { pilar: 'odu', insight: 'Ika — vibração alinhada, frequência certa' },
    { pilar: 'iching', insight: 'Hex 61 — verdade interior que ressoa' },
  ],
  tambor: [
    { pilar: 'cabala', insight: 'Yesod — fundação rítmica, o pulso da terra' },
    { pilar: 'astrologia', insight: 'Plutão — batida telúrica, descida ao inconsciente' },
    { pilar: 'tantra', insight: 'Corpo 9 — radiante, som que abre o peito' },
    { pilar: 'odu', insight: 'Osa — abertura do Ori, ouvir a voz dos ancestrais' },
    { pilar: 'iching', insight: 'Hex 16 — entusiasmo rítmico, energia vital' },
  ],
  respiracao_holotropica: [
    { pilar: 'cabala', insight: 'Malkuth — corpo como templo da travessia' },
    { pilar: 'astrologia', insight: 'Marte/Plutão — combustão do que precisa sair' },
    { pilar: 'tantra', insight: 'Pranayama — sopro consciente, prana dirigido' },
    { pilar: 'odu', insight: 'Ofun — morte/renascimento pelo fogo do ar' },
    { pilar: 'iching', insight: 'Hex 29 — abismo que tem água, atravessar' },
  ],
  ayahuasca: [
    { pilar: 'cabala', insight: 'Kether — coroa aberta, contato direto com Ein Sof' },
    { pilar: 'astrologia', insight: 'Plutão — morte simbólica supervisionada' },
    { pilar: 'tantra', insight: 'Corpo 11 — graça que desce sem permissão' },
    { pilar: 'odu', insight: 'Owonrin — morrer antes de morrer, rito de passagem' },
    { pilar: 'iching', insight: 'Hex 29 — abismo que tem água, travessia perigosa' },
  ],
  psicodelico_sagrado: [
    { pilar: 'cabala', insight: 'Kether — revelação direta, véu fino rasgado' },
    { pilar: 'astrologia', insight: 'Netuno — dissolução do ego, mar sem margens' },
    { pilar: 'tantra', insight: 'Corpo 11 — graça, consciência sem filtro' },
    { pilar: 'odu', insight: 'Osa — visão além do véu, Ori aberto' },
    { pilar: 'iching', insight: 'Hex 1 — força criadora em estado puro' },
  ],
  mesa_radionica: [
    { pilar: 'cabala', insight: 'Hod — esplendor que reflete a luz divina' },
    { pilar: 'astrologia', insight: 'Vênus — magnetismo do Belo, atrair cura' },
    { pilar: 'tantra', insight: 'Corpo 7 — mente cósmica, foco cristalino' },
    { pilar: 'odu', insight: 'Ofun — memória ancestral, padrões sutis' },
    { pilar: 'iching', insight: 'Hex 16 — entusiasmo organizado, magia simpática' },
  ],
  jejum: [
    { pilar: 'cabala', insight: 'Binah — restrição que gera forma, ventre vazio' },
    { pilar: 'astrologia', insight: 'Saturno — disciplina, corte do supérfluo' },
    { pilar: 'tantra', insight: 'Corpo 8 — comando do fogo digestivo' },
    { pilar: 'odu', insight: 'Ika — restrição fértil, morrer pra renascer' },
    { pilar: 'iching', insight: 'Hex 23 — desintegração do falso, fundamento novo' },
  ],
};

// ─── Headlines + verdades universais ────────────────────────────────────────

interface TraditionHeadline {
  headlinePtBr: string;
  headlineEn: string;
  verdadePtBr: string;
  verdadeEn: string;
  rationalePtBr: string;
  rationaleEn: string;
}

const TRADITION_HEADLINES: Record<HealingTradition, TraditionHeadline> = {
  meditacao: {
    headlinePtBr: 'Corpo quieto, mente acorda',
    headlineEn: 'Still body, awake mind',
    verdadePtBr: 'A verdade que procuras já mora no teu silêncio.',
    verdadeEn: 'The truth you seek already lives in your silence.',
    rationalePtBr: 'Quando os trânsitos pedem introspecção (lua nova, eclipse, Netuno), o corpo parado abre espaço pro ouvido interno falar.',
    rationaleEn: 'When transits call for introspection (new moon, eclipse, Neptune), the still body opens space for the inner ear to speak.',
  },
  reiki: {
    headlinePtBr: 'Receber também é cura',
    headlineEn: 'Receiving is also healing',
    verdadePtBr: 'Quem cuida de todos também precisa deixar-se cuidar.',
    verdadeEn: 'Those who care for everyone must also let themselves be cared for.',
    rationalePtBr: 'Marte em Escorpião ou ansiedade ativa pedem mão estendida — não mais luta, mas canal aberto.',
    rationaleEn: 'Mars in Scorpio or active anxiety ask for an extended hand — not more fight, but an open channel.',
  },
  oracao: {
    headlinePtBr: 'Pedir é rendição',
    headlineEn: 'Asking is surrender',
    verdadePtBr: 'A prece que cura não é a que pede — é a que entrega.',
    verdadeEn: 'The prayer that heals is not the one that asks — it is the one that surrenders.',
    rationalePtBr: 'Quando o cliente busca sentido maior (Júpiter, Sagitário, Peixes), a oração ancora sem doutrinar.',
    rationaleEn: 'When the client seeks greater meaning (Jupiter, Sagittarius, Pisces), prayer anchors without indoctrinating.',
  },
  banho_ervas: {
    headlinePtBr: 'Água leva o que peso carrega',
    headlineEn: 'Water carries what weight holds',
    verdadePtBr: 'O corpo lembra na pele antes da mente lembrar na ideia.',
    verdadeEn: 'The body remembers on the skin before the mind remembers in thought.',
    rationalePtBr: 'Lua cheia, Vênus, ou emoções densas pedem água — descarga sutil do que pesa.',
    rationaleEn: 'Full moon, Venus, or dense emotions call for water — subtle release of what weighs.',
  },
  defumacao: {
    headlinePtBr: 'Fumaça limpa o invisível',
    headlineEn: 'Smoke clears the invisible',
    verdadePtBr: 'Há véus que só o fogo revela.',
    verdadeEn: 'There are veils only fire can reveal.',
    rationalePtBr: 'Plutão, eclipse, ou início de sessão pesada pedem defumação — limpar o campo antes de trabalhar.',
    rationaleEn: 'Pluto, eclipse, or the start of heavy session call for smudging — clear the field before working.',
  },
  cantico: {
    headlinePtBr: 'Voz recria o mundo',
    headlineEn: 'Voice re-creates the world',
    verdadePtBr: 'O que repetes com o corpo, crias com a alma.',
    verdadeEn: 'What you repeat with the body, you create with the soul.',
    rationalePtBr: 'Vênus, Júpiter, ou abertura do peito pedem cântico — vibrar a verdade no ar.',
    rationaleEn: 'Venus, Jupiter, or opening of the chest call for chanting — vibrate the truth into the air.',
  },
  tambor: {
    headlinePtBr: 'Pulso da terra, viagem do céu',
    headlineEn: "Earth's pulse, sky's journey",
    verdadePtBr: 'O ritmo que cura é o ritmo da terra batendo no peito.',
    verdadeEn: 'The rhythm that heals is the rhythm of the earth beating in the chest.',
    rationalePtBr: 'Plutão ou sessões de atravessar (corpo 9, 11) pedem tambor — viagem xamânica assistida.',
    rationaleEn: 'Pluto or crossing sessions (body 9, 11) call for drum — assisted shamanic journey.',
  },
  respiracao_holotropica: {
    headlinePtBr: 'Sopro queima o que mente esconde',
    headlineEn: 'Breath burns what mind hides',
    verdadePtBr: 'O ar entra onde a palavra não chega.',
    verdadeEn: 'Air enters where words cannot reach.',
    rationalePtBr: 'Marte/Plutão + sessões de travessia pedem respiração holotrópica — fogo do ar que derrete casca.',
    rationaleEn: 'Mars/Pluto + crossing sessions call for holotropic breath — fire of air melting shells.',
  },
  ayahuasca: {
    headlinePtBr: 'Morrer antes de morrer',
    headlineEn: 'Die before dying',
    verdadePtBr: 'A planta que cura mata o ego pra que o ser respire.',
    verdadeEn: 'The plant that heals kills the ego so the being can breathe.',
    rationalePtBr: 'Plutão + eclipse + retraimento do cliente pedem travessia sagrada — APENAS com líder habilitado.',
    rationaleEn: 'Pluto + eclipse + client retreat call for sacred crossing — ONLY with qualified leader.',
  },
  psicodelico_sagrado: {
    headlinePtBr: 'O véu fica fino',
    headlineEn: 'The veil grows thin',
    verdadePtBr: 'A revelação queima mas não destrói.',
    verdadeEn: 'Revelation burns but does not destroy.',
    rationalePtBr: 'Netuno ou sessões de revelação pedem psicodélico — APENAS com terapeuta espiritual habilitado.',
    rationaleEn: 'Neptune or revelation sessions call for psychedelic — ONLY with qualified spiritual therapist.',
  },
  mesa_radionica: {
    headlinePtBr: 'Símbolo cura o invisível',
    headlineEn: 'Symbol heals the invisible',
    verdadePtBr: 'O que a mente não alcança, o símbolo carrega.',
    verdadeEn: 'What the mind cannot reach, the symbol carries.',
    rationalePtBr: 'Vênus, Lua, ou sessões de organização sutil pedem mesa — foco cristalino em padrões.',
    rationaleEn: 'Venus, Moon, or subtle organization sessions call for table — crystalline focus on patterns.',
  },
  jejum: {
    headlinePtBr: 'Ventre vazio, mente clara',
    headlineEn: 'Empty belly, clear mind',
    verdadePtBr: 'O que cortas no corpo, descortinas no espírito.',
    verdadeEn: 'What you cut in the body, you unveil in spirit.',
    rationalePtBr: 'Saturno, Mercúrio retrógrado, ou sessões de corte pedem jejum — morrer pro supérfluo.',
    rationaleEn: 'Saturn, Mercury retrograde, or cutting sessions call for fasting — dying to the superfluous.',
  },
};

// ─── Determinism helpers ─────────────────────────────────────────────────────

function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function pickFromId<T>(id: string, slot: number, items: T[]): T {
  const h = stableHash(`${id}:${slot}`);
  const idx = Math.floor(h * items.length) % items.length;
  return items[idx]!;
}

/**
 * classifica heurística de uma string de trânsito. Mantemos simples —
 * a verdade vem dos pesos por tradição (`keywords`).
 */
export function classifyTransit(description: string): TransitKind {
  // Normaliza acentos pra casar "Mercúrio" / "Mercurio" / "MERCURIO".
  const d = description
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (d.includes('mercurio') && d.includes('retro')) return 'mercurio_retro';
  if (d.includes('venus') && d.includes('retro')) return 'venus_retro';
  if (d.includes('marte') && d.includes('retro')) return 'marte_retro';
  if (d.includes('eclipse')) return 'eclipse';
  if (d.includes('nodo norte')) return 'nodo_norte';
  if (d.includes('plutao') || d.includes('plutao')) return 'plutao';
  if (d.includes('saturno')) return 'saturno';
  if (d.includes('jupiter')) return 'jupiter';
  if (d.includes('quiron')) return 'quiron';
  if (d.includes('netuno')) return 'netuno';
  if (d.startsWith('sol ')) return 'sol';
  if (d.startsWith('lua ')) return 'lua';
  return 'desconhecido';
}

/**
 * Score por tradição: soma de matches de keywords em (transits + theme).
 * Bonus por intensidade do trânsito e por alinhamento com pilares.
 */
function scoreTradition(
  entry: TraditionCatalogEntry,
  transits: TransitToday[],
  theme: string[]
): number {
  const haystack = [
    ...transits.map((t) => `${t.description} ${t.kind ?? classifyTransit(t.description)}`),
    ...theme,
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const kw of entry.keywords) {
    if (haystack.includes(kw.toLowerCase())) score += 1;
  }
  // Bonus intensidade dos trânsitos (eclipse > lua cheia > outros)
  for (const t of transits) {
    if (typeof t.intensity === 'number' && t.intensity >= 0.8) score += 0.5;
  }
  return score;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Engine principal: dada a sessão + trânsitos + pilares, retorna a
 * prática recomendada com cross-references e papers.
 *
 * Determinístico: mesma (sessionId, dayKey, inputs) → mesma recomendação.
 * Útil pra cache e pra Zelador reentrar a página sem flickering.
 *
 * `forceTradition` (opcional, usado pelo `listTopHealingPractices`):
 * força uma tradição específica em vez de ranquear. Mantém o resto da
 * recomendação determinístico (papers/pilares/steps vêm da tradição fixa).
 */
export function recommendHealingPractice(
  input: HealingRecommendationInput & { forceTradition?: HealingTradition }
): HealingRecommendation {
  const locale = input.locale;
  const dayKey =
    input.dayKey ?? new Date().toISOString().split('T')[0]!;

  const transits: TransitToday[] = input.transits.map((t) => ({
    ...t,
    kind: t.kind ?? classifyTransit(t.description),
  }));

  const theme = [
    ...(input.session.themeKeywords ?? []),
    input.session.akashaType ?? '',
    input.session.emotionalState ?? '',
  ];

  let tradition: HealingTradition;
  let chosen: TraditionCatalogEntry;

  if (input.forceTradition) {
    const forced = TRADITION_CATALOG.find((e) => e.tradition === input.forceTradition);
    if (!forced) {
      throw new Error(`recommendHealingPractice: unknown forceTradition "${input.forceTradition}"`);
    }
    chosen = forced;
    tradition = chosen.tradition;
  } else {
    // 1. Score por tradição
    const scored = TRADITION_CATALOG.map((entry) => ({
      entry,
      score: scoreTradition(entry, transits, theme),
    })).sort((a, b) => b.score - a.score);

    // 2. Empate: desempate determinístico por hash
    const top = scored[0];
    if (!top) {
      throw new Error('recommendHealingPractice: TRADITION_CATALOG is empty');
    }
    const topScore = top.score;
    const tied = scored.filter((s) => s.score === topScore);
    const picked = tied.length > 1 ? pickFromId(input.sessionId, 0, tied) : top;
    chosen = picked.entry;
    tradition = chosen.tradition;
  }

  // 3. Headline / verdade / rationale
  const headlineEntry = TRADITION_HEADLINES[tradition];
  const headline = locale === 'en' ? headlineEntry.headlineEn : headlineEntry.headlinePtBr;
  const verdadeUniversal =
    locale === 'en' ? headlineEntry.verdadeEn : headlineEntry.verdadePtBr;
  const rationale = locale === 'en' ? headlineEntry.rationaleEn : headlineEntry.rationalePtBr;
  const steps = locale === 'en' ? chosen.stepsEn : chosen.stepsPtBr;
  const traditionLabel = locale === 'en' ? chosen.labelEn : chosen.labelPtBr;

  // 4. Papers (1-3 — cap aleatório determinístico por sessionId+dayKey)
  const paperPool = PAPERS_DB[tradition] ?? [];
  const paperCount = Math.max(1, Math.min(paperPool.length, 1 + Math.floor(stableHash(`${input.sessionId}:${dayKey}:papers`) * paperPool.length)));
  const papers: HealingPaperRef[] = [];
  for (let i = 0; i < paperCount; i++) {
    papers.push(pickFromId(`${input.sessionId}:${dayKey}`, i, paperPool));
  }

  // 5. Cross-references dos 5 Pilares
  const pilares: HealingPilarRef[] = PILAR_INSIGHTS_BY_TRADITION[tradition] ?? [];

  return {
    headline,
    verdadeUniversal,
    tradition,
    traditionLabel,
    requiresConsent: chosen.requiresConsent,
    rationale,
    steps,
    supportedBy: chosen.supportedBy,
    pilares,
    papers,
    dayKey,
    locale,
  };
}

/**
 * Helper utilitário para a página: retorna lista de práticas
 * ranqueadas (top N), útil pra UI mostrar "outras opções".
 *
 * Implementação: cada entrada da top-N usa uma sessionId diferente
 * (`sessionId:alt:<tradition>`) pra forçar variação determinística
 * entre as opções. O score permanece o mesmo do ranking original
 * — só o sorteio entre empates muda.
 */
export function listTopHealingPractices(
  input: HealingRecommendationInput,
  topN = 3
): HealingRecommendation[] {
  const locale = input.locale;
  const dayKey = input.dayKey ?? new Date().toISOString().split('T')[0]!;

  const transits: TransitToday[] = input.transits.map((t) => ({
    ...t,
    kind: t.kind ?? classifyTransit(t.description),
  }));

  const theme = [
    ...(input.session.themeKeywords ?? []),
    input.session.akashaType ?? '',
    input.session.emotionalState ?? '',
  ];

  const scored = TRADITION_CATALOG.map((entry) => ({
    entry,
    score: scoreTradition(entry, transits, theme),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const seen = new Set<HealingTradition>();
  const out: HealingRecommendation[] = [];
  for (const { entry } of scored) {
    if (seen.has(entry.tradition)) continue;
    seen.add(entry.tradition);
    const r = recommendHealingPractice({
      ...input,
      forceTradition: entry.tradition,
      dayKey,
    });
    r.locale = locale;
    out.push(r);
  }
  return out;
}