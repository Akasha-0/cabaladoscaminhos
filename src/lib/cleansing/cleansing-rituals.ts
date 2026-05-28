// Cleansing rituals - skipped linting and formatting

export type CleansingRitualType =
  | 'smudging'
  | 'bath'
  | 'salt'
  | 'water'
  | 'fire'
  | 'sound'
  | 'crystal'
  | 'moon'
  | 'solar'
  | 'breath'
  | 'intention';

export interface CleansingRitual {
  id: string;
  name: string;
  type: CleansingRitualType;
  description: string;
  steps: string[];
  duration?: string;
  materials?: string[];
  precautions?: string[];
}

const rituals: CleansingRitual[] = [
  {
    id: 'smudging-sage',
    name: 'Ritual de Defumação com Salvia',
    type: 'smudging',
    description: 'Purificação energética utilizando salvia branca para limpar ambientes e campos áuricos.',
    steps: [
      'Acenda a ponta do feixe de salvia e permita que a chama se extinga naturalmente.',
      'Segure o feixe pela haste, trabalhando com a fumaça que emana.',
      'Comece pelo canto leste do espaço, movendo-se no sentido horário.',
      'Leve a fumaça a todos os cantos, pedindo que energias densas sejam liberadas.',
      'Ao finalizar, agradeça e despeje as cinzas emterra.',
    ],
    duration: '15-20 minutos',
    materials: ['Feixe de salvia branca', 'Recipiente cortido para cinzas', 'Terra ou vaso de planta'],
    precautions: ['Mantenha ventilação adequada', 'Não inalhe a fumaça diretamente', 'Afaste crianças e animais'],
  },
  {
    id: 'smudging-rosemary',
    name: 'Defumação de Alecrim',
    type: 'smudging',
    description: 'Uso de alecrim fresco ou seco para limpeza de objetos e proteção pessoal.',
    steps: [
      'Segure o alecrim pela haste com a ponta para baixo.',
      'Acenda a ponta e permita que a fumaça circule.',
      'Para objetos, passe a fumaça por cima deles três vezes em espiral.',
      'Para proteção pessoal, passe a fumaça do corpo parts de baixo para cima.',
      'Descarte as cinzas em terra ou enterre-as.',
    ],
    duration: '10-15 minutos',
    materials: ['Alecrim fresco ou seco', 'Prato ou concha cortir', 'Terra para descarte'],
  },
  {
    id: 'salt-bath',
    name: 'Banho de Sal Groso',
    type: 'salt',
    description: 'Ritual de limpeza energética utilizando sal groso para remover influências negativas.',
    steps: [
      'Em uma banheira com água morna, adicione uma xícara de sal grosso.',
      'Misture a água com as mãos no sentido anti-horário para dissipar energias.',
      'Entre na banheira e visualize o sal absorvendo toda energia densa.',
      'Permaneça submerso por 15-20 minutos, respirando profundamente.',
      'Ao sair, deixe a água escorrer toda antes de sair da banheira.',
    ],
    duration: '20-30 minutos',
    materials: ['Sal groso', 'Banheira ou chuveiro', 'Água morna'],
    precautions: ['Não use em feridas abertas', 'Hidrata a pele após o ritual', 'Não durma imediatamente depois'],
  },
  {
    id: 'salt-circle',
    name: 'Círculo de Proteção com Sal',
    type: 'salt',
    description: 'Criação de um círculo de sal para proteção de ambientes e pessoas.',
    steps: [
      'Com sal groso, desenhe um círculo ao redor do espaço desejado.',
      'Comece pelo leste e prossiga no sentido horário.',
      'Recite uma oração de proteção enquanto traça o círculo.',
      'Mantenha o círculo intacto durante o tempo necessário.',
      'Ao finalizar, reúna o sal e descarte em via pública corrente.',
    ],
    duration: '5-10 minutos',
    materials: ['Sal groso', 'Recipiente para o sal', 'Vela opcional para cada ponto cardinal'],
  },
  {
    id: 'floral-bath',
    name: 'Banho Floral de Purificação',
    type: 'bath',
    description: 'Ritual com pétalas e flores para elevação vibracional e limpeza suave.',
    steps: [
      'Colete pétalas de flores frescas com intenção de amor.',
      'Ferva água e despeje sobre as pétalas, cobrindo-as completamente.',
      'Cubra e deixe descansar até esfriar.',
      'Coe e adicione ao água do banho ou use para ablução direta.',
      'Enquanto se banha, visualize a água morphando em luz dourada.',
    ],
    duration: '30-40 minutos',
    materials: ['Pétalas frescas', 'Água fervente', 'Pote para infusão', 'Flores sugereis: pétalas, lavanda, alecrim'],
  },
  {
    id: 'holy-water-sprinkling',
    name: 'Ablução com Água Sagrada',
    type: 'water',
    description: 'Utilização de água abençoada para purificação de espaços e objetos.',
    steps: [
      'Mergulhe um ramo de alfavaca ou hissopo na água sagrada.',
      'Borrife o ambiente começando pelo leste, movimento horário.',
      'Para cada cômodo, recite uma oração de proteção.',
      'Ao final, borrife os quatro cantos da casa.',
      'Mantenha um vaso da água restante em um lugar centrale.',
    ],
    duration: '10-15 minutos',
    materials: ['Água abençoada', 'Alfavaca ou hissopo', 'Pequeno vaso decorativo'],
  },
  {
    id: 'candle-fire-cleansing',
    name: 'Purificação pela Chama',
    type: 'fire',
    description: 'Utilização do poder da chama para transmutar energias densas.',
    steps: [
      'Acenda uma vela branca ou dourada em um castiçal.',
      'Segure o objeto ou passe a chama pelo espaço a ser limpo.',
      'Visualize a chama consumindo toda energia negativa.',
      'Permita que a vela queime até o fim em segurança.',
      'As cinzas podem ser descartadas em terra para finalização.',
    ],
    duration: '15-30 minutos',
    materials: ['Vela branca ou dourada', 'Castiçal', 'Pinça para segurar objetos'],
    precautions: ['Nunca deixe velas desacompanhadas', 'Mantenha远离 materiais inflamáveis', 'Tenha água por perto'],
  },
  {
    id: 'bell-cleansing',
    name: 'Limpeza com Sino',
    type: 'sound',
    description: 'Uso de sinos ou instrumentos sonoros para dissipar energias densas.',
    steps: [
      'Segure o sino firmemente pela alça.',
      'Bata suavemente e deixe o som ressoar até diminuir naturalmente.',
      'Caminhe pelo espaço em espiral do centro para fora.',
      'Em cada punto cardinal, toque o sino três vezes.',
      'Permita que o som preencha completamente cada ambiente.',
    ],
    duration: '10-15 minutos',
    materials: ['Sino ritual', 'Tingsha opcional'],
  },
  {
    id: 'tibetan-bowl-cleansing',
    name: 'Terapia com Tíbele de Tigre',
    type: 'sound',
    description: 'Utilização da vibração harmonic a de uma tigela tibetana para balanceamento energético.',
    steps: [
      'Coloque a tigela sobre a palma da mão ou sobre uma almofada.',
      'Mergulhe o baquette na borda externa e pressione suavemente.',
      'Gire a baquette ao redor da borda com pressão constante.',
      'Permita que a vibração se desenvolva e preencha o espaço.',
      'Pare gradualmente, deixando o som extinguir naturalmente.',
    ],
    duration: '15-25 minutos',
    materials: ['Tigela tibetana', 'Baquette incluída', 'Almofada para apoio'],
  },
  {
    id: 'crystal-grid-cleansing',
    name: '.grid de Cristais Purificadores',
    type: 'crystal',
    description: 'Criação de um grid energético com cristais para limpeza amplificada de espaços.',
    steps: [
      'Escolha cristais apropriados: quartzo transparente, ametista, turmalina negra.',
      'Limpe e recarregue os cristais antes de montá-los.',
      'Posicione um cristal central e seis ao redor em hexaigono.',
      'Conecte-os com sua intenção, visualizando um fluxo de luz.',
      'Deixe o grid ativo por 24 a 72 horas.',
    ],
    duration: '20-30 minutos para montar, 24-72 horas ativo',
    materials: ['Quartzo transparente', 'Ametista', 'Turmalina negra', 'Base para grid'],
  },
  {
    id: 'moon-bath',
    name: 'Banho de Luar',
    type: 'moon',
    description: 'Ritual de limpeza sotto a luz da lua cheia para amplificação da purificação.',
    steps: [
      'Escolha uma noite de lua cheia para realizar o ritual.',
      'Prepare agua em um recipiente que possa ficar ao relento.',
      'Adicione ao água elementos: sal, pétalas, cristais pequenos.',
      'Coloque o recipiente onde possa receber a luz lunar.',
      'Sob a lua, realice sua ablução e receba a energia purificadora.',
    ],
    duration: '30-45 minutos',
    materials: ['Recipiente não metálico', 'Sal grosso', 'Pétalas', 'Cristais pequenos'],
    precautions: ['Verifique a previsão do tempo', 'Proteja contra animais', 'Retire antes do amanhecer'],
  },
  {
    id: 'sun-cleansing',
    name: 'Carregamento Solar',
    type: 'solar',
    description: 'Utilização da energia solar para recarga e purificação de objetos e cristais.',
    steps: [
      'Escolha um momento entre o nascer e o meio-dia solar.',
      'Limpe os objetos antes de expô-los ao sol.',
      'Coloque os cristais ou objetos sobre um tecido natural.',
      'Permita que absorvam a luz solar por 2-4 horas.',
      'Retire com gratidão e use ou almacene normalmente.',
    ],
    duration: '2-4 horas',
    materials: ['Tecido natural', 'Cristais ou objetos', 'Horario adecuado'],
    precautions: ['Não exponha diretamente muito tempo', 'Some cristais podem perder cor', 'hidrate os cristais após'],
  },
  {
    id: 'breath-purification',
    name: 'Pranayama Purificador',
    type: 'breath',
    description: 'Técnica de respiração yogica para limpeza do campo energético pessoal.',
    steps: [
      'Sente-se em uma posição confortável com a coluna ereta.',
      'Pratique Nadi Shodhana por 5 minutos para equilibrar os canais.',
      'Respire profundamente四次 quatre vezes holding entre.',
      'Visualize a energia vital circulando e limpando bloqueios.',
      'Conclua com Kapalabhati por 2 minutos para energização final.',
    ],
    duration: '15-20 minutos',
    materials: ['Espaço tranquilo', 'Assento confortável', 'Nenhum objeto necessário'],
  },
  {
    id: 'intention-cleansing',
    name: 'Ritual de Intenção de Limpeza',
    type: 'intention',
    description: 'Prática de declaração de intenções para criar uma barreira protetora perpétua.',
    steps: [
      'Encontre um momento de silencio e introspecção.',
      'Respire profundamente e centre sua atenção.',
      'Declare em voz alta: "Eu escolho liberar tudo o que não serve mais ao meu bem supremo."',
      'Visualize uma luz dourada envolvendo seu campo energético.',
      'Agradeça à universo por支持 em sua jornada de purificação.',
    ],
    duration: '5-10 minutos',
    materials: ['Nenhum objeto necessário', 'Um diário para registrar insights'],
  },
];

/**
 * Returns all available cleansing rituals
 */
export function getRituals(): CleansingRitual[] {
  return rituals;
}
