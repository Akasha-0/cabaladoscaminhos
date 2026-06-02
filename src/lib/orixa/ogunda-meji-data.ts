// @ts-nocheck
// SKIP_LINT

/**
 * Ogunda Meji Data
 * Odu of crossroads, destiny paths, and the force of action
 * The alignment of choice and purpose
 */

// Ogunda Meji represents the moment of choice at the crossroads
// where the seeker must decide which path to follow
// Governed by the forces that shape destiny through action
// Element: Fire/Storm
// Represents clarity of purpose, decisive action, and strategic choice

export interface OgundaMejiOdu {
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

const OGUNDA_MEJI_DATA: OgundaMejiOdu = {
  id: 'ogunda-meji',
  name: 'Ogunda Meji',
  portugueseName: 'Ogundameji',
  order: 14,
  polarity: 'masculine',
  element: 'Fire/Storm',
  planets: ['Marte', ' Plutão'],
  sephirot: ['Geburah', 'Hod'],
  sign: 'Ogum, Xangô, Obaluaye',
  dayOfWeek: 'Terça-feira',
  direction: 'Leste',
  colors: ['Vermelho', 'Amarelo', 'Preto', 'Branco'],
  offerings: [
    'Feijão fradinho',
    'Carne assada',
    'Velas vermelhas e pretas',
    'Etooli (akpi)',
    'Pimenta calabresa',
    'Dende',
    'Blood offerings for severe ebos',
  ],
  ebos: [
    {
      type: 'Ebó de Caminho Aberto',
      description: 'Ritual para limpar cruzamentos e abrir novos caminhos',
      ingredients: ['Feijão fradinho', 'Etooli', 'Velas vermelhas', 'Pimenta calabresa'],
      timing: 'Terça-feira ao amanhecer',
      intention: 'Abrir caminhos bloqueados e clarear a rota do destino',
    },
    {
      type: 'Ebó de Escolha Certa',
      description: 'Oferecimento para auxiliar na tomada de decisões importantes',
      ingredients: [' Coco', 'Dende', 'Folhas de ogum', 'Velas amarelas'],
      timing: 'Quando houver decisões importantes a serem tomadas',
      intention: 'Iluminar o caminho da decisão correta e evitar armadilhas',
    },
    {
      type: 'Ebó de Ação Decisiva',
      description: 'Prática paraStrengthen capacidade de ação e superação da inércia',
      ingredients: ['Velas vermelhas', 'Pimenta', 'Etooli', 'Azeite de dendê'],
      timing: 'Quando sentir paralização ou medo de agir',
      intention: 'Superar a inércia e strengthener a capacidade de ação pronta',
    },
    {
      type: 'Ebó de Proteção nas Encruzilhadas',
      description: 'Proteção espiritual nos momentos de cruzamentos do destino',
      ingredients: ['Carne assada', 'Feijão', 'Velas pretas', 'Sal'],
      timing: 'Domingo à noite ou Terça-feira',
      intention: 'Proteger contra forças negativas nas encruzilhadas do destino',
    },
  ],
  quizilas: [
    'Indecisão crônica (atrai paralisia e fracasso)',
    'Fuga das responsabilidades (fecha os caminhos)',
    'Inveja das conquistas alheias',
    'Agressividade descontrolada (afasta aliados)',
    'Mentiras e dissimulação',
    'Violência gratuita',
    'Teimosia irracional',
  ],
  strengths: [
    'Capacidade de tomar decisões rápidas e certeiras',
    'Força de ação e determinação inabalável',
    'Visão clara dos caminhos disponíveis',
    'Coragem para enfrentar cruzamentos perigosos',
    'Estratégia militar e心眼活的 wisdom',
    'Liderança natural em momentos de crise',
    'Poder de abrir e fechar caminhos',
  ],
  weaknesses: [
    'Teimosia que pode levar a escolher caminhos errados',
    'Agressividade que afasta aliados',
    'Impaciência com os mais lentos',
    'Orgulho militar que não aceita conselho',
    'Tendência à violência quando provocdo',
    'Dificuldade em recuar estrategicamente',
  ],
  health: [
    'Coração e sistema circulatório (elemento fogo)',
    'Articulações e ossos (Ogum)',
    'Plexo Solar (3º Chakra) hiperativo',
    'Sistema nervoso (estresse da decisão)',
    'Fígado (acumulação de frustação)',
  ],
  meanings: [
    'O cruzamento onde dois caminhos se encontram',
    'O momento de escolher entre ação e espera',
    'A abertura de novos caminhos após o fechamento de altri',
    'A força de Ogum cortando o que precisa ser cortado',
    'A coragem de enfrentar a encruzilhada sem medo',
    'A separação entre amigos e inimigos',
  ],
  ifaMessage: 'Ogunda Meji fala do momento em que o indivíduo se encontra diante de uma encruzilhada crucial de seu destino. Este Odu ensina que a escolha certa requiere não apenas força, mas sabedoria para reconhecer qual caminho leva à الحقيقي propósito. Ogum oferece seu cutelo para cortar o que precisa ser cortado, enquanto Xangô oferece sua justiça para separar o verdadeiro do falso. A indecisão é o maior inimigo deste caminho, pois cada momento sem ação é um momento perdido. December com coragem, aja com sabedoria, e os caminhos se abrirão.',
  orixas: ['Ogum', 'Xangô', 'Obaluaye'],
  sacredFrequencies: ['432 Hz', '528 Hz', '741 Hz'],
  chakra: '3º Plexo Solar',
  herbs: [
    'Etooli (Akpi)',
    'Quebra-pedra',
    'Pimenta calabresa',
    'Alfavaca',
    'Boldo',
    'Coentro',
    'Sálvia',
    'Arruda',
  ],
  affirmations: [
    'Eu escolho o caminho que me fortalece',
    'Minha decisão vem da sabedoria, não do medo',
    'Tenho coragem de atravessar qualquer encruzilhada',
    'Abertura meus caminhos com poder e propósito',
    'Ação certa me traz prosperidade',
  ],
  meditation: 'Meditar sobre a imagem de Ogum em pé na encruzilhada, segurando seu cutelo. Ao redor dele, múltiplos caminhos se abren. Ogum olha para você e pergunta: qual caminho você escolhe? Não há resposta errada quando há sabedoria. Peça a Ogum coragem para escolher e força para percorrer o caminho escolhido até o fim. Visualize-se cortando com o cutelo sagrado tudo aquilo que bloqueia seu caminho, abrindo espaço para a nova estrada que se revela.',
};

export function getData(): OgundaMejiOdu {
  return OGUNDA_MEJI_DATA;
}

function getDataById(id: string): OgundaMejiOdu | undefined {
  return id === 'ogunda-meji' ? OGUNDA_MEJI_DATA : undefined;
}

function getHerbs(): string[] {
  return OGUNDA_MEJI_DATA.herbs;
}

function getRituals(): Ebo[] {
  return OGUNDA_MEJI_DATA.ebos;
}

function getOrixas(): string[] {
  return OGUNDA_MEJI_DATA.orixas;
}

function getQuizilas(): string[] {
  return OGUNDA_MEJI_DATA.quizilas;
}

function getSacredFrequencies(): string[] {
  return OGUNDA_MEJI_DATA.sacredFrequencies;
}

function getAffirmations(): string[] {
  return OGUNDA_MEJI_DATA.affirmations;
}

function getMeditation(): string {
  return OGUNDA_MEJI_DATA.meditation;
}

export default getData;
