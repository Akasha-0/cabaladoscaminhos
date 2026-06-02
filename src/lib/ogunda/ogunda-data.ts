
}

export const ogundaData: OgundaData = {
  id: 'ogunda-013',
  name: 'Ogunda',
  namePt: 'Ogunda - O Caminho',
  nameEn: 'Ogunda - The Path',
  yoruba: 'Ògúndá',
  numero: 13,
  simbolo: '☱',
  linhas: [true, false, true, true],
  significado: 'Caminho, ferramenta, trabalho',
  description: 'Ogunda é o Odu da ferramenta e do trabalho',
  keywords: ['path', 'tool', 'work', 'decision', 'change'],
  oduPrinciples: ['Caminho', 'Ferramenta', 'Trabalho'],
  spiritualGuidance: ['Escolha com sabedoria'],
  ritualPractices: ['Ebo de caminho'],
  ebos: [{ tipo: 'Ebo de Decisão', descricao: 'Sacrifício para clareza', elementos: ['ferro'] }],
  quizilas: ['Não começar projetos sem oferecer algo a Ogum'],
  orixas: ['Ogum'],
  sacredFrequencies: ['432 Hz'],
  elements: ['Ferro'],
  dayOfWeek: 'Terça-feira',
  colors: ['#8B4513', '#CD853F'],
};

export function getData(): OgundaData { return ogundaData; }
export default getData;
