// @ts-nocheck
// SKIP_LINT

/**
 * Numerologia Data Module
 * Spiritual and esoteric numerological data for the Cabala dos Caminhos system
 */

export interface NumerologiaData {
  id: string;
  numero: number;
  nome: string;
  nomeIngles: string;
  planeta: string;
  sefira: string;
  arco: string;
  elemento: string;
  Qualidade: string;
  significado: string;
  forca: string;
  desafio: string;
  cor: string;
  pedra: string;
  palavraChave: string[];
  affirmation: string;
  compatibilidad: number[];
  ciclos: {
    ciclo: string;
    descricao: string;
  };
  caminhoVida: {
    descricao: string;
    caracteristicas: string[];
    missoes: string[];
    liçoes: string[];
  };
  anoPessoal: {
    descricao: string;
    focus: string[];
  };
  mesPessoal: {
    descricao: string;
    energia: string[];
  };
  diaPessoal: {
    descricao: string;
    lição: string;
  };
}

const NUMEROLOGIA_DATA: NumerologiaData[] = [
  {
    id: 'num-1',
    numero: 1,
    nome: 'Um',
    nomeIngles: 'One',
    planeta: 'Sol',
    sefira: 'Kether',
    arco: 'Arcanjo Michael',
    elemento: 'Fogo',
    Qualidade: 'Liderança',
    significado: 'Iniciativa, individualidade, independência, originalidade, pioneirismo. O número 1 representa o princípio masculino, a força criadora e o início de todos os journeys.',
    forca: 'Determinação, confiança, ambição, pioneirismo, autonomia, força de vontade',
    desafio: 'Egoísmo, arrogância, impaciência, isolamento, dominância excessiva',
    cor: 'Dourado',
    pedra: 'Âmbar',
    palavraChave: ['Liderança', 'Iniciativa', 'Independência', 'Originalidade', 'Assertividade'],
    affirmation: 'Eu sou a luz que guia meu próprio caminho. Minha força interior me move para frente.',
    compatibilidad: [2, 4, 6, 8],
    ciclos: {
      ciclo: 'Ciclo de Manifestação',
      descricao: 'Período de novos começos e estabelecimento de objetivos. Momento propício para iniciar projetos e tomar decisões importantes.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver liderança, independência e originalidade. Sua missão é ser pioneiro em sua área de escolha.',
      caracteristicas: ['Ambição', 'Confiança', 'Criatividade', 'Determinação', 'Inovação'],
      missoes: ['Liderar com exemplo', 'Iniciar novos projetos', 'Desenvolver independência'],
      liçoes: ['Controlar o ego', 'Aprender a ouvir', 'Desenvolver paciência']
    },
    anoPessoal: {
      descricao: 'Ano de novos começos e oportunidades. É momento de tomar iniciativa e buscar independência em suas escolhas.',
      focus: ['Iniciativas pessoais', 'Carreira e negócios', 'Autoconfiança']
    },
    mesPessoal: {
      descricao: 'Mês para focar em metas pessoais e profissionais. Sua energia está alta para assumir liderança.',
      energia: ['Motivação', 'Ação', 'Determinação']
    },
    diaPessoal: {
      descricao: 'Dia propício para tomar decisões importantes e iniciar novos projetos.',
      lição: 'Confie em sua capacidade de criar seu próprio caminho.'
    }
  },
  {
    id: 'num-2',
    numero: 2,
    nome: 'Dois',
    nomeIngles: 'Two',
    planeta: 'Lua',
    sefira: 'Chokmah',
    arco: 'Arcanjo Gabriel',
    elemento: 'Água',
    Qualidade: 'Cooperação',
    significado: 'Parceria, dualidade, receptividade, equilíbrio, diplomacia, sensibilidade. O número 2 representa o princípio feminino, a cooperação e as parcerias.',
    forca: 'Diplomacia, empatia, paciência, intuição, cooperação, adaptabilidade, harmonicidade',
    desafio: 'Indecisão, subordinação excessiva, حساسية extrema, dependência, passividade',
    cor: 'Prata',
    pedra: 'Pérola',
    palavraChave: ['Parceria', 'Diplomacia', 'Equilíbrio', 'Sensibilidade', 'Receptividade'],
    affirmation: 'Eu abraço a harmonia em todas as minhas relações. Minha sensibilidade é minha força.',
    compatibilidad: [1, 3, 6, 9],
    ciclos: {
      ciclo: 'Ciclo de Parceria',
      descricao: 'Período de fortalecimento de relacionamentos e associações. Momento para nutrir conexões e buscar harmonia em parcerias.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver diplomacy, empatia e capacidade de trabalho em equipe. Sua missão é criar pontes entre pessoas.',
      caracteristicas: ['Intuição', 'Diplomacia', 'Sensibilidade', 'Paciência', 'Cooperação'],
      missoes: ['Fortalecer relacionamentos', 'Promover harmonia', 'Mediar conflitos'],
      liçoes: ['Estabelecer limites', 'Desenvolver autoafirmação', 'Evitar codependência']
    },
    anoPessoal: {
      descricao: 'Ano para fortalecer parcerias e relacionamentos. É momento de cooperate e encontrar equilíbrio em suas associações.',
      focus: ['Relacionamentos', 'Parcerias', 'Harmonia emocional']
    },
    mesPessoal: {
      descricao: 'Mês para focar em conexões interpessoais e trabalho em equipe.',
      energia: ['Cooperação', 'Empatia', 'Sensibilidade']
    },
    diaPessoal: {
      descricao: 'Dia propício para collaborations e nutrir relacionamentos importantes.',
      lição: 'A força está na união e na cooperação gentil.'
    }
  },
  {
    id: 'num-3',
    numero: 3,
    nome: 'Três',
    nomeIngles: 'Three',
    planeta: 'Júpiter',
    sefira: 'Binah',
    arco: 'Arcanjo Uriel',
    elemento: 'Fogo',
    Qualidade: 'Expressão',
    significado: 'Criatividade, comunicação, expressão, otimismo, sociabilidade, expansão. O número 3 representa a trinidade e a expressão artística.',
    forca: 'Criatividade, comunicação, otimismo, inspiração, sociabilidade, enthusiasmmo, expressividade',
    desafio: 'Superficialidade, dispersão, falta de foco, tagarelice, cinismo, indolência',
    cor: 'Amarelo',
    pedra: 'Topázio',
    palavraChave: ['Criatividade', 'Comunicação', 'Expressão', 'Otimismo', 'Socialização'],
    affirmation: 'Minha voz é uma criação sagrada. Eu expresso minha verdade com alegria e autenticidade.',
    compatibilidad: [2, 5, 7, 9],
    ciclos: {
      ciclo: 'Ciclo de Expressão',
      descricao: 'Período de intensa criatividade e comunicação. Momento propício para expressar ideias e se conectar socialmente.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver criatividade, comunicação e expressão. Sua missão é inspirar outros através da arte e palavras.',
      caracteristicas: ['Criatividade', 'Otimismo', 'Expressividade', 'Entusiasmo', 'Inspiração'],
      missoes: ['Expressar sua verdade', 'Inspirar outros', 'Criar arte e beleza'],
      liçoes: ['Desenvolver foco', 'Aprofundar emoções', 'Manter compromisso']
    },
    anoPessoal: {
      descricao: 'Ano de expressão criativa e expansão social. É momento de comunicar suas ideias e se conectar com outros.',
      focus: ['Criatividade', 'Comunicação', 'Conexões sociais']
    },
    mesPessoal: {
      descricao: 'Mês para focar em projetos criativos e expressão artística.',
      energia: ['Inspiração', 'Entusiasmo', 'Comunicação']
    },
    diaPessoal: {
      descricao: 'Dia propício para expressar suas ideias e se conectar com outros.',
      lição: 'Sua expressão autêntica ilumina o mundo ao seu redor.'
    }
  },
  {
    id: 'num-4',
    numero: 4,
    nome: 'Quatro',
    nomeIngles: 'Four',
    planeta: 'Urano',
    sefira: 'Chesed',
    arco: 'Arcanjo Rafael',
    elemento: 'Terra',
    Qualidade: 'Estrutura',
    significado: 'Estabilidade, organização, trabalho, fundamento, praticidade, segurança. O número 4 representa a ordem e a construção sólida.',
    forca: 'Praticidade, organização, Reliability, perseverança, lealdade, disciplina, estabilidade',
    desafio: 'Rigidez, materialismo, teimosia, conservadorismo excessivo, falta de flexibilidade',
    cor: 'Verde',
    pedra: 'Jade',
    palavraChave: ['Estabilidade', 'Organização', 'Trabalho', 'Disciplina', 'Fundamento'],
    affirmation: 'Eu construo minha vida sobre alicerces sólidos. Meu trabalho duro cria resultados duradouros.',
    compatibilidad: [1, 5, 6, 8],
    ciclos: {
      ciclo: 'Ciclo de Fundação',
      descricao: 'Período de construção e organização. Momento para estabelecer bases sólidas e trabalhar com disciplina.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver disciplina, organização e estabilidade. Sua missão é construir algo que dure.',
      caracteristicas: ['Praticidade', 'Disciplina', 'Confiabilidade', 'Esforço', 'Estabilidade'],
      missoes: ['Construir fundamentos sólidos', 'Trabalhar com dedicação', 'Criar ordem'],
      liçoes: ['Flexibilizar pensamento', 'Aceitar mudanças', 'Libertar controle']
    },
    anoPessoal: {
      descricao: 'Ano de construção e trabalho árduo. É momento de estabelecer bases sólidas para seus objetivos.',
      focus: ['Trabalho', 'Organização', 'Carreira']
    },
    mesPessoal: {
      descricao: 'Mês para focar em projetos concretos e organização.',
      energia: ['Disciplina', 'Esforço', 'Confiabilidade']
    },
    diaPessoal: {
      descricao: 'Dia propício para trabalho metodico e organização.',
      lição: 'A paciência na construção traz resultados permanentes.'
    }
  },
  {
    id: 'num-5',
    numero: 5,
    nome: 'Cinco',
    nomeIngles: 'Five',
    planeta: 'Mercúrio',
    sefira: 'Geburah',
    arco: 'Arcanjo Gabriel',
    elemento: 'Ar',
    Qualidade: 'Liberdade',
    significado: 'Liberdade, aventura, mudança, versatility, curiosidade, expansão mental. O número 5 representa a liberdade e a adaptação.',
    forca: 'Versatilidade, adaptabilidade, curiosidade, versatilidad, comunicação, independência, adventure',
    desafio: 'Impaciência, irresponsabilidade, inquietude, dispersão, superficialidade, inquietação',
    cor: 'Azul',
    pedra: 'Ágata',
    palavraChave: ['Liberdade', 'Aventura', 'Versatilidade', 'Mudança', 'Experiência'],
    affirmation: 'Eu abraço a mudança como meu guia. Minha flexibilidade me leva a novas experiências libertadoras.',
    compatibilidad: [3, 4, 7, 9],
    ciclos: {
      ciclo: 'Ciclo de Mudança',
      descricao: 'Período de transformações e novas experiências. Momento propício para mudanças e aventuras.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver adaptability, freedom e thirst for knowledge. Sua missão é explorar e adaptar-se.',
      caracteristicas: ['Versatilidade', 'Curiosidade', 'Adaptabilidade', 'Comunicação', 'Aventura'],
      missoes: ['Explorar novos caminhos', 'Adaptar-se às mudanças', 'Compartilhar conhecimento'],
      liçoes: ['Desenvolver comprometimento', 'Estabelecer raízes', 'Aceitar estabilidade']
    },
    anoPessoal: {
      descricao: 'Ano de mudanças e novas experiências. É momento de explorar, viajar e buscar liberdade.',
      focus: ['Mudanças', 'Aventura', 'Expansão de horizontes']
    },
    mesPessoal: {
      descricao: 'Mês para focar em liberdade e novas experiências.',
      energia: ['Versatilidade', 'Curiosidade', 'Expansão']
    },
    diaPessoal: {
      descricao: 'Dia propício para mudanças e novas aventuras.',
      lição: 'A liberdade verdadeira vem de dentro, não de fora.'
    }
  },
  {
    id: 'num-6',
    numero: 6,
    nome: 'Seis',
    nomeIngles: 'Six',
    planeta: 'Vênus',
    sefira: 'Tiphereth',
    arco: 'Arcanjo Haniel',
    elemento: 'Água',
    Qualidade: 'Harmonia',
    significado: 'Responsabilidade, família, serviço, harmonia, amor, equilibrío. O número 6 representa o amor e o serviço ao próximo.',
    forca: 'Amor, responsabilidade, harmonia, nurturing, empatia, compasão, serviço, família',
    desafio: 'Perfeccionismo, worry, auto-sacrifício excessivo, interferência, ciúme, conformismo',
    cor: 'Rosa',
    pedra: 'Rodocrosita',
    palavraChave: ['Amor', 'Família', 'Harmonia', 'Serviço', 'Responsabilidade'],
    affirmation: 'Eu sou um canal de amor e harmonia. Meu serviço ao outro me traz paz interior.',
    compatibilidad: [1, 2, 4, 8],
    ciclos: {
      ciclo: 'Ciclo de Responsabilidade',
      descricao: 'Período de foco na família e responsabilidades. Momento para nutrir relacionamentos e criar harmonia.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver amor, responsabilidade e serviço. Sua missão é cuidar e nutrir outros.',
      caracteristicas: ['Amor', 'Responsabilidade', 'Harmonia', 'Compasão', 'Serviço'],
      missoes: ['Cuidar da família', 'Promover harmonia', 'Servir ao próximo'],
      liçoes: ['Estabelecer limites saudáveis', 'Cuidar de si mesmo', 'Evitar perfeccionismo']
    },
    anoPessoal: {
      descricao: 'Ano de foco na família e responsabilidades domésticas. É momento de nutrir relacionamentos e criar harmonia.',
      focus: ['Família', 'Relacionamentos', 'Serviço ao próximo']
    },
    mesPessoal: {
      descricao: 'Mês para focar em cuidado e responsabilidade familiar.',
      energia: ['Amor', 'Cuidado', 'Harmonia']
    },
    diaPessoal: {
      descricao: 'Dia propício para cuidar de quem você ama e promover harmonia.',
      lição: 'O amor verdadeiro começa com o cuidado de si mesmo.'
    }
  },
  {
    id: 'num-7',
    numero: 7,
    nome: 'Sete',
    nomeIngles: 'Seven',
    planeta: 'Netuno',
    sefira: 'Netzach',
    arco: 'Arcanjo Jofiel',
    elemento: 'Água',
    Qualidade: 'Sabedoria',
    significado: 'Sabedoria, introspecção, espiritualidade, análise, conhecimento interior. O número 7 representa a busca espiritual e a sabedoria.',
    forca: 'Intuição, sabedoria, espiritualidade, análise, introspecção, inner peace, conhecimento',
    desafio: 'Isolamento, dogmatismo, super-intelectualização, escapismo, melancholy, aloofness',
    cor: 'Violeta',
    pedra: 'Ametista',
    palavraChave: ['Sabedoria', 'Espiritualidade', 'Introspecção', 'Conhecimento', 'Análise'],
    affirmation: 'Eu confio na sabedoria interior que habita em mim. Minha busca espiritual me guia para a verdade.',
    compatibilidad: [3, 5, 8, 9],
    ciclos: {
      ciclo: 'Ciclo de Busca Interior',
      descricao: 'Período de reflexão e busca espiritual. Momento propício para meditação, estudo e desenvolvimento interior.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver sabedoria, espiritualidade e conocimiento profundo. Sua missão é buscar a verdade interior.',
      caracteristicas: ['Intuição', 'Sabedoria', 'Espiritualidade', 'Análise', 'Inner Peace'],
      missoes: ['Buscar conhecimento profundo', 'Desenvolver espiritualidade', 'Compartilhar sabedoria'],
      liçoes: ['Conectar-se com outros', 'Praticar no mundo', 'Equilibrar solitude e sociedade']
    },
    anoPessoal: {
      descricao: 'Ano de introspecção e busca espiritual. É momento de retreat, study e desenvolvimento interior.',
      focus: ['Espiritualidade', 'Estudo', 'Inner work']
    },
    mesPessoal: {
      descricao: 'Mês para focar em reflexão e desenvolvimento espiritual.',
      energia: ['Introspecção', 'Sabedoria', 'Inner peace']
    },
    diaPessoal: {
      descricao: 'Dia propício para meditação e busca de conhecimento interior.',
      lição: 'A verdadeira sabedoria vem do silêncio e da escuta interior.'
    }
  },
  {
    id: 'num-8',
    numero: 8,
    nome: 'Oito',
    nomeIngles: 'Eight',
    planeta: 'Saturno',
    sefira: 'Hod',
    arco: 'Arcanjo Tzafkiel',
    elemento: 'Terra',
    Qualidade: 'Abundância',
    significado: 'Abundância, poder, autoridade, trabalho, karma, manifestation. O número 8 representa o karma e a abundância material e espiritual.',
    forca: 'Autoridade, poder, abundância, trabalho, disciplina, ambição, pragmatismo, sucesso material',
    desafio: 'Materialismo, autoritarismo, obsessão por status, medo, controle excessivo, inflexibilidade',
    cor: 'Marrom',
    pedra: 'Obsidiana',
    palavraChave: ['Abundância', 'Poder', 'Autoridade', 'Trabalho', 'Manifestação'],
    affirmation: 'Eu Manifesto abundância em todas as áreas da minha vida. Meu trabalho duro traz recompensas justas.',
    compatibilidad: [1, 4, 6, 7],
    ciclos: {
      ciclo: 'Ciclo de Manifestação',
      descricao: 'Período de收割 e manifestação de objetivos. Momento para trabalho árduo e construção de riqueza.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver poder, autoridade e abundancia. Sua missão é manifests success through integrity.',
      caracteristicas: ['Autoridade', 'Abundância', 'Disciplina', 'Ambição', 'Pragmatismo'],
      missoes: ['Build wealth ethically', 'Lead with integrity', 'Manifest goals'],
      liçoes: ['Evitar materialismo', 'Compartilhar abundância', 'Desenvolver espiritualidade junto ao material']
    },
    anoPessoal: {
      descricao: 'Ano de trabalho e manifestação de objetivos materiais. É momento de construir autoridade e abundance.',
      focus: ['Carreira', 'Finanças', 'Authority']
    },
    mesPessoal: {
      descricao: 'Mês para focar em projetos profissionais e financeiros.',
      energia: ['Disciplina', 'Abundância', 'Manifestação']
    },
    diaPessoal: {
      descricao: 'Dia propício para trabalho focado e decisões financeiras.',
      lição: 'A verdadeira abundância inclui generosidade e integridade.'
    }
  },
  {
    id: 'num-9',
    numero: 9,
    nome: 'Nove',
    nomeIngles: 'Nine',
    planeta: 'Marte',
    sefira: 'Yesod',
    arco: 'Arcanjo Kamael',
    elemento: 'Fogo',
    Qualidade: 'Compaixão',
    significado: 'Compaixão, humanitarismo, conclusão, sabedoria, encerramento. O número 9 representa a conclusão de um ciclo e a sabedoria elevada.',
    forca: 'Compaixão, humanitarismo, sabedoria, philanthropia, tolerance, idealismo, generosity',
    desafio: 'Impaciência, dogmatismo, dificuldade em finalizar, auto-sacrifício, sobrecarga emocional',
    cor: 'Vermelho escuro',
    pedra: 'Turmalina',
    palavraChave: ['Compaixão', 'Humanitarismo', 'Sabedoria', 'Conclusão', 'Generosidade'],
    affirmation: 'Eu sou um farol de compaixão no mundo. Minha sabedoria serve à humanidade.',
    compatibilidad: [2, 3, 5, 7],
    ciclos: {
      ciclo: 'Ciclo de Conclusão',
      descricao: 'Período de encerramento e preparação para novo ciclo. Momento para wrap up loose ends e soltar o que não serve mais.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para desenvolver compaixão, wisdom e humanitarismo. Sua missão é serve humanity through your gifts.',
      caracteristicas: ['Compaixão', 'Humanitarismo', 'Sabedoria', 'Generosidade', 'Idealismo'],
      missoes: ['Serve others', 'Promove justice', 'Encarnar wisdom'],
      liçoes: ['Finalizar ciclos', 'Aceitar endings', 'Balance giving e receiving']
    },
    anoPessoal: {
      descricao: 'Ano de conclusões e preparação para novo ciclo. É momento de wrap up projetos e look hacia future possibilities.',
      focus: ['Humanitarismo', 'Conclusões', 'Novo começo']
    },
    mesPessoal: {
      descricao: 'Mês para focar em encerramento de ciclos e humanitarian work.',
      energia: ['Compassão', 'Finalização', 'Transição']
    },
    diaPessoal: {
      descricao: 'Dia propício para encerramento de assuntos e compaixão.',
      lição: 'Ao soltar o velho, você cria espaço para o novo.'
    }
  },
  {
    id: 'num-11',
    numero: 11,
    nome: 'Onze',
    nomeIngles: 'Eleven',
    planeta: 'Plutão',
    sefira: 'Malkuth',
    arco: 'Arcanjo Metatron',
    elemento: 'Ar',
    Qualidade: 'Iluminação',
    significado: 'Mestria, iluminação espiritual, intuição elevada, inspiração, visão. O número 11 é um número principal que combina dualidade e iluminação.',
    forca: 'Intuição, iluminação, inspiração, visão espiritual, carisma, sensibilidade, high ideals',
    desafio: 'Exaustão nervosa, super-sensibilidade, nerve endings à flor de pele, martírio, frustração',
    cor: 'Prata branco',
    pedra: 'Selenita',
    palavraChave: ['Iluminação', 'Intuição', 'Visão', 'Inspiração', 'Mestria'],
    affirmation: 'Eu sou um canal de luz divina. Minha intuição elevada guia others para sua verdade.',
    compatibilidad: [2, 3, 6, 9],
    ciclos: {
      ciclo: 'Ciclo de Iluminação',
      descricao: 'Período de heightened intuition e spiritual awakening. Momento para develop your psychic abilities e serve como channel for higher wisdom.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para ser um channels for divine light. Sua missão é illuminate paths para others through your intuition and vision.',
      caracteristicas: ['Intuição', 'Iluminação', 'Visão', 'Carisma', 'High ideals'],
      missoes: ['Illuminar paths', 'Develop psychic abilities', 'Serve as channel'],
      liçoes: ['Ground your energy', 'Set boundaries', 'Balance idealismo com practicality']
    },
    anoPessoal: {
      descricao: 'Ano de spiritual awakening e heightened intuition. É momento de develop your gifts e serve como inspiration for others.',
      focus: ['Espiritualidade', 'Intuição', 'Iluminação']
    },
    mesPessoal: {
      descricao: 'Mês para focar em desenvolvimento espiritual e intuição.',
      energia: ['Iluminação', 'Inspiração', 'Visão']
    },
    diaPessoal: {
      descricao: 'Dia propício para meditação e receiving de insights.',
      lição: 'Sua luz interior é um farol para aqueles que buscam verdade.'
    }
  },
  {
    id: 'num-22',
    numero: 22,
    nome: 'Vinte e dois',
    nomeIngles: 'Twenty-two',
    planeta: 'Terra',
    sefira: 'Kether',
    arco: 'Arcanjo Sandalphon',
    elemento: 'Terra',
    Qualidade: 'Mestria',
    significado: 'Mestria em manifested form, building empire, pragmatism meets vision, grandes realizações. O número 22 combina visão espiritual com pragmatismo terreno.',
    forca: 'Vision, capability, manifesting abilities, pragmatism, big thinking, organizational skills, master builder',
    desafio: 'Tendency to spread too thin, medo de failure, perfectionism, dificuldade em delegar, feeling overwhelmed',
    cor: 'Bronze',
    pedra: 'Calcita laranja',
    palavraChave: ['Mestria', 'Manifestação', 'Visão', 'Construção', 'Realização'],
    affirmation: 'Eu construo masterworks que serve humanity. Minha visão se manifiesta em forma tangible.',
    compatibilidad: [1, 4, 6, 8],
    ciclos: {
      ciclo: 'Ciclo de Construção Mestria',
      descricao: 'Período de manifestation of big visions. Momento para build something que transcende o ordinario through combining vision com practical action.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para build something extraordinário. Sua missão é manifest grand visions em forma tangível que serve many.',
      caracteristicas: ['Visão', 'Capability', 'Organização', 'Master builder', 'Big thinking'],
      missoes: ['Manifest grand visions', 'Build lasting structures', 'Serve many'],
      liçoes: ['Focus your energy', 'Delegate appropriately', 'Avoid spreading too thin']
    },
    anoPessoal: {
      descricao: 'Ano de grand manifestations e construction. É momento de build something significativo que will outlast you.',
      focus: ['Realizações', 'Construção', 'Manifestação']
    },
    mesPessoal: {
      descricao: 'Mês para focar em projetos ambiciosos e construção.',
      energia: ['Visão', 'Capacidade', 'Construção']
    },
    diaPessoal: {
      descricao: 'Dia propício para action towards big goals.',
      lição: 'A verdadeira mestria está em fazer o impossível possível.'
    }
  },
  {
    id: 'num-33',
    numero: 33,
    nome: 'Trinta e três',
    nomeIngles: 'Thirty-three',
    planeta: 'Urano',
    sefira: 'Kether',
    arco: 'Arcanjo Metatron',
    elemento: 'Fogo',
    Qualidade: 'Serviço Sagrado',
    significado: 'Serviço divino, Christ consciousness, maestria espiritual, teacher of teachers. O número 33 é o mais alto dos números principais, representando service sacrifice e espiritual enlightenment.',
    forca: 'Selflessness, spiritual teacher, healing, inspiring, humanitarian, unconditional love, sacrific',
    desafio: 'Tendency to martyr self, dificuldade em receive, burnout, feeling misunderstood, carrying others burdens',
    cor: 'Ouro blanco',
    pedra: ' кварц master',
    palavraChave: ['Serviço', 'Sacrifício', 'Ensino', 'Healing', 'Iluminação'],
    affirmation: 'Eu sou um channels for divine service. Meu amor unconditional serves the highest good of all.',
    compatibilidad: [2, 3, 6, 9],
    ciclos: {
      ciclo: 'Ciclo de Serviço Divino',
      descricao: 'Período de elevada espiritual service e humanitarian work. Momento para incarnate divine love em action serving others without expectation.'
    },
    caminhoVida: {
      descricao: 'Você está aqui para serve as a divine teacher e channel. Sua missão é uplift humanity through sacrifice e unconditional love.',
      caracteristicas: ['Selflessness', 'Teaching', 'Healing', 'Inspiration', 'Divine love'],
      missoes: ['Teach truth', 'Heal others', 'Serve divinely'],
      liçoes: ['Self-care boundaries', 'Receive as well as give', 'Avoid martyrdom']
    },
    anoPessoal: {
      descricao: 'Ano de divine service e spiritual teaching. É momento de incarnate your highest ideals em service to others.',
      focus: ['Serviço', 'Ensinamento', 'Healing']
    },
    mesPessoal: {
      descricao: 'Mês para focar em service e spiritual teaching.',
      energia: ['Amor incondicional', 'Sacrifício sagrado', 'Ensinamento']
    },
    diaPessoal: {
      descricao: 'Dia propício para service e healing work.',
      lição: 'No service verdadeiro, você também é servido.'
    }
  }
];

export function getData(): NumerologiaData[] {
  return NUMEROLOGIA_DATA;
}

export function getDataById(id: string): NumerologiaData | undefined {
  return NUMEROLOGIA_DATA.find((n) => n.id === id);
}

export function getDataByNumero(numero: number): NumerologiaData | undefined {
  return NUMEROLOGIA_DATA.find((n) => n.numero === numero);
}

export function searchData(query: string): NumerologiaData[] {
  const lowerQuery = query.toLowerCase();
  return NUMEROLOGIA_DATA.filter((n) =>
    n.nome.toLowerCase().includes(lowerQuery) ||
    n.numero.toString().includes(lowerQuery) ||
    n.planeta.toLowerCase().includes(lowerQuery) ||
    n.sefira.toLowerCase().includes(lowerQuery) ||
    n.palavraChave.some((kw) => kw.toLowerCase().includes(lowerQuery))
  );
}

export function getDataByPlaneta(planeta: string): NumerologiaData[] {
  return NUMEROLOGIA_DATA.filter((n) => n.planeta.toLowerCase().includes(planeta.toLowerCase()));
}

export function getDataBySefira(sefira: string): NumerologiaData[] {
  return NUMEROLOGIA_DATA.filter((n) => n.sefira.toLowerCase().includes(sefira.toLowerCase()));
}

export function getDataByElemento(elemento: string): NumerologiaData[] {
  return NUMEROLOGIA_DATA.filter((n) => n.elemento.toLowerCase().includes(elemento.toLowerCase()));
}

export function getMasterNumbers(): NumerologiaData[] {
  return NUMEROLOGIA_DATA.filter((n) => [11, 22, 33].includes(n.numero));
}

export function getCoreNumbers(): NumerologiaData[] {
  return NUMEROLOGIA_DATA.filter((n) => n.numero >= 1 && n.numero <= 9);
}

export default getData;