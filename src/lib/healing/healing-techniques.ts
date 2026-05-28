// @ts-nocheck
// eslint-disable @typescript-eslint/no-explicit-any

export type HealingTechniqueType =
  | 'reiki'
  | 'pranic'
  | 'sound'
  | 'crystal'
  | 'aromatherapy'
  | 'color'
  | 'breathwork'
  | 'meditation'
  | 'movement'
  | 'bodywork';

export type HealingIntensity = 'gentle' | 'moderate' | 'deep';

export interface HealingTechnique {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  instructions: string[];
  instructionsEn: string[];
  type: HealingTechniqueType;
  intensity: HealingIntensity;
  durationMinutes: number;
  benefits: string[];
  benefitsEn: string[];
  contraindications?: string[];
  contraindicationsEn?: string[];
  tools?: string[];
  toolsEn?: string[];
}

export function getTechniques(): HealingTechnique[] {
  return [
    {
      id: 'reiki',
      title: 'Reiki',
      titleEn: 'Reiki',
      description: 'Canalização de energia vital universal através das mãos para promover cura física, emocional e espiritual. Técnica japonesa desenvolvida por Mikao Usui.',
      descriptionEn: 'Channeling universal life force energy through the hands to promote physical, emotional, and spiritual healing. Japanese technique developed by Mikao Usui.',
      instructions: [
        'Encontre um espaço tranquilo e meditativo',
        'Solicite permissão mentalmente antes de iniciar a sessão',
        'Posicione as mãos suavemente sobre ou ligeiramente acima do corpo',
        'Cubra diferentes posições do corpo em sessões equilibradas',
        'Mantenha cada posição por 2-5 minutos ou até sentir que a energia flui',
        'Permita que a energia flua naturalmente, sem forçar',
      ],
      instructionsEn: [
        'Find a quiet, meditative space',
        'Mentally request permission before starting the session',
        'Position hands gently on or slightly above the body',
        'Cover different body positions in balanced sessions',
        'Hold each position for 2-5 minutes or until energy flows',
        'Allow energy to flow naturally, without forcing',
      ],
      type: 'reiki',
      intensity: 'gentle',
      durationMinutes: 30,
      benefits: [
        'Redução do estresse e ansiedade',
        'Alívio de dores físicas',
        'Promoção do equilíbrio emocional',
        'Aceleração da recuperação pós-operatória',
        'Melhoria da qualidade do sono',
      ],
      benefitsEn: [
        'Stress and anxiety reduction',
        'Physical pain relief',
        'Emotional balance promotion',
        'Faster post-operative recovery',
        'Improved sleep quality',
      ],
      contraindications: ['Implantes eletrônicos', 'Fragilidade extrema'],
      contraindicationsEn: ['Electronic implants', 'Extreme fragility'],
      tools: ['Mãos', 'Cristais opcionalmente'],
      toolsEn: ['Hands', 'Crystals optionally'],
    },
    {
      id: 'pranic-healing',
      title: 'Cura Prânica',
      titleEn: 'Pranic Healing',
      description: 'Sistema de cura energética que utiliza prana (energia vital) para equilibrar e harmonizar os chakras e corpos energéticos sutis.',
      descriptionEn: 'Energy healing system that uses prana (life energy) to balance and harmonize chakras and subtle energy bodies.',
      instructions: [
        'Prepare-se mentalmente com meditação breve',
        'Identifique a área a ser tratada',
        'Realize sweeping (varredura) para limpar energia densa',
        'Aplique energia para energizar a área afetada',
        'Use processos específicos para organizar energia estagnante',
        'Finalize com bênção para estabilizar os resultados',
      ],
      instructionsEn: [
        'Prepare mentally with brief meditation',
        'Identify the area to be treated',
        'Perform sweeping to cleanse dense energy',
        'Apply enerlzar to energize the affected area',
        'Use specific processes for stagnant energy',
        'Finish with blessing to stabilize results',
      ],
      type: 'pranic',
      intensity: 'moderate',
      durationMinutes: 20,
      benefits: [
        'Harmonização dos chakras',
        'Desbloqueio de centros energéticos',
        'Alívio de sintomas físicos e emocionais',
        'Descontaminação de corpos sutis',
        'Fortalecimento do campo áurico',
      ],
      benefitsEn: [
        'Chakra harmonization',
        'Energy center unblocking',
        'Physical and emotional symptom relief',
        'Subtle body decontamination',
        'Auric field strengthening',
      ],
      tools: ['Mãos', 'Cristais', 'Varinha de cura opcional'],
      toolsEn: ['Hands', 'Crystals', 'Healing wand optional'],
    },
    {
      id: 'sound-healing',
      title: 'Cura por Som',
      titleEn: 'Sound Healing',
      description: 'Uso de bowls tibetanos, diapasões e instrumentos musicais para criar vibrações que harmonizam o corpo e a mente.',
      descriptionEn: 'Use of Tibetan bowls, tuning forks, and musical instruments to create vibrations that harmonize body and mind.',
      instructions: [
        'Escolha instrumentos adequados ao objetivo da sessão',
        'Crie um círculo seguro ao redor do cliente',
        'Toque os bowls em sequência do topo à	base do corpo',
        'Permita que as vibrações ressoem por 2-3 minutos cada',
        'Use diapasões nos pontos de acupressão',
        'Encerre com silêncio contemplativo',
      ],
      instructionsEn: [
        'Choose instruments suitable for the session goal',
        'Create a safe circle around the client',
        'Play bowls in sequence from crown to base of body',
        'Allow vibrations to resonate for 2-3 minutes each',
        'Use tuning forks on acupressure points',
        'Close with contemplative silence',
      ],
      type: 'sound',
      intensity: 'gentle',
      durationMinutes: 45,
      benefits: [
        'Ressonância celular profunda',
        'Dissolução de bloqueios emocionais',
        'Estimulação da glândula pineal',
        'Alívio de insônia e pressão arterial elevada',
        'Harmonização das ondas cerebrais',
      ],
      benefitsEn: [
        'Deep cellular resonance',
        'Emotional block dissolution',
        'Pineal gland stimulation',
        'Relief from insomnia and high blood pressure',
        'Brainwave harmonization',
      ],
      tools: ['Bowls tibetanos', 'Diapasões', 'Flauta', 'Tambor'],
      toolsEn: ['Tibetan bowls', 'Tuning forks', 'Flute', 'Drum'],
    },
    {
      id: 'crystal-healing',
      title: 'Cura com Cristais',
      titleEn: 'Crystal Healing',
      description: 'Utilização de cristais e pedras preciosas para canalizar, equilibrar e potencializar energies no corpo sutil.',
      descriptionEn: 'Use of crystals and gemstones to channel, balance, and enhance energies in the subtle body.',
      instructions: [
        'Selecione cristais adequados à intenção da cura',
        'Limpe os cristais com água saline ou defumação',
        'Programe cada cristal com sua intenção específica',
        'Posicione os cristais nos chakras ou ao redor do campo áurico',
        'Permita que descansem por 15-30 minutos',
        'Descarregue e agradeça aos cristais após a sessão',
      ],
      instructionsEn: [
        'Select crystals suitable for healing intention',
        'Cleanse crystals with salt water or smudging',
        'Program each crystal with specific intention',
        'Position crystals on chakras or around auric field',
        'Allow to rest for 15-30 minutes',
        'Discharge and thank crystals after session',
      ],
      type: 'crystal',
      intensity: 'gentle',
      durationMinutes: 30,
      benefits: [
        'Amplificação da energia pessoal',
        'Equilíbrio dos chakras',
        'Dissolução de energias densas',
        'Harmonização ambiental',
        'Apoio à meditação profunda',
      ],
      benefitsEn: [
        'Personal energy amplification',
        'Chakra balance',
        'Dense energy dissolution',
        'Environmental harmonization',
        'Deep meditation support',
      ],
      tools: ['Cristais variados', 'Selenita', 'Quartzo', 'Amethyst', 'Pedras de Bach'],
      toolsEn: ['Various crystals', 'Selenite', 'Quartz', 'Amethyst', 'Bach stones'],
    },
    {
      id: 'aromatherapy',
      title: 'Aromaterapia Energética',
      titleEn: 'Energetic Aromatherapy',
      description: 'Uso de óleos essenciais para limpar, equilibrar e potencializar centros energéticos e estados emocionais.',
      descriptionEn: 'Use of essential oils to cleanse, balance, and enhance energy centers and emotional states.',
      instructions: [
        'Escolha óleos conforme a intenção (cura, proteção, abertura)',
        'Dilua óleos essenciais adequadamente em veículo',
        'Aplique nos chakras correspondentes ou solas dos pés',
        'Use difusor para limpar o ambiente energético',
        'Inale diretamente para impacto emocional rápido',
        'Combine com intencão selama a aplicação',
      ],
      instructionsEn: [
        'Choose oils according to intention (healing, protection, opening)',
        'Dilute essential oils properly in carrier',
        'Apply to corresponding chakras or soles of feet',
        'Use diffuser to cleanse energetic environment',
        'Inhale directly for quick emotional impact',
        'Combine with intention during application',
      ],
      type: 'aromatherapy',
      intensity: 'gentle',
      durationMinutes: 15,
      benefits: [
        'Purificação do campo energético',
        'Liberação de emoções presas',
        'Estimulação de chakras específicos',
        'Proteção contra energias densas',
        'Fortalecimento do sistema imune',
      ],
      benefitsEn: [
        'Energetic field purification',
        'Trapped emotion release',
        'Specific chakra stimulation',
        'Protection against dense energies',
        'Immune system strengthening',
      ],
      tools: ['Óleos essenciais', 'Difusor', 'Óleo carreador', 'Piedras'],
      toolsEn: ['Essential oils', 'Diffuser', 'Carrier oil', 'Stones'],
    },
    {
      id: 'color-healing',
      title: 'Cura Cromática',
      titleEn: 'Color Healing',
      description: 'Aplicação de frequencies luminosas coloridas para harmonizar chakras, corpo emocional e campo áurico.',
      descriptionEn: 'Application of colored light frequencies to harmonize chakras, emotional body, and auric field.',
      instructions: [
        'Selecione a cor baseada no chakra a ser trabalhado',
        'Use iluminação colorido ou filtros sobre a área',
        'Visualize a cor fluindo para o local específico',
        'Mantenha exposição por 5-10 minutos por área',
        'Beba água energizada com a cor após a sessão',
        'Integre com respiracão visualize da cor特定的',
      ],
      instructionsEn: [
        'Select color based on chakra to work on',
        'Use colored lighting or filters over area',
        'Visualize the color flowing to specific location',
        'Maintain exposure for 5-10 minutes per area',
        'Drink water charged with color after session',
        'Integrate with visualized color breathing',
      ],
      type: 'color',
      intensity: 'gentle',
      durationMinutes: 20,
      benefits: [
        'Reequilíbrio dos chakras',
        'Revitalização celular',
        'Harmonização emocional',
        'Estimulação do corpo áurico',
        'Desbloqueio de творческий потенциал',
      ],
      benefitsEn: [
        'Chakra rebalancing',
        'Cellular revitalization',
        'Emotional harmonization',
        'Auric body stimulation',
        'Creative potential unblocking',
      ],
      tools: ['Luz colorida', 'Filtros', 'Bastões de luz colorida', 'Cristais'],
      toolsEn: ['Colored light', 'Filters', 'Colored light wands', 'Crystals'],
    },
    {
      id: 'chakra-dance',
      title: 'Dança dos Chakras',
      titleEn: 'Chakra Dance',
      description: 'Movimento meditativo que ativa e harmoniza os chakras através de danca libre e consciência corporal.',
      descriptionEn: 'Meditative movement that activates and harmonizes chakras through free dance and body awareness.',
      instructions: [
        'Crie um espaço seguro e sem julgamentos',
        'Comece com aquecimento suave do corpo',
        'Conecte-se com cada chakra da base ao topo',
        'Dança libre asociando cores e qualidades de cada centro',
        'Permita que surjam emoções e movimentos espontâneos',
        'Encerre em silêncio e gratidão',
      ],
      instructionsEn: [
        'Create a safe, non-judgmental space',
        'Start with gentle body warm-up',
        'Connect with each chakra from root to crown',
        'Free dance associating colors and qualities of each center',
        'Allow spontaneous emotions and movements to emerge',
        'Close in silence and gratitude',
      ],
      type: 'movement',
      intensity: 'moderate',
      durationMinutes: 30,
      benefits: [
        'Desbloqueio de energia estagnada',
        'Liberación de emociones reprimidas',
        'Reconexão corpo-mente-espirito',
        'Expressão criativa potencializada',
        'Harmonização do campo energético',
      ],
      benefitsEn: [
        'Stagnant energy unblocking',
        'Repressed emotion release',
        'Body-mind-spirit reconnection',
        'Enhanced creative expression',
        'Energetic field harmonization',
      ],
      tools: ['Música inspiradora', 'Espaço aberto', 'Roupas confortáveis'],
      toolsEn: ['Inspiring music', 'Open space', 'Comfortable clothing'],
    },
    {
      id: 'shamanic-healing',
      title: 'Cura Xamânica',
      titleEn: 'Shamanic Healing',
      description: 'Práticas tradicionais de cura através de jornada, poder pessoal e reconexão com帮助下灵性能量.',
      descriptionEn: 'Traditional healing practices through journeywork, power retrieval, and reconnection with helping spirits.',
      instructions: [
        'Defina intenção clara de cura',
        'Crie espaço sagrado e seguro',
        'Realize ritual de proteção (defumação, sal, luz)',
        'Entre em estado alterado com tambor ou canto',
        'Viaje ao mundo espiritual para buscar cura',
        'Retorne e integre os gifts recibidos',
      ],
      instructionsEn: [
        'Define clear healing intention',
        'Create sacred and safe space',
        'Perform protection ritual (smudging, salt, light)',
        'Enter altered state with drum or chant',
        'Journey to spiritual world to seek healing',
        'Return and integrate received gifts',
      ],
      type: 'meditation',
      intensity: 'deep',
      durationMinutes: 60,
      benefits: [
        'Recuperação de partes da alma perdidas',
        'Remoção de contratos de doença',
        'Proteção contra energías negativas',
        'Reconexão com guias e aliados',
        'Resolução de patrones kármicos',
      ],
      benefitsEn: [
        'Retrieval of lost soul parts',
        'Removal of illness contracts',
        'Protection against negative energies',
        'Reconnection with guides and allies',
        'Resolution of karmic patterns',
      ],
      contraindications: ['Gravidez', 'Condições psiquiátricas graves'],
      contraindicationsEn: ['Pregnancy', 'Severe psychiatric conditions'],
      tools: ['Tambor', 'Maracas', 'Sal', 'Fumo de ervas', 'Cristais'],
      toolsEn: ['Drum', 'Rattles', 'Salt', 'Herb smoke', 'Crystals'],
    },
    {
      id: 'emotional-release',
      title: 'Liberação Emocional',
      titleEn: 'Emotional Release',
      description: 'Técnica de cura que trabalha emociones armazenadas no corpo através de respiração consciente e processamento emocional.',
      descriptionEn: 'Healing technique working with emotions stored in the body through conscious breathing and emotional processing.',
      instructions: [
        'Identifique a emoção presa a ser liberada',
        'Permita que a emoção se mova livremente pelo corpo',
        'Respire profundamente na área de tensão',
        'Sussurre a emoção ou faça sonidos associated',
        'Permita que lágrimas ou risos surjam naturalmente',
        'Integre com afirmacões positivo e gratidão',
      ],
      instructionsEn: [
        'Identify trapped emotion to release',
        'Allow emotion to move freely through body',
        'Breathe deeply into area of tension',
        'Whisper emotion or make associated sounds',
        'Allow tears or laughter to emerge naturally',
        'Integrate with positive affirmations and gratitude',
      ],
      type: 'breathwork',
      intensity: 'moderate',
      durationMinutes: 25,
      benefits: [
        'Liberação de traumas emocionais',
        'Dissolução de bloqueios crônicos',
        'Expansão da capacidade emocional',
        'Recuperação da vitalidade energética',
        'Clareza mental e emocional',
      ],
      benefitsEn: [
        'Release of emotional traumas',
        'Dissolution of chronic blocks',
        'Emotional capacity expansion',
        'Energy vitality recovery',
        'Mental and emotional clarity',
      ],
      tools: ['Espaço privado', 'Música sutil', 'Jornal para integração'],
      toolsEn: ['Private space', 'Subtle music', 'Journal for integration'],
    },
    {
      id: 'bodywork',
      title: 'Trabalho Corpo-Energético',
      titleEn: 'Body-Energy Work',
      description: 'Combinação de técnicas manuais e energéticas para liberar tensões físicas e desbloquer o fluxo vital.',
      descriptionEn: 'Combination of manual and energy techniques to release physical tensions and unblock vital flow.',
      instructions: [
        'Realize avaliação energética do corpo sutil',
        'Identifique áreas de tensão ou energia densa',
        'Aplique pressão suave nos pontos de tensão',
        'Integre técnicas de alongamento e soltar',
        'Use visualizacões para направлять energia',
        'Integre com autoconhecimento емоциональный',
      ],
      instructionsEn: [
        'Perform subtle body energy assessment',
        'Identify areas of tension or dense energy',
        'Apply gentle pressure on tension points',
        'Integrate stretching and releasing techniques',
        'Use visualizations to direct energy',
        'Integrate with emotional self-knowledge',
      ],
      type: 'bodywork',
      intensity: 'moderate',
      durationMinutes: 45,
      benefits: [
        'Alívio de dores crônicas',
        'Melhoria da postura e flexibilidad',
        'Liberação de padrões de tensão guardados',
        'Fortalecimento do campo energético',
        'Reconexão mente-corpo',
      ],
      benefitsEn: [
        'Chronic pain relief',
        'Posture and flexibility improvement',
        'Release of stored tension patterns',
        'Energetic field strengthening',
        'Mind-body reconnection',
      ],
      tools: ['Mãos', 'Óleo massageável', 'Tigela de sonido'],
      toolsEn: ['Hands', 'Massage oil', 'Sound bowl'],
    },
  ];
}

export function getTechniqueById(id: string): HealingTechnique | undefined {
  return getTechniques().find((t) => t.id === id);
}

export function getTechniquesByType(type: HealingTechniqueType): HealingTechnique[] {
  return getTechniques().filter((t) => t.type === type);
}

export function getGentleTechniques(): HealingTechnique[] {
  return getTechniques().filter((t) => t.intensity === 'gentle');
}

export function getDeepTechniques(): HealingTechnique[] {
  return getTechniques().filter((t) => t.intensity === 'deep');
}
