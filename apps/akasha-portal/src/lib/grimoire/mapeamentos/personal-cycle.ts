/**
 * Personal Cycle Mapeamentos — Numeração Cabalística do Ciclo de Vida
 *
 * Curated translation tables for the PersonalCycleEngine.
 * Replaces inline Record<> tables in personal-cycle-engine.ts.
 *
 * Each entry carries traditional numerological source (fonte) for auditability.
 * Following the same pattern as traducao-areas.ts and shadow-sintomas.ts.
 *
 * @version 1.0.0
 */

// ─── Pinnacles (1-9) ────────────────────────────────────────────────────────

export interface PinnacleEntry {
  theme: string;
  opportunities: string[];
  challenges: string[];
  /** fonte: traditional numerological basis */
  fonte: string;
}

export const PINNACLE_THEMES: Record<number, PinnacleEntry> = {
  1: {
    theme: 'Iniciativa, independência, construção da identidade',
    opportunities: ['Começar a vida adulta', 'Tomar decisões próprias', 'Liderar'],
    challenges: ['Egocentrismo', 'Pressão por resultados', 'Solidão'],
    fonte:
      'Cabalística clássica — número 1 = Sol, identidade, pioneirismo. Pináculo 1 = ciclo deestablishing self as separate from family of origin.',
  },
  2: {
    theme: 'Cooperação, paciência, desenvolvimento de talentos',
    opportunities: ['Parcerias', 'Diplomacia', 'Aprofundamento'],
    challenges: ['Indecisão', 'Dependência', 'Autocrítica'],
    fonte:
      'Cabalística clássica — número 2 = Lua, dualidade, receptividade. Pináculo 2 = ciclo de learning to relate as equal partner.',
  },
  3: {
    theme: 'Expressão criativa, alegria, expansão social',
    opportunities: ['Arte', 'Comunicação', 'Viagens'],
    challenges: ['Dispersão', 'Superficialidade', 'Fofoca'],
    fonte:
      'Cabalística clássica — número 3 = Júpiter, expansão, expressão. Pináculo 3 = ciclo de creative self-expression and social engagement.',
  },
  4: {
    theme: 'Trabalho duro, construção de base, segurança',
    opportunities: ['Carreira', 'Saúde', 'Família'],
    challenges: ['Rigidez', 'Trabalho excessivo', 'Limites rígidos'],
    fonte:
      'Cabalística clássica — número 4 = Urano/Raiz, estrutura, esforço. Pináculo 4 = ciclo de building practical foundations for security.',
  },
  5: {
    theme: 'Mudança, liberdade, aventura, transformação',
    opportunities: ['Viagens', 'Mudanças', 'Aprendizados'],
    challenges: ['Impulsividade', 'Instabilidade', 'Excessos'],
    fonte:
      'Cabalística clássica — número 5 = Mercúrio, movimento, liberdade. Pináculo 5 = ciclo of liberation from previous structure, often through travel or upheaval.',
  },
  6: {
    theme: 'Amor, responsabilidade, lar, comunidade',
    opportunities: ['Casamento', 'Filhos', 'Serviço'],
    challenges: ['Sacrifício', 'Controle', 'Perfeccionismo'],
    fonte:
      'Cabalística clássica — número 6 = Vênus, amor, harmonia. Pináculo 6 = ciclo of balancing love, responsibility, and creative service.',
  },
  7: {
    theme: 'Introspecção, estudo, espiritualidade, sabedoria',
    opportunities: ['Terapia', 'Estudo', 'Desenvolvimento espiritual'],
    challenges: ['Isolamento', 'Ansiedade', 'Paralisia'],
    fonte:
      'Cabalística clássica — número 7 = Netuno/Selene, introspecção, fé. Pináculo 7 = ciclo de withdrawal from outer world to develop inner wisdom.',
  },
  8: {
    theme: 'Poder, abundância, reconhecimento, autoridade',
    opportunities: ['Negócios', 'Investimentos', 'Carreira'],
    challenges: ['Workaholic', 'Materialismo', 'Pressão'],
    fonte:
      'Cabalística clássica — número 8 = Saturno, poder, matéria. Pináculo 8 = ciclo de materializing power and proving self through achievement.',
  },
  9: {
    theme: 'Humanitarismo, encerramento, compaixão, arte',
    opportunities: ['Voluntariado', 'Arte curativa', 'Viagens'],
    challenges: ['Melancolia', 'Soltar', 'Apego'],
    fonte:
      'Cabalística clássica — número 9 = Marte, completude, compaixão. Pináculo 9 = ciclo de completing a 9-year cycle, letting go, humanitarian service.',
  },
};

// ─── Challenges (0-9) ─────────────────────────────────────────────────────────

export interface ChallengeEntry {
  description: string;
  howToOvercome: string;
  lifeArea: string;
  fonte: string;
}

export const CHALLENGE_DESCRIPTIONS: Record<number, ChallengeEntry> = {
  0: {
    description: 'Você tem um dom natural mas deve aprender a equilibrar',
    howToOvercome: 'Meditação, presença e atenção ao próximo',
    lifeArea: 'Equilíbrio interior',
    fonte:
      'Número 0 em numerologia cabalística = potencial virgem, mestre número oculto. Ausência de desafio = aparente facilidade que esconde falta de esforço. Refere-se à need to develop discipline where natural talent creates illusion of effortlessness.',
  },
  1: {
    description: 'Tendência ao egocentrismo e à independência excessiva',
    howToOvercome: 'Pratique escuta ativa, colaboração e generosidade',
    lifeArea: 'Relacionamentos',
    fonte:
      'Cabalística — número 1 = Sol, ego, vontade. Desafio 1 = difficulty developing healthy independence without becoming self-absorbed or domineering.',
  },
  2: {
    description: 'Sensibilidade extrema e medo de conflito',
    howToOvercome: 'Desenvolva coragem para falar verdades, terapia',
    lifeArea: 'Comunicação',
    fonte:
      'Cabalística — número 2 = Lua, receptividade, yin. Desafio 2 = hypersensitivity creating tendency to avoid confrontation or manipulate indirectly.',
  },
  3: {
    description: 'Dificuldade de focar e terminar o que começa',
    howToOvercome: 'Disciplina, organização e um projeto por vez',
    lifeArea: 'Trabalho e criatividade',
    fonte:
      'Cabalística — número 3 = Júpiter, expressão, expansão. Desafio 3 = scattered creative energy that starts many things but finishes few — dispersion as defense against depth.',
  },
  4: {
    description: 'Rigidez, teimosia e resistência à mudança',
    howToOvercome: 'Flexibilidade, viagens e abertura ao novo',
    lifeArea: 'Mudanças e adaptação',
    fonte:
      'Cabalística — número 4 = Urano/Raiz, estrutura, inércia. Desafio 4 = rigidity and fear of change that manifests as stubbornness or excessive materialism.',
  },
  5: {
    description: 'Impulsividade, excessos e instabilidade',
    howToOvercome: 'Disciplina, rotina, moderação',
    lifeArea: 'Estabilidade',
    fonte:
      'Cabalística — número 5 = Mercúrio, movimento, mudança. Desafio 5 = excess and impulsivity that uses change as escape from internal work; difficulty with routine.',
  },
  6: {
    description: 'Perfeccionismo, controle e sacrifício excessivo',
    howToOvercome: 'Aceitar imperfeição, soltar, confiar',
    lifeArea: 'Amor e serviço',
    fonte:
      'Cabalística — número 6 = Vênus, harmonia, serviço. Desafio 6 = tendência a assumir responsabilidade pelos outros ou pelo mundo, criandomart via perfectionism and controlling love.',
  },
  7: {
    description: 'Isolamento, análise em excesso e desconfiança',
    howToOvercome: 'Comunidade, partilha, confiar no mistério',
    lifeArea: 'Conexão e fé',
    fonte:
      'Cabalística — número 7 = Netuno/Selene, introspecção, fé. Desafio 7 = over-analysis that leads to spiritual skepticism, isolation, and difficulty trusting others or the universe.',
  },
  8: {
    description: 'Materialismo, workaholismo e poder descontrolado',
    howToOvercome: 'Espiritualidade, equilíbrio vida-trabalho',
    lifeArea: 'Carreira e abundância',
    fonte:
      'Cabalística — número 8 = Saturno, poder, matéria. Desafio 8 = driven by fear of lack, manifesting as workaholism, materialism, or abuse of power for personal gain.',
  },
  9: {
    description: 'Culpa, autocondenação e dificuldade de perdoar',
    howToOvercome: 'Terapia, compaixão por si, soltar o passado',
    lifeArea: 'Liberação e aceitação',
    fonte:
      'Cabalística — número 9 = Marte, completude, compaixão. Desafio 9 = difficulty letting go of past hurts, self-judgment, and the temptation to dwell in victimhood rather than claim personal power.',
  },
};

// ─── Karmic Lessons (1-9) ─────────────────────────────────────────────────────

export interface KarmicLessonEntry {
  description: string;
  howToLearn: string;
  lifeArea: string;
  fonte: string;
}

export const KARMIC_LESSON_DESCRIPTIONS: Record<number, KarmicLessonEntry> = {
  1: {
    description: 'Lição de independência, liderança e auto-confiança',
    howToLearn: 'Pratique tomar decisões sozinho, confie na sua voz',
    lifeArea: 'Autonomia',
    fonte:
      'Cabalística — número 1 = Sol, vontade, self. Lição cármica 1 = números ausentes no mapa indicam lições que a alma chose before birth to work on in this lifetime.',
  },
  2: {
    description: 'Lição de paciência, diplomacia e cooperação',
    howToLearn: 'Medite sobre timing, cultive parcerias, espere',
    lifeArea: 'Relacionamentos',
    fonte:
      'Cabalística — número 2 = Lua, receptividade, dualidade. Lição cármica 2 = aprender a cooperar sem perder a própria voz.',
  },
  3: {
    description: 'Lição de expressão, criatividade e comunicação',
    howToLearn: 'Escreva, fale, cante, dance — se expresse!',
    lifeArea: 'Comunicação',
    fonte:
      'Cabalística — número 3 = Júpiter, expressão, expansão. Lição cármica 3 = superar inibição criativa e medo de se expressar.',
  },
  4: {
    description: 'Lição de disciplina, estrutura e trabalho árduo',
    howToLearn: 'Construa rotinas, persevere, honre o processo',
    lifeArea: 'Trabalho',
    fonte:
      'Cabalística — número 4 = Urano/Raiz, sistema, effort. Lição cármica 4 = desenvolver paciência com o processo e disciplina sem rigidez paralizante.',
  },
  5: {
    description: 'Lição de liberdade, mudança e adaptação',
    howToLearn: 'Viaje, experimente, rompa zonas de conforto',
    lifeArea: 'Liberdade',
    fonte:
      'Cabalística — número 5 = Mercúrio, liberdade, movimento. Lição cármica 5 = superar medos de mudança e abraçar a liberdade com responsabilidade.',
  },
  6: {
    description: 'Lição de amor, responsabilidade e serviço',
    howToLearn: 'Cuide de outros com equilíbrio, honre o lar',
    lifeArea: 'Amor e família',
    fonte:
      'Cabalística — número 6 = Vênus, harmonia, serviço. Lição cármica 6 = aprender a amar sem controlar e servir sem se sacrificar.',
  },
  7: {
    description: 'Lição de introspecção, fé e sabedoria',
    howToLearn: 'Estude filosofia, medite, mergulhe no silêncio',
    lifeArea: 'Espiritualidade',
    fonte:
      'Cabalística — número 7 = Netuno/Selene, fé, conhecimento interior. Lição cármica 7 = desenvolver confiança na sabedoria interior e na ordem invisível do universo.',
  },
  8: {
    description: 'Lição de poder, abundância e manifestação',
    howToLearn: 'Desenvolva valor próprio, gerencie recursos',
    lifeArea: 'Abundância',
    fonte:
      'Cabalística — número 8 = Saturno, poder, manifestação. Lição cármica 8 = superar medo de abundancia e desenvolverautoridade interna sobre recursos próprios.',
  },
  9: {
    description: 'Lição de compaixão, encerramento e serviço',
    howToLearn: 'Voluntarie, perdoe, solte o que não serve',
    lifeArea: 'Humanitarismo',
    fonte:
      'Cabalística — número 9 = Marte, compaixão, completude. Lição cármica 9 = soltar attachedamentos e desenvolver compaixão que transcende o ego.',
  },
};

// ─── Maturity Numbers (1-9, 11, 22, 33) ───────────────────────────────────────

export interface MaturityEntry {
  theme: string;
  description: string;
  gifts: string[];
  challenges: string[];
  fonte: string;
}

export const MATURITY_THEMES: Record<number, MaturityEntry> = {
  1: {
    theme: 'Liderança madura',
    description: 'Sua maturidade traz autoridade e independência. Você se torna referência.',
    gifts: ['Visão', 'Coragem', 'Liderança'],
    challenges: ['Solidão', 'Arrogância', 'Pressão'],
    fonte:
      'Número de maturidade 1 = synthesis of life path + expression number. Represents how the person will manifest their adult authority.',
  },
  2: {
    theme: 'Diplomacia madura',
    description: 'Sua maturidade traz paciência e parcerias profundas.',
    gifts: ['Empatia', 'Mediação', 'Cooperação'],
    challenges: ['Indecisão', 'Dependência', 'Autossabotagem'],
    fonte:
      'Número de maturidade 2 = synthesis that emphasizes receptivity and partnership in the second half of life.',
  },
  3: {
    theme: 'Expressão madura',
    description: 'Sua maturidade traz criatividade e comunicação elevada.',
    gifts: ['Arte', 'Carisma', 'Otimismo'],
    challenges: ['Dispersão', 'Fofoca', 'Superficialidade'],
    fonte:
      'Número de maturidade 3 = expression of creative gifts through teaching, art, or communication in later life.',
  },
  4: {
    theme: 'Construção madura',
    description: 'Sua maturidade traz estabilidade e realizações concretas.',
    gifts: ['Disciplina', 'Persistência', 'Confiabilidade'],
    challenges: ['Rigidez', 'Workaholic', 'Medo'],
    fonte:
      'Número de maturidade 4 = consolidation phase where previous exploration is built into lasting structure.',
  },
  5: {
    theme: 'Liberdade madura',
    description: 'Sua maturidade traz sabedoria através da experiência.',
    gifts: ['Adaptabilidade', 'Versatilidade', 'Coragem'],
    challenges: ['Impulsividade', 'Inquietude', 'Excessos'],
    fonte:
      'Número de maturidade 5 = liberation from constraints built in the 4 cycle; wisdom earned through change.',
  },
  6: {
    theme: 'Amor maduro',
    description: 'Sua maturidade traz responsabilidade e compaixão profunda.',
    gifts: ['Amor', 'Cura', 'Compaixão'],
    challenges: ['Sacrifício', 'Controle', 'Perfeccionismo'],
    fonte:
      "Número de maturidade 6 = responsibility arc — to home, community, and those in one's care.",
  },
  7: {
    theme: 'Sabedoria madura',
    description: 'Sua maturidade traz introspecção e conhecimento profundo.',
    gifts: ['Sabedoria', 'Intuição', 'Análise'],
    challenges: ['Isolamento', 'Ansiedade', 'Desconfiança'],
    fonte:
      'Número de maturidade 7 = withdrawal from outer achievement to deepen inner life; teaching through being.',
  },
  8: {
    theme: 'Poder maduro',
    description: 'Sua maturidade traz abundância e reconhecimento.',
    gifts: ['Poder', 'Manifestação', 'Autoridade'],
    challenges: ['Workaholic', 'Materialismo', 'Ganância'],
    fonte:
      'Número de maturidade 8 = mastery over material world; spiritualization of power rather than abuse of it.',
  },
  9: {
    theme: 'Compaixão madura',
    description: 'Sua maturidade traz humanitarismo e encerramento sábio.',
    gifts: ['Compaixão', 'Sabedoria', 'Generosidade'],
    challenges: ['Melancolia', 'Apego', 'Sacrifício'],
    fonte:
      'Número de maturidade 9 = completion arc; sharing accumulated wisdom through service and letting go.',
  },
  11: {
    theme: 'Iluminação madura',
    description: 'Sua maturidade traz inspiração e dom espiritual.',
    gifts: ['Intuição', 'Inspiração', 'Cura'],
    challenges: ['Sensibilidade', 'Ansiedade', 'Isolamento'],
    fonte:
      'Número mestre 11 = double-digit master number. Higher octave of 2. Represents spiritual leadership and illumination.',
  },
  22: {
    theme: 'Construtor mestre',
    description: 'Sua maturidade traz capacidade de construir legados.',
    gifts: ['Manifestação', 'Visão', 'Disciplina'],
    challenges: ['Pressão', 'Perfeccionismo', 'Sobrecarga'],
    fonte:
      'Número mestre 22 = double-digit master number. Higher octave of 4. Master Builder — turning visionary dreams into concrete reality for collective benefit.',
  },
  33: {
    theme: 'Mestre curador',
    description: 'Sua maturidade traz cura e serviço compassivo.',
    gifts: ['Cura', 'Amor', 'Compaixão'],
    challenges: ['Sacrifício', 'Codependência', 'Esgotamento'],
    fonte:
      'Número mestre 33 = triple-digit master number. Higher octave of 6. Master Teacher — spiritualized service that can bridge heaven and earth through unconditional love.',
  },
};
