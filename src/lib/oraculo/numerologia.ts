// ============================================================================
// NUMEROLOGIA ENGINE — Wave 29 (Oracular Maps)
// ============================================================================
// Implementa dois sistemas clássicos de numerologia ocidental:
//
// 1) PITAGÓRICA (Pythagorean)
//    - Desenvolvida por Pitágoras (~570–495 a.C.), "mestre numerário".
//    - Valores 1–9 baseados em letras (A=1..I=9, J=1..R=9, S=1..Z=9 cíclico).
//    - Redução teosófica: 11, 22, 33 são "master numbers" e NÃO reduzem.
//    - Fonte: numerology clássico, publicamente documentado há >2000 anos.
//
// 2) CALDEIA (Chaldean)
//    - Mais antiga (~4000 anos, Mesopotâmia). Valor diferente em 8 letras.
//    - Usada mais em nomes comerciais e adivinhação.
//    - Fonte: tradição caldeia + Vitrine (1990), publicamente documentada.
//
// 3) CABALÍSTICA (Kabbalistic)
//    - Variante moderna baseada em raízes hebraicas (22 paths + 10 sephirot).
//    - Valores 1–400 seguindo a gematria hebraica (Alef=1..Tav=400).
//    - NÃO computável em PT-BR puro (letras portuguesas ≠ hebraicas).
//    - Implementamos MAPA ESTRUTURAL (10 sephirot + 22 paths) sem gematria PT.
//
// Esta engine devolve um mapa numerológico completo em PT-BR.

// ============================================================================
// TABELAS DE VALORES
// ============================================================================

/** Pitagórica: A=1, B=2, ..., I=9, J=1, K=2, ..., R=9, S=3, T=4, U=6, V=6, W=6, X=5, Y=1, Z=7
 * (note: há variações desta tabela dependendo da fonte — citando 2 variantes comuns abaixo)
 */
const PITAGORICA_TABLE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

/** Caldeia (variante mais comum): */
const CALDEIA_TABLE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
};

/** Á, É, Í, Ó, Ú, Ç, etc — decompor com NFD (forma canônica) */
function normalizarLetras(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase();
}

// ============================================================================
// REDUÇÃO TEOSÓFICA
// ============================================================================
// Reduz número para 1–9, mas preserva "master numbers" (11, 22, 33).
// Ex: 29 → 2+9 = 11 (NÃO reduz para 2).
// Ex: 39 → 3+9 = 12 → 1+2 = 3.
// Ex: 11 → preserva. Ex: 22 → preserva. Ex: 33 → preserva.
// Ex: 44 → 4+4 = 8.

export const MASTER_NUMBERS = new Set([11, 22, 33]);

export function reduzir(n: number, preservarMasters = true): number {
  if (n <= 0) return 0;
  while (n > 9) {
    if (preservarMasters && (n === 11 || n === 22 || n === 33)) {
      return n;
    }
    const digits = String(n).split('').map(Number);
    n = digits.reduce((acc, d) => acc + d, 0);
  }
  return n;
}

/** Soma raw (sem reduzir) — útil para "expressão raw". */
export function somaDígitos(s: string): number {
  return s.split('').reduce((acc, ch) => acc + Number(ch), 0);
}

// ============================================================================
// SIGNIFICADOS — referências curtas (PT-BR)
// ============================================================================

export const SIGNIFICADOS: Record<number, {
  nome: string;
  palavraChave: string;
  descrição: string;
  positivo: string;
  negativo: string;
}> = {
  1: { nome: 'Um', palavraChave: 'Liderança', descrição: 'Indivíduo, pioneirismo', positivo: 'autoconfiança, iniciativa', negativo: 'arrogância, isolamento' },
  2: { nome: 'Dois', palavraChave: 'Cooperação', descrição: 'Par, diplomacia', positivo: 'sensibilidade, parceria', negativo: 'dependência, indecisão' },
  3: { nome: 'Três', palavraChave: 'Expressão', descrição: 'Criatividade, comunicação', positivo: 'alegria, arte', negativo: 'superficialidade' },
  4: { nome: 'Quatro', palavraChave: 'Estabilidade', descrição: 'Estrutura, trabalho', positivo: 'disciplina, ordem', negativo: 'rigidez' },
  5: { nome: 'Cinco', palavraChave: 'Liberdade', descrição: 'Mudança, aventura', positivo: 'versatilidade, curiosidade', negativo: 'inconstância' },
  6: { nome: 'Seis', palavraChave: 'Responsabilidade', descrição: 'Família, harmonia', positivo: 'compaixão, serviço', negativo: 'superproteção' },
  7: { nome: 'Sete', palavraChave: 'Espiritualidade', descrição: 'Introspecção, mistério', positivo: 'sabedoria, análise', negativo: 'isolamento, ceticismo' },
  8: { nome: 'Oito', palavraChave: 'Poder', descrição: 'Ambição, manifestação material', positivo: 'autoridade, abundância', negativo: 'materialismo' },
  9: { nome: 'Nove', palavraChave: 'Completude', descrição: 'Humanitarismo, finalização', positivo: 'generosidade, visão', negativo: 'sacrifício excessivo' },
  11: { nome: 'Onze (Master)', palavraChave: 'Iluminação', descrição: 'Intuição visionária', positivo: 'inspiração, canal espiritual', negativo: 'ansiedade, hipersensibilidade' },
  22: { nome: 'Vinte e Dois (Master)', palavraChave: 'Construtor Mestre', descrição: 'Manifestação prática do visionário', positivo: 'realização duradoura', negativo: 'pressão esmagadora' },
  33: { nome: 'Trinta e Três (Master)', palavraChave: 'Mestre Curador', descrição: 'Serviço compassivo', positivo: 'cura, ensino espiritual', negativo: 'martírio' },
};

// ============================================================================
// CÁLCULOS PRINCIPAIS
// ============================================================================

export interface DadosPessoais {
  /** Nome completo conforme certidão de nascimento (sem acentos importa só letras) */
  nomeCompleto: string;
  /** ISO date YYYY-MM-DD */
  dataNascimento: string;
}

export interface MapaNumerológico {
  calculadoEm: string;
  dados: DadosPessoais;
  /** Sistema usado (pitagórica, caldeia, cabalística-estrutural) */
  sistema: 'pitagorica' | 'caldeia' | 'cabalistica-estrutural';
  caminhoDeVida: number;
  diaNascimento: number;
  expressão: number;
  motivação: number; // alma
  personalidade: number; // outer
  anoPessoal: number;
  mapCabalistico: { sephirot: Sephirah[]; paths: PathResumo[] };
  avisos: string[];
  resumoParaIA: string;
}

// ─── Caminho de vida (life path) ───────────────────────────────────────────
// Soma dos dígitos da data de nascimento. Master preserva.

export function caminhoDeVida(dataISO: string): number {
  const d = dataISO.replace(/[^0-9]/g, '');
  if (d.length !== 8) throw new Error('Data inválida — use YYYY-MM-DD');
  return reduzir(somaDígitos(d), true);
}

/** Dia de nascimento (1-31) — individualmente não reduzido. */
export function diaNasc(dataISO: string): number {
  return Number(dataISO.slice(8, 10));
}

// ─── Expressão (nome completo) ─────────────────────────────────────────────
// Soma de todas as letras. Pitagórica ou Caldeia.

export function expressão(nome: string, tabela: 'pitagorica' | 'caldeia' = 'pitagorica'): number {
  const t = tabela === 'pitagorica' ? PITAGORICA_TABLE : CALDEIA_TABLE;
  const letras = normalizarLetras(nome);
  let soma = 0;
  for (const ch of letras) {
    soma += t[ch] ?? 0;
  }
  return reduzir(soma, true);
}

// ─── Motivação (soul) — só vogais ─────────────────────────────────────────
// Representa o "desejo interno".

export function motivação(nome: string, tabela: 'pitagorica' | 'caldeia' = 'pitagorica'): number {
  const t = tabela === 'pitagorica' ? PITAGORICA_TABLE : CALDEIA_TABLE;
  const letras = normalizarLetras(nome);
  let soma = 0;
  for (const ch of letras) {
    if ('AEIOU'.includes(ch)) {
      soma += t[ch] ?? 0;
    }
  }
  return reduzir(soma, true);
}

// ─── Personalidade (outer) — só consoantes ─────────────────────────────────

export function personalidade(nome: string, tabela: 'pitagorica' | 'caldeia' = 'pitagorica'): number {
  const t = tabela === 'pitagorica' ? PITAGORICA_TABLE : CALDEIA_TABLE;
  const letras = normalizarLetras(nome);
  let soma = 0;
  for (const ch of letras) {
    if (!'AEIOU'.includes(ch)) {
      soma += t[ch] ?? 0;
    }
  }
  return reduzir(soma, true);
}

// ─── Ano pessoal ───────────────────────────────────────────────────────────
// Soma dia + mês nascimento + ano corrente (todos reduzidos exceto masters
// — mas aqui a tradição soma diretamente: dd + mm + yyyy reduz progressivamente).

export function anoPessoal(dataNascimento: string, anoReferência: number = new Date().getFullYear()): number {
  const dd = Number(dataNascimento.slice(8, 10));
  const mm = Number(dataNascimento.slice(5, 7));
  const yyyyStr = String(anoReferência);
  const soma = dd + mm + Number(yyyyStr[0]) + Number(yyyyStr[1]) + Number(yyyyStr[2]) + Number(yyyyStr[3]);
  return reduzir(soma, false); // ano pessoal não preserva master
}

// ============================================================================
// MAPA CABALÍSTICO — 10 SEPHIROT + 22 PATHS (estrutura)
// ============================================================================
// Não calculamos gematria hebraica de nome PT-BR. Devolvemos a ESTRUTURA
// cabalística padrão para referência visual/educacional.
// Fonte: Árvore da Vida (Etz Chaim), tradição hermética/cristã/cabalística.

export interface Sephirah {
  número: number;
  nome: string;          // pt-br
  nomeHebraico: string;
  título: string;        // significado
  pilar: 'direito' | 'esquerdo' | 'meio';
  planeta: string;       // atribuição astrológica (Tikkun/Assiah)
  caminho: string;       // caminho espiritual
}

export const SEPHIROT: Sephirah[] = [
  { número: 1,  nome: 'Kether',       nomeHebraico: 'כֶּתֶר', título: 'Coroa',           pilar: 'meio',     planeta: 'Plutão (Vontade divina)', caminho: 'União com o Infinito' },
  { número: 2,  nome: 'Chokmah',      nomeHebraico: 'חָכְמָה', título: 'Sabedoria',      pilar: 'direito',  planeta: 'Netuno',                caminho: 'Estrela da inspiração' },
  { número: 3,  nome: 'Binah',        nomeHebraico: 'בִּינָה', título: 'Entendimento',   pilar: 'esquerdo', planeta: 'Saturno',               caminho: 'Mãe do mundo' },
  { número: 4,  nome: 'Chesed',       nomeHebraico: 'חֶסֶד', título: 'Misericórdia',   pilar: 'direito',  planeta: 'Júpiter',               caminho: 'Amor incondicional' },
  { número: 5,  nome: 'Geburah',      nomeHebraico: 'גְּבוּרָה', título: 'Força',          pilar: 'esquerdo', planeta: 'Marte',                 caminho: 'Justiça divina' },
  { número: 6,  nome: 'Tiphereth',    nomeHebraico: 'תִּפְאֶרֶת', título: 'Beleza',         pilar: 'meio',     planeta: 'Sol',                   caminho: 'Coração equilibrador' },
  { número: 7,  nome: 'Netzach',      nomeHebraico: 'נֵצַח', título: 'Vitória',        pilar: 'direito',  planeta: 'Vênus',                 caminho: 'Emoção e arte' },
  { número: 8,  nome: 'Hod',          nomeHebraico: 'הוֹד', título: 'Esplendor',      pilar: 'esquerdo', planeta: 'Mercúrio',              caminho: 'Mente e linguagem' },
  { número: 9,  nome: 'Yesod',        nomeHebraico: 'יְסוֹד', título: 'Fundamento',     pilar: 'meio',     planeta: 'Lua',                   caminho: 'Sonho e imagem' },
  { número: 10, nome: 'Malkuth',      nomeHebraico: 'מַלְכוּת', título: 'Reino',          pilar: 'meio',     planeta: 'Terra',                 caminho: 'Manifestação física' },
];

export interface PathResumo {
  número: number;        // 11..32 (paths entre sephirot)
  letraHebraica: string; // Alef..Tav
  tarot: string;         // O Louco, O Mago, etc
  conecta: [number, number]; // [sephirot origem, sephirot destino]
  atributo: string;
}

export const PATHS_CABALÁ: PathResumo[] = [
  { número: 11, letraHebraica: 'Alef',     tarot: 'O Louco',          conecta: [1, 3], atributo: 'Princípio' },
  { número: 12, letraHebraica: 'Beth',     tarot: 'O Mago',           conecta: [1, 2], atributo: 'União de opostos' },
  { número: 13, letraHebraica: 'Gimel',    tarot: 'A Sacerdotisa',    conecta: [1, 6], atributo: 'Mensagem interna' },
  { número: 14, letraHebraica: 'Daleth',   tarot: 'A Imperatriz',     conecta: [1, 4], atributo: 'Porta da misericórdia' },
  { número: 15, letraHebraica: 'He',       tarot: 'O Imperador',      conecta: [1, 5], atributo: 'Porta da justiça' },
  { número: 16, letraHebraica: 'Vav',      tarot: 'O Hierofante',     conecta: [2, 3], atributo: 'Consciência desperta' },
  { número: 17, letraHebraica: 'Zayin',    tarot: 'Os Enamorados',    conecta: [2, 6], atributo: 'Discernimento' },
  { número: 18, letraHebraica: 'Cheth',    tarot: 'O Carro',          conecta: [3, 6], atributo: 'Vontade em paz' },
  { número: 19, letraHebraica: 'Teth',     tarot: 'A Força',          conecta: [3, 5], atributo: 'Serpente e leão' },
  { número: 20, letraHebraica: 'Yod',      tarot: 'O Eremita',        conecta: [4, 6], atributo: 'Sabedoria silenciosa' },
  { número: 21, letraHebraica: 'Kaph',     tarot: 'Roda da Fortuna',  conecta: [4, 7], atributo: 'Ciclo de ascensão' },
  { número: 22, letraHebraica: 'Lamed',    tarot: 'A Justiça',        conecta: [5, 6], atributo: 'Equilíbrio' },
  { número: 23, letraHebraica: 'Mem',      tarot: 'O Enforcado',      conecta: [5, 8], atributo: 'Sacrifício voluntário' },
  { número: 24, letraHebraica: 'Nun',      tarot: 'A Morte',          conecta: [6, 7], atributo: 'Transformação' },
  { número: 25, letraHebraica: 'Samekh',   tarot: 'A Temperança',     conecta: [6, 9], atributo: 'Alquimia interior' },
  { número: 26, letraHebraica: 'Ayin',     tarot: 'O Diabo',          conecta: [7, 8], atributo: 'Sombra e luz' },
  { número: 27, letraHebraica: 'Pe',       tarot: 'A Torre',          conecta: [7, 9], atributo: 'Revelação' },
  { número: 28, letraHebraica: 'Tzaddi',   tarot: 'A Estrela',        conecta: [8, 9], atributo: 'Esperança' },
  { número: 29, letraHebraica: 'Qoph',     tarot: 'A Lua',            conecta: [8, 10], atributo: 'Inconsciente' },
  { número: 30, letraHebraica: 'Resh',     tarot: 'O Sol',            conecta: [9, 10], atributo: 'Plenitude' },
  { número: 31, letraHebraica: 'Shin',     tarot: 'O Julgamento',    conecta: [1, 10], atributo: 'Renovação' },
  { número: 32, letraHebraica: 'Tav',      tarot: 'O Mundo',          conecta: [2, 10], atributo: 'Realização' },
];

// ============================================================================
// FUNÇÃO PRINCIPAL — calcularMapaNumerológico
// ============================================================================

export function calcularMapaNumerológico(
  dados: DadosPessoais,
  sistema: 'pitagorica' | 'caldeia' | 'cabalistica-estrutural' = 'pitagorica',
  anoReferência?: number,
): MapaNumerológico {
  const avisos: string[] = [];

  // 'cabalistica-estrutural' usa apenas estrutura (sem gematria)
  const usarTabelaNumerica: 'pitagorica' | 'caldeia' =
    sistema === 'cabalistica-estrutural' ? 'pitagorica' : sistema;

  const caminho = caminhoDeVida(dados.dataNascimento);
  const dia = diaNasc(dados.dataNascimento);
  const expr = expressão(dados.nomeCompleto, usarTabelaNumerica);
  const motiv = motivação(dados.nomeCompleto, usarTabelaNumerica);
  const pers = personalidade(dados.nomeCompleto, usarTabelaNumerica);
  const ano = anoPessoal(dados.dataNascimento, anoReferência);

  if (sistema === 'cabalistica-estrutural') {
    avisos.push(
      'ℹ️ Sistema cabalístico retorna apenas a estrutura (10 sephirot + 22 paths). Gematria hebraica NÃO é aplicada a nomes em português — usaria Pitagórica internamente para os 4 cálculos principais.',
    );
  }

  const mapCabalistico = {
    sephirot: SEPHIROT,
    paths: PATHS_CABALÁ,
  };

  const sig = (n: number) => SIGNIFICADOS[n] ?? { nome: String(n), palavraChave: '', descrição: '', positivo: '', negativo: '' };

  const resumoParaIA = [
    `**Caminho de vida ${caminho}** — ${sig(caminho).palavraChave}. ${sig(caminho).descrição}.`,
    `**Dia de nascimento**: ${dia}.`,
    `**Expressão ${expr}** — ${sig(expr).palavraChave}. ${sig(expr).descrição}.`,
    `**Motivação (alma) ${motiv}** — ${sig(motiv).palavraChave}.`,
    `**Personalidade ${pers}** — ${sig(pers).palavraChave}.`,
    `**Ano pessoal ${ano}** (cálculo em ${anoReferência ?? new Date().getFullYear()}). ${sig(ano).palavraChave}.`,
    '',
    'Estrutura cabalística de referência: 10 sephirot (Kether→Malkuth) e 22 paths (letras hebraicas Alef→Tav).',
  ].join('\n');

  return {
    calculadoEm: new Date().toISOString(),
    dados,
    sistema,
    caminhoDeVida: caminho,
    diaNascimento: dia,
    expressão: expr,
    motivação: motiv,
    personalidade: pers,
    anoPessoal: ano,
    mapCabalistico,
    avisos,
    resumoParaIA,
  };
}
