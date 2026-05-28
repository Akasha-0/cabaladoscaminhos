/**
 * Kundalini data for the energy system.
 */

export interface KundaliniData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  sanskrit: string;
  chakra: string;
  element: string;
  location: string;
  color: string;
  colorHex: string;
  qualities: string[];
  effects: string[];
  symptoms: string[];
  practices: string[];
  description: string;
  descriptionPt: string;
  awakeningSigns: string[];
  sequence: number;
}

const kundaliniData: KundaliniData[] = [
  {
    id: 'dormant',
    name: 'Kundalini Shakti',
    namePt: 'Kundalini Adormecida',
    nameEn: 'Dormant Kundalini',
    sanskrit: 'कुंडलिनी शक्ति',
    chakra: 'root',
    element: 'Fogo',
    location: 'Base da coluna vertebral',
    color: 'Amarelo-dourado',
    colorHex: '#FFD700',
    qualities: ['Potência', 'Energia latente', 'Força vital', 'Liberdade'],
    effects: ['Armazenamento de energia', 'Potencial adormecido', 'Reservatório de força'],
    symptoms: ['Inércia', 'Baixa energia', 'Bloqueios emocionais'],
    practices: ['Respiração básica', 'Posturas simples', 'Meditação inicial'],
    description: 'Kundalini is the primordial cosmic energy that lies dormant at the base of the spine, coiled like a serpent. It represents the dormant spiritual potential within every being.',
    descriptionPt: 'Kundalini é a energia cósmica primordial que jaz adormecida na base da coluna, enrolada como uma serpente. Representa o potencial espiritual latente dentro de cada ser.',
    awakeningSigns: ['Sensação de calor na base da coluna', 'Formigamento', 'Fascinação espiritual'],
    sequence: 0,
  },
  {
    id: 'root-chakra',
    name: 'Muladhara activation',
    namePt: 'Ativação do Muladhara',
    nameEn: 'Root Chakra Activation',
    sanskrit: 'मूलाधार',
    chakra: 'root',
    element: 'Terra',
    location: 'Base da coluna, entre o cóccix e o sacro',
    color: 'Vermelho',
    colorHex: '#FF0000',
    qualities: ['Sobrevivência', 'Segurança', 'Estabilidade', 'Conexão terrestre'],
    effects: ['Estabilização física', 'Sensação de enraizamento', 'Fortalecimento do corpo'],
    symptoms: ['Calor na base da coluna', 'Vibração nas pernas', 'Estabilidade emocional'],
    practices: ['Asanas de接地', 'Mantras LAM', 'Exercícios deaterramento'],
    description: 'The first stage of Kundalini awakening begins at the Root Chakra. This activation grounds the practitioner and establishes the foundation for higher energy flow.',
    descriptionPt: 'O primeiro estágio do despertar Kundalini começa no Chakra Raiz. Esta ativação ancora o praticante e estabelece a fundação para o fluxo de energia superior.',
    awakeningSigns: ['Fortalecimento da coluna', 'Sensação de estabilidade', 'Conexão com a terra'],
    sequence: 1,
  },
  {
    id: 'sacral-chakra',
    name: 'Svadhisthana activation',
    namePt: 'Ativação do Svadhisthana',
    nameEn: 'Sacral Chakra Activation',
    sanskrit: 'स्वाधिष्ठान',
    chakra: 'sacral',
    element: 'Água',
    location: 'Baixo abdômen, abaixo do umbigo',
    color: 'Laranja',
    colorHex: '#FF8000',
    qualities: ['Criatividade', 'Sexualidade', 'Emoções', 'Fluidez'],
    effects: ['Fluxo criativo', 'Liberação emocional', 'Vitalidade sexual'],
    symptoms: ['Sensação de ondas', 'Liberação de fluidos', 'Emoções intensificadas'],
    practices: ['Movimentos fluidos', 'Mantras VAM', 'Dance sagrada'],
    description: 'The second stage activates the Sacral Chakra, releasing stored emotional blocks and awakening the creative life force that flows through the pelvis.',
    descriptionPt: 'O segundo estágio ativa o Chakra Sacral, liberando bloqueios emocionais armazenados e despertando a força vital criativa que flui através da pelve.',
    awakeningSigns: ['Liberação criativa', 'Harmonização emocional', 'Fluidez nos movimentos'],
    sequence: 2,
  },
  {
    id: 'solar-plexus',
    name: 'Manipura activation',
    namePt: 'Ativação do Plexo Solar',
    nameEn: 'Solar Plexus Activation',
    sanskrit: 'मणिपूर',
    chakra: 'solar-plexus',
    element: 'Fogo',
    location: 'Epigástrio, área do estômago',
    color: 'Amarelo',
    colorHex: '#FFFF00',
    qualities: ['Poder pessoal', 'Vontade', 'Autoconfiança', 'Transformação'],
    effects: ['Fortificação do eu', 'Aumento dawill power', 'Transformação pessoal'],
    symptoms: ['Calor no plexo solar', 'Expansão do ego', 'Chamas internas'],
    practices: ['Pranayama intenso', 'Mantras RAM', 'Fogo interno meditation'],
    description: 'The third stage ignites the Solar Plexus, awakening personal power and the fire of transformation. This is where Kundalini burns away impurities.',
    descriptionPt: 'O terceiro estágio acende o Plexo Solar, despertando poder pessoal e o fogo da transformação. É aqui que Kundalini queima impurezas.',
    awakeningSigns: ['Poder pessoal aumentado', 'Confiança interior', 'Capacidade de transformação'],
    sequence: 3,
  },
  {
    id: 'heart-chakra',
    name: 'Anahata activation',
    namePt: 'Ativação do Anahata',
    nameEn: 'Heart Chakra Activation',
    sanskrit: 'अनाहत',
    chakra: 'heart',
    element: 'Ar',
    location: 'Centro do peito',
    color: 'Verde',
    colorHex: '#00FF00',
    qualities: ['Amor incondicional', 'Compassão', 'Perdão', 'Conexão'],
    effects: ['Expansão do coração', 'Liberação do amor', 'Unificação interior'],
    symptoms: ['Abertura do peito', 'Sensação de expansão', 'Lágrimas de alegria'],
    practices: ['Meditação de amor', 'Mantras YAM', 'Prática do perdão'],
    description: 'The fourth stage opens the Heart Chakra, flooding the system with unconditional love and compassion. This is the bridge between lower and upper chakras.',
    descriptionPt: 'O quarto estágio abre o Chakra do Coração, inundando o sistema com amor incondicional e compaixão. Este é a ponte entre os chakras inferiores e superiores.',
    awakeningSigns: ['Amor incondicional', 'Compassão profunda', 'Perdão total'],
    sequence: 4,
  },
  {
    id: 'throat-chakra',
    name: 'Vishuddha activation',
    namePt: 'Ativação do Vishuddha',
    nameEn: 'Throat Chakra Activation',
    sanskrit: 'विशुद्ध',
    chakra: 'throat',
    element: 'Éter',
    location: 'Garganta',
    color: 'Azul',
    colorHex: '#0000FF',
    qualities: ['Comunicação', 'Verdade', 'Expressão autêntica', 'Criação'],
    effects: ['Clareza de comunicação', 'Expressão verdadeira', 'Criação sagrada'],
    symptoms: ['Vibração na garganta', 'Clareza mental', 'Voz expandida'],
    practices: ['Canto sagrado', 'Mantras HAM', 'Expressão criativa'],
    description: 'The fifth stage activates the Throat Chakra, enabling true self-expression and communion with higher guidance. Communication becomes a sacred act.',
    descriptionPt: 'O quinto estágio ativa o Chakra da Garganta, permitindo verdadeira autoexpressão e comunhão com orientação superior. A comunicação se torna um ato sagrado.',
    awakeningSigns: ['Comunicação clara', 'Expressão autêntica', 'Conexão com a verdade'],
    sequence: 5,
  },
  {
    id: 'third-eye',
    name: 'Ajna activation',
    namePt: 'Ativação do Ajna',
    nameEn: 'Third Eye Activation',
    sanskrit: 'आज्ञा',
    chakra: 'third-eye',
    element: 'Luz',
    location: 'Entre as sobrancelhas',
    color: 'Índigo',
    colorHex: '#4B0082',
    qualities: ['Intuição', 'Visão interior', 'Sabedoria', 'Discernimento'],
    effects: ['Expansão da consciência', 'Percepção intuitiva', 'Visão clara'],
    symptoms: ['Pressão entre sobrancelhas', 'Visões', 'Clareza mental profunda'],
    practices: ['Meditação no terceiro olho', 'Mantras OM', 'Visualização avançada'],
    description: 'The sixth stage awakens the Third Eye, opening perception to subtler realms and inner guidance. Intuition becomes a primary sense.',
    descriptionPt: 'O sexto estágio desperta o Terceiro Olho, abrindo a percepção para reinos mais sutis e orientação interior. A intuição se torna um sentido primário.',
    awakeningSigns: ['Visão intuitiva', 'Percepção ampliada', 'Sabedoria interior'],
    sequence: 6,
  },
  {
    id: 'crown-chakra',
    name: 'Sahasrara activation',
    namePt: 'Ativação do Sahasrara',
    nameEn: 'Crown Chakra Activation',
    sanskrit: 'सहस्रार',
    chakra: 'crown',
    element: 'Consciência',
    location: 'Topo da cabeça',
    color: 'Violeta',
    colorHex: '#8B00FF',
    qualities: ['Iluminação', 'União divina', 'Consciência cósmica', 'Transcendência'],
    effects: ['Expansão para o divino', 'Consciência cósmica', 'Libertação final'],
    symptoms: ['Sensação de abertura no topo', 'Luz dourada', 'Expansão infinita'],
    practices: ['Meditação de unidade', 'Mantras silêncio', 'Consciência sem objeto'],
    description: 'The seventh stage is the full activation of the Crown Chakra, where Kundalini reaches its ultimate destination and merges with universal consciousness.',
    descriptionPt: 'O sétimo estágio é a ativação completa do Chakra da Coroa, onde Kundalini alcança seu destino final e se funde com a consciência universal.',
    awakeningSigns: ['Iluminação', 'União com o divino', 'Consciência cósmica'],
    sequence: 7,
  },
];

export function getData(): KundaliniData[] {
  return kundaliniData;
}

export function getKundaliniDataById(id: string): KundaliniData | undefined {
  return kundaliniData.find((k) => k.id === id);
}