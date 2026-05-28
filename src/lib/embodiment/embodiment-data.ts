/**
 * Embodiment Data - Spiritual embodiment data for Cabala dos Caminhos
 * Provides data for embodying divine consciousness in physical form
 */

export interface EmbodimentState {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  practices: string[];
  practicesPt: string[];
  affirmation: string;
  affirmationPt: string;
  chakra: string;
  element: string;
}

export interface EmbodimentStage {
  id: string;
  level: number;
  name: string;
  namePt: string;
  nameEn: string;
  description: string;
  descriptionPt: string;
  symptoms: string[];
  symptomsPt: string[];
  practices: string[];
  practicesPt: string[];
  duration: string;
}

export function getData(): {
  states: EmbodimentState[];
  stages: EmbodimentStage[];
} {
  return {
    states: [
      {
        id: 'state-awareness',
        name: 'Estado de Consciência Corporal',
        namePt: 'Estado de Consciência Corporal',
        description: 'Despertar da consciência para o corpo como veículo sagrado',
        descriptionPt: 'Despertar da consciência para o corpo como veículo sagrado',
        practices: ['Body scan meditation', 'Grounding exercises', 'Breath awareness'],
        practicesPt: ['Meditação de escaneamento corporal', 'Exercícios de aterramento', 'Consciência respiratória'],
        affirmation: 'I inhabit my body fully and honor it as a sacred temple',
        affirmationPt: 'Eu habito meu corpo plenamente e o honro como um templo sagrado',
        chakra: 'root',
        element: 'earth'
      },
      {
        id: 'state-integration',
        name: 'Integração Corpo-Alma',
        namePt: 'Integração Corpo-Alma',
        description: 'Unificação da consciência espiritual com a expressão física',
        descriptionPt: 'Unificação da consciência espiritual com a expressão física',
        practices: [' embodiment meditation', 'Energy body awareness', 'Subtle body work'],
        practicesPt: ['Meditação de incorporação', 'Consciência do corpo energético', 'Trabalho com corpos sutis'],
        affirmation: 'My soul and body are one harmonious expression of divine love',
        affirmationPt: 'Minha alma e corpo são uma expressão harmônica de amor divino',
        chakra: 'heart',
        element: 'water'
      },
      {
        id: 'state-fulfillment',
        name: 'Expressão Divina em Forma',
        namePt: 'Expressão Divina em Forma',
        description: 'Manifestação plena do divino através do ser físico encarnado',
        descriptionPt: 'Manifestação plena do divino através do ser físico encarnado',
        practices: ['Sacred embodiment rituals', 'Divine channeling', 'Sacred sexuality'],
        practicesPt: ['Rituais de incorporação sagrada', 'Canalização divina', 'Sexualidade sagrada'],
        affirmation: 'I am the living vessel through which divine consciousness flows',
        affirmationPt: 'Eu sou o vaso vivo através do qual a consciência divina flui',
        chakra: 'crown',
        element: 'ether'
      },
      {
        id: 'state-transcendence',
        name: 'Transcendência incarnada',
        namePt: 'Transcendência Incarnada',
        description: 'Capacidade de habitar simultaneamente o corpo e a consciência ilimitada',
        descriptionPt: 'Capacidade de habitar simultaneamente o corpo e a consciência ilimitada',
        practices: ['Non-dual awareness practices', 'Siddhi development', 'Mastery of light body'],
        practicesPt: ['Práticas de consciência não-dual', 'Desenvolvimento de siddhis', 'Domínio do corpo de luz'],
        affirmation: 'I am simultaneously grounded in form and free in infinite consciousness',
        affirmationPt: 'Estou simultaneamente aterrado na forma e livre na consciência infinita',
        chakra: 'third-eye',
        element: 'fire'
      }
    ],
    stages: [
      {
        id: 'stage-awakening',
        level: 1,
        name: 'Despertar Corporal',
        namePt: 'Despertar Corporal',
        nameEn: 'Body Awakening',
        description: 'Primeiro reconhecimento do corpo como instrumento espiritual',
        descriptionPt: 'Primeiro reconhecimento do corpo como instrumento espiritual',
        symptoms: [
          'Increased body awareness',
          'Sensitivity to energy',
          'Desire to move mindfully',
          'Rejection of dissociative patterns'
        ],
        symptomsPt: [
          'Maior consciência corporal',
          'Sensibilidade à energia',
          'Desejo de se mover com atenção plena',
          'Rejeição de padrões dissociativos'
        ],
        practices: [
          'Daily body scan meditation',
          'Grounding walks in nature',
          'Yoga or conscious movement',
          'Breath-body connection work'
        ],
        practicesPt: [
          'Meditação diária de escaneamento corporal',
          'Caminhadas de aterramento na natureza',
          'Yoga ou movimento consciente',
          'Trabalho de conexão respiração-corpo'
        ],
        duration: '3-6 months'
      },
      {
        id: 'stage-sensitization',
        level: 2,
        name: 'Sensibilização Energética',
        namePt: 'Sensibilização Energética',
        nameEn: 'Energy Sensitization',
        description: 'Desenvolvimento da percepção dos corpos sutis e campos de energia',
        descriptionPt: 'Desenvolvimento da percepção dos corpos sutis e campos de energia',
        symptoms: [
          'Feeling energy fields',
          'Temperature sensitivity',
          'Empathy amplification',
          'Chakra awareness emerges'
        ],
        symptomsPt: [
          'Percepção de campos energéticos',
          'Sensibilidade térmica',
          'Amplificação da empatia',
          'Surgimento da consciência dos chakras'
        ],
        practices: [
          'Reiki or energy healing training',
          'Chakra meditation and balancing',
          'Aura viewing exercises',
          'Energy hygiene practices'
        ],
        practicesPt: [
          'Treinamento em Reiki ou cura energética',
          'Meditação e equilíbrio dos chakras',
          'Exercícios de visão do aura',
          'Práticas de higiene energética'
        ],
        duration: '6-12 months'
      },
      {
        id: 'stage-integration',
        level: 3,
        name: 'Integração Alma-Corpo',
        namePt: 'Integração Alma-Corpo',
        nameEn: 'Soul-Body Integration',
        description: 'Processo de unificar a identidade espiritual com a expressão física',
        descriptionPt: 'Processo de unificar a identidade espiritual com a expressão física',
        symptoms: [
          'Deepening sense of embodiment',
          'Spiritual insights manifest physically',
          'Reduced mind-body separation',
          'Living spiritual principles through form'
        ],
        symptomsPt: [
          'Aprofundamento do senso de incorporação',
          'Insights espirituais se manifestam fisicamente',
          'Redução da separação mente-corpo',
          'Vivência de princípios espirituais através da forma'
        ],
        practices: [
          'Embodiment meditations daily',
          'Sacred rituals of integration',
          'Divine parent inner work',
          'Earth stewardship practices'
        ],
        practicesPt: [
          'Meditações de incorporação diárias',
          'Rituais sagrados de integração',
          'Trabalho interior com pais divinos',
          'Práticas de cuidado da Terra'
        ],
        duration: '1-2 years'
      },
      {
        id: 'stage-mastery',
        level: 4,
        name: 'Mestria incarnada',
        namePt: 'Mestria Incarnada',
        nameEn: 'Incarnate Mastery',
        description: 'Domínio da expressão divina através do corpo físico incarnado',
        descriptionPt: 'Domínio da expressão divina através do corpo físico incarnado',
        symptoms: [
          'Effortless spiritual embodiment',
          'Natural healing presence',
          'Sacred sexuality awakened',
          'Light body activation begins'
        ],
        symptomsPt: [
          'Incorporação espiritual sem esforço',
          'Presença curativa natural',
          'Sexualidade sagrada despertada',
          'Ativação do corpo de luz começa'
        ],
        practices: [
          'Advanced embodiment practices',
          'Sacred sexuality work',
          'Light body activation',
          'Teaching and transmission'
        ],
        practicesPt: [
          'Práticas avançadas de incorporação',
          'Trabalho com sexualidade sagrada',
          'Ativação do corpo de luz',
          'Ensino e transmissão'
        ],
        duration: '2-5 years'
      },
      {
        id: 'stage-transcendence',
        level: 5,
        name: 'Transcendência Incarnada',
        namePt: 'Transcendência Incarnada',
        nameEn: 'Incarnate Transcendence',
        description: 'Capacidade de habitar plenamente o corpo enquanto consciente da infinitude',
        descriptionPt: 'Capacidade de habitar plenamente o corpo enquanto consciente da infinitude',
        symptoms: [
          'Non-dual embodiment',
          'Bidimensional existence awareness',
          'Mastery of physical form',
          'Divinehuman expression complete'
        ],
        symptomsPt: [
          'Incorporação não-dual',
          'Consciência de existência bidimensional',
          'Domínio da forma física',
          'Expressão divino-humana completa'
        ],
        practices: [
          'Non-dual practices',
          'Siddhi cultivation',
          'Divine co-creation',
          'Legacy building'
        ],
        practicesPt: [
          'Práticas não-duais',
          'Cultivo de siddhis',
          'Co-criação divina',
          'Construção de legado'
        ],
        duration: 'ongoing'
      }
    ]
  };
}

/**
 * Get embodiment states
 */
export function getStates(): EmbodimentState[] {
  return getData().states;
}

/**
 * Get embodiment stages
 */
export function getStages(): EmbodimentStage[] {
  return getData().stages;
}

/**
 * Get stage by level
 */
export function getStageByLevel(level: number): EmbodimentStage | undefined {
  return getData().stages.find((s) => s.level === level);
}

/**
 * Get state by id
 */
export function getStateById(id: string): EmbodimentState | undefined {
  return getData().states.find((s) => s.id === id);
}
