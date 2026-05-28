// @ts-nocheck
// SKIP_LINT

/**
 * Oturupon Data Module
 * Spiritual data for Oturupon, the orixá of crossroads, destiny, and the paths of life
 */

export interface OturuponData {
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

const OTURUPON_DATA: OturuponData = {
  id: 'oturupon',
  name: 'Oturupon',
  namePortuguese: 'Senhor dos Caminhos',
  nameYoruba: 'Ọ̀tọ̀rùpọ̀n',
  path: 'Guardião das Encruzilhadas',
  element: 'Ar e Terra',
  colors: ['Preto', 'Branco', 'Vermelho'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [2, 4, 7, 12],
  greeting: 'Epe! ou Oturupon Laroyê!',
  archetype: 'O Guardião das Encruzilhadas',
  qualities: [
    'Destino',
    'Escolha',
    'Decisão',
    'Proteção nos caminhos',
    'Sabedoria',
    'Mediação',
    'Equilíbrio',
    'Transição',
    'Novo início',
    'Conhecimento ancestral'
  ],
  challenges: [
    'Indecisão',
    'Medo das mudanças',
    'Procrastinação',
    'Superstição',
    'Rigidez mental',
    'Fuga de responsabilidades',
    'Inveja do sucesso alheio'
  ],
  rulingPlanet: 'Mercúrio',
  sacredAnimals: ['Coruja', 'Cão', 'Bode', 'Porco'],
  plants: ['Arruda', 'Alecrim', 'Guiné', 'Pau-brasil', 'Eucalyptus'],
  offerings: [
    'Galinha',
    'Pombo',
    'Farinha de mandioca',
    'Azeite de dendê',
    'Akará (bolinho de feijão)',
    'Ebun (esmola)',
    'Dinheiro',
    'Incenso',
    'Velas pretas e brancas',
    'Água'
  ],
  chants: [
    'Epe Oturupon!',
    'Oturupon arô!',
    'Ọ̀tọ̀rùpọ̀n Laroyê!',
    'Guardião dos caminhos, guia meus passos!',
    'Nas encruzilhadas, eu te chamo!'
  ],
  symbols: [
    'Encruzilhada',
    'Chave',
    'Caminho bifurcado',
    'Coruja',
    'Cão',
    'T梢culo de dois caminhos',
    'Mala de viagem'
  ],
  mythology: `Oturupon é o orixá das encruzilhadas, dos caminhos e das escolhas que 
definem nosso destino. Ele é o guardião que vigia todas as bifurcações da vida, 
onde cada decisão pode mudar completamente o rumo de uma existência. Na tradição 
yorubá, Oturupon é invoked quando alguém precisa tomar decisões importantes, 
quer seja sobre carreira, amor, moradia ou qualquer outra escolha significativa.

Este orixá é considerado o mais próximo de Ori (a cabeça/cabeça), pois ele 
governa os caminhos que nossa consciência deve seguir. Cada pessoa tem seu 
caminho traçado por Ori, mas Oturupon é quem abre ou fecha as portas ao longo 
dessa jornada. Ele é tanto protetor quanto试探ador, pois também testa a 
determinação e a sabedoria dos seus filhos.

Oturupon está associado aos mercados, encruzilhadas, encruzilhadas de rua e 
qualquer lugar onde caminhos se encontram. Ele é o orixá dos viajantes, dos 
comerciantes, dos que buscam novos rumos e dos que precisam decidir entre 
opções igualmente importantes.`,
  spiritualLesson: `Cada encruzilhada é uma oportunidade de crescimento. A verdadeira 
sabedoria está em conhecer seus caminhos e seguir aquele que seu Ori indica, 
sem medo das mudanças que virão.`,
  affirmation: `Eu escolho meu caminho com sabedoria e clareza. Oturupon ilumina 
minhas decisões e me guia pelo caminho do meu destino.`,
  meditation: `Estou em uma encruzilhada iluminada pela luz de Oturupon. Vejo todos 
os caminhos disponíveis e sinto a sabedoria para escolher aquele que me leva 
à minha verdadeira essência.`,
  herbs: [
    {
      name: 'arruda',
      namePortuguese: 'Arruda',
      uses: ['Proteção nos caminhos', 'Afastar mau-olhado', 'Sorte', 'Decisão clara', 'Harmonização'],
      preparation: 'Banhos de imersão, defumações, água de arruda para limpeza',
      contraindications: ['Gestantes', 'Pessoas com pressão baixa'],
      element: 'Ar'
    },
    {
      name: 'alecrim',
      namePortuguese: 'Alecrim',
      uses: ['Clarificação mental', 'Proteção', 'Sabedoria', 'Força de vontade', 'Memória'],
      preparation: 'Chás, banhos, defumações, unguentos para proteção',
      contraindications: ['Gestantes', 'Pessoas com epilepsia', 'Hipertensos'],
      element: 'Ar'
    },
    {
      name: 'guiné',
      namePortuguese: 'Guiné (Planta)',
      uses: ['Proteção contra feitiços', 'Desbloqueio de caminhos', 'Sorte', 'Vitória'],
      preparation: 'Banhos, defumações, amarrações ritualísticas',
      contraindications: ['Gestantes', 'Uso interno em excesso'],
      element: 'Terra'
    },
    {
      name: 'pau-brasil',
      namePortuguese: 'Pau-brasil',
      uses: ['Prosperidade nos caminhos', 'Sorte', 'Proteção', 'Veneno e cura'],
      preparation: 'Defumações, banhos, amuletos, água ritualística',
      contraindications: ['Uso interno sem orientação especializada'],
      element: 'Terra'
    },
    {
      name: 'eucalyptus',
      namePortuguese: 'Eucalyptus (Eucalipto)',
      uses: ['Desbloqueio de caminhos', 'Proteção', 'Clarificação', 'Respiração espiritual'],
      preparation: 'Banhos, defumações, inalações, chás',
      contraindications: ['Gestantes', 'Pessoas com asma grave', 'Uso interno excessivo'],
      element: 'Ar'
    }
  ],
  healingPractices: [
    'Banho de arruda e alecrim para proteção nos caminhos',
    'Defumações com guiné para desbloqueio de oportunidades',
    'Oferendas de galinha ao orixá nas segundas-feiras',
    'Cânticos e orações no estilo de Oturupon',
    'Ritual de decisão em encruzilhadas sagradas',
    'Banho de eucalipto para clarificação mental',
    'Amarração de pontos de proteção nos cantos da casa'
  ],
  sacredTrees: ['Gameleira', 'Mandacaru', 'Xique-xique', 'Ipê', 'Caraíba', 'Mandição'],
  ritualPractices: [
    {
      type: 'Oferenda de Segunda-feira',
      description: 'Oferenda semanal para Oturupon nas segundas-feiras para proteção nos caminhos',
      duration: 'Vária',
      offerings: ['Galinha', 'Farinha de mandioca', 'Akará', 'Azeite de dendê', 'Velas pretas e brancas'],
      steps: [
        'Preparar o local sagrado com toalha preta e branca',
        'Colocar a galinha no centro sobre a toalha',
        'Ao redor, dispor farinha de mandioca em círculo',
        'Colocar akará (bolinho de feijão) em recipiente',
        'Adicionar azeite de dendê sobre a farinha',
        'Acender velas pretas e brancas nos cantos',
        'Fazer o ponto de Oturupon com azeite',
        'Cantar os cânticos de Oturupon',
        'Pedir proteção, sabedoria e boas escolhas',
        'Agradecer ao orixá e consumir as oferendas'
      ]
    },
    {
      type: 'Ritual de Desbloqueio de Caminhos',
      description: 'Ritual para abrir novos caminhos quando há obstáculos ou estagnação',
      duration: '3 dias',
      offerings: ['Guiné', 'Arruda', 'Alecrim', 'Velas pretas', 'Dinheiro', 'Azeite'],
      steps: [
        'Primeiro dia: jejum parcial e oração de intenção',
        'Banho de limpeza com arruda e alecrim ao amanhecer',
        'No local sagrado, colocar toalha preta',
        'Formar um círculo com guiné ao redor',
        'No centro, colocar velas pretas acesas',
        'Colocar dinheiro no centro do círculo',
        'Fazer defumações com guiné',
        'Pedir a Oturupon que abra todos os caminhos bloqueados',
        'No terceiro dia, repetir o ritual e consumir as oferendas',
        'Guardar um pouco de guiné como proteção'
      ]
    },
    {
      type: 'Ritual de Decisão na Encruzilhada',
      description: 'Ritual para tomar decisões importantes com clareza e sabedoria',
      duration: '1 dia',
      offerings: ['Galinha branca', 'Farinha', 'Mel', 'Velas pretas e brancas', 'Água'],
      steps: [
        'Escolher uma encruzilhada ou um local onde caminhos se encontrem',
        'Ao entardecer, preparar o espaço ritualístico',
        'Colocar toalha preta no chão',
        'No centro, colocar galinha branca',
        'Ao redor, dispor velas pretas e brancas acesas',
        'Colocar farinha em círculo ao redor da galinha',
        'Adicionar mel no centro do círculo',
        'Recitar orações pedindo sabedoria para a decisão',
        'Meditar sobre a escolha a ser feita',
        'Pedir a Oturupon que elimine dúvidas e medo',
        'Agradecer e deixar as oferendas até o amanhecer',
        'Consumir as oferendas no dia seguinte com gratidão'
      ]
    },
    {
      type: 'Ritual de Viagem Protegida',
      description: 'Ritual para proteção ao viajar ou iniciar uma nova jornada',
      duration: '1 dia (antes da viagem)',
      offerings: ['Galinha', 'Arruda', 'Alecrim', 'Velas pretas', 'Azeite', 'Dinheiro'],
      steps: [
        'Na noite anterior à viagem, preparar o ritual',
        'Banho de proteção com arruda e alecrim',
        'No local sagrado, estender toalha preta e branca',
        'Colocar a galinha no centro',
        'Ao redor, dispor arruda e alecrim',
        'Acender velas pretas nos cantos',
        'Fazer o ponto de Oturupon com azeite',
        'Cantar cânticos de proteção',
        'Pedir que Oturupon proteja todos os caminhos',
        'Colocar um pouco de arruda na bagagem',
        'Agradecer ao orixá e iniciar a viagem com bênção'
      ]
    }
  ]
};

export function getData(): OturuponData {
  return OTURUPON_DATA;
}

export function getDataById(id: string): OturuponData | undefined {
  return id === 'oturupon' ? OTURUPON_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OTURUPON_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OTURUPON_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return OTURUPON_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return OTURUPON_DATA.sacredTrees;
}

export function getOturuponByElement(element: string): OturuponData | undefined {
  return OTURUPON_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OTURUPON_DATA : undefined;
}

export function getOturuponByPlanet(planet: string): OturuponData | undefined {
  return OTURUPON_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OTURUPON_DATA : undefined;
}