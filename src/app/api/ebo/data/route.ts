// src/app/api/ebo/data/route.ts
// Ebo API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type EboType =
  | 'caminho'
  | 'prosperidade'
  | 'defesa'
  | 'protecao'
  | 'atracao'
  | 'fartura'
  | 'transmutacao'
  | 'alinhamento'
  | 'limpeza'
  | 'alivio'
  | 'movimento'
  | 'justica'
  | 'evolucao'
  | 'renovacao'
  | 'purificacao'
  | 'revelacao'
  | 'conexao Ancestral';

export type ElementType = 'agua' | 'terra' | 'fogo' | 'ar' | 'orixa';
export type IntensityLevel = 'suave' | 'medio' | 'forte';
export type MoonPhase = 'nova' | 'crescente' | 'cheia' | 'minguante' | 'qualquer';

export interface EboItem {
  name: string;
  quantity: string;
  optional?: boolean;
}

export interface Ebo {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  type: EboType;
  description: string;
  descriptionPt: string;
  descriptionEn: string;
  elements: ElementType[];
  orixas: string[];
  items: EboItem[];
  instructions: string[];
  precautions: string[];
  affirmations: string[];
  affirmationsPt: string[];
  duration: string;
  intensity: IntensityLevel;
  bestDays: string[];
  moonPhase: MoonPhase;
  keywords: string[];
}

export interface EboQuery {
  type?: EboType;
  orixa?: string;
  element?: ElementType;
  intensity?: IntensityLevel;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// EBO DATA
// ============================================================

const eboData: Ebo[] = [
  {
    id: 'ebo-caminho',
    name: 'Ebó de Caminho',
    namePt: 'Ebó de Caminho - Abertura de Caminhos',
    nameEn: 'Ebo of the Path - Opening of Ways',
    type: 'caminho',
    description: 'Ebó para abrir caminhos bloqueados, remover obstáculos e facilitar a progressão na vida.',
    descriptionPt: 'Ebó para abrir caminhos bloqueados, remover obstáculos e facilitar a progressão na vida. Utiliza despachos em encruzilhadas, moedas e pipoca para crear novas vías.',
    descriptionEn: 'Ebo to open blocked paths, remove obstacles and facilitate life progression. Uses offerings at crossroads, coins and popcorn to create new ways.',
    elements: ['terra', 'fogo'],
    orixas: ['Exu', 'Omolu', 'Ogum'],
    items: [
      { name: 'Pipoca', quantity: '1 porção' },
      { name: 'Moedas', quantity: '9 unidades' },
      { name: 'Vela vermelha', quantity: '1' },
      { name: 'Pimenta', quantity: 'a gosto' },
      { name: 'Aguardente', quantity: '1 gole' },
    ],
    instructions: [
      'Escolha uma encruzilhada limpa',
      'Disperse a pipoca em formato circular',
      'Coloque as moedas nos quatro cantos',
      'Acenda a vela vermelha',
      'Despeje a aguardente no chão',
      'Faça sua petición a Exu e Ogum',
      'Não olhe para trás ao sair',
    ],
    precautions: [
      'Realizar apenas em dias deogun',
      'Não fazer em períodos de luto',
      'Manter intención positiva durante o ritual',
    ],
    affirmations: [
      'I open the paths that are destined for me',
      'Obstacles dissolve as I move forward',
      'New ways reveal themselves to me',
    ],
    affirmationsPt: [
      'Eu abro os caminhos que me são destinados',
      'Os obstáculos se dissolvem enquanto sigo em frente',
      'Novas vías se revelam para mim',
    ],
    duration: '30 minutos',
    intensity: 'medio',
    bestDays: ['terca', 'sabado'],
    moonPhase: 'nova',
    keywords: ['caminho', 'abertura', 'bloqueio', 'progresso', 'Encruzilhada'],
  },
  {
    id: 'ebo-prosperidade',
    name: 'Ebó de Prosperidade',
    namePt: 'Ebó de Prosperidade - Atração de Fartura',
    nameEn: 'Ebo of Prosperity - Attraction of Abundance',
    type: 'prosperidade',
    description: 'Ebó para atrair prosperidade, abundancia material e oportunidades financeiras.',
    descriptionPt: 'Ebó para attractir prosperidade, abundancia material e oportunidades financeiras. Utiliza doces, frutas e comidas leves depositadas em praças.',
    descriptionEn: 'Ebo to attract prosperity, material abundance and financial opportunities. Uses sweets, fruits and light foods deposited in squares.',
    elements: ['ar', 'terra'],
    orixas: ['Ibeji', 'Ogum', 'Oxum'],
    items: [
      { name: 'Doce de leite', quantity: '1 porção' },
      { name: 'Frutas variadas', quantity: '7 tipos' },
      { name: 'Milho cozido', quantity: '1 espiga' },
      { name: 'Vela dourada', quantity: '3' },
      { name: 'Açúcar mascavo', quantity: '1 colher' },
    ],
    instructions: [
      'Escolha um local limpo e arborizado',
      'Disponha as frutas em forma de pirâmide',
      'Coloque o doce de leite no centro',
      'Acenda as velas douradas',
      'Polvilhe o açúcar ao redor',
      'Agradeça pela fartura que virá',
      'Não consuma nenhum item do ebó',
    ],
    precautions: [
      'Fazer preferencialmente em lua crescente',
      'Não fazer durante guerras de ketu',
      'Manter coleta de oferendas anterior limpia',
    ],
    affirmations: [
      'Abundance flows to me from all directions',
      'I am worthy of prosperity and success',
      'The universe conspires in my favor',
    ],
    affirmationsPt: [
      'A abundância flui para mim de todas as direções',
      'Eu sou digno de prosperidade e sucesso',
      'O universo conspira a meu favor',
    ],
    duration: '45 minutos',
    intensity: 'suave',
    bestDays: ['quinta', 'sexta'],
    moonPhase: 'crescente',
    keywords: ['prosperidade', 'fartura', 'abundancia', 'dinheiro', 'oportunidades'],
  },
  {
    id: 'ebo-defesa',
    name: 'Ebó de Defesa',
    namePt: 'Ebó de Defesa - Proteção Espiritual',
    nameEn: 'Ebo of Defense - Spiritual Protection',
    type: 'defesa',
    description: 'Ebó de proteção para crear um escudo espiritual contra energias negativas e ataques.',
    descriptionPt: 'Ebó de proteção para crear um escudo espiritual contra energias negativas e ataques. Utiliza inhames, paliteiros de Ogum e limpieza com folhas.',
    descriptionEn: 'Ebo of protection to create a spiritual shield against negative energies and attacks. Uses yams, Ogum stakes and cleansing with leaves.',
    elements: ['fogo', 'terra'],
    orixas: ['Ogum', 'Obaluaê', 'Omolu'],
    items: [
      { name: 'Inhame', quantity: '1 peça' },
      { name: 'Paliteiros de Ogum', quantity: '7 unidades' },
      { name: 'Folhas de eucalipto', quantity: '1 maço' },
      { name: 'Vela preta', quantity: '1' },
      { name: 'Sal grosso', quantity: '3 colheres' },
    ],
    instructions: [
      'Cozinhe o inhame sem sal',
      'Enterre os paliteiros em forma de círculo',
      'Acenda a vela preta ao centro',
      'Passe as folhas pelo corpo antes de dormir',
      'Polvilhe sal nos quatro cantos da casa',
      'Faça o sinal da cruz enquanto visualiza a proteção',
      'Repita por 7 días consecutivos',
    ],
    precautions: [
      'Não realizar em dias deoxum',
      'Evitar durante períodos de enfermedad terminal',
      'Manter fotaleza durante o ritual',
    ],
    affirmations: [
      'I am surrounded by divine protection',
      'No negative energy can penetrate my shield',
      'Ogum guards my paths always',
    ],
    affirmationsPt: [
      'Eu sou cercado por proteção divina',
      'Nenhuma energia negativa pode penetrar meu escudo',
      'Ogum guarda meus caminhos sempre',
    ],
    duration: '1 hora',
    intensity: 'forte',
    bestDays: ['terca', 'quarta'],
    moonPhase: 'cheia',
    keywords: ['protecao', 'defesa', 'escudo', 'seguranca', 'bloqueio'],
  },
  {
    id: 'ebo-protecao',
    name: 'Ebó de Proteção',
    namePt: 'Ebó de Proteção - Escudo Espiritual',
    nameEn: 'Ebo of Protection - Spiritual Shield',
    type: 'protecao',
    description: 'Ebó para fortalecer a proteção espiritual e manter afastadas influencias nocivas.',
    descriptionPt: 'Ebó para fortalecer a proteção espiritual e manter afastadas influencias nocivas. Contempla elementos de defesa, mas com enfoque preventivo.',
    descriptionEn: 'Ebo to strengthen spiritual protection and keep harmful influences away. Includes defense elements but with a preventive focus.',
    elements: ['fogo', 'agua'],
    orixas: ['Oxalá', 'Iemanjá', 'Omolu'],
    items: [
      { name: 'Vela branca', quantity: '7' },
      { name: 'Algodão', quantity: '1 maço' },
      { name: 'Canjica branca', quantity: '1 prato' },
      { name: 'Água de cheiro', quantity: '1 garrafa' },
      { name: 'Alabastrine', quantity: '1 pedra' },
    ],
    instructions: [
      'Acenda as 7 velas brancas em círculo',
      'No centro, coloque a canjica branca',
      'Ao redor, disponha o algodão',
      'Borrife água de cheiro pelo ambiente',
      'Segure a pedra de alabastro no centro',
      'Repita 3 vezes o pai Nosso',
      'Desligue as velas da menor para a maior',
    ],
    precautions: [
      'Realizar às terças-feiras para Oxalá',
      'Não falar durante o ritual',
      'Manter voluntária pura',
    ],
    affirmations: [
      'I am wrapped in white light',
      'My aura remains pure and protected',
      'The divine surrounds and guards me',
    ],
    affirmationsPt: [
      'Eu sou envolto em luz branca',
      'Minha aura permanece pura e protegida',
      'O divino me cerca e guarda',
    ],
    duration: '45 minutos',
    intensity: 'medio',
    bestDays: ['terca', 'sabado'],
    moonPhase: 'qualquer',
    keywords: ['protecao', 'luz blanca', 'pureza', 'aura', 'seguranca'],
  },
  {
    id: 'ebo-atracao',
    name: 'Ebó de Atração',
    namePt: 'Ebó de Atração/Ouro - Riqueza e Doçura',
    nameEn: 'Ebo of Attraction - Wealth and Sweetness',
    type: 'atracao',
    description: 'Ebó para atrair riqueza, pessoas Positiveis e energias de dulçura.',
    descriptionPt: 'Ebó para attractir riqueza, pessoas positivas e energias de dulçura. Trabalha com a energia da attraction através de elementos doces.',
    descriptionEn: 'Ebo to attract wealth, positive people and energies of sweetness. Works with the energy of attraction through sweet elements.',
    elements: ['fogo', 'terra'],
    orixas: ['Oxum', 'Iemanjá', 'Oxóssi'],
    items: [
      { name: 'Mel', quantity: '1 frasco' },
      { name: 'Vela dourada', quantity: '5' },
      { name: 'Açúcar', quantity: '1 paquete' },
      { name: 'Canela em pau', quantity: '3' },
      { name: 'Flores amarelas', quantity: '9' },
    ],
    instructions: [
      'Em recipiente redondo, coloque o mel',
      'Adicione o açúcar e a canela',
      'Acenda as velas douradas ao redor',
      'Disponha as flores na água com mel',
      'Visualize riqueza e sucesso',
      'Agradeça por 5 minutos',
      'Guarde o remanescente em local sagrado',
    ],
    precautions: [
      'Fazer em lua crescente',
      'Não fazer em dias desoma',
      'Manter intención de bem',
    ],
    affirmations: [
      'I attract abundance and opportunities',
      'Sweetness flows naturally to me',
      'All that I need comes to me with ease',
    ],
    affirmationsPt: [
      'Eu attracto abundância e oportunidades',
      'A dulçura flui naturalmente para mim',
      'Tudo o que preciso vem a mim com facilidade',
    ],
    duration: '40 minutos',
    intensity: 'suave',
    bestDays: ['sabado', 'sexta'],
    moonPhase: 'crescente',
    keywords: ['atracao', 'riqueza', 'doce', 'oportunidades', 'positividade'],
  },
  {
    id: 'ebo-fartura',
    name: 'Ebó de Fartura',
    namePt: 'Ebó de Fartura - Abundância Material',
    nameEn: 'Ebo of Plenty - Material Abundance',
    type: 'fartura',
    description: 'Ebó para solicitar abundância material, fartura na mesa e necesidades básicas.',
    descriptionPt: 'Ebó para solicitar abundância material, fartura na mesa e necesidades básicas atendidas. Trabalha com a energia de Oxum e Iansã.',
    descriptionEn: 'Ebo to request material abundance, plenty on the table and basic needs met. Works with the energy of Oxum and Iansã.',
    elements: ['terra', 'fogo'],
    orixas: ['Oxum', 'Iansã', 'Xangô'],
    items: [
      { name: 'Farinha de mandioca', quantity: '1 kg' },
      { name: 'Fubá', quantity: '500g' },
      { name: 'Velas vermelha e amarela', quantity: '1 de cada' },
      { name: 'Cachaça', quantity: '1 garrafa' },
      { name: 'Fumo em pó', quantity: 'a gosto' },
    ],
    instructions: [
      'Misture farinha e fubá em recipiente grande',
      'Acenda as velas lado a lado',
      'Despeje a cachaça sobre a mistura',
      'Adicione o fumo suavemente',
      'Misture com as mãos respeitosamente',
      'Leve a conjunto à natureza',
      'Agradeça fartamente',
    ],
    precautions: [
      'Fazer preferencialmente em dias de Xangô',
      'Não dar a animales ou pássaros',
      'Manter gratidão genuína',
    ],
    affirmations: [
      'My table is always abundant',
      'I have more than enough for all my needs',
      'Abundance is my natural state',
    ],
    affirmationsPt: [
      'Minha mesa é sempre farta',
      'Eu tenho mais do que suficiente para todas as minhas necesidades',
      'Abundância é meu estado natural',
    ],
    duration: '1 hora',
    intensity: 'forte',
    bestDays: ['quarta', 'sabado'],
    moonPhase: 'cheia',
    keywords: ['fartura', 'abundancia', 'comida', 'mesa', 'prosperidade'],
  },
  {
    id: 'ebo-transmutacao',
    name: 'Ebó de Transmutação',
    namePt: 'Ebó de Transmutação - Transformação de Energias',
    nameEn: 'Ebo of Transmutation - Energy Transformation',
    type: 'transmutacao',
    description: 'Ebó para transformar energias negativas em positivas e limpés purification.',
    descriptionPt: 'Ebó para transformar energias negativas em positivas e realizar limpeza profunda de auras e espaços.',
    descriptionEn: 'Ebo to transform negative energies into positive and perform deep cleansing of auras and spaces.',
    elements: ['fogo', 'ar'],
    orixas: ['Xangô', 'Iansã', 'Omolu'],
    items: [
      { name: 'Carvão vegetal', quantity: '3 pedaços' },
      { name: 'Ervas de limpeza', quantity: 'variado' },
      { name: 'Vela laranja', quantity: '1' },
      { name: 'Pimenta calabresa', quantity: 'a gosto' },
      { name: 'Sal negro', quantity: '3 colheres' },
    ],
    instructions: [
      'Acenda o carvão em recipiente resistente',
      'Adicione as ervas de limpeza',
      'Quando começar a fumaça, adicione a pimenta',
      'Passe a fumaça pelo corpo todo',
      'Polvilhe sal negro nos cantos',
      'Visualize todas as energias ruins virando cinza',
      'Lave o rosto com água corrente ao final',
    ],
    precautions: [
      'Realizar em area ventilada',
      'Não inalar diretamente a fumaça',
      'Evitar durante embarazo',
    ],
    affirmations: [
      'I transform negativity into growth',
      'All that no longer serves me dissolves',
      'I am reborn in light',
    ],
    affirmationsPt: [
      'Eu transformo negatividade em crecimiento',
      'Tudo o que não me serve mais se dissolve',
      'Eu renasco na luz',
    ],
    duration: '50 minutos',
    intensity: 'forte',
    bestDays: ['quarta', 'sabado'],
    moonPhase: 'nova',
    keywords: ['transmutacao', 'transformacao', 'limpeza', 'purificacao', 'conversao'],
  },
  {
    id: 'ebo-alinhamento',
    name: 'Ebó de Alinhamento (Bori)',
    namePt: 'Ebó de Alinhamento (Bori) - Cura da Cabeça',
    nameEn: 'Ebo of Alignment (Bori) - Head Healing',
    type: 'alinhamento',
    description: 'Ritual de alimentação da cabeça (Ori) para alinhar mente, cuerpo y espíritu.',
    descriptionPt: 'Ritual de alimentação da cabeça (Ori) para alinhar mente, corpo e espírito. Este é um dos ritais mais sagrados do candomblé.',
    descriptionEn: 'Ritual of feeding the head (Ori) to align mind, body and spirit. This is one of the most sacred rituals of candomblé.',
    elements: ['terra', 'agua'],
    orixas: ['Oxalá', 'Iemanjá'],
    items: [
      { name: 'Canjica branca', quantity: '1 prato grande' },
      { name: 'Algodão em rama', quantity: '1 maço' },
      { name: 'Velas brancas', quantity: '7' },
      { name: 'Água de cheiro', quantity: '1 garrafa' },
      { name: 'Farinha de milho', quantity: '1 porção' },
    ],
    instructions: [
      'Sente-se em lugar limpo e tranquilo',
      'Coloque a canjica em prato limpo',
      'Acenda as velas ao redor',
      'Unte a cabeza com água de cheiro',
      'Aplique farinha na fronte',
      'Coloque algodão nos ouvidos e olhos',
      'Fale ao seu Ori com amor e respeito',
      'Nutra seu Ori por 15 minutos em silêncio',
    ],
    precautions: [
      'Realizar preferencialmente às terças-feiras',
      'Estar em estado de pureza',
      'Não interrumpir o silêncio',
    ],
    affirmations: [
      'My Ori is elevated and honored',
      'I nurture my mind, body and spirit',
      'I am connected to my divine purpose',
    ],
    affirmationsPt: [
      'Meu Ori está elevado e honrado',
      'Eu nutro minha mente, corpo e espírito',
      'Eu estou conectado ao meu propósito divino',
    ],
    duration: '1 hora',
    intensity: 'medio',
    bestDays: ['terca', 'sexta'],
    moonPhase: 'qualquer',
    keywords: ['bori', 'Ori', 'cabeça', 'alinhamento', 'nutricao', 'alimentacao'],
  },
  {
    id: 'ebo-limpeza',
    name: 'Ebó de Limpeza Astral',
    namePt: 'Ebó de Limpeza Astral - Purificação da Aura',
    nameEn: 'Ebo of Astral Cleansing - Aura Purification',
    type: 'limpeza',
    description: 'Ebó para limpiar la aura, remover energías attachadas y restaurar el equilibrio espiritual.',
    descriptionPt: 'Ebó para limpar a aura, remover energías attached e restaurar o equilíbrio espiritual después de momentos difíciles.',
    descriptionEn: 'Ebo to cleanse the aura, remove attached energies and restore spiritual balance after difficult moments.',
    elements: ['agua', 'ar'],
    orixas: ['Iemanjá', 'Omolu', 'Oxum'],
    items: [
      { name: 'Folhas de laranja', quantity: '7 folhas' },
      { name: 'Sal grosso', quantity: '1 xícara' },
      { name: 'Flores brancas', quantity: '9' },
      { name: 'Vela azul', quantity: '1' },
      { name: 'Água do mar', quantity: '1 copo' },
    ],
    instructions: [
      'Ferva as folhas de laranja em 1L de água',
      'Coe e deixe esfriar',
      'Acrescente o sal e as flores',
      'Banhe-se com esta água por completo',
      'Acenda a vela azul olhando para o mar ou janila',
      'Visualize aguas escuras saindo de seu corpo',
      'Séquese sem помочь toalha, deixe secar ao ar',
    ],
    precautions: [
      'Banho debe ser em área privada',
      'Não usar toalha após o banho ritual',
      'Descartar a água em local limpo, preferencialmente rua',
    ],
    affirmations: [
      'My aura is pure and bright',
      'All negative attachments are released',
      'I am cleansed and renewed',
    ],
    affirmationsPt: [
      'Minha aura é pura e brilhante',
      'Todos os attachamentos negativos são libertados',
      'Eu sou limpo e renovado',
    ],
    duration: '45 minutos',
    intensity: 'medio',
    bestDays: ['segunda', 'sabado'],
    moonPhase: 'nova',
    keywords: ['limpeza', 'aura', 'purificacao', 'banho', 'renovacao'],
  },
  {
    id: 'ebo-alivio',
    name: 'Ebó de Alívio',
    namePt: 'Ebó de Alívio/Saúde - Cura e Paz',
    nameEn: 'Ebo of Relief - Healing and Peace',
    type: 'alivio',
    description: 'Ebó para buscar alleggio de doenças, dolor ou sofrimento spiritual.',
    descriptionPt: 'Ebó para buscar alleggio de enfermedades, dor ou sofrimento espiritual. Trabalha com a energia de Obaluaê e Omolu.',
    descriptionEn: 'Ebo to seek relief from illness, pain or spiritual suffering. Works with the energy of Obaluaê and Omolu.',
    elements: ['terra', 'agua'],
    orixas: ['Obaluaê', 'Omolu', 'Oxalá'],
    items: [
      { name: 'Pepino', quantity: '1 peça' },
      { name: 'Pipoca', quantity: '1 porção' },
      { name: 'Vela verde', quantity: '3' },
      { name: 'Folhas desaúde', quantity: '1 maço' },
      { name: 'Açúcar mascavo', quantity: '3 colheres' },
    ],
    instructions: [
      'Corte o pepino em rodelas finas',
      'Coloque a pipoca em recipiente limpo',
      'Acenda as velas verdes',
      'Aplique as folhas no local da dor',
      'Coma um pouco da pipoca com açúcar',
      'Entregue o restante à terra',
      'Pida por alleggio genuíno',
    ],
    precautions: [
      'Não reemplazar tratamento médico',
      'Buscar siempre orientação profissional',
      'Fazer em estado de oración sincera',
    ],
    affirmations: [
      'I am relieved of all pain and suffering',
      'My body is restored to perfect health',
      'Peace flows through every cell of my being',
    ],
    affirmationsPt: [
      'Eu sou aliviado de toda dor e sofrimento',
      'Meu corpo é restaurado à saúde perfeita',
      'A paz flui através de cada célula do meu ser',
    ],
    duration: '30 minutos',
    intensity: 'suave',
    bestDays: ['quinta', 'sexta'],
    moonPhase: 'qualquer',
    keywords: ['alivio', 'cura', 'saude', 'dor', 'paciencia'],
  },
  {
    id: 'ebo-movimento',
    name: 'Ebó de Movimento',
    namePt: 'Ebó de Movimento - Desbloqueio de Energias',
    nameEn: 'Ebo of Movement - Energy Unblocking',
    type: 'movimento',
    description: 'Ebó para trazer movimento a situações estagnadas e crear impulso para novos comienzos.',
    descriptionPt: 'Ebó para trazer movimento a situações estagnadas e criar impulso para novos comienzos, especialmente em áreas paralisadas da vida.',
    descriptionEn: 'Ebo to bring movement to stagnant situations and create momentum for new beginnings, especially in paralyzed areas of life.',
    elements: ['fogo', 'ar'],
    orixas: ['Exu', 'Ogum', 'Iansã'],
    items: [
      { name: 'Pimenta calabresa', quantity: 'a gosto' },
      { name: 'Moedas', quantity: '11 unidades' },
      { name: 'Vela vermelha', quantity: '3' },
      { name: 'Fumo', quantity: 'pouco' },
      { name: 'Rapadura', quantity: '1 tablete' },
    ],
    instructions: [
      'Derrube as moedas no chão e recolha-as',
      'Misture a pimenta com o fumo',
      'Acenda as velas vermelhas',
      'Quebre a rapadura em pedaços pequeños',
      'Jogue tudo na rua em cruz',
      'Say: "Exu, faça o caminho abrir"',
      'Siga em frente sem olhar para trás',
    ],
    precautions: [
      'Fazer em cruzamentos movimentados',
      'Não realizar em dias de Iemanjá',
      'Fazer em horário de до полудня',
    ],
    affirmations: [
      'I am in constant motion toward my destiny',
      'All that was stuck now flows freely',
      'New opportunities appear before me',
    ],
    affirmationsPt: [
      'Eu estou em constante movimento hacia meu destino',
      'Tudo o que estava preso agora flui livremente',
      'Novas oportunidades aparecem diante de mim',
    ],
    duration: '25 minutos',
    intensity: 'medio',
    bestDays: ['terca', 'quarta'],
    moonPhase: 'crescente',
    keywords: ['movimento', 'dinamica', 'estagnacao', 'impulso', 'comienzos'],
  },
  {
    id: 'ebo-justica',
    name: 'Ebó de Justiça',
    namePt: 'Ebó de Justiça - Equilíbrio Kármico',
    nameEn: 'Ebo of Justice - Karmic Balance',
    type: 'justica',
    description: 'Ebó para buscar justiça divine, equilíbrio kármico e resolución de conflictos.',
    descriptionPt: 'Ebó para buscar justiça divina, equilíbrio kármico e resolución de conflitos atraves da intervención de Xangô.',
    descriptionEn: 'Ebo to seek divine justice, karmic balance and conflict resolution through the intervention of Xangô.',
    elements: ['fogo', 'terra'],
    orixas: ['Xangô', 'Oxum'],
    items: [
      { name: 'Amalá', quantity: '1 porção' },
      { name: 'Velas roja e preta', quantity: '1 de cada' },
      { name: 'Pião', quantity: '1' },
      { name: 'Azeite de dendê', quantity: 'a gosto' },
      { name: 'Fumo', quantity: 'pouco' },
    ],
    instructions: [
      'Prepare e sirva o amalá com respeito',
      'Acenda as velas vermelha e preta lado a lado',
      'Gire o pião sobre a mesa',
      'Unte o pião com azeite de dendê',
      'Coloque o fumo entre as velas',
      'Peça a Xangô justiça e equilíbrio',
      'Dé jemplo del resultado y no mires',
    ],
    precautions: [
      'Solicitar apenas justiça, no daño',
      'No usur para perjudicar a outros',
      'Ter vontade de perdoar ao final',
    ],
    affirmations: [
      'Righteousness prevails in my life',
      'Justice is served through divine will',
      'I am balanced in truth and fairness',
    ],
    affirmationsPt: [
      'A retidão prevalece em minha vida',
      'A justiça é servida através da vontade divina',
      'Eu sou equilibrado em verdade e justeza',
    ],
    duration: '40 minutos',
    intensity: 'forte',
    bestDays: ['quarta', 'sabado'],
    moonPhase: 'cheia',
    keywords: ['justica', 'equilibrio', 'karma', 'conflito', 'verdad'],
  },
  {
    id: 'ebo-evolucao',
    name: 'Ebó de Evolução',
    namePt: 'Ebó de Evolução - Crescimento Espiritual',
    nameEn: 'Ebo of Evolution - Spiritual Growth',
    type: 'evolucao',
    description: 'Ebó para acelerAR el crecimiento espiritual, evolución del alma y elevación de conciencia.',
    descriptionPt: 'Ebó para acelerar o crescimento espiritual, evolução da alma e elevação de consciência através da práctica devota.',
    descriptionEn: 'Ebo to accelerate spiritual growth, soul evolution and consciousness elevation through devoted practice.',
    elements: ['fogo', 'ar'],
    orixas: ['Oxalá', 'Orunla'],
    items: [
      { name: 'Inhame assado', quantity: '1' },
      { name: 'Vela branca', quantity: '9' },
      { name: 'Algodão', quantity: '1 maço' },
      { name: 'Azeite doce', quantity: '1 colher' },
      { name: 'Canjica branca', quantity: '1 prato' },
    ],
    instructions: [
      'Assie o inhame no духов',
      'Acenda as 9 velas em pirâmide',
      'Coloque o inhame no centro',
      'Unte a fronte com azeite doce',
      'Siéntese em silêncio por 20 minutos',
      'Visualize seu crescimento contínuo',
      'Coma o inhame consagrado',
    ],
    precautions: [
      'Buscar acompañamiento debabalawo si возможно',
      'No fazer se não estiver preparado',
      'Maintainer práctica медитации afterwards',
    ],
    affirmations: [
      'I am constantly evolving and growing',
      'My soul expands with each lesson',
      'I am becoming my highest self',
    ],
    affirmationsPt: [
      'Eu estou em constante evolução e crescimento',
      'Minha alma se expande com cada lição',
      'Eu estou me tornando meu eu mais elevado',
    ],
    duration: '1 hora',
    intensity: 'medio',
    bestDays: ['terca', 'sexta'],
    moonPhase: 'crescente',
    keywords: ['evolucao', 'crecimento', 'alma', 'conciencia', 'elevacao'],
  },
  {
    id: 'ebo-renovacao',
    name: 'Ebó de Renovação',
    namePt: 'Ebó de Renovação - Nuevo Ciclo',
    nameEn: 'Ebo of Renewal - New Cycle',
    type: 'renovacao',
    description: 'Ebó para marcar新しい ciclo de vida, lasciarsi il passato yAbrir espaço para novo começo.',
    descriptionPt: 'Ebó para marcar um novo ciclo de vida, deixar o passado e abrir espaço para novo começo em todas as áreas.',
    descriptionEn: 'Ebo to mark a new life cycle, leave the past and open space for new beginnings in all areas.',
    elements: ['agua', 'fogo'],
    orixas: ['Iemanjá', 'Oxum'],
    items: [
      { name: 'Água de cheiro', quantity: '1 garrafa' },
      { name: 'Flores brancas e azuis', quantity: '9 de cada' },
      { name: 'Vela branca e azul', quantity: '1 de cada' },
      { name: 'Sal grosso', quantity: '3 colheres' },
      { name: 'Concha de mar', quantity: '1' },
    ],
    instructions: [
      'Mergulhe as flores na água de cheiro',
      'Acenda as velas lado a lado',
      'Polvilhe sal na água',
      'Banhe-se com a mezcla preparada',
      'Coloque a concha na cabeceira',
      'Escreva no papel o que deseja deixar para trás',
      'Queime o papel na vela azul',
    ],
    precautions: [
      'Este ebó pode ser feito em qualquer fase da lua',
      'Para mejores resultados, faire em lua nova',
      'No guardar receipts of past cycles',
    ],
    affirmations: [
      'I release all that no longer serves me',
      'A new cycle begins in my life now',
      'I welcome all the blessings of a fresh start',
    ],
    affirmationsPt: [
      'Eu libero tudo o que não me serve mais',
      'Um novo ciclo começa em minha vida agora',
      'Eu welcome todas as bênçãos de um novo começo',
    ],
    duration: '1 hora',
    intensity: 'suave',
    bestDays: ['segunda', 'sexta'],
    moonPhase: 'nova',
    keywords: ['renovacao', 'novo ciclo', ' renovacao', 'comienzo', 'liberacao'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllEbos(): Ebo[] {
  return eboData;
}

function getEboById(id: string): Ebo | undefined {
  return eboData.find(e => e.id === id);
}

function getEboByType(type: EboType): Ebo[] {
  return eboData.filter(e => e.type === type);
}

function getEbosByOrixa(orixa: string): Ebo[] {
  const orixaLower = orixa.toLowerCase();
  return eboData.filter(e =>
    e.orixas.some(o => o.toLowerCase().includes(orixaLower))
  );
}

function getEbosByElement(element: ElementType): Ebo[] {
  return eboData.filter(e => e.elements.includes(element));
}

function getEbosByIntensity(intensity: IntensityLevel): Ebo[] {
  return eboData.filter(e => e.intensity === intensity);
}

function filterEbos(query: EboQuery): Ebo[] {
  let results = [...eboData];

  if (query.type) {
    results = results.filter(e => e.type === query.type);
  }

  if (query.orixa) {
    const orixaLower = query.orixa.toLowerCase();
    results = results.filter(e =>
      e.orixas.some(o => o.toLowerCase().includes(orixaLower))
    );
  }

  if (query.element) {
    results = results.filter(e => e.elements.includes(query.element!));
  }

  if (query.intensity) {
    results = results.filter(e => e.intensity === query.intensity);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(e =>
      e.name.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower) ||
      e.keywords.some(k => k.toLowerCase().includes(searchLower))
    );
  }

  return results;
}

function getEboTypes(): { type: EboType; name: string; count: number }[] {
  const types: EboType[] = [
    'caminho', 'prosperidade', 'defesa', 'protecao', 'atracao', 'fartura',
    'transmutacao', 'alinhamento', 'limpeza', 'alivio', 'movimento',
    'justica', 'evolucao', 'renovacao'
  ];
  return types.map(type => ({
    type,
    name: getEboTypeName(type),
    count: eboData.filter(e => e.type === type).length
  }));
}

function getEboTypeName(type: EboType): string {
  const names: Record<EboType, string> = {
    'caminho': 'Caminho',
    'prosperidade': 'Prosperidade',
    'defesa': 'Defesa',
    'protecao': 'Proteção',
    'atracao': 'Atração',
    'fartura': 'Fartura',
    'transmutacao': 'Transmutação',
    'alinhamento': 'Alinhamento',
    'limpeza': 'Limpeza',
    'alivio': 'Alívio',
    'movimento': 'Movimento',
    'justica': 'Justiça',
    'evolucao': 'Evolução',
    'renovacao': 'Renovação',
    'purificacao': 'Purificação',
    'revelacao': 'Revelação',
    'conexao Ancestral': 'Conexão Ancestral',
  };
  return names[type] || type;
}

function getOrixas(): { orixa: string; eboCount: number }[] {
  const orixaMap = new Map<string, number>();
  eboData.forEach(e => {
    e.orixas.forEach(orixa => {
      orixaMap.set(orixa, (orixaMap.get(orixa) || 0) + 1);
    });
  });
  return Array.from(orixaMap.entries()).map(([orixa, count]) => ({
    orixa,
    eboCount: count
  })).sort((a, b) => b.eboCount - a.eboCount);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ebo/data
 * Retrieve ebo data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: EboQuery = {
      type: searchParams.get('type') as EboType | undefined,
      orixa: searchParams.get('orixa') || undefined,
      element: searchParams.get('element') as ElementType | undefined,
      intensity: searchParams.get('intensity') as IntensityLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const ebo = getEboById(id);
      if (!ebo) {
        return NextResponse.json(
          { error: 'Ebo not found', id },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: ebo });
    }

    // Check for types summary
    const showTypes = searchParams.get('types');
    if (showTypes === 'true') {
      return NextResponse.json({ data: getEboTypes() });
    }

    // Check for orixas summary
    const showOrixas = searchParams.get('orixas');
    if (showOrixas === 'true') {
      return NextResponse.json({ data: getOrixas() });
    }

    // Filter and paginate results
    const filtered = filterEbos(query);
    const page = query.page || 1;
    const limit = query.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filtered.slice(start, end);

    return NextResponse.json({
      data: paginatedResults,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to process ebo request' },
      { status: 500 }
    );
  }
}
