 
// deno-lint-ignore-file no-explicit-any

/**
 * Chakra data for v4 system.
 */

export interface ChakraV4Data {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  sanskrit: string;
  element: string;
  location: string;
  color: string;
  colorHex: string;
  mantra: string;
  qualities: string[];
  governs: string[];
  description: string;
  descriptionPt: string;
  affirmation: string;
  affirmationPt: string;
  planet: string;
  gemstone: string[];
  yogaPose: string;
  aromatherapy: string[];
  sound: string;
  sequence: number;
  v4Features: {
    energyFlow: string[];
    meditationStages: string[];
    sacredGeometry: string[];
    mantras: string[];
    yantras: string[];
    activationSteps: string[];
    healingTechniques: string[];
    counterBalance: string;
    parallelChakras: string[];
  };
}

const chakraV4Data: ChakraV4Data[] = [
  {
    id: 'root',
    name: 'Muladhara',
    namePt: 'Raiz',
    nameEn: 'Root',
    sanskrit: 'मूलाधार',
    element: 'Terra',
    location: 'Base da coluna',
    color: 'Vermelho',
    colorHex: '#FF0000',
    mantra: 'LAM',
    qualities: ['Sobrevivência', 'Segurança', 'Estabilidade', 'Conexão terrestre'],
    governs: ['Estratégia', 'Memória', 'Instinto', 'Vitalidade'],
    description: 'The root chakra is the foundation of the chakra system. It represents our most basic needs: survival, security, and stability. Located at the base of the spine, it connects us to the earth and our physical body.',
    descriptionPt: 'O chakra raiz é a fundação do sistema de chakras. Representa nossas necessidades mais básicas: sobrevivência, segurança e estabilidade. Localizado na base da coluna, conecta-nos à terra e ao nosso corpo físico.',
    affirmation: 'I am safe. I am grounded. I trust the process of life.',
    affirmationPt: 'Eu estou seguro. Estou enraizado. Confio no processo da vida.',
    planet: 'Marte',
    gemstone: ['hematita', 'turmalina negra', 'ônix'],
    yogaPose: 'Tadasana (Postura da Montanha)',
    aromatherapy: ['Sândalo', 'Patchouli', 'Gengibre'],
    sound: 'C',
    sequence: 1,
    v4Features: {
      energyFlow: ['Terra ascendente', 'Energia vital circulante', 'Força de sobrevivência'],
      meditationStages: ['Grounding meditation', 'Earth connection visualization', 'Root chakra activation'],
      sacredGeometry: ['Cubo', 'Quadrado', 'Estrela de 4 pontas'],
      mantras: ['LAM', 'Om Shakti', 'Om Earth'],
      yantras: ['Yantra do Muladhara', 'Triângulo vermelho', 'Quadrado terrestre'],
      activationSteps: ['Afirmação de segurança', 'Visualização da raiz', 'Mantra LAM repetição', 'Postura Tadasana'],
      healingTechniques: ['Reiki no chakra raiz', 'Cristaloterapia com hematita', 'Aromaterapia com patchouli'],
      counterBalance: 'Crown',
      parallelChakras: ['muladhara-earth', 'root-stability'],
    },
  },
  {
    id: 'sacral',
    name: 'Svadhisthana',
    namePt: 'Sacro',
    nameEn: 'Sacral',
    sanskrit: 'स्वाधिष्ठान',
    element: 'Água',
    location: 'Baixo abdômen',
    color: 'Laranja',
    colorHex: '#FF8000',
    mantra: 'VAM',
    qualities: ['Criatividade', 'Sexualidade', 'Emoções', 'Prazer'],
    governs: ['Fertilidade', 'Reprodução', 'Intuição', 'Flexibilidade'],
    description: 'The sacral chakra governs our creativity, sexuality, and emotional balance. It is the center of our feelings, desires, and pleasure. Located below the navel, it represents the flow of life energy.',
    descriptionPt: 'O chakra sacral governa nossa criatividade, sexualidade e equilíbrio emocional. É o centro dos nossos sentimentos, desejos e prazer. Localizado abaixo do umbigo, representa o fluxo de energia vital.',
    affirmation: 'I honor my body. I deserve pleasure. I am creative.',
    affirmationPt: 'Eu honro meu corpo. Eu mereço prazer. Eu sou criativo.',
    planet: 'Lua',
    gemstone: ['cornalina', 'âmbar', 'pedra da lua'],
    yogaPose: 'Baddha Konasana (Postura da Borboleta)',
    aromatherapy: ['Ylang-Ylang', 'Laranja doce', 'Gerânio'],
    sound: 'D',
    sequence: 2,
    v4Features: {
      energyFlow: ['Fluxo lunar', 'Ondulações emocionais', 'Ciclo de prazer'],
      meditationStages: ['Water meditation', 'Emotional release practice', 'Creative visualization'],
      sacredGeometry: ['Círculo', 'Lua crescente', 'Estrela de 6 pontas'],
      mantras: ['VAM', 'Om Chandraya', 'Chandra bija'],
      yantras: ['Yantra do Svadhisthana', 'Lua crescente', 'Círculo de água'],
      activationSteps: ['Afirmação de criatividade', 'Visualização da água', 'Mantra VAM repetição', 'Postura Baddha Konasana'],
      healingTechniques: ['Terapia aquática', 'Aromaterapia com ylang-ylang', 'Movimentação pélvica'],
      counterBalance: 'Third Eye',
      parallelChakras: ['svadhisthana-water', 'sacral-emotions'],
    },
  },
  {
    id: 'solar-plexus',
    name: 'Manipura',
    namePt: 'Plexo Solar',
    nameEn: 'Solar Plexus',
    sanskrit: 'मणिपूर',
    element: 'Fogo',
    location: 'Epigástrio',
    color: 'Amarelo',
    colorHex: '#FFFF00',
    mantra: 'RAM',
    qualities: ['Poder pessoal', 'Autoestima', 'Transformação', 'Disciplina'],
    governs: ['Metabolismo', 'Digestão', 'Vontade', 'Assertividade'],
    description: 'The solar plexus chakra is the center of personal power, self-esteem, and autonomy. It governs our sense of identity and our ability to take action in the world. Located in the upper abdomen, it radiates personal strength.',
    descriptionPt: 'O chakra do plexo solar é o centro do poder pessoal, autoestima e autonomia. Governa nosso senso de identidade e nossa capacidade de agir no mundo. Localizado no alto abdômen, irradia força pessoal.',
    affirmation: 'I trust myself. I am powerful. I take action with confidence.',
    affirmationPt: 'Eu confio em mim mesmo. Eu sou poderoso. Aguo com confiança.',
    planet: 'Sol',
    gemstone: ['topázio amarelo', 'citrino', 'âmbar dourado'],
    yogaPose: 'Agnisana (Postura do Fogo)',
    aromatherapy: ['Bergamota', 'Lemongrass', 'Gengibre'],
    sound: 'E',
    sequence: 3,
    v4Features: {
      energyFlow: ['Fogo solar', 'Poder transformador', 'Energia metabólica'],
      meditationStages: ['Solar fire meditation', 'Power affirmation', 'Will visualization'],
      sacredGeometry: ['Triângulo', 'Estrela de fogo', 'Hexagrama'],
      mantras: ['RAM', 'Om Suryaya', 'Agni bija'],
      yantras: ['Yantra do Manipura', 'Triângulo amarelo', 'Estrela solar'],
      activationSteps: ['Afirmação de poder', 'Visualização do fogo solar', 'Mantra RAM repetição', 'Postura Agnisana'],
      healingTechniques: ['Terapia de fogo', 'Aromaterapia com bergamota', 'Exercícios de respiração de fogo'],
      counterBalance: 'Throat',
      parallelChakras: ['manipura-fire', 'solar-power'],
    },
  },
  {
    id: 'heart',
    name: 'Anahata',
    namePt: 'Coração',
    nameEn: 'Heart',
    sanskrit: 'अनाहट',
    element: 'Ar',
    location: 'Centro do peito',
    color: 'Verde',
    colorHex: '#00FF00',
    mantra: 'YAM',
    qualities: ['Amor', 'Compassão', 'Perdão', 'Harmonia'],
    governs: ['Relações', 'Empatia', 'Aceitação', 'Bondade'],
    description: 'The heart chakra is the center of love, compassion, and emotional balance. It bridges the lower and upper chakras, connecting physical and spiritual realms. Located at the heart center, it radiates unconditional love.',
    descriptionPt: 'O chakra do coração é o centro do amor, compaixão e equilíbrio emocional. Une os chakras inferiores e superiores, conectando os reinos físico e espiritual. Localizado no centro do peito, irradia amor incondicional.',
    affirmation: 'I am love. I give and receive love freely. I forgive.',
    affirmationPt: 'Eu sou amor. Dou e recebo amor livremente. Eu perdoo.',
    planet: 'Vênus',
    gemstone: ['esmeralda', 'quartzo rosa', 'jade'],
    yogaPose: 'Bhujangasana (Postura da Cobra)',
    aromatherapy: ['Rosa', 'Ylang-Ylang', 'Bergamota'],
    sound: 'F',
    sequence: 4,
    v4Features: {
      energyFlow: ['Amor incondicional', 'Compassão circulante', 'Perdão libertador'],
      meditationStages: ['Heart opening meditation', 'Loving kindness practice', 'Compassion visualization'],
      sacredGeometry: ['Estrela de 12 pontas', 'Círculo duplo', 'Hexagrama de amor'],
      mantras: ['YAM', 'Om Hrdaya', 'Prema bija'],
      yantras: ['Yantra do Anahata', 'Estrela de 12 pontas', 'Círculo de coração'],
      activationSteps: ['Afirmação de amor', 'Visualização verde', 'Mantra YAM repetição', 'Postura Bhujangasana'],
      healingTechniques: ['Terapia do coração', 'Aromaterapia com rosa', 'Meditação de compaixão'],
      counterBalance: 'Sacral',
      parallelChakras: ['anahata-air', 'heart-love'],
    },
  },
  {
    id: 'throat',
    name: 'Vishuddha',
    namePt: 'Laríngeo',
    nameEn: 'Throat',
    sanskrit: 'विशुद्ध',
    element: 'Éter',
    location: 'Garganta',
    color: 'Azul',
    colorHex: '#0000FF',
    mantra: 'HAM',
    qualities: ['Comunicação', 'Expressão', 'Verdade', 'Escrita'],
    governs: ['Comunicação', 'Expressão criativa', 'Verdade', 'Autoridade'],
    description: 'The throat chakra is the center of communication and self-expression. It allows us to speak our truth and express our authentic voice. Located at the throat, it governs our ability to communicate ideas and feelings.',
    descriptionPt: 'O chakra laríngeo é o centro da comunicação e autoexpressão. Permite-nos falar nossa verdade e expressar nossa voz autêntica. Localizado na garganta, governa nossa capacidade de comunicar ideias e sentimentos.',
    affirmation: 'I speak my truth with clarity and compassion.',
    affirmationPt: 'Eu falo minha verdade com clareza e compaixão.',
    planet: 'Mercúrio',
    gemstone: ['turquesa', 'água-marinha', 'quartzo azul'],
    yogaPose: 'Chakravakasana (Postura da Rotação da Coluna)',
    aromatherapy: ['Menta', 'Eucalipto', 'Camomila'],
    sound: 'G',
    sequence: 5,
    v4Features: {
      energyFlow: ['Comunicação clara', 'Expressão autêntica', 'Verdade vibratória'],
      meditationStages: ['Throat purification', 'Truth speaking practice', 'Expression visualization'],
      sacredGeometry: ['Círculo azul', 'Lua crescente dupla', 'Estrela de 5 pontas'],
      mantras: ['HAM', 'Om Vak', 'Vani bija'],
      yantras: ['Yantra do Vishuddha', 'Círculo de azul', 'Lua de éter'],
      activationSteps: ['Afirmação de verdade', 'Visualização azul', 'Mantra HAM repetição', 'Postura Chakravakasana'],
      healingTechniques: ['Terapia de garganta', 'Aromaterapia com menta', 'Exercícios vocais'],
      counterBalance: 'Solar Plexus',
      parallelChakras: ['vishuddha-ether', 'throat-expression'],
    },
  },
  {
    id: 'third-eye',
    name: 'Ajna',
    namePt: 'Frontal',
    nameEn: 'Third Eye',
    sanskrit: 'आज्ञा',
    element: 'Luz',
    location: 'Entre as sobrancelhas',
    color: 'Índigo',
    colorHex: '#4B0082',
    mantra: 'OM',
    qualities: ['Intuição', 'Visão', 'Discernimento', 'Sabedoria'],
    governs: ['Intuição', 'Visão Interior', 'Discernimento', 'Sabedoria'],
    description: 'The third eye chakra is the seat of intuition and inner vision. It allows us to perceive beyond the physical realm and access higher wisdom. Located between the eyebrows, it governs our ability to see the truth and connect with our inner knowing.',
    descriptionPt: 'O chakra frontal é a sede da intuição e visão interior. Permite-nos perceber além do reino físico e acessar sabedoria superior. Localizado entre as sobrancelhas, governa nossa capacidade de ver a verdade e conectar com nosso conhecimento interior.',
    affirmation: 'I trust my intuition. I see the truth clearly.',
    affirmationPt: 'Eu confio na minha intuição. Eu vejo a verdade claramente.',
    planet: 'Lua',
    gemstone: ['amatista', 'lapislazúli', 'safira'],
    yogaPose: 'Balasana (Postura da Criança)',
    aromatherapy: ['Lavanda', 'Incenso', 'Sálvia'],
    sound: 'A',
    sequence: 6,
    v4Features: {
      energyFlow: ['Visão interior', 'Intuição desperta', 'Sabedoria cósmica'],
      meditationStages: ['Third eye activation', 'Inner vision practice', 'Intuition development'],
      sacredGeometry: ['Triângulo invertido', 'Estrela de 7 pontas', 'Olho de Shiva'],
      mantras: ['OM', 'Om Ajna', 'Shiva bija'],
      yantras: ['Yantra do Ajna', 'Triângulo invertido', 'Olho de luz'],
      activationSteps: ['Afirmação de intuição', 'Visualização indigo', 'Mantra OM repetição', 'Postura Balasana'],
      healingTechniques: ['Terapia do terceiro olho', 'Aromaterapia com lavanda', 'Meditação trascendental'],
      counterBalance: 'Root',
      parallelChakras: ['ajna-light', 'third-eye-vision'],
    },
  },
  {
    id: 'crown',
    name: 'Sahasrara',
    namePt: 'Coronário',
    nameEn: 'Crown',
    sanskrit: 'सहस्रार',
    element: 'Cosmos',
    location: 'Topo da cabeça',
    color: 'Violeta',
    colorHex: '#9400D3',
    mantra: 'OM',
    qualities: ['Iluminação', 'Consciência cósmica', 'União divina', 'Sabedoria'],
    governs: ['Consciência espiritual', 'Conexão divina', 'Iluminação', 'União'],
    description: 'The crown chakra is the gateway to higher consciousness and divine connection. It represents our highest spiritual state and union with the divine. Located at the crown of the head, it governs our connection to spiritual wisdom and infinite consciousness.',
    descriptionPt: 'O chakra coronário é o portal para a consciência superior e conexão divina. Representa nosso estado espiritual mais elevado e união com o divino. Localizado no topo da cabeça, governa nossa conexão com a sabedoria espiritual e consciência infinita.',
    affirmation: 'I am connected to divine wisdom. I am one with all.',
    affirmationPt: 'Eu estou conectado à sabedoria divina. Eu sou um com tudo.',
    planet: 'Sol',
    gemstone: ['quartzo cristal', 'diamante', 'pirita'],
    yogaPose: 'Sukhasana (Postura Fácil) com meditação',
    aromatherapy: ['Lotus', 'Mirra', 'Olíba'],
    sound: 'B',
    sequence: 7,
    v4Features: {
      energyFlow: ['Consciência cósmica', 'Luz divina', 'União com o todo'],
      meditationStages: ['Crown opening', 'Divine connection', 'Enlightenment practice'],
      sacredGeometry: ['Círculo infinito', 'Flor de 1000 pétalas', 'Estrela de 12 dimensões'],
      mantras: ['OM', 'Om Sahasrara', 'Brahma bija'],
      yantras: ['Yantra do Sahasrara', 'Círculo de mil pétalas', 'Portal cósmico'],
      activationSteps: ['Afirmação de iluminação', 'Visualização violeta', 'Mantra OM repetição', 'Postura Sukhasana com meditação'],
      healingTechniques: ['Terapia coronária', 'Aromaterapia com lotus', 'Meditação de unidade'],
      counterBalance: 'Root',
      parallelChakras: ['sahasrara-cosmos', 'crown-enlightenment'],
    },
  },
];

export function getData(): ChakraV4Data[] {
  return chakraV4Data;
}