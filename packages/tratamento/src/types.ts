/**
 * @akasha/tratamento — Synthesis Engine: tipos públicos
 *
 * Define as estruturas de saída do motor de síntese. O motor recebe um
 * `PilarInput` (subset dos 7 Pilares calculado por `@akasha/core`) e
 * retorna um `SynthesisOutput` com 7 camadas terapêuticas em PT-BR +
 * cadeia de pensamento auditável (cada camada cita suas fontes do corpus).
 *
 * Estilo: therapeutic-holistic universalist. Sem termos proprietários
 * (Human Design, Gene Keys, BodyGraph). Ver ADR 0002 e o relatório
 * `.hermes/plans/research-medicina-tradicional-2026-06-23.md`.
 */

// ─── PilarInput (subset do AkashaLeitura) ────────────────────────────────────
//
// A síntese não depende de TODOS os campos de `AkashaLeitura`. Ela usa o
// subconjunto abaixo. Os campos são derivados por `@akasha/core` e podem
// ser `null` em caso de graceful degradation (engine ausente, dado
// incompleto). NUNCA inventar dados — ver Pilar 4 ethics invariant em
// `packages/akasha-core/AGENTS.md`.

export interface PilarInput {
  /** Pilar 1 — Cabala (Numerologia Cabalística). */
  cabala: {
    life_path: number;
    expression: number;
    motivation: number;
    impression: number;
  } | null;
  /** Pilar 2 — Astrologia. */
  astrologia: {
    sol_signo: string;
    lua_signo: string;
    lua_fase: 'nova' | 'crescente' | 'cheia' | 'minguante';
    asc_signo: string | null;
  } | null;
  /** Pilar 3 — Tantra. */
  tantrica: {
    corpo_predominante: number;
    trigemeo: 'fisico' | 'astral' | 'mental';
  } | null;
  /** Pilar 4 — Odu (Ifá/Candomblé). */
  odu: {
    odu_principal: string;
    odu_secundario: string | null;
    elemento: string;
    orixa: string;
  } | null;
  /** Pilar 5 — I Ching. */
  iching: {
    hexagrama_natal: number;
    hexagrama_dia: number;
  } | null;
  /** Pilar 6 — Mapa Energético Integrado (universalista). */
  pilar6: {
    tipo: string;
    estrategia: string;
    autoridade: string | null;
  } | null;
  /** Pilar 7 — Espectro de Transformação (universalista). */
  pilar7: {
    estagioAtual: 'sombra' | 'dom' | 'siddhi';
  } | null;
  /** Intenção livre declarada pela pessoa (campo do AkashaInput original). */
  intencao: string;
  /**
   * Sinais clínicos observados (respostas às 16 perguntas clínicas).
   * Cada string é uma palavra-frase: "mal", "3+ vezes", "padrão repetido".
   * Ver `packages/tratamento/src/textos/10-perguntas-clinicas/`.
   */
  sinais_clinicos?: string[];
}

// ─── TextSource (citação de fonte do corpus) ─────────────────────────────────

/**
 * Cada afirmação do motor de síntese aponta para uma fonte do corpus.
 * `path` é relativo à raiz do monorepo. `id` é o `id` do JSON.
 * `linha` aponta para a linha da research canônica.
 * `conteudo` é o texto-fonte (1-3 frases PT-BR) usado para gerar a síntese.
 */
export interface TextSource {
  /** Path relativo à raiz do monorepo, ex: 'packages/tratamento/src/textos/01-odu-preceitos/odu-01-ogbe-preceito-01.json' */
  path: string;
  /** ID canônico do arquivo JSON no corpus. */
  id: string;
  /** Linha da research canônica que originou o texto. */
  linha: number | null;
  /** Conteúdo-fonte PT-BR (1-3 frases) usado pelo motor. */
  conteudo: string;
}

// ─── Camada (saída de cada uma das 7 camadas) ────────────────────────────────

/**
 * Cada uma das 7 camadas terapêuticas. Conteúdo é PT-BR, 1-5 frases,
 * direto (sem rodeio), actionable. Se o motor não encontrar corpus
 * suficiente para a camada, `conteudo` fica `null` e `fontes` fica `[]`
 * — graceful degradation (ver R-030 §5, F-200).
 */
export interface Camada {
  /** ID canônico da camada: 'camada-1-diagnostico' ... 'camada-7-coaching'. */
  id: 'camada-1-diagnostico' | 'camada-2-praticas-imediatas' | 'camada-3-tratamento-por-area' | 'camada-4-quisilas' | 'camada-5-alinhamento-energetico' | 'camada-6-psicanalise' | 'camada-7-coaching';
  /** Título PT-BR da camada. */
  titulo: string;
  /** Conteúdo em PT-BR, 1-5 frases, direto, actionable. `null` se corpus ausente. */
  conteudo: string | null;
  /** Fontes do corpus usadas para gerar `conteudo`. `[]` se camada vazia. */
  fontes: TextSource[];
  /** Indica que esta camada requer revisão por profissional de saúde antes de uso. */
  requires_professional_review: boolean;
}

// ─── CadeiaPensamento (rastreabilidade da síntese) ───────────────────────────

/**
 * Cada passo do raciocínio que gerou a síntese. Permite auditoria
 * ("por que o motor disse X?") e debug. Sequência ordenada.
 */
export interface CadeiaPensamento {
  /** Número do passo (1-based). */
  step: number;
  /** Descrição PT-BR do que foi feito neste passo. */
  descricao: string;
  /** IDs das fontes do corpus consultadas neste passo. */
  fontes_usadas: string[];
}

// ─── SynthesisOutput (saída completa do motor) ───────────────────────────────

export interface SynthesisOutput {
  /** 7 camadas terapêuticas, sempre 7 chaves (graceful: `conteudo: null`). */
  camadas: {
    'camada-1-diagnostico': Camada;
    'camada-2-praticas-imediatas': Camada;
    'camada-3-tratamento-por-area': Camada;
    'camada-4-quisilas': Camada;
    'camada-5-alinhamento-energetico': Camada;
    'camada-6-psicanalise': Camada;
    'camada-7-coaching': Camada;
  };
  /** Cadeia de pensamento auditável (rastreabilidade). */
  cadeia_pensamento: CadeiaPensamento[];
  /** Versão do motor (semver). */
  versao: string;
  /** Disclaimer terapêutico padrão (NÃO substitui profissional). */
  disclaimer: string;
}

// ─── TextRecord (forma normalizada de cada arquivo do corpus) ────────────────

/**
 * Schema unificado dos 352 arquivos do corpus. Nem todo arquivo usa
 * todos os campos — campos opcionais refletem a variação real do corpus
 * (ver `packages/tratamento/src/textos/`). Indexado por `id`.
 */
export interface TextRecord {
  id: string;
  categoria:
    | 'preceito'
    | 'quisila'
    | 'oriquente'
    | 'orifrio'
    | 'chakra_pratica'
    | 'elemento_banho'
    | 'caminho_essencia'
    | 'caminho_sombra'
    | 'camada_prompt'
    | 'pergunta_clinica';
  odu?: string;
  orixa?: string;
  elemento?: string;
  chacra_referente?: string[];
  caminhos_afetados?: number[];
  camada_synthesis?: string[];
  padrao_orí?: 'quente' | 'frio';
  aspecto?: string;
  chacra?: string;
  chacra_numero?: number;
  tipo_pratica?: 'cristal' | 'banho' | 'erva' | 'respiracao' | 'movimento';
  nome_pratica?: string;
  como_aplicar?: string;
  nome_banho?: string;
  modo_preparo?: string;
  caminho_numero?: number;
  caminho_nome?: string;
  arquetipo_jung?: string;
  estilo_terapeutico?: string;
  camada_numero?: number;
  camada_nome?: string;
  prompt_template?: string;
  pergunta_numero?: number;
  grupo?: string;
  pergunta?: string;
  texto?: string;
  como_interpretar?: string;
  fontes?: string[];
  grounding?: Record<string, unknown>;
  alucinacao_score?: number;
  requires_professional_review?: boolean;
}

// ─── Corpus (map indexado por ID) ─────────────────────────────────────────────

/** Map<ID, TextRecord>. Lazy load pelo `corpus-loader.ts`. */
export type Corpus = Map<string, TextRecord>;

// ─── EngineOptions ────────────────────────────────────────────────────────────

/** Opções de geração. `maxFrases` limita tamanho do `conteudo` (1-5). */
export interface EngineOptions {
  /** Limite de frases por camada (default: 3, max: 5). 'Menos é mais' — Gabriel. */
  maxFrases?: number;
}

// ─── Áreas de tratamento (Camada 3) ──────────────────────────────────────────

export const AREAS_TRATAMENTO = [
  'saude',
  'relacao',
  'trabalho',
  'financas',
  'familia',
  'espiritualidade',
  'lazer',
  'sexualidade',
  'intelecto',
] as const;

export type AreaTratamento = (typeof AREAS_TRATAMENTO)[number];

// ─── Estilo terapêutico (Camada 7) ────────────────────────────────────────────

export type EstiloTerapeutico =
  | 'TCC (ativação comportamental)'
  | 'TCC (cognitiva)'
  | 'Logoterapia (sentido)'
  | 'Gestalt (aqui-e-agora)'
  | 'Psicanálise (insight)'
  | 'Humanista (autonomia)';
