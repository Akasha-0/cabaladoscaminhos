export type MeditationTheme = 'cura' | 'proteção' | 'prosperidade' | 'amor' | 'sabedoria';

interface MeditationScript {
  theme: MeditationTheme;
  duration: number;
  phases: {
    intro: string;
    breathing: string;
    visualization: string;
    affirmation: string;
    close: string;
  };
}

const THEME_FOCUS: Record<MeditationTheme, { visualization: string; affirmation: string; element: string }> = {
  cura: {
    visualization: 'Imagine uma luz dourada suave emanando do seu coração, fluindo por todo o corpo, restaurando cada célula com pureza e saúde',
    affirmation: 'Eu permito que meu corpo se cure e se renove. Cada célula ressoa com vitalidade e paz.',
    element: 'luz dourada',
  },
  proteção: {
    visualization: 'Visualize um escudo de luz cristalina envolvendo completamente seu corpo, criando uma barreira Impenetrável que só permite energia positiva',
    affirmation: 'Estou envolto em proteção divina. Nenhuma energia negativa pode me alcançAR.',
    element: 'escudo de luz cristalina',
  },
  prosperidade: {
    visualization: 'Imagine uma corrente brilhante de abundância descendo do universo, preenchendo seu campo energético com richesse e oportunidades',
    affirmation: 'A prosperidade flui naturalmente para mim. Sou um ímã para a abundância em todas as áreas da minha vida.',
    element: 'corrente de abundância',
  },
  amor: {
    visualization: 'Sinta seu coração irradiando ondas de amor incondicional, tocando tudo e todos ao seu redor com compaixão genuína',
    affirmation: 'Eu sou digno de amor. Amar e ser amado é meu direito divino. Abro meu coração para o amor universal.',
    element: 'amor incondicional',
  },
  sabedoria: {
    visualization: 'Visualize uma chama azul da intuição ardendo no seu terceiro olho, iluminando caminhos e revelando verdades ocultas',
    affirmation: 'A sabedoria divina me guia. Minhas decisões são claras e meu discernimento é perfeito.',
    element: 'chama da intuição',
  },
};

const BREATHING_PATTERNS: Record<string, { inhale: number; hold: number; exhale: number; cycles: number }> = {
  calming: { inhale: 4, hold: 4, exhale: 6, cycles: 6 },
  grounding: { inhale: 4, hold: 7, exhale: 8, cycles: 4 },
  energizing: { inhale: 6, hold: 2, exhale: 4, cycles: 5 },
};

function buildBreathingSection(pattern: { inhale: number; hold: number; exhale: number; cycles: number }): string {
  const { inhale, hold, exhale, cycles } = pattern;
  const total = inhale + hold + exhale;
  const lines: string[] = [];

  for (let i = 1; i <= cycles; i++) {
    lines.push(
      `**Respiração ${i}**\n` +
      `• Inspire profundamente pelo nariz por ${inhale} segundos, expandindo o abdômen\n` +
      `• Segure o ar por ${hold} segundos, sentindo a energia acumular\n` +
      `• Expire lentamente pela boca por ${exhale} segundos, liberando toda tensão\n` +
      `• Pausa natural por ${Math.max(1, total - (inhale + hold + exhale))} segundo(s)\n`
    );
  }

  return lines.join('\n');
}

function buildIntro(duration: number, theme: MeditationTheme): string {
  const themeNames: Record<MeditationTheme, string> = {
    cura: 'Cura',
    proteção: 'Proteção',
    prosperidade: 'Prosperidade',
    amor: 'Amor',
    sabedoria: 'Sabedoria',
  };

  return [
    `🎯 **Meditação de ${themeNames[theme]} — ${duration} minutos**\n`,
    'Encontre um lugar tranquilo onde não será interrompido.',
    'Sente-se ou deite-se em uma posição confortável.',
    'Feche os olhos suavemente e permita que seu corpo relaxe completamente.',
    'Solte qualquer tensão residual dos ombros, mandíbula e testa.',
    'Afirme internamente: "Estou pronto para receber esta meditação de forma profunda."',
  ].join('\n');
}

function buildClose(duration: number, theme: MeditationTheme): string {
  return [
    '\n🌟 **Encerramento**\n',
    'Tome mais três respirações profundas e慢 naturalmente.',
    'Agradeça a si mesmo por dedicar este tempo à sua prática.',
    'Comece a trazer sua atenção de volta ao ambiente ao seu redor.',
    'Quando se sentir preparado, abra lentamente os olhos.',
    `Mantenha a energia de ${theme} consigo ao longo do dia.`,
    '\n🙏 Que esta prática traga paz, clareza e transformação.\n',
  ].join('\n');
}

function buildPhases(duration: number, theme: MeditationTheme): MeditationScript['phases'] {
  const info = THEME_FOCUS[theme];

  if (duration <= 5) {
    return {
      intro: buildIntro(duration, theme),
      breathing: buildBreathingSection(BREATHING_PATTERNS.calming),
      visualization: `🧘 **Visualização de ${theme}**\n\n${info.visualization}\n\nPermaneça nesta imagem com toda sua atenção, deixando-a ganhar força e clareza a cada respiração.`,
      affirmation: `💬 **Afirmação**\n\n${info.affirmation}\n\nRepita mentalmente 3 vezes, sentindo cada palavra ressoar na sua essência.`,
      close: buildClose(duration, theme),
    };
  }

  const groundingCycles = Math.min(Math.floor((duration - 5) / 3), 4);

  return {
    intro: buildIntro(duration, theme),
    breathing: [
      '🫁 **Fase 1 — Respiração CalmanTE**\n',
      buildBreathingSection(BREATHING_PATTERNS.calming),
      '\n🫁 **Fase 2 — Enraizamento**\n',
      `Respire fundo e, a cada expiração, sinta-se mais fixado ao chão, como se raízes crescessem do seu corpo em direção ao centro da Terra.\n`,
      `Permaneça assim por ${groundingCycles} ciclos, sincronizando respiração e enraizamento.\n`,
    ].join(''),
    visualization: [
      `🧘 **Visualização Guiada**\n`,
      `${info.visualization}.\n`,
      `Imagine detalhes sensoriais: a textura, a temperatura, a cor exata, o movimento dessa energia.`,
      `Permita que esta imagem se intensifique, preenchendo todo o seu espaço interno.\n`,
      `Se pensamentos surgirem, observe-os com compaixão e retorne à visualização.`,
    ].join('\n'),
    affirmation: [
      '💬 **Afirmações**\n',
      `${info.affirmation}\n`,
      'Silenciosamente, repita esta afirmação por mais 5 ciclos respiratórios completos.',
    ].join('\n'),
    close: buildClose(duration, theme),
  };
}

export function generateMeditation(duration: number, theme: MeditationTheme): MeditationScript {
  if (duration < 1 || duration > 60) {
    throw new Error('Duration must be between 1 and 60 minutes');
  }

  const themes: MeditationTheme[] = ['cura', 'proteção', 'prosperidade', 'amor', 'sabedoria'];
  if (!themes.includes(theme)) {
    throw new Error(`Invalid theme. Choose one of: ${themes.join(', ')}`);
  }

  const phases = buildPhases(duration, theme);

  return {
    theme,
    duration,
    phases,
  };
}
