/**
 * @akasha/core-pilar7 — Tipos canonicos do Pilar 7 (Espectro de Transformacao)
 *
 * Este pacote NAO depende de framework. Apenas tipos e logica pura.
 * A integracao com o schema Prisma (Pilar7Calculo, Pilar7Estagio) acontece
 * na camada de aplicacao (apps/akasha-portal/), nao aqui.
 *
 * Convencoes:
 * - PT-BR em todos os comentarios e nomes publicos.
 * - Termos Sombra/Dom/Siddhi sao genericos (dominio publico), aceitos pelo ADR 0002.
 * - Os 64 numeros sao sinonimos dos 64 hexagramas King Wen (Pilar 5 / I Ching).
 */

/**
 * Os 3 estagios do Espectro de Transformacao.
 *
 * - `sombra`  — o padrao que aprisiona; aquilo que precisa ser visto e transmutado.
 * - `dom`     — a qualidade cultivada; o que brilha quando a sombra e atravessada.
 * - `siddhi`  — a transcendencia; o estado raro em que o dom se dissolve em sabedoria.
 *
 * Inspirado no espectro tripartido da tradicao contemplativa antiga.
 * NAO copiar do sistema comercial "Shadow/Gift/Siddhi" — esses termos estao
 * renomeados para PT-BR (Guardrail 1 do ADR 0002).
 */
export type EstagioTransformacao = 'sombra' | 'dom' | 'siddhi';

/**
 * As 4 fases de vida (derivadas da cronologia humana basica + Pilar 4 Odu).
 *
 * Pilar 4 (Odu) tem informacao sobre estagio de vida do consulente
 * (criança, jovem, adulto, ancião). Quando o Pilar 4 nao esta
 * disponivel (opt-out), usamos a heuristica de idade:
 *
 * - `infancia` (0-12): aprendizado, formacao do corpo sutil
 * - `juventude` (13-29): formacao da identidade, provacao
 * - `maturidade` (30-59): construcao, disseminacao
 * - `sabedoria` (60+): integracao, transmissao
 *
 * Esta heuristica e deliberadamente simples (Wave 4). Wave 5+ pode
 * incorporar elementos do Pilar 4 (Odu, Ano de Nascimento) para
 * refinar a deteccao.
 */
export type FaseVida = 'infancia' | 'juventude' | 'maturidade' | 'sabedoria';

/**
 * Representacao minima da saida do Pilar 5 (I Ching) necessaria para
 * o Pilar 7. NAO duplicamos `IChingMap` — aceitamos um subset.
 *
 * Quando o Pilar 5 retorna `hexagramNumber: null` (opt-in nao ativado
 * ou erro), Pilar 7 propaga o estado neutro (`chaveNatal: null`,
 * `estagioAtual: 'sombra'`).
 */
export interface IChingData {
  /** Numero King Wen (1-64) ou null se Pilar 5 nao calculou. */
  hexagramNumber: number | null;
  /** Nome do hexagrama em PT-BR (para exibicao). */
  hexagramName: string | null;
  /** Nome chines (pinyin) do hexagrama, opcional. */
  hexagramChineseName?: string | null;
}

/**
 * Chave de Transformacao (1-64).
 *
 * Cada chave corresponde 1:1 a um hexagrama King Wen (Pilar 5).
 * O `nome` aqui e um NOME UNIVERSALISTA (escolhido para o Pilar 7),
 * NAO o nome PT-BR do hexagrama. Sao textos proprios, nao copias.
 */
export interface ChaveNatal {
  /** Numero 1-64 (= hexagrama King Wen). */
  numero: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64;
  /** Nome universalista da chave (original Pilar 7). */
  nome: string;
  /** Glifo/caractere (referencia ao ideograma chines do hexagrama). */
  glifo: string;
  /** Nome do hexagrama I Ching de origem (sinergia Pilar 5). */
  hexagramaOrigem: string;
  /** Nome chines do hexagrama de origem (pinyin). */
  hexagramaOrigemChines: string;
}

/**
 * Entrada da Sequence Venusiana (22 chaves).
 *
 * A Sequence Venusiana captura um arco de transformacao pessoal
 * (relacionamentos, criatividade, prosperidade). 22 chaves formam o
 * ciclo. Sao chaves reais (1-64), em ordem algoritmica derivada do
 * Pilar 5 + Pilar 6.
 */
export interface SequenceVenusiana {
  /** Posicao 1-22 dentro da Sequence. */
  posicao: number;
  /** Chave nesta posicao (1-64). */
  chave: ChaveNatal;
  /** Tema/titulo curto da posicao (universalista, nao copia). */
  tema: string;
}

/**
 * Entrada do Caminho Dourado (11 chaves).
 *
 * O Caminho Dourado e o arco de integracao entre Sombra/Dom/Siddhi
 * ao longo da vida. 11 chaves formam o caminho. Sao chaves reais
 * (1-64), em ordem algoritmica.
 */
export interface CaminhoDourado {
  /** Posicao 1-11 dentro do Caminho. */
  posicao: number;
  /** Chave nesta posicao (1-64). */
  chave: ChaveNatal;
  /** Tema/titulo curto da posicao (universalista, nao copia). */
  tema: string;
}

/**
 * Dados dos pilares que Pilar 7 consome para o calculo.
 *
 * Pilar 7 reusa o Pilar 5 (I Ching) — sempre presente.
 * Pilar 4 (Odu) e Pilar 6 (Mapa Energetico) sao usados pela heuristica
 * de estagio e pela Sequence Venusiana/Caminho Dourado, mas sao
 * opcionais (graceful degradation se ausentes).
 */
export interface PilaresDados {
  /** Pilar 5 (I Ching) — fonte do numero da chave natal. */
  pilar5: IChingData;
  /** Pilar 4 (Odu) — opcional. Usado para faseVida/estagio. */
  pilar4?: {
    oduPrincipal?: string | null;
    faseVida?: FaseVida | null;
  } | null;
  /** Pilar 6 (Mapa Energetico) — opcional. Usado na Sequence/Pathway. */
  pilar6?: {
    tipo?: string | null;
    estrategia?: string | null;
    autoridade?: string | null;
  } | null;
}

/**
 * Resultado completo do calculo do Pilar 7.
 */
export interface Pilar7Result {
  /** A chave natal identificada (1-64), ou null se Pilar 5 indisponivel. */
  chaveNatal: ChaveNatal | null;
  /** Estagio atual (sombra/dom/siddhi). */
  estagioAtual: EstagioTransformacao;
  /** Texto placeholder do estagio Sombra (string vazia se chaveNatal null). */
  sombra: string;
  /** Texto placeholder do estagio Dom. */
  dom: string;
  /** Texto placeholder do estagio Siddhi. */
  siddhi: string;
  /** Sequence Venusiana (22 chaves), vazia se Pilar 5 indisponivel. */
  sequenceVenusiana: SequenceVenusiana[];
  /** Caminho Dourado (11 chaves), vazio se Pilar 5 indisponivel. */
  caminhoDourado: CaminhoDourado[];
  /** Versao do algoritmo de calculo (auditoria). */
  versaoCalculo: 'v1';
  /** Data/hora do calculo (deterministico apenas em contexto de teste). */
  calculadoEm: Date;
}
