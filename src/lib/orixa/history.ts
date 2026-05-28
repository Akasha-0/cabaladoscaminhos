export interface OrixaHistory {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greetings: string;
  history: string;
  mythology: string;
  attributes: string[];
}

const ORIXA_HISTORY: OrixaHistory[] = [
  {
    id: 'oxum',
    name: 'Oxum',
    namePortuguese: 'Rainha das Águas Doces',
    path: 'Ibeji (Gêmeos)',
    element: 'Água doce',
    colors: ['#FFD700', '#FF69B4'],
    dayOfWeek: 'Sábado',
    numbersSacred: [7, 12, 15],
    greetings: 'Ewole!',
    history:
      'Oxum é uma das orixás mais veneradas do panteão iorubá. Como deity das águas doces, ela governa rios, cachoeiras e fontes. Reza-se que ela foi a primeira a descer do céu para a Terra, trazendo consigo as águas que dão vida. Sua presença é sinônimo de fertilidade, amor, charme e prosperidade material.',
    mythology:
      'Na mitologia, Oxum é esposa de Oxumaré (o arco-íris) e concubina de Oxalá. Diz-se que seu cântico encanta todos que o ouvem, e suas danças na beira do rio atraem até os peixes. Quando os humanos derramam azeite de dendê no chão, é para Oxum — para aplacar sua sede e pedir suas bênçãos.',
    attributes: [
      'Fertilidade',
      'Amor',
      'Prosperidade',
      'Beleza',
      'Águas doces',
      'Maternidade',
    ],
  },
  {
    id: 'xango',
    name: 'Xangô',
    namePortuguese: 'Rei dos Raios e do Fogo',
    path: 'Ogbono (Conhecimento)',
    element: 'Fogo',
    colors: ['#FF4500', '#8B0000'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [6, 10],
    greetings: 'Epa!',
    history:
      'Xangô é o orixá dos raios, trovão, relâmpago, trovão, do fogo e da justiça. Foi Rei de Oyó antes de morrer atingido por um raio — dizem que sua morte o transformou em divindade. Ele é temido por seus ataques de fúria, mas também é o guardião da ordem social e executor da justiça. Xangô representa a autoridade legítima e o poder judicial.',
    mythology:
      'Xangô é frequentemente depicted segurando seu machado de dupla lâmina (opaxorô). Dizem que quando ele está irritado, trovões retumbam e raios cortam o céu. Sua coroa é feita de contas vermelhas e laranjas. Ele também é conhecido por sua dança forte e enérgica, o Djé, onde balança seu machado cerimonial.',
    attributes: ['Justiça', 'Raio', 'Fogo', 'Autoridade', 'Vingança justa', 'Orgulho'],
  },
  {
    id: 'obatala',
    name: 'Obatalá',
    namePortuguese: 'Pai da Criação',
    path: 'Opolo (Meditação)',
    element: 'Ar',
    colors: ['#FFFFFF', '#F5F5DC'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 8],
    greetings: 'Orunmpô!',
    history:
      'Obatalá é o pai de todos os orixás e o criador da humanidade. Foi ele quem moldou os primeiros seres humanos do barro branco (Ebo). Embora sua função seja a criação e a ordem, ele é frequentemente depicted como um velho sabio de natureza gentil e compassiva. Obatalá representa a pureza, a retidão moral e a sabedoria.',
    mythology:
      'Antes da criação do mundo, Obatalá desceu do céu em uma corrente de ouro (Coro) para criar a terra. Levava um barreiro, uma cobra e um gato. No caminho, foi enganado por Oduduwa, que tomou a corrente e plantou a primeira semente, criando o mundo que conhecemos. Obatalá então focou em criar os seres humanos perfeitos.',
    attributes: ['Criação', 'Pureza', 'Sabedoria', 'Velhice sagrada', 'Misericórdia', 'Justiça'],
  },
  {
    id: 'yemanja',
    name: 'Iemanjá',
    namePortuguese: 'Mãe das Águas',
    path: 'Ibeji (Gêmeos)',
    element: 'Água salgada',
    colors: ['#0000CD', '#1E90FF'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [2, 5, 9],
    greetings: 'Eyawo!',
    history:
      'Iemanjá é a orixá das águas do mar, das上岸 e da maternidade. Ela é considerada a mãe de todos os orixás, a grande protetora das mulheres e dos peixes. Reza-se que suas lágrimas criaram os rios e que seu corpo forma o mar. Iemanjá é sinônimo de proteção, conforto, amor maternal e fertilidade. Em diversas religiões afro-brasileiras, ela é reverenciada como a Grande Mãe.',
    mythology:
      'Iemanjá era esposa de Oxalá até que seu ciúmes a transformou em uma Cobra-Marinha. Diz-se que ela vive nas profundezas do oceano em um palácio de coral, cercada por peixes e sirênios. Na noite de 8 de dezembro, milhares de devotos oferecem presentes nas praias: espelhos, flores, sabonetes, perfumes e bonecas.',
    attributes: ['Maternidade', 'Proteção', 'Águas salgadas', 'Fertilidade', 'Amor', 'Devoção'],
  },
  {
    id: 'ogum',
    name: 'Ogum',
    namePortuguese: 'Senhor do Ferro e da Guerra',
    path: 'Ogbe (Caminho)',
    element: 'Ferro',
    colors: ['#696969', '#2F4F4F'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7],
    greetings: 'Ewo!',
    history:
      'Ogum é o orixá do ferro, da guerra, da caça e da metalurgia. Patrono dos ferreiros, agricultores e guerreiros. Ele limpa o caminho para que outros orixás possam caminhar — suas ferramentas abrem estradas na mata virgem. Ogum representa a força, a perseverança, a coragem e a capacidade de superar obstáculos.',
    mythology:
      'Ogum é frequentemente depicted segurando sua espada e uma chave. Diz-se que ele é impaciente e facilmente irritado, mas profundamente leal aos seus devotos. Quando um devoto passa por dificuldades, Ogum abre caminhos onde parecia não haver saída. Sua energia é frequentemente representada pelo som de martelos em bigornas.',
    attributes: ['Guerra', 'Ferro', 'Caminho', 'Caça', 'Metalurgia', 'Coragem'],
  },
  {
    id: 'oxossi',
    name: 'Oxóssi',
    namePortuguese: 'Caçador do Reino',
    path: 'Ogbe (Caminho)',
    element: 'Mata',
    colors: ['#006400', '#228B22'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7],
    greetings: 'Eyi!',
    history:
      'Oxóssi é o orixá da caça, das matas, das florestas e da comida. É o provider que garante que a vida continue. Ele é o caçador habilidoso, paciente e conhecedor de todas as técnicas de captura. Oxóssi representa a fartura, a provisão, o conhecimento das ervas e a conexão com a natureza selvagem.',
    mythology:
      'Dizem que Oxóssi nunca retorna da caça de mãos vazias — ele sempre traz algo. Ele habita as matas mais profundas, onde poucos se aventuram. Sua flecha nunca erra o alvo. Os caçadores rezam a ele antes de partir para garantir uma boa presa. Ele também é conhecido como Okê Arô, o grito de vitória do caçador.',
    attributes: ['Caça', 'Mata', 'Fartura', 'Provisao', 'Ervas medicinais', 'Conhecimento'],
  },
  {
    id: 'shaman',
    name: 'Shaman',
    namePortuguese: 'Elegba / Elegbara',
    path: 'Ogbe (Caminho)',
    element: 'Portal',
    colors: ['#8B0000', '#000000'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [1, 3],
    greetings: 'Ekô!',
    history:
      'Shaman (Elegba/Elegbara) é o orixá dos caminhos, encruzilhadas, portões e possibilidades. Ele é o primeiro a ser invoked em qualquer ritual, pois abre os caminhos para que outros orixás possam se manifestar. Shaman representa a dualidade, o ponto de transição entre estados. Ele é ao mesmo tempo Trickster e messenger, brincando entre os mundos.',
    mythology:
      'Shaman foi enviado por Olodumaré para trazer o sistema de votação (Opon Ifá) para a Terra. No caminho, ele perdeu o cesto, mas conseguiu seu objetivo de qualquer forma. Por isso, ele conhece todos os caminhos — até os mais obscuros. Ele é depicted com duas cabeças ou dois perfis, simbolizando sua natureza de estar em todos os lugares ao mesmo tempo.',
    attributes: ['Caminhos', 'Encruzilhadas', 'Transição', 'Possibilidades', 'Trickster', 'Abertura'],
  },
  {
    id: 'omulu',
    name: 'Omolu / Obaluaiê',
    namePortuguese: 'Senhor das Doenças e da Cura',
    path: 'Ogbe (Caminho)',
    element: 'Terra',
    colors: ['#DAA520', '#CD853F'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 7, 12],
    greetings: 'Baba!',
    history:
      'Omolu (também conhecido como Obaluaiê) é o orixá das epidemias, doenças, cura e da terra. Ele é o senhor das pragas e ao mesmo tempo aquele que pode curá-las. Omolu representa tanto a destruição quanto a regeneração — a ideia de que para haver vida nova, o antigo deve morrer. É syncretized com São Lázaro no Brasil.',
    mythology:
      'Omolu foi originally um rei que foi banned de seu reino por causa de uma doença terrível que o cobria de feridas. Vagando nu, ele desenvolveu habilidades de cura e retornou para ajudar seu povo. Por isso, ele é frequentemente depicted coberto por palha ou com seu rosto parcialmente hidden por uma máscara. Sua energia é poderosa e temida.',
    attributes: ['Doenças', 'Cura', 'Epidemias', 'Terra', 'Transformação', 'Morte e vida'],
  },
  {
    id: 'orunmila',
    name: 'Orunmila',
    namePortuguese: 'Senhor da Sabedoria Divinatória',
    path: 'Ogbe (Caminho)',
    element: 'Conhecimento',
    colors: ['#FFD700', '#ADFF2F'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 7, 16],
    greetings: 'Elo!',
    history:
      'Orunmila é o orixá da sabedoria, divinação, conhecimento dos segredos do destino e do sistema de Ifá. Ele é o custodian do Odu (os 16 princípios divinatórios) e de todo o conhecimento iniciático. Orunmila representa a capacidade de conhecer o futuro e влиять no destino através do conhecimento sagrado.',
    mythology:
      'Orunmila foi o único orixá que estava presente na criação do mundo e aprendeu todos os segredos de Olodumaré. Ele conhece todos os Odus (princípios) e pode desvendar qualquer mistério. No sistema de Ifá, ele fala através do Opele ou do Ikin (nozes de dendê), guiando os devotos em suas decisões e caminhos de vida.',
    attributes: ['Sabedoria', 'Divinação', 'Destino', 'Ifá', 'Conhecimento oculto', 'Conselho'],
  },
];

const STORAGE_KEY = 'orixa-history-v1';

// Get history from localStorage or return default
function getHistoryFromStorage(): OrixaHistory[] {
  if (typeof window === 'undefined') return ORIXA_HISTORY;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as OrixaHistory[];
    }
  } catch {
    // Fallback to default
  }

  // Save default to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ORIXA_HISTORY));
  } catch {
    // localStorage unavailable
  }

  return ORIXA_HISTORY;
}

// Save history to localStorage
function saveHistoryToStorage(history: OrixaHistory[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable
  }
}

// Main export: get all Orixá history
export function getHistory(): OrixaHistory[] {
  return getHistoryFromStorage();
}

// Get single Orixá by id
export function getHistoryById(id: string): OrixaHistory | undefined {
  return getHistoryFromStorage().find((orixa) => orixa.id === id);
}

// Update or add Orixá history (for future expansion)
export function updateHistory(id: string, updates: Partial<OrixaHistory>): OrixaHistory | null {
  const current = getHistoryFromStorage();
  const index = current.findIndex((orixa) => orixa.id === id);

  if (index === -1) return null;

  const updated: OrixaHistory = {
    ...current[index],
    ...updates,
    id, // Ensure id cannot be changed
  };

  const newHistory = [...current];
  newHistory[index] = updated;
  saveHistoryToStorage(newHistory);

  return updated;
}

// Reset to default history
export function resetHistory(): OrixaHistory[] {
  saveHistoryToStorage(ORIXA_HISTORY);
  return ORIXA_HISTORY;
}