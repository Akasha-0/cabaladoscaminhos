/**
 * Odú Ifá-to-Zodiac Correlation Mapping
 * Based on IDEIA.md Cabala dos Caminhos spiritual system
 * Maps each Odu Ifá (Merindilogun) to its corresponding zodiac sign with spiritual practices
 */

import type { Signo } from './zodiac-signo';
import type { Elemento } from './element-odu';

/** Zodiac sign information */
export interface ZodiacInfo {
  signo: Signo;
  elemento: Elemento;
  planeta_regente: string;
}

/** Complete Odu-to-zodiac correlation mapping */
export interface OduZodiacMapping {
  /** Odu Ifá name */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** Associated zodiac sign */
  signo: ZodiacInfo;
  /** Connection description */
  conexao_espiritual: string;
  /** Spiritual meaning of the correlation */
  significado_espiritual: string;
  /** Orixá correspondent */
  orixa: string;
  /** Elemental qualities */
  qualidades: {
    temperatura: 'Quente' | 'Frio' | 'Neutro';
    umidade: 'Seco' | 'Úmido';
    polaridade: 'Yang' | 'Yin';
  };
  /** Spiritual practices for this Odu-Zodiac alignment */
  praticas_espirituais: SpiritualPractice[];
  /** Ritual guidance */
  orientacao_ritual: string;
  /** Elemental alignment statement */
  alinhamento_elemental: string;
}

/** Spiritual practice definition */
export interface SpiritualPractice {
  tipo: 'ebo' | 'oracao' | 'ritual' | 'banho' | 'defumacao' | 'ofenda';
  descricao: string;
}

// ─── Odu Ifá-to-Zodiac Mapping ─────────────────────────────────────────────────

export const ODU_ZODIAC_MAPPINGS: Readonly<Record<string, OduZodiacMapping>> = {
  // ─── Okaran (1) - Destino/Início ──────────────────────────────────────────────
  Okaran: {
    odu: 'Okaran',
    numero: 1,
    signo: {
      signo: 'Capricórnio',
      elemento: 'Terra',
      planeta_regente: 'Saturno',
    },
    conexao_espiritual:
      'Okaran traz o peso do destino e a necessidade de estruturar caminhos. Capricórnio é o signo da ambição disciplinada que escala montanhas através do esforço constante.',
    significado_espiritual:
      'Okaran-Capricórnio representa o journey de estruturar o destino através da disciplina. O caminho difícil de Okaran encontra a ambição de Capricórnio - ambos ensinam que não existem atalhos para a mastersia. Cada degrau deve ser conquistado, cada prova superada.',
    orixa: 'Omolu',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    praticas_espirituais: [
      {
        tipo: 'ebo',
        descricao: 'Despachos em encruzilhadas com moedas, pipoca e panos escuros para abrir caminhos',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de estruturação de destino com orações de proteção contra obstáculos',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de descarrego com folhas amargas (artemísia, arruda) nas sextas-feiras',
      },
      {
        tipo: 'defumacao',
        descricao: 'Defumações com alecrim e unguento para purificação de caminhos bloqueados',
      },
    ],
    orientacao_ritual:
      'Realizar ebós de caminho nas encruzilhadas ao entardecer. Abrir trilhas com despachos simples: moedas para os guias, pipoca para os gatos, pano escuro para Omolu. Evitar conflitos desnecessários e manter disciplina no servir.',
    alinhamento_elemental: 'Terra-Fixo-Yin: Ancoragem kármica e estruturação do destino',
  },

  // ─── Ejiokô (2) - Dualidade/Caminhos ─────────────────────────────────────────
  Ejiokô: {
    odu: 'Ejiokô',
    numero: 2,
    signo: {
      signo: 'Gémeos',
      elemento: 'Ar',
      planeta_regente: 'Mercúrio',
    },
    conexao_espiritual:
      'Ejiokô representa a dualidade e os caminhos duplos que exigem escolha. Gémeos é o signo da comunicação e da versatilidade mental - ambos vibram na frequência da adaptação.',
    significado_espiritual:
      'Ejiokô-Gémeos representa a mente que navega entre possibilidades. A dualidade sagrada deste alinhamento ensina que cada escolha abre e fecha portas. A verdadeira sabedoria está em entender que ambos os caminhos levam a experiências necessárias para a evolução da consciência.',
    orixa: 'Oxumaré',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    praticas_espirituais: [
      {
        tipo: 'oracao',
        descricao: 'Orações para clareza mental antes de decisões importantes',
      },
      {
        tipo: 'ofenda',
        descricao: 'Oferendas de doces e frutas para Oxumaré nas encruzilhadas de caminhos',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de escolha com velas amarelas acesas aos pares (representando dualidade)',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de limpeza mental com folhas de hortelã e alecrim',
      },
    ],
    orientacao_ritual:
      'Acender duas velas amarelas em paralelo para Ejiokô. Oferecer doces na encruzilhada antes de decisões. Realizar banhos de clareza mental com hortelã antes de escolhas importantes.',
    alinhamento_elemental: 'Ar-Mutable-Yang: Comunicação e adaptação mental',
  },

  // ─── Etaogundá (3) - Força/Corte ─────────────────────────────────────────────
  Etaogundá: {
    odu: 'Etaogundá',
    numero: 3,
    signo: {
      signo: 'Áries',
      elemento: 'Fogo',
      planeta_regente: 'Marte',
    },
    conexao_espiritual:
      'Etaogundá traz a energia cortante da força física e da criação de ferramentas. Áries é o signo da coragem iniciática - ambos representam o guerreiro que corta para construir.',
    significado_espiritual:
      'Etaogundá-Áries representa o guerreiro cósmico que corta para construir. A força vital manifesta-se na capacidade de iniciar novos caminhos com coragem e determinação. Este alinhamento ensina que a verdadeira liderança começa quando temos a audácia de dar o primeiro passo.',
    orixa: 'Ogum',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    praticas_espirituais: [
      {
        tipo: 'ebo',
        descricao: 'Ebós de defesa com inhames assados e paliteiros de Ogum',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de proteção e limpeza com folhas de mariô e espada de São Jorge',
      },
      {
        tipo: 'defumacao',
        descricao: 'Defumações de proteção com alecrim e páprica em dias de conflito',
      },
      {
        tipo: 'oracao',
        descricao: 'Orações de guerra justa para superar obstáculos e inimigos ocultos',
      },
    ],
    orientacao_ritual:
      'Firmar protección com paliteiros e facas ritualizadas. Fazer ebós de defesa nas terças-feiras. Evitar violência verbal e uso desnecessário de objetos cortantes. Carregar pedaço de ferro ou meteoro para proteção.',
    alinhamento_elemental: 'Fogo-Cardinal-Yang: Força iniciática e coragem',
  },

  // ─── Irosun (4) - Aviso/Visão ─────────────────────────────────────────────────
  Irosun: {
    odu: 'Irosun',
    numero: 4,
    signo: {
      signo: 'Câncer',
      elemento: 'Água',
      planeta_regente: 'Lua',
    },
    conexao_espiritual:
      'Irosun traz avisos e visão espiritual através do sangue que corre nas veias. Câncer é o signo da emocionalidade profunda e da memória ancestral - ambos funcionam como radar espiritual.',
    significado_espiritual:
      'Irosun-Câncer representa a mãe cósmica que guarda a memória ancestral. Este alinhamento ensina que a sensibilidade às ondas emocionais é um dom espiritual - a capacidade de intuir perigos e oportunidades antes que se materializem no mundo concreto.',
    orixa: 'Iemanjá',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    praticas_espirituais: [
      {
        tipo: 'ofenda',
        descricao: 'Oferendas na beira-mar para Iemanjá: canjica, arroz-doce, flores brancas',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de limpeza com folhas frias (colônia, saião, boldo)',
      },
      {
        tipo: 'ebo',
        descricao: 'Ebós de proteção com alimentos brancos e velas azuis',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de visão espiritual com espelho d\'água ao luar',
      },
    ],
    orientacao_ritual:
      'Fazer oferendas na beira-mar aos sábados. Manter velas azuis acesas em noites de lua cheia. Banhar-se com folhas de colônia nas segundas e quintas-feiras. Evitar brigas domésticas e manter o lar em paz.',
    alinhamento_elemental: 'Água-Cardinal-Yin: Intuição e memória ancestral',
  },

  // ─── Oxé (5) - Ouro/Feitiçaria ────────────────────────────────────────────────
  Oxé: {
    odu: 'Oxé',
    numero: 5,
    signo: {
      signo: 'Sagitário',
      elemento: 'Fogo',
      planeta_regente: 'Júpiter',
    },
    conexao_espiritual:
      'Oxé traz o ouro, a doçura e a feitiçaria que atrai prosperidade. Sagitário é o signo da expansão filosófica e da busca pela verdade - ambos valorizam o conhecimento como maior riqueza.',
    significado_espiritual:
      'Oxé-Sagitário representa o arqueiro que dispara flechas de luz em direção à verdade suprema. Este alinhamento ensina que a expansão da consciência é o verdadeiro ouro espiritual - cada nova compreensão ilumina mais um aspecto do caminho do destino.',
    orixa: 'Oxóssi',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    praticas_espirituais: [
      {
        tipo: 'ofenda',
        descricao: 'Oferendas de ouro e moedas douradas em águas doces (rios, nascentes)',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de prosperidade com mel, caldas de frutas e flores amarelas',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de atração de riqueza com girassóis e moedas antigas',
      },
      {
        tipo: 'ebo',
        descricao: 'Ebós de douramento pessoal com amalá e alimentos dourados',
      },
    ],
    orientacao_ritual:
      'Realizar ebós de atração/ouro nas quintas-feiras. Banhar-se com mel e caldas de frutas antes de empreendimentos importantes. Oferecer girassóis e moedas em águas correntes. Manter altar iluminado com velas douradas.',
    alinhamento_elemental: 'Fogo-Mutable-Yang: Expansão e prosperidade espiritual',
  },

  // ─── Obará (6) - Riqueza/Brilho ───────────────────────────────────────────────
  Obará: {
    odu: 'Obará',
    numero: 6,
    signo: {
      signo: 'Leão',
      elemento: 'Fogo',
      planeta_regente: 'Sol',
    },
    conexao_espiritual:
      'Obará confere brilho pessoal e prosperidade através da energia solar. Leão é o signo do brilho real e da liderança generosa - ambos irradiam luz que transforma a matéria em ouro.',
    significado_espiritual:
      'Obará-Leão representa o rei solar que governa com generosidade e justiça. Este alinhamento ensina que o verdadeiro poder não está em acumular, mas em irradiar - brilho pessoal que ilumina caminhos e atrai prosperidade para toda a comunidade.',
    orixa: 'Xangô',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    praticas_espirituais: [
      {
        tipo: 'ofenda',
        descricao: 'Amalá (miudezas de galinha) para Xangô nas quartas-feiras',
      },
      {
        tipo: 'ebo',
        descricao: 'Ebós de fartura com seis tipos de frutas e banquetes partilhados',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de brilho real com velas douradas acesas ao meio-dia',
      },
      {
        tipo: 'defumacao',
        descricao: 'Defumações com incenso de alecrim e benjoim para fortalecer o carisma',
      },
    ],
    orientacao_ritual:
      'Fazer amalá para Xangô nas quartas e domingos. Acender velas douradas ao meio-dia para fortalecer o brilho. Partilhar banquetes com os menos favorecidos. Firmar-se com pedras de raio (quartzo fumê, meteorito).',
    alinhamento_elemental: 'Fogo-Fixo-Yang: Brilho real e prosperidade irradiante',
  },

  // ─── Odi (7) - Renascimento/Oculto ───────────────────────────────────────────
  Odi: {
    odu: 'Odi',
    numero: 7,
    signo: {
      signo: 'Escorpião',
      elemento: 'Água',
      planeta_regente: 'Plutão',
    },
    conexao_espiritual:
      'Odi traz o renascimento e o acesso a coisas ocultas através do poço profundo. Escorpião é o signo da transformação radical e da intensidade emocional - ambos passam pela morte do ego para renascer.',
    significado_espiritual:
      'Odi-Escorpião representa o escorpião que renasce de suas próprias cinzas. Este alinhamento ensina que a morte do ego antigo é necessária para a emergência do ser transformado. O poço profundo é onde ocultamos tesouros até termos coragem de trazê-los à luz.',
    orixa: 'Oxumaré',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    praticas_espirituais: [
      {
        tipo: 'ebo',
        descricao: 'Ebós de transmutação com pipoca (Deburu) para Omolu nas encruzilhadas',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de lama ou argila para renascimento espiritual e limpeza de camadas densas',
      },
      {
        tipo: 'defumacao',
        descricao: 'Defumações pesadas com resinas (mirra, benjoim) para acessar o oculto',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de regeneração e transformação sob lua cheia',
      },
    ],
    orientacao_ritual:
      'Realizar ebós de purificação nas encruzilhadas com pipoca para Omolu. Banhar-se com lama ou argila nos períodos de transformação. Defumar com resinas pesadas para acessar mistérios ocultos. Aceitar o processo de morte e renascimento como necessário.',
    alinhamento_elemental: 'Água-Fixo-Yin: Transformação radical e mistérios ocultos',
  },

  // ─── EjiOníle (8) - Liderança/Cabeça ─────────────────────────────────────────
  EjiOníle: {
    odu: 'EjiOníle',
    numero: 8,
    signo: {
      signo: 'Libra',
      elemento: 'Ar',
      planeta_regente: 'Vénus',
    },
    conexao_espiritual:
      'EjiOníle traz a liderança da cabeça (Ori) e o sangue branco da elevação. Libra é o signo do equilíbrio harmonioso - ambos buscam a justiça e a harmonia entre opostos.',
    significado_espiritual:
      'EjiOníle-Libra representa a balança cósmica que busca a harmonia perfeita. Este alinhamento ensina que a justiça verdadeira vem da cabeça fria - a capacidade de ver todas as perspectivas sem perder o próprio centro de luz interior.',
    orixa: 'Oxalá',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Úmido',
      polaridade: 'Yang',
    },
    praticas_espirituais: [
      {
        tipo: 'ebo',
        descricao: 'Ebós de alinhamento (Bori) com canjica branca e algodão',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de tapete de Oxalá com boldo e água deionizada',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de alinhamento da cabeça (Ori) com velas brancas e purificação',
      },
      {
        tipo: 'ofenda',
        descricao: 'Oferendas de alimentos brancos e puros: arroz branco, canjica, inhame branco',
      },
    ],
    orientacao_ritual:
      'Fazer Bori (alinhamento de cabeça) periodicamente. Acender velas brancas nas sextas-feiras. Manter o pensamento limpo e harmonioso. Evitar conflitos desnecessários e buscar equilíbrio em todas as situações.',
    alinhamento_elemental: 'Ar-Cardinal-Yang: Equilíbrio e liderançaharmoniosa',
  },

  // ─── Ossá (9) - Vento/Transformação ──────────────────────────────────────────
  Ossá: {
    odu: 'Ossá',
    numero: 9,
    signo: {
      signo: 'Peixes',
      elemento: 'Água',
      planeta_regente: 'Neptuno',
    },
    conexao_espiritual:
      'Ossá traz o vento e as transformações rápidas, o reino das Iyami (bruxas ancestrais). Peixes é o signo da compaixão universal e da dissolução dos limites - ambos trabalham com a energia transformadora.',
    significado_espiritual:
      'Ossá-Peixes representa os peixes que nadam em águas transcendentes, dissolvendo os limites do ego. Este alinhamento ensina que a verdadeira compaixão vem de saber que somos parte de um oceano maior - ao conectar com a fonte divina, absorvemos a capacidade de sanar através da absorção e transformação.',
    orixa: 'Iansã',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    praticas_espirituais: [
      {
        tipo: 'defumacao',
        descricao: 'Sacudimentos com folhas de fumo e pinhão roxo para transformação rápida',
      },
      {
        tipo: 'ofenda',
        descricao: 'Oferendas de acarajé para Iansã ao vento nas sextas-feiras',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de libertação e transformação realizados ao ar livre',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de transformação com folhas de fumo e alecrim',
      },
    ],
    orientacao_ritual:
      'Realizar sacudimentos ao vento com folhas de fumo para Ossá. Oferecer acarajé ao vento nas sextas-feiras. Fazer banhos de limpeza com folhas de fumo e alecrim. Aceitar mudanças rápidas como necessárias para evolução.',
    alinhamento_elemental: 'Água-Mutable-Yin: Transformação transcendental e libertação',
  },

  // ─── Ofun (10) - Mistério/Cura ───────────────────────────────────────────────
  Ofun: {
    odu: 'Ofun',
    numero: 10,
    signo: {
      signo: 'Virgem',
      elemento: 'Terra',
      planeta_regente: 'Mercúrio',
    },
    conexao_espiritual:
      'Ofun traz o mistério, a velhice e a cura através do sopro divino. Virgem é o signo do discernimento analítico e do serviço sagrado - ambos trabalham com a sabedoria dos detalhes.',
    significado_espiritual:
      'Ofun-Virgem representa a servidora sagrada que encontra a perfeição através do serviço discreto. Este alinhamento ensina que a verdadeira mastersia está no detalhe - a capacidade de perceber o que outros perdem e cuidar com precisão cirúrgica e coração compassivo.',
    orixa: 'Oxóssi',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    praticas_espirituais: [
      {
        tipo: 'ebo',
        descricao: 'Ebós de saúde com frutas brancas e alimentos puros',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de leite de cabra e alfazema para purificação e cura',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de cura com imposição de mãos e orações de proteção',
      },
      {
        tipo: 'oracao',
        descricao: 'Orações mansas para cura de doenças e proteção de idosos',
      },
    ],
    orientacao_ritual:
      'Fazer ebós de saúde nas quintas-feiras. Banhar-se com leite de cabra e alfazema periodicamente. Vestir-se de branco e manter a quietude interior. Cuidar dos detalhes e manter a organização espiritual.',
    alinhamento_elemental: 'Terra-Mutable-Yin: Sabedoria curativa e serviço sagrado',
  },

  // ─── Ejilsebora (12) - Justiça/Fogo ──────────────────────────────────────────
  Ejilsebora: {
    odu: 'Ejilsebora',
    numero: 12,
    signo: {
      signo: 'Áries',
      elemento: 'Fogo',
      planeta_regente: 'Marte',
    },
    conexao_espiritual:
      'Ejilsebora traz a justiça e o fogo purificador da guerra justa. Áries é o signo da coragem iniciática - ambos representam a força transformadora que corta o que está podre para construir o novo.',
    significado_espiritual:
      'Ejilsebora-Áries representa o guerreiro cósmico que limpa com fogo o que precisa ser transformado. A energia purificadora deste alinhamento ensina que a justiça verdadeira exige coragem - a disposição de cortar para construir, de purificar para proteger.',
    orixa: 'Xangô',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    praticas_espirituais: [
      {
        tipo: 'ebo',
        descricao: 'Firmezas com pedras de raio (meteoritos, quartzo marrom) para proteção',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de fogo e purificação realizados ao entardecer',
      },
      {
        tipo: 'defumacao',
        descricao: 'Defumações com alecrim e lavanda para limpeza de energias densas',
      },
      {
        tipo: 'oracao',
        descricao: 'Orações de guerra justa e proteção contra injustiças',
      },
    ],
    orientacao_ritual:
      'Firmar proteção com pedras de raio e quartzo marrom. Realizar rituais de fogo nas terças e domingos. Defumar o ambiente com alecrim quando sentir energias pesadas. Agir com justiça mas sem vingança.',
    alinhamento_elemental: 'Fogo-Ígneo-Yang: Purificação e guerra justa',
  },

  // ─── Olobón (13) - Doença/Transformação ──────────────────────────────────────
  Olobón: {
    odu: 'Olobón',
    numero: 13,
    signo: {
      signo: 'Capricórnio',
      elemento: 'Terra',
      planeta_regente: 'Saturno',
    },
    conexao_espiritual:
      'Olobón traz a doença e as transformações físicas que marcam o fim de ciclos. Capricórnio é o signo da disciplina e da estrutura - ambos atravessam provas difficultes para alcançar a evolução.',
    significado_espiritual:
      'Olobón-Capricórnio representa o processo de doença que transforma para evoluir. Este alinhamento ensina que as dificuldades físicas não são castigo, mas oportunidade de crescimento - cada prova superada fortalece a estrutura espiritual.',
    orixa: 'Omolu',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    praticas_espirituais: [
      {
        tipo: 'ebo',
        descricao: 'Ebós de limpeza de doença com pipoca, moedas de cobre e panos escuros',
      },
      {
        tipo: 'ofenda',
        descricao: 'Oferendas para Omolu nas encruzilhadas: pipoca, dendê, Alecrim',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de cura de doenças crônicas realizados com paciência e fé',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de limpeza com folhas amargas e sales de banho',
      },
    ],
    orientacao_ritual:
      'Realizar ebós de descarrego nas encruzilhadas para Olobón. Oferecer pipoca e Alecrim para Omolu nas segundas-feiras. Aceitar penyakit sebagai processo de evolução. Manter disciplina espiritual durante recuperação.',
    alinhamento_elemental: 'Terra-Estrutural-Yin: Transformação física e estruturação kármica',
  },

  // ─── Iká (14) - Traição/Cobra ─────────────────────────────────────────────────
  Iká: {
    odu: 'Iká',
    numero: 14,
    signo: {
      signo: 'Escorpião',
      elemento: 'Água',
      planeta_regente: 'Plutão',
    },
    conexao_espiritual:
      'Iká traz a traição e a sabedoria oculta da cobra que morde. Escorpião é o signo da transformação radical e dos mistérios profundos - ambos trabalham com energias que despertam o poder.',
    significado_espiritual:
      'Iká-Escorpião representa o escorpião que guarda sabedoria oculta em seu veneno. Este alinhamento ensina que a traição, mesmo dolorosa, pode despertar poderes dormentes - a cobra que morde também pode curar com antídoto.',
    orixa: 'Oxumaré',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    praticas_espirituais: [
      {
        tipo: 'ritual',
        descricao: 'Rituais de proteção contra traições com velas pretas e defumações',
      },
      {
        tipo: 'defumacao',
        descricao: 'Defumações com resina de quebra-demônio e arruda para proteção',
      },
      {
        tipo: 'ebo',
        descricao: 'Ebós de proteção contra inimigos ocultos e energias de traição',
      },
      {
        tipo: 'oracao',
        descricao: 'Orações de proteção contra picadas de cobras espirituais',
      },
    ],
    orientacao_ritual:
      'Realizar ebós de proteção nas encruzilhadas com velas pretas. Defumar com quebra-demônio e arruda quando sentir presenças hostis. Evitar confiar em todos rapidamente. Manter vigilância espiritual constante.',
    alinhamento_elemental: 'Água-Regenerativa-Yin: Proteção e sabedoria oculta',
  },

  // ─── Alafia (16) - Paz/Luz ───────────────────────────────────────────────────
  Alafia: {
    odu: 'Alafia',
    numero: 16,
    signo: {
      signo: 'Aquário',
      elemento: 'Ar',
      planeta_regente: 'Urano',
    },
    conexao_espiritual:
      'Alafia traz a paz absoluta, a luz total e a confirmação dos Deuses. Aquário é o signo do idealismo humanitário e da iluminação coletiva - ambos irradiam luz para libertar a humanidade.',
    significado_espiritual:
      'Alafia-Aquário representa o Água cósmico que derrama luz sobre a humanidade. Este alinhamento ensina que a verdadeira iluminação não é para poucos - quando alcançamos a sabedoria, nossa responsabilidade é compartilhá-la para libertar todos.',
    orixa: 'Nanã',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    praticas_espirituais: [
      {
        tipo: 'ofenda',
        descricao: 'Oferendas de luz: velas brancas, incenso puro, águas claras',
      },
      {
        tipo: 'ritual',
        descricao: 'Rituais de paz e harmonia realizados em grupos para iluminação collective',
      },
      {
        tipo: 'banho',
        descricao: 'Banhos de luz com água de flor de laranjeira e alfazema',
      },
      {
        tipo: 'oracao',
        descricao: 'Orações coletivas pela paz mundial e iluminação da humanidade',
      },
    ],
    orientacao_ritual:
      'Acender velas brancas para Alafia em todas as sextas. Realizar orações coletivas pela paz. Banhar-se com água de flor de laranjeira para proteção. Trabalhar pelo bem-estar da humanidade com ações concretas.',
    alinhamento_elemental: 'Ar-Iluminação-Yang: Paz absoluta e iluminação coletiva',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(ODU_ZODIAC_MAPPINGS);
Object.values(ODU_ZODIAC_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Odu-to-zodiac correlation mapping for a given Odu.
 * @param odu - Odu name (e.g., 'Etaogundá', 'Obará', ...)
 * @returns The correlation mapping or null if not found
 */
export function getOduZodiac(odu: string): OduZodiacMapping | null {
  return ODU_ZODIAC_MAPPINGS[odu] ?? null;
}

/**
 * Get the zodiac sign for a given Odu.
 * @param odu - Odu name (e.g., 'Etaogundá', 'Obará', ...)
 * @returns The zodiac sign or null if not found
 */
export function getZodiacOdu(odu: string): Signo | null {
  return ODU_ZODIAC_MAPPINGS[odu]?.signo.signo ?? null;
}

/**
 * Get all Odu-zodiac mappings.
 * @returns Array of all correlation mappings
 */
export function getAllOduZodiacs(): OduZodiacMapping[] {
  return Object.values(ODU_ZODIAC_MAPPINGS);
}

/**
 * Get the element of a given Odu.
 * @param odu - Odu name
 * @returns The element or null if not found
 */
export function getOduZodiacElemento(odu: string): Elemento | null {
  return ODU_ZODIAC_MAPPINGS[odu]?.signo.elemento ?? null;
}

/**
 * Get the planet ruler of a given Odu.
 * @param odu - Odu name
 * @returns The planet or null if not found
 */
export function getOduZodiacPlaneta(odu: string): string | null {
  return ODU_ZODIAC_MAPPINGS[odu]?.signo.planeta_regente ?? null;
}

/**
 * Get all Odus for a specific zodiac sign.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro', ...)
 * @returns Array of Odu mappings for that sign
 */
export function getSignoOdus(signo: string): OduZodiacMapping[] {
  return getAllOduZodiacs().filter(m => m.signo.signo === signo);
}

/**
 * Get all Odus for a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of Odu mappings for that element
 */
export function getElementOduZodiac(elemento: string): OduZodiacMapping[] {
  return getAllOduZodiacs().filter(m => m.signo.elemento === elemento);
}

/**
 * Get the spiritual meaning for an Odu.
 * @param odu - Odu name
 * @returns The spiritual meaning or null if not found
 */
export function getOduZodiacSignificado(odu: string): string | null {
  return ODU_ZODIAC_MAPPINGS[odu]?.significado_espiritual ?? null;
}

/**
 * Get all Odu names.
 * @returns Array of Odu names (sorted by number)
 */
export function getAllOduZodiacNames(): string[] {
  return getAllOduZodiacs()
    .sort((a, b) => a.numero - b.numero)
    .map(m => m.odu);
}

/**
 * Check if an Odu exists in the mapping.
 * @param odu - Odu name to check
 * @returns True if Odu exists in mapping
 */
export function hasOduZodiac(odu: string): boolean {
  return odu in ODU_ZODIAC_MAPPINGS;
}

/**
 * Get the Orixá for an Odu.
 * @param odu - Odu name
 * @returns The Orixá name or null if not found
 */
export function getOduZodiacOrixa(odu: string): string | null {
  return ODU_ZODIAC_MAPPINGS[odu]?.orixa ?? null;
}

/**
 * Get the ritual guidance for an Odu.
 * @param odu - Odu name
 * @returns The ritual guidance or null if not found
 */
export function getOduZodiacRitual(odu: string): string | null {
  return ODU_ZODIAC_MAPPINGS[odu]?.orientacao_ritual ?? null;
}

/**
 * Get all spiritual practices for an Odu.
 * @param odu - Odu name
 * @returns Array of spiritual practices or null if not found
 */
export function getOduZodiacPraticas(odu: string): SpiritualPractice[] | null {
  return ODU_ZODIAC_MAPPINGS[odu]?.praticas_espirituais ?? null;
}

export default {
  getOduZodiac,
  getZodiacOdu,
  getAllOduZodiacs,
  getOduZodiacElemento,
  getOduZodiacPlaneta,
  getSignoOdus,
  getElementOduZodiac,
  getOduZodiacSignificado,
  getAllOduZodiacNames,
  hasOduZodiac,
  getOduZodiacOrixa,
  getOduZodiacRitual,
  getOduZodiacPraticas,
};