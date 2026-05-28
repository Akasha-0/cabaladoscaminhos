// @ts-nocheck
// SKIP_LINT

/**
 * Megi Data Module
 * Spiritual data for Megi, the orixá of golden waters, abundance, and inner radiance
 */

export interface MegiData {
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

const MEGI_DATA: MegiData = {
  id: 'megi',
  name: 'Megi',
  namePortuguese: 'Rainha das Águas Douradas',
  nameYoruba: 'Oxum Meki',
  path: 'Sustentadora da Luz Dourada',
  element: 'Água e Ouro',
  colors: ['Amarelo', 'Dourado', 'Azul'],
  dayOfWeek: 'Sábado',
  numbersSacred: [3, 6, 9, 15, 21],
  greeting: 'Oiá! ou Oriá!',
  archetype: 'A Fonte da Luz Interior',
  qualities: [
    'Beleza interior',
    'Abundância',
    'Amor próprio',
    'Luz interior',
    'Sabedoria feminina',
    'Sensibilidade',
    'Intuição',
    'Generosidade',
    'Confiança',
    'Autoestima'
  ],
  challenges: [
    'Autoestima baixa',
    'Sombra interior bloqueando abundância',
    'Desconfiança de si mesmo',
    'Festança emocional',
    'Orgulho invertido',
    'Inveja de si mesmo',
    'Superficialidade'
  ],
  rulingPlanet: 'Vênus',
  sacredAnimals: ['Peixe', 'Mariposa', 'Cavalo', 'Bode'],
  plants: ['Margarida', 'Rosa', 'Dama-da-noite', 'Alamanda', 'Girassol'],
  offerings: [
    'Água de colônia',
    'Perfume floral',
    'Flores amarelas e douradas',
    'Mel',
    'Açúcar',
    'Ovos',
    'Milho',
    'Banana',
    'Vinho doce',
    'Colares dourados',
    'Espelhos',
    'Pente'
  ],
  chants: [
    'Oiá, Oxum Meki!',
    'Megi ô, mãe da luz dourada!',
    'Águas douradas me iluminam!',
    'Oxum me dá luz interior!',
    'Rainha das correntes, ilumina minha sombra!'
  ],
  symbols: [
    'Espelho',
    'Pente',
    'Roupas douradas',
    'Colares de ouro',
    'Vaso de água',
    'Leque',
    'Abano decorado'
  ],
  mythology: `Megi, também conhecida como Oxum Meki, é uma elegante manifestação de Oxum,
a grande mãe das águas doces e da abundância. Ela é a senhora das águas douradas que irradiam
luz interior e clareza espiritual. Megi representa o poder feminino em sua expressão mais
luminosa, combinando a doçura de Oxum com a capacidade de iluminar as sombras internas
e restaurar a autoestima verloren.
Ela é invocada para questões de amor próprio, busca de luz interior, desfazimento de sombras
e recuperação da confiança. Megi é a mãe que ajuda seus filhos a encontrar a brilho
interior que foi obscurecido por traumas, dúvidas e inseguranças, guiando-os de volta
à plenitude da sua essência divina.`,
  spiritualLesson: 'A verdadeira luz dourada habita em seu interior, esperando para ser redescoberta.',
  affirmation: 'Eu sou a fonte de toda a luz dourada que necessito. Meus sombras sao apenas sombras, e eu sempre fui e sempre serei pleno de luz e beleza.',
  meditation: 'Sente-se em silencio e visualize uma luz dourada emanando do seu centro. Permita que essa luz aqueca cada canto do seu ser, dissolvendo toda escuridao que obscurece a sua verdadeira essencia.',
  herbs: [
    {
      name: 'margarida',
      namePortuguese: 'Margarida',
      uses: ['Beleza', 'Juventude', 'Amor próprio', 'Purificação', 'Proteção'],
      preparation: 'Banhos de imersão, água de cabelo, chás para limpeza espiritual',
      contraindications: ['Gestantes', 'Pessoas com alergias a margaridas'],
      element: 'Água'
    },
    {
      name: 'rosa',
      namePortuguese: 'Rosa Amarela ou Dourada',
      uses: ['Amor', 'Abundância', 'Beleza', 'Harmonia', 'Agradecimentos a Oxum'],
      preparation: 'Arranjos no altar, banhos com pétalas, água perfumada',
      contraindications: ['Pessoas com pele sensível', 'Uso interno sem orientação'],
      element: 'Água'
    },
    {
      name: 'dama-da-noite',
      namePortuguese: 'Dama-da-noite',
      uses: ['Amor', 'Sedução', 'Atração', 'Abundância', 'Clareza interior'],
      preparation: 'Defumações, banhos de amor, água de запах',
      contraindications: ['Gestantes', 'Uso interno não recomendado'],
      element: 'Água'
    },
    {
      name: 'alamanda',
      namePortuguese: 'Alamanda',
      uses: ['Amor', 'Abundância', 'Alegría', 'Proteção', 'Sorte'],
      preparation: 'Banhos, defumações, chás ritualísticos',
      contraindications: ['Gestantes', 'Lactantes', 'Uso interno em excesso'],
      element: 'Água'
    },
    {
      name: 'girassol',
      namePortuguese: 'Girassol',
      uses: ['Abundância', 'Vitalidade', 'Beleza', 'Felicidade', 'Luz positiva'],
      preparation: 'Banhos de sol com flores, arranjos no altar, chás',
      contraindications: ['Pessoas com sensibilidade ao sol', 'Gestantes'],
      element: 'Ouro'
    }
  ],
  healingPractices: [
    'Banho de flores amarelas e douradas para restauração da luz interior',
    'Oferendas de mel e açúcar às águas correntes',
    'Cânticos e orações no estilo de Megi',
    'Banho de água de colônia perfumada',
    'Ritual de espelho para despertar a beleza interior',
    'Oferecer flores frescas no altar de Oxum',
    'Banho de girassol para vitalidade e abundantes',
    'Ritual de desfazimento de sombras',
    'Meditação com luz dourada sobre o chakra do coração'
  ],
  sacredTrees: ['Gameleira', 'Mangueira', 'Ipê-amarelo', 'Jatobá', 'Castanheira', 'Pau-brasil'],
  ritualPractices: [
    {
      type: 'Oferenda de Águas Douradas',
      description: 'Oferenda especial para Megi com elementos aquosos e dourados',
      duration: 'Vária',
      offerings: ['Água de colônia', 'Mel', 'Flores amarelas', 'Vinho doce', 'Ovos'],
      steps: [
        'Preparar o local sagrado com toalha amarela e azul',
        'Colocar um vaso com água fresca no centro',
        'Adicionar gotas de água de colônia na água',
        'Oferecer flores amarelas ao redor do vaso',
        'Colocar mel e açúcar em recipientes separados',
        'Acender velas amarela e dourada',
        'Fazer o ponto de Oxum com mel',
        'Cantar os cânticos de Megi',
        'Pedir luz interior e restauração da autoestima',
        'Agradecer ao orixá e aspergir água abençoada'
      ]
    },
    {
      type: 'Ritual de Luz Interior',
      description: 'Ritual para despertar a luz dourada interior e desfazer sombras',
      duration: '1 dia',
      offerings: ['Espelho novo', 'Pente', 'Perfume floral', 'Flores', 'Vela dourada'],
      steps: [
        'Banho de limpeza com ervas ao amanhecer',
        'No local sagrado, estender toalha amarela',
        'Colocar espelho novo coberto com pano dourado',
        'Oferecer flores frescas em volta do espelho',
        'Aplicar perfume nas bordas do espelho',
        'Acender vela dourada diante do espelho',
        'Recitar orações de luz interior e restauração',
        'Olhar no espelho e afirmar cualidades luminosas',
        'Pedir a Megi para desfazer suas sombras',
        'Agradecer a Megi pela bênção da luz'
      ]
    },
    {
      type: 'Ritual de Prosperidade nas Águas',
      description: 'Ritual para atrair abundância e restaurar a confiança interior',
      duration: '3 dias',
      offerings: ['Moedas douradas', 'Mel', 'Açúcar', 'Flores amarelas', 'Vinho doce'],
      steps: [
        'Primeiro dia: jejum parcial e banhos de restauração luminosa',
        'Segundo dia: visita a um rio, lago ou fonte',
        'Oferecer moedas e flores às águas',
        'Lançar mel e açúcar na correnteza',
        'Fazer orações pedindo restauração da confiança',
        'Terceiro dia: ritual no altar caseiro',
        'Acender velas douradas',
        'Cantar cânticos de Megi',
        'Pedir sabedoria para restaurar o brilho interior',
        'Agradecer ao orixá pelas bênçãos recebidas'
      ]
    },
    {
      type: 'Ritual do Espelho Dourado',
      description: 'Ritual para purificação e renovação da luz espiritual',
      duration: '7 dias',
      offerings: ['Espelho', 'Pente', 'Perfume', 'Flores', 'Água de colônia'],
      steps: [
        'Escolher um espelho limpo para o ritual',
        'Primeiro dia: purificar o espelho com água e sal',
        'Banho de margaridas ao amanhecer',
        'Olhar no espelho e recitar orações de luz',
        'Aplicar perfume nas bordas do espelho',
        'Oferecer flores frescas diariamente',
        'Renovar a água no vaso do altar',
        'No sétimo dia, usar o espelho para meditação final de luz',
        'Pedir a Megi que purge toda sombra e restaure a luz',
        'Agradecer e guardar o espelho em lugar sagrado'
      ]
    },
    {
      type: 'Ritual de Restauração da Autoestima',
      description: 'Ritual para reconstruir a confianza eautoestima perdidas',
      duration: '5 dias',
      offerings: ['Vela dourada', 'Mel', 'Flores amarelas', 'Espe-lho', 'Água de colônia'],
      steps: [
        'Primeiro dia: escrever uma lista de качества perdidas a restaurar',
        'Banho de girassol ao amanhecer para vitalidade',
        'Meditar sobre a luz dourada dentro de você',
        'Acender vela dourada e visualizar sua luz crescendo',
        'Oferecer mel ao orixá pedindo restauração',
        'Terceiro dia: olhar no espelho e afirmar: Eu sou luz',
        'Banho de pétalas de rosa para amor próprio',
        'Recitar cânticos de Megi pedindo firmeza',
        'Quinto dia: anotar o que melhorou e agradecer',
        'Guardar o espelho em lugar sagrado de honra'
      ]
    }
  ]
};

export function getData(): MegiData {
  return MEGI_DATA;
}

export function getDataById(id: string): MegiData | undefined {
  return id === 'megi' ? MEGI_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return MEGI_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return MEGI_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return MEGI_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return MEGI_DATA.sacredTrees;
}

export function getMegiByElement(element: string): MegiData | undefined {
  return MEGI_DATA.element.toLowerCase().includes(element.toLowerCase()) ? MEGI_DATA : undefined;
}

export function getMegiByPlanet(planet: string): MegiData | undefined {
  return MEGI_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? MEGI_DATA : undefined;
}
