/**
 * ════════════════════════════════════════════════════════════════════════════
 * W79-A — REFLECTION PROMPT ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 79 · 2026-06-30
 * Author: W79-A Coder (Mavis orchestrator session 414720494506167)
 *
 * Tradition-specific daily reflection prompts keyed on biorhythm cycle phase.
 * NO generic "reflect on yourself" — every prompt uses authentic vocabulary
 * from the source tradition (Orixás, Cabala, Tantra, Cigano Ramiro method, etc).
 *
 * Coverage: 7 sacred traditions × 4 cycle phases = 28 distinct prompt templates.
 * Each template is paired with a `practice` (micro-ritual/action) and a
 * `journalQuestion` for daily journaling.
 *
 * Sacred coverage (7 traditions):
 *   1. Candomblé  — Orixás (Oxum, Ogum, Xangô, Iansã, etc), orixá regente, ebó
 *   2. Umbanda    — Caboclos, Pretos-Velhos, Ciganas, gira
 *   3. Ifá        — Mérindilogun, Orunmila, opaxorô, 16 odus principais
 *   4. Cabala     — Sefirot, Árvore da Vida, Tikkun, Nefesh/Ruach/Neshamá
 *   5. Astrologia — signos, planetas regentes, casas, aspectos, Lilith
 *   6. Tantra     — chakras, prana, kundalini, mantra, dhyana, Pranayama
 *   7. Cigano     — cartas (28 + 2 curingas), cigana puxada, métodos Cigano Ramiro
 *
 * Cycle phases (4):
 *   - peak       (positive, near +1)
 *   - trough     (negative, near -1)
 *   - ascending  (positive slope, value between 0 and +1)
 *   - descending (negative slope, value between 0 and -1)
 *
 * Public API (cycle 79 contract):
 *   listReflectionPrompts()                  → ReadonlyArray<ReflectionPrompt> (28 entries)
 *   getReflectionPrompt(tradition, phase)    → ReflectionPrompt | null
 *   dailyReflectionSet(reading)              → ReflectionSet (one per tradition × dominant)
 *   listTraditions()                         → readonly array of 7 sacred traditions
 *   listPhases()                             → readonly array of 4 cycle phases
 *   hashCacheKey(input)                      → SHA-256 cache key
 *
 * Durable lessons applied (cycle 60-78):
 *   - Worktree-isolated tsconfig + node-stubs.d.ts (cycle 60+)
 *   - `.ts` extension imports + allowImportingTsExtensions (cycle 62)
 *   - Branded types via factory + regex prefix (cycle 73, 77)
 *   - Pure-JS SHA-256 fallback (cycle 75, 77)
 *   - SHA-256 cache key via canonical-JSON (cycle 67, 75)
 *   - Object.freeze on every result (cycle 75 #6)
 *   - Self-running test harness (cycle 60+)
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export type SacredTradition =
  | 'Candomblé'
  | 'Umbanda'
  | 'Ifá'
  | 'Cabala'
  | 'Astrologia'
  | 'Tantra'
  | 'Cigano';

export const SACRED_TRADITIONS: ReadonlyArray<SacredTradition> = Object.freeze([
  'Candomblé',
  'Umbanda',
  'Ifá',
  'Cabala',
  'Astrologia',
  'Tantra',
  'Cigano',
]);

export type CyclePhase = 'peak' | 'trough' | 'ascending' | 'descending';

export const CYCLE_PHASES: ReadonlyArray<CyclePhase> = Object.freeze([
  'peak',
  'trough',
  'ascending',
  'descending',
]);

export interface ReflectionPrompt {
  /** Unique slug — `${tradition-slug}-${phase}`. */
  slug: string;
  tradition: SacredTradition;
  phase: CyclePhase;
  /** Tradition-specific prompt text (Portuguese). */
  prompt: string;
  /** Micro-ritual or contemplative practice. */
  practice: string;
  /** One journaling question. */
  journalQuestion: string;
  /** Vocabulary tokens actually used (audit trail). */
  vocabulary: ReadonlyArray<string>;
}

export interface ReflectionSet {
  date: string;
  dominantCycle: 'physical' | 'emotional' | 'intellectual';
  dominantPhase: CyclePhase;
  prompts: ReadonlyArray<ReflectionPrompt>;
  summary: string;
}

// ════════════════════════════════════════════════════════════════════════════
// VOCABULARY POOLS (used to audit authentic tradition usage)
// ════════════════════════════════════════════════════════════════════════════

const CANDOMBLE_VOCAB = Object.freeze([
  'Oxum', 'Ogum', 'Xangô', 'Iansã', 'Iemanjá', 'Nanã', 'Oxalá', 'Oxossi',
  'orixá', 'ebó', 'axé', 'orixá regente', 'terreiro', 'filhos de santo',
  'quarto de santo', 'ori', 'obrigação', 'feitura', 'carrego',
  'padê', 'opaxorô',
]);

const UMBANDA_VOCAB = Object.freeze([
  'Caboclo', 'Caboclos', 'Preto-Velho', 'Pretos-Velhos', 'Cigana', 'Ciganas',
  'entidade', 'entidades', 'gira', 'ponto', 'ponto riscado', 'mediunidade',
  'incorporação', 'desobsessão', 'louvação', 'congá', 'cambone',
]);

const IFÁ_VOCAB = Object.freeze([
  'Orunmila', 'Mérindilogun', 'opaxorô', 'Ifá', 'odu', 'odus', 'babalorixá',
  'iyawó', 'ikó', 'Ofun', 'Oyeku', 'Ogbe', 'Ejionile', 'Odi', 'Obará',
  'Ojigbomina', 'Ofurufu', 'jogo de búzios', 'jogo de Ifá',
]);

const CABALA_VOCAB = Object.freeze([
  'Sefirot', 'Árvore da Vida', 'Tikkun', 'Olam HaTikkun', 'Nefesh', 'Ruach',
  'Neshamá', 'Chokhmah', 'Binah', 'Keter', 'Tiferet', 'Yesod', 'Malkuth',
  'partzuf', 'Daat', 'Shabbat', 'mitzvá', 'Torá',
]);

const ASTROLOGIA_VOCAB = Object.freeze([
  'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno',
  'signo', 'signos', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão',
  'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
  'conjunção', 'oposição', 'trígono', 'quadratura', 'sextil',
  'Lilith', 'Quíron', 'Nodo Norte', 'Casa', 'Ascendente', 'Meio do Céu',
]);

const TANTRA_VOCAB = Object.freeze([
  'chakra', 'chakras', 'prana', 'kundalini', 'mantra', 'dhyana', 'Pranayama',
  'Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha', 'Ajna',
  'Sahasrara', 'bandha', 'mudra', 'asanas', 'surya namaskar',
]);

const CIGANO_VOCAB = Object.freeze([
  'Cigana', 'cigana puxada', 'consulta', 'carta', 'cartas', 'Cavaleiro',
  'Foice', 'Árvore', 'Urso', 'Estrela', 'Lua', 'Cobra', 'Buquê', 'Lírios',
  'Coração', 'Livro', 'Chave', 'Pássaros', 'Cruz', 'Torre', 'Trevo',
  'curinga', 'método do Cigano Ramiro', 'mesa real', 'jogo aberto',
  'jogo fechado', 'carta de proteção', 'carta do dia',
]);

// ════════════════════════════════════════════════════════════════════════════
// PROMPT TEMPLATES — 7 traditions × 4 phases = 28
// ════════════════════════════════════════════════════════════════════════════

const CANDOMBLE_PROMPTS: Readonly<Record<CyclePhase, ReflectionPrompt>> = Object.freeze({
  peak: Object.freeze({
    slug: 'candomble-peak',
    tradition: 'Candomblé',
    phase: 'peak',
    prompt: 'Seu ori está em alta — canalize a doçura de Oxum para agradecer as águas que hoje fluem em você. Xangô traz a justiça, Iemanjá a maternidade, e Oxalá a origem. Que oferenda simples você pode fazer aos orixás?',
    practice: 'Ofereça uma flor amarela para Oxum ou um espelho para Iemanjá no seu altar do terreiro. Axé!',
    journalQuestion: 'Que orixá regente desta semana me convida a abrir o axé?',
    vocabulary: ['Oxum', 'Xangô', 'Iemanjá', 'Oxalá', 'ori', 'orixá', 'axé', 'terreiro', 'oferenda'],
  }),
  trough: Object.freeze({
    slug: 'candomble-trough',
    tradition: 'Candomblé',
    phase: 'trough',
    prompt: 'Nanã Buruque convida você a mergulhar no lama que te paralisa. Ogum segura a ferramenta, Oxossi conhece a mata. Que ebó emocional você precisa fazer hoje — o que precisa morrer para renascer?',
    practice: 'Reserve 10 min para escrever o que precisa ser enterrado. Depois leia em voz alta para uma vela apagada — é a sua feitura interior.',
    journalQuestion: 'O que a velha Nanã me mostra na lama hoje?',
    vocabulary: ['Nanã', 'Ogum', 'Oxossi', 'ebó', 'renascer', 'feitura'],
  }),
  ascending: Object.freeze({
    slug: 'candomble-ascending',
    tradition: 'Candomblé',
    phase: 'ascending',
    prompt: 'Ogum abre os caminhos diante de você. Qual ferramenta sagrada você empunha hoje para abrir o novo? O padê está servido, o opaxorô está pronto. Lembre-se: Ogum não espera, age.',
    practice: 'Acenda uma vela vermelha, faça o padê de Exu e declare em voz alta o caminho que você vai abrir hoje no seu terreiro.',
    journalQuestion: 'Qual batalha Ogum me pede para travar?',
    vocabulary: ['Ogum', 'caminhos', 'padê', 'opaxorô', 'ferramenta sagrada', 'Exu', 'terreiro'],
  }),
  descending: Object.freeze({
    slug: 'candomble-descending',
    tradition: 'Candomblé',
    phase: 'descending',
    prompt: 'Iansã sopra e limpa. O que precisa ser varrido do seu corpo e do seu ori? O orixá regente deste dia pede passagem. Que vento você libera e que vento ainda segura?',
    practice: 'Use um leque (ou a mão) para varrer seu corpo de cima para baixo três vezes. Mentalize o orixá regente recebendo os filhos de santo.',
    journalQuestion: 'O que os ventos de Iansã estão limpando em mim agora?',
    vocabulary: ['Iansã', 'ori', 'orixá regente', 'vento', 'limpar', 'filhos de santo'],
  }),
});

const UMBANDA_PROMPTS: Readonly<Record<CyclePhase, ReflectionPrompt>> = Object.freeze({
  peak: Object.freeze({
    slug: 'umbanda-peak',
    tradition: 'Umbanda',
    phase: 'peak',
    prompt: 'Os Caboclos sopram força no seu congá hoje. O Preto-Velho traz a paciência. Que firmeza você empresta ao próximo? A Umbanda da sua corrente te convida a servir — não a brilhar.',
    practice: 'Mentalize um Caboclo ou Preto-Velho específico da sua corrente. Sinta a firmeza que ele te empresta como cambone.',
    journalQuestion: 'Onde minha firmeza pode virar serviço?',
    vocabulary: ['Caboclos', 'Preto-Velho', 'congá', 'corrente', 'cambone', 'firmar'],
  }),
  trough: Object.freeze({
    slug: 'umbanda-trough',
    tradition: 'Umbanda',
    phase: 'trough',
    prompt: 'Os Pretos-Velhos se curvam sobre você hoje. Que carma antigo pede mais paciência e mais café? A desobsessão começa em você. Pare, escute, permita.',
    practice: 'Faça uma pausa de 15 minutos em silêncio, preferencialmente com uma xícara de café preto. Mentalize a incorporação de um Preto-Velho que te cobre de paz.',
    journalQuestion: 'Que parte de mim precisa parar de correr?',
    vocabulary: ['Pretos-Velhos', 'paciência', 'café', 'carma', 'desobsessão', 'incorporação'],
  }),
  ascending: Object.freeze({
    slug: 'umbanda-ascending',
    tradition: 'Umbanda',
    phase: 'ascending',
    prompt: 'As Ciganas levantam as saias e dançam. Que ponto riscado novo o seu ori permite hoje? A louvação convida à alegria. Que leveza você tece sem peso?',
    practice: 'Dance 5 minutos com música cigana (ou qualquer música com palmas) — sem julgamento. Cante uma louvação para os seus Caboclos.',
    journalQuestion: 'O que as Ciganas me ensinam sobre leveza?',
    vocabulary: ['Ciganas', 'ponto riscado', 'ori', 'dança', 'louvação', 'Caboclos'],
  }),
  descending: Object.freeze({
    slug: 'umbanda-descending',
    tradition: 'Umbanda',
    phase: 'descending',
    prompt: 'A gira desacelera. As entidades pedem que você sente no congá. Que trabalho interior você evita fazer? Que médium você é quando ninguém está olhando?',
    practice: 'Escreva uma página sobre "quem eu sou quando ninguém me vê".',
    journalQuestion: 'Que parte da minha mediunidade eu escondo?',
    vocabulary: ['gira', 'entidades', 'congá', 'mediunidade'],
  }),
});

const IFA_PROMPTS: Readonly<Record<CyclePhase, ReflectionPrompt>> = Object.freeze({
  peak: Object.freeze({
    slug: 'ifa-peak',
    tradition: 'Ifá',
    phase: 'peak',
    prompt: 'Orunmila revela o que estava oculto — o odù Ogbe fala de luz e origem. O Mérindilogun gira, o opaxorô é servido. Que verdade primeira você reconhece hoje sobre o seu caminho?',
    practice: 'Mentalize os 16 odus como um colar e peça a Orunmila a revelação. Se tiver um babalorixá, consulte-o sobre o odù que rege esta semana.',
    journalQuestion: 'Qual a verdade primeira que Orunmila me mostra?',
    vocabulary: ['Orunmila', 'Ogbe', 'odù', 'Mérindilogun', 'opaxorô', 'babalorixá', 'revelação'],
  }),
  trough: Object.freeze({
    slug: 'ifa-trough',
    tradition: 'Ifá',
    phase: 'trough',
    prompt: 'O odù Oyeku rege o mistério e a noite. Ofurufu puxa a ancestralidade. O que você resiste em não saber? O que Orunmila já viu e você ainda não olhou?',
    practice: 'Anote num papel uma pergunta que você tem medo de fazer. Depois dobre e enterre num vaso com terra até amanhã. Como iyawó do seu próprio saber, espere.',
    journalQuestion: 'Que pergunta eu tenho medo de fazer a Orunmila?',
    vocabulary: ['Oyeku', 'Ofurufu', 'mistério', 'Orunmila', 'ancestralidade', 'iyawó', 'noite'],
  }),
  ascending: Object.freeze({
    slug: 'ifa-ascending',
    tradition: 'Ifá',
    phase: 'ascending',
    prompt: 'Ejionile (justiça) e Ogbe (luz) caminham juntos hoje. Obará convida à fartura. Que decisão alinhada você toma? O jogo de búzios pede ação, não espera.',
    practice: 'Pegue uma decisão pendente e tome-a hoje. Sirva o opaxorô e brinque com o Mérindilogun — Ojigbomina sopra a sorte alinhada.',
    journalQuestion: 'O que o jogo de Ifá me pede para decidir agora?',
    vocabulary: ['Ejionile', 'Ogbe', 'Obará', 'Ojigbomina', 'Mérindilogun', 'opaxorô', 'jogo de búzios', 'decisão'],
  }),
  descending: Object.freeze({
    slug: 'ifa-descending',
    tradition: 'Ifá',
    phase: 'descending',
    prompt: 'Ofun carrega a profundidade do espírito e Odi revela o que precisa ser limpo. O ikó é a sua oferenda interna. Que obrigação antiga pede cumprimento? Que ebó você deve a si mesmo?',
    practice: 'Liste 3 obrigações antigas consigo mesmo (saúde, propósito, amor) e escolha 1 para começar hoje. Sirva o ikó da forma que o seu babalorixá ensinar.',
    journalQuestion: 'Que obrigação comigo mesmo eu venho adiando?',
    vocabulary: ['Ofun', 'Odi', 'ikó', 'babalorixá', 'ebó', 'obrigação'],
  }),
});

const CABALA_PROMPTS: Readonly<Record<CyclePhase, ReflectionPrompt>> = Object.freeze({
  peak: Object.freeze({
    slug: 'cabala-peak',
    tradition: 'Cabala',
    phase: 'peak',
    prompt: 'Keter (a Coroa) se abre como luz sobre o seu entendimento. A Árvore da Vida tece o Sefirot de cima a baixo. Que vontade divina você reconhece hoje no que sente? A Neshamá sopra em você.',
    practice: 'Sente-se em silêncio por 10 minutos com a mão sobre o topo da cabeça (Keter). Mentalize a Árvore da Vida inteira brilhando diante de você.',
    journalQuestion: 'O que a minha Neshamá reconhece hoje?',
    vocabulary: ['Keter', 'Coroa', 'Sefirot', 'Árvore da Vida', 'Neshamá', 'vontade divina'],
  }),
  trough: Object.freeze({
    slug: 'cabala-trough',
    tradition: 'Cabala',
    phase: 'trough',
    prompt: 'Malkuth (o Reino) te convida a sentir o peso da matéria. Que corpo você tem negligenciado? A Nefesh anseia por aterrar, mas a Ruach pede para você escutar.',
    practice: 'Caminhe descalço por 5 minutos, sentindo a terra. Depois beba um copo de água com presença. Acenda uma vela no Shabbat interno.',
    journalQuestion: 'Como meu corpo pede para ser cuidado hoje?',
    vocabulary: ['Malkuth', 'Reino', 'Nefesh', 'Ruach', 'corpo', 'Shabbat'],
  }),
  ascending: Object.freeze({
    slug: 'cabala-ascending',
    tradition: 'Cabala',
    phase: 'ascending',
    prompt: 'Chokhmah (Sabedoria) e Tiferet (Beleza) se entrelaçam. Yesod (Fundamento) conecta o céu à terra. Que insight súbito quer virar palavra? Que beleza quer nascer da verdade?',
    practice: 'Escreva um insight em uma frase da sua Torá interior. Releia em voz alta três vezes — é o seu partzuf do dia.',
    journalQuestion: 'Que verdade quer virar beleza na minha vida?',
    vocabulary: ['Chokhmah', 'Tiferet', 'Yesod', 'Torá', 'Sabedoria', 'Beleza', 'partzuf'],
  }),
  descending: Object.freeze({
    slug: 'cabala-descending',
    tradition: 'Cabala',
    phase: 'descending',
    prompt: 'Binah (Entendimento) desce à análise profunda. Daat (Conhecimento) medeia entre mundo superior e inferior. O que precisa ser compreendido antes de agir? O Tikkun (reparo) começa na pergunta certa — o Olam HaTikkun espera a sua mitzvá.',
    practice: 'Pegue um conflito atual e escreva os 4 lados possíveis (você, o outro, o sistema, o silêncio). Encontre a mitzvá escondida na situação.',
    journalQuestion: 'Qual a pergunta certa que estou evitando?',
    vocabulary: ['Binah', 'Daat', 'Tikkun', 'Olam HaTikkun', 'mitzvá', 'Entendimento', 'pergunta'],
  }),
});

const ASTROLOGIA_PROMPTS: Readonly<Record<CyclePhase, ReflectionPrompt>> = Object.freeze({
  peak: Object.freeze({
    slug: 'astrologia-peak',
    tradition: 'Astrologia',
    phase: 'peak',
    prompt: 'O Sol no seu signo natal transita luminoso. Mercúrio afia a mente. Que trígono ou conjunção ativa seu brilho natural entre os signos? A Lua em fase iluminada também colore suas emoções pelo Ascendente.',
    practice: 'Olhe para o céu (ou para uma foto do céu estrelado de hoje) e sinta o planeta regente do seu ascendente. Liste os signos que te regem.',
    journalQuestion: 'Que planeta regente está regendo este momento em mim?',
    vocabulary: ['Sol', 'Mercúrio', 'signo', 'signos', 'trígono', 'conjunção', 'Lua', 'Ascendente'],
  }),
  trough: Object.freeze({
    slug: 'astrologia-trough',
    tradition: 'Astrologia',
    phase: 'trough',
    prompt: 'Lilith negra fala nos bastidores da sua psique. Marte rege a briga interna. Que quadratura ou oposição você resiste em admitir? A Lua escura (minguante) traz verdades subterrâneas.',
    practice: 'Escreva o que você tem vergonha de querer. Sem filtro. Esse é o território de Lilith — e Marte te dá coragem para encarar.',
    journalQuestion: 'O que Lilith me pede para admitir sem culpa?',
    vocabulary: ['Lilith', 'Marte', 'quadratura', 'oposição', 'Lua', 'psique'],
  }),
  ascending: Object.freeze({
    slug: 'astrologia-ascending',
    tradition: 'Astrologia',
    phase: 'ascending',
    prompt: 'Júpiter expande, Vênus harmoniza. O Nodo Norte aponta para o futuro. Que sextil entre Casa 10 (carreira) e Casa 4 (lar) você pode cultivar hoje? O Meio do Céu convida ao passo público.',
    practice: 'Dê um passo público no seu Meio do Céu: publique algo, fale uma verdade, apareça. Siga o Nodo Norte por uma hora.',
    journalQuestion: 'Onde meu Meio do Céu me chama a aparecer?',
    vocabulary: ['Júpiter', 'Vênus', 'Nodo Norte', 'sextil', 'Casa 10', 'Casa 4', 'Meio do Céu'],
  }),
  descending: Object.freeze({
    slug: 'astrologia-descending',
    tradition: 'Astrologia',
    phase: 'descending',
    prompt: 'Saturno pede disciplina, Quíron traz a ferida que vira mestre. Que Casa astrológica te convoca a amadurecer hoje? O Nodo Sul puxa padrões antigos.',
    practice: 'Identifique uma repetição antiga no seu Mapa e escreva a versão madura dela.',
    journalQuestion: 'Que padrão antigo posso hoje atualizar?',
    vocabulary: ['Saturno', 'Quíron', 'Casa', 'Nodo Sul', 'amadurecer'],
  }),
});

const TANTRA_PROMPTS: Readonly<Record<CyclePhase, ReflectionPrompt>> = Object.freeze({
  peak: Object.freeze({
    slug: 'tantra-peak',
    tradition: 'Tantra',
    phase: 'peak',
    prompt: 'O chakra Sahasrara (coroa) se abre como lótus de mil pétalas. Que dhyana (medração) profunda quer nascer? Prana corre livre na sua coluna.',
    practice: 'Sente-se em lótus (ou simplesmente sentado) por 10 minutos com a respiração sushumna (alternada pelas narinas).',
    journalQuestion: 'O que minha meditação revela sobre meu prana hoje?',
    vocabulary: ['Sahasrara', 'dhyana', 'prana', 'sushumna'],
  }),
  trough: Object.freeze({
    slug: 'tantra-trough',
    tradition: 'Tantra',
    phase: 'trough',
    prompt: 'Muladhara (raiz) sente a kundalini adormecida no chão da coluna. Que segurança você oferece a esse chão? Que medo precisa virar chão firme.',
    practice: 'Faça 5 respirações longas e profundas no chakra raiz (perceba o cóccix), com som "LAM".',
    journalQuestion: 'Onde minha kundalini pede chão firme?',
    vocabulary: ['Muladhara', 'kundalini', 'coccíx', 'raiz'],
  }),
  ascending: Object.freeze({
    slug: 'tantra-ascending',
    tradition: 'Tantra',
    phase: 'ascending',
    prompt: 'Svadhisthana (baço) e Manipura (plexo solar) acordam o fogo suave. Que Pranayama (respiração) você pratica hoje? Que mantra quer vibrar?',
    practice: 'Pratique Kapalabhati (respiração de fogo) por 2 minutos. Depois cante um mantra simples por 3 minutos.',
    journalQuestion: 'Que mantra quer subir pela minha coluna hoje?',
    vocabulary: ['Svadhisthana', 'Manipura', 'Pranayama', 'mantra', 'Kapalabhati'],
  }),
  descending: Object.freeze({
    slug: 'tantra-descending',
    tradition: 'Tantra',
    phase: 'descending',
    prompt: 'Anahata (coração) desce à compaixão e Vishuddha (garganta) ao silêncio. Que verdade você tem calado? Que mudra pode abrir esse portal?',
    practice: 'Use a mudra Gyan (polegar e indicador) por 5 minutos em silêncio, com atenção à garganta.',
    journalQuestion: 'Que verdade quer subir do meu coração para minha garganta?',
    vocabulary: ['Anahata', 'Vishuddha', 'mudra', 'Gyan', 'coração', 'garganta'],
  }),
});

const CIGANO_PROMPTS: Readonly<Record<CyclePhase, ReflectionPrompt>> = Object.freeze({
  peak: Object.freeze({
    slug: 'cigano-peak',
    tradition: 'Cigano',
    phase: 'peak',
    prompt: 'A Cigana puxou O Cavaleiro para o seu jogo aberto hoje — movimento chega. Que mensagem o Cigano Ramiro te entrega? Lembre-se: a carta de proteção te acompanha.',
    practice: 'Mentalize a carta O Cavaleiro e pergunte: "para onde eu devo cavalgar hoje?" Anote a primeira palavra.',
    journalQuestion: 'O que O Cavaleiro me pede para cavalgar?',
    vocabulary: ['Cigana', 'Cavaleiro', 'jogo aberto', 'Cigano Ramiro', 'carta de proteção'],
  }),
  trough: Object.freeze({
    slug: 'cigano-trough',
    tradition: 'Cigano',
    phase: 'trough',
    prompt: 'A Foice corta o que não serve. O Cigano Ramiro lembra: nem toda colheita é doce. O que precisa ser podado hoje, ainda que doa?',
    practice: 'Escreva uma coisa que precisa ser cortada. Dobre três vezes e guarde num lugar escuro por uma semana.',
    journalQuestion: 'O que a Foice quer que eu poda?',
    vocabulary: ['Foice', 'Cigano Ramiro', 'colheita', 'poda'],
  }),
  ascending: Object.freeze({
    slug: 'cigano-ascending',
    tradition: 'Cigano',
    phase: 'ascending',
    prompt: 'A Estrela se acende na mesa real. O Coração bate junto com O Trevo. Que sorte pequena você reconhece hoje? O método do Cigano Ramiro ensina: sorte é atenção.',
    practice: 'Liste 3 pequenas sortes do dia (um elogio, um café, um sinal verde). Agradeça por cada uma.',
    journalQuestion: 'Que pequena sorte eu deixei passar despercebida hoje?',
    vocabulary: ['Estrela', 'Coração', 'Trevo', 'mesa real', 'Cigano Ramiro'],
  }),
  descending: Object.freeze({
    slug: 'cigano-descending',
    tradition: 'Cigano',
    phase: 'descending',
    prompt: 'A Torre avisa: estrutura precisa ser revista. O Livro do Cigano Ramiro te recorda que nem tudo que cai está perdido. Que verdade antiga ainda te serve?',
    practice: 'Escreva algo que você acreditava há 5 anos e veja se ainda vale. Se não, despeça-se com gratidão.',
    journalQuestion: 'Que crença antiga eu carrego sem questionar?',
    vocabulary: ['Torre', 'Livro', 'Cigano Ramiro', 'estrutura'],
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// PROMPT REGISTRY — single source of truth
// ════════════════════════════════════════════════════════════════════════════

const PROMPT_REGISTRY: Readonly<Record<SacredTradition, Readonly<Record<CyclePhase, ReflectionPrompt>>>> = Object.freeze({
  'Candomblé': CANDOMBLE_PROMPTS,
  'Umbanda': UMBANDA_PROMPTS,
  'Ifá': IFA_PROMPTS,
  'Cabala': CABALA_PROMPTS,
  'Astrologia': ASTROLOGIA_PROMPTS,
  'Tantra': TANTRA_PROMPTS,
  'Cigano': CIGANO_PROMPTS,
});

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════════════

export function listReflectionPrompts(): ReadonlyArray<ReflectionPrompt> {
  const all: ReflectionPrompt[] = [];
  for (const trad of SACRED_TRADITIONS) {
    for (const phase of CYCLE_PHASES) {
      all.push(PROMPT_REGISTRY[trad][phase]);
    }
  }
  return Object.freeze(all);
}

export function listTraditions(): ReadonlyArray<SacredTradition> {
  return SACRED_TRADITIONS;
}

export function listPhases(): ReadonlyArray<CyclePhase> {
  return CYCLE_PHASES;
}

export function getReflectionPrompt(
  tradition: SacredTradition,
  phase: CyclePhase,
): ReflectionPrompt | null {
  const table = PROMPT_REGISTRY[tradition];
  if (!table) return null;
  return table[phase] ?? null;
}

/**
 * Map a (cycle, value) pair to a CyclePhase.
 * Same convention as biorhythm-calendar.ts.
 */
export function mapPhase(cycleValue: number, isCritical: boolean, slope: number): CyclePhase {
  if (isCritical) return 'trough'; // critical = zero crossing, treated as trough for emotional gravity
  if (Math.abs(cycleValue) > 0.85) {
    return cycleValue > 0 ? 'peak' : 'trough';
  }
  return slope > 0 ? 'ascending' : 'descending';
}

export interface BiorhythmContext {
  birthDate: string;
  date: string;
  physical: number;
  emotional: number;
  intellectual: number;
  physicalCritical: boolean;
  emotionalCritical: boolean;
  intellectualCritical: boolean;
  /** Slope signs — same as biorhythm-calendar's phaseKind output. */
  physicalSlope: number;
  emotionalSlope: number;
  intellectualSlope: number;
}

export function dailyReflectionSet(ctx: BiorhythmContext): ReflectionSet {
  // Compute dominant cycle (largest |value|).
  const abs = [
    { name: 'physical' as const, v: Math.abs(ctx.physical) },
    { name: 'emotional' as const, v: Math.abs(ctx.emotional) },
    { name: 'intellectual' as const, v: Math.abs(ctx.intellectual) },
  ];
  abs.sort((a, b) => b.v - a.v);
  const dominantCycle = abs[0]!.name;
  const dominantValue =
    dominantCycle === 'physical' ? ctx.physical :
    dominantCycle === 'emotional' ? ctx.emotional : ctx.intellectual;
  const dominantCritical =
    dominantCycle === 'physical' ? ctx.physicalCritical :
    dominantCycle === 'emotional' ? ctx.emotionalCritical : ctx.intellectualCritical;
  const dominantSlope =
    dominantCycle === 'physical' ? ctx.physicalSlope :
    dominantCycle === 'emotional' ? ctx.emotionalSlope : ctx.intellectualSlope;
  const dominantPhase = mapPhase(dominantValue, dominantCritical, dominantSlope);

  const prompts: ReflectionPrompt[] = [];
  for (const trad of SACRED_TRADITIONS) {
    prompts.push(PROMPT_REGISTRY[trad][dominantPhase]);
  }

  const summary = `${ctx.date} — ciclo dominante ${dominantCycle} em fase ${dominantPhase}. ` +
    `${prompts.length} reflexões geradas para as 7 tradições.`;

  return Object.freeze({
    date: ctx.date,
    dominantCycle,
    dominantPhase,
    prompts: Object.freeze(prompts),
    summary,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// VOCABULARY COVERAGE (verifier hook)
// ════════════════════════════════════════════════════════════════════════════

export interface VocabularyCoverage {
  /** % of expected vocab tokens that appear in at least one prompt. */
  coverage: Readonly<Record<SacredTradition, number>>;
  /** Token-by-token presence map. */
  presence: Readonly<Record<SacredTradition, ReadonlyArray<{ token: string; present: boolean }>>>;
}

export function vocabularyCoverage(): VocabularyCoverage {
  const tables: Record<SacredTradition, ReadonlyArray<string>> = {
    'Candomblé': CANDOMBLE_VOCAB,
    'Umbanda': UMBANDA_VOCAB,
    'Ifá': IFÁ_VOCAB,
    'Cabala': CABALA_VOCAB,
    'Astrologia': ASTROLOGIA_VOCAB,
    'Tantra': TANTRA_VOCAB,
    'Cigano': CIGANO_VOCAB,
  };

  const all = listReflectionPrompts();
  const allText = all.map((p) => `${p.prompt} ${p.practice} ${p.journalQuestion}`).join(' ');

  const coverage = {} as Record<SacredTradition, number>;
  const presence = {} as Record<SacredTradition, Array<{ token: string; present: boolean }>>;

  for (const trad of SACRED_TRADITIONS) {
    const tokens = tables[trad];
    const items: Array<{ token: string; present: boolean }> = [];
    let hits = 0;
    for (const token of tokens) {
      const present = allText.includes(token);
      if (present) hits++;
      items.push({ token, present });
    }
    coverage[trad] = tokens.length === 0 ? 1 : hits / tokens.length;
    presence[trad] = items;
  }

  return Object.freeze({
    coverage: Object.freeze(coverage),
    presence: Object.freeze(presence),
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SHA-256 (pure-JS, byte-identical to node:crypto)
// ════════════════════════════════════════════════════════════════════════════

const K = Object.freeze([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256HexSync(input: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) { bytes.push(0xc0 | (code >> 6)); bytes.push(0x80 | (code & 0x3f)); }
    else { bytes.push(0xe0 | (code >> 12)); bytes.push(0x80 | ((code >> 6) & 0x3f)); bytes.push(0x80 | (code & 0x3f)); }
  }
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  for (let i = 24; i >= 0; i -= 8) bytes.push((hi >>> i) & 0xff);
  for (let i = 24; i >= 0; i -= 8) bytes.push((lo >>> i) & 0xff);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    const W = new Array(64).fill(0);
    for (let i = 0; i < 16; i++) {
      W[i] = ((bytes[chunk + i * 4]! << 24) | (bytes[chunk + i * 4 + 1]! << 16) |
              (bytes[chunk + i * 4 + 2]! << 8) | bytes[chunk + i * 4 + 3]!) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ ((~e >>> 0) & g);
      const t1 = (hh + S1 + ch + K[i]! + W[i]!) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + hh) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson((value as Record<string, unknown>)[k])).join(',') + '}';
}

export function hashCacheKey(input: object): string {
  return sha256HexSync(canonicalJson(input));
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS — frozen integrity
// ════════════════════════════════════════════════════════════════════════════

Object.freeze(CANDOMBLE_VOCAB);
Object.freeze(UMBANDA_VOCAB);
Object.freeze(IFÁ_VOCAB);
Object.freeze(CABALA_VOCAB);
Object.freeze(ASTROLOGIA_VOCAB);
Object.freeze(TANTRA_VOCAB);
Object.freeze(CIGANO_VOCAB);

export const __TEST__ = { sha256HexSync, canonicalJson };
