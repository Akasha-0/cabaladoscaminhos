// @ts-nocheck
// eslint-disable @typescript-eslint/no-explicit-any

export type ExerciseCategory =
  | 'self-inquiry'
  | 'body-awareness'
  | 'emotional-release'
  | 'projection'
  | 'journaling'
  | 'breathwork';

export type ExerciseIntensity = 'gentle' | 'moderate' | 'intense';

export interface ShadowExercise {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  instructions: string[];
  instructionsEn: string[];
  category: ExerciseCategory;
  intensity: ExerciseIntensity;
  durationMinutes: number;
  durationMinutesEn: number;
  warnings?: string[];
  warningsEn?: string[];
  prerequisites?: string[];
}

export function getExercises(): ShadowExercise[] {
  return [
    {
      id: 'daily-shadow-inventory',
      title: 'Inventário Diário da Sombra',
      titleEn: 'Daily Shadow Inventory',
      description:
        'Identifique pensamentos, sentimentos ou desejos que você julgaria ruins ou inaceitáveis. Não aja sobre eles — apenas observe.',
      descriptionEn:
        'Identify thoughts, feelings, or desires you would judge as bad or unacceptable. Do not act on them — simply observe.',
      instructions: [
        'Reserve 10–15 minutos em um espaço privado.',
        'Traga um caderno ou abra um aplicativo de anotações.',
        'Comece respirando fundo três vezes para se centrar.',
        'Pergunte-se: "O que estou sentindo agora que não quero sentir?"',
        'Liste cada emoção, mesmo as que parecem feias ou vergonhosas.',
        'Pergunte: "O que eu desejo secretamente que jamais admitiria?"',
        'Escreva sem julgamento. Ninguém vai ler isso.',
        'Encerrre reconhecendo essas partes de si mesmo com compaixão.',
      ],
      instructionsEn: [
        'Reserve 10–15 minutes in a private space.',
        'Bring a journal or open a note-taking app.',
        'Start by taking three deep breaths to center yourself.',
        'Ask yourself: "What am I feeling right now that I do not want to feel?"',
        'List every emotion, even the ones that feel ugly or shameful.',
        'Ask: "What do I secretly desire that I would never admit?"',
        'Write without judgment. No one will read this.',
        'Close by acknowledging these parts of yourself with compassion.',
      ],
      category: 'journaling',
      intensity: 'gentle',
      durationMinutes: 15,
      durationMinutesEn: 15,
    },
    {
      id: 'projection-catch',
      title: 'Pegando a Projeção',
      titleEn: 'Catch the Projection',
      description:
        'Observe quando você sente raiva, desprezo ou julgamento intenso hacia outros. Essa reação frequentemente esconde algo sobre você mesmo.',
      descriptionEn:
        'Notice when you feel anger, contempt, or strong judgment toward others. This reaction often hides something about yourself.',
      instructions: [
        'Ao longo do dia, perceba reações emocionais fortes朝向 outras pessoas.',
        'Quando sentir irritação ou julgamento, pause.',
        'Pergunte: "O que essa pessoa está refletindo de volta para mim?"',
        'Pergunte: "Existe alguma parte de mim que eu rejeito que vejo nela?"',
        'Anote a projeção e sua resposta sincera.',
        'Pratique dizer: "Essa qualidade também existe em mim."',
        'Repita diariamente por pelo menos uma semana.',
      ],
      instructionsEn: [
        'Throughout the day, notice strong emotional reactions to others.',
        'When you feel irritation or judgment, pause.',
        'Ask: "What is this person reflecting back at me?"',
        'Ask: "Is there a part of myself I reject that I see in them?"',
        'Write down the projection and your honest answer.',
        'Practice saying: "This quality lives in me too."',
        'Repeat daily for at least one week.',
      ],
      category: 'projection',
      intensity: 'gentle',
      durationMinutes: 10,
      durationMinutesEn: 10,
    },
    {
      id: 'body-shadow-scan',
      title: 'Escaneamento Corporal da Sombra',
      titleEn: 'Body Shadow Scan',
      description:
        'Percorra o corpo buscando tensões, dor ou emoção reprimida. A Sombra se armazena no corpo.',
      descriptionEn:
        'Scan the body for tension, pain, or repressed emotion. The Shadow stores itself in the body.',
      instructions: [
        'Deite-se ou sente-se confortavelmente em um lugar quieto.',
        'Feche os olhos e respire profundamente algumas vezes.',
        'Começando pelos pés, mova lentamente a consciência para cima pelo corpo.',
        'Pare em cada área e perceba qualquer sensação — aperto, formigamento, peso.',
        'Não tente mudar nada. Apenas testemunhe.',
        'Quando encontrar uma tensão presa, pergunte: "Que sentimento isso está escondendo?"',
        'Respire dentro da sensação sem forçar a libertação.',
        'Continue até chegar ao topo da cabeça.',
      ],
      instructionsEn: [
        'Lie down or sit comfortably in a quiet place.',
        'Close your eyes and take several deep breaths.',
        'Starting at the feet, slowly move awareness up through the body.',
        'Pause at each area and notice any sensation — tightness, tingling, heaviness.',
        'Do not try to change anything. Just witness.',
        'When you find a held tension, ask: "What feeling is this hiding?"',
        'Breathe into the sensation without forcing release.',
        'Continue until you reach the crown of the head.',
      ],
      category: 'body-awareness',
      intensity: 'moderate',
      durationMinutes: 20,
      durationMinutesEn: 20,
    },
    {
      id: 'letter-to-shadow',
      title: 'Carta à Sombra',
      titleEn: 'Letter to the Shadow',
      description:
        'Escreva uma carta para a parte de você que você escondeu ou reprimiu. Diga o que nunca disse.',
      descriptionEn:
        'Write a letter to the part of yourself you have hidden or repressed. Say what you never said.',
      instructions: [
        'Encontre um momento tranquilo com pelo menos 20 minutos de espaço sem interrupção.',
        'Dirija a carta à sua Sombra ou a um traço rejeitado específico.',
        'Escreva tudo o que desejar dizer mas nunca disse.',
        'Inclua raiva, luto, medo, anseio — whichever se sentir verdadeiro.',
        'Não edite nem censure. Deixe fluir cru e real.',
        'Quando terminar, leia em voz alta para si mesmo.',
        'Se parecer certo, destrua a carta após a leitura.',
        'Pratique uma vez por semana durante um mês.',
      ],
      instructionsEn: [
        'Find a quiet time with at least 20 minutes of uninterrupted space.',
        'Address the letter to your Shadow self or a specific rejected trait.',
        'Write everything you wished you could say but never did.',
        'Include anger, grief, fear, longing — whatever feels true.',
        'Do not edit or censor. Let it flow raw and real.',
        'When finished, read it aloud to yourself.',
        'If it feels right, destroy the letter after reading.',
        'Practice once a week for a month.',
      ],
      category: 'journaling',
      intensity: 'moderate',
      durationMinutes: 25,
      durationMinutesEn: 25,
    },
    {
      id: 'felt-sense-shadow',
      title: 'Sensação Física da Sombra',
      titleEn: 'Felt Sense of the Shadow',
      description:
        'Identifique uma qualidade que você rejeita em si mesmo. Então rastreie onde ela existe no seu corpo como sensação.',
      descriptionEn:
        'Identify a quality you reject in yourself. Then trace where it lives in your body as sensation.',
      instructions: [
        'Escolha um traço rejeitado (ex: preguiça, egoísmo, covardia).',
        'Defina um timer para 10 minutos.',
        'Vire a atenção para dentro e pergunte: "Onde isso vive no meu corpo?"',
        'Não intellectualize. Fique apenas com a sensação física.',
        'Perceba forma, temperatura, densidade, cor se surgirem.',
        'Fique com a sensação sentida pelos 10 minutos completos.',
        'Quando terminar, libere suavemente a consciência.',
        'Não analise nem escreva imediatamente depois. Deixe assentar.',
      ],
      instructionsEn: [
        'Choose a rejected trait (e.g., laziness, selfishness, cowardice).',
        'Set a timer for 10 minutes.',
        'Turn attention inward and ask: "Where does this live in my body?"',
        'Do not intellectualize. Stay with physical sensation only.',
        'Notice shape, temperature, density, color if they arise.',
        'Stay with the felt sense for the full 10 minutes.',
        'When done, gently release awareness.',
        'Do not analyze or journal immediately after. Let it settle.',
      ],
      category: 'body-awareness',
      intensity: 'intense',
      durationMinutes: 15,
      durationMinutesEn: 15,
      warnings: [
        'Este exercício pode trazer à tona memórias dolorosas.',
        'Faça com acompanhamento terapêutico se necessário.',
      ],
      warningsEn: [
        'This exercise may surface painful memories.',
        'Proceed with therapeutic support if needed.',
      ],
      prerequisites: [
        'Prática básica de meditação ou escaneamento corporal',
        'Basic meditation or body scanning practice',
      ],
    },
    {
      id: 'image-streaming-shadow',
      title: 'Image Streaming da Sombra',
      titleEn: 'Shadow Image Streaming',
      description:
        'Permita que imagens espontâneas surjam ao fechar os olhos. Permaneça como testigo sem dirigir.',
      descriptionEn:
        'Allow spontaneous images to arise when you close your eyes. Stay as witness without directing.',
      instructions: [
        'Sente-se ereto com os olhos fechados por 15–20 minutos.',
        'Permita que imagens, símbolos ou cenas surjam livremente sem direcionar.',
        'À medida que cada imagem aparecer, narre-a suavemente em voz alta.',
        'Não interprete durante o streaming — apenas descreva.',
        'Pergunte às imagens: "O que vocês querem me mostrar?"',
        'Se imagens assustadoras aparecerem, mantenha a calma. Pergunte: "Do que vocês têm medo?"',
        'Quando terminar, sente-se em silêncio por 2 minutos antes de abrir os olhos.',
        'Escreva brevemente sobre temas ou símbolos notados.',
      ],
      instructionsEn: [
        'Sit upright with eyes closed for 15–20 minutes.',
        'Let images, symbols, or scenes arise freely without steering.',
        'As each image appears, softly narrate it aloud to yourself.',
        'Do not interpret while streaming — just describe.',
        'Ask the images: "What do you want to show me?"',
        'If frightening images appear, stay calm. Ask: "What are you afraid of?"',
        'When finished, sit silently for 2 minutes before opening eyes.',
        'Journal briefly about themes or symbols noticed.',
      ],
      category: 'self-inquiry',
      intensity: 'intense',
      durationMinutes: 25,
      durationMinutesEn: 25,
      warnings: [
        'Pode evocar material psíquico intenso.',
        'Não pratique sozinho se tiver histórico de trauma.',
      ],
      warningsEn: [
        'May evoke intense psychic material.',
        'Do not practice alone if you have a trauma history.',
      ],
    },
    {
      id: 'breathwork-shadow-release',
      title: 'Respiração para Libertação da Sombra',
      titleEn: 'Breathwork for Shadow Release',
      description:
        'Usa respiração consciente para acessar e mover emoções reprimidas. Circule energia pelo corpo.',
      descriptionEn:
        'Use conscious breathing to access and move repressed emotions. Circulate energy through the body.',
      instructions: [
        'Deite-se de costas em uma posição confortável.',
        'Comece com 2 minutos de respiração lenta e profunda.',
        'Transicione para respirações mais rápidas e rasas — padrão holotrópico cíclico.',
        'Continue por 10–15 minutos mantendo-se presente com as sensações.',
        'Se lágrimas, riso ou raiva surgirem, deixe-os passar por você.',
        'Não segure — permita expressão emocional completa.',
        'Após a fase ativa, volte à respiração lenta e profunda por 3 minutos.',
        'Descanse em silêncio por 5 minutos antes de escrever ou se mover.',
      ],
      instructionsEn: [
        'Lie on your back in a comfortable position.',
        'Begin with 2 minutes of a slow, deep breathing.',
        'Transition to faster, shallower breaths — cyclical holotropic pattern.',
        'Continue for 10–15 minutes while staying present with sensations.',
        'If tears, laughter, or anger arise, let them move through you.',
        'Do not hold back — allow full emotional expression.',
        'After the active phase, return to slow deep breaths for 3 minutes.',
        'Rest in silence for 5 minutes before journaling or moving.',
      ],
      category: 'breathwork',
      intensity: 'intense',
      durationMinutes: 30,
      durationMinutesEn: 30,
      warnings: [
        'Não pratique sozinho se tiver histórico de doença cardíaca ou epilepsia.',
        'Mantenha água por perto.',
      ],
      warningsEn: [
        'Do not practice with heart disease or epilepsy history.',
        'Keep water nearby.',
      ],
    },
    {
      id: 'active-imagination-shadow',
      title: 'Imaginação Ativa — Diálogo com a Sombra',
      titleEn: 'Active Imagination — Dialogue with the Shadow',
      description:
        'Entre em diálogo imaginativo com uma figura sombria. Permita que ela fale por você.',
      descriptionEn:
        'Enter imaginative dialogue with a shadow figure. Allow it to speak through you.',
      instructions: [
        'Relaxe com os olhos fechados por 5 minutos.',
        'Chame à mente uma figura que represente sua Sombra.',
        'Perceba sua aparência, postura, expressão, voz.',
        'Engaje em um diálogo interior: faça perguntas, ouça respostas.',
        'Escreva ou fale em voz alta a troca conforme ela se desenrola.',
        'Não roteiro nem force respostas — deixe-as vir.',
        'Quando completo, agradeça a figura e abra lentamente os olhos.',
        'Registre a experiência em detalhes no seu caderno.',
      ],
      instructionsEn: [
        'Relax with eyes closed for 5 minutes.',
        'Call to mind a figure that represents your Shadow.',
        'Notice its appearance, posture, expression, voice.',
        'Engage in an inner dialogue: ask questions, listen for answers.',
        'Write or speak aloud the exchange as it unfolds.',
        'Do not script or force responses — let them come.',
        'When complete, thank the figure and slowly open your eyes.',
        'Record the experience in detail in your journal.',
      ],
      category: 'self-inquiry',
      intensity: 'intense',
      durationMinutes: 30,
      durationMinutesEn: 30,
      warnings: [
        'Pode causar leve диссоциация em pessoas sensíveis.',
        'Faça em ambiente seguro com tempo suficiente.',
      ],
      warningsEn: [
        'May cause mild dissociation in sensitive individuals.',
        'Practice in a safe environment with sufficient time.',
      ],
    },
  ];
}
