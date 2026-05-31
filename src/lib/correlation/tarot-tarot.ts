/**
 * ════════════════════════════════════════════════════════════════════════════
 * TAROT-TAROT SPIRITUAL CORRELATION
 * Correlates two Major Arcana cards revealing their spiritual relationship
 * ════════════════════════════════════════════════════════════════════════════
 */

/**
 * Relationship types between Tarot cards
 */
export type RelacaoTipo =
  | 'complementar'        // Opposite energies that balance each other
  | 'elemental'            // Same element connection
  | 'sequencial'           // Consecutive cards in the journey
  | 'cármico'              // Past-life or destiny connection
  | 'sombra'               // Light/shadow pair
  | 'ascensão'             // Spiritual progression
  | 'canalização'          // Energy conduit between cards
  | 'projeção'             // Projection of one card onto another
  | 'transformação'        // One card transforms into another
  | 'ressonância'          // Harmonic frequency match
  | 'tensão'               // Challenging/opposing dynamic
  | 'síntese';             // Integration of both energies

/**
 * Represents the spiritual correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** Source arcano name */
  arcano_origem: string;
  /** Source card number (0-21) */
  numero_origem: number;
  /** Target arcano name */
  arcano_alvo: string;
  /** Target card number (0-21) */
  numero_alvo: number;
  /** Type of relationship between the cards */
  tipo_relação: RelacaoTipo;
  /** Spiritual meaning of this card-card relationship */
  significado_espiritual: string;
  /** How the two archetypes interact */
  interação_arquetípica: string;
  /** Combined energy when both cards appear together */
  energia_combinada: string;
  /** Key lesson from this card combination */
  lição: string;
  /** Affirmation for harmonizing both energies */
  afirmação: string;
  /** Whether this is a master card relationship (involves 0, 11, 22) */
  é_mestre: boolean;
}

/**
 * The 22 Major Arcana names in order
 */
export const ARCANOS_MAIORES: string[] = [
  'O Louco',           // 0
  'A Sacerdotisa',     // 1
  'A Imperatriz',      // 2
  'A Imperadora',      // 3
  'O Imperador',       // 4
  'O Hierofante',      // 5
  'Os Enamorados',     // 6
  'O Carro',           // 7
  'A Justiça',         // 8
  'O Eremita',         // 9
  'A Roda da Fortuna', // 10
  'A Força',           // 11
  'O Enforcado',       // 12
  'A Morte',           // 13
  'A Temperança',      // 14
  'O Diabo',           // 15
  'A Torre',           // 16
  'A Estrela',         // 17
  'A Lua',             // 18
  'O Sol',             // 19
  'O Julgamento',      // 20
  'O Mundo',           // 21
];

// Freeze the array to prevent modifications
Object.freeze(ARCANOS_MAIORES);

/**
 * Complete mapping of Tarot-Tarot spiritual correlations.
 * Each entry represents the relationship when card A appears with card B.
 * Note: Relationships are directional (source → target).
 */
export const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  // ─── O Louco (0) relationships ───────────────────────────────────────────────
  {
    arcano_origem: 'O Louco',
    numero_origem: 0,
    arcano_alvo: 'O Mundo',
    numero_alvo: 21,
    tipo_relação: 'ascensão',
    significado_espiritual: 'O ciclo completo da jornada espiritual. Do potencial puro selvagem à integração da consciência. O Louco inicia a jornada e O Mundo a completa, representando o retorno ao ponto de origem com sabedoria conquistada.',
    interação_arquetípica: 'Iniciação e Realização - O Louco é o potencial não realizado, O Mundo é esse potencial tornado manifesto.',
    energia_combinada: 'Consciência cósmica integrada com espontaneidade divina. A liberdade última após a jornada completa.',
    lição: 'A jornada completa está em confiar no processo, mesmo quando o destino parece incerto.',
    afirmação: 'Eu completo minha jornada sagrada com alegria, integrando toda experiência vivida.',
    é_mestre: true,
  },
  {
    arcano_origem: 'O Louco',
    numero_origem: 0,
    arcano_alvo: 'A Imperatriz',
    numero_alvo: 3,
    tipo_relação: 'canalização',
    significado_espiritual: 'A energia criativa selvagem do Louco se canaliza na fertilidade criativa da Imperatriz. A liberdade bruta encontra sua expressão na criação manifestada.',
    interação_arquetípica: 'Potencial e Manifestação - O Louco contém todas as possibilidades; a Imperatriz as traz à existência.',
    energia_combinada: 'Criatividade selvagem em plena floração. A musa inspira a artista.',
    lição: 'Sua espontaneidade é uma forma sagrada de criação. Confie em sua expressão natural.',
    afirmação: 'Eu permito que minha criatividade flua naturalmente, criando com alegria e sem esforço.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Louco',
    numero_origem: 0,
    arcano_alvo: 'O Carro',
    numero_alvo: 7,
    tipo_relação: 'transformação',
    significado_espiritual: 'A energia do salto cego do Louco se transforma na determinação victoriosa do Carro. A vontade de avançar surge quando abandonamos o medo.',
    interação_arquetípica: 'Confiança e Vontade - O Louco ensina a confiar; o Carro ensina a avançar com essa confiança.',
    energia_combinada: 'Coragem espontânea e direção determinada. A vontade divinamente inspirada.',
    lição: 'Quando você confia no caminho, a vitória vem naturalmente.',
    afirmação: 'Eu avanço com confiança, conquistando meus objetivos com graça e determinação.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Louco',
    numero_origem: 0,
    arcano_alvo: 'A Estrela',
    numero_alvo: 17,
    tipo_relação: 'ascensão',
    significado_espiritual: 'A luz interior do Louco se projeta nas estrelas. A esperança divina que guia o viajante emerge quando abandonamos as amarras do convencional.',
    interação_arquetípica: 'Liberdade e Esperança - O Louco liberta; a Estrela ilumina o caminho da liberdade.',
    energia_combinada: 'Luz-guia para a jornada espiritual. Esperança renovada em cada amanhecer.',
    lição: 'Sua luz interior é mais brilhante quando você se permite ser quem realmente é.',
    afirmação: 'Eu brilho com minha luz única, guiando a mim mesmo e aos outros com esperança.',
    é_mestre: false,
  },

  // ─── A Sacerdotisa (1) relationships ───────────────────────────────────────
  {
    arcano_origem: 'A Sacerdotisa',
    numero_origem: 1,
    arcano_alvo: 'A Imperadora',
    numero_alvo: 3,
    tipo_relação: 'projeção',
    significado_espiritual: 'A sabedoria intuitiva da Sacerdotisa se projeta na sabedoria prática da Imperadora. O conhecimento oculto encontra sua aplicação terrena.',
    interação_arquetípica: 'Intuição e Prática - A Sacerdotisa vê; a Imperadora faz baseado nessa visão.',
    energia_combinada: 'Sabedoria aplicada com discernimento profundo. A guru que também é empreendedora.',
    lição: 'Suas visões intuitivas são valiosas quando você as traz para o mundo concreto.',
    afirmação: 'Eu integro minha sabedoria intuitiva com ação prática, manifestando minha visão.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Sacerdotisa',
    numero_origem: 1,
    arcano_alvo: 'A Lua',
    numero_alvo: 18,
    tipo_relação: 'ressonância',
    significado_espiritual: 'A lua é o domínio natural da Sacerdotisa. Ambas habitam o mundo entre os véus, onde a realidade se dissolve em mistério.',
    interação_arquetípica: 'Mistério e Ilusão - A Sacerdotisa guarda os mistérios; a Lua revela a natureza ilusória da realidade.',
    energia_combinada: 'Intuição lunar em seu aspecto mais profundo. O inconsciente revelando seus segredos.',
    lição: 'Os véus entre os mundos são seus domínios. Abrace o mistério com coragem.',
    afirmação: 'Eu navego pelas águas do inconsciente com clareza, distinguindo verdade de ilusão.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Sacerdotisa',
    numero_origem: 1,
    arcano_alvo: 'O Eremita',
    numero_alvo: 9,
    tipo_relação: 'sequencial',
    significado_espiritual: 'A busca interior da Sacerdotisa encontra sua expressão solitária no Eremita. A sabedoria íntima que requer recolhimento.',
    interação_arquetípica: 'Guarda e Busca - A Sacerdotisa guarda o conhecimento; o Eremita busca sua própria verdade.',
    energia_combinada: 'Solitude sagrada para o autoconhecimento. A caverna onde a sabedoria é encontrada.',
    lição: 'Às vezes a sabedoria mais profunda requer que você se afaste da multidão.',
    afirmação: 'Eu abraço minha solidão sagrada, encontrando em mim a luz que procuro.',
    é_mestre: false,
  },

  // ─── A Imperatriz (2) relationships ───────────────────────────────────────
  {
    arcano_origem: 'A Imperatriz',
    numero_origem: 2,
    arcano_alvo: 'A Imperadora',
    numero_alvo: 3,
    tipo_relação: 'elemental',
    significado_espiritual: 'Ambas as cartas são expressões do princípio feminino divino. A Imperatriz traz a fertilidade cósmica; a Imperadora traz a sabedoria prática dessa energia.',
    interação_arquetípica: 'Criação e Sabedoria - A Imperatriz cria; a Imperadora aplica sabedoria à criação.',
    energia_combinada: 'Sabedoria criativa em plena maturidade. A artista que domina seu ofício.',
    lição: 'Sua criatividade floresce quando cultivada com atenção e dedicação.',
    afirmação: 'Eu nutro minhas criações com paciência, permitindo que floresçam em seu tempo.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Imperatriz',
    numero_origem: 2,
    arcano_alvo: 'O Hierofante',
    numero_alvo: 5,
    tipo_relação: 'tensão',
    significado_espiritual: 'A fertilidade natural da Imperatriz encontra a estrutura dogmática do Hierofante. Criação espontânea versus tradição estabelecida.',
    interação_arquetípica: 'Natureza e Tradição - A Imperatriz representa a natureza; o Hierofante representa a cultura.',
    energia_combinada: 'Tensão criativa entre liberdade e estrutura. A arte que desafia convenções.',
    lição: 'A estrutura pode servir à sua criatividade, mas não deve aprisioná-la.',
    afirmação: 'Eu honro as tradições enquanto permito que minha criatividade singular floresça.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Imperatriz',
    numero_origem: 2,
    arcano_alvo: 'A Estrela',
    numero_alvo: 17,
    tipo_relação: 'ascensão',
    significado_espiritual: 'A fertilidade da Imperatriz se eleva à esperança radiante da Estrela. A criação material se torna criação espiritual.',
    interação_arquetípica: 'Fertilidade e Esperança - A Imperatriz nutre; a Estrela ilumina o que foi nutrido.',
    energia_combinada: 'Criação inspirada pela esperança. A artista que pinta seu sonho.',
    lição: 'Suas obras são expressões de esperança. Permita que brilhem.',
    afirmação: 'Eu crio com esperança, sabendo que cada obra é uma semente para o futuro.',
    é_mestre: false,
  },

  // ─── A Imperadora (3) relationships ───────────────────────────────────────
  {
    arcano_origem: 'A Imperadora',
    numero_origem: 3,
    arcano_alvo: 'O Imperador',
    numero_alvo: 4,
    tipo_relação: 'complementar',
    significado_espiritual: 'O princípio feminino e masculino em harmonia. A Imperadora traz sabedoria e fertilidade; o Imperador traz ordem e estrutura. Juntos, governam em equilíbrio.',
    interação_arquetípica: 'Suserania e Senhoria - Ambos governam, mas por caminhos complementares.',
    energia_combinada: 'Governança equilibrada. O reino onde sabedoria e ordem coexistem.',
    lição: 'O masculino e feminino em você podem governar juntos em harmonia.',
    afirmação: 'Eu integro sabedoria e ação, força e compaixão em meu ser completo.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Imperadora',
    numero_origem: 3,
    arcano_alvo: 'A Justiça',
    numero_alvo: 8,
    tipo_relação: 'ressonância',
    significado_espiritual: 'A sabedoria da Imperadora ressoa com a justiça cósmica. Ambas representam o equilíbrio kármico e a sabedoria aplicada.',
    interação_arquetípica: 'Sabedoria e Equilíbrio - A Imperadora conhece; a Justiça equilibra esse conhecimento.',
    energia_combinada: 'Discernimento sábio e justo. A juez que compreende antes de condenar.',
    lição: 'A verdadeira sabedoria inclui a capacidade de julgar com equidade.',
    afirmação: 'Eu aplico minha sabedoria com justiça, vendo claramente o que é certo.',
    é_mestre: false,
  },

  // ─── O Imperador (4) relationships ────────────────────────────────────────
  {
    arcano_origem: 'O Imperador',
    numero_origem: 4,
    arcano_alvo: 'O Hierofante',
    numero_alvo: 5,
    tipo_relação: 'sequencial',
    significado_espiritual: 'A autoridade terrena do Imperador se alinha com a autoridade espiritual do Hierofante. O governante terreno reconhece o guia espiritual.',
    interação_arquetípica: 'Autoridade Terrena e Espiritual - O Imperador governa o corpo; o Hierofante governa a alma.',
    energia_combinada: 'Autoridade completa em todos os níveis. O rei sagrado.',
    lição: 'A verdadeira autoridade inclui tanto o poder terreno quanto a sabedoria espiritual.',
    afirmação: 'Eu governo com sabedoria e estrutura, honrando tanto o mundo material quanto o espiritual.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Imperador',
    numero_origem: 4,
    arcano_alvo: 'A Justiça',
    numero_alvo: 8,
    tipo_relação: 'tensão',
    significado_espiritual: 'O controle firme do Imperador pode conflitar com a equidade da Justiça. Autoridade versus imparcialidade.',
    interação_arquetípica: 'Controle e Equilíbrio - O Imperador impõe ordem; a Justiça busca imparcialidade.',
    energia_combinada: 'Tensão entre poder e equidade. O líder que deve soltar o controle para ser justo.',
    lição: 'Às vezes soltar o controle é a forma mais sábia de exercer autoridade.',
    afirmação: 'Eu aplico regras com flexibilidade, buscando sempre a equidade acima do controle.',
    é_mestre: false,
  },

  // ─── O Hierofante (5) relationships ────────────────────────────────────────
  {
    arcano_origem: 'O Hierofante',
    numero_origem: 5,
    arcano_alvo: 'Os Enamorados',
    numero_alvo: 6,
    tipo_relação: 'tensão',
    significado_espiritual: 'A tradição sagrada do Hierofante encontra a escolha livre dos Enamorados. Dogma versus coração.',
    interação_arquetípica: 'Tradição e Escolha - O Hierofante oferece caminhos testados; os Enamorados escolhem seu próprio caminho.',
    energia_combinada: 'Decisão sagrada sobre qual tradição ou caminho seguir no amor.',
    lição: 'Às vezes a escolha mais sagrada é seguir seu coração, mesmo contra a tradição.',
    afirmação: 'Eu honro minha tradição enquanto escolho livremente o caminho do meu coração.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Hierofante',
    numero_origem: 5,
    arcano_alvo: 'O Eremita',
    numero_alvo: 9,
    tipo_relação: 'sombra',
    significado_espiritual: 'O guia espiritual público do Hierofante encontra seu aspecto solitário no Eremita. A luz da tradição versus a luz interior solitária.',
    interação_arquetípica: 'Luz Pública e Luz Interior - O Hierofante ilumina para outros; o Eremita busca sua própria luz.',
    energia_combinada: 'O guru que deve fazer sua própria jornada interior para ensinar verdadeiramente.',
    lição: 'Antes de guiar outros, você deve encontrar sua própria luz na solidão.',
    afirmação: 'Eu busco minha própria verdade interior para que possa guiá-la com autenticidade.',
    é_mestre: false,
  },

  // ─── Os Enamorados (6) relationships ───────────────────────────────────────
  {
    arcano_origem: 'Os Enamorados',
    numero_origem: 6,
    arcano_alvo: 'O Carro',
    numero_alvo: 7,
    tipo_relação: 'transformação',
    significado_espiritual: 'A escolha dos Enamorados se transforma na vitória do Carro. Após escolher seu caminho, a conquista vem naturalmente.',
    interação_arquetípica: 'Escolha e Conquista - Os Enamorados escolhem; o Carro conquista o que foi escolhido.',
    energia_combinada: 'Determinação em relação à união. O amante que luta pelo que ama.',
    lição: 'Quando você escolhe claramente, a vitória na vida amorosa se torna possível.',
    afirmação: 'Eu escolho com clareza e avanço com determinação, conquistando meus relacionamentos.',
    é_mestre: false,
  },
  {
    arcano_origem: 'Os Enamorados',
    numero_origem: 6,
    arcano_alvo: 'A Justiça',
    numero_alvo: 8,
    tipo_relação: 'ressonância',
    significado_espiritual: 'A escolha dos Enamorados carrega peso de consequência kármica. Cada escolha tem seu peso de justiça.',
    interação_arquetípica: 'Escolha e Consequência - Os Enamorados escolhem; a Justiça garante as consequências.',
    energia_combinada: 'Decisões tomadas com consciência do peso de suas ações.',
    lição: 'Escolha com consciência das consequências kármicas de seus atos.',
    afirmação: 'Eu escolho com sabedoria, conhecendo e aceitando as consequências de minhas decisões.',
    é_mestre: false,
  },

  // ─── O Carro (7) relationships ─────────────────────────────────────────────
  {
    arcano_origem: 'O Carro',
    numero_origem: 7,
    arcano_alvo: 'A Justiça',
    numero_alvo: 8,
    tipo_relação: 'sequencial',
    significado_espiritual: 'A vitória do Carro precede o julgamento da Justiça. A conquista terreno leva ao julgamento cósmico.',
    interação_arquetípica: 'Conquista e Julgamento - O Carro vence; a Justiça avalia essa vitória.',
    energia_combinada: 'Vitória conquistada com honra. O guerreiro que vence com integridade.',
    lição: 'Suas conquistas são julgadas. Busque vitórias que possam suportar o olhar da Justiça.',
    afirmação: 'Eu conquisto com honra e integridade, sabendo que toda vitória será julgada.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Carro',
    numero_origem: 7,
    arcano_alvo: 'A Torre',
    numero_alvo: 16,
    tipo_relação: 'sombra',
    significado_espiritual: 'A confiança victoriosa do Carro encontra sua destruição na Torre. O orgulho da vitória precede a queda.',
    interação_arquetípica: 'Orgulho e Destruição - O Carro exalta; a Torre derruba.',
    energia_combinada: 'A destruição que vem do orgulho da conquista. O-castelo que desmorona.',
    lição: 'O orgulho excessivo na vitória convida a destruição. Humildade na vitória previne a queda.',
    afirmação: 'Eu celebro minhas conquistas com humildade, permanecendo aberto à orientação divina.',
    é_mestre: false,
  },

  // ─── A Justiça (8) relationships ────────────────────────────────────────────
  {
    arcano_origem: 'A Justiça',
    numero_origem: 8,
    arcano_alvo: 'O Eremita',
    numero_alvo: 9,
    tipo_relação: 'sequencial',
    significado_espiritual: 'O julgamento da Justiça leva à busca solitária do Eremita. Após avaliar sua vida, vem a busca interior.',
    interação_arquetípica: 'Julgamento e Busca - A Justiça avalia; o Eremita busca compreender o julgado.',
    energia_combinada: 'Busca interior após o autojulgamento. A verdade encontrada na solidão.',
    lição: 'Após julgar sua vida, reserve tempo para buscar a sabedoria que o julgamento revela.',
    afirmação: 'Eu busco a verdade interior com coragem, enfrentando o que meu julgamento revela.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Justiça',
    numero_origem: 8,
    arcano_alvo: 'A Roda da Fortuna',
    numero_alvo: 10,
    tipo_relação: 'ressonância',
    significado_espiritual: 'A Justiça age sobre a Roda da Fortuna. Cada ponto da roda carrega consequências justas.',
    interação_arquetípica: 'Equilíbrio e Ciclo - A Justiça garante equidade no ciclo da Roda.',
    energia_combinada: 'O destino equilibrado pelo peso da justiça. A roda que gira com equidade.',
    lição: 'O ciclo do destino é justo. Cada subida e descida tem seu propósito kármico.',
    afirmação: 'Eu aceito o ciclo da vida com confiança, sabendo que a justiça equilibra todas as coisas.',
    é_mestre: false,
  },

  // ─── O Eremita (9) relationships ────────────────────────────────────────────
  {
    arcano_origem: 'O Eremita',
    numero_origem: 9,
    arcano_alvo: 'A Roda da Fortuna',
    numero_alvo: 10,
    tipo_relação: 'transformação',
    significado_espiritual: 'A sabedoria do Eremita se integra ao ciclo da Roda. A solidão revela que todos os destinos estão conectados.',
    interação_arquetípica: 'Busca e Destino - O Eremita busca; a Roda revela o destino dessa busca.',
    energia_combinada: 'A sabedoria que vem de aceitar o destino como parte do ciclo maior.',
    lição: 'Sua busca solitária é parte de um destino maior que você está cumprindo.',
    afirmação: 'Eu aceito meu destino como parte do plano divino, continuando minha busca com propósito.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Eremita',
    numero_origem: 9,
    arcano_alvo: 'A Estrela',
    numero_alvo: 17,
    tipo_relação: 'ascensão',
    significado_espiritual: 'A luz interior do Eremita se projeta na esperança da Estrela. A sabedoria solitária se torna esperança para outros.',
    interação_arquetípica: 'Luz Interior e Esperança - O Eremita encontra sua luz; a Estrela irradia essa luz.',
    energia_combinada: 'A esperança que nasce da sabedoria interior. A luz do guru que ilumina.',
    lição: 'Sua luz interior é um presente para o mundo. Permita que ela brilhe para outros.',
    afirmação: 'Eu compartilho minha luz interior com o mundo, trazendo esperança aos que sofrem.',
    é_mestre: false,
  },

  // ─── A Roda da Fortuna (10) relationships ───────────────────────────────────
  {
    arcano_origem: 'A Roda da Fortuna',
    numero_origem: 10,
    arcano_alvo: 'A Força',
    numero_alvo: 11,
    tipo_relação: 'transformação',
    significado_espiritual: 'O ciclo da Roda se transforma na força interior da Força. Aceitar o destino desenvolve força interior.',
    interação_arquetípica: 'Destino e Força - A Roda apresenta o destino; a Força permite enfrentá-lo.',
    energia_combinada: 'A força que vem de aceitar o ciclo do destino com coragem.',
    lição: 'A verdadeira força está em aceitar o que não podemos controlar enquanto fazemos o melhor que podemos.',
    afirmação: 'Eu encontro força interior em aceitar o ciclo da vida, permanecendo firme em minha essência.',
    é_mestre: true,
  },
  {
    arcano_origem: 'A Roda da Fortuna',
    numero_origem: 10,
    arcano_alvo: 'O Julgamento',
    numero_alvo: 20,
    tipo_relação: 'ascensão',
    significado_espiritual: 'A Roda apresenta o destino; o Julgamento avalia a jornada completa. O ciclo leva ao despertar final.',
    interação_arquetípica: 'Destino e Avaliação - A Roda mostra o caminho; o Julgamento avalia como caminhamos.',
    energia_combinada: 'O despertar kármico que vem de compreender o ciclo do destino.',
    lição: 'Cada ciclo da Roda é uma oportunidade de aprendizado que será julgado.',
    afirmação: 'Eu aceito o julgamento final com gratidão, sabendo que ele traz o despertar que procuro.',
    é_mestre: false,
  },

  // ─── A Força (11) relationships ─────────────────────────────────────────────
  {
    arcano_origem: 'A Força',
    numero_origem: 11,
    arcano_alvo: 'O Eremita',
    numero_alvo: 9,
    tipo_relação: 'ressonância',
    significado_espiritual: 'A força interior da Força ressoa com a sabedoria interior do Eremita. A verdadeira força é suave e paciente.',
    interação_arquetípica: 'Força e Sabedoria - A Força conquista com suavidade; o Eremita busca sabedoria.',
    energia_combinada: 'A força paciente que vem da sabedoria interior. O guerreiro sábio.',
    lição: 'A verdadeira força não precisa de esforço. Ela flui naturalmente da sabedoria.',
    afirmação: 'Eu expresso minha força com suavidade e paciência, deixando a sabedoria guiar minha ação.',
    é_mestre: true,
  },
  {
    arcano_origem: 'A Força',
    numero_origem: 11,
    arcano_alvo: 'O Diabo',
    numero_alvo: 15,
    tipo_relação: 'sombra',
    significado_espiritual: 'A força interior da Força confronta a sombra do Diabo. A luz que dissipa a escuridão interior.',
    interação_arquetípica: 'Luz e Sombra - A Força ilumina; o Diabo personifica a escuridão.',
    energia_combinada: 'A libertação das correntes através da força interior. O cativo que se liberta.',
    lição: 'Você tem força para se libertar de qualquer prisão, interna ou externa.',
    afirmação: 'Eu me liberto de todas as correntes que me prendem, usando minha força interior para romper.',
    é_mestre: true,
  },

  // ─── O Enforcado (12) relationships ──────────────────────────────────────────
  {
    arcano_origem: 'O Enforcado',
    numero_origem: 12,
    arcano_alvo: 'A Morte',
    numero_alvo: 13,
    tipo_relação: 'sequencial',
    significado_espiritual: 'O sacrifício do Enforcado precede a transformação da Morte. O sacrifício voluntário traz a morte do antigo.',
    interação_arquetípica: 'Sacrifício e Transformação - O Enforcado oferece; a Morte transforma.',
    energia_combinada: 'A morte do ego através do sacrifício. A transformação que vem da entrega.',
    lição: 'O sacrifício voluntário abre espaço para a transformação que você busca.',
    afirmação: 'Eu ofereço o que precisa ser libertado, aceitando a morte do antigo para o nascimento do novo.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Enforcado',
    numero_origem: 12,
    arcano_alvo: 'A Torre',
    numero_alvo: 16,
    tipo_relação: 'ressonância',
    significado_espiritual: 'A suspensão do Enforcado antecipa a queda da Torre. Ambos representam interrupções forçadas do normal.',
    interação_arquetípica: 'Suspensão e Queda - O Enforcado escolhe parar; a Torre é forçada a cair.',
    energia_combinada: 'A queda inevitável que vem da recusa em mudar voluntariamente.',
    lição: 'Se você não parar voluntariamente, será forçado a parar. Melhor escolher a pausa.',
    afirmação: 'Eu escolho pausar e refletir antes que a vida me force a parar.',
    é_mestre: false,
  },

  // ─── A Morte (13) relationships ──────────────────────────────────────────────
  {
    arcano_origem: 'A Morte',
    numero_origem: 13,
    arcano_alvo: 'A Temperança',
    numero_alvo: 14,
    tipo_relação: 'sequencial',
    significado_espiritual: 'A morte do antigo precede a tempuração na Temperança. Após a morte, vem o equilíbrio.',
    interação_arquetípica: 'Transformação e Equilíbrio - A Morte transforma; a Temperança equilibra a transformação.',
    energia_combinada: 'A transformação equilibrada que vem na medida certa. O alquimista espiritual.',
    lição: 'Após cada morte interior, busque o equilíbrio antes de prosseguir.',
    afirmação: 'Eu transformo com equilíbrio, permitindo que cada morte seja seguida de integração.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Morte',
    numero_origem: 13,
    arcano_alvo: 'A Estrela',
    numero_alvo: 17,
    tipo_relação: 'ascensão',
    significado_espiritual: 'A morte transforma em esperança. Após o fim, a estrela da esperança brilha mais forte.',
    interação_arquetípica: 'Morte e Esperança - A Morte termina; a Estrela renova.',
    energia_combinada: 'A esperança que nasce após a morte do antigo. O renascimento.',
    lição: 'Após cada fim, há um novo começo. A esperança nunca morre verdadeiramente.',
    afirmação: 'Eu abraço cada fim como o início de algo novo, mantendo minha esperança viva.',
    é_mestre: false,
  },

  // ─── A Temperança (14) relationships ───────────────────────────────────────
  {
    arcano_origem: 'A Temperança',
    numero_origem: 14,
    arcano_alvo: 'O Diabo',
    numero_alvo: 15,
    tipo_relação: 'tensão',
    significado_espiritual: 'O equilíbrio da Temperança é testado pela tentação do Diabo. A moderação enfrenta a excessividade.',
    interação_arquetípica: 'Equilíbrio e Tentação - A Temperança modera; o Diabo tenta o excesso.',
    energia_combinada: 'A batalha pelo equilíbrio em face da tentação. O anjo e o demônio em conflito.',
    lição: 'O equilíbrio é mantido através da vigilância constante contra a tentação.',
    afirmação: 'Eu mantenho meu equilíbrio em face da tentação, sabendo que a moderação é minha força.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Temperança',
    numero_origem: 14,
    arcano_alvo: 'A Torre',
    numero_alvo: 16,
    tipo_relação: 'sombra',
    significado_espiritual: 'O equilíbrio da Temperança pode se romper na destruição da Torre. A falsa paz precede o despertar dramático.',
    interação_arquetípica: 'Equilíbrio e Destruição - A Temperança mantém; a Torre destrói.',
    energia_combinada: 'A destruição que vem quando o equilíbrio é baseado em fundações falsas.',
    lição: 'Verdadeiro equilíbrio não é ausência de conflito, mas capacidade de integrar tensões.',
    afirmação: 'Eu construo meu equilíbrio sobre fundações verdadeiras, não sobre ilusões de paz.',
    é_mestre: false,
  },

  // ─── O Diabo (15) relationships ─────────────────────────────────────────────
  {
    arcano_origem: 'O Diabo',
    numero_origem: 15,
    arcano_alvo: 'A Torre',
    numero_alvo: 16,
    tipo_relação: 'sequencial',
    significado_espiritual: 'A prisão do Diabo precede a libertação da Torre. As correntes são quebradas na destruição.',
    interação_arquetípica: 'Prisão e Libertação - O Diabo aprisiona; a Torre liberta.',
    energia_combinada: 'A libertação dramática das correntes. O cativo que explode suas amarras.',
    lição: 'A libertação pode ser dramática, mas é necessária quando a prisão se torna insuportável.',
    afirmação: 'Eu me liberto de todas as prisões que me limitam, mesmo que a libertação seja turbulenta.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Diabo',
    numero_origem: 15,
    arcano_alvo: 'A Estrela',
    numero_alvo: 17,
    tipo_relação: 'ascensão',
    significado_espiritual: 'Das sombras do Diabo surge a luz da Estrela. A libertação leva à esperança renovada.',
    interação_arquetípica: 'Sombra e Luz - O Diabo representa a escuridão; a Estrela representa a luz.',
    energia_combinada: 'A esperança que brilha mesmo após a escuridão mais profunda.',
    lição: 'Das trevas mais densas pode nascer a luz mais brilhante.',
    afirmação: 'Eu transformo minha escuridão em luz, permitindo que minha esperança brilhe novamente.',
    é_mestre: false,
  },

  // ─── A Torre (16) relationships ──────────────────────────────────────────────
  {
    arcano_origem: 'A Torre',
    numero_origem: 16,
    arcano_alvo: 'A Estrela',
    numero_alvo: 17,
    tipo_relação: 'sequencial',
    significado_espiritual: 'A destruição da Torre prepara o terreno para a esperança da Estrela. Após o caos, a paz retorna.',
    interação_arquetípica: 'Destruição e Esperança - A Torre destrói; a Estrela renova.',
    energia_combinada: 'O renascimento da esperança após a destruição. A fênix que ressurge.',
    lição: 'A destruição não é o fim, mas o início de algo novo e melhor.',
    afirmação: 'Eu reconstruo minha vida após cada destruição, plantando sementes de esperança.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Torre',
    numero_origem: 16,
    arcano_alvo: 'A Lua',
    numero_alvo: 18,
    tipo_relação: 'ressonância',
    significado_espiritual: 'A luz repentina da Torre ilumina as ilusões da Lua. A verdade que dissipa o medo.',
    interação_arquetípica: 'Revelação e Ilusão - A Torre revela; a Lua mantém ilusões.',
    energia_combinada: 'A claridade que vem quando as ilusões são expostas à luz.',
    lição: 'A luz da verdade pode ser desconfortável, mas liberta das ilusões que nos prendem.',
    afirmação: 'Eu permito que a luz da verdade dissipe minhas ilusões, enfrentando a realidade com coragem.',
    é_mestre: false,
  },

  // ─── A Estrela (17) relationships ───────────────────────────────────────────
  {
    arcano_origem: 'A Estrela',
    numero_origem: 17,
    arcano_alvo: 'A Lua',
    numero_alvo: 18,
    tipo_relação: 'tensão',
    significado_espiritual: 'A luz clara da Estrela brilha contra as ilusões da Lua. Esperança versus medo.',
    interação_arquetípica: 'Luz e Ilusão - A Estrela ilumina; a Lua obscurece.',
    energia_combinada: 'A batalha entre esperança e medo. A luz que tenta brilhar através das nuvens.',
    lição: 'Quando o medo obscurece sua esperança, lembre-se de que a luz sempre prevalece.',
    afirmação: 'Eu permito que minha luz interior brilhe através das nuvens do medo, mantendo minha esperança.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Estrela',
    numero_origem: 17,
    arcano_alvo: 'O Sol',
    numero_alvo: 19,
    tipo_relação: 'ascensão',
    significado_espiritual: 'A luz da Estrela se intensifica no brilho do Sol. A esperança se torna alegria plena.',
    interação_arquetípica: 'Esperança e Alegria - A Estrela traz esperança; o Sol traz alegria.',
    energia_combinada: 'A alegria radiante que nasce da esperança mantida. O amanhecer dourado.',
    lição: 'Quando você mantém sua esperança, ela se transforma em alegria solar.',
    afirmação: 'Eu permito que minha esperança se transforme em alegria solar, brilhando com plenitude.',
    é_mestre: false,
  },

  // ─── A Lua (18) relationships ───────────────────────────────────────────────
  {
    arcano_origem: 'A Lua',
    numero_origem: 18,
    arcano_alvo: 'O Sol',
    numero_alvo: 19,
    tipo_relação: 'complementar',
    significado_espiritual: 'A Lua e o Sol são opostos complementares. A noite lunar cede ao dia solar. Ilusão cede à verdade.',
    interação_arquetípica: 'Noite e Dia - A Lua traz mistério; o Sol traz clareza.',
    energia_combinada: 'O ciclo completo de iluminação. A verdade que emerge da ilusão.',
    lição: 'A luz do sol sempre virá após a noite lunar. A verdade sempre emerge da ilusão.',
    afirmação: 'Eu permito que a luz do sol dissipe as ilusões da lua, revelando a verdade.',
    é_mestre: false,
  },
  {
    arcano_origem: 'A Lua',
    numero_origem: 18,
    arcano_alvo: 'O Julgamento',
    numero_alvo: 20,
    tipo_relação: 'transformação',
    significado_espiritual: 'As ilusões da Lua são julgadas e dissipadas. O inconsciente revela seus segredos no julgamento.',
    interação_arquetípica: 'Ilusão e Julgamento - A Lua mantém ilusões; o Julgamento as expõe.',
    energia_combinada: 'O despertar do inconsciente através do julgamento. Os medos revelados.',
    lição: 'Seus medos inconscientes serão trazidos à luz. Enfrente-os com coragem.',
    afirmação: 'Eu enfrento meus medos inconscientes com coragem, permitindo que o julgamento os ilumine.',
    é_mestre: false,
  },

  // ─── O Sol (19) relationships ───────────────────────────────────────────────
  {
    arcano_origem: 'O Sol',
    numero_origem: 19,
    arcano_alvo: 'O Julgamento',
    numero_alvo: 20,
    tipo_relação: 'sequencial',
    significado_espiritual: 'A alegria solar precede o julgamento final. A luz que será avaliada.',
    interação_arquetípica: 'Alegria e Julgamento - O Sol brilha; o Julgamento avalia o brilho.',
    energia_combinada: 'A alegria que pode suportar o julgamento. A luz que não teme a avaliação.',
    lição: 'A verdadeira alegria não teme o julgamento, pois não tem nada a esconder.',
    afirmação: 'Eu brilho com alegria autêntica, sabendo que minha luz pode suportar qualquer julgamento.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Sol',
    numero_origem: 19,
    arcano_alvo: 'O Mundo',
    numero_alvo: 21,
    tipo_relação: 'ascensão',
    significado_espiritual: 'A luz solar se integra na consciência cósmica do Mundo. A alegria pessoal se torna alegria universal.',
    interação_arquetípica: 'Alegria e Integração - O Sol traz alegria; o Mundo integra essa alegria.',
    energia_combinada: 'A alegria cósmica da consciência integrada. A luz que ilumina tudo.',
    lição: 'Sua alegria pessoal é parte da alegria universal. Permita que ela se expanda.',
    afirmação: 'Eu permito que minha alegria pessoal se expanda para incluir toda a criação.',
    é_mestre: false,
  },

  // ─── O Julgamento (20) relationships ────────────────────────────────────────
  {
    arcano_origem: 'O Julgamento',
    numero_origem: 20,
    arcano_alvo: 'O Mundo',
    numero_alvo: 21,
    tipo_relação: 'sequencial',
    significado_espiritual: 'O julgamento final do ciclo integra a consciência no Mundo. A avaliação leva à completude.',
    interação_arquetípica: 'Julgamento e Integração - O Julgamento avalia; o Mundo integra.',
    energia_combinada: 'A consciência integrada que vem após o autojulgamento. O despertar completo.',
    lição: 'Após julgar sua jornada, integre todas as lições para alcançar a completude.',
    afirmação: 'Eu aceito o julgamento com gratidão e integro todas as lições aprendidas.',
    é_mestre: false,
  },
  {
    arcano_origem: 'O Julgamento',
    numero_origem: 20,
    arcano_alvo: 'O Louco',
    numero_alvo: 0,
    tipo_relação: 'cármico',
    significado_espiritual: 'O julgamento final do ciclo conecta de volta ao Louco. A jornada completa volta ao início com sabedoria.',
    interação_arquetípica: 'Julgamento e Iniciação - O Julgamento encerra; o Louco inicia.',
    energia_combinada: 'O eterno retorno. Cada fim é um novo começo com mais sabedoria.',
    lição: 'A jornada é cíclica. Cada fim é um novo começo em um nível superior.',
    afirmação: 'Eu aceito o eterno retorno, começando cada nova jornada com a sabedoria do que passou.',
    é_mestre: false,
  },
];

// Freeze the array to prevent modifications
Object.freeze(TAROT_TAROT_MAP);

/**
 * Returns the tarot-tarot mapping for a given source and target arcano.
 * @param arcanoOrigem - Source arcano name
 * @param arcanoAlvo - Target arcano name
 * @returns The mapping or null if not found
 */
export function getTarotTarot(
  arcanoOrigem: string,
  arcanoAlvo: string
): TarotTarotMapping | null {
  return (
    TAROT_TAROT_MAP.find(
      (m) =>
        m.arcano_origem.toLowerCase() === arcanoOrigem.toLowerCase() &&
        m.arcano_alvo.toLowerCase() === arcanoAlvo.toLowerCase()
    ) ?? null
  );
}

/**
 * Returns the tarot-tarot mapping by card numbers.
 * @param numeroOrigem - Source card number (0-21)
 * @param numeroAlvo - Target card number (0-21)
 * @returns The mapping or null if not found
 */
export function getTarotTarotByNumber(
  numeroOrigem: number,
  numeroAlvo: number
): TarotTarotMapping | null {
  return (
    TAROT_TAROT_MAP.find(
      (m) => m.numero_origem === numeroOrigem && m.numero_alvo === numeroAlvo
    ) ?? null
  );
}

/**
 * Get all relationships for a specific arcano as source.
 * @param arcano - The arcano name
 * @returns Array of mappings where this arcano is the source
 */
export function getRelationshipsByArcano(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter(
    (m) => m.arcano_origem.toLowerCase() === arcano.toLowerCase()
  );
}

/**
 * Get all relationships of a specific type.
 * @param tipo - The relationship type
 * @returns Array of mappings matching the type
 */
export function getRelationshipsByType(tipo: RelacaoTipo): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.tipo_relação === tipo);
}

/**
 * Get all master number relationships (involves cards 0, 11, 22).
 * @returns Array of mappings with é_mestre = true
 */
export function getMasterRelationships(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.é_mestre);
}

/**
 * Get all tarot-tarot mappings.
 * @returns Array of all TarotTarotMapping objects
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

/**
 * Check if a relationship exists between two arcanos.
 * @param arcanoOrigem - Source arcano name
 * @param arcanoAlvo - Target arcano name
 * @returns True if relationship exists
 */
export function hasTarotTarot(
  arcanoOrigem: string,
  arcanoAlvo: string
): boolean {
  return getTarotTarot(arcanoOrigem, arcanoAlvo) !== null;
}

/**
 * Get the arcano name by its number.
 * @param numero - Card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  if (numero >= 0 && numero <= 21) {
    return ARCANOS_MAIORES[numero];
  }
  return null;
}

/**
 * Get all arcano names.
 * @returns Array of all 22 arcano names
 */
export function getAllArcanos(): string[] {
  return [...ARCANOS_MAIORES];
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarot,
  getTarotTarotByNumber,
  getRelationshipsByArcano,
  getRelationshipsByType,
  getMasterRelationships,
  getAllTarotTarots,
  hasTarotTarot,
  getArcanoByNumber,
  getAllArcanos,
  ARCANOS_MAIORES,
  TAROT_TAROT_MAP,
};
