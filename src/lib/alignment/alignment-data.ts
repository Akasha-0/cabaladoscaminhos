export interface AlignmentData {
  id: string;
  name: string;
  description: string;
  traits: string[];
  symbols: string[];
  colors: string[];
}

const data: AlignmentData[] = [
  {
    id: 'sol-orion',
    name: 'Sol de Orion',
    description: 'Estrela central do sistema, fonte de luz e guia para os caminhantes',
    traits: ['claridade', 'direção', 'energia vital', 'verdade'],
    symbols: ['sol', 'estrela', 'luz'],
    colors: ['#FFD700', '#FFA500'],
  },
  {
    id: 'lua-orion',
    name: 'Lua de Orion',
    description: 'Refletora da luz solar, governa as marés e os ciclos noturnos',
    traits: ['reflexão', 'intuição', 'ciclos', 'sombra'],
    symbols: ['lua', 'crescente', 'reflexo'],
    colors: ['#C0C0C0', '#E6E6FA'],
  },
  {
    id: 'terra-orion',
    name: 'Terra de Orion',
    description: 'O planeta sólido, ancoragem e sustenta a vida',
    traits: ['estabilidade', 'nutrição', 'crescimento', 'fundação'],
    symbols: ['terra', 'montanha', 'raiz'],
    colors: ['#8B4513', '#228B22'],
  },
  {
    id: 'agua-orion',
    name: 'Água de Orion',
    description: 'Fluxo perpetuo, dissolve e conecta tudo',
    traits: ['adaptação', 'fluidez', 'purificação', 'conexão'],
    symbols: ['onda', 'rio', 'gota'],
    colors: ['#4169E1', '#00CED1'],
  },
  {
    id: 'fogo-orion',
    name: 'Fogo de Orion',
    description: 'Transformação e destruição criativa, purifica pelo calor',
    traits: ['transformação', 'paixão', 'purificação', 'renovação'],
    symbols: ['chama', 'fogo', 'faísca'],
    colors: ['#FF4500', '#FF6347'],
  },
  {
    id: 'ar-orion',
    name: 'Ar de Orion',
    description: 'Respiro do universo, pensamento e comunicação',
    traits: ['comunicação', 'pensamento', 'liberdade', 'expansão'],
    symbols: ['vento', 'sopro', 'éter'],
    colors: ['#87CEEB', '#B0E0E6'],
  },
  {
    id: 'vazio-orion',
    name: 'Vazio de Orion',
    description: 'O espaço entre estrelas, potencial não realizado',
    traits: ['potencial', 'espaço', 'possibilidade', 'silêncio'],
    symbols: ['vazio', 'abismo', 'nada'],
    colors: ['#191970', '#2F4F4F'],
  },
  {
    id: 'caminho-central',
    name: 'Caminho Central',
    description: 'O alinhamento equilibrado entre todas as forças',
    traits: ['equilíbrio', 'sabedoria', 'integração', 'harmonia'],
    symbols: ['caminho', 'senda', 'passo'],
    colors: ['#9932CC', '#BA55D3'],
  },
];

export function getData(): AlignmentData[] {
  return data;
}