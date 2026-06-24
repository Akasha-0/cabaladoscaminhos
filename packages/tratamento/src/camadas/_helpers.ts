/**
 * Helpers compartilhados pelas 7 camadas.
 *
 * Funções puras para: limitar frases, construir TextSource, formatar
 * PT-BR, normalizar elemento, detectar padr\u00e3o or\u00ed.
 */

import type { Camada, PilarInput, TextSource, TextRecord, Corpus } from '../types';

// ─── Limite de frases ────────────────────────────────────────────────────────

/**
 * Limita o conteúdo a `maxFrases` frases (default 3, max 5).
 * Frases são delimitadas por `.`, `?`, `!` seguidos de espaço ou fim.
 */
export function limitarFrases(texto: string, maxFrases: number): string {
  const cap = Math.max(1, Math.min(5, maxFrases));
  // Split em frases mantendo pontuação.
  const partes = texto.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
  if (!partes) return texto.trim();
  return partes.slice(0, cap).join('').trim();
}

// ─── Construção de TextSource ────────────────────────────────────────────────

/**
 * Converte um TextRecord em TextSource (path relativo + linha da research).
 */
export function recordParaSource(rec: TextRecord, relPath?: string): TextSource {
  const gr = (rec.grounding ?? {}) as Record<string, unknown>;
  // Linha pode estar em research_mtc_linha OU research_np_linha.
  const linha =
    typeof gr.research_mtc_linha === 'number'
      ? (gr.research_mtc_linha as number)
      : typeof gr.research_np_linha === 'number'
        ? (gr.research_np_linha as number)
        : null;

  // Conteúdo preferencial: `texto` (campo canônico) > prompt_template >
  // pergunta > como_aplicar > modo_preparo > como_interpretar.
  const conteudo =
    rec.texto ??
    rec.prompt_template ??
    rec.pergunta ??
    rec.como_aplicar ??
    rec.modo_preparo ??
    rec.como_interpretar ??
    '';

  return {
    path: relPath ?? `packages/tratamento/src/textos/`, // path genérico se não informado
    id: rec.id,
    linha,
    conteudo,
    // Wave 7.4 A.2: surface arquetipo_jung + estilo_terapeutico quando existirem
    // (campos opcionais em TextRecord → opcionais em TextSource → renderizados
    // como badges no CamadaCard se a camada os usar)
    arquetipo_jung: rec.arquetipo_jung,
    estilo_terapeutico: rec.estilo_terapeutico,
  };
}

// ─── Busca filtrada no corpus ────────────────────────────────────────────────

/**
 * Filtra corpus por categoria canônica.
 */
export function buscarPorCategoria(
  corpus: Corpus,
  categoria: TextRecord['categoria']
): TextRecord[] {
  const out: TextRecord[] = [];
  for (const rec of corpus.values()) {
    if (rec.categoria === categoria) out.push(rec);
  }
  return out;
}

/**
 * Filtra corpus por Odu (ex: 'Ogbe (1)').
 */
export function buscarPorOdu(corpus: Corpus, odu: string): TextRecord[] {
  const out: TextRecord[] = [];
  for (const rec of corpus.values()) {
    if (rec.odu === odu) out.push(rec);
  }
  return out;
}

/**
 * Filtra corpus por elemento (Fogo/Água/Terra/Ar).
 */
export function buscarPorElemento(
  corpus: Corpus,
  elemento: string
): TextRecord[] {
  const out: TextRecord[] = [];
  const elemNorm = normalizarElemento(elemento);
  for (const rec of corpus.values()) {
    if (rec.elemento && normalizarElemento(rec.elemento).includes(elemNorm)) {
      out.push(rec);
    }
  }
  return out;
}

/**
 * Normaliza elemento PT-BR: minúsculas, sem acento, com '+' tratado.
 */
export function normalizarElemento(e: string): string {
  return e
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

/**
 * Filtra corpus por chácra (case-insensitive, substring).
 */
export function buscarPorChacra(corpus: Corpus, chacra: string): TextRecord[] {
  const out: TextRecord[] = [];
  const cNorm = chacra.toLowerCase();
  for (const rec of corpus.values()) {
    if (rec.chacra && rec.chacra.toLowerCase().includes(cNorm)) {
      out.push(rec);
    }
  }
  return out;
}

// ─── Detecção de padrões emocionais (Wave 7.4 — Front A.1) ──────────────────

/**
 * Padrões emocionais detectados a partir de respostas livres + intenção.
 * Cada padrão é uma chave semântica + lista de palavras-gatilho PT-BR
 * (normalizadas: minúsculas, sem acento). Mantemos o conjunto enxuto
 * para evitar falsos positivos — ver ADR 0002 (sem termos proprietários).
 */
export const PADROES_EMOCIONAIS: ReadonlyArray<{
  nome: string;
  palavras: ReadonlyArray<string>;
}> = [
  {
    nome: 'conflito parental',
    palavras: ['pai', 'mae', 'familia', 'pais', 'mae.', 'pai.'],
  },
  {
    nome: 'ansiedade',
    palavras: ['ansiedade', 'medo', 'panico', 'inquieta', 'nervosa', 'nervoso'],
  },
  {
    nome: 'relacionamento',
    palavras: ['parceiro', 'parceira', 'namorado', 'namorada', 'casamento', 'relacionamento', 'esposo', 'esposa', 'amor'],
  },
  {
    nome: 'trabalho',
    palavras: ['trabalho', 'chefe', 'emprego', 'carreira', 'colega', 'empresa'],
  },
  {
    nome: 'identidade',
    palavras: ['quem sou', 'sentido', 'proposito', 'proposta', 'identidade', 'autoconhecimento'],
  },
];

/**
 * Detecta padrões emocionais a partir das respostas livres às perguntas
 * clínicas e da intenção declarada. Normalização: lowercase + remoção
 * de acentos. Match por substring (palavra contida no texto).
 *
 * Retorna array único (sem duplicatas) de nomes de padrão. Vazio se
 * nenhum match (graceful).
 */
export function detectarPadroesEmocionais(
  respostas: ReadonlyArray<{ resposta: string }> | undefined,
  intencao: string | undefined
): string[] {
  const partes: string[] = [];
  for (const r of respostas ?? []) {
    if (r?.resposta) partes.push(String(r.resposta));
  }
  if (intencao) partes.push(String(intencao));
  if (partes.length === 0) return [];

  const corpus = partes.join(' ').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

  const detectados = new Set<string>();
  for (const { nome, palavras } of PADROES_EMOCIONAIS) {
    for (const p of palavras) {
      if (corpus.includes(p)) {
        detectados.add(nome);
        break;
      }
    }
  }
  return Array.from(detectados);
}

// ─── Detecção de padrão orí ──────────────────────────────────────────────────

/**
 * Detecta padrão orí (quente/frio) a partir do Pilar 4 + sinais clínicos.
 * Heurística simples baseada no Odu (1,3,5,7,9,11,13,15 → quente canônico;
 * 2,4,6,8,10,12,14,16 → frio) + match com arquivos oriquente/orifrio do
 * corpus para o Odu do Pilar 4.
 *
 * Retorna `null` se nenhum sinal for encontrado (graceful).
 */
export function detectarPadraoOri(
  input: PilarInput,
  corpus: Corpus
): 'quente' | 'frio' | null {
  const oduPrincipal = input.odu?.odu_principal;
  if (!oduPrincipal) return null;

  // 1) Procura corpus para este Odu e checa match por camada_synthesis.
  for (const rec of corpus.values()) {
    if (
      rec.odu === oduPrincipal &&
      (rec.categoria === 'oriquente' || rec.categoria === 'orifrio') &&
      rec.padrao_orí
    ) {
      return rec.padrao_orí;
    }
  }

  // 2) Fallback por número do Odu (canônico).
  const match = oduPrincipal.match(/\((\d+)\)/);
  if (match) {
    const n = parseInt(match[1], 10);
    return n % 2 === 1 ? 'quente' : 'frio';
  }
  return null;
}

// ─── Identificação de chácra dominante ───────────────────────────────────────

/**
 * Identifica chácra(s) dominante(s) a partir do Pilar 3 (corpo_predominante)
 * + Pilar 6 (tipo/autoridade) + chácras referidas no Odu do Pilar 4.
 *
 * Retorna array de nomes de chácra (1-3 itens). Vazio se nenhum sinal.
 */
export function identificarChacrasDominantes(
  input: PilarInput,
  corpus: Corpus
): string[] {
  const out = new Set<string>();

  // Pilar 3 — corpo_predominante 1-11 → chácra:
  // 1=Raiz, 2=Sacral, 3=Plexo Solar, 4=Cardíaco, 5=Laríngeo,
  // 6=Terceiro Olho, 7=Coronário. 8-11 → todos (11 corpos, 7 chácras).
  const corpo = input.tantrica?.corpo_predominante;
  if (corpo && corpo >= 1 && corpo <= 7) {
    const mapa: Record<number, string> = {
      1: 'Raiz (Muladhara)',
      2: 'Sacral (Svadhisthana)',
      3: 'Plexo Solar (Manipura)',
      4: 'Cardíaco (Anahata)',
      5: 'Laríngeo (Vishuddha)',
      6: 'Terceiro Olho (Ajna)',
      7: 'Coronário (Sahasrara)',
    };
    const c = mapa[corpo];
    if (c) out.add(c);
  }

  // Pilar 4 — chácra_referente dos preceitos deste Odu.
  const oduPrincipal = input.odu?.odu_principal;
  if (oduPrincipal) {
    for (const rec of corpus.values()) {
      if (
        rec.odu === oduPrincipal &&
        rec.categoria === 'preceito' &&
        Array.isArray(rec.chacra_referente)
      ) {
        for (const c of rec.chacra_referente) out.add(c);
      }
    }
  }

  return Array.from(out);
}

// ─── Mapeamento de intenção → área de tratamento (Camada 3) ──────────────────

const MAPA_INTENCAO_AREA: Array<{ regex: RegExp; area: import('../types').AreaTratamento }> = [
  { regex: /\b(saude|saúde|doen[cç]a|corpo|fadiga|energia baixa)\b/i, area: 'saude' },
  { regex: /\b(relacion|parceria|casamento|namoro|amigo|afeto|amor)\b/i, area: 'relacao' },
  { regex: /\b(trabalho|carreira|emprego|chefia|colega)\b/i, area: 'trabalho' },
  { regex: /\b(financ|d[ií]vida|grana|dinheiro|economia)\b/i, area: 'financas' },
  { regex: /\b(fam[ií]lia|m[ãa]e|pai|irm[ãa]o|filho|av[óo])\b/i, area: 'familia' },
  { regex: /\b(espiritual|orov[áa]|medita[cç][ãa]o|conex[ãa]o|miss[ãa]o)\b/i, area: 'espiritualidade' },
  { regex: /\b(lazer|f[ée]rias|hobby|descanso|divers[ãa]o)\b/i, area: 'lazer' },
  { regex: /\b(sexual|l[ií]bido|libido|intimidade|er[óo]tica|desejo)\b/i, area: 'sexualidade' },
  { regex: /\b(intelect|estudo|curso|leitura|aprendizado|foco mental)\b/i, area: 'intelecto' },
];

/**
 * Identifica 1-3 áreas de tratamento a partir da intenção livre e dos
 * sinais clínicos. Retorna lista única de áreas (sem duplicatas).
 */
export function identificarAreas(intencao: string, sinais: string[] | undefined): import('../types').AreaTratamento[] {
  const texto = [intencao, ...(sinais ?? [])].join(' ');
  const out = new Set<import('../types').AreaTratamento>();
  for (const { regex, area } of MAPA_INTENCAO_AREA) {
    if (regex.test(texto)) out.add(area);
    if (out.size >= 3) break;
  }
  // Default: se nada foi detectado, área mais comum = 'saude'.
  if (out.size === 0) out.add('saude');
  return Array.from(out);
}

// ─── Constroi Camada vazia (graceful) ────────────────────────────────────────

/** Retorna Camada com `conteudo: null` e `fontes: []`. */
export function camadaVazia(id: Camada['id'], titulo: string): Camada {
  return {
    id,
    titulo,
    conteudo: null,
    fontes: [],
    requires_professional_review: false,
  };
}

/** Junta N TextSources em uma string PT-BR curta, 1-5 frases. */
export function juntarTextos(sources: TextSource[], maxFrases: number): string {
  const cap = Math.max(1, Math.min(5, maxFrases));
  const frases = sources
    .map((s) => s.conteudo.trim())
    .filter(Boolean)
    .map((s) => {
      // Garante terminação com pontuação.
      if (!/[.!?]$/.test(s)) return s + '.';
      return s;
    });
  const uniq = Array.from(new Set(frases));
  return uniq.slice(0, cap).join(' ');
}
