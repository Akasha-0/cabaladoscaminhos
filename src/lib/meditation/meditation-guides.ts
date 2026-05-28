// Meditation guides for spiritual practice and inner development

export type GuideDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: 'cura' | 'sono' | 'foco' | 'energia' | 'sagrado';
  difficulty: GuideDifficulty;
  duration: number; // minutes
  prerequisites?: string[];
  objectives: string[];
  practices: {
    name: string;
    duration: number;
    description: string;
    technique: string;
  }[];
  integration: string;
  warnings?: string[];
}

const guides: Guide[] = [
  {
    id: 'foundations-of-awareness',
    title: 'Fundamentos da Consciência',
    description: 'Introdução às práticas meditativas básicas para desenvolver presença e awareness fundamental.',
    category: 'cura',
    difficulty: 'beginner',
    duration: 21,
    objectives: [
      'Estabelecer uma prática meditativa diária',
      'Desenvolver awareness do momento presente',
      'Criar consciência corporal básica',
      'Cultivar estado de calma e equanimidade',
    ],
    practices: [
      {
        name: 'Observação da Respiração',
        duration: 7,
        description: 'Sentar em posição confortável e observar o fluxo natural da respiração.',
        technique: 'focused attention on breath',
      },
      {
        name: 'Body Scan Inicial',
        duration: 8,
        description: 'Passar awareness suavemente por cada parte do corpo, notando sensações.',
        technique: 'body scan meditation',
      },
      {
        name: 'Estabelecimento de Intenção',
        duration: 6,
        description: 'Definir claramente a intenção de prática e compromisso consigo mesmo.',
        technique: 'intentional setting',
      },
    ],
    integration: 'Pratique diariamente ao acordar ou antes de dormir. Comece com 7 minutos e aumente gradualmente.',
  },
  {
    id: 'deep-healing-meditation',
    title: 'Meditação de Cura Profunda',
    description: 'Prática intensiva para cura emocional, liberação de traumas e renovação interior.',
    category: 'cura',
    difficulty: 'intermediate',
    duration: 45,
    prerequisites: ['foundations-of-awareness'],
    objectives: [
      'Acessar camadas profundas de autopiedade',
      'Liberar bloqueios emocionais armazenados',
      'Promover regeneração energética',
      'Restaurar o campo áurico',
    ],
    practices: [
      {
        name: 'Centramento e Grounding',
        duration: 8,
        description: 'Conectar-se com a energia da terra e establecer centro interno.',
        technique: 'grounding and centering',
      },
      {
        name: 'Respiração Holotrópica',
        duration: 12,
        description: 'Respiração profunda ritmada para ativar processos de cura.',
        technique: 'holotropic breathing',
      },
      {
        name: 'Visualização de Luz Curadora',
        duration: 15,
        description: 'Invocar luz curadora para fluir através dos centros de energia.',
        technique: 'healing light visualization',
      },
      {
        name: 'Integração e Compaixão',
        duration: 10,
        description: 'Abraçar a si mesmo com compaixão e aceitar o processo de cura.',
        technique: 'self-compassion meditation',
      },
    ],
    integration: 'Execute esta prática durante lua cheia ou em momentos de necessidade emocional. Descanse bem depois.',
    warnings: ['Pode despertar emoções intensas. Pratique com suporte adequado se tiver histórico de trauma.'],
  },
  {
    id: 'sacred-connection',
    title: 'Conexão Sagrada',
    description: 'Prática devocional para estabelecer comunicação com o divino e fontes superiores de sabedoria.',
    category: 'sagrado',
    difficulty: 'advanced',
    duration: 60,
    prerequisites: ['foundations-of-awareness', 'deep-healing-meditation'],
    objectives: [
      'Estabelecer canal de comunicação com o sagrado',
      'Desenvolver capacidade de ouvir Guidance interior',
      'Cultivar gratidão e devoção genuínas',
      'Integrar sabedoria espiritual na vida cotidiana',
    ],
    practices: [
      {
        name: 'Purificação e Proteção',
        duration: 10,
        description: 'Limpar o espaço e o corpo energético antes da prática sagrada.',
        technique: 'spiritual purification',
      },
      {
        name: 'Invocação e Oração',
        duration: 12,
        description: 'Chamar a presença sagrada com sinceridade e abertura.',
        technique: 'sacred invocation',
      },
      {
        name: 'Escuta Silenciosa',
        duration: 20,
        description: 'Permanece em silêncio absoluto, aberto a receive Guidance.',
        technique: 'receptive meditation',
      },
      {
        name: 'Diálogo Sagrado',
        duration: 12,
        description: 'Dialogar internamente com a presença divina, fazendo perguntas e ouvindo respostas.',
        technique: 'active imagination',
      },
      {
        name: 'Ação de Graças',
        duration: 6,
        description: 'Expressar gratidão e comprometer-se com o caminho indicado.',
        technique: 'gratitude practice',
      },
    ],
    integration: 'Pratique em horários sagrados: ao amanhecer, entardecer ou lua cheia. Mantenha diário de Guidance.',
    warnings: ['Requer preparação emocional. Não force comunicação se não houver abertura genuína.'],
  },
  {
    id: 'sleep-preparation',
    title: 'Preparação para o Sono',
    description: 'Rotina noturna de relaxamento profundo para um sono restaurador e revigorante.',
    category: 'sono',
    difficulty: 'beginner',
    duration: 20,
    objectives: [
      'Libertar tensões acumuladas do dia',
      'Desacelerar a mente para repouso',
      'Preparar o corpo para sono profundo',
      'Estabelecer ritual noturno saudável',
    ],
    practices: [
      {
        name: 'Relaxamento Progressivo',
        duration: 8,
        description: 'Tensionar e relaxar sistematicamente cada grupo muscular.',
        technique: 'progressive muscle relaxation',
      },
      {
        name: 'Varredura de Pensamentos',
        duration: 5,
        description: 'Observar e liberar pensamentos preocupantes sem apego.',
        technique: 'thought diffusion',
      },
      {
        name: 'Descida ao Descanso',
        duration: 7,
        description: 'Guiar a consciência para estados cada vez mais profundos de paz.',
        technique: 'deep relaxation induction',
      },
    ],
    integration: 'Execute 30-60 minutos antes de dormir. Mantenha horários regulares. Evite telas antes da prática.',
  },
  {
    id: 'lucid-dreaming',
    title: 'Despertar no Sono',
    description: 'Técnicas avançadas para desenvolver consciência durante o sonho e explorar estados expandidos.',
    category: 'sono',
    difficulty: 'advanced',
    duration: 40,
    prerequisites: ['sleep-preparation'],
    objectives: [
      'Desenvolver consciência lucida durante o sonho',
      'Explorar o estado de sonho como território de aprendizado',
      'Integrar insights dos sonhos na vida desperta',
      'Utilizar sonhos para resolução de problemas',
    ],
    practices: [
      {
        name: 'Reality Checks',
        duration: 5,
        description: 'Praticar verificações de realidade durante o dia para criar hábito.',
        technique: 'lucid dreaming induction',
      },
      {
        name: 'Mnemônico de Intenção',
        duration: 5,
        description: 'Definir intenção clara de lembrar dos sonhos e tornar-se consciente.',
        technique: 'MILD technique',
      },
      {
        name: 'Relaxamento Profundo',
        duration: 15,
        description: 'Atingir estado de relaxamento profundo mantendo consciência.',
        technique: 'wake back to bed',
      },
      {
        name: 'Meditação onírica',
        duration: 15,
        description: 'Observar as imagens e sensações sem intervir, mantendo watcher awareness.',
        technique: 'dream observation',
      },
    ],
    integration: 'Pratique 4-6 horas após dormir, retornando ao sono com intenção. Mantenha diário de sonhos.',
    warnings: ['Pode causar fragmentação do sono inicialmente. Não pratique em momentos de instabilidade emocional.'],
  },
  {
    id: 'focus-activation',
    title: 'Ativação do Foco',
    description: 'Prática para desenvolver concentração poderosa e clareza mental para ações conscientes.',
    category: 'foco',
    difficulty: 'beginner',
    duration: 25,
    objectives: [
      'Ampliar capacidade de concentração sustentada',
      'Desenvolver clareza mental e presença',
      'Eliminar distrações e monkey mind',
      'Preparar a mente para tarefas importantes',
    ],
    practices: [
      {
        name: 'Single Point Focus',
        duration: 10,
        description: 'Focar em um ponto único de concentração por período prolongado.',
        technique: 'concentration meditation',
      },
      {
        name: 'Expansão e Contrção',
        duration: 8,
        description: 'Alternar entre expandir awareness e contrair foco, desenvolvendo flexibilidade mental.',
        technique: 'attention training',
      },
      {
        name: 'Clareza Mental',
        duration: 7,
        description: 'Atingir estado de mente clara, vazia de distrações, pronta para ação.',
        technique: 'mind clarity practice',
      },
    ],
    integration: 'Pratique antes de tarefas importantes ou estudos. Ideal pela manhã. Mantenha foco gradualmente.',
  },
  {
    id: 'manifestation-practice',
    title: 'Prática de Manifestação',
    description: 'Alinhar consciência com intenções e visualizações para criar a realidade desejada.',
    category: 'energia',
    difficulty: 'intermediate',
    duration: 35,
    prerequisites: ['focus-activation'],
    objectives: [
      'Alinhar energia pessoal com intenções claras',
      'Desenvolver visualização criativa',
      'Fortalecer crença na capacidade de manifestar',
      'Integrar práticas manifestadoras no cotidiano',
    ],
    practices: [
      {
        name: 'Desapego e Clareza',
        duration: 8,
        description: 'Limpar mind de crenças limitantes e estabelecer intenção clara.',
        technique: 'intention setting',
      },
      {
        name: 'Visualização Criativa',
        duration: 12,
        description: 'Criar imagem mental detalhada e emocionalmente carregada da realidade desejada.',
        technique: 'creative visualization',
      },
      {
        name: 'Afirmações Energizadas',
        duration: 8,
        description: 'Repetir afirmações com conviction e energia, sentindo-as como verdade presente.',
        technique: 'energy affirmation',
      },
      {
        name: 'Gratidão e Confiança',
        duration: 7,
        description: 'Agradecer como se já tivesse recebido, mantendo confiança no processo.',
        technique: 'gratitude practice',
      },
    ],
    integration: 'Pratique ao acordar com visualization detalhada. Repita afirmações várias vezes ao dia.',
  },
  {
    id: 'chakra-activation',
    title: 'Ativação dos Chakras',
    description: 'Prática sistemática de ativação e harmonização dos centros energéticos do corpo.',
    category: 'energia',
    difficulty: 'intermediate',
    duration: 40,
    objectives: [
      'Ativar e equilibrar os principais chakras',
      'Desbloquear canais energéticos',
      'Integrar energia vital através do sistema',
      'Promover autoconhecimento através da energia',
    ],
    practices: [
      {
        name: 'Respiração Energética',
        duration: 8,
        description: 'Respirar visualizando energia subindo pela coluna.',
        technique: 'kundalini breathing',
      },
      {
        name: 'Trabalho por Chakra',
        duration: 20,
        description: 'Focar em cada chakra, ativando com cor e звук específicos.',
        technique: 'chakra meditation',
      },
      {
        name: 'Integração do Sistema',
        duration: 12,
        description: 'Visualizar wheel de energia girando em harmonia, conectando todos os chakras.',
        technique: 'system integration',
      },
    ],
    integration: 'Pratique em sequência do básico ao coronário. Comece 2-3 vezes por semana.',
    warnings: ['Se sentir tontura ou desconforto, diminua a intensidade e grounde-se imediatamente.'],
  },
];

export function getGuides(): Guide[] {
  return [...guides];
}

export function getGuideById(id: string): Guide | undefined {
  return guides.find((g) => g.id === id);
}

export function getGuidesByCategory(category: Guide['category']): Guide[] {
  return guides.filter((g) => g.category === category);
}

export function getGuidesByDifficulty(difficulty: GuideDifficulty): Guide[] {
  return guides.filter((g) => g.difficulty === difficulty);
}

export function getGuideCategories(): Guide['category'][] {
  return ['cura', 'sono', 'foco', 'energia', 'sagrado'];
}