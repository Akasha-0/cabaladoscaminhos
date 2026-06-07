/**
 * Zodiac-Odú Ifá Correlation Mapping
 * Based on IDEIA.md Cabala dos Caminhos spiritual system
 * Aligns the twelve zodiac signs with their corresponding Odu Ifá (Merindilogun)
 */

import type { Signo } from './zodiac-signo';
import type { Elemento } from './element-odu';

/** Odu Ifá information */
export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
}

/** Complete zodiac-to-Odú Ifá correlation mapping */
export interface ZodiacOduMapping {
  /** Zodiac sign name (Portuguese) */
  signo: Signo;
  /** Element correspondence */
  elemento: Elemento;
  /** Primary corresponding Odu Ifá */
  odu_principal: OduInfo;
  /** Secondary corresponding Odu(s) */
  odus_secundarios: OduInfo[];
  /** Connection description */
  conexao_elemental: string;
  /** Spiritual meaning of the correlation */
  significado_espiritual: string;
  /** Orixá correspondent */
  orixa: string;
  /** Traditional planetary ruler */
  planeta_regente: string;
  /** Sacred day */
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

// ─── Zodiac Sign-to-Odú Ifá Mapping ───────────────────────────────────────────

export const ZODIAC_ODU_MAPPINGS: Readonly<Record<Signo, ZodiacOduMapping>> = {
  /**
   * ÁRIES - Fogo/Cardinal/Yang
   * Regente: Marte | Orixá: Ogum/Iansã
   * Conexão: A coragem iniciática de Áries ressoa com Etaogundá (Força/Corte)
   * e Okaran (Início/Destino). Ogum senhor dos caminhos e da guerra justa.
   */
  Áries: {
    signo: 'Áries',
    elemento: 'Fogo',
    odu_principal: {
      numero: 3,
      nome: 'Etaogundá',
      significado: 'A revolta, a força física, a criação de ferramentas. O corte e a separação.',
    },
    odus_secundarios: [
      { numero: 1, nome: 'Okaran', significado: 'O começo, a dúvida, a insubordinação. Caminho difícil.' },
      { numero: 12, nome: 'Ejilsebora', significado: 'A justiça, o fogo purificador, a guerra justa.' },
    ],
    conexao_elemental: 'O fogo ardente de Áries conecta-se à força cortante de Etaogundá e à energia guerreira de Ejilsebora. O calor ígneo transforma a matéria-prima em ferramentas de ação.',
    significado_espiritual: 'Áries-Etaogundá representa o guerreiro cósmico que corta para construir. A força vital do signo de fogo manifesta-se na capacidade de iniciar novos caminhos com coragem e determinação. Este alinhamento ensina que a verdadeira liderança começa quando temos a audácia de dar o primeiro passo, mesmo enfrentando resistências.',
    orixa: 'Ogum',
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
    ],
    orientacao_ritual: 'Ebós de defesa com inhames assados, paliteiros de Ogum, limpeza com folhas de mariô. Evitar violência verbal e uso desnecessário de objetos cortantes.',
  },

  /**
   * TOURO - Terra/Fixed/Yin
   * Regente: Vénus | Orixá: Oxum
   * Conexão: A estabilidade terrena de Touro ressoa com Okaran (Destino/Ancagem)
   * e Obará (Riqueza/Fartura). Oxum señora del oro y el amor.
   */
  Touro: {
    signo: 'Touro',
    elemento: 'Terra',
    odu_principal: {
      numero: 6,
      nome: 'Obará',
      significado: 'A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.',
    },
    odus_secundarios: [
      { numero: 1, nome: 'Okaran', significado: 'O começo, a dúvida, a insubordinação.' },
      { numero: 8, nome: 'EjiOníle', significado: 'A cabeça (Ori), a liderança, o topo do mundo.' },
    ],
    conexao_elemental: 'A terra fértil de Touro conecta-se à fartura de Obará e à liderança de EjiOníle. A estabilidade elementar representa o ancoradouro que nutre a prosperidade material e espiritual.',
    significado_espiritual: 'Touro-Obará representa a abundance sagrada que vem da paciência e do trabalho disciplinado. A conexão terrena ensina que a verdadeira riqueza não é apenas material, mas vibrational - a capacidade de atrair e manter recursos através da harmonic com a terra e seus ritmos naturais.',
    orixa: 'Oxum',
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
    ],
    orientacao_ritual: 'Ebós de fartura com seis tipos de frutas, amalá para Xangô, partilhar banquetes. Banhos de mel e caldas de frutas para Oxum.',
  },

  /**
   * GÉMEOS - Ar/Mutable/Yang
   * Regente: Mercúrio | Orixá: Oxumaré/Iansã
   * Conexão: A dualidade intelectual de Gémeos ressoa com Ejiokô (Caminhos Duplos)
   * e Ossá (Transformação/Vento). Oxumaré senhor dos ciclos e da renovação.
   */
  Gémeos: {
    signo: 'Gémeos',
    elemento: 'Ar',
    odu_principal: {
      numero: 2,
      nome: 'Ejiokô',
      significado: 'A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.',
    },
    odus_secundarios: [
      { numero: 9, nome: 'Ossá', significado: 'O vento, as transformações rápidas, o reino das Iyami.' },
      { numero: 10, nome: 'Ofun', significado: 'O mistério, a velhice, a cura, o sopro divino.' },
    ],
    conexao_elemental: 'O ar mental de Gémeos conecta-se à dualidade de Ejiokô e à transformação veloz de Ossá. A intelectualidade airada busca conexões entre opostos, vibrando na frequência das mudanças rápidas.',
    significado_espiritual: 'Gémeos-Ejiokô representa a mente que navega entre possibilidades. A dualidade sagrada deste alinhamento ensina que cada escolha abre e fecha portas, e que a verdadeira sabedoria está em entender que ambos os caminhos levam a experiências necessárias para a evolução.',
    orixa: 'Oxumaré',
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
      'Velocidade de pensamento',
    ],
    orientacao_ritual: 'Ebós de prosperidade com doces, frutas para Ibeji, comidas leves em praças ou jardins. Sacudimentos com folhas de fumo para Ossá.',
  },

  /**
   * CÂNCER - Água/Cardinal/Yin
   * Regente: Lua | Orixá: Iemanjá
   * Conexão: A emocionalidade profunda de Câncer ressoa com Irosun (Aviso/Sangue)
   * e Ossá (Vento/Transformação). Iemanjá mãe das águas e da fertilidade.
   */
  Câncer: {
    signo: 'Câncer',
    elemento: 'Água',
    odu_principal: {
      numero: 4,
      nome: 'Irosun',
      significado: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.',
    },
    odus_secundarios: [
      { numero: 9, nome: 'Ossá', significado: 'O vento, as transformações rápidas.' },
      { numero: 7, nome: 'Odi', significado: 'A teimosia, o renascimento, as coisas ocultas.' },
    ],
    conexao_elemental: 'A água lunar de Câncer conecta-se à visão espiritual de Irosun e ao poder transformador de Ossá. A profundidade emocional é um radar espiritual que percebe avisos antes que se manifestem.',
    significado_espiritual: 'Câncer-Irosun representa a mãe cósmica que guarda a memória ancestral. Este alinhamento ensina que a sensibilidade às ondas emocionais é um dom espiritual - a capacidade de intuir perigos e oportunidades antes que se materializem no mundo concreto.',
    orixa: 'Iemanjá',
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
    ],
    orientacao_ritual: 'Ebós de proteção com alimentos brancos, canjica na beira-mar para Iemanjá, banhos de folhas frias (colônia, saião).',
  },

  /**
   * LEÃO - Fogo/Fixed/Yang
   * Regente: Sol | Orixá: Xangô
   * Conexão: O brilho real de Leão ressoa com Obará (Riqueza/Brilho) e Ejilsebora (Justiça/Fogo).
   * Xangô senhor do raio e da justiça divina.
   */
  Leão: {
    signo: 'Leão',
    elemento: 'Fogo',
    odu_principal: {
      numero: 6,
      nome: 'Obará',
      significado: 'A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.',
    },
    odus_secundarios: [
      { numero: 12, nome: 'Ejilsebora', significado: 'A justiça, o fogo purificador, a guerra justa.' },
      { numero: 8, nome: 'EjiOníle', significado: 'A cabeça (Ori), a liderança, o topo do mundo.' },
    ],
    conexao_elemental: 'O fogo solar de Leão conecta-se ao brilho de Obará e à justiça flamejante de Ejilsebora. A irradiação real é a energia que transforma a matéria em ouro e o súdito em rei.',
    significado_espiritual: 'Leão-Obará representa o rei solar que governa com generosidade e justiça. Este alinhamento ensina que o verdadeiro poder não está em acumular, mas em irradiar - brilho pessoal que ilumina caminhos e atrai prosperidade para toda a comunidade.',
    orixa: 'Xangô',
    planeta_regente: 'Sol',
    dia_sagrado: 'Domingo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Brilho pessoal e carisma',
      'Liderança natural',
      'Generosidade real',
      'Criatividade dramática',
      'Vitalidade irradiante',
    ],
    orientacao_ritual: 'Ebós de fartura com amalá para Xangô, firmezas com pedras de raio, velas douradas ao meio-dia.',
  },

  /**
   * VIRGEM - Terra/Mutable/Yin
   * Regente: Mercúrio | Orixá: Oxóssi
   * Conexão: A precisão analítica de Virgem ressoa com Ofun (Mistério/Cura) e Alafia (Paz/Luz).
   * Oxóssi senhor da caça e da sabedoria.
   */
  Virgem: {
    signo: 'Virgem',
    elemento: 'Terra',
    odu_principal: {
      numero: 10,
      nome: 'Ofun',
      significado: 'O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação.',
    },
    odus_secundarios: [
      { numero: 16, nome: 'Alafia', significado: 'A paz absoluta, a luz total, a confirmação dos Deuses.' },
      { numero: 4, nome: 'Irosun', significado: 'O aviso, a visão espiritual.' },
    ],
    conexao_elemental: 'A terra analítica de Virgem conecta-se à sabedoria antiga de Ofun e à luz purificada de Alafia. A capacidade de discernir detalhes sutis é a ferramenta de cura mais poderosa.',
    significado_espiritual: 'Virgem-Ofun representa a servidora sagrada que encontra a perfeição através do serviço discreto. Este alinhamento ensina que a verdadeira maestria está no detalhe - a capacidade de perceber o que outros perdem e cuidar com precisão cirúrgica e coração compassivo.',
    orixa: 'Oxóssi',
    planeta_regente: 'Mercúrio',
    dia_sagrado: 'Quinta-feira',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Discernimento e análise',
      'Serviço sagrado',
      'Purificação e organização',
      'Sabedoria prática',
      'Cura pelo detalhe',
    ],
    orientacao_ritual: 'Ebós de saúde com frutas brancas, banhos de leite de cabra, rezas mansas. Vestir-se de branco e manter a quietude.',
  },

  /**
   * LIBRA - Ar/Cardinal/Yang
   * Regente: Vénus | Orixá: Oxalá/Iansã
   * Conexão: O equilíbrio harmonioso de Libra ressoa com EjiOníle (Liderança/Cabeça) e Alafia (Paz/Luz).
   * Oxalá pai da paz e da pureza.
   */
  Libra: {
    signo: 'Libra',
    elemento: 'Ar',
    odu_principal: {
      numero: 8,
      nome: 'EjiOníle',
      significado: 'A cabeça (Ori), a liderança, o topo do mundo, o sangue branco.',
    },
    odus_secundarios: [
      { numero: 16, nome: 'Alafia', significado: 'A paz absoluta, a luz total, a confirmação dos Deuses.' },
      { numero: 2, nome: 'Ejiokô', significado: 'A dualidade, os caminhos duplos.' },
    ],
    conexao_elemental: 'O ar equilibrante de Libra conecta-se à liderança de EjiOníle e à paz absoluta de Alafia. A busca pela harmonic entre opostos é uma prática de alinhamento espiritual.',
    significado_espiritual: 'Libra-EjiOníle representa a balança cósmica que busca a harmonic perfeita. Este alinhamento ensina que a justiça verdadeira vem da cabeça fria - a capacidade de ver todas as perspectivas sem perder o próprio centro de luz interior.',
    orixa: 'Oxalá',
    planeta_regente: 'Vénus',
    dia_sagrado: 'Sexta-feira',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Úmido',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Harmonia e equilibrio',
      'Justiça e diplomacia',
      'Beleza e arte',
      'Parcerias e alianças',
      'Conexão espiritual elevada',
    ],
    orientacao_ritual: 'Ebós de alinhamento (Bori) com canjica branca, algodão, banhos de boldo (tapete de Oxalá), velas brancas.',
  },

  /**
   * ESCORPIÃO - Água/Fixed/Yin
   * Regente: Plutão | Orixá: Oxumaré/Omolu
   * Conexão: A intensidade transformadora de Escorpião ressoa com Odi (Renascimento/Caixão)
   * e Ossá (Vento/Mudança). Oxumaré senhor dos ciclos e da regeneração.
   */
  Escorpião: {
    signo: 'Escorpião',
    elemento: 'Água',
    odu_principal: {
      numero: 7,
      nome: 'Odi',
      significado: 'A teimosia, o renascimento, as coisas ocultas, o poço profundo.',
    },
    odus_secundarios: [
      { numero: 9, nome: 'Ossá', significado: 'O vento, as transformações rápidas.' },
      { numero: 14, nome: 'Iká', significado: 'A traição, a cobra que morde, a sabedoria oculta.' },
    ],
    conexao_elemental: 'A água profunda de Escorpião conecta-se ao poço de Odi e à transformação veloz de Ossá. A intensidade emocional é o combustível da metamorfose espiritual.',
    significado_espiritual: 'Escorpião-Odi representa o escorpião que renasce de suas próprias cinzas. Este alinhamento ensina que a morte do ego antigo é necessária para a emergência do ser transformado. O poço profundo é onde ocultamos tesouros até termos coragem de trazê-los à luz.',
    orixa: 'Oxumaré',
    planeta_regente: 'Plutão',
    dia_sagrado: 'Terça-feira',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Transformação radical',
      'Mistérios ocultos',
      'Regeneração espiritual',
      'Profundidade emocional',
      'Poder de renascimento',
    ],
    orientacao_ritual: 'Ebós de transmutação com pipoca (Deburu) para Omolu, banhos de lama ou argila, defumações pesadas com resinas.',
  },

  /**
   * SAGITÁRIO - Fogo/Mutable/Yang
   * Regente: Júpiter | Orixá: Oxóssi/Iansã
   * Conexão: A expansão filosófica de Sagitário ressoa com Oxé (Ouro/Feitiçaria) e Obará (Fartura/Luz).
   * Oxóssi senhor da caça e da sabedoria infinita.
   */
  Sagitário: {
    signo: 'Sagitário',
    elemento: 'Fogo',
    odu_principal: {
      numero: 5,
      nome: 'Oxé',
      significado: 'O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual.',
    },
    odus_secundarios: [
      { numero: 6, nome: 'Obará', significado: 'A riqueza, a fartura, a sabedoria.' },
      { numero: 4, nome: 'Irosun', significado: 'O aviso, a visão espiritual.' },
    ],
    conexao_elemental: 'O fogo expansivo de Sagitário conecta-se ao ouro de Oxé e à fartura de Obará. A busca pelo conhecimento é a maior riqueza que se pode acumular.',
    significado_espiritual: 'Sagitário-Oxé representa o arqueiro que dispara flechas de luz em direção à verdade suprema. Este alinhamento ensina que a expansão da consciência é o verdadeiro ouro espiritual - cada nova compreensão ilumina mais um aspecto do caminho do destino.',
    orixa: 'Oxóssi',
    planeta_regente: 'Júpiter',
    dia_sagrado: 'Quinta-feira',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Busca por conhecimento',
      'Expansão da consciência',
      'Filosofia e sabedoria',
      'Aventura espiritual',
      'Ouro interior',
    ],
    orientacao_ritual: 'Ebós de atração/ouro com banhos de mel, caldas de frutas, oferendas com girassóis e moedas douradas em águas doces.',
  },

  /**
   * CAPRICÓRNIO - Terra/Cardinal/Yin
   * Regente: Saturno | Orixá: Omolu/Nanã
   * Conexão: A ambição disciplinada de Capricórnio ressoa com Okaran (Destino/Estrutura)
   * e Olobón (Doença/Transformação). Omolu senhor da doença e da cura.
   */
  Capricórnio: {
    signo: 'Capricórnio',
    elemento: 'Terra',
    odu_principal: {
      numero: 1,
      nome: 'Okaran',
      significado: 'O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.',
    },
    odus_secundarios: [
      { numero: 13, nome: 'Olobón', significado: 'A doença, as transformações físicas, o fim de ciclos.' },
      { numero: 3, nome: 'Etaogundá', significado: 'A revolta, a força física.' },
    ],
    conexao_elemental: 'A terra estruturada de Capricórnio conecta-se ao destino de Okaran e à evolução de Olobón. A disciplina é o instrumento que transforma a matéria-prima em estrutura duradoura.',
    significado_espiritual: 'Capricórnio-Okaran representa o cabra que escala a montanha da riuscita através do esforço constante. Este alinhamento ensina que não existem atalhos para a大师 - cada degrau deve ser conquistado, cada prova superada, e a verdadeira riqueza está no conhecimento adquirido pelo caminho.',
    orixa: 'Omolu',
    planeta_regente: 'Saturno',
    dia_sagrado: 'Segunda-feira',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Disciplina e estrutura',
      'Responsabilidade e dever',
      'Ambição e perseverança',
      'Sabedoria da experiência',
      'Estrutura kármica',
    ],
    orientacao_ritual: 'Ebós de caminho/limpeza com despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos.',
  },

  /**
   * AQUÁRIO - Ar/Fixed/Yang
   * Regente: Urano | Orixá: Nanã/Oxum
   * Conexão: O idealismo humanitário de Aquário ressoa com Ofun (Mistério/Luz) e Ossá (Vento/Liberação).
   * Nanã senyora de la sabiduría antigua y la paciencia.
   */
  Aquário: {
    signo: 'Aquário',
    elemento: 'Ar',
    odu_principal: {
      numero: 10,
      nome: 'Ofun',
      significado: 'O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação.',
    },
    odus_secundarios: [
      { numero: 9, nome: 'Ossá', significado: 'O vento, as transformações rápidas.' },
      { numero: 16, nome: 'Alafia', significado: 'A paz absoluta, a luz total.' },
    ],
    conexao_elemental: 'O ar revolucionário de Aquário conecta-se à sabedoria antiga de Ofun e à transformação veloz de Ossá. A originalidade é o sopro divino que traz novas eras.',
    significado_espiritual: 'Aquário-Ofun representa o Água cósmica que derrama luz sobre a humanidade. Este alinhamento ensina que a verdadeira iluminação não é para poucos - quando alcançamos a sabedoria, nossa responsabilidade é compartilhá-la para libertar todos.',
    orixa: 'Nanã',
    planeta_regente: 'Urano',
    dia_sagrado: 'Sábado',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    associacoes_espirituais: [
      'Iluminação collective',
      'Originalidade e progresso',
      'Libertação e innovación',
      'Humanitarismo espiritual',
      'Conexão com o divino',
    ],
    orientacao_ritual: 'Ebós de limpeza astral com sacudimentos com folhas de fumo ou pinhão roxo, oferendas de acarajé para Iansã no vento.',
  },

  /**
   * PEIXES - Água/Mutable/Yin
   * Regente: Neptuno | Orixá: Iemanjá/Oxum
   * Conexão: A compaixão universal de Peixes ressoa com Ossá (Vento/Transformação)
   * e Ofun (Mistério/Luz). Iemanjá mãe das águas eternas e da unidade transcendental.
   */
  Peixes: {
    signo: 'Peixes',
    elemento: 'Água',
    odu_principal: {
      numero: 9,
      nome: 'Ossá',
      significado: 'O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais).',
    },
    odus_secundarios: [
      { numero: 10, nome: 'Ofun', significado: 'O mistério, a velhice, a cura.' },
      { numero: 16, nome: 'Alafia', significado: 'A paz absoluta, a luz total.' },
    ],
    conexao_elemental: 'A água transcendente de Peixes conecta-se à transformação veloz de Ossá e à luz sábia de Ofun. A dissolução dos limites é a porta para a unidade com o todo.',
    significado_espiritual: 'Peixes-Ossá representa os peces que nadan em águas transcendentes, dissolvendo os límites del ego. Este alinhamento ensina que a verdadeira compasión viene de saber que somos parte de un océano mayor - al conectar con la源头 divina, absorbemos la capacidad de sanar a través de la absorción y la transformación.',
    orixa: 'Iemanjá',
    planeta_regente: 'Neptuno',
    dia_sagrado: 'Sábado',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    associacoes_espirituais: [
      'Unidade com o divino',
      'Compasión universal',
      'Intuição transcendental',
      'Sons e sensibilidade',
      'Transformação suave',
    ],
    orientacao_ritual: 'Ebós de limpeza astral com Sacudimentos com folhas de fumo, oferendas na beira-mar para Iemanjá, banhos de colônia e alfazema.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(ZODIAC_ODU_MAPPINGS);
Object.values(ZODIAC_ODU_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the zodiac-to-Odú Ifá correlation mapping for a given sign.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro', ...)
 * @returns The correlation mapping or null if not found
 */
export function getZodiacOdu(signo: string): ZodiacOduMapping | null {
  return ZODIAC_ODU_MAPPINGS[signo as Signo] ?? null;
}

/**
 * Get the Odú Ifá-to-zodiac reverse mapping.
 * @param oduNome - Odu name (e.g., 'Etaogundá', 'Obará', ...)
 * @returns The zodiac sign or null if not found
 */
export function getOduZodiac(oduNome: string): Signo | null {
  for (const [signo, mapping] of Object.entries(ZODIAC_ODU_MAPPINGS)) {
    if (
      mapping.odu_principal.nome === oduNome ||
      mapping.odus_secundarios.some(o => o.nome === oduNome)
    ) {
      return signo as Signo;
    }
  }
  return null;
}

/**
 * Get all zodiac-Odú Ifá mappings.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacOdus(): ZodiacOduMapping[] {
  return Object.values(ZODIAC_ODU_MAPPINGS);
}

/**
 * Get the primary Odu for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns The primary Odu info or null if sign not found
 */
export function getSignoOduPrincipal(signo: string): OduInfo | null {
  return getZodiacOdu(signo)?.odu_principal ?? null;
}

/**
 * Get all secondary Odus for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns Array of secondary Odu info or null if sign not found
 */
export function getSignoOdusSecundarios(signo: string): OduInfo[] | null {
  return getZodiacOdu(signo)?.odus_secundarios ?? null;
}

/**
 * Get the Orixá correspondent for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns The Orixá name or null if sign not found
 */
export function getSignoOrixa(signo: string): string | null {
  return getZodiacOdu(signo)?.orixa ?? null;
}

/**
 * Get all zodiac signs by element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of zodiac signs belonging to that element
 */
export function getSignosByElement(elemento: string): Signo[] {
  return getAllZodiacOdus()
    .filter(m => m.elemento === elemento)
    .map(m => m.signo);
}

/**
 * Get the spiritual meaning for a zodiac sign.
 * @param signo - Zodiac sign name
 * @returns The spiritual meaning or null if sign not found
 */
export function getZodiacOduSignificado(signo: string): string | null {
  return getZodiacOdu(signo)?.significado_espiritual ?? null;
}

/**
 * Check if a zodiac sign has a specific Odu.
 * @param signo - Zodiac sign name
 * @param oduNome - Odu name to check
 * @returns True if the sign has the specified Odu
 */
export function hasSignoOdu(signo: string, oduNome: string): boolean {
  const mapping = getZodiacOdu(signo);
  if (!mapping) return false;
  return (
    mapping.odu_principal.nome === oduNome ||
    mapping.odus_secundarios.some(o => o.nome === oduNome)
  );
}
