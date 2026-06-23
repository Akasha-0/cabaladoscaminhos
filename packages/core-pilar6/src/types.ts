/**
 * @akasha/core-pilar6 — Tipos públicos
 *
 * Shapes canônicos (D-YYY + ADR 0002):
 *  - PilaresDados: agregado dos 5 Pilares (Cabala + Astrologia + Tantra
 *    + Odu + I Ching). Reusa o shape já estabelecido em
 *    `apps/akasha-portal/src/lib/grimoire/significados-especificos.ts`.
 *    Definido aqui como `PilarDados*` para o Pilar 6 não depender do
 *    app-layer.
 *  - MandalaCaminho: contexto multi-tenant do Caminhante (D-041).
 *    Inclui `centroVitalidadeAtivo` que o Pilar 6 consome como entrada.
 *  - Pilar6Resultado: output do orquestrador `calcular()`.
 */

// ============================================================================
// §1 — PilaresDados (shape mínimo para Pilar 6)
// ============================================================================

/**
 * Pilar 1 (Cabala) — campos mínimos consumidos pelo Pilar 6.
 * O Pilar 6 usa `life_path` para algumas heurísticas de fallback.
 */
export interface PilarDadosCabala {
  life_path: number
  birthday: number
  expression: number
  ano_pessoal: number
}

/**
 * Pilar 2 (Astrologia) — campos mínimos consumidos pelo Pilar 6.
 * `asc_signo` é entrada central para detecção de Tipo.
 */
export interface PilarDadosAstrologia {
  sol_signo: string
  asc_signo: string | null
  lua_signo: string
  lua_fase: 'nova' | 'crescente' | 'cheia' | 'minguante'
  trinity: { sombra: number; dom: number; graca: number }
  trinity_dominante: 'sombra' | 'dom' | 'graca'
  lilith_signo: string | null
  casa_8_signo: string | null
}

/**
 * Pilar 3 (Tantra) — campos mínimos consumidos pelo Pilar 6.
 * `corpo_predominante` entra na heurística de Centro da Vitalidade.
 */
export interface PilarDadosTantrica {
  corpo_predominante: number
  trigemeo: 'fisico' | 'astral' | 'mental'
  temperamento_atual: 'sanguineo' | 'colerico' | 'melancolico' | 'fleumatico'
}

/**
 * Pilar 4 (Odu) — campos mínimos consumidos pelo Pilar 6.
 * `odu_principal` é entrada central para detecção de Tipo.
 */
export interface PilarDadosOdu {
  odu_principal: string
  odu_secundario: string | null
  fonte: 'Ifá' | 'Candomblé'
}

/**
 * Pilar 5 (I Ching) — campos mínimos consumidos pelo Pilar 6.
 * `hexagrama_natal` (1-64) é entrada para seleção de Portas / Canais.
 */
export interface PilarDadosIChing {
  hexagrama_natal: number
  hexagrama_dia: number
  level: 'shadow' | 'gift' | 'siddhi'
}

/**
 * Agregado dos 5 Pilares canônicos consumidos pelo Pilar 6.
 * Shape compatível com `PilaresDados` em
 * `apps/akasha-portal/src/lib/grimoire/significados-especificos.ts`.
 */
export interface PilaresDados {
  cabala: PilarDadosCabala
  astrologia: PilarDadosAstrologia
  tantrica: PilarDadosTantrica
  odu: PilarDadosOdu
  iching: PilarDadosIChing
}

// ============================================================================
// §2 — MandalaCaminho (MC) — contexto multi-tenant (D-041)
// ============================================================================

/**
 * MandalaCaminho = agregado do "Mandala do Caminhante" (MC) canônico
 * do D-041. Captura o contexto multi-tenant (Zelador + Caminhante +
 * Caminhada) mais o estado do Centro da Vitalidade (ativo/inativo) no
 * momento do nascimento — que é a entrada que o Pilar 6 usa para
 * detectar o Tipo Energético.
 *
 * Esse agregado é o que o Pilar 6 consome; a integração com
 * `withCaminhanteContext()` e o model `Caminhante` do D-XXX é
 * responsabilidade de quem chama `calcular()` (normalmente o
 * orchestrator `@akasha/core` na Task 3 de Wave 4).
 */
export interface MandalaCaminho {
  /** ID do Zelador (multi-tenant owner — D-XXX) */
  zeladorId: string
  /** ID do Caminhante (D-041) */
  caminhanteId: string
  /** ID da Caminhada (D-041) — escopo do cálculo */
  caminhadaId: string
  /**
   * Centro da Vitalidade ativo (true) ou inativo (false) no MC
   * canônico do D-041. Entrada central para a heurística de Tipo.
   */
  centroVitalidadeAtivo: boolean
  /** Data de nascimento ISO (YYYY-MM-DD) — para auditoria / cache key */
  nascimentoIso: string
}

// ============================================================================
// §3 — Enums e tipos de saída do Pilar 6
// ============================================================================

/**
 * 4 Tipos Energéticos (D-YYY §1). Renomeação universalista dos 4
 * tipos clássicos do Human Design (Guardrail 1 do ADR 0002).
 *
 * Mapeamento (D-YYY):
 *  - 'iniciador'       ↔ Generator (energia sustentada, responde)
 *  - 'guia'            ↔ Projector (energia focal, guia)
 *  - 'iniciador_aberto'↔ Manifestor (energia de começar)
 *  - 'refletor'        ↔ Reflector (energia lunar, amostra)
 */
export type TipoEnergetico =
  | 'iniciador'
  | 'guia'
  | 'iniciador_aberto'
  | 'refletor'

/**
 * 4 Estratégias Energéticas (D-YYY §2). Mapeamento 1:1 a partir do Tipo.
 */
export type EstrategiaEnergetica =
  | 'esperar_convite'
  | 'informar'
  | 'iniciar'
  | 'esperar_ciclo_lunar'

/**
 * 6 Autoridades Energéticas (D-YYY §3). Reutiliza a detecção canônica
 * do D-041 (Caminhante). Nomes em PT-BR, sem termos proprietários.
 *
 *  - 'emocional'   — ondas emocionais (clarify após sleep)
 *  - 'sacral'      — resposta gut imediata
 *  - 'esplenica'   — instinto presente (não sustentado)
 *  - 'cardiaca'    — "quem sou eu?" — vontade
 *  - 'identidade'  — direção de vida (ambientes)
 *  - 'lunar'       — ciclo de 29 dias
 */
export type AutoridadeEnergetica =
  | 'emocional'
  | 'sacral'
  | 'esplenica'
  | 'cardiaca'
  | 'identidade'
  | 'lunar'

/**
 * 9 Centros Energéticos (D-YYY §4). Inspiração universalista
 * (I Ching + Cabala + Tantra). Nomes PT-BR próprios — NÃO são
 * nomes de chakras hindus.
 */
export type CentroEnergetico =
  | 'inspiracao'
  | 'mental'
  | 'manifestacao'
  | 'identidade'
  | 'vontade'
  | 'emocoes'
  | 'vitalidade'
  | 'sobrevivencia'
  | 'fundamentacao'

/**
 * Canal = par de portas (1-64) + 2 centros adjacentes. Ativa quando
 * ambos os centros estão definidos.
 */
export interface Canal {
  /** Porta I Ching (1-64) — Pilar 5 */
  portaA: number
  /** Porta I Ching (1-64) — Pilar 5 */
  portaB: number
  /** Centro A (origem do canal) */
  centroA: CentroEnergetico
  /** Centro B (destino do canal) */
  centroB: CentroEnergetico
  /**
   * Tema do canal — texto original (do zero — Guardrail 2 do ADR 0002).
   * Descreve a função do canal entre os 2 centros.
   */
  tema: string
}

/**
 * Output do orquestrador `calcular()`.
 */
export interface Pilar6Resultado {
  /** Tipo Energético detectado (1 dos 4) */
  tipo: TipoEnergetico
  /** Estratégia Energética (1:1 com tipo) */
  estrategia: EstrategiaEnergetica
  /**
   * Autoridade Energética (1 das 6) ou `null` se inconclusivo
   * (ex: dados insuficientes no MC canônico).
   */
  autoridade: AutoridadeEnergetica | null
  /** Subset dos 9 centros que estão **definidos** */
  centrosDefinidos: CentroEnergetico[]
  /** Canais ativos (pares de centros adjacentes definidos) */
  canais: Canal[]
  /** Versão do algoritmo (semver-ish: 'v1' para Wave 4) */
  versaoCalculo: 'v1'
  /** Timestamp do cálculo (injetado para testabilidade) */
  calculadoEm: Date
}
