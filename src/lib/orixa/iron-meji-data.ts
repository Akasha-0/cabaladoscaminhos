// @ts-nocheck
// SKIP_LINT

// iron-meji-data.ts — Iron Meji (Iron-Meji/Odu) divination data for Ifa/Cabala system
// Iron Meji represents the synthesis of Iron's strength and Meji's primordial creation

export interface IronMejiOdu {
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
  ebos: string[];
  taboos: string[];
  strengths: string[];
  weaknesses: string[];
  health: string[];
  meanings: string[];
  ifaMessage: string;
}

const IRON_MEJI_DATA: IronMejiOdu[] = [
  {
    id: 'iron-meji-ogbe',
    name: 'Iron-Meji-Ogbe',
    portugueseName: 'Ferro-Meji-Ogbe',
    order: 1,
    polarity: 'masculine',
    element: 'Fire-Metal',
    planets: ['Marte', 'Sol'],
    sephirot: ['Chokmah', 'Hod', 'Gevurah'],
    sign: 'Aries',
    dayOfWeek: 'Domingo',
    direction: 'Leste',
    colors: ['Vermelho', 'Cinza', 'Amarelo'],
    offerings: ['Ferro forjado', 'Mel', 'Palmeira', 'Lampada a óleo'],
    ebos: ['Ebo de vitória', 'Ebo de proteção', 'Ebo de novo início'],
    taboos: ['Não usar armas de mentira', 'Não quebrar promessas', 'Não祀'],
    strengths: ['Força invencível', 'Vitória garantida', 'Iniciativa inabalável', 'Criação poderosa'],
    weaknesses: ['Impaciência destrutiva', 'Gula material', 'Orgulho excessivo'],
    health: ['Coração', 'Cabeça', 'Músculos'],
    meanings: ['Criação forjada', 'Vitória através do ferro', 'Novo início protegido', 'Força vital'),
    ifaMessage: 'Iron-Meji-Ogbe representa a dupla criação forjada no ferro sagrado, onde a vitória emerge da união da luz primordial com a resistência do metal sagrado.',
  },
  {
    id: 'iron-meji-oyen',
    name: 'Iron-Meji-Oyen',
    portugueseName: 'Ferro-Meji-Oyen',
    order: 2,
    polarity: 'feminine',
    element: 'Water-Metal',
    planets: ['Lua', 'Netuno', 'Marte'],
    sephirot: ['Binah', 'Yesod', 'Gevurah'],
    sign: 'Câncer',
    dayOfWeek: 'Segunda-feira',
    direction: 'Oeste',
    colors: ['Branco', 'Azul claro', 'Cinza'],
    offerings: ['Água de coco', 'Ferro polido', 'Farinha de mandioca', 'Flores brancas'],
    ebos: ['Ebo de paz', 'Ebo de longevidade', 'Ebo de proteção'],
    taboos: ['Não mentir', 'Não consumir sal em excesso', 'Não祀'],
    strengths: ['Sabedoria inabalável', 'Paciência férrea', 'Intuição profunda', 'Proteção sagrada'],
    weaknesses: ['Melancolia', 'Excesso de sensibilidade', 'Rigidez emocional'],
    health: ['Estômago', 'Útero', 'Rins'],
    meanings: ['Conhecimento protegido', 'Sabedoria endurecida', 'Mistério guardiã', 'Profundidade resiliente'],
    ifaMessage: 'Iron-Meji-Oyen abre o livro da sabedoria sagrada protegida pelo ferro, onde segredos ocultos são guardados pela força indestrutível do metal sagrado.',
  },
  {
    id: 'iron-meji-ogunda',
    name: 'Iron-Meji-Ogunda',
    portugueseName: 'Ferro-Meji-Ogunda',
    order: 3,
    polarity: 'masculine',
    element: 'Metal-Iron',
    planets: ['Mercúrio', 'Saturno', 'Marte'],
    sephirot: ['Hod', 'Gevurah', 'Netzach'],
    sign: 'Gêmeos',
    dayOfWeek: 'Quarta-feira',
    direction: 'Norte',
    colors: ['Amarelo', 'Laranja', 'Ferro'],
    offerings: ['Cobre', 'Ferro', 'Aço', 'Milho dourado'],
    ebos: ['Ebo de proteção', 'Ebo de comunicação', 'Ebo de destino'],
    taboos: ['Não usar armas', 'Não cortar árvores', 'Não祀破坏'],
    strengths: ['Comunicação forjada', 'Inteligência cortante', 'Versatilidade resistente', 'Destino protegido'],
    weaknesses: ['Inconstância ferrugenta', 'Nervosismo', 'Fragmentação'],
    health: ['Pulmões', 'Mãos', 'Braços'],
    meanings: ['Ferramentas de ferro', 'Destino forjado', 'Caminhos protegidos', 'Comunicação assertiva'],
    ifaMessage: 'Iron-Meji-Ogunda revela os caminhos duplos do destino protegido pelo ferro, mostrando múltiplas possibilidades ao consulente com a força do metal sagrado.',
  },
  {
    id: 'iron-meji-oshe',
    name: 'Iron-Meji-Oshe',
    portugueseName: 'Ferro-Meji-Oshe',
    order: 4,
    polarity: 'feminine',
    element: 'Earth-Metal',
    planets: ['Vênus', 'Terra', 'Marte'],
    sephirot: ['Netzach', 'Malkuth', 'Gevurah'],
    sign: 'Touro',
    dayOfWeek: 'Sexta-feira',
    direction: 'Sul',
    colors: ['Verde', 'Marrom', 'Cinza ferro'],
    offerings: ['Ferro antigo', 'Terra roxa', 'Frutas maduras', 'Mel'],
    ebos: ['Ebo de amor', 'Ebo de prosperidade', 'Ebo de estabilidade'],
    taboos: ['Não mudar de lugar', 'Não acumular riqueza excessivamente', 'Não祀'],
    strengths: ['Amor férreo', 'Beleza duradoura', 'Prosperidade sólida', 'Fertilidade protegida'],
    weaknesses: ['Teimosia', 'Possessividade', 'Estagnação'],
    health: ['Garganta', 'Pescoço', 'Ovários'],
    meanings: ['Amor forjado', 'Beleza terrestre', 'Prosperidade férrea', 'Fertilidade estável'],
    ifaMessage: 'Iron-Meji-Oshe revela o amor férreo entre a terra e o metal, onde a beleza e a prosperidade se entrelaçam na força indestrutível do sagrado ferro.',
  },
  {
    id: 'iron-meji-ika',
    name: 'Iron-Meji-Ika',
    portugueseName: 'Ferro-Meji-Ika',
    order: 5,
    polarity: 'feminine',
    element: 'Water-Earth-Iron',
    planets: ['Netuno', 'Terra', 'Marte'],
    sephirot: ['Binah', 'Malkuth', 'Gevurah'],
    sign: 'Escorpião',
    dayOfWeek: 'Terça-feira',
    direction: 'Oeste-Sul',
    colors: ['Preto', 'Marrom', 'Ferro escuro'],
    offerings: ['Ferro enferrujado', 'Água salgada', 'Terra negra', 'Nozes'],
    ebos: ['Ebo de transformação', 'Ebo de regeneração', 'Ebo de proteção'],
    taboos: ['Não trair', 'Não mentir', 'Não祀 falso'],
    strengths: ['Transformação poderosa', 'Regeneração', 'Poder de regeneração', 'Proteção absoluta'],
    weaknesses: ['Vingança', 'Ciúmes', 'Destrutividade'],
    health: ['Órgãos sexuais', 'Intestinos', 'Sangüíneo'],
    meanings: ['Transformação através do ferro', 'Regeneração', 'Poder regenerativo', 'Segredos guardados'],
    ifaMessage: 'Iron-Meji-Ika representa a transformação poderosa protegida pelo ferro sagrado, onde a morte e o renascimento se encontram na força do metal indestrutível.',
  },
  {
    id: 'iron-meji-oshi',
    name: 'Iron-Meji-Oshi',
    portugueseName: 'Ferro-Meji-Oshi',
    order: 6,
    polarity: 'masculine',
    element: 'Fire-Earth-Iron',
    planets: ['Sol', 'Marte', 'Saturno'],
    sephirot: ['Chokmah', 'Gevurah', 'Malkuth'],
    sign: 'Sagitário',
    dayOfWeek: 'Quinta-feira',
    direction: 'Sul-Leste',
    colors: ['Laranja', 'Azul', 'Ferro brilhante'],
    offerings: ['Ferro aquecido', 'Fogo ritual', 'Carne assada', 'Vinho'],
    ebos: ['Ebo de justiça', 'Ebo de viagem', 'Ebo de proteção'],
    taboos: ['Não huir', 'Não desistir', 'Não祀 covarde'],
    strengths: ['Justiça', 'Viagem segura', 'Proteção em jornada', 'Esperança'],
    weaknesses: ['Impaciência', 'Excesso de confiança', 'Arrogância'],
    health: ['Quadris', 'Coxas', 'Fígado'],
    meanings: ['Justiça forjada', 'Viagem protegida', 'Esperança férrea', 'Fé inabalável'],
    ifaMessage: 'Iron-Meji-Oshi manifesta a justiça forjada no ferro sagrado, onde a viagem espiritual é protegida pela força indestrutível do metal primordial.',
  },
];

export function getData(): IronMejiOdu[] {
  return IRON_MEJI_DATA;
}