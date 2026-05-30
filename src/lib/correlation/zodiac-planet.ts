/**
 * Zodiac-Planet Spiritual Correlation
 * Maps each zodiac sign to its ruling planet with element connections and spiritual meaning.
 * Based on classical Western astrology integrated with the Cabala dos Caminhos system.
 */

import type { Elemento } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type Signo =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/** The classical planets with their astrological correspondences */
export type Planeta =
  | 'Sol'
  | 'Lua'
  | 'Mercúrio'
  | 'Vênus'
  | 'Marte'
  | 'Júpiter'
  | 'Saturno';

/**
 * Zodiac-planet mapping with spiritual meaning and element connections.
 * Each sign is mapped to its ruling planet, element, and spiritual significance
 * based on Brazilian spiritual traditions and Cabala correlations.
 */
export interface ZodiacPlanetMapping {
  /** The zodiac sign name */
  signo: Signo;
  /** The ruling planet for this sign */
  planeta: Planeta;
  /** Primary element of the sign */
  elemento: Elemento;
  /** Polarity: Yang (active) or Yin (passive) */
  polaridade: 'Yang' | 'Yin';
  /** Modalidade: cardinal, fixo, ou mutável */
  modalidade: 'Cardinal' | 'Fixo' | 'Mutável';
  /** Spiritual meaning of the planet-sign connection */
  significado_espiritual: string;
  /** Key spiritual lessons for this planet-sign combination */
  licoes_espirituais: string[];
  /** Recommended spiritual practices for this combination */
  praticas_rituais: {
    ebos: string[];
    banhos: string[];
    defumacoes: string[];
    mantras: string[];
    cores: string[];
    dias_favoraveis: string[];
  };
  /** Cabala correspondence for this planet-sign */
  correspondencia_cabala: {
    sefira: string;
    caminho: string;
    arcanjo: string;
    vibração: string;
  };
  /** Chakra associated with this planet-sign energy */
  chakra_principal: string;
  /** Orixá associated with this planetary energy */
  orixa_associado: string;
}

/**
 * Complete mapping of all 12 zodiac signs with their planetary correspondences.
 * Based on classical Western astrology integrated with Brazilian spiritual traditions.
 */
export const ZODIAC_PLANET_MAPPINGS: Readonly<Record<Signo, ZodiacPlanetMapping>> = {
  /** Fogo - Yang - Cardinal - Marte: energia de pioneirismo e ação */
  Áries: {
    signo: 'Áries',
    planeta: 'Marte',
    elemento: 'Fogo',
    polaridade: 'Yang',
    modalidade: 'Cardinal',
    significado_espiritual:
      'Marte em Áries representa a chama divina da vontade criadora. É a centelha que desperta a consciência para a ação direta e o pioneirismo espiritual. Canaliza a energia de Ogum, o orixá da guerra e da conquista, para abrir caminhos bloqueados e superar obstáculos terrenos.',
    licoes_espirituais: [
      'Aprender a canalizar a energia de forma construtiva',
      'Desenvolver coragem sem agressividade',
      'Equilibrar a impetuosidade com a paciência espiritual',
      'Transformar conflitos em oportunidades de crescimento',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de força para proteção contra inimigos ocultos',
        'Ebo de coragem para abrir caminhos bloqueados',
        'Ebo de vitória contra obstáculos',
      ],
      banhos: [
        'Banho de alecrim e louro para energia',
        'Banho de pétalas de girassol e cânfora',
        'Banho de arruda e pimenta para proteção',
      ],
      defumacoes: ['Sálvia branca para purificação', 'Benjoim para proteção', 'Aloé para energização'],
      mantras: ['OM (som cósmico de criação)', 'RAM RAM (invocação de Ogum)', 'KRIM (potencialização da força)'],
      cores: ['Vermelho', 'Laranja', 'Amarelo-dourado'],
      dias_favoraveis: ['Terça-feira', 'Domingo (dia do Sol em exaltação)'],
    },
    correspondencia_cabala: {
      sefira: 'Geburah (Severidade) - Camino 11',
      caminho: 'Entre Chokmah (Sabedoria) e Tiphereth (Beleza)',
      arcanjo: 'Kamael (Camil) - executor da vontade divina',
      vibração: 'Frequência de conquista e proteção',
    },
    chakra_principal: 'Muladhara (Raiz) - energia de sobrevivência e força vital',
    orixa_associado: 'Ogum - orixá das batalhas, ferramentas e caminhos',
  },

  /** Terra - Yin - Fixo - Vênus: energia de nutrição e abundância material */
  Touro: {
    signo: 'Touro',
    planeta: 'Vênus',
    elemento: 'Terra',
    polaridade: 'Yin',
    modalidade: 'Fixo',
    significado_espiritual:
      'Vênus em Touro representa a energia da Terra Mãe, a nutrição divina que sustenta a vida. É a bênção da abundância material e sensual, conectando a consciência à natureza através do prazer sagrado. Canaliza a energia de Oxum, a orixá do amor e das águas doces.',
    licoes_espirituais: [
      'Fortalecer a conexão com a natureza e os recursos terrestres',
      'Desenvolver gratidão pela abundância existente',
      'Equilibrar apego material com discernimento espiritual',
      'Transformar sensualidade em devotional sagrado',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de prosperidade para abrir caminhos financeiros',
        'Ebo de fertilidade para bênçãos materiais',
        'Ebo de amor e harmonia conjugal',
      ],
      banhos: [
        'Banho de açucena e jasmim para amor',
        'Banho de terra de Rio e flores brancas',
        'Banho de mel e pétalas de rosa',
      ],
      defumacoes: ['Benjoim para abundância', 'Pau-brasil para longevidade', 'Canela para prosperidade'],
      mantras: ['OM HRIM SRIM (som de Oxum)', 'LAMA (amor incondicional)', 'YAM (vibração da água)'],
      cores: ['Rosa', 'Verde suave', 'Azul claro'],
      dias_favoraveis: ['Sexta-feira', 'Quarta-feira (dia de Mercúrio em harmonia)'],
    },
    correspondencia_cabala: {
      sefira: 'Netzach (Vitória) - Camino 25',
      caminho: 'Entre Tiphereth (Beleza) e Hod (Glória)',
      arcanjo: 'Haniel (Aniel) - mensageiro do amor divino',
      vibração: 'Frequência de abundância e harmonia',
    },
    chakra_principal: 'Svadhisthana (Sacral) - energia de criatividade e prazer',
    orixa_associado: 'Oxum - orixá das águas doces, amor e fertilidade',
  },

  /** Ar - Yang - Mutável - Mercúrio: energia de comunicação e adaptabilidade */
  Gémeos: {
    signo: 'Gémeos',
    planeta: 'Mercúrio',
    elemento: 'Ar',
    polaridade: 'Yang',
    modalidade: 'Mutável',
    significado_espiritual:
      'Mercúrio em Gémeos representa o mensageiro divino que conecta todos os reinos da consciência. É a energia da mente fluida, da comunicação versátil e da busca constante por conhecimento. Canaliza a energia de Ibeji, os gêmeos divine, para equilibrar dualidades e integrar opostos.',
    licoes_espirituais: [
      'Integrar múltiplos aspectos da personalidade',
      'Desenvolver comunicação clara e滴水穿石',
      'Transformar versatilidade em maestria',
      'Estabelecer conexão entre mente e espiritualidade',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de eloquência para negócios e estudos',
        'Ebo de harmonização das dualidades',
        'Ebo de proteção para viajantes',
      ],
      banhos: [
        'Banho de hortelã e eucalipto para clareza mental',
        'Banho de alecrim e lavanda para concentração',
        'Banho de água de coco e flor de laranjeira',
      ],
      defumacoes: ['Lavanda para calma mental', 'Mastruz para proteção intelectual', 'Alcachofra para memória'],
      mantras: ['GAM (sabedoria dual)', 'KLEEM (atração do conhecimento)', 'SAUM (equilíbrio)'],
      cores: ['Amarelo', 'Laranja', 'Azul claro'],
      dias_favoraveis: ['Quarta-feira', 'Terça-feira (fortalece comunicação)'],
    },
    correspondencia_cabala: {
      sefira: 'Hod (Glória) - Camino 24',
      caminho: 'Entre Netzach (Vitória) e Yesod (Fundação)',
      arcanjo: 'Miguel (Mikhael) - protetor da verdade',
      vibração: 'Frequência de comunicação e flexibilidade',
    },
    chakra_principal: 'Vishuddha (Garganta) - energia de expressão e verdade',
    orixa_associado: 'Ibeji - orixás gêmeos protetores das crianças e equilíbrio',
  },

  /** Água - Yin - Cardinal - Lua: energia de emoção e intuição lunar */
  Câncer: {
    signo: 'Câncer',
    planeta: 'Lua',
    elemento: 'Água',
    polaridade: 'Yin',
    modalidade: 'Cardinal',
    significado_espiritual:
      'A Lua em Câncer representa a energia maternal do oceano cósmico, a consciência que nutre e protege. É a intuição profunda que conecta passado, presente e futuro através das emoções. Canaliza a energia de Iemanjá, a rainha do mar, para harmonizar o lar interior e a jornada emocional.',
    licoes_espirituais: [
      'Desenvolver sensibilidade emocional como ferramenta espiritual',
      'Aprender a nutrir a si mesmo e aos outros',
      'Transformar memórias dolorosas em sabedoria',
      'Conectar-se com os ritmos lunares para orientação divina',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de proteção do lar e da família',
        'Ebo de harmonia emocional',
        'Ebo de bênçãos maternais',
      ],
      banhos: [
        'Banho de sal grosso e pétalas de maracujá para paz',
        'Banho de alecrim e água de chuva',
        'Banho de camomila e baunilha para sonhos',
      ],
      defumacoes: ['Mirra para proteção lunar', 'Absinto para intuição', 'Jasmim para连接到 lua'],
      mantras: ['CHANDRA (soma lunar)', 'SOMA (néctar da imortalidade)', 'MAM (proteção maternal)'],
      cores: ['Branco', 'Prata', 'Azul marinho'],
      dias_favoraveis: ['Segunda-feira', 'Quinta-feira (dia de proteção)'],
    },
    correspondencia_cabala: {
      sefira: 'Yesod (Fundação) - Camino 32',
      caminho: 'Entre Hod (Glória) e Malkuth (Reino)',
      arcanjo: 'Gabriel (Gavriel) - mensageiro das revelações',
      vibração: 'Frequência lunar de nutrição e intuição',
    },
    chakra_principal: 'Ajna (Terceiro olho) - energia de percepção além dos sentidos',
    orixa_associado: 'Iemanjá - orixá Rainha do Mar, protetora das famílias',
  },

  /** Fogo - Yang - Fixo - Sol: energia de criatividade e autoexpressão */
  Leão: {
    signo: 'Leão',
    planeta: 'Sol',
    elemento: 'Fogo',
    polaridade: 'Yang',
    modalidade: 'Fixo',
    significado_espiritual:
      'O Sol em Leão representa o fogo central da consciência, a luz que irradia a verdade interior. É a energia do coração radiante que transforma a escuridão em clareza. Canaliza a energia de Oxalá, o pai maior, para iluminar o caminho espiritual e emanar liderança benigna.',
    licoes_espirituais: [
      'Reconhecer a luz divina dentro de si',
      'Desenvolver autoexpressão autêntica',
      'Transformar ego em serviço ao próximo',
      'Irradiar amor incondicional sem apego',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de força vital e clareza mental',
        'Ebo de iluminação espiritual',
        'Ebo de proteção solar',
      ],
      banhos: [
        'Banho de cravo e cinnamon para energia',
        'Banho de sunlight capture com dourada',
        'Banho de Alecrim e mel para coragem',
      ],
      defumacoes: ['Ouro incenso para abundância', 'Sândalo para meditação', 'Cedar para conexão celestial'],
      mantras: ['HRAUM (soma solar)', 'OM SURYAYA (invocação do sol)', 'BHUR BHUH SWAHA (fogo sacrificial)'],
      cores: ['Ouro', 'Amarelo', 'Laranja brilhante'],
      dias_favoraveis: ['Domingo', 'Quinta-feira (fortalece espíritu)'],
    },
    correspondencia_cabala: {
      sefira: 'Tiphereth (Beleza) - Camino 15',
      caminho: 'Centro do árbol - entre Geburah e Chesed',
      arcanjo: 'Rafael (Raffael) - médico celestial',
      vibração: 'Frequência solar de iluminação e harmonia',
    },
    chakra_principal: 'Manipura (Plexo solar) - energia de poder pessoal e vontade',
    orixa_associado: 'Oxalá - orixá Pai maior, luz e paz',
  },

  /** Terra - Yin - Mutável - Mercúrio: energia de serviço e discernimento */
  Virgem: {
    signo: 'Virgem',
    planeta: 'Mercúrio',
    elemento: 'Terra',
    polaridade: 'Yin',
    modalidade: 'Mutável',
    significado_espiritual:
      'Mercúrio em Virgem representa a mente analítica a serviço da purificação espiritual. É a energia do discernimento preciso que separa o essencial do illusório. Canaliza a energia de Ossaim, o orixá das ervas, para curar através do conhecimento detalhado da natureza.',
    licoes_espirituais: [
      'Transformar perfeccionismo em aceitação compassiva',
      'Desenvolver serviço desinteressado',
      'Integrar análise com sabedoria intuitiva',
      'Purificar corpo e mente para a iluminação',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de purificação e limpeza espiritual',
        'Ebo de cura para doenças físicas',
        'Ebo de proteção para trabalhadores da saúde',
      ],
      banhos: [
        'Banho de boldo e pariparoba para desintoxicação',
        'Banho de artemísia e alecrim para proteção',
        'Banho de manjericão e hortelã para clareza',
      ],
      defumacoes: ['Artemísia para purificação', 'Mil-folhas para proteção', 'Patchouli para ancoragem'],
      mantras: ['OM BHUR BHUVAH SWAHA (purificação)', 'AH (som da cura)', 'MAM (purificação elemental)'],
      cores: ['Verde', 'Azul claro', 'Amarelo suave'],
      dias_favoraveis: ['Quarta-feira', 'Sexta-feira (dia de Vênus em harmonização)'],
    },
    correspondencia_cabala: {
      sefira: 'Hod (Glória) e Netzach (Vitória) - Camino 24 e 25',
      caminho: 'Entre Tiphereth (Beleza) e Malkuth (Reino)',
      arcanjo: 'Miguel (Mikhael) - protetor e purificador',
      vibração: 'Frequência de discernimento e serviço',
    },
    chakra_principal: 'Muladhara (Raiz) - energia de fundamentação e purificação',
    orixa_associado: 'Ossaim - orixá das ervas e medicina natural',
  },

  /** Ar - Yang - Cardinal - Vênus: energia de harmonia e relacionamentos */
  Libra: {
    signo: 'Libra',
    planeta: 'Vênus',
    elemento: 'Ar',
    polaridade: 'Yang',
    modalidade: 'Cardinal',
    significado_espiritual:
      'Vênus em Libra representa o equilíbrio divino entre opostos, a harmonia que permite a existência. É a energia do relacionamento sagrado que reflete o outro como espelho de si mesmo. Canaliza a energia de Logun-Ede, o orixá da beleza e da fartura, para unir parcerias em perfeição.',
    licoes_espirituais: [
      'Desenvolver harmonia interior para projetar equilibrio exterior',
      'Transformar relacionamentos em caminhos de iluminação',
      'Integrar masculinidade e feminilidade sagradas',
      'Buscar justiça com compaixão',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de harmonia conjugal e parcerias',
        'Ebo de justiça e equilíbrio legal',
        'Ebo de beleza interior e exterior',
      ],
      banhos: [
        'Banho de pétalas de rosa e água de rosa',
        'Banho de jasmim e lavanda para paz',
        'Banho de mel e leite para harmonia',
      ],
      defumacoes: ['Benjoim para paz', 'Rosa para amor', 'Lavanda para harmonia'],
      mantras: ['SHAM (equilíbrio)', 'SRIM (beleza)', 'HLAUM (harmonia)'],
      cores: ['Rosa', 'Azul claro', 'Branco'],
      dias_favoraveis: ['Sexta-feira', 'Segunda-feira (dia da Lua em harmonia)'],
    },
    correspondencia_cabala: {
      sefira: 'Chesed (Misericórdia) - Camino 7',
      caminho: 'Entre Chokmah (Sabedoria) e Geburah (Severidade)',
      arcanjo: 'Tzadkiel (Tzadquel) - anjo da justiça divina',
      vibração: 'Frequência de equilíbrio e harmonia',
    },
    chakra_principal: 'Anahata (Coração) - energia de amor incondicional',
    orixa_associado: 'Logun-Ede - orixá da beleza, riqueza e encantaria',
  },

  /** Água - Yin - Fixo - Marte: energia de transformação e profundidade */
  Escorpião: {
    signo: 'Escorpião',
    planeta: 'Marte',
    elemento: 'Água',
    polaridade: 'Yin',
    modalidade: 'Fixo',
    significado_espiritual:
      'Marte em Escorpião representa a energia de morte e renascimento, a transformação que ocorre nas profundezas da consciência. É o poder de regeneração que desperta a kundalini e dissolve ilusões. Canaliza a energia de Oxumaré, a serpente arco-íris, para cicatrizes kármicas e renovação espiritual.',
    licoes_espirituais: [
      'Transformar medo de morte em abraço da renovação',
      'Desenvolver poder pessoal sem manipulação',
      'Integrar sombras para wholeness',
      'Despertar poder de regeneração interior',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de transformação e renovação',
        'Ebo de proteção contra mal olhado',
        'Ebo de quebra de maldições ancestrais',
      ],
      banhos: [
        'Banho de quebra-feitiço com arruda e alecrim',
        'Banho de sal grosso e verbena',
        'Banho de comigo-ninguém-pode e espada-de-são-jorge',
      ],
      defumacoes: ['Sálvia para limpeza profunda', 'Mirra para proteção', 'Cicuta para dissolução de vínculos'],
      mantras: [
        'HUM (poder destrutivo-transformador)',
        'TAM (regeneração)',
        'KSHAM (perdão kármico)',
      ],
      cores: ['Preto', 'Vermelho escuro', 'Roxo'],
      dias_favoraveis: ['Terça-feira', 'Quinta-feira (dia de transformação)'],
    },
    correspondencia_cabala: {
      sefira: 'Geburah (Severidade) - Camino 11',
      caminho: 'Entre Chokmah e Tiphereth - aspecto transformador',
      arcanjo: 'Samael (Samael) - regenerador celestial',
      vibração: 'Frequência de transformação e poder regenerador',
    },
    chakra_principal: 'Svadhisthana (Sacral) - energia de criação e destruição',
    orixa_associado: 'Oxumaré - orixá da cobra arco-íris, renovação e cicatrizes',
  },

  /** Fogo - Yang - Mutável - Júpiter: energia de expansão e sabedoria */
  Sagitário: {
    signo: 'Sagitário',
    planeta: 'Júpiter',
    elemento: 'Fogo',
    polaridade: 'Yang',
    modalidade: 'Mutável',
    significado_espiritual:
      'Júpiter em Sagitário representa a expansão infinita da consciência, a busca pela verdade além dos limites terrenos. É a energia do viajante espiritual que cruza oceanos de conhecimento. Canaliza a energia de Oxóssi, o orixá da caça e da abundância, para prosperidade através da sabedoria.',
    licoes_espirituais: [
      'Expandir horizontes além do visível',
      'Transformar aventura externa em jornada interna',
      'Integrar fé com conhecimento',
      'Desenvolver sabedoria universalista',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de prosperidade e abundância',
        'Ebo de proteção para viajantes',
        'Ebo de sabedoria e conhecimento',
      ],
      banhos: [
        'Banho de mand IOC e alecrim para sorte',
        'Banho de folha de figo e guaraná',
        'Banho de pemba e água de chuva',
      ],
      defumacoes: ['Benjoim para expansão', 'Cedar para viagem espiritual', 'Incenso de alecrim para sabedoria'],
      mantras: ['GURU (som de expansão)', 'BHRAM (rotação universal)', 'JAM (prosperidade cósmica)'],
      cores: ['Azul', 'Roxo', 'Verde'],
      dias_favoraveis: ['Quinta-feira', 'Terça-feira (fortalece espiritualidade)'],
    },
    correspondencia_cabala: {
      sefira: 'Chesed (Misericórdia) - Camino 7',
      caminho: 'Entre Chokmah (Sabedoria) e Geburah (Severidade)',
      arcanjo: 'Tsadkiel (Tzadquel) - anjo da expansão divina',
      vibração: 'Frequência de sabedoria e abundância',
    },
    chakra_principal: 'Ajna (Terceiro olho) - energia de visão e sabedoria',
    orixa_associado: 'Oxóssi - orixá do arco e flecha, caçador espiritual',
  },

  /** Terra - Yin - Cardinal - Saturno: energia de estrutura e mestre dourado */
  Capricórnio: {
    signo: 'Capricórnio',
    planeta: 'Saturno',
    elemento: 'Terra',
    polaridade: 'Yin',
    modalidade: 'Cardinal',
    significado_espiritual:
      'Saturno em Capricórnio representa a energia do mestre dourado que transforma chumbo em ouro através do trabalho disciplinado. É a sabedoria que vem da paciência e da restrição. Canaliza a energia de Omulu (Obaluaye), o orixá da saúde e da Terra, para师长 através da prova.',
    licoes_espirituais: [
      'Transformar restrição em liberdade interior',
      'Desenvolver mestre através da disciplina',
      'Integrar responsabilidade com soltura',
      'Alcançar iluminação através do trabalho sagrado',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de师长 e crescimento na carreira',
        'Ebo de proteção contra atrasos',
        'Ebo de cura para doenças crônicas',
      ],
      banhos: [
        'Banho de castanha e caju para prosperidade',
        'Banho de alecrim e assa-peixe para师长',
        'Banho de terra de cemitério (Omulu) para transformação',
      ],
      defumacoes: ['Mauve para师长', 'Cominho para proteção', 'Sálvia para dissolução de bloqueios'],
      mantras: ['OM (restrição sagrada)', 'DUM (ancoragem)', 'SHAM (disciplina)'],
      cores: ['Preto', 'Marrom', 'Cinza'],
      dias_favoraveis: ['Sábado', 'Quarta-feira (fortalece estructura)'],
    },
    correspondencia_cabala: {
      sefira: 'Binah (Compreensão) - Camino 3',
      caminho: 'Entre Chokmah (Sabedoria) e Kether (Coroa)',
      arcanjo: 'Cassiel (Kassiel) - anjo do tempo e da restrição',
      vibração: 'Frequência de师长 e大师境界',
    },
    chakra_principal: 'Muladhara (Raiz) - energia de fundamentação e师长',
    orixa_associado: 'Omulu/Obaluaye - orixá das doenças, cura e师长',
  },

  /** Ar - Yang - Fixo - Saturno: energia de inovação e redenção */
  Aquário: {
    signo: 'Aquário',
    planeta: 'Saturno',
    elemento: 'Ar',
    polaridade: 'Yang',
    modalidade: 'Fixo',
    significado_espiritual:
      'Saturno em Aquário representa a energia do visionário que restructure a sociedade para o bem maior. É a inovação que vem da experiência acumulada e da visão além do tempo. Canaliza a energia de Nanã Buruku, a orixá anciã, para renovação e humanitarianismo.',
    licoes_espirituais: [
      'Transformar humanidade coletivamente',
      'Integrar individualidade com propósito social',
      'Desenvolver visão de futuro baseada na sabedoria do passado',
      'Libertar-se das convenções sem perder fundamento',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de inovação e criatividade social',
        'Ebo de proteção para grupos e comunidades',
        'Ebo de redenção e libertação de padrões',
      ],
      banhos: [
        'Banho de azul e branco para limpeza espiritual',
        'Banho de hortelã e citronela para clareza',
        'Banho de água de chuva e pemba branca',
      ],
      defumacoes: ['Sândalo para meditação avançada', 'Lótus para iluminação', 'Musgo para ancoragem celestial'],
      mantras: ['AHAM (individualidade)', 'MAN (humanitarismo)', 'YUM (libertação)'],
      cores: ['Azul elétrico', 'Roxo', 'Branco'],
      dias_favoraveis: ['Sábado', 'Quarta-feira (dia de inovação)'],
    },
    correspondencia_cabala: {
      sefira: 'Chokmah (Sabedoria) - Camino 2',
      caminho: 'Entre Kether (Coroa) e Binah (Compreensão)',
      arcanjo: 'Tzapariel - anjo da libertação e inovação',
      vibração: 'Frequência de redenção social e visão futurista',
    },
    chakra_principal: 'Ajna (Terceiro olho) - energia de visão coletiva e inovação',
    orixa_associado: 'Nanã Buruku - orixá anciã da sabedoria e renovação',
  },

  /** Água - Yin - Mutável - Júpiter: energia de transcendência e compaixão */
  Peixes: {
    signo: 'Peixes',
    planeta: 'Júpiter',
    elemento: 'Água',
    polaridade: 'Yin',
    modalidade: 'Mutável',
    significado_espiritual:
      'Júpiter em Peixes representa a energia do oceano cósmico que dissolve os limites do eu. É a compaixão infinita que conecta todos os seres na corrente universal. Canaliza a energia de Iemanjá e Oxumaré, para dissolver ilusões e alcançar a unidade com o divino.',
    licoes_espirituais: [
      'Dissolver ego para unir-se ao todo',
      'Desenvolver compaixão infinita sem apego',
      'Transformar sofrimento em sabedoria transcendente',
      'Integrar visão espiritual com ação terrena',
    ],
    praticas_rituais: {
      ebos: [
        'Ebo de purificação das almas e libertação',
        'Ebo de cura espiritual e emocional',
        'Ebo de conexão com o plano espiritual',
      ],
      banhos: [
        'Banho de sal marinho e alecrim para limpeza',
        'Banho de água do mar e flores brancas',
        'Banho de lavanda e jasmim para paz interior',
      ],
      defumacoes: ['Mirra para elevação espiritual', 'Lótus para transcendência', 'Benjoim para conexão divina'],
      mantras: ['SO HUM (eu sou isso)', 'AHAM BRAHMASMI (eu sou o absoluto)', 'SHIVOHAM (eu sou Shiva)'],
      cores: ['Azul-marinho', 'Verde-água', 'Roxo'],
      dias_favoraveis: ['Quinta-feira', 'Segunda-feira (dia de dissolução)'],
    },
    correspondencia_cabala: {
      sefira: 'Yesod (Fundação) - Camino 32',
      caminho: ' Entre Hod e Malkuth - aspecto transcendente',
      arcanjo: 'Gabriel (Gavriel) - mensageiro das revelações',
      vibração: 'Frequência de dissolução e unidade cósmica',
    },
    chakra_principal: 'Sahasrara (Coroa) - energia de unidade com o divino',
    orixa_associado: 'Iemanjá - orixá Rainha do Mar, protetora dos sonhos e dissolution',
  },
} as const;

/**
 * Returns the complete zodiac-planet mapping for a given sign name.
 * @param signo - The zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns The correlation mapping or null if not found
 */
export function getZodiacPlanet(signo: string): ZodiacPlanetMapping | null {
  const normalized = sign normalization(signo);
  return ZODIAC_PLANET_MAPPINGS[normalized as Signo] ?? null;
}

/**
 * Normalizes the sign name by handling variations and case.
 */
function sign normalization(sign: string): string {
  const map: Record<string, string> = {
    aries: 'Áries',
    touro: 'Touro',
    gêmeos: 'Gémeos',
    gemeos: 'Gémeos',
    cancer: 'Câncer',
    cancro: 'Câncer',
    leão: 'Leão',
    leao: 'Leão',
    virgem: 'Virgem',
    libra: 'Libra',
    escorpião: 'Escorpião',
    escorpiao: 'Escorpião',
    sagitário: 'Sagitário',
    sagitario: 'Sagitário',
    capricórnio: 'Capricórnio',
    capricornio: 'Capricórnio',
    aquário: 'Aquário',
    aquario: 'Aquário',
    peixes: 'Peixes',
  };
  const lower = sign.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return map[lower] ?? sign;
}

/**
 * Returns the planet mapping for a given planet name.
 * @param planeta - The planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns Array of zodiac signs ruled by this planet
 */
export function getPlanetZodiac(planeta: string): ZodiacPlanetMapping[] {
  return Object.values(ZODIAC_PLANET_MAPPINGS).filter(
    mapping => mapping.planeta.toLowerCase() === planeta.toLowerCase()
  );
}

/**
 * Returns all zodiac-planet mappings.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacPlanets(): ZodiacPlanetMapping[] {
  return Object.values(ZODIAC_PLANET_MAPPINGS);
}

/**
 * Returns the ruling planet for a given sign.
 * @param signo - The zodiac sign name
 * @returns The planet name or null if not found
 */
export function getPlanetFromZodiac(signo: string): Planeta | null {
  return getZodiacPlanet(signo)?.planeta ?? null;
}

/**
 * Returns the element for a given sign.
 * @param signo - The zodiac sign name
 * @returns The element or null if not found
 */
export function getElementFromZodiac(signo: string): Elemento | null {
  return getZodiacPlanet(signo)?.elemento ?? null;
}

/**
 * Returns the spiritual meaning for a given sign.
 * @param signo - The zodiac sign name
 * @returns The spiritual meaning or null if not found
 */
export function getSignificadoEspiritual(signo: string): string | null {
  return getZodiacPlanet(signo)?.significado_espiritual ?? null;
}

/**
 * Returns the associated orixá for a given sign.
 * @param signo - The zodiac sign name
 * @returns The orixá or null if not found
 */
export function getOrixaFromZodiac(signo: string): string | null {
  return getZodiacPlanet(signo)?.orixa_associado ?? null;
}

/**
 * Returns the principal chakra for a given sign.
 * @param signo - The zodiac sign name
 * @returns The chakra or null if not found
 */
export function getChakraFromZodiac(signo: string): string | null {
  return getZodiacPlanet(signo)?.chakra_principal ?? null;
}

/**
 * Returns all signs ruled by a given planet.
 * @param planeta - The planet name
 * @returns Array of signs ruled by this planet
 */
export function getSignosByPlanet(planeta: string): Signo[] {
  return Object.values(ZODIAC_PLANET_MAPPINGS)
    .filter(mapping => mapping.planeta.toLowerCase() === planeta.toLowerCase())
    .map(mapping => mapping.signo);
}

/**
 * Returns all signs by element.
 * @param elemento - The element name
 * @returns Array of signs with this element
 */
export function getSignosByElement(elemento: string): Signo[] {
  return Object.values(ZODIAC_PLANET_MAPPINGS)
    .filter(mapping => mapping.elemento.toLowerCase() === elemento.toLowerCase())
    .map(mapping => mapping.signo);
}

/**
 * Returns all signs by modality.
 * @param modalidade - The modality (Cardinal, Fixo, Mutável)
 * @returns Array of signs with this modality
 */
export function getSignosByModalidade(modalidade: 'Cardinal' | 'Fixo' | 'Mutável'): Signo[] {
  return Object.values(ZODIAC_PLANET_MAPPINGS)
    .filter(mapping => mapping.modalidade === modalidade)
    .map(mapping => mapping.signo);
}

/**
 * Returns all signs by polarity.
 * @param polaridade - The polarity (Yang or Yin)
 * @returns Array of signs with this polarity
 */
export function getSignosByPolaridade(polaridade: 'Yang' | 'Yin'): Signo[] {
  return Object.values(ZODIAC_PLANET_MAPPINGS)
    .filter(mapping => mapping.polaridade === polaridade)
    .map(mapping => mapping.signo);
}