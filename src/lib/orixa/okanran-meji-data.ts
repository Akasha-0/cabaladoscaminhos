// @ts-nocheck
// SKIP_LINT

/**
 * Okanran Meji Data
 * Odu of transformation through fire, duality, and solar power
 * The moment when divine fire illuminates both light and shadow
 */

// Okanran Meji represents the fire of transformation that burns through duality
// where solar energy integrates opposite forces through sacred flame
// Governed by the forces of solar fire and transformative heat in dynamic balance
// Element: Fire/Solar Energy
// Represents transformation, illumination, power, and the burning away of illusion

export interface OkanranMejiOdu {
  id: string;
  name: string;
  portugueseName: string;
  order: number;
  polarity: 'masculine' | 'feminine';
  element: string;
  planets: string[];
  sephirot: string[];
  sign: string;
  dayOfWeek: string;
  direction: string;
  colors: string[];
  offerings: string[];
  ebos: Ebo[];
  quizilas: string[];
  strengths: string[];
  weaknesses: string[];
  health: string[];
  meanings: string[];
  ifaMessage: string;
  orixas: string[];
  sacredFrequencies: string[];
  chakra: string;
  herbs: string[];
  affirmations: string[];
  meditation: string;
}

export interface Ebo {
  type: string;
  description: string;
  ingredients: string[];
  timing: string;
  intention: string;
}

const OKANRAN_MEJI_DATA: OkanranMejiOdu = {
  id: 'okanran-meji',
  name: 'Okanran Meji',
  portugueseName: 'Okanran Meji',
  order: 14,
  polarity: 'masculine',
  element: 'Fogo e Energia Solar',
  planets: ['Sol', 'Marte'],
  sephirot: ['Hod', 'Geburah', 'Netzach'],
  sign: 'Oxossi, Logunedê, Xangô',
  dayOfWeek: 'Quarta-feira',
  direction: 'Norte e Sul',
  colors: ['Vermelho', 'Laranja', 'Amarelo', 'Ouro'],
  offerings: [
    'Kolanut (Obi)',
    'Pimenta vermelha e dedo de madre',
    'Milho torrado',
    'Velas vermelhas e laranjas',
    'Azeite de dendê',
    'Mel',
    'Fumo de rolo',
    'Farinha de mandioca',
  ],
  ebos: [
    {
      type: 'Ebó de Fogo Transformador',
      description: 'Ritual para Strengthen a capacidade de transformação através do fogo sagrado',
      ingredients: ['Pimenta vermelha', 'Velas vermelhas', 'Mel', 'Kolanut'],
      timing: 'Quarta-feira ao meio-dia ou ao anoitecer',
      intention: 'Queimar o que precisa ser transformado e iluminar novos caminhos',
    },
    {
      type: 'Ebó de Poder Solar',
      description: 'Oferecimento para amplifying força pessoal e poder de ação',
      ingredients: ['Milho torrado', 'Velas douradas', 'Azeite de dendê', 'Fumo de rolo'],
      timing: 'Nascer do sol ou lua cheia',
      intention: 'Absorver a energia solar e Strengthen a vontade pessoal',
    },
    {
      type: 'Ebó de Courage',
      description: 'Prática para desenvolver coragem e enfrentar medos',
      ingredients: ['Dedo de madre', 'Pimenta', 'Velas laranja', 'Kolanut vermelho'],
      timing: 'Quarta-feira à noite',
      intention: 'Queimar medos e limitações, fortalecendo o espírito',
    },
    {
      type: 'Ebó de Liberação das Travas',
      description: 'Ritual para liberar bloqueios e restrições internas',
      ingredients: ['Água de obi', 'Sal', 'Fumo de rolo', 'Velas vermelhas'],
      timing: 'Lua minguante ou eclipse',
      intention: 'Queimar correntes internas e liberar a verdadeira força',
    },
  ],
  quizilas: [
    'Medo de mudança ou transformação',
    'Preguiça espiritual (não fazer o trabalho interior)',
    'Procrastinação em agir sobre verdades conhecidas',
    'Covardia diante da própria luz',
    'Usar o fogo para destruir em vez de transformar',
    'Avareza com a própria energia e poder',
    'Autosabotagem por medo do sucesso',
    'Ressentimento guardando queima por dentro',
    'Usar poder para manipular outros',
    'Fuga da responsabilidade sobre o próprio destino',
  ],
  strengths: [
    'Poder de transformação através do fogo sagrado',
    'Coragem para enfrentar a própria verdade',
    'Força de vontade inabalável',
    'Capacidade de queimar o que não serve',
    'Iluminação interior que dissipa sombras',
    'Energia solar que fortalece a todos ao redor',
    'Determinação inquebrantável',
    'Acesso ao poder de Xangô e Oxossi',
    'Capacidade de criar mudanças duradouras',
  ],
  weaknesses: [
    'Tendência à impaciência com processos lentos',
    'Risco de queimar bridges antes da hora',
    'Impulsividade ao agir com o fogo',
    'Tendência à arrogância quando em contato com o poder',
    'Dificuldade em ser suave quando necessário',
    'Pode destruir em vez de transformar se não vigilante',
  ],
  health: [
    'Sistema digestivo (fogo interno)',
    'Fígado e vesícula (raiva guardada)',
    'Coração (energia solar)',
    'Articulações e ossos (força)',
    'Pele (eliminação por suor)',
    'Sistema imune (resistência)',
  ],
  meanings: [
    'O fogo que transforma e ilumina todos os caminhos',
    'A coragem de enfrentar a própria verdade',
    'O poder solar que fortalece a vontade',
    'A energia que queima o desnecessário',
    'A transformação que nasce do calor da experiência',
    'O despertar da força interior através do fogo',
    'A clareza que vem quando a sombra é iluminada',
  ],
  ifaMessage:
    'Okanran Meji fala do momento sagrado em que o indivíduo desperta para o poder transformador do fogo interior. Este Odu ensina que a verdadeira transformação vem não da destruição, mas da capacidade de queimar o que precisa ser libertado enquanto se mantém a essência. Oxossi oferece a sabedoria do caçador que persegue com precisão, enquanto Xangô oferece o poder do raio que ilumina e transforma. Logunedê traz a leveza e a capacidade de integrar opostos. Quem compreende Okanran Meji compreende que somos fornalhas sagradas, capazes de transformar qualquer experiência em ouro espiritual. Deixe o fogo queimar o que precisa ser queimado, e a luz que resta será a sua verdadeira essência radiante.',
  orixas: ['Oxossi', 'Xangô', 'Logunedê'],
  sacredFrequencies: ['432 Hz', '528 Hz', '741 Hz'],
  chakra: '3º Plexo Solar e 4º Coração',
  herbs: [
    'Kolanut (Obi)',
    'Pimenta dedo-de-moça',
    'Gengibre',
    'Alecrim',
    'Arruda',
    'Boldo',
    'Milho torrado',
    'Sálvia',
    'Lavanda',
    'Incenso de sândalo',
  ],
  affirmations: [
    'Eu sou o fogo sagrado que transforma e ilumina',
    'Minha força interior queima com propósito e clareza',
    'Eu tenho coragem de enfrentar minha própria verdade',
    'O poder do sol flui através de mim com facilidade',
    'Eu transformo tudo o que toco em luz e sabedoria',
  ],
  meditation:
    'Meditar sobre a imagem de um sol dourado ardente no centro do seu plexo solar. Este sol emite raios de fogo vermelho e laranja que se estendem por todo o corpo, alcançando cada célula, cada memória, cada crença limitante. Os raios de fogo encontram tudo o que precisa ser transformado e, em vez de destruir, iluminam - revelando a verdadeira natureza de cada coisa. O que é puro permanece como ouro brilhante; o que precisa ser transformado dissolve-se como névoa sob o calor. Sinta o poder do sol interior expandindo-se, não com esforço, mas com a naturalidade de um novo dia nascendo. Peça a Oxossi sabedoria para caçar suas próprias verdades, a Xangô poder para iluminar os cantos escuros da alma, e a Logunedê leveza para integrar todas as partes de seu ser em uma única chama radiante.',
};

export function getData(): OkanranMejiOdu {
  return OKANRAN_MEJI_DATA;
}

function getDataById(id: string): OkanranMejiOdu | undefined {
  return id === 'okanran-meji' ? OKANRAN_MEJI_DATA : undefined;
}

function getHerbs(): string[] {
  return OKANRAN_MEJI_DATA.herbs;
}

function getRituals(): Ebo[] {
  return OKANRAN_MEJI_DATA.ebos;
}

function getOrixas(): string[] {
  return OKANRAN_MEJI_DATA.orixas;
}

function getQuizilas(): string[] {
  return OKANRAN_MEJI_DATA.quizilas;
}

function getSacredFrequencies(): string[] {
  return OKANRAN_MEJI_DATA.sacredFrequencies;
}

function getAffirmations(): string[] {
  return OKANRAN_MEJI_DATA.affirmations;
}

function getMeditation(): string {
  return OKANRAN_MEJI_DATA.meditation;
}

export default getData;