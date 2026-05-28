// Profile templates - skipped linting and formatting

export type ProfileType =
  | 'básico'
  | 'expandido'
  | 'profundo'
  | 'espiritual'
  | 'terapêutico'
  | 'mistérico';

export interface ProfileSection {
  ordem: number;
  título: string;
  prompt: string;
  requerido: boolean;
  tipoCampo?: 'texto' | 'textarea' | 'data' | 'hora' | 'select' | 'multi-select';
  opções?: string[];
}

export interface ProfileTemplate {
  id: string;
  nome: string;
  tipo: ProfileType;
  descrição: string;
  propósito: string;
  seções: ProfileSection[];
  áreas: string[];
  duraçãoEstimada?: string;
}

const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: 'perfil-básico',
    nome: 'Perfil Básico',
    tipo: 'básico',
    descrição: 'Essential profile setup for new users',
    propósito: 'Collect fundamental information for personalized readings and tracking',
    áreas: ['pessoal', 'nascimento'],
    duraçãoEstimada: '5 minutos',
    seções: [
      {
        ordem: 1,
        título: 'Nome Completo',
        prompt: 'Digite seu nome completo conforme desejado nos relatórios',
        requerido: true,
        tipoCampo: 'texto'
      },
      {
        ordem: 2,
        título: 'Data de Nascimento',
        prompt: 'Selecione sua data de nascimento (dd/mm/aaaa)',
        requerido: true,
        tipoCampo: 'data'
      },
      {
        ordem: 3,
        título: 'Hora de Nascimento',
        prompt: 'Informe a hora aproximada do nascimento, seknown. Deixe em branco se desconhecida.',
        requerido: false,
        tipoCampo: 'hora'
      },
      {
        ordem: 4,
        título: 'Local de Nascimento',
        prompt: 'Cidade e país onde você nasceu',
        requerido: true,
        tipoCampo: 'texto'
      },
      {
        ordem: 5,
        título: 'Gênero',
        prompt: 'Como você se identifica?',
        requerido: false,
        tipoCampo: 'select',
        opções: ['feminino', 'masculino', 'não-binário', 'prefiro não informar']
      }
    ]
  },
  {
    id: 'perfil-expandido',
    nome: 'Perfil Expandido',
    tipo: 'expandido',
    descrição: 'Enhanced profile with spiritual preferences and practices',
    propósito: 'Enable deeper personalization for rituals, meditations, and guidance',
    áreas: ['pessoal', 'nascimento', 'espiritual'],
    duraçãoEstimada: '10 minutos',
    seções: [
      {
        ordem: 1,
        título: 'Informações Básicas',
        prompt: 'Collect core birth data (name, date, time, location)',
        requerido: true,
        tipoCampo: 'textarea'
      },
      {
        ordem: 2,
        título: 'Tradição Espiritual',
        prompt: 'Qual tradição espiritual você considera sua principal?',
        requerido: false,
        tipoCampo: 'select',
        opções: [
          'Kabbalah',
          'Tarot',
          'Astrologia',
          'I Ching',
          'Wicca',
          'Candomblé',
          'Umbanda',
          'Budismo',
          'Hinduísmo',
          'outras'
        ]
      },
      {
        ordem: 3,
        título: 'Práticas Ativas',
        prompt: 'Quais práticas espirituais você Currently mantém?',
        requerido: false,
        tipoCampo: 'multi-select',
        opções: [
          'meditação',
          'rituais',
          'journaling',
          'orações',
          'mantras',
          'yoga',
          'astrologia',
          'tarot',
          'caminhadas naturezais'
        ]
      },
      {
        ordem: 4,
        título: 'Intenções de Vida',
        prompt: 'Quais são suas principais intenções ou focos de desenvolvimento espiritual?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 5,
        título: 'Preferências de Meditação',
        prompt: 'Como você prefere meditar? Duração, método, ambiente ideal.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 6,
        título: 'Ciclo Lunar Preferido',
        prompt: 'Você segue algum ciclo lunar específico para suas práticas?',
        requerido: false,
        tipoCampo: 'select',
        opções: ['sem preferência', 'lua nova', 'lua cheia', 'ambas', 'outro']
      }
    ]
  },
  {
    id: 'perfil-profundo',
    nome: 'Perfil Profundo',
    tipo: 'profundo',
    descrição: 'Comprehensive profile with ancestral, kármico, and developmental insights',
    propósito: 'Provide full-spectrum readings including ancestral work and karma mapping',
    áreas: ['pessoal', 'nascimento', 'espiritual', 'ancestral', 'karma'],
    duraçãoEstimada: '20 minutos',
    seções: [
      {
        ordem: 1,
        título: 'Dados Fundamentais',
        prompt: 'Collect complete birth data with time precision',
        requerido: true,
        tipoCampo: 'textarea'
      },
      {
        ordem: 2,
        título: 'Linhagem Espiritual',
        prompt: 'Descreva sua conexão com linhagens espirituais, gurus, mestres ou tradições familiares.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 3,
        título: 'Transmissão Ancestral',
        prompt: 'Você tem conhecimento de práticas espirituais transmitidas em sua família? Quais?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 4,
        título: 'Padrões Kármicos',
        prompt: 'Você identifica algum padrão recorrente em sua vida que acredita ser kármico?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 5,
        título: 'Tema de Vida Atual',
        prompt: 'Qual tema ou lição você sente que está trabalhando nesta vida?',
        requerido: true,
        tipoCampo: 'textarea'
      },
      {
        ordem: 6,
        título: 'Dons e Desafios',
        prompt: 'Liste o que você considera seus maiores dons espirituais e seus principais desafios.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 7,
        título: 'Missão de Alma',
        prompt: 'Se você sente uma missão de alma, descreva-a. Caso contrário, descreva seus sonhos de vida.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 8,
        título: 'Ciclos de Vida Importantes',
        prompt: 'Descreva eventos marcantes, transformações ou pontos de virada em sua vida.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 9,
        título: 'Relacionamentos Significativos',
        prompt: 'Liste pessoas importantes em sua jornada e como elas se conectam ao seu caminho.',
        requerido: false,
        tipoCampo: 'textarea'
      }
    ]
  },
  {
    id: 'perfil-espiritual',
    nome: 'Perfil Espiritual',
    tipo: 'espiritual',
    descrição: 'Profile focused on spiritual journey, practices, and awakening',
    propósito: 'Track spiritual development, awakening moments, and practice consistency',
    áreas: ['espiritual', 'práticas', 'despertar'],
    duraçãoEstimada: '15 minutos',
    seções: [
      {
        ordem: 1,
        título: 'Início da Jornada',
        prompt: 'Quando você começou seu caminho espiritual? O que despertou seu interesse?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 2,
        título: 'Experiências de Despertar',
        prompt: 'Descreva experiências transformadoras, visões, sincronicidades ou momentos de clareza.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 3,
        título: 'Práticas Diárias',
        prompt: 'Quais práticas você realiza daily? Com qual frequência?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 4,
        título: 'Espaços Sagrados',
        prompt: 'Você tem um altar ou espaço sagrado? Como é utilizado? Qual seu significado?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 5,
        título: 'Conexão com Elementos',
        prompt: 'Com quais elementos naturais você mais se conecta? Por quê?',
        requerido: false,
        tipoCampo: 'multi-select',
        opções: ['fogo', 'água', 'terra', 'ar', 'éter', 'energia espiritual']
      },
      {
        ordem: 6,
        título: 'Aliados Espirituais',
        prompt: 'Você trabalha com orixás, anjos, guias, spirits, ou outras entidades?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 7,
        título: 'Diário de Práticas',
        prompt: 'Se você mantém um registro de práticas, descreva como o organiza.',
        requerido: false,
        tipoCampo: 'textarea'
      }
    ]
  },
  {
    id: 'perfil-terapêutico',
    nome: 'Perfil Terapêutico',
    tipo: 'terapêutico',
    descrição: 'Profile for shadow work, therapy and integration',
    propósito: 'Support therapeutic work, trauma integration, and inner healing processes',
    áreas: ['terapêutico', 'cura', 'shadow'],
    duraçãoEstimada: '20 minutos',
    seções: [
      {
        ordem: 1,
        título: 'Motivação para Busca',
        prompt: 'O que te trouxe a este trabalho de autoconhecimento neste momento?',
        requerido: true,
        tipoCampo: 'textarea'
      },
      {
        ordem: 2,
        título: 'História de Vida',
        prompt: 'Forneça um breve overview de sua história, focado em momentos de transformação.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 3,
        título: 'Feridas Primárias',
        prompt: 'Você reconhece feridas emocionais que se repetem? Quais?',
        requerido: false,
        tipoCampo: 'multi-select',
        opções: [
          'abandono',
          'rejeição',
          'humilhação',
          'traição',
          'injustiça',
          'desamparo',
          'outra'
        ]
      },
      {
        ordem: 4,
        título: 'Padrões de Autossabotagem',
        prompt: 'Identifique momentos em que você se sabotou. O que você percebe sobre esses padrões?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 5,
        título: 'Trabalho com Sombras',
        prompt: 'Você já fez trabalho de sombra? O que descobriu sobre sua parte oculta?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 6,
        título: 'Recursos de Cura',
        prompt: 'Quais são seus principais recursos internos e externos para o processo de cura?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 7,
        título: 'Intenções de Terapia',
        prompt: 'Qual resultado você espera deste trabalho? O que significa mudança para você?',
        requerido: true,
        tipoCampo: 'textarea'
      },
      {
        ordem: 8,
        título: 'Limites e Boundaries',
        prompt: 'Descreva seus limites pessoais para o trabalho terapêutico.',
        requerido: false,
        tipoCampo: 'textarea'
      }
    ]
  },
  {
    id: 'perfil-mistérico',
    nome: 'Perfil Místico',
    tipo: 'mistérico',
    descrição: 'Advanced profile for initiations, pacts and occult practices',
    propósito: 'Enable tracking of initiations, pacts, and deep occult practices',
    áreas: ['mistérico', 'iniciação', 'oculto'],
    duraçãoEstimada: '25 minutos',
    seções: [
      {
        ordem: 1,
        título: 'Dados de Nascimento Verificados',
        prompt: 'Informe seus dados exatos, verificados com certidão whenever possible.',
        requerido: true,
        tipoCampo: 'textarea'
      },
      {
        ordem: 2,
        título: 'Iniciações Recebidas',
        prompt: 'Liste todas as iniciações formais que você recebeu, com datas aproximadas.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 3,
        título: 'Iniciações Autoconquistadas',
        prompt: 'Descreva experiências de auto-iniciação, visões, ou mortes experienciais.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 4,
        título: 'Pactos e Compromissos',
        prompt: 'Você tem pactos formais ou informais com entidades, guias, ou sua própria alma?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 5,
        título: 'Símbolos de Poder',
        prompt: 'Liste sigils, símbolos, nomes ou ferramentas que você utiliza em suas práticas.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 6,
        título: 'Aliados Confirmados',
        prompt: 'Quem são seus aliados espirituais? Qual a natureza dessas conexões?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 7,
        título: 'Proteção e Warding',
        prompt: 'Quais práticas de proteção você utiliza? Qual sua eficácia para você?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 8,
        título: 'Evocação e Conjuração',
        prompt: 'Descreva sua experiência com evictar entidades ou práticas de conjuração.',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 9,
        título: 'Grimórios e Textos',
        prompt: 'Você trabalha com grimórios, grimórios pessoais ou textos sagrados?',
        requerido: false,
        tipoCampo: 'textarea'
      },
      {
        ordem: 10,
        título: 'Trabalhos Realizados',
        prompt: 'Liste trabalhos específicos realizados: data, propósito, resultado percibido.',
        requerido: false,
        tipoCampo: 'textarea'
      }
    ]
  }
];

/**
 * Get all profile templates
 */
export function getTemplates(): ProfileTemplate[] {
  return PROFILE_TEMPLATES;
}

/**
 * Get profile template by ID
 */
export function getTemplateById(id: string): ProfileTemplate | undefined {
  return PROFILE_TEMPLATES.find(template => template.id === id);
}

/**
 * Get templates by type
 */
export function getTemplatesByType(tipo: ProfileType): ProfileTemplate[] {
  return PROFILE_TEMPLATES.filter(template => template.tipo === tipo);
}

/**
 * Get template names for quick reference
 */
export function getTemplateNames(): { id: string; nome: string }[] {
  return PROFILE_TEMPLATES.map(t => ({ id: t.id, nome: t.nome }));
}
