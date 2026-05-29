export interface YearTheme {
  numero: number;
  sefirot: string;
  titulo: string;
  descricao: string;
  oraculo: string;
  cor: string;
  elemento: string;
  areasVida: string[];
}

export interface TurningPoint {
  mes: number;
  tipo: 'introspeccao' | 'acao' | 'transicao' | 'culminacao';
  titulo: string;
  descricao: string;
  energia: number;
}

export interface QuarterlyBreakdown {
  trimestre: number;
  meses: number[];
  tema: string;
  oportunidades: string[];
  desafios: string[];
  conselho: string;
}

export interface YearProjection {
  anoCalendario: number;
  numeroAnoPessoal: number;
  sefirotAno: string;
  tema: YearTheme;
  turningPoints: TurningPoint[];
  quarterlyBreakdown: QuarterlyBreakdown[];
  resumo: string;
}

const nomesSefirots = [
  '', 'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
  'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
];

const themesAnoPessoal: Record<number, Omit<YearTheme, 'numero' | 'sefirot'>> = {
  1: {
    titulo: 'Iniciação e Autonomia',
    descricao: 'Ano de novos começos, liderança e independência. O universo conspira para que você tome as rédeas da sua vida.',
    oraculo: 'O primeiro passo é o mais corajoso. Caminhe sozinho se necessário.',
    cor: '#FF6B35',
    elemento: 'Fogo',
    areasVida: ['Carreira', 'Autoexpressão', 'Iniciativas pessoais']
  },
  2: {
    titulo: 'Parceria e Diplomacia',
    descricao: 'Ano de cooperação, relacionamentos e sensibilidade. A harmonia se torna essencial.',
    oraculo: 'Na união há força. Alcance a mão do outro sem perder a sua.',
    cor: '#4ECDC4',
    elemento: 'Água',
    areasVida: ['Relacionamentos', 'Parcerias', 'Colaboração']
  },
  3: {
    titulo: 'Expressão e Criatividade',
    descricao: 'Ano de expansão criativa, comunicação e alegria. Permita-se ser visto.',
    oraculo: 'A voz que silencia o mundo precisa ser ouvida. Cante sua verdade.',
    cor: '#FFE66D',
    elemento: 'Fogo',
    areasVida: ['Criatividade', 'Comunicação', 'Socialização']
  },
  4: {
    titulo: 'Fundação e Disciplina',
    descricao: 'Ano de construção sólida, trabalho árduo e estruturas duradouras.',
    oraculo: 'Quem planta em estação certa colhe em abundância. Estabeleça as bases.',
    cor: '#95E1D3',
    elemento: 'Terra',
    areasVida: ['Trabalho', 'Estrutura', 'Finanças']
  },
  5: {
    titulo: 'Liberdade e Mudança',
    descricao: 'Ano de transformação, aventura e liberdade. Abrace o inesperado.',
    oraculo: 'O vento muda a direção, não a essência. Adapte-se ao fluxo.',
    cor: '#F38181',
    elemento: 'Ar',
    areasVida: ['Mudanças', 'Viagens', 'Novas experiências']
  },
  6: {
    titulo: 'Harmonia e Responsabilidade',
    descricao: 'Ano de equilíbrio doméstico, compromisso e cuidado com o próximo.',
    oraculo: 'O círculo se completa no cuidado. Honre seus laços.',
    cor: '#AA96DA',
    elemento: 'Água',
    areasVida: ['Família', 'Relacionamentos', 'Serviço']
  },
  7: {
    titulo: 'Reflexão e Sabedoria',
    descricao: 'Ano de introspecção, busca espiritual e desenvolvimento interior.',
    oraculo: 'No silêncio, a verdade se revela. Busque dentro o que falta fora.',
    cor: '#6C5CE7',
    elemento: 'Água',
    areasVida: ['Espiritualidade', 'Estudos', 'Solitude']
  },
  8: {
    titulo: 'Poder e Abundância',
    descricao: 'Ano de realizações materiais, poder pessoal e equilíbrio entre dar e receber.',
    oraculo: 'A semente plantada com intenção produzirá a colheita desejada.',
    cor: '#2D3436',
    elemento: 'Terra',
    areasVida: ['Finanças', 'Carreira', 'Autoridade']
  },
  9: {
    titulo: 'Culminação e Desprendimento',
    descricao: 'Ano de conclusão de ciclos, encerramento de capítulos e preparação para o novo.',
    oraculo: 'Tudo que não serve mais deve partir. Libere para receber.',
    cor: '#A29BFE',
    elemento: 'Ar',
    areasVida: ['Desprendimento', 'Completamento', 'Transição']
  }
};

const turningPointsConfig: Record<number, Omit<TurningPoint, 'mes' | 'titulo' | 'descricao' | 'energia'>> = {
  1: { tipo: 'transicao' },
  2: { tipo: 'acao' },
  3: { tipo: 'transicao' },
  4: { tipo: 'introspeccao' },
  5: { tipo: 'transicao' },
  6: { tipo: 'acao' },
  7: { tipo: 'transicao' },
  8: { tipo: 'transicao' },
  9: { tipo: 'culminacao' },
  10: { tipo: 'transicao' },
  11: { tipo: 'introspeccao' },
  12: { tipo: 'transicao' }
};

function calcularNumeroAnoPessoal(birthDate: string): number {
  const digits = birthDate.replace(/\D/g, '');
  const day = parseInt(digits.slice(0, 2) || '0', 10);
  const month = parseInt(digits.slice(2, 4) || '0', 10);
  const year = new Date().getFullYear();

  const sum = day + month + year;
  let result = sum;
  while (result > 9 && result !== 11 && result !== 22) {
    result = result
      .toString()
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return result;
}

function getSefirot(numero: number): string {
  return nomesSefirots[numero] || nomesSefirots[numero % 10] || 'Malkuth';
}

function generateTurningPoints(_anoPessoal: number): TurningPoint[] {
  const config = turningPointsConfig;

  const turningPointMonths: Record<string, { titulo: string; descricao: string }[]> = {
    introspeccao: [
      { titulo: 'Reflexão Interior', descricao: 'Momento de auto-observacao e avaliacao espiritual' },
      { titulo: 'Busca Interior', descricao: 'Processo de descoberta dos segredos interiores' },
      { titulo: 'Integracao Espiritual', descricao: 'Sintese entre experiencia e sabedoria' },
    ],
    acao: [
      { titulo: 'Acao Determinada', descricao: 'Momento de tomar decisoes importantes' },
      { titulo: 'Impulso Vital', descricao: 'Energia concentrada para realizacoes' },
      { titulo: 'Coragem de Agir', descricao: 'Superação de obstaculos com forca interior' },
    ],
    transicao: [
      { titulo: 'Porta de Transformacao', descricao: 'Limiar entre o antigo e o novo ciclo' },
      { titulo: 'Passagem Sagrada', descricao: 'Transicao energetica entre dimensoes' },
      { titulo: 'Caminho Intermediario', descricao: 'Processo de integracao de mudancas' },
    ],
    culminacao: [
      { titulo: 'Climax do Ciclo', descricao: 'Ponto culminante das experiencias do ano' },
      { titulo: 'Realizacao Total', descricao: 'Consagracao dos objetivos alcancados' },
      { titulo: 'A堂Final', descricao: 'Conclusao e preparacao para novo inicio' },
    ],
  };

  const turningPoints: TurningPoint[] = [];

  for (let index = 0; index < 12; index++) {
    const mes = index + 1;
    const tipoConfig = config[mes] || config[1];
    const tipo = tipoConfig.tipo;
    const textos = turningPointMonths[tipo];
    const selectedText = textos[index % textos.length];

    turningPoints.push({
      mes,
      tipo,
      titulo: selectedText.titulo,
      descricao: selectedText.descricao,
      energia: Math.floor(50 + Math.random() * 50)
    });
  }

  return turningPoints;
}

function generateQuarterlyBreakdown(anoPessoal: number): QuarterlyBreakdown[] {
  const quarterThemes: Record<number, { tema: string; oportunidades: string[]; desafios: string[]; conselho: string }[]> = {
    1: [
      { tema: 'Semeando Intenções', oportunidades: ['Definir metas claras', 'Novos começos'], desafios: ['Imaturidade', 'Impaciência'], conselho: 'Comece pelo essencial.' },
      { tema: 'Construindo Momentum', oportunidades: ['Avançar projetos', 'Ganhar reconhecimento'], desafios: ['Obstáculos inesperados', 'Fadiga'], conselho: 'Mantenha o ritmo.' },
      { tema: 'Expansão de Horizontes', oportunidades: ['Revelar habilidades', 'Conectar-se com outros'], desafios: ['Superficialidade', 'Distração'], conselho: 'Aprofunde mais.' },
      { tema: 'Consolidação', oportunidades: ['Ver resultados', 'Afinar direção'], desafios: ['Inflexibilidade', 'Rancor'], conselho: 'Revise e ajuste.' }
    ],
    2: [
      { tema: 'Cultivando Conexões', oportunidades: ['Formar alianças', 'Desenvolver empatia'], desafios: ['Indecisão', 'Vulnerabilidade'], conselho: 'Colabore authenticamente.' },
      { tema: 'Equilíbrio em Ação', oportunidades: ['Harmonia relacional', 'Negócios conjuntos'], desafios: ['Conflito interno', 'Sacrifício'], conselho: 'Dê e receba igualmente.' },
      { tema: 'Parceria Profunda', oportunidades: ['Amor maduro', 'Compromisso real'], desafios: ['Dependência', 'Manipulação'], conselho: 'Respeite límites.' },
      { tema: 'União', oportunidades: ['Celebrar conquistas', 'Forjar laços duradouros'], desafios: ['Separação', 'Desentendimentos'], conselho: 'Honre a diversidade na unidade.' }
    ],
    3: [
      { tema: 'Expressão Autêntica', oportunidades: ['Criação artística', 'Comunicação clara'], desafios: ['Excesso', 'Dispersão'], conselho: 'Canalize sua energia criativa.' },
      { tema: 'Expansão Social', oportunidades: ['Networking', 'Novas amizades'], desafios: ['Fofoca', 'Superficialidade'], conselho: 'Escolha qualidade sobre quantidade.' },
      { tema: 'Alegria de Viver', oportunidades: ['Curtir o presente', 'Explorar possibilidades'], desafios: ['Irresponsabilidade', 'Procrastinação'], conselho: 'Equilibre prazer e dever.' },
      { tema: 'Integração', oportunidades: ['Síntese de aprendizados', 'Aplicar conhecimento'], desafios: ['Cinismo', 'Restrição'], conselho: 'Compartilhe sua luz com outros.' }
    ],
    4: [
      { tema: 'Fundação', oportunidades: ['Estabelecer sistemas', 'Criar estrutura'], desafios: ['Rigidez', 'Escassez'], conselho: 'Construa sólido, não rápido.' },
      { tema: 'Trabalho Dedicado', oportunidades: ['Progresso tangível', 'Reconhecimento profissional'], desafios: ['Burnout', 'Monotonia'], conselho: 'Pace yourself.' },
      { tema: 'Estabilidade', oportunidades: ['Acumular recursos', 'Fortalecer raízes'], desafios: ['Estagnação', 'Medo de mudar'], conselho: 'Valorize o que foi conquistado.' },
      { tema: 'Consolidação Anual', oportunidades: ['Revisar metas', 'Preparar para evolução'], desafios: ['Resistência', 'Insatisfação'], conselho: 'As bases estão firmes; olhe para o alto.' }
    ],
    5: [
      { tema: 'Libertação', oportunidades: ['Desbloquear potencial', 'Sair da zona de conforto'], desafios: ['Inquietação', 'Impaciência'], conselho: 'Abra-se para o novo.' },
      { tema: 'Adaptação', oportunidades: ['Versatilidade', 'Conexões diversas'], desafios: ['Instabilidade', 'Compromissos rompidos'], conselho: 'Flexibilidade é sua aliada.' },
      { tema: 'Exploração', oportunidades: ['Viagens', 'Novas perspectivas'], desafios: ['Superficialidade', 'Excesso de mudança'], conselho: 'Aventure-se, mas com propósito.' },
      { tema: 'Integração de Mudanças', oportunidades: ['Síntese de experiências', 'Crescimento pessoal'], desafios: ['Insatisfação crônica', 'Fuga de responsabilidades'], conselho: 'A mudança interna precede a externa.' }
    ],
    6: [
      { tema: 'Harmonia Doméstica', oportunidades: ['Melhorar ambiente', 'Cuidar de cercanos'], desafios: ['Sacrifício excessivo', 'Culpa'], conselho: 'Sirva sem se perder.' },
      { tema: 'Responsabilidade Amorosa', oportunidades: ['Relacionamentos maturam', 'Compromisso'], desafios: ['Controle', 'Expectativas irrealistas'], conselho: 'Ame sem prender.' },
      { tema: 'Comunidade', oportunidades: ['Engajamento social', 'Serviço voluntário'], desafios: ['Conflitos familiares', 'Onus'], conselho: 'Encontre equilíbrio entre dar e receber.' },
      { tema: 'Ciclo de Amor', oportunidades: ['Celebrar laços', 'Perdoar mágoas'], desafios: ['Rigidez emocional', 'Dependência'], conselho: 'Honre o amor em todas suas formas.' }
    ],
    7: [
      { tema: 'Retiro Interior', oportunidades: ['Meditação', 'Estudos profundos'], desafios: ['Isolamento', 'Melancolia'], conselho: 'No silêncio, encontre respostas.' },
      { tema: 'Busca Espiritual', oportunidades: ['Desenvolvimento intuitivo', 'Insights'], desafios: ['Desconexão', 'Dúvida'], conselho: 'Confie em sua sabedoria interior.' },
      { tema: 'Sabedoria Prática', oportunidades: ['Aplicar conhecimento', 'Tornar-se instructor'], desafios: ['Arrogância', 'Dogmatismo'], conselho: 'Compartilhe sem impor.' },
      { tema: 'Consolidação Espiritual', oportunidades: ['Integração de aprendizados', 'Clareza de propósito'], desafios: ['Ceticismo', 'Restrição'], conselho: 'A verdade está ao alcance do olhar interior.' }
    ],
    8: [
      { tema: 'Manifestação de Poder', oportunidades: ['Iniciar empreendimentos', 'Assumir liderança'], desafios: ['Avareza', 'Abuso de poder'], conselho: 'Poder honesto constrói.' },
      { tema: 'Abundância Material', oportunidades: ['Prosperidade', 'Reconhecimento'], desafios: ['Ganância', 'Competição'], conselho: 'Use o poder para o bem comum.' },
      { tema: 'Autoridade', oportunidades: ['Assumir responsabilidade', 'Influenciar'], desafios: ['Manipulação', 'Controle'], conselho: 'Lidere com integridade.' },
      { tema: 'Culminação do Poder', oportunidades: ['Colheita de esforços', 'Respeito'], desafios: ['Arrogância', 'Queda'], conselho: 'O poder verdadeiro é servir.' }
    ],
    9: [
      { tema: 'Desapego', oportunidades: ['Liberação de padrões antigos', 'Perdoar'], desafios: ['Luto', 'Desilusão'], conselho: 'Solte o que não serve mais.' },
      { tema: 'Completamento', oportunidades: ['Encerrar ciclos', 'Fechar projetos'], desafios: ['Resistência', 'Medo do vazio'], conselho: 'Cada fim é um começo disfarçado.' },
      { tema: 'Transição', oportunidades: ['Preparação para novo capítulo', 'Renovação'], desafios: ['Incerteza', 'Impaciência'], conselho: 'Permita que o antigo se dissolva.' },
      { tema: 'Renascimento', oportunidades: ['Sementes para o futuro', 'Recomeçar'], desafios: ['Nostalgia', 'Apegamento ao passado'], conselho: 'O novo está nascendo em você.' }
    ]
  };

  const quarterData = quarterThemes[anoPessoal] || quarterThemes[1];

  return [1, 2, 3, 4].map(trimestre => ({
    trimestre,
    meses: [(trimestre - 1) * 3 + 1, (trimestre - 1) * 3 + 2, (trimestre - 1) * 3 + 3],
    ...quarterData[trimestre - 1]
  }));
}

function generateSummary(theme: YearTheme): string {
  const summaries: Record<number, string> = {
    1: `Este é seu ano de ${theme.titulo.toLowerCase()}. A energia do número 1 traz consigo o impulso de novos começos e autonomia. Ao longo dos próximos meses, você será chamado a liderar, inovar e tomar decisões que definirão sua trajetória. Abrace a independência, mas não confunda solidão com força.`,
    2: `Seu ano de ${theme.titulo.toLowerCase()} convida você a cultivar relacionamentos e parcerias. A energia do 2 traz sensibilidade e intuitividade. Será um período propício para diplomacia, trabalho em equipe e construção de laços duradouros. Sua força está na conexão com o outro.`,
    3: `Este é o ano da ${theme.titulo.toLowerCase()}. A energia criativa do 3 expande suas possibilidades de expressão e comunicação. Você será inspirado a explorar sua criatividade, conectar-se socialmente e encontrar alegria no presente. Permita-se ser visto e ouvir sua própria voz.`,
    4: `Seu ano de ${theme.titulo.toLowerCase()} traz a energia da construção e disciplina. O número 4 representa bases sólidas e trabalho dedicado. Este é um período para estabelecer estruturas duradouras em sua vida, seja na carreira, finanças ou vida pessoal. A perseverança será sua aliada.`,
    5: `Este é seu ano de ${theme.titulo.toLowerCase()}. A energia transformadora do 5 traz mudanças, aventuras e liberdade. Você será convidado a abraçar o inesperado, adaptar-se a novas circunstâncias e expandir seus horizontes. A flexibilidade será essencial. Confie no fluxo da vida.`,
    6: `Seu ano de ${theme.titulo.toLowerCase()} traz foco em harmonia, família e responsabilidade amorosa. A energia do 6 convida você a cuidar dos outros sem se esquecer de si mesmo. Este é um período propício para resolver conflitos familiares, aprofundar relacionamentos e encontrar equilíbrio entre dar e receber.`,
    7: `Este é o ano da ${theme.titulo.toLowerCase()}. A energia introspectiva do 7 chama você para dentro, para a busca espiritual e o autoconhecimento. Este é um momento para estudos, meditação e desenvolvimento da sabedoria interior. No silêncio, você encontrará as respostas que procura.`,
    8: `Seu ano de ${theme.titulo.toLowerCase()} traz poderosa energia de manifestação material e poder pessoal. O número 8 representa abundância, sucesso e autoridade. Este é um período propício para consolidar conquistas, assumir liderança e equilibrar ambição com integridade. Você tem o poder de criar realidade.`,
    9: `Este é seu ano de ${theme.titulo.toLowerCase()}. A energia de encerramento do 9 convida você a soltar o que não serve mais, perdoar e se preparar para um novo ciclo. É um ano de conclusão e desprendimento. Ao fechar capítulos, você abre espaço para novos começos. Honre suas experiências passadas enquanto olha para frente com esperança.`
  };

  return summaries[theme.numero] || summaries[1];
}

export function calculateYearProjection(birthDate: string): YearProjection {
  const currentYear = new Date().getFullYear();
  const numeroAnoPessoal = calcularNumeroAnoPessoal(birthDate);
  const sefirotAno = getSefirot(numeroAnoPessoal);

  const theme: YearTheme = {
    numero: numeroAnoPessoal,
    sefirot: sefirotAno,
    ...themesAnoPessoal[numeroAnoPessoal] || themesAnoPessoal[1]
  };

  const turningPoints = generateTurningPoints(numeroAnoPessoal);
  const quarterlyBreakdown = generateQuarterlyBreakdown(numeroAnoPessoal);
  const resumo = generateSummary(theme);

  return {
    anoCalendario: currentYear,
    numeroAnoPessoal,
    sefirotAno,
    tema: theme,
    turningPoints,
    quarterlyBreakdown,
    resumo
  };
}