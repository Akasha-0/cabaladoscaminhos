/**
 * @akasha/core-humandesign — Tipos canônicos do Human Design
 *
 * POC (Wave 16.1) — skeleton de pesquisa, NÃO produção.
 *
 * **Atribuição / IP:** Human Design System © Ra Uru Hu (Alan Krakower,
 * 1948-2011). O sistema foi publicado abertamente nos anos 80-90 em
 * livros, cursos e transmissões — hoje mantido pelo Jovian Archive
 * (https://www.jovianarchive.com). Os TIPOS e o SHAPE abaixo descrevem
 * a estrutura matemática do sistema (nomes, cardinalidades, contratos
 * de dados) — não a copy textual, não a doutrina, não o branding.
 * Este package é POC de pesquisa; integração com produção Akasha
 * acontece via `@akasha/core-pilar6` (tradução universalista sob
 * ADR 0002, 4 guardrails).
 *
 * **Fontes públicas de referência (creative commons / fair use):**
 *  - Ra Uru Hu, "The Definitive Book of Human Design" (1997)
 *  - Jovian Archive public materials (https://www.jovianarchive.com)
 *  - Wikipedia "Human Design System" (en) — overview estrutural
 *
 * Cardinalidades canônicas:
 *  - 4 Types (Generator, Manifesting Generator, Manifestor, Projector)
 *    + 1 Reflector (5 total canônicos) — designamos 7 como super-set
 *    cobrindo sub-distinções (MG/M/P/R abreviações) registradas em
 *    algumas literaturas. NÃO inventar 5º type canônico.
 *  - 12 Profiles (1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6, 4/1, 5/1, 5/2,
 *    6/2, 6/3) — combinación Consciente/Inconsciente (linhas).
 *  - 9 Centers (Head, Ajna, Throat, G, Heart/Ego, Sacral, Spleen,
 *    Solar Plexus, Root).
 *  - 36 Channels (combinações de 2 Gates entre Centers adjacentes).
 *  - 64 Gates (1:1 com os 64 hexagramas King Wen do I Ching).
 *  - 7 Authorities (Emotional, Sacral, Splenic, Ego/Heart, Self-Projected,
 *    Mental, Lunar) — variantes documentadas.
 */

// ============================================================================
// §1 — Input shape (POC skeleton — apenas shape, sem cálculo real)
// ============================================================================

/**
 * Dados de nascimento (POC). Em produção, esta interface seria preenchida
 * com longitude/latitude/tz do local de nascimento + data+hora local.
 * Para o POC, aceitamos apenas o mínimo necessário para validar o shape.
 */
export interface BirthData {
  /** Data de nascimento ISO (YYYY-MM-DD) */
  date: string
  /** Hora local de nascimento HH:MM (24h) */
  time: string
  /** Latitude em graus decimais (-90 a +90) */
  lat: number
  /** Longitude em graus decimais (-180 a +180) */
  lng: number
  /** Timezone offset em horas (ex: -3 para BRT) */
  tz: number
}

// ============================================================================
// §2 — Type (4 + 1 canônicos; 7 codes cobrindo abreviações)
// ============================================================================

/**
 * Human Design Type — codinomes literais do sistema de Ra Uru Hu.
 * O usuário Akasha pode escolher usar esta enum (POC/research) ou o
 * shape renomeado de `@akasha/core-pilar6` (produção).
 *
 * `MG` e `M`/`P`/`R` são abreviações documentadas em algumas literaturas
 * de Human Design (Manifesting Generator, Manifestor, Projector, Reflector).
 */
export type HDType =
  | 'Generator'        // Energia sustentada — responde à vida
  | 'Manifesting Generator' // MG — Generator com acesso ao Throat
  | 'Manifestor'       // Energia de iniciar / impactar
  | 'Projector'        // Energia de guiar / reconhecer
  | 'Reflector'        // Energia lunar — espelho do ambiente
  | 'MG'               // abreviação canônica de Manifesting Generator
  | 'M'                // abreviação canônica de Manifestor
  | 'P'                // abreviação canônica de Projector
  | 'R'                // abreviação canônica de Reflector

// ============================================================================
// §3 — Profile (12 perfis canônicos)
// ============================================================================

/**
 * Profile = combinação Consciente (linha do Personality) / Inconsciente
 * (linha do Design). 12 combinações canônicas (Ra Uru Hu, "The Definitive
 * Book of Human Design", 1997).
 */
export type HDProfile =
  | '1/3' | '1/4' | '2/4' | '2/5' | '3/5' | '3/6'
  | '4/6' | '4/1' | '5/1' | '5/2' | '6/2' | '6/3'

/** Linha numérica (1-6) para descrever Consciente ou Inconsciente */
export type HDLine = 1 | 2 | 3 | 4 | 5 | 6

// ============================================================================
// §4 — Centers (9 centros canônicos)
// ============================================================================

/**
 * Os 9 Energy Centers (Centros de Energia) do Human Design.
 * Atribuição: Ra Uru Hu, "The Definitive Book of Human Design" (1997).
 *
 * Cada Center pode estar **Defined** (colorido consistentemente em ambos
 * os mapas Personality + Design) ou **Undefined/Open** (inconsistente).
 */
export type HDCenter =
  | 'Head'        // Inspiração / pressão mental
  | 'Ajna'        // Processamento conceitual
  | 'Throat'      // Manifestação / comunicação
  | 'G'           // Identidade / direção (Self/G Center)
  | 'Heart'       // Ego / vontade / matéria
  | 'Sacral'      // Resposta gut / energia vital
  | 'Spleen'     // Instinto / intuição (tempo, corpo, consciência)
  | 'Solar Plexus' // Emoções / ondas emocionais
  | 'Root'        // Pressão adrenal / estresse

// ============================================================================
// §5 — Gates (1-64) — 1:1 com os 64 hexagramas King Wen (I Ching)
// ============================================================================

/**
 * Gate (Porta) do Human Design = hexagrama I Ching (Pilar 5).
 * Range canônico 1-64 (King Wen sequence).
 *
 * Atribuição: Ra Uru Hu mapeou os 64 hexagramas I Ching para o sistema
 * de Gates; cada Gate tem um nome I Ching correspondente.
 * Referência: https://www.jovianarchive.com (Jovian Archive public).
 */
export type HDGate = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50
  | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60
  | 61 | 62 | 63 | 64

/**
 * Estado de ativação de um Gate: em qual dos dois mapas (Personality —
 * lado consciente / Design — lado inconsciente) o Gate aparece ativo.
 */
export interface GateActivation {
  /** Número do Gate (1-64) */
  gate: HDGate
  /** Linha (1-6) — detalhe da ativação */
  line: HDLine
  /** Planeta (de nascimento) que ativa o Gate — produção requer tabela
   *  de ativação planetária (POC: string livre, produção: enum) */
  planet: string
  /** Em qual dos dois mapas este Gate está ativo */
  map: 'Personality' | 'Design'
}

// ============================================================================
// §6 — Channels (36 canais canônicos)
// ============================================================================

/**
 * Channel = par de Gates (1-64) que conectam 2 Centers adjacentes.
 * 36 Channels canônicos (Ra Uru Hu, "The Definitive Book of Human
 * Design", 1997). Cada Channel ativa quando **ambos** os Gates estão
 * definidos (Gate A em Personality e Gate B em Design, ou vice-versa).
 */
export interface HDChannel {
  /** Nome canônico do Channel (ex: "The Channel of Inspiration",
   *  "The Channel of Awakening") */
  name: string
  /** Gate A (1-64) */
  gateA: HDGate
  /** Gate B (1-64) */
  gateB: HDGate
  /** Center A (origem) */
  centerA: HDCenter
  /** Center B (destino) */
  centerB: HDCenter
  /** Circuit class (Integration / Understanding / Knowing / Centering /
   *  Sensing / Tribal / Individual / Collective) — produção: enum */
  circuit: string
  /** Tema / função do Channel — texto curto (POC stub) */
  theme: string
}

// ============================================================================
// §7 — Authority (7 autoridades canônicas)
// ============================================================================

/**
 * Authority (Autoridade Interna) — mecanismo de tomada de decisão.
 * 7 variantes documentadas:
 *  - Emotional    — Solar Plexus Defined → esperar clarity
 *  - Sacral       — Sacral Defined → resposta gut
 *  - Splenic     — Spleen Defined → instinto presente
 *  - Ego         — Heart Defined → vontade
 *  - Self-Projected — G Center Defined + Throat Defined → projetar voz
 *  - Mental      — Ajna Defined (sem Authority lower) — processo mental
 *  - Lunar       — Reflector → ciclo lunar de 29 dias
 *
 * Atribuição: Ra Uru Hu, "The Definitive Book of Human Design" (1997).
 */
export type HDAuthority =
  | 'Emotional'
  | 'Sacral'
  | 'Splenic'
  | 'Ego'
  | 'Self-Projected'
  | 'Mental'
  | 'Lunar'

// ============================================================================
// §8 — Strategy (mapeamento 1:1 com Type)
// ============================================================================

/**
 * Strategy (Estratégia) — comportamento correto por Type.
 * 1:1 com Type:
 *  - Generator / Manifesting Generator → "To Respond" (responde à vida)
 *  - Projector → "To Wait for the Invitation" (espera convite)
 *  - Manifestor → "To Inform" (informa antes de iniciar)
 *  - Reflector → "To Wait a Lunar Cycle" (espera 29 dias)
 */
export type HDStrategy =
  | 'To Respond'
  | 'To Wait for the Invitation'
  | 'To Inform'
  | 'To Wait a Lunar Cycle'

// ============================================================================
// §9 — BodyGraph (output agregado do POC)
// ============================================================================

/**
 * BodyGraph — output agregado do Human Design para um nascimento.
 * Shape canônico (POC). Produção: `@akasha/core-pilar6` retorna
 * shape renomeado (PT-BR + 4 guardrails).
 */
export interface BodyGraph {
  /** Type (4 + 1 canônicos) */
  type: HDType
  /** Strategy (1:1 com type) */
  strategy: HDStrategy
  /** Authority (7 variantes) ou null se inconclusivo */
  authority: HDAuthority | null
  /** Profile (12 combinações) */
  profile: HDProfile
  /** Centers que estão **Defined** (subset dos 9) */
  definedCenters: HDCenter[]
  /** Channels ativos (pares de Centers adjacentes com ambos Gates
   *  definidos) — subset dos 36 canônicos */
  activeChannels: HDChannel[]
  /** Gates ativos com seus planetas/linhas/mapas (Personality + Design) */
  gateActivations: GateActivation[]
  /** Versão do cálculo (POC: 'v0-poc') */
  version: 'v0-poc'
  /** Timestamp do cálculo (injetado para testabilidade) */
  calculatedAt: Date
}
