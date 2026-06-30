// W73-B: Prompt Rotation Engine
// Daily spiritual prompts across 7 traditions + 9 archetypes
// Deterministic per (userId, date). Inline lunar phase via Meeus. No deps.

export type Tradition =
  | 'cigano'
  | 'orixas'
  | 'astrologia'
  | 'numerologia'
  | 'cabala'
  | 'tantra'
  | 'tarot';

export const TRADITIONS: Tradition[] = [
  'cigano',
  'orixas',
  'astrologia',
  'numerologia',
  'cabala',
  'tantra',
  'tarot',
];

export type Archetype =
  | 'morning'
  | 'midday'
  | 'evening'
  | 'night'
  | 'cycle-change'
  | 'retrograde'
  | 'eclipse'
  | 'full-moon'
  | 'new-moon';

export const ARCHETYPES: Archetype[] = [
  'morning',
  'midday',
  'evening',
  'night',
  'cycle-change',
  'retrograde',
  'eclipse',
  'full-moon',
  'new-moon',
];

export type Intensity = 'gentle' | 'moderate' | 'intense';

export type LunarPhaseName =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface LunarPhase {
  phase: LunarPhaseName;
  illumination: number; // 0..1
  ageDays: number; // 0..29.53
}

export interface DailyPrompt {
  id: string;
  tradition: Tradition;
  archetype: Archetype;
  body: string; // <= 280
  reflectionQuestion: string; // <= 200
  sacredSymbols: string[];
  sunSignHook: string | null;
  moonPhaseHook: LunarPhaseName | null;
  intensity: Intensity;
}

export interface UserContext {
  userId: string;
  timezone: string; // IANA, e.g. 'America/Sao_Paulo'
  locale: 'pt-BR' | 'en-US';
}

// ─────────────────────────────────────────────────────────────────────
// Sacred content bank — 56 prompts (8 per tradition × 7)
// ─────────────────────────────────────────────────────────────────────

interface SeedPrompt {
  tradition: Tradition;
  archetype: Archetype;
  body: string;
  reflectionQuestion: string;
  sacredSymbols: string[];
  sunSignHook?: string;
  moonPhaseHook?: LunarPhaseName;
}

const SEED_PROMPTS: SeedPrompt[] = [
  // ── CIGANO (8) ─────────────────────────────────────────────
  {
    tradition: 'cigano',
    archetype: 'morning',
    body: 'As cartas se abrem ao amanhecer. Que mensagem o Cigano traz hoje?',
    reflectionQuestion: 'Qual carta do Baralho Cigano visita seu amanhecer?',
    sacredSymbols: ['cavalo', 'sol', 'caminho'],
    moonPhaseHook: 'waxing-crescent',
  },
  {
    tradition: 'cigano',
    archetype: 'midday',
    body: 'O Cigano guia seus passos ao meio-dia. Qual direção puxa seu coração?',
    reflectionQuestion: 'Para onde sua intuição cigana aponta agora?',
    sacredSymbols: ['bússola', 'estrela', 'fogo'],
  },
  {
    tradition: 'cigano',
    archetype: 'evening',
    body: 'A lua cigana convida à partilha. Que história do dia pede voz?',
    reflectionQuestion: 'Qual história de hoje merece ser contada?',
    sacredSymbols: ['lua', 'viola', 'roda'],
    moonPhaseHook: 'full',
  },
  {
    tradition: 'cigano',
    archetype: 'night',
    body: 'Sob a tenda cigana, o invisível fala. O que seus sonhos sussurraram?',
    reflectionQuestion: 'O que o sono revelou sem pedir?',
    sacredSymbols: ['tenda', 'estrela-cadente', 'fumaça'],
  },
  {
    tradition: 'cigano',
    archetype: 'cycle-change',
    body: 'Os Ciganos sabem: tudo gira. Qual ciclo se encerra em você?',
    reflectionQuestion: 'Que capítulo pede fechamento?',
    sacredSymbols: ['roda', 'espelho', 'chave'],
  },
  {
    tradition: 'cigano',
    archetype: 'retrograde',
    body: 'Quando o Cigano se recolhe, o destino revisa. Que lição pede revisão?',
    reflectionQuestion: 'O que o destino está te pedindo para revisitar?',
    sacredSymbols: ['espelho', 'vela', 'espada'],
  },
  {
    tradition: 'cigano',
    archetype: 'full-moon',
    body: 'A lua cheia cigana clareia verdades. Qual delas você está pronto para ver?',
    reflectionQuestion: 'Qual verdade oculta está agora iluminada?',
    sacredSymbols: ['lua-cheia', 'cristal', 'fogo'],
    moonPhaseHook: 'full',
  },
  {
    tradition: 'cigano',
    archetype: 'new-moon',
    body: 'Na lua nova cigana, um pacto invisível se firma. Que intenção semente você planta?',
    reflectionQuestion: 'Que semente você enterra para nascer?',
    sacredSymbols: ['semente', 'terra', 'vela'],
    moonPhaseHook: 'new',
  },

  // ── ORIXÁS (8) ─────────────────────────────────────────────
  {
    tradition: 'orixas',
    archetype: 'morning',
    body: 'Oxalá sopra a brisa do amanhecer. Qual axé te acompanha?',
    reflectionQuestion: 'Que orixá abre caminho ao seu dia?',
    sacredSymbols: ['pomba-branca', 'vento', 'axé'],
  },
  {
    tradition: 'orixas',
    archetype: 'midday',
    body: 'Oxalá sopra a brisa do meio-dia. Qual axé te acompanha?',
    reflectionQuestion: 'Que orixá guia seus passos agora?',
    sacredSymbols: ['sol', 'paz', 'vento'],
  },
  {
    tradition: 'orixas',
    archetype: 'evening',
    body: 'Iansã rege os raios da tarde. Que batalha interior pede coragem?',
    reflectionQuestion: 'Onde você precisa de coragem agora?',
    sacredSymbols: ['raios', 'ventania', 'Iansã'],
  },
  {
    tradition: 'orixas',
    archetype: 'night',
    body: 'Nanã abriga as águas profundas da noite. O que a noite guarda em você?',
    reflectionQuestion: 'O que precisa repousar nas águas de Nanã?',
    sacredSymbols: ['águas-profundas', 'conchas', 'lua'],
  },
  {
    tradition: 'orixas',
    archetype: 'cycle-change',
    body: 'Oxóssi caça a próxima presa do ciclo. Que presa alimenta sua alma?',
    reflectionQuestion: 'Que alimento novo pede entrada?',
    sacredSymbols: ['arco', 'floresta', 'Oxóssi'],
  },
  {
    tradition: 'orixas',
    archetype: 'retrograde',
    body: 'Quando Ossanha se recolhe, as folhas mostram o caminho de volta. Que folha te orienta?',
    reflectionQuestion: 'Qual folha te guia de volta ao centro?',
    sacredSymbols: ['folhas', 'mato', 'Ossanha'],
  },
  {
    tradition: 'orixas',
    archetype: 'full-moon',
    body: 'Na lua cheia, Iemanjá ouve pedidos vindos do mar. Que pedido você entrega ao mar?',
    reflectionQuestion: 'O que você entrega ao mar nesta noite?',
    sacredSymbols: ['mar', 'Iemanjá', 'lua-cheia'],
    moonPhaseHook: 'full',
  },
  {
    tradition: 'orixas',
    archetype: 'new-moon',
    body: 'Na lua nova, Ogum afia a espada. Que intenção guerreira você plantou?',
    reflectionQuestion: 'Que batalha interna pede início?',
    sacredSymbols: ['espada', 'ferro', 'Ogum'],
    moonPhaseHook: 'new',
  },

  // ── ASTROLOGIA (8) ─────────────────────────────────────────
  {
    tradition: 'astrologia',
    archetype: 'morning',
    body: 'O Sol nasce pedindo presença. Qual planeta rege sua manhã?',
    reflectionQuestion: 'Que planeta signa seu dia?',
    sacredSymbols: ['sol', 'horizonte', 'ascendente'],
  },
  {
    tradition: 'astrologia',
    archetype: 'midday',
    body: 'O Meio-Céu ilumina seu propósito. Qual vocação pede voz ao meio-dia?',
    reflectionQuestion: 'O que seu Meio-Céu revela agora?',
    sacredSymbols: ['Meio-Céu', 'sol', 'vocação'],
  },
  {
    tradition: 'astrologia',
    archetype: 'evening',
    body: 'Vênus convida à introspecção. Que estrela guia seu crepúsculo?',
    reflectionQuestion: 'Qual beleza pede espaço no entardecer?',
    sacredSymbols: ['Vênus', 'crepúsculo', 'harmonia'],
  },
  {
    tradition: 'astrologia',
    archetype: 'night',
    body: 'A Sefirá da Noite revela o oculto. O que as estrelas te mostram?',
    reflectionQuestion: 'O que as estrelas sabem que você ainda não?',
    sacredSymbols: ['Plutão', 'escuridão', 'mapa'],
  },
  {
    tradition: 'astrologia',
    archetype: 'cycle-change',
    body: 'Júpiter amplia a visão. Que expansão o ciclo permite?',
    reflectionQuestion: 'Onde o crescimento te convida?',
    sacredSymbols: ['Júpiter', 'expansão', 'sabedoria'],
  },
  {
    tradition: 'astrologia',
    archetype: 'retrograde',
    body: 'Mercúrio retrogrado revisita conversas. Que palavra pede revisão?',
    reflectionQuestion: 'O que precisa ser dito de novo?',
    sacredSymbols: ['Mercúrio', 'retro', 'palavra'],
  },
  {
    tradition: 'astrologia',
    archetype: 'eclipse',
    body: 'O eclipse rasura destinos. Que página do seu mapa pede novo traço?',
    reflectionQuestion: 'O que precisa ser reescrito?',
    sacredSymbols: ['eclipse', 'nós-lunares', 'destino'],
  },
  {
    tradition: 'astrologia',
    archetype: 'full-moon',
    body: 'A lua cheia ativa sua Casa 8. Que transformação pede passagem?',
    reflectionQuestion: 'Que morte simbólica te liberta?',
    sacredSymbols: ['lua-cheia', 'Casa-8', 'transformação'],
    moonPhaseHook: 'full',
  },

  // ── NUMEROLOGIA (8) ────────────────────────────────────────
  {
    tradition: 'numerologia',
    archetype: 'morning',
    body: 'O número do dia vibra em você. Que caminho numerológico se abre?',
    reflectionQuestion: 'Que número rege sua manhã?',
    sacredSymbols: ['número-do-dia', 'vibração', 'caminho'],
  },
  {
    tradition: 'numerologia',
    archetype: 'midday',
    body: 'O número pessoal encontra sua expressão solar. Qual número te ativa agora?',
    reflectionQuestion: 'Qual número você sente pulsar?',
    sacredSymbols: ['expressão', 'número-pessoal', 'pulso'],
  },
  {
    tradition: 'numerologia',
    archetype: 'evening',
    body: 'A numerologia cava o sentido das horas. Que mensagem o entardecer codifica?',
    reflectionQuestion: 'O que o entardecer numera para você?',
    sacredSymbols: ['horas', 'arcano', 'letras'],
  },
  {
    tradition: 'numerologia',
    archetype: 'night',
    body: 'Sob a noite, o número mestre fala. Qual deles te visita?',
    reflectionQuestion: 'Qual número mestre te visita esta noite?',
    sacredSymbols: ['número-mestre', '11', '22', '33'],
  },
  {
    tradition: 'numerologia',
    archetype: 'cycle-change',
    body: 'O ano pessoal muda o tom. Qual ano novo pede início?',
    reflectionQuestion: 'Que ano-pessoal começa agora?',
    sacredSymbols: ['ano-pessoal', 'ciclo', 'novo'],
  },
  {
    tradition: 'numerologia',
    archetype: 'retrograde',
    body: 'Todo número tem sombra. Qual sombra sua pede atenção?',
    reflectionQuestion: 'Que número-sombra você evita?',
    sacredSymbols: ['sombra', 'kármico', 'lição'],
  },
  {
    tradition: 'numerologia',
    archetype: 'full-moon',
    body: 'A lua cheia potencializa o 11. Qual portal mestre se abre?',
    reflectionQuestion: 'Que iluminação o 11 traz hoje?',
    sacredSymbols: ['11', 'portal', 'intuição'],
    moonPhaseHook: 'full',
  },
  {
    tradition: 'numerologia',
    archetype: 'new-moon',
    body: 'Na lua nova, plante em potência de 9. Qual ciclo kármico inicia?',
    reflectionQuestion: 'Que semente numerológica você deposita?',
    sacredSymbols: ['9', 'semente', 'fim-ciclo'],
    moonPhaseHook: 'new',
  },

  // ── CABALA (8) ─────────────────────────────────────────────
  {
    tradition: 'cabala',
    archetype: 'morning',
    body: 'Kether pulsa no topo da Árvore. Qual centelha te acende?',
    reflectionQuestion: 'Onde mora a sua centelha hoje?',
    sacredSymbols: ['Kether', 'coroa', 'centelha'],
  },
  {
    tradition: 'cabala',
    archetype: 'midday',
    body: 'Tiphareth rege o sol interior. Que beleza sustenta sua verdade?',
    reflectionQuestion: 'Qual é a beleza que você sustenta?',
    sacredSymbols: ['Tiphareth', 'sol', 'verdade'],
  },
  {
    tradition: 'cabala',
    archetype: 'evening',
    body: 'Yesod guarda o sonho que se forma. Que imagem pede acolhida?',
    reflectionQuestion: 'Que imagem interna pede espaço?',
    sacredSymbols: ['Yesod', 'lua', 'sonho'],
  },
  {
    tradition: 'cabala',
    archetype: 'night',
    body: 'A Árvore da Vida revela o oculto. O que Malkuth te mostra na sombra?',
    reflectionQuestion: 'O que o mundo inferior te ensina?',
    sacredSymbols: ['Malkuth', 'raiz', 'sombra'],
  },
  {
    tradition: 'cabala',
    archetype: 'cycle-change',
    body: 'O nome divino se renova. Que nome novo pulsa em você?',
    reflectionQuestion: 'Que nome divino pulsa agora?',
    sacredSymbols: ['nome-divino', 'Tetragrammaton', 'renovação'],
  },
  {
    tradition: 'cabala',
    archetype: 'retrograde',
    body: 'O Caminho Retrocesso pede retorno. Qual Sefirá te chama de volta?',
    reflectionQuestion: 'Que caminho pede retrocesso consciente?',
    sacredSymbols: ['caminho-inverso', 'Binah', 'retorno'],
  },
  {
    tradition: 'cabala',
    archetype: 'eclipse',
    body: 'Da-Quiachol esconde a luz. Que véu do Santo Templo pede abertura?',
    reflectionQuestion: 'O que precisa ser revelado no Santo Templo?',
    sacredSymbols: ['Da-at', 'véu', 'Paroketh'],
  },
  {
    tradition: 'cabala',
    archetype: 'full-moon',
    body: 'Hod e Netzach se completam. Que equilíbrio entre mente e coração pulsa agora?',
    reflectionQuestion: 'Onde mente e coração se encontram?',
    sacredSymbols: ['Hod', 'Netzach', 'equilíbrio'],
    moonPhaseHook: 'full',
  },

  // ── TANTRA (8) ─────────────────────────────────────────────
  {
    tradition: 'tantra',
    archetype: 'morning',
    body: 'Muladhara desperta na raiz. Que segurança te ancora hoje?',
    reflectionQuestion: 'Onde está sua base hoje?',
    sacredSymbols: ['Muladhara', 'raiz', 'terra'],
  },
  {
    tradition: 'tantra',
    archetype: 'midday',
    body: 'Manipura queima o fogo do meio-dia. Que poder pessoal você acende?',
    reflectionQuestion: 'Que poder interno pede expressão?',
    sacredSymbols: ['Manipura', 'fogo', 'poder'],
  },
  {
    tradition: 'tantra',
    archetype: 'evening',
    body: 'O chacra do coração pulsa. Que energia shakti desperta?',
    reflectionQuestion: 'Que amor pede morada no coração?',
    sacredSymbols: ['Anahata', 'shakti', 'amor'],
  },
  {
    tradition: 'tantra',
    archetype: 'night',
    body: 'Sahasrara se abre no escuro. Que consciência cósmica te visita?',
    reflectionQuestion: 'O que se abre quando você se dissolve?',
    sacredSymbols: ['Sahasrara', 'lótus', 'consciência'],
  },
  {
    tradition: 'tantra',
    archetype: 'cycle-change',
    body: 'A Kundalini sobe quando o ciclo pede. Que ascensão começa?',
    reflectionQuestion: 'Que energia pede ascensão?',
    sacredSymbols: ['Kundalini', 'caduceu', 'subida'],
  },
  {
    tradition: 'tantra',
    archetype: 'retrograde',
    body: 'Quando os nadis se cruzam, o prana revisita caminhos. Que fluxo pede cura?',
    reflectionQuestion: 'Que fluxo interno precisa de cura?',
    sacredSymbols: ['Ida', 'Pingala', 'prana'],
  },
  {
    tradition: 'tantra',
    archetype: 'eclipse',
    body: 'Sob eclipse, o bindu se recolhe. Que semente sexual pede silêncio?',
    reflectionQuestion: 'O que a sua semente sexual guarda?',
    sacredSymbols: ['bindu', 'semente', 'silêncio'],
  },
  {
    tradition: 'tantra',
    archetype: 'full-moon',
    body: 'Sob a lua cheia, Shiva e Shakti se unem. Onde sua dualidade se dissolve?',
    reflectionQuestion: 'Onde masculino e feminino se abraçam?',
    sacredSymbols: ['Shiva', 'Shakti', 'união'],
    moonPhaseHook: 'full',
  },

  // ── TAROT (8) ──────────────────────────────────────────────
  {
    tradition: 'tarot',
    archetype: 'morning',
    body: 'O Louco começa a jornada. Que passo iniciático te chama?',
    reflectionQuestion: 'Que salto o Louco te convida a dar?',
    sacredSymbols: ['O-Louco', 'caminho', 'salto'],
  },
  {
    tradition: 'tarot',
    archetype: 'midday',
    body: 'O Mago segura seus quatro elementos. Que ferramenta você empunha agora?',
    reflectionQuestion: 'Qual ferramenta o Mago te entrega?',
    sacredSymbols: ['O-Mago', 'varinha', 'elementos'],
  },
  {
    tradition: 'tarot',
    archetype: 'evening',
    body: 'A Estrela ilumina o entardecer. Que esperança ainda é sua?',
    reflectionQuestion: 'Onde você ainda confia?',
    sacredSymbols: ['A-Estrela', 'água', 'esperança'],
  },
  {
    tradition: 'tarot',
    archetype: 'night',
    body: 'A Lua revela o invisível. Que medo pediu voz esta noite?',
    reflectionQuestion: 'Que medo te visita?',
    sacredSymbols: ['A-Lua', 'lobos', 'medo'],
  },
  {
    tradition: 'tarot',
    archetype: 'cycle-change',
    body: 'A Roda gira. Que roda gira agora na sua vida?',
    reflectionQuestion: 'O que sobe e o que desce?',
    sacredSymbols: ['A-Roda', 'ciclo', 'Sorte'],
  },
  {
    tradition: 'tarot',
    archetype: 'retrograde',
    body: 'O Eremita acende a lamparina do retorno. Que luz te guia de volta?',
    reflectionQuestion: 'O que precisa ser revisitado?',
    sacredSymbols: ['O-Eremita', 'lamparina', 'retorno'],
  },
  {
    tradition: 'tarot',
    archetype: 'full-moon',
    body: 'A Sacerdotisa abre o Véu. Que mistério pede revelação na lua cheia?',
    reflectionQuestion: 'O que está por trás do Véu?',
    sacredSymbols: ['A-Sacerdotisa', 'véu', 'mistério'],
    moonPhaseHook: 'full',
  },
  {
    tradition: 'tarot',
    archetype: 'new-moon',
    body: 'Os Arcanos pedem mudança. Qual Arcano Maior te visita hoje?',
    reflectionQuestion: 'Que mensagem do ArcanoMaior te acompanha?',
    sacredSymbols: ['ArcanoMaior', 'mensagem', 'Arcano-XXII'],
    moonPhaseHook: 'new',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Lunar phase via Meeus (no deps)
// Reference new moon: 2000-01-06 18:14 UTC (JD 2451550.26)
// Synodic month: 29.530588853 days
// ─────────────────────────────────────────────────────────────────────

const SYNODIC_MONTH = 29.530588853;
const REF_NEW_MOON_JD = 2451550.26; // 2000-01-06 18:14 UTC
const RETROGRADE_WINDOWS = [
  // Mercury retrograde windows (approximate — used only for intensity)
  { start: '2024-04-01', end: '2024-04-25' },
  { start: '2024-08-04', end: '2024-08-28' },
  { start: '2024-11-25', end: '2024-12-15' },
  { start: '2025-03-14', end: '2025-04-07' },
  { start: '2025-07-17', end: '2025-08-11' },
  { start: '2025-11-09', end: '2025-11-29' },
  { start: '2026-02-25', end: '2026-03-20' },
  { start: '2026-06-29', end: '2026-07-23' },
];

function dateToJD(d: Date): number {
  // Julian Day from UTC Date
  const Y = d.getUTCFullYear();
  const M = d.getUTCMonth() + 1;
  const D =
    d.getUTCDate() +
    (d.getUTCHours() +
      d.getUTCMinutes() / 60 +
      d.getUTCSeconds() / 3600) /
      24;
  let y = Y;
  let m = M;
  if (m <= 2) {
    y = y - 1;
    m = m + 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    D +
    B -
    1524.5
  );
}

export function lunarPhase(now: Date): LunarPhase {
  const jd = dateToJD(now);
  const daysSinceRef = jd - REF_NEW_MOON_JD;
  let age = ((daysSinceRef % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  // Phase is the illumination angle: 0 = new, 90 = first quarter, 180 = full, 270 = last quarter
  const phaseAngle = (age / SYNODIC_MONTH) * 360;
  let name: LunarPhaseName;
  if (age < 1.845) name = 'new';
  else if (age < 5.536) name = 'waxing-crescent';
  else if (age < 9.228) name = 'first-quarter';
  else if (age < 12.919) name = 'waxing-gibbous';
  else if (age < 16.610) name = 'full';
  else if (age < 20.302) name = 'waning-gibbous';
  else if (age < 23.993) name = 'last-quarter';
  else if (age < 27.684) name = 'waning-crescent';
  else name = 'new';
  // Illumination: (1 - cos(phaseAngle)) / 2
  const illumination = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2;
  return { phase: name, illumination, ageDays: age };
}

// ─────────────────────────────────────────────────────────────────────
// Deterministic hash: FNV-1a 32-bit
// ─────────────────────────────────────────────────────────────────────

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

// ─────────────────────────────────────────────────────────────────────
// Intensity: gentle/moderate/intense based on lunar phase + retrograde
// ─────────────────────────────────────────────────────────────────────

function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function determineIntensity(now: Date): Intensity {
  const lp = lunarPhase(now);
  const today = ymd(now);
  const isRetrograde = RETROGRADE_WINDOWS.some(
    (w) => today >= w.start && today <= w.end,
  );
  if (lp.phase === 'full' || lp.phase === 'new') {
    return 'intense';
  }
  if (isRetrograde || lp.phase === 'first-quarter' || lp.phase === 'last-quarter') {
    return 'moderate';
  }
  return 'gentle';
}

// ─────────────────────────────────────────────────────────────────────
// Tradition + archetype selection
// ─────────────────────────────────────────────────────────────────────

function selectTradition(userId: string, dateISO: string): Tradition {
  const h = fnv1a(`${userId}|${dateISO}|tradition`);
  return TRADITIONS[h % TRADITIONS.length]!;
}

function selectArchetypeForNow(now: Date): Archetype {
  const lp = lunarPhase(now);
  const hour = now.getUTCHours();
  // Eclipse / lunar events take priority
  if (lp.phase === 'full') return 'full-moon';
  if (lp.phase === 'new') return 'new-moon';
  // Retrograde (rough: check today)
  const today = ymd(now);
  if (RETROGRADE_WINDOWS.some((w) => today >= w.start && today <= w.end)) {
    return 'retrograde';
  }
  // Cycle change at month boundaries: day 28-31 or 1-2 of month
  const day = now.getUTCDate();
  if (day >= 28 || day <= 2) return 'cycle-change';
  // Otherwise time-of-day
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'midday';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function selectPromptIndex(
  userId: string,
  dateISO: string,
  tradition: Tradition,
  archetype: Archetype,
): number {
  const h = fnv1a(`${userId}|${dateISO}|${tradition}|${archetype}`);
  return h % SEED_PROMPTS.length;
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

function buildPrompt(seed: SeedPrompt, intensity: Intensity): DailyPrompt {
  return {
    id: `${seed.tradition}-${seed.archetype}-${fnv1a(seed.body).toString(36)}`,
    tradition: seed.tradition,
    archetype: seed.archetype,
    body: seed.body,
    reflectionQuestion: seed.reflectionQuestion,
    sacredSymbols: [...seed.sacredSymbols],
    sunSignHook: seed.sunSignHook ?? null,
    moonPhaseHook: seed.moonPhaseHook ?? null,
    intensity,
  };
}

export function getDailyPrompt(user: UserContext, now: Date): DailyPrompt {
  const dateISO = ymd(now);
  const tradition = selectTradition(user.userId, dateISO);
  const archetype = selectArchetypeForNow(now);
  const intensity = determineIntensity(now);

  // Try to find a seed matching both tradition + archetype
  let candidates = SEED_PROMPTS.filter(
    (p) => p.tradition === tradition && p.archetype === archetype,
  );
  if (candidates.length === 0) {
    candidates = SEED_PROMPTS.filter((p) => p.tradition === tradition);
  }
  if (candidates.length === 0) candidates = SEED_PROMPTS;
  const idx = selectPromptIndex(user.userId, dateISO, tradition, archetype);
  const seed = candidates[idx % candidates.length]!;
  return buildPrompt(seed, intensity);
}

export function getPromptByTradition(
  tradition: Tradition,
  archetype: Archetype,
): DailyPrompt {
  let candidates = SEED_PROMPTS.filter(
    (p) => p.tradition === tradition && p.archetype === archetype,
  );
  if (candidates.length === 0) {
    candidates = SEED_PROMPTS.filter((p) => p.tradition === tradition);
  }
  if (candidates.length === 0) candidates = SEED_PROMPTS;
  const seed = candidates[0]!;
  return buildPrompt(seed, 'moderate');
}

export function getWeeklyPromptSet(
  user: UserContext,
  weekStart: Date,
): DailyPrompt[] {
  const out: DailyPrompt[] = [];
  // Anchor the offset in user's userId so each user gets a different weekly rotation,
  // but guarantee all 7 traditions appear by indexing TRADITIONS directly (with offset).
  const offsetHash = fnv1a(`${user.userId}|weekstart|${ymd(weekStart)}`) % TRADITIONS.length;
  const archetypes: Archetype[] = [
    'morning',
    'midday',
    'evening',
    'night',
    'cycle-change',
    'full-moon',
    'new-moon',
  ];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 86400000);
    const dateISO = ymd(d);
    const tradition = TRADITIONS[(offsetHash + i) % TRADITIONS.length]!;
    const archetype = archetypes[i]!;
    const seed =
      SEED_PROMPTS.find(
        (p) => p.tradition === tradition && p.archetype === archetype,
      ) ?? SEED_PROMPTS.find((p) => p.tradition === tradition)!;
    out.push(buildPrompt(seed, determineIntensity(d)));
  }
  return out;
}

export function getMonthlyPromptCalendar(
  user: UserContext,
  monthStart: Date,
): Record<string, DailyPrompt> {
  const y = monthStart.getUTCFullYear();
  const m = monthStart.getUTCMonth();
  const daysInMonth = new Date(y, m + 1, 0).getUTCDate();
  const out: Record<string, DailyPrompt> = {};
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(y, m, day, 12, 0, 0));
    const prompt = getDailyPrompt(user, d);
    out[ymd(d)] = prompt;
  }
  return out;
}

export function getAvailableTraditions(): Tradition[] {
  return TRADITIONS.slice();
}

export function getAvailableArchetypes(): Archetype[] {
  return ARCHETYPES.slice();
}

// ─────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────

export function auditPromptRotation(): {
  tradition: Tradition;
  promptCount: number;
  archetypeCoverage: number;
}[] {
  return TRADITIONS.map((t) => {
    const seeds = SEED_PROMPTS.filter((p) => p.tradition === t);
    const archetypes = new Set(seeds.map((s) => s.archetype));
    return {
      tradition: t,
      promptCount: seeds.length,
      archetypeCoverage: archetypes.size,
    };
  });
}

export interface LunarAuditRow {
  date: string;
  expectedPhase: LunarPhaseName;
  computedPhase: LunarPhaseName;
  illumination: number;
  isCorrect: boolean;
}

export function auditLunarPhase(): LunarAuditRow[] {
  const fixtures: { date: string; expected: LunarPhaseName }[] = [
    { date: '2024-12-15', expected: 'full' },
    { date: '2024-12-30', expected: 'new' },
    { date: '2024-12-22', expected: 'last-quarter' },
    { date: '2024-12-08', expected: 'first-quarter' },
  ];
  return fixtures.map((f) => {
    const lp = lunarPhase(new Date(`${f.date}T12:00:00Z`));
    return {
      date: f.date,
      expectedPhase: f.expected,
      computedPhase: lp.phase,
      illumination: lp.illumination,
      isCorrect: lp.phase === f.expected,
    };
  });
}
