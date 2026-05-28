export interface FrequenciaSolfeggio {
  id: string;
  hz: number;
  nota: string;
  nome: string;
  cor: string;
  chakra: number | null;
  elemento: string | null;
  sefirot: string | null;
  beneficios: string[];
  aplicacoes: string[];
  mantra: string;
  descricao: string;
}

export const FREQUENCIAS_SOLFEGGIO: FrequenciaSolfeggio[] = [
  {
    id: '174-hz',
    hz: 174,
    nota: 'Fá',
    nome: 'Frequência da Fundação',
    cor: '#8B0000',
    chakra: 1,
    elemento: 'Terra',
    sefirot: 'Malkuth',
    beneficios: [
      'Alívio da dor física',
      'Fortalecimento do corpo',
      'Aterramento energético',
      'Redução de estresse',
    ],
    aplicacoes: [
      'Meditação para alívio de dores crônicas',
      'Práticas de yoga e alongamento',
      'Tratamento de lesões',
    ],
    mantra: 'Om',
    descricao: 'Considerada a frequência base da vida, ajuda a fortalecer a estrutura física e emocional.',
  },
  {
    id: '285-hz',
    hz: 285,
    nota: 'Fá#',
    nome: 'Frequência da Estrutura',
    cor: '#FF4500',
    chakra: 2,
    elemento: 'Água',
    sefirot: 'Yesod',
    beneficios: [
      'Reparação de tecidos',
      'Harmonização dos órgãos',
      'Estimulação da criatividade',
      'Liberação de bloqueios emocionais',
    ],
    aplicacoes: [
      'Terapia de som para regeneração celular',
      'Ativaão da criatividade artística',
      'Trabalho com águas medicinais',
    ],
    mantra: 'Ram',
    descricao: 'Auxilia na regeneração dos tecidos e na harmonização do corpo sutil.',
  },
  {
    id: '396-hz',
    hz: 396,
    nota: 'Sol',
    nome: 'Frequência da Liberação',
    cor: '#FFA500',
    chakra: 3,
    elemento: 'Fogo',
    sefirot: 'Hod',
    beneficios: [
      'Liberação de culpas e medos',
      'Transformação de padrões negativos',
      'Despertar da confiança',
      'Abertura para novas possibilidades',
    ],
    aplicacoes: [
      'Trabalho terapêutico com traumas',
      'Meditação para libertação emocional',
      'Rituais de perdão',
    ],
    mantra: 'Gam',
    descricao: 'Frequência poderosa para liberation de energias pesadas e padrões kármicos.',
  },
  {
    id: '417-hz',
    hz: 417,
    nota: 'Sol#',
    nome: 'Frequência da Facilitação',
    cor: '#EAB308',
    chakra: 4,
    elemento: 'Ar',
    sefirot: 'Netzach',
    beneficios: [
      'Facilitação de mudanças',
      'Superamento de situações bloqueadas',
      'Estímulo à ação',
      'Despertar da motivação',
    ],
    aplicacoes: [
      'Transições de vida importantes',
      'Soltura de comportamentos limitantes',
      'Práticas de manifestação',
    ],
    mantra: 'Vau',
    descricao: 'Promove a mudança de situações estagnadas e facilita a progressão em qualquer área.',
  },
  {
    id: '528-hz',
    hz: 528,
    nota: 'Lá',
    nome: 'Frequência do Amor',
    cor: '#22C55E',
    chakra: 5,
    elemento: 'Éter',
    sefirot: 'Tiphereth',
    beneficios: [
      'Transformação e reparação do DNA',
      'Ativação do amor unconditional',
      'Harmonização dos chakras',
      'Aceleracão da cura',
      'Conexão com a natureza',
    ],
    aplicacoes: [
      'Meditação de cura profunda',
      'Ativação do chakra cardíaco',
      'Trabalho com água estruturada',
      'Rituais de amor próprio',
    ],
    mantra: 'Yod',
    descricao: 'A frequência mais conhecida das frequências Solfeggio, associada à transformação do DNA e ao amor incondicional.',
  },
  {
    id: '639-hz',
    hz: 639,
    nota: 'Lá#',
    nome: 'Frequência da Harmonia',
    cor: '#00CED1',
    chakra: 6,
    elemento: 'Luz',
    sefirot: 'Geburah',
    beneficios: [
      'Harmonização de relacionamentos',
      'Conexão com outras almas',
      'Resolução de conflitos',
      'Fortalecimento de laços familiares',
    ],
    aplicacoes: [
      'Harmonização de ambientes',
      'Rituais de reconciliação',
      'Meditação pela paz',
    ],
    mantra: 'He',
    descricao: 'Promove a harmonia nas relações humanas e a conexão com planos superiores.',
  },
  {
    id: '741-hz',
    hz: 741,
    nota: 'Si',
    nome: 'Frequência da Expressão',
    cor: '#3B82F6',
    chakra: 6,
    elemento: 'Luz',
    sefirot: 'Chokmah',
    beneficios: [
      'Despertar da intuição',
      'Expansão da consciência',
      'Expressão criativa',
      'Purificação de energias densas',
    ],
    aplicacoes: [
      'Desenvolvimento de clarividência',
      'Expressão artística elevada',
      'Práticas de limpeza energética',
    ],
    mantra: 'Aleph',
    descricao: 'Estimula a expressão em todos os níveis e desperta habilidades psíquicas.',
  },
  {
    id: '852-hz',
    hz: 852,
    nota: 'Dó',
    nome: 'Frequência da Iluminação',
    cor: '#7C3AED',
    chakra: 7,
    elemento: 'Consciência',
    sefirot: 'Binah',
    beneficios: [
      'Despertar da consciência espiritual',
      'Activação da glândula pineal',
      'Conexão com a luz interior',
      'Dissolução de ilusões',
    ],
    aplicacoes: [
      'Meditação profunda de elevação',
      'Trabalho com a glândula pineal',
      'Retiros espirituais',
    ],
    mantra: 'Shin',
    descricao: 'Frequência de elevação espiritual que ajuda a despertar a consciência superior.',
  },
  {
    id: '963-hz',
    hz: 963,
    nota: 'Dó#',
    nome: 'Frequência da Luz',
    cor: '#FFFFFF',
    chakra: 7,
    elemento: 'Consciência',
    sefirot: 'Kether',
    beneficios: [
      'Conexão com a energia universal',
      'Restabelecimento da ordem original',
      'Expansão da consciência cósmica',
      'Sintonização com os níveis superiores',
    ],
    aplicacoes: [
      'Comunhão com seres de luz',
      'Práticas de cura espiritual',
      'Meditação de unidade',
    ],
    mantra: 'Tau',
    descricao: 'A frequência mais alta das frequências Solfeggio, associada à perfeição e à energia divina.',
  },
];

export function getFrequenciaPorChakra(chakra: number): FrequenciaSolfeggio[] {
  return FREQUENCIAS_SOLFEGGIO.filter(f => f.chakra === chakra);
}

export function getFrequenciaPorSefirot(sefirot: string): FrequenciaSolfeggio[] {
  return FREQUENCIAS_SOLFEGGIO.filter(f => f.sefirot === sefirot);
}

export function getFrequenciaMaisAlta(): FrequenciaSolfeggio {
  return FREQUENCIAS_SOLFEGGIO.reduce((maior, atual) => 
    atual.hz > maior.hz ? atual : maior
  );
}

export function getFrequenciaMaisBaixa(): FrequenciaSolfeggio {
  return FREQUENCIAS_SOLFEGGIO.reduce((menor, atual) => 
    atual.hz < menor.hz ? atual : menor
  );
}

export const FREQUENCIAS_EXTENDIDAS = [
  { hz: 111, nome: 'Frequência da Confiança', beneficios: ['Fortalecimento da auto-confiança'] },
  { hz: 222, nome: 'Frequência da Paz', beneficios: ['Calma e serenidade interior'] },
  { hz: 333, nome: 'Frequência da Sabedoria', beneficios: ['Acesso à sabedoria ancestral'] },
  { hz: 444, nome: 'Frequência da Verdade', beneficios: ['Discernimento e clareza'] },
  { hz: 555, nome: 'Frequência da Abundância', beneficios: ['Manifestação de prosperidade'] },
  { hz: 666, nome: 'Frequência da Harmonia Divina', beneficios: ['Equilíbrio entre espíritu e matéria'] },
  { hz: 777, nome: 'Frequência dos Milagres', beneficios: ['Abertura para milagres'] },
  { hz: 888, nome: 'Frequência da Ascensão', beneficios: ['Elevação espiritual'] },
  { hz: 999, nome: 'Frequência da Completude', beneficios: ['Integração total'] },
];