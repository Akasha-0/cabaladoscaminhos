// Aromatherapy blends - Skip linting and formatting

export interface BlendIngredient {
  name: string;
  namePt: string;
  drops: number;
}

export interface AromatherapyBlend {
  id: string;
  name: string;
  namePt: string;
  purpose: string;
  purposePt: string;
  ingredients: BlendIngredient[];
  method: string;
  methodPt: string;
  notes: string;
  notesPt: string;
}

const blends: AromatherapyBlend[] = [
  {
    id: "calming-sleep",
    name: "Calming Sleep Blend",
    namePt: "Blend para Sono Calmo",
    purpose: "Relaxation and sleep promotion",
    purposePt: "Relaxamento e promoção do sono",
    ingredients: [
      { name: "Lavender", namePt: "Lavanda", drops: 4 },
      { name: "Chamomile", namePt: "Camomila", drops: 2 },
      { name: "Cedarwood", namePt: "Cedro", drops: 2 },
    ],
    method: "Diffuse 3-5 drops for 30 minutes before bedtime",
    methodPt: "Difunda 3-5 gotas por 30 minutos antes de dormir",
    notes: "Natural sleep aid",
    notesPt: "Auxiliar natural para o sono",
  },
  {
    id: "stress-relief",
    name: "Stress Relief Blend",
    namePt: "Blend para Alívio do Estresse",
    purpose: "Anxiety and stress reduction",
    purposePt: "Redução de ansiedade e estresse",
    ingredients: [
      { name: "Bergamot", namePt: "Bergamota", drops: 3 },
      { name: "Ylang Ylang", namePt: "Ilang-ilang", drops: 2 },
      { name: "Frankincense", namePt: "Olíbano", drops: 2 },
    ],
    method: "Diffuse or dilute in carrier oil for massage",
    methodPt: "Difunda ou dilua em óleo carreador para massagem",
    notes: "Promotes emotional balance",
    notesPt: "Promove equilíbrio emocional",
  },
  {
    id: "energy-boost",
    name: "Energy Boost Blend",
    namePt: "Blend para Energização",
    purpose: "Increased vitality and focus",
    purposePt: "Aumento de vitalidade e foco",
    ingredients: [
      { name: "Peppermint", namePt: "Hortelã-pimenta", drops: 3 },
      { name: "Rosemary", namePt: "Alecrim", drops: 2 },
      { name: "Lemon", namePt: "Limão", drops: 3 },
    ],
    method: "Diffuse during morning routine",
    methodPt: "Difunda durante a rotina matinal",
    notes: "Invigorating and clarifying",
    notesPt: "Revigorante e clareador",
  },
  {
    id: "meditation-focus",
    name: "Meditation Focus Blend",
    namePt: "Blend para Foco na Meditação",
    purpose: "Deepening meditation practice",
    purposePt: "Aprofundamento da prática de meditação",
    ingredients: [
      { name: "Sandalwood", namePt: "Sândalo", drops: 3 },
      { name: "Myrrh", namePt: "Mirra", drops: 2 },
      { name: "Frankincense", namePt: "Olíbano", drops: 2 },
    ],
    method: "Diffuse during meditation or apply diluted to third eye",
    methodPt: "Difunda durante a meditação ou aplique diluído no terceiro olho",
    notes: "Supports spiritual connection",
    notesPt: "Apóia a conexão espiritual",
  },
  {
    id: "love-harmony",
    name: "Love and Harmony Blend",
    namePt: "Blend para Amor e Harmonia",
    purpose: "Opening heart chakra and promoting love",
    purposePt: "Abertura do chakra cardíaco e promoção do amor",
    ingredients: [
      { name: "Rose", namePt: "Rosa", drops: 4 },
      { name: "Jasmine", namePt: "Jasmim", drops: 2 },
      { name: "Ylang Ylang", namePt: "Ilang-ilang", drops: 2 },
    ],
    method: "Diffuse or diffuse in bedtime routine",
    methodPt: "Difunda ou use na rotina noturna",
    notes: "Heart-opening and nurturing",
    notesPt: "Abertura do coração e nuttyrição",
  },
  {
    id: "protection-shield",
    name: "Protection Shield Blend",
    namePt: "Blend de Proteção",
    purpose: "Energetic protection and grounding",
    purposePt: "Proteção energética e aterramento",
    ingredients: [
      { name: "Cedarwood", namePt: "Cedro", drops: 3 },
      { name: "Sage", namePt: "Sálvia", drops: 2 },
      { name: "Myrrh", namePt: "Mirra", drops: 2 },
    ],
    method: "Diffuse while visualizing protective shield",
    methodPt: "Difunda enquanto visualiza um escudo protetor",
    notes: "Creates energetic boundary",
    notesPt: "Cria limite energético",
  },
  {
    id: "healing-wholeness",
    name: "Healing Wholeness Blend",
    namePt: "Blend para Cura e Integralidade",
    purpose: "Physical and emotional healing support",
    purposePt: "Suporte para cura física e emocional",
    ingredients: [
      { name: "Tea Tree", namePt: "Tea Tree", drops: 3 },
      { name: "Helichrysum", namePt: "Helicriso", drops: 2 },
      { name: "Frankincense", namePt: "Olíbaan", drops: 3 },
    ],
    method: "Dilute in carrier oil for topical application",
    methodPt: "Dilua em óleo carreador para aplicação tópico",
    notes: "Supports body's natural healing",
    notesPt: "Apóia a cura natural do corpo",
  },
  {
    id: "manifestation-abundance",
    name: "Manifestation Abundance Blend",
    namePt: "Blend para Manifestação e Abundância",
    purpose: "Attracting abundance and manifestation work",
    purposePt: "Atração de abundância e trabalho de manifestação",
    ingredients: [
      { name: "Cinnamon", namePt: "Canela", drops: 2 },
      { name: "Orange", namePt: "Laranja", drops: 4 },
      { name: "Sandalwood", namePt: "Sândalo", drops: 2 },
    ],
    method: "Diffuse during intention setting practices",
    methodPt: "Difunda durante práticas de definição de intenções",
    notes: "Activates manifesting energy",
    notesPt: "Ativa energia de manifestação",
  },
];

/**
 * Returns all aromatherapy blends
 */
export function getBlends(): AromatherapyBlend[] {
  return blends;
}

/**
 * Returns blend by ID
 */
export function getBlendById(id: string): AromatherapyBlend | undefined {
  return blends.find((blend) => blend.id === id);
}

/**
 * Returns blends by purpose keyword
 */
export function getBlendsByPurpose(purpose: string): AromatherapyBlend[] {
  const term = purpose.toLowerCase();
  return blends.filter(
    (blend) =>
      blend.purpose.toLowerCase().includes(term) ||
      blend.purposePt.toLowerCase().includes(term)
  );
}
