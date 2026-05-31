/**
 * Tarot-Planet Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to classical planets with spiritual and elemental connections.
 * Based on the Cabala dos Caminhos spiritual system integrations.
 */

/** The seven classical planets in astrology */
export type Planeta =
  | 'Sol'
  | 'Lua'
  | 'Mercúrio'
  | 'Vênus'
  | 'Marte'
  | 'Júpiter'
  | 'Saturno';

/** Element types used in spiritual correlations */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/** Represents the correlation between a Tarot Major Arcana card and its ruling planet */
export interface TarotPlanetMapping {
  /** Planet associated with the arcano */
  planeta: Planeta;
  /** Tarot arcano name (Major Arcana card) */
  arcano: string;
  /** Major Arcana card number (0-21) */
  numero_carta: number;
  /** Element of the arcano */
  elemento: Elemento;
  /** Spiritual meaning and associations */
  significado_espiritual: string[];
  /** Archetype represented by the correlation */
  arquétipo: string;
  /** Associated Orixá */
  orixá: string;
  /** Associated Sephirah from the Tree of Life */
  sephirah: string;
  /** Chakra correspondent */
  chakra: string;
  /** Affirmations for spiritual work */
  afirmações: string[];
  /** Ebós (offerings) */
  ebós: string[];
  /** Banhos (spiritual baths) */
  banhos: string[];
  /** Defumações (smudgings) */
  defumações: string[];
  /** Days of the week associated */
  dias_favoráveis: string[];
  /** Traditional colors */
  cores: string[];
  /** Quality of the energy */
  qualidade: string;
}

/**
 * Complete mapping of Tarot Major Arcana cards (0-21) to their ruling planets.
 * Based on esoteric traditions integrated with the Cabala dos Caminhos system.
 * The planet influences the energy and spiritual meaning of the arcano.
 */
export const TAROT_PLANET_MAP: Record<number, TarotPlanetMapping> = {
  0: {
    planeta: 'Mercúrio',
    arcano: 'O Louco',
    numero_carta: 0,
    elemento: 'Ar',
    significado_espiritual: [
      'Liberdade e espontaneidade sagrada',
      'Novo início e salto de fé',
      'Potencial puro não realizado',
      'Confiança no universo',
      'Transcendência das regras',
      'Aventura espiritual',
    ],
    arquétipo: 'O Aventureiro / O Trickster',
    orixá: 'Nanã / Omolu / Eshu',
    sephirah: 'Malkuth',
    chakra: '7º Coronário',
    afirmações: [
      'Eu abraço a aventura da vida com coração aberto',
      'Confio no universo que sustenta meus passos',
      'O novo me espera além do conhecido',
    ],
    ebós: ['Frutas novas', 'Cerveja', 'Pão fresco', 'Sêmola'],
    banhos: ['Arruda', 'Guiné', 'Alecrim fresco'],
    defumações: ['Sálvia', 'Benjoim', 'Lavanda'],
    dias_favoráveis: ['Segunda-feira', 'Domingo'],
    cores: ['Amarelo', 'Arco-íris', 'Branco'],
    qualidade: 'Liberdade e espontaneidade',
  },
  1: {
    planeta: 'Mercúrio',
    arcano: 'O Mago',
    numero_carta: 1,
    elemento: 'Ar',
    significado_espiritual: [
      'Poder pessoal e maestria',
      'Comunicação e expressão',
      'Início de empreendimentos',
      'Ferramentas espirituais',
      'Vontade e intenção',
      'Manifestação criativa',
    ],
    arquétipo: 'O Mago / O Manipulador',
    orixá: 'Exu',
    sephirah: 'Kether',
    chakra: '5º Laríngeo',
    afirmações: [
      'Eu possuo todo o poder necessário para criar',
      'Minhas palavras têm poder de manifestar',
      'Eu sou o canal da energia divina',
    ],
    ebós: ['Cachaça', 'Pirão', 'Fumo', 'Amendoim'],
    banhos: ['Pimenta', 'Gengibre', 'Arruda'],
    defumações: ['Pimenta', 'Gengibre seco', 'Cravo'],
    dias_favoráveis: ['Quarta-feira', 'Segunda-feira'],
    cores: ['Amarelo', 'Vermelho', 'Preto'],
    qualidade: 'Vontade e poder pessoal',
  },
  2: {
    planeta: 'Lua',
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    elemento: 'Água',
    significado_espiritual: [
      'Sabedoria intuitiva e oculta',
      'Mistérios e segredos',
      'O véu entre os mundos',
      'Intuição e discernimento',
      'Conhecimento ancestral',
      'Receptividade sagrada',
    ],
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios',
    orixá: 'Nanã',
    sephirah: 'Chokmah',
    chakra: '6º Frontal',
    afirmações: [
      'Eu escuto a voz da minha alma',
      'Confio nos mistérios do universo',
      'Minha intuição me guia com segurança',
    ],
    ebós: ['Feijão preto', 'Frutas roxas', 'Velas lilases'],
    banhos: ['Alcaparra', 'Colônia', 'Folha de lágrima'],
    defumações: ['Lavanda', 'Lálá', 'Alcáçuz'],
    dias_favoráveis: ['Segunda-feira', 'Sábado'],
    cores: ['Azul Escuro', 'Branco', 'Prata'],
    qualidade: 'Intuição e mistério',
  },
  3: {
    planeta: 'Vênus',
    arcano: 'A Imperatriz',
    numero_carta: 3,
    elemento: 'Terra',
    significado_espiritual: [
      'Fertilidade e abundância',
      'Amor e nutição',
      'Beleza e arte',
      'Conexão com a natureza',
      'Criação e manifestação',
      'Prazer da existência',
    ],
    arquétipo: 'A Mãe Divina / A Criadora',
    orixá: 'Oxum',
    sephirah: 'Binah',
    chakra: '4º Cardíaco',
    afirmações: [
      'Eu sou nutrida pela energia divina',
      'A abundância flui através de mim',
      'A beleza sagrada habita em mim',
    ],
    ebós: ['Mel', 'Flores douradas', 'Acarajé', 'Doces'],
    banhos: ['Rosa', 'Jasmim', 'Flor de laranjeira'],
    defumações: ['Baunilha', 'Rosa', 'Ylang-ylang'],
    dias_favoráveis: ['Sexta-feira', 'Sábado'],
    cores: ['Rosa', 'Verde', 'Dourado'],
    qualidade: 'Amor e abundância',
  },
  4: {
    planeta: 'Sol',
    arcano: 'O Imperador',
    numero_carta: 4,
    elemento: 'Fogo',
    significado_espiritual: [
      'Autoridade e estrutura',
      'Disciplina e ordem',
      'Poder patriarcal',
      'Lei e regras',
      'Autodomínio',
      'Liderança sagrada',
    ],
    arquétipo: 'O Pai / O Governante',
    orixá: 'Oxalá',
    sephirah: 'Chesed',
    chakra: '1º Básico',
    afirmações: [
      'Eu estabeleço ordem em minha vida',
      'A disciplina me liberta',
      'Lidero com sabedoria e justiça',
    ],
    ebós: ['Leite branco', 'Frutas brancas', 'Oferendas de paz'],
    banhos: ['Alfazema', 'Flor de bacharel', 'Rosa branca'],
    defumações: ['Benjoim puro', 'Sálvia branca', 'Mirra'],
    dias_favoráveis: ['Domingo', 'Sexta-feira'],
    cores: ['Branco', 'Dourado', 'Vermelho'],
    qualidade: 'Autoridade e ordem',
  },
  5: {
    planeta: 'Mercúrio',
    arcano: 'O Hierofante',
    numero_carta: 5,
    elemento: 'Fogo',
    significado_espiritual: [
      'Sabedoria espiritual e tradição',
      'Educação e ensinamentos',
      'Sacramentos e rituais',
      'Busca por significado',
      'Conformidade divina',
      'Mestre espiritual',
    ],
    arquétipo: 'O Sacerdote / O Mestre Espiritual',
    orixá: 'Oxóssi',
    sephirah: 'Geburah',
    chakra: '5º Laríngeo',
    afirmações: [
      'Eu busco a sabedoria sagrada',
      'Aberto aos ensinamentos dos mestres',
      'A verdade me liberta',
    ],
    ebós: ['Frutas silvestres', 'Milho', 'Mel', 'Ervas'],
    banhos: ['Samambaia', 'Alecrim', 'Jurema'],
    defumações: ['Alecrim', 'Sálvia', 'Benjoim'],
    dias_favoráveis: ['Quinta-feira', 'Domingo'],
    cores: ['Amarelo', 'Dourado', 'Vermelho'],
    qualidade: 'Sabedoria e tradição',
  },
  6: {
    planeta: 'Vênus',
    arcano: 'Os Enamorados',
    numero_carta: 6,
    elemento: 'Ar',
    significado_espiritual: [
      'Amor e união',
      'Escolhas do coração',
      'União das polaridades',
      'Relacionamentos sagrados',
      'Harmonia interior',
      'Integração das sombras',
    ],
    arquétipo: 'O Amante / A União Sagrada',
    orixá: 'Oxum',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    afirmações: [
      'Eu escolho o amor que me eleva',
      'Minhas polaridades se harmonizam',
      'O amor verdadeiro habita em mim',
    ],
    ebós: ['Mel', 'Flores', 'Perfumes finos', 'Balangandãs'],
    banhos: ['Rosa', 'Jasmim', 'Flor de laranjeira'],
    defumações: ['Baunilha', 'Rosa', 'Ylang-ylang'],
    dias_favoráveis: ['Sexta-feira', 'Segunda-feira'],
    cores: ['Rosa', 'Azul Claro', 'Dourado'],
    qualidade: 'Amor e união',
  },
  7: {
    planeta: 'Lua',
    arcano: 'O Carro',
    numero_carta: 7,
    elemento: 'Água',
    significado_espiritual: [
      'Vitória e determinação',
      'Controle das emoções',
      'Ação decisiva',
      'Avanço em direção às metas',
      'Conquista de obstáculos',
      'Equilíbrio das forças',
    ],
    arquétipo: 'O Guerreiro / O Vitorioso',
    orixá: 'Ogum',
    sephirah: 'Netzach',
    chakra: '3º Plexo Solar',
    afirmações: [
      'Eu avanço com determinação',
      'O sucesso é meu destino',
      'Venço todos os obstáculos',
    ],
    ebós: ['Inhame assado', 'Carne de boi', 'Vela vermelha'],
    banhos: ['Pimenta', 'Gengibre', 'Alecrim'],
    defumações: ['Pimenta', 'Gengibre', 'Cravo'],
    dias_favoráveis: ['Terça-feira', 'Domingo'],
    cores: ['Vermelho', 'Amarelo', 'Ouro'],
    qualidade: 'Determinação e vitória',
  },
  8: {
    planeta: 'Marte',
    arcano: 'A Força',
    numero_carta: 8,
    elemento: 'Terra',
    significado_espiritual: [
      'Força interior e coragem',
      'Domínio sobre os instintos',
      'Poder da alma',
      'Transmutação da agressividade',
      'Coragem e compaixão',
      'Equilíbrio entre instinto e espírito',
    ],
    arquétipo: 'A Força / A Mestra Interior',
    orixá: 'Ogum',
    sephirah: 'Hod',
    chakra: '4º Cardíaco',
    afirmações: [
      'Eu tenho força para superar todo obstáculo',
      'A verdadeira força está na suavidade',
      'Minhas emoções servem à minha alma',
    ],
    ebós: ['Inhame assado', 'Ferro', 'Vela vermelha'],
    banhos: ['Alecrim', 'Guiné', 'Aroeira'],
    defumações: ['Alecrim', 'Cravo', 'Canela'],
    dias_favoráveis: ['Terça-feira', 'Domingo'],
    cores: ['Vermelho', 'Laranja', 'Amarelo'],
    qualidade: 'Força e coragem',
  },
  9: {
    planeta: 'Lua',
    arcano: 'O Eremita',
    numero_carta: 9,
    elemento: 'Terra',
    significado_espiritual: [
      'Sabedoria interior',
      'Busca da verdade',
      'Retiro e introspecção',
      'Luz interior',
      'Iluminação espiritual',
      'Solitude sagrada',
    ],
    arquétipo: 'O Sábio / O Iluminado',
    orixá: 'Nanã',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    afirmações: [
      'Eu ilumino meu caminho com a sabedoria da alma',
      'Na quietude, a verdade se revela',
      'A solidão é minha mestra',
    ],
    ebós: ['Feijão preto', 'Frutas escuras', 'Velas lilases'],
    banhos: ['Alcaparra', 'Alfazema', 'Folhas calmas'],
    defumações: ['Lavanda', 'Sálvia', 'Mirra'],
    dias_favoráveis: ['Segunda-feira', 'Sábado'],
    cores: ['Azul Escuro', 'Amarelo', 'Branco'],
    qualidade: 'Sabedoria e introspecção',
  },
  10: {
    planeta: 'Júpiter',
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    elemento: 'Fogo',
    significado_espiritual: [
      'Ciclos do destino',
      'Transformação e mudança',
      'Lei de causa e efeito',
      'Oportunidade e sorte',
      'Ascensão e queda',
      'Aceitação do fluxo',
    ],
    arquétipo: 'A Roda / O Destino em Movimento',
    orixá: 'Oxumaré',
    sephirah: 'Malkuth',
    chakra: '3º Plexo Solar',
    afirmações: [
      'Eu fluo com os ciclos da vida',
      'Cada volta traz novas oportunidades',
      'Aceito o destino com gratidão',
    ],
    ebós: ['Arroz doce', 'Arco-íris', 'Oferendas variadas'],
    banhos: ['Dinheiro-em-penca', 'Folha da fortuna'],
    defumações: ['Alfarroba', 'Benjoim', 'Mastruz'],
    dias_favoráveis: ['Quinta-feira', 'Quarta-feira'],
    cores: ['Arco-íris', 'Amarelo', 'Verde'],
    qualidade: 'Transformação e adaptação',
  },
  11: {
    planeta: 'Júpiter',
    arcano: 'A Justiça',
    numero_carta: 11,
    elemento: 'Ar',
    significado_espiritual: [
      'Lei cósmica de causa e efeito',
      'Verdade e integridade',
      'Equilíbrio karma',
      'Responsabilidade pelas escolhas',
      'Justiça divina',
      'Retorno infinito da energia',
    ],
    arquétipo: 'A Justiça / O Juiz Cósmico',
    orixá: 'Oxalá',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    afirmações: [
      'Eu ajo com integridade absoluta',
      'A justiça cósmica equilibra minhas escolhas',
      'A verdade me liberta',
    ],
    ebós: ['Leite branco', 'Frutas brancas', 'Oferendas de paz'],
    banhos: ['Alfazema', 'Flor de bacharel', 'Rosa branca'],
    defumações: ['Benjoim puro', 'Sálvia branca', 'Mirra'],
    dias_favoráveis: ['Sexta-feira', 'Domingo'],
    cores: ['Amarelo', 'Branco', 'Azul'],
    qualidade: 'Integridade e verdade',
  },
  12: {
    planeta: 'Saturno',
    arcano: 'O Enforcado',
    numero_carta: 12,
    elemento: 'Água',
    significado_espiritual: [
      'Sacrifício e entrega',
      'Nova perspectiva',
      'Suspensão dos interesses',
      'Renúncia temporária',
      'Transformação através da entrega',
      'Iluminação através do sacrifício',
    ],
    arquétipo: 'O Mártir / O Sacrificado',
    orixá: 'Omolu',
    sephirah: 'Geburah',
    chakra: '6º Frontal',
    afirmações: [
      'Eu entrego o que precisa ser entregue',
      'O sacrifício traz libertação',
      'Minha perspectiva se expande',
    ],
    ebós: ['Pipoca', 'Frutas escuras', 'Oferendas de terra'],
    banhos: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho'],
    defumações: ['Pau-brasil', 'Nim', 'Carvão vegetal'],
    dias_favoráveis: ['Sábado', 'Segunda-feira'],
    cores: ['Preto', 'Branco', 'Vermelho'],
    qualidade: 'Entrega e sacrifício',
  },
  13: {
    planeta: 'Saturno',
    arcano: 'A Morte',
    numero_carta: 13,
    elemento: 'Água',
    significado_espiritual: [
      'Transformação e renovação',
      'Fim de ciclos',
      'Transmutação interior',
      'Renascimento espiritual',
      'Libertação do velho',
      'Novo começo após o fim',
    ],
    arquétipo: 'A Transformação / A Morte e Renascimento',
    orixá: 'Omolu',
    sephirah: 'Netzach',
    chakra: '1º Básico',
    afirmações: [
      'Eu aceito a transformação com coragem',
      'Cada fim é um novo começo',
      'O novo nasce do que precisa morrer',
    ],
    ebós: ['Pipoca', 'Frutas escuras', 'Oferendas de descarrego'],
    banhos: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho'],
    defumações: ['Pau-brasil', 'Nim', 'Carvão vegetal'],
    dias_favoráveis: ['Sábado', 'Segunda-feira'],
    cores: ['Preto', 'Branco', 'Vermelho'],
    qualidade: 'Transformação e renovação',
  },
  14: {
    planeta: 'Mercúrio',
    arcano: 'A Temperança',
    numero_carta: 14,
    elemento: 'Fogo',
    significado_espiritual: [
      'Equilíbrio e harmonia',
      'Moderação e paciência',
      'Alquimia interior',
      'Mistura das polaridades',
      'Tempo e adaptação',
      'Serenidade sagrada',
    ],
    arquétipo: 'A Alquimista / A Mediadora',
    orixá: 'Oxumaré',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    afirmações: [
      'Eu encontro o equilíbrio em todas as coisas',
      'A harmonia flui através de mim',
      'Moderación é minha força',
    ],
    ebós: ['Arroz doce', 'Arco-íris', 'Água florida'],
    banhos: ['Dinheiro-em-penca', 'Folha da fortuna', 'Colônia'],
    defumações: ['Alfarroba', 'Benjoim', 'Lavanda'],
    dias_favoráveis: ['Quarta-feira', 'Sexta-feira'],
    cores: ['Arco-íris', 'Rosa', 'Azul'],
    qualidade: 'Equilíbrio e moderação',
  },
  15: {
    planeta: 'Saturno',
    arcano: 'O Diabo',
    numero_carta: 15,
    elemento: 'Terra',
    significado_espiritual: [
      'Sombras e apegos',
      'Cativeiro voluntário',
      'Natureza instintiva',
      'Prova e tentação',
      'Libertação das prisões internas',
      'Reconhecimento das sombras',
    ],
    arquétipo: 'O Trickster / A Sombra',
    orixá: 'Omolu',
    sephirah: 'Yesod',
    chakra: '1º Básico',
    afirmações: [
      'Eu reconheço minhas sombras e as transformo',
      'Sou livre de todo apego',
      'A luz brilha através das trevas',
    ],
    ebós: ['Pipoca', 'Frutas escuras', 'Ebó de caminho'],
    banhos: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho'],
    defumações: ['Pau-brasil', 'Nim', 'Carvão vegetal'],
    dias_favoráveis: ['Sábado', 'Terça-feira'],
    cores: ['Preto', 'Vermelho', 'Branco'],
    qualidade: 'Libertação e autocontrole',
  },
  16: {
    planeta: 'Marte',
    arcano: 'A Torre',
    numero_carta: 16,
    elemento: 'Fogo',
    significado_espiritual: [
      'Transformação abrupta',
      'Quebra de ilusões',
      'Libertação repentina',
      'Rebuilding após destruição',
      'Despertar forçado',
      'Revelação divina',
    ],
    arquétipo: 'A Destruição Criativa / O Raio',
    orixá: 'Iansã',
    sephirah: 'Malkuth',
    chakra: '3º Plexo Solar',
    afirmações: [
      'Eu aceito as mudanças repentinas com coragem',
      'Das cinzas, algo novo surge',
      'A destruição traz libertação',
    ],
    ebós: ['Acarajé', 'Velas laranjas', 'Pipoca', 'Água de cheiro'],
    banhos: ['Pimenta', 'Gengibre', 'Arruda forte'],
    defumações: ['Pimenta', 'Sálvia', 'Alecrim'],
    dias_favoráveis: ['Terça-feira', 'Quarta-feira'],
    cores: ['Vermelho', 'Laranja', 'Amarelo'],
    qualidade: 'Transformação e libertação',
  },
  17: {
    planeta: 'Lua',
    arcano: 'A Estrela',
    numero_carta: 17,
    elemento: 'Ar',
    significado_espiritual: [
      'Esperança e inspiração',
      'Renovação espiritual',
      'Guiação celestial',
      'Paz e serenidade',
      'Conexão com o divino',
      'Abundância cósmica',
    ],
    arquétipo: 'A Esperança / A Iluminada',
    orixá: 'Iemanjá',
    sephirah: 'Hod',
    chakra: '6º Frontal',
    afirmações: [
      'Eu sou guiado pela luz celestial',
      'A esperança habita em meu coração',
      'A paz flui através de mim',
    ],
    ebós: ['Canjica', 'Balas brancas', 'Perfumes finos'],
    banhos: ['Colônia', 'Alcaparra', 'Folha de lágrima'],
    defumações: ['Lavanda', 'Lálá', 'Alcáçuz'],
    dias_favoráveis: ['Segunda-feira', 'Sábado'],
    cores: ['Azul Claro', 'Branco', 'Dourado'],
    qualidade: 'Esperança e renovação',
  },
  18: {
    planeta: 'Lua',
    arcano: 'A Lua',
    numero_carta: 18,
    elemento: 'Água',
    significado_espiritual: [
      'Ilusão e realidade',
      'Inconsciente profundo',
      'Medos e fantasias',
      'Intuição primitiva',
      'O mundo dos sonhos',
      'Navigação nas águas escuras',
    ],
    arquétipo: 'A Ilusão / A Sonhadora',
    orixá: 'Iemanjá',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    afirmações: [
      'Eu navego pelas águas do inconsciente com sabedoria',
      'A verdade se revela além das ilusões',
      'Minha intuição me guia na escuridão',
    ],
    ebós: ['Canjica', 'Água do mar', 'Flores brancas'],
    banhos: ['Colônia', 'Alcaparra', 'Folha de lágrima'],
    defumações: ['Lavanda', 'Lálá', 'Alcáçuz'],
    dias_favoráveis: ['Segunda-feira', 'Sábado'],
    cores: ['Azul Escuro', 'Branco', 'Prata'],
    qualidade: 'Intuição e discernimento',
  },
  19: {
    planeta: 'Sol',
    arcano: 'O Sol',
    numero_carta: 19,
    elemento: 'Fogo',
    significado_espiritual: [
      'Sucesso e vitória',
      'Vitalidade e brilho',
      'Propósito de vida',
      'Alegria e felicidade',
      'Verdade e autenticidade',
      'Iluminação pessoal',
    ],
    arquétipo: 'O Vitorioso / O Rei',
    orixá: 'Xangô',
    sephirah: 'Tiphereth',
    chakra: '3º Plexo Solar',
    afirmações: [
      'Eu brilho com minha luz interior',
      'O sucesso é meu direito divino',
      'A verdade me liberta',
    ],
    ebós: ['Amalá', 'Pinhão', 'Vela amarela', 'Frutas amarelas'],
    banhos: ['Guiné', 'Arruda', 'Quebra-pedra'],
    defumações: ['Sândalo', 'Cravo-da-índia', 'Canela'],
    dias_favoráveis: ['Domingo', 'Quarta-feira'],
    cores: ['Amarelo', 'Dourado', 'Branco'],
    qualidade: 'Vitalidade e sucesso',
  },
  20: {
    planeta: 'Júpiter',
    arcano: 'O Julgamento',
    numero_carta: 20,
    elemento: 'Fogo',
    significado_espiritual: [
      'Renovação e renascimento',
      'Julgamento e redenção',
      'Chamado espiritual',
      'Despertar da alma',
      'Expiação e perdão',
      'Ascensão consciente',
    ],
    arquétipo: 'O Arcanjo / O Juiz Interior',
    orixá: 'Oxalá',
    sephirah: 'Malkuth',
    chakra: '7º Coronário',
    afirmações: [
      'Eu me renovo a cada momento',
      'O julgamento divino é justiça e amor',
      'Respondo ao chamado da minha alma',
    ],
    ebós: ['Leite branco', 'Frutas brancas', 'Oferendas de paz'],
    banhos: ['Alfazema', 'Flor de bacharel', 'Rosa branca'],
    defumações: ['Benjoim puro', 'Sálvia branca', 'Mirra'],
    dias_favoráveis: ['Sexta-feira', 'Domingo', 'Quinta-feira'],
    cores: ['Branco', 'Dourado', 'Violeta'],
    qualidade: 'Renovação e redenção',
  },
  21: {
    planeta: 'Saturno',
    arcano: 'O Mundo',
    numero_carta: 21,
    elemento: 'Terra',
    significado_espiritual: [
      'Completude e realização',
      'Integração dos opostos',
      'Fim de ciclos',
      'Realização terrena e espiritual',
      'União com o divino',
      'Sabedoria completa',
    ],
    arquétipo: 'O Mago Divino / A Realização',
    orixá: 'Omolu',
    sephirah: 'Malkuth',
    chakra: '7º Coronário',
    afirmações: [
      'Eu sou completo e realizado',
      'O mundo se manifesta através de mim',
      'A sabedoria completa habita em mim',
    ],
    ebós: ['Pipoca', 'Frutas escuras', 'Oferendas completas'],
    banhos: ['Canela-de-velho', 'Assa-peixe', 'Alfazema'],
    defumações: ['Pau-brasil', 'Benjoim', 'Mirra'],
    dias_favoráveis: ['Sábado', 'Sexta-feira'],
    cores: ['Verde', 'Dourado', 'Branco'],
    qualidade: 'Completude e integração',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_PLANET_MAP);
Object.values(TAROT_PLANET_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All seven classical planets
 */
export const TODOS_PLANETAS: readonly Planeta[] = Object.freeze([
  'Sol',
  'Lua',
  'Mercúrio',
  'Vênus',
  'Marte',
  'Júpiter',
  'Saturno',
]);

/**
 * Normalizes arcano name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarArcano(arcano: string): string | null {
  const normalizado = arcano.toLowerCase().trim();
  const mapa: Record<string, string> = {
    'o louco': 'O Louco',
    'a sacerdotisa': 'A Sacerdotisa',
    'a imperatriz': 'A Imperatriz',
    'o imperador': 'O Imperador',
    'o hierofante': 'O Hierofante',
    'os enamorados': 'Os Enamorados',
    'o carro': 'O Carro',
    'a força': 'A Força',
    'o eremita': 'O Eremita',
    'a roda da fortuna': 'A Roda da Fortuna',
    'a justiça': 'A Justiça',
    'o enforcado': 'O Enforcado',
    'a morte': 'A Morte',
    'a temperança': 'A Temperança',
    'o diabo': 'O Diabo',
    'a torre': 'A Torre',
    'a estrela': 'A Estrela',
    'a lua': 'A Lua',
    'o sol': 'O Sol',
    'o julgamento': 'O Julgamento',
    'o mundo': 'O Mundo',
  };
  return mapa[normalizado] ?? null;
}

/**
 * Get the tarot-planet mapping for a given arcano name.
 * @param arcano - Tarot arcano name (e.g., 'O Sol', 'A Lua')
 * @returns TarotPlanetMapping or null if not found
 */
export function getTarotPlanet(arcano: string): TarotPlanetMapping | null {
  const normalizado = normalizarArcano(arcano);
  if (!normalizado) return null;

  const mapping = Object.values(TAROT_PLANET_MAP).find(
    (m) => m.arcano === normalizado
  );
  return mapping ?? null;
}

/**
 * Get the tarot-planet mapping for a given card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns TarotPlanetMapping or null if not found
 */
export function getPlanetTarotByNumber(numero: number): TarotPlanetMapping | null {
  return TAROT_PLANET_MAP[numero] ?? null;
}

/**
 * Get the arcano for a given card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoFromNumber(numero: number): string | null {
  return TAROT_PLANET_MAP[numero]?.arcano ?? null;
}

/**
 * Get the planet for a given arcano name.
 * @param arcano - Tarot arcano name
 * @returns Planeta or null if not found
 */
export function getPlanetaFromArcano(arcano: string): Planeta | null {
  return getTarotPlanet(arcano)?.planeta ?? null;
}

/**
 * Get the planet for a given card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns Planeta or null if not found
 */
export function getPlanetaFromNumber(numero: number): Planeta | null {
  return TAROT_PLANET_MAP[numero]?.planeta ?? null;
}

/**
 * Get the element for a given arcano.
 * @param arcano - Tarot arcano name
 * @returns Elemento or null if not found
 */
export function getElementoFromArcano(arcano: string): Elemento | null {
  return getTarotPlanet(arcano)?.elemento ?? null;
}

/**
 * Get the arcano for a given planet.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua')
 * @returns Arcano name or null if not found
 */
export function getPlanetArcano(planeta: string): string | null {
  const mappings = getTarotsByPlaneta(planeta);
  return mappings.length > 0 ? mappings[0].arcano : null;
}

/**
 * Get all tarot-planet mappings.
 * @returns Array of all correlation mappings
 */
export function getAllTarotPlanets(): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAP);
}

/**
 * Get all arcano names used in the mapping.
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.entries(TAROT_PLANET_MAP)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, m]) => m.arcano);
}

/**
 * Get all tarot cards mapped to a specific planet.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua')
 * @returns Array of TarotPlanetMapping
 */
export function getTarotsByPlaneta(planeta: string): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAP).filter((m) => m.planeta === planeta);
}

/**
 * Get all tarot cards associated with a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of TarotPlanetMapping
 */
export function getTarotsByElement(elemento: string): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAP).filter((m) => m.elemento === elemento);
}

/**
 * Get all planets used in the mapping.
 * @returns Array of unique planet names
 */
export function getAllPlanets(): Planeta[] {
  return [...new Set(Object.values(TAROT_PLANET_MAP).map((m) => m.planeta))];
}

/**
 * Check if an arcano exists in the mapping.
 * @param arcano - Arcano name to check
 * @returns True if arcano exists
 */
export function hasTarotPlanet(arcano: string): boolean {
  return getTarotPlanet(arcano) !== null;
}

/**
 * Check if a card number exists in the mapping.
 * @param numero - Card number to check (0-21)
 * @returns True if card number exists
 */
export function hasPlanetTarot(numero: number): boolean {
  return numero in TAROT_PLANET_MAP;
}

/**
 * Get the affirmation for a given arcano.
 * @param arcano - Tarot arcano name
 * @returns First affirmation or null if not found
 */
export function getAfirmacaoFromArcano(arcano: string): string | null {
  return getTarotPlanet(arcano)?.afirmações[0] ?? null;
}

/**
 * Get the affirmations for a given planet.
 * @param planeta - Planet name
 * @returns Array of affirmations
 */
export function getAfirmacoesByPlaneta(planeta: string): string[] {
  const mappings = getTarotsByPlaneta(planeta);
  return mappings.flatMap((m) => m.afirmações);
}

/**
 * Default export with all public functions
 */
export default {
  getTarotPlanet,
  getPlanetTarotByNumber,
  getArcanoFromNumber,
  getPlanetaFromArcano,
  getPlanetaFromNumber,
  getElementoFromArcano,
  getPlanetArcano,
  getAllTarotPlanets,
  getAllArcanos,
  getTarotsByPlaneta,
  getTarotsByElement,
  getAllPlanets,
  hasTarotPlanet,
  hasPlanetTarot,
  getAfirmacaoFromArcano,
  getAfirmacoesByPlaneta,
};
