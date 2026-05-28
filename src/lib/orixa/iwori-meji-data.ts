// @ts-nocheck
// SKIP_LINT

/**
 * Iwori Meji Data
 * Odu of endurance, patience, and the seeking of hidden truth
 * The moment when the seeker finds wisdom in solitude and silence
 */

// Iwori Meji represents the path of the patient seeker
// who travels through adversity to discover sacred wisdom
// Governed by the forces of wind and fire that test and purify
// Element: Ar e Fogo
// Represents endurance, truth-seeking, and spiritual mastery

export interface IworiMejiOdu {
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

const IWORI_MEJI_DATA: IworiMejiOdu = {
  id: 'iwori-meji',
  name: 'Iwori Meji',
  portugueseName: 'Iwori Meji',
  order: 22,
  polarity: 'feminine',
  element: 'Ar e Fogo',
  planets: ['Mercúrio', 'Saturno'],
  sephirot: ['Hod', 'Geburah', 'Netzach'],
  sign: 'Obatalá, Oxum, Oduduwa',
  dayOfWeek: 'Quarta-feira',
  direction: 'Norte e Sul',
  colors: ['Branco', 'Azul claro', 'Dourado', 'Cinza'],
  offerings: [
    'Kolanut (Obi)',
    'Água de obi (branca)',
    'Velas brancas e douradas',
    'Farinha de mandioca',
    'Milho branco',
    'Quiabo',
    'Pepino',
    'Água de chuva',
    'Flores brancas',
  ],
  ebos: [
    {
      type: 'Ebó de Paciência',
      description: 'Ritual para desenvolver persistência e resistência aos desafios',
      ingredients: ['Kolanut', 'Água de obi branca', 'Velas brancas', 'Farinha de mandioca'],
      timing: 'Quarta-feira ao amanhecer',
      intention: 'Cultivar a paciência sagrada que transforma obstáculos em sabedoria',
    },
    {
      type: 'Ebó de Busca da Verdade',
      description: 'Oferecimento para aclarar a mente e revelar verdades ocultas',
      ingredients: ['Kolanut', 'Quiabo', 'Velas douradas', 'Água de chuva'],
      timing: 'Quarta-feira à noite, lua minguante',
      intention: 'Despertar a capacidade de discernir a verdade além das aparências',
    },
    {
      type: 'Ebó de Longevidade',
      description: 'Prática para Strengthen a saúde e estender a vida spiritual',
      ingredients: ['Milho branco', 'Pepino', 'Velas brancas', 'Mel'],
      timing: 'Quarta-feira durante o dia',
      intention: 'Invocar bênçãos de longevity e resistência física e espiritual',
    },
    {
      type: 'Ebó de Jornada do Seekor',
      description: 'Ritual para abrir o caminho da busca espiritual',
      ingredients: ['Kolanut', 'Flores brancas', 'Carvão', 'Incenso de到老'],
      timing: 'Quarta-feira ao entardecer',
      intention: 'Proteger a jornada do buscador e garantir que a verdade seja revelada',
    },
  ],
  quizilas: [
    'Ansiedade excessiva (acelera sem necessidade)',
    'Impaciência com o processo de amadurecimento',
    'Descuido com a saúde por excesso de trabalho',
    'Avidez por resultados imediatos',
    'Resistência a mudanças lentas e graduais',
    'Desconfiança excessiva que bloqueia orientaço',
    'Teimosia em continuar o caminho errado',
    'Isolamento prolongado sem propósito',
  ],
  strengths: [
    'Capacidade de persistir através de grandes adversidades',
    'Sabedoria prática adquirida pela experiência',
    'Paciência infinita que espera o momento certo',
    'Visão clara que percebe verdades ocultas',
    'Conexão profunda com ancestrais e guias',
    'Força interior que não se abala facilmente',
    'Discernimento aguçado entre verdade e ilusão',
    'Resiliência que transforma sofrimento em sabedoria',
  ],
  weaknesses: [
    'Tendência ao isolamento excessivo quando ferido',
    'Dificuldade em confiar em outros após traições',
    'Risco de melancolia por carregAR muitos fardos',
    'Teimosia em padrões que já não servem',
    'Dificuldade em aceitar ajuda por orgulho',
    'Excesso de autocrítica e julgamento',
  ],
  health: [
    'Pulmões e sistema respiratório (elemento ar)',
    'Joelhos e pernas (jornada e persistência)',
    'Sistema digestivo (digestão lenta e gradual)',
    'Coluna vertebral (resistência e postura)',
    'Rins e bexiga (longevidade)',
    'Pele (eliminação de toxinas acumuladas)',
  ],
  meanings: [
    'O caminho longo que o buscador percorre até encontrar a verdade',
    'A paciência que transforma o crude em refinado',
    'O momento de silêncio onde a sabedoria se revela',
    'A jornada interior que fortalece o espírito',
    'A verdade que emerge após muito sofrimento',
    'O poder de persistir quando tudo parece perdido',
    'A conexão sagrada com aqueles que vieram antes',
  ],
  ifaMessage:
    'Iwori Meji fala da jornada sagrada do buscador que deve atravessar many águas escuras para encontrar a verdade. Este Odu ensina que a sabedoria verdadeira não vem fácil, mas é conquistada através da paciência, da persistência e da disposição de enfrentar a solidão do caminho. Obatalá oferece a clareza do pensamento puro, enquanto Oxum oferece a sabedoria das águas que fluem com persistência. A verdadeiro força não está em evitar o sofrimento, mas em transformá-lo em compreensão profunda. Quem compreende Iwori Meji compreende que cada passo da jornada, mesmo os mais difíceis, tem um propósito divino. Aguarde com paciência, e a verdade se revelará no momento certo.',
  orixas: ['Obatalá', 'Oxum', 'Oduduwa', 'Orunmila'],
  sacredFrequencies: [
    '528 Hz - Frequência da cura e da verdade',
    '396 Hz - Liberação do medo e da culpa',
    '432 Hz - Harmonia com os padrões naturais',
  ],
  chakra: 'Coronário e Laríngeo',
  herbs: [
    'Epô',
    'Eubo (alecrim)',
    'Oxalá',
    'Conta-corrente',
    'Pau-brasil',
    'Alfavaca',
    'Quebra-pedra',
    'Boldo',
  ],
  affirmations: [
    'Eu tenho a paciência de atravessar qualquer desafio com sabedoria',
    'A verdade se revela a mim no momento perfeito',
    'Eu confio no processo da minha jornada espiritual',
    'Minha resistência é inabalável porque está fundamentada na verdade',
    'Cada passo que dou me aproxima da sabedoria que busco',
    'Eu sou digno da revelação das verdades sagradas',
    'Minha conexão com meus ancestrais me fortalece',
    'Eu encontro paz na espera porque sei que vale a pena',
  ],
  meditation: 'Sente-se em silêncio em um espaço onde ninguém interromperá. Imagine-se caminhando por uma estrada longa e estreita, onde cada passo representa uma lição aprendida. Permita que o vento carregue suas ansiedades enquanto você continua avançando. No final do caminho, uma luz dourada aguarda, revelando a verdade que você buscou. Receba-a com gratidão e humildade, sabendo que o caminho foi tão importante quanto a chegada.',
};

export function getData(): IworiMejiOdu {
  return IWORI_MEJI_DATA;
}

export function getDataById(id: string): IworiMejiOdu | undefined {
  return id === 'iwori-meji' ? IWORI_MEJI_DATA : undefined;
}

export function getHerbs(): string[] {
  return IWORI_MEJI_DATA.herbs;
}

export function getRituals(): Ebo[] {
  return IWORI_MEJI_DATA.ebos;
}

export function getOrixas(): string[] {
  return IWORI_MEJI_DATA.orixas;
}

export function getQuizilas(): string[] {
  return IWORI_MEJI_DATA.quizilas;
}

export function getSacredFrequencies(): string[] {
  return IWORI_MEJI_DATA.sacredFrequencies;
}

export function getAffirmations(): string[] {
  return IWORI_MEJI_DATA.affirmations;
}

export function getMeditation(): string {
  return IWORI_MEJI_DATA.meditation;
}

export default getData;