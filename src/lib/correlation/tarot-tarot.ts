/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps Major Arcana cards to other cards based on Kabbalistic Tree of Life paths,
 * elemental correspondences, and spiritual journey progressions.
 * Source: Cabala dos Caminhos framework - 22 paths of the Tree of Life
 */

/**
 * Path types representing different relationships between Tarot cards
 * These correspond to the Kabbalistic Tree of Life path connections
 */
export type TarotPathType =
  | 'Trino'           // Harmonious: same element or complementary energy
  | 'Sextil'          // Opportunity: compatible but needs conscious effort
  | 'Quadratura'      // Challenge: shadow integration required
  | 'Oposição'        // Opposition: duality requiring integration
  | 'Sequência'       // Sequential: part of the same spiritual journey
  | 'Complementar'    // Complementary: completes the energy
  | 'Ancestral';      // Deep connection: shares core archetype

/**
 * Represents the correlation between two Major Arcana cards
 */
export interface TarotTarotMapping {
  /** Source arcano (Major Arcana card name in Portuguese) */
  arcano: string;
  /** Card number (0-21) */
  numero_carta: number;
  /** Related target arcano */
  related_arcano: string;
  /** Related card number */
  related_numero: number;
  /** Type of spiritual path connection */
  path_type: TarotPathType;
  /** Spiritual meaning of the relationship */
  spiritual_meaning: {
    /** Core spiritual interpretation */
    significado: string;
    /** Growth opportunity when these cards appear together */
    crescimento: string;
    /** Potential challenge or shadow aspect */
    desafio: string;
    /** Practice or ritual to harmonize this connection */
    ritual?: string;
  };
}

// ─── Major Arcana Card Names ─────────────────────────────────────────────────
const ARCANOS = [
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Enamorados', 'O Carro', 'A Força', 'O Eremita',
  'A Roda da Fortuna', 'A Justiça', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo',
] as const;

/**
 * Tarot-Tarot correlation mappings
 * Maps Major Arcana cards to related cards based on:
 * - Tree of Life path connections (Kabbalistic)
 * - Elemental correspondences
 * - Spiritual journey sequences
 * - Archetypal opposites and complements
 */
export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  // ─── O Louco (0) - The beginning of the journey ─────────────────────────
  {
    arcano: 'O Louco',
    numero_carta: 0,
    related_arcano: 'O Mago',
    related_numero: 1,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O salto de fé que transforma em ação deliberada. O inconsciente torna-se consciente através da intenção.',
      crescimento: 'Desenvolve a capacidade de iniciar sem medo, confiando na capacidade de criar realidade.',
      desafio: 'Evitar o impulsive sem fundamento; construir base antes do salto.',
      ritual: 'Meditação ao amanhecer com a intenção de definir o propósito do dia.',
    },
  },
  {
    arcano: 'O Louco',
    numero_carta: 0,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O ciclo completo da jornada espiritual: do inconsciente ao consciente, da ignorância à iluminação.',
      crescimento: 'Integra todas as lições do caminho, celebrando a completude da experiência.',
      desafio: 'Reconhecer que o fim é também um novo começo; não se apegar à conquista.',
      ritual: 'Ritual de encerramento de ciclo ao entardecer,agradecendo as lições aprendidas.',
    },
  },
  {
    arcano: 'O Louco',
    numero_carta: 0,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'A energia pura da esperança renascendo após a destruição. O Louco planta a semente que a Estrela rega.',
      crescimento: 'Cultiva fé inabalável mesmo quando tudo parece perdido.',
      desafio: 'Não cair no extremo do otimismo irreal; manter os pés no chão.',
      ritual: 'Prática de visualização criativa com água corrente.',
    },
  },

  // ─── O Mago (1) - Power and manifestation ───────────────────────────────
  {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'A Sacerdotisa',
    related_numero: 2,
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'A tensão criativa entre ação e intuição, masculina e feminina. O Mago exterioriza o que a Sacerdotisa guarda.',
      crescimento: 'Integra poder de manifestar com sabedoria interior.',
      desafio: 'Evitar manipulação; reconhecer que a verdadeira magia vem da intuição.',
      ritual: 'Prática de silêncio e escuta antes de tomar decisões importantes.',
    },
  },
  {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'Os Enamorados',
    related_numero: 6,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O poder de escolha alinha o coração com a vontade. O Mago abre o caminho para o amor consciente.',
      crescimento: 'Desenvolve capacidade de fazer escolhas alinhadas com o propósito de alma.',
      desafio: 'Superar medo de escolher errado; confiar no processo de crescimento.',
      ritual: 'Ritual de decisão com cartas ou oração antes de crossroads importantes.',
    },
  },
  {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'Vontade criativa encontra fertilidade criadora. O Mago canaliza energia para a Imperatriz manifestar.',
      crescimento: 'Alinha intenção com abundância natural do universo.',
      desafio: 'Não se perder em projetos múltiplos; focar na essência.',
      ritual: 'Prática de无心流露 creative expression sem julgamento.',
    },
  },

  // ─── A Sacerdotisa (2) - Intuition and mystery ───────────────────────────
  {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    related_arcano: 'A Lua',
    related_numero: 18,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A sabedoria oculta flui entre a superfície e as profundezas. A Sacerdotisa conhece os segredos que a Lua revela.',
      crescimento: 'Aprofunde-se na escuta do inconsciente e nos mensagens dos sonhos.',
      desafio: 'Não se perder no mundo onírico; equilibrar fuga e engajamento.',
      ritual: 'Prática de journaling noturno e interpretação de sonhos ao amanhecer.',
    },
  },
  {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    related_arcano: 'A Alta Sacerdotisa',
    related_numero: 2,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'A guardiã dos mistérios femininos conecta passado e futuro através do presente eterno.',
      crescimento: 'Integra sabedoria ancestral com intuição atual.',
      desafio: 'Romper silêncio quando necessário; usar sabedoria com discernimento.',
      ritual: 'Prática de meditação lunar e trabalho com a Deusa.',
    },
  },
  {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    related_arcano: 'O Eremita',
    related_numero: 9,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'Do silêncio interno da sabedoria emerge a luz da orientação. A Sacerdotisa precede o Eremita.',
      crescimento: 'Cultiva solitude produtiva e busca interior paciente.',
      desafio: 'Não se isolar permanentemente; equilibrar introspecção e conexão.',
      ritual: 'Caminhada solitária em natureza como prática de busca interior.',
    },
  },

  // ─── A Imperatriz (3) - Abundance and nature ──────────────────────────────
  {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'O Imperador',
    related_numero: 4,
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O feminino criativo contrasta com o masculino estrutural. Juntos governam o mundo material.',
      crescimento: 'Integra nutrição e limitação, suavidade e disciplina.',
      desafio: 'Evitar excesso de indulgência ou controle rígido.',
      ritual: 'Prática de criação consciente结合 estruturação intencional.',
    },
  },
  {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A fertilidade terrena ecoa a esperança celestial. A Imperatriz é o solo que a Estrela semeia.',
      crescimento: 'Desenvolve gratidão pela abundância natural e conexão com a natureza.',
      desafio: 'Não se apegar excessivamente às posses ou relacionamentos.',
      ritual: 'Prática de gardening ou conexão com plantas como ritual de conexão terra-céu.',
    },
  },
  {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'A mãe universal completa o ciclo de criação. A Imperatriz gera o que o Mundo celebra.',
      crescimento: 'Integra todas as formas de amor e nutrição em uma expansão constante.',
      desafio: 'Não se perder em papéis de cuidado ao ponto de esquecer-se.',
      ritual: 'Prática de auto-cuidado como sacramento, não como luxo.',
    },
  },

  // ─── O Imperador (4) - Structure and authority ────────────────────────────
  {
    arcano: 'O Imperador',
    numero_carta: 4,
    related_arcano: 'O Hierofante',
    related_numero: 5,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O poder terreno encontra a sabedoria espiritual. O Imperador estabelece o que o Hierofante consagra.',
      crescimento: 'Integra autoridade exterior com autoridade interior.',
      desafio: 'Evitar tirania ou rigidez excessiva em nome da ordem.',
      ritual: 'Prática deboundaries saudável como expressão de respeito próprio.',
    },
  },
  {
    arcano: 'O Imperador',
    numero_carta: 4,
    related_arcano: 'A Justiça',
    related_numero: 11,
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A lei do território confronta a lei universal. Estrutura versus equidade criam tensão necessária.',
      crescimento: 'Desenvolve capacidade de aplicar regras com flexibilidade e compaixão.',
      desafio: 'Romper paradigmas ultrapassados; adaptar-se a novas realidades.',
      ritual: 'Prática de revisão de crenças limitantes sobre autoridade e estrutura.',
    },
  },
  {
    arcano: 'O Imperador',
    numero_carta: 4,
    related_arcano: 'O Carro',
    related_numero: 7,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A vontade estruturada conquista através da estratégia. O Imperador fornece o plano que o Carro executa.',
      crescimento: 'Canaliza disciplina em conquista tangível.',
      desafio: 'Não se tornar rígido ou perder a flexibilidade estratégica.',
      ritual: 'Prática de planejamento estratégico结合 execução disciplined.',
    },
  },

  // ─── O Hierofante (5) - Spiritual wisdom ─────────────────────────────────
  {
    arcano: 'O Hierofante',
    numero_carta: 5,
    related_arcano: 'O Eremita',
    related_numero: 9,
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O mestre exterior confronta a sabedoria interior. Tradição versus busca individual definem tensão sagrada.',
      crescimento: 'Integra ensinamentos de mestres externos com iluminação interna.',
      desafio: 'Questionar tradições quando necessário; não aceitar cegamente.',
      ritual: 'Estudo profundo de uma tradição espiritual, combinado com busca interior.',
    },
  },
  {
    arcano: 'O Hierofante',
    numero_carta: 5,
    related_arcano: 'A Temperança',
    related_numero: 14,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A sabedoria dogmática evolui para equilíbrio integrador. O Hierofante ensina o que a Temperança viverifica.',
      crescimento: 'Transforma conhecimento em prática e prática em moderação.',
      desafio: 'Evitar extremos de rigidez ou relaxamento excessivo.',
      ritual: 'Prática de integração de aprendizados em vida daily.',
    },
  },
  {
    arcano: 'O Hierofante',
    numero_carta: 5,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A tradição地面上 desperta para chamada universal. O Hierofante prepara a despertar que o Julgamento consuma.',
      crescimento: 'Reconhece que toda autoridade vem de fonte superior e serve propósito maior.',
      desafio: 'Separar condenação de julgamento saudável.',
      ritual: 'Prática de perdão e reconciliação como expressão de maturidade espiritual.',
    },
  },

  // ─── Os Enamorados (6) - Choice and love ─────────────────────────────────
  {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    related_arcano: 'O Diabo',
    related_numero: 15,
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A escolha de amor confronta a escolha de apego. Os Enamorados representan a escolha correta que o Diabo distorce.',
      crescimento: 'Liberta-se de apegos que parecem amor mas são prisão.',
      desafio: 'Reconhecer armadilhas emocionais e manipulações disfarçadas de amor.',
      ritual: 'Prática de discernment emocional antes de commit a relacionamentos.',
    },
  },
  {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    related_arcano: 'A Torre',
    related_numero: 16,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A escolha consciente precede a destruição libertadora. Os Enamorados preparam a purificação da Torre.',
      crescimento: 'Escolhe com consciência antes que o destino force a escolha.',
      desafio: 'Evitar indecisão prolongada; tomar decisão e.arcar com consequências.',
      ritual: 'Prática de tomada de decisão consciente em matters pequenos antes de grandes.',
    },
  },
  {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'O amor humano eleva-se ao amor divino. Os Enamorados no plano terreno refletem a luz que o Sol irradia.',
      crescimento: 'Expande amor romântico em amor universal sem perder a intimidade.',
      desafio: 'Não absolutizar parceiro; permitir que amor cresça e mude.',
      ritual: 'Prática de gratidão pelo parceiro e pela conexão como espelho do divino.',
    },
  },

  // ─── O Carro (7) - Will and conquest ──────────────────────────────────────
  {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Força',
    related_numero: 8,
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'A conquista externa testa a força interna. O Carro conquista território; a Força conquista a si mesmo.',
      crescimento: 'Transforma conquista física em domínio do eu interior.',
      desafio: 'Não deixar vitória externa criar arrogância interna.',
      ritual: 'Prática de humildade após conquistas, reconhecendo ajuda recebida.',
    },
  },
  {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Morte',
    related_numero: 13,
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'O avanço victorioso encontra transformação inevitável. O Carro conquista o que a Morte recria.',
      crescimento: 'Integra conquista com aceitação de mudança como parte do crescimento.',
      desafio: 'Apegarse a vitórias passadas impede renovação necessária.',
      ritual: 'Prática de soltar conquistas antigas como espaço para novas.',
    },
  },
  {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Roda da Fortuna',
    related_numero: 10,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A vontade pessoal navega o ciclo do destino. O Carro influencia a Roda; a Roda influencia o Carro.',
      crescimento: 'Desenvolve capacidade de surfar ciclos com presença e intención.',
      desafio: 'Evitar manipulação do destino; aceitar o que não pode ser controlado.',
      ritual: 'Prática de ação inspirada em alinhamento com momento presente.',
    },
  },

  // ─── A Força (8) - Inner strength and compassion ─────────────────────────
  {
    arcano: 'A Força',
    numero_carta: 8,
    related_arcano: 'A Justiça',
    related_numero: 11,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A força do coração encontra a força da lei. A compaixão completa a equidade.',
      crescimento: 'Integra suavidade com справедливость, compaixão com limites.',
      desafio: 'Evitar excessiva suavidade queenable manipulação.',
      ritual: 'Prática deboundaries compasivos em relaciones.',
    },
  },
  {
    arcano: 'A Força',
    numero_carta: 8,
    related_arcano: 'O Eremita',
    related_numero: 9,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A força interior emerge da sabedoria interior. A Força desenvolve o que o Eremita поиск revela.',
      crescimento: 'Cultiva coragem moral que vem de autoconhecimento profundo.',
      desafio: 'Não confundir força com dureza; authentic força é gentil.',
      ritual: 'Prática de auto-reflection diário para развитие self-awareness.',
    },
  },
  {
    arcano: 'A Força',
    numero_carta: 8,
    related_arcano: 'A Temperança',
    related_numero: 14,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A força do coração harmoniza com equilíbrio do espírito. Ambas карты representam maestria emocional.',
      crescimento: 'Desenvolve capacidade de permanecer calmo sob pressão sem perder firing.',
      desafio: 'Não suprimir emoções; transformá-las com сознательность.',
      ritual: 'Prática de channeling de emoções intensas em творчество ou movimento.',
    },
  },

  // ─── O Eremita (9) - Introspection and guidance ──────────────────────────
  {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A solidão iluminação encontra a esperança renovadora. O Eremita busca a luz que a Estrela oferece.',
      crescimento: 'Integra wisdom interior com esperança ativa no future.',
      desafio: 'Não se perder em isolamento; compartilhar luz encontrada.',
      ritual: 'Prática de serviço voluntário como expressão de wisdom acumulada.',
    },
  },
  {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'A Lua',
    related_numero: 18,
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A luz da sabedoria ilumina as sombras do inconsciente. O Eremita traz clareza onde a Lua confunde.',
      crescimento: 'Desenvolve capacidade de navegar confusion com gracia.',
      desafio: 'Não perder-se no labirinto da mente; manter 방향.',
      ritual: 'Prática de grounding após exploration de sombras interiores.',
    },
  },
  {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'A sabedoria interior chama para despertar final. O Eremita prepara o despertar que o Julgamento proclama.',
      crescimento: 'Integra anos de busca em clarity e propósito definidos.',
      desafio: 'Não acumular sabedoria sem aplicá-la em serviço.',
      ritual: 'Prática de compartilhamento de wisdom através de mentoria ou ensino.',
    },
  },

  // ─── A Roda da Fortuna (10) - Fate and cycles ────────────────────────────
  {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'A Morte',
    related_numero: 13,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O ciclo do destino culmina em transformação inevitável. A Roda gira para a Morte recriar.',
      crescimento: 'Aceita que fim de ciclo é início de renovação.',
      desafio: 'Apegarse a posições de sorte quando ciclo vira.',
      ritual: 'Prática de release de antigas heridas ao mudar de ciclo.',
    },
  },
  {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'O Diabo',
    related_numero: 15,
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O destino que parece externo pode ser internal chains. A Roda do destino encontra a prisão do Diabo.',
      crescimento: 'Reconhece que的命运 está parcialmente em próprias mãos.',
      desafio: 'Evitar culpar destino por escolhas propias; assumir responsabilidade.',
      ritual: 'Prática de examination de как externalizar problemas como destino.',
    },
  },
  {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'A Temperança',
    related_numero: 14,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A cyclical nature do destino encontra equilíbrio permanente. A Roda gira; a Temperança ancora.',
      crescimento: 'Desenvolve capacidade de manter equanimity através de mudanças de ciclo.',
      desafio: 'Não se deixar levar pelo wheel de emoções; manter центр.',
      ritual: 'Prática de daily meditation para desarrollar stability interior.',
    },
  },

  // ─── A Justiça (11) - Fairness and truth ─────────────────────────────────
  {
    arcano: 'A Justiça',
    numero_carta: 11,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A justiça humana preparar para julgamento divino. A Justiça pesa; o Julgamento decide.',
      crescimento: 'Integra ação justa com readiness para consequences.',
      desafio: 'Não buscar только justiça externa; começar com auto-julgamento.',
      ritual: 'Prática de daily self-examination em terms de fairness.',
    },
  },
  {
    arcano: 'A Justiça',
    numero_carta: 11,
    related_arcano: 'A Torre',
    related_numero: 16,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A verdade revelada destrói ilusões. A Justiça corta; a Torre cai.',
      crescimento: 'Desenvolve coragem de ver a verdade mesmo quando dolorosa.',
      desafio: 'Evitar julgamento precipitado; esperar até ter todos os fatos.',
      ritual: 'Prática de paciência antes de juzgar ou condemn.',
    },
  },
  {
    arcano: 'A Justiça',
    numero_carta: 11,
    related_arcano: 'A Lua',
    related_numero: 18,
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A verdade clara confronta a ilusión difundida. A Justiça revela o que a Lua esconde.',
      crescimento: 'Desenvolve discernment entre realidade e illusion.',
      desafio: 'Não absolutizar verdad; reconocer múltiplas perspectivas.',
      ritual: 'Prática de verification de信息来源 before forming opinions.',
    },
  },

  // ─── O Enforcado (12) - Sacrifice and surrender ──────────────────────────
  {
    arcano: 'O Enforcado',
    numero_carta: 12,
    related_arcano: 'A Morte',
    related_numero: 13,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O sacrifício voluntário precede a transformação inevitável. O Enforcado escolhe o que a Morte efetiva.',
      crescimento: 'Integra disposição de sacrifício com aceitação de mudança.',
      desafio: 'Não se Sacrificar excesivamente; preservarse para continuar missão.',
      ritual: 'Prática de identificar и sacrificar em terms de ego, não de necessidades.',
    },
  },
  {
    arcano: 'O Enforcado',
    numero_carta: 12,
    related_arcano: 'O Louco',
    related_numero: 0,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'A perspectiva invertida do Enforcado espelha a entrega do Louco. Ambos estão além da lógica convencional.',
      crescimento: 'Desenvolve capacidade de ver além do obvious e aceitar different ángulo.',
      desafio: 'Não romantizar sofrimento ou sacrifice innecesario.',
      ritual: 'Prática de sacrifice symbolique pour lâcher prise sur kontrol.',
    },
  },
  {
    arcano: 'O Enforcado',
    numero_carta: 12,
    related_arcano: 'A Temperança',
    related_numero: 14,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O sacrifício encontra equilíbrio na integração. O Enforcado ensina entrega; a Temperança enseña integración.',
      crescimento: 'Transforma sacrifice em ferramenta de crescimento, não em martyrdom.',
      desafio: 'Não fazer do sacrifice identidade; passar além dele.',
      ritual: 'Prática de identificação do que deve ser solto para dar espaço ao novo.',
    },
  },

  // ─── A Morte (13) - Transformation and ending ────────────────────────────
  {
    arcano: 'A Morte',
    numero_carta: 13,
    related_arcano: 'A Torre',
    related_numero: 16,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A transformação sutil precede a destruição dramática. A Morte transforma internamente; a Torre rompe externamente.',
      crescimento: 'Desenvolve capacidade de abraçar mudança antes que se torne crise.',
      desafio: 'Evitar aferrarse a lo que deve morrer naturalmente.',
      ritual: 'Prática de identificação e criação de rituals de despedida pessoal.',
    },
  },
  {
    arcano: 'A Morte',
    numero_carta: 13,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Após a morte vem a esperança renovadora. A Morte limpa; a Estrela semeia.',
      crescimento: 'Desenvolve confianza na rebirth depois de transformação dolorosa.',
      desafio: 'Não rushear processo de luto; permitir que transformação ocorra em seu tempo.',
      ritual: 'Prática de criação de espaço sagrado para processar perdas.',
    },
  },
  {
    arcano: 'A Morte',
    numero_carta: 13,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A muerte es portal hacia completitud. A Morte abre caminho para o Mundo que tudo inclui.',
      crescimento: 'Integra finitude como parte natural de ciclo de renovação.',
      desafio: 'Não temer a morte; vê-la como aliada na evolução.',
      ritual: 'Prática de meditação sobre mortalidade como lembrete de presença.',
    },
  },

  // ─── A Temperança (14) - Balance and integration ─────────────────────────
  {
    arcano: 'A Temperança',
    numero_carta: 14,
    related_arcano: 'O Diabo',
    related_numero: 15,
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'El equilíbrio confronting al desequilibrio. La Temperança integra lo que el Diablo desintegra.',
      crescimento: 'Desenvolve capacidade de encontrar harmonia em extremos.',
      desafio: 'Não perder o equilíbrio ao tentar integrar extremos.',
      ritual: 'Prática de identificación de áreas onde falta equilíbrio.',
    },
  },
  {
    arcano: 'A Temperança',
    numero_carta: 14,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'El equilíbrio encuentra claridad. La Temperança prepara el terreno que el Sol ilumina.',
      crescimento: 'Integra múltiples aspects de self em unidade coerente.',
      desafio: 'Não buscar equilíbrio perfecto, mas harmony dinámico.',
      ritual: 'Prática de actividades que integran corpo, mente e spirit.',
    },
  },
  {
    arcano: 'A Temperança',
    numero_carta: 14,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'El synthesis de opposites culminates en despertar. La Temperança integra; el Julgamento panggilan.',
      crescimento: 'Desenvolve capacidade de evaluar progress honestly.',
      desafio: 'Não se tornar excessivamente crítico de si mesmo ou dos outros.',
      ritual: 'Prática de daily reflection sobre intégration de lições.',
    },
  },

  // ─── O Diabo (15) - Shadow and bondage ───────────────────────────────────
  {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'A Torre',
    related_numero: 16,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'La liberación de cadenas precede al colapso de estructuras. El Diablo rompt cadenas; la Torre rompt construcción.',
      crescimento: 'Desenvolve capacidade de identificar e libertar-se de prisões internas.',
      desafio: 'Não culpar externalmente; asumir responsabilidade por escolhas.',
      ritual: 'Prática de identification de padrões repetitivos que limitam.',
    },
  },
  {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'La sombra confronta la esperanza. Donde el Diablo prende, la Estrela ilumina caminho de escape.',
      crescimento: 'Transforma sombra em combustível para renovação.',
      desafio: 'Não negar a sombra; integrá-la conscientemente.',
      ritual: 'Prática de trabalho com sombra através de arte ou escritura terapêutica.',
    },
  },
  {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'La prisión de apegos confronta la luz de la claridad. El Diablo mantiene; el Sol liberta.',
      crescimento: 'Desenvolve capacidade de identificar qué es real libertad versus falsa libertação.',
      desafio: 'Não confundir liberdade com satisfação imediata de желаний.',
      ritual: 'Prática de exame de motivations por trás de desejos.',
    },
  },

  // ─── A Torre (16) - Sudden change and awakening ──────────────────────────
  {
    arcano: 'A Torre',
    numero_carta: 16,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'La destrucción abre camino para la iluminación. La Torre derriba; el Sol construye.',
      crescimento: 'Desenvolve capacidade de encontrar gift em crisis.',
      desafio: 'No resistir mudança inevitável; allowir que old structures caigan.',
      ritual: 'Prática de welcoming de disruptions como oportunidades de crescimento.',
    },
  },
  {
    arcano: 'A Torre',
    numero_carta: 16,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'La purificación por crisis precede a renovación esperançada. La Torre quebra; la Estrela reconstruye.',
      crescimento: 'Desenvolve confiança de que después de la pior mudança viene esperança.',
      desafio: 'No quedarse en trauma de crisis; comenzar processo de rebuild.',
      ritual: 'Prática de création de novo depois de pérdidas significativas.',
    },
  },
  {
    arcano: 'A Torre',
    numero_carta: 16,
    related_arcano: 'A Lua',
    related_numero: 18,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'La verdad que emerge de crisis enfrenta ilusiones profundas. La Torre revela lo que la Luna escondía.',
      crescimento: 'Desenvolve capacidade de confrontar medos inconscientes.',
      desafio: 'No perder-se em sombras después de revelações dolorosas.',
      ritual: 'Prática de integration de revelações em nova perspectiva.',
    },
  },

  // ─── A Estrela (17) - Hope and renewal ───────────────────────────────────
  {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'A Lua',
    related_numero: 18,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'La esperança encuentra a profundidade. La Estrela guía; la Luna ilumina profundidades.',
      crescimento: 'Desenvolve capacidade de mantener esperança mesmo cuando tudo parece escuro.',
      desafio: 'No caer en negación; reconhecer que algunas sombras são reais.',
      ritual: 'Prática de navegación entre esperança y realidad.',
    },
  },
  {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'La renovação lleva a despertar. La Estrela renova; el Julgamento proclama nueva vida.',
      crescimento: 'Desenvolve capacidade de celebrar renovações e recomeços.',
      desafio: 'No aferrarse a esperanza de manera rígida; aceitar que também passa.',
      ritual: 'Prática de definição de novas intentions após renovación.',
    },
  },
  {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'La esperança se convierte em completitud. La Estrela mira hacia el futuro; el Mundo incluy todo.',
      crescimento: 'Integra esperanza en visão de completitud mayor.',
      desafio: 'No limitar esperança a outcomes específicos.',
      ritual: 'Prática de visualização de future mejorado alinhado com propósito.',
    },
  },

  // ─── A Lua (18) - Illusion and intuition ─────────────────────────────────
  {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'La ilusión confronta la realidad. La Luna refleja; el Sol ilumina directamente.',
      crescimento: 'Desenvolve capacidade de discernir entre realidade e reflexão.',
      desafio: 'No dejar que proyecciones distorsionen percepção da realidade.',
      ritual: 'Prática de verificación de percepciones antes de acting on ellas.',
    },
  },
  {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'Las profundidades inconscientes emergem para julgamento. La Luna esconde; el Julgamento revela.',
      crescimento: 'Desenvolve capacidade de trazer sombras à luz conscientemente.',
      desafio: 'No suprimir o que emerge; integrá-lo com сознательность.',
      ritual: 'Prática de trabajo ativo com sonhos e material inconsciente.',
    },
  },
  {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'A Justiça',
    related_numero: 11,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'La intuición profunda informar justícia. La Luna guia; la Justicia aplica.',
      crescimento: 'Desenvolve capacidade de combinar insight intuitivo com ação справедливо.',
      desafio: 'No actuar baseado apenas em sentimentos; verificar com razão.',
      ritual: 'Prática de consulta interna antes de decisões importantes.',
    },
  },

  // ─── O Sol (19) - Success and clarity ─────────────────────────────────────
  {
    arcano: 'O Sol',
    numero_carta: 19,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'La claridad alcanza completitud. El Sol ilumina; el Mundo incluy todo lo iluminado.',
      crescimento: 'Integra claridad em integración con el todo.',
      desafio: 'No absolutizar propias percepciones; mantener apertura.',
      ritual: 'Prática de GRATITUDE por claridad alcanzada.',
    },
  },
  {
    arcano: 'O Sol',
    numero_carta: 19,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'La luz informa despertar. El Sol guía; el Julgamento proclama la arrivada.',
      crescimento: 'Desenvolve capacidade de reconocer momentos de despertar.',
      desafio: 'Nozatrancar-se em success; continuar evolucionando.',
      ritual: 'Prática de evaluación periódica de growth pessoal.',
    },
  },
  {
    arcano: 'O Sol',
    numero_carta: 19,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'La luz masculina encuentro fertility femenina. El Sol aclara; la Imperatriz nutre.',
      crescimento: 'Integra clareza com compaixão, propósito com amor.',
      desafio: 'No Intellectualizar excessivamente; manter conexão coração.',
      ritual: 'Prática de decisões alineadas com mente e coração.',
    },
  },

  // ─── O Julgamento (20) - Reckoning and awakening ──────────────────────────
  {
    arcano: 'O Julgamento',
    numero_carta: 20,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'El despertar lleva a completitud. El Julgamento proclama; el Mundo incluy.',
      crescimento: 'Desenvolve capacidade de reconhecer próprio llamado.',
      desafio: 'No juzgar a outros mientras no se juzga a sí mismo primero.',
      ritual: 'Prática deauto-evaluación compassionata перед decisão importante.',
    },
  },
  {
    arcano: 'O Julgamento',
    numero_carta: 20,
    related_arcano: 'A Morte',
    related_numero: 13,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'El julgamento transforma lo que la muerte ya cambió. El Julgamento proclama renovação que la Muerte habilitó.',
      crescimento: 'Desenvolve capacidade de celebrar transformações superadas.',
      desafio: 'No juzgar el pasado con estándares actuales.',
      ritual: 'Prática de reconciliación com própria história.',
    },
  },
  {
    arcano: 'O Julgamento',
    numero_carta: 20,
    related_arcano: 'O Eremita',
    related_numero: 9,
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'La sabiduría busca reconhecimento. El Eremita encuentra; el Julgamento valida.',
      crescimento: 'Integra sabiduría ganada com reconhecimento público.',
      desafio: 'No buscar validación externa exclusivamente; tener validation interno.',
      ritual: 'Prática de reconhecimento de próprios logros, não só de outros.',
    },
  },

  // ─── O Mundo (21) - Completion and integration ────────────────────────────
  {
    arcano: 'O Mundo',
    numero_carta: 21,
    related_arcano: 'O Louco',
    related_numero: 0,
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'El ciclo completo vuelve al inicio. El Mundo incluy todo lo aprendido; el Louco начинает novo ciclo.',
      crescimento: 'Desenvolve capacidade de celebrar completitud enquanto se prepara para recomeçar.',
      desafio: 'No apegarse a logro; reconocer que cada final es novo princípio.',
      ritual: 'Prática de ritual de cierre que incluya gratitud y apertura para lo nuevo.',
    },
  },
  {
    arcano: 'O Mundo',
    numero_carta: 21,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'La completitud mira hacia esperança futura. El Mundo incluy presente; la Estrela anticipa futuro.',
      crescimento: 'Integra logro pasado com esperança future em presente consciente.',
      desafio: 'No limitarse a celebración passado; manter abertura para evolución.',
      ritual: 'Prática de definition de new visión depois de logro significativo.',
    },
  },
  {
    arcano: 'O Mundo',
    numero_carta: 21,
    related_arcano: 'O Carro',
    related_numero: 7,
    path_type: 'Ancestral',
    spiritual_meaning: {
      significado: 'La conquista culminates em integración. El Carro conquistou lo que el Mundo integramente.',
      crescimento: 'Integra kekuatan yang digunakan untuk conquiste em wisdom acumulada.',
      desafio: 'No conmemmorar exceso passado; intégrer en présent expanded.',
      ritual: 'Prática de integración de logros em identidade más amplia.',
    },
  },
] as const;

// Freeze the array to prevent modifications
Object.freeze(TAROT_TAROT_MAPPINGS);
Object.freeze(TAROT_TAROT_MAPPINGS);

// ─── All 22 Major Arcana Names (sorted by number) ────────────────────────────
export const ALL_MAJOR_ARCANOS = [...ARCANOS] as const;

/**
 * Get the Tarot-Tarot correlation mapping for a given arcano
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Mago')
 * @returns Array of correlation mappings or empty array if not found
 */
export function getTarotTarot(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(
    (mapping) => mapping.arcano === arcano || mapping.related_arcano === arcano,
  );
}

/**
 * Get all tarot-tarot relations
 * @returns Array of all correlation mappings
 */
export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS;
}

/**
 * Get all path types used in the mapping
 * @returns Array of unique path types
 */
export function getAllPathTypes(): TarotPathType[] {
  const types = new Set<TarotPathType>();
  TAROT_TAROT_MAPPINGS.forEach((mapping) => types.add(mapping.path_type));
  return Array.from(types);
}

/**
 * Get all arcano names that appear in the mappings
 * @returns Array of unique arcano names
 */
export function getAllMappedArcanos(): string[] {
  const arcanoSet = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach((mapping) => {
    arcanoSet.add(mapping.arcano);
    arcanoSet.add(mapping.related_arcano);
  });
  return Array.from(arcanoSet).sort((a, b) => {
    const getNum = (name: string) => {
      const m = TAROT_TAROT_MAPPINGS.find((m) => m.arcano === name || m.related_arcano === name);
      return m?.numero_carta ?? m?.related_numero ?? 99;
    };
    return getNum(a) - getNum(b);
  });
}

/**
 * Get all relations for a specific arcano
 * @param arcano - Arcano name
 * @returns Array of mappings where this arcano appears
 */
export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(
    (mapping) => mapping.arcano === arcano || mapping.related_arcano === arcano,
  );
}

/**
 * Get relations by path type
 * @param path_type - Type of path to filter
 * @returns Array of mappings for that path type
 */
export function getRelationsByPathType(path_type: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((mapping) => mapping.path_type === path_type);
}

/**
 * Get the path type between two arcanos
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns Path type or null if no relation found
 */
export function getPathTypeBetween(arcano1: string, arcano2: string): TarotPathType | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1),
  );
  return mapping?.path_type ?? null;
}

/**
 * Get the spiritual meaning between two arcanos
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns Spiritual meaning object or null if no relation found
 */
export function getSpiritualMeaningBetween(
  arcano1: string,
  arcano2: string,
): TarotTarotMapping['spiritual_meaning'] | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1),
  );
  return mapping?.spiritual_meaning ?? null;
}

/**
 * Check if two arcanos have a mapped relationship
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns True if a relationship exists
 */
export function hasRelation(arcano1: string, arcano2: string): boolean {
  return TAROT_TAROT_MAPPINGS.some(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1),
  );
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const mapping = TAROT_TAROT_MAPPINGS.find((m) => m.numero_carta === numero);
  return mapping?.arcano ?? null;
}

/**
 * Count of all mappings in the dataset
 */
export const TOTAL_MAPPINGS = TAROT_TAROT_MAPPINGS.length;

/**
 * Count of unique path types
 */
export const TOTAL_PATH_TYPES = getAllPathTypes().length;

// ─── Default Export ─────────────────────────────────────────────────────────
export default {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getRelationsForArcano,
  getRelationsByPathType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  getArcanoByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
};