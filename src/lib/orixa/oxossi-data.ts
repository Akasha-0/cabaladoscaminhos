// @ts-nocheck
// SKIP_LINT

/**
 * Oxossi Data Module
 * Spiritual data for Oxossi (Oxóssi), the orixá of the hunt, forests, and abundance
 */

export interface OxossiData {
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

const OXOSSI_DATA: OxossiData = {
  id: 'oxossi',
  name: 'Oxossi',
  namePortuguese: 'Senhor da Caça e das Florestas',
  nameYoruba: 'Òsòsí',
  path: 'Caçador das Matas',
  element: 'Terra e Madeira',
  colors: ['Azul', 'Verde'],
  dayOfWeek: 'Quinta-feira',
  numbersSacred: [5, 7, 9, 14],
  greeting: 'Epa! Oiá! ou Laroiá!',
  archetype: 'O Caçador Sábio',
  qualities: [
    'Sabedoria',
    'Paciência',
    'Observação',
    'Perspicácia',
    'Abundância',
    'Prosperidade',
    'Determinação',
    'Respeito à natureza',
    ' Estratégia',
    'Fecundidade'
  ],
  challenges: [
    'Obsessão pelo controle',
    'Isolamento excessivo',
    'Avidez',
    'Gula',
    'Egoísmo',
    'Vingança',
    'Inveja'
  ],
  rulingPlanet: 'Mercúrio',
  sacredAnimals: ['Veado', 'Cervo', 'Galo', 'Bode', 'Cachorro'],
  plants: ['Arruda', 'Manjericão', 'Pau-brasil', 'Ipê', 'Palmeira'],
  offerings: [
    'Flechas',
    'Arco',
    'Animais de caça',
    'Quiabo',
    'Farinha de mandioca',
    'Mel',
    'Vinho doce',
    'Fumo de rolo',
    'Dinheiro',
    'Roupas novas'
  ],
  chants: [
    'Epa! Oxossi!',
    'Oxossi arô!',
    'ÔiÔiô, Oxossi!',
    'Oxossi kaô!',
    'Laroiá, Oxossi!',
    'Orixá caçador, abre meu caminho!'
  ],
  symbols: [
    'Arco e Flecha',
    'Quirera',
    'Aljava',
    'Faca de caça',
    'Cachimbo',
    'Chapéu de palha',
    'Mala de caçador'
  ],
  mythology: `Oxossi é o orixá do caçador, senhor das matas e das florestas. 
É considerado um dos orixás mais antigos, relacionado à caça, à abundância 
e à provisão. Oxossi é também o orixá da fartura, sendo invoked para 
conseguir recursos financeiros e alimentos. Ele vive nas matas profundas, 
conhece todos os segredos das árvores e dos animais, e é um excelente 
rastreador. É frequentemente confundido com Ogum por ambos usarem arcos e 
flechas, mas Oxossi é mais associado à caça espiritual e à abundância do que 
à guerra e ao trabalho com metais.`,
  spiritualLesson: `A paciência e a observação atenta trazem as melhores recompensas. 
A verdadeira abundância vem do respeito à natureza e da sabedoria em buscar 
apenas o necessário.`,
  affirmation: `Eu tenho sabedoria para encontrar os recursos necessários para minha vida. 
A abundância flui em minha direção naturalmente.`,
  meditation: `Sinto a presença da floresta ao meu redor, o cheiro das árvores 
e o som dos animais. Oxossi me ensina a observar, esperar e agir no momento certo.`,
  herbs: [
    {
      name: 'arruda',
      namePortuguese: 'Arruda',
      uses: ['Proteção contra mau-olhado', 'Limpeza espiritual', 'Atração de prosperidade', 'Fertilidade'],
      preparation: 'Banhos de imersão, defumações, infusões para banhos de ambiente',
      contraindications: ['Gestantes', 'Pessoas com pele sensível', 'Uso interno em excesso'],
      element: 'Terra'
    },
    {
      name: 'manjericao',
      namePortuguese: 'Manjericão ou Alfavaca',
      uses: ['Prosperidade', 'Proteção', 'Harmonização amorosa', 'Purificação'],
      preparation: 'Banhos, defumações, chá para proteção do ambiente',
      contraindications: ['Gestantes', 'Pessoas com pressão baixa'],
      element: 'Terra'
    },
    {
      name: 'pau-brasil',
      namePortuguese: 'Pau-brasil',
      uses: ['Energia vital', 'Prosperidade', 'Força física', 'Sorte nos negócios'],
      preparation: 'Defumações com a madeira, banhos com infusão',
      contraindications: ['Uso interno sem orientação especializada'],
      element: 'Madeira'
    },
    {
      name: 'ipe',
      namePortuguese: 'Ipê',
      uses: ['Proteção espiritual', 'Força', 'Determinação', 'Cura de doenças crônicas'],
      preparation: 'Banhos com casca, defumações, chá para uso ritual',
      contraindications: ['Gestantes', 'Pessoas com condições hepáticas'],
      element: 'Madeira'
    },
    {
      name: 'palmeira',
      namePortuguese: 'Palmeira ou Coco-da-baía',
      uses: ['Prosperidade', 'Fecundidade', 'Proteção contra energias negativas', 'Harmonização'],
      preparation: 'Banhos com folhas, água de coco abençoada, defumações',
      contraindications: ['Pessoas com problemas renais (consumo interno do coco)'],
      element: 'Madeira'
    }
  ],
  healingPractices: [
    'Banhos de arruda para proteção e prosperidade',
    'Defumações com pau-brasil para energia vital',
    'Oferendas de quiabo e mel ao orixá',
    'Cânticos e orações no estilo de Oxossi',
    'Ritual de caça espiritual para atrair abundância',
    'Banho de flechas com água de arruda',
    'Limpeza espiritual com folhas de ipê'
  ],
  sacredTrees: ['Pau-brasil', 'Ipê', 'Palmeira', 'Gameleira', 'Mangueira', 'Barriguda'],
  ritualPractices: [
    {
      type: 'Oferenda de Caça',
      description: 'Oferenda semanal para Oxossi com elementos de caça e fartura',
      duration: 'Vária',
      offerings: ['Quiabo', 'Mel', 'Farinha de mandioca', 'Vinho doce', 'Flechas'],
      steps: [
        'Preparar o local sagrado com toalha azul e verde',
        'Colocar as flechas e o arco sobre a toalha',
        'Oferecer quiabo como símbolo de fartura',
        'Colocar mel e farinha em recipientes separados',
        'Acender velas azul e verde',
        'Fazer o ponto de Oxossi com dendê',
        'Cantar os cânticos de Oxossi',
        'Pedir abundância e prosperidade',
        'Agradecer ao orixá'
      ]
    },
    {
      type: 'Ritual de Prosperidade',
      description: 'Ritual para atrair abundância financeira e recursos',
      duration: '1 dia',
      offerings: ['Dinheiro', 'Mel', 'Farinha', 'Flechas pequenas', 'Quiabo'],
      steps: [
        'Jejum parcial desde a manhã',
        'Banho de limpeza com arruda ao amanhecer',
        'No local sagrado, colocar toalha azul no chão',
        'Formar um círculo com farinha de mandioca',
        'No centro, colocar dinheiro e flechas',
        'Ao redor, disposição de quiabo e mel',
        'Acender velas e fazer cânticos de Oxossi',
        'Pedir prosperidade e sabedoria para buscar recursos',
        'Deixar oferendas até o próximo dia',
        'Utilizar dinheiro em necessidades legítimas'
      ]
    },
    {
      type: 'Proteção da Floresta',
      description: 'Ritual de proteção espiritual conectando-se com as matas',
      duration: '3 dias',
      offerings: ['Folhas de ipê', 'Pau-brasil', 'Mel', 'Fumo de rolo'],
      steps: [
        'Primeiro dia: jejum e banhos de limpeza com arruda',
        'Segundo dia: visita a um local com árvores sagradas, oferenda de mel',
        'Terceiro dia: defumação com pau-brasil e ipê',
        'Cantar cânticos de Oxossi na natureza',
        'Pedir proteção das matas e dos animais',
        'Fazer promessa de respeito à natureza',
        'Agradecer ao orixá e às árvores'
      ]
    },
    {
      type: 'Caça Espiritual',
      description: 'Ritual para buscar oportunidades e recursos escondidos',
      duration: '1 semana',
      offerings: ['Flechas decoradas', 'Quiabo', 'Mel', 'Dinheiro', 'Vinho doce'],
      steps: [
        'Escolher um local tranquilo para o ritual',
        'Preparar um arco e flechas como símbolo',
        'Banho de limpeza com arruda e manjericão',
        'Colocar as flechas apontadas para a direção desejada',
        'Oferecer quiabo e mel em recipientes',
        'Fazer orações pedindo sabedoria para encontrar oportunidades',
        'Meditar sobre os objetivos desejados',
        'Renovar os elementos diariamente',
        'No sétimo dia, guardar as flechas em lugar de honra',
        'Utilizar os recursos recebidos com gratidão'
      ]
    }
  ]
};

export function getData(): OxossiData {
  return OXOSSI_DATA;
}

export function getDataById(id: string): OxossiData | undefined {
  return id === 'oxossi' ? OXOSSI_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OXOSSI_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OXOSSI_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return OXOSSI_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return OXOSSI_DATA.sacredTrees;
}

export function getOxossiByElement(element: string): OxossiData | undefined {
  return OXOSSI_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OXOSSI_DATA : undefined;
}

export function getOxossiByPlanet(planet: string): OxossiData | undefined {
  return OXOSSI_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OXOSSI_DATA : undefined;
}