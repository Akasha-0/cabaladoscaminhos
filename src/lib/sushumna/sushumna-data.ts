 
// deno-lint-ignore-file no-explicit-any

/**
 * Sushumna data for the central energy channel.
 */

export interface SushumnaData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  sanskrit: string;
  location: string;
  color: string;
  colorHex: string;
  qualities: string[];
  effects: string[];
  association: string;
  description: string;
  descriptionPt: string;
  properties: string[];
  states: string[];
  sequence: number;
}

const sushumnaData: SushumnaData[] = [
  {
    id: 'sushumna-channel',
    name: 'Sushumna Nadi',
    namePt: 'Canal Sushumna',
    nameEn: 'Sushumna Channel',
    sanskrit: 'सुषुम्ना नाड़ी',
    location: 'Centro da coluna vertebral',
    color: 'Transparente a branco dourado',
    colorHex: '#FFFFFF',
    qualities: ['Equilíbrio', 'Harmonia', 'Centralização', 'União'],
    effects: ['Fluxo energético harmonizado', 'Alinhamento dos chakras', 'Conexão espiritual'],
    association: 'Eixo central do sistema energético',
    description: 'Sushumna is the central channel of the subtle body through which kundalini energy rises from the base of the spine to the crown. It is the path of liberation and spiritual awakening.',
    descriptionPt: 'Sushumna é o canal central do corpo sutil através do qual a energia kundalini sobe da base da coluna até o topo da cabeça. É o caminho da libertação e do despertar espiritual.',
    properties: ['Canal central', 'Reservatório de luz', 'Caminho da ascensão'],
    states: ['Dormante', 'Parcialmente aberto', 'Totalmente aberto'],
    sequence: 0,
  },
  {
    id: 'muladhara-connection',
    name: 'Muladhara Connection',
    namePt: 'Conexão com o Muladhara',
    nameEn: 'Root Chakra Connection',
    sanskrit: 'मूलाधार संबंध',
    location: 'Base da coluna - ponto de origem',
    color: 'Vermelho',
    colorHex: '#FF0000',
    qualities: ['Fundação', 'Ancoragem', 'Base segura', 'Apoio'],
    effects: ['Ponto de partida para ascensão', 'Enraizamento energético', 'Stabilidade do canal'],
    association: 'Origem do Sushumna no Muladhara',
    description: 'Sushumna originates at the Muladhara chakra at the base of the spine. This is where kundalini energy is stored and from which it begins its ascent.',
    descriptionPt: 'Sushumna se origina no chakra Muladhara na base da coluna. É onde a energia kundalini está armazenada e de onde começa sua ascensão.',
    properties: ['Ponto de origem', 'Base do canal', 'Reservatório inicial'],
    states: ['Ancorado', 'Ativado', 'Radiante'],
    sequence: 1,
  },
  {
    id: 'swadhisthana-connection',
    name: 'Svadhisthana Connection',
    namePt: 'Conexão com o Svadhisthana',
    nameEn: 'Sacral Chakra Connection',
    sanskrit: 'स्वाधिष्ठान संबंध',
    location: 'Região sacral - segunda etapa',
    color: 'Laranja',
    colorHex: '#FF8000',
    qualities: ['Criatividade', 'Fluidez', 'Transformação', 'Movimento'],
    effects: ['Fluidez energética', 'Transformação criativa', 'Liberação emocional'],
    association: 'Segunda etapa da ascensão',
    description: 'As kundalini rises through Sushumna, it passes through the Svadhisthana chakra, awakening creative energies and emotional transformation.',
    descriptionPt: 'À medida que kundalini sobe através do Sushumna, ela passa pelo chakra Svadhisthana, despertando energias criativas e transformação emocional.',
    properties: ['Ponto de transformação', 'Canal de criatividade', 'Fluidez emocional'],
    states: ['Fluindo', 'Transformando', 'Purificando'],
    sequence: 2,
  },
  {
    id: 'manipura-connection',
    name: 'Manipura Connection',
    namePt: 'Conexão com o Manipura',
    nameEn: 'Solar Plexus Connection',
    sanskrit: 'मणिपुर संबंध',
    location: 'Região abdominal - terceira etapa',
    color: 'Amarelo',
    colorHex: '#FFFF00',
    qualities: ['Poder pessoal', 'Determinação', 'Ação', 'Vitalidade'],
    effects: ['Fortecimento do poder pessoal', 'Clarificação da vontade', 'Aumento da vitalidade'],
    association: 'Terceira etapa da ascensão',
    description: 'The Manipura chakra connection strengthens personal power and will. Energy passing through this point activates personal transformation and metabolic processes.',
    descriptionPt: 'A conexão com o chakra Manipura fortalece o poder pessoal e a vontade. A energia que passa por este ponto ativa a transformação pessoal e os processos metabólicos.',
    properties: ['Ponto de poder', 'Centro de transformação', 'Reservatório de força'],
    states: ['Radiante', 'Energizado', 'Potencializado'],
    sequence: 3,
  },
  {
    id: 'anahata-connection',
    name: 'Anahata Connection',
    namePt: 'Conexão com o Anahata',
    nameEn: 'Heart Chakra Connection',
    sanskrit: 'अनाहट संबंध',
    location: 'Região do coração - quarta etapa',
    color: 'Verde e rosa',
    colorHex: '#00FF00',
    qualities: ['Amor', 'Compassão', 'Perdão', 'Harmonia'],
    effects: ['Abertura do coração', 'Despertar do amor incondicional', 'Harmonização emocional'],
    association: 'Quarta etapa - centro do amor',
    description: 'At the Anahata chakra, Sushumna becomes a channel for divine love. This is the pivotal point where personal transformation becomes spiritual awakening.',
    descriptionPt: 'No chakra Anahata, Sushumna se torna um canal para o amor divino. Este é o ponto crucial onde a transformação pessoal se torna despertar espiritual.',
    properties: ['Canal do amor', 'Ponte entre mundos', 'Porta do coração'],
    states: ['Aberto', 'Radiante', 'Transcendo'],
    sequence: 4,
  },
  {
    id: 'vishuddha-connection',
    name: 'Vishuddha Connection',
    namePt: 'Conexão com o Vishuddha',
    nameEn: 'Throat Chakra Connection',
    sanskrit: 'विशुद्ध संबंध',
    location: 'Região da garganta - quinta etapa',
    color: 'Azul claro',
    colorHex: '#00CCFF',
    qualities: ['Comunicação', 'Expressão', 'Verdade', 'Sons sagrados'],
    effects: ['Abertura da comunicação divina', 'Expressão da verdade interior', ' ressonância com sons sagrados'],
    association: 'Quinta etapa - centro da expressão',
    description: 'The Vishuddha chakra connection enables divine communication and expression. Energy passing through this point activates the throat center for spiritual truth.',
    descriptionPt: 'A conexão com o chakra Vishuddha permite a comunicação divina e a expressão. A energia que passa por este ponto ativa o centro da garganta para a verdade espiritual.',
    properties: ['Canal de expressão', 'Ponto de ressonância', 'Centro da verdade'],
    states: ['Harmonizado', 'Ressonante', 'Expressando'],
    sequence: 5,
  },
  {
    id: 'ajna-connection',
    name: 'Ajna Connection',
    namePt: 'Conexão com o Ajna',
    nameEn: 'Third Eye Connection',
    sanskrit: 'आज्ञा चक्र',
    location: 'Centro da testa - sexta etapa',
    color: 'Índigo',
    colorHex: '#4B0082',
    qualities: ['Intuição', 'Visão interior', 'Discernimento', 'Sabedoria'],
    effects: ['Abertura do terceiro olho', 'Despertar da intuição', 'Visão além do véu'],
    association: 'Sexta etapa - centro da visão',
    description: 'At Ajna chakra, Sushumna becomes a direct channel for higher perception. This is where the practitioner experiences inner vision and spiritual discernment.',
    descriptionPt: 'No chakra Ajna, Sushumna se torna um canal direto para a percepção superior. É aqui que o praticante experimenta a visão interior e o discernimento espiritual.',
    properties: ['Canal de visão', 'Ponto de percepção', 'Centro da intuição'],
    states: ['Iluminado', 'Vendo', 'Sabendo'],
    sequence: 6,
  },
  {
    id: 'sahasrara-connection',
    name: 'Sahasrara Connection',
    namePt: 'Conexão com o Sahasrara',
    nameEn: 'Crown Chakra Connection',
    sanskrit: 'सहस्रार',
    location: 'Topo da cabeça - etapa final',
    color: 'Branco e violeta',
    colorHex: '#FFFFFF',
    qualities: ['Iluminação', 'União com o divino', 'Consciência cósmica', 'Libertação'],
    effects: ['Realização espiritual', 'União com a consciência universal', 'Libertação do ciclo de reencarnação'],
    association: 'Etapa final - encontro com o divino',
    description: 'The Sahasrara connection represents the culmination of the Sushumna journey. When kundalini reaches this point, the practitioner experiences spiritual liberation and unity with the divine.',
    descriptionPt: 'A conexão com o Sahasrara representa a culminância da jornada do Sushumna. Quando kundalini atinge este ponto, o praticante experimenta a libertação espiritual e a unidade com o divino.',
    properties: ['Porta divina', 'Ponto de reunião', 'Centro da consciência suprema'],
    states: ['Aberto', 'Iluminado', 'Unificado'],
    sequence: 7,
  },
];

export function getData(): SushumnaData[] {
  return sushumnaData;
}

export function getSushumnaDataById(id: string): SushumnaData | undefined {
  return sushumnaData.find((s) => s.id === id);
}