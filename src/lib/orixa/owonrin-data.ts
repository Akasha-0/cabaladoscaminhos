/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Owonrin Data Module
 * Spiritual data for Owonrin - the personalization of Ori, head consciousness and destiny
 */

export interface OwonrinData {
  id: string;
  name: string;
  nameYoruba: string;
  namePortuguese: string;
  definition: string;
  archetype: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
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
  herbs: HerbData[];
  healingPractices: string[];
  sacredTrees: string[];
  ritualPractices: RitualData[];
}

export interface HerbData {
  name: string;
  namePortuguese: string;
  uses: string[];
  preparation: string;
  contraindications: string[];
  element: string;
}

export interface RitualData {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

const OWONRIN_DATA: OwonrinData = {
  id: 'owonrin',
  name: 'Owonrin',
  nameYoruba: 'Owonrin',
  namePortuguese: 'A Personalização do Ori - A Cabeça Consciente e o Destino',
  definition: 'Owonrin representa a personalização do Ori - a cabeça espiritual que abriga a consciência, o destino e a identidade individual. É através do Ori que cada pessoa recebe sua porção de axé e conhece seu caminho único na vida.',
  archetype: 'O Guardião da Identidade Espiritual',
  element: 'Terra e Água',
  colors: ['Branco', 'Dourado', 'Azul claro'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [3, 7, 14, 21],
  greeting: 'Ewbá! Ori Mi!',
  qualities: [
    'Autoconhecimento',
    'Identidade espiritual',
    'Conexão com o destino',
    'Sabedoria interior',
    'Intuição',
    'Clareza mental',
    'Determinação',
    'Foco',
    'Capacidade de decisão',
    'Responsabilidade pelo próprio caminho'
  ],
  challenges: [
    'Orgulho e ego',
    'Teimosia excessiva',
    'Resistência à orientação',
    'Isolamento espiritual',
    'Autosabotagem',
    'Negação do destino',
    'Egocentrismo'
  ],
  rulingPlanet: 'Sol',
  sacredAnimals: ['Bode branco', 'Pomba', 'Galo branco', 'Cobra'],
  plants: ['Manjericão branco', 'Arruda', 'Alecrim', 'Cólquo', 'Espada de São Jorge'],
  offerings: [
    'Pombo branco',
    'Galinha branca',
    'Inhame branco',
    'Farinha de mandioca',
    'Água de obi',
    'Mel',
    'Óleo de dendê',
    'Vinho branco',
    'Doce de côco',
    'Ebó especial'
  ],
  chants: [
    'Ewbá, Ori mi!',
    'Owonrin dá-me sabedoria!',
    'Minha cabeça está erguida!',
    'Ori wa, ashe wa!',
    'Mo gbo gbogbo oju mi!',
    'Ori ni okan mi!'
  ],
  symbols: [
    'Ori (cabeça simbolica)',
    'Espelho ritual',
    'Prancha de Ifá',
    'Kolanuts (nozes de obi)',
    'Vaso sagrado',
    'Bandeja de Ori',
    'Pano branco'
  ],
  mythology: `Owonrin é a expressão personalizada do Ori na tradição Yorubá. Cada pessoa nasce com seu próprio Ori - uma cabeça espiritual que determina seu destino, sua personalidade e seu caminho de vida. Owonrin representa a consciência que habita na cabeça física, conectando o mundo espiritual ao mundo material.

Na tradição, diz-se que "Ori inu" (a cabeça interior) é mais importante que "Ori ode" (a cabeça exterior). Owonrin ensina que o verdadeiro trabalho espiritual começa com o conhecimento de si mesmo - entender qual é o seu Ori, qual é o seu destino e como alinhá-los com a vontade divina.

Owonrin é frequentemente invocado durante rituais de iniciação, consultas de Ifá e momentos de decisão importante. Quando uma pessoa não está em paz com seu Ori, pode experimentar confusão, desorientação e fracasso repetido em seus esforços.`,
  spiritualLesson: 'O verdadeiro poder está em conhecer a si mesmo. O Ori de cada pessoa é único e possui sua própria sabedoria. Quando alinhamos nossa vontade pessoal com a vontade do Ori interior, encontramos nosso caminho de vida e realizarmos nosso destino.',
  affirmation: 'Meu Ori está em paz. Minha cabeça está erguida. Eu conheço meu caminho e sigo com determinação. Meu destino se revela através da sabedoria interior.',
  meditation: 'Sinto minha cabeça como um vaso sagrado contendo minha essência divina. O axé do meu Ori ilumina minha mente, trazendo clareza e direcionamento. Meu destino se desdobra diante de mim como um caminho iluminado pelo Sol.',
  herbs: [
    {
      name: 'manjericaoBranco',
      namePortuguese: 'Manjericão Branco',
      uses: ['Purificação do Ori', 'Harmonização espiritual', 'Proteção da cabeça', 'Clareza mental'],
      preparation: 'Banhos de imersão, defumações, água ritual para ablução da cabeça',
      contraindications: ['Gestantes', 'Pessoas com sensibilidade cutânea'],
      element: 'Terra'
    },
    {
      name: 'arruda',
      namePortuguese: 'Arruda',
      uses: ['Proteção do Ori', 'Limpeza espiritual', 'Afastamento de energias densas', 'Abertura de caminhos mentais'],
      preparation: 'Banhos de arruda, defumações, colocado no travesseiro para sonhos proféticos',
      contraindications: ['Gestantes', 'Pessoas com pele sensível', 'Uso interno excessivo'],
      element: 'Terra'
    },
    {
      name: 'alecrim',
      namePortuguese: 'Alecrim',
      uses: ['Clareza mental', 'Memória', 'Proteção', 'Fortificação do Ori'],
      preparation: 'Banhos, infusões para ritual, defumações, água de alecrim para limpar a cabeça',
      contraindications: ['Pessoas com epilepsia', 'Gestantes em excesso'],
      element: 'Fogo'
    },
    {
      name: 'espadanaSaoJorge',
      namePortuguese: 'Espada de São Jorge',
      uses: ['Proteção da cabeça', 'Defesa espiritual', 'Corte de energias negativas'],
      preparation: 'Colocado próximo à entrada, banhos com água de aspersão, folhas na cabeça durante ritual',
      contraindications: ['Nenhuma conhecida para uso externo'],
      element: 'Terra'
    },
    {
      name: 'coloquo',
      namePortuguese: 'Cólquo ou Coloquíntida',
      uses: ['Sorte', 'Alinhamento do Ori', 'Proteção contra feitiçaria'],
      preparation: 'Amuletos, banhos rituais, oferecido ao orixá ou aos Ancestrais',
      contraindications: ['Uso interno é perigoso - apenas externo ritualístico'],
      element: 'Água'
    }
  ],
  healingPractices: [
    'Ablução ritual da cabeça com água de manjericão e alecrim',
    'Ritual de Kore - honrando o Ori celestial',
    'Cerimônia de "Ori-Inu" (cabeça interior) para conhecer seu Ori verdadeiro',
    'Oferendas de pombo branco para fortalecimento do Ori',
    'Defumações com alecrim para clareza mental',
    'Banho de开门 (abertura) com ervas sagradas',
    'Ritual de alinhamento com o Sol para energização do Ori',
    'Oração ao amanhecer olhando para o Sol nascente',
    'Colocar Espada de São Jorge na entrada para proteção do Ori'
  ],
  sacredTrees: ['Gameleira', 'Mangueira', 'Jaqueira', 'Coentro', 'Iju', 'Pau-brasil'],
  ritualPractices: [
    {
      type: 'Ritual de Alinhamento do Ori',
      description: 'Cerimônia para alinhar o Ori pessoal com o destino divino e encontrar harmonia interior',
      duration: '1 dia',
      offerings: ['Galinha branca', 'Inhame branco', 'Mel', 'Farinha de mandioca', 'Kolanuts (obi)'],
      steps: [
        'Preparar local sagrado com pano branco no chão',
        'Colocar espelho ritual no centro (representa o Ori)',
        'Acender velas brancas nas quatro direções',
        'Tomar banho de limpeza com arruda e manjericão',
        'Sentar diante do espelho em silêncio',
        'Recitar o nome do seu Ori verdadeiro',
        'Oferecer kolanuts (obi) ao centro do espelho',
        'Colocar inhame branco e mel como oferenda',
        'Pedir alinhamento entre vontade pessoal e destino',
        'Olhar para o reflexo e visualizar seu Ori em luz dourada',
        'Agradecer e fechar o ritual',
        'Deixar oferendas até o próximo amanhecer'
      ]
    },
    {
      type: 'Ritual do Ori-Inu',
      description: 'Cerimônia de conhecimer do Ori verdadeiro - qual orixá rege seu Ori',
      duration: '3 dias',
      offerings: ['Pombo branco', 'Galinha', 'Kolanuts', 'Vinho branco', 'Mel'],
      steps: [
        'Primeiro dia: jejum e banhos de purificação com arruda',
        'Consultar Ifá ou Babalawo para conhecer seu Ori-Inu',
        'Segundo dia: preparar oferendas específicas do orixá do seu Ori',
        'Terceiro dia: realizar o ritual de apresentação ao seu Ori-Inu',
        'Colocar toalha branca no chão',
        'No centro, colocar a comida favorita do orixá do Ori',
        'Oferecer kolanuts e mel',
        'Cantar cânticos do orixá do Ori',
        'Fazer pedidos específicos ao Ori-Inu',
        'Comer um pouco da oferenda como comunhão',
        'Enterrar os restos em lugar limpo',
        'Guardar os kolanuts como amuleto'
      ]
    },
    {
      type: 'Ritual de Purificação da Cabeça',
      description: 'Ritual para limpar o Ori de energias densas e restaurar a clareza mental',
      duration: '1 dia',
      offerings: ['Pomba branca', 'Alecrim', 'Manjericão', 'Água de coco'],
      steps: [
        'Preparar água ritual com alecrim e manjericão',
        'Colocar toalha branca no chão',
        'Acender velas brancas',
        'Segurar a pomba branca sobre a própria cabeça',
        'Passar a água ritual pela própria cabeça',
        'Recitar orações de purificação do Ori',
        'Solta a pomba (se for iniciada) ou oferece-a',
        'Descansar em silêncio por alguns minutos',
        'Meditar visualizando luz branca entrando pela cabeça',
        'Lavar o rosto com a água ritual',
        'Agradecer e fechar o ritual'
      ]
    },
    {
      type: 'Ritual do Sol Nascente',
      description: 'Prática matinal para energizar o Ori alinhando-se com o Sol',
      duration: 'Diário',
      offerings: ['Água fresca', 'Mel', 'Kolanuts (opcional)'],
      steps: [
        'Acordar antes do nascer do Sol',
        'Tomar um banho simples de água fria',
        'Sair para local aberto onde possa ver o Sol',
        'Ficar de pé, braços abertos, rosto voltado para o Sol',
        'Recitar oração ao Ori e ao Sol',
        'Beber um gole de água com mel',
        'Kolanuts se disponível - oferecer ao Sol',
        'Visualizar energia dourada entrando pela cabeça',
        'Agradecer pelo novo dia',
        'Fazer suas intenções para o dia'
      ]
    },
    {
      type: 'Ebó Especial do Ori',
      description: 'Oferenda especial para resolver problemas crônicos de Ori - fracasso, confusão, desorientação',
      duration: '7 dias',
      offerings: ['Galinha preta', 'Galinha branca', 'Inhame', 'Farinha', 'Kolanuts', 'Óleo de dendê', 'Ebó completo'],
      steps: [
        'Primeiro ao terceiro dia: jejum e banhos de limpeza',
        'Quarto dia: preparar o Ebó com todos os elementos',
        'Quinto dia: no local sagrado, montar o Ebó',
        'Colocar galinha preta e branca no centro',
        'Ao redor, colocar inhame, farinha e kolanuts',
        'Regar com óleo de dendê',
        'Defumar com alecrim e pau-brasil',
        'Cantar cânticos de Ori e dos orixás',
        'Sexto dia: deixar o Ebó em local apropriado',
        'Sétimo dia: enterrar o Ebó ao amanhecer',
        'Fazer ritual de fechamento e agradecimento'
      ]
    }
  ]
};

export function getData(): OwonrinData {
  return OWONRIN_DATA;
}

export function getDataById(id: string): OwonrinData | undefined {
  return id === 'owonrin' ? OWONRIN_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OWONRIN_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OWONRIN_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return OWONRIN_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return OWONRIN_DATA.sacredTrees;
}

export function getOwonrinByElement(element: string): OwonrinData | undefined {
  return OWONRIN_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OWONRIN_DATA : undefined;
}

export function getOwonrinByPlanet(planet: string): OwonrinData | undefined {
  return OWONRIN_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OWONRIN_DATA : undefined;
}

export default {
  getData,
  getDataById,
  getHerbs,
  getRituals,
  getHealingPractices,
  getSacredTrees,
  getOwonrinByElement,
  getOwonrinByPlanet,
};
