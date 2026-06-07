/**
 * Odú Ifá-to-Solfeggio Frequency Correlation Mapping
 * Based on IDEIA.md Cabala dos Caminhos spiritual system
 * Maps each Odu Ifá (Merindilogun) to its corresponding Solfeggio frequency
 * and healing properties
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export interface HealingProperties {
  /** Physical healing application */
  fisico: string;
  /** Emotional healing application */
  emocional: string;
  /** Mental/spiritual healing application */
  mental_espiritual: string;
  /** Recommended healing practice */
  pratica: string;
}

export interface OduFrequencyMapping {
  /** Odu name (Portuguese) */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** English name */
  nomeingles: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Primary corresponding element */
  elemento: Elemento;
  /** Energy alignment description */
  alinhamento_energetico: string;
  /** Elemental qualities */
  qualidades: {
    temperatura: 'Quente' | 'Frio' | 'Neutro';
    umidade: 'Seco' | 'Úmido';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  };
  /** Core spiritual meaning */
  significado_espiritual: string;
  /** Associated Orixá */
  orixa: string;
  /** Sacred day */
  dia_sagrado: string;
  /** Traditional colors */
  cores: string[];
  /** Chakra correspondent */
  chakra: string;
  /** Sephirah correspondence (Cabala) */
  sephirah: string;
  /** Healing properties for this Odu-frequency correlation */
  propriedades_healing: HealingProperties;
  /** Ritual applications */
  aplicacoes_rituais: string[];
}

// ─── Solfeggio Frequencies ─────────────────────────────────────────────────────

/**
 * The 7 core Solfeggio frequencies
 */
export const SOLFEGGIO_FREQUENCIES = [174, 285, 396, 417, 528, 639, 741, 852, 963] as const;
// Freeze the array to prevent modifications
Object.freeze(SOLFEGGIO_FREQUENCIES);
export type SolfeggioFrequency = (typeof SOLFEGGIO_FREQUENCIES)[number];

// ─── Odú Ifá-to-Solfeggio Frequency Mapping ───────────────────────────────────

export const ODU_FREQUENCY_MAPPINGS: Record<string, OduFrequencyMapping> = {
  // ─── FOGO Element (Transformação, Energia Yang) ─────────────────────────────

  Okaran: {
    odu: 'Okaran',
    numero: 1,
    nomeingles: 'Obe',
    frequencia: 174, // Foundation - grounding, beginning
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente / Aterrador / Primordial',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual:
      'Okaran traz o começo difícil e a prova que fortalece. Este Odu representa a terra primordial de onde tudo emerge, o poder de criar a partir do caos e a força de vontade que supera obstáculos iniciais.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho'],
    chakra: '1º Básico (Muladhara)',
    sephirah: 'Malkuth',
    propriedades_healing: {
      fisico: 'Fortalecimento dos ossos e sistema imunológico',
      emocional: 'Superação do medo de começar, coragem para agir',
      mental_espiritual: 'Ancoramento e conexão com a força criativa primordial',
      pratica: 'Meditação de ancoramento com 174Hz, visualização de raízes',
    },
    aplicacoes_rituais: ['Despachos em encruzilhadas', 'Rituais para abrir caminhos', 'Firmezas para novoscomeços'],
  },

  Ejiokô: {
    odu: 'Ejiokô',
    numero: 2,
    nomeingles: 'Ogbon',
    frequencia: 285, // Nurturing - healing of tissues
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente / Dual / Equilibrado',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual:
      'Ejiokô ensina sobre dualidade e os caminhos duplos. Este Odu traz o equilíbrio entre opostos, a sabedoria de que toda escolha tem dois lados e a capacidade de navegar entre extremos com harmonia.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Verde', 'Amarelo'],
    chakra: '5º Laríngeo (Vishuddha)',
    sephirah: 'Hod',
    propriedades_healing: {
      fisico: 'Regeneração de tecidos, cura de feridas',
      emocional: 'Harmonização de estados emocionais opostos',
      mental_espiritual: 'Equilíbrio entre mente lógica e intuitiva',
      pratica: 'Som de 285Hz para nutrição energética, visualization de arco-íris',
    },
    aplicacoes_rituais: ['Rituais de equilíbrio', 'Oferendas balanceadas', 'Orações para decisões sábias'],
  },

  Etaogundá: {
    odu: 'Etaogundá',
    numero: 3,
    nomeingles: 'Oyeku',
    frequencia: 396, // Liberation - freedom from guilt and fear
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente / Transformador / Criativo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual:
      'Etaogundá representa a criação de ferramentas e o poder de cortar para construir. Este Odu ensina que a destruição do velho permite o nascimento do novo, a libertação das culpas do passado.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Vermelho', 'Marrom', 'Amarelo'],
    chakra: '3º Plexo Solar (Manipura)',
    sephirah: 'Netzach',
    propriedades_healing: {
      fisico: 'Libertação de tensões armazenadas no corpo',
      emocional: 'Perdão de si mesmo e dos outros, libertação de ressentimentos',
      mental_espiritual: 'Desapego de padrões mentais limitantes',
      pratica: 'Meditação de libertação com 396Hz, respiração consciente',
    },
    aplicacoes_rituais: ['Inhames assados', 'Rituais de transformação', 'Ebós de corte e limpeza'],
  },

  Ejilawn: {
    odu: 'Ejilawn',
    numero: 4,
    nomeingles: 'Iwori',
    frequencia: 417, // Facilitation - situations changing for the better
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente / Mutável / Flexível',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual:
      'Ejilawn traz a sabedoria dos anciões e a capacidade de compreender múltiplas perspectivas. Este Odu representa a flexibilidade mental que adapta-se a qualquer situação, facilitando mudanças positivas.',
    orixa: 'Obá',
    dia_sagrado: 'Sexta-feira',
    cores: ['Laranja', 'Azul', 'Branco'],
    chakra: '4º Cardíaco (Anahata)',
    sephirah: 'Tiphereth',
    propriedades_healing: {
      fisico: 'Facilitação de processos de cura no corpo',
      emocional: 'Abertura para novas possibilidades, flexibilidade emocional',
      mental_espiritual: 'Renovação de perspectivas, capacidade de ver além',
      pratica: 'Som de 417Hz para facilitação de mudanças, visualização de transformação',
    },
    aplicacoes_rituais: ['Oferendas de laranja e banana', 'Rituais de mudança', 'Sons de tambor para flexibilidade'],
  },

  Oxé: {
    odu: 'Oxé',
    numero: 5,
    nomeingles: 'Ose',
    frequencia: 528, // Transformation - DNA repair, miracles
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente / Magnético / Poderoso',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Úmido',
      polaridade: 'Yang',
    },
    significado_espiritual:
      'Oxé confere magnetismo, doçura e a energia da feitiçaria natural. Este Odu traz o poder de encantamento e persuasão, a graça que suaviza conflitos, a transformação que gera abundância.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Rosa'],
    chakra: '6º Frontal (Ajna)',
    sephirah: 'Chesed',
    propriedades_healing: {
      fisico: 'Reparo celular, regeneração do DNA, cura de feridas crônicas',
      emocional: 'Transformação de traumas, cura de feridas emocionais profundas',
      mental_espiritual: 'Despertar de milagres, expansão da consciência',
      pratica: 'Meditação de 528Hz para cura miraculous, água energizada',
    },
    aplicacoes_rituais: ['Banhos de mel e caldas', 'Rituais de encantamento', 'Oferendas doces e perfumadas'],
  },

  Obará: {
    odu: 'Obará',
    numero: 6,
    nomeingles: 'Obara',
    frequencia: 639, // Harmony - relationships, social healing
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente / Solar / Harmonioso',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual:
      'Obará confere brilho pessoal e prosperidade através da energia solar. Este Odu traz abundância material e espiritual, o carisma que atrai oportunidades, a harmonia nas relações sociais.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho'],
    chakra: '3º Plexo Solar (Manipura)',
    sephirah: 'Geburah',
    propriedades_healing: {
      fisico: 'Harmonização do sistema circulatório e metabólico',
      emocional: 'Atração de relacionamentos saudáveis, harmonia familiar',
      mental_espiritual: 'Prosperidade mental, atratividade natural',
      pratica: 'Som de 639Hz para harmonia relacional, meditação de brilho pessoal',
    },
    aplicacoes_rituais: ['Oferendas de seis tipos de frutas', 'Rituais de prosperidade', 'Amalá quente para Xangô'],
  },

  Odi: {
    odu: 'Odi',
    numero: 7,
    nomeingles: 'Odi',
    frequencia: 741, // Awakening - intuition, expression, problem solving
    elemento: 'Fogo',
    alinhamento_energetico: 'Frio / Oculto / Revelador',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    significado_espiritual:
      'Odi conecta ao poço profundo dos mistérios ocultos e à transmutação. Este Odu revela os segredos escondidos nas águas profundas, o poder de transformar o impuro em puro, a intuição desperta.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Preto', 'Branco', 'Azul Escuro'],
    chakra: '6º Frontal (Ajna)',
    sephirah: 'Hod',
    propriedades_healing: {
      fisico: 'Desbloqueio do terceiro olho, harmonia do sistema nervoso',
      emocional: 'Despertar da intuição, capacidade de ver além das aparências',
      mental_espiritual: 'Resolução de problemas complexos, sabedoria oculta',
      pratica: 'Meditação de 741Hz para despertar intuitivo, visualização de luz violeta',
    },
    aplicacoes_rituais: ['Pipoca (Deburu) para Omolu', 'Rituais de revelação', 'Banhos de lama para transmutação'],
  },

  Ogbe: {
    odu: 'Ogbe',
    numero: 8,
    nomeingles: 'Ogbe',
    frequencia: 852, // Third eye - intuition, inner knowing
    elemento: 'Fogo',
    alinhamento_energetico: 'Neutro / Elevado / Iluminado',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    significado_espiritual:
      'Ogbe traz a glória, o favorecimento divino e a abertura de caminhos. Este Odu representa a luz que ilumina os caminhos obscuras, o favorecimento dos Orixás, a transformação completa.',
    orixa: 'Oxalá',
    dia_sagrado: 'Sexta-feira / Domingo',
    cores: ['Branco', 'Amarelo', 'Azul Claro'],
    chakra: '7º Coronário (Sahasrara)',
    sephirah: 'Kether',
    propriedades_healing: {
      fisico: 'Harmonização da glândula pineal, equilíbrio hormonal',
      emocional: 'Sentimento de favorecimento divino, paz interior profunda',
      mental_espiritual: 'Despertar da visão espiritual, conexão com o divino',
      pratica: 'Som de 852Hz para abertura do terceiro olho, meditação de luz branca',
    },
    aplicacoes_rituais: ['Akará para Oxalá', 'Rituais de favorecimento', 'EBós de开门 para novos caminhos'],
  },

  Ossá: {
    odu: 'Ossá',
    numero: 9,
    nomeingles: 'Osa',
    frequencia: 963, // Crown - divine connection, enlightenment
    elemento: 'Ar',
    alinhamento_energetico: 'Neutro / Transformador / Rápido',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    significado_espiritual:
      'Ossá traz as transformações rápidas e o poder feminino das Iyami. Este Odu representa a mudança acelerada, o poder de feitiçaria das bruxas ancestrais, a conexão com o divino feminino.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Verde', 'Amarelo'],
    chakra: '7º Coronário (Sahasrara)',
    sephirah: 'Kether',
    propriedades_healing: {
      fisico: 'Elevação da frequência vibracional, alinhamento com chakras superiores',
      emocional: 'Libertação de padrões femininos opressivos, empoderamento',
      mental_espiritual: 'Iluminação, acesso ao plano divino',
      pratica: 'Som de 963Hz para conexão divina, meditação de corona de luz',
    },
    aplicacoes_rituais: ['Sacudimentos com folhas de fumo', 'Rituais de transformação rápida', 'Orações às Iyami'],
  },

  Ofun: {
    odu: 'Ofun',
    numero: 10,
    nomeingles: 'Ofun',
    frequencia: 528, // Transformation - love, miracles, DNA
    elemento: 'Água',
    alinhamento_energetico: 'Frio / Receptivo / Profundo',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    significado_espiritual:
      'Ofun traz o sopro divino e a cura através da paciência e do silêncio. Este Odu representa as águas profundas do inconsciente, a sabedoria interior que vem da escuta silenciosa, o amor incondicional.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Rosa'],
    chakra: '6º Frontal (Ajna)',
    sephirah: 'Yesod',
    propriedades_healing: {
      fisico: 'Cura através do amor, regeneração celular',
      emocional: 'Amor incondicional, cura de feridas do coração',
      mental_espiritual: 'Milagres de amor, transformação do amor próprio',
      pratica: 'Meditação de 528Hz para cura amorosa, água do mar energizada',
    },
    aplicacoes_rituais: ['Rezas mansas', 'Banhos de leite de cabra', 'Rituais de cura suave'],
  },

  Ojuani: {
    odu: 'Ojuani',
    numero: 11,
    nomeingles: 'Oyonran',
    frequencia: 639, // Harmony - balance, relationships
    elemento: 'Água',
    alinhamento_energetico: 'Frio / Harmônico / Equilibrado',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    significado_espiritual:
      'Ojuani traz a capacidade de criar e destruir, o equilíbrio entre criação e dissolução. Este Odu representa a sabedoria de saber quando criar e quando destruir, a harmonia nos ciclos.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira',
    cores: ['Azul', 'Branco', 'Verde'],
    chakra: '2º Sacral (Svadhisthana)',
    sephirah: 'Tiphereth',
    propriedades_healing: {
      fisico: 'Harmonização do sistema reprodutivo e urinário',
      emocional: 'Equilíbrio entre dar e receber, ciclos emocionais',
      mental_espiritual: 'Sabedoria dos ciclos de criação e destruição',
      pratica: 'Som de 639Hz para harmonia, visualização de ondas do mar',
    },
    aplicacoes_rituais: ['Oferendas de fruits do mar', 'Rituais de equilíbrio', 'Banhos de água do mar'],
  },

  Ejilsebora: {
    odu: 'Ejilsebora',
    numero: 12,
    nomeingles: 'Irosun',
    frequencia: 417, // Facilitation - change, new beginnings
    elemento: 'Fogo',
    alinhamento_energetico: 'Quente / Ígneo / Radiante',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual:
      'Ejilsebora traz a energia do fogo purificador e da guerra justa. Este Odu representa a força vital que transforma o caos em ordem, o brilho interior que ilumina os caminhos, a determinação inabalável.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho'],
    chakra: '3º Plexo Solar (Manipura)',
    sephirah: 'Netzach',
    propriedades_healing: {
      fisico: 'Fortalecimento do sistema circulatório e fogo metabólico',
      emocional: 'Determinação, força de vontade, coragem para lutar',
      mental_espiritual: 'Transformação de situações adversas, iluminação de caminhos',
      pratica: 'Meditação de 417Hz para facilitação, visualização de fogo purificador',
    },
    aplicacoes_rituais: ['Firmezas com pedras de raio', 'Rituais de fogo e purificação', 'Orações de guerra justa'],
  },

  Olobón: {
    odu: 'Olobón',
    numero: 13,
    nomeingles: 'Ologbon',
    frequencia: 396, // Liberation - letting go, transformation
    elemento: 'Terra',
    alinhamento_energetico: 'Denso / Transformador / Físico',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    significado_espiritual:
      'Olobón conecta à transformação física, às doenças que curam e ao fim de ciclos necessários. Este Odu revela que a doença pode ser cura, que o fim de um ciclo é início de outro, a libertação do旧的.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho'],
    chakra: '1º Básico (Muladhara)',
    sephirah: 'Malkuth',
    propriedades_healing: {
      fisico: 'Transformação de doenças crônicas, fim de ciclos patológicos',
      emocional: 'Libertação de padrões de doença, aceitação da transformação',
      mental_espiritual: 'Compreensão de que o fim é um novo começo',
      pratica: 'Som de 396Hz para libertação, meditação de soltar o velho',
    },
    aplicacoes_rituais: ['Oferendas na lama', 'Rituais de fim de ciclo', 'Banhos de cura e renovação'],
  },

  Iká: {
    odu: 'Iká',
    numero: 14,
    nomeingles: 'Ika',
    frequencia: 285, // Nurturing - healing, restoration
    elemento: 'Terra',
    alinhamento_energetico: 'Denso / Revelador / Renovador',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    significado_espiritual:
      'Iká revela a sabedoria oculta da serpente, a traição que renova e a capacidade de descascar o velho para revelar o novo. Este Odu ensina que a renovação exige soltar o antigo, a cura que restaura.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Lilás'],
    chakra: '1º Básico (Muladhara)',
    sephirah: 'Binah',
    propriedades_healing: {
      fisico: 'Restauração de tecidos, regeneração celular',
      emocional: 'Renovação emocional, soltar o passado para criar futuro',
      mental_espiritual: 'Sabedoria ancestral, compreensão dos ciclos de renovação',
      pratica: 'Som de 285Hz para nutrição e restauração, visualização de pele de serpente',
    },
    aplicacoes_rituais: ['Ebó com feijão preto', 'Amarrar fitas coloridas', 'Rituais de renovação'],
  },

  Meji: {
    odu: 'Meji',
    numero: 15,
    nomeingles: 'Meji',
    frequencia: 852, // Third eye - duality resolved, unity
    elemento: 'Fogo',
    alinhamento_energetico: 'Neutro / Duplo / Integrado',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    significado_espiritual:
      'Meji representa o duplo, a reunião dos opostos e a integração total. Este Odu traz a sabedoria de que tudo tem dois lados, a capacidade de ver a totalidade, o despertar do terceiro olho.',
    orixa: 'Oxalá',
    dia_sagrado: 'Domingo',
    cores: ['Branco', 'Preto', 'Amarelo'],
    chakra: '6º Frontal (Ajna)',
    sephirah: 'Chokhmah',
    propriedades_healing: {
      fisico: 'Equilíbrio hemispérico cerebral, integração neural',
      emocional: 'Integração de aspectos opostos da personalidade',
      mental_espiritual: 'Visão unitária, percepção da totalidade',
      pratica: 'Som de 852Hz para integração, meditação de olhar além dos opostos',
    },
    aplicacoes_rituais: ['Oferendas balanceadas', 'Rituais de integração', 'Orações para sabedoria unitária'],
  },

  Alafia: {
    odu: 'Alafia',
    numero: 16,
    nomeingles: 'Alafia',
    frequencia: 963, // Crown - divine peace, complete healing
    elemento: 'Ar',
    alinhamento_energetico: 'Neutro / Equilibrado / Elevado',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    significado_espiritual:
      'Alafia traz a paz absoluta e a confirmação dos Deuses. Este Odu representa o elemento mais elevado do pensamento iluminado, a harmonia que transcende opostos, a cura completa que vem da reconciliação divina.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Branco', 'Amarelo'],
    chakra: '7º Coronário (Sahasrara)',
    sephirah: 'Kether',
    propriedades_healing: {
      fisico: 'Cura completa, alinhamento com a frequência divina',
      emocional: 'Paz absoluta, harmonia completa, serenidade eterna',
      mental_espiritual: 'Iluminação, transcendência, conexão com o divino',
      pratica: 'Meditação de 963Hz para paz divina, visualização de luz arco-íris',
    },
    aplicacoes_rituais: ['Flores brancas', 'Velas brancas', 'Orações de paz e harmonia'],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ODU_FREQUENCY_MAPPINGS);
Object.values(ODU_FREQUENCY_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the Odu-to-frequency correlation mapping
 * @param odu - Odu name (e.g., 'Ogbe', 'Ofun', 'Alafia', 'Okaran')
 * @returns The correlation mapping or null if not found
 */
export function getOduFrequency(odu: string): OduFrequencyMapping | null {
  return ODU_FREQUENCY_MAPPINGS[odu] ?? null;
}

/**
 * Get the frequency for a given Odu name
 * @param odu - Odu name
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyByOduName(odu: string): number | null {
  return ODU_FREQUENCY_MAPPINGS[odu]?.frequencia ?? null;
}

/**
 * Get all Odus associated with a specific frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of Odu frequency mappings
 */
export function getFrequencyOdu(frequencia: number): OduFrequencyMapping[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS).filter((m) => m.frequencia === frequencia);
}

/**
 * Get all available Odu-frequency mappings
 * @returns Array of all correlation mappings sorted by Odu number
 */
export function getAllOduFrequencies(): OduFrequencyMapping[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS).sort((a, b) => a.numero - b.numero);
}

/**
 * Get all Odu names
 * @returns Array of Odu names (sorted by number)
 */
export function getAllOduNames(): string[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS)
    .sort((a, b) => a.numero - b.numero)
    .map((m) => m.odu);
}

/**
 * Check if an Odu exists in the mapping
 * @param odu - Odu name to check
 * @returns True if Odu exists in mapping
 */
export function hasOduFrequency(odu: string): boolean {
  return odu in ODU_FREQUENCY_MAPPINGS;
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-16)
 * @returns The frequency mapping or null if not found
 */
export function getOduByNumber(numero: number): OduFrequencyMapping | null {
  return Object.values(ODU_FREQUENCY_MAPPINGS).find((m) => m.numero === numero) ?? null;
}

/**
 * Get all Odus for a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of Odu frequency mappings for that element
 */
export function getOdusForElement(elemento: string): OduFrequencyMapping[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get all frequencies for a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of unique frequencies
 */
export function getFrequenciesForElement(elemento: string): number[] {
  return [...new Set(Object.values(ODU_FREQUENCY_MAPPINGS).filter((m) => m.elemento === elemento).map((m) => m.frequencia))];
}

/**
 * Get the element for a given Odu
 * @param odu - Odu name
 * @returns Element or null if not found
 */
export function getElementByOdu(odu: string): Elemento | null {
  return ODU_FREQUENCY_MAPPINGS[odu]?.elemento ?? null;
}

/**
 * Get the healing properties for a given Odu
 * @param odu - Odu name
 * @returns Healing properties or null if not found
 */
export function getHealingProperties(odu: string): HealingProperties | null {
  return ODU_FREQUENCY_MAPPINGS[odu]?.propriedades_healing ?? null;
}

/**
 * Get all available Solfeggio frequencies used in Odu mapping
 * @returns Array of unique frequencies
 */
export function getUsedFrequencies(): number[] {
  return [...new Set(Object.values(ODU_FREQUENCY_MAPPINGS).map((m) => m.frequencia))].sort((a, b) => a - b);
}

export default {
  getOduFrequency,
  getFrequencyByOduName,
  getFrequencyOdu,
  getAllOduFrequencies,
  getAllOduNames,
  hasOduFrequency,
  getOduByNumber,
  getOdusForElement,
  getFrequenciesForElement,
  getElementByOdu,
  getHealingProperties,
  getUsedFrequencies,
  ODU_FREQUENCY_MAPPINGS,
  SOLFEGGIO_FREQUENCIES,
};