// meditation.ts — Meditation Generator using Minimax API
// Generates guided meditation scripts based on duration and theme

export type MeditationTheme = 'cura' | 'proteção' | 'prosperidade' | 'amor' | 'sabedoria';

export interface MeditationPhases {
  intro: string;
  breathing: string;
  visualization: string;
  affirmation: string;
  close: string;
}

export interface MeditationResult {
  theme: MeditationTheme;
  duration: number;
  phases: MeditationPhases;
}

// ─── Theme Definitions ─────────────────────────────────────────────────────────

const THEME_CONTENT: Record<MeditationTheme, {
  title: string;
  visualization: string;
  affirmation: string;
}> = {
  cura: {
    title: 'Cura',
    visualization: 'Visualize uma luz dourada envolvendo todo o seu corpo. Sinta cada célula sendo preenchida com energia restauradora. Deixe a luz atravessar qualquer área de dor ou desconforto, transmutando-a em paz. Você é luz, você é cura.',
    affirmation: 'EU Curo minha mente, meu corpo e minha alma. A energia restauradora flui através de mim a cada respiração. Sou merecedor de saúde e bem-estar completos. cure flui livremente através de mim.',
  },
  proteção: {
    title: 'Proteção',
    visualization: 'Visualize um escudo de luz pura ao seu redor, emanando do seu centro. Este escudo é impenetrável a qualquer energia negativa. Sinta a presença dos seus guias espirituais criando uma barreira protetora invisível e poderosa.',
    affirmation: 'EU Estou protegido(a) por forças espirituais superiores. Nada de negativo pode penetrar minha aura. Sou cercado(a) por proteção divina em todos os momentos.',
  },
  prosperidade: {
    title: 'Prosperidade',
    visualization: 'Visualize abundance fluindo para sua vida como um rio de luz dourada. Cada pensamento positivo atrai mais abundância. Sinta a energia da prosperidade preenchendo todos os aspectos da sua vida.',
    affirmation: 'EU Abro-me para a abundância infinita do universo. prosperidade flui para mim de todas as direções. Sou um imã para prosperidade e riqueza.',
  },
  amor: {
    title: 'Amor',
    visualization: 'Visualize o amor incondicional emanando do seu coração como ondas de luz rosa. Este amor se expande para alcançar todos que você ama e também a si mesmo. Permita-se receber amor profundo.',
    affirmation: 'EU Sou digno(a) de amor incondicional. O amor flui através de mim e para mim sem restrições. Abençoo a mim mesmo(a) e a todos os seres com amor verdadeiro.',
  },
  sabedoria: {
    title: 'Sabedoria',
    visualization: 'Visualize uma chama de luz azul-violeta acima da sua cabeça, representando a chama da intuição. Deixe esta chama descer e preencher sua mente com clareza e sabedoria interior.',
    affirmation: 'EU Conecto-me com a sabedoria interior que habita em mim. A verdade se revela quando silencio minha mente. Confio na minha intuição e sabedoria.',
  },
};

// ─── Breathing Pattern Templates ───────────────────────────────────────────────

function getBreathingInstructions(duration: number): string {
  const isLong = duration > 5;
  const isVeryLong = duration > 15;

  if (isVeryLong) {
    return `Fase 1 - Respiração Profunda (2 minutos):
Inspire lentamente pelo nariz contando até 4. Segure o fôlego contando até 7. Expire pela boca contando até 8. Repita 4 vezes.

Fase 2 - Respiração Equilibrada (3 minutos):
Inspire contando até 4, segure por 4, expire por 4, segure por 4. Repita 9 vezes.

Fase 3 - Respiração Renovadora (2 minutos):
Inspire profundamente, segure brevemente, expire completamente. Deixe seu corpo relaxar profundamente a cada ciclo.`;
  }

  if (isLong) {
    return `Fase 1 - Respiração Centralizada (2 minutos):
Inspire pelo nariz contando até 4. Segure o fôlego contando até 4. Expire pela boca contando até 6. Repita 5 vezes.

Fase 2 - Respiração de Harmonia (3 minutos):
Inspire contando até 5, segure por 5, expire contando até 5. Mantenha o ritmo pausado e profundo.`;
  }

  // Short meditation: simple single-phase breathing
  return `Respiração Sagrada:
Inspire profundamente pelo nariz contando até 4. Segure o fôlego contando até 7. Expire lentamente pela boca contando até 8. Repita durante toda a seção de respiração, mantendo o foco no fluxo de ar e na sensação de relaxamento.`;
}

// ─── Script Generation ─────────────────────────────────────────────────────────

function generateIntro(duration: number, theme: MeditationTheme): string {
  const content = THEME_CONTENT[theme];
  return `Introdução à Meditação de ${content.title}

Encontre um lugar tranquilo onde não será perturbado(a). Sente-se em uma posição confortável com a coluna ereta, pés apoiados no chão, mãos relaxadas sobre os joelhos ou no colo.

Permita que seu corpo se acomode nesta posição. Solte qualquer tensão nos ombros, mandíbula e rosto. Feche os olhos suavemente.

Neste momento, você está prestes a embarcar em uma jornada interior de ${content.title.toLowerCase()}. Esta meditação durará aproximadamente ${duration} minutos. Projete-se mentalmente para este espaço sagrado de transformação.

Diga a si mesmo(a): "Dou as boas-vindas a esta experiência de ${content.title.toLowerCase()}. Estou pronto(a) para receber sua energia transformadora."`;
}

function generateClose(duration: number, theme: MeditationTheme): string {
  const content = THEME_CONTENT[theme];
  return `Encerramento

Trazer gradualmente sua consciência de volta ao corpo. Comece por mover seus dedos lentamente, depois as mãos, os braços. Mova seus ombros suavemente.

Respire profundamente três vezes, trazendo sua atenção de volta ao ambiente ao seu redor.

Ao fazer isso, carregue consigo a energia de ${content.title.toLowerCase()} que você cultivou durante esta prática. Esta energia permanece com você, continuando a trabalhar em sua vida além desta sessão.

Antes de abrir os olhos, diga a si mesmo(a):
"EU sou luz. EU sou paz. EU sou ${content.title.toLowerCase()}."

Agradheça a si mesmo(a) por dedicar este tempo à sua prática espiritual. Agradeça aos guias e à energia sagrada que o acompanharam.

Quando estiver pronto(a), abra os olhos lentamente. Tome um momento para se reorientar antes de continuar com seu dia. Que a paz desta prática permaneça em seu coração.`;
}

function generateVisualization(theme: MeditationTheme, duration: number): string {
  const content = THEME_CONTENT[theme];
  const isLong = duration > 5;
  const isVeryLong = duration > 15;

  const baseVisualization = `${content.visualization}

Permaneça nesta visualização, deixando que as imagens e sensations se aprofundem. Se sua mente divagar, gentilmente traga-a de volta para a luz.`;

  if (isVeryLong) {
    return `Visualização Guiada - Parte 1 (3 minutos):
${content.visualization}
Permaneça nesta visualização, permitindo que a luz preench every cell of your being.

Visualização Guiada - Parte 2 (3 minutos):
Agora, visualize a energia desta prática emanando do seu coração como ondas de luz curativa. Estas ondas se extendem para todas as direções, alcançando todos os que você ama e todos os que precisam de cura.

Visualização Guiada - Parte 3 (3 minutos):
Traga a energia de volta para o seu centro. Sinta-a integrando-se ao seu ser. Você não é apenas alguém que recebe cura - você é um canal de cura para o mundo.`;
  }

  if (isLong) {
    return `Visualização Guiada (5 minutos):
${content.visualization}

Agora, aprofunde esta visualização. Deixe que cada detalhe se torne mais vívido. As cores mais brilhantes, as sensações mais profundas. Você está criando realidade através da sua intenção.

Se pensamentos surgirem, deixe-os passar como nuvens no céu, sem apego. Sua única tarefa agora é manter o foco na luz.`;
  }

  return `Visualização (2 minutos):
${baseVisualization}`;
}

function generateAffirmation(theme: MeditationTheme): string {
  const content = THEME_CONTENT[theme];
  return `Afirmação de ${content.title}

Repita em voz baixa ou em silêncio, permitindo que cada palavra ressoa em seu ser:

"${content.affirmation}"

Repita esta afirmação pelo menos 3 vezes, sentindo a verdade destas palavras se instalar em sua consciência. Permita que elas se tornem parte da sua essência.`;
}

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * Generate a meditation script based on duration (in minutes) and theme.
 * @param duration - Duration in minutes (1-60)
 * @param theme - Meditation theme
 * @throws Error if duration is outside valid range or theme is invalid
 */
export function generateMeditation(
  duration: number,
  theme: MeditationTheme
): MeditationResult {
  // Validate duration
  if (duration < 1 || duration > 60) {
    throw new Error('Duration must be between 1 and 60 minutes');
  }

  // Validate theme
  const validThemes: MeditationTheme[] = ['cura', 'proteção', 'prosperidade', 'amor', 'sabedoria'];
  if (!validThemes.includes(theme)) {
    throw new Error(`Invalid theme: ${theme}. Valid themes are: ${validThemes.join(', ')}`);
  }

  return {
    theme,
    duration,
    phases: {
      intro: generateIntro(duration, theme),
      breathing: getBreathingInstructions(duration),
      visualization: generateVisualization(theme, duration),
      affirmation: generateAffirmation(theme),
      close: generateClose(duration, theme),
    },
  };
}
export default generateMeditation;