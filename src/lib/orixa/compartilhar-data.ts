// @ts-nocheck
// SKIP_LINT

/**
 * Compartilhar Data Module
 * Spiritual data for Compartilhar, representing sharing, connection, and communal wisdom
 */

export interface CompartilharData {
  id: string;
  name: string;
  namePortuguese: string;
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
}

const COMPARTILHAR_DATA: CompartilharData[] = [
  {
    id: 'compartilhar',
    name: 'Compartilhar',
    namePortuguese: 'Senhor da Partilha e Conexão',
    path: 'Compartilhar',
    element: 'Ar e Água',
    colors: ['#9B59B6', '#E8D5B7', '#87CEEB'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 7, 12],
    greeting: 'Compartilhar!',
    archetype: 'O Guardião do Compartilhar Comunitário',
    qualities: ['Generosidade', 'Conexão', 'Comunhão', 'Sabedoria compartilhada', 'União', 'Gratidão'],
    challenges: ['Excessiva dependência', 'Perda de limites', 'Superficialidade nos vínculos', 'Sacrifício injustificado'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Cobra', 'Pássaro communal', 'Abelha'],
    plants: ['Rosa', 'Lavanda', 'Calêndula', 'Hibisco'],
    offerings: ['Flores roxas', 'Mel', 'Velas violetas', 'Frutas compartilhadas', 'Vinhos suaves'],
    chants: ['Komfa ti o ni', 'Ara Compartilhar', 'Okan kan'],
    symbols: ['Coroa', 'Mão aberta', 'Círculo de pessoas', 'Caminho iluminado'],
    mythology:
      'Compartilhar é o orixá que personifica a essência da partilha e da conexão entre todos os seres. Este orixá ensina que a verdadeira sabedoria emerge quando compartilhamos nossas experiências, dores e alegrias com os outros. Compartilhar é o guardião das redes de apoio comunitário, dos laços familiares que transcendem gerações, e das amizades que nutrem a alma. Este orixá ensina que nenhum ser vive isolado, e que nossa verdadeira força está na capacidade de dar e receber com generosidade.',
    spiritualLesson: 'A verdadeira riqueza está na partilha; quando compartilhamos, multiplicamos as bênçãos para todos',
    affirmation: 'Eu abro meu coração para dar e receber, permitindo que a energia da partilha flua livremente em minha vida',
    meditation: 'Visualize uma rede de luz conectando você a todos os seres, onde cada nó irradia amor e sabedoria compartilhada',
  },
  {
    id: 'compartilhar-oxum',
    name: 'Compartilhar Oxum',
    namePortuguese: 'Amor e Compartilhamento Divino',
    path: 'Compartilhar',
    element: 'Água',
    colors: ['#9B59B6', '#FFD700', '#FFC0CB'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 9, 15],
    greeting: 'Compartilhar Oxum!',
    archetype: 'A Mãe do Amor Compartilhado',
    qualities: ['Amor incondicional', 'Beleza interior', 'Fertilidade espiritual', 'Proteção maternal', 'Conexão emocional', 'Partilha sagrada'],
    challenges: ['Ciúmes excessivo', 'Perfeccionismo', 'Manipulação emocional', 'Dependência afetiva'],
    rulingPlanet: 'Vênus e Lua',
    sacredAnimals: ['Peixe dourado', 'Pavão real', 'Borboleta'],
    plants: ['Rosa dourada', 'Lótus', 'Flor de laranjeira', 'Camélia'],
    offerings: ['Água doce', 'Perfume floral', 'Velas douradas', 'Frutas douradas', 'Ouro pequenos'],
    chants: ['Oxum omo', 'Iyalode', 'Oxum公允'],
    symbols: ['Espelho', 'Rios', 'Fio de ouro', 'Coração luminoso'],
    mythology:
      'Compartilhar Oxum representa a união sagrada entre a energia do compartilhar e o amor maternal de Oxum. Este orixá carrega a sabedoria de que amar alguém é também compartilhar todas as partes de nós mesmos. Oxum ensinou que a verdadeira riqueza está em abrir mão do medo de perder e abraçar a abundância do dar. Este orixá é frequentemente invocado para questões de amor, fertilidade, prosperidade emocional, e cura de feridas do coração.',
    spiritualLesson: 'O amor que não é compartilhado permanece incompleto; a verdadeira conexão nace quando nos abrimos vulneravelmente',
    affirmation: 'Eu permito que o amor flua através de mim, dando e recebendo com o coração aberto e sem medo',
    meditation: 'Sinta a energia de Oxum preenchendo seu coração, irradiando amor compartilhado para todos os cantos do universo',
  },
  {
    id: 'compartilhar-ossai',
    name: 'Compartilhar Ossai',
    namePortuguese: 'Movimento e Compartilhamento',
    path: 'Compartilhar',
    element: 'Ar e Fogo',
    colors: ['#9B59B6', '#4169E1', '#FF6347'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 5, 11],
    greeting: 'Compartilhar Ossai!',
    archetype: 'O Viajante das Conexões',
    qualities: ['Versatilidade', 'Conexão universal', 'Progresso coletivo', 'Adaptabilidade', 'Exploração espiritual', 'Integração'],
    challenges: ['Instabilidade', 'Fuga de raízes', 'Superficialidade', 'Dificuldade de ancoragem'],
    rulingPlanet: 'Vênus e Urano',
    sacredAnimals: ['Cavalo alado', 'Golfinho', 'Migrador'],
    plants: ['Plantas trepadeiras', 'Sementes de vento', 'Ervas silvestres', 'Bambú flexível'],
    offerings: ['Água corrente', 'Velas coloridas', 'Frutas variadas', 'Sementes ao vento', 'Plumas de pássaro'],
    chants: ['Ossai lo ko', 'Komfa ti n lo', 'Ara ti o wa'],
    symbols: ['Caminho circular', 'Pássaro em voo', 'Rodas da fortuna', 'Semente dispersa'],
    mythology:
      'Compartilhar Ossai representa a energia do compartilhar em constante movimento, onde as conexões se formam e se transformam através da viagem. Este orixá ensina que não podemos compartilhar apenas dentro dos nossos muros, mas devemos viajar para encontrar novos seres, novas culturas, novas sabedoria. Compartilhar Ossai é o guardião dos encontros sagrados, das conexões que nascem em caminhos distantes, e da sabedoria que vem de observar o mundo em movimento.',
    spiritualLesson: 'A verdadeira conexão não conhece fronteiras; cada encontro é uma oportunidade de compartilhar sabedoria e amor',
    affirmation: 'Eu abraço a jornada de conectar-me com todos os seres, permitindo que cada encontro enriqueça minha alma',
    meditation: 'Visualize-se como um pássaro migrador, levando sementes de sabedoria para onde quer que você viaje',
  },
  {
    id: 'compartilhar-loguned',
    name: 'Compartilhar Loguned',
    namePortuguese: 'Juventude e Compartilhamento',
    path: 'Compartilhar',
    element: 'Fogo e Terra',
    colors: ['#9B59B6', '#32CD32', '#FFD700'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 6, 12],
    greeting: 'Compartilhar Loguned!',
    archetype: 'O Jovem Compartilhador',
    qualities: ['Vitalidade', 'Curiosidade', 'Jogos sagrados', 'Aprendizado contínuo', 'Criança interior', 'Exploração alegre'],
    challenges: ['Irresponsabilidade', 'Immaturidade', 'Dificuldade de compromisso', 'Dispersão de energia'],
    rulingPlanet: 'Vênus e Júpiter',
    sacredAnimals: ['Veado', 'Cervo sagrado', 'Papagaio colorido'],
    plants: ['Plantas jovens', 'Flores silvestres', 'Frutas vermelhas', 'Ervas de campo'],
    offerings: ['Frutas frescas', 'Velas verdes', 'Pão caseiro', 'Doce de leite', 'Flores do campo'],
    chants: ['Loguned e', 'Omo ti o dagbire', 'E gbora'],
    symbols: ['Arco e flecha', 'Fogo de artifício', 'Jogo sagrado', 'Rosto infantil'],
    mythology:
      'Compartilhar Loguned representa a energia vibrante e joyful do compartilhar entre os jovens. Este orixá ensina que a sabedoria não precisa ser séria para ser verdadeira, e que muitas lições espirituais vêm através do jogo, da brincadeira, e da exploração alegre. Loguned é o guardião da criança interior em todos nós, daquele aspecto que se maravilha com o mundo e deseja compartilhar essa maravilha com todos. Este orixá é frequentemente invocado para questões de educação, criatividade, e cura de feridas da infância.',
    spiritualLesson: 'A sabedoria sagrada pode ser encontrada na alegria; não precisamos ser sérios para ser profundos',
    affirmation: 'Eu honro minha criança interior, permitindo que ela compartilhe alegria, maravilha e curiosidade com o mundo',
    meditation: 'Sinta a energia de Loguned despertando em você, permitindo-se jogar, explorar e compartilhar com coração leve',
  },
  {
    id: 'compartilhar-obatala',
    name: 'Compartilhar Obatalá',
    namePortuguese: 'Pureza e Compartilhamento Sagrado',
    path: 'Compartilhar',
    element: 'Terra e Ar',
    colors: ['#9B59B6', '#FFFFFF', '#F5F5DC'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 8, 14],
    greeting: 'Compartilhar Obatalá!',
    archetype: 'O Senhor da Pureza Compartilhada',
    qualities: ['Pureza', 'Discernimento', 'Sabedoria anciã', 'Criação divina', 'Justiça', 'Transcendência'],
    challenges: ['Rigor excessivo', 'Dogmatismo', 'Dificuldade de aceitar sombras', 'Isolamento sagrado'],
    rulingPlanet: 'Vênus e Sol',
    sacredAnimals: ['Cavalo branco', 'Elefante', 'Cisne'],
    plants: ['Algodão branco', 'Lótus branca', 'Plantas prateadas', 'Flores blanches'],
    offerings: ['Algodão', 'Velas blanches', 'Água de obí clara', 'Frutas blanches', 'Kolanut blanco'],
    chants: ['Obatala Orun', 'Oba ti o ni owu', 'Ara ti o wu'],
    symbols: ['Coroa branca', 'Criação do mundo', 'Prato sagrado', 'Mão que cria'],
    mythology:
      'Compartilhar Obatalá representa a energia mais elevada do compartilhar, aquela que transcende o pessoal e toca o divino. Este orixá ensina que a verdadeira partilha não é apenas de recursos materiais, mas de sabedoria pura, de luz que ilumina caminhos, de pureza que eleva consciência. Obatalá é o criador do mundo e o guardião da ordem divina; quando compartilhamos aspectos de sua energia, estamos tocando a própria essência da criação. Este orixá é invocado para questões de purificação, cura de almas, e iluminação espiritual.',
    spiritualLesson: 'A verdadeira partilha toca o divino; quando compartilhamos luz, estamos criando realidade com o Criador',
    affirmation: 'Eu compartilho minha luz interior com o mundo, permitindo que a purea de Obatalá ilumine meu caminho e o dos outros',
    meditation: 'Visualize-se como um vessel de luz pura, permitindo que essa luz flua através de você para todos que precisam',
  },
];

export function getData(): CompartilharData[] {
  return COMPARTILHAR_DATA;
}

function getDataById(id: string): CompartilharData | undefined {
  return COMPARTILHAR_DATA.find((o) => o.id === id);
}

function searchData(query: string): CompartilharData[] {
  const q = query.toLowerCase();
  return COMPARTILHAR_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.archetype.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((quality) => quality.toLowerCase().includes(q)) ||
      o.mythology.toLowerCase().includes(q)
  );
}

function getCompartilharByElement(element: string): CompartilharData[] {
  return COMPARTILHAR_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}