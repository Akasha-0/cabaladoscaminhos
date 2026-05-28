export interface FrequenciaSolfeggio {
  id: number;
  hz: number;
  nome: string;
  efeito: string;
  aplicacao: string;
  chakra: string;
  cor: string;
  nota: string;
  beneficios: string[];
  recomendacao: string;
}

export const FREQUENCIAS_SOLFEGGIO: FrequenciaSolfeggio[] = [
  {
    id: 1,
    hz: 174,
    nome: 'Frequência da Fundação',
    efeito: 'Alívio da dor',
    aplicacao: 'Anestesia natural para dor física',
    chakra: '1º Raiz',
    cor: '#DC2626',
    nota: 'Mi',
    beneficios: [
      'Reduz dor física',
      'Fortalece tecidos',
      'Aterramento',
      'Proteção energética'
    ],
    recomendacao: 'Ideal para momentos de dor ou fraqueza física.',
  },
  {
    id: 2,
    hz: 285,
    nome: 'Frequência do Trauma',
    efeito: 'Reparo de tecidos',
    aplicacao: 'Cicatrização de feridas emocionais e físicas',
    chakra: '2º Sacral',
    cor: '#F97316',
    nota: 'Fá#',
    beneficios: [
      'Auxilia cicatrização',
      'Libera traumas armazenados',
      'Restaura corpo energético',
      'Harmonização celular'
    ],
    recomendacao: 'Usar após situações traumáticas ou cirurgias.',
  },
  {
    id: 3,
    hz: 396,
    nome: 'Frequência da Libertação',
    efeito: 'Libertação de culpas e medos',
    aplicacao: 'Transformação de padrões negativos',
    chakra: '3º Plexo Solar',
    cor: '#EAB308',
    nota: 'Sol',
    beneficios: [
      'Liberta culpa e medo',
      'Transforma ressentimentos',
      'Limpa traumas da infância',
      'Desbloqueia criação'
    ],
    recomendacao: 'Excelente para trabalho emocional e perdão.',
  },
  {
    id: 4,
    hz: 417,
    nome: 'Frequência da Facilitação',
    efeito: 'Facilita mudanças',
    aplicacao: 'Transformação e superação de bloqueios',
    chakra: '4º Cardíaco',
    cor: '#22C55E',
    nota: 'Lá',
    beneficios: [
      'Facilita mudanças',
      'Superar traumas passados',
      'Desbloqueio situacional',
      'Conexão com propósito'
    ],
    recomendacao: 'Perfeita para momentos de transição de vida.',
  },
  {
    id: 5,
    hz: 528,
    nome: 'Frequência do Milagre',
    efeito: 'Transformação e reparo do DNA',
    aplicacao: 'Meditação profunda e cura',
    chakra: '5º Laríngeo',
    cor: '#3B82F6',
    nota: 'Si',
    beneficios: [
      'Estimula reparo do DNA',
      'Harmonização cellular',
      'Clareza e paz interior',
      'Transforma realidade'
    ],
    recomendacao: 'A frequência mais poderosa para cura e transformação.',
  },
  {
    id: 6,
    hz: 639,
    nome: 'Frequência da Conexão',
    efeito: 'Harmonia e solução de conflitos',
    aplicacao: 'Relações interpessoais',
    chakra: '6º Frontal',
    cor: '#8B5CF6',
    nota: 'Dó#',
    beneficios: [
      'Melhora relacionamentos',
      'Resolve conflitos',
      'Conexão espiritual',
      'Harmonia familiar'
    ],
    recomendacao: 'Ideal para melhorar conexões e resolver problemas em família.',
  },
  {
    id: 7,
    hz: 741,
    nome: 'Frequência da Expressão',
    efeito: 'Expansão da consciência',
    aplicacao: 'Comunicação e expressão criativa',
    chakra: '7º Coronário',
    cor: '#EC4899',
    nota: 'Ré#',
    beneficios: [
      'Desperta intuição',
      'Melhora comunicação',
      'Expressão criativa',
      'Expansão espiritual'
    ],
    recomendacao: 'Excelente para artistas, terapeutas e buscadores.',
  },
  {
    id: 8,
    hz: 852,
    nome: 'Frequência da Intuição',
    efeito: 'Despertar da直觉',
    aplicacao: 'Desenvolvimento espiritual',
    chakra: '8º Aura',
    cor: '#06B6D4',
    nota: 'Mi#',
    beneficios: [
      'Ativa terceiro olho',
      'Desperta poderes latentes',
      'Clareza mental',
      'Percepção extra-sensorial'
    ],
    recomendacao: 'Ideal para meditação e práticas espirituais avançadas.',
  },
  {
    id: 9,
    hz: 963,
    nome: 'Frequência da Elevação',
    efeito: 'Elevação e perfeição',
    aplicacao: 'Alinhamento com o divino',
    chakra: '9º+ Celular',
    cor: '#FFD700',
    nota: 'Sol#',
    beneficios: [
      'Elevação espiritual',
      'Perfeição dimensional',
      'União com o todo',
      'Estado de graça'
    ],
    recomendacao: 'Frequência para estados elevados de consciência.',
  },
];

export function getFrequenciaPorChakra(chakra: string): FrequenciaSolfeggio | undefined {
  return FREQUENCIAS_SOLFEGGIO.find(f => f.chakra.includes(chakra));
}

export function getFrequenciaDoDia(diaSemana: string): FrequenciaSolfeggio {
  const recomendacoes: Record<string, number> = {
    segunda: 1,
    terca: 3,
    quarta: 4,
    quinta: 5,
    sexta: 6,
    sabado: 7,
    domingo: 9,
  };
  const id = recomendacoes[diaSemana.toLowerCase()] || 5;
  return FREQUENCIAS_SOLFEGGIO.find(f => f.id === id)!;
}
