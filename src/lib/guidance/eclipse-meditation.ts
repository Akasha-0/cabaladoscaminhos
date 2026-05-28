/**
 * Eclipse Meditation Scripts
 * Solar and lunar eclipse meditation practices
 */

export type EclipseType = 'solar' | 'lunar';

export interface EclipseMeditation {
  name: string;
  type: EclipseType;
  element: string;
  mantra: string;
  visualization: string;
  breathPattern: string;
  duration: string;
  phases: MeditationPhase[];
  affirmation: string;
  focus: string[];
  guidance: string;
}

export interface MeditationPhase {
  name: string;
  duration: string;
  description: string;
  breath: string;
}

const solarMeditations: Record<string, EclipseMeditation> = {
  solar: {
    name: 'Eclipse Solar — Renascimento',
    type: 'solar',
    element: 'fogo',
    mantra: 'Om Surya Namaha',
    visualization:
      'Visualize o sol negro da lua覆盖面 o disco solar. Neste momento de escuridão aparente, você percebe que a verdadeira luz sempre existiu — radiante, eterna, além da forma. Sinta a energia yang da criação fluindo através do seu ser, ativando o centro de vontade no plexo solar. Permita que qualquer resistência se dissolva enquanto o novo emerge do vazio fértil.',
    breathPattern: 'Inalação expansiva pelo centro da testa (6s) → Suspensão (4s) → Exalação que irradia luz (8s)',
    duration: '20-30 minutos',
    phases: [
      {
        name: 'Preparação — Purificação',
        duration: '3-5 minutos',
        description: 'Sente-se em posição ereta, coluna alinhada. Imagine uma espiral de luz dourada ascendente, purificando seu campo energético. Solte tensões acumuladas em cada exalação.',
        breath: 'Respirações profundas e lentas (5s in, 5s out)',
      },
      {
        name: 'Intenção — O Ponto de Semente',
        duration: '5-7 minutos',
        description: 'Forme uma intenção clara para este ciclo. Visualize-a como uma semente de luz no centro do seu ser. O eclipse marca o momento de plantar — o que você escolhe criar quando a escuridão passar?',
        breath: 'Respirações conscientes com intenção (6s in, 6s out)',
      },
      {
        name: 'Mergulho — A Noite Interior',
        duration: '10-15 minutos',
        description: 'Permita-se estar no escuro. Observe pensamentos, emoções, sensações sem apego. Sinta a conexão com o núcleo invisível que sustenta toda manifestação. Permita que a transformação opere em profundidade.',
        breath: 'Respirações suaves e uniformes (4s in, 4s out, 2s pausa)',
      },
      {
        name: 'Integração — A Aurora',
        duration: '5-7 minutos',
        description: 'Visualize os primeiros raios de sol atravessando a lua. Sinta a energia do novo ciclo inundando seu ser. Carregue esta luz para seu cotidiano. Comprometa-se com a intenção formada.',
        breath: 'Respirações expansivas ascendentes (6s in, 8s out)',
      },
    ],
    affirmation: 'Eu sou a luz que persiste além de toda forma. Minha vontade se alinha com o propósito divino.',
    focus: [
      'Renovação de propósito',
      'Ativação da vontade pessoal',
      'Liberação do ego limitado',
      'Conexão com o princípio yang',
      'Plantio de intenções poderosos',
    ],
    guidance:
      'Eclipses solares são momentos de ação e novos começos. O véu entre mundos se afina, facilitando manifestaçōes e decisōes transformadoras. Trabalhe com a energia de Sagitário (expansão) e Gêmeos (adaptação), dependendo do signo do eclipse.',
  },

  solar_anular: {
    name: 'Eclipse Solar Anular — O Anel de Fogo',
    type: 'solar',
    element: 'fogo',
    mantra: 'Om Ravi Namaha',
    visualization:
      'Contemple o anel de fogo visível ao redor do disco escuro. Esta coroa de luz é o limiar entre o visível e o invisível. Sinta-se como o observador no centro do anel — o ponto vazio que contém toda possibilidade. A anularidade ensina que o centro está vazio e cheio simultaneamente.',
    breathPattern: 'Inalação em espiral (7s) → Suspensão (3s) → Exalação circular (7s)',
    duration: '25-35 minutos',
    phases: [
      {
        name: 'Centramento — O Ponto Vazio',
        duration: '5 minutos',
        description: 'Sente-se em silêncio absoluto. Permita que a mente se aquietem. Visualize-se como o ponto central de um anel — vazio no centro, completo em si mesmo. Recorde: o vazio é a porta de toda forma.',
        breath: 'Respirações profundas e silenciosas',
      },
      {
        name: 'Contemplação — O Anel de Fogo',
        duration: '10-15 minutos',
        description: 'Imagine o anel de fogo surroundando você. Cada ponto da coroa representa uma qualidade divina irradiando para o mundo. Sinta-se conectado a todas as formas de luz visível e invisível.',
        breath: 'Respirações rítmicas com visualização do anel',
      },
      {
        name: 'Expansão — O Vazio Produtivo',
        duration: '10-12 minutos',
        description: 'Permita que o vazio interior se expanda. O que não tem forma pode tomar qualquer forma. Medite sobre projetos e possibilidades — especialmente aqueles que parecem impossíveis. O anular abre portais para o que está além do comum.',
        breath: 'Respirações profundas com expansão consciente',
      },
      {
        name: 'Retorno — A Forma Renovada',
        duration: '5 minutos',
        description: 'Traga a consciência de volta ao corpo. Sinta os pés no chão. Carregue a experiência do vazio produtivo para seu dia a dia. Você é mais do que qualquer forma, mais do que qualquer papel.',
        breath: 'Respirações de integração',
      },
    ],
    affirmation: 'O vazio em mim é fértil. Dele, eu crio infinita possibilidade.',
    focus: [
      'Contemplação do vazio produtivo',
      'Abertura a possibilidades extraordinárias',
      'Dissolução de limitações autoimpostas',
      'Conexão com a luz invisível',
      'Meditação sobre a natureza da forma',
    ],
    guidance:
      'Eclipses anulares são raros e poderosos — o "anel de fogo" é um portal para境界 superiores. Trabalhe com a energia de limite e excesso: o que você está fazendo demais? O que você precisa limitar para que outra coisa floresça?',
  },

  solar_parcial: {
    name: 'Eclipse Solar Parcial — A Sombra Revelada',
    type: 'solar',
    element: 'fogo',
    mantra: 'Om Bhanu Namaha',
    visualization:
      'Observe a sombra lunar覆盖apenas parte do sol. Esta luz parcial revela o que normalmente permanece invisível — suas áreas de resistência, seus medos inconscientes de brilhar completamente. A sombra não é ausência de luz; é luz oculta.',
    breathPattern: 'Inalação clara e luminosa (5s) → Pausa (3s) → Exalação que dissipa sombras (6s)',
    duration: '15-20 minutos',
    phases: [
      {
        name: 'Identificação — Onde Está a Sombra?',
        duration: '5 minutos',
        description: 'Observe sua vida: onde você não está shining plenamente? Quais áreas estão em sombra? Não julgue — apenas identifique. A luz parcial revela sem expor harshly.',
        breath: 'Respirações observadoras',
      },
      {
        name: 'Integração — Luz e Sombra Unificadas',
        duration: '8-10 minutos',
        description: 'Visualize a parte iluminada e a parte sombreada do sol como duas metades de você mesmo. Elas não são opostas — são complementares. A sombra protege a luz de se dissipar.',
        breath: 'Respirações de aceitação',
      },
      {
        name: 'Compromisso — Brilhar Progressivamente',
        duration: '5 minutos',
        description: 'Estabeleça uma intenção: na próxima semana, em que área você permitirá que mais luz brilhe? Não precisa ser um salto — pode ser um passo gradual para fora da sombra.',
        breath: 'Respirações com intenção',
      },
    ],
    affirmation: 'Eu aceito todas as partes de mim. Minha luz e minha sombra trabalham juntas.',
    focus: [
      'Autoaceitação integral',
      'Identificação de padrões em sombra',
      'Integração de opostos internos',
      'Compromisso com brilho gradual',
      'Honra da parcialidade como etapa',
    ],
    guidance:
      'Eclipses parciais são convites para reconhecer onde você está se limitando. A energia é menos intensa que a totalidade, permitindo trabalho mais sutil. Perfeito para iniciar processos de autoconhecimento.',
  },
};

const lunarMeditations: Record<string, EclipseMeditation> = {
  lunar: {
    name: 'Eclipse Lunar — Revelação das Profundezas',
    type: 'lunar',
    element: 'água',
    mantra: 'Om Chandra Namaha',
    visualization:
      'Visualize a lua cheia imersa na sombra da terra. A luz prateada não desaparece — ela está refletida, turning avermelhada pela nossa própria atmosfera. Permita que suas emoções subam à superfície. O eclipse lunar revela o que está enterrado no inconsciente. Sinta a energia yin da recepção, da água emocional fluindo e purificando.',
    breathPattern: 'Inalação receptiva pelo coração (6s) → Suspensão (4s) → Exalação liberadora (8s)',
    duration: '20-30 minutos',
    phases: [
      {
        name: 'Abertura — A Lua no Eclipse',
        duration: '5 minutos',
        description: 'Relaxe profundamente. Imagine a lua cheia começando a entrar na sombra terrestre. Permita que camadas de proteção emocional comecem a se dissolver. O que está pronto para ser visto virá à tona.',
        breath: 'Respirações suaves e soltando',
      },
      {
        name: 'Escuta — A Voz do Inconsciente',
        duration: '8-10 minutos',
        description: 'Mergulhe na escuridão emocional. Não tente mudar nada — apenas observe. Memórias, medos, anseios ocultos podem emergir. Permita que o inconsciente fale. Esta é uma noite de oráculo interior.',
        breath: 'Respirações profundas e receptivas',
      },
      {
        name: 'Liberação — O Sangue Lunar',
        duration: '5-7 minutos',
        description: 'A lua eclipsada frequentemente adquiere uma cor avermelhada — o "sangue lunar". Visualize esta luz vermelha carregando consigo qualquer peso emocional que você está pronto para soltar. Permita que ela flua para fora de você.',
        breath: 'Respirações de descarga emocional',
      },
      {
        name: 'Honra — O Ciclo Completo',
        duration: '5 minutos',
        description: 'Agradeça a lua por revelar. Honre o ciclo de luz e escuridão. Reconheça que a lua cheia markings o ápice de um ciclo — e todo ápice contém a semente do próximo.',
        breath: 'Respirações de gratidão',
      },
    ],
    affirmation: 'Eu honro minhas emoções como portais de sabedoria. O que está oculto me serve.',
    focus: [
      'Revealação emocional',
      'Liberação de padrões inconscientes',
      'Conexão com o princípio yin',
      'Purificação emocional',
      'Honra do ciclo lunar',
    ],
    guidance:
      'Eclipses lunares são momentos de processedimento emocional profundo. A lua rege suas emoções, sonhos e o inconsciente. O véu entre o visível e o invisível se afina, facilitando a integração de conteúdos psicológicos.',
  },

  lunar_total: {
    name: 'Eclipse Lunar Total — A Grande Revelação',
    type: 'lunar',
    element: 'água',
    mantra: 'Om Mahachandre Namaha',
    visualization:
      'A lua total se torna vermelha sangue — a cor da vida, da terra, da menstruação ancestral. Sinta-se conectado a todas as luas血红的 através dos tempos. Mulhers e homens antigos olharam para esta mesma lua em busca de orientação. Você carrega esta sabedoria no sangue.',
    breathPattern: 'Inalação ancestral (7s) → Suspensão profunda (5s) → Exalação que liberta (9s)',
    duration: '25-40 minutos',
    phases: [
      {
        name: 'Ancestrais — Conexão com o Sangue da Terra',
        duration: '7 minutos',
        description: 'Visualize raízes descendo do seu corpo para o centro da terra. Conecte-se com a sabedoria de todas as luas passadas. O que seus ancestrais sabiam sobre o ciclos? Deixe esta informação fluir.',
        breath: 'Respirações fundas e enraizadas',
      },
      {
        name: 'Transformação — O Sangue Lunar',
        duration: '12-15 minutos',
        description: 'Permita que a luz vermelha sangre envolve todo o seu campo emocional. Esta é uma lua de cura profunda — para traumas, para feridas antigas, para padrões familiares. O eclipse total permite que a transformação opere em níveis celulares.',
        breath: 'Respirações de cura e restauração',
      },
      {
        name: 'Renovação — O Ritual de Sangue',
        duration: '8-10 minutos',
        description: 'Crie um ritual pessoal de renovação. Pode ser simbólico: escrever o que está soltando e depois queimar, ou simplesmente declarar em voz alta o que você está escolhendo para o próximo ciclo.',
        breath: 'Respirações rituais',
      },
      {
        name: 'Encerramento — A Luz Retorna',
        duration: '5 minutos',
        description: 'Observe a lua começando a emergir da sombra. A luz prateada retorna. Você não é mais a mesma pessoa que entrou na escuridão. Carregue sua transformação para o mundo.',
        breath: 'Respirações de integração e propósito',
      },
    ],
    affirmation: 'Eu carrego a sabedoria de todas as luas. Meu sangue contém a memória da terra.',
    focus: [
      'Conexão ancestral',
      'Cura de traumas emocionais',
      'Transformação celular profunda',
      'Rituais de renovação',
      'Integração da sabedoria feminina',
    ],
    guidance:
      'Eclipses lunares totais são os mais poderosos para trabalho de processedimento emocional. A energia pode ser intensa, então respeite seus limites. É um momento excelente para terapia, constelação familiar, ou trabalho shamanic.',
  },

  lunar_penumbra: {
    name: 'Eclipse Penumbral — A Sombra Suave',
    type: 'lunar',
    element: 'água',
    mantra: 'Om Shani Namaha',
    visualization:
      'A lua penumbral está quase cheia — apenas uma sombra sutil escurece sua luz. Esta é uma oportunidade para refinar, ajustar, preparar. Sem a intensidade do eclipse total, você pode trabalhar com nuance. Observe onde a sombra toca sua vida: áreas de confusion, hesitação, ou energia stagnante.',
    breathPattern: 'Inalação refinada (5s) → Pausa (4s) → Exalação clarificadora (6s)',
    duration: '15-25 minutos',
    phases: [
      {
        name: 'Observação — A Sombra Mínima',
        duration: '5 minutos',
        description: 'Sem o véu da dramaticidade, observe sua vida com maior clareza. Quais pequenas sombras estão affecting sua luz? O que está quase funcionando, mas não totalmente? Observe sem julgar.',
        breath: 'Respirações de observação tranquila',
      },
      {
        name: 'Refinamento — Ajustes Sutis',
        duration: '8-10 minutos',
        description: 'Identifique 1-3 ajustes sutis que podem fazer grande diferença. Não precisa de transformação radical — apenas refinamento. A energia penumbral favorece ajustes precisos.',
        breath: 'Respirações de intenção refinada',
      },
      {
        name: 'Compromisso — Práticas Sutis',
        duration: '5 minutos',
        description: 'Estabeleça práticas sutis para as próximas semanas: meditação de 5 minutos, um hábito pequeno, uma conversa pendente. O penumbral pede consistência, não dramaticidade.',
        breath: 'Respirações de comprometimento',
      },
    ],
    affirmation: 'Eu honro os ajustes sutis. A jornada se faz com pequenos passos consistentes.',
    focus: [
      'Observação de nuances',
      'Ajustes sutis de energia',
      'Preparação para próximos ciclos',
      'Refinamento de práticas',
      'Desenvolvimento de consistência',
    ],
    guidance:
      'Eclipses penumbrais são os mais sutis — trabalho interno ao invés de transformação dramática. Perfeito para: desenvolver práticas espirituais, refinar intentions, preparar para eclipses mais poderosos no futuro.',
  },
};

const allMeditations: Record<EclipseType, EclipseMeditation> = {
  solar: solarMeditations.solar,
  lunar: lunarMeditations.lunar,
};

/**
 * Get eclipse meditation by type
 * @param eclipseType - 'solar' or 'lunar'
 * @returns EclipseMeditation for the given type
 */
export function getEclipseMeditation(eclipseType: EclipseType): EclipseMeditation {
  const meditation = allMeditations[eclipseType];
  if (!meditation) {
    throw new Error(`Unknown eclipse type: "${eclipseType}". Valid values: solar, lunar`);
  }
  return meditation;
}

/**
 * Get all available eclipse meditation types
 */
export function getEclipseMeditationTypes(): EclipseType[] {
  return ['solar', 'lunar'];
}

/**
 * Get meditation by type and visibility
 * @param eclipseType - 'solar' or 'lunar'
 * @param visibility - Optional visibility type (total, parcial, anular, penumbral)
 */
export function getEclipseMeditationByVisibility(
  eclipseType: EclipseType,
  visibility?: 'total' | 'parcial' | 'anular' | 'penumbral'
): EclipseMeditation {
  if (eclipseType === 'solar' && visibility === 'anular') {
    return solarMeditations.solar_anular;
  }
  if (eclipseType === 'solar' && visibility === 'parcial') {
    return solarMeditations.solar_parcial;
  }
  if (eclipseType === 'lunar' && visibility === 'total') {
    return lunarMeditations.lunar_total;
  }
  if (eclipseType === 'lunar' && visibility === 'penumbral') {
    return lunarMeditations.lunar_penumbra;
  }
  return getEclipseMeditation(eclipseType);
}
