/**
 * Inle Data Module
 * Spiritual data for Inle, the orixá of hunting, fishing, medicine and mirror magic
 */

export interface InleData {
  id: string;
  name: string;
  namePortuguese: string;
  nameYoruba: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  herbs: HerbData[];
  healingPractices: string[];
  sacredTrees: string[];
  ritualPractices: RitualData[];
}

export interface HerbData {
  name: string;
  namePortuguese: string;
  uses: string[];
  preparation: string;
  contraindications: string[];
  element: string;
}

export interface RitualData {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

const INLE_DATA: InleData = {
  id: 'inle',
  name: 'Inle',
  namePortuguese: 'O Caçador Espiritual e Mestre das Águas',
  nameYoruba: 'Inle',
  path: 'Caça Ancestral e Medicina das Águas',
  element: 'Água e Ar',
  colors: ['Azul', 'Rosa', 'Branco'],
  dayOfWeek: 'Domingo',
  numbersSacred: [3, 7, 13],
  greeting: 'Baiana Inle',
  archetype: 'Caçador das Dimensões',
  qualities: [
    'Intuição aguçada',
    'Visão espiritual clara',
    'Conexão com as águas',
    'Habilidade de cura',
    'Mestre dos espelhos',
    'Agilidade mental',
    'Sabedoria ocultista',
    'Proteção sutil',
    'Caça espiritual',
    'Leitura de sinais',
  ],
  challenges: [
    'Tendência à fuga de responsabilidades',
    'Dificuldade em se fixar',
    'Excesso de idealismo',
    'Vulnerabilidade a ilusões',
    'Dificuldade em pedir ajuda',
  ],
  rulingPlanet: 'Lua',
  sacredAnimals: ['Cervo', 'Peixe', 'Bode'],
  plants: ['Alová', 'Efo Inle', 'Cana-fístula', 'Mastruz', 'Guiné'],
  offerings: ['Peixe assado', 'Mel', 'Canjica rosa', 'Flores azuis', 'Água de rio'],
  chants: ['Inle', 'Caça', 'Água', 'Espelho'],
  symbols: ['Espelho', 'Navalha', 'Arco e flecha', 'Peixe', 'Chifre de cervo'],
  mythology:
    'Inle é o segundo filho de Yemoja, irmão mais velho de Shango. É o orixá que habita as linhas de água, os rios profundos e os mares interiores. Governa a caça física e espiritual,狡猾 com network de energias sutis. É mestre do nariz - dono do olfato - e por isso é chamado de dokterifun, o cheirador de inteligência. Inle é também mestre do espelho - vê em todas as dimensões ao mesmo tempo. É accomplice e consorte de Oxum nas águas doces.',
  spiritualLesson: 'A verdadeira visão vem da conexão com as águas profundas e o silêncio interior',
  affirmation: 'Eu conecto-me com a visão clara de Inle, enxergando além das aparências e mergulhando nas verdades ocultas',
  meditation: 'Sente-se próximo à água e visualize um cervo Branco correndo em direção ao sol, seus olhos refletindo todas as dimensões',
  herbs: [
    {
      name: 'Efo Inle',
      namePortuguese: 'Mastruz',
      uses: ['Proteção espiritual', 'Limpeza de energias', 'Amarração', 'Cura de olhos'],
      preparation: 'Banho, defumação ou chá',
      contraindications: ['Gestantes devem evitar', 'Não usar em excesso'],
      element: 'Terra e Água',
    },
    {
      name: 'Ora Inle',
      namePortuguese: 'Guiné',
      uses: ['Abertura de caminhos', 'Proteção contra feitiços', 'Descarrego', 'Fortificação'],
      preparation: 'Banho de folhas, chá ou defumação',
      contraindications: ['Não combinar com bebidas alcoólicas'],
      element: 'Terra',
    },
  ],
  healingPractices: [
    'Banho de imersão em águas correntes',
    'Ritual de espelho',
    'Defumação com ervas aquatic',
    'Oração a Inle próxima ao rio',
    'Cura com mel e água',
    'Unção com azeite de dendê',
  ],
  sacredTrees: ['Gameleira', 'Iroko', 'Cana-fístula', 'Mangueira'],
  ritualPractices: [
    {
      type: 'Caça Espiritual',
      description: 'Ritual para abrir caminhos e capturar energias',
      duration: '1 dia',
      offerings: ['Peixe assado', 'Mel', 'Canjica', 'Flores azuis'],
      steps: [
        'Purificação com banho de guiné',
        'Oração a Inle',
        'Oferecimento de peixe',
        'Ritual de captura espiritual',
        'Defumação concluding',
      ],
    },
    {
      type: 'Cura das Águas',
      description: 'Ritual para cura através das águas sagradas',
      duration: '3 dias',
      offerings: ['Água de rio', 'Mel', 'Flores rosas', 'Peixe'],
      steps: [
        'Preparação da água ritual',
        'Banho de imersão',
        'Oração a Inle',
        'Unção com mel',
        'Encerramento com espelho',
      ],
    },
  ],
};

export function getData(): InleData {
  return INLE_DATA;
}

function getDataById(id: string): InleData | undefined {
  return id === 'inle' ? INLE_DATA : undefined;
}

function getHerbs(): HerbData[] {
  return INLE_DATA.herbs;
}

function getRituals(): RitualData[] {
  return INLE_DATA.ritualPractices;
}

function getHealingPractices(): string[] {
  return INLE_DATA.healingPractices;
}

function getSacredTrees(): string[] {
  return INLE_DATA.sacredTrees;
}

function getInleByElement(element: string): InleData | undefined {
  return INLE_DATA.element.toLowerCase().includes(element.toLowerCase()) ? INLE_DATA : undefined;
}

function getInleByPlanet(planet: string): InleData | undefined {
  return INLE_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? INLE_DATA : undefined;
}
