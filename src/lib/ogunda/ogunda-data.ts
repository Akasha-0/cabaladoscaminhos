interface OgundaData {
  id: string;
  name: string;
  nameYoruba: string;
  linhas: boolean[];
  significados: string[];
  quizilas: string[];
  ebos: Array<{ tipo: string; descricao: string; elementos: string[] }>;
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
  namePt?: string;
  nameEn?: string;
  simbolo?: string;
  numero?: number;
  description?: string;
  keywords?: string[];
  oduPrinciples?: string[];
  spiritualGuidance?: string[];
  ritualPractices?: string[];
  significado?: string;
}

export const ogundaData: OgundaData = {
  id: 'ogunda-013',
  name: 'Ogunda',
  nameYoruba: 'Ògúndá',
  linhas: [true, false, true, true],
  significados: ['Caminho', 'Ferramenta', 'Trabalho'],
  quizilas: ['Não começar projetos sem oferecer algo a Ogum'],
  ebos: [{ tipo: 'Ebo de Decisão', descricao: 'Sacrifício para clareza', elementos: ['ferro'] }],
  orixas: ['Ogum'],
  sacredFrequencies: ['432 Hz'],
  elements: ['Ferro'],
  dayOfWeek: 'Terça-feira',
  colors: ['#8B4513', '#CD853F'],
  namePt: 'Ogunda - O Caminho',
  nameEn: 'Ogunda - The Path',
  simbolo: '☱',
  numero: 13,
  description: 'Ogunda é o Odu da ferramenta e do trabalho',
  keywords: ['path', 'tool', 'work', 'decision', 'change'],
  oduPrinciples: ['Caminho', 'Ferramenta', 'Trabalho'],
  spiritualGuidance: ['Escolha com sabedoria'],
  ritualPractices: ['Ebo de caminho'],
};

export function getData(): OgundaData { return ogundaData; }
export default getData;
