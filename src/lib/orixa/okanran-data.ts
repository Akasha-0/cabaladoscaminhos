// @ts-nocheck
// SKIP_LINT

/**
 * Odi Data Module
 * Spiritual data for Odi, Odu 7 of the Ifá tradition
 */

export interface OdiData {
  id: string;
  name: string;
  namePortuguese: string;
  nameYoruba: string;
  oduNumber: number;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  rulingOrixas: string[];
  quizilas: string[];
  preceptos: string[];
  ebos: string[];
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

const OKANRAN_DATA: OdiData = {
  id: 'odi',
  name: 'Odi',
  namePortuguese: 'O Poço Profundo',
  nameYoruba: 'Odi',
  oduNumber: 7,
  element: 'Terra / Água',
  colors: ['Preto', 'Marrom', 'Verde escuro'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [7, 14, 21],
  greeting: 'Epa Odi! ou Odi Laroyê!',
  archetype: 'O Poço das Coisas Ocultas',
  qualities: [
    'Teimosia positiva',
    'Renascimento',
    'Intuição profunda',
    'Sabedoria oculta',
    'Resiliência',
    'Transformação interior',
    'Capacidade de renovação',
    'Profundidade emocional'
  ],
  challenges: [
    'Teimosia negativa',
    'Persistência no erro',
    'Medo do escuro',
    'Resistência às mudanças',
    'Amargura acumulada',
    'Escavar feridas passadas'
  ],
  rulingPlanet: 'Saturno',
  rulingOrixas: ['Omolu', 'Oxumaré', 'Exu'],
  quizilas: [
    'Dormir no escuro absoluto se estiver com medo',
    'Comer carne de caça',
    'Persistir no erro'
  ],
  preceptos: [
    'Praticar o desapego',
    'Aceitar as mudanças da vida',
    'Não cavar o próprio buraco com mágoas'
  ],
  ebos: [
    'Pipoca (Deburu) para Omolu',
    'Banhos de lama ou argila',
    'Defumações pesadas com resinas'
  ],
  symbols: [
    'Poço profundo',
    'Cobra',
    'Lama',
    'Água estagnada',
    'Raízes',
    'Cabaça'
  ],
  mythology: `Odi é o sétimo Odu do Merindilogun e representa o poço profundo, as coisas ocultas, 
a teimosia e o renascimento. Este Odu está associado aos mistérios subterrâneos, à sabedoria 
que vem das profundezas e à capacidade de renascer após tempos difíceis.

Na tradição iorubá, Odi simboliza o momento em que é necessário olhar para dentro, 
explorar os aspectos ocultos de si mesmo e aceitar as transformações que a vida traz. 
Ele representa o ciclo de morte e renascimento que existe em todas as coisas.

Odi é regido por Omolu (o mestre das doenças e curas), Oxumaré (a cobra do arco-íris 
que conecta céu e terra) e Exu (o mensageiro que abre os caminhos). Esta combinação 
confere a Odi um poder de transformação profunda e acesso aos mistérios ocultos.

Este Odu alerta para os perigos da teimosia mal direcionada e da persistência em 
caminhos que já se mostraram improdutivos. Encoraja o praticante a soltar o que 
não serve mais e a abraçar novas possibilidades de renovação espiritual.`,
  spiritualLesson: `A verdadeira sabedoria vem das profundezas. Assim como a água do poço 
.Reflete o céu, nossasferidas mais profundas podem revelar nossa maior luz. 
O renascimento está sempre disponível para quem sabe soltar o passado.`,
  affirmation: `Eu solto o que não me serve mais. Aceito as mudanças com coragem 
e confiança. Das profundezas, renasco renovado.`,
  meditation: `Desço calmamente ao poço profundo dentro de mim. Nas águas escuras, 
encontro reflexos da minha verdadeira essência. Odi me guia através dos mistérios 
ocultos, mostrando que toda escuridão contém a semente de uma nova luz. 
Aceito o renascimento com gratidão.`,
  herbs: [
    {
      name: 'pimenta',
      namePortuguese: 'Pimenta Dedo',
      uses: ['Proteção espiritual', 'Abertura de caminhos', 'Desapego', 'Renovação'],
      preparation: 'Banhos de imersão, defumações com resinas',
      contraindications: ['Pessoas com problemas cardíacos', 'Gestantes', 'Pessoas com pele sensível'],
      element: 'Terra'
    },
    {
      name: 'artemísia',
      namePortuguese: 'Artemísia',
      uses: ['Purificação profunda', 'Acesso ao inconsciente', 'Dissolução de mágoas', 'Renovação'],
      preparation: 'Chás rituais, banhos de imersão, defumações',
      contraindications: ['Gestantes', 'Pessoas com sensibilidade a plantas'],
      element: 'Água'
    },
    {
      name: 'sálvia',
      namePortuguese: 'Sálvia',
      uses: ['Limpeza espiritual pesada', 'Defumações de proteção', 'Purificação de ambientes'],
      preparation: 'Defumações com resinas, banhos',
      contraindications: ['Pessoas com problemas respiratórios', 'Gestantes'],
      element: 'Terra'
    },
    {
      name: 'marrubio',
      namePortuguese: 'Marrubio',
      uses: ['Desapego', 'Dissolução de ressentimentos', 'Aceitação', 'Transformação interior'],
      preparation: 'Chás rituais, infusões para banhos',
      contraindications: ['Gestantes', 'Pessoas com pressão baixa'],
      element: 'Água'
    },
    {
      name: 'pomada',
      namePortuguese: 'Pomada (Babaçu)',
      uses: ['Proteção da cabeça', 'Unção ritual', 'Conexão com Omolu'],
      preparation: 'Unção do corpo, banhos ritualísticos',
      contraindications: ['Alergia a Coco'],
      element: 'Terra'
    }
  ],
  healingPractices: [
    'Banhos de lama ou argila para purificação profunda',
    'Defumações pesadas com resinas (sálvia, mirra, copal)',
    'Ritual de pipoca (Deburu) para Omolu',
    'Práticas de desapego e soltura',
    'Meditação nas profundezas interiores',
    'Ritual de renovação e renascimento'
  ],
  sacredTrees: ['Barriguda', 'Xique-xique', 'Mandacaru', 'Caraíba', 'Pau-brasil'],
  ritualPractices: [
    {
      type: 'Ebó de Transmutação (Deburu)',
      description: 'Ritual de renascimento e transformação com pipoca para Omolu',
      duration: '1 dia',
      offerings: ['Pipoca (Deburu)', 'Duas velas pretas', 'Pimenta dedo', 'Fumo de rolo', 'Água de chuva'],
      steps: [
        'Preparar o espaço sagrado com toalha preta ou marrom',
        'Acender duas velas pretas nos cantos',
        'Colocar a pipoca em um prato branco como oferenda central',
        'Fazer pontos de Exu com dendê ao redor',
        'Pedir a Omolu que abra os caminhos da renovação',
        'Oferecer pipoca com reverência',
        'Fazer preces pedindo desapego das mágoas',
        'Defumar com resinas pesadas',
        'Agradecer e consumir a pipoca como communion'
      ]
    },
    {
      type: 'Banho de Lama ou Argila',
      description: 'Ritual de purificação profunda associado a Omolu',
      duration: '3 a 7 dias',
      offerings: ['Lama ou argila natural', 'Flores escuras', 'Fumo de rolo', 'Dende'],
      steps: [
        'Coletar lama ou argila de local sagrado ou nascente',
        'Misturar com água de chuva ou água de olorun',
        'Adicionar flores escuras (gérbera roxa, violeta)',
        'Fazer ponto de Exu com dendê no recipiente',
        'Banhar-se massageando o corpo com a lama',
        'Mentalizar a dissolução de todas as mágoas',
        'Deixar secar naturalmente',
        'Enxaguar com água corrente',
        'Repetir por 7 dias consecutivos'
      ]
    },
    {
      type: 'Ritual de Soltura das Mágoas',
      description: 'Prática de desapego para libertar-se do passado',
      duration: '1 dia',
      offerings: ['Papel e caneta', 'Velas pretas', 'Incenso de resina', 'Água'],
      steps: [
        'Escrever em papel todas as mágoas e ressentimentos',
        'Ler em voz alta cada item',
        'Pedir permissão para soltar cada uma',
        'Colocar o papel em recipiente com água',
        'Acender velas pretas ao redor',
        'Defumar com resinas pesadas',
        'Fazer oração de soltura e renascimento',
        'Queimar o papel em segurança',
        'Dispersar as cinzas em água corrente'
      ]
    },
    {
      type: 'Defumação Pesada com Resinas',
      description: 'Ritual de proteção e purificação com defumações densas',
      duration: '3 dias',
      offerings: ['Resina de mirra', 'Resina de benzoe', 'Resina de copal', 'Carvão ritual', 'Pimenta dedo'],
      steps: [
        'Acender carvão ritual em brasa',
        'Colocar resina de mirra, benzoe e copal',
        'Adicionar pimenta dedo quebrada',
        'Defumar o ambiente em sentido anti-horário',
        'Passar a fumaça pelo corpo',
        'Mentalizar a proteção de Omolu e Oxumaré',
        'Pedir a abertura dos caminhos ocultos',
        'Repetir por três noites consecutivas'
      ]
    }
  ]
};

export function getData(): OdiData {
  return OKANRAN_DATA;
}

export function getDataById(id: string): OdiData | undefined {
  return id === 'odi' ? OKANRAN_DATA : undefined;
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

export function getOkanranByElement(element: string): OdiData | undefined {
  const elements = OKANRAN_DATA.element.toLowerCase().split(' / ');
  return elements.some(e => element.toLowerCase().includes(e)) ? OKANRAN_DATA : undefined;
}

export function getOkanranByPlanet(planet: string): OdiData | undefined {
  return OKANRAN_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OKANRAN_DATA : undefined;
}
