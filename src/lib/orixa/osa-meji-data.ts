// @ts-nocheck
// SKIP_LINT

/**
 * Osa Meji Data
 * Odu of storms, obstacles, and the power of patience and divine intervention
 * The moment when challenges become catalysts for spiritual transformation
 */

// Osa Meji represents the power of storms that clear the path
// where divine forces intervene to remove obstacles
// Governed by the forces of water, wind, and transformation
// Element: Water and Air
// Represents obstacles, patience, divine rescue, and spiritual navigation

export interface OsaMejiOdu {
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

const OSA_MEJI_DATA: OsaMejiOdu = {
  id: 'osa-meji',
  name: 'Osa Meji',
  portugueseName: 'Osa Meji',
  order: 17,
  polarity: 'feminine',
  element: 'Água e Ar',
  planets: ['Netuno', 'Urano', 'Lua'],
  sephirot: ['Geburah', 'Chesed', 'Binah'],
  sign: 'Olokun, Oxum, Oyá',
  dayOfWeek: 'Quinta-feira',
  direction: 'Oeste e Norte',
  colors: ['Azul Escuro', 'Roxo', 'Branco', 'Prata'],
  offerings: [
    'Kolanut (Obi)',
    'Água do mar',
    'Flores azuis e roxas',
    'Velas azuis e prateadas',
    'Pepino',
    'Quiabo',
    'Farinha de mandioca',
    'Óleo de coco',
    'Melancia',
    'Camarão seco',
  ],
  ebos: [
    {
      type: 'Ebó de Tempestade Sagrada',
      description: 'Ritual para transformar obstáculos em oportunidades de crescimento',
      ingredients: ['Kolanut', 'Água do mar', 'Flores azuis', 'Velas azuis', 'Pepino'],
      timing: 'Quinta-feira durante tempestade ou chuva',
      intention: 'Pedir forças para atravessar desafios com graciosidade e sabedoria',
    },
    {
      type: 'Ebó de Limpeza kármica',
      description: 'Oferecimento para dissolver barreiras e limpar caminhos bloqueados',
      ingredients: ['Água do mar', 'Sal grosso', 'Pepino', 'Flores brancas', 'Velas brancas'],
      timing: 'Lua cheia ou quarto minguante',
      intention: 'Limpar energias estagnadas e abrir novos caminhos',
    },
    {
      type: 'Ebó de Proposta aos Orixás',
      description: 'Prática para buscar intervenção divina em momentos de necessidade',
      ingredients: ['Kolanut', 'Quiabo', 'Farinha de mandioca', 'Velas azuis e prateadas', 'Mel'],
      timing: 'Quinta-feira à noite',
      intention: 'Chamar a atenção dos orixás para que intervenham favoravelmente',
    },
    {
      type: 'Ebó de Navegação Espiritual',
      description: 'Ritual para desenvolver habilidade de navegar por águas turbulentas',
      ingredients: ['Água do mar', 'Pó de argila branca', 'Flores azuis', 'Óleo de coco', 'Conchas'],
      timing: 'Manhã de quinta-feira com maré alta',
      intention: 'Desenvolver a sabedoria de navegar por qualquer situação da vida',
    },
  ],
  quizilas: [
    'Arrogância diante dos obstáculos (atrai mais desafios)',
    'Desespero e pânico (escurece a visão)',
    'Resistência obstinada sem adaptar-se',
    'Ignorar os sinais de alerta dos orixás',
    'Fuga dos desafios sem enfrentá-los',
    'Avidez excessiva sem respeitar o tempo divino',
    'Orgulho de não pedir ajuda',
    'Desconfiança na intervenção dos orixás',
  ],
  strengths: [
    'Capacidade de transformar obstáculos em degraus',
    'Sabedoria de navegar por águas turbulentas',
    'Resistência que não se quebra sob pressão',
    'Conexão profunda com as forças da natureza',
    'Paciência que espera o momento certo',
    'Intuição aguçada para detectar perigos',
    'Força interior para atravessar tempestades',
    'Acesso à proteção divina em momentos críticos',
  ],
  weaknesses: [
    'Tendência a acumular obstáculos por hesitação',
    'Dificuldade em aceitar ajuda dos outros',
    'Medo excessivo que paralisa a ação',
    'Superproteção que impede o crescimento',
    'Tendência ao isolamento durante dificuldades',
    'Risco de afogar-se em emoções durante tempestades',
  ],
  health: [
    'Pulmões e vias respiratórias (tempestades)',
    'Rins e bexiga (águas acumuladas)',
    'Sistema linfático (drenagem emocional)',
    'Joelhos (flexibilidade diante de obstáculos)',
    'Ouvidos e ouvidos internos (intuição)',
    'Articulações (adaptação)',
  ],
  meanings: [
    'A tempestade que limpa o caminho para novo começo',
    'O momento onde obstáculos revelam portas ocultas',
    'A intervenção divina que chega no momento exato',
    'A sabedoria de flexionar sem quebrar',
    'O poder de navegar por qualquer mar',
    'A proteção dos orixás em águas profundas',
    'A transformação que vem através dos desafios',
  ],
  ifaMessage:
    'Osa Meji fala do momento sagrado em que o indivíduo enfrenta obstáculos aparentemente intransponíveis, mas descobre que cada barreira é uma oportunidade disfarçada. Este Odu ensina que os orixás, especialmente Olokun, Oyá e Oxum, velam por aqueles que navegam águas profundas. Olokun oferece a sabedoria das profundezas e o domínio sobre as águas turbulentas. Oyá oferece a força da tempestade que varre tudo que não serve mais. Oxum oferece a graciosidade de fluir sem resistência. A verdadeira sabedoria não está em evitar obstáculos, mas em atravessá-los com dignidade e fé. Quem compreende Osa Meji compreende que cada tempestade tem um propósito de limpeza, e que os orixás intervêm precisamente quando necessário. Confie no tempo dos orixás, e você será conduzido com segurança à margem desejada.',
  orixas: ['Olokun', 'Oyá', 'Oxum', 'Logunnedé'],
  sacredFrequencies: ['417 Hz', '432 Hz', '528 Hz'],
  chakra: '1º e 5º Chakra Raiz e Laríngeo',
  herbs: [
    'Kolanut (Obi)',
    'Alfavaca',
    'Capiá',
    'Arruda',
    'Hortelã',
    'Boldo',
    'Sálvia branca',
    'Lavanda',
    'Alecrim',
    'Eucalipto',
    'Incenso de sândalo',
  ],
  affirmations: [
    'Eu navego com sabedoria por qualquer tempestade',
    'Cada obstáculo é uma oportunidade de crescimento',
    'Os orixás protegem minha travessia',
    'Eu fluo como a água, adaptando-me com graciosidade',
    'A tempestade passa e eu permaneço inteiro',
  ],
  meditation:
    'Meditar sobre a imagem de uma embarcação pequena navegando por um mar revolto, sob um céu tempestuoso. No entanto, há uma luz dourada acima das nuvens que ilumina o caminho. A embarcação não fighta as ondas, mas as utiliza para avançar. Olokun surge das profundezas, segurando a embarcação com correntes de luz. Oyá dança nos ventos, dispersando as nuvens mais densas. Oxum flui ao lado, oferecendo refrescor quando as águas ameaçam secar a embarcação. Sinta-se nessa embarcação, confiando nos orixás que velam por você. Permita que as ondas façam seu trabalho de limpar o caminho, enquanto você mantém o leme firme na direção de sua verdade. A tempestade é temporária; sua essência é eterna.',
};

export function getData(): OsaMejiOdu {
  return OSA_MEJI_DATA;
}

export function getDataById(id: string): OsaMejiOdu | undefined {
  return id === 'osa-meji' ? OSA_MEJI_DATA : undefined;
}

export function getHerbs(): string[] {
  return OSA_MEJI_DATA.herbs;
}

export function getRituals(): Ebo[] {
  return OSA_MEJI_DATA.ebos;
}

export function getOrixas(): string[] {
  return OSA_MEJI_DATA.orixas;
}

export function getQuizilas(): string[] {
  return OSA_MEJI_DATA.quizilas;
}

export function getSacredFrequencies(): string[] {
  return OSA_MEJI_DATA.sacredFrequencies;
}

export function getAffirmations(): string[] {
  return OSA_MEJI_DATA.affirmations;
}

export function getMeditation(): string {
  return OSA_MEJI_DATA.meditation;
}

export default getData;