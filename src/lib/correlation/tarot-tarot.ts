/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to each other based on esoteric connections,
 * elemental relationships, and archetypal progressions.
 * Source: Cabala dos Caminhos spiritual system
 */

/**
 * The 22 Tarot Major Arcana cards (0-21)
 */
export type ArcanoMaior =
  | 'O Louco'
  | 'O Mago'
  | 'A Sacerdotisa'
  | 'A Imperatriz'
  | 'O Imperador'
  | 'O Hierofante'
  | 'Os Enamorados'
  | 'O Carro'
  | 'A Justiça'
  | 'O Eremita'
  | 'A Roda da Fortuna'
  | 'A Força'
  | 'O Enforcado'
  | 'A Morte'
  | 'A Temperança'
  | 'O Diabo'
  | 'A Torre'
  | 'A Estrela'
  | 'A Lua'
  | 'O Sol'
  | 'O Julgamento'
  | 'O Mundo';

/**
 * Type of relationship between two arcana
 */
export type ArcanoRelationType =
  | 'prequel'          // Card leads to the other (narrative progression)
  | 'sequel'           // Card follows from the other (narrative consequence)
  | 'complementar'     // Cards balance each other
  | 'ascendente'       // Card elevates to the other (spiritual evolution)
  | 'descendente'      // Card descends from the other (spiritual decline)
  | 'elemental'        // Same elemental connection
  | 'numerico'         // Numerical relationship
  | 'sombra'           // Shadow/aspect relationship
  | 'luz'              // Light/aspect relationship
  | 'caminho'          // Part of the same spiritual path
  | 'inverso'          // Card can be reversed/transformed into another
  | 'equivalente';     // Functionally equivalent in different context

/**
 * Represents a correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** Source arcano */
  source: string;
  /** Target arcano */
  target: string;
  /** Source card number (0-21) */
  source_numero: number;
  /** Target card number (0-21) */
  target_numero: number;
  /** Type of relationship */
  tipo_relacao: ArcanoRelationType;
  /** Spiritual connection description */
  conexao_espiritual: string;
  /** Elemental correspondence */
  elemento: string;
  /** Numerological connection */
  numerologia: string;
  /** Key spiritual lesson from this relationship */
  licao_espiritual: string;
  /** Affirmation for working with this relationship */
  affirmacao: string;
  /** Order for sorting (sequential numbering for consistent output) */
  ordem: number;
}

/**
 * Complete mapping of Tarot Major Arcana card relationships.
 * Each card connects to others based on:
 * - Esoteric traditions (Golden Dawn, Thoth, Rider-Waite-Smith)
 * - Cabalistic paths on the Tree of Life
 * - Elemental correspondences
 * - Numerological relationships
 * - Narrative/spiritual journeys
 */
export const TAROT_TAROT_MAP: readonly TarotTarotMapping[] = [
  // ═══════════════════════════════════════════════════════════════════
  // O Louco (0) — The Journey Begins
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Louco',
    target: 'O Mago',
    source_numero: 0,
    target_numero: 1,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'O Louco encontra sua expressão concentrada no Mago. A liberdade selvagem do Louco se canaliza através da vontade deliberada do Mago, transformando potencial em ação.',
    elemento: 'Ar',
    numerologia: '22 → 1: O todo (22) se manifesta no uno (1)',
    licao_espiritual: 'A liberdade sem direção é apenas caos; a vontade sem liberdade é apenas prisão.',
    affirmacao: 'Eu canalizo minha liberdade infinita através da minha vontade consciente.',
    ordem: 1,
  },
  {
    source: 'O Louco',
    target: 'O Eremita',
    source_numero: 0,
    target_numero: 9,
    tipo_relacao: 'caminho',
    conexao_espiritual: 'O Louco segue o caminho do Eremita — a jornada solitária do autodescobrimento. Ambos buscam a verdade interior longe das convenções sociais.',
    elemento: 'Ar',
    numerologia: '0 + 9 = 9: A jornada completa retorna à sabedoria interior',
    licao_espiritual: 'O verdadeiro viajante sempre busca sozinho, pois a iluminação não pode ser compartilhada.',
    affirmacao: 'Eu abraço a solidão sagrada da minha jornada interior.',
    ordem: 2,
  },
  {
    source: 'O Louco',
    target: 'O Sol',
    source_numero: 0,
    target_numero: 19,
    tipo_relacao: 'luz',
    conexao_espiritual: 'A luz interior do Louco irrompe como O Sol. O que começa em trevas (Louco como 0/vazio) eventualmente brilha como iluminação.',
    elemento: 'Fogo',
    numerologia: '0 → 19: A potencialidade se torna manifestação radiante',
    licao_espiritual: 'Cada criança interior carrega a semente do sol; cultive-a com paciência.',
    affirmacao: 'Eu deixo minha luz interior brilhar com alegria autêntica.',
    ordem: 3,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Mago (1) — The Will and Manifestation
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Mago',
    target: 'A Sacerdotisa',
    source_numero: 1,
    target_numero: 2,
    tipo_relacao: 'prequel',
    conexao_espiritual: 'O Mago ativa; a Sacerdotisa revela. O Mago coloca a energia em movimento; a Sacerdotisa interpreta o significado oculto.',
    elemento: 'Fogo',
    numerologia: '1 + 2 = 3: A ação (1) encontra a receptividade (2) para criar (3)',
    licao_espiritual: 'Toda manifestação física começa com uma intenção interior que deve ser decifrada.',
    affirmacao: 'Eu ativo minha intenção e permito que a sabedoria intuitiva guie minha ação.',
    ordem: 4,
  },
  {
    source: 'O Mago',
    target: 'A Imperatriz',
    source_numero: 1,
    target_numero: 3,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'O Mago manifesta; a Imperatriz nutre a criação. A vontade do Mago cria; a Imperatriz sustenta e desenvolve.',
    elemento: 'Fogo',
    numerologia: '1 × 3 = 3: A intenção multiplicada pela natureza resulta em criação',
    licao_espiritual: 'A verdadeira força criativa vem de nutrir, não de controlar.',
    affirmacao: 'Eu crio com abundância e nutro minhas criações com amor.',
    ordem: 5,
  },
  {
    source: 'O Mago',
    target: 'O Hierofante',
    source_numero: 1,
    target_numero: 5,
    tipo_relacao: 'caminho',
    conexao_espiritual: 'O Mago é o aprendiz; o Hierofante é o mestre. O poder pessoal se expande em sabedoria institucionalizada.',
    elemento: 'Fogo',
    numerologia: '1 + 5 = 6: A vontade individual encontra harmonia no grupo',
    licao_espiritual: 'O poder pessoal precisa de tradição para se tornar sabedoria duradoura.',
    affirmacao: 'Eu busco conhecimento sagrado nos ensinamentos dos mestres.',
    ordem: 6,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Sacerdotisa (2) — The Intuitive Wisdom
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Sacerdotisa',
    target: 'A Imperatriz',
    source_numero: 2,
    target_numero: 3,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'A Sacerdotisa revela; a Imperatriz materializa. A sabedoria intuitiva se torna fertilidade criativa, manifestando o oculto no visível.',
    elemento: 'Água',
    numerologia: '2 × 3 = 6: A sabedoria (2) multiplicada pela criação (3) resulta em harmonia (6)',
    licao_espiritual: 'A intuição precisa ser expressada para ter propósito; a criação precisa de sabedoria para ter direção.',
    affirmacao: 'Eu traduzo minha sabedoria interior em criações que nutrem o mundo.',
    ordem: 7,
  },
  {
    source: 'A Sacerdotisa',
    target: 'A Lua',
    source_numero: 2,
    target_numero: 18,
    tipo_relacao: 'luz',
    conexao_espiritual: 'A Sacerdotisa guarda os segredos da Lua. Ambas governam o mundo emocional, os sonhos e os reflexos ilusórios.',
    elemento: 'Água',
    numerologia: '2 × 9 = 18: A sabedoria intuitiva (2)望向 inconsciente (18)',
    licao_espiritual: 'Os caminhos da lua são tortuosos; confia na tua bússola interior.',
    affirmacao: 'Eu navego pelos mares da minha psique com sabedoria e sem medo.',
    ordem: 8,
  },
  {
    source: 'A Sacerdotisa',
    target: 'O Eremita',
    source_numero: 2,
    target_numero: 9,
    tipo_relacao: 'sombra',
    conexao_espiritual: 'A Sacerdotisa busca sabedoria no silêncio; o Eremita a encontra. O caminho solitário do buscador é iluminado pela luz interior.',
    elemento: 'Água',
    numerologia: '2 + 9 = 11: A sabedoria se torna iluminação (11, número mestre)',
    licao_espiritual: 'A busca interior é solitária mas nunca vazia; a sabedoria aguarda no silêncio.',
    affirmacao: 'Eu encontro iluminação na solidão sagrada do meu ser interior.',
    ordem: 9,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Imperatriz (3) — The Fertile Abundance
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Imperatriz',
    target: 'O Imperador',
    source_numero: 3,
    target_numero: 4,
    tipo_relacao: 'prequel',
    conexao_espiritual: 'A Imperatriz cria; o Imperador estrutura. A fertilidade natural precisa de estrutura para se realizar plenamente.',
    elemento: 'Terra',
    numerologia: '3 + 4 = 7: A criação (3) encontra ordem (4) para resultar em perfeição (7)',
    licao_espiritual: 'A natureza sem forma é caos; a forma sem natureza é seca.',
    affirmacao: 'Eu crio estrutura para sustentar minha fertilidade natural.',
    ordem: 10,
  },
  {
    source: 'A Imperatriz',
    target: 'A Estrela',
    source_numero: 3,
    target_numero: 17,
    tipo_relacao: 'luz',
    conexao_espiritual: 'A Imperatriz é a terra fértil; a Estrela é a esperança celestial. Ambas representam abundância e regeneração.',
    elemento: 'Terra',
    numerologia: '3 × 9 = 27 → 9: A criação multiplicada pela intuição resulta em renovação',
    licao_espiritual: 'Da terra fértil brotam estrelas; a esperança nasce da abundância.',
    affirmacao: 'Eu permito que a esperança flua da minha conexão com a natureza.',
    ordem: 11,
  },
  {
    source: 'A Imperatriz',
    target: 'O Mundo',
    source_numero: 3,
    target_numero: 21,
    tipo_relacao: 'equivalente',
    conexao_espiritual: 'A Imperatriz é o princípio feminino da criação; O Mundo é a réalisation completa. Ambos representam plenitude e integração.',
    elemento: 'Terra',
    numerologia: '3 × 7 = 21: A criação (3) vezes perfeição (7) resulta em completude (21)',
    licao_espiritual: 'A plenitude está ao alcance; ela começa com a conexão com a natureza.',
    affirmacao: 'Eu abraço a plenitude da criação e celebro minha conexão com tudo.',
    ordem: 12,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Imperador (4) — The Structured Authority
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Imperador',
    target: 'O Hierofante',
    source_numero: 4,
    target_numero: 5,
    tipo_relacao: 'prequel',
    conexao_espiritual: 'O Imperador estabelece ordem secular; o Hierofante eleva a ordem espiritual. O poder político se torna poder sagrado.',
    elemento: 'Fogo',
    numerologia: '4 + 5 = 9: A estrutura (4) se transforma em sabedoria (9) através da tradição (5)',
    licao_espiritual: 'A verdadeira autoridade vem de serviço, não de domínio.',
    affirmacao: 'Eu establezco ordem com sabedoria e liderança com integridade.',
    ordem: 13,
  },
  {
    source: 'O Imperador',
    target: 'A Justiça',
    source_numero: 4,
    target_numero: 11,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'O Imperador governa pelo poder; a Justiça governa pela verdade. O ordem imperfeito do mundo se transforma em justiça cósmica.',
    elemento: 'Fogo',
    numerologia: '4 × 11 = 44 → 8: A estrutura (4) vezes equilíbrio (11) resulta em poder (8)',
    licao_espiritual: 'A verdadeira força está no equilíbrio entre ação e consequência.',
    affirmacao: 'Eu busco harmonia entre meus direitos e minhas responsabilidades.',
    ordem: 14,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Hierofante (5) — The Sacred Tradition
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Hierofante',
    target: 'Os Enamorados',
    source_numero: 5,
    target_numero: 6,
    tipo_relacao: 'prequel',
    conexao_espiritual: 'O Hierofante ensina a escolha; Os Enamorados vivem a escolha. A tradição mostra o caminho; o coração decide.',
    elemento: 'Fogo',
    numerologia: '5 + 6 = 11: A tradição (5) mais o amor (6) resulta em equilíbrio (11)',
    licao_espiritual: 'A escolha de amor é a escolha espiritual mais importante.',
    affirmacao: 'Eu escolho com coragem o que eleva minha alma.',
    ordem: 15,
  },
  {
    source: 'O Hierofante',
    target: 'O Eremita',
    source_numero: 5,
    target_numero: 9,
    tipo_relacao: 'inverso',
    conexao_espiritual: 'O Hierofante busca iluminação na tradição; o Eremita a busca na solidão. Opostos que se complementam na busca espiritual.',
    elemento: 'Fogo',
    numerologia: '5 + 9 = 14: A tradição (5) se transforma através da busca interior (9)',
    licao_espiritual: 'O mestre pode mostrar o caminho, mas você precisa caminhar sozinho.',
    affirmacao: 'Eu encontro equilíbrio entre tradição sagrada e sabedoria interior.',
    ordem: 16,
  },

  // ═══════════════════════════════════════════════════════════════════
  // Os Enamorados (6) — The Choice of Union
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'Os Enamorados',
    target: 'O Carro',
    source_numero: 6,
    target_numero: 7,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'A escolha de Os Enamorados se transforma em conquista do Carro. O amor inspira a vitória.',
    elemento: 'Ar',
    numerologia: '6 + 7 = 13: A união (6) mais a conquista (7) resulta em transformação (13)',
    licao_espiritual: 'A escolha de amor abre caminho para a vitória.',
    affirmacao: 'Eu conquisto meus objetivos com a força do amor.',
    ordem: 17,
  },
  {
    source: 'Os Enamorados',
    target: 'A Justiça',
    source_numero: 6,
    target_numero: 11,
    tipo_relacao: 'elemental',
    conexao_espiritual: 'Ambos equilibram polaridades. Os Enamorados equilibram o coração; a Justiça equilibra a lei. O amor é a base da justiça.',
    elemento: 'Ar',
    numerologia: '6 + 5 = 11: O amor (6) através da tradição (5) encontra equilíbrio (11)',
    licao_espiritual: 'O amor verdadeiro é justo; a justiça verdadeira é amor.',
    affirmacao: 'Eu practico justiça com coração aberto e decisões com equilíbrio.',
    ordem: 18,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Carro (7) — The Triumph of Will
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Carro',
    target: 'A Força',
    source_numero: 7,
    target_numero: 8,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'O Carro conquista externamente; A Força conquista internamente. A vitória exterior se transforma em domínio interior.',
    elemento: 'Fogo',
    numerologia: '7 + 8 = 15: A conquista (7) mais a força (8) pode resultar em tentação (15)',
    licao_espiritual: 'A verdadeira vitória é sobre nós mesmos.',
    affirmacao: 'Eu conquisto com compaixão e domínio interior.',
    ordem: 19,
  },
  {
    source: 'O Carro',
    target: 'O Diabo',
    source_numero: 7,
    target_numero: 15,
    tipo_relacao: 'sombra',
    conexao_espiritual: 'O Carro pode se tornar o Diabo — a vitória sem sabedoria se torna escravidão. O triunfo fácil pode levar à armadilha.',
    elemento: 'Fogo',
    numerologia: '7 × 2 = 14: A conquista (7) vezes dualidade (2) resulta em oportunidade (14)',
    licao_espiritual: 'O sucesso sem humildade é prenúncio de queda.',
    affirmacao: 'Eu celebro minhas conquistas sem perder minha integridade.',
    ordem: 20,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Justiça (8) — The Balance of Cause and Effect
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Justiça',
    target: 'O Julgamento',
    source_numero: 8,
    target_numero: 20,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'A Justiça pesa as ações; O Julgamento evaluationa a alma. O equilíbrio presente prepara o julgamento futuro.',
    elemento: 'Ar',
    numerologia: '8 + 12 = 20: A equilíbrio (8) mais experiência (12) resulta em avaliação (20)',
    licao_espiritual: 'Cada ação tem consequência; cada escolha molda seu destino.',
    affirmacao: 'Eu vivo em harmonia com as leis do universo e me preparo para meu julgamento interior.',
    ordem: 21,
  },
  {
    source: 'A Justiça',
    target: 'A Temperança',
    source_numero: 8,
    target_numero: 14,
    tipo_relacao: 'elemental',
    conexao_espiritual: 'A Justiça equilibra extremos; A Temperança mistura opostos. Ambas buscam harmonia através do equilíbrio.',
    elemento: 'Ar',
    numerologia: '8 + 6 = 14: O equilíbrio (8) mais harmonia (6) resulta em moderação (14)',
    licao_espiritual: 'O caminho do meio é o caminho da sabedoria.',
    affirmacao: 'Eu encontro harmonia na moderação e equilíbrio entre extremos.',
    ordem: 22,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Eremita (9) — The Inner Light
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Eremita',
    target: 'A Estrela',
    source_numero: 9,
    target_numero: 17,
    tipo_relacao: 'luz',
    conexao_espiritual: 'O Eremita encontra sua luz interior; a Estrela brilha para os outros. A sabedoria solitária se torna esperança compartilhada.',
    elemento: 'Terra',
    numerologia: '9 × 2 = 18: A sabedoria (9) vezes receptividade (2) resulta em ilusão (18)',
    licao_espiritual: 'A luz interior precisa ser compartilhada para ter significado.',
    affirmacao: 'Eu compartilho minha luz interior como estrela-guia para outros viajantes.',
    ordem: 23,
  },
  {
    source: 'O Eremita',
    target: 'O Louco',
    source_numero: 9,
    target_numero: 0,
    tipo_relacao: 'sequel',
    conexao_espiritual: 'O Eremita retorna ao Louco — a sabedoria encontra a liberdade. Após a busca, voltamos ao início com novos olhos.',
    elemento: 'Terra',
    numerologia: '9 + 0 = 9: A sabedoria permanece completa na liberdade',
    licao_espiritual: 'O mestre e o aprendiz são a mesma pessoa em diferentes momentos.',
    affirmacao: 'Eu carrego minha sabedoria com leveza e liberdade.',
    ordem: 24,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Roda da Fortuna (10) — The Cycles of Change
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Roda da Fortuna',
    target: 'A Morte',
    source_numero: 10,
    target_numero: 13,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'A Roda gira; a Morte transforma. O ciclo completo termina em reintegração. Mudança inevitável leva a renovação inevitável.',
    elemento: 'Fogo',
    numerologia: '1 + 0 + 4 = 5: A soma dos opostos na Roda (1+0) mais destino (4) resulta em mudança (5)',
    licao_espiritual: 'A única constante é a mudança; abrace-a para renascer.',
    affirmacao: 'Eu abraço a transformação como parte natural da minha jornada.',
    ordem: 25,
  },
  {
    source: 'A Roda da Fortuna',
    target: 'O Diabo',
    source_numero: 10,
    target_numero: 15,
    tipo_relacao: 'sombra',
    conexao_espiritual: 'A Roda pode cair no Diabo — a má sorte se torna prisão. A ilusão de controle na Roda pode se tornar chains do Diabo.',
    elemento: 'Fogo',
    numerologia: '10 = 1: A Roda (10) manifesta o uno (1) — oportunidade ou prisão',
    licao_espiritual: 'O destino oferece chances; evite que se tornem prisões.',
    affirmacao: 'Eu reconheço as chances do destino sem ser escravo delas.',
    ordem: 26,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Força (8) — The Inner Power
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Força',
    target: 'O Eremita',
    source_numero: 8,
    target_numero: 9,
    tipo_relacao: 'caminho',
    conexao_espiritual: 'A Força domestica o animal interior; o Eremita ilumina o caminho. O domínio de si mesmo leva à sabedoria interior.',
    elemento: 'Fogo',
    numerologia: '8 + 9 = 17: A força (8) mais sabedoria (9) resulta em esperança (17)',
    licao_espiritual: 'A verdadeira força está na gentleness, não na dominação.',
    affirmacao: 'Eu uso minha força interior com compaixão e gentileza.',
    ordem: 27,
  },
  {
    source: 'A Força',
    target: 'O Carro',
    source_numero: 8,
    target_numero: 7,
    tipo_relacao: 'inverso',
    conexao_espiritual: 'A Força conquista interiormente; o Carro conquista exteriormente. Ambos precisam um do outro para equilíbrio completo.',
    elemento: 'Fogo',
    numerologia: '8 + 7 = 15: A força (8) mais conquista (7) pode resultar em tentação (15)',
    licao_espiritual: 'Conquista sem integridade é vazia; força sem ação é estagnação.',
    affirmacao: 'Eu equilibrate conquista externa com força interna.',
    ordem: 28,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Enforcado (11) — The Surrender
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Enforcado',
    target: 'A Justiça',
    source_numero: 11,
    target_numero: 8,
    tipo_relacao: 'sombra',
    conexao_espiritual: 'O Enforcado sacrifica por justiça; a Justiça evaluationa esse sacrifício. A suspensão do ego é necesaria para o equilíbrio.',
    elemento: 'Água',
    numerologia: '11 × 8 = 88 → 16: Sacrifício (11) vezes equilíbrio (8) pode resultar em upheaval (16)',
    licao_espiritual: 'O sacrifício altruísta é評価ado pelo universo.',
    affirmacao: 'Eu ofereço sacrifício pelo bem maior com confiança na justiça cósmica.',
    ordem: 29,
  },
  {
    source: 'O Enforcado',
    target: 'O Hierofante',
    source_numero: 11,
    target_numero: 5,
    tipo_relacao: 'complementar',
    conexao_espiritual: 'O Enforcado inverte a ordem do Hierofante. Sacrifício pessoal contra tradição institucional — opostos que se equilibram.',
    elemento: 'Água',
    numerologia: '11 + 5 = 16: Sacrifício (11) mais tradição (5) pode resultar em libertação (16)',
    licao_espiritual: 'Às vezes, inverter a ordem estabelecida é o caminho para a verdade.',
    affirmacao: 'Eu cuestiono tradições quando necessário, buscando minha própria verdade.',
    ordem: 30,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Morte (13) — The Transformation
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Morte',
    target: 'A Torre',
    source_numero: 13,
    target_numero: 16,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'A Morte transforma silenciosamente; a Torre destrói dramaticamente. Ambas são necessárias para renovação.',
    elemento: 'Água',
    numerologia: '13 + 16 = 29 → 11: Transformação (13) mais destruição (16) pode resultar em iluminação (11)',
    licao_espiritual: 'A morte é necessária para renascimento; a destruição é necessária para reconstrução.',
    affirmacao: 'Eu aceito a morte como portal para nova vida e abraço a destruição como caminho para renovação.',
    ordem: 31,
  },
  {
    source: 'A Morte',
    target: 'A Temperança',
    source_numero: 13,
    target_numero: 14,
    tipo_relacao: 'sequel',
    conexao_espiritual: 'A Morte elimina o excesso; a Temperança mantém o equilíbrio. Após transformação, vem integração.',
    elemento: 'Água',
    numerologia: '13 + 14 = 27 → 9: Transformação (13) mais integração (14) resulta em sabedoria (9)',
    licao_espiritual: 'A morte dos velhos hábitos permite que a moderação floresça.',
    affirmacao: 'Eu deixo morrer o que não serve mais e abraço a moderação no que resta.',
    ordem: 32,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Temperança (14) — The Alchemy of Balance
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Temperança',
    target: 'A Morte',
    source_numero: 14,
    target_numero: 13,
    tipo_relacao: 'prequel',
    conexao_espiritual: 'A Temperança mistura os opostos; a Morte encerra o ciclo. O equilíbrio prepara o terreno para transformação.',
    elemento: 'Fogo',
    numerologia: '14 - 13 = 1: A moderação (14) diminui as extremez para chegar ao uno (1)',
    licao_espiritual: 'O equilíbrio é prerequisito para transformação significativa.',
    affirmacao: 'Eu misturo os opostos com sabedoria para preparar minha transformação.',
    ordem: 33,
  },
  {
    source: 'A Temperança',
    target: 'O Diabo',
    source_numero: 14,
    target_numero: 15,
    tipo_relacao: 'sombra',
    conexao_espiritual: 'A Temperança evita os excessos do Diabo. O equilíbrio saudável contrasta com a prisão das chains.',
    elemento: 'Fogo',
    numerologia: '14 + 15 = 29 → 11: Moderação (14) plus tentação (15) pode resultar em equilíbrio (11)',
    licao_espiritual: 'A moderação protege contra a prisão; o excesso leva à escravidão.',
    affirmacao: 'Eu encontro prazer na moderação e evito as chains do excesso.',
    ordem: 34,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Diabo (15) — The Shadow and Bondage
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Diabo',
    target: 'A Torre',
    source_numero: 15,
    target_numero: 16,
    tipo_relacao: 'sequel',
    conexao_espiritual: 'O Diabo prende; a Torre liberta. As chains do Diabo são quebradas pela iluminação da Torre.',
    elemento: 'Fogo',
    numerologia: '15 + 16 = 31 → 4: Tentação (15) mais destruição (16) resulta em estrutura (4) — libertação.',
    licao_espiritual: 'A libertação das chains vem através de destruição das ilusões.',
    affirmacao: 'Eu quebro as chains da escravidão e me liberto das prisões auto-impostas.',
    ordem: 35,
  },
  {
    source: 'O Diabo',
    target: 'O Carro',
    source_numero: 15,
    target_numero: 7,
    tipo_relacao: 'sombra',
    conexao_espiritual: 'O Carro conquista; o Diabo escraviza. A mesma energia de conquista pode se tornar dominação.',
    elemento: 'Fogo',
    numerologia: '15 - 7 = 8: Tentação (15) menos conquista (7) resulta em equilíbrio (8) — ou prisão',
    licao_espiritual: 'A vontade sem sabedoria se torna tirania; a conquista sem ética se torna opressão.',
    affirmacao: 'Eu conquisto sem oprimir e uso meu poder para libertar, não para escravizar.',
    ordem: 36,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Torre (16) — The Sudden Revelation
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Torre',
    target: 'A Estrela',
    source_numero: 16,
    target_numero: 17,
    tipo_relacao: 'luz',
    conexao_espiritual: 'A Torre destrói ilusões; a Estrela oferece esperança renovée. Da destruição nasce esperança.',
    elemento: 'Fogo',
    numerologia: '16 + 17 = 33: Destruição (16) mais esperança (17) resulta em iluminação suprema (33)',
    licao_espiritual: 'Da ruína surge oportunidade; da perda nasce esperança.',
    affirmacao: 'Eu reconstruo minha vida sobre fundações mais sólidas após a destruição libertadora.',
    ordem: 37,
  },
  {
    source: 'A Torre',
    target: 'O Julgamento',
    source_numero: 16,
    target_numero: 20,
    tipo_relacao: 'caminho',
    conexao_espiritual: 'A Torre quebrar as falsas estruturas; o Julgamento evaluationa o que resta. Destruição prepara para avaliação.',
    elemento: 'Fogo',
    numerologia: '16 + 20 = 36 → 9: Destruição (16) mais avaliação (20) resulta em sabedoria (9)',
    licao_espiritual: 'Após a destruição, vem a avaliação honesta do que realmente importa.',
    affirmacao: 'Eu avalio minha vida com honestidade após a libertação da Torre.',
    ordem: 38,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Estrela (17) — The Healing Light
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Estrela',
    target: 'A Lua',
    source_numero: 17,
    target_numero: 18,
    tipo_relacao: 'prequel',
    conexao_espiritual: 'A Estrela oferece esperança; a Lua mostra ilusões. Após esperança, vienen testes de realidade.',
    elemento: 'Água',
    numerologia: '17 + 18 = 35 → 8: Esperança (17) mais ilusão (18) requer equilíbrio (8)',
    licao_espiritual: 'A esperança deve sobreviver ao teste da realidade lunar.',
    affirmacao: 'Eu mantenho minha esperança mesmo quando a lua mostra sombras.',
    ordem: 39,
  },
  {
    source: 'A Estrela',
    target: 'O Eremita',
    source_numero: 17,
    target_numero: 9,
    tipo_relacao: 'caminho',
    conexao_espiritual: 'A Estrela brilha para outros; o Eremita busca sozinho. A esperança compartilhada pode se tornar sabedoria solitária.',
    elemento: 'Água',
    numerologia: '17 - 9 = 8: Esperança (17) menos sabedoria (9) resulta em equilíbrio (8)',
    licao_espiritual: 'Para dar esperança, primero encontramo-la em nós mesmos.',
    affirmacao: 'Eu encontro esperança no silêncio e a compartilho com o mundo.',
    ordem: 40,
  },

  // ═══════════════════════════════════════════════════════════════════
  // A Lua (18) — The Illusion and Fear
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'A Lua',
    target: 'O Sol',
    source_numero: 18,
    target_numero: 19,
    tipo_relacao: 'luz',
    conexao_espiritual: 'A Lua reflete; o Sol brilha. A luz ilusória da Lua dá paso ao brilho real do Sol.',
    elemento: 'Água',
    numerologia: '18 → 19: Ilusão (18) se transforma em verdade (19)',
    licao_espiritual: 'O sol sempre emerge após a noite mais escura.',
    affirmacao: 'Eu dissiço as ilusões e abraço a luz da verdade.',
    ordem: 41,
  },
  {
    source: 'A Lua',
    target: 'A Sacerdotisa',
    source_numero: 18,
    target_numero: 2,
    tipo_relacao: 'sombra',
    conexao_espiritual: 'A Sacerdotisa guarda sabedoria; a Lua mostra ilusões. A sabedoria verdadeira distingue real de ilusório.',
    elemento: 'Água',
    numerologia: '18 ÷ 9 = 2: Ilusão (18) dividida por sabedoria (9) resulta em discernimento (2)',
    licao_espiritual: 'A intuição sábia pode diferenciar a luz verdadeira da luz lunar.',
    affirmacao: 'Eu uso minha sabedoria para navegar pelos mares ilusórios da mente.',
    ordem: 42,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Sol (19) — The Joy and Success
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Sol',
    target: 'O Julgamento',
    source_numero: 19,
    target_numero: 20,
    tipo_relacao: 'caminho',
    conexao_espiritual: 'O Sol traz alegria individual; o Julgamento traz avaliação coletiva. Após brilho pessoal, vem評価 pública.',
    elemento: 'Fogo',
    numerologia: '19 + 20 = 39 → 12: Alegria (19) mais avaliação (20) resulta em experiência (12)',
    licao_espiritual: 'A alegria pessoal é completada pela avaliação da comunidade.',
    affirmacao: 'Eu brilho com alegria autêntica e me apresento honestamente ao mundo.',
    ordem: 43,
  },
  {
    source: 'O Sol',
    target: 'O Louco',
    source_numero: 19,
    target_numero: 0,
    tipo_relacao: 'sequel',
    conexao_espiritual: 'O Sol completa o ciclo que O Louco começou. A jornada termina em alegria, voltando ao início transformado.',
    elemento: 'Fogo',
    numerologia: '19 + 0 = 19: A alegria (19) permanece completa no retorno ao zero',
    licao_espiritual: 'A jornada do louco encontra seu sol ao final; o retorno é triunfo.',
    affirmacao: 'Eu celebro minha jornada com alegria e liberdade.',
    ordem: 44,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Julgamento (20) — The Awakening
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Julgamento',
    target: 'O Mundo',
    source_numero: 20,
    target_numero: 21,
    tipo_relacao: 'ascendente',
    conexao_espiritual: 'O Julgamento despierta; o Mundo completa. A ressurreição do Julgamento leva à plenitude do Mundo.',
    elemento: 'Fogo',
    numerologia: '20 + 21 = 41 → 5: Avaliação (20) mais completude (21) resulta em liberdade (5)',
    licao_espiritual: 'O julgamento honesto de nós mesmos é prerequisite para plenitude.',
    affirmacao: 'Eu me levanto para minha avaliação final e abrazo minha plenitude.',
    ordem: 45,
  },
  {
    source: 'O Julgamento',
    target: 'A Justiça',
    source_numero: 20,
    target_numero: 8,
    tipo_relacao: 'elemental',
    conexao_espiritual: 'O Julgamento é a Justiça em escala cósmica. Ambos equilibram ações e consequências.',
    elemento: 'Fogo',
    numerologia: '20 ÷ 8 = 2.5: Avaliação (20) sobre equilíbrio (8) mantém proporção',
    licao_espiritual: 'A justiça individual é preparação para a justiça universal.',
    affirmacao: 'Eu vivo em equilíbrio agora para que meu julgamento reflita minha verdade.',
    ordem: 46,
  },

  // ═══════════════════════════════════════════════════════════════════
  // O Mundo (21) — The Completion
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Mundo',
    target: 'O Louco',
    source_numero: 21,
    target_numero: 0,
    tipo_relacao: 'sequel',
    conexao_espiritual: 'O Mundo completa o ciclo; o Louco recomeça. A jornada é eterna — fim é começo.',
    elemento: 'Terra',
    numerologia: '21 + 0 = 21: A completude (21) retorna ao uno (1) — eterno retorno',
    licao_espiritual: 'O fim é apenas outro começo em espiral infinito.',
    affirmacao: 'Eu completo minha jornada e abraço o próximo ciclo com liberdade.',
    ordem: 47,
  },
  {
    source: 'O Mundo',
    target: 'A Imperatriz',
    source_numero: 21,
    target_numero: 3,
    tipo_relacao: 'equivalente',
    conexao_espiritual: 'O Mundo é a Imperatriz em escala cósmica. Ambos representam completude e integração do feminino.',
    elemento: 'Terra',
    numerologia: '21 ÷ 3 = 7: Completude (21) dividida por criação (3) resulta em perfeição (7)',
    licao_espiritual: 'A criação em pequena escala espelha a criação universal.',
    affirmacao: 'Eu me integro no todo e celebro minha conexão com o cosmos.',
    ordem: 48,
  },

  // ═══════════════════════════════════════════════════════════════════
  // Cross-Reference: Elemental Connections
  // ═══════════════════════════════════════════════════════════════════
  {
    source: 'O Hierofante',
    target: 'A Imperatriz',
    source_numero: 5,
    target_numero: 3,
    tipo_relacao: 'elemental',
    conexao_espiritual: 'Ambos representam ordem divina — o Hierofante masculino, a Imperatriz feminina. Tradição e natureza se encontram.',
    elemento: 'Fogo',
    numerologia: '5 + 3 = 8: Tradição (5) mais natureza (3) resulta em equilíbrio (8)',
    licao_espiritual: 'O sagrado se manifesta tanto na tradição quanto na natureza.',
    affirmacao: 'Eu honro tanto a tradição sagrada quanto a natureza fertile.',
    ordem: 49,
  },
  {
    source: 'A Temperança',
    target: 'A Estrela',
    source_numero: 14,
    target_numero: 17,
    tipo_relacao: 'elemental',
    conexao_espiritual: 'Ambos são canais de energia curativa — a Temperança mistura, a Estrela canaliza. Alquimia de cura.',
    elemento: 'Fogo',
    numerologia: '14 + 17 = 31 → 4: Moderação (14) mais esperança (17) resulta em estruturação (4)',
    licao_espiritual: 'A cura vem através de mistura sábia e esperança paciente.',
    affirmacao: 'Eu canalizo energia curativa com equilíbrio e esperança.',
    ordem: 50,
  },
] as const;

// Freeze the array to prevent modifications
Object.freeze(TAROT_TAROT_MAP);

/**
 * All 22 Major Arcana arcano names
 */
export const TODOS_ARCANOS: readonly ArcanoMaior[] = Object.freeze([
  'O Louco',
  'O Mago',
  'A Sacerdotisa',
  'A Imperatriz',
  'O Imperador',
  'O Hierofante',
  'Os Enamorados',
  'O Carro',
  'A Justiça',
  'O Eremita',
  'A Roda da Fortuna',
  'A Força',
  'O Enforcado',
  'A Morte',
  'A Temperança',
  'O Diabo',
  'A Torre',
  'A Estrela',
  'A Lua',
  'O Sol',
  'O Julgamento',
  'O Mundo',
]);

/**
 * Normalizes arcano name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarArcano(arcano: string): string | null {
  const normalized = arcano.trim().toUpperCase();

  const nameMap: Record<string, string> = {
    'O LOUCO': 'O Louco',
    'LOUCO': 'O Louco',
    'O MAGO': 'O Mago',
    'MAGO': 'O Mago',
    'A SACERDOTISA': 'A Sacerdotisa',
    'SACERDOTISA': 'A Sacerdotisa',
    'A IMPERATRIZ': 'A Imperatriz',
    'IMPERATRIZ': 'A Imperatriz',
    'O IMPERADOR': 'O Imperador',
    'IMPERADOR': 'O Imperador',
    'O HIEROFANTE': 'O Hierofante',
    'HIEROFANTE': 'O Hierofante',
    'OS ENAMORADOS': 'Os Enamorados',
    'ENAMORADOS': 'Os Enamorados',
    'O CARRO': 'O Carro',
    'CARRO': 'O Carro',
    'A JUSTIÇA': 'A Justiça',
    'JUSTIÇA': 'A Justiça',
    'O EREMITA': 'O Eremita',
    'EREMITA': 'O Eremita',
    'A RODA DA FORTUNA': 'A Roda da Fortuna',
    'RODA DA FORTUNA': 'A Roda da Fortuna',
    'A FORÇA': 'A Força',
    'FORÇA': 'A Força',
    'O ENFORCADO': 'O Enforcado',
    'ENFORCADO': 'O Enforcado',
    'A MORTE': 'A Morte',
    'MORTE': 'A Morte',
    'A TEMPERANÇA': 'A Temperança',
    'TEMPERANÇA': 'A Temperança',
    'O DIABO': 'O Diabo',
    'DIABO': 'O Diabo',
    'A TORRE': 'A Torre',
    'TORRE': 'A Torre',
    'A ESTRELA': 'A Estrela',
    'ESTRELA': 'A Estrela',
    'A LUA': 'A Lua',
    'LUA': 'A Lua',
    'O SOL': 'O Sol',
    'SOL': 'O Sol',
    'O JULGAMENTO': 'O Julgamento',
    'JULGAMENTO': 'O Julgamento',
    'O MUNDO': 'O Mundo',
    'MUNDO': 'O Mundo',
  };

  return nameMap[normalized] || null;
}

/**
 * Get all tarot-tarot mappings for a given source arcano.
 * @param arcano - Source arcano name (e.g., 'O Louco', 'A Morte')
 * @returns Array of TarotTarotMapping or empty array if not found
 */
export function getTarotTarot(arcano: string): TarotTarotMapping[] {
  const normalized = normalizarArcano(arcano);
  if (!normalized) return [];

  return TAROT_TAROT_MAP.filter((m) => m.source === normalized);
}

/**
 * Get all tarot-tarot mappings where the arcano is the target.
 * @param arcano - Target arcano name
 * @returns Array of TarotTarotMapping or empty array if not found
 */
export function getTarotTarotByTarget(arcano: string): TarotTarotMapping[] {
  const normalized = normalizarArcano(arcano);
  if (!normalized) return [];

  return TAROT_TAROT_MAP.filter((m) => m.target === normalized);
}

/**
 * Get the specific relationship between two arcano.
 * @param source - Source arcano name
 * @param target - Target arcano name
 * @returns TarotTarotMapping or null if not found
 */
export function getRelationBetweenArcanos(
  source: string,
  target: string,
): TarotTarotMapping | null {
  const normalizedSource = normalizarArcano(source);
  const normalizedTarget = normalizarArcano(target);
  if (!normalizedSource || !normalizedTarget) return null;

  return (
    TAROT_TAROT_MAP.find(
      (m) => m.source === normalizedSource && m.target === normalizedTarget,
    ) ?? null
  );
}

/**
 * Get all tarot-tarot mappings.
 * @returns Array of all TarotTarotMapping
 */
export function getAllTarotTarots(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

/**
 * Get mappings by relationship type.
 * @param tipo - Type of relationship to filter
 * @returns Array of TarotTarotMapping
 */
export function getTarotTarotsByRelationType(
  tipo: ArcanoRelationType,
): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.tipo_relacao === tipo);
}

/**
 * Get mappings by element.
 * @param elemento - Element to filter by (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of TarotTarotMapping
 */
export function getTarotTarotsByElement(elemento: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.elemento === elemento);
}

/**
 * Get all relationship types used in the mapping.
 * @returns Array of unique ArcanoRelationType
 */
export function getAllRelationTypes(): ArcanoRelationType[] {
  return [...new Set(TAROT_TAROT_MAP.map((m) => m.tipo_relacao))];
}

/**
 * Get all source arcano names used in the mapping.
 * @returns Array of arcano names
 */
export function getAllSourceArcanos(): string[] {
  return [...new Set(TAROT_TAROT_MAP.map((m) => m.source))];
}

/**
 * Get all target arcano names used in the mapping.
 * @returns Array of arcano names
 */
export function getAllTargetArcanos(): string[] {
  return [...new Set(TAROT_TAROT_MAP.map((m) => m.target))];
}

/**
 * Get all arcano names used as source or target.
 * @returns Array of unique arcano names
 */
export function getAllArcanos(): string[] {
  const sources = getAllSourceArcanos();
  const targets = getAllTargetArcanos();
  return [...new Set([...sources, ...targets])];
}

/**
 * Check if an arcano name exists in the mapping (as source or target).
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in any mapping
 */
export function hasTarotTarot(arcano: string): boolean {
  return getTarotTarot(arcano).length > 0 || getTarotTarotByTarget(arcano).length > 0;
}

/**
 * Get the arcano number for a given arcano name.
 * @param arcano - Arcano name
 * @returns Arcano number (0-21) or null if not found
 */
export function getArcanoNumber(arcano: string): number | null {
  const mapping = getTarotTarot(arcano)[0];
  return mapping?.source_numero ?? null;
}

/**
 * Get all arcs related to an arcano (both as source and target).
 * @param arcano - Arcano name
 * @returns Array of arcano names that connect to this arcano
 */
export function getRelatedArcanos(arcano: string): string[] {
  const asSource = getTarotTarot(arcano).map((m) => m.target);
  const asTarget = getTarotTarotByTarget(arcano).map((m) => m.source);
  return [...new Set([...asSource, ...asTarget])];
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarot,
  getTarotTarotByTarget,
  getRelationBetweenArcanos,
  getAllTarotTarots,
  getTarotTarotsByRelationType,
  getTarotTarotsByElement,
  getAllRelationTypes,
  getAllSourceArcanos,
  getAllTargetArcanos,
  getAllArcanos,
  hasTarotTarot,
  getArcanoNumber,
  getRelatedArcanos,
  TODOS_ARCANOS,
  TAROT_TAROT_MAP,
};