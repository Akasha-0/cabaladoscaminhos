/**
 * Chakra data for v2 system.
 */

export interface ChakraData {
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
}

const chakraData: ChakraData[] = [
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
    gemstone: [' hematita', 'turmalina negra', 'ônix'],
    yogaPose: 'Tadasana (Postura da Montanha)',
    aromatherapy: ['Sândalo', 'Patchouli', 'Gengibre'],
    sound: 'C',
    sequence: 1,
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
    governs: ['Fertilidade', 'Reprodutção', 'Intuição', 'Flexibilidade'],
    description: 'The sacral chakra governs our creativity, sexuality, and emotional balance. It is the center of our feelings, desires, and pleasure. Located below the navel, it represents the flow of life energy.',
    descriptionPt: 'O chakra sacral governa nossa criatividade, sexualidade e equilíbrio emocional. É o centro dos nossos sentimentos, desejos e prazer. Localizado abaixo do umbigo, representa o fluxo de energia vital.',
    affirmation: 'I honor my body. I deserve pleasure. I am creative.',
    affirmationPt: 'Eu honro meu corpo. Eu mereço prazer. Eu sou criativo.',
    planet: 'Lua',
    gemstone: [' cornalina', 'âmbar', 'pedra da lua'],
    yogaPose: 'Baddha Konasana (Postura da Borboleta)',
    aromatherapy: ['Ylang-Ylang', 'Laranja doce', 'Gerânio'],
    sound: 'D',
    sequence: 2,
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
    gemstone: [' topázio amarelo', 'citrino', 'âmbar dourado'],
    yogaPose: 'Agnisana (Postura do Fogo)',
    aromatherapy: ['Bergamota', 'Lemongrass', 'Gengibre'],
    sound: 'E',
    sequence: 3,
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
    gemstone: [' esmeralda', 'quartzo rosa', 'jade'],
    yogaPose: 'Bhujangasana (Postura da Cobra)',
    aromatherapy: ['Rosa', 'Ylang-Ylang', 'Bergamota'],
    sound: 'F',
    sequence: 4,
  },
  {
    id: 'throat',
    name: 'Vishuddha',
    namePt: 'Garganta',
    nameEn: 'Throat',
    sanskrit: 'विशुद्ध',
    element: 'Éter',
    location: 'Garganta',
    color: 'Azul',
    colorHex: '#0000FF',
    mantra: 'HAM',
    qualities: ['Comunicação', 'Expressão', 'Verdade', 'Autenticidade'],
    governs: ['Voz', 'Audição', 'Expressão criativa', 'Conexão social'],
    description: 'The throat chakra is the center of communication and self-expression. It governs our ability to speak our truth, express ourselves authentically, and communicate with clarity. Located at the throat, it is the gateway to expression.',
    descriptionPt: 'O chakra da garganta é o centro da comunicação e autoexpressão. Governa nossa capacidade de falar nossa verdade, expressar-nos autenticamente e comunicar com clareza. Localizado na garganta, é a porta de entrada para a expressão.',
    affirmation: 'I speak my truth clearly. I express myself authentically.',
    affirmationPt: 'Eu falo minha verdade claramente. Eu me expresso autenticamente.',
    planet: 'Mercúrio',
    gemstone: [' turquesa', 'água-marinha', 'lápis-lazúli'],
    yogaPose: 'Halasana (Postura do Arado)',
    aromatherapy: ['Camomila', 'Eucalipto', 'Menta'],
    sound: 'G',
    sequence: 5,
  },
  {
    id: 'third-eye',
    name: 'Ajna',
    namePt: 'Terceiro Olho',
    nameEn: 'Third Eye',
    sanskrit: 'आज्ञा',
    element: 'Luz',
    location: 'Entre as sobrancelhas',
    color: 'Azul Escuro',
    colorHex: '#000080',
    mantra: 'OM',
    qualities: ['Intuição', 'Visão interior', 'Sabedoria', 'Discernimento'],
    governs: ['Percepção', 'Imaginação', 'Intuição', 'Consciência superior'],
    description: 'The third eye chakra is the center of intuition, perception, and inner wisdom. It governs our ability to see beyond the physical realm and access higher consciousness. Located between the eyebrows, it is the seat of inner vision.',
    descriptionPt: 'O chakra do terceiro olho é o centro da intuição, percepção e sabedoria interior. Governa nossa capacidade de ver além do reino físico e acessar uma consciência superior. Localizado entre as sobrancelhas, é a sede da visão interior.',
    affirmation: 'I trust my intuition. I see clearly. I am wise.',
    affirmationPt: 'Eu confio na minha intuição. Eu vejo claramente. Eu sou sábio.',
    planet: 'Saturno',
    gemstone: ['safíra', 'lapislazuli', 'ametista'],
    yogaPose: 'Shambhavi Mudra (Gaze of the Third Eye)',
    aromatherapy: ['Sálvia', 'Lavanda', 'Incenso'],
    sound: 'A',
    sequence: 6,
  },
  {
    id: 'crown',
    name: 'Sahasrara',
    namePt: 'Coroa',
    nameEn: 'Crown',
    sanskrit: 'सहस्रार',
    element: 'Espírito',
    location: 'Topo da cabeça',
    color: 'Violeta',
    colorHex: '#8F00FF',
    mantra: 'OM',
    qualities: ['Espiritualidade', 'Iluminação', 'Conexão divina', 'Transcendência'],
    governs: ['Consciência cósmica', 'Inspiração', 'Devoção', 'Unidade'],
    description: 'The crown chakra is the center of spiritual connection and divine consciousness. It represents our highest state of awareness and our connection to the divine. Located at the top of the head, it is the gateway to transcendence.',
    descriptionPt: 'O chakra da coroa é o centro da conexão espiritual e consciência divina. Representa nosso mais alto estado de consciência e nossa conexão com o divino. Localizado no topo da cabeça, é a porta de entrada para a transcendência.',
    affirmation: 'I am connected to divine wisdom. I am one with all.',
    affirmationPt: 'Eu estou conectado com a sabedoria divina. Eu sou um com tudo.',
    planet: 'Netuno',
    gemstone: [' ametista', 'quartzo cristal', 'diamante'],
    yogaPose: 'Sirsasana (Postura da Cabeça)',
    aromatherapy: ['Lotus', 'Fragrâncias celestiais', 'Rosa sagrada'],
    sound: 'B',
    sequence: 7,
  },
];

export function getData(): ChakraData[] {
  return chakraData;
}

export function getChakraDataById(id: string): ChakraData | undefined {
  return chakraData.find((chakra) => chakra.id === id);
}