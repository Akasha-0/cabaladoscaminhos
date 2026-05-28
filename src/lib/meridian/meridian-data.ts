/**
 * Meridian Data - Energy channel information for Cabala dos Caminhos
 */

// Meridian data structure
export interface MeridianData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  element: string;
  organ: string;
  yinYang: 'yin' | 'yang';
  pathway: string;
  color: string;
  colorHex: string;
  functions: string[];
  symptomsImbalance: string[];
  symptomsBalance: string[];
  associatedChakra: string;
  emotion: string;
  physicalLocation: string;
  startingPoint: string;
  endingPoint: string;
  sequence: number;
  description: string;
  descriptionPt: string;
}

// Traditional Chinese Medicine meridian data
const meridianData: MeridianData[] = [
  {
    id: 'lu',
    name: 'Taiyin Fei',
    namePt: 'Pulmão',
    nameEn: 'Lung',
    element: 'metal',
    organ: 'Lung',
    yinYang: 'yin',
    pathway: 'arm',
    color: 'white',
    colorHex: '#E8E8E8',
    functions: [
      'Governs respiration',
      'Controls qi and breath',
      'Regulates water passages',
      'Controls skin and body hair',
      'Assists heart in circulating blood'
    ],
    symptomsImbalance: [
      'Shortness of breath',
      'Cough',
      'Weak voice',
      'Frequent colds',
      'Fatigue'
    ],
    symptomsBalance: [
      'Deep, easy breathing',
      'Strong immune system',
      'Healthy skin',
      'Good energy levels'
    ],
    associatedChakra: 'chakra-throat',
    emotion: 'grief',
    physicalLocation: 'Chest to thumb',
    startingPoint: 'Chest (middle of body)',
    endingPoint: 'Thumb',
    sequence: 1,
    description: 'The Lung meridian governs respiration and qi circulation. It controls the skin and body hair, and assists the heart in circulating blood throughout the body.',
    descriptionPt: 'O meridiano do Pulmão governa a respiração e a circulação de qi. Ele controla a pele e os pelos do corpo, e auxilia o coração na circulação do sangue por todo o corpo.'
  },
  {
    id: 'li',
    name: 'Yangming Dachang',
    namePt: 'Intestino Grosso',
    nameEn: 'Large Intestine',
    element: 'metal',
    organ: 'Large Intestine',
    yinYang: 'yang',
    pathway: 'arm',
    color: 'orange',
    colorHex: '#FFA500',
    functions: [
      'Transports and transforms waste',
      'Absorbs water',
      'Eliminates toxins',
      'Controls skin health',
      'Releases grief'
    ],
    symptomsImbalance: [
      'Constipation',
      'Diarrhea',
      'Skin problems',
      'Nose issues',
      'Breathing difficulties'
    ],
    symptomsBalance: [
      'Regular bowel movements',
      'Clear skin',
      'Healthy breathing',
      'Emotional release'
    ],
    associatedChakra: 'chakra-throat',
    emotion: 'grief',
    physicalLocation: 'Index finger to nose',
    startingPoint: 'Index finger',
    endingPoint: 'Nose',
    sequence: 2,
    description: 'The Large Intestine meridian eliminates waste and toxins. It works closely with the Lung meridian to maintain healthy skin and respiratory function.',
    descriptionPt: 'O meridiano do Intestino Grosso elimina resíduos e toxinas. Trabalha em estreita colaboração com o meridiano do Pulmão para manter a pele saudável e a função respiratória.'
  },
  {
    id: 'st',
    name: 'Yangming Weijing',
    namePt: 'Estômago',
    nameEn: 'Stomach',
    element: 'earth',
    organ: 'Stomach',
    yinYang: 'yang',
    pathway: 'leg',
    color: 'yellow',
    colorHex: '#FFFF00',
    functions: [
      'Receives and digests food',
      'Rots and ripens nutrients',
      'Controls limb movement',
      'Maintains appetite',
      'Supports mental function'
    ],
    symptomsImbalance: [
      'Indigestion',
      'Nausea',
      'Poor appetite',
      'Fatigue after eating',
      'Worry'
    ],
    symptomsBalance: [
      'Good digestion',
      'Healthy appetite',
      'Strong limbs',
      'Clear thinking'
    ],
    associatedChakra: 'chakra-solar',
    emotion: 'worry',
    physicalLocation: 'Eye to foot',
    startingPoint: 'Eye (below)',
    endingPoint: 'Second toe',
    sequence: 3,
    description: 'The Stomach meridian receives and digests food and drink. It is responsible for the rotting and ripening of nutrients and maintains healthy appetite and limb function.',
    descriptionPt: 'O meridiano do Estômago recebe e digere alimentos e bebidas. É responsável pela decomposição e maturação dos nutrientes e mantém o apetite saudável e a função dos membros.'
  },
  {
    id: 'sp',
    name: 'Taiyin Pijing',
    namePt: 'Baço/Pâncreas',
    nameEn: 'Spleen/Pancreas',
    element: 'earth',
    organ: 'Spleen',
    yinYang: 'yin',
    pathway: 'leg',
    color: 'brown',
    colorHex: '#A0522D',
    functions: [
      'Transforms food into qi',
      'Holds blood in vessels',
      'Controls muscles',
      'Opens to the mouth',
      'Governs thought'
    ],
    symptomsImbalance: [
      'Poor digestion',
      'Fatigue',
      'Heavy limbs',
      'Poor memory',
      'Excessive worry'
    ],
    symptomsBalance: [
      'Strong digestion',
      'Good muscle tone',
      'Clear thinking',
      'Healthy blood'
    ],
    associatedChakra: 'chakra-solar',
    emotion: 'worry',
    physicalLocation: 'Foot to chest',
    startingPoint: 'Big toe',
    endingPoint: 'Spleen area',
    sequence: 4,
    description: 'The Spleen meridian transforms food into qi and blood. It holds blood in vessels, controls muscles, and is responsible for intellectual function and thinking.',
    descriptionPt: 'O meridiano do Baço transforma alimentos em qi e sangue. Ele mantém o sangue nos vasos, controla os músculos e é responsável pela função intelectual e pelo pensamento.'
  },
  {
    id: 'ht',
    name: 'Shaoyin Xinbao',
    namePt: 'Coração',
    nameEn: 'Heart',
    element: 'fire',
    organ: 'Heart',
    yinYang: 'yin',
    pathway: 'arm',
    color: 'red',
    colorHex: '#FF0000',
    functions: [
      'Governs blood',
      'Houses the shen (spirit)',
      'Controls blood vessels',
      'Opens to the tongue',
      'Manifests on the face'
    ],
    symptomsImbalance: [
      'Palpitations',
      'Insomnia',
      'Poor memory',
      'Anxiety',
      'Sweating'
    ],
    symptomsBalance: [
      'Steady heartbeat',
      'Peaceful sleep',
      'Good memory',
      'Clear consciousness'
    ],
    associatedChakra: 'chakra-heart',
    emotion: 'joy',
    physicalLocation: 'Heart to small finger',
    startingPoint: 'Heart',
    endingPoint: 'Small finger',
    sequence: 5,
    description: 'The Heart meridian governs blood and houses the shen (spirit). It is responsible for circulation, sleep quality, memory, and emotional balance.',
    descriptionPt: 'O meridiano do Coração governa o sangue e abriga o shen (espírito). É responsável pela circulação, qualidade do sono, memória e equilíbrio emocional.'
  },
  {
    id: 'si',
    name: 'Shaoyang Xiaochang',
    namePt: 'Intestino Delgado',
    nameEn: 'Small Intestine',
    element: 'fire',
    organ: 'Small Intestine',
    yinYang: 'yang',
    pathway: 'arm',
    color: 'orange-red',
    colorHex: '#FF6347',
    functions: [
      'Separates clear from turbid',
      'Absorbs nutrients',
      'Transports waste',
      'Controls absorption',
      'Influences emotional processing'
    ],
    symptomsImbalance: [
      'Bloating',
      'Poor absorption',
      'Swallowing difficulties',
      'Shoulder stiffness',
      'Emotional confusion'
    ],
    symptomsBalance: [
      'Good digestion',
      'Clear thinking',
      'Emotional clarity',
      'Healthy shoulders'
    ],
    associatedChakra: 'chakra-heart',
    emotion: 'joy',
    physicalLocation: 'Hand to ear',
    startingPoint: 'Small finger',
    endingPoint: 'Ear',
    sequence: 6,
    description: 'The Small Intestine meridian separates clear from turbid substances. It absorbs nutrients and transports waste, influencing both physical digestion and emotional clarity.',
    descriptionPt: 'O meridiano do Intestino Delgado separa substâncias claras das turvas. Absorve nutrientes e transporta resíduos, influenciando tanto a digestão física quanto a clareza emocional.'
  },
  {
    id: 'bl',
    name: 'Taiyang Pangguang',
    namePt: 'Bexiga',
    nameEn: 'Bladder',
    element: 'water',
    organ: 'Bladder',
    yinYang: 'yang',
    pathway: 'back-leg',
    color: 'blue',
    colorHex: '#4169E1',
    functions: [
      'Stores and excretes urine',
      'Regulates water metabolism',
      'Controls spirit will',
      'Governs posterior body',
      'Maintains body temperature'
    ],
    symptomsImbalance: [
      'Frequent urination',
      'Urinary problems',
      'Back pain',
      'Headaches',
      'Fear'
    ],
    symptomsBalance: [
      'Normal urination',
      'Flexible back',
      'Clear head',
      'Strong will'
    ],
    associatedChakra: 'chakra-root',
    emotion: 'fear',
    physicalLocation: 'Eye to toe',
    startingPoint: 'Eye (inner)',
    endingPoint: 'Little toe',
    sequence: 7,
    description: 'The Bladder meridian stores and excretes urine while regulating water metabolism. It controls the posterior body and is associated with willpower and courage.',
    descriptionPt: 'O meridiano da Bexiga armazena e excreta urina enquanto regula o metabolismo da água. Controla a parte posterior do corpo e está associado à vontade e coragem.'
  },
  {
    id: 'ki',
    name: 'Shaoyin Shenjing',
    namePt: 'Rim',
    nameEn: 'Kidney',
    element: 'water',
    organ: 'Kidney',
    yinYang: 'yin',
    pathway: 'leg',
    color: 'dark blue',
    colorHex: '#000080',
    functions: [
      'Stores essence',
      'Governs birth and growth',
      'Controls bones and marrow',
      'Opens to the ears',
      'Controls water passage'
    ],
    symptomsImbalance: [
      'Lower back pain',
      'Weak knees',
      'Tinnitus',
      'Fatigue',
      'Fear'
    ],
    symptomsBalance: [
      'Strong bones',
      'Good hearing',
      'Vital energy',
      'Healthy reproduction'
    ],
    associatedChakra: 'chakra-root',
    emotion: 'fear',
    physicalLocation: 'Foot to chest',
    startingPoint: 'Sole of foot',
    endingPoint: 'Clavicle area',
    sequence: 8,
    description: 'The Kidney meridian stores essence and governs birth, growth, and reproduction. It controls bones, marrow, and is the source of constitutional vitality.',
    descriptionPt: 'O meridiano do Rim armazena essência e governa o nascimento, crescimento e reprodução. Controla ossos, medula e é a fonte da vitalidade constitucional.'
  },
  {
    id: 'pc',
    name: 'Jueyin Xinbao',
    namePt: 'Pericárdio/Círculo do Coração',
    nameEn: 'Pericardium',
    element: 'fire',
    organ: 'Pericardium',
    yinYang: 'yin',
    pathway: 'arm',
    color: 'magenta',
    colorHex: '#FF00FF',
    functions: [
      'Protects the heart',
      'Governs circulation',
      'Regulates heart qi',
      'Controls emotional response',
      'Opens to the chest'
    ],
    symptomsImbalance: [
      'Chest tightness',
      'Palpitations',
      'Anxiety',
      'Insomnia',
      'Emotional sensitivity'
    ],
    symptomsBalance: [
      'Open chest',
      'Healthy heart rhythm',
      'Emotional stability',
      'Peaceful sleep'
    ],
    associatedChakra: 'chakra-heart',
    emotion: 'joy',
    physicalLocation: 'Chest to middle finger',
    startingPoint: 'Chest',
    endingPoint: 'Middle finger',
    sequence: 9,
    description: 'The Pericardium meridian protects the heart and regulates heart qi. It controls emotional responses and is crucial for maintaining healthy circulation and emotional balance.',
    descriptionPt: 'O meridiano do Pericárdio protege o coração e regula o qi do coração. Controla as respostas emocionais e é crucial para manter a circulação saudável e o equilíbrio emocional.'
  },
  {
    id: 'th',
    name: 'Shaoyang Sanjiao',
    namePt: 'Triple Aquecedor',
    nameEn: 'Triple Burner',
    element: 'fire',
    organ: 'Triple Burner',
    yinYang: 'yang',
    pathway: 'arm',
    color: 'purple',
    colorHex: '#800080',
    functions: [
      'Regulates body temperature',
      'Controls water passage',
      'Governs metabolism',
      'Manages energy distribution',
      'Opens to the ears'
    ],
    symptomsImbalance: [
      'Temperature imbalances',
      'Edema',
      'Hearing problems',
      'Throat swelling',
      'Frustration'
    ],
    symptomsBalance: [
      'Normal body temperature',
      'Proper fluid balance',
      'Good hearing',
      'Healthy metabolism'
    ],
    associatedChakra: 'chakra-throat',
    emotion: 'frustration',
    physicalLocation: 'Ring finger to side of eye',
    startingPoint: 'Ring finger',
    endingPoint: 'Side of eye',
    sequence: 10,
    description: 'The Triple Burner meridian regulates body temperature and water metabolism. It governs the three energy centers (upper, middle, lower) and maintains homeostasis.',
    descriptionPt: 'O meridiano do Triple Aquecedor regula a temperatura corporal e o metabolismo da água. Governa os três centros de energia (superior, médio, inferior) e mantém a homeostase.'
  },
  {
    id: 'gb',
    name: 'Shaoyang Danjing',
    namePt: 'Vesícula Biliar',
    nameEn: 'Gallbladder',
    element: 'wood',
    organ: 'Gallbladder',
    yinYang: 'yang',
    pathway: 'side-leg',
    color: 'green',
    colorHex: '#008000',
    functions: [
      'Stores and secretes bile',
      'Governs decision making',
      'Controls tendons',
      'Opens to the eyes',
      'Manages courage'
    ],
    symptomsImbalance: [
      'Bitter taste',
      'Headaches',
      'Hip pain',
      'Poor decisions',
      'Timidity'
    ],
    symptomsBalance: [
      'Good bile flow',
      'Clear judgment',
      'Strong tendons',
      'Courage and initiative'
    ],
    associatedChakra: 'chakra-solar',
    emotion: 'anger',
    physicalLocation: 'Eye to fourth toe',
    startingPoint: 'Eye (outer)',
    endingPoint: 'Fourth toe',
    sequence: 11,
    description: 'The Gallbladder meridian stores and secretes bile while governing decision making. It controls tendons, affects judgment, and is associated with courage and initiative.',
    descriptionPt: 'O meridiano da Vesícula Biliar armazena e secreta bile enquanto governa a tomada de decisões. Controla tendões, afeta o julgamento e está associado à coragem e iniciativa.'
  },
  {
    id: 'liv',
    name: 'Jueyin Ganjing',
    namePt: 'Fígado',
    nameEn: 'Liver',
    element: 'wood',
    organ: 'Liver',
    yinYang: 'yin',
    pathway: 'leg',
    color: 'green',
    colorHex: '#228B22',
    functions: [
      'Stores blood',
      'Regulates qi flow',
      'Controls tendons',
      'Opens to the eyes',
      'Governs planning'
    ],
    symptomsImbalance: [
      'Irritability',
      'Depression',
      'Eye problems',
      'Muscle tension',
      'Menstrual issues'
    ],
    symptomsBalance: [
      'Smooth qi flow',
      'Clear eyes',
      'Flexible tendons',
      'Emotional balance'
    ],
    associatedChakra: 'chakra-solar',
    emotion: 'anger',
    physicalLocation: 'Foot to eye',
    startingPoint: 'Big toe',
    endingPoint: 'Eye (top)',
    sequence: 12,
    description: 'The Liver meridian stores blood and regulates qi flow throughout the body. It controls tendons, opens to the eyes, and governs emotional planning and flexibility.',
    descriptionPt: 'O meridiano do Fígado armazena sangue e regula o fluxo de qi por todo o corpo. Controla tendões, abre para os olhos e governa o planejamento emocional e a flexibilidade.'
  },
  {
    id: 'gv',
    name: 'Dumai',
    namePt: 'Vaso Governador',
    nameEn: 'Governing Vessel',
    element: 'water',
    organ: 'Governing Vessel',
    yinYang: 'yang',
    pathway: 'spine',
    color: 'dark blue',
    colorHex: '#00008B',
    functions: [
      'Governs yang energy',
      'Controls all yang meridians',
      'Regulates spinal fluid',
      'Governs the back',
      'Influences willpower'
    ],
    symptomsImbalance: [
      'Back pain',
      'Spinal problems',
      'Fatigue',
      'Weak immune system',
      'Feeling cold'
    ],
    symptomsBalance: [
      'Strong back',
      'Healthy spine',
      'Vital yang energy',
      'Strong immunity'
    ],
    associatedChakra: 'chakra-crown',
    emotion: 'willpower',
    physicalLocation: 'Perineum to head',
    startingPoint: 'Perineum (coccyx)',
    endingPoint: 'Upper gum (inside mouth)',
    sequence: 13,
    description: 'The Governing Vessel is the sea of yang energy. It controls all yang meridians and governs the spine, brain, and overall yang vitality of the body.',
    descriptionPt: 'O Vaso Governador é o mar de energia yang. Controla todos os meridianos yang e governa a coluna, o cérebro e a vitalidade yang geral do corpo.'
  },
  {
    id: 'cv',
    name: 'Renmai',
    namePt: 'Vaso de Concepção',
    nameEn: 'Conception Vessel',
    element: 'yin',
    organ: 'Conception Vessel',
    yinYang: 'yin',
    pathway: 'front-center',
    color: 'pink',
    colorHex: '#FFC0CB',
    functions: [
      'Governs yin energy',
      'Controls all yin meridians',
      'Regulates reproductive system',
      'Governs the abdomen',
      'Nurtures the body'
    ],
    symptomsImbalance: [
      'Abdominal problems',
      'Gynecological issues',
      'Fatigue',
      'Hormonal imbalances',
      'Feeling hot'
    ],
    symptomsBalance: [
      'Healthy abdomen',
      'Balanced hormones',
      'Strong yin energy',
      'Good reproduction'
    ],
    associatedChakra: 'chakra-root',
    emotion: 'nourishment',
    physicalLocation: 'Perineum to chin',
    startingPoint: 'Perineum',
    endingPoint: 'Chin',
    sequence: 14,
    description: 'The Conception Vessel is the sea of yin energy. It controls all yin meridians and governs the reproductive system, abdomen, and overall yin vitality.',
    descriptionPt: 'O Vaso de Concepção é o mar de energia yin. Controla todos os meridianos yin e governa o sistema reprodutivo, abdômen e a vitalidade yin geral do corpo.'
  }
];

/**
 * Get all meridian data
 */
export function getData(): MeridianData[] {
  return meridianData;
}

/**
 * Get meridian by id
 */
export function getMeridianById(id: string): MeridianData | undefined {
  return meridianData.find((m) => m.id === id);
}

/**
 * Get meridian by element
 */
export function getMeridiansByElement(element: string): MeridianData[] {
  return meridianData.filter((m) => m.element === element);
}

/**
 * Get meridian by yin/yang classification
 */
export function getMeridiansByYinYang(type: 'yin' | 'yang'): MeridianData[] {
  return meridianData.filter((m) => m.yinYang === type);
}

/**
 * Get meridian by associated chakra
 */
export function getMeridiansByChakra(chakraId: string): MeridianData[] {
  return meridianData.filter((m) => m.associatedChakra === chakraId);
}

/**
 * Get meridian by emotion
 */
export function getMeridiansByEmotion(emotion: string): MeridianData[] {
  return meridianData.filter((m) => m.emotion === emotion);
}