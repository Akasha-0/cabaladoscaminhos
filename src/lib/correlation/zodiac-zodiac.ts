/**
 * Zodiac-Zodiac Spiritual Correlation Module
 * Maps zodiac signs to other signs based on astrological aspects and elemental compatibility.
 * Source: Cabala dos Caminhos spiritual system
 */

import type { Elemento } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type SignoZodiac =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/** Aspect types representing different relationships between signs */
export type AspectType =
  | 'Trino'      // Harmonious: same element (120°)
  | 'Sextil'     // Opportunity: compatible elements (60°)
  | 'Quadratura' // Challenge: tension between elements (90°)
  | 'Oposição'   // Balance: opposite signs (180°)
  | 'Conjunção'  // Union: same sign or very close
  | 'Complementar'; // Complementary: opposite but balancing

/**
 * Represents the correlation between two zodiac signs
 */
export interface ZodiacZodiacMapping {
  /** Source sign */
  sign: SignoZodiac;
  /** Related target sign */
  related_sign: SignoZodiac;
  /** Type of astrological aspect */
  aspect_type: AspectType;
  /** Spiritual meaning of the relationship */
  spiritual_meaning: {
    /** Core spiritual interpretation */
    significado: string;
    /** Growth opportunity in this relationship */
    crescimento: string;
    /** Potential challenge to overcome */
    desafio: string;
    /** Ritual or practice to enhance this connection */
    ritual?: string;
  };
}

/**
 * Complete mapping of zodiac sign relationships.
 * Based on astrological aspects and spiritual correspondences from the Cabala dos Caminhos system.
 * Each pair is mapped once (A→B, not B→A) to avoid duplication.
 */
export const ZODIAC_ZODIAC_MAP: readonly ZodiacZodiacMapping[] = [
  // ─── Trines (same element - harmonious) ─────────────────────────────────

  // Fogo trines (Áries, Leão, Sagitário)
  {
    sign: 'Áries',
    related_sign: 'Leão',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Conexão de fogo que une coragem e criatividade, formando uma espiral ascendente de expressão espiritual',
      crescimento: 'Desenvolve liderança carismática e capacidade de inspirara outros a agir',
      desafio: 'Evitar competição por atenção e domínio',
      ritual: 'Prática de respiração pranayama ao amanhecer para canalizar energia vital',
    },
  },
  {
    sign: 'Áries',
    related_sign: 'Sagitário',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Expansão espiritual e busca de verdade através da ação e adventure',
      crescimento: 'Cultiva sabedoria através da experiência direta e exploração',
      desafio: 'Impaciência com limitações e estrutura',
      ritual: 'Meditação ao ar livre durante o pôr do sol para expandir consciência',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Sagitário',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Fusão de poder criativo e filosofia universal, brilho interior que ilumina o caminho',
      crescimento: 'Integra autoexpressão autêntica com propósito de vida elevado',
      desafio: 'Excesso de orgulho e dificuldade em aceitar críticas',
      ritual: 'Yoga ao entardecer para harmonizar energia solar e júpiteriana',
    },
  },

  // Terra trines (Touro, Virgem, Capricórnio)
  {
    sign: 'Touro',
    related_sign: 'Virgem',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Enraizamento espiritual através do trabalho paciente e gratidão pela natureza',
      crescimento: 'Desenvolve discernimento prático e capacidade de criar abundancia',
      desafio: 'Materialismo excessivo e resistência a mudanças',
      ritual: 'Yoga terracota ao amanhecer, caminhadas na natureza com meditação',
    },
  },
  {
    sign: 'Touro',
    related_sign: 'Capricórnio',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'solidificação de logros através de disciplina e paciência milenar',
      crescimento: 'Ascensão gradual através de esforços consistentes e visão de longo prazo',
      desafio: 'Rigidez emocional e medo do fracasso',
      ritual: 'Orações ao amanhecer e práticas de jejum para purificação',
    },
  },
  {
    sign: 'Virgem',
    related_sign: 'Capricórnio',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Estrutura espiritual que combina análise crítica com ambição estruturada',
      crescimento: 'Transforma perfeccionismo em excelência realizável',
      desafio: 'Autocrítica excessiva e dificuldade em relaxar',
      ritual: 'Prática de GRATidÃO journaling ao entardecer, trabalho manual sagrado',
    },
  },

  // Ar trines (Gémeos, Libra, Aquário)
  {
    sign: 'Gémeos',
    related_sign: 'Libra',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Comunicação fluida entre mente e relações, dualidade harmonizada',
      crescimento: 'Desenvolve diplomacia natural e capacidade de expressão clara',
      desafio: 'Indecisão e superficialidade em compromissos',
      ritual: 'Leitura sagrada ao entardecer, práticas de comunicação consciente',
    },
  },
  {
    sign: 'Gémeos',
    related_sign: 'Aquário',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Intelecto humanitário e pensamento revolucionário que une o individual ao universal',
      crescimento: 'Amplia perspectivas através de networking e inovação mental',
      desafio: 'Detachment emocional e caos mental',
      ritual: 'Discussões filosóficas em grupo, práticas de alquimia mental',
    },
  },
  {
    sign: 'Libra',
    related_sign: 'Aquário',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Harmonia social e идеализм que buscam justiça coletiva',
      crescimento: 'Cultiva visão equilibrada de sociedade ideal e relacionamentos',
      desafio: 'Idealismo irrealista e conflito entre идеализм e realidade',
      ritual: 'Participação em atividades comunitárias, práticas de justiça restaurativa',
    },
  },

  // Água trines (Câncer, Escorpião, Peixes)
  {
    sign: 'Câncer',
    related_sign: 'Escorpião',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Mergulho profundo no emocional e transformação radical através da cura',
      crescimento: 'Desenvolve intuição emocional e capacidade de transformação',
      desafio: 'Manipulação emocional e intensidade excessiva',
      ritual: 'Rituais de cura ancestral ao luar, banhos de sal marinho',
    },
  },
  {
    sign: 'Câncer',
    related_sign: 'Peixes',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Conexão com o divino através da compaixão e sensibilidade universal',
      crescimento: 'Abrechannel para guidance espiritual e compaixão infinita',
      desafio: 'Vulnerabilidade excessiva e dificuldade em estabelecer límites',
      ritual: 'Meditação à beira-mar ao anoitecer, práticas de compaixão amorosa',
    },
  },
  {
    sign: 'Escorpião',
    related_sign: 'Peixes',
    aspect_type: 'Trino',
    spiritual_meaning: {
      significado: 'Transformação espiritual que une poder de regeneração com trascendência',
      crescimento: 'Integra morte e renascimento espiritual em um ciclo contínuo',
      desafio: 'Obsessão e dificuldade em soltar o passado',
      ritual: 'Rituais de release ao luar, práticas de perdão profundo',
    },
  },

  // ─── Sextiles (compatible elements - opportunity) ────────────────────────

  // Fire-Air sextiles
  {
    sign: 'Áries',
    related_sign: 'Libra',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Equilíbrio entre ação e harmonia, iniciativa confrontando diplomacy',
      crescimento: 'Aprende a agir com graça e considerar perspectivas diversas',
      desafio: 'Tensão entre ego e parceria',
      ritual: 'Práticas de tai chi para harmonizar yin-yang interno',
    },
  },
  {
    sign: 'Áries',
    related_sign: 'Aquário',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Pioneirismo intelectual e visionarismo que combina ação com идеи',
      crescimento: 'Desenvolve capacidade de inovar com propósito social',
      desafio: 'Rebelião sem direção clara',
      ritual: 'Brainstorming criativo em comunidad, prototipagem de projetos sociais',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Gémeos',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Criatividade expressiva que une coração e mente em comunicação',
      crescimento: 'Integra autexpressão com comunicação clara e envolvente',
      desafio: 'Necessidade de ser visto vs. gosto pela variabilidade',
      ritual: 'Performance artística, teatro comunitário',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Aquário',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Liderança humanitária que une carisma pessoal com visão coletiva',
      crescimento: 'Canaliza energia criativa para causas maiores',
      desafio: 'Ego humanitário e necessidade de reconhecimento',
      ritual: 'Liderança de projetos comunitários, mentoria criativa',
    },
  },
  {
    sign: 'Sagitário',
    related_sign: 'Libra',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Filosofia equilibrada que busca verdade com justiça',
      crescimento: 'Desenvolve wisdom moral e capacidade de julgamento ético',
      desafio: 'Idealismo vs. realidade prática',
      ritual: 'Estudos filosóficos em grupo, debates éticos',
    },
  },
  {
    sign: 'Sagitário',
    related_sign: 'Gémeos',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Expansão mental através de múltiplos campos de conhecimento',
      crescimento: 'Cultiva mente aberta e aprendizado constante',
      desafio: 'Superficialidade em busca de variedade',
      ritual: 'Leitura pluralista, viaje de estudos',
    },
  },

  // Earth-Water sextiles
  {
    sign: 'Touro',
    related_sign: 'Câncer',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Enraizamento emocional que combina estabilidade com sensibilidade',
      crescimento: 'Desenvolve segurança emocional através de conexão familiar',
      desafio: 'Possessividade e resistência a mudanças',
      ritual: 'Rituais de família ao amanhecer, cozinhar juntos',
    },
  },
  {
    sign: 'Touro',
    related_sign: 'Escorpião',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Transformação da matéria e recursos através de intensidade emocional',
      crescimento: 'Aprende a valuear profundidade sobre superfície',
      desafio: 'Jealousy e medo de perda',
      ritual: 'Rituais de transformação material, organização profunda',
    },
  },
  {
    sign: 'Virgem',
    related_sign: 'Câncer',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Cuidado prático que une análise com compaixão emocional',
      crescimento: 'Desenvolve habilidade de servir com discernimento',
      desafio: 'Crítica disfarçada de ajuda',
      ritual: 'Trabalho de cuidado hands-on, cura artesanal',
    },
  },
  {
    sign: 'Virgem',
    related_sign: 'Peixes',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Healing integrativo que combina service terreno com trascendência espiritual',
      crescimento: 'Canaliza energia de cura através de métodos práticos',
      desafio: 'Confusão entre helper e curador',
      ritual: 'Práticas de cura alternativa, trabalho de serviço',
    },
  },
  {
    sign: 'Capricórnio',
    related_sign: 'Escorpião',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Poder transformador que une ambição com profundidade emocional',
      crescimento: 'Desenvolve capacidade de regeneração estrutural',
      desafio: 'Rigidez emocional e medo de vulnerabilidade',
      ritual: 'Rituais de renascimento profissional, revisão de carreira',
    },
  },
  {
    sign: 'Capricórnio',
    related_sign: 'Peixes',
    aspect_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Humildade ambiciosa que combina ascensão prática com trascendência espiritual',
      crescimento: 'Integra material success com propósito espiritual',
      desafio: 'Confusão entre миссия e escapismo',
      ritual: 'Meditação no topo de montanhas, práticas de visualization de sucesso',
    },
  },

  // ─── Squares (challenging - tension between elements) ──────────────────

  // Fire-Square-Earth
  {
    sign: 'Áries',
    related_sign: 'Touro',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Conflito entre ousadia e estabilidade, energia de Taurus pressando contra ação de Aries',
      crescimento: 'Aprende a canalizar energia de ação para construir fundamentos sólidos',
      desafio: 'Impaciência vs. resistência à mudança',
      ritual: 'Práticas de grounding antes de agir, yoga da paciência',
    },
  },
  {
    sign: 'Áries',
    related_sign: 'Virgem',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Tensão entre impulso e análise, ação confrontando critica',
      crescimento: 'Integra espontaneidade com discernimento crítico',
      desafio: 'Irritação com detalhes e perfeccionismo',
      ritual: 'Mindfulness antes de decisões, práticas de pausa reflexiva',
    },
  },
  {
    sign: 'Áries',
    related_sign: 'Capricórnio',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Rebelião contra autoridade, energia jovem confrontando estrutura',
      crescimento: 'Aprende a canalizar rebeldia em realizações concretas',
      desafio: 'Impaciência com hierarquias e regras',
      ritual: 'Rituais de iniciação adulta, práticas de liderança paciente',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Touro',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Conflito de wills, brilho confrontando resistência',
      crescimento: 'Integra generosidade com contenção material',
      desafio: 'Excessos de ambos, desperdício vs. acumulação',
      ritual: 'Práticas de благотворительность anónima, consumo consciente',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Virgem',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Orgulho confrontando crítica, performance vs. realidade',
      crescimento: 'Aprende a aceitar feedback construtivo com graciosidade',
      desafio: 'Defensividade ante críticas válidas',
      ritual: 'Journaling de auto-observação, práticas de humildade alegre',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Capricórnio',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Conflito entre desejo de reconhecimento e estrutura hierárquica',
      crescimento: 'Desenvolve liderança que não precisa de palco',
      desafio: 'Rejeição de autoridade ou busca obsessiva de aprovação',
      ritual: 'Serviço anónimo, liderança sem visibilidade',
    },
  },
  {
    sign: 'Sagitário',
    related_sign: 'Touro',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Expansão vs. contenção, filosofia confrontando realidade material',
      crescimento: 'Aprende a grounded wisdom e materializar visões',
      desafio: 'Desprezo por preocupações materiais ou excessiva attachment',
      ritual: 'Práticas de manifestação, meditation on abundance',
    },
  },
  {
    sign: 'Sagitário',
    related_sign: 'Virgem',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Idealismo confrontando realidade, teoria vs. prática',
      crescimento: 'Integra busca de verdade com execution prática',
      desafio: 'Frustração com detalhes que parecem limiter expansão',
      ritual: 'Aplicar filosofia ao cotidiano, projetos concretos de filosofia',
    },
  },
  {
    sign: 'Sagitário',
    related_sign: 'Capricórnio',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Liberdade vs. responsabilidade, independência confrontando duty',
      crescimento: 'Aprende a assumir responsabilidade sem perder liberdade interior',
      desafio: 'Rebelião contra limitações necessárias ou conformismo excessivo',
      ritual: 'Rituais de escolha consciente, práticas de responsabilidade alegre',
    },
  },

  // Air-Square-Water
  {
    sign: 'Gémeos',
    related_sign: 'Câncer',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Mente vs. emoção, comunicação confrontando sensibilidade',
      crescimento: 'Integra intelectual with emotional wisdom',
      desafio: 'Superficialidade emocional ou intelectualização de sentimentos',
      ritual: 'Journaling emocional-intelectual, práticas de expressão sentimientos',
    },
  },
  {
    sign: 'Gémeos',
    related_sign: 'Escorpião',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Curiosidade vs. profundidade, mente confrontando segredos',
      crescimento: 'Aprende a aprofundar conhecimento e explorar verdades ocultas',
      desafio: 'Medo de profundidade ou curiosidade superficial',
      ritual: 'Estudos de temas ocultos, práticas de investigação profunda',
    },
  },
  {
    sign: 'Gémeos',
    related_sign: 'Peixes',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Versatilidade confrontando dissolução, mente vs. trascendência',
      crescimento: 'Integra comunicação com espiritualidade intuitiva',
      desafio: 'Confusão entre múltiplas ideias ou dificuldade em concentrado',
      ritual: 'Meditação de mente clara, práticas de foco profundo',
    },
  },
  {
    sign: 'Libra',
    related_sign: 'Câncer',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Relacionamentos vs. lar, diplomacy confrontando emotionalismo',
      crescimento: 'Aprende a criar harmony sem sacrificar necessidades próprias',
      desafio: 'People-pleasing ou isolamento defensivo',
      ritual: 'Práticas de assertividade em relações, límites saudáveis',
    },
  },
  {
    sign: 'Libra',
    related_sign: 'Escorpião',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Justiça vs. intensidade, equilíbrio confrontando transformação',
      crescimento: 'Desenvolve ability de navegar conflitos intensos com equanimity',
      desafio: 'Avoidância de confronto ou obsessão com justiça',
      ritual: 'Rituais de confronto construtivo, práticas de mediação',
    },
  },
  {
    sign: 'Libra',
    related_sign: 'Peixes',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Diplomacia vs. dissolve, sociedade confrontando trascendência',
      crescimento: 'Integra consciousness social com spiritual universality',
      desafio: 'Perda de identidade em relações ou isolamento espiritual',
      ritual: 'Serviço humanitarian com prática espiritual, práticas de comunidade sagrada',
    },
  },
  {
    sign: 'Aquário',
    related_sign: 'Câncer',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Coletivo vs. pessoal, inovação confrontando tradição',
      crescimento: 'Aprende a ser revolucionário com coração',
      desafio: 'Detachment emocional ou excesso de identificação com grupo',
      ritual: 'Trabalhos de comunidade com raízes emocionais, práticas de humanitarismo afetivo',
    },
  },
  {
    sign: 'Aquário',
    related_sign: 'Escorpião',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Progresso vs. transformação, mente confrontando morte e renascimento',
      crescimento: 'Desenvolve capacidade de inovar através de transformação radical',
      desafio: 'Rebelião destrutiva ou medo de mudanças profundas',
      ritual: 'Rituais de renovação social, práticas de disrupção criativa',
    },
  },
  {
    sign: 'Aquário',
    related_sign: 'Peixes',
    aspect_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Lógica vs. fé, mente científica confrontando espiritualidade',
      crescimento: 'Integra racionalidade com intuition espiritual',
      desafio: 'Ceticismo extremado ou escapismo espiritual',
      ritual: 'Ciência da espiritualidade, práticas de meditação racional',
    },
  },

  // ─── Oppositions (opposite signs - 180° balance) ────────────────────────

  {
    sign: 'Áries',
    related_sign: 'Libra',
    aspect_type: 'Oposição',
    spiritual_meaning: {
      significado: 'Ego vs. parceria, ação vs. harmonia - necessário aprender equilíbrio entre self e outro',
      crescimento: 'Desenvolve capacidade de asserting needs while maintaining relationships',
      desafio: 'Guerra de vontades ou submissão completa',
      ritual: 'Práticas de compromise criativo, meditação sobre unidade na dualidade',
    },
  },
  {
    sign: 'Touro',
    related_sign: 'Escorpião',
    aspect_type: 'Oposição',
    spiritual_meaning: {
      significado: 'Posse vs. transformação, estabilidade confrontando mudança radical',
      crescimento: 'Aprende que verdadeira segurança vem da capacidade de transformation',
      desafio: 'Possessividade extrema ou perda deliberada de recursos',
      ritual: 'Rituais de release de possessões, práticas de desapego consciente',
    },
  },
  {
    sign: 'Gémeos',
    related_sign: 'Sagitário',
    aspect_type: 'Oposição',
    spiritual_meaning: {
      significado: 'Curiosidade vs. sabedoria, múltiplos interesses confrontando busca de verdade una',
      crescimento: 'Integra variety de knowledge com depth de understanding',
      desafio: 'Superficialidade ou dogmatismo',
      ritual: 'Estudos profundos de topics variados, práticas de integração de knowledge',
    },
  },
  {
    sign: 'Câncer',
    related_sign: 'Capricórnio',
    aspect_type: 'Oposição',
    spiritual_meaning: {
      significado: 'Lar vs. carreira, emotionalismo confrontando ambição estruturada',
      crescimento: 'Desenvolve capacidade de construir career com emotional grounding',
      desafio: 'Confusão entre família e profissionalismo, dependência ou isolamento',
      ritual: 'Práticas de equilíbrio trabalho-casa, rituais de boundary professional',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Aquário',
    aspect_type: 'Oposição',
    spiritual_meaning: {
      significado: 'Centro vs. periferia, brilho pessoal confrontando ideais coletivos',
      crescimento: 'Aprende a shine para collective benefit, não apenas self-glory',
      desafio: 'Narcisismo ou apagamento de self',
      ritual: 'Liderança service-oriented, práticas de brilho anónimo',
    },
  },
  {
    sign: 'Virgem',
    related_sign: 'Peixes',
    aspect_type: 'Oposição',
    spiritual_meaning: {
      significado: 'Análise vs. fé, crítica confrontando compaixão infinita',
      crescimento: 'Integra critical thinking com spiritual acceptance',
      desafio: 'Perfeccionismo cruel ou escapismo espiritual',
      ritual: 'Práticas de compaixão crítica, meditação de aceitação perfeita',
    },
  },

  // ─── Complementary (opposite but balancing) ─────────────────────────────

  {
    sign: 'Áries',
    related_sign: 'Escorpião',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Pioneiro encontra regenerador - ação e transformação criando morte e renascimento contínuos',
      crescimento: 'Desenvolve capacidade de iniciar transformação radical',
      desafio: 'Guerra de egos ou destruição mútua',
      ritual: 'Rituais de renascimento pessoal, práticas de iniciática destruição-criação',
    },
  },
  {
    sign: 'Touro',
    related_sign: 'Escorpião',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Earth confronta água profunda - estabilidade e transformação em dança eterna',
      crescimento: 'Aprende a valuear profundidade espiritual tanto quanto estabilidade material',
      desafio: 'Tensão entre safety e transformation',
      ritual: 'Rituais de transformação material, trabalho com recursos transformativos',
    },
  },
  {
    sign: 'Touro',
    related_sign: 'Peixes',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Grounding encontra trascendência - matéria e espíritu em dialogue contínuo',
      crescimento: 'Integra mundo material com espiritualidade não-dual',
      desafio: 'Materialismo ou escapismo',
      ritual: 'Práticas de sagrado no quotidiano, espiritualidade encarnada',
    },
  },
  {
    sign: 'Gémeos',
    related_sign: 'Peixes',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Mente dual encontra unidade trascendente - múltiplas perspectivas dissolution em consciência una',
      crescimento: 'Desenvolve capacidade de pensar sem pensamentos, comunicação além de palavras',
      desafio: 'Confusão mental ou dissociação',
      ritual: 'Meditação silenciosa, práticas de comunicação telepática',
    },
  },
  {
    sign: 'Câncer',
    related_sign: 'Capricórnio',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Cuidado maternal encontra ambição estruturada - família e carreira em integração consciente',
      crescimento: 'Aprende a construir legacy familiar através de realizações profissionais',
      desafio: 'Confusão de papéis ou separação rígida entre domínios',
      ritual: 'Rituais de integração família-carreira, práticas de ancestralidade profissional',
    },
  },
  {
    sign: 'Leão',
    related_sign: 'Aquário',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Coração inflamado encontra mente humanitária - criatividade individual a serviço do coletivo',
      crescimento: 'Integra autoexpressão criativa com propósito social',
      desafio: 'Exibicionismo ou apagamento',
      ritual: 'Criação para comunidade, práticas de arte para bem social',
    },
  },
  {
    sign: 'Virgem',
    related_sign: 'Peixes',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Discernimento encontra compaixão - crítica construtiva em serviço da cura universal',
      crescimento: 'Desenvolve ability de servir sem julgamento, ajudar sem crítica',
      desafio: 'Crítica disfarçada de ajuda ou compaixão disfarçada de enabling',
      ritual: 'Práticas de serviço compassivo, healing integrativo',
    },
  },
  {
    sign: 'Libra',
    related_sign: 'Áries',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Equilíbrio confronta impulso - diplomacy e assertividade em tensão criativa',
      crescimento: 'Aprende a assertar com graça, manter harmonia com força',
      desafio: 'Indecisão ou agressividade',
      ritual: 'Práticas de assertividade elegante, meditação de força em harmonia',
    },
  },
  {
    sign: 'Escorpião',
    related_sign: 'Touro',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Transformação encontra estabilidade - regeneração enraizada em groundedness profundo',
      crescimento: 'Integra poder transformador com capacidade de manter mudanças',
      desafio: 'Destruição destrutiva ou resistência a transformação',
      ritual: 'Rituais de transformação enraizada, práticas de rebuild pós-morte',
    },
  },
  {
    sign: 'Sagitário',
    related_sign: 'Gémeos',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Sabedoria encontra curiosidade - filosofia e versatilidade em diálogo expansivo',
      crescimento: 'Desenvolve mente que aprofunda e alarga simultaneamente',
      desafio: 'Dogmatismo ou superficialidade',
      ritual: 'Estudos comparativos, práticas de aprendizado diversified',
    },
  },
  {
    sign: 'Capricórnio',
    related_sign: 'Câncer',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Estrutura confronta emoção - carreira e família em integração consciente',
      crescimento: 'Aprende a build estrutura com coração, alcançar com raízes',
      desafio: 'Frieza profissional ou dependência emocional',
      ritual: 'Rituais de integração emocional-profissional, práticas de carreira com coração',
    },
  },
  {
    sign: 'Aquário',
    related_sign: 'Leão',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Coletivo encontra individual - идеализм social e expressão pessoal em fusão criativa',
      crescimento: 'Integra visão de sociedade ideal com capacidade de shine pessoal',
      desafio: 'Apagamento de self ou narcisismo humanitarian',
      ritual: 'Liderança humanitária autêntica, práticas de brilho coletivo',
    },
  },
  {
    sign: 'Peixes',
    related_sign: 'Virgem',
    aspect_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Trascendência encontra граунд - espiritualidade e pragmatismo em integração sábia',
      crescimento: 'Aprende a encarnar espiritualidade, aplicar trascendência',
      desafio: 'Escapismo ou materialismo espiritual',
      ritual: 'Práticas de espiritualidade prática, religion incarnate',
    },
  },
];

/**
 * Freeze the array to prevent modifications
 */
Object.freeze(ZODIAC_ZODIAC_MAP);

/**
 * Get the zodiac-zodiac mapping for a given sign.
 * @param sign - Zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns ZodiacZodiacMapping or null if not found
 */
export function getZodiacZodiac(sign: string): ZodiacZodiacMapping[] {
  const normalized = normalizarSigno(sign);
  if (!normalized) return [];

  return ZODIAC_ZODIAC_MAP.filter(
    (mapping) => mapping.sign === normalized || mapping.related_sign === normalized,
  );
}

/**
 * Get all zodiac-zodiac relations.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacRelations(): readonly ZodiacZodiacMapping[] {
  return ZODIAC_ZODIAC_MAP;
}

/**
 * Get all relations for a specific sign.
 * @param sign - Zodiac sign name
 * @returns Array of related signs with aspects
 */
export function getRelationsForSign(sign: string): Array<{
  sign: SignoZodiac;
  aspect_type: AspectType;
  spiritual_meaning: ZodiacZodiacMapping['spiritual_meaning'];
}> {
  const normalized = normalizarSigno(sign);
  if (!normalized) return [];

  return ZODIAC_ZODIAC_MAP.filter((mapping) => mapping.sign === normalized).map((mapping) => ({
    sign: mapping.related_sign,
    aspect_type: mapping.aspect_type,
    spiritual_meaning: mapping.spiritual_meaning,
  }));
}

/**
 * Get relations by aspect type.
 * @param aspect_type - Type of aspect to filter
 * @returns Array of mappings for that aspect type
 */
export function getRelationsByAspect(aspect_type: AspectType): ZodiacZodiacMapping[] {
  return ZODIAC_ZODIAC_MAP.filter((mapping) => mapping.aspect_type === aspect_type);
}

/**
 * Get all aspect types used in the mapping.
 * @returns Array of unique aspect types
 */
export function getAllAspectTypes(): AspectType[] {
  const types = new Set<AspectType>();
  ZODIAC_ZODIAC_MAP.forEach((mapping) => types.add(mapping.aspect_type));
  return Array.from(types);
}

/**
 * Get all signs that have relations.
 * @returns Array of unique sign names
 */
export function getAllRelatedSigns(): SignoZodiac[] {
  const signs = new Set<SignoZodiac>();
  ZODIAC_ZODIAC_MAP.forEach((mapping) => {
    signs.add(mapping.sign);
    signs.add(mapping.related_sign);
  });
  return Array.from(signs);
}

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): SignoZodiac | null {
  const normalized = signo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const mapping: Record<string, SignoZodiac> = {
    aries: 'Áries',
    touro: 'Touro',
    gemeos: 'Gémeos',
    cancer: 'Câncer',
    leao: 'Leão',
    virgem: 'Virgem',
    libra: 'Libra',
    escorpiao: 'Escorpião',
    sagitario: 'Sagitário',
    capricornio: 'Capricórnio',
    aquario: 'Aquário',
    peixes: 'Peixes',
  };

  return mapping[normalized] ?? null;
}

/**
 * Get the spiritual meaning between two signs.
 * @param sign1 - First zodiac sign
 * @param sign2 - Second zodiac sign
 * @returns Spiritual meaning or null if no relation exists
 */
export function getRelationBetweenSigns(
  sign1: string,
  sign2: string,
): ZodiacZodiacMapping['spiritual_meaning'] | null {
  const norm1 = normalizarSigno(sign1);
  const norm2 = normalizarSigno(sign2);

  if (!norm1 || !norm2) return null;

  const mapping = ZODIAC_ZODIAC_MAP.find(
    (m) =>
      (m.sign === norm1 && m.related_sign === norm2) ||
      (m.sign === norm2 && m.related_sign === norm1),
  );

  return mapping?.spiritual_meaning ?? null;
}

/**
 * Get the aspect type between two signs.
 * @param sign1 - First zodiac sign
 * @param sign2 - Second zodiac sign
 * @returns Aspect type or null if no relation exists
 */
export function getAspectBetweenSigns(
  sign1: string,
  sign2: string,
): AspectType | null {
  const norm1 = normalizarSigno(sign1);
  const norm2 = normalizarSigno(sign2);

  if (!norm1 || !norm2) return null;

  const mapping = ZODIAC_ZODIAC_MAP.find(
    (m) =>
      (m.sign === norm1 && m.related_sign === norm2) ||
      (m.sign === norm2 && m.related_sign === norm1),
  );

  return mapping?.aspect_type ?? null;
}

export default {
  getZodiacZodiac,
  getAllZodiacRelations,
  getRelationsForSign,
  getRelationsByAspect,
  getAllAspectTypes,
  getAllRelatedSigns,
  getRelationBetweenSigns,
  getAspectBetweenSigns,
};