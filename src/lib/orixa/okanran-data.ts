// @ts-nocheck
// SKIP_LINT

/**
 * Okanran Data Module
 * Spiritual data for Okanran, the orixá of fire, transformation, and solar energy
 */

export interface OkanranData {
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

const OKANRAN_DATA: OkanranData = {
  id: 'okanran',
  name: 'Okanran',
  namePortuguese: 'Príncipe do Fogo',
  nameYoruba: 'Oxôxrìm',
  path: 'Príncipe das Chamas',
  element: 'Fogo',
  colors: ['Vermelho', 'Dourado'],
  dayOfWeek: 'Terça-feira',
  numbersSacred: [3, 7, 12, 21],
  greeting: 'Epa Okanran! ou Okanran Laroyê!',
  archetype: 'O Príncipe Flamejante',
  qualities: [
    'Transformação',
    'Energia vital',
    'Coragem',
    'Inspiração',
    'Passion',
    'Dinamismo',
    'Criatividade',
    'Proteção',
    'Aquecimento',
    'Renovação'
  ],
  challenges: [
    'Impulsividade',
    'Temperamento forte',
    'Irritabilidade',
    'Instabilidade emocional',
    'Excesso de vaidade',
    'Gula',
    'Orgulho exacerbado'
  ],
  rulingPlanet: 'Marte',
  sacredAnimals: ['Galo', 'Cabra', 'Pomba', 'Cavalo'],
  plants: ['Pimenta', 'Gengibre', 'Cravo', 'Canela', 'Arruda'],
  offerings: [
    'Galo',
    'Pomba',
    'Cabra',
    'Pimenta dedo',
    'Pimenta calabresa',
    'Dendê',
    'Azeite de dendê',
    'Farinha de mandioca',
    'Vinho tinto',
    'Mel'
  ],
  chants: [
    'Epa! Okanran!',
    'Okanran arô!',
    'Oxôxrìm Laroyê!',
    'Okanran kaô!',
    'Príncipe das chamas, ilumina meu caminho!'
  ],
  symbols: [
    'Espada flamejante',
    'Galo',
    'Pimenta',
    'Cravo-da-índia',
    'Círculo de fogo',
    'Raio solar'
  ],
  mythology: `Okanran é o orixá do fogo, conhecido como o Príncipe das Chamas ou 
Príncipe do Fogo na tradição Ketu. Ele é filho de Oxumare (ou Oxum em algumas 
tradições) e representa a energia ígnea dos orixás aquáticos. Okanran é o 
orixá que governa o sol, o calor, a transformação e a energia vital do 
universo.

Na mitologia iorubá, Okanran foi enviado para a terra para ensinar aos 
humanos o uso do fogo e das artes da transformação. Ele é responsável 
por trazer luz nas horas mais escuras e por destruir o que precisa ser 
transformado para que o novo possa nascer. Sua energia é poderosa e pode 
tanto proteger quanto destruir, dependendo de como é canalizada.

Okanran está associado às tempestades de fogo, aos raios, ao sol do meio-dia 
e à energia transformational. Ele é invoked em momentos de mudança radical, 
quando há necessidade de renovação spiritual e quando se busca proteção 
contra energias negativas e feitiçaria.`,
  spiritualLesson: `A verdadeira transformação vem do uso consciente da energia do 
fogo interior. O poder de renascer das cinzas está ao alcance de todos que 
sabem canalizar sua luz interior.`,
  affirmation: `Eu sou a chama eterna que transforma e renova. Minha energia 
interior aquece e protege todos que me cercam.`,
  meditation: `Sinto o calor do sol me envolvendo, as chamas dançando ao redor 
meu corpo. Okanran me dá força para transformar tudo que precisa ser 
mudado em minha vida, queimando o que não serve mais e iluminando novos 
caminhos.`,
  herbs: [
    {
      name: 'pimenta',
      namePortuguese: 'Pimenta Dedo ou Pimenta Cumari',
      uses: ['Aquecimento do corpo', 'Proteção contra feitiços', 'Energia vital', 'Afastar mau-olhado'],
      preparation: 'Banhos de imersão com infusão, defumações, cataplmas',
      contraindications: ['Pessoas com problemas cardíacos', 'Gestantes', 'Pessoas com úlcera'],
      element: 'Fogo'
    },
    {
      name: 'gengibre',
      namePortuguese: 'Gengibre',
      uses: ['Energia e vitalidade', 'Proteção espiritual', 'Aquecimento corporal', 'Fortaleza'],
      preparation: 'Chás, banhos, defumações, consumido in natura',
      contraindications: ['Pessoas com pressão alta', 'Gestantes', 'Pessoas com problemas gastrointestinais'],
      element: 'Fogo'
    },
    {
      name: 'cravo',
      namePortuguese: 'Cravo-da-índia',
      uses: ['Proteção', 'Energia do fogo', 'Atração de prosperidade', 'Fortificação espiritual'],
      preparation: 'Defumações, banhos com infusão, velas banhadas em óleo de cravo',
      contraindications: ['Gestantes', 'Pessoas com pele sensível', 'Uso interno em excesso'],
      element: 'Fogo'
    },
    {
      name: 'canela',
      namePortuguese: 'Canela',
      uses: ['Aquecimento espiritual', 'Prosperidade', 'Proteção contra energias negativas', 'Autoestima'],
      preparation: 'Chás, banhos, defumações, unguentos',
      contraindications: ['Gestantes', 'Pessoas com problemas hepáticos'],
      element: 'Fogo'
    },
    {
      name: 'arruda',
      namePortuguese: 'Arruda',
      uses: ['Proteção geral', 'Limpeza espiritual', 'Sorte', 'Harmonização'],
      preparation: 'Banhos, defumações, infusões, água de arruda',
      contraindications: ['Gestantes', 'Pessoas com pressão baixa'],
      element: 'Fogo'
    }
  ],
  healingPractices: [
    'Banho de pimenta para proteção e energia vital',
    'Defumações com cravo e canela para prosperidade',
    'Oferendas de galo ao orixá nas terças-feiras',
    'Cânticos e orações no estilo de Okanran',
    'Ritual de limpeza com fogo espiritual',
    'Banho de gengibre para fortalece o corpo e espírito',
    'Proteção contra feitiços com pimenta calabresa'
  ],
  sacredTrees: ['Mandacaru', 'Xique-xique', 'Gravatá', 'Bromélia', 'Carrapato'],
  ritualPractices: [
    {
      type: 'Oferenda de Terça-feira',
      description: 'Oferenda semanal para Okanran nas terças-feiras com elementos de fogo',
      duration: 'Vária',
      offerings: ['Galo', 'Pomba', 'Pimenta dedo', 'Dendê', 'Vinho tinto'],
      steps: [
        'Preparar o local sagrado com toalha vermelha',
        'Colocar o galo no centro sobre a toalha',
        'Ao redor, dispor pimentas em círculo',
        'Colocar dendê em uma vasilha',
        'Acender velas vermelhas e douradas',
        'Fazer o ponto de Okanran com dendê',
        'Cantar os cânticos de Okanran',
        'Pedir proteção, energia e transformação',
        'Agradecer ao orixá'
      ]
    },
    {
      type: 'Ritual de Proteção contra Feitiços',
      description: 'Ritual para proteção espiritual contra magias negativas e feitiçaria',
      duration: '3 dias',
      offerings: ['Pimenta calabresa', 'Pimenta dedo', 'Alho', 'Sal grosso', 'Vinho tinto'],
      steps: [
        'Primeiro dia: jejum parcial e oração de proteção',
        'Banho de limpeza com arruda e gengibre',
        'No local sagrado, colocar toalha vermelha',
        'Formar um círculo com pimentas ao redor',
        'No centro, colocar sal grosso e alho',
        'Acender velas e fazer cânticos de Okanran',
        'Pedir proteção contra todos os feitiços',
        'No terceiro dia, queimar as pimentas em defumação',
        'Collect the ashes and scatter in running water'
      ]
    },
    {
      type: 'Ritual de Transformação',
      description: 'Ritual para promover mudanças positivas e renovação espiritual',
      duration: '1 dia',
      offerings: ['Galo branco', 'Pomba', 'Canela', 'Cravo', 'Mel'],
      steps: [
        'Escolher um local tranquilo para o ritual',
        'Preparar o espaço com tocha ou vela grande',
        'Banho de limpeza com arruda ao amanhecer',
        'Colocar toalha vermelha no chão',
        'No centro, fazer um círculo com cravo e canela',
        'Colocar o galo no centro do círculo',
        'Oferecer mel e dendê ao redor',
        'Fazer orações pedindo transformação e renovação',
        'Meditar sobre o que deseja transformar',
        'Deixar ofertas até o anoitecer',
        'Agradecer e consumir as ofertas com respeito'
      ]
    },
    {
      type: 'Ritual Solar de Energia',
      description: 'Ritual para energização espiritual utilizando a energia do sol',
      duration: '1 dia (meio-dia)',
      offerings: ['Galo', 'Dendê', 'Mel', 'Frutas douradas', 'Vinho'],
      steps: [
        'Realizar jejum parcial desde a manhã',
        'Banho de limpeza com arruda e gengibre',
        'Ao meio-dia, posicionar-se enfrentando o sol',
        'Colocar toalha vermelha no chão',
        'Oferecer dendê e mel ao sol',
        'Fazer cânticos de Okanran',
        'Pedir energia vital e coragem',
        'Meditar absorvendo a energia solar',
        'Agradecer a Okanran pela energia recebida',
        'Consumir as ofertas sagradas'
      ]
    }
  ]
};

export function getData(): OkanranData {
  return OKANRAN_DATA;
}

export function getDataById(id: string): OkanranData | undefined {
  return id === 'okanran' ? OKANRAN_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OKANRAN_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OKANRAN_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return OKANRAN_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return OKANRAN_DATA.sacredTrees;
}

export function getOkanranByElement(element: string): OkanranData | undefined {
  return OKANRAN_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OKANRAN_DATA : undefined;
}

export function getOkanranByPlanet(planet: string): OkanranData | undefined {
  return OKANRAN_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OKANRAN_DATA : undefined;
}