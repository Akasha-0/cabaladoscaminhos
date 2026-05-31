/**
 * Tarot-Tarot Spiritual Correlation
 * Maps spiritual relationships between Tarot Major Arcana cards based on
 * elemental affinities, archetypal connections, numerological links, and thematic groupings.
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export type TarotRelationshipType =
  | 'elemental' // Same element connection
  | 'sequential' // Adjacent in the Fool's Journey
  | 'opposing'       // Dialectical tension
  | 'complementary'  // Archetypal completion
  | 'ascending'      // Spiritual progression
  | 'descending'     // Material descent
  | 'numerological'  // Same numerology number
  | 'shadow_light'; // Light/shadow pair

export interface TarotTarotMapping {
  /** Source arcano name */
  arcano: string;
  /** Source arcano number (0-21) */
  arcano_numero: number;
  /** Related arcano name */
  related_arcano: string;
  /** Related arcano number (0-21) */
  related_numero: number;
  /** Type of relationship */
  relationship_type: TarotRelationshipType;
  /** Spiritual meaning of the connection */
  spiritual_meaning: string;
  /** Energy flow direction */
  energy_flow: 'bidirectional' | 'arcano_to_related' | 'related_to_arcano';
}

/**
 * Complete mapping of Tarot card-to-card relationships.
 * Based on elemental correspondences, archetypal progressions, and thematic links.
 */
export const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  // ─── Elemental Fire Connections ─────────────────────────────────────────────
  {
    arcano: 'O Mago',
    arcano_numero: 1,
    related_arcano: 'O Hierofante',
    related_numero: 4,
    relationship_type: 'elemental',
    spiritual_meaning: 'O Mago (1) e O Hierofante (4) compartilham a energia do Fogo. O Mago representa a vontade sagrada que manifesta, enquanto o Hierofante transmite a sabedoria da tradição. Juntos, eles simbolizam a桥梁 entre a intenção e a tradição, entre o poder pessoal e a autoridade espiritual.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Mago',
    arcano_numero: 1,
    related_arcano: 'O Imperador',
    related_numero: 4,
    relationship_type: 'ascending',
    spiritual_meaning: 'O Mago (1) é a semente da vontade que O Imperador (4) desenvolve em estrutura e autoridade. O Mago manifesta o potencial criativo; O Imperador organiza esse potencial em forma concreta. A jornada do1 ao 4 representa a transformação da intenção em implementação.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Imperador',
    arcano_numero: 4,
    related_arcano: 'A Torre',
    related_numero: 16,
    relationship_type: 'opposing',
    spiritual_meaning: 'O Imperador (4) representa a ordem estruturada que a Torre (16) destrói. Esta relação simboliza o colapso inevitável de sistemas rígidos. O Imperador constrói muros; a Torre os derruba. Esta tensão é necessária para a evolução espiritual.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Hierofante',
    arcano_numero: 5,
    related_arcano: 'O Papa',
    related_numero: 5,
    relationship_type: 'numerological',
    spiritual_meaning: 'O Hierofante (5) em sua forma numerológica 5 representa a ponte entre o humano e o divino. Esta energia de5 é o número do Mestre, do professor que eleva. A conexão numerológica 5 une todas as manifestações de transformação e liberdade.',
    energy_flow: 'bidirectional',
  },

  // ─── Elemental Water Connections ───────────────────────────────────────────
  {
    arcano: 'A Sacerdotisa',
    arcano_numero: 2,
    related_arcano: 'A Lua',
    related_numero: 18,
    relationship_type: 'elemental',
    spiritual_meaning: 'A Sacerdotisa (2) e A Lua (18) compartilham a energia da Água. A Sacerdotisa é a guardiã dos mistérios no silêncio; a Lua traz os mistérios para o inconsciente. Juntas, elas representam o véu entre os mundos e os ciclos das águas emocionais.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Sacerdotisa',
    arcano_numero: 2,
    related_arcano: 'A Grande Sacerdotisa',
    related_numero: 2,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Sacerdotisa (2) contém em si tanto a luz quanto a sombra. Como guardiã do véu, ela é tanto a reveladora quanto a ocultadora. Esta dualidade interna representa o equilíbrio entre conhecimento visível e oculto.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Imperatriz',
    arcano_numero: 3,
    related_arcano: 'A Lua',
    related_numero: 18,
    relationship_type: 'complementary',
    spiritual_meaning: 'A Imperatriz (3) nutre com fertilidade da Terra; a Lua (18) traz a energia das águas emocionais para completar o ciclo. A Imperatriz é a mãe física; a Lua é a mãe emocional. Juntas, elas completam o arquétipo da Grande Mãe.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Imperatriz',
    arcano_numero: 3,
    related_arcano: 'Iemanjá',
    related_numero: 3,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Imperatriz (3) é a expressão tarotística de Iemanjá, a Grande Mãe das águas. Esta conexão une o arquétipo ocidental da Imperatriz com a divindade africana de Iemanjá, trazida pela cultura do Candomblé.',
    energy_flow: 'bidirectional',
  },

  // ─── Elemental Air Connections ──────────────────────────────────────────────
  {
    arcano: 'Os Enamorados',
    arcano_numero: 6,
    related_arcano: 'O Louco',
    related_numero: 0,
    relationship_type: 'sequential',
    spiritual_meaning: 'Os Enamorados (6) representam a escolha do coração; O Louco (0) representa a liberdade de seguir essa escolha sem medo. A jornada do6 ao 0 simboliza o salto de fé que o amor verdadeiro exige, abandonando a segurança para seguir o coração.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Louco',
    arcano_numero: 0,
    related_arcano: 'O Mago',
    related_numero: 1,
    relationship_type: 'ascending',
    spiritual_meaning: 'O Louco (0) carrega o potencial infinito que O Mago (1) começa a manifestar. O Louco é o silêncio antes da palavra; O Mago é a palavra que cria. Esta conexão representa o início da jornada de manifestação.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Louco',
    arcano_numero: 0,
    related_arcano: 'O Mundo',
    related_numero: 21,
    relationship_type: 'ascending',
    spiritual_meaning: 'O Louco (0) e O Mundo (21) são os extremos da jornada: o início selvagem e o retorno sagrado. A jornada do0 ao 21 representa o ciclo completo da experiência humana, de volta à fonte com a sabedoria ganha.',
    energy_flow: 'arcano_to_related',
  },

  // ─── Elemental Earth Connections ────────────────────────────────────────────
  {
    arcano: 'O Imperador',
    arcano_numero: 4,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    relationship_type: 'complementary',
    spiritual_meaning: 'O Imperador (4) e A Imperatriz (3) representam a dualidade criadora: o princípio masculino da ordem e o princípio feminino da fertilidade. Juntos, eles formam a base da família sagrada, o trono e a fertile terra que sustenta a civilização.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Hierofante',
    arcano_numero: 5,
    related_arcano: 'O Mago',
    related_numero: 1,
    relationship_type: 'elemental',
    spiritual_meaning: 'O Hierofante (5) e O Mago (1) compartilham a energia do Fogo. O Mago é a centelha da vontade; o Hierofante é a chama da tradição. O Mago manifesta; o Hierofante preserva e transmite o conhecimento sagrado.',
    energy_flow: 'bidirectional',
  },

  // ─── The Fool's Journey Sequential Connections ─────────────────────────────
  {
    arcano: 'O Mago',
    arcano_numero: 1,
    related_arcano: 'A Sacerdotisa',
    related_numero: 2,
    relationship_type: 'sequential',
    spiritual_meaning: 'O Mago (1) ativa a vontade; A Sacerdotisa (2) revela o mistério. Esta sequência representa a transição da ação para a receptividade, do fazer para o saber. O Mago age; a Sacerdotisa observa e interpreta.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'A Sacerdotisa',
    arcano_numero: 2,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    relationship_type: 'sequential',
    spiritual_meaning: 'A Sacerdotisa (2) guarda o conhecimento; A Imperatriz (3) cria a partir dele. Esta sequência representa a transição do saber para o criar, da sabedoria oculta para a manifestação fértil. A Sacerdotisa contém; a Imperatriz dá à luz.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'A Imperatriz',
    arcano_numero: 3,
    related_arcano: 'O Imperador',
    related_numero: 4,
    relationship_type: 'sequential',
    spiritual_meaning: 'A Imperatriz (3) nutre; O Imperador (4) organiza. Esta sequência representa a transição do cuidado para a estrutura, da fertilidade para a autoridade. A Imperatriz dá vida; o Imperador estabelece ordem.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Imperador',
    arcano_numero: 4,
    related_arcano: 'O Hierofante',
    related_numero: 5,
    relationship_type: 'sequential',
    spiritual_meaning: 'O Imperador (4) governa pelo poder terreno; O Hierofante (5) governa pela sabedoria espiritual. Esta sequência representa a transição do reino material para o espiritual, da autoridade terrena para a divina.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Hierofante',
    arcano_numero: 5,
    related_arcano: 'Os Enamorados',
    related_numero: 6,
    relationship_type: 'sequential',
    spiritual_meaning: 'O Hierofante (5) ensina a tradição; Os Enamorados (6) vivem a escolha pessoal. Esta sequência representa a transição do conhecimento herdado para a sabedoria pessoal, da obediência para a autonomia do coração.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'Os Enamorados',
    arcano_numero: 6,
    related_arcano: 'O Carro',
    related_numero: 7,
    relationship_type: 'sequential',
    spiritual_meaning: 'Os Enamorados (6) escolhem; O Carro (7) age sobre essa escolha. Esta sequência representa a transição da decisão para a conquista, do coração para a vontade. O amor escolhe; o Carro triunfa.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Carro',
    arcano_numero: 7,
    related_arcano: 'A Justiça',
    related_numero: 11,
    relationship_type: 'sequential',
    spiritual_meaning: 'O Carro (7) conquista; A Justiça (11) equilibra. Esta sequência representa a transição da conquista para a retidão, da vitória para a verdade. O Carro vence batalhas; a Justiça avalia as consequências.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'A Justiça',
    arcano_numero: 11,
    related_arcano: 'O Eremita',
    related_numero: 9,
    relationship_type: 'descending',
    spiritual_meaning: 'A Justiça (11) busca a verdade exterior; O Eremita (9) busca a verdade interior. Esta sequência representa a transição da justiça social para a sabedoria pessoal, do equilibrio externo para a iluminação interna.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Eremita',
    arcano_numero: 9,
    related_arcano: 'A Forca',
    related_numero: 12,
    relationship_type: 'complementary',
    spiritual_meaning: 'O Eremita (9) busca a luz; A Forca (12) encontra-a através da inversão. Esta relação representa o paradoxo espiritual: a sabedoria vem através da entrega, não da busca. O Eremita ilumina; a Forca é iluminada pela escuridão voluntária.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Forca',
    arcano_numero: 12,
    related_arcano: 'A Torre',
    related_numero: 16,
    relationship_type: 'opposing',
    spiritual_meaning: 'A Forca (12) aceita o sacrifício voluntariamente; A Torre (16) impõe destruição súbita. Esta relação representa a diferença entre sacrifício consciente e colapso inconsciente. A Forca escolhe a inversão; a Torre não escolhe nada.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Torre',
    arcano_numero: 16,
    related_arcano: 'A Estrela',
    related_numero: 17,
    relationship_type: 'ascending',
    spiritual_meaning: 'A Torre (16) destrói para que A Estrela (17) possa brilhar. Esta sequência representa a transição do colapso para a esperança, da destruição para a regeneração. A Torre limpa o terreno; a Estrela semeia novas possibilidades.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'A Estrela',
    arcano_numero: 17,
    related_arcano: 'A Lua',
    related_numero: 18,
    relationship_type: 'sequential',
    spiritual_meaning: 'A Estrela (17) brilha com esperança; A Lua (18) traz as águas do inconsciente. Esta sequência representa a transição da esperança clara para os mistérios emocionais. A Estrela aponta o caminho; a Lua revela os obstáculos.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'A Lua',
    arcano_numero: 18,
    related_arcano: 'O Sol',
    related_numero: 19,
    relationship_type: 'ascending',
    spiritual_meaning: 'A Lua (18) dissolve ilusões; O Sol (19) revela a verdade. Esta sequência representa a transição da escuridão para a luz, do inconsciente para a consciência clara. A Lua ilumina os medos; o Sol os transfigura em alegria.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Sol',
    arcano_numero: 19,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    relationship_type: 'sequential',
    spiritual_meaning: 'O Sol (19) brilha com alegria infantil; O Julgamento (20) traz a sabedoria da avaliação. Esta sequência representa a transição da felicidade simples para a compreensão profunda, da alegria para a consciência.',
    energy_flow: 'arcano_to_related',
  },
  {
    arcano: 'O Julgamento',
    arcano_numero: 20,
    related_arcano: 'O Mundo',
    related_numero: 21,
    relationship_type: 'sequential',
    spiritual_meaning: 'O Julgamento (20) avalia a jornada; O Mundo (21) completa o ciclo. Esta sequência representa a transição da avaliação para a integração, do julgamento para a aceitação total. O Julgamento reconcilia; o Mundo celebra.',
    energy_flow: 'arcano_to_related',
  },

  // ─── Shadow/Light Archetypal Pairs ─────────────────────────────────────────
  {
    arcano: 'A Justiça',
    arcano_numero: 11,
    related_arcano: 'A Torre',
    related_numero: 16,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Justiça (11) busca a verdade e a retidão; A Torre (16) revela a verdade através da destruição. Esta relação representa o paradoxo da verdade: às vezes ela liberta suavemente, outras vezes através do colapso. A Justiça espera; a Torre não.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Força',
    arcano_numero: 8,
    related_arcano: 'A Justiça',
    related_numero: 11,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Força (8) doma a besta com ternura; A Justiça (11) julga com rigor. Esta relação representa a tensão entre compaixão e verdade. A Força柔性; a Justiça刚性. Juntas, elas representam o equilíbrio entre coração e mente.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Diabo',
    arcano_numero: 15,
    related_arcano: 'A Torre',
    related_numero: 16,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Diabo (15) prende através da addictividade; A Torre (16) liberta através da destruição. Esta relação representa a libertação forçada versus a libertação elegida. O Diabo mantém na escuridão; a Torre explode para a luz.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Estrela',
    arcano_numero: 17,
    related_arcano: 'O Diabo',
    related_numero: 15,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Estrela (17) oferece esperança e cura; O Diabo (15) representa a addictividade e prisão. Esta relação representa a luta entre luz e escuridão interior. A Estrela liberta através da fé; o Diabo prende através do medo.',
    energy_flow: 'bidirectional',
  },

  // ─── Numerological Connections ───────────────────────────────────────────────
  {
    arcano: 'A Sacerdotisa',
    arcano_numero: 2,
    related_arcano: 'A Grande Sacerdotisa',
    related_numero: 2,
    relationship_type: 'numerological',
    spiritual_meaning: 'O número 2 representa a dualidade, o véu entre os mundos. A Sacerdotisa guarda este mistério da dualidade. Esta conexão numerológica une todos os aspectos do número 2: polaridade, receptividade, intuição e mistério.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Imperatriz',
    arcano_numero: 3,
    related_arcano: 'A Imperadora',
    related_numero: 3,
    relationship_type: 'numerological',
    spiritual_meaning: 'O número 3 representa a fertilidade criativa e a expressão. A Imperatriz encarna esta energia de criação. Esta conexão numerológica une todos os aspectos do número 3: abundância, natureza, fertilidade e arte.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Imperador',
    arcano_numero: 4,
    related_arcano: 'O Imperador',
    related_numero: 4,
    relationship_type: 'numerological',
    spiritual_meaning: 'O número 4 representa a estrutura e a ordem. O Imperador governa através desta energia. Esta conexão numerológica une todos os aspectos do número 4: disciplina, autoridade, limites e organização.',
    energy_flow: 'bidirectional',
  },

  // ─── Major Arcana Cross-Tradition Connections ───────────────────────────────
  {
    arcano: 'O Louco',
    arcano_numero: 0,
    related_arcano: 'Oxalá',
    related_numero: 0,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Louco (0) representa a pureza original de Oxalá, o Criador. O Louco é a vacuidade sagrada de onde tudo emerge; Oxalá é a origem de toda a vida. Esta conexão une o arquétipo ocidental com a divindade africana do início.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Mago',
    arcano_numero: 1,
    related_arcano: 'Ogum',
    related_numero: 1,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Mago (1) manifesta a vontade; Ogum abre os caminhos para essa manifestação. O Mago é a intenção; Ogum é a espada que corta os obstáculos. Esta conexão une o arquétipo ocidental com a divindade africana da conquista.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Sacerdotisa',
    arcano_numero: 2,
    related_arcano: 'Ibeji',
    related_numero: 2,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Sacerdotisa (2) guarda os mistérios; Ibeji são os gêmeos sagrados que habitam entre os mundos. A Sacerdotisa contém; Ibeji habitam o conteúdo. Esta conexão une o arquétipo ocidental com a divindade africana dos gêmeos.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Imperatriz',
    arcano_numero: 3,
    related_arcano: 'Iemanjá',
    related_numero: 3,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Imperatriz (3) nutre a vida; Iemanjá é a Mãe das Águas que sustenta toda existência. A Imperatriz é a mãe física; Iemanjá é a mãe espiritual das águas. Esta conexão une o arquétipo ocidental com a divindade africana das águas.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Hierofante',
    arcano_numero: 5,
    related_arcano: 'Oxum',
    related_numero: 5,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Hierofante (5) transmite a tradição sagrada; Oxum guarda os segredos do amor e da riqueza. O Hierofante é o mestre exterior; Oxum é a sabedoria interior do coração. Esta conexão une o arquétipo ocidental com a divindade africana do amor.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'Os Enamorados',
    arcano_numero: 6,
    related_arcano: 'Oxum',
    related_numero: 6,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'Os Enamorados (6) vivem a escolha do amor; Oxum é a senhora do amor e das águas doces. A escolha dos Enamorados é guiada pela energia de Oxum. Esta conexão une o arquétipo ocidental com a divindade africana do amor.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Carro',
    arcano_numero: 7,
    related_arcano: 'Ogum',
    related_numero: 7,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Carro (7) conquista com determinação; Ogum é o deus da guerra e dos caminhos. O Carro é a vitória conquistada; Ogum é a força que a conquista. Esta conexão une o arquétipo ocidental com a divindade africana da batalha.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Justiça',
    arcano_numero: 11,
    related_arcano: 'Xangô',
    related_numero: 11,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Justiça (11) julga com equilíbrio; Xangô governa com a justiça do raio. A Justiça é o princípio da verdade; Xangô é o raio que a revela. Esta conexão une o arquétipo ocidental com a divindade africana da justiça.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Torre',
    arcano_numero: 16,
    related_arcano: 'Xangô',
    related_numero: 16,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Torre (16) cai sob o raio da verdade; Xangô é o senhor dos raios. A Torre é a destruição pelo raio; Xangô é o raio personificado. Esta conexão une o arquétipo ocidental com a divindade africana do raio.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Sol',
    arcano_numero: 19,
    related_arcano: 'Oxalá',
    related_numero: 19,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Sol (19) brilha com alegria; Oxalá é a luz branca da paz e da criação. O Sol é a alegria exterior; Oxalá é a paz interior. Esta conexão une o arquétipo ocidental com a divindade africana da luz.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Lua',
    arcano_numero: 18,
    related_arcano: 'Iemanjá',
    related_numero: 18,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Lua (18) governa as águas emocionais; Iemanjá é a Rainha das Águas. A Lua reflete a luz; Iemanjá reflete a vontade divina. Esta conexão une o arquétipo ocidental com a divindade africana das águas.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Mundo',
    arcano_numero: 21,
    related_arcano: 'Oxumaré',
    related_numero: 21,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Mundo (21) representa a completude do ciclo; Oxumaré é o arco-íris que completa o ciclo das águas. O Mundo é a integração; Oxumaré é a promessa de renovação. Esta conexão une o arquétipo ocidental com a divindade africana do ciclo.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Eremita',
    arcano_numero: 9,
    related_arcano: 'Oxóssi',
    related_numero: 9,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Eremita (9) busca a luz interior; Oxóssi é o caçador que busca a provisão. O Eremita busca a sabedoria; Oxóssi busca o sustento. Esta conexão une o arquétipo ocidental com a divindade africana da busca.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Forca',
    arcano_numero: 12,
    related_arcano: 'Omolu',
    related_numero: 12,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Forca (12) representa o sacrifício consciente; Omolu é o senhor das doenças e da cura. A Forca é a entrega voluntária; Omolu é a transformação através da dor. Esta conexão une o arquétipo ocidental com a divindade africana da transformação.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Estrela',
    arcano_numero: 17,
    related_arcano: 'Oxum',
    related_numero: 17,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Estrela (17) derrama água de esperança; Oxum é a senhora das águas doces e do ouro. A Estrela lava; Oxum purifica. Esta conexão une o arquétipo ocidental com a divindade africana da purificação.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Diabo',
    arcano_numero: 15,
    related_arcano: 'Nanã',
    related_numero: 15,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Diabo (15) representa a prisão nas sombras; Nanã é a anciã que guarda os segredos da escuridão. O Diabo prende; Nanã transforma a escuridão em sabedoria. Esta conexão une o arquétipo ocidental com a divindade africana da sabedoria oculta.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'O Julgamento',
    arcano_numero: 20,
    related_arcano: 'Iansã',
    related_numero: 20,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'O Julgamento (20) chama à renovação; Iansã é a guerreira dos raios e ventos. O Julgamento é o chamado; Iansã é a resposta guerreira. Esta conexão une o arquétipo ocidental com a divindade africana da renovação.',
    energy_flow: 'bidirectional',
  },
  {
    arcano: 'A Força',
    arcano_numero: 8,
    related_arcano: 'Iansã',
    related_numero: 8,
    relationship_type: 'shadow_light',
    spiritual_meaning: 'A Força (8) doma a besta com ternura interior; Iansã é a guerreira que vence com coragem. A Força é a gentleness; Iansã é a bravura. Esta conexão une o arquétipo ocidental com a divindade africana da coragem.',
    energy_flow: 'bidirectional',
  },
];

// Freeze the mapping array to prevent modifications
Object.freeze(TAROT_TAROT_MAP);

/**
 * Get the relationship between two Tarot cards
 * @param arcano - Source arcano name
 * @param relatedArcano - Related arcano name
 * @returns The relationship mapping or undefined if not found
 */
export function getTarotTarot(
  arcano: string,
  relatedArcano: string
): TarotTarotMapping | undefined {
  return TAROT_TAROT_MAP.find(
    (m) =>
      (m.arcano.toLowerCase() === arcano.toLowerCase() &&
        m.related_arcano.toLowerCase() === relatedArcano.toLowerCase()) ||
      (m.arcano.toLowerCase() === relatedArcano.toLowerCase() &&
        m.related_arcano.toLowerCase() === arcano.toLowerCase())
  );
}

/**
 * Get all relationships for a specific Tarot card
 * @param arcano - Arcano name
 * @returns Array of TarotTarotMapping objects where the arcano appears
 */
export function getAllTarotRelations(arcano: string): TarotTarotMapping[] {
  const normalized = arcano.toLowerCase();
  return TAROT_TAROT_MAP.filter(
    (m) =>
      m.arcano.toLowerCase() === normalized ||
      m.related_arcano.toLowerCase() === normalized
  );
}

/**
 * Get all Tarot-Tarot relationships
 * @returns Array of all TarotTarotMapping objects
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

/**
 * Get relationships by type
 * @param type - Relationship type filter
 * @returns Array of TarotTarotMapping objects of the specified type
 */
export function getRelationshipsByType(
  type: TarotRelationshipType
): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.relationship_type === type);
}

/**
 * Get Tarot cards that have bidirectional energy flow with a given card
 * @param arcano - Arcano name
 * @returns Array of related arcano names with bidirectional energy
 */
export function getBidirectionalTarots(arcano: string): string[] {
  const normalized = arcano.toLowerCase();
  const relations = TAROT_TAROT_MAP.filter(
    (m) =>
      m.energy_flow === 'bidirectional' &&
      (m.arcano.toLowerCase() === normalized ||
        m.related_arcano.toLowerCase() === normalized)
  );

  return relations.map((r) =>
    r.arcano.toLowerCase() === normalized
      ? r.related_arcano
      : r.arcano
  );
}

/**
 * Get sequential relationships (adjacent in the Fool's Journey)
 * @param arcano - Arcano name
 * @returns Array of adjacent arcano names in the journey
 */
export function getSequentialArcanos(arcano: string): string[] {
  const normalized = arcano.toLowerCase();
  const relations = TAROT_TAROT_MAP.filter(
    (m) =>
      m.relationship_type === 'sequential' &&
      (m.arcano.toLowerCase() === normalized ||
        m.related_arcano.toLowerCase() === normalized)
  );

  return relations.map((r) =>
    r.arcano.toLowerCase() === normalized
      ? r.related_arcano
      : r.arcano
  );
}

/**
 * Get all arcano names that have relationships
 * @returns Array of unique arcano names
 */
export function getAllArcanos(): string[] {
  const arcanos = new Set<string>();
  TAROT_TAROT_MAP.forEach((m) => {
    arcanos.add(m.arcano);
    arcanos.add(m.related_arcano);
  });
  return Array.from(arcanos).sort();
}

/**
 * Check if an arcano has any relationships
 * @param arcano - Arcano name
 * @returns True if arcano has relationships
 */
export function hasTarotRelations(arcano: string): boolean {
  const normalized = arcano.toLowerCase();
  return TAROT_TAROT_MAP.some(
    (m) =>
      m.arcano.toLowerCase() === normalized ||
      m.related_arcano.toLowerCase() === normalized
  );
}

/**
 * Get the count of relationships for each relationship type
 * @returns Object with counts per relationship type
 */
export function getRelationshipTypeCounts(): Record<TarotRelationshipType, number> {
  const counts: Record<TarotRelationshipType, number> = {
    elemental: 0,
    sequential: 0,
    opposing: 0,
    complementary: 0,
    ascending: 0,
    descending: 0,
    numerological: 0,
    shadow_light: 0,
  };

  TAROT_TAROT_MAP.forEach((m) => {
    counts[m.relationship_type]++;
  });

  return counts;
}

// Required aliases per acceptance criteria
export const getTarotTarots = getAllTarotTarots;
export const getAllTarotRellations = getAllTarotRelations;
export const getTarotRelations = getAllTarotRelations;

/**
 * Default export with all functions
 */
export default {
  getTarotTarot,
  getAllTarotRelations,
  getAllTarotTarots,
  getRelationshipsByType,
  getBidirectionalTarots,
  getSequentialArcanos,
  getAllArcanos,
  hasTarotRelations,
  getRelationshipTypeCounts,
  getTarotTarots,
  getAllTarotRellations,
  getTarotRelations,
};
