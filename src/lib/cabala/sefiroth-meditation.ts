export type Sefirah =
  | 'keter'
  | 'chokhmah'
  | 'binah'
  | 'chesed'
  | 'geburah'
  | 'tiferet'
  | 'netzach'
  | 'hod'
  | 'yesod'
  | 'malkuth';

export interface Meditation {
  name: string;
  hebrew: string;
  meaning: string;
  mantra: string;
  visualization: string;
  breathPattern: string;
  duration: string;
  focus: string[];
}

const meditations: Record<Sefirah, Meditation> = {
  keter: {
    name: 'Coroa',
    hebrew: 'כתר',
    meaning: 'Coroa, Limite Divino,无限虚空',
    mantra: 'Ein Sof',
    visualization:
      'Imagine uma luz branca infinita emanando de um ponto sem dimensões. Esta luz está além de qualquer forma ou conceito — puro potencial não-manifestado. Permita que ela envolva sua consciência, expandindo-a além dos limites do ego.',
    breathPattern: 'Inalação lenta e profunda (7s) → Suspensão (7s) → Exalação suave (7s)',
    duration: '20-30 minutos',
    focus: [
      'Silêncio interior',
      'Transcendência do pensamento',
      'Conexão com a fonte primordial',
      'Desidentificação com a forma',
    ],
  },

  chokhmah: {
    name: 'Sabedoria',
    hebrew: 'חכמה',
    meaning: 'Sabedoria, Ideia Primordial, Impulso creativo',
    mantra: 'Yah',
    visualization:
      'Visualize uma semente de luz dourada/cristalina explode em sua coroa, irradiando raios de sabedoria pura. Esta é a primeira scintilação da criação — a centelha da ideia antes da forma. Sinta o insight nascendo como um trovão silencioso no centro de sua mente.',
    breathPattern: 'Inalação rápida e expansiva (4s) → Pausa (4s) → Exalação moderada (6s)',
    duration: '15-20 minutos',
    focus: [
      'Receber insight sem esforço',
      'Abertura ao novo',
      'Pensamento intuitivo',
      'Criatividade primordial',
    ],
  },

  binah: {
    name: 'Compreensão',
    hebrew: 'בינה',
    meaning: 'Compreensão, Análise, Mente concreta',
    mantra: 'Yahweh',
    visualization:
      'Contemple uma montanha escura e sólida banhada por luz lunar. A água da compreensão flui para baixo da montanha, formando estruturas definidas — conceitos, limites, formas. Permita que a análise traga ordem ao caos. A percepção do feminino sagrado.',
    breathPattern: 'Inalação profunda e lenta (6s) → Sustentação (4s) → Exalação controlada (8s)',
    duration: '15-20 minutos',
    focus: [
      'Discernimento',
      'Estruturação do conhecimento',
      'Paciência contemplativa',
      'Maturidade espiritual',
    ],
  },

  chesed: {
    name: 'Misericórdia',
    hebrew: 'חסד',
    meaning: 'Misericórdia, Graça, Bondade incondicional',
    mantra: 'El',
    visualization:
      'Imagine uma coluna de luz azul-violeta descendo do céu como chuva de graça infinita. Esta luz entra pelo topo de sua cabeça e flui por todo o seu ser, preenchendo cada célula com compaixão ilimitada. Você se torna um canal de amor incondicional para o mundo.',
    breathPattern: 'Inalação suave e expansiva (5s) → Pausa suave (3s) → Exalação que irradia amor (7s)',
    duration: '15-20 minutos',
    focus: [
      'Amor incondicional',
      'Generosidade sem expectativa',
      'Expansão do coração',
      'Cura pelo dar',
    ],
  },

  geburah: {
    name: 'Severidade',
    hebrew: 'גבורה',
    meaning: 'Severidade, Julgamento, Força, Disciplica',
    mantra: 'Elohim Gevurah',
    visualization:
      'Visualize uma chama vermelha/laranja intensa no centro do seu ser — uma força de transformação e purificação. Esta é a espada que corta o supérfluo, o fogo que queima a ilusão. Permita que ela separe o essencial do transitório com precisão amorosa.',
    breathPattern: 'Inalação enraizada (4s) → Suspensão firme (3s) → Exalação cortante (6s)',
    duration: '10-15 minutos',
    focus: [
      'Determinação',
      'Limites saudáveis',
      'Purificação interior',
      'Coragem',
    ],
  },

  tiferet: {
    name: 'Beleza',
    hebrew: 'תפארת',
    meaning: 'Beleza, Harmonia, Compaixão central, equilibrio entre Chesed e Gevurah',
    mantra: 'Tiferet',
    visualization:
      'Sinta o ponto central do seu peito — o coração solar. Ali, uma luz dourada irradia em seis direções: acima e abaixo, esquerda e direita, frente e trás. Chesed e Gevurah dançam em equilíbrio perfeito ao redor deste eixo. Você é o eixo — centro imóvel de onde tudo flui.',
    breathPattern: 'Inalação profunda pelo coração (6s) → Sustentação harmoniosa (4s) → Exalação integradora (7s)',
    duration: '20-30 minutos',
    focus: [
      'Integração dos opostos',
      'Unificação do self',
      'Beleza interior',
      'Presença amorosa',
    ],
  },

  netzach: {
    name: 'Vitória',
    hebrew: 'נצח',
    meaning: 'Vitória, Persistência, Emoção, Ardência interior',
    mantra: 'Tzedek',
    visualization:
      'Contemple um verde-esmeralda radiante na altura do plexo solar direito. Esta é a chama da paixão, da persistência, da vitória interior. Sinta-a como uma tocha que nunca se apaga — o fogo do desejo sagrado, da aspiração constante, da devoção ardente que supera todo obstáculo.',
    breathPattern: 'Inalação vigorosa (4s) → Pausa (3s) → Exalação que emana calor (6s)',
    duration: '10-15 minutos',
    focus: [
      'Persistência',
      'Paixão pela vida',
      'Superação de obstáculos',
      'Ardência espiritual',
    ],
  },

  hod: {
    name: 'Glória',
    hebrew: 'הוד',
    meaning: 'Glória, Humildade,thankfulness, Estrutura racional',
    mantra: 'Ani',
    visualization:
      'Visualize uma luz laranja-dourada no lado esquerdo do seu corpo. Hod representa a glória que emerge da estrutura, da gratidão e da humildade. Imagine suas palavras como ondas harmoniosas que se propagam, e seu intelecto como um instrumento finely tunado para a verdade.',
    breathPattern: 'Inalação refinada (5s) → Sustentação (2s) → Exalação.grata (7s)',
    duration: '10-15 minutos',
    focus: [
      'Gratidão',
      'Comunicação clara',
      'Humildade',
      'Ordem mental',
    ],
  },

  yesod: {
    name: 'Fundação',
    hebrew: 'יסוד',
    meaning: 'Fundação, Sublimação, O月亮中心, Memória cósmica',
    mantra: 'Shaddai',
    visualization:
      'Sinta uma luz violeta/índigo na base da coluna ou no centro da região pélvica — o Yesod, a fundação de toda a árvore. Esta é a câmara nupcial onde a energia é sublimada e armazenada. Visualize uma lua cheia banhando esta área em luz prateada, conectando você ao fluxo de toda a realidade.',
    breathPattern: 'Inalação ascendente (5s) → Sustento (4s) → Exalação que ancora (6s)',
    duration: '15-20 minutos',
    focus: [
      'Enraizamento',
      'Sublimação da energia',
      'Conexão com o mundo',
      'Memória e integração',
    ],
  },

  malkuth: {
    name: 'Reino',
    hebrew: 'מלכות',
    meaning: 'Reino, Realidade física, A Terra Santa, Manifestação',
    mantra: 'Adonai',
    visualization:
      'Desça mentalmente até a base da coluna — o Yesod — e depois prossiga para baixo, até os pés, onde quatro pilares de luz dourada ancoram você à terra. Sinta a terra como sagrada. Cada passo é uma oração. Malkuth é o ponto onde o divino se torna tangível — o corpo é o templo, a matéria é sagrada.',
    breathPattern: 'Inalação enraizada (4s) → Suspensão (2s) → Exalação que une céu e terra (8s)',
    duration: '10-15 minutos',
    focus: [
      'Presença corporal',
      'Gratidão pela matéria',
      'Manifestação prática',
      'Sacramento do cotidiano',
    ],
  },
};

/**
 * Returns the meditation script for a given sefirah.
 * Throws if the sefirah name is not recognized.
 */
export function getMeditation(sefirah: Sefirah): Meditation {
  const med = meditations[sefirah];
  if (!med) {
    throw new Error(`Unknown sefirah: "${sefirah}". Valid values: ${Object.keys(meditations).join(', ')}`);
  }
  return med;
}
