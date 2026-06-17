/**
 * synthesis-engine/semantic-lookups.ts
 *
 * Funções puras que mapeiam valores astrológicos / cabalísticos / tântricos
 * em descrições semânticas de vida. Sem dependências externas além de tipos.
 *
 * Split de synthesis-engine.ts para isolar a camada de tradução simbólica.
 */

// ─── Cabala (Life Path, Expressão, Motivação) ─────────────────────────────

export function getLifePathRhythm(n: number): string {
  const map: Record<number, string> = {
    1: 'iniciação e depois reflexão', 2: 'parceria e depois solitude',
    3: 'expressão e depois introspecção', 4: 'construção e depois soltura',
    5: 'liberdade e depois ancora', 6: 'responsabilidade e depois play',
    7: 'pesquisa e depois compartilhamento', 8: 'poder e depois serviço',
    9: 'humanitarismo e depois paz', 11: 'iluminação e depois concretização',
    22: 'master builder e depois inspiração', 33: 'sacrifício e depois transcendência',
  };
  return map[n] ?? 'crescimento contínuo com momentos de integração';
}

export function getKabalisticMotivationRel(n: number): string {
  const map: Record<number, string> = {
    1: 'ser reconhecido como indivíduo único',
    2: 'pertencer e ser aceito pelo outro',
    3: 'expressar sua criatividade e alegria',
    4: 'construir segurança e estrutura de vida',
    5: 'experimentar liberdade e variedade',
    6: 'amar e ser admirado por sua dedicação',
    7: 'entender a verdade profunda da vida',
    8: 'ter poder e controle sobre seus recursos',
    9: 'servir à humanidade e transcender o ego',
  };
  return map[n] ?? 'vínculos que reflectem quem você realmente é';
}

export function getLifePathCareer(n: number): string {
  const map: Record<number, string> = {
    1: 'liderar, criar e inovar', 2: 'mediar, parcerias e diplomacy',
    3: 'comunicar, entreter e inspirar', 4: 'construir sistemas duráveis',
    5: 'ensinar, viajar e expandir horizontes', 6: 'cuidar, servir e educar',
    7: 'pesquisar, analisar e revelar verdades', 8: 'empreender, gerir recursos e impactar',
    9: 'curar, aconselhar e transformar', 11: 'inspirar e liderar espiritual',
    22: 'construir em grande escala com propósito', 33: 'servir a humanidade com sacrifício sagrado',
  };
  return map[n] ?? 'expressar sua essência única no mundo';
}

export function getExpressionCareer(n: number): string {
  const map: Record<number, string> = {
    1: 'sua voz única e capacidade de liderar', 2: 'sua habilidade de harmonizar e mediar',
    3: 'sua criatividade e poder de encantar', 4: 'sua praticidade e habilidade de construir',
    5: 'sua versatile e ability de entreter', 6: 'sua responsabilidade e cuidado com os outros',
    7: 'sua profundidade intelectual e análise', 8: 'seu senso de abundância e gestão',
    9: 'sua compaixão e visão humanitária',
  };
  return map[n] ?? 'seu dom de se expressar autênticamente';
}

export function getMissionDescription(n: number): string {
  const map: Record<number, string> = {
    1: 'ser pioneiro e mostrar o caminho com sua presença',
    2: 'ser ponte entre pessoas, ideias e mundos',
    3: 'trazer luz, beleza e alegria onde quer que vá',
    4: 'construir uma base sólida para você e outros',
    5: 'libertar você e outros de crenças limitantes',
    6: 'cuidar, ensinar e elevar sua comunidade',
    7: 'revealar verdades ocultas e iluminar caminhos',
    8: 'usar seu poder para transformar e gerar impacto',
    9: 'curar, humanizar e expandir a consciência coletiva',
  };
  return map[n] ?? 'realizar seu potencial único no mundo';
}

export function getMasterLifePathGift(n: number): string {
  const map: Record<number, string> = {
    11: 'iluminação, intuição e inspiração espiritual',
    22: 'master builder, capacidade de realizar o impossível',
    33: 'sacrifício sagrado, cura espiritual e master teaching',
  };
  return map[n] ?? 'algo extraordinário para o mundo';
}

export function getLifePathGist(n: number): string {
  const map: Record<number, string> = {
    1: 'independência e auto-liderança', 2: 'cooperação e equilíbrio',
    3: 'autenticidade e expressão criativa', 4: 'disciplina e construção de legado',
    5: 'adaptabilidade e liberdade interior', 6: 'responsabilidade e cuidado',
    7: 'discernimento e busca da verdade', 8: 'abundância e integridade',
    9: 'compaixão e serviço genuíno',
  };
  return map[n] ?? 'seu caminho de crescimento e realização';
}

// ─── Tantra ────────────────────────────────────────────────────────────────

export function getTantricVitalityDescription(body: number): string {
  if (body <= 3) return 'sensorial e intensamente física';
  if (body <= 6) return 'emocional e energeticamente responsiva';
  if (body <= 9) return 'mental e intuitivamente clara';
  return 'espiritualmente radiante';
}

export function getTantricVitalityAdvice(body: number): string {
  if (body <= 3) return 'você precisa de contato físico regular e movimento corporal';
  if (body <= 6) return 'você precisa de rituais emocionais e conexões profundas';
  if (body <= 9) return 'você precisa de silêncio e tempo sozinho para processar';
  return 'você precisa de práticas contemplativas e serviço aos outros';
}

export function getTantricSoulBond(soul: number): string {
  const map: Record<number, string> = [
    'laços de destino e transformação mútua',
    'complementaridade e interdependência sagrada',
    'progressão espiritual compartilhada',
    'aliança kármica e cura coletiva',
    'companheirismo com propósito comum',
    'união de forças opostas',
    'reflexo espelhado de sombras e luzes',
    'libertação de padrões antigos em conjunto',
    'dedicação à jornada de alma',
    'acolhimento incondicional',
    'comunhão espiritual e transcendência',
  ];
  return map[soul - 1] ?? 'conexão de alma profunda e rara';
}

export function getTantricDivineGift(n: number): string {
  const map: Record<number, string> = [
    'compaixão profunda e capacidade de curar', 'visão estratégica e poder de realização',
    'expressão criativa e comunicação magnética', 'praticidade e habilidade de construir',
    'liberdade e capacidade de inspirar mudança', 'cuidado e capacidade de nutrir',
    'sabedoria e capacidade de ensino', 'abundância e capacidade de gerar prosperidade',
    'transformação e capacidade de renascimento', 'conexão espiritual e cura energética',
    'liderança carismática e propósito elevado', 'transcendência e iluminação',
  ];
  return map[n - 1] ?? 'um talento único que serve ao mundo';
}

export function getTantricPathDescription(n: number): string {
  const map: Record<number, string> = {
    1: 'a jornada do guerreiro — superar obstáculos com coragem',
    2: 'a jornada do parceiro — unir opostos em harmonia',
    3: 'a jornada do comunicador — revelar verdades com arte',
    4: 'a jornada do builder — criar estruturas que duram',
    5: 'a jornada do andarilho — liberar a mente e o corpo',
    6: 'a jornada do servidor — amar com sacrifício sagrado',
    7: 'a jornada do sábio — buscar a verdade além das aparências',
    8: 'a jornada do líder — transformar poder em serviço',
    9: 'a jornada do curador — aliviar o sofrimento humano',
  };
  return map[n] ?? 'uma jornada de desenvolvimento pessoal e espiritual';
}

// ─── Astrologia: signos e planetas ─────────────────────────────────────────

export function getElementalBodyFocus(element: string): string {
  const map: Record<string, string> = {
    fogo: 'atividades físicas intensas e exposição ao sol',
    água: 'hidratação, banhos e tempo perto da água',
    terra: 'groundedness, trabalho manual e natureza',
    ar: 'respiração profunda, ventilação e espaços abertos',
  };
  return map[element.toLowerCase()] ?? 'rotinas regulares e consistentes';
}

export function getElementalMentalMode(element: string): string {
  const map: Record<string, string> = {
    fogo: 'imaginação e inspiração visionária',
    água: 'intuição profunda e percepção emocional',
    terra: 'memória e pragmatismo',
    ar: 'lógica e comunicação',
  };
  return map[element.toLowerCase()] ?? 'pensamento claro e objetivo';
}

export function getVenusLoveStyle(sign: string): string {
  const map: Record<string, string> = {
    aries: 'apaixonada e direta', taurus: 'sensual e devota',
    gemini: 'curiosa e intelectual', cancer: 'emocional e protetora',
    leo: 'dramática e magnética', virgo: 'prática e cuidadosa',
    libra: 'harmoniosa e encantadora', scorpio: 'intensa e transformadora',
    sagittarius: 'avventurosa e livre', capricorn: 'ambiciosa e fiel',
    aquarius: 'independente e única', pisces: 'romântica e sonhadora',
  };
  return map[sign?.toLowerCase()] ?? 'expressiva e única';
}

export function getVenusNeed(sign: string): string {
  const map: Record<string, string> = {
    aries: 'precisa sentir que é desejada', taurus: 'precisa de estabilidade e prazer sensory',
    gemini: 'precisa de estimulação mental', cancer: 'precisa se sentir em casa com o outro',
    leo: 'precisa ser admirada', virgo: 'precisa de gestos pequenos e concretos',
    libra: 'precisa de harmonia e beleza', scorpio: 'precisa de profundidade e intimidade total',
    sagittarius: 'precisa de aventura e liberdade', capricorn: 'precisa de compromisso e segurança',
    aquarius: 'precisa de amizade e espaço', pisces: 'precisa de conexão espiritual e fantasia',
  };
  return map[sign?.toLowerCase()] ?? 'precisa ser estimada';
}

export function getVenusRelationalHabit(sign: string): string {
  const map: Record<string, string> = {
    aries: 'demonstra afeto', taurus: 'valoriza gestos concretos de cuidado',
    gemini: 'conversa profundamente', cancer: 'cuida antes de ser cuidada',
    leo: 'celebra publicamente', virgo: 'organiza a vida do outro com amor',
    libra: 'diplomacy para evitar conflitos', scorpio: 'vai ao fundo das coisas',
    sagittarius: 'diverte-se e expande horizontes', capricorn: 'construir um futuro juntos',
    aquarius: 'resgata sua individualidade', pisces: 'se conecta soul-to-soul',
  };
  return map[sign?.toLowerCase()] ?? 'demonstra apreço de forma única';
}

export function getMoonEmotionalNeed(sign: string): string {
  const map: Record<string, string> = {
    cancer: 'segurança emocional e lar', scorpio: 'profundidade e transformação',
    pisces: 'conexão espiritual e fantasia', taurus: 'estabilidade e prazer',
    virgo: 'ordem e utilidade', gemini: 'variedade e comunicação',
  };
  return map[sign?.toLowerCase()] ?? 'compreensão e paciência';
}

export function getMoonDefensivePattern(sign: string): string {
  const map: Record<string, string> = {
    cancer: 'superação e afastamento', scorpio: 'controle e vingança',
    pisces: 'fuga e fantasia', taurus: 'teimosia e possessividade',
    virgo: 'crítica e análise excessiva', gemini: 'superficialidade e mudança constante',
  };
  return map[sign?.toLowerCase()] ?? 'proteção e defesa';
}

export function getLilithHiddenDesire(sign: string): string {
  const map: Record<string, string> = {
    aries: 'ser livre para agir sem pedir permissão',
    scorpio: 'experimentar profundidade emocional sem julgamento',
    taurus: 'usar seu corpo e recursos para seu prazer sem culpa',
    leo: 'ser vista e admirada sem moderação',
    aquarius: 'pertencer a um grupo que aceita sua singularidade',
  };
  return map[sign?.toLowerCase()] ?? 'expressar uma parte de você que foi punida ou escondida';
}

export function getMidheavenCareer(sign: string): string {
  const map: Record<string, string> = {
    aries: 'iniciativas de liderança e competição', taurus: 'finanças, propriedades e valores',
    gemini: 'comunicação, mídia e comércio', cancer: 'cuidado, lar e família',
    leo: 'arte, entretenimento e children', virgo: 'saúde, serviço e detalhes',
    libra: 'justice, relationships e estética', scorpio: 'transformação e investigação profunda',
    sagittarius: 'filosofia, viagem e ensino', capricorn: 'negócios, status e achievement',
    aquarius: 'inovação social e coletividades', pisces: 'espiritualidade, arte e cura',
  };
  return map[(typeof sign === 'string' ? sign : String(sign))?.toLowerCase()] ?? 'algo significativo para você';
}

export function getJupiterProsperity(sign: string): string {
  const map: Record<string, string> = {
    aries: 'atravessa desafios com otimismo', taurus: 'acumula com paciência e prazer',
    gemini: 'expande através de conexões e ideias', cancer: 'prospera em lar e família',
    leo: 'generosity traz mais abundância', virgo: 'serve aos outros com excelência',
    libra: 'cria parcerias abundantes', scorpio: 'transforma crise em oportunidade',
    sagittarius: 'expand beliefs e horizontes', capricorn: 'construi estrutura com disciplina',
    aquarius: 'inova para o bem comum', pisces: 'confia no fluxo do universo',
  };
  return map[sign?.toLowerCase()] ?? 'abraça a abundância com gratidão';
}
