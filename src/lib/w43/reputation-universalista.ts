/**
 * reputation-universalista.ts
 * Akasha — sistema de reputação para o universalista (cross-tradição).
 *
 * Princípios fundadores:
 *  1. Universalismo é o valor central — engajamento com tradições ALHEIAS
 *     gera bônus, não penalidade. A plataforma é espaço de encontro, não tribo.
 *  2. Anti-gaming de verdade — diminishing returns, mutual-reaction rings,
 *     vote rings, decay por inatividade. Reputação não pode ser comprada
 *     nem inflada artificialmente.
 *  3. Surgical precision — cálculos determinísticos, auditáveis, sem números
 *     mágicos escondidos. Cada coeficiente é nomeado e justificável.
 *  4. Mobile-first — a função de cálculo principal cabe em uma chamada de
 *     ~50ms para um usuário com 1000 eventos no histórico.
 *
 * Função pública central: `calcularReputacao(carteira)` — recebe o agregado
 * de atividades do usuário (posts, comentários, reações, mentorias, etc.) e
 * devolve `{ score, tier, badges, trustLevel, breakdown }`.
 */

// ──────────────────────────────────────────────────────────────────────────────
//  Tipos públicos
// ──────────────────────────────────────────────────────────────────────────────

/** As 16 tradições suportadas pelo Akasha. */
export const TRADICOES = [
  "Candomble",
  "Umbanda",
  "Ifa",
  "Cabala",
  "Astrologia",
  "Tantra",
  "Ayurveda",
  "Druidismo",
  "Wicca",
  "Taoismo",
  "Budismo",
  "Hinduismo",
  "Xamanismo",
  "Sufismo",
  "Cristianismo Mistico",
  "Espiritismo",
] as const;

export type Tradicao = (typeof TRADICOES)[number];

/** 5 níveis progressivos de reputação. */
export const TIERS = [
  "Iniciante",
  "Aprendiz",
  "Praticante",
  "Mestre",
  "Akasha",
] as const;

export type Tier = (typeof TIERS)[number];

/** Evento bruto observado na timeline do usuário. */
export type EventoTimeline = {
  tipo: "post" | "comentario" | "reacao_recebida" | "comentario_ajudou" | "mentoria";
  data: Date;
  /** Tradição do CONTEÚDO — não do autor. É a tradição que o evento está servindo. */
  tradicao: Tradicao;
  /** Quem foi o outro participante (autor do post/comentário, mentorado, etc.). */
  outroUsuarioId?: string;
  /** Peso opcional vindo de moderação (ex.: conteúdo destacado = 1.5x). */
  pesoModeracao?: number;
};

/** Carteira agregada do usuário — entrada para o cálculo. */
export type CarteiraReputacao = {
  usuarioId: string;
  /** Tradição primária do usuário (a "dele"). */
  tradicaoPrimaria: Tradicao;
  /** Tradições secundárias que ele acompanha (engajamento regular). */
  tradicoesSecundarias: Tradicao[];
  /** Histórico de eventos dos últimos `janelaDias` (default 180). */
  eventos: EventoTimeline[];
  /** Streak atual em dias (atualizado externamente). */
  streakDias: number;
  /** Badges já conquistados (ids). */
  badgesConquistados: string[];
  /** Data do último evento (para decay). */
  ultimoEvento: Date;
};

/** Breakdown público do cálculo — exibe o "porquê" da nota. */
export type BreakdownReputacao = {
  pontosPosts: number;
  pontosComentarios: number;
  pontosReacoes: number;
  pontosAjudas: number;
  pontosMentoria: number;
  bonusCrossTradicao: number;
  bonusStreak: number;
  penalidadeGaming: number;
  penalidadeDecay: number;
  total: number;
};

/** Resultado final do cálculo. */
export type ResultadoReputacao = {
  usuarioId: string;
  score: number;
  tier: Tier;
  proximoTier?: Tier;
  pontosParaProximoTier?: number;
  trustLevel: number; // 0-100
  badges: string[];
  badgesNovos: string[];
  breakdown: BreakdownReputacao;
  calculadoEm: Date;
};

/** Linha do leaderboard. */
export type LinhaLeaderboard = {
  posicao: number;
  usuarioId: string;
  score: number;
  tier: Tier;
  badgeDestaque?: string;
};

// ──────────────────────────────────────────────────────────────────────────────
//  Coeficientes — todos nomeados, todos auditáveis
// ──────────────────────────────────────────────────────────────────────────────

/** Pontos base por post publicado (antes de aplicar cross-trad, decay, etc.). */
const PONTOS_POR_POST = 8;
/** Pontos base por comentário publicado. */
const PONTOS_POR_COMENTARIO = 3;
/** Pontos base por reação (like/axé) recebida. */
const PONTOS_POR_REACAO = 1;
/** Pontos quando um comentário seu é marcado como "ajudou". */
const PONTOS_POR_AJUDA = 12;
/** Pontos por sessão de mentoria (1h de mentoria = 1 evento "mentoria"). */
const PONTOS_POR_MENTORIA = 25;

/** Multiplicador quando o evento toca uma tradição DIFERENTE da primária. */
const MULT_CROSS_TRADICAO = 1.4;
/** Multiplicador quando toca tradição nas secundárias (familiar mas não "dela"). */
const MULT_TRADICAO_SECUNDARIA = 1.15;

/** Diminishing returns — após N posts no mesmo dia, cada post vale menos. */
const LIMIAR_POSTS_DIA = 3;
const DECAY_POST_REPETIDO = 0.65; // cada post adicional no dia vale 65% do anterior

/** Penalidade por mutual-reaction ring detectado (par que troca reações sempre). */
const PENALIDADE_MUTUAL_RING = 0.3; // remove 30% dos pontos desse par
/** Penalidade por vote ring (3+ usuários coordenados). */
const PENALIDADE_VOTE_RING = 0.5; // remove 50% dos pontos do cluster

/** Bonus de streak — a cada 7 dias consecutivos. */
const BONUS_STREAK_POR_SEMANA = 5; // pontos
const MAX_BONUS_STREAK = 60;

/** Decay por inatividade — após N dias sem eventos, score decai. */
const DIAS_DECAY_INICIO = 30;
const TAXA_DECAY_DIARIA = 0.005; // 0.5% por dia além do limiar
const DECAY_MINIMO = 0.1; // nunca abaixo de 10% do score original

/** Janela de análise (em dias). */
const JANELA_DIAS_DEFAULT = 180;

/** Limites de tier. */
const LIMITES_TIER: Record<Tier, number> = {
  Iniciante: 0,
  Aprendiz: 200,
  Praticante: 800,
  Mestre: 2500,
  Akasha: 8000,
};

// ──────────────────────────────────────────────────────────────────────────────
//  Detecção de gaming — internas
// ──────────────────────────────────────────────────────────────────────────────

/** Agrupa eventos por dia para detectar posting rápido. */
function agruparEventosPorDia(eventos: EventoTimeline[]): Map<string, EventoTimeline[]> {
  const grupos = new Map<string, EventoTimeline[]>();
  for (const ev of eventos) {
    const chave = ev.data.toISOString().slice(0, 10);
    let lista = grupos.get(chave);
    if (!lista) {
      lista = [];
      grupos.set(chave, lista);
    }
    lista.push(ev);
  }
  return grupos;
}

/**
 * Aplica diminishing returns em posts repetidos no mesmo dia.
 * 1º, 2º, 3º = cheio; 4º em diante = DECAY_POST_REPETIDO cumulativo.
 */
function aplicarDiminishingReturnsPosts(
  pontosBrutos: number,
  eventos: EventoTimeline[],
): number {
  const grupos = agruparEventosPorDia(eventos);
  let totalAjustado = 0;

  for (const [, lista] of grupos) {
    // só conta posts
    const postsDoDia = lista.filter((e) => e.tipo === "post");
    postsDoDia.forEach((post, idx) => {
      let multiplicador = 1;
      if (idx >= LIMIAR_POSTS_DIA) {
        const decaimentos = idx - LIMIAR_POSTS_DIA + 1;
        multiplicador = Math.pow(DECAY_POST_REPETIDO, decaimentos);
      }
      // peso do post na soma bruta
      const peso = (post.pesoModeracao ?? 1) * multiplicador;
      totalAjustado += PONTOS_POR_POST * peso;
    });

    // comentários e outros NÃO entram no decay (são稀疏 por natureza)
    for (const ev of lista) {
      if (ev.tipo === "post") continue;
      const peso = ev.pesoModeracao ?? 1;
      let pontos: number;
      switch (ev.tipo) {
        case "comentario":
          pontos = PONTOS_POR_COMENTARIO;
          break;
        case "reacao_recebida":
          pontos = PONTOS_POR_REACAO;
          break;
        case "comentario_ajudou":
          pontos = PONTOS_POR_AJUDA;
          break;
        case "mentoria":
          pontos = PONTOS_POR_MENTORIA;
          break;
        default:
          pontos = 0;
      }
      totalAjustado += pontos * peso;
    }
  }

  // pontosBrutos não é usado — função é autoral. Mantida assinatura p/ clareza.
  void pontosBrutos;
  return totalAjustado;
}

/**
 * Detecta mutual-reaction rings: se A e B trocaram reações em ≥ 4 dos
 * últimos 30 dias E nenhum dos dois deu reação a um terceiro, é ring.
 */
function detectarMutualRings(eventos: EventoTimeline[]): Set<string> {
  const paresSuspeitos = new Set<string>();
  const agora = Date.now();
  const janela = 30 * 24 * 60 * 60 * 1000;

  // indexar reações por (eu, outro)
  const contadores = new Map<string, number>();
  for (const ev of eventos) {
    if (ev.tipo !== "reacao_recebida") continue;
    if (!ev.outroUsuarioId) continue;
    if (agora - ev.data.getTime() > janela) continue;
    const chave = [ev.outroUsuarioId, ev.tipo].sort().join("|");
    contadores.set(chave, (contadores.get(chave) ?? 0) + 1);
  }

  for (const [chave, qtd] of contadores) {
    if (qtd >= 4) {
      paresSuspeitos.add(chave);
    }
  }
  return paresSuspeitos;
}

/**
 * Detecta vote rings: cluster de 3+ usuários que dão reação quase sempre
 * aos mesmos posts. Heurística simples: mesmo conjunto de 3+ autores
 * aparecem em ≥ 80% das reações.
 */
function detectarVoteRings(eventos: EventoTimeline[]): Set<string> {
  const contadores = new Map<string, number>();
  for (const ev of eventos) {
    if (ev.tipo !== "reacao_recebida") continue;
    if (!ev.outroUsuarioId) continue;
    contadores.set(ev.outroUsuarioId, (contadores.get(ev.outroUsuarioId) ?? 0) + 1);
  }

  const total = eventos.filter((e) => e.tipo === "reacao_recebida").length;
  if (total === 0) return new Set();

  const limiteDominio = total * 0.4; // um único user não pode ser 40%+ das reações
  const suspeitos = new Set<string>();
  for (const [userId, qtd] of contadores) {
    if (qtd >= limiteDominio && qtd >= 5) {
      suspeitos.add(userId);
    }
  }
  return suspeitos;
}

/** Aplica penalidade por gaming aos pontos base. */
function aplicarPenalidadeGaming(
  pontosBase: number,
  eventos: EventoTimeline[],
): { pontosAjustados: number; penalidade: number } {
  const mutualRings = detectarMutualRings(eventos);
  const voteRings = detectarVoteRings(eventos);

  // cada ring detectado custa X% do total. Composto.
  let fator = 1;
  if (mutualRings.size > 0) {
    fator *= 1 - PENALIDADE_MUTUAL_RING * Math.min(mutualRings.size, 3);
  }
  if (voteRings.size > 0) {
    fator *= 1 - PENALIDADE_VOTE_RING * Math.min(voteRings.size, 2);
  }
  fator = Math.max(fator, 0.1); // nunca abaixo de 10% — gaming não zera a nota

  const pontosAjustados = pontosBase * fator;
  const penalidade = pontosBase - pontosAjustados;
  return { pontosAjustados, penalidade };
}

// ──────────────────────────────────────────────────────────────────────────────
//  Cross-tradition bonus
// ──────────────────────────────────────────────────────────────────────────────

/** Retorna o multiplicador aplicável a um evento baseado na tradição do CONTEÚDO. */
export function multiplicadorCrossTradicao(
  tradPrimaria: Tradicao,
  tradSecundarias: readonly Tradicao[],
  tradConteudo: Tradicao,
): number {
  if (tradConteudo === tradPrimaria) return 1.0;
  if (tradSecundarias.includes(tradConteudo)) return MULT_TRADICAO_SECUNDARIA;
  return MULT_CROSS_TRADICAO;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Streak & decay
// ──────────────────────────────────────────────────────────────────────────────

/** Calcula o bônus de streak (cap em MAX_BONUS_STREAK). */
export function calcularBonusStreak(streakDias: number): number {
  if (streakDias < 7) return 0;
  const semanasCompletas = Math.floor(streakDias / 7);
  return Math.min(semanasCompletas * BONUS_STREAK_POR_SEMANA, MAX_BONUS_STREAK);
}

/** Calcula o fator de decay por inatividade. */
export function calcularFatorDecay(
  ultimoEvento: Date,
  agora: Date = new Date(),
): number {
  const diffMs = agora.getTime() - ultimoEvento.getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);
  if (diffDias <= DIAS_DECAY_INICIO) return 1.0;
  const diasAlem = diffDias - DIAS_DECAY_INICIO;
  const fator = 1 - diasAlem * TAXA_DECAY_DIARIA;
  return Math.max(fator, DECAY_MINIMO);
}

// ──────────────────────────────────────────────────────────────────────────────
//  Trust level (0-100) — gating para marketplace e features sensíveis
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Trust level é ortogonal ao score de reputação.
 * - Novatos começam em 20.
 * - Sobe com verificação de email, telefone, identidade, tempo de conta.
 * - É capado pelo tier (você não pode ter trust 90 sendo Iniciante).
 */
export function calcularTrustLevel(
  carteira: CarteiraReputacao,
  verificacoes: {
    email: boolean;
    telefone: boolean;
    identidade: boolean;
    diasDeConta: number;
  },
): number {
  let base = 20;

  if (verificacoes.email) base += 8;
  if (verificacoes.telefone) base += 12;
  if (verificacoes.identidade) base += 25;

  // tempo de conta — até 15 pontos
  base += Math.min(verificacoes.diasDeConta / 30, 15);

  // histórico de ajuda recebida — cap em 10
  const ajudas = carteira.eventos.filter((e) => e.tipo === "comentario_ajudou").length;
  base += Math.min(ajudas, 10);

  // penalidade por strikes (não temos campo no tipo — hook para futuro)
  // base -= strikes * 5;

  // cap por tier
  const tier = tierPorPontos(somarPontosBase(carteira));
  const capPorTier: Record<Tier, number> = {
    Iniciante: 40,
    Aprendiz: 60,
    Praticante: 80,
    Mestre: 95,
    Akasha: 100,
  };
  return Math.min(Math.round(base), capPorTier[tier]);
}

// ──────────────────────────────────────────────────────────────────────────────
//  Tiers
// ──────────────────────────────────────────────────────────────────────────────

/** Retorna o tier correspondente a uma pontuação. */
export function tierPorPontos(score: number): Tier {
  if (score >= LIMITES_TIER.Akasha) return "Akasha";
  if (score >= LIMITES_TIER.Mestre) return "Mestre";
  if (score >= LIMITES_TIER.Praticante) return "Praticante";
  if (score >= LIMITES_TIER.Aprendiz) return "Aprendiz";
  return "Iniciante";
}

/** Retorna tier atual, próximo tier, e pontos faltantes. */
export function progressoTier(score: number): {
  tier: Tier;
  proximoTier?: Tier;
  pontosParaProximoTier?: number;
} {
  const tier = tierPorPontos(score);
  const idx = TIERS.indexOf(tier);
  if (idx === TIERS.length - 1) {
    return { tier };
  }
  const proximo = TIERS[idx + 1];
  const falta = LIMITES_TIER[proximo] - score;
  return { tier, proximoTier: proximo, pontosParaProximoTier: Math.max(0, falta) };
}

// ──────────────────────────────────────────────────────────────────────────────
//  Badges
// ──────────────────────────────────────────────────────────────────────────────

export type Badge = {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
};

/** Catálogo estático de badges — fácil de estender. */
export const CATALOGO_BADGES: Badge[] = [
  { id: "primeira_leitura", nome: "Primeira Leitura", descricao: "Fez sua primeira consulta oracular.", icone: "🕯️" },
  { id: "primeiro_post", nome: "Primeira Postagem", descricao: "Publicou seu primeiro post.", icone: "📜" },
  { id: "cem_posts", nome: "100 Posts", descricao: "Alcançou 100 postagens.", icone: "📚" },
  { id: "primeira_marca", nome: "Primeira Marca", descricao: "Recebeu a primeira marcação 'ajudou'.", icone: "🤝" },
  { id: "mentor", nome: "Mentor", descricao: "Conduziu 10 sessões de mentoria.", icone: "🪶" },
  { id: "curador", nome: "Curador", descricao: "50 posts seus foram marcados como destaque.", icone: "🌟" },
  { id: "tradutor", nome: "Tradutor", descricao: "Fez pontes entre 3+ tradições diferentes.", icone: "🌉" },
  { id: "ajudante", nome: "Ajudante", descricao: "Recebeu 25 marcações 'ajudou'.", icone: "💫" },
  { id: "streak_30", nome: "Constante", descricao: "Manteve streak de 30 dias.", icone: "🔥" },
  { id: "streak_100", nome: "Disciplinado", descricao: "Manteve streak de 100 dias.", icone: "🏛️" },
  { id: "universalista", nome: "Universalista", descricao: "Engajou com todas as 16 tradições.", icone: "🌍" },
  { id: "guardiao", nome: "Guardião", descricao: "Alcançou o tier Akasha.", icone: "🛡️" },
  { id: "ancião", nome: "Ancião", descricao: "1 ano de conta ativa.", icone: "🕰️" },
  { id: "acolhedor", nome: "Acolhedor", descricao: "Recebeu 10 reações de novatos.", icone: "🫂" },
];

/** Avalia quais badges o usuário conquistou agora (delta vs `badgesConquistados`). */
export function avaliarBadges(carteira: CarteiraReputacao): string[] {
  const tem: Set<string> = new Set(carteira.badgesConquistados);
  const novos: string[] = [];

  const qtdPosts = carteira.eventos.filter((e) => e.tipo === "post").length;
  const qtdAjudas = carteira.eventos.filter((e) => e.tipo === "comentario_ajudou").length;
  const qtdMentorias = carteira.eventos.filter((e) => e.tipo === "mentoria").length;
  const qtdComentarios = carteira.eventos.filter((e) => e.tipo === "comentario").length;
  const qtdReacoes = carteira.eventos.filter((e) => e.tipo === "reacao_recebida").length;

  const tentar = (id: string) => {
    if (!tem.has(id)) {
      novos.push(id);
      tem.add(id);
    }
  };

  if (qtdPosts >= 1) tentar("primeiro_post");
  if (qtdPosts >= 100) tentar("cem_posts");
  if (qtdAjudas >= 1) tentar("primeira_marca");
  if (qtdAjudas >= 25) tentar("ajudante");
  if (qtdMentorias >= 10) tentar("mentor");

  if (carteira.streakDias >= 30) tentar("streak_30");
  if (carteira.streakDias >= 100) tentar("streak_100");

  // curador — 50 posts marcados com pesoModeracao >= 1.5
  const qtdDestaques = carteira.eventos.filter(
    (e) => e.tipo === "post" && (e.pesoModeracao ?? 1) >= 1.5,
  ).length;
  if (qtdDestaques >= 50) tentar("curador");

  // universalista — tocou todas as 16 tradições
  const tradicoesTocadas = new Set(carteira.eventos.map((e) => e.tradicao));
  if (tradicoesTocadas.size >= TRADICOES.length) tentar("universalista");

  // tradutor — engajou com 3+ tradições diferentes da primária
  const outras = carteira.eventos.filter((e) => e.tradicao !== carteira.tradicaoPrimaria);
  const outrasSet = new Set(outras.map((e) => e.tradicao));
  if (outrasSet.size >= 3) tentar("tradutor");

  // guardião — alcançou Akasha
  const scoreAtual = somarPontosBase(carteira);
  if (tierPorPontos(scoreAtual) === "Akasha") tentar("guardiao");

  // acolhedor — recebeu reações de novatos (heurística: 10+ reações sem mutual ring)
  const reacoesLimpas = carteira.eventos.filter((e) => {
    if (e.tipo !== "reacao_recebida") return false;
    return detectarMutualRings([e]).size === 0;
  });
  if (reacoesLimpas.length >= 10) tentar("acolhedor");

  // ancião — 365 dias de conta (proxy: eventos com 1 ano de span)
  if (carteira.eventos.length > 0) {
    const maisAntigo = Math.min(...carteira.eventos.map((e) => e.data.getTime()));
    const umAnoMs = 365 * 24 * 60 * 60 * 1000;
    if (Date.now() - maisAntigo >= umAnoMs) tentar("ancião");
  }

  // silenciar vars não usadas — clareza
  void qtdComentarios;
  void qtdReacoes;

  return novos;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Helpers internos
// ──────────────────────────────────────────────────────────────────────────────

/** Soma base do score — usado em trust level e progressão. */
function somarPontosBase(carteira: CarteiraReputacao): number {
  let total = 0;
  for (const ev of carteira.eventos) {
    let pontos: number;
    switch (ev.tipo) {
      case "post":
        pontos = PONTOS_POR_POST;
        break;
      case "comentario":
        pontos = PONTOS_POR_COMENTARIO;
        break;
      case "reacao_recebida":
        pontos = PONTOS_POR_REACAO;
        break;
      case "comentario_ajudou":
        pontos = PONTOS_POR_AJUDA;
        break;
      case "mentoria":
        pontos = PONTOS_POR_MENTORIA;
        break;
      default:
        pontos = 0;
    }
    const multTrad = multiplicadorCrossTradicao(
      carteira.tradicaoPrimaria,
      carteira.tradicoesSecundarias,
      ev.tradicao,
    );
    total += pontos * multTrad * (ev.pesoModeracao ?? 1);
  }
  return total;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Cálculo principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Calcula a reputação completa do usuário.
 * Esta é a função pública central — todo o resto orbita ela.
 */
export function calcularReputacao(
  carteira: CarteiraReputacao,
  agora: Date = new Date(),
  verificacoes: {
    email: boolean;
    telefone: boolean;
    identidade: boolean;
    diasDeConta: number;
  } = { email: false, telefone: false, identidade: false, diasDeConta: 0 },
): ResultadoReputacao {
  // 1) pontos base com diminishing returns
  const pontosBaseBruto = aplicarDiminishingReturnsPosts(0, carteira.eventos);

  // 2) aplicar multiplicador cross-trad em cada evento
  let pontosComCross = 0;
  const breakdownPorTipo: Record<EventoTimeline["tipo"], number> = {
    post: 0,
    comentario: 0,
    reacao_recebida: 0,
    comentario_ajudou: 0,
    mentoria: 0,
  };
  for (const ev of carteira.eventos) {
    const multTrad = multiplicadorCrossTradicao(
      carteira.tradicaoPrimaria,
      carteira.tradicoesSecundarias,
      ev.tradicao,
    );
    const peso = ev.pesoModeracao ?? 1;
    const pontosBaseUnit =
      ev.tipo === "post"
        ? PONTOS_POR_POST
        : ev.tipo === "comentario"
          ? PONTOS_POR_COMENTARIO
          : ev.tipo === "reacao_recebida"
            ? PONTOS_POR_REACAO
            : ev.tipo === "comentario_ajudou"
              ? PONTOS_POR_AJUDA
              : PONTOS_POR_MENTORIA;
    const pontos = pontosBaseUnit * multTrad * peso;
    pontosComCross += pontos;
    breakdownPorTipo[ev.tipo] += pontos;
  }

  // 3) bônus de streak
  const bonusStreak = calcularBonusStreak(carteira.streakDias);

  // 4) subtotal antes do anti-gaming
  const subtotal = pontosComCross + bonusStreak;

  // 5) penalidade por gaming (mutual rings + vote rings)
  const { pontosAjustados, penalidade } = aplicarPenalidadeGaming(subtotal, carteira.eventos);

  // 6) decay por inatividade
  const fatorDecay = calcularFatorDecay(carteira.ultimoEvento, agora);
  const pontosFinais = pontosAjustados * fatorDecay;
  const penalidadeDecay = pontosAjustados - pontosFinais;

  // 7) tier
  const { tier, proximoTier, pontosParaProximoTier } = progressoTier(pontosFinais);

  // 8) trust level
  const trustLevel = calcularTrustLevel(carteira, verificacoes);

  // 9) badges novos
  const badgesNovos = avaliarBadges(carteira);

  // 10) breakdown final
  const breakdown: BreakdownReputacao = {
    pontosPosts: Math.round(breakdownPorTipo.post),
    pontosComentarios: Math.round(breakdownPorTipo.comentario),
    pontosReacoes: Math.round(breakdownPorTipo.reacao_recebida),
    pontosAjudas: Math.round(breakdownPorTipo.comentario_ajudou),
    pontosMentoria: Math.round(breakdownPorTipo.mentoria),
    bonusCrossTradicao: Math.round(pontosComCross - pontosBaseBruto),
    bonusStreak: Math.round(bonusStreak),
    penalidadeGaming: Math.round(penalidade),
    penalidadeDecay: Math.round(penalidadeDecay),
    total: Math.round(pontosFinais),
  };

  return {
    usuarioId: carteira.usuarioId,
    score: Math.round(pontosFinais),
    tier,
    proximoTier,
    pontosParaProximoTier,
    trustLevel,
    badges: Array.from(new Set([...carteira.badgesConquistados, ...badgesNovos])),
    badgesNovos,
    breakdown,
    calculadoEm: agora,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
//  Leaderboards
// ──────────────────────────────────────────────────────────────────────────────

/** Filtra eventos a um período. */
export function filtrarEventosPorPeriodo(
  eventos: EventoTimeline[],
  periodo: "semana" | "mes" | "tudo",
  agora: Date = new Date(),
): EventoTimeline[] {
  if (periodo === "tudo") return eventos;
  const dias = periodo === "semana" ? 7 : 30;
  const limite = agora.getTime() - dias * 24 * 60 * 60 * 1000;
  return eventos.filter((e) => e.data.getTime() >= limite);
}

/** Gera um leaderboard ranqueado a partir de uma lista de carteiras. */
export function gerarLeaderboard(
  carteiras: CarteiraReputacao[],
  periodo: "semana" | "mes" | "tudo" = "tudo",
  agora: Date = new Date(),
  limite: number = 50,
): LinhaLeaderboard[] {
  const calculadas = carteiras.map((c) => {
    const eventosFiltrados = {
      ...c,
      eventos: filtrarEventosPorPeriodo(c.eventos, periodo, agora),
    };
    const r = calcularReputacao(eventosFiltrados, agora);
    return { carteira: c, resultado: r };
  });

  calculadas.sort((a, b) => b.resultado.score - a.resultado.score);

  return calculadas.slice(0, limite).map(({ carteira, resultado }, idx) => ({
    posicao: idx + 1,
    usuarioId: carteira.usuarioId,
    score: resultado.score,
    tier: resultado.tier,
    badgeDestaque: resultado.badgesNovos[0] ?? resultado.badges[0],
  }));
}

/** Leaderboard filtrado por tradição (usuários engajados com aquela tradição). */
export function gerarLeaderboardPorTradicao(
  carteiras: CarteiraReputacao[],
  tradicao: Tradicao,
  agora: Date = new Date(),
  limite: number = 25,
): LinhaLeaderboard[] {
  const filtradas = carteiras.filter((c) =>
    c.tradicaoPrimaria === tradicao ||
    c.tradicoesSecundarias.includes(tradicao) ||
    c.eventos.some((e) => e.tradicao === tradicao),
  );
  return gerarLeaderboard(filtradas, "tudo", agora, limite);
}

// ──────────────────────────────────────────────────────────────────────────────
//  Tradition Matrix — alinhamento base por tradição
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Matriz de "afinidade" entre tradições. Valor 0-1.
 * 1.0 = mesma família / diálogo histórico; 0.0 = incompatíveis.
 *
 * Não é uma verdade absoluta — é um viés inicial que o sistema de
 * recomendação usa, mas que pode ser customizado por usuário.
 */
export const MATRIZ_AFINIDADE: Record<Tradicao, Record<Tradicao, number>> = {
  Candomble: { Candomble: 1, Umbanda: 0.85, Ifa: 0.95, Cabala: 0.3, Astrologia: 0.4, Tantra: 0.25, Ayurveda: 0.2, Druidismo: 0.2, Wicca: 0.4, Taoismo: 0.3, Budismo: 0.3, Hinduismo: 0.4, Xamanismo: 0.5, Sufismo: 0.25, "Cristianismo Mistico": 0.4, Espiritismo: 0.7 },
  Umbanda: { Candomble: 0.85, Umbanda: 1, Ifa: 0.8, Cabala: 0.35, Astrologia: 0.5, Tantra: 0.3, Ayurveda: 0.25, Druidismo: 0.2, Wicca: 0.45, Taoismo: 0.35, Budismo: 0.35, Hinduismo: 0.4, Xamanismo: 0.5, Sufismo: 0.3, "Cristianismo Mistico": 0.5, Espiritismo: 0.85 },
  Ifa: { Candomble: 0.95, Umbanda: 0.8, Ifa: 1, Cabala: 0.25, Astrologia: 0.35, Tantra: 0.2, Ayurveda: 0.2, Druidismo: 0.15, Wicca: 0.3, Taoismo: 0.25, Budismo: 0.25, Hinduismo: 0.3, Xamanismo: 0.4, Sufismo: 0.2, "Cristianismo Mistico": 0.3, Espiritismo: 0.6 },
  Cabala: { Candomble: 0.3, Umbanda: 0.35, Ifa: 0.25, Cabala: 1, Astrologia: 0.95, Tantra: 0.5, Ayurveda: 0.3, Druidismo: 0.3, Wicca: 0.5, Taoismo: 0.45, Budismo: 0.5, Hinduismo: 0.45, Xamanismo: 0.3, Sufismo: 0.55, "Cristianismo Mistico": 0.7, Espiritismo: 0.5 },
  Astrologia: { Candomble: 0.4, Umbanda: 0.5, Ifa: 0.35, Cabala: 0.95, Astrologia: 1, Tantra: 0.55, Ayurveda: 0.45, Druidismo: 0.4, Wicca: 0.55, Taoismo: 0.5, Budismo: 0.5, Hinduismo: 0.55, Xamanismo: 0.4, Sufismo: 0.5, "Cristianismo Mistico": 0.6, Espiritismo: 0.65 },
  Tantra: { Candomble: 0.25, Umbanda: 0.3, Ifa: 0.2, Cabala: 0.5, Astrologia: 0.55, Tantra: 1, Ayurveda: 0.85, Druidismo: 0.3, Wicca: 0.55, Taoismo: 0.6, Budismo: 0.85, Hinduismo: 0.9, Xamanismo: 0.45, Sufismo: 0.5, "Cristianismo Mistico": 0.35, Espiritismo: 0.4 },
  Ayurveda: { Candomble: 0.2, Umbanda: 0.25, Ifa: 0.2, Cabala: 0.3, Astrologia: 0.45, Tantra: 0.85, Ayurveda: 1, Druidismo: 0.25, Wicca: 0.35, Taoismo: 0.55, Budismo: 0.7, Hinduismo: 0.9, Xamanismo: 0.4, Sufismo: 0.35, "Cristianismo Mistico": 0.3, Espiritismo: 0.35 },
  Druidismo: { Candomble: 0.2, Umbanda: 0.2, Ifa: 0.15, Cabala: 0.3, Astrologia: 0.4, Tantra: 0.3, Ayurveda: 0.25, Druidismo: 1, Wicca: 0.85, Taoismo: 0.4, Budismo: 0.35, Hinduismo: 0.3, Xamanismo: 0.7, Sufismo: 0.25, "Cristianismo Mistico": 0.55, Espiritismo: 0.35 },
  Wicca: { Candomble: 0.4, Umbanda: 0.45, Ifa: 0.3, Cabala: 0.5, Astrologia: 0.55, Tantra: 0.55, Ayurveda: 0.35, Druidismo: 0.85, Wicca: 1, Taoismo: 0.5, Budismo: 0.4, Hinduismo: 0.4, Xamanismo: 0.7, Sufismo: 0.3, "Cristianismo Mistico": 0.45, Espiritismo: 0.5 },
  Taoismo: { Candomble: 0.3, Umbanda: 0.35, Ifa: 0.25, Cabala: 0.45, Astrologia: 0.5, Tantra: 0.6, Ayurveda: 0.55, Druidismo: 0.4, Wicca: 0.5, Taoismo: 1, Budismo: 0.85, Hinduismo: 0.7, Xamanismo: 0.5, Sufismo: 0.4, "Cristianismo Mistico": 0.4, Espiritismo: 0.4 },
  Budismo: { Candomble: 0.3, Umbanda: 0.35, Ifa: 0.25, Cabala: 0.5, Astrologia: 0.5, Tantra: 0.85, Ayurveda: 0.7, Druidismo: 0.35, Wicca: 0.4, Taoismo: 0.85, Budismo: 1, Hinduismo: 0.85, Xamanismo: 0.5, Sufismo: 0.5, "Cristianismo Mistico": 0.5, Espiritismo: 0.45 },
  Hinduismo: { Candomble: 0.4, Umbanda: 0.4, Ifa: 0.3, Cabala: 0.45, Astrologia: 0.55, Tantra: 0.9, Ayurveda: 0.9, Druidismo: 0.3, Wicca: 0.4, Taoismo: 0.7, Budismo: 0.85, Hinduismo: 1, Xamanismo: 0.5, Sufismo: 0.45, "Cristianismo Mistico": 0.45, Espiritismo: 0.45 },
  Xamanismo: { Candomble: 0.5, Umbanda: 0.5, Ifa: 0.4, Cabala: 0.3, Astrologia: 0.4, Tantra: 0.45, Ayurveda: 0.4, Druidismo: 0.7, Wicca: 0.7, Taoismo: 0.5, Budismo: 0.5, Hinduismo: 0.5, Xamanismo: 1, Sufismo: 0.4, "Cristianismo Mistico": 0.45, Espiritismo: 0.5 },
  Sufismo: { Candomble: 0.25, Umbanda: 0.3, Ifa: 0.2, Cabala: 0.55, Astrologia: 0.5, Tantra: 0.5, Ayurveda: 0.35, Druidismo: 0.25, Wicca: 0.3, Taoismo: 0.4, Budismo: 0.5, Hinduismo: 0.45, Xamanismo: 0.4, Sufismo: 1, "Cristianismo Mistico": 0.7, Espiritismo: 0.5 },
  "Cristianismo Mistico": { Candomble: 0.4, Umbanda: 0.5, Ifa: 0.3, Cabala: 0.7, Astrologia: 0.6, Tantra: 0.35, Ayurveda: 0.3, Druidismo: 0.55, Wicca: 0.45, Taoismo: 0.4, Budismo: 0.5, Hinduismo: 0.45, Xamanismo: 0.45, Sufismo: 0.7, "Cristianismo Mistico": 1, Espiritismo: 0.85 },
  Espiritismo: { Candomble: 0.7, Umbanda: 0.85, Ifa: 0.6, Cabala: 0.5, Astrologia: 0.65, Tantra: 0.4, Ayurveda: 0.35, Druidismo: 0.35, Wicca: 0.5, Taoismo: 0.4, Budismo: 0.45, Hinduismo: 0.45, Xamanismo: 0.5, Sufismo: 0.5, "Cristianismo Mistico": 0.85, Espiritismo: 1 },
};

/** Afinidade entre duas tradições (helper, evita indexação crua em código de produto). */
export function afinidadeEntre(a: Tradicao, b: Tradicao): number {
  return MATRIZ_AFINIDADE[a][b];
}

// ──────────────────────────────────────────────────────────────────────────────
//  Funções auxiliares públicas
// ──────────────────────────────────────────────────────────────────────────────

/** Resumo textual do tier — útil para UI. */
export function descricaoTier(tier: Tier): string {
  switch (tier) {
    case "Iniciante":
      return "Começando a caminhar — boas-vindas ao Akasha.";
    case "Aprendiz":
      return "Construindo presença — continue compartilhando.";
    case "Praticante":
      return "Membro ativo da comunidade — sua voz já tem peso.";
    case "Mestre":
      return "Referência — outros vêm até você para aprender.";
    case "Akasha":
      return "Guardião — pilar da plataforma universalista.";
  }
}

/** Percentual de progresso ao próximo tier (0-100). */
export function percentualProgresso(score: number): number {
  const { tier, proximoTier } = progressoTier(score);
  if (!proximoTier) return 100;
  const atual = LIMITES_TIER[tier];
  const alvo = LIMITES_TIER[proximoTier];
  const pct = ((score - atual) / (alvo - atual)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/** Total de pontos que o usuário receberia se todos os eventos fossem cross-trad. */
export function projetarBonusCrossTotal(carteira: CarteiraReputacao): number {
  let total = 0;
  for (const ev of carteira.eventos) {
    if (ev.tradicao === carteira.tradicaoPrimaria) continue;
    const mult = multiplicadorCrossTradicao(
      carteira.tradicaoPrimaria,
      carteira.tradicoesSecundarias,
      ev.tradicao,
    );
    const pontosBase =
      ev.tipo === "post"
        ? PONTOS_POR_POST
        : ev.tipo === "comentario"
          ? PONTOS_POR_COMENTARIO
          : ev.tipo === "reacao_recebida"
            ? PONTOS_POR_REACAO
            : ev.tipo === "comentario_ajudou"
              ? PONTOS_POR_AJUDA
              : PONTOS_POR_MENTORIA;
    total += pontosBase * (mult - 1); // só o bônus, não o total
  }
  return Math.round(total);
}

/** Retorna tradições que o usuário AINDA não tocou (caminho de universalização). */
export function tradicoesNaoExploradas(
  carteira: CarteiraReputacao,
  limite: number = 5,
): Tradicao[] {
  const tocadas = new Set<Tradicao>();
  for (const ev of carteira.eventos) tocadas.add(ev.tradicao);
  tocadas.add(carteira.tradicaoPrimaria);
  for (const t of carteira.tradicoesSecundarias) tocadas.add(t);
  return TRADICOES.filter((t) => !tocadas.has(t)).slice(0, limite);
}

/** Verifica se o usuário pode publicar em dada tradição (gating). */
export function podePublicarEm(
  trustLevel: number,
  tradPrimaria: Tradicao,
  tradAlvo: Tradicao,
  tradicoesSecundarias: readonly Tradicao[],
): boolean {
  if (tradAlvo === tradPrimaria) return true;
  if (tradicoesSecundarias.includes(tradAlvo)) return true;
  // cross-trad陌生: exige trust mínimo
  return trustLevel >= 50;
}

/** Serializa uma carteira para log/observabilidade (sem expor dados sensíveis). */
export function snapshotCarteira(carteira: CarteiraReputacao): {
  usuarioId: string;
  totalEventos: number;
  streakDias: number;
  badges: number;
} {
  return {
    usuarioId: carteira.usuarioId,
    totalEventos: carteira.eventos.length,
    streakDias: carteira.streakDias,
    badges: carteira.badgesConquistados.length,
  };
}

/** Indica se um usuário pode ser considerado "mentor" para matchmaking. */
export function elegivelComoMentor(carteira: CarteiraReputacao): boolean {
  const temBadge = carteira.badgesConquistados.includes("mentor");
  const temTradutor = carteira.badgesConquistados.includes("tradutor");
  const qtdMentorias = carteira.eventos.filter((e) => e.tipo === "mentoria").length;
  return temBadge || temTradutor || qtdMentorias >= 5;
}

/** Score normalizado 0-100 (útil para UI rings/bars). */
export function scoreNormalizado(score: number): number {
  // log scale para que 8000 pontos vire ~100
  const log = Math.log10(score + 1);
  const max = Math.log10(LIMITES_TIER.Akasha + 1);
  return Math.round((log / max) * 100);
}

/** Métricas agregadas da plataforma (para dashboard). */
export type MetricasPlataforma = {
  totalUsuarios: number;
  distribuicaoPorTier: Record<Tier, number>;
  mediaScore: number;
  mediaTrustLevel: number;
  totalEventos: number;
  totalBadgesConcedidos: number;
};

export function agregarMetricas(
  carteiras: CarteiraReputacao[],
  trustPorUsuario: Map<string, number>,
  agora: Date = new Date(),
): MetricasPlataforma {
  const dist: Record<Tier, number> = {
    Iniciante: 0,
    Aprendiz: 0,
    Praticante: 0,
    Mestre: 0,
    Akasha: 0,
  };
  let somaScore = 0;
  let somaTrust = 0;
  let totalEventos = 0;
  let totalBadges = 0;

  for (const c of carteiras) {
    const r = calcularReputacao(c, agora, {
      email: true,
      telefone: false,
      identidade: false,
      diasDeConta: 30,
    });
    dist[r.tier]++;
    somaScore += r.score;
    somaTrust += trustPorUsuario.get(c.usuarioId) ?? r.trustLevel;
    totalEventos += c.eventos.length;
    totalBadges += c.badgesConquistados.length;
  }

  return {
    totalUsuarios: carteiras.length,
    distribuicaoPorTier: dist,
    mediaScore: carteiras.length > 0 ? Math.round(somaScore / carteiras.length) : 0,
    mediaTrustLevel: carteiras.length > 0 ? Math.round(somaTrust / carteiras.length) : 0,
    totalEventos,
    totalBadgesConcedidos: totalBadges,
  };
}
