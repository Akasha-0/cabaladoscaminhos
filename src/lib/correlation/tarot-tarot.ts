/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Tarot Major Arcana cards based on:
 * - Sequential journey progression
 * - Elemental correspondences
 * - Archetypal themes
 * - Numerological connections
 * - Kabbalistic paths
 * Source: Cabala dos Caminhos spiritual system
 */

/** The22 cards of the Major Arcana */
export type ArcanoName =
  | 'O Louco'
  | 'O Mago'
  | 'A Sacerdotisa'
  | 'A Imperatriz'
  | 'O Imperador'
  | 'O Hierofante'
  | 'Os Enamorados'
  | 'O Carro'
  | 'A Força'
  | 'O Eremita'
  | 'A Roda da Fortuna'
  | 'A Justiça'
  | 'O Enforcado'
  | 'A Morte'
  | 'A Temperança'
  | 'O Diabo'
  | 'A Torre'
  | 'A Estrela'
  | 'A Lua'
  | 'O Sol'
  | 'O Julgamento'
  | 'O Mundo';

/** Relationship types between Tarot cards */
export type TarotRelationType =
  | 'sequencial'      // Card that follows in the journey
  | 'precede'         // Card that comes before
  | 'elemental'       // Cards sharing the same element
  | 'arquétipo'       // Cards of the same archetype family
  | 'oposto'          // Opposite or contrasting cards
  | 'complementar'    // Complementary energies
  | 'caminho_kabala'  // Cards connected by Kabbalistic paths
  | 'númerológico'    // Cards with numerological connection
  | 'evolução'        // Cards showing spiritual evolution
  | 'sombra'          // Shadow or shadow-work cards
  | 'integração';     // Cards representing integration themes

/**
 * Represents a relationship between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** Source arcano */
  arcano_origem: ArcanoName;
  /** Target arcano */
  arcano_destino: ArcanoName;
  /** Type of relationship */
  tipo_relação: TarotRelationType;
  /** Card number of the origin arcano (0-21) */
  número_origem: number;
  /** Card number of the destination arcano (0-21) */
  número_destino: number;
  /** Explanation of the spiritual connection */
  conexão_espiritual: string;
  /** Key lesson from this relationship */
  lição_principal: string;
  /** How to work with both cards together */
  prática_ritual: string;
}

/**
 * Elemental correspondences for Major Arcana cards
 */
export const ELEMENTO_ARCANO: Record<ArcanoName, 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter'> = {
  'O Louco': 'Éter',
  'O Mago': 'Água',
  'A Sacerdotisa': 'Água',
  'A Imperatriz': 'Terra',
  'O Imperador': 'Fogo',
  'O Hierofante': 'Água',
  'Os Enamorados': 'Ar',
  'O Carro': 'Fogo',
  'A Força': 'Fogo',
  'O Eremita': 'Terra',
  'A Roda da Fortuna': 'Fogo',
  'A Justiça': 'Ar',
  'O Enforcado': 'Água',
  'A Morte': 'Água',
  'A Temperança': 'Água',
  'O Diabo': 'Terra',
  'A Torre': 'Fogo',
  'A Estrela': 'Água',
  'A Lua': 'Água',
  'O Sol': 'Fogo',
  'O Julgamento': 'Fogo',
  'O Mundo': 'Terra',
};

/**
 * Archetype families for grouping related cards
 */
export type Arquétipo =
  | 'Iniciação'      // Cards 0-3: Beginning the journey
  | 'Autoridade'      // Cards 4-6: Power structures
  | 'Conflito' // Cards 7-9: Struggle and challenge
  | 'Transformação'   // Cards 10-14: Major life changes
  | 'Libertação'      // Cards 15-17: Breaking free
  | 'Iluminação'      // Cards 18-21: Enlightenment
  | 'Transição';      // Card 0: The Fool's eternal transition

export const ARQUÉTIPO_ARCANO: Record<ArcanoName, Arquétipo> = {
  'O Louco': 'Transição',
  'O Mago': 'Iniciação',
  'A Sacerdotisa': 'Iniciação',
  'A Imperatriz': 'Iniciação',
  'O Imperador': 'Autoridade',
  'O Hierofante': 'Autoridade',
  'Os Enamorados': 'Autoridade',
  'O Carro': 'Conflito',
  'A Força': 'Conflito',
  'O Eremita': 'Conflito',
  'A Roda da Fortuna': 'Transformação',
  'A Justiça': 'Transformação',
  'O Enforcado': 'Transformação',
  'A Morte': 'Transformação',
  'A Temperança': 'Transformação',
  'O Diabo': 'Libertação',
  'A Torre': 'Libertação',
  'A Estrela': 'Libertação',
  'A Lua': 'Iluminação',
  'O Sol': 'Iluminação',
  'O Julgamento': 'Iluminação',
  'O Mundo': 'Iluminação',
};

/**
 * Complete mapping of Tarot-Tarot relationships
 * Each entry describes a spiritual connection between two Major Arcana cards
 */
export const TAROT_TAROT_MAP: readonly TarotTarotMapping[] = [
  // ─── Sequencial Journey Progression ─────────────────────────────────────
  {
    arcano_origem: 'O Louco',
    arcano_destino: 'O Mago',
    tipo_relação: 'sequencial',
    número_origem: 0,
    número_destino: 1,
    conexão_espiritual: 'O Louco carrega a semente da transformação que o Mago ativa e direciona. O potencial puro encontra sua primeira expressão consciente.',
    lição_principal: 'A coragem de começar precede a maestria técnica',
    prática_ritual: 'Use O Louco para abrir caminhos e O Mago para manifestar intenções',
  },
  {
    arcano_origem: 'O Mago',
    arcano_destino: 'A Sacerdotisa',
    tipo_relação: 'sequencial',
    número_origem: 1,
    número_destino: 2,
    conexão_espiritual: 'O Mago externaliza; a Sacerdotisa internaliza. Juntos representam o ciclo de ação e reflexão que sustenta toda prática espiritual.',
    lição_principal: 'A manifestação requer discernimento interior',
    prática_ritual: 'Mago para ativar, Sacerdotisa para receber orientação',
  },
  {
    arcano_origem: 'A Sacerdotisa',
    arcano_destino: 'A Imperatriz',
    tipo_relação: 'sequencial',
    número_origem: 2,
    número_destino: 3,
    conexão_espiritual: 'A Sacerdotisa revela o oculto; a Imperatriz nutre o revelado. Do mistério nasce a abundância material e espiritual.',
    lição_principal: 'A sabedoria interior floresce em fertilidade exterior',
    prática_ritual: 'Sacerdotisa para meditação profunda, Imperatriz para trabalho criativo',
  },
  {
    arcano_origem: 'A Imperatriz',
    arcano_destino: 'O Imperador',
    tipo_relação: 'sequencial',
    número_origem: 3,
    número_destino: 4,
    conexão_espiritual: 'A Imperatriz cria; o Imperador estrutura. A fertilidade precisa de limites para manifestar seu potencial.',
    lição_principal: 'A abundância requiere organização e disciplina',
    prática_ritual: 'Imperatriz para invocar criatividade, Imperador para estabelecer estrutura',
  },
  {
    arcano_origem: 'O Imperador',
    arcano_destino: 'O Hierofante',
    tipo_relação: 'sequencial',
    número_origem: 4,
    número_destino: 5,
    conexão_espiritual: 'O Imperador governa o mundo material; o Hierofante guia o espiritual. A autoridade mundana encontra seu propósito na tradição sagrada.',
    lição_principal: 'O poder terreno ganha sentido na tradição espiritual',
    prática_ritual: 'Imperador para trabalho prático, Hierofante para ensino e iniciação',
  },
  {
    arcano_origem: 'O Hierofante',
    arcano_destino: 'Os Enamorados',
    tipo_relação: 'sequencial',
    número_origem: 5,
    número_destino: 6,
    conexão_espiritual: 'O Hierofante apresenta a escolha; os Enamorados a vivem. Da tradição emerge a decisão que define o destino.',
    lição_principal: 'A escolha espiritual é também uma escolha de coração',
    prática_ritual: 'Hierofante para buscar orientação, Enamorados para decisões amorosas',
  },
  {
    arcano_origem: 'Os Enamorados',
    arcano_destino: 'O Carro',
    tipo_relação: 'sequencial',
    número_origem: 6,
    número_destino: 7,
    conexão_espiritual: 'Dos Enamorados nasce a vontade de avançar; o Carro carrega essa vontade para a conquista. O amor gera a força para a jornada.',
    lição_principal: 'O compromisso amoroso fortalece a determinação',
    prática_ritual: 'Enamorados para unir energias, Carro para conquistar objetivos',
  },
  {
    arcano_origem: 'O Carro',
    arcano_destino: 'A Força',
    tipo_relação: 'sequencial',
    número_origem: 7,
    número_destino: 8,
    conexão_espiritual: 'O Carro conquista externamente; a Força vence internamente. A vitória exterior prepara a batalha interior.',
    lição_principal: 'A verdadeira força vem da transformação do medo em compaixão',
    prática_ritual: 'Carro para ação decisiva, Força para integração das sombras',
  },
  {
    arcano_origem: 'A Força',
    arcano_destino: 'O Eremita',
    tipo_relação: 'sequencial',
    número_origem: 8,
    número_destino: 9,
    conexão_espiritual: 'A Força integra as polaridades; o Eremita as transcende na solidão. A bravura interior pede recolhimento para amadurecer.',
    lição_principal: 'A integração das forças requer solitude contemplativa',
    prática_ritual: 'Força para trabalho com sombras, Eremita para busca interior',
  },
  {
    arcano_origem: 'O Eremita',
    arcano_destino: 'A Roda da Fortuna',
    tipo_relação: 'sequencial',
    número_origem: 9,
    número_destino: 10,
    conexão_espiritual: 'O Eremita encontra a luz interior; a Roda a projeta no destino. A sabedoria individual se funde com o destino coletivo.',
    lição_principal: 'A iluminação individual participa do ciclo maior do destino',
    prática_ritual: 'Eremita para introspecção, Roda para trabalhar com ciclos',
  },
  {
    arcano_origem: 'A Roda da Fortuna',
    arcano_destino: 'A Justiça',
    tipo_relação: 'sequencial',
    número_origem: 10,
    número_destino: 11,
    conexão_espiritual: 'A Roda gira o destino; a Justiça o corrige. O carma encontra seu balanceamento na ação consciente.',
    lição_principal: 'O destino pode ser reequilibrado pela ação justa',
    prática_ritual: 'Rodas para compreender ciclos, Justiça para ação correta',
  },
  {
    arcano_origem: 'A Justiça',
    arcano_destino: 'O Enforcado',
    tipo_relação: 'sequencial',
    número_origem: 11,
    número_destino: 12,
    conexão_espiritual: 'A Justiça pondera; o Enforcado aceita. O veredito justo pode exigir sacrifício do ponto de vista comum.',
    lição_principal: 'A verdadeira justiça às vezes requer uma nova perspectiva',
    prática_ritual: 'Justiça para decisões equilibradas, Enforcado para práticas de sacrifício',
 },
  {
    arcano_origem: 'O Enforcado',
    arcano_destino: 'A Morte',
    tipo_relação: 'sequencial',
    número_origem: 12,
    número_destino: 13,
    conexão_espiritual: 'O Enforcado suspende o tempo; a Morte o completa. O sacrifício voluntário abre espaço para a transformação total.',
    lição_principal: 'A morte do ego é necessária para a renovação',
    prática_ritual: 'Enforcado para meditação suspensiva, Morte para rituais de transformação',
  },
  {
    arcano_origem: 'A Morte',
    arcano_destino: 'A Temperança',
    tipo_relação: 'sequencial',
    número_origem: 13,
    número_destino: 14,
    conexão_espiritual: 'A Morte transforma; a Temperança integra. A passagem exige alquimia para restabelecer o equilíbrio.',
    lição_principal: 'A transformação pede equilíbrio na integração',
    prática_ritual: 'Morte para trabalho de finitude, Temperança para alquimia interior',
  },
  {
    arcano_origem: 'A Temperança',
    arcano_destino: 'O Diabo',
    tipo_relação: 'sequencial',
    número_origem: 14,
    número_destino: 15,
    conexão_espiritual: 'A Temperança harmoniza; o Diabo polariza. O equilíbrio pode quebrar-se quando a sombra se apresenta.',
    lição_principal: 'O trabalho com a sombra é parte da jornada espiritual',
    prática_ritual: 'Temperança para manter equilíbrio, Diabo para confrontar依附',
  },
  {
    arcano_origem: 'O Diabo',
    arcano_destino: 'A Torre',
    tipo_relação: 'sequencial',
    número_origem: 15,
    número_destino: 16,
    conexão_espiritual: 'O Diabo mantém preso; a Torre liberta. A confrontação com a sombra provoca o colapso das estruturas falsas.',
    lição_principal: 'A libertação pode vir pela destruição do que nos aprisiona',
    prática_ritual: 'Diabo para examinar apegos, Torre para rituais de libertação',
  },
  {
    arcano_origem: 'A Torre',
    arcano_destino: 'A Estrela',
    tipo_relação: 'sequencial',
    número_origem: 16,
    número_destino: 17,
    conexão_espiritual: 'A Torre derruba; a Estrela reconstrói. Da ruína nasce a esperança e a renovação das forças vitais.',
    lição_principal: 'Após a destruição, a esperança guia a reconstrução',
    prática_ritual: 'Torre para rituais de quebra, Estrela para restauração',
  },
  {
    arcano_origem: 'A Estrela',
    arcano_destino: 'A Lua',
    tipo_relação: 'sequencial',
    número_origem: 17,
    número_destino: 18,
    conexão_espiritual: 'A Estrela ilumina; a Lua esconde. A esperança encontra seu teste na escuridão das ilusões.',
    lição_principal: 'A luz interior é provada pelas ilusões do inconsciente',
    prática_ritual: 'Estrela para invocar esperança, Lua para trabalhar com ilusões',
  },
  {
    arcano_origem: 'A Lua',
    arcano_destino: 'O Sol',
    tipo_relação: 'sequencial',
    número_origem: 18,
    número_destino: 19,
    conexão_espiritual: 'A Lua dissipa; o Sol revela. A claridade emerge quando as ilusões são enfrentadas.',
    lição_principal: 'A verdade se manifesta quando o medo é superado',
    prática_ritual: 'Lua para explorar sombras, Sol para iluminação plena',
  },
  {
    arcano_origem: 'O Sol',
    arcano_destino: 'O Julgamento',
    tipo_relação: 'sequencial',
    número_origem: 19,
    número_destino: 20,
    conexão_espiritual: 'O Sol brilha; o Julgamento desperta. A luz individual convida o chamado da consciência superior.',
    lição_principal: 'A alegria do Sol pede o despertar para o propósito maior',
    prática_ritual: 'Sol para celebrar vida, Julgamento para chamada de redenção',
  },
  {
    arcano_origem: 'O Julgamento',
    arcano_destino: 'O Mundo',
    tipo_relação: 'sequencial',
    número_origem: 20,
    número_destino: 21,
    conexão_espiritual: 'O Julgamento avalia; o Mundo completa. A resposta ao chamado encontra sua expressão na totalidade.',
    lição_principal: 'O despertar culmina na integração com o todo',
    prática_ritual: 'Julgamento para autoavaliação, Mundo para rituais de conclusão',
  },

  // ─── Elemental Correlations ──────────────────────────────────────────────
  {
    arcano_origem: 'O Imperador',
    arcano_destino: 'O Carro',
    tipo_relação: 'elemental',
    número_origem: 4,
    número_destino: 7,
    conexão_espiritual: 'Ambos são Fogo em sua expressão yang, ativa e direcionada. O Imperador estabelece a autoridade; o Carro a manifesta.',
    lição_principal: 'O poder estruturado se torna conquista vitoriosa',
    prática_ritual: 'Use ambos para projetos que requerem liderança e ação',
  },
  {
    arcano_origem: 'A Força',
    arcano_destino: 'O Sol',
    tipo_relação: 'elemental',
    número_origem: 8,
    número_destino: 19,
    conexão_espiritual: 'A coragem do Fogo queima no coração do Sol. A força interior encontra sua expressão luminosa.',
    lição_principal: 'A bravura transforma-se em alegria radiante',
    prática_ritual: 'Use para rituais de coragem e celebração',
  },
  {
    arcano_origem: 'A Torre',
    arcano_destino: 'A Roda da Fortuna',
    tipo_relação: 'elemental',
    número_origem: 16,
    número_destino: 10,
    conexão_espiritual: 'O Fogo destrutivo encontra o Fogo dinâmico da Roda. A destruição abre espaço para a mudança de ciclo.',
    lição_principal: 'A revolução participa do ciclo eterno do destino',
    prática_ritual: 'Use para momentos de transformação radical de ciclo',
  },
  {
    arcano_origem: 'O Julgamento',
    arcano_destino: 'A Torre',
    tipo_relação: 'elemental',
    número_origem: 20,
    número_destino: 16,
    conexão_espiritual: 'O Fogo do despertar também destrói o que não serve. O julgamento implica transformação.',
    lição_principal: 'O despertar pode exigir a queda das estruturas falsas',
    prática_ritual: 'Use para renascimento e libertação de velhas estruturas',
  },
  {
    arcano_origem: 'A Sacerdotisa',
    arcano_destino: 'A Morte',
    tipo_relação: 'elemental',
    número_origem: 2,
    número_destino: 13,
    conexão_espiritual: 'A Água do mistério flui para a Água da transformação. O oculto prepara a metamorfose.',
    lição_principal: 'O conhecimento secreto antecipa a morte e renascimento',
    prática_ritual: 'Use para meditação sobre mistérios e transformação',
  },
  {
    arcano_origem: 'A Temperança',
    arcano_destino: 'A Estrela',
    tipo_relação: 'elemental',
    número_origem: 14,
    número_destino: 17,
    conexão_espiritual: 'A Água calmante da temperança flui para a Água esperançosa da Estrela. O equilíbrio prepara a renovação.',
    lição_principal: 'A harmonia das águas prepara a esperança',
    prática_ritual: 'Use para restauração e práticas de esperança',
  },
  {
    arcano_origem: 'A Lua',
    arcano_destino: 'A Sacerdotisa',
    tipo_relação: 'elemental',
    número_origem: 18,
    número_destino: 2,
    conexão_espiritual: 'A Lua reflete a sabedoria da Sacerdotisa. O inconsciente conhece os mistérios que a intuição revela.',
    lição_principal: 'Os mistérios da lua refletem a sabedoria interior',
    prática_ritual: 'Use para trabalho noturno e meditação lunar',
  },
  {
    arcano_origem: 'O Mago',
    arcano_destino: 'A Sacerdotisa',
    tipo_relação: 'elemental',
    número_origem: 1,
    número_destino: 2,
    conexão_espiritual: 'A Água do Mago que flui para a Água da Sacerdotisa. A ação mágica se torna sabedoria receptiva.',
    lição_principal: 'A técnica se refinna na sabedoria',
    prática_ritual: 'Use para integrar ação e contemplação',
  },
  {
    arcano_origem: 'O Hierofante',
    arcano_destino: 'A Sacerdotisa',
    tipo_relação: 'elemental',
    número_origem: 5,
    número_destino: 2,
    conexão_espiritual: 'A Água da tradição encontra a Água do mistério. O ensinamento oficial conecta-se com a sabedoria oculta.',
    lição_principal: 'A tradição é um caminho para o mistério',
    prática_ritual: 'Use para práticas de tradição espiritual',
  },
  {
    arcano_origem: 'O Eremita',
    arcano_destino: 'A Imperatriz',
    tipo_relação: 'elemental',
    número_origem: 9,
    número_destino: 3,
    conexão_espiritual: 'A Terra da introspecção nutre a Terra da fertilidade. A solidão criativa alimenta a abundância.',
    lição_principal: 'O recolhimento sustenta a criatividade',
    prática_ritual: 'Use para práticas de criatividade a partir da introspecção',
  },
  {
    arcano_origem: 'O Diabo',
    arcano_destino: 'A Imperatriz',
    tipo_relação: 'elemental',
    número_origem: 15,
    número_destino: 3,
    conexão_espiritual: 'A Terra da matéria escura encontra a Terra da abundância. A sombra habita o mesmo elemento da fertilidade.',
    lição_principal: 'A matéria contém tanto a sombra quanto a abundância',
    prática_ritual: 'Use para integrar aspectos materiais da sombra',
  },
  {
    arcano_origem: 'O Mundo',
    arcano_destino: 'A Imperatriz',
    tipo_relação: 'elemental',
    número_origem: 21,
    número_destino: 3,
    conexão_espiritual: 'A Terra da completude une-se à Terra da fertilidade. O realizado manifesta abundância.',
    lição_principal: 'A completude inclui a capacidade de criar e nutrir',
    prática_ritual: 'Use para rituais de conclusão criativa',
  },
  {
    arcano_origem: 'Os Enamorados',
    arcano_destino: 'A Justiça',
    tipo_relação: 'elemental',
    número_origem: 6,
    número_destino: 11,
    conexão_espiritual: 'O Ar da escolha encontra o Ar da ponderação. A decisão amorosa pede equilíbrio.',
    lição_principal: 'A escolha amorosa requiere discernimento',
    prática_ritual: 'Use para decisões que requerem equilíbrio emocional',
  },
  {
    arcano_origem: 'O Louco',
    arcano_destino: 'A Lua',
    tipo_relação: 'elemental',
    número_origem: 0,
    número_destino: 18,
    conexão_espiritual: 'O Éter do Louco flutua no domínio da Lua. A liberdade ilimitada navega o inconsciente.',
    lição_principal: 'A liberdade dança com as águas do sonho',
    prática_ritual: 'Use para práticas de abandono e trabalho com sonhos',
  },

  // ─── Opposite/Contrast Relationships ────────────────────────────────────
  {
    arcano_origem: 'O Louco',
    arcano_destino: 'O Mundo',
    tipo_relação: 'oposto',
    número_origem: 0,
    número_destino: 21,
    conexão_espiritual: 'O Louco é o início ilimitado; o Mundo é a conclusão completa. A liberdade pura encontra a forma acabada.',
    lição_principal: 'A jornada do Louco ao Mundo é a busca da liberdade na forma',
    prática_ritual: 'Use para ciclos completos de transformação',
 },
  {
    arcano_origem: 'O Mago',
    arcano_destino: 'A Morte',
    tipo_relação: 'oposto',
    número_origem: 1,
    número_destino: 13,
    conexão_espiritual: 'O Mago manifesta; a Morte dissolve. A criação e a destruição são faces da mesma energia.',
    lição_principal: 'Manifestar inclui saber dissolver',
    prática_ritual: 'Use para rituais de criação e destruição consciente',
  },
  {
    arcano_origem: 'A Sacerdotisa',
    arcano_destino: 'O Diabo',
    tipo_relação: 'oposto',
    número_origem: 2,
    número_destino: 15,
    conexão_espiritual: 'A Sacerdotisa guarda os mistérios ocultos; o Diabo revela as sombras escondidas. Cada segredo tem seu lado sombrio.',
    lição_principal: 'O oculto contém tanto sabedoria quanto sombra',
    prática_ritual: 'Use para integrar aspectos ocultos da psique',
  },
  {
    arcano_origem: 'A Imperatriz',
    arcano_destino: 'A Torre',
    tipo_relação: 'oposto',
    número_origem: 3,
    número_destino: 16,
    conexão_espiritual: 'A Imperatriz nutre; a Torre destrói. A fertilidade pode ser atingida pela ruína.',
    lição_principal: 'A abundância é vulnerável à destruição súbita',
    prática_ritual: 'Use para trabalhar com medo de perda e reconstrução',
  },
  {
    arcano_origem: 'O Hierofante',
    arcano_destino: 'A Estrela',
    tipo_relação: 'oposto',
    número_origem: 5,
    número_destino: 17,
    conexão_espiritual: 'O Hierofante representa a tradição estabelecida; a Estrela aponta para renovação hope. A instituição versus a esperança.',
    lição_principal: 'A tradição pode ser renovada pela esperança',
    prática_ritual: 'Use para reformular tradições com esperança',
  },
  {
    arcano_origem: 'O Carro',
    arcano_destino: 'A Temperança',
    tipo_relação: 'oposto',
    número_origem: 7,
    número_destino: 14,
    conexão_espiritual: 'O Carro avança conquistando; a Temperança harmoniza evitando conflito. A vontade versus o equilíbrio.',
    lição_principal: 'A conquista deve ser temperada pelo equilíbrio',
    prática_ritual: 'Use para integrar ação decisiva com harmonia',
  },
  {
    arcano_origem: 'A Justiça',
    arcano_destino: 'A Lua',
    tipo_relação: 'oposto',
    número_origem: 11,
    número_destino: 18,
    conexão_espiritual: 'A Justiça clarifica; a Lua ilude. A verdade clara contrasta com a ilusão lunar.',
    lição_principal: 'O discernimento deve contemplar as ilusões',
    prática_ritual: 'Use para separar verdade de ilusão',
 },
  {
    arcano_origem: 'O Sol',
    arcano_destino: 'A Lua',
    tipo_relação: 'oposto',
    número_origem: 19,
    número_destino: 18,
    conexão_espiritual: 'O Sol revela; a Lua esconde. A luz e a escuridão, o dia e a noite, a clareza e o mistério.',
    lição_principal: 'A luz e a escuridão são necessárias uma à outra',
    prática_ritual: 'Use para trabalhar com dualidade luz-sombra',
  },

  // ─── Numerological Connections ───────────────────────────────────────────
  {
    arcano_origem: 'O Mago',
    arcano_destino: 'A Justiça',
    tipo_relação: 'númerológico',
    número_origem: 1,
    número_destino: 11,
    conexão_espiritual: 'O 1 e o 11 (2 reduções) conectam-se numerologicamente. O princípio uno manifesta-se no equilíbrio dual.',
    lição_principal: 'A manifestação individual encontra seu balanceamento',
    prática_ritual: 'Use para integrar poder pessoal com justiça',
  },
  {
    arcano_origem: 'A Imperatriz',
    arcano_destino: 'A Temperança',
    tipo_relação: 'númerológico',
    número_origem: 3,
    número_destino: 14,
    conexão_espiritual: 'O 3 e o 14 (5 reduções) conectam-se pela expressão criativa equilibrada. A fertilidade pede alquimia.',
    lição_principal: 'A criatividade pede equilíbrio alquímico',
    prática_ritual: 'Use para trabalhos criativos equilibrados',
  },
  {
    arcano_origem: 'O Imperador',
    arcano_destino: 'A Estrela',
    tipo_relação: 'númerológico',
    número_origem: 4,
    número_destino: 17,
    conexão_espiritual: 'O 4 e o 17 (8 reduções) conectam-se pela estruturação esperançosa. A autoridade se renova pela esperança.',
    lição_principal: 'A estrutura pode ser renovada pela esperança',
    prática_ritual: 'Use para reconstruir estruturas com esperança',
  },
  {
    arcano_origem: 'O Eremita',
    arcano_destino: 'O Sol',
    tipo_relação: 'númerológico',
    número_origem: 9,
    número_destino: 19,
    conexão_espiritual: 'O 9 e o 19 (1 reduções) conectam-se pela iluminação. A busca solitária encontra sua luz.',
    lição_principal: 'A busca interior leva à iluminação',
    prática_ritual: 'Use para jornadas de busca espiritual',
 },
  {
    arcano_origem: 'A Roda da Fortuna',
    arcano_destino: 'O Julgamento',
    tipo_relação: 'númerológico',
    número_origem: 10,
    número_destino: 20,
    conexão_espiritual: 'O 10 e o 20 (1 reduções) conectam-se pelo destino e despertar. O ciclo encontra seu chamado.',
    lição_principal: 'O destino chama para o despertar',
    prática_ritual: 'Use para work with fated awakening',
 },

  // ─── Archetype Family Connections ─────────────────────────────────────────
  {
    arcano_origem: 'O Mago',
    arcano_destino: 'A Sacerdotisa',
    tipo_relação: 'arquétipo',
    número_origem: 1,
    número_destino: 2,
    conexão_espiritual: 'Ambos pertencem ao arquétipo da Iniciação. O Mago inicia no mundo exterior; a Sacerdotisa, no interior.',
    lição_principal: 'A iniciação ocorre em dois planos: externo e interno',
    prática_ritual: 'Use para rituais de início em qualquer dimensão',
  },
  {
    arcano_origem: 'O Imperador',
    arcano_destino: 'O Hierofante',
    tipo_relação: 'arquétipo',
    número_origem: 4,
    número_destino: 5,
    conexão_espiritual: 'Ambos pertencem ao arquétipo da Autoridade. O Imperador governa materialmente; o Hierofante, espiritualmente.',
    lição_principal: 'A autoridade existe em múltiplos domínios',
    prática_ritual: 'Use para questões de liderança e ensino',
  },
  {
    arcano_origem: 'O Carro',
    arcano_destino: 'A Força',
    tipo_relação: 'arquétipo',
    número_origem: 7,
    número_destino: 8,
    conexão_espiritual: 'Ambos pertencem ao arquétipo do Conflito. O Carro vence o conflito externo; a Força, o interno.',
    lição_principal: 'A vitória ocorre em fronts externo e interno',
    prática_ritual: 'Use para trabalhar tanto ação quanto integração',
  },
  {
    arcano_origem: 'A Morte',
    arcano_destino: 'A Temperança',
    tipo_relação: 'arquétipo',
    número_origem: 13,
    número_destino: 14,
    conexão_espiritual: 'Ambos pertencem ao arquétipo da Transformação. A Morte transforma pela dissolução; a Temperança, pela integração.',
    lição_principal: 'A transformação pode ser dissolutiva ou integrativa',
    prática_ritual: 'Use para diferentes tipos de trabalho transformacional',
  },
  {
    arcano_origem: 'O Diabo',
    arcano_destino: 'A Torre',
    tipo_relação: 'arquétipo',
    número_origem: 15,
    número_destino: 16,
    conexão_espiritual: 'Ambos pertencem ao arquétipo da Libertação. O Diabo mantém preso; a Torre liberta pela destruição.',
    lição_principal: 'A libertação pode vir pela confrontação ou pela destruição',
    prática_ritual: 'Use para rituais de libertação de diferentes naturezas',
  },
  {
    arcano_origem: 'A Lua',
    arcano_destino: 'O Sol',
    tipo_relação: 'arquétipo',
    número_origem: 18,
    número_destino: 19,
    conexão_espiritual: 'Ambos pertencem ao arquétipo da Iluminação. A Lua ilumina as sombras; o Sol, a claridade.',
    lição_principal: 'A iluminação ocorre em diferentes níveis de consciência',
    prática_ritual: 'Use para trabalho progressivo com luz e sombra',
  },

  // ─── Complementary Relationships ─────────────────────────────────────────
  {
    arcano_origem: 'O Louco',
    arcano_destino: 'A Imperatriz',
    tipo_relação: 'complementar',
    número_origem: 0,
    número_destino: 3,
    conexão_espiritual: 'O Louco aporta liberdade; a Imperatriz, estrutura fértil. A liberdade sem forma encontra a forma fértil.',
    lição_principal: 'A liberdade e a fertilidade se complementam',
    prática_ritual: 'Use para criar a partir do zero com nutrição',
  },
  {
    arcano_origem: 'O Mago',
    arcano_destino: 'A Lua',
    tipo_relação: 'complementar',
    número_origem: 1,
    número_destino: 18,
    conexão_espiritual: 'O Mago traz clareza; a Lua traz mistério. A manifestação completa inclui o trabalho com o inconsciente.',
    lição_principal: 'A técnica clara deve contemplar o mistério',
    prática_ritual: 'Use para trabalhos que combinam técnica e inconsciente',
  },
  {
    arcano_origem: 'O Hierofante',
    arcano_destino: 'Os Enamorados',
    tipo_relação: 'complementar',
    número_origem: 5,
    número_destino: 6,
    conexão_espiritual: 'O Hierofante oferece tradição; os Enamorados, escolha. A tradição informa a escolha.',
    lição_principal: 'A escolha amorosa pode ser informada pela tradição',
    prática_ritual: 'Use para decisões que combinam tradição e coração',
  },
  {
    arcano_origem: 'O Eremita',
    arcano_destino: 'O Carro',
    tipo_relação: 'complementar',
    número_origem: 9,
    número_destino: 7,
    conexão_espiritual: 'O Eremita busca a solidão; o Carro avança em sociedade. A integração pede tanto recolhimento quanto ação.',
    lição_principal: 'A alma encontra equilíbrio entre solidão e participação',
    prática_ritual: 'Use para integrar vida contemplativa com ativa',
  },
  {
    arcano_origem: 'A Roda da Fortuna',
    arcano_destino: 'A Justiça',
    tipo_relação: 'complementar',
    número_origem: 10,
    número_destino: 11,
    conexão_espiritual: 'A Roda traz destino; a Justiça traz equilíbrio. O destino pode ser reequilibrado pela ação justa.',
    lição_principal: 'O destino não é cego quando a justiça guia',
    prática_ritual: 'Use para work with karma and balanced action',
  },
  {
    arcano_origem: 'A Estrela',
    arcano_destino: 'O Julgamento',
    tipo_relação: 'complementar',
    número_origem: 17,
    número_destino: 20,
    conexão_espiritual: 'A Estrela traz esperança; o Julgamento traz avaliação. A esperança pede avaliação de seu chamado.',
    lição_principal: 'A esperança se concretiza no despertar',
    prática_ritual: 'Use para discernir chamados de esperança',
  },

  // ─── Shadow Work Connections ──────────────────────────────────────────────
  {
    arcano_origem: 'A Sacerdotisa',
    arcano_destino: 'A Morte',
    tipo_relação: 'sombra',
    número_origem: 2,
    número_destino: 13,
    conexão_espiritual: 'A Sacerdotisa guarda os segredos; a Morte os revela. Trabalhar com ambos integra a sombra.',
    lição_principal: 'Os segredos guardados incluem potenciais de morte e transformação',
    prática_ritual: 'Use para trabalho de integração da sombra',
  },
  {
    arcano_origem: 'A Justiça',
    arcano_destino: 'O Diabo',
    tipo_relação: 'sombra',
    número_origem: 11,
    número_destino: 15,
    conexão_espiritual: 'A Justiça representa o lado oculto do equilíbrio; o Diabo, a sombra do aprisionamento. O julgamento pode aprisionar.',
    lição_principal: 'O julgamento justo deve examinar suas próprias sombras',
    prática_ritual: 'Use para work with shadow aspects of judgment',
  },
  {
    arcano_origem: 'A Temperança',
    arcano_destino: 'A Lua',
    tipo_relação: 'sombra',
    número_origem: 14,
    número_destino: 18,
    conexão_espiritual: 'A Temperança busca equilíbrio; a Lua revela ilusões. O equilíbrio aparente pode mascarar ilusões.',
    lição_principal: 'O equilíbrio deve ser examinado por ilusões',
    prática_ritual: 'Use para examinar ilusões em torno do equilíbrio',
  },
  {
    arcano_origem: 'O Eremita',
    arcano_destino: 'A Torre',
    tipo_relação: 'sombra',
    número_origem: 9,
    número_destino: 16,
    conexão_espiritual: 'O Eremita busca luz na solidão; a Torre traz destruição. A busca solitária pode colapsar.',
    lição_principal: 'A luz interior pode ser atingida pela ruína',
    prática_ritual: 'Use para work with collapse of solitary paths',
  },

  // ─── Integration Themes ────────────────────────────────────────────────────
  {
    arcano_origem: 'O Louco',
    arcano_destino: 'O Eremita',
    tipo_relação: 'integração',
    número_origem: 0,
    número_destino: 9,
    conexão_espiritual: 'O Louco representa a liberdade antes da jornada; o Eremita, a sabedoria após. A integração pede ambos.',
    lição_principal: 'A liberdade verdadeira inclui a sabedoria da solidão',
    prática_ritual: 'Use para integração de liberdade e sabedoria',
  },
  {
    arcano_origem: 'O Mago',
    arcano_destino: 'O Hierofante',
    tipo_relação: 'integração',
    número_origem: 1,
    número_destino: 5,
    conexão_espiritual: 'O Mago manifesta; o Hierofante ensina. A integração pede dominar técnicas e transmiti-las.',
    lição_principal: 'O poder pessoal encontra propósito no ensinamento',
    prática_ritual: 'Use para integração de prática e ensino',
  },
  {
    arcano_origem: 'A Imperatriz',
    arcano_destino: 'A Justiça',
    tipo_relação: 'integração',
    número_origem: 3,
    número_destino: 11,
    conexão_espiritual: 'A Imperatriz cria; a Justiça balanceia. A criação pede equilíbrio para não se tornar obsessão.',
    lição_principal: 'A fertilidade criativa pede equilíbrio',
    prática_ritual: 'Use para integrar criatividade com justiça',
  },
  {
    arcano_origem: 'O Carro',
    arcano_destino: 'A Temperança',
    tipo_relação: 'integração',
    número_origem: 7,
    número_destino: 14,
    conexão_espiritual: 'O Carro conquista; a Temperança harmoniza. A vitória pede integração para ser sustentável.',
    lição_principal: 'A conquista sustentável pede equilíbrio',
    prática_ritual: 'Use para integrar vitória com harmonia',
  },
  {
    arcano_origem: 'A Roda da Fortuna',
    arcano_destino: 'O Mundo',
    tipo_relação: 'integração',
    número_origem: 10,
    número_destino: 21,
    conexão_espiritual: 'A Roda mostra o ciclo; o Mundo mostra a completude. A integração pede compreender o ciclo e completá-lo.',
    lição_principal: 'Compreender ciclos leva à completude',
    prática_ritual: 'Use para work with cyclical completion',
 },
  {
    arcano_origem: 'A Morte',
    arcano_destino: 'O Julgamento',
    tipo_relação: 'integração',
    número_origem: 13,
    número_destino: 20,
    conexão_espiritual: 'A Morte transforma; o Julgamento avalia. A integração pede transformar e depois avaliar o que foi.',
    lição_principal: 'A transformação pede autoavaliação',
    prática_ritual: 'Use para work with transformation and evaluation',
  },
  {
    arcano_origem: 'A Estrela',
    arcano_destino: 'O Mundo',
    tipo_relação: 'integração',
    número_origem: 17,
    número_destino: 21,
    conexão_espiritual: 'A Estrela traz esperança; o Mundo traz completude. A esperança integra-se na completude.',
    lição_principal: 'A esperança encontra sua expressão na completude',
    prática_ritual: 'Use para integrar esperança com realização',
  },
];

// Freeze the array to prevent modifications
Object.freeze(TAROT_TAROT_MAP);

/**
 * Get all Tarot-Tarot relationships for a given arcano
 * @param arcano - The arcano name
 * @returns Array of relationships involving this arcano
 */
export function getTarotTarot(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter(
    (m) => m.arcano_origem === arcano || m.arcano_destino === arcano
  );
}

/**
 * Get relationships between two specific arcanos
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns Array of relationships between the two arcanos
 */
export function getRelationBetweenArcanos(
  arcano1: string,
  arcano2: string
): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter(
    (m) =>
      (m.arcano_origem === arcano1 && m.arcano_destino === arcano2) ||
      (m.arcano_origem === arcano2 && m.arcano_destino === arcano1)
  );
}

/**
 * Get all relationships of a specific type
 * @param tipo - Type of relationship (sequencial, elemental, etc.)
 * @returns Array of relationships of that type
 */
export function getRelationsByType(
  tipo: TarotRelationType
): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.tipo_relação === tipo);
}

/**
 * Get all arcano names
 * @returns Array of all arcano names
 */
export function getAllArcanos(): ArcanoName[] {
  const arcanos = new Set<ArcanoName>();
  TAROT_TAROT_MAP.forEach((m) => {
    arcanos.add(m.arcano_origem);
    arcanos.add(m.arcano_destino);
  });
  return Array.from(arcanos).sort((a, b) => {
    const numA = TAROT_TAROT_MAP.find((m) => m.arcano_origem === a)?.número_origem ?? 0;
    const numB = TAROT_TAROT_MAP.find((m) => m.arcano_origem === b)?.número_origem ?? 0;
    return numA - numB;
  });
}

/**
 * Get the element for a given arcano
 * @param arcano - Arcano name
 * @returns Element or null if not found
 */
export function getElementoByArcano(
  arcano: string
): 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter' | null {
  return ELEMENTO_ARCANO[arcano as ArcanoName] ?? null;
}

/**
 * Get the archetype for a given arcano
 * @param arcano - Arcano name
 * @returns Archetype or null if not found
 */
export function getArquétipoByArcano(arcano: string): Arquétipo | null {
  return ARQUÉTIPO_ARCANO[arcano as ArcanoName] ?? null;
}

/**
 * Get all sequential relationships (the journey progression)
 * @returns Array of sequential relationships sorted by number
 */
export function getSequentialJourney(): TarotTarotMapping[] {
  return getRelationsByType('sequencial').sort(
    (a, b) => a.número_origem - b.número_origem
  );
}

/**
 * Get all elemental relationships
 * @returns Array of elemental relationships
 */
export function getElementalRelationships(): TarotTarotMapping[] {
  return getRelationsByType('elemental');
}

/**
 * Get all opposite/contrast relationships
 * @returns Array of opposite relationships
 */
export function getOppositeRelationships(): TarotTarotMapping[] {
  return getRelationsByType('oposto');
}

/**
 * Get the next arcano in the journey
 * @param arcano - Current arcano name
 * @returns Next arcano in the journey or null if at the end
 */
export function getNextArcano(arcano: string): ArcanoName | null {
  const sequential = getSequentialJourney();
  const current = sequential.find(
    (m) => m.arcano_origem === arcano || m.arcano_destino === arcano
  );
  if (!current) return null;
  if (current.arcano_origem === arcano && current.tipo_relação === 'sequencial') {
    return current.arcano_destino as ArcanoName;
  }
  // Find the next sequential relationship
  const nextSeq = sequential.find(
    (m) => m.número_origem === current.número_destino
  );
  return nextSeq?.arcano_destino as ArcanoName ?? null;
}

/**
 * Get all arcano numbers
 * @returns Map of arcano names to their numbers
 */
export function getArcanoNumbers(): Record<string, number> {
  const result: Record<string, number> = {};
  TAROT_TAROT_MAP.forEach((m) => {
    if (!(m.arcano_origem in result)) {
      result[m.arcano_origem] = m.número_origem;
    }
  });
  return result;
}

/**
 * Check if an arcano exists
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in the mapping
 */
export function hasArcano(arcano: string): boolean {
  return arcano in ELEMENTO_ARCANO;
}

/**
 * Get the number for a given arcano
 * @param arcano - Arcano name
 * @returns Card number (0-21) or null if not found
 */
export function getArcanoNumber(arcano: string): number | null {
  const mapping = TAROT_TAROT_MAP.find((m) => m.arcano_origem === arcano);
  return mapping?.número_origem ?? null;
}

/**
 * Get arcanos by archetype
 * @param arquétipo - Archetype to filter by
 * @returns Array of arcano names with that archetype
 */
export function getArcanosByArquétipo(arquétipo: Arquétipo): ArcanoName[] {
  return Object.entries(ARQUÉTIPO_ARCANO)
    .filter(([, arch]) => arch === arquétipo)
    .map(([name]) => name as ArcanoName);
}

/**
 * Get arcanos by element
 * @param elemento - Element to filter by
 * @returns Array of arcano names with that element
 */
export function getArcanosByElemento(
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter'
): ArcanoName[] {
  return Object.entries(ELEMENTO_ARCANO)
    .filter(([, elem]) => elem === elemento)
    .map(([name]) => name as ArcanoName);
}

/**
 * Get all relationships involving an arcano as origin
 * @param arcano - Arcano name
 * @returns Array of relationships where this arcano is the origin
 */
export function getRelationshipsFrom(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.arcano_origem === arcano);
}

/**
 * Get all relationships involving an arcano as destination
 * @param arcano - Arcano name
 * @returns Array of relationships where this arcano is the destination
 */
export function getRelationshipsTo(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.arcano_destino === arcano);
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarot,
  getRelationBetweenArcanos,
  getRelationsByType,
  getAllArcanos,
  getElementoByArcano,
  getArquétipoByArcano,
  getSequentialJourney,
  getElementalRelationships,
  getOppositeRelationships,
  getNextArcano,
  getArcanoNumbers,
  hasArcano,
  getArcanoNumber,
  getArcanosByArquétipo,
  getArcanosByElemento,
  getRelationshipsFrom,
  getRelationshipsTo,
  TAROT_TAROT_MAP,
  ELEMENTO_ARCANO,
  ARQUÉTIPO_ARCANO,
};
