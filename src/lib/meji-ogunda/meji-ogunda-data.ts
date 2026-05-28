// @ts-nocheck
 
/**
 * Meji-Ogunda (Obará) Data
 * Odu of Wealth, Abundance, Wisdom and Surprise
 * The King who dresses as a beggar
 */

// Obará is the 6th principal Odu in the Merindilogun/Ifa system
// Governed by Xangô, Oxóssi, and Logun Edé
// Element: Air/Fire
// Represents prosperity, wisdom, surprise, and the reversal of fortune

export interface MejiOgundaOdu {
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

const MEJI_OGUNDA_DATA: MejiOgundaOdu = {
  id: 'meji-ogunda',
  name: 'Ogunda',
  portugueseName: 'Obará',
  order: 6,
  polarity: 'masculine',
  element: 'Air/Fire',
  planets: ['Sol', 'Júpiter'],
  sephirot: ['Hod', 'Chesed'],
  sign: 'Xangô, Oxóssi, Logun Edé',
  dayOfWeek: 'Quarta-feira',
  direction: 'Oeste',
  colors: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
  offerings: [
    'Amalá (prato de Xangô)',
    'Seis tipos de frutas',
    'Milho torrado',
    'Gema de ovo cozida',
    'Pinhão roxo',
    'Velas amarelas e vermelhas',
  ],
  ebos: [
    {
      type: 'Ebó de Fartura',
      description: 'Oferecer seis tipos de frutas, amalá para Xangô, dar comida à terra e partilhar banquetes',
      ingredients: ['Seis tipos de frutas', 'Amalá bem feito', 'Pinhão roxo', 'Milho'],
      timing: 'Quarta-feira ao meio-dia ou Domingo ao amanhecer',
      intention: 'Atrair prosperidade, abrir caminhos de riqueza e sabedoria',
    },
    {
      type: 'Ebó de Surpresa',
      description: 'Surpresa inesperada do destino, mudança rápida de situação',
      ingredients: ['Moedas douradas', 'Roupas novas', 'Comida para os menos favorecidos'],
      timing: 'Quando sentir estagnação ou necessidade de mudança',
      intention: 'Despertar a surpresa divina e a reviravolta positiva do destino',
    },
    {
      type: 'Ebó de Gratidão',
      description: 'Prática de gratidão para manter as portas da fartura abertas',
      ingredients: ['Mel', 'Canela', 'Girassol', 'Velas douradas'],
      timing: 'Diariamente ao acordar ou Domingo',
      intention: 'Manter a frequência da abundância e evitar a soberba',
    },
  ],
  quizilas: [
    'Inveja (atrai miséria e fecha portas)',
    'Contar planos antes de realizá-los',
    'Comer abóbora (quebra a frequência da fartura)',
    'Teimosia extrema (cria bloqueios)',
    'Orgulho desmedido (inverte a sorte)',
    'Guardar segredos com amargura',
    'Reclamar da vida ou das próprias dificuldades',
  ],
  strengths: [
    'Grande sabedoria e inteligência estratégica',
    'Capacidade de criar prosperidade do nada',
    'Surpresas positivas do destino',
    'Liderança natural e carisma',
    'Generosidade que atrai aliados',
    'Capacidade de reverter situações adversas',
    'Conexão forte com Xangô (justiça divina)',
  ],
  weaknesses: [
    'Teimosia quando em posições de poder',
    'Inveja que pode destruir o próprio sucesso',
    'Orgulho que fecha portas de prosperidade',
    'Compartilhar planos antes da hora pode atraínegative',
    'Ambição desmedida sem gratidão',
  ],
  health: [
    'Plexo Solar (3º Chakra) é o centro energético principal',
    'Problemas estomacais relacionados ao estresse e controle',
    'Fígado e vesícula (elemento fogo)',
    'Risco de azia e má digestão por ansiedade',
    'Sangue e pressão arterial',
  ],
  meanings: [
    'Riqueza que pode vir disfarçada de pobreza',
    'A sabedoria do rei que conhece os dois mundos',
    'A surpresa do destino que inverte a situação',
    'Fartura para quem pratica a gratidão',
    'O teste da soberba antes da bênção',
    'Xangô concedendo sabedoria e poder de decisão',
  ],
  ifaMessage: 'Obará fala do momento em que o destino oferece uma grande oportunidade de prosperidade, mas primeiro testa a capacidade do indivíduo de manter a humildade e a gratidão. O rei que se veste de mendigo é aquele que sabe que a verdadeira riqueza está na sabedoria, não nos bens materiais. Inveja e orgulho são os maiores inimigos deste caminho. A prática da generosidade e da gratidão abre todas as portas.',
  orixas: ['Xangô', 'Oxóssi', 'Logun Edé'],
  sacredFrequencies: ['528 Hz', '639 Hz', '741 Hz'],
  chakra: '3º Plexo Solar',
  herbs: [
    'Quebra-pedra',
    'Erva-de-são-joão',
    'Folha de Café',
    'Manjericão Roxo',
    'Levante',
    'Alecrim',
    'Girassol',
  ],
  affirmations: [
    'Eu mereço a prosperidade que o universo me oferece',
    'Sou grato por todas as bênçãos que recebo',
    'Minha sabedoria atrai riqueza e abundância',
    'Agradeço pelo que tenho e pelo que está por vir',
    'Compartilho minha abundância com generosidade',
  ],
  meditation: 'Meditar sobre a imagem de Xangô segurando seu machado de double-edged (dupla função - cortar a injustiça e proteger os justos). Pedir sabedoria para discernir quando dar e quando receber, mantendo sempre a gratidão no coração. Visualizar-se vestindo a coroa da humildade, onde a verdadeira realeza reside.',
};

export function getData(): MejiOgundaOdu {
  return MEJI_OGUNDA_DATA;
}

export default getData;