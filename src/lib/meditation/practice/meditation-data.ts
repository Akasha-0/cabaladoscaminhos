/* eslint-disable @typescript-eslint/no-unused-vars */
/* prettier-ignore */
/* eslint-disable perfectionist/sort-objects */

import type { Meditation, MeditationPhase } from '../types';

const beginner_phases: MeditationPhase[] = [
  {
    name: 'Centramento',
    duration: 120,
    script: 'Encontre uma posição confortável e feche os olhos.',
    guidance: 'Respire profundamente três vezes.',
  },
  {
    name: 'Expansão',
    duration: 180,
    script: 'Permita que sua consciência se.expanda suavemente.',
    guidance: 'Sinta seu corpo como espaço.',
  },
  {
    name: 'Integração',
    duration: 60,
    script: 'Traga sua atenção de volta ao espaço presente.',
    guidance: 'Honre este momento.',
  },
];

const intermediate_phases: MeditationPhase[] = [
  {
    name: 'Ancoragem',
    duration: 60,
    script: 'Conecte-se com a firmeza da terra sob seus pés.',
    guidance: 'Sinta-se completamente ancorado.',
  },
  {
    name: 'Respiração Consciente',
    duration: 240,
    script: 'Observe o fluxo natural da respiração sem modificar.',
    guidance: 'Cada inhale expande, cada exhale libera.',
  },
  {
    name: 'Expansão Sensorial',
    duration: 180,
    script: 'Abrande sua percepção para incluir sons distantes.',
    guidance: 'Ouça além do silêncio.',
  },
  {
    name: 'Retorno',
    duration: 120,
    script: 'Gentilmente traga a consciência de volta ao corpo.',
    guidance: 'Mova os dedos das mãos e dos pés.',
  },
];

const advanced_phases: MeditationPhase[] = [
  {
    name: 'Vazio Inicial',
    duration: 300,
    script: 'Dissolva toda forma, som e pensamento.',
    guidance: 'Descanse no vazio luminoso.',
  },
  {
    name: 'Presença Autoproduzida',
    duration: 600,
    script: 'Permita que a consciência testemunhe a si mesma.',
    guidance: 'Você é aquele que observa.',
  },
  {
    name: 'Unificação',
    duration: 300,
    script: 'Junte sujeito e objeto em uma só clareza.',
    guidance: 'Não há mais nada a observar.',
  },
  {
    name: 'Retorno ao Mundo',
    duration: 60,
    script: 'Traga esta consciência expandida para o corpo.',
    guidance: 'Abra os olhos sem pressa.',
  },
];

const meditationsData: Meditation[] = [
  {
    id: 'meditacao-cura-01',
    title: 'Cura do Campo Áurico',
    category: 'cura',
    duration: 600,
    description: 'Liberação de bloqueios emocionais através da harmonização dos corpos sutis.',
    tags: ['cura', 'campo-aurico', 'emocional'],
    phases: [
      {
        name: 'Purificação',
        duration: 120,
        script: 'Visualize uma luz dourada envolve seu campo áurico.',
        guidance: 'Sinta a luz PURIFICANDO-CADA-CAMADA.',
      },
      {
        name: 'Canalização',
        duration: 300,
        script: 'Convide a energia curativa de seu Eu Superior.',
        guidance: 'Abrace completo o que emerge.',
      },
      {
        name: 'Consolidação',
        duration: 180,
        script: 'Selle a energia curativa em seu campo vital.',
        guidance: 'Integre esta nova frequência.',
      },
    ],
  },
  {
    id: 'meditacao-sono-01',
    title: 'Descida ao Silêncio',
    category: 'sono',
    duration: 900,
    description: 'Meditação para soltar o dia e preparar um sono profundo e restaurador.',
    tags: ['sono', 'relaxamento', 'noite'],
    phases: [
      {
        name: 'Lançamento',
        duration: 180,
        script: 'Release hoje toda preocupação e pensamento.',
        guidance: 'Você não precisa resolver nada esta noite.',
      },
      {
        name: 'Dissolução',
        duration: 360,
        script: 'Permita que a tensão se dissolva como névoa ao amanhecer.',
        guidance: 'Cada músculo pode relaxar agora.',
      },
      {
        name: 'Mergulho',
        duration: 300,
        script: 'Desça suavemente para o descanso profundo.',
        guidance: 'Permita-se adormecer naturalmente.',
      },
    ],
  },
  {
    id: 'meditacao-foco-01',
    title: 'Clareza Mental Flash',
    category: 'foco',
    duration: 300,
    description: 'Ritual breve para limpiar a mente antes de sessões de trabalho concentrado.',
    tags: ['foco', 'clareza', 'trabalho'],
    phases: [
      {
        name: 'Parada',
        duration: 60,
        script: 'Interrompa todo o pensamento discursivo.',
        guidance: 'Um momento de silêncio interno.',
      },
      {
        name: 'Foco',
        duration: 180,
        script: 'Estabeleça uma intenção clara e singular.',
        guidance: 'Uma tarefa, uma direção, um propósito.',
      },
      {
        name: 'Lançamento',
        duration: 60,
        script: 'Mantenha a intenção enquanto abre os olhos.',
        guidance: 'Entre em ação com clareza.',
      },
    ],
  },
  {
    id: 'meditacao-energia-01',
    title: 'Despertar da Serpente',
    category: 'energia',
    duration: 480,
    description: 'Ativação da kundalini para despertar vitalidade e criatividade.',
    tags: ['energia', 'kundalini', 'vitalidade'],
    phases: intermediate_phases,
  },
  {
    id: 'meditacao-sagrado-01',
    title: 'Caminho da Luz',
    category: 'sagrado',
    duration: 1200,
    description: 'Prática contemplativa para acesso ao estados non-ordinários de consciência.',
    tags: ['sagrado', 'contemplacao', 'luz'],
    phases: advanced_phases,
  },
  {
    id: 'meditacao-cura-02',
    title: 'Acolhimento do Inner Child',
    category: 'cura',
    duration: 720,
    description: 'Reconciliação com nossa criança interior através de compaixão amorosa.',
    tags: ['cura', 'inner-child', 'autoestima'],
    phases: intermediate_phases,
  },
  {
    id: 'meditacao-sono-02',
    title: 'Ninar a Mente',
    category: 'sono',
    duration: 600,
    description: 'Conversa suave com a mente para acalmá-la antes do descanso.',
    tags: ['sono', 'mente', 'calma'],
    phases: beginner_phases,
  },
  {
    id: 'meditacao-foco-02',
    title: 'Presença Total',
    category: 'foco',
    duration: 600,
    description: 'Entrada em estado de FLOW através do alinhamento de intent and attention.',
    tags: ['foco', 'flow', 'presenca'],
    phases: intermediate_phases,
  },
  {
    id: 'meditacao-energia-02',
    title: 'Carga Solar',
    category: 'energia',
    duration: 450,
    description: 'Absorção de energia solar para revitalização do corpo físico e sutil.',
    tags: ['energia', 'solar', 'vitalidade'],
    phases: beginner_phases,
  },
  {
    id: 'meditacao-sagrado-02',
    title: 'Covoca do Sagrado',
    category: 'sagrado',
    duration: 900,
    description: 'Invocação de proteção e bênção através de mantras e visualizações sagradas.',
    tags: ['sagrado', 'invocacao', 'protecao'],
    phases: intermediate_phases,
  },
  {
    id: 'meditacao-cura-03',
    title: 'Perdão Profundo',
    category: 'cura',
    duration: 900,
    description: 'Dissolução de ressentimentos através da prática de compaixão radical.',
    tags: ['cura', 'perdao', 'libertacao'],
    phases: advanced_phases,
  },
  {
    id: 'meditacao-sagrado-03',
    title: 'Yoga Nidra',
    category: 'sagrado',
    duration: 1200,
    description: 'Estado de sono consiente para acesso ao inconsciente e cura profunda.',
    tags: ['sagrado', 'yoga-nidra', 'sono-consciente'],
    phases: advanced_phases,
  },
  {
    id: 'meditacao-energia-03',
    title: 'Respiração do Fogo',
    category: 'energia',
    duration: 360,
    description: 'Pranayama energizante para despertar o prana e dissolver a inércia.',
    tags: ['energia', 'pranayama', 'fogo'],
    phases: beginner_phases,
  },
  {
    id: 'meditacao-foco-03',
    title: 'Meditação Vipassana Breve',
    category: 'foco',
    duration: 600,
    description: 'Observação da impermanência através da atenção focada nas sensações.',
    tags: ['foco', 'vipassana', ' mindfulness'],
    phases: intermediate_phases,
  },
];

export function getData(): Meditation[] {
  return [...meditationsData];
}

export function getMeditationById(id: string): Meditation | undefined {
  return meditationsData.find((m) => m.id === id);
}

export function getMeditationsByCategory(
  category: Meditation['category']
): Meditation[] {
  return meditationsData.filter((m) => m.category === category);
}

export function getMeditationsByDuration(
  maxDuration: number
): Meditation[] {
  return meditationsData.filter((m) => m.duration <= maxDuration);
}
