// @ts-nocheck
// SKIP_LINT

/**
 * Odi Meji Data
 * Odu of destiny, fate, and the moment of truth
 * The revelation of what is written in the stars
 */

// Odi Meji represents the moment when destiny reveals itself
// where the seeker confronts the truth of their path
// Governed by the forces of fate, intuition, and cosmic truth
// Element: Water/Intuition
// Represents divine destiny, karmic revelation, and spiritual truth

export interface OdiMejiOdu {
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

const ODI_MEJI_DATA: OdiMejiOdu = {
  id: 'odi-meji',
  name: 'Odi Meji',
  portugueseName: 'Odimeji',
  order: 16,
  polarity: 'feminine',
  element: 'Water/Intuition',
  planets: ['Netuno', 'Lua'],
  sephirot: ['Binah', 'Hod'],
  sign: 'Orunmila, Iemanjá, Oxum',
  dayOfWeek: 'Segunda-feira',
  direction: 'Norte',
  colors: ['Roxo', 'Azul escuro', 'Branco', 'Prata'],
  offerings: [
    'Milho',
    'Fumo branco',
    'Água de cheiro',
    'Velas roxas e brancas',
    'Algodão',
    'Coco',
    'Flor de laranjeira',
  ],
  ebos: [
    {
      type: 'Ebó de Destino Revelado',
      description: 'Ritual para revelar e alinhar com o destino verdadeiro',
      ingredients: ['Água de cheiro', 'Fumo branco', 'Velas roxas', 'Milho'],
      timing: 'Segunda-feira à meia-noite',
      intention: 'Revelar o destino verdadeiro e remover véus de ilusão',
    },
    {
      type: 'Ebó de Proteção do Destino',
      description: 'Oferecimento para proteger o caminho do destino contra forças negativas',
      ingredients: [' Coco', 'Algodão', 'Velas brancas', 'Flor de laranjeira'],
      timing: 'Quando sentir que o destino está sendo ameaçado',
      intention: 'Proteger o caminho do destino de forças negativas e interferências',
    },
    {
      type: 'Ebó de Aceitação do Karma',
      description: 'Prática para aceitar e harmonizar com os desígnios do destino',
      ingredients: ['Velas roxas', 'Água de cheiro', 'Milho', 'Fumo branco'],
      timing: 'Durante lua cheia ou segunda-feira',
      intention: 'Aceitar o destino com sabedoria e harmonizar com a vontade divina',
    },
    {
      type: 'Ebó de Revelação da Verdade',
      description: 'Ritual para revelar verdades ocultas e desmentir mentiras',
      ingredients: ['Velas brancas', 'Coco', 'Sal grosso', 'Algodão'],
      timing: 'Segunda-feira ao amanhecer',
      intention: 'Revelar a verdade e proteger contra enganos e traições',
    },
  ],
  quizilas: [
    'Mentira e engano deliberado (atrai destino adverso)',
    'Desprezar os sinais do destino',
    'Forçar um destino que não é o seu',
    'Inveja do destino alheio',
    'Desonestidade e fraude',
    'Rebelião contra a vontade divina',
    'Teimosia em ir contra o próprio destino',
  ],
  strengths: [
    'Intuição profunda e capacidade de antecipar eventos',
    'Conexão forte com o destino e a sorte',
    'Sabedoria para aceitar o que não pode ser mudado',
    'Capacidade de revelar verdades ocultas',
    'Proteção espiritual contra forças negativas',
    'Força para enfrentar o destino com coragem',
    'Sabedoria para distinguir verdade de ilusão',
  ],
  weaknesses: [
    'Tendência à resignação excessiva (acima da passividade)',
    'Dificuldade em tomar decisões que alteram o destino',
    'Vulnerabilidade à manipulação através de lisonja',
    'Confusão entre destino e preguiça',
    'Profecias negativas que se autocumprem',
    'Superstição excessiva que paralisa a ação',
  ],
  health: [
    'Sistema nervoso e glândula pineal (intuição)',
    'Példeo e rins (elemento água)',
    'Chakra do terceiro olho (6º) hyperativo',
    'Sistema linfático (acumulação de energia estagnada)',
    'Mente (ruminação excessiva eansiedade sobre o destino)',
  ],
  meanings: [
    'O destino escrito nas estrelas que se revela ao buscador',
    'O momento em que a verdade emerge das trevas',
    'A roda da fortuna que gira a favor ou contra',
    'O momento de confronto com o próprio destino',
    'A intuição que guía através das incertezas da vida',
    'O karma se manifestando no momento presente',
  ],
  ifaMessage: 'Odi Meji fala da hora em que o destino se revela. Este Odu enseña que cada pessoa tem um caminho traçado pelas forças superiores, e que a sabedoria está em reconhecer este caminho e caminhar por ele. Orunmila oferece sua sabedoria para que o buscas possa compreender os sinais do destino, enquanto Iemanjá oferece sua proteção nas águas turbulentas do destino. Oxum traz a suavidade necessária para aceitar o que não pode ser mudado. Não lute contra o destino, mas trabalhe com ele. Os que resistem ao próprio destino sofrem; os que o abraçam encontram paz. Odi fala também da verdade que se revela: mentiras têm pernas curtas diante do destino, e a verdade eventualmente emerge. Viva em harmonia com seu destino, e ele se desdobrará como uma flor de lótus na água.',
  orixas: ['Orunmila', 'Iemanjá', 'Oxum'],
  sacredFrequencies: ['432 Hz', '528 Hz', '963 Hz'],
  chakra: '6º - Ajna (Terceiro Olho)',
  herbs: [
    'Alfazema',
    'Violeta',
    'Camomila',
    'Boldo',
    'Pariparoba',
    'Sálvia',
    'Milho (cascas)',
    'Algodão (folhas)',
  ],
  affirmations: [
    'Meu destino está alinhado com minha verdadeira essência',
    'Eu aceito meu destino com sabedoria e gratidão',
    'A verdade se revela em meu caminho',
    'Minha intuição me guia com segurança',
    'O destino favorece minha evolução espiritual',
  ],
  meditation: 'Meditar sobre a imagem de Orunmila contemplando um espelho d\'água. Na superfície da água, você vê imagens do seu passado, presente e futuro entrelaçados. A água representa o destino fluindo como um rio. Orunmila señala para as imagens que são seu verdadeiro destino e para as que são apenas ilusões. Peça a Orunmila sabedoria para aceitar o que deve ser aceito e coragem para mudar o que pode ser mudado. Observe como a água revela a verdade de tudo. Permita que a paz do destino verdadeiro preencha seu ser.',
};

export function getData(): OdiMejiOdu {
  return ODI_MEJI_DATA;
}

function getDataById(id: string): OdiMejiOdu | undefined {
  return id === 'odi-meji' ? ODI_MEJI_DATA : undefined;
}

function getHerbs(): string[] {
  return ODI_MEJI_DATA.herbs;
}

function getRituals(): Ebo[] {
  return ODI_MEJI_DATA.ebos;
}

function getOrixas(): string[] {
  return ODI_MEJI_DATA.orixas;
}

function getQuizilas(): string[] {
  return ODI_MEJI_DATA.quizilas;
}

function getSacredFrequencies(): string[] {
  return ODI_MEJI_DATA.sacredFrequencies;
}

function getAffirmations(): string[] {
  return ODI_MEJI_DATA.affirmations;
}

function getMeditation(): string {
  return ODI_MEJI_DATA.meditation;
}

export default getData;