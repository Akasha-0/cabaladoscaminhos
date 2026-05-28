 
 

/** Ayurveda Data — Cabala dos Caminhos */

export interface Dosha {
  id: string;
  name: string;
  namePt: string;
  element: string;
  qualities: string[];
  season: string;
  timeOfDay: string;
  taste: string[];
  color: string;
  characteristic: string;
}

export interface Dhatu {
  id: string;
  name: string;
  namePt: string;
  description: string;
  function: string;
  sequence: number;
}

export interface Mala {
  id: string;
  name: string;
  namePt: string;
  description: string;
  type: 'purisha' | 'mutra' | 'sweda';
}

export interface Prakriti {
  id: string;
  name: string;
  namePt: string;
  description: string;
  dominantDoshas: string[];
  characteristics: {
    physical: string[];
    mental: string[];
    strengths: string[];
    weaknesses: string[];
  };
}

export interface Gunas {
  id: string;
  name: string;
  namePt: string;
  description: string;
  qualities: string[];
  effect: string;
}

export interface Agni {
  id: string;
  name: string;
  namePt: string;
  types: string[];
  description: string;
}

export interface Ojas {
  id: string;
  name: string;
  namePt: string;
  description: string;
  factors: string[];
}

export interface Dinacharya {
  id: string;
  time: string;
  practice: string;
  practicePt: string;
  benefit: string;
  benefitPt: string;
}

export interface Ritucharya {
  id: string;
  season: string;
  seasonPt: string;
  regimen: string[];
  regimenPt: string[];
  diet: string[];
  dietPt: string[];
  avoid: string[];
  avoidPt: string[];
}

export interface herb {
  id: string;
  name: string;
  namePt: string;
  scientificName: string;
  dosha: string;
  rasa: string[];
  virya: string;
  vipaka: string;
  prabhava: string;
  indications: string[];
  indicationsPt: string[];
}

export interface Marma {
  id: string;
  name: string;
  namePt: string;
  location: string;
  locationPt: string;
  energy: number;
  dosha: string;
  indication: string;
  indicationPt: string;
  category: 'shakti' | 'storehouse' | 'vital' | 'joint' | 'lower';
}

export interface Panchakarma {
  id: string;
  name: string;
  namePt: string;
  phase: 'purva' | 'pradhana' | 'paschat';
  phasePt: string;
  description: string;
  descriptionPt: string;
  procedures: string[];
  proceduresPt: string[];
  indications: string[];
  indicationsPt: string[];
  duration: string;
  durationPt: string;
}

export interface AyurvedicRemedy {
  id: string;
  title: string;
  titlePt: string;
  category: string;
  categoryPt: string;
  ingredients: string[];
  ingredientsPt: string[];
  preparation: string;
  preparationPt: string;
  indications: string[];
  indicationsPt: string[];
  dosha: string[];
  caution: string;
  cautionPt: string;
}

const doshas: Dosha[] = [
  {
    id: 'vata',
    name: 'Vata',
    namePt: 'Vata',
    element: 'Ether + Air',
    qualities: ['Seco', 'Leve', 'Móvel', 'Frio', 'Sutil', 'Claro', 'Irregular'],
    season: 'Outono/Inverno seco',
    timeOfDay: 'Madrugada e anoitecer (2h-6h, 18h-22h)',
    taste: ['Pungente', 'Amargo', 'Astringente'],
    color: '#7B9EA8',
    characteristic: 'Movimento e comunicação',
  },
  {
    id: 'pitta',
    name: 'Pitta',
    namePt: 'Pitta',
    element: 'Fire + Water',
    qualities: ['Quente', 'Oleoso', 'Agudo', 'Líquido', 'Sutil', 'Penetrante'],
    season: 'Verão',
    timeOfDay: 'Meio-dia e meia-noite (10h-14h, 22h-2h)',
    taste: ['Pungente', 'Azedo', 'Amargo'],
    color: '#D94E41',
    characteristic: 'Transformação e metabolismo',
  },
  {
    id: 'kapha',
    name: 'Kapha',
    namePt: 'Kapha',
    element: 'Earth + Water',
    qualities: ['Pesado', 'Lento', 'Frio', 'Oleoso', 'Suave', 'Denso', 'Estável'],
    season: 'Primavera e inverno úmido',
    timeOfDay: 'Manhã e noite (6h-10h, 18h-22h)',
    taste: ['Doce', 'Amargo', 'Astringente'],
    color: '#5A8F3E',
    characteristic: 'Estrutura e lubricidade',
  },
];

const dhatus: Dhatu[] = [
  { id: 'rasa', name: 'Rasa', namePt: 'Plasma', description: 'Nutrição primária e transporte', function: 'Nutrição e transporte de nutrientes', sequence: 1 },
  { id: 'rakta', name: 'Rakta', namePt: 'Sangue', description: 'Oxigenação e vitalidade', function: 'Oxigenação e sustentação da vida', sequence: 2 },
  { id: 'mamsa', name: 'Mamsa', namePt: 'Músculo', description: 'Movimento e proteção', function: 'Força muscular e cobertura dos órgãos', sequence: 3 },
  { id: 'meda', name: 'Meda', namePt: 'Gordura', description: 'Lubrificação e isolamento', function: 'Lubrificação articular e isolamento térmico', sequence: 4 },
  { id: 'asthi', name: 'Asthi', namePt: 'Osso', description: 'Suporte estrutural', function: 'Sustentação do corpo e produção de medula', sequence: 5 },
  { id: 'majja', name: 'Majja', namePt: 'Medula/Nervo', description: 'Preenchimento e produção', function: 'Preenchimento dos ossos e produção de células nervosas', sequence: 6 },
  { id: 'shukra', name: 'Shukra', namePt: 'Reprodução', description: 'Criação e vitalidade', function: 'Reprodução e força vital (Ojas)', sequence: 7 },
];

const malasin: Mala[] = [
  { id: 'purisha', name: 'Purisha', namePt: 'Fezes', description: 'Resíduo sólido — elimina intestinais', type: 'purisha' },
  { id: 'mutra', name: 'Mutra', namePt: 'Urina', description: 'Resíduo líquido — filtração renal', type: 'mutra' },
  { id: 'sweda', name: 'Sweda', namePt: 'Suor', description: 'Resíduo газовый — regulação térmica', type: 'sweda' },
];

const prakritis: Prakriti[] = [
  {
    id: 'vata',
    name: 'Vata Prakriti',
    namePt: 'Prakriti Vata',
    description: 'Tipo constitucional com predominância do dosha Vata',
    dominantDoshas: ['vata'],
    characteristics: {
      physical: ['Corpo fino e leve', 'Pele seca', 'Cabelos ressecados', 'Movimentos rápidos', 'Apetite irregular'],
      mental: ['Mente ativa e criativa', 'Aprende rápido mas esquece rápido', 'Indecisão', 'Ansiedade'],
      strengths: ['Criatividade', 'Flexibilidade', 'Adaptabilidade', 'Intuição'],
      weaknesses: ['Ansiedade', 'Insônia', 'Prisão de ventre', 'Fadiga'],
    },
  },
  {
    id: 'pitta',
    name: 'Pitta Prakriti',
    namePt: 'Prakriti Pitta',
    description: 'Tipo constitucional com predominância do dosha Pitta',
    dominantDoshas: ['pitta'],
    characteristics: {
      physical: ['Corpo médio', 'Pele oleosa com sardas', 'Cabelos finos', 'Apetite forte', 'Suor abundante'],
      mental: ['Mente tajam', 'Focado e determinado', 'Perfeccionista', 'Irritável sob estresse'],
      strengths: ['Inteligência', 'Liderança', 'Coragem', 'Metabolismo eficiente'],
      weaknesses: ['Irritação', 'Inflamações', 'Azia', 'Impaciência'],
    },
  },
  {
    id: 'kapha',
    name: 'Kapha Prakriti',
    namePt: 'Prakriti Kapha',
    description: 'Tipo constitucional com predominância do dosha Kapha',
    dominantDoshas: ['kapha'],
    characteristics: {
      physical: ['Corpo robusto e pesado', 'Pele oleosa e grossa', 'Cabelos grossos e brilhantes', 'Apetite leve mas estável', 'Energia constante'],
      mental: ['Mente calma e estável', 'Memória forte', 'Paciente', 'Lento para decidir'],
      strengths: ['Resistência', 'Força física', 'Calma', 'Lealdade'],
      weaknesses: ['Preguiça', 'Ganho de peso', 'Congestão', 'Apego'],
    },
  },
  {
    id: 'vatapitta',
    name: 'Vata-Pitta Prakriti',
    namePt: 'Prakriti Vata-Pitta',
    description: 'Tipo constitucional com dois doshas predominantes',
    dominantDoshas: ['vata', 'pitta'],
    characteristics: {
      physical: ['Corpo magro a médio', 'Metabolismo variável', 'Tendência a pele seca com inflamações'],
      mental: ['Mente ágil com profundidade analítica', 'Perfeccionismo criativo', 'Estresse rápido'],
      strengths: ['Combinação de criatividade e inteligência', 'Versatilidade'],
      weaknesses: ['Ansiedade com irritação', 'Fadiga irregular', 'Digestão instável'],
    },
  },
  {
    id: 'vatakapha',
    name: 'Vata-Kapha Prakriti',
    namePt: 'Prakriti Vata-Kapha',
    description: 'Tipo constitucional com dois doshas predominantes',
    dominantDoshas: ['vata', 'kapha'],
    characteristics: {
      physical: ['Corpo variável', 'Tendência a oscilar entre magro e pesado'],
      mental: ['Criatividade estável', 'Planejamento realista', 'Dificuldade em manter motivação'],
      strengths: ['Imaginação com perseverança', 'Equilíbrio entre movimento e estabilidade'],
      weaknesses: ['Indecisão', 'Hesitação', 'Oscilação de energia'],
    },
  },
  {
    id: 'pittakapha',
    name: 'Pitta-Kapha Prakriti',
    namePt: 'Prakriti Pitta-Kapha',
    description: 'Tipo constitucional com dois doshas predominantes',
    dominantDoshas: ['pitta', 'kapha'],
    characteristics: {
      physical: ['Corpo médio a robusto', 'Força física com bom metabolismo'],
      mental: ['Determinação com estabilidade', 'Liderança natural', 'Orgulho'],
      strengths: ['Força e inteligência', 'Gestão eficaz', 'Resistência'],
      weaknesses: ['Teimosia', 'Ganho de peso', 'Possessividade', 'Irritação'],
    },
  },
  {
    id: 'tridosha',
    name: 'Tridosha Prakriti',
    namePt: 'Prakriti Tridosha',
    description: 'Tipo constitucional raro com três doshas equilibrados',
    dominantDoshas: ['vata', 'pitta', 'kapha'],
    characteristics: {
      physical: ['Corpo bem proporcionado', 'Saúde equilibrada', 'Adaptação fácil a climas'],
      mental: ['Mente equilibrada', 'Versatilidade mental', 'Harmonia emocional'],
      strengths: ['Equilíbrio natural', 'Adaptabilidade total', 'Resiliência'],
      weaknesses: ['Raro ter desequilíbrio', 'Dificuldade em identificar padrão dominante'],
    },
  },
];

const gunas: Gunas[] = [
  { id: 'sattva', name: 'Sattva', namePt: 'Sattva (Pureza)', description: 'Qualidade de clareza, harmonia e equilíbrio', qualities: ['Clareza', 'Luz', 'Equilíbrio', 'Inteligência', 'Beleza'], effect: 'Promove saúde, paz e iluminação' },
  { id: 'rajas', name: 'Rajas', namePt: 'Rajas (Atividade)', description: 'Qualidade de movimento, excitação e desejo', qualities: ['Movimento', 'Excitação', 'Desejo', 'Agitação', 'Passion'], effect: 'Gera atividade, mas também agitação e apego' },
  { id: 'tamas', name: 'Tamas', namePt: 'Tamas (Inércia)', description: 'Qualidade de escuridão, inércia e ignorância', qualities: ['Escuridão', 'Inércia', 'Ignorância', 'Apatia', 'Destruição'], effect: 'Promove letargia, confusão e destruição' },
];

const agniTypes: Agni[] = [
  { id: 'jatharagni', name: 'Jatharagni', namePt: 'Agni Digestivo (Jatharagni)', types: ['Tikshna (Afortunado)', 'Mandagni (Fraco)', 'Vishamagni (Variável)'], description: 'Agni central no estômago — responsável pela digestão primária' },
  { id: 'bhutagni', name: 'Bhutagni', namePt: 'Agni dos Elementos (Bhutagni)', types: ['Agni dos 5 elementos'], description: 'Agni nos tecidos hepáticos que processa os 5 elementos da comida' },
  { id: 'dhatvagni', name: 'Dhatvagni', namePt: 'Agni dos Tecidos (Dhatvagni)', types: ['7 Dhatvagnis'], description: 'Agni em cada dhatu para transformação e metabolismo tecidual' },
];

const ojasData: Ojas[] = [
  { id: 'ojas', name: 'Ojas', namePt: 'Ojas (Vitalidade)', description: 'Essência suprema da vitalidade — resultado final de toda a digestão e metabolismo. Forma a base da imunidade, força e bem-estar.', factors: ['Digestão equilibrada (Agni forte)', 'Alimentação sãtrica', 'Sono adequado', 'Abstinência de excesso', 'Práticas espirituais', 'Rasayanas (rejuvenescedores)'] },
];

const dinacharya: Dinacharya[] = [
  { id: 'brahmamuhurta', time: '4:00 - 5:00', practice: 'Wake early (Brahmamuhurta)', practicePt: 'Acordar no Brahma Muhurta', benefit: 'Optimal spiritual and creative energy', benefitPt: 'Energia espiritual e criativa ideal' },
  { id: 'usnodana', time: '5:00 - 5:30', practice: 'Nasya oil in nostrils', practicePt: 'Aplicar óleo nas narinas (Nasya)', benefit: 'Cleanses sinuses, improves voice, vision', benefitPt: 'Limpa seios da face, melhora voz e visão' },
  { id: 'abhyanga', time: '5:30 - 6:00', practice: 'Self oil massage (Abhyanga)', practicePt: 'Automassagem com óleo (Abhyanga)', benefit: 'Nourishes skin, calms nervous system, improves circulation', benefitPt: 'Nutre a pele, acalma o sistema nervoso, melhora circulação' },
  { id: 'hcana', time: '6:00 - 6:30', practice: 'Bath/Shower (Snanam)', practicePt: 'Banho (Snanam)', benefit: 'Refreshing, cleanses body and mind', benefitPt: 'Renovador, limpa corpo e mente' },
  { id: 'dhara', time: '6:30 - 7:00', practice: 'Yoga asanas and Pranayama', practicePt: 'Posturas de yoga e Pranayama', benefit: 'Strengthens body, balances doshas, awakens prana', benefitPt: 'Fortalece o corpo, equilibra doshas, desperta prana' },
  { id: 'dhyana', time: '7:00 - 7:30', practice: 'Meditation (Dhyana)', practicePt: 'Meditação (Dhyana)', benefit: 'Calms mind, reduces stress, promotes sattva', benefitPt: 'Acalma a mente, reduz estresse, promove sattva' },
  { id: 'jale pana', time: '7:30 - 8:00', practice: 'Warm water drinking ( Ushna jala pana)', practicePt: 'Beber água morna (Ushna jala pana)', benefit: 'Stimulates digestion, cleanses colon', benefitPt: 'Estimula digestão, limpa o cólon' },
  { id: 'ahara', time: '8:00 - 9:00', practice: 'Breakfast (Bahukala)', practicePt: 'Café da manhã (Bahukala)', benefit: 'Nutritious morning meal according to dosha', benefitPt: 'Refeição matinal nutritiva de acordo com o dosha' },
  { id: 'karma', time: '10:00 - 13:00', practice: 'Main work (Purvaanna)', practicePt: 'Trabalho principal (Purvahna)', benefit: 'Peak productivity hours for mental work', benefitPt: 'Horário de pico de produtividade para trabalho mental' },
  { id: 'lunch', time: '12:00 - 13:00', practice: 'Lunch (Madhyanna)', practicePt: 'Almoço (Madhyanna)', benefit: 'Largest meal when Agni is strongest', benefitPt: 'Maior refeição quando Agni está mais forte' },
  { id: 'walk', time: '15:00 - 16:00', practice: 'Evening walk (Vishuvanna)', practicePt: 'Caminhada vespertina (Vishuvanna)', benefit: 'Aids digestion, refreshes mind', benefitPt: 'Auxilia digestão, renova a mente' },
  { id: 'dinner', time: '18:00 - 19:00', practice: 'Dinner (Sayanna)', practicePt: 'Jantar (Sayanna)', benefit: 'Light meal, easy to digest', benefitPt: 'Refeição leve, fácil de digerir' },
  { id: 'ratri', time: '21:00 - 22:00', practice: 'Sleep routine (Ratri charya)', practicePt: 'Rotina noturna (Ratri charya)', benefit: 'Quality sleep, proper rest', benefitPt: 'Sono de qualidade, descanso adequado' },
];

const ritucharya: Ritucharya[] = [
  {
    id: 'varsha',
    season: 'Monsoon (Varsha)',
    seasonPt: 'Monções (Varsha)',
    regimen: ['Avoid exertion', 'Stay dry', 'Use disinfectants', 'Avoid daytime sleep'],
    regimenPt: ['Evitar esforço físico', 'Manter-se seco', 'Usar desinfetantes', 'Evitar dormir durante o dia'],
    diet: ['Rice', 'Lentils', 'Warm foods', 'Honey', 'Light preparations'],
    dietPt: ['Arroz', 'Lentilhas', 'Alimentos quentes', 'Mel', 'Preparações leves'],
    avoid: ['Oily foods', 'Cold drinks', 'Buttermilk', 'Excessive water'],
    avoidPt: ['Alimentos gordurosos', 'Bebidas frias', 'Coalhada', 'Água em excesso'],
  },
  {
    id: 'grishma',
    season: 'Summer (Grishma)',
    seasonPt: 'Verão (Grishma)',
    regimen: ['Stay cool', 'Wear light clothes', 'Avoid midday sun', 'Swim or bathe in cool water'],
    regimenPt: ['Manter-se fresco', 'Usar roupas leves', 'Evitar sol do meio-dia', 'Nadar ou banhar-se em água fresca'],
    diet: ['Sweet fruits', 'Barley', 'Rice', 'Cooling foods', 'Buttermilk', 'Coconut water'],
    dietPt: ['Frutas doces', 'Cevada', 'Arroz', 'Alimentos refrigerantes', 'Leite coalhado', 'Água de coco'],
    avoid: ['Spicy foods', 'Excessive salt', 'Sour foods', 'Alcohol', 'Hot beverages'],
    avoidPt: ['Alimentos picantes', 'Sal em excesso', 'Alimentos ácidos', 'Álcool', 'Bebidas quentes'],
  },
  {
    id: 'sharad',
    season: 'Autumn (Sharad)',
    seasonPt: 'Outono (Sharad)',
    regimen: ['Detoxification', 'Use of ghee', 'Moderate exercise', 'Adequate sleep'],
    regimenPt: ['Desintoxicação', 'Uso de ghee', 'Exercício moderado', 'Sono adequado'],
    diet: ['Sweet, bitter, astringent tastes', 'Rice', 'Wheat', 'Mung beans', 'Honey', 'Ghee in moderation'],
    dietPt: ['Sabores doce, amargo e adstringente', 'Arroz', 'Trigo', 'Feijão mungo', 'Mel', 'Ghee com moderação'],
    avoid: ['Fatty foods', 'Yogurt', 'Excessive sweets', 'Daytime sleep'],
    avoidPt: ['Alimentos gordurosos', 'Iogurte', 'Doces em excesso', 'Sono diurno'],
  },
  {
    id: 'hemanta',
    season: 'Pre-winter (Hemanta)',
    seasonPt: 'Pré-inverno (Hemanta)',
    regimen: ['Abhyanga (oil massage)', 'Exercise', 'Warm clothing', 'Exposure to sunlight'],
    regimenPt: ['Abhyanga (massagem com óleo)', 'Exercício', 'Roupas quentes', 'Exposição ao sol'],
    diet: ['Sweet, sour, salty foods', 'Nourishing foods', 'Healthy fats', 'Warm preparations', 'Ghee and oils'],
    dietPt: ['Alimentos doce, azedo e salgado', 'Alimentos nutritivos', 'Gorduras saudáveis', 'Preparações quentes', 'Ghee e óleos'],
    avoid: ['Cold foods and drinks', 'Dry foods', 'Light diets'],
    avoidPt: ['Alimentos frios e bebidas', 'Alimentos secos', 'Dietas leves'],
  },
  {
    id: 'shishira',
    season: 'Winter (Shishira)',
    seasonPt: 'Inverno (Shishira)',
    regimen: ['Abhyanga', 'Vigorous exercise', 'Warm baths', 'Warm clothing'],
    regimenPt: ['Abhyanga', 'Exercício vigoroso', 'Banhos quentes', 'Roupas quentes'],
    diet: ['Sweet, sour, salty foods', 'Heavy and oily foods', 'Nourishing preparations', 'Ghee', 'Milk preparations'],
    dietPt: ['Alimentos doce, azedo e salgado', 'Alimentos pesados e oleosos', 'Preparações nutritivas', 'Ghee', 'Preparações com leite'],
    avoid: ['Cold drinks', 'Light foods', 'Excessive fasting'],
    avoidPt: ['Bebidas frias', 'Alimentos leves', 'Jejum excessivo'],
  },
  {
    id: 'vasanta',
    season: 'Spring (Vasanta)',
    seasonPt: 'Primavera (Vasanta)',
    regimen: ['Light exercise', 'Dry massage', 'Herbal cleansing', 'Avoid daytime sleep'],
    regimenPt: ['Exercício leve', 'Massagem seca', 'Limpeza herbal', 'Evitar dormir durante o dia'],
    diet: ['Light foods', 'Barley', 'Mung beans', 'Honey', 'Avoid heavy, sour, oily foods'],
    dietPt: ['Alimentos leves', 'Cevada', 'Feijão mungo', 'Mel', 'Evitar alimentos pesados, ácidos e oleosos'],
    avoid: ['Heavy foods', 'Yogurt', 'Cheese', 'Cold foods', 'Excess sleep'],
    avoidPt: ['Alimentos pesados', 'Iogurte', 'Queijo', 'Alimentos frios', 'Sono em excesso'],
  },
];

const herbs: herb[] = [
  { id: 'ashwagandha', name: 'Ashwagandha', namePt: 'Ashwagandha', scientificName: 'Withania somnifera', dosha: 'Vata-Pitta', rasa: ['Amargo', 'Doce', 'Astringente'], virya: 'Quente (Ushna)', vipaka: 'Doce', prabhava: 'Rasayana (rejuvenescedor)', indications: ['Adaptogen', 'Energy', 'Stress', 'Vitality'], indicationsPt: ['Adaptógeno', 'Energia', 'Estresse', 'Vitalidade'] },
  { id: 'triphala', name: 'Triphala', namePt: 'Triphala', scientificName: 'Combination of Terminalia chebula, T. bellirica, Emblica officinalis', dosha: 'Tridosha', rasa: ['Azedo', 'Amargo', 'Doce', 'Astringente', 'Pungente'], virya: 'Quente (equilibrado)', vipaka: 'Doce', prabhava: ' gentle laxative and rejuvenator', indications: ['Digestion', 'Constipation', 'Detoxification', 'Eyes'], indicationsPt: ['Digestão', 'Prisão de ventre', 'Desintoxicação', 'Olhos'] },
  { id: 'turmeric', name: 'Turmeric', namePt: 'Açafrão da terra', scientificName: 'Curcuma longa', dosha: 'Pitta-Kapha', rasa: ['Amargo', 'Pungente'], virya: 'Quente', vipaka: 'Amargo', prabhava: 'Anti-inflamatório poderoso', indications: ['Inflammation', 'Wounds', 'Skin conditions', 'Liver'], indicationsPt: ['Inflamação', 'Feridas', 'Condições de pele', 'Fígado'] },
  { id: 'brahmi', name: 'Brahmi', namePt: 'Brahmi', scientificName: 'Bacopa monnieri', dosha: 'Vata-Pitta', rasa: ['Amargo', 'Doce'], virya: 'Frio (Shita)', vipaka: 'Doce', prabhava: 'Medhya (nootrópico)', indications: ['Memory', 'Anxiety', 'Mental clarity', 'Sleep'], indicationsPt: ['Memória', 'Ansiedade', 'Clareza mental', 'Sono'] },
  { id: 'shatavari', name: 'Shatavari', namePt: 'Shatavari', scientificName: 'Asparagus racemosus', dosha: 'Vata-Pitta', rasa: ['Doce', 'Amargo'], virya: 'Frio', vipaka: 'Doce', prabhava: 'Rasayana femenino (females)', indications: ['Female reproductive health', 'Lactation', 'Digestion', 'Hydration'], indicationsPt: ['Saúde reprodutiva feminina', 'Lactação', 'Digestão', 'Hidratação'] },
  { id: 'tulsi', name: 'Tulsi', namePt: 'Manjericão sagrado', scientificName: 'Ocimum tenuiflorum', dosha: 'Vata-Kapha', rasa: ['Pungente', 'Amargo'], virya: 'Quente', vipaka: 'Pungente', prabhava: 'Aleia de Kapha e medo', indications: ['Respiratory', 'Immunity', 'Stress', 'Infection'], indicationsPt: ['Respiratório', 'Imunidade', 'Estresse', 'Infecção'] },
  { id: 'ginger', name: 'Ginger', namePt: 'Gengibre', scientificName: 'Zingiber officinale', dosha: 'Vata-Kapha', rasa: ['Pungente', 'Doce'], virya: 'Quente', vipaka: 'Doce', prabhava: 'Digestivo e anti-náusea', indications: ['Digestion', 'Nausea', 'Cold', 'Respiratory'], indicationsPt: ['Digestão', 'Náusea', 'Resfriado', 'Respiratório'] },
  { id: 'amla', name: 'Amla', namePt: 'Phyllanthus emblica', scientificName: 'Emblica officinalis', dosha: 'Tridosha', rasa: ['Azedo', 'Doce', 'Amargo', 'Astringente', 'Pungente'], virya: 'Frio', vipaka: 'Doce', prabhava: 'Highest vitamin C content, Rasayana', indications: ['Immunity', 'Hair', 'Skin', 'Digestion', 'Liver'], indicationsPt: ['Imunidade', 'Cabelo', 'Pele', 'Digestão', 'Fígado'] },
  { id: 'neem', name: 'Neem', namePt: 'Nim', scientificName: 'Azadirachta indica', dosha: 'Pitta-Kapha', rasa: ['Amargo', 'Astringente'], virya: 'Frio', vipaka: 'Pungente', prabhava: 'Sangre purifier and antimicrobial', indications: ['Skin conditions', 'Detoxification', 'Infection', 'Fever'], indicationsPt: ['Condições de pele', 'Desintoxicação', 'Infecção', 'Febre'] },
  { id: 'cinnamon', name: 'Cinnamon', namePt: 'Canela', scientificName: 'Cinnamomum verum', dosha: 'Vata-Kapha', rasa: ['Pungente', 'Doce'], virya: 'Quente', vipaka: 'Pungente', prabhava: 'Warming and circulatory stimulant', indications: ['Circulation', 'Diabetes', 'Digestion', 'Colds'], indicationsPt: ['Circulação', 'Diabetes', 'Digestão', 'Resfriados'] },
];

const marmaPoints: Marma[] = [
  { id: 'sahasrara', name: 'Sahasrara', namePt: 'Sahasrara (Coroa)', location: 'Top of the head', locationPt: 'Topo da cabeça', energy: 100, dosha: 'Vata', indication: 'Spiritual awakening, consciousness', indicationPt: 'Despertar espiritual, consciência', category: 'vital' },
  { id: 'ajna', name: 'Ajna', namePt: 'Ajna (Terceiro olho)', location: 'Between eyebrows', locationPt: 'Entre as sobrancelhas', energy: 90, dosha: 'Vata', indication: 'Intuition, clarity, third eye', indicationPt: 'Intuição, clareza, terceiro olho', category: 'vital' },
  { id: 'sthapani', name: 'Sthapani', namePt: 'Sthapani (Ponto da testa)', location: 'Center of forehead', locationPt: 'Centro da testa', energy: 85, dosha: 'Vata', indication: 'Headache, sinusitis, mental clarity', indicationPt: 'Dor de cabeça, sinusite, clareza mental', category: 'vital' },
  { id: 'hridaya', name: 'Hridaya', namePt: 'Hridaya (Coração)', location: 'Cardiac region, sternum', locationPt: 'Região cardíaca, esterno', energy: 95, dosha: 'Pitta', indication: 'Heart, circulation, emotional balance', indicationPt: 'Coração, circulação, equilíbrio emocional', category: 'vital' },
  { id: 'nabhi', name: 'Nabhi', namePt: 'Nabhi (Umbigo)', location: 'Umbilicus center', locationPt: 'Centro do umbigo', energy: 80, dosha: 'Pitta', indication: 'Digestion, Agni, naval region', indicationPt: 'Digestão, Agni, região umbilical', category: 'vital' },
  { id: 'manibandha', name: 'Manibandha', namePt: 'Manibandha (Pulso)', location: 'Wrist joints (both)', locationPt: 'Articulações do pulso (ambos)', energy: 50, dosha: 'Vata', indication: 'Elbow pain, systemic disorders', indicationPt: 'Dor no cotovelo, distúrbios sistêmicos', category: 'joint' },
  { id: 'kukundara', name: 'Kukundara', namePt: 'Kukundara (Quadril)', location: 'Hip joints (both)', locationPt: 'Articulações do quadril (ambos)', energy: 60, dosha: 'Kapha', indication: 'Hip disorders, reproductive system', indicationPt: 'Distúrbios do quadril, sistema reprodutivo', category: 'joint' },
  { id: 'kundala', name: 'Kundala', namePt: 'Kundala (Tornozelo)', location: 'Ankle joints (both)', locationPt: 'Articulações do tornozelo (ambos)', energy: 40, dosha: 'Vata', indication: 'Ankle swelling, systemic diseases', indicationPt: 'Inchaço no tornozelo, doenças sistêmicas', category: 'joint' },
  { id: 'apalapa', name: 'Apalapa', namePt: 'Apalapa (Abdômen inferior)', location: 'Lower abdomen (both sides)', locationPt: 'Abdômen inferior (ambos os lados)', energy: 55, dosha: 'Kapha', indication: 'Gynecological disorders, abdominal issues', indicationPt: 'Distúrbios ginecológicos, questões abdominais', category: 'storehouse' },
  { id: 'gulpha', name: 'Gulpha', namePt: 'Gulpha (Panturrilha)', location: 'Calf region (both)', locationPt: 'Região da panturrilha (ambos)', energy: 35, dosha: 'Vata', indication: 'Leg swelling, systemic disorders', indicationPt: 'Inchaço nas pernas, distúrbios sistêmicos', category: 'storehouse' },
  { id: 'vitapa', name: 'Vitapa', namePt: 'Vitapa (Região inguinal)', location: 'Inguinal region', locationPt: 'Região inguinal', energy: 65, dosha: 'Kapha', indication: 'Genital disorders, urinary issues', indicationPt: 'Distúrbios genitais, questões urinárias', category: 'storehouse' },
  { id: 'urvi', name: 'Urvi', namePt: 'Urvi (Coxa)', location: 'Thigh region (both)', locationPt: 'Região da coxa (ambos)', energy: 45, dosha: 'Vata', indication: 'Thigh weakness, circulation', indicationPt: 'Fraqueza na coxa, circulação', category: 'storehouse' },
  { id: 'ankhapani', name: 'Ankhapani', namePt: 'Ankhapani (Olho e mão)', location: 'Around eyes and palms', locationPt: 'Ao redor dos olhos e palmas', energy: 70, dosha: 'Pitta', indication: 'Eye disorders, palm pain', indicationPt: 'Distúrbios oculares, dor na palma', category: 'shakti' },
  { id: 'hrudayamura', name: 'Hridayamura', namePt: 'Hridayamura (Pre cordial)', location: 'Pre-cardiac region', locationPt: 'Região pré-cardíaca', energy: 85, dosha: 'Pitta', indication: 'Heart disorders, emotional trauma', indicationPt: 'Distúrbios cardíacos, trauma emocional', category: 'shakti' },
  { id: 'talahridaya', name: 'Talahridaya', namePt: 'Talahridaya (Centro das mãos e pés)', location: 'Center of palms and soles', locationPt: 'Centro das palmas e solas', energy: 60, dosha: 'Vata', indication: 'Vitality, pranic energy, consciousness', indicationPt: 'Vitalidade, energia prânica, consciência', category: 'shakti' },
  { id: 'adhipati', name: 'Adhipati', namePt: 'Adhipati (Parietal)', location: 'Crown region', locationPt: 'Região do coronal', energy: 90, dosha: 'Vata', indication: 'Headaches, neurological disorders', indicationPt: 'Dores de cabeça, distúrbios neurológicos', category: 'lower' },
  { id: 'nimitta', name: 'Nimitta', namePt: 'Nimitta (Nuca)', location: 'Occipital region', locationPt: 'Região occipital', energy: 75, dosha: 'Vata', indication: 'Headache, neck stiffness', indicationPt: 'Dor de cabeça, rigidez no pescoço', category: 'lower' },
  { id: 'utkshepa', name: 'Utkshepa', namePt: 'Utkshepa (Temporal)', location: 'Temporal region', locationPt: 'Região temporal', energy: 70, dosha: 'Vata', indication: 'Migraine, temporal headache', indicationPt: 'Enxaqueca, dor temporal', category: 'lower' },
];

const panchakarma: Panchakarma[] = [
  {
    id: 'snehana',
    name: 'Snehana (Oleation)',
    namePt: 'Snehana (Oleação)',
    phase: 'purva',
    phasePt: 'Preparatória',
    description: 'Administration of sneha (oleaceous substances) internally and externally to loosen and liquefy ama (toxins) and vata from the tissues',
    descriptionPt: 'Administração de sneha (substâncias oleosas) internamente e externamente para soltar e liquidificar ama (toxinas) e vata dos tecidos',
    procedures: ['Sneha paana (internal oleation)', 'Abhyanga (oil massage)', 'Svedana (sudation)'],
    proceduresPt: ['Sneha paana (oleação interna)', 'Abhyanga (massagem com óleo)', 'Svedana (sudação)'],
    indications: ['Chronic disorders', 'Vata imbalance', 'Joint diseases', 'Neurological conditions'],
    indicationsPt: ['Distúrbios crônicos', 'Desequilíbrio de Vata', 'Doenças articulares', 'Condições neurológicas'],
    duration: '3-7 days',
    durationPt: '3-7 dias',
  },
  {
    id: 'swedana',
    name: 'Swedana (Sudation)',
    namePt: 'Swedana (Sudação)',
    phase: 'purva',
    phasePt: 'Preparatória',
    description: 'Therapeutic sweating to open channels, liquefy doshas, and promote elimination through sweat',
    descriptionPt: 'Sudação terapêutica para abrir canais, liquidificar doshas e promover eliminação através do suor',
    procedures: ['Nadi sweda (tube sudation)', 'Pinda sweda (bolus massage)', 'Kashaya sweda (decoction sudation)', 'Avagaha sweda (tub bath)'],
    proceduresPt: ['Nadi sweda (sudação por tubo)', 'Pinda sweda (massagem com bolus)', 'Kashaya sweda (sudação com decocção)', 'Avagaha sweda (banheira)'],
    indications: ['Stiffness', 'Coldness', 'Body ache', 'Respiratory conditions'],
    indicationsPt: ['Rigidez', 'Frieza', 'Dores no corpo', 'Condições respiratórias'],
    duration: '3-7 days',
    durationPt: '3-7 dias',
  },
  {
    id: 'vamana',
    name: 'Vamana (Therapeutic Emesis)',
    namePt: 'Vamana (Êmese Terapêutica)',
    phase: 'pradhana',
    phasePt: 'Principal',
    description: 'Medically induced vomiting to eliminate excess Kapha and Pitta from the stomach and respiratory tract',
    descriptionPt: 'Vômito medicamente induzido para eliminar excesso de Kapha e Pitta do estômago e trato respiratório',
    procedures: ['Deepana-Pachana (appetizers/digestives)', 'Snehana-Swedana', 'Vamana karma (emesis procedure)', 'Pasat karma (post-emetic care)'],
    proceduresPt: ['Deepana-Pachana (apetitantes/digestivos)', 'Snehana-Swedana', 'Vamana karma (procedimento de êmese)', 'Pasat karma (cuidados pós-êmese)'],
    indications: ['Asthma', 'Chronic cold', 'Sinusitis', 'Obesity', 'Skin disorders', 'Diabetes'],
    indicationsPt: ['Asma', 'Resfriado crônico', 'Sinusite', 'Obesidade', 'Distúrbios de pele', 'Diabetes'],
    duration: '1-3 days',
    durationPt: '1-3 dias',
  },
  {
    id: 'virechana',
    name: 'Virechana (Purgation)',
    namePt: 'Virechana (Purificação)',
    phase: 'pradhana',
    phasePt: 'Principal',
    description: 'Medically induced purgation to eliminate excess Pitta from the liver, gallbladder, and small intestine',
    descriptionPt: 'Purificação medicamente induzida para eliminar excesso de Pitta do fígado, vesícula biliar e intestino delgado',
    procedures: ['Deepana-Pachana', 'Snehana-Swedana', 'Virechana karma (purgation)', 'Sansarjan karma (dietary regimine)'],
    proceduresPt: ['Deepana-Pachana', 'Snehana-Swedana', 'Virechana karma (purificação)', 'Sansarjan karma (regime dietético)'],
    indications: ['Gallbladder disorders', 'Skin diseases', 'Chronic fever', 'Digestive disorders', 'Jaundice', 'Hemorrhoids'],
    indicationsPt: ['Distúrbios da vesícula biliar', 'Doenças de pele', 'Febre crônica', 'Distúrbios digestivos', 'Icterícia', 'Hemorroidas'],
    duration: '1-3 days',
    durationPt: '1-3 dias',
  },
  {
    id: 'basti',
    name: 'Basti (Medicated Enema)',
    namePt: 'Basti (Enema Medicado)',
    phase: 'pradhana',
    phasePt: 'Principal',
    description: 'Administration of herbal decoctions and oils through the rectal route to eliminate Vata and treat Vata disorders',
    descriptionPt: 'Administração de decocções e óleos herbais através da via rectal para eliminar Vata e tratar distúrbios de Vata',
    procedures: ['Niruha basti (decoction enema)', 'Anuvasana basti (oil enema)', 'Matra basti (mild oil enema)', 'Karma basti (30 days protocol)'],
    proceduresPt: ['Niruha basti (enema de decocção)', 'Anuvasana basti (enema de óleo)', 'Matra basti (enema de óleo suave)', 'Karma basti (protocolo de 30 dias)'],
    indications: ['Arthritis', 'Paralysis', 'Constipation', 'Nervous disorders', 'Infertility', 'Low back pain'],
    indicationsPt: ['Artrite', 'Paralisia', 'Prisão de ventre', 'Distúrbios nervosos', 'Infertilidade', 'Dor lombar'],
    duration: '8-30 days',
    durationPt: '8-30 dias',
  },
  {
    id: 'nasya',
    name: 'Nasya (Nasal Administration)',
    namePt: 'Nasya (Administração Nasal)',
    phase: 'pradhana',
    phasePt: 'Principal',
    description: 'Administration of medicated oils or powders through the nostrils to treat disorders above the clavicle',
    descriptionPt: 'Administração de óleos ou pós medicados através das narinas para tratar distúrbios acima da clavícula',
    procedures: ['Purva karma (preparation)', 'Pradhana karma (nasya administration)', 'Pasat karma (post-nasya care)'],
    proceduresPt: ['Purva karma (preparação)', 'Pradhana karma (administração de nasya)', 'Pasat karma (cuidados pós-nasya)'],
    indications: ['Sinusitis', 'Migraine', 'Hair loss', 'Premature graying', 'Neurological disorders', ' ENT disorders'],
    indicationsPt: ['Sinusite', 'Enxaqueca', 'Queda de cabelo', 'Cabelos grisalhos prematuros', 'Distúrbios neurológicos', 'Distúrbios ORL'],
    duration: '7-14 days',
    durationPt: '7-14 dias',
  },
  {
    id: 'raktamokshana',
    name: 'Raktamokshana (Bloodletting)',
    namePt: 'Raktamokshana (Sangria)',
    phase: 'pradhana',
    phasePt: 'Principal',
    description: 'Therapeutic blood purification through various methods to treat blood disorders and skin diseases',
    descriptionPt: 'Purificação sanguínea terapêutica através de vários métodos para tratar distúrbios do sangue e doenças de pele',
    procedures: ['Jalaukavacharana (leech therapy)', 'Shringa (horn suction)', 'Alabu (gourd suction)', 'Pracchana (scarification)'],
    proceduresPt: ['Jalaukavacharana (terapia com sanguessugas)', 'Shringa (sucção com chifre)', 'Alabu (sucção com cabaça)', 'Pracchana (escarificação)'],
    indications: ['Skin disorders', 'Eczema', 'Psoriasis', 'Gout', 'Hypertension', 'Varicose veins'],
    indicationsPt: ['Distúrbios de pele', 'Eczema', 'Psoríase', 'Gota', 'Hipertensão', 'Varizes'],
    duration: '1-5 sessions',
    durationPt: '1-5 sessões',
  },
  {
    id: 'samsarjanakarma',
    name: 'Samsarjanakarma (Post-PK Rejuvenation)',
    namePt: 'Samsarjanakarma (Rejuvenescimento Pós-PK)',
    phase: 'paschat',
    phasePt: 'Pós-tratamento',
    description: 'Gradual reintroduction of diet and lifestyle after Panchakarma to restore digestive fire and strength',
    descriptionPt: 'Reintrodução gradual da dieta e estilo de vida após Panchakarma para restaurar o fogo digestivo e a força',
    procedures: ['Peyadi Krama (gradual diet reintroduction)', 'Rasayana therapy', 'Life style management', 'Follow-up care'],
    proceduresPt: ['Peyadi Krama (reintrodução gradual da dieta)', 'Terapia Rasayana', 'Gestão do estilo de vida', 'Acompanhamento'],
    indications: ['Post-PK patients', 'Rejuvenation', 'Vitality restoration', 'Long-term health maintenance'],
    indicationsPt: ['Pacientes pós-PK', 'Rejuvenescimento', 'Restauração da vitalidade', 'Manutenção da saúde a longo prazo'],
    duration: '7-21 days',
    durationPt: '7-21 dias',
  },
];

const remedies: AyurvedicRemedy[] = [
  {
    id: 'triphala-churna',
    title: 'Triphala Churna',
    titlePt: 'Triphala Churna (Pó)',
    category: 'Digestive',
    categoryPt: 'Digestivo',
    ingredients: ['Amalaki (Emblica officinalis)', 'Haritaki (Terminalia chebula)', 'Bibhitaki (Terminalia bellirica)'],
    ingredientsPt: ['Amalaki (Emblica officinalis)', 'Haritaki (Terminalia chebula)', 'Bibhitaki (Terminalia bellirica)'],
    preparation: 'Take 1-2 grams with warm water before bed',
    preparationPt: 'Tomar 1-2 gramas com água morna antes de dormir',
    indications: ['Constipation', 'Digestive health', 'Detoxification', 'Eye health'],
    indicationsPt: ['Prisão de ventre', 'Saúde digestiva', 'Desintoxicação', 'Saúde ocular'],
    dosha: ['vata', 'pitta', 'kapha'],
    caution: 'May cause loose stools initially; avoid during pregnancy',
    cautionPt: 'Pode causar fezes soltas inicialmente; evitar durante a gravidez',
  },
  {
    id: 'chawanprash',
    title: 'Chyawanprash',
    titlePt: 'Chyawanprash',
    category: 'Rasayana (Rejuvenator)',
    categoryPt: 'Rasayana (Rejuvenescedor)',
    ingredients: ['Amalaki', 'Ashwagandha', 'Pippali', 'Cardamom', 'Ghee', 'Honey', 'Multiple herbs'],
    ingredientsPt: ['Amalaki', 'Ashwagandha', 'Pippali', 'Cardamomo', 'Ghee', 'Mel', 'Múltiplas ervas'],
    preparation: 'Take 1-2 teaspoons daily, preferably in the morning with milk',
    preparationPt: 'Tomar 1-2 colheres de chá diariamente, preferencialmente pela manhã com leite',
    indications: ['Immunity', 'Vitality', 'Respiratory health', 'Anti-aging'],
    indicationsPt: ['Imunidade', 'Vitalidade', 'Saúde respiratória', 'Anti-envelhecimento'],
    dosha: ['vata', 'pitta', 'kapha'],
    caution: 'Contains sugar; diabetic patients should consult practitioner',
    cautionPt: 'Contém açúcar; pacientes diabéticos devem consultar um profissional',
  },
  {
    id: 'ginger-tea',
    title: 'Ginger Tea (Shunthi Tea)',
    titlePt: 'Chá de Gengibre (Shunthi)',
    category: 'Digestive',
    categoryPt: 'Digestivo',
    ingredients: ['Fresh ginger root', 'Lemon juice', 'Honey', 'Water'],
    ingredientsPt: ['Raiz de gengibre fresco', 'Suco de limão', 'Mel', 'Água'],
    preparation: 'Boil sliced ginger in water for 5-10 minutes; add lemon and honey after cooling',
    preparationPt: 'Ferver gengibre fatiado em água por 5-10 minutos; adicionar limão e mel após resfriar',
    indications: ['Indigestion', 'Nausea', 'Common cold', 'Sore throat'],
    indicationsPt: ['Indigestão', 'Náusea', 'Resfriado comum', 'Dor de garganta'],
    dosha: ['vata', 'kapha'],
    caution: 'Avoid in excess Pitta conditions like acid reflux',
    cautionPt: 'Evitar em excesso em condições de Pitta como refluxo ácido',
  },
  {
    id: 'ashwagandha-milk',
    title: 'Ashwagandha Milk',
    titlePt: 'Leite com Ashwagandha',
    category: 'Rasayana',
    categoryPt: 'Rasayana',
    ingredients: ['Ashwagandha powder', 'Warm milk', 'Ghee', 'Honey (optional)'],
    ingredientsPt: ['Pó de Ashwagandha', 'Leite morno', 'Ghee', 'Mel (opcional)'],
    preparation: 'Mix 1/2 teaspoon ashwagandha in warm milk with a pinch of ghee; take before sleep',
    preparationPt: 'Misturar 1/2 colher de chá de ashwagandha em leite morno com uma pitada de ghee; tomar antes de dormir',
    indications: ['Stress', 'Anxiety', 'Insomnia', 'Low immunity', 'Low stamina'],
    indicationsPt: ['Estresse', 'Ansiedade', 'Insônia', 'Imunidade baixa', 'Baixa resistência'],
    dosha: ['vata'],
    caution: 'May cause drowsiness; avoid with sedatives',
    cautionPt: 'Pode causar sonolência; evitar com sedativos',
  },
  {
    id: 'tulsi-tea',
    title: 'Tulsi Tea',
    titlePt: 'Chá de Tulsi',
    category: 'Respiratory',
    categoryPt: 'Respiratório',
    ingredients: ['Fresh tulsi leaves', 'Ginger', 'Black pepper', 'Water', 'Honey (optional)'],
    ingredientsPt: ['Folhas frescas de tulsi', 'Gengibre', 'Pimenta preta', 'Água', 'Mel (opcional)'],
    preparation: 'Boil tulsi leaves with ginger and pepper for 5 minutes; strain and add honey',
    preparationPt: 'Ferver folhas de tulsi com gengibre e pimenta por 5 minutos; coar e adicionar mel',
    indications: ['Cough', 'Cold', 'Flu', 'Respiratory infections', 'Stress'],
    indicationsPt: ['Tosse', 'Resfriado', 'Gripe', 'Infecções respiratórias', 'Estresse'],
    dosha: ['vata', 'kapha'],
    caution: 'Generally safe; excessive use may aggravate Pitta',
    cautionPt: 'Geralmente seguro; uso excessivo pode agravar Pitta',
  },
  {
    id: 'dashamoola-kwath',
    title: 'Dashamoola Kvath',
    titlePt: 'Dashamoola Kvath (Decocção)',
    category: 'Vata Balance',
    categoryPt: 'Equilíbrio de Vata',
    ingredients: ['Dashamoola (10 roots)', 'Water'],
    ingredientsPt: ['Dashamoola (10 raízes)', 'Água'],
    preparation: 'Boil 30g of dashamoola in 960ml water until reduced to 240ml; take in divided doses',
    preparationPt: 'Ferver 30g de dashamoola em 960ml de água até reduzir a 240ml; tomar em doses divididas',
    indications: ['Vata disorders', 'Fever', 'Respiratory conditions', 'Body aches', 'Nervous exhaustion'],
    indicationsPt: ['Distúrbios de Vata', 'Febre', 'Condições respiratórias', 'Dores no corpo', 'Exaustão nervosa'],
    dosha: ['vata'],
    caution: 'Should be taken under guidance; not for long-term self-use',
    cautionPt: 'Deve ser tomado sob orientação; não para uso autônomo prolongado',
  },
  {
    id: 'lodhra-churna',
    title: 'Lodhra Churna',
    titlePt: 'Lodhra Churna (Pó)',
    category: 'Gynecological',
    categoryPt: 'Ginecológico',
    ingredients: ['Lodhra (Symplocos racemosa) powder'],
    ingredientsPt: ['Pó de Lodhra (Symplocos racemosa)'],
    preparation: 'Take 3-6 grams with water or as directed by practitioner',
    preparationPt: 'Tomar 3-6 gramas com água ou conforme orientado pelo profissional',
    indications: ['Menorrhagia', 'Leukorrhea', 'Diarrhea', 'Skin conditions'],
    indicationsPt: ['Menorragia', 'Leucorreia', 'Diarreia', 'Condições de pele'],
    dosha: ['pitta', 'kapha'],
    caution: 'Avoid during pregnancy; consult practitioner for dosage',
    cautionPt: 'Evitar durante a gravidez; consultar profissional para dosagem',
  },
];

export function getData() {
  return {
    doshas,
    dhatus,
    malasin,
    prakritis,
    gunas,
    agniTypes,
    ojasData,
    dinacharya,
    ritucharya,
    herbs,
    marmaPoints,
    panchakarma,
    remedies,
  };
}
