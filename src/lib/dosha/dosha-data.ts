// eslint-disable-next-line @typescript-eslint/no-explicit-any
// deno-lint-ignore-file no-explicit-any

/**
 * Dosha data for Ayurvedic constitution system.
 */

export interface DoshaData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  sanskrit: string;
  element: string[];
  quality: string[];
  season: string;
  timeOfDay: string;
  color: string;
  colorHex: string;
  location: string;
  qualities: string[];
  qualitiesPt: string[];
  governs: string[];
  governsPt: string[];
  description: string;
  descriptionPt: string;
  characteristics: {
    physical: string[];
    physicalPt: string[];
    mental: string[];
    mentalPt: string[];
    whenBalanced: string[];
    whenBalancedPt: string[];
    whenImbalanced: string[];
    whenImbalancedPt: string[];
  };
  diet: {
    favors: string[];
    favorsPt: string[];
    avoids: string[];
    avoidsPt: string[];
    tastes: string[];
    tastesPt: string[];
  };
  lifestyle: {
    recommendations: string[];
    recommendationsPt: string[];
    avoid: string[];
    avoidPt: string[];
    exercise: string;
    exercisePt: string;
  };
  herbs: string[];
  herbsPt: string[];
  yoga: string[];
  yogaPt: string[];
  breathing: string[];
  breathingPt: string[];
  meditation: string[];
  meditationPt: string[];
  aromatherapy: string[];
  aromatherapyPt: string[];
  gemstone: string[];
  gemstonePt: string[];
  affirmation: string;
  affirmationPt: string;
  sequence: number;
  doshaFeatures: {
    constitution: string;
    constitutionPt: string;
    gunas: string[];
    bodyType: string;
    bodyTypePt: string;
    metabolism: string;
    metabolismPt: string;
    immuneResponse: string;
    immuneResponsePt: string;
    stressResponse: string;
    stressResponsePt: string;
    optimalClimate: string;
    optimalClimatePt: string;
    sleepNeeds: string;
    sleepNeedsPt: string;
    exerciseNeeds: string;
    exerciseNeedsPt: string;
  };
}

const doshaData: DoshaData[] = [
  {
    id: 'vata',
    name: 'Vata',
    namePt: 'Vata',
    nameEn: 'Vata',
    sanskrit: 'वात',
    element: ['Éter', 'Ar'],
    quality: ['Seco', 'Leve', 'Frio', 'Ágil', 'Sutil'],
    season: 'Outono/Inverno',
    timeOfDay: '2h-6h e 14h-18h',
    color: 'Azul/Amarelo',
    colorHex: '#6B8DD6',
    location: 'Intestino grosso, pele, ouvidos, ossos, quadris, coxas',
    qualities: ['Criativo', 'Energético', 'Flexível', 'Espiritual', 'Comunicativo'],
    qualitiesPt: ['Criativo', 'Energético', 'Flexível', 'Espiritual', 'Comunicativo'],
    governs: ['Movimento', 'Respiração', 'Nervos', 'Imunidade', 'Criatividade'],
    governsPt: ['Movimento', 'Respiração', 'Nervos', 'Imunidade', 'Criatividade'],
    description: 'Vata dosha is the energy of movement and change. It governs all body movement, from the blinking of eyelids to the flow of blood through arteries. People with dominant Vata are often creative, quick-thinking, and adaptable.',
    descriptionPt: 'Vata dosha é a energia do movimento e da mudança. Governa todo o movimento corporal, desde o piscar das pálpebras até o fluxo de sangue pelas artérias. Pessoas com Vata dominante são frequentemente criativas, rápidas no pensamento e adaptáveis.',
    characteristics: {
      physical: [
        'Thin, light body frame',
        'Dry skin and hair',
        'Cold hands and feet',
        'Quick movements',
        'Light sleeper',
        'Irregular appetite and digestion',
        'Creative and enthusiastic mind',
        'Quick to learn, quick to forget',
        'Talkative and expressive',
        'Changeable mood and emotions',
      ],
      physicalPt: [
        'Estrutura corporal fina e leve',
        'Pele e cabelos secos',
        'Mãos e pés frios',
        'Movimentos rápidos',
        'Sono leve',
        'Apetite e digestão irregulares',
        'Mente criativa e entusiasta',
        'Aprende rápido, esquece rápido',
        'Falante e expressivo',
        'Humor e emoções mutáveis',
      ],
      mental: [
        'Creative and imaginative',
        'Quick thinking and learning',
        'Easily distracted',
        'Enthusiastic and energetic',
        'Anxious and worried when stressed',
        'Good communication skills',
        'Changeable interests',
      ],
      mentalPt: [
        'Criativo e imaginativo',
        'Pensamento e aprendizado rápidos',
        'Facilmente distraído',
        'Entusiasta e enérgico',
        'Ansioso e preocupado sob estresse',
        'Boas habilidades de comunicação',
        'Interesses mutáveis',
      ],
      whenBalanced: [
        'Creative and inspired',
        'Energetic and enthusiastic',
        'Clear mind and good memory',
        'Strong digestion',
        'Peaceful sleep',
        'Warm and comfortable body temperature',
        'Happy and content',
      ],
      whenBalancedPt: [
        'Criativo e inspirado',
        'Energético e entusiasmado',
        'Mente clara e boa memória',
        'Digestão forte',
        'Sono tranquilo',
        'Temperatura corporal quente e confortável',
        'Feliz e contente',
      ],
      whenImbalanced: [
        'Anxiety and worry',
        'Insomnia and restless sleep',
        'Dry skin and constipation',
        'Weight loss and weakness',
        'Cold sensitivity',
        'Difficulty concentrating',
        'Feeling ungrounded',
      ],
      whenImbalancedPt: [
        'Ansiedade e preocupação',
        'Insônia e sono inquieto',
        'Pele seca e constipação',
        'Perda de peso e fraqueza',
        'Sensibilidade ao frio',
        'Dificuldade de concentração',
        'Sensação de desenraizamento',
      ],
    },
    diet: {
      favors: [
        'Warm foods',
        'Cooked vegetables',
        'Rice and wheat',
        'Nuts and seeds',
        'Dairy products',
        'Warm drinks',
        'Sweet fruits',
        'Ginger and spices',
      ],
      favorsPt: [
        'Alimentos quentes',
        'Vegetais cozidos',
        'Arroz e trigo',
        'Nozes e sementes',
        'Laticínios',
        'Bebidas quentes',
        'Frutas doces',
        'Gengibre e especiarias',
      ],
      avoids: [
        'Cold foods and drinks',
        'Dry foods',
        'Raw vegetables',
        'Caffeine',
        'Carbonated drinks',
        'Frozen foods',
        'Excessive salt',
      ],
      avoidsPt: [
        'Alimentos e bebidas frios',
        'Alimentos secos',
        'Vegetais crus',
        'Cafeína',
        'Bebidas gasosas',
        'Alimentos congelados',
        'Excesso de sal',
      ],
      tastes: ['Doce', 'Salgado', 'Amargo'],
      tastesPt: ['Doce', 'Salgado', 'Amargo'],
    },
    lifestyle: {
      recommendations: [
        'Maintain regular routine',
        'Go to bed early',
        'Practice grounding exercises',
        'Keep warm',
        'Oil massage (abhyanga)',
        'Meditation and yoga',
        'Stay hydrated',
      ],
      recommendationsPt: [
        'Manter rotina regular',
        'Dormir cedo',
        'Praticar exercícios de enraizamento',
        'Manter-se aquecido',
        'Massagem com óleo (abhyanga)',
        'Meditação e yoga',
        'Manter-se hidratado',
      ],
      avoid: [
        'Irregular schedules',
        'Excessive travel',
        'Cold environments',
        'Overexertion',
        'Dry foods',
        'Stressful situations',
      ],
      avoidPt: [
        'Horários irregulares',
        'Viagens excessivas',
        'Ambientes frios',
        'Esforço excessivo',
        'Alimentos secos',
        'Situações estressantes',
      ],
      exercise: 'Gentle yoga, walking, swimming, tai chi',
      exercisePt: 'Yoga suave, caminhada, natação, tai chi',
    },
    herbs: ['Ashwagandha', 'Brahmi', 'Shatavari', 'Licorice', 'Ginger', 'Cardamom'],
    herbsPt: ['Ashwagandha', 'Brahmi', 'Shatavari', 'Alcaçuz', 'Gengibre', 'Cardamomo'],
    yoga: ['Surya Namaskar', 'Tree pose', 'Warrior poses', 'Child pose', 'Pigeon pose'],
    yogaPt: ['Surya Namaskar', 'Postura da árvore', 'Posturas do guerreiro', 'Postura da criança', 'Postura do pombo'],
    breathing: ['Nadi Shodhana', 'Bhramari', 'Kapalabhati (gentle)'],
    breathingPt: ['Nadi Shodhana', 'Bhramari', 'Kapalabhati (suave)'],
    meditation: ['Grounding meditation', 'Visualization', 'Mantra meditation', 'Breath awareness'],
    meditationPt: ['Meditação de enraizamento', 'Visualização', 'Meditação com mantra', 'Consciência da respiração'],
    aromatherapy: ['Sandalwood', 'Sesame oil', 'Vetiver', 'Sweet orange', 'Cedar'],
    aromatherapyPt: ['Sândalo', 'Óleo de gergelim', 'Vetiver', 'Laranja doce', 'Cedro'],
    gemstone: ['Turquoise', 'Amethyst', 'Aquamarine', 'Clear quartz'],
    gemstonePt: ['Turquesa', 'Ametista', 'Água-marinha', 'Quartzo transparente'],
    affirmation: 'I am grounded, centered, and at peace. I move through life with ease and grace.',
    affirmationPt: 'Estou enraizado, centrado e em paz. Movo-me pela vida com facilidade e graça.',
    sequence: 1,
    doshaFeatures: {
      constitution: 'Air and ether dominant constitution',
      constitutionPt: 'Constituição dominada por ar e éter',
      gunas: [' Rajas', 'Tamas'],
      bodyType: 'Thin and lightweight',
      bodyTypePt: 'Magro e leve',
      metabolism: 'Irregular, variable appetite',
      metabolismPt: 'Irregular, apetite variável',
      immuneResponse: 'Variable, prone to depletion',
      immuneResponsePt: 'Variável, propenso a esgotamento',
      stressResponse: 'Prone to anxiety and worry',
      stressResponsePt: 'Propenso a ansiedade e preocupação',
      optimalClimate: 'Warm and humid',
      optimalClimatePt: 'Quente e úmido',
      sleepNeeds: '8-9 hours, may have difficulty staying asleep',
      sleepNeedsPt: '8-9 horas, pode ter dificuldade em permanecer dormindo',
      exerciseNeeds: 'Moderate, gentle exercises preferred',
      exerciseNeedsPt: 'Moderado, exercícios suaves preferidos',
    },
  },
  {
    id: 'pitta',
    name: 'Pitta',
    namePt: 'Pitta',
    nameEn: 'Pitta',
    sanskrit: 'पित्त',
    element: ['Fogo', 'Água'],
    quality: ['Quente', 'Acuado', 'Líquido', 'Penetrante', 'Oleoso'],
    season: 'Verão',
    timeOfDay: '10h-14h e 22h-2h',
    color: 'Vermelho/Laranja',
    colorHex: '#E67E22',
    location: 'Estômago, intestino delgado, sangue, pele, olhos, fígado',
    qualities: ['Inteligente', 'Determinado', 'Corajoso', 'Ambicioso', 'Assertivo'],
    qualitiesPt: ['Inteligente', 'Determinado', 'Corajoso', 'Ambicioso', 'Assertivo'],
    governs: ['Metabolismo', 'Digestão', 'Temperatura', 'Visão', 'Coragem'],
    governsPt: ['Metabolismo', 'Digestão', 'Temperatura', 'Visão', 'Coragem'],
    description: 'Pitta dosha is the energy of transformation and metabolism. It governs digestion, absorption, and body temperature. People with dominant Pitta are often intelligent, ambitious, and have strong leadership qualities.',
    descriptionPt: 'Pitta dosha é a energia da transformação e metabolismo. Governa a digestão, absorção e temperatura corporal. Pessoas com Pitta dominante são frequentemente inteligentes, ambiciosas e têm fortes qualidades de liderança.',
    characteristics: {
      physical: [
        'Medium body frame',
        'Warm body temperature',
        'Oily skin and hair',
        'Sharp appetite',
        'Strong digestion',
        'Frequent bowel movements',
        'Sharp and penetrating mind',
        'Good concentration',
        'Decisive and organized',
        'Ambitious and driven',
      ],
      physicalPt: [
        'Estrutura corporal média',
        'Temperatura corporal quente',
        'Pele e cabelos oleosos',
        'Apetite forte',
        'Digestão forte',
        'Movimentos intestinais frequentes',
        'Mente afiada e penetrante',
        'Boa concentração',
        'Decisivo e organizado',
        'Ambicioso e determinado',
      ],
      mental: [
        'Intelligent and analytical',
        'Ambitious and goal-oriented',
        'Strong will and determination',
        'Leadership qualities',
        'Competitive nature',
        'Can become irritable when stressed',
        'Organized and systematic',
      ],
      mentalPt: [
        'Inteligente e analítico',
        'Ambicioso e orientado a objetivos',
        'Forte vontade e determinação',
        'Qualidades de liderança',
        'Natureza competitiva',
        'Pode ficar irritável sob estresse',
        'Organizado e sistemático',
      ],
      whenBalanced: [
        'Sharp intellect and memory',
        'Strong digestion',
        'Clear and glowing skin',
        'Balanced emotions',
        'Good leadership skills',
        'Courageous and confident',
        'Peaceful and content',
      ],
      whenBalancedPt: [
        'Intelecto e memória afiados',
        'Digestão forte',
        'Pele clara e radiante',
        'Emoções equilibradas',
        'Boas habilidades de liderança',
        'Corajoso e confiante',
        'Tranquilo e contente',
      ],
      whenImbalanced: [
        'Irritability and anger',
        'Acid reflux and heartburn',
        'Inflammation and skin issues',
        'Excessive hunger',
        'Difficulty sleeping',
        'Perfectionism and criticism',
        'Feeling overheated',
      ],
      whenImbalancedPt: [
        'Irritabilidade e raiva',
        'Refluxo ácido e azia',
        'Inflamação e problemas de pele',
        'Fome excessiva',
        'Dificuldade para dormir',
        'Perfeccionismo e crítica',
        'Sensação de superaquecimento',
      ],
    },
    diet: {
      favors: [
        'Cool foods',
        'Sweet fruits',
        'Vegetables',
        'Grains',
        'Legumes',
        'Milk and butter',
        'Cool drinks',
        'Coconut water',
      ],
      favorsPt: [
        'Alimentos frios',
        'Frutas doces',
        'Vegetais',
        'Grãos',
        'Leguminosas',
        'Leite e manteiga',
        'Bebidas frias',
        'Água de coco',
      ],
      avoids: [
        'Hot and spicy foods',
        'Fried foods',
        'Sour foods',
        'Salty foods',
        'Alcohol',
        'Caffeine',
        'Red meat',
        'Aged cheese',
      ],
      avoidsPt: [
        'Alimentos quentes e picantes',
        'Alimentos fritos',
        'Alimentos ácidos',
        'Alimentos salgados',
        'Álcool',
        'Cafeína',
        'Carne vermelha',
        'Queijo curado',
      ],
      tastes: ['Doce', 'Amargo', 'Adstringente'],
      tastesPt: ['Doce', 'Amargo', 'Adstringente'],
    },
    lifestyle: {
      recommendations: [
        'Avoid overheating',
        'Keep cool environment',
        'Practice moderation',
        'Meditation and relaxation',
        'Swimming and water activities',
        'Moonlit walks',
        'Cool showers',
      ],
      recommendationsPt: [
        'Evitar superaquecimento',
        'Manter ambiente fresco',
        'Praticar moderação',
        'Meditação e relaxamento',
        'Natação e atividades aquáticas',
        'Caminhadas à luz da lua',
        'Chuveiros frios',
      ],
      avoid: [
        'Hot and spicy foods',
        'Excessive sun exposure',
        'Overwork',
        'Perfectionism',
        'Competitive situations',
        'Skipping meals',
      ],
      avoidPt: [
        'Alimentos quentes e picantes',
        'Exposição solar excessiva',
        'Trabalho excessivo',
        'Perfeccionismo',
        'Situações competitivas',
        'Pular refeições',
      ],
      exercise: 'Swimming, walking, yoga in cool environment, moderate exercise',
      exercisePt: 'Natação, caminhada, yoga em ambiente fresco, exercícios moderados',
    },
    herbs: ['Amla', 'Shatavari', 'Brahmi', 'Ginkgo', 'Turmeric', 'Fennel'],
    herbsPt: ['Amla', 'Shatavari', 'Brahmi', 'Ginkgo', 'Cúrcuma', 'Funcho'],
    yoga: ['Moon salutations', 'Cobra pose', 'Forward folds', 'Seated poses', 'Cooling pranayama'],
    yogaPt: ['Saudações à lua', 'Postura da cobra', 'Flexões para frente', 'Posturas sentadas', 'Pranayama refrescante'],
    breathing: ['Shitali', 'Sitkari', 'Nadi Shodhana'],
    breathingPt: ['Shitali', 'Sitkari', 'Nadi Shodhana'],
    meditation: ['Cooling meditation', 'Moon visualization', 'Compassion practice', 'Breath cooling'],
    meditationPt: ['Meditação refrescante', 'Visualização da lua', 'Prática de compaixão', 'Respiração refrescante'],
    aromatherapy: ['Sandalwood', 'Rose', 'Jasmine', 'Chamomile', 'Mint'],
    aromatherapyPt: ['Sândalo', 'Rosa', 'Jasmim', 'Camomila', 'Hortelã'],
    gemstone: ['Moonstone', 'Pearl', 'Aquamarine', 'Green tourmaline'],
    gemstonePt: ['Pedra da lua', 'Pérola', 'Água-marinha', 'Turmalina verde'],
    affirmation: 'I am calm, centered, and balanced. I harness my fire with wisdom and compassion.',
    affirmationPt: 'Estou calmo, centrado e equilibrado. Aproveito meu fogo com sabedoria e compaixão.',
    sequence: 2,
    doshaFeatures: {
      constitution: 'Fire and water dominant constitution',
      constitutionPt: 'Constituição dominada por fogo e água',
      gunas: ['Sattva', 'Rajas'],
      bodyType: 'Medium and athletic',
      bodyTypePt: 'Médio e atlético',
      metabolism: 'Strong, efficient digestion',
      metabolismPt: 'Digestão forte e eficiente',
      immuneResponse: 'Strong, may overreact to炎症',
      immuneResponsePt: 'Forte, pode reagir exageradamente a inflamações',
      stressResponse: 'Prone to frustration and anger',
      stressResponsePt: 'Propenso a frustração e raiva',
      optimalClimate: 'Cool and moderate',
      optimalClimatePt: 'Fresco e moderado',
      sleepNeeds: '6-7 hours, quality sleep important',
      sleepNeedsPt: '6-7 horas, sono de qualidade é importante',
      exerciseNeeds: 'Moderate, 30-45 minutes daily',
      exerciseNeedsPt: 'Moderado, 30-45 minutos diários',
    },
  },
  {
    id: 'kapha',
    name: 'Kapha',
    namePt: 'Kapha',
    nameEn: 'Kapha',
    sanskrit: 'कफ',
    element: ['Água', 'Terra'],
    quality: ['Pesado', 'Lento', 'Frio', 'Oleoso', 'Suave'],
    season: 'Primavera',
    timeOfDay: '6h-10h e 18h-22h',
    color: 'Verde/Branco',
    colorHex: '#27AE60',
    location: 'Pulmões, peito, líquido sinovial, tecido adiposo, glândulas',
    qualities: ['Calmo', 'Paciente', 'Leal', 'Compassivo', 'Estável'],
    qualitiesPt: ['Calmo', 'Paciente', 'Leal', 'Compassivo', 'Estável'],
    governs: ['Estrutura', 'Lubrificação', 'Stabilidade', 'Crescimento', 'Memória'],
    governsPt: ['Estrutura', 'Lubrificação', 'Estabilidade', 'Crescimento', 'Memória'],
    description: 'Kapha dosha is the energy of structure and stability. It provides cohesion, lubrication, and support to the body. People with dominant Kapha are often calm, patient, and have a grounded presence.',
    descriptionPt: 'Kapha dosha é a energia da estrutura e estabilidade. Fornece coesão, lubrificação e suporte ao corpo. Pessoas com Kapha dominante são frequentemente calmas, pacientes e têm uma presença enraizada.',
    characteristics: {
      physical: [
        'Solid, heavy body frame',
        'Smooth and oily skin',
        'Thick hair',
        'Good stamina',
        'Slow metabolism',
        'Regular appetite',
        'Deep and restful sleep',
        'Calm and steady demeanor',
        'Good memory',
        'Patient and reliable',
      ],
      physicalPt: [
        'Estrutura corporal sólida e pesada',
        'Pele lisa e oleosa',
        'Cabelos grossos',
        'Boa resistência',
        'Metabolismo lento',
        'Apetite regular',
        'Sono profundo e reparador',
        'Comportamento calmo e firme',
        'Boa memória',
        'Paciente e confiável',
      ],
      mental: [
        'Calm and peaceful nature',
        'Patient and tolerant',
        'Loyal and devoted',
        'Compassionate and kind',
        'Strong memory',
        'Can become stubborn when stressed',
        'Slow to learn but retains well',
      ],
      mentalPt: [
        'Natureza calma e pacífica',
        'Paciente e tolerante',
        'Leal e dedicado',
        'Compassivo e gentil',
        'Memória forte',
        'Pode ficar teimoso sob estresse',
        'Aprende devagar mas retém bem',
      ],
      whenBalanced: [
        'Strong immunity',
        'Deep and restful sleep',
        'Calm and peaceful mind',
        'Good digestion',
        'Steady energy throughout the day',
        'Loving and compassionate',
        'Grounded and stable',
      ],
      whenBalancedPt: [
        'Imunidade forte',
        'Sono profundo e reparador',
        'Mente calma e pacífica',
        'Boa digestão',
        'Energia estável durante o dia',
        'Amoroso e compassivo',
        'Enraizado e estável',
      ],
      whenImbalanced: [
        'Weight gain and fluid retention',
        'Lethargy and drowsiness',
        'Depression and withdrawal',
        'Excessive sleep',
        'Slow digestion and congestion',
        'Attachment and greed',
        'Feeling heaviness',
      ],
      whenImbalancedPt: [
        'Ganho de peso e retenção de líquidos',
        'Letargia e sonolência',
        'Depressão e isolamento',
        'Sono excessivo',
        'Digestão lenta e congestão',
        'Apego e ganância',
        'Sensação de peso',
      ],
    },
    diet: {
      favors: [
        'Light and dry foods',
        'Raw vegetables',
        'Legumes',
        'Barley',
        'Millet',
        'Lighter fruits',
        'Honey',
        'Spicy foods',
      ],
      favorsPt: [
        'Alimentos leves e secos',
        'Vegetais crus',
        'Leguminosas',
        'Cevada',
        'Milhete',
        'Frutas mais leves',
        'Mel',
        'Alimentos picantes',
      ],
      avoids: [
        'Heavy and oily foods',
        'Dairy products',
        'Fried foods',
        'Processed sugars',
        'Salty foods',
        'Excessive water intake',
        'Cold foods and drinks',
      ],
      avoidsPt: [
        'Alimentos pesados e oleosos',
        'Laticínios',
        'Alimentos fritos',
        'Açúcares processados',
        'Alimentos salgados',
        'Ingestão excessiva de água',
        'Alimentos e bebidas frias',
      ],
      tastes: ['Picante', 'Amargo', 'Adstringente'],
      tastesPt: ['Picante', 'Amargo', 'Adstringente'],
    },
    lifestyle: {
      recommendations: [
        'Wake up early',
        'Regular exercise',
        'Light and stimulating activities',
        'Variety in daily routine',
        'Steam and sweating',
        'Dry brushing',
        'Light diet',
      ],
      recommendationsPt: [
        'Acordar cedo',
        'Exercício regular',
        'Atividades leves e estimulantes',
        'Variedade na rotina diária',
        'Vapor e sudorese',
        'Escovação seca',
        'Dieta leve',
      ],
      avoid: [
        'Oversleeping',
        'Heavy meals',
        'Sedentary lifestyle',
        'Cold and damp environments',
        'Excessive dairy',
        'Emotional eating',
        'Staying indoors too long',
      ],
      avoidPt: [
        'Dormir em excesso',
        'Refeições pesadas',
        'Estilo de vida sedentário',
        'Ambientes frios e úmidos',
        'Excesso de laticínios',
        'Comer emocionalmente',
        'Ficar muito tempo em ambientes fechados',
      ],
      exercise: 'Vigorous exercise, running, swimming, dance, dynamic yoga',
      exercisePt: 'Exercício vigoroso, corrida, natação, dança, yoga dinâmico',
    },
    herbs: ['Triphala', 'Guggul', 'Cinnamon', 'Ginger', 'Turmeric', 'Black pepper'],
    herbsPt: ['Triphala', 'Guggul', 'Canela', 'Gengibre', 'Cúrcuma', 'Pimenta preta'],
    yoga: ['Sun salutations', 'Warrior sequences', 'Backbends', 'Twists', 'Inversions'],
    yogaPt: ['Saudações ao sol', 'Sequências do guerreiro', 'Extensões para trás', 'Torções', 'Inversões'],
    breathing: ['Kapalabhati', 'Bhastrika', 'Ujjayi'],
    breathingPt: ['Kapalabhati', 'Bhastrika', 'Ujjayi'],
    meditation: ['Energizing meditation', 'Movement meditation', 'Breath of fire', 'Dynamic visualization'],
    meditationPt: ['Meditação energizante', 'Meditação em movimento', 'Respiração de fogo', 'Visualização dinâmica'],
    aromatherapy: ['Eucalyptus', 'Cinnamon', 'Ginger', 'Camphor', 'Mustard'],
    aromatherapyPt: ['Eucalipto', 'Canela', 'Gengibre', 'Cânfora', 'Mostarda'],
    gemstone: ['Amethyst', 'Citrine', 'Carnelian', 'Red coral'],
    gemstonePt: ['Ametista', 'Citrino', 'Cornalina', 'Coral vermelho'],
    affirmation: 'I am light, free, and full of energy. I embrace change and move forward with joy.',
    affirmationPt: 'Sou leve, livre e cheio de energia. Abraço a mudança e sigo em frente com alegria.',
    sequence: 3,
    doshaFeatures: {
      constitution: 'Water and earth dominant constitution',
      constitutionPt: 'Constituição dominada por água e terra',
      gunas: ['Tamas', 'Sattva'],
      bodyType: 'Heavy and sturdy',
      bodyTypePt: 'Pesado e robusto',
      metabolism: 'Slow, tendency to gain weight',
      metabolismPt: 'Lento, tendência a ganhar peso',
      immuneResponse: 'Strong and stable, but slow to respond',
      immuneResponsePt: 'Forte e estável, mas lento para responder',
      stressResponse: 'Prone to lethargy and depression',
      stressResponsePt: 'Propenso a letargia e depressão',
      optimalClimate: 'Warm and dry',
      optimalClimatePt: 'Quente e seco',
      sleepNeeds: '6-7 hours, tendency to oversleep',
      sleepNeedsPt: '6-7 horas, tendência a dormir demais',
      exerciseNeeds: ' Vigorous, 45-60 minutes daily',
      exerciseNeedsPt: 'Vigoroso, 45-60 minutos diários',
    },
  },
];

export function getData(): DoshaData[] {
  return doshaData;
}
