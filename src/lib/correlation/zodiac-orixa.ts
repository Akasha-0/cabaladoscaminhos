/**
 * Zodiac-Orixá Correlation Mapping
 * Based on IDEIA.md Cabala dos Caminhos spiritual system
 * Aligns the twelve zodiac signs with their corresponding Orixás
 */

import type { Signo } from './zodiac-signo';
import type { Elemento } from './element-sign';

/** Orixá information */
export interface OrixaInfo {
  /** Orixá name */
  nome: string;
  /** Sacred day of the week */
  dia_sagrado: string;
  /** Primary element */
  elemento: string;
  /** Traditional colors */
  cores: string[];
}

/** Complete zodiac-to-Orixá correlation mapping */
export interface ZodiacOrixaMapping {
  /** Zodiac sign name (Portuguese) */
  signo: Signo;
  /** Element correspondence */
  elemento: Elemento;
  /** Primary corresponding Orixá */
  orixa_principal: OrixaInfo;
  /** Secondary corresponding Orixá(s) */
  orixas_secundarios: OrixaInfo[];
  /** Connection description */
  conexao_espiritual: string;
  /** Spiritual meaning of the correlation */
  significado_espiritual: string;
  /** Traditional planetary ruler */
  planeta_regente: string;
  /** Sacred day of the primary Orixá */
  dia_sagrado: string;
  /** Elemental qualities */
  qualidades: {
    temperatura: 'Quente' | 'Frio' | 'Neutro';
    umidade: 'Seco' | 'Úmido';
    polaridade: 'Yang' | 'Yin';
  };
  /** Spiritual associations */
  associacoes_espirituais: string[];
  /** Ritual guidance */
  orientacao_ritual: string;
}

// ─── Zodiac Sign-to-Orixá Mapping ───────────────────────────────────────────

export const ZODIAC_ORIXA_MAPPINGS: Readonly<Record<Signo, ZodiacOrixaMapping>> = {
  /**
   * ÁRIES - Fogo/Cardinal/Yang
   * Regente: Marte | Orixá: Ogum
   * Conexão: A coragem guerreira de Áries ressoa com Ogum, senhor dos caminhos
   * e da guerra justa. A energia de Marte manifesta-se na força de Ogum.
   */
  Áries: {
    signo: 'Áries',
    elemento: 'Fogo',
    orixa_principal: {
      nome: 'Ogum',
      dia_sagrado: 'Terça-feira',
      elemento: 'Fogo/Terra',
      cores: ['Azul Claro', 'Vermelho', 'Verde'],
    },
    orixas_secundarios: [
      { nome: 'Iansã', dia_sagrado: 'Terça-feira', elemento: 'Fogo', cores: ['Laranja', 'Amarelo', 'Vermelho'] },
    ],
    conexao_espiritual: 'A energia guerreira de Áries conecta-se à força de Ogum, o Orixá que abre caminhos e protege nas batalhas. A coragem do signo de fogo manifesta-se na capacidade de avançar sem medo, assim como Ogum que caminha sempre adiante.',
    significado_espiritual: 'Áries-Ogum representa o guerreiro cósmico que abre novos caminhos. A energia marciana do signo manifesta-se na determinação inabalável de Ogum, ensinando que a verdadeira força está em avançar mesmo quando o caminho é incerto.',
    planeta_regente: 'Marte',
    dia_sagrado: 'Terça-feira',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Coragem e determinação',
      'Iniciação de novos ciclos',
      'Força de vontade',
      'Ação decisiva',
      'Pioneirismo espiritual',
      'Proteção guerreira',
    ],
    orientacao_ritual: 'Ebós de defesa com inhames assados, paliteiros de Ogum, limpeza com folhas de espada-de-são-jorge. Evitar violência verbal e usar a energia guerreira com justiça.',
  },

  /**
   * TOURO - Terra/Fixed/Yin
   * Regente: Vénus | Orixá: Oxum
   * Conexão: A estabilidade terrena de Touro ressoa com a beleza e abundância de Oxum.
   * A energia de Vénus conecta-se ao amor e prosperidade de Oxum.
   */
  Touro: {
    signo: 'Touro',
    elemento: 'Terra',
    orixa_principal: {
      nome: 'Oxum',
      dia_sagrado: 'Sábado',
      elemento: 'Água',
      cores: ['Rosa', 'Amarelo-ouro', 'Azul-celeste'],
    },
    orixas_secundarios: [
      { nome: 'Iemanjá', dia_sagrado: 'Sábado', elemento: 'Água', cores: ['Azul Escuro', 'Branco'] },
    ],
    conexao_espiritual: 'A estabilidade fértil de Touro conecta-se à abundância de Oxum, a Orixá do ouro e do amor. A natureza terrestre do signo encontra ressonância na capacidade de Oxum de nutrir e atrair prosperidade.',
    significado_espiritual: 'Touro-Oxum representa a abundância sagrada que vem da paciência e do trabalho disciplinado. A conexão terrena ensina que a verdadeira riqueza é tanto material quanto espiritual - a capacidade de atrair através da beleza e da harmonic.',
    planeta_regente: 'Vénus',
    dia_sagrado: 'Sábado',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Abundância e prosperidade',
      'Estabilidade e segurança',
      'Beleza e sensualidade',
      'Paciência e perseverança',
      'Nutrição espiritual',
      'Amor e fertilidade',
    ],
    orientacao_ritual: 'Ebós de fartura com seis tipos de frutas, amalá para Xangô, partilhar banquetes. Banhos de mel e caldas de frutas para Oxum. Oferendas douradas na água.',
  },

  /**
   * GÉMEOS - Ar/Mutable/Yang
   * Regente: Mercúrio | Orixá: Oxumaré
   * Conexão: A dualidade intelectual de Gémeos ressoa com Oxumaré, senhor dos ciclos
   * e da renovação. A energia de Mercúrio conecta-se à transformação de Oxumaré.
   */
  Gémeos: {
    signo: 'Gémeos',
    elemento: 'Ar',
    orixa_principal: {
      nome: 'Oxumaré',
      dia_sagrado: 'Quarta-feira',
      elemento: 'Água/Ar',
      cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    },
    orixas_secundarios: [
      { nome: 'Iansã', dia_sagrado: 'Terça-feira', elemento: 'Fogo', cores: ['Laranja', 'Amarelo', 'Vermelho'] },
    ],
    conexao_espiritual: 'A mente ágil de Gémeos conecta-se à dualidade de Oxumaré, o Arco-íris que une céus e terra. A intelectualidade airada busca conexões entre opostos, vibrando na frequência das transformações rápidas.',
    significado_espiritual: 'Gémeos-Oxumaré representa a mente que navega entre possibilidades. A dualidade sagrada deste alinhamento ensina que cada escolha abre e fecha portas, e que a verdadeira sabedoria está em entender que ambos os caminhos levam à evolução.',
    planeta_regente: 'Mercúrio',
    dia_sagrado: 'Quarta-feira',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Comunicação e troca',
      'Versatilidade intelectual',
      'Conexão entre opostos',
      'Adaptabilidade mental',
      'Transformação e renovação',
      'Ciclos da vida',
    ],
    orientacao_ritual: 'Ebós de prosperidade com doces, frutas para Ibeji, comidas leves em praças ou jardins. Oferendas de arco-íris para Oxumaré. Acender velas coloridas nos pontos de interseção.',
  },

  /**
   * CÂNCER - Água/Cardinal/Yin
   * Regente: Lua | Orixá: Iemanjá
   * Conexão: A emocionalidade profunda de Câncer ressoa com Iemanjá, mãe das águas.
   * A energia lunar do signo conecta-se ao poder maternal de Iemanjá.
   */
  Câncer: {
    signo: 'Câncer',
    elemento: 'Água',
    orixa_principal: {
      nome: 'Iemanjá',
      dia_sagrado: 'Sábado',
      elemento: 'Água',
      cores: ['Azul Escuro', 'Branco', 'Transparente'],
    },
    orixas_secundarios: [
      { nome: 'Oxum', dia_sagrado: 'Sábado', elemento: 'Água', cores: ['Rosa', 'Amarelo-ouro'] },
      { nome: 'Nanã', dia_sagrado: 'Terça-feira', elemento: 'Água', cores: ['Lilás', 'Roxo'] },
    ],
    conexao_espiritual: 'A água lunar de Câncer conecta-se ao poder maternal de Iemanjá. A profundidade emocional do signo é um radar espiritual que percebe antes que se manifeste, assim como as águas conhecem os segredos.',
    significado_espiritual: 'Câncer-Iemanjá representa a mãe cósmica que guarda a memória ancestral. Este alinhamento ensina que a sensibilidade às ondas emocionais é um dom espiritual - a capacidade de nutrir e proteger aqueles que amamos.',
    planeta_regente: 'Lua',
    dia_sagrado: 'Sábado',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Intuição e percepção',
      'Memória ancestral',
      'Nutrição emocional',
      'Proteção do lar',
      'Ciclos de renovação',
      'Fertilidade e maternidade',
    ],
    orientacao_ritual: 'Ebós de proteção com alimentos brancos, canjica na beira-mar para Iemanjá, banhos de folhas frias (colônia, saião). Oferendas de flores brancas nas quartas e sábados.',
  },

  /**
   * LEÃO - Fogo/Fixed/Yang
   * Regente: Sol | Orixá: Xangô
   * Conexão: A nobreza radiante de Leão ressoa com Xangô, senhor do fogo e da justiça.
   * A energia solar do signo conecta-se à autoridade de Xangô.
   */
  Leão: {
    signo: 'Leão',
    elemento: 'Fogo',
    orixa_principal: {
      nome: 'Xangô',
      dia_sagrado: 'Quarta-feira',
      elemento: 'Fogo',
      cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    },
    orixas_secundarios: [
      { nome: 'Ogum', dia_sagrado: 'Terça-feira', elemento: 'Fogo/Terra', cores: ['Azul Claro', 'Vermelho', 'Verde'] },
    ],
    conexao_espiritual: 'O fogo real de Leão conecta-se à autoridade de Xangô, o Orixá rei que governa com justiça. A radiância solar do signo manifesta-se na capacidade de brilhar e liderar, assim como Xangô ilumina com seu raio.',
    significado_espiritual: 'Leão-Xangô representa o soberano divino que governa com sabedoria e justiça. A energia solar do signo ensina que a verdadeira liderança vem da capacidade de irradiar luz própria e inspirar outros a crescer.',
    planeta_regente: 'Sol',
    dia_sagrado: 'Quarta-feira',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Liderança e soberania',
      'Criatividade e expressão',
      'Generosidade e magnanimidade',
      'Confiança e coragem',
      'Justiça e equidade',
      'Luz interior',
    ],
    orientacao_ritual: 'Ebós de prosperidade com amalá, oferendas de fumo para Xangô, balas de coco na encruzilhada. Queima de madeiras secas para seu raio. Aclarescer questões de justiça.',
  },

  /**
   * VIRGEM - Terra/Mutable/Yin
   * Regente: Mercúrio | Orixá: Oxóssi
   * Conexão: A análise meticulosa de Virgem ressoa com Oxóssi, caçador silencioso
   * da sabedoria. A energia mercurial conecta-se à busca de Oxóssi.
   */
  Virgem: {
    signo: 'Virgem',
    elemento: 'Terra',
    orixa_principal: {
      nome: 'Oxóssi',
      dia_sagrado: 'Quinta-feira',
      elemento: 'Terra',
      cores: ['Verde', 'Azul-turquesa'],
    },
    orixas_secundarios: [
      { nome: 'Oxum', dia_sagrado: 'Sábado', elemento: 'Água', cores: ['Rosa', 'Amarelo-ouro'] },
    ],
    conexao_espiritual: 'A terra cultivada de Virgem conecta-se à caça certeira de Oxóssi. A atenção ao detalhe do signo manifesta-se na paciência do caçador que espera o momento exato para agir.',
    significado_espiritual: 'Virgem-Oxóssi representa o buscador silencioso da sabedoria. A energia mercurial do signo ensina que a verdadeira pureza vem da busca constante do conhecimento e do domínio das artes da cura.',
    planeta_regente: 'Mercúrio',
    dia_sagrado: 'Quinta-feira',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Discernimento e análise',
      'Pureza e serviço',
      'Busca do conhecimento',
      'Perfeccionismo saudável',
      'Cura e saúde',
      'Sabedoria natural',
    ],
    orientacao_ritual: 'Ebós de prosperidade com alimentos naturais, guiné para Oxóssi, samambaias na mata. Banhos de alecrim e arruda. Oferendas de verduras e frutas frescas.',
  },

  /**
   * LIBRA - Ar/Cardinal/Yang
   * Regente: Vénus | Orixá: Oxalá
   * Conexão: O equilíbrio harmonioso de Libra ressoa com Oxalá, pai maior,
   * criador do mundo. A energia de Vénus conecta-se à paz de Oxalá.
   */
  Libra: {
    signo: 'Libra',
    elemento: 'Ar',
    orixa_principal: {
      nome: 'Oxalá',
      dia_sagrado: 'Sexta-feira',
      elemento: 'Éter',
      cores: ['Branco', 'Marfim', 'Opala'],
    },
    orixas_secundarios: [
      { nome: 'Oxum', dia_sagrado: 'Sábado', elemento: 'Água', cores: ['Rosa', 'Amarelo-ouro'] },
    ],
    conexao_espiritual: 'O ar harmonioso de Libra conecta-se à paz de Oxalá, o Criador que estabelece ordem no caos. A busca pelo equilíbrio do signo manifesta-se na capacidade de Oxalá de criar harmonia entre opostos.',
    significado_espiritual: 'Libra-Oxalá representa o harmonizador divino que estabelece paz e ordem. A energia venusiana do signo ensina que a verdadeira beleza está no equilíbrio e que a arte da mediação é sagrada.',
    planeta_regente: 'Vénus',
    dia_sagrado: 'Sexta-feira',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Equilíbrio e harmonia',
      'Justiça e diplomacia',
      'Beleza e arte',
      'Parceria e relacionamentos',
      'Paz e reconciliação',
      'Criação e fertilidade',
    ],
    orientacao_ritual: 'Ebós de paz com roupas brancas, boldo para Oxalá, partilhar alimentos com necessitados. Misas blancas para pedir paz. Banhos de colônia e alecrim para harmonizar relacionamentos.',
  },

  /**
   * ESCORPIÃO - Água/Fixed/Yin
   * Regente: Plutão | Orixá: Oxumaré
   * Conexão: A intensidade transformadora de Escorpião ressoa com Oxumaré,
   * senhor dos ciclos e da regeneração. A energia plutônica conecta-se à renovação de Oxumaré.
   */
  Escorpião: {
    signo: 'Escorpião',
    elemento: 'Água',
    orixa_principal: {
      nome: 'Oxumaré',
      dia_sagrado: 'Quarta-feira',
      elemento: 'Água/Ar',
      cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    },
    orixas_secundarios: [
      { nome: 'Omolu', dia_sagrado: 'Segunda-feira', elemento: 'Terra', cores: ['Preto', 'Branco', 'Vermelho'] },
      { nome: 'Iansã', dia_sagrado: 'Terça-feira', elemento: 'Fogo', cores: ['Laranja', 'Amarelo', 'Vermelho'] },
    ],
    conexao_espiritual: 'A água profunda de Escorpião conecta-se à renovação de Oxumaré, o Arco-íris que renova os ciclos. A intensidade transformadora do signo manifesta-se na capacidade de morrer e renascer, assim como Oxumaré renova a natureza.',
    significado_espiritual: 'Escorpião-Oxumaré representa o escorpião que renasce de suas próprias cinzas. Este alinhamento ensina que a morte do ego antigo é necessária para a emergência do ser transformado. O poço profundo é onde ocultamos tesouros até termos coragem de trazê-los à luz.',
    planeta_regente: 'Plutão',
    dia_sagrado: 'Quarta-feira',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Transformação radical',
      'Poder e intensidade',
      'Segredos ocultos',
      'Regeneração e renascimento',
      'Profundidade emocional',
      'Ciclos de morte e vida',
    ],
    orientacao_ritual: 'Ebós de proteção com elementos escuros, oferendas de arco-íris para Oxumaré. Banhos de pipoca preta para Omolu. Descarregar energias pesadas com defumações de arruda e alecrim.',
  },

  /**
   * SAGITÁRIO - Fogo/Mutable/Yang
   * Regente: Júpiter | Orixá: Oxóssi
   * Conexão: A expansão filosofica de Sagitário ressoa com Oxóssi, caçador
   * da sabedoria verdadeira. A energia de Júpiter conecta-se à busca de Oxóssi.
   */
  Sagitário: {
    signo: 'Sagitário',
    elemento: 'Fogo',
    orixa_principal: {
      nome: 'Oxóssi',
      dia_sagrado: 'Quinta-feira',
      elemento: 'Terra',
      cores: ['Verde', 'Azul-turquesa'],
    },
    orixas_secundarios: [
      { nome: 'Iansã', dia_sagrado: 'Terça-feira', elemento: 'Fogo', cores: ['Laranja', 'Amarelo', 'Vermelho'] },
    ],
    conexao_espiritual: 'O fogo expansivo de Sagitário conecta-se à busca certeira de Oxóssi. A filosofia otimista do signo manifesta-se na esperança do caçador que sabe que a presa virá se mantermos o foco na meta.',
    significado_espiritual: 'Sagitário-Oxóssi representa o caçador espiritual que busca a presa divina. A energia jupiteriana do signo ensina que a verdadeira sabedoria está em manter o olhar na.meta enquanto caminhamos com fé.',
    planeta_regente: 'Júpiter',
    dia_sagrado: 'Quinta-feira',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Filosofia e sabedoria',
      'Expansão e otimismo',
      'Aventura e exploração',
      'Esperança e fé',
      'Justiça e honestidade',
      'Busca espiritual',
    ],
    orientacao_ritual: 'Ebós de prosperidade com alimentos naturais, guiné para Oxóssi na mata. Oferendas de verduras frescas. Banhos de alecrim e eucalipto para expandir a consciência. Ir em busca espiritual.',
  },

  /**
   * CAPRICÓRNIO - Terra/Cardinal/Yin
   * Regente: Saturno | Orixá: Omolu
   * Conexão: A ambição disciplinada de Capricórnio ressoa com Omolu, senhor
   * das doenças e curas. A energia de Saturno conecta-se à transformação de Omolu.
   */
  Capricórnio: {
    signo: 'Capricórnio',
    elemento: 'Terra',
    orixa_principal: {
      nome: 'Omolu',
      dia_sagrado: 'Segunda-feira',
      elemento: 'Terra',
      cores: ['Preto', 'Branco', 'Vermelho', 'Violeta'],
    },
    orixas_secundarios: [
      { nome: 'Nanã', dia_sagrado: 'Terça-feira', elemento: 'Água', cores: ['Lilás', 'Roxo'] },
    ],
    conexao_espiritual: 'A terra sólida de Capricórnio conecta-se à transformação de Omolu. A disciplina do signo manifesta-se na paciência de Omolu que sabe que toda doença traz o saber da cura, assim como toda queda traz o conhecimento da subida.',
    significado_espiritual: 'Capricórnio-Omolu representa o mestre da transformação que transforma chumbo em ouro. A energia saturnina do signo ensina que a verdadeira sabedoria vem através das dificuldades e que devemos atravessar a noite para ver o amanhecer.',
    planeta_regente: 'Saturno',
    dia_sagrado: 'Segunda-feira',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Disciplina e perseverança',
      'Ambição e responsabilidade',
      'Transformação através da dor',
      'Sabedoria das cicatrizes',
      'Estrutura e ordem',
      'Maturidade espiritual',
    ],
    orientacao_ritual: 'Ebós de proteção com pipoca preta para Omolu, banhos de assa-peixe e canela-de-velho. Respeitar o processo de cura sem apressá-lo. Aceitar as dificuldades como mestras.',
  },

  /**
   * AQUÁRIO - Ar/Fixed/Yang
   * Regente: Urano | Orixá: Nanã
   * Conexão: A inovação radical de Aquário ressoa com Nanã, senhora anciã
   * da sabedoria primordial. A energia de Urano conecta-se à idade de Nanã.
   */
  Aquário: {
    signo: 'Aquário',
    elemento: 'Ar',
    orixa_principal: {
      nome: 'Nanã',
      dia_sagrado: 'Terça-feira',
      elemento: 'Água/Terra',
      cores: ['Lilás', 'Roxo', 'Azul-violeta'],
    },
    orixas_secundarios: [
      { nome: 'Oxalá', dia_sagrado: 'Sexta-feira', elemento: 'Éter', cores: ['Branco', 'Marfim'] },
      { nome: 'Oxumaré', dia_sagrado: 'Quarta-feira', elemento: 'Água/Ar', cores: ['Arco-íris', 'Amarelo'] },
    ],
    conexao_espiritual: 'O ar visionário de Aquário conecta-se à sabedoria antiga de Nanã. A inovação do signo manifesta-se na capacidade de Nanã de DAR forma à matéria primordial, assim como Aquário dá forma às novas ideias.',
    significado_espiritual: 'Aquário-Nanã representa o visionário que traz águas novas ao mundo. A energia uraniana do signo ensina que a verdadeira inovação vem de olhar para dentro e encontrar lá a semente de um mundo novo.',
    planeta_regente: 'Urano',
    dia_sagrado: 'Terça-feira',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Inovação e originalidade',
      'Humanitarismo e fraternidade',
      'Visão de futuro',
      'Liberdade e rebeldia',
      'Sabedoria ancestral',
      'Eternidade e ciclos longos',
    ],
    orientacao_ritual: 'Ebós de proteção com elementos brancos e roxos, manjericão roxo para Nanã. Banhos de manjericão e avenca. Trabalhar pelo bem da humanidade. Honrar os anciãos e ancestrais.',
  },

  /**
   * PEIXES - Água/Mutable/Yin
   * Regente: Neptuno | Orixá: Iemanjá
   * Conexão: A sensibilidade transcendente de Peixes ressoa com Iemanjá,
   * mãe das águas primordiais. A energia de Neptuno conecta-se ao oceano de Iemanjá.
   */
  Peixes: {
    signo: 'Peixes',
    elemento: 'Água',
    orixa_principal: {
      nome: 'Iemanjá',
      dia_sagrado: 'Sábado',
      elemento: 'Água',
      cores: ['Azul Escuro', 'Branco', 'Transparente'],
    },
    orixas_secundarios: [
      { nome: 'Oxum', dia_sagrado: 'Sábado', elemento: 'Água', cores: ['Rosa', 'Amarelo-ouro'] },
      { nome: 'Nanã', dia_sagrado: 'Terça-feira', elemento: 'Água', cores: ['Lilás', 'Roxo'] },
    ],
    conexao_espiritual: 'A água dissolvente de Peixes conecta-se ao oceano de Iemanjá. A sensibilidade do signo manifesta-se na capacidade de Iemanjá de absorver e transformar todas as águas, assim como Peixes absorve e transfigura todas as experiências.',
    significado_espiritual: 'Peixes-Iemanjá representa o místico que navega entre mundos. A energia neptuniana do signo ensina que a verdadeira espiritualidade está em dissolver os limites do ego e conectar-se com a correnteza cósmica.',
    planeta_regente: 'Neptuno',
    dia_sagrado: 'Sábado',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Intuição e sensitividade',
      'Compaixão e empatia',
      'Transcendência e misticismo',
      'Conexão com o divino',
      'Sacrifício e devoção',
      'Unidade com o todo',
    ],
    orientacao_ritual: 'Ebós de proteção com alimentos brancos, canjica na beira-mar para Iemanjá. Banhos de colônia e saião. Oferecer flores brancas na água. Praticar a meditação e a dissolução do ego.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(ZODIAC_ORIXA_MAPPINGS);
Object.values(ZODIAC_ORIXA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the zodiac-to-Orixá correlation mapping for a given sign.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro', ...)
 * @returns The correlation mapping or null if not found
 */
export function getZodiacOrixa(signo: string): ZodiacOrixaMapping | null {
  return ZODIAC_ORIXA_MAPPINGS[signo as Signo] ?? null;
}

/**
 * Get the Orixá-to-zodiac reverse mapping.
 * Returns the zodiac sign where the Orixá is primary.
 * @param orixaNome - Orixá name (e.g., 'Ogum', 'Oxum', ...)
 * @returns The zodiac sign where this is the primary Orixá, or null if not found
 */
export function getOrixaZodiac(orixaNome: string): Signo | null {
  // First, search for primary Orixá match
  const mappings = Object.values(ZODIAC_ORIXA_MAPPINGS);
  const primaryMatch = mappings.find(m => m.orixa_principal.nome === orixaNome);
  if (primaryMatch) return primaryMatch.signo;
  
  // Then, search for secondary Orixá match
  const secondaryMatch = mappings.find(
    m => m.orixas_secundarios.some(o => o.nome === orixaNome)
  );
  return secondaryMatch?.signo ?? null;
}

/**
 * Get all zodiac-Orixá mappings.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacOrixas(): ZodiacOrixaMapping[] {
  return Object.values(ZODIAC_ORIXA_MAPPINGS);
}

/**
 * Get the primary Orixá for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns The primary Orixá info or null if sign not found
 */
export function getSignoOrixaPrincipal(signo: string): OrixaInfo | null {
  return getZodiacOrixa(signo)?.orixa_principal ?? null;
}

/**
 * Get all secondary Orixás for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns Array of secondary Orixá info or null if sign not found
 */
export function getSignoOrixasSecundarios(signo: string): OrixaInfo[] | null {
  return getZodiacOrixa(signo)?.orixas_secundarios ?? null;
}

/**
 * Get the spiritual meaning for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns The spiritual meaning or null if sign not found
 */
export function getZodiacOrixaSignificado(signo: string): string | null {
  return getZodiacOrixa(signo)?.significado_espiritual ?? null;
}

/**
 * Get all zodiac signs by element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of zodiac signs belonging to that element
 */
export function getSignosByElement(elemento: string): Signo[] {
  const mappings = Object.values(ZODIAC_ORIXA_MAPPINGS);
  return mappings
    .filter(m => m.elemento === elemento)
    .map(m => m.signo);
}

/**
 * Check if a zodiac sign has a specific Orixá.
 * @param signo - Zodiac sign name
 * @param orixaNome - Orixá name to check
 * @returns True if the sign has the specified Orixá
 */
export function hasSignoOrixa(signo: string, orixaNome: string): boolean {
  const mapping = getZodiacOrixa(signo);
  if (!mapping) return false;
  return (
    mapping.orixa_principal.nome === orixaNome ||
    mapping.orixas_secundarios.some(o => o.nome === orixaNome)
  );
}

/**
 * Get the sacred day for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns The sacred day or null if sign not found
 */
export function getSignoDiaSagrado(signo: string): string | null {
  return getZodiacOrixa(signo)?.dia_sagrado ?? null;
}

/**
 * Get all zodiac signs ruled by a specific planet.
 * @param planeta - Planet name (e.g., 'Marte', 'Vénus', ...)
 * @returns Array of zodiac signs ruled by that planet
 */
export function getSignosByPlaneta(planeta: string): Signo[] {
  const mappings = Object.values(ZODIAC_ORIXA_MAPPINGS);
  return mappings
    .filter(m => m.planeta_regente === planeta)
    .map(m => m.signo);
}
