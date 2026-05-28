// ============================================================
// AYURVEDA DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ayurveda data
// - Doshas: Vata, Pitta, Kapha
// - Subdoshas, Gunas, Dhatus, Srotas, Prakriti
// - Common herbs and formulations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface Dosha {
  id: string;
  name: string;
  namePt: string;
  element: string;
  qualities: string[];
  qualitiesPt: string[];
  season: string;
  seasonPt: string;
  timeOfDay: string;
  timeOfDayPt: string;
  lifeStage: string;
  lifeStagePt: string;
  functions: string[];
  functionsPt: string[];
  imbalance: string[];
  imbalancePt: string[];
  balancePractice: string[];
  balancePracticePt: string[];
}

export interface SubDosha {
  id: string;
  doshaId: string;
  name: string;
  namePt: string;
  location: string;
  locationPt: string;
  functions: string[];
  functionsPt: string[];
  associatedOrgan: string;
  associatedOrganPt: string;
}

export interface Guna {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  qualities: string[];
  qualitiesPt: string[];
  effect: 'increasing' | 'decreasing';
  effectPt: string;
}

export interface Dhatu {
  id: string;
  name: string;
  namePt: string;
  sequence: number;
  functions: string[];
  functionsPt: string[];
  wasteProduct: string;
  wasteProductPt: string;
  upaDhatu: string;
  upaDhatuPt: string;
}

export interface Srotas {
  id: string;
  name: string;
  namePt: string;
  type: string;
  typePt: string;
  origin: string;
  originPt: string;
  channel: string;
  channelPt: string;
  function: string;
  functionPt: string;
  doshaAssociation: string[];
}

export interface Prakriti {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  characteristics: string[];
  characteristicsPt: string[];
  strongOrgans: string[];
  strongOrgansPt: string[];
  weakOrgans: string[];
  weakOrgansPt: string[];
  idealDiet: string;
  idealDietPt: string;
  recommendedPractice: string[];
  recommendedPracticePt: string[];
}

export interface Herb {
  id: string;
  name: string;
  namePt: string;
  sanskritName: string;
  botanicalName: string;
  doshaEffect: string[];
  doshaEffectPt: string[];
  qualities: string[];
  qualitiesPt: string[];
  uses: string[];
  usesPt: string[];
  preparation: string;
  preparationPt: string;
  caution: string;
  cautionPt: string;
}

export interface Formulation {
  id: string;
  name: string;
  namePt: string;
  sanskritName: string;
  ingredients: string[];
  ingredientsPt: string[];
  primaryAction: string;
  primaryActionPt: string;
  indications: string[];
  indicationsPt: string[];
  dosage: string;
  dosagePt: string;
  contraindication: string;
  contraindicationPt: string;
}

// ============================================================
// AYURVEDA DATA
// ============================================================

const DOSHAS: Dosha[] = [
  {
    id: 'vata',
    name: 'Vata',
    namePt: 'Vata',
    element: 'Air + Space',
    qualities: ['Dry', 'Light', 'Cold', 'Rough', 'Mobile'],
    qualitiesPt: ['Seco', 'Leve', 'Frio', 'Áspero', 'Móvel'],
    season: 'Autumn/Winter',
    seasonPt: 'Outono/Inverno',
    timeOfDay: '2AM-6AM, 2PM-6PM',
    timeOfDayPt: '2h-6h, 14h-18h',
    lifeStage: 'Old age',
    lifeStagePt: 'Velhice',
    functions: ['Movement', 'Nervous system', 'Elimination', 'Respiration', 'Creativity'],
    functionsPt: ['Movimento', 'Sistema nervoso', 'Eliminação', 'Respiração', 'Criatividade'],
    imbalance: ['Anxiety', 'Dry skin', 'Constipation', 'Insomnia', 'Weight loss'],
    imbalancePt: ['Ansiedade', 'Pele seca', 'Constipação', 'Insônia', 'Perda de peso'],
    balancePractice: ['Regular routine', 'Warm foods', 'Oil massage', 'Hydration', 'Rest'],
    balancePracticePt: ['Rotina regular', 'Alimentos quentes', 'Massagem com óleo', 'Hidratação', 'Descanso'],
  },
  {
    id: 'pitta',
    name: 'Pitta',
    namePt: 'Pitta',
    element: 'Fire + Water',
    qualities: ['Hot', 'Sharp', ' penetrating', 'Oily', 'Liquid'],
    qualitiesPt: ['Quente', 'Aguçado', 'Penetrante', 'Oleoso', 'Líquido'],
    season: 'Summer',
    seasonPt: 'Verão',
    timeOfDay: '10AM-2PM, 10PM-2AM',
    timeOfDayPt: '10h-14h, 22h-2h',
    lifeStage: 'Adulthood',
    lifeStagePt: 'Adulta',
    functions: ['Metabolism', 'Digestion', 'Vision', 'Temperature regulation', 'Hormones'],
    functionsPt: ['Metabolismo', 'Digestão', 'Visão', 'Regulação térmica', 'Hormônios'],
    imbalance: ['Inflammation', 'Heartburn', 'Irritability', 'Skin rashes', 'Excess heat'],
    imbalancePt: ['Inflamação', 'Azia', 'Irritabilidade', 'Erupções cutâneas', 'Excesso de calor'],
    balancePractice: ['Cool foods', 'Moderate activity', 'Peaceful environment', 'Moonlight exposure', 'Aloe vera'],
    balancePracticePt: ['Alimentos frios', 'Atividade moderada', 'Ambiente tranquilo', 'Exposição à luz lunar', 'Babosa'],
  },
  {
    id: 'kapha',
    name: 'Kapha',
    namePt: 'Kapha',
    element: 'Earth + Water',
    qualities: ['Heavy', 'Slow', 'Cold', 'Oily', 'Dense'],
    qualitiesPt: ['Pesado', 'Lento', 'Frio', 'Oleoso', 'Denso'],
    season: 'Spring',
    seasonPt: 'Primavera',
    timeOfDay: '6AM-10AM, 6PM-10PM',
    timeOfDayPt: '6h-10h, 18h-22h',
    lifeStage: 'Childhood',
    lifeStagePt: 'Infância',
    functions: ['Structure', 'Lubrication', 'Stability', 'Immunity', 'Growth'],
    functionsPt: ['Estrutura', ' Lubricação', 'Estabilidade', 'Imunidade', 'Crescimento'],
    imbalance: ['Weight gain', 'Congestion', 'Depression', 'Lethargy', 'Mucous accumulation'],
    imbalancePt: ['Ganho de peso', 'Congestão', 'Depressão', 'Letargia', 'Acúmulo de muco'],
    balancePractice: ['Light diet', 'Active exercise', 'Dry brushing', 'Early rising', 'Stimulating herbs'],
    balancePracticePt: ['Dieta leve', 'Exercício ativo', 'Escovação seca', 'Levantar cedo', 'Ervas estimulantes'],
  },
];

const SUBDOSHAS: SubDosha[] = [
  // Vata Subdoshas
  { id: 'prana-vata', doshaId: 'vata', name: 'Prana Vata', namePt: 'Prana Vata', location: 'Head, chest', locationPt: 'Cabeça, peito', functions: ['Respiration', 'Swallowing', 'Mental function'], functionsPt: ['Respiração', 'Deglutição', 'Função mental'], associatedOrgan: 'Brain', associatedOrganPt: 'Cérebro' },
  { id: 'udana-vata', doshaId: 'vata', name: 'Udana Vata', namePt: 'Udana Vata', location: 'Throat, chest', locationPt: 'Garganta, peito', functions: ['Speech', 'Exhalation', 'Enthusiasm'], functionsPt: ['Fala', 'Exalação', 'Entusiasmo'], associatedOrgan: 'Throat', associatedOrganPt: 'Garganta' },
  { id: 'samana-vata', doshaId: 'vata', name: 'Samana Vata', namePt: 'Samana Vata', location: 'Stomach, small intestine', locationPt: 'Estômago, intestino delgado', functions: ['Digestion', 'Nutrient absorption', 'Peristalsis'], functionsPt: ['Digestão', 'Absorção de nutrientes', 'Peristaltismo'], associatedOrgan: 'Intestines', associatedOrganPt: 'Intestinos' },
  { id: 'apana-vata', doshaId: 'vata', name: 'Apana Vata', namePt: 'Apana Vata', location: 'Colon, pelvis', locationPt: 'Cólon, pelve', functions: ['Elimination', 'Menstruation', 'Urination'], functionsPt: ['Eliminação', 'Menstruação', 'Urinção'], associatedOrgan: 'Colon', associatedOrganPt: 'Cólon' },
  { id: 'vyana-vata', doshaId: 'vata', name: 'Vyana Vata', namePt: 'Vyana Vata', location: 'Whole body', locationPt: 'Corpo inteiro', functions: ['Circulation', 'Perspiration', 'Muscular movement'], functionsPt: ['Circulação', 'Transpiração', 'Movimento muscular'], associatedOrgan: 'Heart', associatedOrganPt: 'Coração' },
  // Pitta Subdoshas
  { id: 'pachaka-pitta', doshaId: 'pitta', name: 'Pachaka Pitta', namePt: 'Pachaka Pitta', location: 'Stomach, small intestine', locationPt: 'Estômago, intestino delgado', functions: ['Digestive fire', 'Enzyme secretion', 'Acid balance'], functionsPt: ['Fogo digestivo', 'Secreção de enzimas', 'Equilíbrio ácido'], associatedOrgan: 'Stomach', associatedOrganPt: 'Estômago' },
  { id: 'ranjaka-pitta', doshaId: 'pitta', name: 'Ranjaka Pitta', namePt: 'Ranjaka Pitta', location: 'Liver, spleen, stomach', locationPt: 'Fígado, baço, estômago', functions: ['RBC production', 'Bile secretion', 'Blood color'], functionsPt: ['Produção de hemácias', 'Secreção de bile', 'Cor do sangue'], associatedOrgan: 'Liver', associatedOrganPt: 'Fígado' },
  { id: 'sadhaka-pitta', doshaId: 'pitta', name: 'Sadhaka Pitta', namePt: 'Sadhaka Pitta', location: 'Heart, brain', locationPt: 'Coração, cérebro', functions: ['Emotions', 'Courage', 'Memory'], functionsPt: ['Emoções', 'Coragem', 'Memória'], associatedOrgan: 'Heart', associatedOrganPt: 'Coração' },
  { id: 'alochaka-pitta', doshaId: 'pitta', name: 'Alochaka Pitta', namePt: 'Alochaka Pitta', location: 'Eyes', locationPt: 'Olhos', functions: ['Visual perception', 'Light processing'], functionsPt: ['Percepção visual', 'Processamento de luz'], associatedOrgan: 'Eyes', associatedOrganPt: 'Olhos' },
  { id: 'bhrajaka-pitta', doshaId: 'pitta', name: 'Bhrajaka Pitta', namePt: 'Bhrajaka Pitta', location: 'Skin', locationPt: 'Pele', functions: ['Skin luster', 'UV absorption', 'Pigmentation'], functionsPt: ['Brilho da pele', 'Absorção de UV', 'Pigmentação'], associatedOrgan: 'Skin', associatedOrganPt: 'Pele' },
  // Kapha Subdoshas
  { id: 'kledaka-kapha', doshaId: 'kapha', name: 'Kledaka Kapha', namePt: 'Kledaka Kapha', location: 'Stomach', locationPt: 'Estômago', functions: ['Mucous lining', 'Digestive moisture', 'Food mixing'], functionsPt: ['Revestimento mucoso', 'Umidade digestiva', 'Mistura de alimentos'], associatedOrgan: 'Stomach', associatedOrganPt: 'Estômago' },
  { id: 'avalambaka-kapha', doshaId: 'kapha', name: 'Avalambaka Kapha', namePt: 'Avalambaka Kapha', location: 'Chest, heart', locationPt: 'Peito, coração', functions: ['Heart support', 'Respiratory lubrication', 'Strength'], functionsPt: ['Apoio cardíaco', 'Lubrificação respiratória', 'Força'], associatedOrgan: 'Heart', associatedOrganPt: 'Coração' },
  { id: 'tarpaka-kapha', doshaId: 'kapha', name: 'Tarpaka Kapha', namePt: 'Tarpaka Kapha', location: 'Head, sinuses', locationPt: 'Cabeça, seios nasais', functions: ['Brain lubrication', 'Memory storage', 'Cerebrospinal fluid'], functionsPt: ['Lubrificação cerebral', 'Armazenamento de memória', 'Líquido cerebrospinal'], associatedOrgan: 'Brain', associatedOrganPt: 'Cérebro' },
  { id: 'bodhaka-kapha', doshaId: 'kapha', name: 'Bodhaka Kapha', namePt: 'Bodhaka Kapha', location: 'Mouth, tongue', locationPt: 'Boca, língua', functions: ['Taste perception', 'Saliva secretion', 'Mouth lubrication'], functionsPt: ['Percepção de gosto', 'Secreção de saliva', 'Lubrificação oral'], associatedOrgan: 'Tongue', associatedOrganPt: 'Língua' },
  { id: 'shleshaka-kapha', doshaId: 'kapha', name: 'Shleshaka Kapha', namePt: 'Shleshaka Kapha', location: 'Joints', locationPt: 'Articulações', functions: ['Joint lubrication', 'Synovial fluid', 'Mobility'], functionsPt: ['Lubrificação articular', 'Fluido sinovial', 'Mobilidade'], associatedOrgan: 'Joints', associatedOrganPt: 'Articulações' },
];

const GUNAS: Guna[] = [
  { id: 'sattva', name: 'Sattva', namePt: 'Sattva', description: 'Pure consciousness, clarity, harmony', descriptionPt: 'Consciência pura, clareza, harmonia', qualities: ['Clarity', 'Purity', 'Balance', 'Light', 'Intelligence'], qualitiesPt: ['Clareza', 'Pureza', 'Equilíbrio', 'Luz', 'Inteligência'], effect: 'increasing', effectPt: 'Aumentando' },
  { id: 'rajas', name: 'Rajas', namePt: 'Rajas', description: 'Activity, passion, dynamism', descriptionPt: 'Atividade, paixão, dinamismo', qualities: ['Activity', 'Restlessness', 'Passion', 'Change', 'Ambition'], qualitiesPt: ['Atividade', 'Inquietação', 'Paixão', 'Mudança', 'Ambição'], effect: 'increasing', effectPt: 'Aumentando' },
  { id: 'tamas', name: 'Tamas', namePt: 'Tamas', description: 'Inertia, darkness, ignorance', descriptionPt: 'Inércia, escuridão, ignorância', qualities: ['Inertia', 'Darkness', 'Dullness', 'Resistance', 'Grossness'], qualitiesPt: ['Inércia', 'Escuridão', 'Torpor', 'Resistência', 'Grossura'], effect: 'decreasing', effectPt: 'Diminuindo' },
];

const DHATUS: Dhatu[] = [
  { id: 'rasa', name: 'Rasa', namePt: 'Rasa', sequence: 1, functions: ['Nutrition', 'Plasma', 'Lymph'], functionsPt: ['Nutrição', 'Plasma', 'Linfático'], wasteProduct: 'Mucus', wasteProductPt: 'Muco', upaDhatu: 'Breast milk, Menstrual blood', upaDhatuPt: 'Leite materno, Sangue menstrual' },
  { id: 'rakta', name: 'Rakta', namePt: 'Rakta', sequence: 2, functions: ['Oxygenation', 'Vitality', 'Blood quality'], functionsPt: ['Oxigenação', 'Vitalidade', 'Qualidade do sangue'], wasteProduct: 'Bile', wasteProductPt: 'Bile', upaDhatu: 'Blood vessels, Tendons', upaDhatuPt: 'Vasos sanguíneos, Tendões' },
  { id: 'mamsa', name: 'Mamsa', namePt: 'Mamsa', sequence: 3, functions: ['Muscle', 'Covering', 'Strength'], functionsPt: ['Músculo', 'Cobertura', 'Força'], wasteProduct: 'Mucus', wasteProductPt: 'Muco', upaDhatu: 'Ligaments, Skin', upaDhatuPt: 'Ligamentos, Pele' },
  { id: 'meda', name: 'Meda', namePt: 'Meda', sequence: 4, functions: ['Fat', 'Lubrication', 'Energy storage'], functionsPt: ['Gordura', 'Lubrificação', 'Acúmulo de energia'], wasteProduct: 'Sweat', wasteProductPt: 'Suor', upaDhatu: 'Omentum, Fat pads', upaDhatuPt: 'Omento, Almofadas de gordura' },
  { id: 'asthi', name: 'Asthi', namePt: 'Asthi', sequence: 5, functions: ['Bone', 'Structure', 'Teeth'], functionsPt: ['Osso', 'Estrutura', 'Dentes'], wasteProduct: 'Nails', wasteProductPt: 'Unhas', upaDhatu: 'Hair, Teeth enamel', upaDhatuPt: 'Cabelo, Esmalte dos dentes' },
  { id: 'majja', name: 'Majja', namePt: 'Majja', sequence: 6, functions: ['Bone marrow', 'Nervous system', 'Immunity'], functionsPt: ['Medula óssea', 'Sistema nervoso', 'Imunidade'], wasteProduct: 'None', wasteProductPt: 'Nenhum', upaDhatu: 'Marrow channels', upaDhatuPt: 'Canais de medula' },
  { id: 'shukra', name: 'Shukra', namePt: 'Shukra', sequence: 7, functions: ['Reproductive tissue', 'Ojas', 'Vitality'], functionsPt: ['Tecido reprodutivo', 'Ojas', 'Vitalidade'], wasteProduct: 'Sexual fluids', wasteProductPt: 'Fluidos sexuais', upaDhatu: 'Semen, Ovum', upaDhatuPt: 'Sêmen, Óvulo' },
];

const SROTAS: Srotas[] = [
  { id: 'prana-vaha', name: 'Prana Vaha Srotas', namePt: 'Srotas Prana Vaha', type: 'Inwardmoving', typePt: 'Movimento interno', origin: 'Heart', originPt: 'Coração', channel: 'Respiratory tract', channelPt: 'Trato respiratório', function: 'Air intake, Vital energy', functionPt: 'Captação de ar, Energia vital', doshaAssociation: ['vata'] },
  { id: 'udana-vaha', name: 'Udana Vaha Srotas', namePt: 'Srotas Udana Vaha', type: 'Outwardmoving', typePt: 'Movimento externo', origin: 'Lungs, Throat', originPt: 'Pulmões, Garganta', channel: 'Respiratory tract', channelPt: 'Trato respiratório', function: 'Speech, Exhalation', functionPt: 'Fala, Exalação', doshaAssociation: ['vata'] },
  { id: 'anna-vaha', name: 'Anna Vaha Srotas', namePt: 'Srotas Anna Vaha', type: 'Food channel', typePt: 'Canal de alimentos', origin: 'Stomach', originPt: 'Estômago', channel: 'GI tract', channelPt: 'Trato GI', function: 'Food transport', functionPt: 'Transporte de alimentos', doshaAssociation: ['vata', 'pitta'] },
  { id: 'jala-vaha', name: 'Jala Vaha Srotas', namePt: 'Srotas Jala Vaha', type: 'Water channel', typePt: 'Canal de água', origin: 'Stomach', originPt: 'Estômago', channel: 'Water distribution', channelPt: 'Distribuição de água', function: 'Water balance', functionPt: 'Equilíbrio hídrico', doshaAssociation: ['kapha'] },
  { id: 'rasa-vaha', name: 'Rasa Vaha Srotas', namePt: 'Srotas Rasa Vaha', type: 'Nutrient channel', typePt: 'Canal de nutrientes', origin: 'Heart', originPt: 'Coração', channel: 'Circulatory system', channelPt: 'Sistema circulatório', function: 'Plasma distribution', functionPt: 'Distribuição de plasma', doshaAssociation: ['vata', 'kapha'] },
  { id: 'rakta-vaha', name: 'Rakta Vaha Srotas', namePt: 'Srotas Rikta Vaha', type: 'Blood channel', typePt: 'Canal de sangue', origin: 'Liver, Spleen', originPt: 'Fígado, Baço', channel: 'Blood vessels', channelPt: 'Vasos sanguíneos', function: 'Blood circulation', functionPt: 'Circulação sanguínea', doshaAssociation: ['pitta'] },
  { id: 'mamsa-vaha', name: 'Mamsa Vaha Srotas', namePt: 'Srotas Mamsa Vaha', type: 'Muscle channel', typePt: 'Canal muscular', origin: 'Skin, Muscle', originPt: 'Pele, Músculo', channel: 'Muscle tissue', channelPt: 'Tecido muscular', function: 'Muscle nutrition', functionPt: 'Nutrição muscular', doshaAssociation: ['kapha'] },
  { id: 'meda-vaha', name: 'Meda Vaha Srotas', namePt: 'Srotas Meda Vaha', type: 'Fat channel', typePt: 'Canal de gordura', origin: 'Omentum, Fat tissue', originPt: 'Omento, Tecido adiposo', channel: 'Fat distribution', channelPt: 'Distribuição de gordura', function: 'Fat metabolism', functionPt: 'Metabolismo de gordura', doshaAssociation: ['kapha'] },
  { id: 'asthi-vaha', name: 'Asthi Vaha Srotas', namePt: 'Srotas Asthi Vaha', type: 'Bone channel', typePt: 'Canal ósseo', origin: 'Joints, Teeth', originPt: 'Articulações, Dentes', channel: 'Skeletal system', channelPt: 'Sistema esquelético', function: 'Bone formation', functionPt: 'Formação óssea', doshaAssociation: ['vata'] },
  { id: 'majja-vaha', name: 'Majja Vaha Srotas', namePt: 'Srotas Majja Vaha', type: 'Marrow channel', typePt: 'Canal de medula', origin: 'Bones', originPt: 'Ossos', channel: 'Nervous system', channelPt: 'Sistema nervoso', function: 'Marrow nourishment', functionPt: 'Nutrição da medula', doshaAssociation: ['vata', 'kapha'] },
  { id: 'shukra-vaha', name: 'Shukra Vaha Srotas', namePt: 'Srotas Shukra Vaha', type: 'Reproductive channel', typePt: 'Canal reprodutivo', origin: 'Reproductive organs', originPt: 'Órgãos reprodutivos', channel: 'Reproductive system', channelPt: 'Sistema reprodutivo', function: 'Reproductive tissue', functionPt: 'Tecido reprodutivo', doshaAssociation: ['kapha'] },
  { id: 'purishavaha', name: 'Purisha Vaha Srotas', namePt: 'Srotas Purisha Vaha', type: 'Fecal channel', typePt: 'Canal fecal', origin: 'Colon', originPt: 'Cólon', channel: 'Large intestine', channelPt: 'Intestino grosso', function: 'Feces formation', functionPt: 'Formação de fezes', doshaAssociation: ['vata'] },
  { id: 'mutravaha', name: 'Mutra Vaha Srotas', namePt: 'Srotas Mutra Vaha', type: 'Urinary channel', typePt: 'Canal urinário', origin: 'Kidneys, Bladder', originPt: 'Rins, Bexiga', channel: 'Urinary system', channelPt: 'Sistema urinário', function: 'Urine formation', functionPt: 'Formação de urina', doshaAssociation: ['vata'] },
  { id: 'swedavaha', name: 'Sweda Vaha Srotas', namePt: 'Srotas Sweda Vaha', type: 'Sweat channel', typePt: 'Canal de suor', origin: 'Skin', originPt: 'Pele', channel: 'Sweat glands', channelPt: 'Glândulas sudoríparas', function: 'Sweat production', functionPt: 'Produção de suor', doshaAssociation: ['pitta'] },
  { id: 'manovaha', name: 'Mano Vaha Srotas', namePt: 'Srotas Mano Vaha', type: 'Mental channel', typePt: 'Canal mental', origin: 'Mind', originPt: 'Mente', channel: 'Nervous system', channelPt: 'Sistema nervoso', function: 'Thought processing', functionPt: 'Processamento de pensamentos', doshaAssociation: ['vata', 'pitta'] },
];

const PRAKRITIS: Prakriti[] = [
  {
    id: 'vata-prakriti',
    name: 'Vata Prakriti',
    namePt: 'Prakriti Vata',
    description: 'Individual with Vata dominant constitution',
    descriptionPt: 'Indivíduo com constituição dominante Vata',
    characteristics: ['Thin body frame', 'Dry skin', 'Cold hands/feet', 'Variable appetite', 'Quick mind', 'Creative', 'Anxious tendency', 'Light sleeper'],
    characteristicsPt: ['Estrutura corporal magra', 'Pele seca', 'Mãos/pés frios', 'Apetite variável', 'Mente rápida', 'Criativo', 'Tendência à ansiedade', 'Sono leve'],
    strongOrgans: ['Nervous system', 'Creativity', 'Movement'],
    strongOrgansPt: ['Sistema nervoso', 'Criatividade', 'Movimento'],
    weakOrgans: ['Digestion', 'Joint lubrication', 'Skin hydration'],
    weakOrgansPt: ['Digestão', 'Lubrificação articular', 'Hidratação da pele'],
    idealDiet: 'Warm, moist, grounding foods, soups, stews, oils',
    idealDietPt: 'Alimentos quentes, úmidos e aterrorizantes, sopas, ensopados, óleos',
    recommendedPractice: ['Abhyanga oil massage', 'Yoga Nidra', 'Meditation', 'Warm routines', 'Adequate sleep'],
    recommendedPracticePt: ['Massagem com óleo Abhyanga', 'Yoga Nidra', 'Meditação', 'Rotinas quentes', 'Sono adequado'],
  },
  {
    id: 'pitta-prakriti',
    name: 'Pitta Prakriti',
    namePt: 'Prakriti Pitta',
    description: 'Individual with Pitta dominant constitution',
    descriptionPt: 'Indivíduo com constituição dominante Pitta',
    characteristics: ['Medium body frame', 'Warm body temperature', 'Strong digestion', 'Sharp appetite', 'Focused mind', 'Ambitious', 'Competitive', 'Hair prone to graying'],
    characteristicsPt: ['Estrutura corporal média', 'Temperatura corporal quente', 'Digestão forte', 'Apetite aguçado', 'Mente focada', 'Ambicioso', 'Competitivo', 'Cabelo propenso a grisalhos'],
    strongOrgans: ['Digestive fire', 'Vision', 'Metabolism'],
    strongOrgansPt: ['Fogo digestivo', 'Visão', 'Metabolismo'],
    weakOrgans: ['Skin', 'Liver', 'Temperature regulation'],
    weakOrgansPt: ['Pele', 'Fígado', 'Regulação térmica'],
    idealDiet: 'Cool, refreshing foods, salads, fruits, ghee',
    idealDietPt: 'Alimentos frios e refreshivos, saladas, frutas, ghee',
    recommendedPractice: ['Cool pranayama', 'Moonlit walks', 'Swimming', 'Creative expression', 'Non-competitive exercise'],
    recommendedPracticePt: ['Pranayama fresco', 'Caminhadas à luz da lua', 'Natação', 'Expressão criativa', 'Exercício não competitivo'],
  },
  {
    id: 'kapha-prakriti',
    name: 'Kapha Prakriti',
    namePt: 'Prakriti Kapha',
    description: 'Individual with Kapha dominant constitution',
    descriptionPt: 'Indivíduo com constituição dominante Kapha',
    characteristics: ['Large body frame', 'Smooth skin', 'Cold body temperature', 'Steady appetite', 'Calm mind', 'Patient', 'Good memory', 'Deep sleeper'],
    characteristicsPt: ['Estrutura corporal grande', 'Pele lisa', 'Temperatura corporal fria', 'Apetite constante', 'Mente calma', 'Paciente', 'Boa memória', 'Sono profundo'],
    strongOrgans: ['Structure', 'Immunity', 'Endurance', 'Joint strength'],
    strongOrgansPt: ['Estrutura', 'Imunidade', 'Resistência', 'Força articular'],
    weakOrgans: ['Metabolism', 'Lungs', 'Circulation'],
    weakOrgansPt: ['Metabolismo', 'Pulmões', 'Circulação'],
    idealDiet: 'Light, dry, warm foods, legumes, leafy greens, spices',
    idealDietPt: 'Alimentos leves, secos e quentes, leguminosas, folhas verdes, especiarias',
    recommendedPractice: ['Dynamic yoga', 'Cardio exercise', 'Early rising', 'Stimulating herbs', 'Variety in routine'],
    recommendedPracticePt: ['Yoga dinâmico', 'Exercício cardiovascular', 'Levantar cedo', 'Ervas estimulantes', 'Variedade na rotina'],
  },
  {
    id: 'vata-pitta-prakriti',
    name: 'Vata-Pitta Prakriti',
    namePt: 'Prakriti Vata-Pitta',
    description: 'Dual constitution with Vata and Pitta dominance',
    descriptionPt: 'Constituição dual com dominância Vata e Pitta',
    characteristics: ['Medium-thin frame', 'Dry skin with warmth', 'Variable digestion', 'Active mind', 'Creative and analytical', 'Intense', 'Prone to both anxiety and irritability'],
    characteristicsPt: ['Estrutura média-magra', 'Pele seca com calor', 'Digestão variável', 'Mente ativa', 'Criativo e analítico', 'Intenso', 'Propenso a ansiedade e irritabilidade'],
    strongOrgans: ['Creativity', 'Intellect', 'Digestive intelligence'],
    strongOrgansPt: ['Criatividade', 'Intelecto', 'Inteligência digestiva'],
    weakOrgans: ['Skin', 'Nerves', 'Inflammation balance'],
    weakOrgansPt: ['Pele', 'Nervos', 'Equilíbrio inflamatório'],
    idealDiet: 'Balanced warm-cool foods, both nourishing and light',
    idealDietPt: 'Alimentos quentes-frios balanceados, nutritivos e leves',
    recommendedPractice: ['Gentle yoga', 'Meditation', 'Balanced routine', 'Mindful eating', 'Moderate exercise'],
    recommendedPracticePt: ['Yoga gentil', 'Meditação', 'Rotina balanceada', 'Alimentação consciente', 'Exercício moderado'],
  },
  {
    id: 'pitta-kapha-prakriti',
    name: 'Pitta-Kapha Prakriti',
    namePt: 'Prakriti Pitta-Kapha',
    description: 'Dual constitution with Pitta and Kapha dominance',
    descriptionPt: 'Constituição dual com dominância Pitta e Kapha',
    characteristics: ['Medium-large frame', 'Smooth skin with warmth', 'Strong digestion', 'Steady energy', 'Warm and grounded', 'Enduring', 'Prone to both heat and congestion'],
    characteristicsPt: ['Estrutura média-grande', 'Pele lisa com calor', 'Digestão forte', 'Energia constante', 'Quente e aterrorizado', 'Resistente', 'Propenso a calor e congestão'],
    strongOrgans: ['Metabolism', 'Endurance', 'Structure'],
    strongOrgansPt: ['Metabolismo', 'Resistência', 'Estrutura'],
    weakOrgans: ['Weight management', 'Inflammation response', 'Fluid balance'],
    weakOrgansPt: ['Controle de peso', 'Resposta inflamatória', 'Equilíbrio de fluidos'],
    idealDiet: 'Light warming foods, avoid both excessive heat and heaviness',
    idealDietPt: 'Alimentos leves e aquecidos, evitar excesso de calor e peso',
    recommendedPractice: ['Moderate exercise', 'Cooling pranayama', 'Varied routine', 'Seasonal cleansing', 'Mindful rest'],
    recommendedPracticePt: ['Exercício moderado', 'Pranayama refrescante', 'Rotina variada', 'Purificação sazonal', 'Descanso consciente'],
  },
  {
    id: 'vata-kapha-prakriti',
    name: 'Vata-Kapha Prakriti',
    namePt: 'Prakriti Vata-Kapha',
    description: 'Dual constitution with Vata and Kapha dominance',
    descriptionPt: 'Constituição dual com dominância Vata e Kapha',
    characteristics: ['Variable frame', 'Dry skin with thickness', 'Variable digestion', 'Contrasting energy swings', 'Adaptive', 'Prone to both anxiety and congestion'],
    characteristicsPt: ['Estrutura variável', 'Pele seca com espessura', 'Digestão variável', 'Oscilações de energia contrastantes', 'Adaptável', 'Propenso a ansiedade e congestão'],
    strongOrgans: ['Adaptability', 'Flexibility', 'Resilience'],
    strongOrgansPt: ['Adaptabilidade', 'Flexibilidade', 'Resiliência'],
    weakOrgans: ['Stable digestion', 'Mucus balance', 'Weight stability'],
    weakOrgansPt: ['Digestão estável', 'Equilíbrio de muco', 'Estabilidade de peso'],
    idealDiet: 'Moderately warm and moist foods, avoid extreme dryness or heaviness',
    idealDietPt: 'Alimentos moderadamente quentes e úmidos, evitar secura ou peso extremos',
    recommendedPractice: ['Regular routine', 'Balanced yoga', 'Steady rhythm', 'Earth connection', 'Grounding practices'],
    recommendedPracticePt: ['Rotina regular', 'Yoga balanceado', 'Ritmo constante', 'Conexão com a terra', 'Práticas aterrorizantes'],
  },
  {
    id: 'tridoshic-prakriti',
    name: 'Tridoshic Prakriti',
    namePt: 'Prakriti Tridósica',
    description: 'Rare triple constitution with all three doshas',
    descriptionPt: 'Constituição tripla rara com os três doshas',
    characteristics: ['Balanced symmetrical frame', 'Versatile physiology', 'Adaptable digestion', 'Highly adaptable', 'Resourceful', 'Complex nature'],
    characteristicsPt: ['Estrutura simétrica balanceada', 'Fisiologia versátil', 'Digestão adaptável', 'Altamente adaptável', 'Engenhoso', 'Natureza complexa'],
    strongOrgans: ['Overall balance', 'Adaptive capacity', 'Versatility'],
    strongOrgansPt: ['Equilíbrio geral', 'Capacidade adaptativa', 'Versatilidade'],
    weakOrgans: ['May lack focus in any single area', 'Difficult to understand deeply'],
    weakOrgansPt: ['Pode carecer de foco em qualquer área única', 'Difícil de compreender profundamente'],
    idealDiet: 'Seasonal adaptation, listen to body signals, maintain doshic balance',
    idealDietPt: 'Adaptação sazonal, ouvir sinais do corpo, manter equilíbrio doshas',
    recommendedPractice: ['Seasonal routines', 'Mindful awareness', 'Sattvic lifestyle', 'Regular detox', 'Consultation with practitioner'],
    recommendedPracticePt: ['Rotinas sazonais', 'Consciência atenta', 'Estilo de vida sátvico', 'Desintoxicação regular', 'Consulta com profissional'],
  },
];

const HERBS: Herb[] = [
  { id: 'ashwagandha', name: 'Ashwagandha', namePt: 'Ashwagandha', sanskritName: 'Ashvagandha', botanicalName: 'Withania somnifera', doshaEffect: ['vata', 'pitta'], doshaEffectPt: ['Vata', 'Pitta'], qualities: ['Sweet', 'Bitter', 'Light', 'Hot'], qualitiesPt: ['Doce', 'Amargo', 'Leve', 'Quente'], uses: ['Adaptogen', 'Energy', 'Sleep', 'Stress'], usesPt: ['Adaptógeno', 'Energia', 'Sono', 'Estresse'], preparation: 'Root powder 1-3g daily, or decoction', preparationPt: 'Pó de raiz 1-3g diário, ou decocção', caution: 'Avoid during pregnancy, may cause drowsiness', cautionPt: 'Evitar durante gravidez, pode causar sonolência' },
  { id: 'triphala', name: 'Triphala', namePt: 'Triphala', sanskritName: 'Triphala', botanicalName: 'Emblica officinalis + Terminalia chebula + Termin', doshaEffect: ['vata', 'pitta', 'kapha'], doshaEffectPt: ['Vata', 'Pitta', 'Kapha'], qualities: ['Sweet', 'Sour', 'Bitter', 'Astringent'], qualitiesPt: ['Doce', 'Azedo', 'Amargo', 'Adstringente'], uses: ['Digestion', 'Gentle laxative', 'Antioxidant', 'Eye health'], usesPt: ['Digestão', 'Laxante suave', 'Antioxidante', 'Saúde ocular'], preparation: 'Powder 1-3g before bed, or tablet', preparationPt: 'Pó 1-3g antes de dormir, ou comprimido', caution: 'May be too purgative for weak digestion', cautionPt: 'Pode ser purgativo demais para digestão fraca' },
  { id: 'turmeric', name: 'Turmeric', namePt: 'Açafrão-da-terra', sanskritName: 'Haridra', botanicalName: 'Curcuma longa', doshaEffect: ['vata', 'pitta', 'kapha'], doshaEffectPt: ['Vata', 'Pitta', 'Kapha'], qualities: ['Bitter', 'Pungent', 'Astringent', 'Hot'], qualitiesPt: ['Amargo', 'Picante', 'Adstringente', 'Quente'], uses: ['Anti-inflammatory', 'Skin health', 'Liver support', 'Immunity'], usesPt: ['Anti-inflamatório', 'Saúde da pele', 'Apoio hepático', 'Imunidade'], preparation: '1/2 tsp with warm milk or food', preparationPt: '1/2 colher de chá com leite quente ou comida', caution: 'May be heating in excess, gallbladder issues caution', cautionPt: 'Pode ser aquecido em excesso, cautela com problemas de vesícula' },
  { id: 'shatavari', name: 'Shatavari', namePt: 'Shatavari', sanskritName: 'Shatavari', botanicalName: 'Asparagus racemosus', doshaEffect: ['vata', 'pitta'], doshaEffectPt: ['Vata', 'Pitta'], qualities: ['Sweet', 'Bitter', 'Cooling'], qualitiesPt: ['Doce', 'Amargo', 'Refrescante'], uses: ['Female reproductive', 'Hydration', 'Lactation', 'Digestion'], usesPt: ['Reprodutivo feminino', 'Hidratação', 'Lactação', 'Digestão'], preparation: 'Powder 1-3g or tablets, with milk', preparationPt: 'Pó 1-3g ou comprimidos, com leite', caution: 'May increase kapha, breast tenderness', cautionPt: 'Pode aumentar kapha, sensibilidade mamária' },
  { id: 'brahmi', name: 'Brahmi', namePt: 'Brahmi', sanskritName: 'Brahmi', botanicalName: 'Bacopa monnieri', doshaEffect: ['vata', 'pitta'], doshaEffectPt: ['Vata', 'Pitta'], qualities: ['Bitter', 'Sweet', 'Cooling'], qualitiesPt: ['Amargo', 'Doce', 'Refrescante'], uses: ['Memory', 'Nerves', 'Meditation aid', 'Skin'], usesPt: ['Memória', 'Nervos', 'Auxiliar à meditação', 'Pele'], preparation: 'Powder 1-2g or liquid extract', preparationPt: 'Pó 1-2g ou extrato líquido', caution: 'May cause digestive slowdown in excess', cautionPt: 'Pode causar lentidão digestiva em excesso' },
  { id: 'ginger', name: 'Fresh Ginger', namePt: 'Gengibre fresco', sanskritName: 'Ardraka', botanicalName: 'Zingiber officinale', doshaEffect: ['vata', 'kapha'], doshaEffectPt: ['Vata', 'Kapha'], qualities: ['Pungent', 'Sweet', 'Hot', 'Heavy'], qualitiesPt: ['Picante', 'Doce', 'Quente', 'Pesado'], uses: ['Digestion', 'Nausea', 'Respiratory', 'Circulation'], usesPt: ['Digestão', 'Náusea', 'Respiratório', 'Circulação'], preparation: 'Fresh root 1-3g, or powder, or tea', preparationPt: 'Raiz fresca 1-3g, ou pó, ou chá', caution: 'May aggravate pitta, heartburn', cautionPt: 'Pode agravar pitta, azia' },
  { id: 'amla', name: 'Amla', namePt: 'Amla', sanskritName: 'Amalaki', botanicalName: 'Emblica officinalis', doshaEffect: ['vata', 'pitta', 'kapha'], doshaEffectPt: ['Vata', 'Pitta', 'Kapha'], qualities: ['Sour', 'Sweet', 'Bitter', 'Cooling'], qualitiesPt: ['Azedo', 'Doce', 'Amargo', 'Refrescante'], uses: ['Vitamin C source', 'Antioxidant', 'Hair/skin', 'Liver'], usesPt: ['Fonte deVitamina C', 'Antioxidante', 'Cabelo/pele', 'Fígado'], preparation: 'Fresh fruit, powder, or preserve', preparationPt: 'Fruta fresca, pó, ou conservado', caution: 'May weaken teeth if chewed excessively', cautionPt: 'Pode debilitar dentes se mastigado em excesso' },
  { id: 'cinnamon', name: 'Cinnamon', namePt: 'Canela', sanskritName: 'Twak', botanicalName: 'Cinnamomum verum', doshaEffect: ['vata', 'kapha'], doshaEffectPt: ['Vata', 'Kapha'], qualities: ['Pungent', 'Sweet', 'Hot', 'Light'], qualitiesPt: ['Picante', 'Doce', 'Quente', 'Leve'], uses: ['Metabolism', 'Blood sugar', 'Circulation', 'Respiratory'], usesPt: ['Metabolismo', 'Açúcar no sangue', 'Circulação', 'Respiratório'], preparation: 'Powder 1/4-1/2 tsp, or stick tea', preparationPt: 'Pó 1/4-1/2 colher de chá, ou chá de bastão', caution: 'May aggravate pitta, mouth irritation', cautionPt: 'Pode agravar pitta, irritação bucal' },
];

const FORMULATIONS: Formulation[] = [
  { id: 'chyawanprash', name: 'Chyawanprash', namePt: 'Chyawanprash', sanskritName: 'Chyawanprash', ingredients: ['Amla', 'Ghee', 'Honey', 'Herbs', 'Spices', 'Oil'], ingredientsPt: ['Amla', 'Ghee', 'Mel', 'Ervas', 'Especiarias', 'Óleo'], primaryAction: 'Rasayana for immunity and longevity', primaryActionPt: 'Rasayana para imunidade e longevidade', indications: ['Low immunity', 'Respiratory weakness', 'Aging', 'Voice problems'], indicationsPt: ['Imunidade baixa', 'Fraqueza respiratória', 'Envelhecimento', 'Problemas de voz'], dosage: '1-2 tsp daily with milk', dosagePt: '1-2 colheres de chá diárias com leite', contraindication: 'Excess pitta, diabetes, obesity', contraindicationPt: 'Excesso de pitta, diabetes, obesity' },
  { id: 'triphala-churna', name: 'Triphala Churna', namePt: 'Triphala Churna', sanskritName: 'Triphala Choorna', ingredients: ['Amalaki', 'Bibhitaki', 'Haritaki'], ingredientsPt: ['Amalaki', 'Bibhitaki', 'Haritaki'], primaryAction: 'Gentle detoxification and digestion', primaryActionPt: 'Desintoxicação suave e digestão', indications: ['Constipation', 'Poor digestion', 'Eye health', 'Detox'], indicationsPt: ['Constipação', 'Digestão fraca', 'Saúde ocular', 'Desintoxicação'], dosage: '1-3g at bedtime with warm water', dosagePt: '1-3g ao deitar com água quente', contraindication: 'Pregnancy, diarrhea, dehydration', contraindicationPt: 'Gravidez, diarreia, desidratação' },
  { id: 'shirodhara-oil-mix', name: 'Shirodhara Oil Mix', namePt: 'Mistura de Óleo Shirodhara', sanskritName: 'Shirodhara Thailam', ingredients: ['Brahmi', 'Bhringaraj', 'Coconut oil base', 'Herbs'], ingredientsPt: ['Brahmi', 'Bhringaraj', 'Base de óleo de coco', 'Ervas'], primaryAction: 'Calming and grounding for nervous system', primaryActionPt: 'Calmante e aterrorizante para o sistema nervoso', indications: ['Anxiety', 'Insomnia', 'Mental stress', 'Vata imbalance'], indicationsPt: ['Ansiedade', 'Insônia', 'Estresse mental', 'Desequilíbrio vata'], dosage: 'For external Shirodhara treatment only', dosagePt: 'Apenas para tratamento Shirodhara externo', contraindication: 'Scalp infections, head injury', contraindicationPt: 'Infecções no couro cabeludo, lesões na cabeça' },
  { id: 'dashamoolarishta', name: 'Dashamoolarishta', namePt: 'Dashamoolarishta', sanskritName: 'Dashamoolarishta', ingredients: ['Dashamoola', 'Ghee', 'Honey', ' Herbs', 'Water'], ingredientsPt: ['Dashamoola', 'Ghee', 'Mel', 'Ervas', 'Água'], primaryAction: 'Anti-inflammatory, nervous system support', primaryActionPt: 'Anti-inflamatório, apoio ao sistema nervoso', indications: ['Fever', 'Respiratory issues', 'Nervous weakness', 'Edema'], indicationsPt: ['Febre', 'Problemas respiratórios', 'Fraqueza nervosa', 'Edema'], dosage: '10-20ml twice daily after meals', dosagePt: '10-20ml duas vezes ao dia após refeições', contraindication: 'Liver conditions, alcohol sensitivity', contraindicationPt: 'Condições hepáticas, sensibilidade ao álcool' },
  { id: 'arjuna-formula', name: 'Arjuna Heart Formula', namePt: 'Fórmula Cardíaca Arjuna', sanskritName: 'Arjuna Choorna', ingredients: ['Arjuna bark', 'Ghee', 'Cardamom', 'Natural sweetener'], ingredientsPt: ['Casca de Arjuna', 'Gheeij', 'Cardamomo', 'Adoçante natural'], primaryAction: 'Heart tonic, cardiovascular support', primaryActionPt: 'Tônico cardíaco, apoio cardiovascular', indications: ['Heart weakness', 'High blood pressure', 'Stress-related heart issues'], indicationsPt: ['Fraqueza cardíaca', 'Pressão alta', 'Problemas cardíacos relacionados ao estresse'], dosage: '1-2g with milk twice daily', dosagePt: '1-2g com leite duas vezes ao dia', contraindication: 'Very low blood pressure', contraindicationPt: 'Pressão muito baixa' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDoshaById(id: string): Dosha | undefined {
  return DOSHAS.find((d) => d.id === id);
}

function getSubDoshasByDoshaId(doshaId: string): SubDosha[] {
  return SUBDOSHAS.filter((s) => s.doshaId === doshaId);
}

function getGunasByEffect(effect: string): Guna[] {
  return GUNAS.filter((g) => g.effect === effect);
}

function getDhatuById(id: string): Dhatu | undefined {
  return DHATUS.find((d) => d.id === id);
}

function getSrotasByDosha(dosha: string): Srotas[] {
  return SROTAS.filter((s) => s.doshaAssociation.includes(dosha));
}

function getPrakritiById(id: string): Prakriti | undefined {
  return PRAKRITIS.find((p) => p.id === id);
}

function getHerbById(id: string): Herb | undefined {
  return HERBS.find((h) => h.id === id);
}

function getFormulationById(id: string): Formulation | undefined {
  return FORMULATIONS.find((f) => f.id === id);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ayurveda/data
 * Retrieve Ayurveda data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const dosha = searchParams.get('dosha');
    const format = searchParams.get('format');

    // Single resource by ID
    if (id) {
      const resourceType = searchParams.get('resourceType');

      if (!resourceType) {
        return NextResponse.json(
          { error: 'resourceType is required when id is provided' },
          { status: 400 }
        );
      }
      let resource: unknown;
      switch (resourceType) {
        case 'dosha':
          resource = getDoshaById(id);
          break;
        case 'subdosha':
          resource = SUBDOSHAS.find((s) => s.id === id);
          break;
        case 'guna':
          resource = GUNAS.find((g) => g.id === id);
          break;
        case 'dhatu':
          resource = getDhatuById(id);
          break;
        case 'srotas':
          resource = SROTAS.find((s) => s.id === id);
          break;
        case 'prakriti':
          resource = getPrakritiById(id);
          break;
        case 'herb':
          resource = getHerbById(id);
          break;
        case 'formulation':
          resource = getFormulationById(id);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid resourceType', validTypes: ['dosha', 'subdosha', 'guna', 'dhatu', 'srotas', 'prakriti', 'herb', 'formulation'] },
            { status: 400 }
          );
      }

      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found', resourceType, id },
          { status: 404 }
        );
      }

      if (format === 'summary') {
        const summary: Record<string, unknown> = { id: (resource as { id: string }).id };
        const obj = resource as Record<string, unknown>;
        if (obj.name !== undefined) summary.name = obj.name as string;
        if (obj.namePt !== undefined) summary.namePt = obj.namePt as string;
        return NextResponse.json(summary);
      }

      return NextResponse.json(resource);
    }

    // Filter by type
    if (type) {
      switch (type) {
        case 'doshas':
          return NextResponse.json({ type: 'doshas', count: DOSHAS.length, doshas: DOSHAS });
        case 'subdoshas':
          return NextResponse.json({ type: 'subdoshas', count: SUBDOSHAS.length, subdoshas: SUBDOSHAS });
        case 'gunas':
          return NextResponse.json({ type: 'gunas', count: GUNAS.length, gunas: GUNAS });
        case 'dhatus':
          return NextResponse.json({ type: 'dhatus', count: DHATUS.length, dhatus: DHATUS });
        case 'srotas':
          return NextResponse.json({ type: 'srotas', count: SROTAS.length, srotas: SROTAS });
        case 'prakriti':
          return NextResponse.json({ type: 'prakriti', count: PRAKRITIS.length, prakritis: PRAKRITIS });
        case 'herbs':
          return NextResponse.json({ type: 'herbs', count: HERBS.length, herbs: HERBS });
        case 'formulations':
          return NextResponse.json({ type: 'formulations', count: FORMULATIONS.length, formulations: FORMULATIONS });
        default:
          return NextResponse.json(
            { error: 'Invalid type', validTypes: ['doshas', 'subdoshas', 'gunas', 'dhatus', 'srotas', 'prakriti', 'herbs', 'formulations'] },
            { status: 400 }
          );
      }
    }

    // Filter subdoshas by dosha
    if (dosha) {
      if (!['vata', 'pitta', 'kapha'].includes(dosha)) {
        return NextResponse.json(
          { error: 'Invalid dosha parameter', validDoshas: ['vata', 'pitta', 'kapha'] },
          { status: 400 }
        );
      }
      const filtered = getSubDoshasByDoshaId(dosha);
      const doshaInfo = getDoshaById(dosha);
      return NextResponse.json({
        dosha: dosha,
        doshaName: doshaInfo?.namePt,
        subdoshas: filtered,
        count: filtered.length,
      });
    }

    // Filter gunas by effect
    const effect = searchParams.get('effect');
    if (effect) {
      if (!['increasing', 'decreasing'].includes(effect)) {
        return NextResponse.json(
          { error: 'Invalid effect parameter', validEffects: ['increasing', 'decreasing'] },
          { status: 400 }
        );
      }
      const filtered = getGunasByEffect(effect);
      return NextResponse.json({
        effect,
        gunas: filtered,
        count: filtered.length,
      });
    }

    // Filter srotas by dosha
    const srotasDosha = searchParams.get('srotasDosha');
    if (srotasDosha) {
      if (!['vata', 'pitta', 'kapha'].includes(srotasDosha)) {
        return NextResponse.json(
          { error: 'Invalid srotasDosha parameter', validDoshas: ['vata', 'pitta', 'kapha'] },
          { status: 400 }
        );
      }
      const filtered = getSrotasByDosha(srotasDosha);
      return NextResponse.json({
        dosha: srotasDosha,
        srotas: filtered,
        count: filtered.length,
      });
    }

    // Return all Ayurveda data
    return NextResponse.json({
      version: 'v2',
      types: {
        doshas: { count: DOSHAS.length, fields: ['id', 'name', 'namePt', 'element', 'qualities', 'functions', 'imbalance', 'balancePractice'] },
        subdoshas: { count: SUBDOSHAS.length, fields: ['id', 'doshaId', 'name', 'namePt', 'location', 'functions'] },
        gunas: { count: GUNAS.length, fields: ['id', 'name', 'namePt', 'description', 'qualities', 'effect'] },
        dhatus: { count: DHATUS.length, fields: ['id', 'name', 'namePt', 'sequence', 'functions', 'wasteProduct'] },
        srotas: { count: SROTAS.length, fields: ['id', 'name', 'namePt', 'type', 'origin', 'function'] },
        prakriti: { count: PRAKRITIS.length, fields: ['id', 'name', 'namePt', 'description', 'characteristics', 'idealDiet'] },
        herbs: { count: HERBS.length, fields: ['id', 'name', 'namePt', 'botanicalName', 'doshaEffect', 'qualities'] },
        formulations: { count: FORMULATIONS.length, fields: ['id', 'name', 'namePt', 'ingredients', 'primaryAction'] },
      },
      summary: {
        doshas: DOSHAS.length,
        subdoshas: SUBDOSHAS.length,
        gunas: GUNAS.length,
        dhatus: DHATUS.length,
        srotas: SROTAS.length,
        prakriti: PRAKRITIS.length,
        herbs: HERBS.length,
        formulations: FORMULATIONS.length,
      },
    });
  } catch (error) {
    console.error('Ayurveda data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
