/**
 * Odú Ifá-Numerology Correlation Mapping
 * Maps each Odu Ifá (Merindilogun) to its corresponding numerology numbers
 * Based on IDEIA.md Cabala dos Caminhos spiritual system
 * The reverse complement of numerology-odu.ts
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export interface NumerologyNumber {
  /** The number itself (1-13) */
  numero: number;
  /** Interpretation in the context of this Odu */
  interpretacao: string;
}

export interface OduNumerologyMapping {
  /** Odu name (Portuguese) */
  odu: string;
  /** Odu number in Merindilogun (1-16) */
  numero: number;
  /** English name */
  nomeingles: string;
  /** Associated numerology numbers */
  numeros: NumerologyNumber[];
  /** Primary corresponding element */
  elemento: Elemento;
  /** Energy alignment classification */
  alinhamento_energetico: 'Quente' | 'Fria' | 'Neutra';
  /** Core spiritual meaning */
  significado_espiritual: string;
  /** Associated Orixá */
  orixa: string;
  /** Sacred day */
  dia_sagrado: string;
  /** Sacred colors */
  cores: string[];
  /** Key spiritual qualities */
  qualidades: string[];
}

// ─── Odú Ifá to Numerology Mapping ───────────────────────────────────────────

export const ODU_NUMEROLOGY_MAPPINGS: Record<string, OduNumerologyMapping> = {
  // ─── Odu 1: Ogbe ────────────────────────────────────────────────────────────
  Ogbe: {
    odu: 'Ogbe',
    numero: 1,
    nomeingles: 'Ogbe',
    numeros: [
      { numero: 2, interpretacao: 'Ogbe em 2: A dualidade sagrada, o princípio Yin. Representa a criação através da união de opostos, a fertilidade universal e a proteção divina. Este número carrega a essência da beginnings absolutos.' },
      { numero: 11, interpretacao: 'Ogbe em 11: A iluminação primal. Ogbe como número mestre representa a sabedoria intuitiva que precede toda forma. Channeling de mensagens cósmicas.' },
    ],
    elemento: 'Água',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Ogbe é o princípio absoluto, o começo de tudo. Representa prosperidade, proteção, nascimento. Este é o odú mais favorável de todos, indicando que todo caminho se abre diante de quem o recebe.',
    orixa: 'Obatalá',
    dia_sagrado: 'Sexta-feira',
    cores: ['Branco', 'Amarelo', 'Azul Claro'],
    qualidades: ['Criação', 'Prosperidade', 'Proteção', 'Início', 'Fertilidade'],
  },

  // ─── Odu 2: Ogunda ─────────────────────────────────────────────────────────
  Ogunda: {
    odu: 'Ogunda',
    numero: 2,
    nomeingles: 'Ogunda',
    numeros: [
      { numero: 3, interpretacao: 'Ogunda em 3: A criatividade na ação. O número 3 amplifica a energia de Ogunda, representando expressão, comunicação e a capacidade de criar ferramentas e soluções.' },
      { numero: 9, interpretacao: 'Ogunda em 9: A transformação criativa. O 9 traz completion e sabedoria, indicando que a criação de Ogunda atinge seu propósito mais elevado.' },
    ],
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Ogunda representa a ação, a criação de ferramentas, o trabalho transformador. Este odú traz a energia do ferreiro que forja o destino através do esforço e da determinação.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    qualidades: ['Criação', 'Ação', 'Transformação', 'Força', 'Trabalho'],
  },

  // ─── Odu 3: Etaogundá / Oyekun ─────────────────────────────────────────────
  Etaogundá: {
    odu: 'Etaogundá',
    numero: 3,
    nomeingles: 'Oyekun',
    numeros: [
      { numero: 3, interpretacao: 'Etaogundá em 3: A revolta criativa. O número 3 é a expressão máxima deste odú, representando a força física, a criação de ferramentas e a transformação ativa.' },
      { numero: 6, interpretacao: 'Etaogundá em 6: A harmonia no trabalho. O 6 traz responsabilidade e serviço, mostrando que a força de Etaogundá pode ser canalizada para o bem comum.' },
    ],
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Etaogundá representa a revolta, a força física, a criação de ferramentas. Este odú ensina que a destruição do velho permite o nascimento do novo, a transformação necessária para a evolução.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    qualidades: ['Força', 'Revolta', 'Transformação', 'Criação', 'Ação'],
  },

  // ─── Odu 4: Irosun ─────────────────────────────────────────────────────────
  Irosun: {
    odu: 'Irosun',
    numero: 4,
    nomeingles: 'Irosun',
    numeros: [
      { numero: 4, interpretacao: 'Irosun em 4: A estabilidade na visão. O número 4 representa estrutura e fundamento, alinhando-se com a capacidade de Irosun de perceber além do véu.' },
      { numero: 7, interpretacao: 'Irosun em 7: A sabedoria oculta. O 7 amplifica a profundidade de Irosun, representando introspecção e os mistérios que se revelam ao buscador paciente.' },
    ],
    elemento: 'Água',
    alinhamento_energetico: 'Fria',
    significado_espiritual: 'Irosun é o aviso, a visão espiritual, o sangue que corre nas veias. Este odú confere intuição profunda e a capacidade de perceber além do véu, warnando sobre perigos e oportunidades.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    qualidades: ['Visão', 'Intuição', 'Aviso', 'Proteção', 'Percepção'],
  },

  // ─── Odu 5: Oxé / Oche ────────────────────────────────────────────────────
  Oxé: {
    odu: 'Oxé',
    numero: 5,
    nomeingles: 'Oche',
    numeros: [
      { numero: 5, interpretacao: 'Oxé em 5: O magnetismo natural. O número 5 representa mudança e liberdade, alinhando-se perfeitamente com a energia de feitiçaria de Oxé.' },
      { numero: 8, interpretacao: 'Oxé em 8: O poder terreno. O 8 traz karma e justiça, indicando que o magnetismo de Oxé opera segundo a lei de causa e efeito.' },
    ],
    elemento: 'Terra',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Oxé confere magnetismo, doçura e a energia da feitiçaria natural. Este odú traz o poder de encantamento e persuasão, a graça que suaviza conflitos e a magia ritual que manifesta desejos.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    qualidades: ['Magnetismo', 'Feitiçaria', 'Doçura', 'Encantamento', 'Prosperidade'],
  },

  // ─── Odu 6: Obará ─────────────────────────────────────────────────────────
  Obará: {
    odu: 'Obará',
    numero: 6,
    nomeingles: 'Obará',
    numeros: [
      { numero: 6, interpretacao: 'Obará em 6: A harmonia perfeita. O número 6 representa beleza, harmonia e responsabilidade, sendo a expressão máxima deste odú.' },
      { numero: 12, interpretacao: 'Obará em 12: A integração coletiva. O 12 traz jury e serviço grupal, indicando que Obará pode atuar em contextos de comunidade.' },
    ],
    elemento: 'Terra',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Obará confere brilho pessoal e prosperidade através da energia solar. Este odú traz abundância material e espiritual, o carisma que atrai oportunidades e a luz interior que inspira outros.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    qualidades: ['Brilho', 'Prosperidade', 'Harmonia', 'Carisma', 'Abundância'],
  },

  // ─── Odu 7: Odi ───────────────────────────────────────────────────────────
  Odi: {
    odu: 'Odi',
    numero: 7,
    nomeingles: 'Oddi',
    numeros: [
      { numero: 7, interpretacao: 'Odi em 7: O poço profundo. O número 7 representa introspecção e sabedoria, sendo a expressão mais pura deste odú místico.' },
      { numero: 13, interpretacao: 'Odi em 13: A transformação oculta. O 13 traz morte e renascimento, mostrando que Odi guarda segredos de transformação profunda.' },
    ],
    elemento: 'Água',
    alinhamento_energetico: 'Fria',
    significado_espiritual: 'Odi conecta ao poço profundo dos mistérios ocultos e à transmutação. Este odú revela os segredos escondidos nas águas profundas, o poder de transformar o impuro em puro e a sabedoria dos mistérios antigos.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    qualidades: ['Mistério', 'Transmutação', 'Ocultismo', 'Sabedoria', 'Transformação'],
  },

  // ─── Odu 8: Ijonse ────────────────────────────────────────────────────────
  Ijonse: {
    odu: 'Ijonse',
    numero: 8,
    nomeingles: 'Irosun-Meji',
    numeros: [
      { numero: 8, interpretacao: 'Ijonse em 8: O karma material. O número 8 representa poder terreno e justiça, alinhando-se com a energia de sacrifício e conserto de Ijonse.' },
      { numero: 10, interpretacao: 'Ijonse em 10: A reunião transformadora. O 10 traz novos começos, indicando que o sacrifício de Ijonse abre caminho para renascimento.' },
    ],
    elemento: 'Terra',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Ijonse representa a reunião, o conserto, o sacrifício. Este odú traz a energia do equilíbrio entre o material e o espiritual através do sacrifício consciente, doando para receber.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    qualidades: ['Reunião', 'Conserto', 'Sacrifício', 'Equilíbrio', 'Justiça'],
  },

  // ─── Odu 9: Se / Ose ──────────────────────────────────────────────────────
  Se: {
    odu: 'Se',
    numero: 9,
    nomeingles: 'Ose',
    numeros: [
      { numero: 9, interpretacao: 'Se em 9: A medicina suprema. O número 9 representa completion e humanitarianismo, sendo a expressão mais elevada deste odú de cura.' },
      { numero: 3, interpretacao: 'Se em 3: A cura expressiva. O 3 traz criatividade, indicando que a medicina de Se opera através da comunicação e expressão.' },
    ],
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Se representa a medicina, o sacrifício, a transformação. Este odú traz a energia da cura e do serviço aos outros, indicando que através do sacrifício pessoal se alcança a transformação collective.',
    orixa: 'Oxum',
    dia_sagrado: 'Quinta-feira / Domingo',
    cores: ['Azul', 'Amarelo', 'Verde', 'Azul e Amarelo'],
    qualidades: ['Cura', 'Sacrifício', 'Transformação', 'Serviço', 'Medicina'],
  },

  // ─── Odu 10: Ofun ─────────────────────────────────────────────────────────
  Ofun: {
    odu: 'Ofun',
    numero: 10,
    nomeingles: 'Ofun',
    numeros: [
      { numero: 1, interpretacao: 'Ofun em 1: O renascimento primal. O número 1 representa novos começos, sendo a essência de Ofun como túmulo e ressurreição.' },
      { numero: 10, interpretacao: 'Ofun em 10: A transformação completa. O 10 amplifica a energia de renascimento, indicando que todo fim é um novo começo.' },
    ],
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Ofun traz o sopro divino e a cura através da paciência e do silêncio. Este odú representa as águas profundas do inconsciente, a sabedoria interior que vem da escuta silenciosa e a cura que flui como rio manso.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    qualidades: ['Ressonância', 'Paz', 'Sopro Divino', 'Cura', 'Renascimento'],
  },

  // ─── Odu 11: Nanã ─────────────────────────────────────────────────────────
  Nanã: {
    odu: 'Nanã',
    numero: 11,
    nomeingles: 'Nanã',
    numeros: [
      { numero: 11, interpretacao: 'Nanã em 11: A sabedoria ancestral. O número mestre 11 representa intuição e iluminação espiritual, sendo a expressão mais pura de Nanã.' },
      { numero: 2, interpretacao: 'Nanã em 2: A dualidade da velhice. O 2 traz cooperação, mostrando que a sabedoria de Nanã se manifesta na interação entre geração.' },
    ],
    elemento: 'Água',
    alinhamento_energetico: 'Fria',
    significado_espiritual: 'Nanã representa a velhice, a sabedoria ancestral, a modéstia. Este odú traz a energia que conecta passado e presente, a humildade que precede a verdadeira iluminação.',
    orixa: 'Nanã',
    dia_sagrado: 'Domingo',
    cores: ['Preto', 'Roxo', 'Branco', 'Lilás'],
    qualidades: ['Sabedoria', 'Ancestralidade', 'Modéstia', 'Velhice', 'Humildade'],
  },

  // ─── Odu 12: Ejilsebora ───────────────────────────────────────────────────
  Ejilsebora: {
    odu: 'Ejilsebora',
    numero: 12,
    nomeingles: 'Ejila-sebori',
    numeros: [
      { numero: 12, interpretacao: 'Ejilsebora em 12: A purificação coletiva. O número 12 representa jury e integração de opostos, sendo a expressão mais elevada deste odú.' },
      { numero: 6, interpretacao: 'Ejilsebora em 6: A harmonia purificadora. O 6 traz beleza e responsabilidade, mostrando que Ejilsebora pode criar harmonia em contextos de serviço.' },
    ],
    elemento: 'Fogo',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Ejilsebora traz a energia do fogo purificador e da guerra justa. Este odú representa a força vital que transforma o caos em ordem, o brilho interior que ilumina os caminhos e a determinação inabalável que supera obstáculos.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    qualidades: ['Purificação', 'Guerra Justa', 'Determinação', 'Ordem', 'Brilho'],
  },

  // ─── Odu 13: Olobón ───────────────────────────────────────────────────────
  Olobón: {
    odu: 'Olobón',
    numero: 13,
    nomeingles: 'Olobon',
    numeros: [
      { numero: 13, interpretacao: 'Olobón em 13: A transformação suprema. O número 13 representa morte e renascimento, sendo a expressão mais poderosa deste odú.' },
      { numero: 4, interpretacao: 'Olobón em 4: A estrutura transformadora. O 4 traz estabilidade, mostrando que Olobón pode criar novas fundações sobre os escombros do antigo.' },
    ],
    elemento: 'Terra',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Olobón conecta à transformação física, às doenças que curam e ao fim de ciclos necessários. Este odú revela que a doença pode ser cura, que o fim de um ciclo é início de outro e que a terra transforma tudo em novo solo.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    qualidades: ['Transformação', 'Cura', 'Mudança', 'Fim de Ciclo', 'Ressurreição'],
  },

  // ─── Odu 14: Iká ──────────────────────────────────────────────────────────
  Iká: {
    odu: 'Iká',
    numero: 14,
    nomeingles: 'Iká-Meji',
    numeros: [
      { numero: 9, interpretacao: 'Iká em 9: A renovação medicinal. O número 9 traz completion e cura, indicando que Iká opera através da sabedoria transformadora.' },
      { numero: 5, interpretacao: 'Iká em 5: A mudança renovadora. O 5 representa liberdade e mudança, mostrando que Iká traz transformações que libertam.' },
    ],
    elemento: 'Terra',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Iká revela a sabedoria oculta da serpente, a traição que renova e a capacidade de descascar o velho para revelar o novo. Este odú ensina que a renovação exige soltar o antigo, que a serpente renova sua pele e que a sabedoria vem da transformação.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    qualidades: ['Renovação', 'Serpente', 'Sabedoria', 'Transformação', 'Libertação'],
  },

  // ─── Odu 15: Ossá ─────────────────────────────────────────────────────────
  Ossá: {
    odu: 'Ossá',
    numero: 15,
    nomeingles: 'Ossá',
    numeros: [
      { numero: 7, interpretacao: 'Ossá em 7: A transformação rápida. O número 7 traz sabedoria oculta, indicando que Ossá opera com eficácia acelerada.' },
      { numero: 13, interpretacao: 'Ossá em 13: A magia das Iyami. O 13 representa transformação profunda, mostrando que Ossá canaliza o poder das bruxas ancestrais.' },
    ],
    elemento: 'Ar',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Ossá traz as transformações rápidas e o poder feminino das Iyami. Este odú representa a mudança acelerada, o poder de feitiçaria das bruxas ancestrais e a capacidade de modificar rapidamente a realidade.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    qualidades: ['Transformação Rápida', 'Feitiçaria', 'Poder Feminino', 'Mudança', 'Magia'],
  },

  // ─── Odu 16: Alafia ───────────────────────────────────────────────────────
  Alafia: {
    odu: 'Alafia',
    numero: 16,
    nomeingles: 'Alaafia',
    numeros: [
      { numero: 11, interpretacao: 'Alafia em 11: A iluminação da paz. O número mestre 11 representa intuição espiritual, indicando que Alafia é门户 para a consciência superior.' },
      { numero: 6, interpretacao: 'Alafia em 6: A harmonia da confirmação. O 6 traz beleza e harmonia, mostrando que Alafia confirma a vontade divina.' },
    ],
    elemento: 'Ar',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Alafia traz a paz absoluta e a confirmação dos Deuses. Este odú representa o elemento mais elevado do pensamento iluminado, a harmonia que transcende opostos e a cura que vem da reconciliação interior.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    qualidades: ['Paz', 'Confirmação', 'Iluminação', 'Harmonia', 'Saudação Divina'],
  },

  // ─── Odu 17: Ejiokô ───────────────────────────────────────────────────────
  Ejiokô: {
    odu: 'Ejiokô',
    numero: 17,
    nomeingles: 'Eji-Okô',
    numeros: [
      { numero: 2, interpretacao: 'Ejiokô em 2: A dualidade perfeita. O número 2 representa Yin e Yang, sendo a essência deste odú que ensina sobre caminhos duplos.' },
      { numero: 8, interpretacao: 'Ejiokô em 8: O karma da dualidade. O 8 traz justiça e karma, indicando que as escolhas de Ejiokô têm consequências equilibradas.' },
    ],
    elemento: 'Ar',
    alinhamento_energetico: 'Neutra',
    significado_espiritual: 'Ejiokô ensina sobre dualidade e os caminhos duplos. Este odú traz o equilíbrio entre opostos, a sabedoria de que toda escolha tem dois lados e a capacidade de navegar entre extremos com sabedoria.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    qualidades: ['Dualidade', 'Equilíbrio', 'Escolha', 'Caminhos', 'Sabedoria'],
  },

  // ─── Odu 18: Okaran ───────────────────────────────────────────────────────
  Okaran: {
    odu: 'Okaran',
    numero: 18,
    nomeingles: 'Owaran',
    numeros: [
      { numero: 8, interpretacao: 'Okaran em 8: O começo difícil no poder. O número 8 traz karma e poder terreno, mostrando que Okaran testa a força antes de dar resultados.' },
      { numero: 4, interpretacao: 'Okaran em 4: A estabilidade conquistada. O 4 traz fundamento, indicando que o esforço de Okaran cria bases sólidas.' },
    ],
    elemento: 'Terra',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Okaran traz o começo difícil, a dúvida e a prova que fortalece a vontade de criar. Este odú representa a terra fértil que necesita de esforço para produzir, o ancoramento que sustenta todos os outros elementos.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    qualidades: ['Dificuldade', 'Esforço', 'Ancoramento', 'Prova', 'Terra Fértil'],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ODU_NUMEROLOGY_MAPPINGS);

/**
 * Get the Odu-to-numerology correlation mapping
 * @param odu - Odu name (e.g., 'Ogbe', 'Ofun', 'Alafia', 'Okaran')
 * @returns The correlation mapping or null if not found
 */
export function getOduNumerology(odu: string): OduNumerologyMapping | null {
  return ODU_NUMEROLOGY_MAPPINGS[odu] ?? null;
}

/**
 * Get all numerology numbers for a specific Odu
 * @param odu - Odu name
 * @returns Array of numerology numbers with interpretations, or null if Odu not found
 */
export function getNumerologyForOdu(odu: string): NumerologyNumber[] | null {
  return ODU_NUMEROLOGY_MAPPINGS[odu]?.numeros ?? null;
}

/**
 * Get all available Odu-numerology mappings
 * @returns Array of all correlation mappings sorted by Odu number
 */
export function getAllOduNumerology(): OduNumerologyMapping[] {
  return Object.values(ODU_NUMEROLOGY_MAPPINGS).sort((a, b) => a.numero - b.numero);
}

/**
 * Get all Odu names
 * @returns Array of Odu names (sorted by number)
 */
export function getAllOduNames(): string[] {
  return Object.values(ODU_NUMEROLOGY_MAPPINGS)
    .sort((a, b) => a.numero - b.numero)
    .map(m => m.odu);
}

/**
 * Check if an Odu exists in the mapping
 * @param odu - Odu name to check
 * @returns True if Odu exists in mapping
 */
export function hasOduNumerology(odu: string): boolean {
  return odu in ODU_NUMEROLOGY_MAPPINGS;
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-18)
 * @returns The numerology mapping or null if not found
 */
export function getOduByNumber(numero: number): OduNumerologyMapping | null {
  return Object.values(ODU_NUMEROLOGY_MAPPINGS).find(
    mapping => mapping.numero === numero
  ) ?? null;
}

/**
 * Get all Odus for a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of Odu mappings for that element
 */
export function getElementOdu(elemento: string): OduNumerologyMapping[] {
  return Object.values(ODU_NUMEROLOGY_MAPPINGS).filter(
    mapping => mapping.elemento === elemento
  );
}

/**
 * Get all Odus for a specific numerology number
 * @param numero - Numerology number (1-13)
 * @returns Array of Odu names that have this number in their mapping
 */
export function getOdusForNumber(numero: number): string[] {
  return Object.values(ODU_NUMEROLOGY_MAPPINGS)
    .filter(mapping => mapping.numeros.some(n => n.numero === numero))
    .map(m => m.odu);
}

/**
 * Get the element for a given Odu
 * @param odu - Odu name
 * @returns Element or null if not found
 */
export function getNumerologyElement(odu: string): Elemento | null {
  return ODU_NUMEROLOGY_MAPPINGS[odu]?.elemento ?? null;
}

/**
 * Get the energy alignment for a given Odu
 * @param odu - Odu name
 * @returns Energy alignment or null if not found
 */
export function getNumerologyEnergy(odu: string): string | null {
  return ODU_NUMEROLOGY_MAPPINGS[odu]?.alinhamento_energetico ?? null;
}

export default {
  getOduNumerology,
  getNumerologyForOdu,
  getAllOduNumerology,
  getAllOduNames,
  hasOduNumerology,
  getOduByNumber,
  getElementOdu,
  getOdusForNumber,
  getNumerologyElement,
  getNumerologyEnergy,
  ODU_NUMEROLOGY_MAPPINGS,
};