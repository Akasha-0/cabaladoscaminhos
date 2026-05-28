 
// @ts-nocheck

/**
 * Orixá Offering Guides Module
 * Comprehensive guides for making offerings to each Orixá
 */

export interface OfferingGuide {
  id: string;
  orixaId: string;
  name: string;
  category: 'food' | 'drink' | 'object' | 'plant' | 'animal' | 'ritual';
  description: string;
  significance: string;
  properDay?: string;
  properTime?: string;
  forbiddenElements?: string[];
  preparationSteps: string[];
  history?: string;
}

const OFFERING_GUIDES: OfferingGuide[] = [
  // Oxum Offering Guides
  {
    id: 'oxum-mel',
    orixaId: 'oxum',
    name: 'Mel e Doce de Oxum',
    category: 'food',
    description: 'Mel puro e doces caseiros como oferenda principal',
    significance: 'O mel representa a doçura e a prosperidade que Oxum traz',
    properDay: 'Sábado',
    properTime: 'Manhã',
    preparationSteps: [
      'Preparar mel puro de abelha',
      'Fazer doces caseiros sem fermento',
      'Colocar em prato amarelo dourado',
      'Adicionar flores amarelas ao redor',
      'Despejar água doce em vasilha de barro',
    ],
    history: 'Oxum é a guardiã das águas doces e do mel, símbolos de amor e prosperidade',
  },
  {
    id: 'oxum-espelho',
    orixaId: 'oxum',
    name: 'O Espelho de Oxum',
    category: 'object',
    description: 'Espelho antigo para ritual de autoconhecimento',
    significance: 'O espelho representa a verdade interior e a beleza verdadeira',
    properDay: 'Sábado',
    properTime: 'Qualquer hora do dia',
    preparationSteps: [
      'Usar espelho antigo ou herdado',
      'Limpar com pano umedecido em água doce',
      'Colocar sobre pano amarelo',
      'Decorar com colares e fitas douradas',
      'Refletir a luz do sol no espelho durante o ritual',
    ],
  },
  {
    id: 'oxum-pente',
    orixaId: 'oxum',
    name: 'Pente de Osso',
    category: 'object',
    description: 'Pente de osso para ritual de beleza e renovação',
    significance: 'O pente representa a organização e o cuidado com a aparência',
    properDay: 'Sábado',
    properTime: 'Ao amanhecer',
    preparationSteps: [
      'Usar pente de osso ou madeira',
      'Limpar antes do ritual',
      'Colocar junto ao espelho de Oxum',
      'Pentear os cabelos lentamente enquanto reza',
      'Guardar junto ao altar após o ritual',
    ],
  },

  // Oxóssi Offering Guides
  {
    id: 'oxossi-fumagem',
    orixaId: 'oxossi',
    name: 'Fumagem do Caçador',
    category: 'ritual',
    description: 'Fumagem sagrada para pedir fartura e conhecimento',
    significance: 'A fumagem representa a conexão com a floresta e seus mistérios',
    properDay: 'Quinta-feira',
    properTime: 'Entardecer',
    preparationSteps: [
      'Preparar herbal de folhas sagradas',
      'Acender em local aberto ou natureza',
      'Fazer fumaça subir em espiral',
      'Recitar oração de Oxóssi',
      'Deixar a fumagem se espalhar naturalmente',
    ],
    history: 'Oxóssi é o mestre das matas e conhece todos os segredos das ervas',
  },
  {
    id: 'oxossi-acucar',
    orixaId: 'oxossi',
    name: 'Açúcar Mascavo',
    category: 'food',
    description: 'Açúcar mascavo como oferenda de doçura e fartura',
    significance: 'O açúcar mascavo representa a abundância natural',
    properDay: 'Quinta-feira',
    properTime: 'Manhã',
    forbiddenElements: ['Carne vermelha', 'Alcool'],
    preparationSteps: [
      'Colocar açúcar mascavo em prato de barro',
      'Adicionar mel silvestre se disponível',
      'Colocar flores verdes e cipós',
      'Oferecer ao ar livre ou perto de árvores',
    ],
  },
  {
    id: 'oxossi-arco',
    orixaId: 'oxossi',
    name: 'Arco e Flechas',
    category: 'object',
    description: 'Arco e flechas como símbolos de proteção e caça',
    significance: 'Representa a habilidade de caçar e prover para a família',
    properDay: 'Quinta-feira',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Usar arco feito de madeira forte',
      'Preparar flechas com penas de aves',
      'Colocar no altar com a ponta voltada para o céu',
      'Consagrar com saliva e prayers',
      'Manter fora do alcance de crianças',
    ],
  },

  // Iemanjá Offering Guides
  {
    id: 'iemanja-agua-mar',
    orixaId: 'iemanja',
    name: 'Água do Mar Sagrada',
    category: 'ritual',
    description: 'Água do mar coletada em dia especial para oferenda',
    significance: 'A água do mar representa a energia maternal e protetora de Iemanjá',
    properDay: '15 de agosto, 31 de dezembro',
    properTime: 'Ao amanhecer ou pôr do sol',
    preparationSteps: [
      'Coletar água do mar em local limpo',
      'Guardar em garrafa de vidro',
      'Misturar com sal grosso ritual',
      'Adicionar flores brancas',
      'Despejar no mar devagaramente pedindo proteção',
    ],
    history: 'Iemanjá é a rainha do mar e protege todos os seus filhos',
  },
  {
    id: 'iemanja-espiral',
    orixaId: 'iemanja',
    name: 'Presente de Iemanjá',
    category: 'ritual',
    description: 'Presente decorado levado ao mar em noite especial',
    significance: 'O espiral representa o movimento eterno da vida',
    properDay: '24 de dezembro',
    properTime: 'Noite',
    forbiddenElements: ['Ferro', 'Couro', 'Objetos cortantes'],
    preparationSteps: [
      'Montar presente em prato quadrado branco',
      'Colocar espelhos, colares e perfumes',
      'Adicionar flores brancas e arroz',
      'Envolver em pano branco bordado',
      'Levar à beira do mar após meia-noite',
      'Entregar ao mar com oração e devoção',
    ],
  },
  {
    id: 'iemanja-navio',
    orixaId: 'iemanja',
    name: 'Barco Decorado',
    category: 'object',
    description: 'Barco miniiatura decorado para presente maritime',
    significance: 'O barco representa a jornada espiritual e proteção nas águas',
    properDay: '2 de fevereiro, 15 de agosto',
    properTime: 'Manhã',
    preparationSteps: [
      'Construir barco de madeira ou usar miniatura',
      'Decorar com fitas brancas e azuis',
      'Colocar flores e perfumes dentro',
      'Colocar espelhos pequeños estrategicamente',
      'Lançar ao mar pedindo proteção para navegação',
    ],
  },

  // Ogum Offering Guides
  {
    id: 'ogum-ferradura',
    orixaId: 'ogum',
    name: 'Ferradura de Ogum',
    category: 'object',
    description: 'Ferradura como símbolo de proteção e abertura de caminhos',
    significance: 'A ferradura representa a força do ferro e a proteção contra males',
    properDay: 'Terça-feira',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Bendizer ferradura em água com sal',
      'Passar pelo fumo de ervas sagradas',
      'Colocar na entrada de casa ou no altar',
      'Pointar as pontas para cima em formato de U',
      'Rezar oração de proteção antes de instalar',
    ],
    history: 'Ogum é o ferreiro divino que forja ferramentas para a humanidade',
  },
  {
    id: 'ogum-sangue',
    orixaId: 'ogum',
    name: 'Sangue de Ogum',
    category: 'animal',
    description: 'Sangue de animal para oferenda de guerra e proteção',
    significance: 'O sangue representa a vida e a força vital para rituais de proteção',
    properDay: 'Terça-feira',
    properTime: 'Ao meio-dia',
    forbiddenElements: ['Água', 'Flores', 'Doces'],
    preparationSteps: [
      'Usar sangue de galo ou pombo apenas',
      'Colher em prato de ferro',
      'Misturar com cachaça ritual',
      'Despejar no chão em formato de espiral',
      'Enterrar restos junto ao altar',
    ],
  },
  {
    id: 'ogum-faca',
    orixaId: 'ogum',
    name: 'Faca Consagrada',
    category: 'object',
    description: 'Faca de ferro para proteção e abertura de caminhos',
    significance: 'A faca representa o poder de cortar negatividade e abrir caminhos',
    properDay: 'Terça-feira',
    properTime: 'Manhã',
    preparationSteps: [
      'Usar faca nova de ferro sem uso anterior',
      'Afiar antes do ritual de consagração',
      'Enterrar lâmina na terra por uma noite',
      'Desenterrar e limpar com aguardente',
      'Consagrar com saliva e oração de Ogum',
    ],
  },

  // Xangô Offering Guides
  {
    id: 'xango-pedra',
    orixaId: 'xango',
    name: 'Pedra de Raios',
    category: 'object',
    description: 'Pedra petrificada para representar o poder dos raios',
    significance: 'A pedra representa a justiça divina e o poder do trovão',
    properDay: 'Quarta-feira',
    properTime: 'Ao ouvir trovão ou em dias de tempestade',
    preparationSteps: [
      'Encontrar pedra em formato de machado ou pontuda',
      'Limpar com água da chuva',
      'Colocar sobre pano vermelho e preto',
      'Bater duas pedras uma na outra para invocar trovão',
      'Guardar em lugar alto e seguro',
    ],
    history: 'Xangô é o senhor dos raios e da justiça, governa tempestades e tribunais',
  },
  {
    id: 'xango-fogo',
    orixaId: 'xango',
    name: 'Fogo Ritual de Xangô',
    category: 'ritual',
    description: 'Fogo sagrado para pedidos de justiça e equilíbrio',
    significance: 'O fogo representa a purifying ação da justiça de Xangô',
    properDay: 'Quarta-feira',
    properTime: 'Meia-noite',
    forbiddenElements: ['Água', 'Peixe', 'Sal marinho'],
    preparationSteps: [
      'Acender fogueira em local preparado',
      'Colocar pedras vermelhas ao redor',
      'Jogar folhas de Xinxim de galinha no fogo',
      'Recitar oração de Xangô enquanto fogo queima',
      'Saltar sobre o fogo pedindo proteção',
    ],
  },

  // Nanã Offering Guides
  {
    id: 'nana-lama',
    orixaId: 'nana',
    name: 'Lama Sagrada',
    category: 'ritual',
    description: 'Lama como oferenda ancestral e de humildade',
    significance: 'A lama representa a origem da vida e a humildade diante da morte',
    properDay: 'Domingo',
    properTime: 'Entardecer',
    preparationSteps: [
      'Coletar lama de local sagrado ou nascente',
      'Misturar com água de chuva',
      'Formar bolinhas com as mãos',
      'Colocar junto ao altar em prato de barro',
      'Fazer oração de respeito aos ancestrais',
    ],
    history: 'Nanã é a guardiã da lama onde tudo começa e termina, senhora da morte e da sabedoria',
  },
  {
    id: 'nana-quixaba',
    orixaId: 'nana',
    name: 'Quiabá de Nanã',
    category: 'plant',
    description: 'Folhas de quiabá para oferenda de sabedoria',
    significance: 'As folhas representam a sabedoria ancestral que Nanã guarda',
    properDay: 'Domingo',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Coletar folhas de quiabá frescas',
      'Lavar com água de chuva',
      'Colocar em vasilha de barro junto com lama',
      'Adicionar fumo e aguardente',
      'Oferecer pedindo sabedoria para decisões importantes',
    ],
  },

  // Obá Offering Guides
  {
    id: 'oba-facas',
    orixaId: 'oba',
    name: 'Facas de Obá',
    category: 'object',
    description: 'Conjunto de facas como símbolo de guerreira',
    significance: 'As facas representam a determinação e fidelidade de Obá',
    properDay: 'Terça-feira',
    properTime: 'Qualquer hora',
    forbiddenElements: ['Água doce', 'Flores amarelas'],
    preparationSteps: [
      'Usar conjunto de facas pequenas de ferro',
      'Limpar cada faca com aguardente',
      'Colocar em cruz sobre pano laranja',
      'Consagrar com saliva e prayers de força',
      'Manter em lugar seguro do altar',
    ],
    history: 'Obá é a guerreira do amor, conhecida por sua fidelidade e determinação',
  },

  // Ossaim Offering Guides
  {
    id: 'ossaim-ervas',
    orixaId: 'ossaim',
    name: 'Ervas de Ossaim',
    category: 'plant',
    description: 'Mistura de ervas sagradas para cura e conhecimento',
    significance: 'As ervas representam o poder curativo e a sabedoria medicinal',
    properDay: 'Quinta-feira',
    properTime: 'Ao amanhecer',
    preparationSteps: [
      'Coletar ervas em local sagrado ou floresta',
      'Secar à sombra por varios dias',
      'Misturar em vasilha de barro',
      'Consagrar com prayers e fumo',
      'Usar para banhos, chás ou焚香',
    ],
    history: 'Ossaim é o senhor das ervas e da medicina, conhece todos os segredos da natureza',
  },
  {
    id: 'ossaim-passaros',
    orixaId: 'ossaim',
    name: 'Pássaros de Ossaim',
    category: 'animal',
    description: 'Pássaros como oferenda e comunicação com o espiritual',
    significance: 'Os pássaros representam a liberdade e a conexão com o mundo espiritual',
    properDay: 'Quinta-feira',
    properTime: 'Manhã',
    forbiddenElements: ['Ferro', 'Fogo'],
    preparationSteps: [
      'Usar pássaros criados em cativeiro ou soltos',
      'Se for sacrifício, usar galo ou pombo',
      'Preparar local sagrado no mato',
      'Oferecer com respeito e oração',
      'Libertar pássaros quando possível',
    ],
  },

  // Logun-Edé Offering Guides
  {
    id: 'logunede-cacimba',
    orixaId: 'logunede',
    name: 'Cacimba de Logun-Edé',
    category: 'ritual',
    description: 'Ritual de água no poço para o orixá duplo',
    significance: 'A cacimba representa o encontro das águas com a terra fértil',
    properDay: 'Quinta-feira ou sábado',
    properTime: 'Manhã',
    preparationSteps: [
      'Escolher local de poço ou cacimba natural',
      'Limpar area ao redor',
      'Colocar oferendas na borda',
      'Despejar água doce enquanto reza',
      'Pedir equilíbrio entre caça e água',
    ],
    history: 'Logun-Edé representa a união de Oxóssi e Oxum, o duplo caminho',
  },
  {
    id: 'logunede-arco-agua',
    orixaId: 'logunede',
    name: 'Arco na Água',
    category: 'object',
    description: 'Arco e flechas oferecidos em contexto aquático',
    significance: 'Representa a harmonia entre os dois lados de Logun-Edé',
    properDay: 'Quinta-feira ou sábado',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Preparar arco decorado com fitas azuis e verdes',
      'Colocar flechas com pennas coloridas',
      'Mergulhar ponta do arco em água doce',
      'Oferecer junto com mel e flores',
      'Pedir equilíbrio e harmonia',
    ],
  },

  // Ewa Offering Guides
  {
    id: 'ewa-perfume',
    orixaId: 'ewa',
    name: 'Perfume de Ewa',
    category: 'object',
    description: 'Perfumes finos como oferenda de beleza e charme',
    significance: 'Os perfumes representam a beleza e a sedução natural de Ewa',
    properDay: 'Sexta-feira',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Escolher perfumes de qualidade',
      'Colocar em frasco decorado',
      'Oferecer no altar junto com espelho',
      'Usar perfume antes de rezar',
      'Pedir charme e beleza interior e exterior',
    ],
    history: 'Ewa é a deusa da beleza, do charme e da abundância, filha de Oxum',
  },
  {
    id: 'ewa-frutas',
    orixaId: 'ewa',
    name: 'Frutas Amarelas',
    category: 'food',
    description: 'Frutas douradas como oferenda de prosperidade',
    significance: 'As frutas representam a abundância e a doçura da vida',
    properDay: 'Sexta-feira',
    properTime: 'Manhã',
    preparationSteps: [
      'Escolher frutas amarelas e douradas',
      'Lavar com água de chuva',
      'Colocar em prato amarelo',
      'Adicionar mel e açúcar',
      'Oferecer pedindo prosperidade',
    ],
  },

  // Oxumaré Offering Guides
  {
    id: 'oxumare-arco-iris',
    orixaId: 'oxumare',
    name: 'Arco-íris de Oxumaré',
    category: 'ritual',
    description: 'Ritual para invocar o arco-íris como sinal de renovação',
    significance: 'O arco-íris representa os ciclos da vida e a promessa de renovação',
    properDay: 'Domingo',
    properTime: 'Quando aparecer arco-íris ou após chuva',
    preparationSteps: [
      'Preparar vasilha com água da chuva',
      'Colocar espelho para refletir luz',
      'Adicionar flores de todas as cores',
      'Pedir renovação e fim de ciclos difíceis',
      'Salpicar água no ar imitando arco-íris',
    ],
    history: 'Oxumaré é a cobrinha do arco-íris que une cielo e terra, marcando ciclos',
  },
  {
    id: 'oxumare-cores',
    orixaId: 'oxumare',
    name: 'Cores dos Ciclos',
    category: 'object',
    description: 'Fitas e tecidos de cores variadas para representar ciclos',
    significance: 'As cores representam os diferentes momentos dos ciclos da vida',
    properDay: 'Domingo',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Usar fitas nas cores do arco-íris',
      'Amarrar em formato de cobra',
      'Colocar sobre pano roxo e verde',
      'Oferecer junto com fumo de ervas',
      'Pedir paciência para atravessar ciclos',
    ],
  },

  // Obaluaiê Offering Guides
  {
    id: 'obaluaiê-peste',
    orixaId: 'obaluaiê',
    name: 'Proteção Contra Peste',
    category: 'ritual',
    description: 'Ritual de proteção contra doenças e pragas',
    significance: 'Representa o poder de Obaluaiê de transformar doença em saúde',
    properDay: 'Segunda-feira',
    properTime: 'Qualquer hora',
    forbiddenElements: ['Sal', 'Pimenta', 'Alcool forte'],
    preparationSteps: [
      'Preparar herbal de folhas secas',
      'Fazer chá concentrado de ervas',
      'Banhar área ou pessoa a proteger',
      'Enterrar restos perto do altar',
      'Pedir proteção contra doenças',
    ],
    history: 'Obaluaiê é o senhor das doenças e da cura, transforma pragas em saúde',
  },
  {
    id: 'obaluaiê-osso',
    orixaId: 'obaluaiê',
    name: 'Osso Sagrado',
    category: 'object',
    description: 'Osso como símbolo da conexão com a morte e a cura',
    significance: 'O osso representa a eternidade e a transformação',
    properDay: 'Segunda-feira',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Usar osso de animal consagrado',
      'Limpar e bendizer com água ritual',
      'Guardar em vasilha coberta',
      'Colocar junto ao altar em pano escuro',
      'Rezar pedindo proteção contra morte prematura',
    ],
  },

  // Oxalufaxã Offering Guides
  {
    id: 'oxalufaxa-velho',
    orixaId: 'oxalufaxa',
    name: 'Ancestralidade de Oxalufaxã',
    category: 'ritual',
    description: 'Ritual para honrar ancestrais e pedir sabedoria dos velhos',
    significance: 'Representa a conexão com a sabedoria dos ancestrais',
    properDay: 'Domingo',
    properTime: 'Noite',
    preparationSteps: [
      'Montar altar simples com objetos antigos',
      'Colocar foto de ancestrais se disponível',
      'Oferecer fumo e água',
      'Recitar oração de respeito aos velhos',
      'Pedir sabedoria para decisões importantes',
    ],
    history: 'Oxalufaxã é a versão anciã de Oxalá, guardião da sabedoria ancestral',
  },
  {
    id: 'oxalufaxa-palha',
    orixaId: 'oxalufaxa',
    name: 'Palha Sagrada',
    category: 'object',
    description: 'Palha trançada como símbolo de humildade',
    significance: 'A palha representa a simplicidade e a humildade perante os antigos',
    properDay: 'Domingo',
    properTime: 'Qualquer hora',
    preparationSteps: [
      'Usar palha de dendê ou buriti',
      'Trençar em formato de corrente',
      'Colocar junto ao altar de Oxalá',
      'Adicionar contas brancas',
      'Pedir paz e sabedoria',
    ],
  },

  // Oxalá Offering Guides
  {
    id: 'oxala-branco',
    orixaId: 'oxala',
    name: 'O Branco de Oxalá',
    category: 'ritual',
    description: 'Tudo branco como símbolo de paz e criação',
    significance: 'O branco representa a paz, a criação e a pureza de Oxalá',
    properDay: 'Sexta-feira',
    properTime: 'Manhã',
    forbiddenElements: ['Vermelho', 'Preto', 'Couro', 'Ferro'],
    preparationSteps: [
      'Vestir roupas brancas limpas',
      'Preparar altar com pano branco',
      'Colocar contas brancas e ebós',
      'Oferecer inhame branco e água',
      'Recitar oração de paz e criação',
    ],
    history: 'Oxalá é o pai supremo, criador de tudo, senhor da paz e da criação',
  },
  {
    id: 'oxala-inhame',
    orixaId: 'oxala',
    name: 'Inhame Branco',
    category: 'food',
    description: 'Inhame branco cozido como oferenda principal',
    significance: 'O inhame representa a nutrição e a sustentação da vida',
    properDay: 'Sexta-feira',
    properTime: 'Manhã',
    forbiddenElements: ['Sal', 'Pimenta', 'Vermelho'],
    preparationSteps: [
      'Cozinhar inhame branco sem sal',
      'Amassar formando pasta',
      'Colocar em prato branco',
      'Adicionar azeite de dendê apenas branco',
      'Oferecer no altar com oração de criação',
    ],
  },

  // Iansa Offering Guides
  {
    id: 'iansa-vento',
    orixaId: 'iansa',
    name: 'Vento de Iansã',
    category: 'ritual',
    description: 'Ritual para invocar o poder dos ventos e tempestades',
    significance: 'O vento representa a transformação e o poder destrutivo e renovador',
    properDay: 'Quarta-feira',
    properTime: 'Quando houver tempestade ou vento forte',
    preparationSteps: [
      'Sair para local aberto durante vento forte',
      'Segurar vassoura de palha',
      'Girar invocando Iansã',
      'Recitar oração de transformação',
      'Pedir força para superar mudanças',
    ],
    history: 'Iansã é a senhora dos ventos e tempestades, guerreira dos raios',
  },
  {
    id: 'iansa-cabeca',
    orixaId: 'iansa',
    name: 'Corte de Cabeca',
    category: 'object',
    description: 'Objeto representando o poder de Iansã sobre destinos',
    significance: 'A cabeça representa a tomada de decisões e o poder de transformar',
    properDay: 'Quarta-feira',
    properTime: 'Meia-noite',
    forbiddenElements: ['Água', 'Flores', 'Doces'],
    preparationSteps: [
      'Usar representation de cabeça feita de barro',
      'Decorar com tecidos vermelhos e pretos',
      'Colocar olhos de espelho',
      'Colocar no altar com facas ao redor',
      'Pedir coragem para decisões difíceis',
    ],
  },
];

export function getGuides(): OfferingGuide[] {
  return OFFERING_GUIDES;
}

export function getGuidesByOrixa(orixaId: string): OfferingGuide[] {
  return OFFERING_GUIDES.filter((guide) => guide.orixaId === orixaId);
}

export function getGuidesByCategory(category: OfferingGuide['category']): OfferingGuide[] {
  return OFFERING_GUIDES.filter((guide) => guide.category === category);
}

export function getGuideById(id: string): OfferingGuide | undefined {
  return OFFERING_GUIDES.find((guide) => guide.id === id);
}

export function getAllOrixaIds(): string[] {
  const ids = new Set(OFFERING_GUIDES.map((g) => g.orixaId));
  return Array.from(ids).sort();
}