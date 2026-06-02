// @ts-nocheck
// SKIP_LINT

/**
 * Oturupon Meji Data
 * Odu of crossroads, destiny, and the convergence of paths
 * The moment where fate meets free will and eternal choices are made
 */

// Oturupon Meji represents the duality of crossroads
// where two paths meet and consciousness must choose
// Governed by the forces of destiny and transformation
// Element: Air/Fire
// Represents fate, crossroads, and the convergence of temporal and eternal paths

export interface OturuponMejiOdu {
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

const OTURUPON_MEJI_DATA: OturuponMejiOdu = {
  id: 'oturupon-meji',
  name: 'Oturupon Meji',
  portugueseName: 'Oturupon Meji',
  order: 32,
  polarity: 'masculine',
  element: 'Ar e Fogo',
  planets: ['Saturno', 'Marte'],
  sephirot: ['Gevurah', 'Hod', 'Yesod'],
  sign: 'Oxossi, Obaluayê, Iansã',
  dayOfWeek: 'Quarta-feira',
  direction: 'Norte e Sul',
  colors: ['Verde', 'Vermelho', 'Amarelo', 'Branco'],
  offerings: [
    'Kolanut (Obi)',
    'Galinha branca ou cinza',
    'Milho amarelo',
    'Velas verdes e vermelhas',
    'Pimenta-da-costa',
    'Erva-doce',
    'Farinha de mandioca',
    'Água de obi',
    'Fio vermelho ou verde',
  ],
  ebos: [
    {
      type: 'Ebó de Escolha Consciente',
      description: 'Ritual para clareza nos cruzamentos do destino',
      ingredients: ['Kolanut', 'Velas verdes', 'Pimenta-da-costa', 'Fio vermelho'],
      timing: 'Quarta-feira ao amanhecer',
      intention: 'Iluminar o caminho correto, discernindo entre destino e ilusão',
    },
    {
      type: 'Ebó de Desbloqueio de Caminhos',
      description: 'Oferecimento para remover obstáculos nas encruzilhadas',
      ingredients: ['Galinha branca', 'Milho amarelo', 'Erva-doce', 'Água de obi'],
      timing: 'Lua nova ou quarto crescente',
      intention: 'Desbloquear caminhos travados e abrir novas possibilidades',
    },
    {
      type: 'Ebó de Proteção nas Viagens',
      description: 'Prática para proteção ao longo de qualquer jornada',
      ingredients: ['Kolanut', 'Velas vermelhas', 'Pimenta', 'Sal grosso'],
      timing: 'Quarta-feira à noite',
      intention: 'Proteger-se de perigos nas encruzilhadas da vida',
    },
    {
      type: 'Ebó de Transformação do Destino',
      description: 'Ritual para reescrever padrões de destino negativo',
      ingredients: ['Galinha cinzenta', 'Farinha de mandioca', 'Fio verde', 'Mel'],
      timing: 'Quarta-feira de eclipse ou lua cheia',
      intention: 'Transformar destino limitado em caminho de expansão e propósito',
    },
  ],
  quizilas: [
    'Procrastinar decisões importantes (atrasa o destino)',
    'Escolher pelo medo ao invés da intuição',
    'Cruzar encruzilhadas sem pedir proteção',
    'Ignorar avisos e sinais do caminho',
    'Fugir de responsabilidades de destino',
    'Manipular escolhas alheias para benefício próprio',
    'Desperdiciar oportunidades de transformação',
    'Cobrir os olhos nas encruzilhadas da vida',
  ],
  strengths: [
    'Capacidade de discernir o caminho verdadeiro em meio à confusão',
    'Poder de transformação e ressignificação do destino',
    'Conexão profunda com os mestres das encruzilhadas',
    'Coragem para fazer escolhas difíceis quando necessário',
    'Visão que percebe além do visível, lendo os sinais do caminho',
    'Resiliência para atravessar transformações profundas',
    'Sabedoria ancestral que guia através dos obstáculos',
    'Presença protetora nas encruzilhadas da vida',
  ],
  weaknesses: [
    'Tensão entre múltiplos caminhos pode causar paralisia',
    'Dificuldade em soltar caminhos antigos mesmo quando necessários',
    'Impaciência com a lentidão do destino em se manifestar',
    'Tendência ao controle excessivo sobre o próprio futuro',
    'Risco de se perder em indecisão crônica',
    'Medo de fazer escolhas erradas pode paralisar completamente',
  ],
  health: [
    'Joelhos e articulações (caminhar e atravessar)',
    'Pés (o caminho percorrido)',
    'Plexo Solar (poder de decisão)',
    'Mente (escolhas e caminhos)',
    'Pulmões (respirações durante transições)',
    'Pele (renovação e transformação)',
  ],
  meanings: [
    'O cruzamento sagrado onde destino e livre-arbítrio se encontram',
    'A encruzilhada que exige consciência e coragem',
    'O momento de escolha que determina ciclos futuros',
    'A transformação que ocorre na intersecção de caminhos',
    'O poder de reescrever o próprio destino através da escolha consciente',
    'A sabedoria de saber quando avançar e quando esperar',
    'O portal entre o que foi e o que será',
  ],
  ifaMessage:
    'Oturupon Meji fala do momento sagrado em que o indivíduo enfrenta uma encruzilhada do destino que determinará o curso de sua vida. Este Odu ensina que cada cruzamento é uma oportunidade de transformação, mas também um momento de teste de discernimento e coragem. Oxossi oferece a sabedoria do caçador que sabe escolher o caminho correto, enquanto Obaluayê oferece a capacidade de suportar as transformações necessárias para o crescimento. Iansã traz a coragem de atravessar os obstáculos sem medo. A verdadeira sabedoria não está em evitar os cruzamentos, mas em saber lê-los e agir com consciência e propósito. Quem compreende Oturupon Meji compreende que somos co-autores do nosso destino, capazes de transformar limites em lançamentos para novos caminhos. Escolha com coração limpo, e o caminho se abrirá.',
  orixas: ['Oxossi', 'Obaluayê', 'Iansã'],
  sacredFrequencies: ['396 Hz', '417 Hz', '528 Hz'],
  chakra: '1º e 3º Chakra Raiz e Plexo Solar',
  herbs: [
    'Kolanut (Obi)',
    'Pimenta-da-costa',
    'Erva-doce',
    'Alfa-vaca (alfavaca)',
    'Romã',
    'Milho',
    'Mastruz',
    'Artemísia',
    'Sálvia branca',
    'Incenso de alecrim',
  ],
  affirmations: [
    'Eu escolho meu caminho com clareza e sabedoria',
    'Meu destino se desdobra em meu favor a cada passo',
    'Eu transito pelas encruzilhadas da vida com proteção divina',
    'Minha capacidade de discernimento guia minhas escolhas',
    'Eu transformo obstáculos em lançamentos para meu propósito',
  ],
  meditation:
    'Meditar sobre a imagem de uma encruzilhada iluminada por quatro velas: uma verde, uma vermelha, uma amarela e uma branca. No centro, uma estrada se bifurca em múltiplas direções, cada uma levando a destinos diferentes. Sinta-se presente nessa encruzilhada, respirando profundamente. Peça a Oxossi a sabedoria do caçador para discernir o caminho verdadeiro. Peça a Obaluayê a força para suportar as transformações necessárias. Peça a Iansã a coragem de atravessar qualquer obstáculo. Observe os sinais ao redor: pegadas, sons, cheiros, intuições. Confie em sua capacidade de escolher corretamente quando o momento chegar. O caminho não precisa ser fácil, precisa ser verdadeiro.',
};

export function getData(): OturuponMejiOdu {
  return OTURUPON_MEJI_DATA;
}

function getDataById(id: string): OturuponMejiOdu | undefined {
  return id === 'oturupon-meji' ? OTURUPON_MEJI_DATA : undefined;
}

function getHerbs(): string[] {
  return OTURUPON_MEJI_DATA.herbs;
}

function getRituals(): Ebo[] {
  return OTURUPON_MEJI_DATA.ebos;
}

function getOrixas(): string[] {
  return OTURUPON_MEJI_DATA.orixas;
}

function getQuizilas(): string[] {
  return OTURUPON_MEJI_DATA.quizilas;
}

function getSacredFrequencies(): string[] {
  return OTURUPON_MEJI_DATA.sacredFrequencies;
}

function getAffirmations(): string[] {
  return OTURUPON_MEJI_DATA.affirmations;
}

function getMeditation(): string {
  return OTURUPON_MEJI_DATA.meditation;
}

export default getData;