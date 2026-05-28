/**
 * Orixá Matching Module
 * Matches individuals to their Orixá based on birth data
 */

export interface BirthData {
  day: number;
  month: number;
  year: number;
}

export interface OrixaMatch {
  name: string;
  description: string;
  path: string;
  orishaColors: string[];
  characteristics: string[];
}

const ORIXAS = [
  { name: 'Oxum', path: 'Água doce e amor', colors: ['#00CED1', '#FFD700'], characteristics: ['Beleza', 'Amor', 'Riqueza', 'Pureza'] },
  { name: 'Oxóssi', path: 'Caça e fartura', colors: ['#228B22', '#8B4513'], characteristics: ['Caçador', 'Liberdade', 'Conhecimento', 'Abundância'] },
  { name: 'Iemanjá', path: 'Água salgada e maternidade', colors: ['#4169E1', '#FFFFFF'], characteristics: ['Mãe', 'Proteção', 'Intuição', 'Mar'] },
  { name: 'Ogum', path: 'Guerra e trabalho', colors: ['#DC143C', '#FFD700'], characteristics: ['Guerreiro', 'Ferragens', 'Justiça', 'Coragem'] },
  { name: 'Xangô', path: 'Justiça e trovão', colors: ['#8B0000', '#FFA500'], characteristics: ['Juiz', 'Relâmpago', 'Equilíbrio', 'Autoridade'] },
  { name: 'Nanã', path: 'Mortes e lama', colors: ['#800080', '#4B0082'], characteristics: ['Ancestralidade', 'Sapiência', 'Ciclos', 'Humildade'] },
  { name: 'Obá', path: 'Guerra e amor', colors: ['#D2691E', '#8B4513'], characteristics: ['Guerreira', 'Fidelidade', 'Determinação', 'Paixão'] },
  { name: 'Ossaim', path: 'Ervas e medicina', colors: ['#32CD32', '#006400'], characteristics: ['Curandeiro', 'Ervas', 'Sabedoria', 'Cura'] },
  { name: 'Logun-Edé', path: 'Caça e água', colors: ['#228B22', '#00CED1'], characteristics: ['Caçador aquático', 'Duplo caminho', 'Equilíbrio', 'Harmonia'] },
  { name: 'Ewa', path: 'Beleza e abundância', colors: ['#FF69B4', '#FFD700'], characteristics: ['Beleza', 'Abundância', 'Charme', 'Sedução'] },
  { name: 'Oxumaré', path: 'Arco-íris e ciclos', colors: ['#9370DB', '#FFD700'], characteristics: ['Ciclos', 'Renovação', 'Arco-íris', 'Paciência'] },
  { name: 'Obaluaiê', path: 'Peste e cura', colors: ['#556B2F', '#8B4513'], characteristics: ['Saúde', 'Peste', 'Cura', 'Transformação'] },
];

function calculateOrixaIndex(data: BirthData): number {
  // Simple algorithm based on birth day and month
  const sum = data.day + data.month + (data.year % 100);
  return sum % ORIXAS.length;
}

export function findMatching(birthData: BirthData): OrixaMatch {
  const index = calculateOrixaIndex(birthData);
  const orixa = ORIXAS[index];
  
  return {
    name: orixa.name,
    description: `${orixa.name} é o orixá do ${orixa.path}.`,
    path: orixa.path,
    orishaColors: orixa.colors,
    characteristics: orixa.characteristics,
  };
}