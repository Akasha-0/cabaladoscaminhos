// @ts-nocheck
// SKIP_LINT

/**
 * Harmonizacao Data Module
 * Spiritual data for Harmonização, representing balance, alignment, and inner peace
 */

export interface HarmonizacaoData {
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

const HARMONIZACAO_DATA: HarmonizacaoData[] = [
  {
    id: 'harmonizacao- ancestral',
    name: 'Harmonização Ancestral',
    namePortuguese: 'Equilíbrio com a Sabedoria dos Ancestrais',
    path: 'Harmonização',
    element: 'Terra e Água',
    colors: ['#8B4513', '#DEB887', '#006400'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [7, 14, 21],
    greeting: 'Harmonização Ancestral!',
    archetype: 'O Guardião da Tradição Equilibrada',
    qualities: ['Conexão ancestral', 'Equilíbrio emocional', 'Sabedoria tradicional', 'Proteção espiritual', 'Harmonia familiar', 'Gratidão'],
    challenges: ['Rigidez emocional', 'Superproteção do passado', 'Dificuldade de perdoar', 'Melancolia excessiva'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Tartaruga', 'Coruja', 'Elefante'],
    plants: ['Raízes antigas', 'Ayawakawa', 'Kolanut', 'Ervas de proteção'],
    offerings: ['Água de obí clara', 'Kolanut fresco', 'Velas marrons e verdes', 'Frutas da estação', ' terra sagrada'],
    chants: ['Baba ti o wa', 'Ori ti o ni', 'Ase loju'],
    symbols: ['Círculo terrestre', 'Raízes', 'Kolanut', 'Terra cultivada'],
    mythology:
      'A Harmonização Ancestral representa o estado de equilíbrio que emerge quando honramos nossos antepassados e incorporamos sua sabedoria em nossas vidas. Este caminho ensina que não estamos sozinhos — somos parte de uma corrente de consciência que se estende através das gerações. Quando nos harmonizamos com nossos ancestrais, recebemos sua bênção e proteção, encontrando equilíbrio entre o que foi e o que será. A tradição oral de Ifá nos ensina que nossos ancestrais continuam a caminhar ao nosso lado, guiando nossos passos quando abrimos espaço para ouvi-los.',
    spiritualLesson: 'Somos elos em uma corrente de consciência; honrando o passado, criamos harmonia para o futuro',
    affirmation: 'Eu honro meus ancestrais e permito que sua sabedoria me guie para o equilíbrio em todas as áreas da vida',
    meditation: 'Visualize suas raízes ancestrais descendo profundamente na terra, nutrindo você com sabedoria e proteção',
  },
  {
    id: 'harmonizacao-cosmica',
    name: 'Harmonização Cósmica',
    namePortuguese: 'Alinhamento com os ciclos celestiais',
    path: 'Harmonização',
    element: 'Ar e Fogo',
    colors: ['#4169E1', '#FFD700', '#000033'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [9, 12, 27],
    greeting: 'Harmonização Cósmica!',
    archetype: 'O Alinhado com os Astros',
    qualities: ['Alinhamento cósmico', 'Intuição celestial', 'Visão de longo prazo', 'Sincronicidade', 'Bênçãos universais', 'Conexão estelar'],
    challenges: ['Expectativas irreais', 'Afastamento do cotidiano', 'Excesso de espiritualidade', 'Negligência do mundo material'],
    rulingPlanet: 'Júpiter e Sol',
    sacredAnimals: ['Falcão', 'Águia', 'Coruja'],
    plants: ['Sálvia', 'Lavanda', 'Alecrim', 'estrelas-do-mar'],
    offerings: ['Água lunar', 'Mel', 'Velas douradas e azuis', 'Incenso de olibano', 'Cristais'],
    chants: ['Orunmila', 'Eleye', 'Ase oju orun'],
    symbols: ['Estrela', 'Lua crescente', 'Sol', 'Constelação'],
    mythology:
      'A Harmonização Cósmica ocorre quando alinhamos nossos passos com os ciclos celestiais e as sincronicidades do universo. Este estado de graça nos conecta com a inteligência cósmica que sustenta toda existência. Quando estamos em harmonia com o cosmos, os eventos se alinham em nosso favor, encontros significativos ocorrem, e a vida flui com propósito e significado. A astrologia de Ifá reconhece que cada pessoa nasce sob特定的星辰配置 que influencia seu destino, e harmonizar-se com esses ciclos celestiais traz abundância e proteção.',
    spiritualLesson: 'Estamos conectados com o cosmos; quando alinhamos nossa vontade com a inteligência universal, bênçãos fluem naturalmente',
    affirmation: 'Eu me alinho com os ciclos cósmicos, permitindo que a inteligência divina guie meus passos para o destino certo',
    meditation: 'Visualize-se conectado com as estrelas, absorvendo luz cósmica que ilumina seu caminho com harmonia',
  },
  {
    id: 'harmonizacao-interna',
    name: 'Harmonização Interna',
    namePortuguese: 'Equilíbrio entre corpo, mente e espírito',
    path: 'Harmonização',
    element: 'Fogo e Água',
    colors: ['#FF69B4', '#4169E1', '#FFFFFF'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [3, 6, 12],
    greeting: 'Harmonização Interna!',
    archetype: 'O Equilibrador Interior',
    qualities: ['Auto-conhecimento', 'Equilíbrio emocional', 'Integração pessoal', 'Autocompaixão', 'Sabedoria interior', 'Paz consigo mesmo'],
    challenges: ['Autocrítica excessiva', 'Conflito interno', 'Dificuldade de aceitar falhas', 'Perfeccionismo'],
    rulingPlanet: 'Vênus e Lua',
    sacredAnimals: ['Borboleta', 'Pavão', 'Cisne'],
    plants: ['Rosa', 'Jasmin', 'Lótus', 'Camomila'],
    offerings: ['Água de rosas', 'Perfume natural', 'Velas rosadas e brancas', 'Pétalas frescas', 'Mel com rosas'],
    chants: ['Okan mi yo', 'Ori inu', 'Aanu leleyo'],
    symbols: ['Coração', 'Espelho', 'Borboleta', 'Lótus'],
    mythology:
      'A Harmonização Interna é o estado de equilíbrio entre todas as partes do nosso ser — corpo, mente, emoções e espírito. Este é o trabalho mais sagrado que podemos realizar: reconciliar os conflitos internos e encontrar paz no centro do nosso ser. A tradição de Ifá ensina que o Ori (cabeça/destino interior) deve estar em harmonia para que a vida externa flua com facilidade. Quando cultivamos auto-conhecimento e autocompaixão, transformamos nossa relação conosco mesmos e, consequentemente, com todo o universo ao nosso redor.',
    spiritualLesson: 'A verdadeira harmonia começa dentro de nós; ao nos reconciliar conosco mesmos, encontramos paz em todo lugar',
    affirmation: 'Eu me aceito completamente, honrando todas as partes do meu ser com compaixão e amor',
    meditation: 'Visualize cada parte de seu ser — corpo, mente, emoções, espírito — encontrando harmonia em seu centro luminoso',
  },
  {
    id: 'harmonizacao-relacional',
    name: 'Harmonização Relacional',
    namePortuguese: 'Equilíbrio nas relações humanas',
    path: 'Harmonização',
    element: 'Água e Ar',
    colors: ['#FF6347', '#98FB98', '#FFDAB9'],
    dayOfWeek: 'Domingo',
    numbersSacred: [2, 6, 10],
    greeting: 'Harmonização Relacional!',
    archetype: 'O Facilitador de Conexões',
    qualities: ['Empatia', 'Comunicação clara', 'Generosidade', 'Perdão', 'Conexão profunda', 'Compaixão ativa'],
    challenges: ['Pessoas-pleasing', 'Fuga de conflitos', 'Dependência emocional', 'Dificuldade em estabelecer limites'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Pomba', 'Golfinho', 'Cão fiel'],
    plants: ['Hibisco', 'Flor de maracujá', 'Ylang-ylang', 'Gerânio'],
    offerings: ['Água perfumada', 'Flores frescas', 'Velas cor-de-rosa', 'Vinho suave', 'Doces compartilhados'],
    chants: ['Ayanmo', 'Omo ti o ni', 'Eru meta'],
    symbols: ['Corações entrelaçados', 'Mãos unidas', 'Arco-íris', 'Ponte'],
    mythology:
      'A Harmonização Relacional representa o equilíbrio saudável em nossos relacionamentos — com família, parceiros, amigos e comunidade. Este caminho ensina que somos seres relacionais por natureza, e que nossa verdadeira plenitude emerge na conexão autêntica com outros. Ifá reconhece que ninguém pode caminhar sozinho; precisamos uns dos outros para crescer, curar e evoluir. A harmonia relacional não significa ausência de conflitos, mas a capacidade de navegar diferenças com respeito, empatia e abertura para compreender o outro.',
    spiritualLesson: 'Nossas relações são espelhos que nos ajudam a crescer; em cada encontro, temos oportunidade de cura e evolução',
    affirmation: 'Eu me comunico com autenticidade e escuto com compaixão, permitindo que minhas relações se transformem em fontes de harmonia',
    meditation: 'Visualize suas relações mais importantes irradiando luz e harmonia, cada uma sendo uma fonte de apoio mútuo',
  },
  {
    id: 'harmonizacao-sazonal',
    name: 'Harmonização Sazonal',
    namePortuguese: 'Alinhamento com os ritmos da natureza',
    path: 'Harmonização',
    element: 'Terra e Ar',
    colors: ['#228B22', '#90EE90', '#8FBC8F'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [4, 8, 16],
    greeting: 'Harmonização Sazonal!',
    archetype: 'O Ritmista da Natureza',
    qualities: ['Adaptabilidade', 'Paciência', 'Ciclicidade', 'Resiliência', 'Sustentabilidade', 'Conexão natural'],
    challenges: ['Resistência à mudança', 'Excesso de identificação com uma estação', 'Impaciência com ciclos lentos', 'Desconexão da natureza'],
    rulingPlanet: 'Terra e Lua',
    sacredAnimals: ['Serpente', 'Cervo', 'Abelha'],
    plants: ['Todas as ervas sazonais', 'Árvores frutíferas', 'Flores silvestres', 'Musgo'],
    offerings: ['Frutos da estação', 'Água de nascente', 'Folhas secas', 'Velas verdes', 'Terra fértil'],
    chants: ['Oko', 'Ile aye', 'Asa ti n lo'],
    symbols: ['Folhas', 'Lua crescente e cheia', 'Estações', 'Ciclo de vida'],
    mythology:
      'A Harmonização Sazonal é o estado de consciência que reconhece e honra os ritmos naturais da Terra e do cosmos. Cada estação traz suas próprias energias, lições e oportunidades de crescimento. A tradição de Ifá sempre esteve conectada com os ciclos agrícolas e celestiais, entendendo que viver em harmonia com esses ritmos traz abundância e saúde. Harmonizar-se sazonalmente significa saber quando plantar e quando colher, quando agir e quando descansar, quando se expandir e quando se recolher. A natureza é a maior mestra de equilíbrio, e em seus ciclos encontramos o modelo perfeito para uma vida harmoniosa.',
    spiritualLesson: 'A natureza ensina que tudo tem seu tempo; viver em harmonia com os ciclos é viver em alinhamento com o divino',
    affirmation: 'Eu honro os ciclos da natureza e permito que meu ritmo de vida se harmonize com as estações do tempo',
    meditation: 'Sinta-se conectado com a terra sob seus pés, respirando em harmonia com os ciclos naturais do planeta',
  },
];

export function getData(): HarmonizacaoData[] {
  return HARMONIZACAO_DATA;
}

function getDataById(id: string): HarmonizacaoData | undefined {
  return HARMONIZACAO_DATA.find((h) => h.id === id);
}

function searchData(query: string): HarmonizacaoData[] {
  const lowerQuery = query.toLowerCase();
  return HARMONIZACAO_DATA.filter(
    (h) =>
      h.name.toLowerCase().includes(lowerQuery) ||
      h.namePortuguese.toLowerCase().includes(lowerQuery) ||
      h.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      h.element.toLowerCase().includes(lowerQuery)
  );
}

function getHarmonizacaoByElement(element: string): HarmonizacaoData[] {
  return HARMONIZACAO_DATA.filter((h) => h.element.toLowerCase().includes(element.toLowerCase()));
}