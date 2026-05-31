/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Tarot-Tarot Arcana Spiritual Correlation
 * @see {@link https://www.cabala.cabala.com}
 * @version 1.0.0
 */

/**
 * Represents the correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** The source Major Arcana arcano name */
  arcano: string;
  /** Source card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** The related Major Arcana arcano name */
  arcano_relacionado: string;
  /** Related card number (0-21) */
  numero_relacionado: number;
  /** Type of relationship between the cards */
  tipo_relação: 'complementar' | 'progresão' | 'oposto' | 'harmônico' | 'sombra' | 'mestre';
  /** Elemental association */
  elemento: Elemento;
  /** Full spiritual meaning of the relationship */
  significado_relação: string;
  /** Combined archetype represented by the relationship */
  arquétipo: string;
  /** Associated Orixá from Candomblé tradition */
  orixá: string;
  /** Associated Kabbalistic Sephirah */
  sephirah: string;
  /** Chakra alignment */
  chakra: string;
  /** Key spiritual lesson from the relationship */
  lição_espiritual: string;
  /** Affirmation for meditation */
  afirmação: string;
}

// ─── Tarot Major Arcana Inter-Card Relationships ─────────────────────────────────

/**
 * Complete mapping of Major Arcana cards to their related cards.
 * Each relationship reveals deeper layers of the tarot's interconnected wisdom.
 */
export const TAROT_TAROT_MAP: Record<number, TarotTarotMapping[]> = {
  0: [
    {
      arcano: 'O Louco',
      numero_carta: 0,
      arcano_relacionado: 'O Mundo',
      numero_relacionado: 20,
      tipo_relação: 'progresão',
      elemento: 'Ar',
      significado_relação: 'O Louco inicia a jornada e O Mundo a completa. Entre eles, todos os 21 arcanos formam o ciclo completo da experiência humana. O Louco é o potencial puro; O Mundo é a integração de todas as lições aprendidas.',
      arquétipo: 'O Viajante / O Infinito',
      orixá: 'Nanã / Omolu / Olobón',
      sephirah: 'Malkuth',
      chakra: '7º Coronário',
      lição_espiritual: 'A jornada completa retorna ao início, mas agora com sabedoria. O ponto final é também o ponto de partida.',
      afirmação: 'Eu abraço minha jornada do início ao fim, sabendo que cada passo me aproxima da minha completude.',
    },
    {
      arcano: 'O Louco',
      numero_carta: 0,
      arcano_relacionado: 'O Louco',
      numero_relacionado: 21,
      tipo_relação: 'mestre',
      elemento: 'Ar',
      significado_relação: 'O Louco aparece tanto no início (0) quanto no fim (XXI) da história, representando o eterno retorno. Esta dualidade mostra que a liberdade absoluta está tanto no início selvagem quanto na mastersia conquistada.',
      arquétipo: 'O Louco / O Mestre Retornado',
      orixá: 'Nanã / Omolu / Olobón',
      sephirah: 'Kether',
      chakra: '7º Coronário',
      lição_espiritual: 'A verdadeira liberdade é saber que você pode recomeçar quantas vezes quiser.',
      afirmação: 'Eu sou livre para começar novamente, quantas vezes forem necessárias, com coração jovem e espírito sábio.',
    },
  ],
  1: [
    {
      arcano: 'A Sacerdotisa',
      numero_carta: 1,
      arcano_relacionado: 'A Imperatriz',
      numero_relacionado: 2,
      tipo_relação: 'progresão',
      elemento: 'Água',
      significado_relação: 'A Sacerdotisa guarda os mistérios ocultos enquanto a Imperatriz manifesta esses mistérios na realidade física. Juntas,她们 representam a transição do conhecimento secreto para a expressão criativa.',
      arquétipo: 'A Guardiã / A Criadora',
      orixá: 'Ibeji / Ejiokô',
      sephirah: 'Chokmah',
      chakra: '6º Frontal',
      lição_espiritual: 'O conhecimento que não é manifestado permanece apenas potencial. Viva sua sabedoria.',
      afirmação: 'Eu trago os mistérios do universo para a terra, manifestando sabedoria em forma de beleza e vida.',
    },
    {
      arcano: 'A Sacerdotisa',
      numero_carta: 1,
      arcano_relacionado: 'A Lua',
      numero_relacionado: 17,
      tipo_relação: 'harmônico',
      elemento: 'Água',
      significado_relação: 'A Sacerdotisa e a Lua compartilham o domínio das águas do inconsciente. A Sacerdotisa revela verdades ocultas; a Lua mostra as ilusões que devemos atravessar para encontrar a verdade.',
      arquétipo: 'A Intuição / A Navegadora das Águas',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Yesod',
      chakra: '6º Frontal',
      lição_espiritual: 'Confie na sua navegação interior, mesmo quando o caminho parece envulto em névoa.',
      afirmação: 'Eu navego pelas águas profundas da minha alma com clareza, atravessando ilusões para encontrar a verdade.',
    },
  ],
  2: [
    {
      arcano: 'A Imperatriz',
      numero_carta: 2,
      arcano_relacionado: 'A Sacerdotisa',
      numero_relacionado: 1,
      tipo_relação: 'progresão',
      elemento: 'Terra',
      significado_relação: 'A Imperatriz manifesta a sabedoria da Sacerdotisa. Onde a Sacerdotisa sonha, a Imperatriz cria. Esta progresão mostra como o conhecimento intuitivo se torna fertilidade criativa.',
      arquétipo: 'A Criadora / A Guardiã',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Binah',
      chakra: '4º Cardíaco',
      lição_espiritual: 'Deixe sua sabedoria interior florescer em criação tangible.',
      afirmação: 'Eu permito que minha sabedoria interior se manifeste como abundância criativa em todas as áreas da minha vida.',
    },
    {
      arcano: 'A Imperatriz',
      numero_carta: 2,
      arcano_relacionado: 'O Hierofante',
      numero_relacionado: 4,
      tipo_relação: 'complementar',
      elemento: 'Terra',
      significado_relação: 'A Imperatriz representa a fertildade natural enquanto o Hierofante traz a tradição sagrada. Juntos, eles equilibram a natureza selvagem com a estrutura espiritual.',
      arquétipo: 'A Mãe Natureza / O Mestre Espiritual',
      orixá: 'Oxum / Oxé',
      sephirah: 'Geburah',
      chakra: '5º Laríngeo',
      lição_espiritual: 'A espiritualidade e a natureza não são opostas - elas se nutrem mutuamente.',
      afirmação: 'Eu honro tanto a terra quanto o céu, integrando natureza e espiritualidade em harmonia sagrada.',
    },
  ],
  3: [
    {
      arcano: 'O Imperador',
      numero_carta: 3,
      arcano_relacionado: 'A Imperatriz',
      numero_relacionado: 2,
      tipo_relação: 'oposto',
      elemento: 'Fogo',
      significado_relação: 'O Imperador traz a força patriarcal e a autoridade estruturada enquanto a Imperatriz representa a fertilidade matriarcal e a liberdade criativa. Esta tensão criativa entre ordem e fluidez é essencial para o equilíbrio.',
      arquétipo: 'O Pai / A Mãe',
      orixá: 'Ogum / Etaogundá',
      sephirah: 'Chesed',
      chakra: '1º Básico',
      lição_espiritual: 'O masculino e o feminino precisam um do outro para criar harmonia. Nem dominância nem submissão - parceria.',
      afirmação: 'Eu integro força e receptividade, autoridade e flexibilidade, criando equilíbrio em minha vida.',
    },
    {
      arcano: 'O Imperador',
      numero_carta: 3,
      arcano_relacionado: 'A Justiça',
      numero_relacionado: 7,
      tipo_relação: 'harmônico',
      elemento: 'Fogo',
      significado_relação: 'O Imperador estabelece as leis e a ordem; a Justiça garante que essas leis sejam aplicadas com equidade. Ambos governam o reino da causa e efeito.',
      arquétipo: 'O Governante / O Juiz',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Hod',
      chakra: '4º Cardíaco',
      lição_espiritual: 'A verdadeira autoridade está alinhada com a justiça. Governar com sabedoria é governar com equidade.',
      afirmação: 'Eu establezco ordem em minha vida com justiça e integridade, criando estruturas que servem ao bem maior.',
    },
  ],
  4: [
    {
      arcano: 'O Hierofante',
      numero_carta: 4,
      arcano_relacionado: 'O Eremita',
      numero_relacionado: 8,
      tipo_relação: 'oposto',
      elemento: 'Fogo',
      significado_relação: 'O Hierofante representa a tradição institucionalizada enquanto o Eremita busca a sabedoria solitária. Um segue os mestres externos; o outro ilumina o caminho interno.',
      arquétipo: 'O Sacerdote / O Sábio',
      orixá: 'Oxum / Oxé',
      sephirah: 'Geburah',
      chakra: '5º Laríngeo',
      lição_espiritual: 'A sabedoria externa precisa ser verificada pela sabedoria interior. Ambos os caminhos são válidos.',
      afirmação: 'Eu busco mestres externos e internos, integrando tradição e experiência pessoal em minha verdade.',
    },
    {
      arcano: 'O Hierofante',
      numero_carta: 4,
      arcano_relacionado: 'A Imperatriz',
      numero_relacionado: 2,
      tipo_relação: 'complementar',
      elemento: 'Fogo',
      significado_relação: 'O Hierofante traz a tradição sagrada enquanto a Imperatriz representa a fertilidade natural. Juntos, eles mostram que a espiritualidade saudável inclui tanto rituais quanto conexão com a terra.',
      arquétipo: 'O Mestre / A Mãe Natureza',
      orixá: 'Oxum / Oxé',
      sephirah: 'Binah',
      chakra: '4º Cardíaco',
      lição_espiritual: 'A espiritualidade que nega a natureza é incompleta. Honre o corpo e a terra em sua prática.',
      afirmação: 'Eu honro a tradição sagrada enquanto me conecto com a sabedoria da natureza e do corpo.',
    },
  ],
  5: [
    {
      arcano: 'Os Enamorados',
      numero_carta: 5,
      arcano_relacionado: 'O Carro',
      numero_relacionado: 6,
      tipo_relação: 'progresão',
      elemento: 'Ar',
      significado_relação: 'Os Enamorados representam a escolha do coração; o Carro mostra a vitória conquistada através dessa escolha. A decisão amorosa leva à ação determinada.',
      arquétipo: 'O Amante / O Guerreiro',
      orixá: 'Oxumaré / Oxumarim',
      sephirah: 'Tiphereth',
      chakra: '4º Cardíaco',
      lição_espiritual: 'O amor que não se torna ação permanece apenas potencial. Escolha e então avance.',
      afirmação: 'Eu escolho com o coração e avanço com determinação, manifestando meu amor em ação concreta.',
    },
    {
      arcano: 'Os Enamorados',
      numero_carta: 5,
      arcano_relacionado: 'A Torre',
      numero_relacionado: 15,
      tipo_relação: 'sombra',
      elemento: 'Ar',
      significado_relação: 'Os Enamorados mostram a união sagrada enquanto a Torre representa a destruição das uniões falsas. Esta relação revela que algumas "escolhas amorosas" precisam ser dinamitadas para que o verdadeiro amor possa emergir.',
      arquétipo: 'A União / A Destruição',
      orixá: 'Ogum / Etaogundá',
      sephirah: 'Geburah',
      chakra: '3º Plexo Solar',
      lição_espiritual: 'Às vezes a destruição de um relacionamento falso é o caminho para o amor verdadeiro.',
      afirmação: 'Eu permito que o raio da verdade dissipe ilusões em meus relacionamentos, abrindo espaço para conexões autênticas.',
    },
  ],
  6: [
    {
      arcano: 'O Carro',
      numero_carta: 6,
      arcano_relacionado: 'Os Enamorados',
      numero_relacionado: 5,
      tipo_relação: 'progresão',
      elemento: 'Água',
      significado_relação: 'O Carro representa a vitória que resulta da escolha amorosa. Após decidir pelo amor, o Carro garante que essa escolha seja protegida e avançada.',
      arquétipo: 'O Guerreiro / O Amante',
      orixá: 'Xangô / Obará',
      sephirah: 'Netzach',
      chakra: '3º Plexo Solar',
      lição_espiritual: 'A vitória sem propósito é vazia. Lute pelo que você ama.',
      afirmação: 'Eu conduzo meu carro com determinação em direção aos meus objetivos, protegido pelo poder do amor.',
    },
    {
      arcano: 'O Carro',
      numero_carta: 6,
      arcano_relacionado: 'A Justiça',
      numero_relacionado: 7,
      tipo_relação: 'harmônico',
      elemento: 'Água',
      significado_relação: 'O Carro conquista através da vontade; a Justiça garante que essa conquista seja merecida. Ambos operam no campo da causa e efeito.',
      arquétipo: 'O Vitorioso / O Juiz',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Hod',
      chakra: '4º Cardíaco',
      lição_espiritual: 'A verdadeira vitória inclui a justiça. Conquiste com integridade.',
      afirmação: 'Eu avanço em direção aos meus objetivos com determinação e integridade, conquistando com justiça.',
    },
  ],
  7: [
    {
      arcano: 'A Justiça',
      numero_carta: 7,
      arcano_relacionado: 'O Eremita',
      numero_relacionado: 8,
      tipo_relação: 'progresão',
      elemento: 'Ar',
      significado_relação: 'A Justiça revela a verdade das ações passadas; o Eremita ilumina o caminho futuro. Esta progresão mostra que o julgamento leva naturalmente à busca da sabedoria interior.',
      arquétipo: 'O Juiz / O Sábio',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Yesod',
      chakra: '6º Frontal',
      lição_espiritual: 'Após ver claramente suas ações, você é chamado a buscar a sabedoria que guia suas escolhas futuras.',
      afirmação: 'Eu busco a luz interior para iluminar meu caminho, conhecendo a verdade de minhas ações passadas.',
    },
    {
      arcano: 'A Justiça',
      numero_carta: 7,
      arcano_relacionado: 'A Roda da Fortuna',
      numero_relacionado: 9,
      tipo_relação: 'harmônico',
      elemento: 'Ar',
      significado_relação: 'A Justiça garante que cada ação retorne ao seu originador; a Roda da Fortuna mostra o ciclo cósmico onde isso acontece. Elas representam a lei karma em ação.',
      arquétipo: 'O Juiz Cósmico / A Roda do Destino',
      orixá: 'Oxumaré / Oxumarim',
      sephirah: 'Hod',
      chakra: '3º Plexo Solar',
      lição_espiritual: 'A justiça cósmica opera através dos ciclos do destino. Confie no retorno inevitável.',
      afirmação: 'Eu confio na justiça cósmica que equilibra todas as minhas escolhas, fluindo com os ciclos do destino.',
    },
  ],
  8: [
    {
      arcano: 'O Eremita',
      numero_carta: 8,
      arcano_relacionado: 'A Justiça',
      numero_relacionado: 7,
      tipo_relação: 'progresão',
      elemento: 'Terra',
      significado_relação: 'O Eremita busca a sabedoria que a Justiça revela. Após ser julgado, o buscador se retira para contemplar as verdades descobertas.',
      arquétipo: 'O Sábio / O Juiz',
      orixá: 'Nanã / Omolu / Olobón',
      sephirah: 'Yesod',
      chakra: '6º Frontal',
      lição_espiritual: 'A sabedoria verdadeira vem da reflexão solitária após o julgamento.',
      afirmação: 'Eu busco a solidão sagrada para contemplar as verdades que a vida me revela.',
    },
    {
      arcano: 'O Eremita',
      numero_carta: 8,
      arcano_relacionado: 'O Hierofante',
      numero_relacionado: 4,
      tipo_relação: 'oposto',
      elemento: 'Terra',
      significado_relação: 'O Eremita encontra a sabedoria dentro de si, enquanto o Hierofante a recebe de tradições externas. Ambos os caminhos levam à mastersia.',
      arquétipo: 'O Sábio Interior / O Mestre Exterior',
      orixá: 'Oxum / Oxé',
      sephirah: 'Geburah',
      chakra: '5º Laríngeo',
      lição_espiritual: 'A verdadeira mastersia integra o conhecimento de dentro e de fora.',
      afirmação: 'Eu honro tanto a sabedoria dos mestres externos quanto a luz interior que brilha em mim.',
    },
  ],
  9: [
    {
      arcano: 'A Roda da Fortuna',
      numero_carta: 9,
      arcano_relacionado: 'A Justiça',
      numero_relacionado: 7,
      tipo_relação: 'harmônico',
      elemento: 'Fogo',
      significado_relação: 'A Roda mostra o destino girando enquanto a Justiça garante que cada ação retorne ao seu originador. Juntas, elas representam o karma em movimento.',
      arquétipo: 'A Roda do Destino / O Juiz Cósmico',
      orixá: 'Oxumaré / Oxumarim',
      sephirah: 'Hod',
      chakra: '3º Plexo Solar',
      lição_espiritual: 'O que vai volta, o que sobe desce. Aceite os ciclos com gratidão.',
      afirmação: 'Eu fluo com os ciclos da vida, sabendo que cada ação retorna multiplicada.',
 },
    {
      arcano: 'A Roda da Fortuna',
      numero_carta: 9,
      arcano_relacionado: 'O Sol',
      numero_relacionado: 18,
      tipo_relação: 'progresão',
      elemento: 'Fogo',
      significado_relação: 'A Roda representa os altos e baixos do destino; o Sol traz a luz que ilumina esses ciclos. Após atravessar a Roda, o Sol brilha com clareza e alegria.',
      arquétipo: 'O Destino / O Iluminado',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Tiphereth',
      chakra: '4º Cardíaco',
      lição_espiritual: 'Após os ciclos de subida e descida, a luz do sol sempre retorna.',
      afirmação: 'Eu brilho com a luz do sol após atravessar os ciclos da Roda, celebrando a vida com alegria.',
 },
  ],
  10: [
    {
      arcano: 'A Força',
      numero_carta: 10,
      arcano_relacionado: 'O Carro',
      numero_relacionado: 6,
      tipo_relação: 'oposto',
      elemento: 'Terra',
      significado_relação: 'O Carro usa a força da vontade para conquistar; a Força usa a suavidade da compaixão para dominar. A verdadeira mastersia está na gentleness, não na força bruta.',
      arquétipo: 'A Mestra Interior / O Guerreiro',
      orixá: 'Oxum / Oxé',
      sephirah: 'Tiphereth',
      chakra: '4º Cardíaco',
      lição_espiritual: 'A verdadeira força está na suavidade. Domine seus medos com amor, não com força.',
      afirmação: 'Eu canalizo minha força interior com compaixão, domando meus medos com a suavidade do amor.',
    },
    {
      arcano: 'A Força',
      numero_carta: 10,
      arcano_relacionado: 'A Justiça',
      numero_relacionado: 7,
      tipo_relação: 'harmônico',
      elemento: 'Terra',
      significado_relação: 'A Força representa o poder de agir com compaixão; a Justiça garante que esse poder seja usado com equidade. Ambas as cartas governam o equilíbrio entre força e justiça.',
      arquétipo: 'A Força / A Justiça',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Hod',
      chakra: '4º Cardíaco',
      lição_espiritual: 'A verdadeira força inclui a capacidade de ser gentil. A justiça compassiva é a mais elevada forma de poder.',
      afirmação: 'Eu uso minha força com justiça e compaixão, criando equilíbrio em todas as minhas ações.',
    },
  ],
  11: [
    {
      arcano: 'O Enforcado',
      numero_carta: 11,
      arcano_relacionado: 'A Morte',
      numero_relacionado: 12,
      tipo_relação: 'progresão',
      elemento: 'Água',
      significado_relação: 'O Enforcado representa o sacrifício deliberado; a Morte mostra a transformação inevitável que segue. O sacrifício consciente precede a metamorfose.',
      arquétipo: 'O Sacrifício / A Transformação',
      orixá: 'Xangô / Obará',
      sephirah: 'Geburah',
      chakra: '6º Frontal',
      lição_espiritual: 'Às vezes você precisa perder para se transformar. O sacrifício é o portal para o renascimento.',
      afirmação: 'Eu entrego o que precisa ser sacrificado, confiando que a transformação me renovará completamente.',
    },
    {
      arcano: 'O Enforcado',
      numero_carta: 11,
      arcano_relacionado: 'A Temperança',
      numero_relacionado: 13,
      tipo_relação: 'harmônico',
      elemento: 'Água',
      significado_relação: 'O Enforcado entrega o ego; a Temperança equilibra os opostos. O sacrifício do Enforcado permite que a Temperança faça sua alquimia espiritual.',
      arquétipo: 'O Sacrifício / O Alquimista',
      orixá: 'Oxum / Oxé',
      sephirah: 'Yesod',
      chakra: '5º Laríngeo',
      lição_espiritual: 'Quando você entrega o ego, a alquimia espiritual pode começar.',
      afirmação: 'Eu entrego meu ego e permito que a alquimia divina transforme minhas dualidades em harmonia.',
    },
  ],
  12: [
    {
      arcano: 'A Morte',
      numero_carta: 12,
      arcano_relacionado: 'O Enforcado',
      numero_relacionado: 11,
      tipo_relação: 'progresão',
      elemento: 'Água',
      significado_relação: 'A Morte transforma o que foi sacrificado pelo Enforcado. O sacrifício consciente leva à morte do velho self e ao renascimento do novo.',
      arquétipo: 'A Transformação / O Sacrifício',
      orixá: 'Omolu / Olobón',
      sephirah: 'Tiphereth',
      chakra: '2º Sacral',
      lição_espiritual: 'A morte do velho é o nascimento do novo. Libere o que precisa morrer para que o novo possa nascer.',
      afirmação: 'Eu aceito a transformação como parte natural da minha jornada, deixando ir o que precisa partir.',
 },
    {
      arcano: 'A Morte',
      numero_carta: 12,
      arcano_relacionado: 'A Torre',
      numero_relacionado: 15,
      tipo_relação: 'harmônico',
      elemento: 'Água',
      significado_relação: 'A Morte representa a transformação interna e gradual; a Torre traz a destruição súbita e dramática. Ambas as cartas operam no campo da libertação através da dissolução.',
      arquétipo: 'A Transformação Gradual / A Libertação Súbita',
      orixá: 'Ogum / Etaogundá',
      sephirah: 'Geburah',
      chakra: '3º Plexo Solar',
      lição_espiritual: 'A transformação pode ser gradual ou súbita. Ambos os caminhos levam à libertação.',
      afirmação: 'Eu permito que a transformação ocorra em meu ritmo, ou aceito a destruição súbita quando ela é necessária.',
    },
  ],
  13: [
    {
      arcano: 'A Temperança',
      numero_carta: 13,
      arcano_relacionado: 'O Enforcado',
      numero_relacionado: 11,
      tipo_relação: 'harmônico',
      elemento: 'Fogo',
      significado_relação: 'A Temperança equilibra o que o Enforcado entregou. O sacrifício do Enforcado cria o espaço para que a Temperança faça sua alquimia de integração.',
      arquétipo: 'O Alquimista / O Sacrifício',
      orixá: 'Oxum / Oxé',
      sephirah: 'Yesod',
      chakra: '5º Laríngeo',
      lição_espiritual: 'O sacrifício cria o espaço para a integração. Entregue para harmonizar.',
      afirmação: 'Eu entrego o que precisa ser sacrificado e permito que a alquimia divina integre minhas polaridades.',
    },
    {
      arcano: 'A Temperança',
      numero_carta: 13,
      arcano_relacionado: 'O Diabo',
      numero_relacionado: 14,
      tipo_relação: 'oposto',
      elemento: 'Fogo',
      significado_relação: 'A Temperança busca o equilíbrio divino enquanto o Diabo representa o desequilíbrio das sombras. Esta relação mostra o caminho da redenção do Diabo através da Temperança.',
      arquétipo: 'O Alquimista / A Sombra',
      orixá: 'Exu / Okaran',
      sephirah: 'Yesod',
      chakra: '1º Básico',
      lição_espiritual: 'O Diabo pode ser redimido pela Temperança. A integração das sombras traz equilíbrio.',
      afirmação: 'Eu integro minhas sombras com a sabedoria da Temperança, transformando chained em asas.',
 },
  ],
  14: [
    {
      arcano: 'O Diabo',
      numero_carta: 14,
      arcano_relacionado: 'A Temperança',
      numero_relacionado: 13,
      tipo_relação: 'oposto',
      elemento: 'Terra',
      significado_relação: 'O Diabo representa as correntes da matéria e da sombra; a Temperança oferece o caminho de redenção através do equilíbrio. Esta progresão mostra a possibilidade de libertação.',
      arquétipo: 'A Sombra / O Alquimista',
      orixá: 'Exu / Okaran',
      sephirah: 'Yesod',
      chakra: '1º Básico',
      lição_espiritual: 'As correntes podem ser transformadas em asas quando você encontra o equilíbrio.',
      afirmação: 'Eu transformo minhas correntes em asas, integrando minhas sombras com a sabedoria do equilíbrio.',
    },
    {
      arcano: 'O Diabo',
      numero_carta: 14,
      arcano_relacionado: 'A Torre',
      numero_relacionado: 15,
      tipo_relação: 'progresão',
      elemento: 'Terra',
      significado_relação: 'O Diabo mantém as ilusões e correntes; a Torre as destrói. A libertação das sombras frequentemente requer a destruição completa das estruturas que as mantêm.',
      arquétipo: 'A Prisão / A Libertação',
      orixá: 'Ogum / Etaogundá',
      sephirah: 'Geburah',
      chakra: '3º Plexo Solar',
      lição_espiritual: 'Às vezes a única forma de quebrar as correntes é deixar a torre cair.',
      afirmação: 'Eu permito que o raio da verdade dissipe minhas ilusões, libertando-me das correntes que me prendem.',
    },
  ],
  15: [
    {
      arcano: 'A Torre',
      numero_carta: 15,
      arcano_relacionado: 'O Diabo',
      numero_relacionado: 14,
      tipo_relação: 'progresão',
      elemento: 'Fogo',
      significado_relação: 'A Torre destrói as estruturas que o Diabo criou para manter a prisão. A libertação das sombras vem através da destruição das ilusões.',
      arquétipo: 'A Libertação / A Prisão',
      orixá: 'Ogum / Etaogundá',
      sephirah: 'Geburah',
      chakra: '3º Plexo Solar',
      lição_espiritual: 'A destruição das ilusões é libertação, não punição. Abrace a queda sagrada.',
      afirmação: 'Eu permito que a torre caia, confiando que a destruição das ilusões me libertará.',
    },
    {
      arcano: 'A Torre',
      numero_carta: 15,
      arcano_relacionado: 'A Estrela',
      numero_relacionado: 16,
      tipo_relação: 'progresão',
      elemento: 'Fogo',
      significado_relação: 'A Torre destrói o velho; a Estrela traz a esperança que renasce das cinzas. Esta progresão mostra que após a destruição vem a renovação da esperança.',
      arquétipo: 'A Destruição / A Esperança',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Hod',
      chakra: '6º Frontal',
      lição_espiritual: 'Após a destruição, a esperança sempre renasce. Não se desespere - a estrela espera do outro lado.',
      afirmação: 'Eu permito que a destruição abra espaço para a esperança, brilhando como uma estrela no escuro.',
    },
  ],
  16: [
    {
      arcano: 'A Estrela',
      numero_carta: 16,
      arcano_relacionado: 'A Torre',
      numero_relacionado: 15,
      tipo_relação: 'progresão',
      elemento: 'Ar',
      significado_relação: 'A Estrela traz esperança após a destruição da Torre. Das cinzas da torre queimada, a estrela brilha com luz renovada e inspiradora.',
      arquétipo: 'A Esperança / A Destruição',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Hod',
      chakra: '6º Frontal',
      lição_espiritual: 'A esperança sempre surge das cinzas. Após a destruição, a luz retorna.',
      afirmação: 'Eu brilho como uma estrela no escuro, irradiando esperança e luz para todos que encontram.',
    },
    {
      arcano: 'A Estrela',
      numero_carta: 16,
      arcano_relacionado: 'A Lua',
      numero_relacionado: 17,
      tipo_relação: 'oposto',
      elemento: 'Ar',
      significado_relação: 'A Estrela brilha com luz clara e esperança enquanto a Lua opera nas águas do inconsciente e das ilusões. Esta relação mostra a transição da esperança para a navegação interior.',
      arquétipo: 'A Luz Clara / A Luz Lunar',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Yesod',
      chakra: '6º Frontal',
      lição_espiritual: 'A esperança clara precisa ser testada pelas águas profundas da lua antes de se tornar sabedoria.',
      afirmação: 'Eu brilho com esperança clara e navego pelas águas profundas da minha alma com discernimento.',
    },
  ],
  17: [
    {
      arcano: 'A Lua',
      numero_carta: 17,
      arcano_relacionado: 'A Estrela',
      numero_relacionado: 16,
      tipo_relação: 'oposto',
      elemento: 'Água',
      significado_relação: 'A Lua mostra as ilusões e medos ocultos; a Estrela oferece a esperança que guia através deles. Esta relação representa o caminho da navegação através das águas escuras.',
      arquétipo: 'A Navegadora / A Luz Guiadora',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Yesod',
      chakra: '6º Frontal',
      lição_espiritual: 'A estrela guia você através das águas escuras da lua. Confie na luz mesmo na escuridão.',
      afirmação: 'Eu navego pelas águas escuras da minha mente com a estrela da esperança como guia.',
 },
    {
      arcano: 'A Lua',
      numero_carta: 17,
      arcano_relacionado: 'O Sol',
      numero_relacionado: 18,
      tipo_relação: 'progresão',
      elemento: 'Água',
      significado_relação: 'A Lua revela as ilusões que devem ser atravessadas; o Sol traz a claridade que dissolve todas as ilusões. Esta progresão mostra o caminho da escuridão para a luz.',
      arquétipo: 'A Ilusão / O Iluminado',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Tiphereth',
      chakra: '4º Cardíaco',
      lição_espiritual: 'Após atravessar as ilusões da lua, a luz do sol brilha com claridade absoluta.',
      afirmação: 'Eu atravesso as ilusões e emergo na luz clara do sol, celebrando a verdade e a alegria.',
    },
  ],
  18: [
    {
      arcano: 'O Sol',
      numero_carta: 18,
      arcano_relacionado: 'A Lua',
      numero_relacionado: 17,
      tipo_relação: 'progresão',
      elemento: 'Fogo',
      significado_relação: 'O Sol brilha com claridade absoluta após a navegação pelas ilusões da Lua. Esta progresão representa a consumação da busca espiritual.',
      arquétipo: 'O Iluminado / A Navegadora',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Tiphereth',
      chakra: '4º Cardíaco',
      lição_espiritual: 'A luz do sol dissolve todas as ilusões. Celebre a claridade e a alegria de ser.',
      afirmação: 'Eu brillo com a luz do sol, celebrando a vida e irradiando alegria e claridade para todos.',
    },
    {
      arcano: 'O Sol',
      numero_carta: 18,
      arcano_relacionado: 'O Julgamento',
      numero_relacionado: 19,
      tipo_relação: 'harmônico',
      elemento: 'Fogo',
      significado_relação: 'O Sol traz a claridade da consciência individual; o Julgamento traz o chamado da alma para seu propósito divino. Ambos trabalham com a luz da verdade.',
      arquétipo: 'O Iluminado / O Arcanjo',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Chokmah',
      chakra: '7º Coronário',
      lição_espiritual: 'A claridade do sol prepara você para responder ao chamado da sua alma.',
      afirmação: 'Eu brillo com claridade e respondo ao chamado da minha alma, abraçando meu propósito divino.',
    },
  ],
  19: [
    {
      arcano: 'O Julgamento',
      numero_carta: 19,
      arcano_relacionado: 'O Sol',
      numero_relacionado: 18,
      tipo_relação: 'harmônico',
      elemento: 'Fogo',
      significado_relação: 'O Julgamento é o chamado da alma que segue a claridade do Sol. A luz solar permite que você ouça claramente o chamado do seu Eu Superior.',
      arquétipo: 'O Arcanjo / O Iluminado',
      orixá: 'Oxalá / EjiOníle',
      sephirah: 'Chokmah',
      chakra: '7º Coronário',
      lição_espiritual: 'A claridade do sol permite que você ouça o chamado da sua alma.',
      afirmação: 'Eu respondo ao chamado da minha alma com clareza e coragem, renascendo para minha vida maior.',
    },
    {
      arcano: 'O Julgamento',
      numero_carta: 19,
      arcano_relacionado: 'O Mundo',
      numero_relacionado: 20,
      tipo_relação: 'progresão',
      elemento: 'Fogo',
      significado_relação: 'O Julgamento representa o chamado para o renascimento; o Mundo representa a completude desse renascimento. O chamado da alma leva à integração final.',
      arquétipo: 'O Renascimento / A Completude',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Malkuth',
      chakra: '7º Coronário',
      lição_espiritual: 'O chamado da alma leva à completude. Responda e você encontrará a integração.',
      afirmação: 'Eu respondo ao chamado da minha alma e permito que ela me leve à minha completude divina.',
    },
  ],
  20: [
    {
      arcano: 'O Mundo',
      numero_carta: 20,
      arcano_relacionado: 'O Julgamento',
      numero_relacionado: 19,
      tipo_relação: 'progresão',
      elemento: 'Terra',
      significado_relação: 'O Julgamento chama a alma para seu propósito; o Mundo representa a consumação desse propósito. A resposta ao chamado leva à completude.',
      arquétipo: 'A Completude / O Renascimento',
      orixá: 'Iemanjá / Irosun',
      sephirah: 'Malkuth',
      chakra: '7º Coronário',
      lição_espiritual: 'Você completou a jornada. Todas as lições foram aprendidas; toda a integração foi alcançada.',
      afirmação: 'Eu celebro minha completude, integrando todas as lições da minha jornada em sabedoria e paz.',
    },
    {
      arcano: 'O Mundo',
      numero_carta: 20,
      arcano_relacionado: 'O Louco',
      numero_relacionado: 0,
      tipo_relação: 'progresão',
      elemento: 'Terra',
      significado_relação: 'O Mundo completa o ciclo que O Louco iniciou. O potencial puro do Louco se tornou a integração completa do Mundo. A jornada está completa.',
      arquétipo: 'A Completude / O Início',
      orixá: 'Nanã / Omolu / Olobón',
      sephirah: 'Malkuth',
      chakra: '7º Coronário',
      lição_espiritual: 'O ponto final é também o ponto de partida. A completude permite um novo recomeço.',
      afirmação: 'Eu celebro minha completude e abraço o novo recomeço, sabendo que cada fim é um novo início.',
    },
  ],
  21: [
    {
      arcano: 'O Louco',
      numero_carta: 21,
      arcano_relacionado: 'O Mundo',
      numero_relacionado: 20,
      tipo_relação: 'progresão',
      elemento: 'Ar',
      significado_relação: 'O Louco no final (XXI) representa o retorno ao início, agora com toda a sabedoria conquistada. A mastersia permite dançar na borda do infinito com alegria.',
      arquétipo: 'O Mestre Retornado / O Viajante',
      orixá: 'Nanã / Omolu / Olobón',
      sephirah: 'Kether',
      chakra: '7º Coronário',
      lição_espiritual: 'A verdadeira mastersia é saber que você não sabe nada. O louco é o mais sábio de todos.',
      afirmação: 'Eu abraço a liberdade sagrada do louco, dançando na borda do infinito com sabedoria e alegria.',
    },
    {
      arcano: 'O Louco',
      numero_carta: 21,
      arcano_relacionado: 'O Louco',
      numero_relacionado: 0,
      tipo_relação: 'mestre',
      elemento: 'Ar',
      significado_relação: 'O Louco aparece tanto no início (0) quanto no fim (XXI) da jornada, representando o eterno retorno. Esta dualidade mostra que a liberdade absoluta está tanto no início selvagem quanto na mastersia conquistada.',
      arquétipo: 'O Louco / O Mestre Retornado',
      orixá: 'Nanã / Omolu / Olobón',
      sephirah: 'Kether',
      chakra: '7º Coronário',
      lição_espiritual: 'A verdadeira liberdade é saber que você pode recomeçar quantas vezes quiser.',
      afirmação: 'Eu sou livre para começar novamente, quantas vezes forem necessárias, com coração jovem e espírito sábio.',
    },
  ],
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_TAROT_MAP);
// Freeze nested arrays and objects
Object.entries(TAROT_TAROT_MAP).forEach(([, mappings]) => {
  Object.freeze(mappings);
  mappings.forEach((mapping) => Object.freeze(mapping));
});

/**
 * Returns the tarot-tarot relationships for a given Major Arcana card number (0-21)
 * @param numeroCarta - The Major Arcana card number (0-21)
 * @returns Array of TarotTarotMapping objects with all related cards
 * @throws Error if number is outside valid range
 */
export function getTarotTarotByNumber(numeroCarta: number): TarotTarotMapping[] {
  if (!Number.isInteger(numeroCarta) || numeroCarta < 0 || numeroCarta > 21) {
    throw new Error(`Número do arcano fora do intervalo válido (0-21). Recebido: ${numeroCarta}`);
  }
  return TAROT_TAROT_MAP[numeroCarta] ?? [];
}

/**
 * Get the tarot-tarot relationships for a given arcano name
 * @param arcano - The arcano name (e.g., 'O Louco', 'A Sacerdotisa')
 * @returns Array of TarotTarotMapping objects or null if not found
 */
export function getTarotTarotByArcano(arcano: string): TarotTarotMapping[] {
  const found = Object.values(TAROT_TAROT_MAP).find(
    (mappings) => mappings.some((m) => m.arcano.toLowerCase() === arcano.toLowerCase())
  );
  return found ?? [];
}

/**
 * Get all Tarot-Tarot mappings
 * @returns Array of all TarotTarotMapping objects
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP).flat();
}

/**
 * Check if a card number exists in the mapping
 * @param numeroCarta - Card number to check (0-21)
 * @returns True if card number exists in mapping
 */
export function hasTarotTarot(numeroCarta: number): boolean {
  return numeroCarta in TAROT_TAROT_MAP;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotTarotMapping objects matching the element
 */
export function getTarotTarotByElement(elemento: string): TarotTarotMapping[] {
  const normalized = elemento
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const elementMap: Record<string, Elemento> = {
    fogo: 'Fogo',
    agua: 'Água',
    terra: 'Terra',
    ar: 'Ar',
    eter: 'Éter',
  };

  const key = elementMap[normalized];
  if (!key) return [];

  return getAllTarotTarots().filter((m) => m.elemento === key);
}

/**
 * Get mappings filtered by Orixá
 * @param orixá - Orixá name to search for
 * @returns Array of TarotTarotMapping objects associated with the Orixá
 */
export function getTarotTarotByOrixa(orixá: string): TarotTarotMapping[] {
  const normalized = orixá
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllTarotTarots().filter((m) =>
    m.orixá.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of TarotTarotMapping objects with the matching Sephirah
 */
export function getTarotTarotBySephirah(sephirah: string): TarotTarotMapping[] {
  const normalized = sephirah
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllTarotTarots().filter((m) =>
    m.sephirah.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get mappings filtered by Chakra
 * @param chakra - Chakra name or number to search for
 * @returns Array of TarotTarotMapping objects with the matching Chakra
 */
export function getTarotTarotByChakra(chakra: string): TarotTarotMapping[] {
  const normalized = chakra
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllTarotTarots().filter((m) =>
    m.chakra.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get mappings filtered by relationship type
 * @param tipo - Relationship type (complementar, progresão, oposto, harmônico, sombra, mestre)
 * @returns Array of TarotTarotMapping objects with the matching relationship type
 */
export function getTarotTarotByRelacao(tipo: string): TarotTarotMapping[] {
  const normalized = tipo
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const tipoMap: Record<string, string> = {
    complementar: 'complementar',
    progressao: 'progresão',
    oposto: 'oposto',
    harmonico: 'harmônico',
    sombra: 'sombra',
    mestre: 'mestre',
  };

  const key = tipoMap[normalized];
  if (!key) return [];

  return getAllTarotTarots().filter((m) => m.tipo_relação === key);
}

/**
 * Get all master relationship mappings (mestre type)
 * @returns Array of TarotTarotMapping objects with tipo_relação = 'mestre'
 */
export function getMasterRelationshipMappings(): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.tipo_relação === 'mestre');
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_TAROT_MAP).sort((a, b) => Number(a) - Number(b));
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarotByNumber,
  getTarotTarotByArcano,
  getAllTarotTarots,
  hasTarotTarot,
  getTarotTarotByElement,
  getTarotTarotByOrixa,
  getTarotTarotBySephirah,
  getTarotTarotByChakra,
  getTarotTarotByRelacao,
  getMasterRelationshipMappings,
  getAllArcanos,
  TAROT_TAROT_MAP,
};
