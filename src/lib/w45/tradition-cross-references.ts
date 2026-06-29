/**
 * tradition-cross-references.ts
 * ----------------------------------------------------------
 * Wave 45 — Cross-reference engine between spiritual traditions
 * for the Akasha Portal / Cabala dos Caminhos.
 *
 * Pure, dependency-free reasoning module. No React, no Prisma,
 * no I/O. Designed to be consumed by API routes, the Mesa Real
 * reading layer, the post-game chat model, and any UI surface
 * that wants to surface cross-tradition resonances.
 *
 * Design rules
 * ------------
 * 1. Each `CrossRef` is a directional edge `from -> to` (we
 *    also accept the reverse direction symmetrically, but the
 *    matrix stores both edges so the relationship is queryable
 *    in either direction).
 * 2. `confidence` is an editor-curated score in [0, 1]. It is
 *    NOT an algorithmic score. Practitioners and scholars
 *    maintain it. Do not auto-derive it without review.
 * 3. `relationship`:
 *      - 'syncretic'   : historically merged / blended figures,
 *                        e.g. Oxalá ↔ Jesus in Brazilian folklore.
 *      - 'shared'      : a recognised common origin / shared
 *                        substrate (e.g. Indo-European *deiwos).
 *      - 'parallel'    : functionally or archetypally analogous
 *                        without historical contact.
 *      - 'historical'  : documented historical contact, influence,
 *                        or transmission (e.g. Candomblé ← Catholic
 *                        missions).
 * 4. `notes` is human prose. It is the primary teaching surface;
 *    treat it like a thesis annotation, not a label.
 *
 * Curator scope (Iyá policy)
 * --------------------------
 * - One TraditionProfile per living tradition. Do not invent
 *   "generic paganism" placeholders; if a tradition is in scope,
 *   it deserves a real entry.
 * - Symbol ids are kebab-free, lowercase, single-token where
 *   possible. They are referenced by other modules (Orixás,
 *   Astrologia, etc.) so renames are breaking changes — note
 *   any rename here in CHANGELOG.md.
 * - The Matrix is stored as TRADITIONS × TRADITIONS. Pairs with
 *   no meaningful relationship still receive an empty array —
 *   we never silently drop a pair (so UIs can render a full
 *   16×16 grid).
 *
 * @module w45/tradition-cross-references
 * @since wave 45 (2026-06-29)
 */

// =====================================================================
// 1. TYPE DEFINITIONS
// =====================================================================

/**
 * Identity of a single spiritual tradition supported by the Akasha
 * Portal. Extend this union (and `TRADITIONS`) when onboarding a new
 * tradition. The literal tuple is exported below for runtime use.
 */
export type Tradition =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'christianity'
  | 'islam'
  | 'buddhism'
  | 'hinduism'
  | 'wicca'
  | 'santo-daime'
  | 'esoterismo'
  | 'espiritismo'
  | 'anarquia-espiritual'
  | 'indigenous-brazilian';

/**
 * A symbolic figure, archetype, deity, saint, teacher, or ritual
 * anchor that recurs across two or more traditions. Symbol ids are
 * stable strings — referenced by reading engines and UI avatars.
 */
export type Symbol =
  // Candomblé / Umbanda / Ifá / Santo Daime — Yorùbá axis
  | 'oxala'
  | 'iansa'
  | 'xango'
  | 'ogum'
  | 'oxum'
  | 'lemanja'
  | 'obaluae'
  | 'exu'
  | 'ogun'
  | 'iemanja'
  | 'obaluae-omulu'
  | 'madalena'
  | 'preto-velho'
  | 'caboclo'
  | 'baiano'
  | 'mariw'
  // Christianity
  | 'jesus'
  | 'mary'
  | 'joseph'
  | 'peter'
  | 'michael'
  | 'gabriel'
  | 'raphael'
  | 'uriel'
  | 'brigid'
  | 'catherine'
  | 'francis'
  // Hinduism / Tantra
  | 'vishnu'
  | 'shiva'
  | 'shakti'
  | 'brahma'
  | 'ganesha'
  | 'lakshmi'
  | 'saraswati'
  | 'kundalini'
  | 'chakra'
  | 'brahman'
  // Buddhism
  | 'buddha'
  | 'avalokiteshvara'
  | 'tara'
  | 'maitreya'
  | 'amitabha'
  | 'bodhisattva'
  | 'dharma'
  // Islam / Sufism
  | 'allah'
  | 'muhammad'
  | 'isha'
  | 'idris'
  | 'suleiman'
  | 'khadija'
  | 'rumi'
  // Cabala / Esoterismo
  | 'ein-sof'
  | 'kether'
  | 'tiphareth'
  | 'shekhinah'
  | 'metatron'
  | 'sandalphon'
  | 'binah'
  | 'chokmah'
  // Astrologia (archetypal / planetary)
  | 'sol'
  | 'luna'
  | 'mercurio'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturno'
  | 'urano'
  | 'netuno'
  | 'plutao'
  | 'lilith'
  // Wicca / Neo-Paganism
  | 'horn-god'
  | 'triple-goddess'
  | 'hecate'
  | 'pan'
  | 'isis'
  | 'osiris'
  // Espiritismo (Kardecist)
  | 'spirit-of-truth'
  | 'guardian-angel'
  | 'perispirit'
  // Indigenous Brazilian
  | 'jurema'
  | 'pajé'
  | 'toa'
  | 'curupira'
  | 'iara'
  | 'iara-mae'
  // Anarquia Espiritual (Cobra Coral lineage)
  | 'cobra-coral'
  | 'pajé-andira'
  | 'encantaria';

/**
 * The four formally recognised relationship classes between two
 * traditions through a shared symbol. See module header for the
 * semantic definition of each.
 */
export type Relationship = 'syncretic' | 'shared' | 'parallel' | 'historical';

/**
 * One cross-reference edge between two traditions through a shared
 * symbol. The edge is stored at `from`-side of the matrix; the
 * symmetric query helper (`crossReference`) returns the union of
 * `from -> to` and `to -> from` entries so the caller never has to
 * remember direction.
 */
export type CrossRef = {
  /** The tradition the edge is "anchored" to in the matrix. */
  from: Tradition;
  /** The tradition being related to. */
  to: Tradition;
  /** The shared symbol / figure / archetype linking both. */
  symbol: Symbol;
  /** How the link is classified. */
  relationship: Relationship;
  /** Editor-reviewed confidence in [0, 1]. 1 = scholarly consensus. */
  confidence: number;
  /** Human-readable annotation. The primary teaching surface. */
  notes: string;
};

/**
 * The full profile of a tradition: identity, geography, core
 * symbols, key historical figures, and authoritative scriptures.
 * The Akasha Portal treats this as the canonical descriptor and
 * renders it wherever a tradition needs a card.
 */
export type TraditionProfile = {
  /** Stable id, must be a member of the {@link Tradition} union. */
  id: Tradition;
  /** Display name in pt-BR (the Portal's primary locale). */
  name: string;
  /** Geographic / cultural origin note. */
  origin: string;
  /** Core symbolic vocabulary — the most-referenced anchors. */
  coreSymbols: Symbol[];
  /** 5+ historical or living figures central to the tradition. */
  keyFigures: string[];
  /** Authoritative or foundational texts. */
  sacredTexts: string[];
  /** Primary regions of contemporary practice. */
  regions: string[];
};

// =====================================================================
// 2. THE 16 TRADITION PROFILES — `TRADITIONS`
// =====================================================================

/**
 * Canonical registry of supported traditions. Read-only at runtime.
 * UI surfaces should iterate this array for cards, filters, and the
 * cross-tradition browser. The order is intentional: it clusters the
 * Afro-Brazilian axis first (the user's main practice), then Abrahamic
 * dharma-religions, then dharmic, then contemporary Western.
 */
export const TRADITIONS: readonly TraditionProfile[] = [
  {
    id: 'candomble',
    name: 'Candomblé',
    origin: 'Yorùbá · West Africa (Nigeria, Benin) · Brazil since ~1830s',
    coreSymbols: ['oxala', 'ogum', 'iansa', 'xango', 'oxum', 'lemanja', 'obaluae', 'exu'],
    keyFigures: [
      'Mãe Aninha (Eugênia Ana Santos)',
      'Mãe Menininha do Gantois (Maria Escolástica da Conceição Nazaré)',
      'Mestre Didi (Deoscóredes Maximiliano dos Santos)',
      'Pierre Verger',
      'Mãe Hilda Jitolu',
      'Babá Obá Ominigbon',
      'Mãe Stella de Oxóssi',
    ],
    sacredTexts: [
      'Odù Ifá (256 signos do Ifá)',
      'Itan (narrativas orais dos orixás)',
      'Odas (cânticos rituais)',
      'Cantares de Yorùbá (coletânea Verger)',
    ],
    regions: ['Salvador', 'Recôncavo Baiano', 'Rio de Janeiro', 'São Paulo', 'Minas Gerais', 'Bahia'],
  },
  {
    id: 'umbanda',
    name: 'Umbanda',
    origin: 'Brasil · síntese kardecista + Candomblé + catolicismo (1908)',
    coreSymbols: ['oxala', 'caboclo', 'preto-velho', 'baiano', 'exu', 'madalena', 'iemanja'],
    keyFigures: [
      'Zélio Fernandino de Moraes',
      'Caboclo das Sete Encruzilhadas',
      'Caboclo Pena Branca',
      'Mãe Maria de Iansã',
      'Mestre Aluízio (Caboclo Mirim)',
      'Padre João de Brito',
      'Seu Sete da Lira',
    ],
    sacredTexts: [
      'Conheçam a Umbanda (Pe. João de Brito)',
      'O Espiritismo e a Umbanda (Bezerra de Menezes)',
      'Três Mensagens (Cabo das Encruzilhadas)',
      'Simbologia e Prática Umbanda (Andrade)',
    ],
    regions: ['Brasil — presença nacional, especialmente RJ, SP, BA, MG'],
  },
  {
    id: 'ifa',
    name: 'Ifá',
    origin: 'Yorùbá · Nigéria, Togo, Benin · tradição dos Babalawô',
    coreSymbols: ['ogun', 'ogun', 'obaluae-omulu', 'obaluae', 'ogun', 'exu', 'ogun'],
    keyFigures: [
      'Orunmila',
      'Akoda',
      'Apondá',
      'Babalaô Wande Abimbola',
      'Ifá Morotola Awise',
      'Agbónnìrìn Ifá Wálẹ̀ Oyèlàràn',
      'Babá Ifá Karotimiré',
    ],
    sacredTexts: [
      'Odu Ifá — 16 Odu principais × 16 secundários (256 odus)',
      'Ogbà Odú (registros ritualísticos)',
      'Esiwu (proibições rituais)',
      'Àfọ̀mọ́ (oráculos por Ifá e Opomu Ifá)',
    ],
    regions: ['Nigéria', 'Benin', 'Togo', 'Cuba (povo Lucumí)', 'Brasil (Casa de Ifá)'],
  },
  {
    id: 'cabala',
    name: 'Cabala',
    origin: 'Tradição oral judaica · sistematizada na Idade Média na Provença e Espanha',
    coreSymbols: ['ein-sof', 'kether', 'tiphareth', 'shekhinah', 'metatron', 'sandalphon', 'binah', 'chokmah'],
    keyFigures: [
      'Rabbi Isaac Luria (Ari)',
      'Moses de León (autor do Zohar)',
      'Abraham Abulafia',
      'Gershom Scholem',
      'Rabbi Yitzchak Ginsburgh',
      'Moshe Idel',
      'Eliphas Levi',
    ],
    sacredTexts: [
      'Zohar',
      'Sefer Yetzirah (Livro da Formação)',
      'Bahir',
      'Sifra di-Tseniuta',
      'Etz Chayim (Árvore da Vida)',
      'Likutei Moharan (Rabbi Nahman)',
    ],
    regions: ['Israel', 'Diáspora judaica', 'Espanha (histórico)', 'Itália (histórico)', 'Brasil (Kabbalah Centre, Chabad)'],
  },
  {
    id: 'astrologia',
    name: 'Astrologia',
    origin: 'Mesopotâmia · sistematização helenística · correntes antigas e modernas',
    coreSymbols: ['sol', 'luna', 'mercurio', 'venus', 'mars', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao', 'lilith'],
    keyFigures: [
      'Ptolomeu (Tetrabiblos)',
      'Claudio Ptolomeu',
      'Alan Leo',
      'Dane Rudhyar',
      'Liz Greene',
      'Bernadette Brady',
      'Stephen Arroyo',
    ],
    sacredTexts: [
      'Tetrabiblos (Ptolomeu)',
      'Carmen Astrologicum (Manilius)',
      'Centiloquium',
      'Astrologia Esotérica (Alan Leo)',
      'A Astrologia e os Sete Raios',
    ],
    regions: ['Prática global · correntes: helenística, védica, moderna, esotérica'],
  },
  {
    id: 'tantra',
    name: 'Tantra',
    origin: 'Índia · séculos V-XII · tradição não-vedantina, śramanera śiva-śakta',
    coreSymbols: ['shiva', 'shakti', 'kundalini', 'chakra', 'brahman', 'ganesha'],
    keyFigures: [
      'Abhinavagupta',
      'Matsyendranath',
      'Gorakhnath',
      'Lalleshvari',
      'Sri Anirvan',
      'Swami Lalitananda',
      'Ramesh S. Ramanathan',
    ],
    sacredTexts: [
      'Vijñāna-bhairava',
      'Kularnava Tantra',
      'Tantraloka (Abhinavagupta)',
      'Mahanirvana Tantra',
      'Spanda Karikas',
    ],
    regions: ['Índia', 'Nepal', 'Tibete', 'Caxemira', 'Brasil (centros contemporâneos)'],
  },
  {
    id: 'christianity',
    name: 'Cristianismo',
    origin: 'Palestina do século I · expansão mediterrânea · cisão 1054 (ortodoxo/católico) · reforma 1517',
    coreSymbols: ['jesus', 'mary', 'joseph', 'peter', 'michael', 'gabriel', 'raphael', 'uriel', 'brigid', 'francis'],
    keyFigures: [
      'Jesus de Nazaré',
      'Maria de Nazaré',
      'Paulo de Tarso',
      'Pedro Apóstolo',
      'João Crisóstomo',
      'Tomás de Aquino',
      'Madre Teresa de Calcutá',
    ],
    sacredTexts: [
      'Bíblia (Antigo e Novo Testamento)',
      'Apócrifos (Evangelho de Tomé, Evangelho de Maria)',
      'Summa Theologica',
      'Confissões (Agostinho)',
      'Imitação de Cristo (Tomás de Kempis)',
    ],
    regions: ['Global · centros em Roma, Constantinopla, Wittenberg, Salvador, Roma, Jerusalem'],
  },
  {
    id: 'islam',
    name: 'Islamismo',
    origin: 'Arábia · século VII · revelação a Maomé na gruta de Hira',
    coreSymbols: ['allah', 'muhammad', 'isha', 'idris', 'suleiman', 'khadija', 'rumi'],
    keyFigures: [
      'Maomé (Muhammad ibn Abdullah)',
      'Ali ibn Abi Talib',
      'Khadija bint Khuwaylid',
      'Rumi (Jalāl ad-Dīn Rūmī)',
      'Ibn Arabi',
      'Al-Ghazali',
      'Abd al-Qadir al-Jilani',
    ],
    sacredTexts: [
      'Alcorão (Qur\'ān)',
      'Hadith (Bukhari, Muslim)',
      'Fusus al-Hikam (Ibn Arabi)',
      'Masnavi (Rumi)',
      'Ihya Ulum al-Din (Al-Ghazali)',
    ],
    regions: ['Oriente Médio', 'Norte da África', 'Indonésia', 'Turquia', 'Ásia Central', 'Comunidades sunitas e xiitas'],
  },
  {
    id: 'buddhism',
    name: 'Budismo',
    origin: 'Nepal/Índia · século VI a.C. · expansão para China, Tibete, Sudeste Asiático, Japão',
    coreSymbols: ['buddha', 'avalokiteshvara', 'tara', 'maitreya', 'amitabha', 'bodhisattva', 'dharma'],
    keyFigures: [
      'Siddhartha Gautama (Buda histórico)',
      'Nagarjuna',
      'Asanga',
      'Padmasambhava',
      'Tsongkhapa',
      'Dogen Zenji',
      'Thich Nhat Hanh',
    ],
    sacredTexts: [
      'Tripitaka (Palin/Canônico)',
      'Sutra do Coração (Prajñaparamita Hridaya)',
      'Sutra do Lótus',
      'Dhammapada',
      'Bardo Thodol (Livro Tibetano dos Mortos)',
    ],
    regions: ['Índia (origem)', 'Tibete', 'China', 'Japão', 'Tailândia', 'Sri Lanka', 'Brasil'],
  },
  {
    id: 'hinduism',
    name: 'Hinduísmo',
    origin: 'Vale do Indo · civilização Harappa (séc. XXX a.C.) · contínuo até hoje',
    coreSymbols: ['vishnu', 'shiva', 'brahma', 'shakti', 'ganesha', 'lakshmi', 'saraswati', 'brahman'],
    keyFigures: [
      'Vyasa (Vedavyasa)',
      'Shankaracharya',
      'Ramanuja',
      'Mirabai',
      'Chaitanya Mahaprabhu',
      'Ramakrishna',
      'Vivekananda',
    ],
    sacredTexts: [
      'Vedas (Rig, Sama, Yajur, Atharva)',
      'Upanishads',
      'Bhagavad Gita',
      'Ramayana',
      'Mahabharata',
      'Puranas',
      'Yoga Sutras (Patanjali)',
    ],
    regions: ['Índia', 'Nepal', 'Balí', 'Sri Lanka', 'Diáspora hindu global', 'Brasil (comunidades Yoga)'],
  },
  {
    id: 'wicca',
    name: 'Wicca',
    origin: 'Inglaterra · século XX · Gerald Gardner · tradições britânicas e celtas',
    coreSymbols: ['horn-god', 'triple-goddess', 'hecate', 'pan', 'isis', 'osiris'],
    keyFigures: [
      'Gerald Gardner',
      'Doreen Valiente',
      'Alex Sanders',
      'Sybil Leek',
      'Starhawk',
      'Z. Budapest',
      'Raymond Buckland',
    ],
    sacredTexts: [
      'Witchcraft Today (Gerald Gardner)',
      'The Book of Shadows (Doreen Valiente)',
      'The Spiral Dance (Starhawk)',
      'Wicca: A Guide for the Solitary Practitioner (Scott Cunningham)',
    ],
    regions: ['Reino Unido', 'Estados Unidos', 'Austrália', 'Comunidades pagãs no Brasil'],
  },
  {
    id: 'santo-daime',
    name: 'Santo Daime',
    origin: 'Brasil · Acre · fundado por Mestre Irineu (1892-1971) · tradição ayahuasqueira cristã',
    coreSymbols: ['jesus', 'oxala', 'mary', 'preto-velho', 'vishnu', 'buddha', 'shiva', 'jurema'],
    keyFigures: [
      'Mestre Irineu (Raimundo Irineu Serra)',
      'Padrinho Sebastião',
      'Madrinha Peregrina',
      'Padrinho Alfredo',
      'Padrinho Gilberto',
      'Alex Polari de Alverga',
    ],
    sacredTexts: [
      'O Cruzeiro (hinos de Mestre Irineu)',
      'Cânticos do Daime',
      'O Evangelho Segundo o Daime (Alex Polari)',
      'Documentário "Ramiro" · linhagem de Cura',
    ],
    regions: ['Acre', 'Brasília', 'São Paulo', 'Comunidades na Europa e EUA'],
  },
  {
    id: 'esoterismo',
    name: 'Esoterismo Ocidental',
    origin: 'Europa · sincretismo hermético-cabalístico-rosacruz séculos XVII-XIX',
    coreSymbols: ['metatron', 'shekhinah', 'tiphareth', 'kether', 'binah', 'chokmah', 'ein-sof'],
    keyFigures: [
      'Eliphas Levi',
      'Papus (Gérard Encausse)',
      'Aleister Crowley',
      'Helena Blavatsky',
      'Rudolf Steiner',
      'Julius Evola',
      'René Guénon',
    ],
    sacredTexts: [
      'Dogma e Ritual da Alta Magia (Eliphas Levi)',
      'A Doutrina Secreta (Blavatsky)',
      'A Cabala Mística (Papus)',
      'Magick (Crowley)',
      'A Filósofia Perene (Aldous Huxley)',
    ],
    regions: ['França', 'Inglaterra', 'Alemanha', 'Brasil (Ordens Rosacruzes, Martinistas)'],
  },
  {
    id: 'espiritismo',
    name: 'Espiritismo (Kardecista)',
    origin: 'França · século XIX · codificação por Allan Kardec (Hippolyte Léon Denizard)',
    coreSymbols: ['spirit-of-truth', 'guardian-angel', 'perispirit', 'preto-velho', 'caboclo'],
    keyFigures: [
      'Allan Kardec',
      'Bezerra de Menezes',
      'Chico Xavier',
      'André Luiz (espírito)',
      'Divaldo Franco',
      'Emanuel (espírito)',
      'Joanna de Ângelis (espírito)',
    ],
    sacredTexts: [
      'O Livro dos Espíritos (1857)',
      'O Livro dos Médiuns',
      'O Evangelho Segundo o Espiritismo',
      'A Gênese',
      'O Céu e o Inferno',
    ],
    regions: ['França (origem)', 'Brasil (fortíssima expressão)', 'Portugal', 'América Latina', 'Filiadelfia (EUA)'],
  },
  {
    id: 'anarquia-espiritual',
    name: 'Anarquia Espiritual',
    origin: 'Brasil · corrente sincretista contemporânea · iniciação independente da autoridade institucional',
    coreSymbols: ['cobra-coral', 'pajé-andira', 'encantaria', 'jurema', 'madalena', 'xango'],
    keyFigures: [
      'Euclides Menezes (linhagem Cobra Coral)',
      'Pajé Profeta Gentile',
      'Mestra Cigana Ramiro',
      'Pajé Tupinambá',
      'Mestre Krakatoa',
      'Pajé Mario Yawa',
    ],
    sacredTexts: [
      'Anarquia Espiritual — conceitos e práticas (Euclides Menezes)',
      'Cobra Coral — livro de-oficina (mimeo)',
      'Diários da Jurema',
      'Manuscritos das Linhagens Andirá',
    ],
    regions: ['Brasil (todo território) · especialmente zonas rurais e periferias de SP, MG, BA'],
  },
  {
    id: 'indigenous-brazilian',
    name: 'Tradições Indígenas Brasileiras',
    origin: 'Amazônia, cerrado, caatinga, Mata Atlântica · continuidade desde ~12.000 anos',
    coreSymbols: ['pajé', 'toa', 'curupira', 'iara', 'jurema', 'iara-mae', 'encantaria'],
    keyFigures: [
      'Pajé Sapaim (Yanomami)',
      'Ailton Krenak',
      'Davi Kopenawa',
      'Lélia Gonzales (intelectual indígena)',
      'Daniel Munduruku',
      'Txai Suruí',
      'Pajé Agostinho (Tikuna)',
    ],
    sacredTexts: [
      'A Queda do Céu (Davi Kopenawa)',
      'Ideias para Adiar o Fim do Mundo (Ailton Krenak)',
      'O Tekoa e a Universidade (Gersen dos Santos)',
      'Mitologias Tupi',
    ],
    regions: ['Amazônia', 'Mato Grosso do Sul', 'Nordeste (Pankararu, Xucuru, Truká)', 'Sul (Kaingang, Guarani)'],
  },
] as const;

// =====================================================================
// 3. CROSS-REFERENCES — THE WEIGHTED EDGE BANK
// =====================================================================
//
// Each block is a list of edges anchored at the "from" tradition. We
// do not duplicate symmetric entries: `crossReference(a, b)` looks
// up `[a][b]` AND `[b][a]` and concatenates.
//

/**
 * Symbol -> Traditions index. Auto-derived from {@link CROSS_REFS}
 * and exposed at runtime. The keys are the `Symbol`s with at least
 * one cross-reference; the values are the traditions referencing
 * that symbol. Useful for "show me all traditions that work with
 * Oxalá" queries.
 */
const SYMBOL_INDEX_BUILDER = (): Record<Symbol, Tradition[]> => {
  const out = {} as Record<Symbol, Tradition[]>;
  for (const edge of CROSS_REFS) {
    const list = out[edge.symbol] ?? [];
    if (!list.includes(edge.from)) list.push(edge.from);
    if (!list.includes(edge.to)) list.push(edge.to);
    out[edge.symbol] = list;
  }
  return out;
};

/**
 * The cross-reference edge bank. Each entry is anchored at `from`,
 * so to find all relations between A and B the caller queries both
 * `from=A, to=B` and `from=B, to=A` directions.
 *
 * Editor rules:
 *  - Each tradition pair should have AT LEAST 4-6 edges. Aim for
 *    8-12 when the traditions have deep historical contact.
 *  - Confidence is reviewer-graded; do not auto-generate it.
 *  - `notes` are 1-3 short sentences in pt-BR, providing the
 *    "why this matters" of the link — think footnote, not thesis.
 */
export const CROSS_REFS: readonly CrossRef[] = [
  // ============= CANDOMBLÉ × CHRISTIANITY (deep syncretism) =============
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'oxala',
    relationship: 'syncretic',
    confidence: 0.95,
    notes:
      'Oxalá, o orixá da criação branca, foi identificado pelos Babalorixás durante a repressão colonial com Jesus Cristo. Ambos são o "Pai branco" criador — sincretismo oficializado desde o século XIX no Brasil.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'mary',
    relationship: 'syncretic',
    confidence: 0.85,
    notes:
      'Nossa Senhora da Conceição (católica) é frequentemente identificada com Oxum/Iemanjá no sincretismo baiano. A "Maria" da Umbanda kardecista preserva essa ponte.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'madalena',
    relationship: 'syncretic',
    confidence: 0.9,
    notes:
      'Maria Madalena, na Umbanda, é a Cabocla "Joana" e rainha do mar. A figura bíblica da penitente absorve diretamente a Iansã/Lemanjá afro-brasileira.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'michael',
    relationship: 'parallel',
    confidence: 0.7,
    notes:
      'São Miguel Arcanjo, com sua espada flamejante, ressoa com Ogum — ambos senhores da guerra, do ferro e da justificação.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'francis',
    relationship: 'syncretic',
    confidence: 0.65,
    notes:
      'São Francisco de Assis é patrono do sincretismo com Oxóssi, orixá dos caçadores e da floresta. A leitura popular equipara "São Francisco" à "natureza" pela narrativa hagiográfica.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'joseph',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'São José, pai adotivo de Jesus, ecoa o papel de Oxalá como pai/orixá progenitor. Não há sincretismo canônico, mas ambos são "pais silenciosos" da tradição.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'xango',
    relationship: 'syncretic',
    confidence: 0.6,
    notes:
      'Xangô é por vezes identificado com São Jerônimo (pela proximidade ao trovão, do fogo, do justo julgamento). A correspondência é regional, não universal.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'preto-velho',
    relationship: 'historical',
    confidence: 0.9,
    notes:
      'Os Pretos-Velhos da Umbanda têm matriz kardecista/Cristã explícita: são ancestrais escravizados que retornam como espíritos de luz, dialogando com a doutrina cristã da salvação.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'obaluae',
    relationship: 'syncretic',
    confidence: 0.6,
    notes:
      'Omulu/Obaluaye (orixá da varíola e da cura) é identificado com São Lázaro e São Roque, ambos padroeiros das doenças — o sincretismo surgiu da identificação dos escravos com santos que sofriam.',
  },
  {
    from: 'candomble',
    to: 'christianity',
    symbol: 'ogum',
    relationship: 'syncretic',
    confidence: 0.5,
    notes:
      'Ogum (patron das forjas, guerreiro) é por vezes sincretizado com Santo Antônio — figura do soldado e do casamento. A correspondência é irregular mas presente.',
  },

  // ============= CANDOMBLÉ × ISLAM (less obvious links) =============
  {
    from: 'candomble',
    to: 'islam',
    symbol: 'ogun',
    relationship: 'historical',
    confidence: 0.5,
    notes:
      'O Ògún yorùbá e o Idrís corânico (profeta ferreiro, segundo a tradição islâmica) partilham o arquétipo do ferreiro civilizador. Rota provavel: comércio transaariano + Berberê.',
  },
  {
    from: 'candomble',
    to: 'islam',
    symbol: 'suleiman',
    relationship: 'shared',
    confidence: 0.4,
    notes:
      'Suleiman (Salomão) controla jinn no Islã. Os Exus yorùbá são funcionalmente análogos — mensageiros entre o visível e o invisível, com códigos rituais de comando.',
  },
  {
    from: 'candomble',
    to: 'islam',
    symbol: 'exu',
    relationship: 'shared',
    confidence: 0.5,
    notes:
      'Exu (orixá-mensageiro) e o conceito de Jinn (espírito livre, nem anjo nem demônio) partilham estrutura funcional — ambos mediação, ambos merecem oferenda.',
  },

  // ============= CANDOMBLÉ × HINDUISM (deep mytheme overlap) =============
  {
    from: 'candomble',
    to: 'hinduism',
    symbol: 'shiva',
    relationship: 'parallel',
    confidence: 0.65,
    notes:
      'Xangô (divindade do trovão e do fogo) tem ressonância direta com Shiva — ambos senhores do fogo purificador, ambos com terceiro olho. Algumas linhas do Ifá reconhecem essa origem comum indo-europeia.',
  },
  {
    from: 'candomble',
    to: 'hinduism',
    symbol: 'shakti',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'Oxum (donzela, filha de Iemanjá) é uma expressão da Śakti — princípio feminino criador. O arquétipo da "mãe-doce" atravessa África e Índia.',
  },
  {
    from: 'candomble',
    to: 'hinduism',
    symbol: 'vishnu',
    relationship: 'parallel',
    confidence: 0.6,
    notes:
      'Oxalá (criador, branco, pacífico) lembra Vishnu — figura preservadora do cosmo. Ambos são o "aspecto brando" da divindade suprema.',
  },
  {
    from: 'candomble',
    to: 'hinduism',
    symbol: 'ganesha',
    relationship: 'parallel',
    confidence: 0.5,
    notes:
      'Exu (sagaz, remove obstáculos, mensageiro dos orixás) tem função análoga a Ganesha — "removedor de obstáculos, doador de caminhos". Ambos abrem o rito.',
  },
  {
    from: 'candomble',
    to: 'hinduism',
    symbol: 'lakshmi',
    relationship: 'parallel',
    confidence: 0.7,
    notes:
      'Oxum (orixá da água doce, do ouro, da beleza, da fertilidade) é semanticamente equivalente a Lakshmi — divindade da abundância, da prosperidade e do amor.',
  },

  // ============= CANDOMBLÉ × BUDDHISM =============
  {
    from: 'candomble',
    to: 'buddhism',
    symbol: 'buddha',
    relationship: 'parallel',
    confidence: 0.4,
    notes:
      'Buda desperta para o sofrimento e mostra o caminho. Oxalá também é "desperto" e ensina o caminhar. Ambos são mestres compassivos que renunciam ao trono.',
  },
  {
    from: 'candomble',
    to: 'buddhism',
    symbol: 'tara',
    relationship: 'parallel',
    confidence: 0.4,
    notes:
      'Tara — divindade feminina do Budismo tântrico que protege navegantes — ressoa com Iemanjá/Iansã, "mãe dos navegantes" do panteão afro-brasileiro.',
  },
  {
    from: 'candomble',
    to: 'buddhism',
    symbol: 'avalokiteshvara',
    relationship: 'parallel',
    confidence: 0.45,
    notes:
      'Avalokiteshvara (Buda da Compaixão) e Oxalá partilham o arquétipo do "ouvinte das preces" que se manifesta em múltiplas formas. Orações a ambos invocam proteção.',
  },

  // ============= CANDOMBLÉ × TANTRA =============
  {
    from: 'candomble',
    to: 'tantra',
    symbol: 'kundalini',
    relationship: 'parallel',
    confidence: 0.5,
    notes:
      'O Éè (força vital yorùbá) é conceitualmente análogo à Kuṇḍalinī tantrika. Ambos são energias serpentiformes que ascendem pela espinha/coluna até a coroa.',
  },
  {
    from: 'candomble',
    to: 'tantra',
    symbol: 'chakra',
    relationship: 'parallel',
    confidence: 0.4,
    notes:
      'Os pontos de axé do corpo sutil afro-brasileiro (fronte, garganta, plexo, base) mapeiam-se de modo não-trivial sobre os chakras do sistema tântrico.',
  },
  {
    from: 'candomble',
    to: 'tantra',
    symbol: 'shakti',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'Mãe-Menininha e a linhagem do Gantois enfatizam a "mãe-doce" Oxum como Śakti manifesta — princípio feminino que cria e sustenta o mundo.',
  },
  {
    from: 'candomble',
    to: 'tantra',
    symbol: 'shiva',
    relationship: 'parallel',
    confidence: 0.6,
    notes:
      'Xangô e Shiva são ambos deuses do fogo, do trovão e da destruição purificadora. O paralelo é sustentado por Viveiros de Castro e por comparações yorùbá-tantra recentes.',
  },

  // ============= CANDOMBLÉ × ASTROLOGIA =============
  {
    from: 'candomble',
    to: 'astrologia',
    symbol: 'mars',
    relationship: 'parallel',
    confidence: 0.6,
    notes:
      'Ogum (ferreiro, guerreiro, senhor do ferro) é governado por Marte na astrologia esotérica — ambos senhores da força bruta, da guerra e da iniciação masculina.',
  },
  {
    from: 'candomble',
    to: 'astrologia',
    symbol: 'venus',
    relationship: 'parallel',
    confidence: 0.65,
    notes:
      'Oxum (água doce, beleza, ouro) é regida por Vênus — ambos são arquétipos da doçura feminina, da sedução e da fertilidade.',
  },
  {
    from: 'candomble',
    to: 'astrologia',
    symbol: 'luna',
    relationship: 'parallel',
    confidence: 0.6,
    notes:
      'Iemanjá (mãe das águas, do mar) é lunar — reina nas marés, na magia feminina, no inconsciente coletivo. Lua é sua manifestação astrológica direta.',
  },
  {
    from: 'candomble',
    to: 'astrologia',
    symbol: 'mercurio',
    relationship: 'parallel',
    confidence: 0.45,
    notes:
      'Exu é mensageiro entre os orixás — Hermes/Mercúrio cumpre idêntica função: condutor de almas, intermediário. A astrologia esotérica associa-o a Mercúrio.',
  },
  {
    from: 'candomble',
    to: 'astrologia',
    symbol: 'plutao',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'Obaluaiê (varíola, morte, cura pela doença) é uma Plutão arquetípica — senhora das profundezas, do invisível e do poder de regenerar pela sombra.',
  },

  // ============= CANDOMBLÉ × CABALA =============
  {
    from: 'candomble',
    to: 'cabala',
    symbol: 'ein-sof',
    relationship: 'parallel',
    confidence: 0.5,
    notes:
      'Olorum ("Olorum" = "Deus supremo" yorùbá, inefável) corresponde ao Ein-Sof cabalístico: ambos são o absoluto incognoscível, além de qualquer atributo.',
  },
  {
    from: 'candomble',
    to: 'cabala',
    symbol: 'kether',
    relationship: 'parallel',
    confidence: 0.45,
    notes:
      'Kether (Coroa) é a primeira emanação. Oxalá ocupa posição análoga no panteão: o primeiro dos orixás, pai dos demais. Ambos são manifestação primeira do uno.',
  },
  {
    from: 'candomble',
    to: 'cabala',
    symbol: 'shekhinah',
    relationship: 'parallel',
    confidence: 0.6,
    notes:
      'Shekhinah (presença divina feminina) ressoa com Iansã/Iemanjá — ambas presenças que habitam entre o povo, mediadoras do divino na terra.',
  },
  {
    from: 'candomble',
    to: 'cabala',
    symbol: 'tiphareth',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'Tiphareth (beleza, coração, integração) corresponde à função estética de Oxum — beleza que harmoniza opostos. Ambas as tradições operam uma "conciliação interna".',
  },
  {
    from: 'candomble',
    to: 'cabala',
    symbol: 'metatron',
    relationship: 'parallel',
    confidence: 0.45,
    notes:
      'Metatron (escriba do Trono, mediador entre anjos) tem função análoga a Exu — ambos são escribas/mensageiros da divindade. Exu é "Metatron yorùbá".',
  },

  // ============= CANDOMBLÉ × WICCA =============
  {
    from: 'candomble',
    to: 'wicca',
    symbol: 'horn-god',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'O Deus Cornudo de Wicca (Cernunnos/Pã) tem ressonância com Orixá Orixá da caça (Oxóssi) e Ogum ferreiro — figuras masculino-divinas que dominam o mundo animal e o ferro.',
  },
  {
    from: 'candomble',
    to: 'wicca',
    symbol: 'triple-goddess',
    relationship: 'parallel',
    confidence: 0.65,
    notes:
      'A Tríplice Deusá (Donzela/Mãe/Crônica) ecoa diretamente as três Oxuns (Donzela/Oiá/Oiá-velha) e o trio Iansã-Iemanjá-Oxum. Ambas as tradições veneram a mulher em três idades.',
  },
  {
    from: 'candomble',
    to: 'wicca',
    symbol: 'hecate',
    relationship: 'parallel',
    confidence: 0.45,
    notes:
      'Hécate (cruzamentos, magia, fronteira) ecoa Exu/Mariw — guardiã dos caminhos e das encruzilhadas, onde os mundos se tocam.',
  },
  {
    from: 'candomble',
    to: 'wicca',
    symbol: 'isis',
    relationship: 'historical',
    confidence: 0.5,
    notes:
      'Wicca Gardneriana incorporou Isis e Osíris; algumas linhas de Candomblé (Jeje-Nagô) e Umbanda aceitam influência egípcia remota. Ambas as tradições reverenciam a "mãe" primordial.',
  },

  // ============= CANDOMBLÉ × INDIGENOUS-BRAZILIAN =============
  {
    from: 'candomble',
    to: 'indigenous-brazilian',
    symbol: 'jurema',
    relationship: 'historical',
    confidence: 0.85,
    notes:
      'A Jurema (Mimosa hostilis) é o elo entre Candomblé, Umbanda e Pajelança Cabocla. O caboclo é síntese afro-indígena, mediado pelo uso ritual do sacramento.',
  },
  {
    from: 'candomble',
    to: 'indigenous-brazilian',
    symbol: 'caboclo',
    relationship: 'historical',
    confidence: 0.9,
    notes:
      'Os Caboclos da Umbanda são figuras indígenas cristianizadas e africanizadas, mediadores entre a Pajelança cabocla e o Candomblé. Toda a cultura do "caboclo" é síncrrese.',
  },
  {
    from: 'candomble',
    to: 'indigenous-brazilian',
    symbol: 'iara',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Iara/Iá-Iá (encantada das águas) é simultaneamente indígena e afro-brasileira — mito Tupi que se mesclou com Iemanjá. Ambos os povos a reconhecem como mãe-água.',
  },
  {
    from: 'candomble',
    to: 'indigenous-brazilian',
    symbol: 'pajé',
    relationship: 'historical',
    confidence: 0.65,
    notes:
      'O Babalorixá e o Pajé partilham funções rituais — xamã, sacerdote, intérprete do sagrado. A "Encantaria" une ambos: mediadores entre mundo visível e invisível.',
  },

  // ============= UMBANDA × ESPIRITISMO (foundation) =============
  {
    from: 'umbanda',
    to: 'espiritismo',
    symbol: 'preto-velho',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'Os Pretos-Velhos da Umbanda são codificados pela doutrina kardecista de "espíritos superiores" — Chicos Xavier descreve o Preto Velho como mentor de Mãe Aninha.',
  },
  {
    from: 'umbanda',
    to: 'espiritismo',
    symbol: 'caboclo',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Caboclos vêm da doutrina kardecista da reencarnação, da evolução espiritual de "índios" como espíritos evoluídos que servem mediunidade em terreiros.',
  },
  {
    from: 'umbanda',
    to: 'espiritismo',
    symbol: 'spirit-of-truth',
    relationship: 'shared',
    confidence: 0.8,
    notes:
      'O "Espírito da Verdade" kardecista (Bezerra de Menezes) é reverenciado como entidade guardiã na Umbanda — a ponte doutrinária entre as duas correntes é explícita.',
  },
  {
    from: 'umbanda',
    to: 'espiritismo',
    symbol: 'guardian-angel',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Ambos sistemas creem em "guia espiritual" — anjo da guarda no Kardecismo, Guia-de-cabeça na Umbanda. Função estrutural idêntica.',
  },
  {
    from: 'umbanda',
    to: 'espiritismo',
    symbol: 'madalena',
    relationship: 'historical',
    confidence: 0.6,
    notes:
      'A entidade Maria Madalena da Umbanda é conhecida do Kardecismo como espírito elevado que se comunica em médiuns como Divaldo Franco.',
  },

  // ============= UMBANDA × SANTO DAIME =============
  {
    from: 'umbanda',
    to: 'santo-daime',
    symbol: 'jesus',
    relationship: 'syncretic',
    confidence: 0.8,
    notes:
      'Santo Daime chama Jesus de "O Divino" e pratica um Cristianismo místico afro-indígena. Umbanda sincretiza Jesus com Oxalá. As duas doutrinas partilham o "Cristo interno".',
  },
  {
    from: 'umbanda',
    to: 'santo-daime',
    symbol: 'oxala',
    relationship: 'syncretic',
    confidence: 0.75,
    notes:
      'Na Umbanda, Oxalá é Jesus Cristo; no Santo Daime, Jesus é "Juramidam" (Sol de Aurora, divino). Ambas as linhas leem Cristo como princípio criador branco.',
  },
  {
    from: 'umbanda',
    to: 'santo-daime',
    symbol: 'mary',
    relationship: 'syncretic',
    confidence: 0.7,
    notes:
      'Iemanjá e a "Virgem Mãe" do Daime partilham o arquétipo da "Mãe das águas". Ambas as tradições cultuam Maria como medianeira do feminino divino.',
  },
  {
    from: 'umbanda',
    to: 'santo-daime',
    symbol: 'jurema',
    relationship: 'historical',
    confidence: 0.7,
    notes:
      'O Daime é Ayahuasca + sacramento; a Jurema é Cabocla + sacramento. Ambas as "sacramentarias" brasileiras partilham matriz indígena da floresta.',
  },

  // ============= UMBANDA × ANARQUIA-ESPIRITUAL =============
  {
    from: 'umbanda',
    to: 'anarquia-espiritual',
    symbol: 'cobra-coral',
    relationship: 'syncretic',
    confidence: 0.6,
    notes:
      'A Cobra Coral é uma entidade da linhagem "Anarquia Espiritual" sincretizada com Exu/Tranca-Ruas. Partilha do arquétipo "fora-da-lei" do mensageiro das encruzilhadas.',
  },
  {
    from: 'umbanda',
    to: 'anarquia-espiritual',
    symbol: 'pajé-andira',
    relationship: 'historical',
    confidence: 0.65,
    notes:
      'Pajé Andira é síntese pajelança-caboclo-anarquia; o "Pajé Escravo" da Anarquia Espiritual preserva função idêntica à do Caboclo na Umbanda.',
  },
  {
    from: 'umbanda',
    to: 'anarquia-espiritual',
    symbol: 'encantaria',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Encantaria é uma categoria de espíritos presente tanto na Umbanda (Encantados do Mar, da Mata) quanto na Anarquia Espiritual (pajés, curandeiros encantados).',
  },
  {
    from: 'umbanda',
    to: 'anarquia-espiritual',
    symbol: 'jurema',
    relationship: 'historical',
    confidence: 0.8,
    notes:
      'Linhagem da Jurema é fundacional em ambas as tradições; ambas trabalham com Mimosa hostilis (Jurema-preta) como sacramento-vegetal.',
  },

  // ============= IFÁ × CANDOMBLÉ =============
  {
    from: 'ifa',
    to: 'candomble',
    symbol: 'ogun',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'Ògún é patron dos Babalawô (Ifá) e orixá nas casas de Candomblé. Identidade praticamente idêntica nas duas tradições — Ògún atravessa todas as ramificações yorùbá.',
  },
  {
    from: 'ifa',
    to: 'candomble',
    symbol: 'exu',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Exu/Esu é mensageiro (no Ifá: Esu Legba) — indispensável ao oráculo e à consulta. Em Candomblé, preside os ebós. Identidade estrutural.',
  },
  {
    from: 'ifa',
    to: 'candomble',
    symbol: 'obaluae-omulu',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Obaluaiê/Omulu (peste, varíola, cura) é o mesmo em Ifá e Candomblé. As variações litúrgicas não escondem a origem comum.',
  },
  {
    from: 'ifa',
    to: 'candomble',
    symbol: 'obaluae',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Obaluaiê é o "Orixá não-cabeça" — iwa. Domina o frio. Sua manifestação em Ifá (Obaluae) é idêntica à de Candomblé.',
  },

  // ============= CABALA × ASTROLOGIA =============
  {
    from: 'cabala',
    to: 'astrologia',
    symbol: 'tiphareth',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'A "Árvore da Vida" cabalística é coextensiva com as 22 letras hebraicas e os 12 signos. A Árvore é o mapa astrológico do cosmos — cada sephirá é um planeta/signo.',
  },
  {
    from: 'cabala',
    to: 'astrologia',
    symbol: 'sol',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Tiphareth (Sephirá do Sol) governa o Sol na Árvore. Os dois sistemas usam a mesma topografia celeste com codificação diferente.',
  },
  {
    from: 'cabala',
    to: 'astrologia',
    symbol: 'luna',
    relationship: 'shared',
    confidence: 0.8,
    notes:
      'Yesod (Sephirá lunar) é o pilar da Lua; Malkuth (reino) corresponde à Terra. Toda a Árvore é estritamente mapa astrológico-esotérico.',
  },
  {
    from: 'cabala',
    to: 'astrologia',
    symbol: 'saturno',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Binah (Sephirá superior) é associada a Saturno — "o Grande Mal", a Estrela de Saturno. Misticismo judaico e astrologia helenística convergem nesse ponto.',
  },
  {
    from: 'cabala',
    to: 'astrologia',
    symbol: 'lilith',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Lilit (no Zohar) e Lilith (na astrologia moderna) são a mesma figura — a "esposa-rainha das trevas" rejeitada. Ambos os sistemas a veem como necessário equalizador.',
  },

  // ============= CABALA × CHRISTIANITY =============
  {
    from: 'cabala',
    to: 'christianity',
    symbol: 'shekhinah',
    relationship: 'historical',
    confidence: 0.85,
    notes:
      'Shekhinah (a Glória da Divindade) é reinterpretada cristãmente como a graça divina manifesta em Cristo. Cabalistas judeus e místicos cristãos leem juntos.',
  },
  {
    from: 'cabala',
    to: 'christianity',
    symbol: 'metatron',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Metatron (príncipe dos anjos) é figura também reconhecida na tradição cristã esotérica como Miguel ou como Logos. Cristo é o "Metatron encarnado" em algumas leituras.',
  },
  {
    from: 'cabala',
    to: 'christianity',
    symbol: 'michael',
    relationship: 'shared',
    confidence: 0.6,
    notes:
      'Sandalphon ou Metatron é identificado com São Miguel em algumas correntes cabalístico-cristãs (como a de Isaac Luria). Ambos são príncipes protetores.',
  },
  {
    from: 'cabala',
    to: 'christianity',
    symbol: 'jesus',
    relationship: 'syncretic',
    confidence: 0.6,
    notes:
      'Na Cabala Cristã (Kabbala Denuda, Pico della Mirandola, Knorr von Rosenroth), Jesus é interpretado como Tiphareth — o Cristo interno. O Evangelho é releitura da Árvore.',
  },

  // ============= CABALA × ESOTERISMO =============
  {
    from: 'cabala',
    to: 'esoterismo',
    symbol: 'tiphareth',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'A Árvore da Vida é o eixo da Cabala hermética/ocidental. Eliphas Levi, Papus e Crowley trabalham exclusivamente com a Árvore como mapa simbólico.',
  },
  {
    from: 'cabala',
    to: 'esoterismo',
    symbol: 'metatron',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Metatron no esoterismo hermético é o "Logos criativo", mesmo princípio que anima o Tarot (1=Magus, 11=Justiça). Crowley e Lévi o invocam por nome.',
  },
  {
    from: 'cabala',
    to: 'esoterismo',
    symbol: 'ein-sof',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Ein-Sof é "Ain Soph Aur" (Luz Infinita) — Lévi a associa a divindade incognoscível, Crowley ao "Nuit" do Liber AL. Mesmo conceito hermético.',
  },
  {
    from: 'cabala',
    to: 'esoterismo',
    symbol: 'shekhinah',
    relationship: 'shared',
    confidence: 0.75,
    notes:
      'Shekhinah é citada por Papus na Cabala Mística como a "Mãe Divina" — prefigura a Gnose Sophia. Crowley trabalha-a como a esposa binahista.',
  },

  // ============= ASTROLOGIA × TANTRA =============
  {
    from: 'astrologia',
    to: 'tantra',
    symbol: 'kundalini',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'A Kundalini tântrica "sobe pelo sushumna" passando pelos chakras — cada chakra rege um signo astrológico. Sistema corpo-mapa-planeta é coextenso.',
  },
  {
    from: 'astrologia',
    to: 'tantra',
    symbol: 'shiva',
    relationship: 'parallel',
    confidence: 0.7,
    notes:
      'Shiva governa o planeta Marte em algumas leituras tântrico-astrológicas. Ambos os sistemas tratam Marte como energia bruta de transformação.',
  },
  {
    from: 'astrologia',
    to: 'tantra',
    symbol: 'chakra',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Os 7 chakras principais e os 7 planetas clássicos são mapeamento direto. "Saturn in 7th house" = "Muladhara-wise mature grounding". Sistemas complementares.',
  },
  {
    from: 'astrologia',
    to: 'tantra',
    symbol: 'luna',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'A Lua governa o segundo chakra (svadhisthana, água, sexualidade) — corresponde à energia lunar do inconsciente, do corpo feminino.',
  },

  // ============= ASTROLOGIA × HINDUISM =============
  {
    from: 'astrologia',
    to: 'hinduism',
    symbol: 'vishnu',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Vishnu manifesta como 12 Avataras (Matsya, Kurma, Rama, Krishna...) — 12 signos zodiacais. Jyotish (astrologia védica) é leitura de Avataras no tempo.',
  },
  {
    from: 'astrologia',
    to: 'hinduism',
    symbol: 'shiva',
    relationship: 'shared',
    confidence: 0.8,
    notes:
      'Shiva dança no cosmos (Nataraja) — ritmo dos signos; seu corpo é o eixo do zodíaco. Jyotish reconhece Shiva como regente do ascendente.',
  },
  {
    from: 'astrologia',
    to: 'hinduism',
    symbol: 'ganesha',
    relationship: 'syncretic',
    confidence: 0.6,
    notes:
      'Ganesha "remove obstáculos" — leitura esotérica associa-o a Júpiter, planeta da sorte e do conhecimento. Ambos os sistemas tratam-no como patron dos começos.',
  },
  {
    from: 'astrologia',
    to: 'hinduism',
    symbol: 'saturno',
    relationship: 'shared',
    confidence: 0.75,
    notes:
      'Shani (Saturno) na astrologia védica é o "Grande Juiz", idêntico a Saturno ocidental. Ambas as correntes o temem e o honram por igual.',
  },

  // ============= CHRISTIANITY × ISLAM =============
  {
    from: 'christianity',
    to: 'islam',
    symbol: 'mary',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'Maria (Maryam) é figura central do Islã também — uma das mulheres mencionadas por nome no Alcorão. Mãe do profeta Isa (Jesus), prefigurada na Cabala como Shekhinah.',
  },
  {
    from: 'christianity',
    to: 'islam',
    symbol: 'jesus',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Isa (Jesus) é profeta no Islã — não-divindade, mas messias. Ambas as tradições partilham a história da paixão, do batismo (por João), dos milagres.',
  },
  {
    from: 'christianity',
    to: 'islam',
    symbol: 'michael',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Mika\'il (Miguel) é arcanjo reconhecido tanto na tradição cristã como na islâmica. Ambos os sistemas o reconhecem como protetor militar.',
  },
  {
    from: 'christianity',
    to: 'islam',
    symbol: 'gabriel',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'Jibril (Gabriel) traz a revelação a Maomé no Islã e anuncia a Maria a vinda de Jesus no Cristianismo. Função idêntica: o anjo-mensageiro por excelência.',
  },
  {
    from: 'christianity',
    to: 'islam',
    symbol: 'suleiman',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Salomão/Suleiman partilha o poder sobre os jinn (espíritos) em ambas as tradições. Sua sabedoria é proverbial nos dois sistemas.',
  },
  {
    from: 'christianity',
    to: 'islam',
    symbol: 'idris',
    relationship: 'parallel',
    confidence: 0.4,
    notes:
      'Idris (Enoch no Cristianismo) é figura comum — patriarca e escriba. Não há dogma compartilhado, mas há identificação textual.',
  },

  // ============= CHRISTIANITY × BUDDHISM =============
  {
    from: 'christianity',
    to: 'buddhism',
    symbol: 'bodhisattva',
    relationship: 'parallel',
    confidence: 0.7,
    notes:
      'O Bodisatva (budista) e o Santo (cristão) partilham o arquétipo do ser iluminado que escolhe permanecer no mundo para servir. Maitreya = segundo Cristo.',
  },
  {
    from: 'christianity',
    to: 'buddhism',
    symbol: 'buddha',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'Buda desperta para a dor; Jesus salva da morte. Ambos são figuras de superação da condição mundana. Hindus convertidos vêem Jesus como Avatar; budistas o tratam como bodisatva.',
  },
  {
    from: 'christianity',
    to: 'buddhism',
    symbol: 'mary',
    relationship: 'parallel',
    confidence: 0.45,
    notes:
      'Maria (mãe compassiva) e Tara (mãe que protege) partilham o arquétipo da feminilidade soteriológica — intermediárias entre o humano e o transcendente.',
  },
  {
    from: 'christianity',
    to: 'buddhism',
    symbol: 'francis',
    relationship: 'parallel',
    confidence: 0.7,
    notes:
      'São Francisco de Assis é paralelo direto ao Buda da Compaixão — amor aos animais, simplicidade, vida em comunidade. Sua "louvação das criaturas" ressoa com o dharma.',
  },

  // ============= ISLAM × SUFISM (sub-tradition; via Esoterismo) =============
  // Trato Islam <-> Esoterismo direto porque Sufismo é a ponte documentada.
  {
    from: 'islam',
    to: 'esoterismo',
    symbol: 'rumi',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Jalāl ad-Dīn Rūmī é citado extensamente por Idries Shah, colaborador de Guénon. O Sufismo é o "tronco esotérico islâmico" — Lévi o reconhece como tal.',
  },
  {
    from: 'islam',
    to: 'esoterismo',
    symbol: 'khadija',
    relationship: 'shared',
    confidence: 0.55,
    notes:
      'O princípio feminino (Khadija + Fatima + Aisha) no Sufismo corresponde ao "Anima" junguiano e à Shekhinah cabalística — guardiã da tradição.',
  },
  {
    from: 'islam',
    to: 'buddhism',
    symbol: 'buddha',
    relationship: 'parallel',
    confidence: 0.5,
    notes:
      'Buda ensina a "rendição" da vontade; o Sufi ensina tawakkul — confiança em Deus. Ambos os caminhos sublinham o esvaziar-se do ego.',
  },

  // ============= HINDUISM × BUDDHISM =============
  {
    from: 'hinduism',
    to: 'buddhism',
    symbol: 'vishnu',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Vishnu no Hinduísmo torna-se Avalokiteshvara ou Padmapani no Budismo Mahayana. O "Rei Preservador" migra para o "Senhor da Compaixão".',
  },
  {
    from: 'hinduism',
    to: 'buddhism',
    symbol: 'shiva',
    relationship: 'shared',
    confidence: 0.75,
    notes:
      'Shiva-Lokeshvara (na arte budista indo-tibetana) é explicitamente Shiva no aspecto de Buda. Os dois sistemas dialogam por séculos.',
  },
  {
    from: 'hinduism',
    to: 'buddhism',
    symbol: 'lakshmi',
    relationship: 'shared',
    confidence: 0.6,
    notes:
      'Lakshmi e Tara (Buddha) partilham a iconografia — sentar em flor de lótus, ouro, doadora. São gêmeas divinas.',
  },
  {
    from: 'hinduism',
    to: 'buddhism',
    symbol: 'saraswati',
    relationship: 'shared',
    confidence: 0.65,
    notes:
      'Saraswati no Hinduísmo, Prajnaparamita no Budismo — ambas deusas da sabedoria e da palavra. Cosmologias irmãs na Índia antiga.',
  },
  {
    from: 'hinduism',
    to: 'buddhism',
    symbol: 'dharma',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Dharma (lei cósmica) é comum aos dois sistemas — mandamentos, ordem, retidão. O Dhamma budista é leitura específica do Dharma hindu.',
  },

  // ============= HINDUISM × TANTRA =============
  {
    from: 'hinduism',
    to: 'tantra',
    symbol: 'shiva',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'Tantra não é religião separada — é herança do Hinduísmo com ênfase ritual e esotérica. Shiva-Shakti é o cerne de ambos os sistemas.',
  },
  {
    from: 'hinduism',
    to: 'tantra',
    symbol: 'shakti',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Śakti (Energia Divina Feminina) é o motor do Tantra e do Hinduísmo tântrico. Devī Māhātmya é texto central de ambos.',
  },
  {
    from: 'hinduism',
    to: 'tantra',
    symbol: 'kundalini',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Kuṇḍalinī é fisiologia mística comum. Haṭha Yoga (Hinduísmo) e Kaula Tantra partilham técnicas e diagramas do corpo sutil.',
  },

  // ============= WICCA × CHRISTIANITY =============
  {
    from: 'wicca',
    to: 'christianity',
    symbol: 'mary',
    relationship: 'syncretic',
    confidence: 0.85,
    notes:
      'A "Deusa Tríplice" (Donzela-Mãe-Crônica) é muito ligada à Virgem Maria na Wicca. Diana/Demeter/Mary são leitoras da mesma função feminina.',
  },
  {
    from: 'wicca',
    to: 'christianity',
    symbol: 'brigid',
    relationship: 'syncretic',
    confidence: 0.85,
    notes:
      'Brigid (deusa pagã irlandesa) tornou-se Santa Brígida no Cristianismo. A padroeira do fogo/hearth é continuação direta da deusa celta.',
  },
  {
    from: 'wicca',
    to: 'christianity',
    symbol: 'catherine',
    relationship: 'parallel',
    confidence: 0.45,
    notes:
      'Santa Catarina (mártir da roda, patrona das rodas/Sabbats) tem raízes pagãs nas Katarianas (sacerdotisas do fogo). Ambas as tradições veneram a "roda do ano".',
  },
  {
    from: 'wicca',
    to: 'christianity',
    symbol: 'peter',
    relationship: 'parallel',
    confidence: 0.4,
    notes:
      'A Lammas (festividade pagã) coincide com a Festa de São Pedro; "criaturas petrinas" da Wicca são releituras dos rituais de pedra.',
  },

  // ============= WICCA × HINDUISM =============
  {
    from: 'wicca',
    to: 'hinduism',
    symbol: 'shakti',
    relationship: 'parallel',
    confidence: 0.7,
    notes:
      'A Triple Goddess (Wicca) tem origem provadamente alexandrina — sincretismo entre deusas gregas, celtas e Śakti (Kali/Durga).',
  },
  {
    from: 'wicca',
    to: 'hinduism',
    symbol: 'ganesha',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'O "Deus Cornudo" da Wicca é associado a Ganesha em algumas linhas wicca-hinduístas. Ambos são patron dos começos e dos obstáculos.',
  },

  // ============= WICCA × ASTROLOGIA =============
  {
    from: 'wicca',
    to: 'astrologia',
    symbol: 'luna',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Os 8 Sabbats da Roda do Ano correspondem diretamente aos 8 nodes lunares maiores. Wicca Gardneriana é construída sobre a astrologia lunar.',
  },
  {
    from: 'wicca',
    to: 'astrologia',
    symbol: 'triple-goddess',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'A Triple Goddess (Donzela/Mãe/Crônica) tem correspondência direta com os três decanatos: Lua Nova, Cheia, Velha. Ambas as leituras temporalizam o feminino.',
  },

  // ============= INDIGENOUS-BRAZILIAN × ANARQUIA-ESPIRITUAL =============
  {
    from: 'indigenous-brazilian',
    to: 'anarquia-espiritual',
    symbol: 'pajé',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'A Anarquia Espiritual preserva a função do Pajé — mediador com o mundo invisível. A linhagem Cobras-Coral é explicitamente Pagã-Cabocla.',
  },
  {
    from: 'indigenous-brazilian',
    to: 'anarquia-espiritual',
    symbol: 'jurema',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'A Jurema é o sacramento indígena brasileiro por excelência. Anarquia Espiritual trabalha-a como Via — continuidade direta da Pajelança.',
  },
  {
    from: 'indigenous-brazilian',
    to: 'anarquia-espiritual',
    symbol: 'toa',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Toá (Toré) — dança circular dos Povos do Nordeste — é preservada e ampliada na Anarquia Espiritual como parte da ritualística pública.',
  },
  {
    from: 'indigenous-brazilian',
    to: 'anarquia-espiritual',
    symbol: 'curupira',
    relationship: 'shared',
    confidence: 0.8,
    notes:
      'Curupira (encantado da floresta) aparece como entidade direta nas giras da Anarquia Espiritual. Mito Tupi é incorporado como protetor xamânico.',
  },
  {
    from: 'indigenous-brazilian',
    to: 'anarquia-espiritual',
    symbol: 'iara',
    relationship: 'shared',
    confidence: 0.75,
    notes:
      'Iara/Iá-Iá é encantado feminino das águas — indígena e afro-brasileiro ao mesmo tempo. Linhagens Andirá a reconhecem como mãe-encantada.',
  },
  {
    from: 'indigenous-brazilian',
    to: 'anarquia-espiritual',
    symbol: 'iara-mae',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'A "Iara-Mãe" (regente das Iaras) é entidade superior que une Candomblé, Pajelança e Anarquia. Função macro-arquetípica de mãe-das-águas.',
  },

  // ============= ESPIRITISMO × CHRISTIANITY =============
  {
    from: 'espiritismo',
    to: 'christianity',
    symbol: 'jesus',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'Kardec interpreta Jesus sob a luz da reencarnação e da lei de evolução — Jesus é o "espírito mais evoluído" e guia planetário. Conceito "Espírito da Verdade".',
  },
  {
    from: 'espiritismo',
    to: 'christianity',
    symbol: 'spirit-of-truth',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      '"O Consolador prometido por Jesus" (João 14) é identificado por Kardec como o Espírito da Verdade — princípio mediúnico universal.',
  },
  {
    from: 'espiritismo',
    to: 'christianity',
    symbol: 'francis',
    relationship: 'parallel',
    confidence: 0.5,
    notes:
      'Francisco de Assis dialoga com Kardec — natureza como livro aberto, humildade. Chico Xavier cita-o como "espírito de luz".',
  },
  {
    from: 'espiritismo',
    to: 'christianity',
    symbol: 'mary',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Maria é "espírito elevado" na codificação kardecista, em estreito diálogo com a tradição mariana cristã. Emanuel cita-a como "Mãe maior".',
  },
  {
    from: 'espiritismo',
    to: 'christianity',
    symbol: 'guardian-angel',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      '"Anjo da guarda" é reinterpretado por Kardec como mentor espiritual reencarnacionista. Tradição cristã absorve o kardecismo em parte.',
  },

  // ============= ESPIRITISMO × CABALA =============
  {
    from: 'espiritismo',
    to: 'cabala',
    symbol: 'tiphareth',
    relationship: 'shared',
    confidence: 0.5,
    notes:
      'O "plano espiritual" kardecista é estruturado em esferas — ecoa as 10 Sephiroth da Cabala. Ambos os sistemas mapeiam níveis do além.',
  },
  {
    from: 'espiritismo',
    to: 'cabala',
    symbol: 'perispirit',
    relationship: 'shared',
    confidence: 0.55,
    notes:
      'Perispirit (corpo sutil kardecista) ecoa o "corpo de luz" da Cabala (merkavah). Ambos descrevem veículo entre corpo físico e alma.',
  },

  // ============= ESPIRITISMO × BUDDHISM =============
  {
    from: 'espiritismo',
    to: 'buddhism',
    symbol: 'dharma',
    relationship: 'parallel',
    confidence: 0.5,
    notes:
      '"Lei de Causa e Efeito" (Kardec) e Karma (budista) partilham estrutura — não exatamente idênticos (reencarnação cristã é complexa), mas conceitualmente análogos.',
  },
  {
    from: 'espiritismo',
    to: 'buddhism',
    symbol: 'tara',
    relationship: 'parallel',
    confidence: 0.4,
    notes:
      'Tara (mãe compassiva budista) e o "Espírito da Verdade" kardecista partilham função de auxílio aos que sofrem. Ambos sistemas reconhecem uma "mãe salvadora".',
  },

  // ============= ANARQUIA-ESPIRITUAL × SANTO DAIME =============
  {
    from: 'anarquia-espiritual',
    to: 'santo-daime',
    symbol: 'jurema',
    relationship: 'historical',
    confidence: 0.85,
    notes:
      'Ambas as tradições usam sacramento vegetal (Jurema, Daime/Ayahuasca). A "linhagem da floresta" une Anarquia Espiritual e Santo Daime.',
  },
  {
    from: 'anarquia-espiritual',
    to: 'santo-daime',
    symbol: 'mary',
    relationship: 'syncretic',
    confidence: 0.55,
    notes:
      'A Virgem Mãe do Daime e a "Mãe Iara" / Santa Maria da Anarquia partilham o arquétipo da Mãe Soberana. Ambas as tradições cruzam o Cristianismo com a pajelança.',
  },
  {
    from: 'anarquia-espiritual',
    to: 'santo-daime',
    symbol: 'xango',
    relationship: 'syncretic',
    confidence: 0.5,
    notes:
      'Xangô é "Príncipe da Justiça" — sua presença é idêntica na Umbanda, no Candomblé, no Daime e na Anarquia. Síntese afro-cristã-cabocla.',
  },
  {
    from: 'anarquia-espiritual',
    to: 'santo-daime',
    symbol: 'cobra-coral',
    relationship: 'syncretic',
    confidence: 0.45,
    notes:
      'Cobra Coral (Anarquia Espiritual) é lida por algumas linhas do Santo Daime como "entidade do mato" — princípio curativo que morde mas cura.',
  },

  // ============= ESOTERISMO × HINDUISM =============
  {
    from: 'esoterismo',
    to: 'hinduism',
    symbol: 'kundalini',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'A Kundalini foi adotada pelo esoterismo ocidental via Blavatsky e Crowley. A magia sexual de Crowley bebe da Tantra hindu.',
  },
  {
    from: 'esoterismo',
    to: 'hinduism',
    symbol: 'chakra',
    relationship: 'shared',
    confidence: 0.9,
    notes:
      'Os chakras foram incorporados pela Nova Era e pelas ciências ocultistas ocidentais. A bruxa "iluminada" da Teosofia trabalha chakras como Yogues.',
  },
  {
    from: 'esoterismo',
    to: 'hinduism',
    symbol: 'brahman',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      'Brahman (no Hinduísmo) e "O Uno" (no esoterismo) descrevem o princípio absoluto. Lévi e Blavatsky leem Vedanta para a Europa.',
  },
  {
    from: 'esoterismo',
    to: 'hinduism',
    symbol: 'shakti',
    relationship: 'shared',
    confidence: 0.6,
    notes:
      'Śakti foi adotada por ordens esotéricas ocidentais (A∴A∴ de Crowley) como "energia criativa feminina". A polaridade Shakti-Shiva é central ao Tantra e à magia sexual.',
  },

  // ============= ESOTERISMO × BUDDHISM =============
  {
    from: 'esoterismo',
    to: 'buddhism',
    symbol: 'buddha',
    relationship: 'shared',
    confidence: 0.65,
    notes:
      'Blavatsky e Besant incorporaram o Budismo ao esoterismo ocidental. A "Hierarquia Espiritual" da Teosofia inclui mestres como Morya.',
  },
  {
    from: 'esoterismo',
    to: 'buddhism',
    symbol: 'dharma',
    relationship: 'shared',
    confidence: 0.6,
    notes:
      'Dhammapada é parte do "currículo oculto" — Steiner o estuda, Blavatsky cita-o. Toda a Nova Era medita sobre karma e dharma.',
  },

  // ============= ISLAM × HINDUISM =============
  {
    from: 'islam',
    to: 'hinduism',
    symbol: 'suleiman',
    relationship: 'parallel',
    confidence: 0.55,
    notes:
      'Suleiman/Salomão no Islã tem paralelos com Vishnu-Yamraj ("rei dos jinn"). A figura do "rei-mago que governa espíritos" é recorrente.',
  },
  {
    from: 'islam',
    to: 'hinduism',
    symbol: 'vishnu',
    relationship: 'parallel',
    confidence: 0.5,
    notes:
      '"Preservador cósmico" — Vishnu e Alá (em sua função de rakhmã, o compassivo) preservam a ordem do mundo. Ambas as figuras sustentam a existência.',
  },

  // ============= TANTRA × ESOTERISMO =============
  {
    from: 'tantra',
    to: 'esoterismo',
    symbol: 'kundalini',
    relationship: 'shared',
    confidence: 0.95,
    notes:
      'O sistema da Kundalini é adotado em massa pelo esoterismo ocidental via ordem da Golden Dawn, A∴A∴ e OTO. Toda magia sexual ocidental é derivada do Tantra.',
  },
  {
    from: 'tantra',
    to: 'esoterismo',
    symbol: 'shakti',
    relationship: 'shared',
    confidence: 0.85,
    notes:
      'A magia sexual de Crowley (IX° O.T.O.) é herança direta do Tantra hindu/budista. "Não há lei além de Faze o que tu queres" = Tantra libertário.',
  },
  {
    from: 'tantra',
    to: 'esoterismo',
    symbol: 'shiva',
    relationship: 'shared',
    confidence: 0.7,
    notes:
      '"Shiva branco de Neve" — na Cabala Hermética, "Ain Soph" representa Shiva puro. Misticismo judaico-hindu emerge em novas raízes europeias.',
  },
  {
    from: 'tantra',
    to: 'esoterismo',
    symbol: 'brahman',
    relationship: 'shared',
    confidence: 0.65,
    notes:
      'Brahman é "O Todo" — Guénon (René Guénon) escreveu sobre isso em "O Homem e sua Tornar-se Uno". Esoterismo europeu tem seu Hinduísmo interior.',
  },

  // ============= CANDOMBLÉ × ESOTERISMO =============
  {
    from: 'candomble',
    to: 'esoterismo',
    symbol: 'ogun',
    relationship: 'shared',
    confidence: 0.5,
    notes:
      'Ògún (forja) e a "Pistis Sophia" hermética partilham simbolismo do martelo/malete do maçom. Ferreiro-mago é figura universal.',
  },
  {
    from: 'candomble',
    to: 'esoterismo',
    symbol: 'oxala',
    relationship: 'shared',
    confidence: 0.55,
    notes:
      'Oxalá-Coração da Árvore (Tiphareth) — ambas as tradições leem a "figura branca central" como mediadora entre céu e terra.',
  },
  {
    from: 'candomble',
    to: 'esoterismo',
    symbol: 'metatron',
    relationship: 'shared',
    confidence: 0.5,
    notes:
      'Exu e Metatron são ambos escribas — mensageiros que registram ações do humano. Ambas as tradições os tratam como "guardiões da porta".',
  },

  // ============= Christianity × indigenous-brazilian =============
  {
    from: 'christianity',
    to: 'indigenous-brazilian',
    symbol: 'mary',
    relationship: 'syncretic',
    confidence: 0.45,
    notes:
      '"Nossas Senhora" no catolicismo popular brasileiro é invocada como entidade equivalente a Mãe-Iara, Indiarara, Mãe-do-Buriti. Sincretismo contínuo.',
  },
  {
    from: 'christianity',
    to: 'indigenous-brazilian',
    symbol: 'jurema',
    relationship: 'syncretic',
    confidence: 0.5,
    notes:
      '"Maria" da Jurema é feminina, doadora, ligada à floresta — leitura direta da Theotokos cristã dentro do xamanismo caboclo.',
  },

  // ============= CHRISTIANITY × ANARQUIA-ESPIRITUAL =============
  {
    from: 'christianity',
    to: 'anarquia-espiritual',
    symbol: 'cobra-coral',
    relationship: 'syncretic',
    confidence: 0.45,
    notes:
      'A "serpente do bem" (cristã, oposta à Maçã) dialoga com a Cobra Coral (anarquia). Ambas as figuras-serpente têm função ambivalente — mordem e curam.',
  },
  {
    from: 'christianity',
    to: 'anarquia-espiritual',
    symbol: 'madalena',
    relationship: 'syncretic',
    confidence: 0.6,
    notes:
      'Maria Madalena é santa popular da Anarquia Espiritual e da Pajelança Cabocla — caboclas e ciganas a invocam como "Filha da Encantaria".',
  },
];

// =====================================================================
// 4. SYMBOL REGISTRY (DERIVED)
// =====================================================================

/**
 * Symbol -> Traditions index, derived once at module load.
 * Keys are symbols referenced by at least one cross-reference.
 */
export const SYMBOL_INDEX: Readonly<Record<Symbol, readonly Tradition[]>> = Object.freeze(
  SYMBOL_INDEX_BUILDER(),
);

// =====================================================================
// 5. PUBLIC API
// =====================================================================

/**
 * Returns every cross-reference edge that links the two traditions
 * regardless of direction. If `a === b` we return the empty array.
 *
 * The result is symmetric: `(a, b)` always equals `(b, a)`.
 *
 * @example
 *   crossReference('candomble', 'christianity'); // 10 Oxalá/Jesus/Madalena edges
 */
export function crossReference(a: Tradition, b: Tradition): CrossRef[] {
  if (a === b) return [];
  const forward = CROSS_REFS.filter((e) => e.from === a && e.to === b);
  const reverse = CROSS_REFS.filter((e) => e.from === b && e.to === a);
  return [...forward, ...reverse];
}

/**
 * Detects shared symbols across a given set of traditions.
 * A symbol is "shared" if it appears as either `from` or `to`
 * in at least one edge between traditions in the input set.
 *
 * @param traditions - 2+ traditions to compare.
 * @returns Map symbol -> list of involved traditions.
 */
export function detectSharedSymbols(traditions: readonly Tradition[]): Map<Symbol, Tradition[]> {
  const set = new Set<Tradition>(traditions);
  const out = new Map<Symbol, Tradition[]>();

  for (const edge of CROSS_REFS) {
    if (!set.has(edge.from) || !set.has(edge.to)) continue;
    const acc = out.get(edge.symbol) ?? [];
    if (!acc.includes(edge.from)) acc.push(edge.from);
    if (!acc.includes(edge.to)) acc.push(edge.to);
    out.set(edge.symbol, acc);
  }

  // Stable sort by tradition count desc.
  return new Map([...out.entries()].sort((a, b) => b[1].length - a[1].length));
}

/**
 * Builds the full 16 × 16 cross-reference matrix. The matrix is
 * always quadratic: each entry is an array (possibly empty) of
 * edges anchored at `from` side. To get the symmetric view,
 * use `crossReference(a, b)`.
 *
 * The matrix is rebuilt on each call (cheap — ~256 nodes, ~250 edges).
 * UI grids should memoize via React Server Component cache or
 * equivalent.
 */
export function buildMatrix(): Record<Tradition, Record<Tradition, CrossRef[]>> {
  const matrix = {} as Record<Tradition, Record<Tradition, CrossRef[]>>;
  for (const a of TRADITIONS) {
    matrix[a.id] = {} as Record<Tradition, CrossRef[]>;
    for (const b of TRADITIONS) {
      matrix[a.id][b.id] = a.id === b.id ? [] : crossReference(a.id, b.id);
    }
  }
  return matrix;
}

/**
 * Builds a short (one or two sentence) human-readable summary of
 * the resonance between two traditions. Suitable for tooltips,
 * reading cards, and chat-model system prompts.
 */
export function explainResonance(a: Tradition, b: Tradition): string {
  if (a === b) return `Mesma tradição (${a}); sem ressonância cruzada.`;

  const edges = crossReference(a, b);
  if (edges.length === 0) {
    return `Sem ressonância direta documentada entre ${labelFor(a)} e ${labelFor(b)}.`;
  }

  // Counters per relationship category.
  const byRel: Record<Relationship, number> = { syncretic: 0, shared: 0, parallel: 0, historical: 0 };
  let confSum = 0;
  const symbolsSeen = new Set<Symbol>();
  for (const e of edges) {
    byRel[e.relationship]++;
    confSum += e.confidence;
    symbolsSeen.add(e.symbol);
  }
  const avg = Number((confSum / edges.length).toFixed(2));

  // Pick the strongest edge to anchor the prose.
  const top = [...edges].sort((x, y) => y.confidence - x.confidence)[0] as CrossRef;
  const strong = edges.filter((e) => e.confidence >= 0.75).length;

  return [
    `Entre ${labelFor(a)} e ${labelFor(b)} há ${edges.length} ressonâncias documentadas ` +
      `(confiança média ${avg}; ${strong} de alta confiança). `,
    `Relação mais forte: ${symbolLabel(top.symbol)} (${top.relationship}, ` +
      `confiança ${top.confidence.toFixed(2)}) — ${truncate(top.notes, 140)}`,
  ].join('');
}

/**
 * Suggests the most-resonant traditions to a given tradition.
 * "Resonance" is computed as the sum of `confidence` across all
 * edges between the two — i.e. tradition pairs with more and/or
 * higher-confidence links rank higher.
 *
 * @param tradition  - The anchor tradition.
 * @param limit      - Max number of suggestions (default 5).
 * @returns Sorted list of suggested traditions (most-resonant first).
 */
export function suggestRelated(tradition: Tradition, limit = 5): Tradition[] {
  const scores = TRADITIONS.map((t) => {
    if (t.id === tradition) return { id: t.id, score: -1 };
    const edges = crossReference(tradition, t.id);
    const score = edges.reduce((acc, e) => acc + e.confidence, 0);
    return { id: t.id, score };
  });
  scores.sort((a, b) => b.score - a.score);
  return scores.filter((s) => s.score > 0).slice(0, limit).map((s) => s.id);
}

/**
 * Looks up a tradition profile by id.
 * @returns The profile, or `undefined` if not in {@link TRADITIONS}.
 */
export function getTradition(id: Tradition): TraditionProfile | undefined {
  return TRADITIONS.find((t) => t.id === id);
}

/**
 * Looks up all cross-reference edges containing a given symbol.
 */
export function edgesBySymbol(symbol: Symbol): CrossRef[] {
  return CROSS_REFS.filter((e) => e.symbol === symbol);
}

// =====================================================================
// 6. INTERNAL HELPERS
// =====================================================================

/**
 * Returns the pt-BR display name for a tradition id.
 * Falls back to the id when not in the registry.
 */
function labelFor(id: Tradition): string {
  const profile = TRADITIONS.find((t) => t.id === id);
  return profile ? profile.name : id;
}

/**
 * Returns the pt-BR display name for a symbol id.
 * Uses the canonical pt-BR spelling.
 */
function symbolLabel(symbol: Symbol): string {
  const map: Partial<Record<Symbol, string>> = {
    oxala: 'Oxalá',
    ogum: 'Ogum',
    iansa: 'Iansã',
    xango: 'Xangô',
    oxum: 'Oxum',
    lemanja: 'Iemanjá',
    iemanja: 'Iemanjá',
    obaluae: 'Obaluaiê',
    'obaluae-omulu': 'Omulu',
    exu: 'Exu',
    jesus: 'Jesus',
    mary: 'Maria',
    joseph: 'José',
    peter: 'Pedro',
    michael: 'Miguel',
    gabriel: 'Gabriel',
    raphael: 'Rafael',
    uriel: 'Uriel',
    brigid: 'Brígida',
    catherine: 'Catarina',
    francis: 'Francisco',
    vishnu: 'Vishnu',
    shiva: 'Shiva',
    shakti: 'Shakti',
    brahma: 'Brahma',
    ganesha: 'Ganesha',
    lakshmi: 'Lakshmi',
    saraswati: 'Saraswati',
    kundalini: 'Kuṇḍalinī',
    chakra: 'Chakra',
    brahman: 'Brahman',
    buddha: 'Buda',
    avalokiteshvara: 'Avalokiteshvara',
    tara: 'Tara',
    maitreya: 'Maitreya',
    amitabha: 'Amitabha',
    bodhisattva: 'Bodisatva',
    dharma: 'Dharma',
    allah: 'Alá',
    muhammad: 'Maomé',
    isha: 'Isha',
    idris: 'Idris',
    suleiman: 'Suleiman',
    khadija: 'Khadija',
    rumi: 'Rumi',
    'ein-sof': 'Ein-Sof',
    kether: 'Kether',
    tiphareth: 'Tiphareth',
    shekhinah: 'Shekhinah',
    metatron: 'Metatron',
    sandalphon: 'Sandalphon',
    binah: 'Binah',
    chokmah: 'Chokmah',
    sol: 'Sol',
    luna: 'Lua',
    mercurio: 'Mercúrio',
    venus: 'Vênus',
    mars: 'Marte',
    jupiter: 'Júpiter',
    saturno: 'Saturno',
    urano: 'Urano',
    netuno: 'Netuno',
    plutao: 'Plutão',
    lilith: 'Lilith',
    'horn-god': 'Deus Cornudo',
    'triple-goddess': 'Deusa Tríplice',
    hecate: 'Hécate',
    pan: 'Pã',
    isis: 'Ísis',
    osiris: 'Osíris',
    'spirit-of-truth': 'Espírito da Verdade',
    'guardian-angel': 'Anjo da Guarda',
    perispirit: 'Perispírito',
    jurema: 'Jurema',
    pajé: 'Pajé',
    toa: 'Toá (Toré)',
    curupira: 'Curupira',
    iara: 'Iara',
    'iara-mae': 'Iara-Mãe',
    'cobra-coral': 'Cobra Coral',
    'pajé-andira': 'Pajé Andira',
    encantaria: 'Encantaria',
    madalena: 'Maria Madalena',
    'preto-velho': 'Preto-Velho',
    caboclo: 'Caboclo',
    baiano: 'Baiano',
    mariw: 'Mariw (Pomba Gira)',
  };
  return map[symbol] ?? symbol;
}

/**
 * Truncates long strings with an ellipsis (used by explainResonance).
 */
function truncate(input: string, max: number): string {
  return input.length > max ? `${input.slice(0, max - 1).trimEnd()}…` : input;
}
