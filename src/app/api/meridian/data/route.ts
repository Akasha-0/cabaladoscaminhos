// ============================================================
// MERIDIAN DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for meridian energy pathways
// - List all meridian channels
// - Get specific meridian by ID
// - Get meridian relationships to organs/elements
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface MeridianPoint {
  id: string;
  name: string;
  namePt: string;
  nameZh: string;
  description: string;
  descriptionPt: string;
  location: string;
  function: string;
  element: string;
  organ: string;
  chiDirection: string;
  energyLevel: number;
  properties: string[];
  indications: string[];
  contraindications: string[];
}

interface MeridianChannel {
  id: string;
  name: string;
  namePt: string;
  nameZh: string;
  pathway: string;
  pathwayPt: string;
  startPoint: string;
  endPoint: string;
  element: string;
  organ: string;
  yinYang: 'yin' | 'yang';
  hours: string;
  functions: string[];
  functionsPt: string[];
  relatedChakras: string[];
  balancingPractices: string[];
}

interface MeridianData {
  channels: MeridianChannel[];
  points: MeridianPoint[];
  elementRelationships: Record<string, string[]>;
  organConnections: Record<string, string[]>;
}

// Primary meridian channels (12 standard + 2 extra)
const meridianChannels: MeridianChannel[] = [
  {
    id: 'lung',
    name: 'Lung Meridian',
    namePt: 'Meridiano do Pulmão',
    nameZh: 'Fei',
    pathway: 'Begins at chest, descends arm to thumb',
    pathwayPt: 'Começa no peito, desce pelo braço até o polegar',
    startPoint: 'Zhongfu (LU1)',
    endPoint: 'Shaoshang (LU11)',
    element: 'metal',
    organ: 'Lung',
    yinYang: 'yin',
    hours: '3:00-5:00',
    functions: ['Breathing', 'Energy circulation', 'Immune defense', 'Skin health'],
    functionsPt: ['Respiração', 'Circulação de energia', 'Defesa imunológica', 'Saúde da pele'],
    relatedChakras: ['throat'],
    balancingPractices: ['Deep breathing', 'Qi Gong', 'Kapalabhati'],
  },
  {
    id: 'large-intestine',
    name: 'Large Intestine Meridian',
    namePt: 'Meridiano do Intestino Grosso',
    nameZh: 'Dachang',
    pathway: 'From index finger, up arm, past shoulder, to face',
    pathwayPt: 'Do indicador, sobe pelo braço, passa pelo ombro, até o rosto',
    startPoint: 'Shangyang (LI1)',
    endPoint: 'Yingxiang (LI20)',
    element: 'metal',
    organ: 'Large Intestine',
    yinYang: 'yang',
    hours: '5:00-7:00',
    functions: ['Elimination', 'Waste processing', 'Boundary setting', 'Self-worth'],
    functionsPt: ['Eliminação', 'Processamento de resíduos', 'Definição de limites', 'Autoestima'],
    relatedChakras: ['throat'],
    balancingPractices: ['Hydration', 'Colon cleansing', 'Breathwork'],
  },
  {
    id: 'stomach',
    name: 'Stomach Meridian',
    namePt: 'Meridiano do Estômago',
    nameZh: 'Weichang',
    pathway: 'From eye area, down face, front of body, to foot',
    pathwayPt: 'Da área dos olhos, desce pelo rosto, frente do corpo, até o pé',
    startPoint: 'Chengqi (ST1)',
    endPoint: 'Lidui (ST45)',
    element: 'earth',
    organ: 'Stomach',
    yinYang: 'yang',
    hours: '7:00-9:00',
    functions: ['Digestion', 'Nourishment', 'Grounding', 'Comfort'],
    functionsPt: ['Digestão', 'Nutrição', 'Enraizamento', 'Conforto'],
    relatedChakras: ['sacral'],
    balancingPractices: ['Mindful eating', 'Abdominal breathing', 'Self-care'],
  },
  {
    id: 'spleen',
    name: 'Spleen Meridian',
    namePt: 'Meridiano do Baço',
    nameZh: 'Pi',
    pathway: 'From foot, inner leg, to chest',
    pathwayPt: 'Do pé, perna interna, até o peito',
    startPoint: 'Yinbai (SP1)',
    endPoint: 'Dabao (SP21)',
    element: 'earth',
    organ: 'Spleen',
    yinYang: 'yin',
    hours: '9:00-11:00',
    functions: ['Transformation', 'Transportation', 'Intelligence', 'Circulation'],
    functionsPt: ['Transformação', 'Transporte', 'Inteligência', 'Circulação'],
    relatedChakras: ['sacral', 'solar-plexus'],
    balancingPractices: ['Chew slowly', 'Grounding exercises', 'Nourishing foods'],
  },
  {
    id: 'heart',
    name: 'Heart Meridian',
    namePt: 'Meridiano do Coração',
    nameZh: 'Xin',
    pathway: 'From heart, under arm, to little finger',
    pathwayPt: 'Do coração, sob o braço, até o mindinho',
    startPoint: 'Jiquan (HT1)',
    endPoint: 'Shaochong (HT9)',
    element: 'fire',
    organ: 'Heart',
    yinYang: 'yin',
    hours: '11:00-13:00',
    functions: ['Circulation', 'Emotions', 'Consciousness', 'Shen (spirit)'],
    functionsPt: ['Circulação', 'Emoções', 'Consciência', 'Shen (espírito)'],
    relatedChakras: ['heart'],
    balancingPractices: ['Gratitude practice', 'Loving-kindness', 'Qigong'],
  },
  {
    id: 'small-intestine',
    name: 'Small Intestine Meridian',
    namePt: 'Meridiano do Intestino Delgado',
    nameZh: 'Xiaochang',
    pathway: 'From hand, up arm, past shoulder, to ear',
    pathwayPt: 'Da mão, sobe pelo braço, passa pelo ombro, até a orelha',
    startPoint: 'Shaozhong (SI1)',
    endPoint: 'Tinggong (SI19)',
    element: 'fire',
    organ: 'Small Intestine',
    yinYang: 'yang',
    hours: '13:00-15:00',
    functions: ['Assimilation', 'Separation', 'Clarity', 'Judgment'],
    functionsPt: ['Assimilação', 'Separação', 'Clareza', 'Julgamento'],
    relatedChakras: ['heart', 'third-eye'],
    balancingPractices: ['Digestive awareness', 'Clarity meditation', 'Sound healing'],
  },
  {
    id: 'bladder',
    name: 'Bladder Meridian',
    namePt: 'Meridiano da Bexiga',
    nameZh: 'Pangguang',
    pathway: 'From inner eye, over head, down back, to foot',
    pathwayPt: 'Do olho interno, sobre a cabeça, desce pelas costas, até o pé',
    startPoint: 'Jingming (BL1)',
    endPoint: 'Zhiyin (BL67)',
    element: 'water',
    organ: 'Bladder',
    yinYang: 'yang',
    hours: '15:00-17:00',
    functions: ['Elimination', 'Storage', 'Willpower', 'Fear processing'],
    functionsPt: ['Eliminação', 'Armazenamento', 'Força de vontade', 'Processamento do medo'],
    relatedChakras: ['root'],
    balancingPractices: ['Water therapy', 'Back stretches', 'Fear release'],
  },
  {
    id: 'kidney',
    name: 'Kidney Meridian',
    namePt: 'Meridiano do Rim',
    nameZh: 'Shen',
    pathway: 'From foot, inner leg, to chest',
    pathwayPt: 'Do pé, perna interna, até o peito',
    startPoint: 'Yongquan (KI1)',
    endPoint: 'Shufu (KI27)',
    element: 'water',
    organ: 'Kidney',
    yinYang: 'yin',
    hours: '17:00-19:00',
    functions: ['Growth', 'Reproduction', 'Ancestral energy', 'Jing (essence)'],
    functionsPt: ['Crescimento', 'Reprodução', 'Energia ancestral', 'Jing (essência)'],
    relatedChakras: ['root', 'sacral'],
    balancingPractices: ['Foot massage', 'Ancestral healing', 'Essence conservation'],
  },
  {
    id: 'pericardium',
    name: 'Pericardium Meridian',
    namePt: 'Meridiano do Pericárdio',
    nameZh: 'Xinbao',
    pathway: 'From chest, inner arm, to middle finger',
    pathwayPt: 'Do peito, braço interno, até o dedo médio',
    startPoint: 'Tianquan (PC1)',
    endPoint: 'Zhongchong (PC9)',
    element: 'fire',
    organ: 'Pericardium',
    yinYang: 'yin',
    hours: '19:00-21:00',
    functions: ['Heart protection', 'Emotional balance', 'Circulation', 'Joy'],
    functionsPt: ['Proteção cardíaca', 'Equilíbrio emocional', 'Circulação', 'Alegria'],
    relatedChakras: ['heart'],
    balancingPractices: ['Self-compassion', 'Emotional release', 'Heart opening'],
  },
  {
    id: 'triple-heater',
    name: 'Triple Heater Meridian',
    namePt: 'Meridiano do Triplo Aquecedor',
    nameZh: 'Sanjiao',
    pathway: 'From ring finger, up arm, past shoulder, to eye',
    pathwayPt: 'Do mindinho, sobe pelo braço, passa pelo ombro, até o olho',
    startPoint: 'Guanchong (TE1)',
    endPoint: 'Sizhukong (TE23)',
    element: 'fire',
    organ: 'Triple Heater',
    yinYang: 'yang',
    hours: '21:00-23:00',
    functions: ['Thermoregulation', 'Metabolism', 'Fluid balance', 'Integration'],
    functionsPt: ['Termorregulação', 'Metabolismo', 'Equilíbrio de fluidos', 'Integração'],
    relatedChakras: ['heart', 'solar-plexus', 'crown'],
    balancingPractices: ['Thermal awareness', 'Metabolic support', 'Integration practices'],
  },
  {
    id: 'gallbladder',
    name: 'Gallbladder Meridian',
    namePt: 'Meridiano da Vesícula Biliar',
    nameZh: 'Dan',
    pathway: 'From eye, over head, down side, to foot',
    pathwayPt: 'Do olho, sobre a cabeça, desce pelo lado, até o pé',
    startPoint: 'Tongziliao (GB1)',
    endPoint: 'Qiaoyin (GB44)',
    element: 'wood',
    organ: 'Gallbladder',
    yinYang: 'yang',
    hours: '23:00-1:00',
    functions: ['Decision making', 'Courage', 'Storage', 'Judgment'],
    functionsPt: ['Tomada de decisão', 'Coragem', 'Armazenamento', 'Julgamento'],
    relatedChakras: ['solar-plexus'],
    balancingPractices: ['Decision practice', 'Courage building', 'Side stretches'],
  },
  {
    id: 'liver',
    name: 'Liver Meridian',
    namePt: 'Meridiano do Fígado',
    nameZh: 'Gan',
    pathway: 'From foot, inner leg, to eye',
    pathwayPt: 'Do pé, perna interna, até o olho',
    startPoint: 'Dadun (LR1)',
    endPoint: 'Qimen (LR14)',
    element: 'wood',
    organ: 'Liver',
    yinYang: 'yin',
    hours: '1:00-3:00',
    functions: ['Planning', 'Vision', 'Detoxification', 'Anger processing'],
    functionsPt: ['Planejamento', 'Visão', 'Desintoxicação', 'Processamento da raiva'],
    relatedChakras: ['solar-plexus', 'third-eye'],
    balancingPractices: ['Eye exercises', 'Anger release', 'Liver detox'],
  },
];

// Key acupuncture/acupressure points
const meridianPoints: MeridianPoint[] = [
  {
    id: 'lung-7',
    name: 'Lieque (Lung 7)',
    namePt: 'Lieque (Pulmão 7)',
    nameZh: '列缺',
    description: 'Master point for head, neck, face; Luo connecting point',
    descriptionPt: 'Ponto mestre para cabeça, pescoço, rosto; ponto de conexão Luo',
    location: 'Wrist, above thumb',
    function: 'Releases exterior, regulates water passages',
    element: 'metal',
    organ: 'Lung',
    chiDirection: 'dispersing',
    energyLevel: 7,
    properties: ['Respiratory relief', 'Headache relief', 'Neck stiffness', 'Facial swelling'],
    indications: ['Headache', 'Neck pain', 'Facial paralysis', 'Cough'],
    contraindications: ['Pregnancy'],
  },
  {
    id: 'heart-7',
    name: 'Shenmen (Heart 7)',
    namePt: 'Shenmen (Coração 7)',
    nameZh: '神门',
    description: 'Sedation point, yuan-source point',
    descriptionPt: 'Ponto de sedação, ponto fonte yuan',
    location: 'Wrist, ulnar side',
    function: 'Calms spirit, clears heart fire',
    element: 'fire',
    organ: 'Heart',
    chiDirection: 'nourishing',
    energyLevel: 7,
    properties: ['Spirit calming', 'Anxiety relief', 'Sleep improvement', 'Heart rhythm'],
    indications: ['Anxiety', 'Insomnia', 'Palpitations', 'Depression'],
    contraindications: ['Pacemaker presence'],
  },
  {
    id: 'kidney-1',
    name: 'Yongquan (Kidney 1)',
    namePt: 'Yongquan (Rim 1)',
    nameZh: '涌泉',
    description: 'Well point, root of yin',
    descriptionPt: 'Ponto de poço, raiz do yin',
    location: 'Sole of foot',
    function: 'Anchors yang, revives consciousness',
    element: 'water',
    organ: 'Kidney',
    chiDirection: 'grounding',
    energyLevel: 1,
    properties: ['Grounding', 'Consciousness revival', 'Dizziness', 'Fainting'],
    indications: ['Dizziness', 'Fainting', 'Low energy', 'Fear'],
    contraindications: ['Pregnancy'],
  },
  {
    id: 'liver-3',
    name: 'Taichong (Liver 3)',
    namePt: 'Taichong (Fígado 3)',
    nameZh: '太冲',
    description: 'Shu-stream point, yuan-source point',
    descriptionPt: 'Ponto shu-stream, ponto fonte yuan',
    location: 'Foot, between big toe and second toe',
    function: 'Subdues liver yang, moves liver qi',
    element: 'wood',
    organ: 'Liver',
    chiDirection: 'moving',
    energyLevel: 3,
    properties: ['Anger management', 'Headache relief', 'Eye health', 'Blood flow'],
    indications: ['Anger', 'Headache', 'Dizziness', 'Menstrual issues'],
    contraindications: ['Pregnancy'],
  },
];

// Element relationships
const elementRelationships: Record<string, string[]> = {
  metal: ['lung', 'large-intestine'],
  earth: ['spleen', 'stomach'],
  fire: ['heart', 'small-intestine', 'pericardium', 'triple-heater'],
  water: ['kidney', 'bladder'],
  wood: ['liver', 'gallbladder'],
};

// Organ connections
const organConnections: Record<string, string[]> = {
  Lung: ['lung', 'large-intestine'],
  'Large Intestine': ['lung', 'large-intestine'],
  Stomach: ['stomach', 'spleen'],
  Spleen: ['stomach', 'spleen'],
  Heart: ['heart', 'small-intestine', 'pericardium'],
  'Small Intestine': ['heart', 'small-intestine'],
  Bladder: ['bladder', 'kidney'],
  Kidney: ['bladder', 'kidney'],
  Pericardium: ['pericardium', 'triple-heater'],
  'Triple Heater': ['pericardium', 'triple-heater'],
  'Gallbladder': ['gallbladder', 'liver'],
  Liver: ['gallbladder', 'liver'],
};

const meridianData: MeridianData = {
  channels: meridianChannels,
  points: meridianPoints,
  elementRelationships,
  organConnections,
};

// GET /api/meridian/data - Get meridian data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Return single meridian channel by ID
    if (id && type === 'channel') {
      const channel = meridianData.channels.find(
        (c) => c.id === id || c.id === id.replace('-intestine', '-intestine')
      );
      if (!channel) {
        return NextResponse.json(
          { success: false, error: 'Meridian channel not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: channel });
    }

    // Return single point by ID
    if (id && type === 'point') {
      const point = meridianData.points.find((p) => p.id === id);
      if (!point) {
        return NextResponse.json(
          { success: false, error: 'Meridian point not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: point });
    }

    // Return meridian channels by element
    if (type === 'element') {
      const element = searchParams.get('element');
      if (!element) {
        return NextResponse.json(
          { success: false, error: 'Element parameter required' },
          { status: 400 }
        );
      }
      const channels = meridianData.channels.filter((c) => c.element === element);
      return NextResponse.json({ success: true, data: channels });
    }

    // Return meridian channels by organ
    if (type === 'organ') {
      const organ = searchParams.get('organ');
      if (!organ) {
        return NextResponse.json(
          { success: false, error: 'Organ parameter required' },
          { status: 400 }
        );
      }
      const channels = meridianData.channels.filter(
        (c) => c.organ.toLowerCase() === organ.toLowerCase()
      );
      return NextResponse.json({ success: true, data: channels });
    }

    // Return channels only
    if (type === 'channels') {
      return NextResponse.json({ success: true, data: meridianData.channels });
    }

    // Return points only
    if (type === 'points') {
      return NextResponse.json({ success: true, data: meridianData.points });
    }

    // Return element relationships
    if (type === 'elements') {
      return NextResponse.json({ success: true, data: meridianData.elementRelationships });
    }

    // Return organ connections
    if (type === 'organs') {
      return NextResponse.json({ success: true, data: meridianData.organConnections });
    }

    // Return all meridian data
    return NextResponse.json({
      success: true,
      data: meridianData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meridian data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}