// Awakening stages — the nine chalices of consciousness

export type AwakeningStageId =
  | 'acordando'
  | 'reconhecendo'
  | 'esforcando'
  | 'renunciando'
  | 'servindo'
  | 'sintonizando'
  | 'purificando'
  | 'iluminando'
  | 'unificando';

export interface AwakeningStage {
  id: AwakeningStageId;
  name: string;
  portugueseName: string;
  description: string;
  chaldeanNumber: number;
  sephirah: string;
  hebrewLetter: string;
  pathWord: string;
  keywords: string[];
  challenges: string[];
  gifts: string[];
  shadowPitfall: string;
  practice: string;
  color: string;
  durationLabel: string;
}

const stages: AwakeningStage[] = [
  {
    id: 'acordando',
    name: 'Awakening',
    portugueseName: 'Acordando',
    description:
      'O momento em que a alma primeiro percebe que há mais do que o mundo físico. Despertar da consciência adormecida.',
    chaldeanNumber: 1,
    sephirah: 'Keter',
    hebrewLetter: 'א',
    pathWord: 'Aleph',
    keywords: ['despertar', 'semente', 'primeiro sopro', 'espanto sagrado'],
    challenges: [
      ' Dub on the "por que eu?"',
      ' Ressentimento com a realidade convencional',
      ' Necessidade de validar a experiência exteriormente',
    ],
    gifts: ['Curiosidade espiritual genuína', 'Capacidade de questionar', 'Abertura à trilha'],
    shadowPitfall: 'Confundir despertar com fuga — usar a espiritualidade para evitar a vida.',
    practice: 'Diário de sonhos e meditação silenciosa ao amanhecer.',
    color: '#E8C4A0',
    durationLabel: 'Dias a semanas',
  },
  {
    id: 'reconhecendo',
    name: 'Recognizing',
    portugueseName: 'Reconhecendo',
    description:
      'Reconhecer a Guides, mestres, e a presença constante de Synchronicities. O universo começa a responder.',
    chaldeanNumber: 2,
    sephirah: 'Chokhmah',
    hebrewLetter: 'ב',
    pathWord: 'Beth',
    keywords: ['ligação', 'sinais', 'guia', 'coincidência significativa'],
    challenges: [
      '  Excesso de ceticismo que bloqueia a percepção',
      '  Dependência de sinais externos para decisões',
      '  Dub on a autenticidade das sincronicidades',
    ],
    gifts: [
      ' Percepção aguçada de padrões',
      ' Confiança em guidance interior',
      '  Capacidade de profunda escuta espiritual',
    ],
    shadowPitfall: 'Superstição — atribuir todo evento a um "sinal" e perder a discriminação.',
    practice: 'Ritual de registro de sincronicidades e leitura de I Ching ouTarot ao amanhecer.',
    color: '#B8D4E8',
    durationLabel: 'Semanas a meses',
  },
  {
    id: 'esforcando',
    name: 'Discipline',
    portugueseName: 'Esforçando',
    description:
      'O caminho se afunila. Requer-se prática consistente, renúncia aos velhos hábitos e sacrifício deliberado.',
    chaldeanNumber: 3,
    sephirah: 'Binah',
    hebrewLetter: 'ג',
    pathWord: 'Gimel',
    keywords: ['disciplina', 'sacrifício', 'ritual', 'construção de caráter'],
    challenges: [
      '  Procrastinação e sabotage sutil',
      '  Escassez de tempo por obrigações mundanas',
      '  Impaciência com a lentidão do progresso',
    ],
    gifts: ['Força de vontade forjada', 'Estrutura espiritual pessoal', 'Resiliência interior'],
    shadowPitfall: 'Rigidez ascética — usar disciplina para fugir de conexões humanas legítimas.',
    practice: 'Ritual diário fixo: preces, respiração e abstinência de uma comforts habitual.',
    color: '#C8A8E8',
    durationLabel: 'Meses a anos',
  },
  {
    id: 'renunciando',
    name: 'Renouncing',
    portugueseName: 'Renunciando',
    description:
      'Libertação das crenças limitantes herdadas. Soltar o ego, as identidades falsas e os apegos à opinião alheia.',
    chaldeanNumber: 4,
    sephirah: 'Chesed',
    hebrewLetter: 'ד',
    pathWord: 'Daleth',
    keywords: ['libertação', 'eg_less', 'soltar', 'desapego'],
    challenges: [
      '  Medo de perder a identidade',
      '  Resistência familiar e social',
      '  Culpa por não atender expectativas',
    ],
    gifts: ['Liberdade interior', 'Centro em si mesmo', 'Capacidade de reescrever sua narrativa'],
    shadowPitfall: 'Renúncia autodestrutiva — cortar tudo de uma vez sem reconstrução interna.',
    practice: 'Revisão semanal do que foi apegado / identifique crenças herdadas e questione-as.',
    color: '#A8D4C8',
    durationLabel: 'Meses a anos',
  },
  {
    id: 'servindo',
    name: 'Serving',
    portugueseName: 'Servindo',
    description:
      'O eu expandido se volta para o próximo. Serviço espiritual, caridade anônima e amor ágape.',
    chaldeanNumber: 5,
    sephirah: 'Geburah',
    hebrewLetter: 'ה',
    pathWord: 'Heh',
    keywords: ['serviço', 'amor', 'compaixão', 'dedicação'],
    challenges: [
      '  Exaustão por sobre-dedicação',
      '  Martírio voluntário e síndrome do salvador',
      '  Burnout espiritual',
    ],
    gifts: ['Amor incondicional', 'Capacidade de estar presente para o outro', 'Sentido de vida radicado'],
    shadowPitfall: 'Codependência — servir aos outros para preencher um vazio interno.',
    practice: 'Ação de serviço diária anônima; verificarMotivações antes de agir.',
    color: '#E8A8B8',
    durationLabel: 'Ano(s)',
  },
  {
    id: 'sintonizando',
    name: 'Tuning',
    portugueseName: 'Sintonizando',
    description:
      'Alinhamento com a Higher Self e os mestres. Revelações, channeling e percepção extrasensory refinada.',
    chaldeanNumber: 6,
    sephirah: 'Tiphereth',
    hebrewLetter: 'ו',
    pathWord: 'Vav',
    keywords: ['canalização', 'higher self', 'harmonia', 'revelação'],
    challenges: [
      '  Confundir projeção do ego com guidance divino',
      '  Isolamento intelectual — saber demais para compartilhar',
      '  Dub on a própria autoridade espiritual',
    ],
    gifts: ['Clareza de percepção', 'Intuição precisa', 'Capacidade creativa inspirada'],
    shadowPitfall: 'Guru syndrome —adar a autoridade interior a ponto de desarar o discernimento.',
    practice: 'Meditação de fusão com Higher Self;journal de mensagens recebidas para verificar padrões.',
    color: '#E8D8A8',
    durationLabel: 'Anos',
  },
  {
    id: 'purificando',
    name: 'Purifying',
    portugueseName: 'Purificando',
    description:
      'Fogo purificador. Os últimos vestígios de sombras, feridas e traumas são trazidos à luz para integração.',
    chaldeanNumber: 7,
    sephirah: 'Netzach',
    hebrewLetter: 'ז',
    pathWord: 'Zayin',
    keywords: ['purificação', 'cura', 'integração', ' chama branca'],
    challenges: [
      '  Confrontação com traumas profundos',
      '  Resistência à purificação por medo da dor',
      '  Períodos de escuridão intensa (dark night of soul)',
    ],
    gifts: ['Healing completo', 'Presença inabalável', 'Coração reopened e strong'],
    shadowPitfall: 'Identificação excessiva com a wounds — tornar-se a ferida em vez de superá-la.',
    practice: 'Terapia holística, breathwork, confissão a um guia de confiança; não enfrentar sozinho.',
    color: '#D8E8F8',
    durationLabel: 'Anos',
  },
  {
    id: 'iluminando',
    name: 'Illuminating',
    portugueseName: 'Iluminando',
    description:
      'A Luz do Eterno Desperta em você e através de você. Gnose, sabedoria irradiante e identidade com a luz.',
    chaldeanNumber: 8,
    sephirah: 'Hod',
    hebrewLetter: 'ח',
    pathWord: 'Cheth',
    keywords: ['gnose', 'luz', 'Sabedoria', 'união divina'],
    challenges: [
      '  Tendência a desaparecer no tudo (perda de individualidade saludable)',
      '  Boredom com o mundo material por parecer "opaco"',
      '  Responsabilidade da Luz irradiada — feedback rápido de pensamentos',
    ],
    gifts: ['Gnose direta', 'Sabedoria que se irradia naturalmente', 'Identidade com o Todo'],
    shadowPitfall: 'Fanatismo luminoso —adar a Luz a ponto de rejeitar a escuridão como irreal.',
    practice: 'Contemplação da Luz semForma; prática de manter a consciência ao retornar ao mundo.',
    color: '#F8E8D8',
    durationLabel: 'Permanente',
  },
  {
    id: 'unificando',
    name: 'Unifying',
    portugueseName: 'Unificando',
    description:
      'A meta final: integrar Luz e sombra, sagrado e mundano, em uma vida que é, em si mesma, o Caminho.',
    chaldeanNumber: 9,
    sephirah: 'Yesod',
    hebrewLetter: 'ט',
    pathWord: 'Teth',
    keywords: ['integração', 'Maestria', 'vida como caminho', 'união'],
    challenges: [
      '  Não há mais zewnętrque desculpa — Todo é escolha consciente',
      '  Responsabilidade total pelo próprio estado',
      '  O mundo continua pedindo a Luz que você é',
    ],
    gifts: ['Maestria', 'Vida como expressão do divino', 'Capacidade de guiar outros com naturalidade'],
    shadowPitfall: 'Imobilismo contemplativo — tanta luz que nada mais parece urgente o suficiente.',
    practice: 'Integração daily: leve a consciência luminosa para as menores tarefas do dia-a-dia.',
    color: '#F8F0E8',
    durationLabel: 'Permanente',
  },
];

export function getStages(): AwakeningStage[] {
  return stages;
}

export function getStageById(id: AwakeningStageId): AwakeningStage | undefined {
  return stages.find((s) => s.id === id);
}

export function getStageByNumber(n: number): AwakeningStage | undefined {
  return stages.find((s) => s.chaldeanNumber === n);
}
