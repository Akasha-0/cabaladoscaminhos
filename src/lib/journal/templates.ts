// Journal templates - skipped linting and formatting

export type JournalType =
  | 'reflexão'
  | 'sonhos'
  | 'gratidão'
  | 'manifestação'
  | 'ciclos'
  | 'ancestralidade'
  | 'cura'
  | 'intuição'
  | 'meditação';

export interface JournalSection {
  ordem: number;
  título: string;
  prompt: string;
  duração?: string;
  formato?: string;
}

export interface JournalTemplate {
  id: string;
  nome: string;
  tipo: JournalType;
  descrição: string;
  propósito: string;
  seções: JournalSection[];
  melhorMomento?: string;
  duraçãoEstimada?: string;
}

const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 'reflexao-diária',
    nome: 'Reflexão Diária',
    tipo: 'reflexão',
    descrição: 'Practice for daily introspection and conscious awareness',
    propósito: 'Develop self-awareness and track personal growth patterns',
    seções: [
      {
        ordem: 1,
        título: 'Como estou me sentindo hoje?',
        prompt: 'Descreva seu estado emocional atual com honestidade. Observe sem julgar.',
        duração: '5 minutos',
        formato: 'narrativa livre'
      },
      {
        ordem: 2,
        título: 'O que chamou minha atenção hoje?',
        prompt: 'Reflita sobre momentos, pensamentos ou experiências que se destacaram.',
        duração: '5 minutos',
        formato: 'lista ou narrativa'
      },
      {
        ordem: 3,
        título: 'O que aprendi hoje?',
        prompt: 'Identifique pelo menos uma lição, insight ou compreensão nova.',
        duração: '3 minutos',
        formato: 'frase ou parágrafo'
      },
      {
        ordem: 4,
        título: 'O que posso melhorar amanhã?',
        prompt: 'Sem autocrítica, identifique uma pequena ação para o próximo dia.',
        duração: '2 minutos',
        formato: 'intenção'
      }
    ],
    melhorMomento: 'antes de dormir',
    duraçãoEstimada: '15 minutos'
  },
  {
    id: 'exploracao-sonhos',
    nome: 'Exploração de Sonhos',
    tipo: 'sonhos',
    descrição: 'Practice for dream interpretation and subconscious exploration',
    propósito: 'Connect with subconscious messages and inner wisdom',
    seções: [
      {
        ordem: 1,
        título: 'Registro do Sonho',
        prompt: 'Descreva o sonho em detalhes, incluindo cenários, pessoas, emoções e objetos.',
        duração: '10 minutos',
        formato: 'narrativa descritiva'
      },
      {
        ordem: 2,
        título: 'Símbolos e Imagética',
        prompt: 'Liste os símbolos, cores, números ou imagens marcantes. O que eles evocam em você?',
        duração: '5 minutos',
        formato: 'lista com anotações'
      },
      {
        ordem: 3,
        título: 'Conexão com a Vida Waking',
        prompt: 'Como os elementos do sonho se relacionam com sua vida atual? Há padrões ou mensagens?',
        duração: '5 minutos',
        formato: 'reflexão guiada'
      },
      {
        ordem: 4,
        título: 'Intenção para Próxima Noite',
        prompt: 'Defina uma intenção ou pergunta para enviar ao seu subconsciente antes de dormir.',
        duração: '2 minutos',
        formato: 'intenção'
      }
    ],
    melhorMomento: 'ao despertar',
    duraçãoEstimada: '20 minutos'
  },
  {
    id: 'gratidao-expandida',
    nome: 'Gratidão Expandida',
    tipo: 'gratidão',
    descrição: 'Practice for cultivating appreciation and abundance consciousness',
    propósito: 'Shift focus from lack to abundance, raising vibration',
    seções: [
      {
        ordem: 1,
        título: 'Gratidões do Dia',
        prompt: 'Liste pelo menos 5 coisas pelas quais você é grato hoje. Seja específico.',
        duração: '5 minutos',
        formato: 'lista numerada'
      },
      {
        ordem: 2,
        título: 'Por que isso importa?',
        prompt: 'Para cada gratidão, escreva brevemente por que ela é significativa para você.',
        duração: '5 minutos',
        formato: 'anotações'
      },
      {
        ordem: 3,
        título: 'Gratidão por Desafios',
        prompt: 'Identifique um desafio recente e encontre algo de valor que ele trouxe ou ensinou.',
        duração: '5 minutos',
        formato: 'narrativa'
      },
      {
        ordem: 4,
        título: 'Gratidão Futura',
        prompt: 'Escreva sobre algo que você ainda não tem, mas sente gratidão antecipada por ele.',
        duração: '3 minutos',
        formato: 'manifestação'
      }
    ],
    melhorMomento: 'manhã',
    duraçãoEstimada: '15 minutos'
  },
  {
    id: 'manifestacao-criativa',
    nome: 'Manifestação Criativa',
    tipo: 'manifestação',
    descrição: 'Practice for conscious creation and desire clarification',
    propósito: 'Clarify desires and align with manifestations',
    seções: [
      {
        ordem: 1,
        título: 'Desejo Principal',
        prompt: 'O que você deseja manifestar? Escreva como se já fosse real, em tempo presente.',
        duração: '5 minutos',
        formato: 'narrativa vividamente'
      },
      {
        ordem: 2,
        título: 'Detalhes Sensoriais',
        prompt: 'Como isso se sente, parece, soa? Detalhe ao máximo a experiência vivida.',
        duração: '5 minutos',
        formato: 'descrição sensorial'
      },
      {
        ordem: 3,
        título: 'Por que você merece isso?',
        prompt: 'Escreva razões pelas quais você merece receber isso. Desafie crenças limitantes.',
        duração: '5 minutos',
        formato: 'lista de razões'
      },
      {
        ordem: 4,
        título: 'Ação Alignada',
        prompt: 'Que pequena ação você pode tomar hoje em alinhamento com esse desejo?',
        duração: '3 minutos',
        formato: 'intenção + ação'
      }
    ],
    melhorMomento: 'lua crescente ou cheia',
    duraçãoEstimada: '20 minutos'
  },
  {
    id: 'ciclos-lunares',
    nome: 'Ciclos Lunares',
    tipo: 'ciclos',
    descrição: 'Practice for lunar cycle tracking and energy alignment',
    propósito: 'Align with natural cycles and track transformative patterns',
    seções: [
      {
        ordem: 1,
        título: 'Fase Lunar Atual',
        prompt: 'Em que fase lunar estamos? Como você percebe essa energia afetando você?',
        duração: '3 minutos',
        formato: 'observação'
      },
      {
        ordem: 2,
        título: 'Energia do Ciclo',
        prompt: 'Que tipo de energia este ciclo traz? O que está favorecido ou sendo destacados?',
        duração: '5 minutos',
        formato: 'análise'
      },
      {
        ordem: 3,
        título: 'Intenção do Ciclo',
        prompt: 'Que intenção ou foco você escolhe para este ciclo lunar?',
        duração: '5 minutos',
        formato: 'intenção'
      },
      {
        ordem: 4,
        título: 'Sinal de Fechamento',
        prompt: 'Como você saberá que este ciclo cumpriu seu propósito? Descreva a completion.',
        duração: '3 minutos',
        formato: 'visualização'
      }
    ],
    melhorMomento: 'início de cada fase lunar',
    duraçãoEstimada: '15 minutos'
  },
  {
    id: 'ancestralidade-raizes',
    nome: 'Ancestralidade e Raízes',
    tipo: 'ancestralidade',
    descrição: 'Practice for connecting with lineage and ancestral wisdom',
    propósito: 'Honor ancestors and access inherited strengths',
    seções: [
      {
        ordem: 1,
        título: 'Gratidão Ancestral',
        prompt: 'A quem da sua linhagem você é grato? Liste pessoas, qualidades ou ensinamentos herdados.',
        duração: '5 minutos',
        formato: 'lista + gratidão'
      },
      {
        ordem: 2,
        título: 'Padrões Herdados',
        prompt: 'Que padrões, crenças ou comportamentos você reconhece como parte da sua linhagem?',
        duração: '5 minutos',
        formato: 'observação sem julgamento'
      },
      {
        ordem: 3,
        título: 'Escolhas Conscious',
        prompt: 'Quais desses padrões você escolhe manter e quais você escolhe transformar?',
        duração: '5 minutos',
        formato: 'declaração'
      },
      {
        ordem: 4,
        título: 'Mensagem aos Ancestrais',
        prompt: 'Se você pudesse enviar uma mensagem aos seus ancestrais, o que diria?',
        duração: '5 minutos',
        formato: 'carta'
      }
    ],
    melhorMomento: 'datas significativas ou ancestral',
    duraçãoEstimada: '20 minutos'
  },
  {
    id: 'cura-interna',
    nome: 'Cura Interna',
    tipo: 'cura',
    descrição: 'Practice for emotional healing and inner child work',
    propósito: 'Process wounds and nurture inner wounded parts',
    seções: [
      {
        ordem: 1,
        título: 'Reconhecimento',
        prompt: 'Que ferida emocional ou dor está buscando atenção agora? Descreva sem analisar.',
        duração: '5 minutos',
        formato: 'narrativa'
      },
      {
        ordem: 2,
        título: 'Quando Começou?',
        prompt: 'Quando você percebeu essa dor pela primeira vez? Que circunstâncias a cercavam?',
        duração: '5 minutos',
        formato: 'memória'
      },
      {
        ordem: 3,
        título: 'Criança Interior',
        prompt: 'Se essa dor tivesse uma idade, qual seria? O que essa parte de você precisa ouvir?',
        duração: '5 minutos',
        formato: 'diálogo interno'
      },
      {
        ordem: 4,
        título: 'Mensagem de Cura',
        prompt: 'Que mensagem de amor e aceitação você oferece a essa parte ferida agora?',
        duração: '5 minutos',
        formato: 'afirmação'
      }
    ],
    melhorMomento: 'quando sentir necessidade',
    duraçãoEstimada: '20 minutos'
  },
  {
    id: 'intuição-despertar',
    nome: 'Despertar Intuitivo',
    tipo: 'intuição',
    descrição: 'Practice for developing intuition and inner guidance',
    propósito: 'Strengthen intuitive muscle and trust inner knowing',
    seções: [
      {
        ordem: 1,
        título: 'Mensagem do Corpo',
        prompt: 'Sem pensar, escaneie seu corpo agora. Onde você sente sensações? O que elas comunicam?',
        duração: '5 minutos',
        formato: 'observação corporal'
      },
      {
        ordem: 2,
        título: 'Primeiro Pensamento',
        prompt: 'Qual é a primeira coisa que veio à sua mente quando você pensou em sua situação atual?',
        duração: '3 minutos',
        formato: 'registro imediato'
      },
      {
        ordem: 3,
        título: 'Confiança na Intuição',
        prompt: 'Houve um momento em que você seguiu sua intuição e foi bem? Descreva.',
        duração: '5 minutos',
        formato: 'memória positively'
      },
      {
        ordem: 4,
        título: 'Pergunta Intuitiva',
        prompt: 'Que pergunta você tem para sua intuição agora? Escreva e depois, sem pensar, responda.',
        duração: '5 minutos',
        formato: 'Q&A automático'
      }
    ],
    melhorMomento: 'manhã cedo ou antes de decisões importantes',
    duraçãoEstimada: '15 minutos'
  },
  {
    id: 'meditacao-reflexiva',
    nome: 'Meditação Reflexiva',
    tipo: 'meditação',
    descrição: 'Practice for contemplative meditation and presence',
    propósito: 'Cultivate presence and deepen meditation insights',
    seções: [
      {
        ordem: 1,
        título: 'Antes da Meditação',
        prompt: 'Como você está chegando agora? Observe seu estado mental e emocional antes de começar.',
        duração: '3 minutos',
        formato: 'check-in'
      },
      {
        ordem: 2,
        título: 'Durante',
        prompt: 'Se você meditou, descreva o que surgiu: sensações, pensamentos, insights, resistências.',
        duração: '10 minutos',
        formato: 'observação'
      },
      {
        ordem: 3,
        título: 'Insight Principal',
        prompt: 'Se há um insight ou compreensão que emergiu, qual é?',
        duração: '5 minutos',
        formato: 'insight'
      },
      {
        ordem: 4,
        título: 'Integração',
        prompt: 'Como você pode llevar essa experiência para o resto do seu dia?',
        duração: '2 minutos',
        formato: 'intenção'
      }
    ],
    melhorMomento: 'após meditação',
    duraçãoEstimada: '20 minutos'
  }
];

/**
 * Get all journal templates
 */
export function getTemplates(): JournalTemplate[] {
  return JOURNAL_TEMPLATES;
}

/**
 * Get journal template by ID
 */
export function getTemplateById(id: string): JournalTemplate | undefined {
  return JOURNAL_TEMPLATES.find(template => template.id === id);
}

/**
 * Get templates by type
 */
export function getTemplatesByType(tipo: JournalType): JournalTemplate[] {
  return JOURNAL_TEMPLATES.filter(template => template.tipo === tipo);
}

/**
 * Get template names for quick reference
 */
export function getTemplateNames(): { id: string; nome: string }[] {
  return JOURNAL_TEMPLATES.map(t => ({ id: t.id, nome: t.nome }));
}
