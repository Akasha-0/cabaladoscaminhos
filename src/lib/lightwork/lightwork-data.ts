// Lightwork data

export interface LightworkData {
  id: string
  name: string
  description: string
  category: string
  active: boolean
}

const LIGHTWORK_DATASET: LightworkData[] = [
  {
    id: 'lw-001',
    name: 'Clareza Interior',
    description: 'Despertar da consciência através da purificação mental',
    category: 'consciencia',
    active: true,
  },
  {
    id: 'lw-002',
    name: 'Ancoragem Sagrada',
    description: 'Conexão profunda com a energia terrestre e celestial',
    category: 'ancoragem',
    active: true,
  },
  {
    id: 'lw-003',
    name: 'Expansão Aurica',
    description: 'Ampliação do campo energético pessoal',
    category: 'energia',
    active: true,
  },
  {
    id: 'lw-004',
    name: 'Integração Shadow',
    description: 'Unificação das partes ocultas do ser',
    category: 'shadow',
    active: true,
  },
  {
    id: 'lw-005',
    name: 'Portal de Manifestação',
    description: 'Canalização de intenções para a realidade',
    category: 'manifestacao',
    active: true,
  },
  {
    id: 'lw-006',
    name: 'Caminho do Meio',
    description: 'Equilíbrio entre extremos, harmonia dual',
    category: 'equilibrio',
    active: true,
  },
  {
    id: 'lw-007',
    name: 'Fogo Transmutador',
    description: 'Transformação energética de baixa para alta frequência',
    category: 'transmutacao',
    active: true,
  },
  {
    id: 'lw-008',
    name: 'Luz da Verdade',
    description: 'Revelação e transparência interior',
    category: 'verdade',
    active: true,
  },
  {
    id: 'lw-009',
    name: 'Sincronicidade Ativa',
    description: 'Alinhamento com sinais e coincidências significativas',
    category: 'sincronicidade',
    active: true,
  },
  {
    id: 'lw-010',
    name: 'Unidade Source',
    description: 'Retorno à fonte original de toda consciência',
    category: 'unidade',
    active: true,
  },
]

export function getData(): LightworkData[] {
  return LIGHTWORK_DATASET
}

export function getDataById(id: string): LightworkData | undefined {
  return LIGHTWORK_DATASET.find((lw) => lw.id === id)
}

export function getDataByCategory(category: string): LightworkData[] {
  return LIGHTWORK_DATASET.filter((lw) => lw.category === category)
}

export function getActiveData(): LightworkData[] {
  return LIGHTWORK_DATASET.filter((lw) => lw.active)
}
