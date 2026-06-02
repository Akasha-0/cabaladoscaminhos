// @ts-nocheck
// SKIP_LINT

/**
 * Notificacoes Data Module
 * Notification settings and configurations for the Cabala dos Caminhos system
 */

export interface NotificacaoConfig {
  id: string;
  tipo: 'ritual' | 'orixa' | 'meditacao' | 'afirmacao' | 'horoscopo' | 'energia' | 'lembrete' | 'sistema';
  titulo: string;
  mensagem: string;
  ativo: boolean;
  frequencia: 'unico' | 'diario' | 'semanal' | 'mensal' | 'personalizado';
  horario?: string;
  diasSemana?: number[];
  diaMes?: number;
  hora?: number;
  minuto?: number;
  icone: string;
  cor: string;
  categoria: string;
}

export interface NotificacaoTemplate {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  templates: {
    titulo: string;
    mensagem: string;
  }[];
}

const NOTIFICACOES_DATA = {
  config: [
    {
      id: 'ritual-diario',
      tipo: 'ritual',
      titulo: 'Hora do Ritual',
      mensagem: 'É hora de realizar seu ritual diário de conexão espiritual.',
      ativo: true,
      frequencia: 'diario',
      horario: '06:00',
      icone: '🕯️',
      cor: '#FF9800',
      categoria: 'praticas'
    },
    {
      id: 'orixa-protecao',
      tipo: 'orixa',
      titulo: 'Proteção de Orixá',
      mensagem: 'Orixá oferece proteção e guidance em seu caminho espiritual.',
      ativo: true,
      frequencia: 'semanal',
      diasSemana: [1],
      hora: 8,
      minuto: 0,
      icone: '🛡️',
      cor: '#9C27B0',
      categoria: 'orixas'
    },
    {
      id: 'meditacao-manha',
      tipo: 'meditacao',
      titulo: 'Meditação Matinal',
      mensagem: 'Comece seu dia com silêncio interior e reflexão.',
      ativo: true,
      frequencia: 'diario',
      horario: '07:00',
      icone: '🧘',
      cor: '#4CAF50',
      categoria: 'praticas'
    },
    {
      id: 'afirmacao-positiva',
      tipo: 'afirmacao',
      titulo: 'Afirmação do Dia',
      mensagem: 'Repita sua afirmação positiva para manifestar suas intenções.',
      ativo: true,
      frequencia: 'diario',
      horario: '09:00',
      icone: '✨',
      cor: '#00BCD4',
      categoria: 'manifestacao'
    },
    {
      id: 'horoscopo-diario',
      tipo: 'horoscopo',
      titulo: 'Horóscopo Diário',
      mensagem: 'Descubra as energias que influenciam seu dia hoje.',
      ativo: true,
      frequencia: 'diario',
      horario: '08:00',
      icone: '⭐',
      cor: '#3F51B5',
      categoria: 'astrologia'
    },
    {
      id: 'energia-lua',
      tipo: 'energia',
      titulo: 'Energia Lunar',
      mensagem: 'A energia da lua está influênciando suas práticas espirituais.',
      ativo: true,
      frequencia: 'diario',
      horario: '20:00',
      icone: '🌙',
      cor: '#673AB7',
      categoria: 'ciclos'
    },
    {
      id: 'ritual-ogum',
      tipo: 'ritual',
      titulo: 'Saudação a Ogum',
      mensagem: 'Honre Ogum, senhor das batalhas e protector dos caminhos.',
      ativo: false,
      frequencia: 'semanal',
      diasSemana: [3],
      hora: 6,
      minuto: 0,
      icone: '⚔️',
      cor: '#F44336',
      categoria: 'orixas'
    },
    {
      id: 'ritual-oxum',
      tipo: 'ritual',
      titulo: 'Saudação a Oxum',
      mensagem: 'Honre Oxum, senhora das águas e do amor.',
      ativo: false,
      frequencia: 'semanal',
      diasSemana: [5],
      hora: 6,
      minuto: 0,
      icone: '💧',
      cor: '#E91E63',
      categoria: 'orixas'
    },
    {
      id: 'ritual-iansa',
      tipo: 'ritual',
      titulo: 'Saudação a Iansã',
      mensagem: 'Honre Iansã, senhora dos ventos e das tempestades.',
      ativo: false,
      frequencia: 'semanal',
      diasSemana: [4],
      hora: 6,
      minuto: 0,
      icone: '🌪️',
      cor: '#FF5722',
      categoria: 'orixas'
    },
    {
      id: 'ritual-obatala',
      tipo: 'ritual',
      titulo: 'Saudação a Obatalá',
      mensagem: 'Honre Obatalá, senhor da pureza e da criação.',
      ativo: false,
      frequencia: 'semanal',
      diasSemana: [0],
      hora: 6,
      minuto: 0,
      icone: '👑',
      cor: '#FFFFFF',
      categoria: 'orixas'
    },
    {
      id: 'ritual-xango',
      tipo: 'ritual',
      titulo: 'Saudação a Xangô',
      mensagem: 'Honre Xangô, senhor da justiça e dos raios.',
      ativo: false,
      frequencia: 'semanal',
      diasSemana: [6],
      hora: 6,
      minuto: 0,
      icone: '⚡',
      cor: '#F44336',
      categoria: 'orixas'
    },
    {
      id: 'ritual-yemoja',
      tipo: 'ritual',
      titulo: 'Saudação a Yemoja',
      mensagem: 'Honre Yemoja, mãe de todos os orixás.',
      ativo: false,
      frequencia: 'semanal',
      diasSemana: [1],
      hora: 6,
      minuto: 0,
      icone: '🌊',
      cor: '#2196F3',
      categoria: 'orixas'
    },
    {
      id: 'lembrete-jornal',
      tipo: 'lembrete',
      titulo: 'Registro no Diário Espiritual',
      mensagem: 'Registre suas reflexões e experiências do dia.',
      ativo: true,
      frequencia: 'diario',
      horario: '21:00',
      icone: '📝',
      cor: '#795548',
      categoria: 'praticas'
    },
    {
      id: 'sincronizacao',
      tipo: 'sistema',
      titulo: 'Sincronização de Dados',
      mensagem: 'Seus dados estão sincronizados com sucesso.',
      ativo: true,
      frequencia: 'unico',
      icone: '🔄',
      cor: '#607D8B',
      categoria: 'sistema'
    }
  ] as NotificacaoConfig[],

  templates: [
    {
      id: 'ritual-matinal',
      nome: 'Ritual Matinal',
      descricao: 'Notificações para iniciar o dia com práticas espirituais',
      tipo: 'ritual',
      templates: [
        { titulo: 'Despertar Espiritual', mensagem: 'Abrace um novo dia com gratidão e intenção.' },
        { titulo: 'Conexão com Orixá', mensagem: 'Dedique um momento para conectar com seu orixá protetor.' },
        { titulo: 'Respiração Consciente', mensagem: 'Comece com três respirações profundas para centrar sua energia.' }
      ]
    },
    {
      id: 'ritual-noturno',
      nome: 'Ritual Noturno',
      descricao: 'Notificações para encerrar o dia com práticas espirituais',
      tipo: 'ritual',
      templates: [
        { titulo: 'Gratidão Noturna', mensagem: 'Agradeça pelas bênçãos recebidas durante o dia.' },
        { titulo: 'Reflexão Interior', mensagem: 'Reserve um momento para refletir sobre suas experiências.' },
        { titulo: 'Proteção do Sono', mensagem: 'Peça proteção para um sono tranquilo e restaurador.' }
      ]
    },
    {
      id: 'afirmacoes-diarias',
      nome: 'Afirmações Diárias',
      descricao: 'Afirmações positivas para fortalecer sua intenção',
      tipo: 'afirmacao',
      templates: [
        { titulo: 'Abundância', mensagem: 'Eu abundejo em todas as áreas da minha vida.' },
        { titulo: 'Saúde', mensagem: 'Meu corpo é saudável e minha mente é clara.' },
        { titulo: 'Amor', mensagem: 'Eu sou digno de amor e emanio amor a todos.' },
        { titulo: 'Proteção', mensagem: 'Estou protegido por forças espirituais bienveantes.' },
        { titulo: 'Sabedoria', mensagem: 'A sabedoria divina flui através de mim.' }
      ]
    },
    {
      id: 'lembretes-espirituais',
      nome: 'Lembretes Espirituais',
      descricao: 'Lembretes para manter a prática espiritual',
      tipo: 'lembrete',
      templates: [
        { titulo: 'Hidrate-se', mensagem: 'Beba água e ofereça uma pequena porção aos orixás.' },
        { titulo: 'Movimento', mensagem: 'Alongue-se e reconecte-se com seu corpo físico.' },
        { titulo: 'Natureza', mensagem: 'Passeie na natureza e observe a presença divina.' },
        { titulo: 'Compaixão', mensagem: 'Pratique compaixão consigo mesmo e com os outros.' }
      ]
    }
  ] as NotificacaoTemplate[]
};

export function getData() {
  return NOTIFICACOES_DATA;
}

function getConfigs(): NotificacaoConfig[] {
  return NOTIFICACOES_DATA.config;
}

function getTemplates(): NotificacaoTemplate[] {
  return NOTIFICACOES_DATA.templates;
}

function getActiveConfigs(): NotificacaoConfig[] {
  return NOTIFICACOES_DATA.config.filter(c => c.ativo);
}

function getConfigsByType(tipo: NotificacaoConfig['tipo']): NotificacaoConfig[] {
  return NOTIFICACOES_DATA.config.filter(c => c.tipo === tipo);
}

function getConfigsByCategory(categoria: string): NotificacaoConfig[] {
  return NOTIFICACOES_DATA.config.filter(c => c.categoria === categoria);
}

export default getData;
