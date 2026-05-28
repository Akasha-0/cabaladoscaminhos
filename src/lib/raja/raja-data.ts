/**
 * Raja data module
 * Provides Raja Yoga data for the Cabala dos Caminhos system
 */

// @ts-nocheck
 
// deno-lint-ignore-file no-explicit-any

export interface RajaPractice {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  technique: string;
  techniquePt: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface RajaData {
  id: string;
  name: string;
  namePt: string;
  sanskrit: string;
  origin: string;
  description: string;
  descriptionPt: string;
  focus: string;
  focusPt: string;
  principles: string[];
  benefits: string[];
  benefitsPt: string[];
  practices: RajaPractice[];
  limbs: string[];
  precautions: string[];
}

export function getData(): RajaData {
  return {
    id: 'raja',
    name: 'Raja Yoga',
    namePt: 'Yoga Raja',
    sanskrit: 'राजयोग',
    origin: 'India',
    description: 'The royal path of meditation and mental discipline. Raja Yoga focuses on training the mind through the eight limbs of yoga, cultivating inner peace, spiritual awakening, and mind clarity through systematic practice of meditation, breath control, and ethical principles.',
    descriptionPt: 'O caminho real da meditação e disciplina mental. O Yoga Raja foca no treinamento da mente através dos oito membros do yoga, cultivando paz interior, despertar espiritual e clareza mental através da prática sistemática de meditação, controle respiratório e princípios éticos.',
    focus: 'Meditation and mental discipline',
    focusPt: 'Meditação e disciplina mental',
    principles: [
      'Yama (ethical restraints)',
      'Niyama (observances)',
      'Asana (posture)',
      'Pranayama (breath control)',
      'Pratyahara (sense withdrawal)',
      'Dharana (concentration)',
      'Dhyana (meditation)',
      'Samadhi (union)'
    ],
    benefits: [
      'Inner peace',
      'Spiritual awakening',
      'Mind clarity',
      'Emotional balance',
      'Stress reduction',
      'Improved concentration',
      'Self-awareness',
      'Connection to higher consciousness'
    ],
    benefitsPt: [
      'Paz interior',
      'Despertar espiritual',
      'Clareza mental',
      'Equilíbrio emocional',
      'Redução do estresse',
      'Melhoria da concentração',
      'Autoconsciência',
      'Conexão com consciência superior'
    ],
    practices: [
      {
        id: 'dhyana',
        name: 'Dhyana (Meditation)',
        namePt: 'Dhyana (Meditação)',
        description: 'The practice of uninterrupted contemplation, leading to deep states of awareness and eventually samadhi.',
        descriptionPt: 'A prática de contemplação ininterrupta, levando a estados profundos de consciência e eventualmente samadhi.',
        technique: 'Single-pointed focus on breath, mantra, or object',
        techniquePt: 'Foco único em respiração, mantra ou objeto',
        duration: '20-60 minutes',
        difficulty: 'intermediate'
      },
      {
        id: 'dharana',
        name: 'Dharana (Concentration)',
        namePt: 'Dharana (Concentração)',
        description: 'Training the mind to focus on a single point, building the foundation for meditation.',
        descriptionPt: 'Treinar a mente para focar em um único ponto, construindo a base para a meditação.',
        technique: 'Focus on third eye, breath, or visualization',
        techniquePt: 'Foco no terceiro olho, respiração ou visualização',
        duration: '15-30 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'pranayama',
        name: 'Pranayama (Breath Control)',
        namePt: 'Pranayama (Controle Respiratório)',
        description: 'Regulation of breath to calm the mind and balance energy flows.',
        descriptionPt: 'Regulação da respiração para acalmar a mente e equilibrar fluxos de energia.',
        technique: 'Various breathing patterns including nadi shodhana',
        techniquePt: 'Vários padrões respiratórios incluindo nadi shodhana',
        duration: '10-20 minutes',
        difficulty: 'beginner'
      },
      {
        id: ' Trataka',
        name: ' Trataka (Steady Gaze)',
        namePt: ' Trataka (Olhar Fixo)',
        description: 'Candle flame meditation to strengthen the eyes and develop concentration.',
        descriptionPt: 'Meditação com chama de vela para fortalecer os olhos e desenvolver concentração.',
        technique: 'Steady gaze at candle flame without blinking',
        techniquePt: 'Olhar fixo na chama da vela sem piscar',
        duration: '10-15 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'om-chanting',
        name: 'Om Chanting',
        namePt: 'Canto de Om',
        description: 'Vibration of the sacred sound to align mind and spirit.',
        descriptionPt: 'Vibração do som sagrado para alinhar mente e espírito.',
        technique: 'Rhythmic chanting of A-U-M',
        techniquePt: 'Canto rítmico de A-U-M',
        duration: '5-10 minutes',
        difficulty: 'beginner'
      }
    ],
    limbs: [
      'Yama - Ethical restraints: non-violence, truth, non-stealing, continence, non-covetousness',
      'Niyama - Personal observances: cleanliness, contentment, austerity, study, surrender to God',
      'Asana - Steady, comfortable posture for meditation',
      'Pranayama - Regulation of breath',
      'Pratyahara - Withdrawal of senses from external objects',
      'Dharana - Concentration on a single point',
      'Dhyana - Uninterrupted meditation',
      'Samadhi - State of union and enlightenment'
    ],
    precautions: [
      'Begin with guidance from an experienced teacher',
      'Start with shorter sessions and gradually increase duration',
      'Practice in a calm, quiet environment',
      'Avoid practicing after heavy meals',
      'Those with mental health conditions should consult a healthcare provider'
    ]
  };
}

export default getData();