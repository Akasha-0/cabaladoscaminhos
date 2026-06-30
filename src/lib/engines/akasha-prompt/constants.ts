/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — AKASHA PROMPT CONTEXT BUILDER · CONSTANTS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Static data: 7-tradição catalog, system role template, sacred term
 * dictionary for NFD-normalized detection, default surgical rules.
 *
 * Cycle 70+ pattern: all collections Object.freeze'd on insert. Branded
 * ID regex factories.
 */

// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════

import type { Tradicao } from './types.ts';

// ════════════════════════════════════════════════════════════════════════════
// 7-TRADIÇÃO CATALOG
// ════════════════════════════════════════════════════════════════════════════

/**
 * Display labels for the 7 official traditions. The engine accepts BOTH the
 * lowercase slug (`Tradicao` type) and the capitalized display label.
 * Used by sacred-term normalization.
 */
export const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  cigano: 'Cigano',
  orixas: 'Orixás',
  astrologia: 'Astrologia',
  cabala: 'Cabala',
  numerologia: 'Numerologia',
  tantra: 'Tantra',
  tarot: 'Tarot',
});

/**
 * Slug order — used when listing traditions in the prompt header.
 * Cigano first (it's the surface layer), the rest in canonical order.
 */
export const TRADICAO_ORDER: ReadonlyArray<Tradicao> = Object.freeze([
  'cigano', 'astrologia', 'numerologia', 'orixas', 'cabala', 'tantra', 'tarot',
]);

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM ROLE — fixed persona string
// ════════════════════════════════════════════════════════════════════════════

/**
 * The default Akasha system role for the post-game chat. Surgical specificity
 * rules are baked into this prompt; the consulente sees only Akasha's reply,
 * never the system role itself.
 *
 * Why a fixed string? Because the Akasha persona evolves slowly (governance
 * docs/AI-PROMPT-base.md is the source of truth — W79 docs). Hardcoding
 * keeps the engine auditable: changing the persona requires a docs PR, not
 * a hot edit on a frontend prompt.
 */
export const DEFAULT_SYSTEM_ROLE: string = Object.freeze(`Você é Akasha, o oráculo-consulente da Cabala dos Caminhos.

Sua missão: responder perguntas sobre a leitura da Mesa Real do consulente com PRECISÃO CIRÚRGICA.

## REGRAS INVIOLÁVEIS

1. Baseie-se APENAS na leitura fornecida abaixo. Nunca invente cartas, Orixás, Odu, casas ou aspectos que não estejam lá.
2. Cite casas pelo número (ex: "Casa 8 — carta Cigano"). Cite cartas Ciganas pelo nome (Cavaleiro, Cigana, Estrela, Caixão...).
3. Cite Orixás e Odu pelo nome correto (Ogum, Oxóssi, Iansã, Exu, Oxalá; Odu Alafia, Odu Ogundá, Odu Ejiogbe...).
4. Quando a leitura mencionar posicionamento astrológico (ex: "Plutão em Escorpião na Casa 8"), cite-o pelo signo e planeta, sem parafrasear.
5. Se a pergunta não tiver resposta na leitura fornecida, diga exatamente: "Esta leitura não cobre essa dimensão" e sugira casas (por número) que poderiam esclarecer.
6. Não use conhecimento geral que não esteja fundamentado na leitura. Não invente dados de outros consulentes, sessões ou tradições.
7. Limite cada parágrafo a no máximo 240 caracteres. Resposta total máxima: 3 parágrafos.
8. Honre os termos sagrados da tradição citada. Não vulgarize Orixás, Odu, Sephirot, chakras. Se citar um termo sagrado, dê contexto mínimo de uma frase.`);

/**
 * The 7 sacred rules we ALWAYS include. These are the version-controlled
 * safety floor — even if the AI provider returns "I can't follow that",
 * our engine keeps them baked into the system role.
 */
export const SURGICAL_INSTRUCTION_RULES: ReadonlyArray<string> = Object.freeze([
  'Cite pelo menos 1 casa específica pelo número.',
  'Cite pelo menos 1 carta Cigana, Orixá, signo, planeta, Sephirah, Odu ou arcano pelo nome.',
  'Máximo 240 caracteres por parágrafo. Resposta total ≤ 3 parágrafos.',
  'Use linguagem acessível. Se usar jargão técnico (Sephirah, Odu, aspekt), explique em 1 frase.',
  'Honre os termos sagrados da tradição citada. Não vulgarize Orixás, Odu, Sephirot, nomes de arcanos.',
  'Se a leitura não cobre a pergunta, responda EXATAMENTE: "Esta leitura não cobre essa dimensão." e sugira 1-3 casas que poderiam esclarecer.',
  'Não invente dados. Se faltar informação, declare o gap explicitamente.',
]);

/**
 * Forma-specific additional rules — only fire when the consulente's
 * pergunta carries that forma tag.
 */
export const FORMA_INSTRUCTION_RULES: Readonly<Record<string, ReadonlyArray<string>>> = Object.freeze({
  conselho: Object.freeze([
    'Perguntas de conselho: termine com 1 sugestão prática de ação (ex: oração, banho, oferenda, leitura adicional), sem prescrever.',
  ]),
  previsao: Object.freeze([
    'Perguntas de previsão: indique SEMPRE que previsões não são fatalidades; são tendências. Use tempos verbais no futuro do presente ("pode", "tende a").',
  ]),
  explicacao: Object.freeze([
    'Perguntas de explicação: seja didático. Use a sequência "significa → por quê → exemplo da leitura".',
  ]),
  ritual: Object.freeze([
    'Perguntas sobre ritual: NUNCA prescreva ritual. Sugira consultar praticante da tradição (babalorixá, rabino, monge, terapeuta).',
  ]),
  alerta: Object.freeze([
    'Perguntas de alerta: acolha primeiro. Não minimize. Não dramatize. Aponte caminho, não julgamento.',
  ]),
});

// ════════════════════════════════════════════════════════════════════════════
// SACRED TERMS — NFD-normalized detection dictionary
// ════════════════════════════════════════════════════════════════════════════

/**
 * Sacred terms per tradition. Keys are NFD-normalized (diacritics removed)
 * so substring matching can compare apples to apples. The DETECTED terms
 * (the surfaced strings in the prompt) preserve original casing/accents.
 *
 * Why NFD normalization? Because accented characters (`ã`, `ç`, `í`) would
 * otherwise fail plain substring matching when the AI prompt or the
 * user message has them inconsistently cased or normalized. Cycle 81
 * NFD + diacritic-strip lesson: `findByText` and sacred-term matching
 * BOTH need the same normalization.
 */
type SacredDictionary = Readonly<Record<Tradicao, ReadonlyArray<string>>>;

export const SACRED_TERMS_BY_TRADICAO: SacredDictionary = Object.freeze({
  cigano: Object.freeze([
    'Cavaleiro', 'Cigana', 'Cigano', 'Trevo', 'Nave', 'Casa', 'Nuvem', 'Cobra',
    'Caixão', 'Buquê', 'Foice', 'Chicote', 'Pássaros', 'Criança', 'Cachorro',
    'Raposa', 'Urso', 'Estrela', 'Cegonha', 'Cachorro', 'Lua', 'Chave',
    'Peixes', 'Carta', 'Ramo', 'Sapo', 'Coração', 'Anel', 'Livro', 'Homem',
    'Mulher', 'Lírios', 'Sol', 'Torre', 'Estrela', 'Cruz', 'Barco',
  ]),
  orixas: Object.freeze([
    'Ogum', 'Oxóssi', 'Oxum', 'Iansã', 'Xangô', 'Iemanjá', 'Nanã', 'Exu',
    'Pomba Gira', 'Obaluaiê', 'Obaluaê', 'Logun Edé', 'Oxalá', 'Ewá',
    'Ibeji', 'Ogun', 'Ossãe', 'Oya', 'Yemanjá', 'Xango',
  ]),
  astrologia: Object.freeze([
    'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno',
    'Urano', 'Netuno', 'Plutão', 'Lilith', 'Quíron', 'Nodo Lunar',
    'Nodo Sul', 'Nodo Norte', 'Ascendente', 'Meio do Céu',
    'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra',
    'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
    'Casa 1', 'Casa 2', 'Casa 3', 'Casa 4', 'Casa 5', 'Casa 6',
    'Casa 7', 'Casa 8', 'Casa 9', 'Casa 10', 'Casa 11', 'Casa 12',
  ]),
  cabala: Object.freeze([
    'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Geburah', 'Tiphareth',
    'Netzach', 'Hod', 'Yesod', 'Malkuth', 'Sephirot', 'Árvore da Vida',
    'Daat', 'Ein Sof',
  ]),
  numerologia: Object.freeze([
    'Life Path', 'Caminho de Vida', 'Expression', 'Expressão', 'Soul Urge',
    'Desejo da Alma', 'Personal Year', 'Ano Pessoal', 'Master Number',
    'Número Mestre', '11', '22', '33', 'LifePath',
  ]),
  tantra: Object.freeze([
    'Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha',
    'Ajna', 'Sahasrara', 'Chakra', 'Kundalini', 'Prana', 'Apana',
    'Samana', 'Vyana', 'Udana', 'Nada', 'Bindu', 'Kundala',
    'Yoni', 'Lingam', 'Maithuna',
  ]),
  tarot: Object.freeze([
    'Mago', 'Sacerdotisa', 'Imperatriz', 'Imperador', 'Hierofante',
    'Amantes', 'Carruagem', 'Força', 'Eremita', 'Roda da Fortuna',
    'Justiça', 'Enforcado', 'Morte', 'Temperança', 'Diabo', 'Torre',
    'Estrela', 'Lua', 'Sol', 'Julgamento', 'Mundo',
    'Carta do Ano', 'Arcano Maior', 'Arcano Menor', 'Espadas', 'Copas',
    'Paus', 'Ouros',
  ]),
});

/**
 * Maximum sacred terms surfaced in the prompt. Beyond this number the
 * prompt grows noisy.
 */
export const MAX_SACRED_TERMS_SURFACED: number = 12;

// ════════════════════════════════════════════════════════════════════════════
// RELEVANCE SCORING CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/** Number of top-scoring casas to return BEFORE adding anchors. */
export const KEYWORD_TOP_N: number = 5;

/** Bonus added when a keyword appears in the `sintese` field. */
export const KEYWORD_BOOST_SINTESE: number = 2;
/** Bonus added when a keyword appears in a `contribuicao.rotulo`. */
export const KEYWORD_BOOST_ROTULO: number = 1;

// ════════════════════════════════════════════════════════════════════════════
// FORMATTING CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/** Header for the "RESUMO DA LEITURA" section in the assembled prompt. */
export const PROMPT_HEADER_LEITURA: string = '## RESUMO DA LEITURA';

/** Header for the "CASAS RELEVANTES PARA A PERGUNTA" section. */
export const PROMPT_HEADER_CASAS: string = '## CASAS RELEVANTES PARA A PERGUNTA';

/** Header for the "CONTEXTO DA CONVERSA" section. */
export const PROMPT_HEADER_HISTORICO: string = '## CONTEXTO DA CONVERSA';

/** Header for the "PERGUNTA ATUAL" section. */
export const PROMPT_HEADER_PERGUNTA: string = '## PERGUNTA ATUAL';

/** Header for the "TERMOS SAGRADOS A HONRAR" section. */
export const PROMPT_HEADER_SAGRADOS: string = '## TERMOS SAGRADOS A HONRAR';

/** Header for the "REGRAS" section. */
export const PROMPT_HEADER_REGRAS: string = '## REGRAS';

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════

/**
 * NFD-normalize a string for sacred-term matching:
 *   'Ogum' → 'Ogum'
 *   'Oxóssi' → 'Oxossi'  (so substring search across inputs matches)
 *   'Plutão' → 'Plutao'
 *
 * Used for BOTH the dictionary lookup AND the substring scan against
 * `pergunta.texto` + `casasRelevantes.sintese`. Cycle 81 lesson:
 * compare normalized-to-normalized.
 */
export function nfdNormalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Compact 4-char hex helper for cache-key fingerprinting inside the engine.
 * Not a security primitive — cycle 67 lesson: HMAC is for chains, not here.
 */
export function shortHex(n: number, width: number = 4): string {
  return n.toString(16).padStart(width, '0').slice(-width);
}
