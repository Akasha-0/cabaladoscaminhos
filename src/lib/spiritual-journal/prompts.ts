// ============================================================================
// SPIRITUAL JOURNAL — prompts.ts (Wave 70, 2026-06-30)
// ============================================================================
// Daily prompts engine — 50+ curated spiritual reflection prompts organized
// by category, tradition, odu, element, and chakra.
//
// Complements:
//   - daily-reflection (W62) — daily check-in style
//   - dream-journal-engine (W67) — dream-specific capture
//   - spiritual-journal/journal.ts (W70) — general journal CRUD
//
// Design:
//   - PROMPTS is a frozen registry (Object.freeze) — pure data, immutable.
//   - getDailyPrompt selects a prompt based on UserState (currentOdu,
//     dominantElement, activeChakra, intention, locale).
//   - getRandomPrompt is deterministic via seeded RNG (cycle 60 lesson:
//     pure functions, no Math.random for testability).
//   - localizePrompt returns prompt text in pt-BR / en / es (3-locale floor,
//     same as w69 community-circles).
//
// Cycle 60/65/67 lessons applied:
//   - Sacred catalog coverage: 7 traditions (cycle 62 lesson 12)
//   - Pure deterministic seeded random (cycle 60 lesson)
//   - Branded types for prompts (cycle 65)
// ============================================================================

import type { Tradition, Element, Chakra, OduRef } from "./journal.ts";

// ============================================================================
// BRANDED TYPES
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type PromptId = Brand<string, "PromptId">;
export type Locale = "pt-BR" | "en" | "es";

export const LOCALES: readonly Locale[] = ["pt-BR", "en", "es"] as const;

export const asPromptId = (s: string): PromptId => s as PromptId;

// ============================================================================
// CATEGORIES (8 — covers reflection, gratitude, shadow-work, intention,
// release, vision, integration, gratitude extended)
// ============================================================================

export type PromptCategory =
  | "reflection"
  | "gratitude"
  | "shadow-work"
  | "intention"
  | "release"
  | "vision"
  | "integration"
  | "oracle";

export const PROMPT_CATEGORIES: readonly PromptCategory[] = [
  "reflection",
  "gratitude",
  "shadow-work",
  "intention",
  "release",
  "vision",
  "integration",
  "oracle",
] as const;

// ============================================================================
// PROMPT INTERFACE
// ============================================================================

export interface Prompt {
  readonly id: PromptId;
  /** Default text (pt-BR). */
  readonly text: string;
  readonly i18n: Readonly<Record<Locale, string>>;
  readonly tradition: Tradition | "universal";
  readonly category: PromptCategory;
  readonly oduRef?: OduRef;
  readonly chakra?: Chakra;
  readonly element?: Element;
}

// ============================================================================
// PROMPTS REGISTRY — 56 prompts across 7 traditions + universal
// ============================================================================

// Localized text helper — keeps registry concise.
const t = (pt: string, en: string, es: string): Readonly<Record<Locale, string>> =>
  Object.freeze({ "pt-BR": pt, en, es });

// Helper to build a prompt quickly.
const p = (
  id: string,
  text: string,
  i18n: Readonly<Record<Locale, string>>,
  tradition: Prompt["tradition"],
  category: PromptCategory,
  extras: Partial<Pick<Prompt, "oduRef" | "chakra" | "element">> = {},
): Prompt =>
  Object.freeze({
    id: asPromptId(id),
    text,
    i18n,
    tradition,
    category,
    ...extras,
  });

export const PROMPTS: readonly Prompt[] = Object.freeze([
  // ─── Universal (10) ──────────────────────────────────────────────────
  p("u-reflect-001", "O que seu coração precisa dizer hoje?", t("O que seu coração precisa dizer hoje?", "What does your heart need to say today?", "¿Qué necesita decir tu corazón hoy?"), "universal", "reflection"),
  p("u-grat-001", "Cite 3 coisas que te trouxeram paz nesta semana.", t("Cite 3 coisas que te trouxeram paz nesta semana.", "Name 3 things that brought you peace this week.", "Nombra 3 cosas que te trajeron paz esta semana."), "universal", "gratitude"),
  p("u-shadow-001", "Qual medo você está evitando encarar?", t("Qual medo você está evitando encarar?", "What fear are you avoiding facing?", "¿Qué miedo estás evitando enfrentar?"), "universal", "shadow-work"),
  p("u-int-001", "Qual intenção você planta para o dia de hoje?", t("Qual intenção você planta para o dia de hoje?", "What intention are you planting for today?", "¿Qué intención plantas para el día de hoy?"), "universal", "intention"),
  p("u-rel-001", "O que você precisa soltar para respirar mais leve?", t("O que você precisa soltar para respirar mais leve?", "What do you need to release to breathe lighter?", "¿Qué necesitas soltar para respirar más ligero?"), "universal", "release"),
  p("u-vis-001", "Descreva seu eu em 5 anos com riqueza de detalhes.", t("Descreva seu eu em 5 anos com riqueza de detalhes.", "Describe your self in 5 years in vivid detail.", "Describe tu yo en 5 años con detalles vívidos."), "universal", "vision"),
  p("u-integ-001", "Que parte de você pediu integração hoje?", t("Que parte de você pediu integração hoje?", "What part of you asked for integration today?", "¿Qué parte de ti pidió integración hoy?"), "universal", "integration"),
  p("u-oracle-001", "Se o universo sussurrasse uma verdade agora, qual seria?", t("Se o universo sussurrasse uma verdade agora, qual seria?", "If the universe whispered a truth now, what would it be?", "Si el universo susurrara una verdad ahora, ¿cuál sería?"), "universal", "oracle"),
  p("u-grat-002", "A quem você é grato hoje, e por quê?", t("A quem você é grato hoje, e por quê?", "Who are you grateful to today, and why?", "¿A quién estás agradecido hoy, y por qué?"), "universal", "gratitude"),
  p("u-reflect-002", "O que te fez perder a hora hoje?", t("O que te fez perder a hora hoje?", "What made you lose track of time today?", "¿Qué te hizo perder la hora hoy?"), "universal", "reflection"),

  // ─── Cigano (8) ─────────────────────────────────────────────────────
  p("c-mesa-001", "O que a Mesa Real está te mostrando hoje?", t("O que a Mesa Real está te mostrando hoje?", "What is the Mesa Real showing you today?", "¿Qué te muestra hoy la Mesa Real?"), "Cigano", "oracle"),
  p("c-ramiro-001", "Qual carta do Cigano Ramiro ressoa no seu momento atual?", t("Qual carta do Cigano Ramiro ressoa no seu momento atual?", "Which Cigano Ramiro card resonates with your current moment?", "¿Qué carta del Cigano Ramiro resuena con tu momento actual?"), "Cigano", "reflection"),
  p("c-cigana-001", "A Cigana te chama a olhar para qual área da vida?", t("A Cigana te chama a olhar para qual área da vida?", "The Cigana is calling you to look at which area of life?", "¿La Cigana te llama a mirar qué área de la vida?"), "Cigano", "intention"),
  p("c-mesa-002", "A carta que mais te assusta tem qual mensagem oculta?", t("A carta que mais te assusta tem qual mensagem oculta?", "The card that scares you most holds which hidden message?", "La carta que más te asusta tiene ¿qué mensaje oculto?"), "Cigano", "shadow-work"),
  p("c-ramiro-002", "Que limpeza o Cigano Ramiro sugere para você hoje?", t("Que limpeza o Cigano Ramiro sugere para você hoje?", "What cleansing does Cigano Ramiro suggest for you today?", "¿Qué limpieza sugiere el Cigano Ramiro para ti hoy?"), "Cigano", "release"),
  p("c-cigana-002", "O que a Guardiã das Cartas quer proteger em você?", t("O que a Guardiã das Cartas quer proteger em você?", "What does the Guardian of the Cards want to protect in you?", "¿Qué quiere proteger en ti la Guardiana de las Cartas?"), "Cigano", "integration"),
  p("c-mesa-003", "Qual combinação de cartas te marcou recentemente e por quê?", t("Qual combinação de cartas te marcou recentemente e por quê?", "Which combination of cards struck you recently and why?", "¿Qué combinación de cartas te marcó recientemente y por qué?"), "Cigano", "vision"),
  p("c-ramiro-003", "Onde você precisa de mais axé na sua prática cigana?", t("Onde você precisa de mais axé na sua prática cigana?", "Where do you need more axé in your cigano practice?", "¿Dónde necesitas más axé en tu práctica cigana?"), "Cigano", "gratitude"),

  // ─── Orixás (8) ─────────────────────────────────────────────────────
  p("o-oxala-001", "Oxalá te convida a qual paz interior hoje?", t("Oxalá te convida a qual paz interior hoje?", "Oxalá invites you to which inner peace today?", "Oxalá te invita a ¿qué paz interior hoy?"), "Orixás", "reflection"),
  p("o-ogum-001", "Onde Ogum te chama a empunhar a espada da verdade?", t("Onde Ogum te chama a empunhar a espada da verdade?", "Where does Ogum call you to wield the sword of truth?", "¿Dónde te llama Ogum a empuñar la espada de la verdad?"), "Orixás", "intention"),
  p("o-iansa-001", "Que ventos Iansã traz para sua vida neste momento?", t("Que ventos Iansã traz para sua vida neste momento?", "What winds does Iansã bring to your life now?", "¿Qué vientos trae Iansã a tu vida en este momento?"), "Orixás", "oracle"),
  p("o-oxum-001", "Oxum te pede qual gentileza com você mesmo?", t("Oxum te pede qual gentileza com você mesmo?", "Oxum asks you for which gentleness with yourself?", "Oxum te pide ¿qué gentileza contigo mismo?"), "Orixás", "integration"),
  p("o-xango-001", "Xangô traz qual justiça que você precisa aceitar?", t("Xangô traz qual justiça que você precisa aceitar?", "Which justice does Xangô bring that you need to accept?", "¿Qué justicia trae Xangô que necesitas aceptar?"), "Orixás", "shadow-work"),
  p("o-iemanja-001", "Iemanjá te chama a qual entrega profunda?", t("Iemanjá te chama a qual entrega profunda?", "Iemanjá calls you to which deep surrender?", "Iemanjá te llama a ¿qué entrega profunda?"), "Orixás", "release"),
  p("o-oxala-002", "Qual criação sua ainda precisa da bênção de Oxalá?", t("Qual criação sua ainda precisa da bênção de Oxalá?", "Which of your creations still needs Oxalá's blessing?", "¿Cuál de tus creaciones aún necesita la bendición de Oxalá?"), "Orixás", "vision"),
  p("o-ogum-002", "Que batalha interna Ogum te ajuda a vencer hoje?", t("Que batalha interna Ogum te ajuda a vencer hoje?", "Which inner battle does Ogum help you win today?", "¿Qué batalla interna te ayuda a ganar hoy Ogum?"), "Orixás", "integration"),

  // ─── Astrologia (8) ────────────────────────────────────────────────
  p("a-sol-001", "Onde seu Sol brilha mais livre esta semana?", t("Onde seu Sol brilha mais livre esta semana?", "Where does your Sun shine most freely this week?", "¿Dónde brilla tu Sol más libremente esta semana?"), "Astrologia", "reflection"),
  p("a-lua-001", "Que emoção sua Lua precisa que você honre hoje?", t("Que emoção sua Lua precisa que você honre hoje?", "Which emotion does your Moon need you to honor today?", "¿Qué emoción necesita tu Luna que honres hoy?"), "Astrologia", "reflection"),
  p("a-asc-001", "Como seu Ascendente te apresenta ao mundo neste ciclo?", t("Como seu Ascendente te apresenta ao mundo neste ciclo?", "How does your Ascendant present you to the world this cycle?", "¿Cómo te presenta tu Ascendente al mundo en este ciclo?"), "Astrologia", "intention"),
  p("a-mc-001", "Seu Meio-do-Céu aponta para qual vocação nova?", t("Seu Meio-do-Céu aponta para qual vocação nova?", "Your Midheaven points to which new vocation?", "Tu Medio-Cielo apunta a ¿qué nueva vocación?"), "Astrologia", "vision"),
  p("a-saturno-001", "Que lição Saturno te pede para integrar?", t("Que lição Saturno te pede para integrar?", "Which lesson does Saturn ask you to integrate?", "¿Qué lección te pide Saturno que integres?"), "Astrologia", "shadow-work"),
  p("a-jupiter-001", "Onde Júpiter expande sua generosidade?", t("Onde Júpiter expande sua generosidade?", "Where does Jupiter expand your generosity?", "¿Dónde expande Júpiter tu generosidad?"), "Astrologia", "gratitude"),
  p("a-plutao-001", "Que morte simbólica Plutão te pede para atravessar?", t("Que morte simbólica Plutão te pede para atravessar?", "Which symbolic death does Pluto ask you to cross?", "¿Qué muerte simbólica te pide Plutón que atravieses?"), "Astrologia", "release"),
  p("a-venus-001", "Que beleza Vênus te convida a cultivar?", t("Que beleza Vênus te convida a cultivar?", "Which beauty does Venus invite you to cultivate?", "¿Qué belleza te invita Venus a cultivar?"), "Astrologia", "integration"),

  // ─── Cabala (6) ────────────────────────────────────────────────────
  p("k-keter-001", "O que Kéter (a Coroa) sopra em seu ouvido hoje?", t("O que Kéter (a Coroa) sopra em seu ouvido hoje?", "What does Keter (the Crown) whisper in your ear today?", "¿Qué te susurra Kéter (la Corona) al oído hoy?"), "Cabala", "oracle"),
  p("k-tiferet-001", "Onde Tiferet (a Beleza) te convida a equilibrar opostos?", t("Onde Tiferet (a Beleza) te convida a equilibrar opostos?", "Where does Tiferet (Beauty) invite you to balance opposites?", "¿Dónde te invita Tiferet (la Belleza) a equilibrar opuestos?"), "Cabala", "integration"),
  p("k-binah-001", "Que compreensão profunda Biná te oferece agora?", t("Que compreensão profunda Biná te oferece agora?", "Which deep understanding does Binah offer you now?", "¿Qué comprensión profunda te ofrece Biná ahora?"), "Cabala", "reflection"),
  p("k-malkuth-001", "Malkuth (o Reino) te pede qual ação concreta hoje?", t("Malkuth (o Reino) te pede qual ação concreta hoje?", "Malkuth (the Kingdom) asks you for which concrete action today?", "Malkuth (el Reino) te pide ¿qué acción concreta hoy?"), "Cabala", "intention"),
  p("k-hod-001", "Hod (o Esplendor) quer iluminar qual área da sua mente?", t("Hod (o Esplendor) quer iluminar qual área da sua mente?", "Hod (Splendor) wants to illuminate which area of your mind?", "¿Hod (el Esplendor) quiere iluminar qué área de tu mente?"), "Cabala", "vision"),
  p("k-geburah-001", "Que força Geburah (o Poder) te ajuda a liberar?", t("Que força Geburah (o Poder) te ajuda a liberar?", "Which strength does Geburah (Power) help you release?", "¿Qué fuerza te ayuda Geburah (el Poder) a liberar?"), "Cabala", "release"),

  // ─── Numerologia (6) ───────────────────────────────────────────────
  p("n-1-001", "Número 1 — onde uma nova semente quer brotar em você?", t("Número 1 — onde uma nova semente quer brotar em você?", "Number 1 — where does a new seed want to sprout in you?", "Número 1 — ¿dónde quiere brotar una nueva semilla en ti?"), "Numerologia", "intention"),
  p("n-7-001", "Número 7 — qual verdade interior pede silêncio hoje?", t("Número 7 — qual verdade interior pede silêncio hoje?", "Number 7 — which inner truth asks for silence today?", "Número 7 — ¿qué verdad interior pide silencio hoy?"), "Numerologia", "reflection"),
  p("n-11-001", "Número 11 — onde sua intuição te guia sem explicação?", t("Número 11 — onde sua intuição te guia sem explicação?", "Number 11 — where does your intuition guide you without explanation?", "Número 11 — ¿dónde te guía tu intuición sin explicación?"), "Numerologia", "oracle"),
  p("n-22-001", "Número 22 (Mestre Construtor) — que obra maior você está edificando?", t("Número 22 (Mestre Construtor) — que obra maior você está edificando?", "Number 22 (Master Builder) — which greater work are you building?", "Número 22 (Maestro Constructor) — ¿qué obra mayor estás edificando?"), "Numerologia", "vision"),
  p("n-33-001", "Número 33 (Mestre Professor) — quem você pode guiar com amor hoje?", t("Número 33 (Mestre Professor) — quem você pode guiar com amor hoje?", "Number 33 (Master Teacher) — who can you guide with love today?", "Número 33 (Maestro Profesor) — ¿a quién puedes guiar con amor hoy?"), "Numerologia", "integration"),
  p("n-9-001", "Número 9 — o que você completa e celebra neste ciclo?", t("Número 9 — o que você completa e celebra neste ciclo?", "Number 9 — what do you complete and celebrate this cycle?", "Número 9 — ¿qué completas y celebras en este ciclo?"), "Numerologia", "gratitude"),

  // ─── Tantra (6) ────────────────────────────────────────────────────
  p("t-root-001", "Chakra Raiz — onde você precisa se sentir mais seguro?", t("Chakra Raiz — onde você precisa se sentir mais seguro?", "Root Chakra — where do you need to feel safer?", "Chakra Raíz — ¿dónde necesitas sentirte más seguro?"), "Tantra", "shadow-work"),
  p("t-sacral-001", "Chakra Sacral — qual criatividade pede passagem?", t("Chakra Sacral — qual criatividade pede passagem?", "Sacral Chakra — which creativity asks for passage?", "Chakra Sacral — ¿qué creatividad pide paso?"), "Tantra", "vision"),
  p("t-solar-001", "Chakra Solar — onde sua vontade precisa de claridade?", t("Chakra Solar — onde sua vontade precisa de claridade?", "Solar Plexus Chakra — where does your will need clarity?", "Chakra Solar — ¿dónde tu voluntad necesita claridad?"), "Tantra", "intention"),
  p("t-heart-001", "Chakra Cardíaco — quem ou o que te pede compaixão hoje?", t("Chakra Cardíaco — quem ou o que te pede compaixão hoje?", "Heart Chakra — who or what asks for your compassion today?", "Chakra Cardíaco — ¿quién o qué te pide compasión hoy?"), "Tantra", "gratitude"),
  p("t-throat-001", "Chakra Laríngeo — qual verdade sua pede voz?", t("Chakra Laríngeo — qual verdade sua pede voz?", "Throat Chakra — which truth of yours asks for voice?", "Chakra Laríngeo — ¿qué verdad tuya pide voz?"), "Tantra", "release"),
  p("t-crown-001", "Chakra Coroa — como você se conecta com o transcendente?", t("Chakra Coroa — como você se conecta com o transcendente?", "Crown Chakra — how do you connect with the transcendent?", "Chakra Corona — ¿cómo te conectas con lo trascendente?"), "Tantra", "oracle"),

  // ─── Tarot (6) ─────────────────────────────────────────────────────
  p("r-louco-001", "O Louco — que salto de fé seu coração pede?", t("O Louco — que salto de fé seu coração pede?", "The Fool — which leap of faith does your heart ask for?", "El Loco — ¿qué salto de fe pide tu corazón?"), "Tarot", "intention"),
  p("r-torre-001", "A Torre — qual estrutura precisa ruir para você renascer?", t("A Torre — qual estrutura precisa ruir para você renascer?", "The Tower — which structure must collapse for you to be reborn?", "La Torre — ¿qué estructura debe caer para que renazcas?"), "Tarot", "release"),
  p("r-morte-001", "A Morte — o que precisa morrer em você para que algo novo viva?", t("A Morte — o que precisa morrer em você para que algo novo viva?", "Death — what must die within you for something new to live?", "La Muerte — ¿qué necesita morir en ti para que algo nuevo viva?"), "Tarot", "shadow-work"),
  p("r-estrela-001", "A Estrela — qual esperança silenciosa te guia agora?", t("A Estrela — qual esperança silenciosa te guia agora?", "The Star — which silent hope guides you now?", "La Estrella — ¿qué esperanza silenciosa te guía ahora?"), "Tarot", "oracle"),
  p("r-sol-001", "O Sol — onde sua alegria merece brilhar sem medo?", t("O Sol — onde sua alegria merece brilhar sem medo?", "The Sun — where does your joy deserve to shine without fear?", "El Sol — ¿dónde merece brillar tu alegría sin miedo?"), "Tarot", "gratitude"),
  p("r-mundo-001", "O Mundo — qual ciclo se completa em você hoje?", t("O Mundo — qual ciclo se completa em você hoje?", "The World — which cycle completes in you today?", "El Mundo — ¿qué ciclo se completa en ti hoy?"), "Tarot", "integration"),
]);

export const PROMPPS = PROMPTS; // legacy alias (deprecated)

// ============================================================================
// USER STATE — drives getDailyPrompt
// ============================================================================

export interface UserState {
  readonly currentOdu?: OduRef;
  readonly dominantElement?: Element;
  readonly activeChakra?: Chakra;
  readonly intention?: "grounding" | "expansion" | "healing" | "discernment";
  readonly tradition?: Tradition;
  readonly locale?: Locale;
  readonly dayKey?: string; // YYYY-MM-DD for determinism
}

// ============================================================================
// DETERMINISTIC RNG — Pure seeded (cycle 60 lesson)
// ============================================================================

function seededRandom(seed: number): number {
  // xorshift32
  let x = seed | 0 || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 1_000_000) / 1_000_000;
}

function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// ============================================================================
// GET DAILY PROMPT — Picks best-matching prompt based on UserState
// ============================================================================

export function getDailyPrompt(
  userState: UserState,
  locale: Locale = "pt-BR",
): Prompt {
  // Filter by tradition/element/chakra preference if available.
  let candidates = PROMPTS.slice();
  if (userState.tradition) {
    const matchTrad = candidates.filter((p) => p.tradition === userState.tradition);
    if (matchTrad.length > 0) candidates = matchTrad;
  }
  if (userState.dominantElement) {
    const matchEl = candidates.filter((p) => p.element === userState.dominantElement);
    if (matchEl.length > 0) candidates = matchEl;
  }
  if (userState.activeChakra) {
    const matchCh = candidates.filter((p) => p.chakra === userState.activeChakra);
    if (matchCh.length > 0) candidates = matchCh;
  }
  // Deterministic pick by day key (or now).
  const seedSource = userState.dayKey ?? new Date().toISOString().slice(0, 10);
  const seed = hashString(seedSource + (userState.currentOdu ?? ""));
  const idx = Math.floor(seededRandom(seed) * candidates.length) % candidates.length;
  const chosen = candidates[idx];
  if (!chosen) {
    // Fallback (shouldn't happen unless PROMPTS is empty)
    const fallback = PROMPTS[0];
    if (!fallback) throw new PromptCatalogError("PROMPTS is empty");
    return fallback;
  }
  return chosen;
}

// ============================================================================
// GET PROMPTS BY CATEGORY / TRADITION
// ============================================================================

export function getPromptsByCategory(
  category: PromptCategory,
): readonly Prompt[] {
  return Object.freeze(PROMPTS.filter((p) => p.category === category));
}

export function getPromptsByTradition(
  tradition: Tradition,
): readonly Prompt[] {
  return Object.freeze(PROMPTS.filter((p) => p.tradition === tradition));
}

// ============================================================================
// GET RANDOM PROMPT — Deterministic by seed
// ============================================================================

export function getRandomPrompt(seed: number, locale: Locale = "pt-BR"): Prompt {
  const idx = Math.floor(seededRandom(seed) * PROMPTS.length) % PROMPTS.length;
  const chosen = PROMPTS[idx];
  if (!chosen) {
    const fallback = PROMPTS[0];
    if (!fallback) throw new PromptCatalogError("PROMPTS is empty");
    return fallback;
  }
  return chosen;
}

// ============================================================================
// LOCALIZE PROMPT
// ============================================================================

export function localizePrompt(promptId: PromptId, locale: Locale): string {
  const prompt = PROMPTS.find((p) => p.id === promptId);
  if (!prompt) throw new PromptNotFoundError(`Prompt ${promptId} not found`);
  return prompt.i18n[locale] ?? prompt.text;
}

// ============================================================================
// AUDIT — coverage check (cycle 62 lesson 12)
// ============================================================================

export interface PromptAudit {
  readonly totalPrompts: number;
  readonly byTradition: Readonly<Record<string, number>>;
  readonly byCategory: Readonly<Record<PromptCategory, number>>;
  readonly allHave3Locales: boolean;
  readonly allHaveCategory: boolean;
  readonly allHaveId: boolean;
}

export function auditPromptCatalog(): PromptAudit {
  const byTradition: Record<string, number> = {};
  const byCategory = {} as Record<PromptCategory, number>;
  for (const c of PROMPT_CATEGORIES) byCategory[c] = 0;
  for (const p of PROMPTS) {
    const k = p.tradition;
    byTradition[k] = (byTradition[k] ?? 0) + 1;
    byCategory[p.category] += 1;
  }
  let localesOk = true;
  for (const p of PROMPTS) {
    if (!p.i18n["pt-BR"] || !p.i18n.en || !p.i18n.es) {
      localesOk = false;
      break;
    }
  }
  let catsOk = true;
  for (const p of PROMPTS) {
    if (!PROMPT_CATEGORIES.includes(p.category)) {
      catsOk = false;
      break;
    }
  }
  return {
    totalPrompts: PROMPTS.length,
    byTradition: Object.freeze(byTradition),
    byCategory: Object.freeze(byCategory),
    allHave3Locales: localesOk,
    allHaveCategory: catsOk,
    allHaveId: PROMPTS.every((p) => typeof p.id === "string" && p.id.length > 0),
  };
}

// ============================================================================
// ERRORS
// ============================================================================

export class PromptCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptCatalogError";
  }
}

export class PromptNotFoundError extends PromptCatalogError {
  constructor(message: string) {
    super(message);
    this.name = "PromptNotFoundError";
  }
}