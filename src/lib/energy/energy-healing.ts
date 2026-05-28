export interface HealingMethod {
  id: string;
  name: string;
  description: string;
  applications: string[];
}

export interface HealingResult {
  method: HealingMethod;
  recommendation: string;
  duration: string;
}

const HEALING_METHODS: HealingMethod[] = [
  {
    id: 'reiki',
    name: 'Reiki',
    description: 'Canalização de energia vital universal através das mãos para equilibrar chakras e centros de energia.',
    applications: ['Equilíbrio emocional', 'Alívio de tensões', 'Harmonização dos chakras'],
  },
  {
    id: 'cristal',
    name: 'Terapia com Cristais',
    description: 'Utilização de cristais e pedras preciosas para limpar, carregar e harmonizar o campo energético.',
    applications: ['Limpeza auricular', 'Carregamento energético', 'Ativação de centros de poder'],
  },
  {
    id: 'sagrada',
    name: 'Geometria Sagrada',
    description: 'Aplicação de padrões geométricos sagrados para restabelecer a harmonia frequencies do campo áurico.',
    applications: ['Reconexão com padrões cósmicos', 'Reprogramação celular', 'Expansão da consciência'],
  },
  {
    id: 'som',
    name: 'Terapia Sonara',
    description: 'Uso de bowls tibetanos, diapasões e sons harmônicos para dissolver bloqueios energéticos.',
    applications: ['Dissolução de bloqueios', 'Ressonância celular', 'Profundo relaxamento'],
  },
  {
    id: 'chakras',
    name: 'Alinhamento de Chakras',
    description: 'Técnica específica para equilibrar e harmonizar os sete chakras principais e seus meridianos.',
    applications: ['Equilíbrio dos elementos', 'Liberação de memórias', 'Fortalecimento do campo áurico'],
  },
];

export function getHealing(methodId?: string): HealingResult | HealingMethod[] {
  if (!methodId) {
    return HEALING_METHODS;
  }

  const method = HEALING_METHODS.find((m) => m.id === methodId);
  if (!method) {
    return [];
  }

  const recommendations: Record<string, string> = {
    reiki: 'Sessão de 45-60 minutos com imposição das mãos sobre os centros de energia. Ideal para equilíbrio geral.',
    cristal: 'Colocação estratégica de cristais sobre o corpo por 20-30 minutos, seguida de meditação guiada.',
    sagrada: 'Visualização ativa de mandalas e padrões geométricos por 30 minutos com respiração consciente.',
    som: 'Exposição aos sons harmônicos por 40-50 minutos em estado de relaxamento profundo.',
    chakras: 'Trabalho focado de 30-40 minutos em cada chakra com técnicas específicas de desbloqueio.',
  };

  const durations: Record<string, string> = {
    reiki: '45-60 minutos',
    cristal: '20-30 minutos',
    sagrada: '30 minutos',
    som: '40-50 minutos',
    chakras: '30-40 minutos',
  };

  return {
    method,
    recommendation: recommendations[methodId] ?? 'Sessão personalizada recomendada.',
    duration: durations[methodId] ?? '30-60 minutos',
  };
}
