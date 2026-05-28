/**
 * Choice data module
 * Provides choice and decision-making data for the Cabala dos Caminhos system
 */

export interface ChoiceEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  associatedPaths: string[];
  category: string;
  guidance: string[];
}

export interface ChoiceType {
  type: string;
  description: string;
  weight: number;
}

export function getData(): {
  choices: ChoiceEntity[];
  types: ChoiceType[];
} {
  return {
    choices: [
      {
        id: 'conscious-choice',
        name: 'Conscious Choice',
        description: 'Deliberate decisions made with full awareness and intentionality.',
        characteristics: [
          'Awareness of options',
          'Intentional deliberation',
          'Alignment with values',
          'Present-moment presence'
        ],
        associatedPaths: ['awareness', 'consciousness', 'presence'],
        category: 'deliberate',
        guidance: [
          'Pause before deciding',
          'Check alignment with your deepest values',
          'Consider long-term consequences',
          'Trust your inner wisdom'
        ]
      },
      {
        id: 'intuitive-choice',
        name: 'Intuitive Choice',
        description: 'Decisions guided by inner knowing and instinct.',
        characteristics: [
          'Inner knowing',
          'Instinctual response',
          'Quick discernment',
          'Heart-centered'
        ],
        associatedPaths: ['intuition', 'wisdom', 'heart'],
        category: 'instinctive',
        guidance: [
          'Listen to your gut feeling',
          'Notice bodily sensations',
          'Allow insights to arise',
          'Trust what arises without overthinking'
        ]
      },
      {
        id: 'transformative-choice',
        name: 'Transformative Choice',
        description: 'Decisions that catalyze profound personal evolution.',
        characteristics: [
          'Catalyzes growth',
          'Breaks old patterns',
          'Opens new possibilities',
          'Requires courage'
        ],
        associatedPaths: ['transformation', 'evolution', 'courage'],
        category: 'evolutionary',
        guidance: [
          'Embrace the unknown',
          'Release attachment to outcomes',
          'Allow old structures to dissolve',
          'Trust the process of becoming'
        ]
      },
      {
        id: 'aligned-choice',
        name: 'Aligned Choice',
        description: 'Decisions in harmony with soul purpose and dharma.',
        characteristics: [
          'Soul alignment',
          'Purpose-driven',
          'Dharma-connected',
          'Service-oriented'
        ],
        associatedPaths: ['purpose', 'dharma', 'soul'],
        category: 'spiritual',
        guidance: [
          'Connect with your deeper purpose',
          'Ask what serves the highest good',
          'Notice what feels true rather than merely comfortable',
          'Align action with being'
        ]
      },
      {
        id: 'integrative-choice',
        name: 'Integrative Choice',
        description: 'Decisions that heal and unite fragmented aspects of self.',
        characteristics: [
          'Healing fragmented parts',
          'Promotes wholeness',
          'Unites opposites',
          'Restores balance'
        ],
        associatedPaths: ['integration', 'wholeness', 'healing'],
        category: 'healing',
        guidance: [
          'Honor all parts of yourself',
          'Seek the middle way',
          'Integrate shadow aspects',
          'Embrace complexity with compassion'
        ]
      },
      {
        id: 'surrendered-choice',
        name: 'Surrendered Choice',
        description: 'Decisions made through letting go and trusting divine guidance.',
        characteristics: [
          'Release of control',
          'Trust in higher wisdom',
          'Acceptance of unfolding',
          'Inner peace'
        ],
        associatedPaths: ['surrender', 'trust', 'faith'],
        category: 'surrendered',
        guidance: [
          'Let go of needing to know',
          'Release the need to control',
          'Allow the answer to come',
          'Rest in stillness and listen'
        ]
      }
    ],
    types: [
      {
        type: 'deliberate',
        description: 'Conscious, intentional decisions made with awareness',
        weight: 3
      },
      {
        type: 'instinctive',
        description: 'Quick decisions guided by intuition and inner knowing',
        weight: 2
      },
      {
        type: 'evolutionary',
        description: 'Decisions that catalyze growth and transformation',
        weight: 3
      },
      {
        type: 'spiritual',
        description: 'Decisions aligned with soul purpose and dharma',
        weight: 3
      },
      {
        type: 'healing',
        description: 'Decisions that promote integration and wholeness',
        weight: 2
      },
      {
        type: 'surrendered',
        description: 'Decisions made through trust and letting go',
        weight: 1
      }
    ]
  };
}