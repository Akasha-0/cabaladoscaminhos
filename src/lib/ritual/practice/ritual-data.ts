/* eslint-disable @typescript-eslint/no-unused-vars */
/* prettier-ignore */
/* eslint-disable perfectionist/sort-objects */

import type { RitualCategory } from '../ritual-types';

export interface RitualPhase {
  name: string;
  duration: number;
  script: string;
  guidance: string;
}

export interface Ritual {
  id: string;
  title: string;
  category: RitualCategory;
  duration: number;
  phases: RitualPhase[];
  description?: string;
  tags?: string[];
}

const beginner_phases: RitualPhase[] = [
  {
    name: 'Preparacao',
    duration: 120,
    script: 'Escolha um espaco tranquilo e prepare os materiais necesarios.',
    guidance: 'Respire profundamente e conecte-se com sua intencao.',
  },
  {
    name: 'Abertura',
    duration: 60,
    script: 'Acenda uma vela ou incenso para marcar o inicio do ritual.',
    guidance: 'Declare sua intencao em voz alta ou em silencio.',
  },
  {
    name: 'Pratica',
    duration: 180,
    script: 'Execute as etapas especificas do ritual com presencia.',
    guidance: 'Mantenha o foco em sua intencao durante toda a pratica.',
  },
  {
    name: 'Encerramento',
    duration: 60,
    script: 'Agradeza pela experiencia e despedca-se do espaco sagrado.',
    guidance: 'Permita que a energia se estabilize naturalmente.',
  },
];

const intermediate_phases: RitualPhase[] = [
  {
    name: 'Purificacao',
    duration: 120,
    script: 'Realize a limpeza energetica do espaco com sal, fumo ou agua sagrada.',
    guidance: 'Visualize toda energia densa sendo dissolvida.',
  },
  {
    name: 'Centramento',
    duration: 180,
    script: 'Sente-se em silencio e conecte-se com sua respiracao e corpo.',
    guidance: 'Sinta-se ancorado e presente no momento.',
  },
  {
    name: 'Invocacao',
    duration: 120,
    script: 'Chame as energias, guias ou elementos que deseja trabalhar.',
    guidance: 'Abrac a presenca que emerge em seu espaco interior.',
  },
  {
    name: 'Pratica Profunda',
    duration: 300,
    script: 'Execute o nucleo do ritual com devocao e presencia.',
    guidance: 'Permita que a magia aconteca naturalmente.',
  },
  {
    name: 'Integracao',
    duration: 120,
    script: 'Traga a consciencia de volta ao espaco presente.',
    guidance: 'Ancore as energias trabalhadas em seu campo vital.',
  },
];

const advanced_phases: RitualPhase[] = [
  {
    name: 'Jejum Energetico',
    duration: 240,
    script: 'Abstenha-se de alimentos densos e mantenha silencio interior.',
    guidance: 'Purifique corpo e mente para receber/downloads de luz.',
  },
  {
    name: 'Meditacao Profunda',
    duration: 480,
    script: 'Entre em estado expandido de consciencia.',
    guidance: 'Descanse no vazio luminoso antes de agir.',
  },
  {
    name: 'Transmutacao',
    duration: 360,
    script: 'Permita que a energia de trabalho atue sobre o campo sutil.',
    guidance: 'Observe sem apego enquanto a transformacao ocorre.',
  },
  {
    name: 'Ancoramento',
    duration: 180,
    script: 'Traga a consciencia expandida de volta ao corpo fisico.',
    guidance: 'Conecte-se com a terra e integre a nova frequencia.',
  },
  {
   name: 'Celebracao',
    duration: 120,
    script: 'Expresse gratidao pelo processo completado.',
    guidance: 'Honre o sagrado em todas as coisas.',
  },
];

const ritualsData: Ritual[] = [
  {
    id: 'ritual-protecao-01',
    title: 'Círculo de Proteção',
    category: 'protection',
    duration: 480,
    description: 'Criacao de um escudo energetico para protecao pessoal e do espaco sagrado.',
    tags: ['protecao', 'escudo', 'defesa'],
    phases: [
      {
        name: 'Purificacao',
        duration: 120,
        script: 'Limpe o espaco com sal grosso nos cantos e fumo deerva sagrada.',
        guidance: 'Sinta o espaco sendo purificado e preparado.',
      },
      {
        name: 'Invocacao',
        duration: 120,
        script: 'Pea aos guias e anjos da guarda que protejam este espaco.',
        guidance: 'Visualize um circulo de luz dourada ao seu redor.',
      },
      {
        name: 'Ancoramento',
        duration: 120,
        script: 'Plante firmemente os pes e sinta a conexao com a terra.',
        guidance: 'Sinta o escudo energetico se formando ao seu redor.',
      },
      {
        name: 'Selamento',
        duration: 120,
        script: 'Visualize o circulo se fechando e se fortalecendo.',
        guidance: 'Declare em voz alta: Estou protegido e seguro.',
      },
    ],
  },
  {
    id: 'ritual-prosperidade-01',
    title: 'Abundancia Divina',
    category: 'prosperity',
    duration: 600,
    description: 'Ritual para alinhar-se com a energia da abundancia e atrair prosperidade.',
    tags: ['prosperidade', 'abundancia', 'manifestacao'],
    phases: intermediate_phases,
  },
  {
    id: 'ritual-amor-01',
    title: 'Autocuidado Sagrado',
    category: 'love',
    duration: 720,
    description: 'Pratica de amor proprio e curacao emocional profunda.',
    tags: ['amor', 'autoestima', 'cuidado'],
    phases: [
      {
        name: 'Recebimento',
        duration: 180,
        script: 'Permita-se ser cuidado por voce mesmo.',
        guidance: 'Coloque as maos sobre o coracao e respire.',
      },
      {
        name: 'Perdao',
        duration: 240,
        script: 'Libere ressentimentos consigo mesmo e com outros.',
        guidance: 'Sinta o peso sendo dissipado a cada respiracao.',
      },
      {
        name: 'Nutricao',
        duration: 180,
        script: 'Visualize luz rosada preenchendo cada celula do seu ser.',
        guidance: 'Abrace-se com compaixao e bondade.',
      },
      {
        name: 'Gratidao',
        duration: 120,
        script: 'Agradea por tudo que voce e por tudo que vem.',
        guidance: 'Cultive appreciacao por sua existencia.',
      },
    ],
  },
  {
    id: 'ritual-cura-01',
    title: 'Baia Sagrada',
    category: 'healing',
    duration: 900,
    description: 'Descarrego e cura de traumas e feridas emocionais.',
    tags: ['cura', 'descargo', 'libertacao'],
    phases: advanced_phases,
  },
  {
    id: 'ritual-clareza-01',
    title: 'Oraculo Interior',
    category: 'clarity',
    duration: 540,
    description: 'Conexao com a intuicao para receber respostas e direcao.',
    tags: ['claridade', 'intuicao', 'oraculo'],
    phases: [
      {
        name: 'Silencio',
        duration: 180,
        script: 'Entre em silencio profundo e solte a mente.',
        guidance: 'Permita que os pensamentos passem sem apego.',
      },
      {
        name: 'Pergunta',
        duration: 120,
        script: 'Formule claramente a pergunta em sua mente.',
        guidance: 'Mantenha a pergunta com abertura e curiosidade.',
      },
      {
        name: 'Escuta',
        duration: 180,
        script: 'Observe qualquer imagem, sensacao ou pensamento que surja.',
        guidance: 'Confie na primeira impressao que emerge.',
      },
      {
        name: 'Anotacao',
        duration: 60,
        script: 'Registre o que recebeu em um diario ou papel.',
        guidance: 'Agradea pela sabedoria recebida.',
      },
    ],
  },
  {
    id: 'ritual-transformacao-01',
    title: 'Fenix Renascido',
    category: 'transformation',
    duration: 1200,
    description: 'Ritual de renascimento para deixar o velho para tras e reinventar-se.',
    tags: ['transformacao', 'renascimento', 'mudanca'],
    phases: advanced_phases,
  },
  {
    id: 'ritual-manifestacao-01',
    title: 'Pedido ao Universo',
    category: 'manifestation',
    duration: 480,
    description: 'Tecnica de manifestacao com o poder da intencao clara e sentida.',
    tags: ['manifestacao', 'intencao', 'desejo'],
    phases: beginner_phases,
  },
  {
    id: 'ritual-liberacao-01',
    title: 'Solta e Sobe',
    category: 'release',
    duration: 600,
    description: 'Pratica para soltar apegos, medos e padroes que nao servem mais.',
    tags: ['liberacao', 'solte', 'paz'],
    phases: [
      {
        name: 'Identificacao',
        duration: 120,
        script: 'Nomeie claramente o que deseja soltar.',
        guidance: 'Seja especifico e honesto consigo mesmo.',
      },
      {
        name: 'Soltura',
        duration: 240,
        script: 'Visualize colocando o que nao serve em uma bexiga ou balanco.',
        guidance: 'Sinta o alivio de deixar ir.',
      },
      {
        name: 'Dissolucao',
        duration: 120,
        script: 'Solte o balao ou estoure a bexiga visualizando a dissolucao completa.',
        guidance: 'Permita que se dissolva na luz.',
      },
      {
        name: 'Espaco',
        duration: 120,
        script: 'Permita que o espaco vazio seja preenchido por paz.',
        guidance: 'Celebre a liberdade conquistada.',
      },
    ],
  },
  {
    id: 'ritual-protecao-02',
    title: 'Banho de Salvia',
    category: 'protection',
    duration: 360,
    description: 'Limpeza energetica com fumo de erva sagrada para purificacao.',
    tags: ['protecao', 'limpeza', 'ervas'],
    phases: beginner_phases,
  },
  {
    id: 'ritual-amor-02',
    title: 'Cristal do Coracao',
    category: 'love',
    duration: 540,
    description: 'Trabalho com cristais para abrir e equilibrar o chakra do coracao.',
    tags: ['amor', 'coracao', 'cristais'],
    phases: intermediate_phases,
  },
];

export function getData(): Ritual[] {
  return [...ritualsData];
}

export function getRitualById(id: string): Ritual | undefined {
  return ritualsData.find((r) => r.id === id);
}

export function getRitualsByCategory(
  category: RitualCategory
): Ritual[] {
  return ritualsData.filter((r) => r.category === category);
}

export function getRitualsByDuration(
  maxDuration: number
): Ritual[] {
  return ritualsData.filter((r) => r.duration <= maxDuration);
}
