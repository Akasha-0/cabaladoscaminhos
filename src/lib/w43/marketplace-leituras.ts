// ============================================================================
// MARKETPLACE DE LEITURAS, PRÁTICAS E CONSULTAS (Akasha)
// ============================================================================
// Engine do marketplace espiritual da plataforma: conecta consulentes a
// praticantes verificados que oferecem Leituras (sessão única interpretativa),
// Práticas (pacote/curso estruturado) e Consultas (atendimento recorrente).
//
// Esta engine é deliberadamente auto-contida — sem dependência direta de
// Prisma/schema do w43 para permitir evolução do banco em paralelo. Persistência
// real é responsabilidade do route handler / camada de API que consome este
// módulo; aqui ficam as regras de negócio puras, idempotência, validação
// cross-field e lógica de pricing/cupom/reembolso.
//
// Decisões de design:
//   - **BRL como moeda canônica** — todos os preços em centavos (inteiro) para
//     evitar float drift. Conversões para exibição (R$ 99,90) ficam no front.
//   - **Trust level gating** — praticante precisa de trust ≥ "verificado"
//     para abrir listing pago; níveis mais altos liberam listing premium/elite.
//   - **Cupons first-class** — cupons carregam restrições (tradição, listing,
//     usuário, primeira compra) que são checadas em applyCoupon, não no SQL.
//   - **Idempotência no checkout** — operationId é obrigatório e único por
//     usuário. Retries com mesmo operationId retornam o mesmo Order.
//   - **Anti-spam em reviews** — 1 review por (user, practitioner); updates
//     permitidos em janela curta (24h), daí em diante imutável.
//   - **Booking calendar** — slots são gerados a partir de availability
//     semanal + exceções, com detecção de conflito por intersection.
//   - **Auto-refund** — janela de 24h sem practitionerResponse = refund total
//     automático; dispute abre caminho para revisão manual.
//
// Convenções:
//   - snake_case_pt para campos de domínio (priceBRL, durationMin, maxConcurrent)
//   - camelCase para campos técnicos (createdAt, id, orderId)
//   - ISO 8601 para timestamps; UTC sempre que persistido
// ============================================================================

// ============================================================================
// 1. TIPOS DE DOMÍNIO
// ============================================================================

export type ID = string;
export type ISODate = string; // 'YYYY-MM-DDTHH:mm:ss.sssZ'
export type Centavos = number; // preço em centavos (R$ 99,90 → 9990)
export type DateKey = string; // 'YYYY-MM-DD' para slots de agenda

/** Tipos de produto vendáveis no marketplace. */
export type ListingTipo = 'leitura' | 'pratica' | 'consulta';

/** Tradição espiritual do serviço. Livre, mas com taxonomia recomendada. */
export type Tradicao =
  | 'cigano'
  | 'tarot'
  | 'astrologia'
  | 'numerologia'
  | 'ifá'
  | 'umbanda'
  | 'candomblé'
  | 'kabbalah'
  | 'xamanismo'
  | 'reiki'
  | 'cristaloterapia'
  | 'mediunidade'
  | 'mesa-real'
  | 'baralho-cigano'
  | 'runas'
  | 'lenormand'
  | 'outros';

/** Idiomas suportados pela plataforma para oferta e atendimento. */
export type Idioma = 'pt-BR' | 'pt-PT' | 'en-US' | 'es-ES';

/** Modalidade de entrega do serviço. */
export type Modalidade = 'presencial' | 'online' | 'hibrido';

/** Nível de profundidade / embalagem do produto. */
export type Nivel = 'basico' | 'premium' | 'elite';

/** Trust level do praticante (gating de listing). */
export type TrustLevel = 'novato' | 'em_treinamento' | 'verificado' | 'mentor' | 'mestre';

/** Status de um listing. */
export type ListingStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'removido';

/** Status de um pedido. */
export type OrderStatus =
  | 'pendente_pagamento'
  | 'pago'
  | 'confirmado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'reembolsado'
  | 'disputa';

/** Status de um agendamento. */
export type BookingStatus = 'reservado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'no_show';

/** Método de pagamento aceito. */
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'saldo_plataforma';

/** Tipo de desconto em cupom. */
export type CouponTipo = 'percentual' | 'fixo';

/** Foto anexada a uma review. */
export interface ReviewFoto {
  url: string;
  legenda?: string;
  width?: number;
  height?: number;
}

/** Listing publicável. */
export interface Listing {
  id: ID;
  practitionerId: ID;
  tipo: ListingTipo;
  tradicao: Tradicao;
  titulo: string;
  descricao: string;
  /** Preço em centavos de BRL. */
  precoBRL: Centavos;
  /** Duração estimada em minutos. */
  duracaoMin: number;
  /** Idiomas em que o serviço pode ser entregue. */
  idiomas: Idioma[];
  modalidade: Modalidade;
  /** Pacote: define tier e libera features. */
  nivel: Nivel;
  /** Tags de busca (lowercase, sem acento). */
  tags: string[];
  /** Máximo de consulentes simultâneos por slot. leitura=1, prática=5-30, consulta=1. */
  maxConcorrentes: number;
  /** Disponibilidade semanal (ex: [{dia: 1, inicio: '14:00', fim: '18:00'}]). */
  disponibilidade: JanelaSemanal[];
  /** Exceções de agenda (feriados, folgas). */
  excecoes: ExcecaoAgenda[];
  status: ListingStatus;
  /** Trust mínimo requerido do praticante para publicar este nível. */
  trustMinimo: TrustLevel;
  /** Cidades atendidas quando modalidade presencial/hibrido. */
  cidadesPresencial?: string[];
  /** Avaliação média (0-5, 1 casa decimal). Denormalizado para sort. */
  avaliacaoMedia: number;
  /** Total de reviews. Denormalizado. */
  totalReviews: number;
  /** Total de vendas concluídas. */
  totalVendas: number;
  createdAt: ISODate;
  updatedAt: ISODate;
  publishedAt?: ISODate;
  archivedAt?: ISODate;
}

/** Janela semanal recorrente de disponibilidade. */
export interface JanelaSemanal {
  /** 0=Domingo, 6=Sábado. */
  dia: number;
  /** 'HH:mm' local do praticante. */
  inicio: string;
  /** 'HH:mm' local do praticante. */
  fim: string;
}

/** Exceção pontual: bloqueio ou liberação extra. */
export interface ExcecaoAgenda {
  data: DateKey;
  /** Se true, libera um slot extra; se false, bloqueia. */
  liberar?: boolean;
  inicio?: string;
  fim?: string;
  motivo?: string;
}

/** Praticante (visão pública). */
export interface Practitioner {
  id: ID;
  displayName: string;
  handle: string;
  bio: string;
  fotoUrl?: string;
  cidade?: string;
  estado?: string;
  pais: string;
  idiomas: Idioma[];
  tradições: Tradicao[];
  trust: TrustLevel;
  /** Tempo médio de resposta em horas. */
  tempoRespostaHoras: number;
  /** Taxa de conclusão (0-1). Refunds/Disputas reduzem. */
  taxaConclusao: number;
  /** Anos de experiência. */
  anosExperiencia: number;
  /** Selos (ex: 'top-rated', 'verified', 'mentor-of-year'). */
  selos: string[];
  /** Verificação KYC. */
  kycVerificado: boolean;
  /** Recebe pagamentos via plataforma? */
  pagamentosHabilitados: boolean;
  /** Data de entrada na plataforma. */
  memberSince: ISODate;
}

/** Item do carrinho. */
export interface CartItem {
  listingId: ID;
  practitionerId: ID;
  quantidade: number;
  /** Slot pré-selecionado (opcional — pode ser definido no checkout). */
  slotInicio?: ISODate;
  slotFim?: ISODate;
  /** Cupom aplicado a este item (per-listing). */
  couponCode?: string;
  /** Snapshot do preço no momento do add (anti-drift). */
  precoUnitarioSnapshot: Centavos;
  addedAt: ISODate;
}

/** Carrinho. */
export interface Cart {
  userId: ID;
  itens: CartItem[];
  /** Cupom aplicado ao total do carrinho (cart-level). */
  couponCartCode?: string;
  updatedAt: ISODate;
}

/** Cupom. */
export interface Coupon {
  code: string;
  tipo: CouponTipo;
  /** Para percentual: 0-100. Para fixo: centavos. */
  valor: number;
  /** Limite total de usos. 0 = ilimitado. */
  limiteUsos: number;
  usosAtuais: number;
  /** Restringe a tradições específicas. Vazio = todas. */
  tradicoes?: Tradicao[];
  /** Restringe a listings específicos. Vazio = todos. */
  listingIds?: ID[];
  /** Restringe a usuários específicos. Vazio = todos. */
  userIds?: ID[];
  /** Apenas primeira compra? */
  apenasPrimeiraCompra?: boolean;
  /** Valor mínimo de carrinho (centavos) para o cupom ser aplicável. */
  minCarrinho?: Centavos;
  /** Janela de validade. */
  validoDe: ISODate;
  validoAte: ISODate;
  ativo: boolean;
}

/** Pedido criado no checkout. */
export interface Order {
  id: ID;
  /** Idempotency key do cliente (1 por user, 1 order). */
  operationId: string;
  userId: ID;
  itens: OrderItem[];
  /** Subtotal antes de cupom. */
  subtotalBRL: Centavos;
  /** Desconto total aplicado (cart + per-listing). */
  descontoBRL: Centavos;
  /** Taxa da plataforma (centavos). Calculada sobre subtotal-desconto. */
  taxaPlataformaBRL: Centavos;
  /** Total final. */
  totalBRL: Centavos;
  /** Cupons aplicados (1 cart + N per-listing). */
  cuponsAplicados: { code: string; desconto: Centavos }[];
  metodoPagamento: PaymentMethod;
  status: OrderStatus;
  /** Janela de auto-refund (paga → cancelada sem practitioner response). */
  autoRefundAte?: ISODate;
  paidAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Item de um pedido (snapshot do listing no momento da compra). */
export interface OrderItem {
  listingId: ID;
  practitionerId: ID;
  titulo: string;
  tipo: ListingTipo;
  precoUnitarioBRL: Centavos;
  quantidade: number;
  slotInicio?: ISODate;
  slotFim?: ISODate;
}

/** Review de um consumidor sobre um pedido. */
export interface Review {
  id: ID;
  orderId: ID;
  userId: ID;
  practitionerId: ID;
  /** 1-5 estrelas. */
  rating: number;
  /** Texto livre (até 2000 chars). */
  texto: string;
  fotos: ReviewFoto[];
  /** Resposta do praticante (até 1000 chars, 1×). */
  practitionerResponse?: string;
  practitionerResponseAt?: ISODate;
  /** Votos "foi útil". */
  helpfulCount: number;
  /** Votos únicos (userId) para evitar duplicata. */
  helpfulVoters: ID[];
  /** Moderação. */
  flagCount: number;
  visible: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Reembolso. */
export interface Refund {
  id: ID;
  orderId: ID;
  /** 'total' ou 'parcial'. */
  tipo: 'total' | 'parcial';
  /** Valor em centavos. */
  valorBRL: Centavos;
  /** Motivo declarado. */
  motivo: string;
  /** Status. */
  status: 'solicitado' | 'aprovado' | 'rejeitado' | 'processado' | 'falhou';
  /** Solicitante. */
  solicitadoPor: ID;
  /** Tipo de solicitante. */
  papelSolicitante: 'consulente' | 'praticante' | 'plataforma';
  /** Dispute aberta? */
  emDisputa: boolean;
  /** Notas internas. */
  notasInternas?: string;
  createdAt: ISODate;
  processedAt?: ISODate;
}

/** Agendamento (booking) vinculado a um pedido. */
export interface Booking {
  id: ID;
  orderId: ID;
  listingId: ID;
  practitionerId: ID;
  userId: ID;
  slotInicio: ISODate;
  slotFim: ISODate;
  status: BookingStatus;
  /** Notas do consumidor para a sessão. */
  notasConsulente?: string;
  /** Notas internas do praticante. */
  notasPraticante?: string;
  /** Histórico de reagendamentos. */
  reagendamentos: { de: ISODate; para: ISODate; motivo: string; por: ID; em: ISODate }[];
  createdAt: ISODate;
  updatedAt: ISODate;
  canceladoEm?: ISODate;
  canceladoPor?: ID;
  motivoCancelamento?: string;
}

// ============================================================================
// 2. CONSTANTES DO DOMÍNIO
// ============================================================================

/** Preço mínimo (R$ 5,00). Abaixo disso, suspeitamos de erro. */
export const PRECO_MINIMO_CENTAVOS: Centavos = 500;

/** Preço máximo (R$ 50.000,00) — defesa contra typo. */
export const PRECO_MAXIMO_CENTAVOS: Centavos = 5_000_000;

/** Duração mínima de uma sessão (15 min). */
export const DURACAO_MINIMA_MIN: number = 15;

/** Duração máxima (8h — atendimento estendido). */
export const DURACAO_MAXIMA_MIN: number = 480;

/** Máximo de caracteres em títulos. */
export const TITULO_MAX: number = 100;

/** Máximo de caracteres em descrição. */
export const DESCRICAO_MAX: number = 4000;

/** Máximo de tags por listing. */
export const TAGS_MAX: number = 12;

/** Máximo de caracteres por tag. */
export const TAG_MAX_LEN: number = 24;

/** Janela de auto-refund em horas (pago → cancelado se sem practitioner response). */
export const AUTO_REFUND_HORAS: number = 24;

/** Janela de edição de review (após isso, imutável). */
export const REVIEW_EDIT_WINDOW_HORAS: number = 24;

/** Máximo de fotos por review. */
export const REVIEW_FOTOS_MAX: number = 5;

/** Compras mensais grátis que disparam flag de cupom. */
export const TRUST_MINIMO_PAGAMENTO: TrustLevel = 'verificado';

/** Taxa da plataforma padrão (% * 100, ou seja 12,5% = 1250). */
export const TAXA_PLATAFORMA_BPS: number = 1250;

/** Slots mínimos de antecedência (em horas) para booking. */
export const BOOKING_ANTECEDENCIA_HORAS: number = 2;

/** Slots máximos no futuro permitidos para booking (90 dias). */
export const BOOKING_HORIZONTE_DIAS: number = 90;

/** Limite de itens por carrinho (defesa contra DOS). */
export const CART_ITENS_MAX: number = 20;

/** Limite de quantidade por item. */
export const CART_QTD_MAX_POR_ITEM: number = 10;

// ============================================================================
// 3. ESTADO EM-MEMÓRIA (apenas para a engine; em produção vem do banco)
// ============================================================================

const listingsStore = new Map<ID, Listing>();
const cartStore = new Map<ID, Cart>();
const ordersStore = new Map<ID, Order>();
const ordersByOperationKey = new Map<string, ID>(); // operationId → orderId
const reviewsStore = new Map<ID, Review>();
const refundStore = new Map<ID, Refund>();
const bookingStore = new Map<ID, Booking>();
const practitionerStore = new Map<ID, Practitioner>();
const couponStore = new Map<string, Coupon>();
const firstPurchaseTracker = new Map<ID, boolean>(); // userId → já comprou?

// ============================================================================
// 4. HELPERS INTERNOS
// ============================================================================

function nowISO(): ISODate {
  return new Date().toISOString();
}

function uid(prefix: string): ID {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}${rand}`;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return Math.floor(n);
}

function clampRating(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 5) return 5;
  return Math.round(n * 10) / 10;
}

function diffHoras(a: ISODate, b: ISODate): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 3_600_000;
}

function parseHHMM(s: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

function normalizarTag(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, TAG_MAX_LEN);
}

function validarString(s: unknown, max: number, min = 1): string {
  if (typeof s !== 'string') throw new Error('Campo deve ser string');
  const t = s.trim();
  if (t.length < min) throw new Error(`Mínimo de ${min} caracteres`);
  if (t.length > max) throw new Error(`Máximo de ${max} caracteres`);
  return t;
}

// ============================================================================
// 5. CRUD DE LISTING
// ============================================================================

export interface CreateListingInput {
  practitionerId: ID;
  tipo: ListingTipo;
  tradicao: Tradicao;
  titulo: string;
  descricao: string;
  precoBRL: Centavos;
  duracaoMin: number;
  idiomas: Idioma[];
  modalidade: Modalidade;
  nivel: Nivel;
  tags?: string[];
  maxConcorrentes?: number;
  disponibilidade?: JanelaSemanal[];
  excecoes?: ExcecaoAgenda[];
  cidadesPresencial?: string[];
}

export function createListing(input: CreateListingInput): Listing {
  if (!input.practitionerId) throw new Error('practitionerId obrigatório');
  if (input.precoBRL < PRECO_MINIMO_CENTAVOS || input.precoBRL > PRECO_MAXIMO_CENTAVOS) {
    throw new Error(`Preço fora da faixa permitida (${PRECO_MINIMO_CENTAVOS}-${PRECO_MAXIMO_CENTAVOS})`);
  }
  if (input.duracaoMin < DURACAO_MINIMA_MIN || input.duracaoMin > DURACAO_MAXIMA_MIN) {
    throw new Error(`Duração fora da faixa (${DURACAO_MINIMA_MIN}-${DURACAO_MAXIMA_MIN} min)`);
  }
  const p = practitionerStore.get(input.practitionerId);
  if (!p) throw new Error('Praticante não encontrado');
  if (!p.pagamentosHabilitados) {
    throw new Error('Praticante não habilitado para receber pagamentos');
  }

  const trustMin = trustMinimoParaNivel(input.nivel);
  if (!atendeTrustLevel(p.trust, trustMin)) {
    throw new Error(`Praticante precisa de trust ${trustMin} para nivel ${input.nivel}`);
  }

  const tagsNorm = (input.tags ?? [])
    .map(normalizarTag)
    .filter(Boolean)
    .slice(0, TAGS_MAX);
  const dedup = Array.from(new Set(tagsNorm));

  const listing: Listing = {
    id: uid('lst'),
    practitionerId: input.practitionerId,
    tipo: input.tipo,
    tradicao: input.tradicao,
    titulo: validarString(input.titulo, TITULO_MAX, 3),
    descricao: validarString(input.descricao, DESCRICAO_MAX, 20),
    precoBRL: Math.round(input.precoBRL),
    duracaoMin: Math.round(input.duracaoMin),
    idiomas: input.idiomas,
    modalidade: input.modalidade,
    nivel: input.nivel,
    tags: dedup,
    maxConcorrentes: clampInt(
      input.maxConcorrentes ?? maxConcorrentesDefault(input.tipo),
      1,
      100,
    ),
    disponibilidade: (input.disponibilidade ?? []).filter((j) => {
      const ini = parseHHMM(j.inicio);
      const fim = parseHHMM(j.fim);
      return ini && fim && ini.h * 60 + ini.m < fim.h * 60 + fim.m;
    }),
    excecoes: input.excecoes ?? [],
    status: 'rascunho',
    trustMinimo: trustMin,
    cidadesPresencial: input.cidadesPresencial,
    avaliacaoMedia: 0,
    totalReviews: 0,
    totalVendas: 0,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  listingsStore.set(listing.id, listing);
  return clone(listing);
}

export function getListing(id: ID): Listing | null {
  const l = listingsStore.get(id);
  return l ? clone(l) : null;
}

export function listListings(): Listing[] {
  return Array.from(listingsStore.values()).map(clone);
}

export interface UpdateListingInput {
  titulo?: string;
  descricao?: string;
  precoBRL?: Centavos;
  duracaoMin?: number;
  idiomas?: Idioma[];
  modalidade?: Modalidade;
  nivel?: Nivel;
  tags?: string[];
  maxConcorrentes?: number;
  disponibilidade?: JanelaSemanal[];
  excecoes?: ExcecaoAgenda[];
  cidadesPresencial?: string[];
}

export function updateListing(id: ID, patch: UpdateListingInput): Listing {
  const l = listingsStore.get(id);
  if (!l) throw new Error('Listing não encontrado');
  if (l.status === 'removido') throw new Error('Listing removido, não pode ser editado');

  if (patch.precoBRL !== undefined) {
    if (patch.precoBRL < PRECO_MINIMO_CENTAVOS || patch.precoBRL > PRECO_MAXIMO_CENTAVOS) {
      throw new Error('Preço fora da faixa');
    }
    l.precoBRL = Math.round(patch.precoBRL);
  }
  if (patch.duracaoMin !== undefined) {
    if (patch.duracaoMin < DURACAO_MINIMA_MIN || patch.duracaoMin > DURACAO_MAXIMA_MIN) {
      throw new Error('Duração fora da faixa');
    }
    l.duracaoMin = Math.round(patch.duracaoMin);
  }
  if (patch.titulo !== undefined) l.titulo = validarString(patch.titulo, TITULO_MAX, 3);
  if (patch.descricao !== undefined) l.descricao = validarString(patch.descricao, DESCRICAO_MAX, 20);
  if (patch.idiomas !== undefined) l.idiomas = patch.idiomas;
  if (patch.modalidade !== undefined) l.modalidade = patch.modalidade;
  if (patch.nivel !== undefined) {
    const p = practitionerStore.get(l.practitionerId);
    if (!p) throw new Error('Praticante sumiu');
    const trustMin = trustMinimoParaNivel(patch.nivel);
    if (!atendeTrustLevel(p.trust, trustMin)) {
      throw new Error('Trust insuficiente para novo nível');
    }
    l.nivel = patch.nivel;
    l.trustMinimo = trustMin;
  }
  if (patch.tags !== undefined) {
    l.tags = Array.from(new Set(patch.tags.map(normalizarTag).filter(Boolean))).slice(0, TAGS_MAX);
  }
  if (patch.maxConcorrentes !== undefined) {
    l.maxConcorrentes = clampInt(patch.maxConcorrentes, 1, 100);
  }
  if (patch.disponibilidade !== undefined) l.disponibilidade = patch.disponibilidade;
  if (patch.excecoes !== undefined) l.excecoes = patch.excecoes;
  if (patch.cidadesPresencial !== undefined) l.cidadesPresencial = patch.cidadesPresencial;

  l.updatedAt = nowISO();
  listingsStore.set(l.id, l);
  return clone(l);
}

export function archiveListing(id: ID, motivo?: string): Listing {
  const l = listingsStore.get(id);
  if (!l) throw new Error('Listing não encontrado');
  l.status = 'arquivado';
  l.archivedAt = nowISO();
  l.updatedAt = l.archivedAt;
  if (motivo) l.tags = [...l.tags, `arquivado:${normalizarTag(motivo)}`].slice(0, TAGS_MAX);
  listingsStore.set(l.id, l);
  return clone(l);
}

export function restoreListing(id: ID): Listing {
  const l = listingsStore.get(id);
  if (!l) throw new Error('Listing não encontrado');
  if (l.status === 'removido') throw new Error('Listing removido, não pode ser restaurado');
  l.status = 'rascunho';
  l.archivedAt = undefined;
  l.updatedAt = nowISO();
  listingsStore.set(l.id, l);
  return clone(l);
}

export function publishListing(id: ID): Listing {
  const l = listingsStore.get(id);
  if (!l) throw new Error('Listing não encontrado');
  if (l.status === 'removido' || l.status === 'arquivado') {
    throw new Error('Não é possível publicar listing arquivado/removido');
  }
  l.status = 'publicado';
  l.publishedAt = nowISO();
  l.updatedAt = l.publishedAt;
  listingsStore.set(l.id, l);
  return clone(l);
}

// ============================================================================
// 6. TRUST LEVELS E PRICING TIERS
// ============================================================================

const TRUST_RANK: Record<TrustLevel, number> = {
  novato: 0,
  em_treinamento: 1,
  verificado: 2,
  mentor: 3,
  mestre: 4,
};

export function atendeTrustLevel(atual: TrustLevel, requerido: TrustLevel): boolean {
  return TRUST_RANK[atual] >= TRUST_RANK[requerido];
}

export function trustMinimoParaNivel(nivel: Nivel): TrustLevel {
  switch (nivel) {
    case 'basico':
      return 'verificado';
    case 'premium':
      return 'mentor';
    case 'elite':
      return 'mestre';
  }
}

export function maxConcorrentesDefault(tipo: ListingTipo): number {
  switch (tipo) {
    case 'leitura':
      return 1;
    case 'consulta':
      return 1;
    case 'pratica':
      return 10;
  }
}

export interface TierBeneficio {
  codigo: string;
  descricao: string;
}

const TIER_BENEFICIOS: Record<Nivel, TierBeneficio[]> = {
  basico: [
    { codigo: 'LISTAGEM_PADRAO', descricao: 'Aparece nos resultados padrão' },
    { codigo: 'ATENDIMENTO_ONLINE', descricao: 'Pode oferecer modalidade online' },
  ],
  premium: [
    { codigo: 'DESTAQUE_BUSCA', descricao: 'Posicionamento prioritário em buscas' },
    { codigo: 'PACOTE_RECORRENTE', descricao: 'Permite cobrança recorrente de clientes' },
    { codigo: 'ANALYTICS_AVANCADO', descricao: 'Relatórios de funil e retenção' },
  ],
  elite: [
    { codigo: 'BADGE_ELITE', descricao: 'Selo visível no perfil e listings' },
    { codigo: 'CONSULTORIA_PLATAFORMA', descricao: 'Suporte dedicado 1:1' },
    { codigo: 'REPASSE_ANTEcipado', descricao: 'Repasse em D+2 ao invés de D+7' },
  ],
};

export function beneficiosDoNivel(nivel: Nivel): TierBeneficio[] {
  return clone(TIER_BENEFICIOS[nivel]);
}

export function listarNiveis(): Nivel[] {
  return ['basico', 'premium', 'elite'];
}

// ============================================================================
// 7. CARRINHO
// ============================================================================

export function getOrCreateCart(userId: ID): Cart {
  let cart = cartStore.get(userId);
  if (!cart) {
    cart = { userId, itens: [], updatedAt: nowISO() };
    cartStore.set(userId, cart);
  }
  return clone(cart);
}

export function addItem(input: {
  userId: ID;
  listingId: ID;
  quantidade?: number;
  slotInicio?: ISODate;
  slotFim?: ISODate;
}): Cart {
  if (!input.userId || !input.listingId) throw new Error('userId e listingId obrigatórios');
  const listing = listingsStore.get(input.listingId);
  if (!listing) throw new Error('Listing não encontrado');
  if (listing.status !== 'publicado') throw new Error('Listing não está publicado');

  let cart = cartStore.get(input.userId);
  if (!cart) cart = { userId: input.userId, itens: [], updatedAt: nowISO() };

  if (cart.itens.length >= CART_ITENS_MAX) {
    throw new Error(`Carrinho lotado (max ${CART_ITENS_MAX})`);
  }

  const qtd = clampInt(input.quantidade ?? 1, 1, CART_QTD_MAX_POR_ITEM);

  // Para leitura/consulta (1-slot), se já existe item do mesmo listing, soma.
  const existing = cart.itens.find((i) => i.listingId === input.listingId);
  if (existing) {
    existing.quantidade = clampInt(existing.quantidade + qtd, 1, CART_QTD_MAX_POR_ITEM);
    existing.slotInicio = input.slotInicio ?? existing.slotInicio;
    existing.slotFim = input.slotFim ?? existing.slotFim;
  } else {
    cart.itens.push({
      listingId: listing.id,
      practitionerId: listing.practitionerId,
      quantidade: qtd,
      slotInicio: input.slotInicio,
      slotFim: input.slotFim,
      precoUnitarioSnapshot: listing.precoBRL,
      addedAt: nowISO(),
    });
  }

  cart.updatedAt = nowISO();
  cartStore.set(input.userId, cart);
  return clone(cart);
}

export function removeItem(userId: ID, listingId: ID): Cart {
  const cart = cartStore.get(userId);
  if (!cart) throw new Error('Carrinho vazio');
  cart.itens = cart.itens.filter((i) => i.listingId !== listingId);
  cart.updatedAt = nowISO();
  cartStore.set(userId, cart);
  return clone(cart);
}

export function clearCart(userId: ID): Cart {
  const cart: Cart = { userId, itens: [], updatedAt: nowISO() };
  cartStore.set(userId, cart);
  return clone(cart);
}

export function applyCoupon(input: {
  userId: ID;
  code: string;
  scope: 'cart' | 'item';
  listingId?: ID;
}): Cart {
  const cart = cartStore.get(input.userId);
  if (!cart) throw new Error('Carrinho vazio');
  const coupon = couponStore.get(input.code.toUpperCase());
  if (!coupon) throw new Error('Cupom não encontrado');
  validarCouponAplicavel(coupon, input.userId, cart);

  if (input.scope === 'cart') {
    cart.couponCartCode = coupon.code;
  } else {
    if (!input.listingId) throw new Error('listingId obrigatório para cupom de item');
    const item = cart.itens.find((i) => i.listingId === input.listingId);
    if (!item) throw new Error('Item não está no carrinho');
    item.couponCode = coupon.code;
  }

  cart.updatedAt = nowISO();
  cartStore.set(input.userId, cart);
  return clone(cart);
}

function validarCouponAplicavel(coupon: Coupon, userId: ID, cart: Cart): void {
  if (!coupon.ativo) throw new Error('Cupom inativo');
  const agora = nowISO();
  if (agora < coupon.validoDe) throw new Error('Cupom ainda não está na vigência');
  if (agora > coupon.validoAte) throw new Error('Cupom expirado');
  if (coupon.limiteUsos > 0 && coupon.usosAtuais >= coupon.limiteUsos) {
    throw new Error('Cupom esgotado');
  }
  if (coupon.userIds && coupon.userIds.length > 0 && !coupon.userIds.includes(userId)) {
    throw new Error('Cupom não disponível para este usuário');
  }
  if (coupon.apenasPrimeiraCompra && firstPurchaseTracker.get(userId)) {
    throw new Error('Cupom válido apenas para primeira compra');
  }
  if (coupon.tradicoes && coupon.tradicoes.length > 0) {
    const ok = cart.itens.some((i) => {
      const lst = listingsStore.get(i.listingId);
      return lst && coupon.tradicoes!.includes(lst.tradicao);
    });
    if (!ok) throw new Error('Cupom não aplicável aos itens do carrinho');
  }
  if (coupon.listingIds && coupon.listingIds.length > 0) {
    const ok = cart.itens.some((i) => coupon.listingIds!.includes(i.listingId));
    if (!ok) throw new Error('Cupom não aplicável aos listings do carrinho');
  }
  if (coupon.minCarrinho && coupon.minCarrinho > 0) {
    const subtotal = cart.itens.reduce(
      (acc, i) => acc + i.precoUnitarioSnapshot * i.quantidade,
      0,
    );
    if (subtotal < coupon.minCarrinho) {
      throw new Error(`Carrinho mínimo de R$ ${(coupon.minCarrinho / 100).toFixed(2)} para este cupom`);
    }
  }
}

export interface CartTotais {
  subtotalBRL: Centavos;
  descontoCartBRL: Centavos;
  descontoItensBRL: Centavos;
  descontoTotalBRL: Centavos;
  taxaPlataformaBRL: Centavos;
  totalBRL: Centavos;
  itens: { listingId: ID; subtotal: Centavos; desconto: Centavos; total: Centavos }[];
}

export function computeTotal(userId: ID): CartTotais {
  const cart = cartStore.get(userId);
  if (!cart || cart.itens.length === 0) {
    return {
      subtotalBRL: 0,
      descontoCartBRL: 0,
      descontoItensBRL: 0,
      descontoTotalBRL: 0,
      taxaPlataformaBRL: 0,
      totalBRL: 0,
      itens: [],
    };
  }

  const itensCalc: CartTotais['itens'] = [];
  let subtotal = 0;
  let descontoItens = 0;

  for (const item of cart.itens) {
    const sub = item.precoUnitarioSnapshot * item.quantidade;
    let desc = 0;
    if (item.couponCode) {
      const c = couponStore.get(item.couponCode);
      if (c) desc = calcularDescontoCupom(c, sub);
    }
    subtotal += sub;
    descontoItens += desc;
    itensCalc.push({ listingId: item.listingId, subtotal: sub, desconto: desc, total: sub - desc });
  }

  let descontoCart = 0;
  if (cart.couponCartCode) {
    const c = couponStore.get(cart.couponCartCode);
    if (c) {
      const base = subtotal - descontoItens;
      descontoCart = calcularDescontoCupom(c, base);
    }
  }

  const descontoTotal = descontoItens + descontoCart;
  const baseTaxa = Math.max(0, subtotal - descontoTotal);
  const taxa = Math.round((baseTaxa * TAXA_PLATAFORMA_BPS) / 10_000);
  const total = baseTaxa + taxa;

  return {
    subtotalBRL: subtotal,
    descontoCartBRL: descontoCart,
    descontoItensBRL: descontoItens,
    descontoTotalBRL: descontoTotal,
    taxaPlataformaBRL: taxa,
    totalBRL: total,
    itens: itensCalc,
  };
}

function calcularDescontoCupom(coupon: Coupon, baseCentavos: Centavos): Centavos {
  if (coupon.tipo === 'percentual') {
    const pct = clampInt(coupon.valor, 0, 100);
    return Math.floor((baseCentavos * pct) / 100);
  }
  return Math.min(baseCentavos, Math.max(0, Math.round(coupon.valor)));
}

// ============================================================================
// 8. CHECKOUT
// ============================================================================

export interface CheckoutPreValidacao {
  ok: boolean;
  razoes: string[];
  totais: CartTotais;
}

export function preCheckoutValidate(input: { userId: ID; metodoPagamento: PaymentMethod }): CheckoutPreValidacao {
  const razoes: string[] = [];
  const cart = cartStore.get(input.userId);
  if (!cart || cart.itens.length === 0) {
    return { ok: false, razoes: ['Carrinho vazio'], totais: computeTotal(input.userId) };
  }

  for (const item of cart.itens) {
    const l = listingsStore.get(item.listingId);
    if (!l) {
      razoes.push(`Listing ${item.listingId} não existe mais`);
      continue;
    }
    if (l.status !== 'publicado') {
      razoes.push(`Listing "${l.titulo}" não está disponível`);
    }
    const p = practitionerStore.get(l.practitionerId);
    if (!p || !p.pagamentosHabilitados) {
      razoes.push(`Praticante de "${l.titulo}" não habilitado a receber`);
    }
    if (!atendeTrustLevel(p?.trust ?? 'novato', l.trustMinimo)) {
      razoes.push(`Trust do praticante de "${l.titulo}" não atende ao listing`);
    }
    if (l.tradicao === 'outros' && l.precoBRL < 1000) {
      // listings da categoria "outros" exigem preço mínimo simbólico
      razoes.push(`Listing "${l.titulo}" com preço abaixo do simbólico`);
    }
  }

  if (cart.couponCartCode) {
    const c = couponStore.get(cart.couponCartCode);
    if (!c) razoes.push('Cupom de carrinho inválido');
    else {
      try {
        validarCouponAplicavel(c, input.userId, cart);
      } catch (e) {
        razoes.push((e as Error).message);
      }
    }
  }

  if (!['pix', 'cartao_credito', 'cartao_debito', 'boleto', 'saldo_plataforma'].includes(input.metodoPagamento)) {
    razoes.push('Método de pagamento inválido');
  }

  if (input.metodoPagamento === 'boleto') {
    const totais = computeTotal(input.userId);
    if (totais.totalBRL < 500) razoes.push('Boleto exige total mínimo de R$ 5,00');
  }

  const totais = computeTotal(input.userId);
  return { ok: razoes.length === 0, razoes, totais };
}

export interface CheckoutInput {
  userId: ID;
  metodoPagamento: PaymentMethod;
  /** Idempotency key (1 por usuário). */
  operationId: string;
  /** Notas opcionais. */
  notas?: string;
}

export interface CheckoutResult {
  order: Order;
  criado: boolean;
}

export function checkout(input: CheckoutInput): CheckoutResult {
  if (!input.userId) throw new Error('userId obrigatório');
  if (!input.operationId || input.operationId.length < 8) {
    throw new Error('operationId obrigatório (>=8 chars)');
  }
  const key = `${input.userId}:${input.operationId}`;
  const existingId = ordersByOperationKey.get(key);
  if (existingId) {
    const existing = ordersStore.get(existingId);
    if (existing) return { order: clone(existing), criado: false };
  }

  const pre = preCheckoutValidate({ userId: input.userId, metodoPagamento: input.metodoPagamento });
  if (!pre.ok) throw new Error('Checkout inválido: ' + pre.razoes.join('; '));

  const cart = cartStore.get(input.userId);
  if (!cart) throw new Error('Carrinho sumiu entre validação e checkout');

  const order: Order = {
    id: uid('ord'),
    operationId: input.operationId,
    userId: input.userId,
    itens: cart.itens.map<OrderItem>((i) => {
      const l = listingsStore.get(i.listingId);
      return {
        listingId: i.listingId,
        practitionerId: i.practitionerId,
        titulo: l?.titulo ?? '(removido)',
        tipo: l?.tipo ?? 'leitura',
        precoUnitarioBRL: i.precoUnitarioSnapshot,
        quantidade: i.quantidade,
        slotInicio: i.slotInicio,
        slotFim: i.slotFim,
      };
    }),
    subtotalBRL: pre.totais.subtotalBRL,
    descontoBRL: pre.totais.descontoTotalBRL,
    taxaPlataformaBRL: pre.totais.taxaPlataformaBRL,
    totalBRL: pre.totais.totalBRL,
    cuponsAplicados: [
      ...(cart.couponCartCode
        ? [{ code: cart.couponCartCode, desconto: pre.totais.descontoCartBRL }]
        : []),
      ...cart.itens
        .filter((i) => i.couponCode)
        .map((i) => {
          const totItem = pre.totais.itens.find((t) => t.listingId === i.listingId);
          return { code: i.couponCode!, desconto: totItem?.desconto ?? 0 };
        }),
    ],
    metodoPagamento: input.metodoPagamento,
    status: 'pendente_pagamento',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  // Incrementa uso dos cupons
  for (const c of order.cuponsAplicados) {
    const coupon = couponStore.get(c.code);
    if (coupon) coupon.usosAtuais += 1;
  }

  ordersStore.set(order.id, order);
  ordersByOperationKey.set(key, order.id);
  return { order: clone(order), criado: true };
}

export function confirmarPagamento(orderId: ID, pagoEm?: ISODate): Order {
  const o = ordersStore.get(orderId);
  if (!o) throw new Error('Pedido não encontrado');
  if (o.status !== 'pendente_pagamento') {
    throw new Error(`Não é possível confirmar pagamento a partir de ${o.status}`);
  }
  o.status = 'pago';
  o.paidAt = pagoEm ?? nowISO();
  const refundLimit = new Date(Date.now() + AUTO_REFUND_HORAS * 3_600_000).toISOString();
  o.autoRefundAte = refundLimit;
  o.updatedAt = o.paidAt;
  ordersStore.set(o.id, o);
  firstPurchaseTracker.set(o.userId, true);
  return clone(o);
}

// ============================================================================
// 9. REVIEWS
// ============================================================================

export interface CreateReviewInput {
  orderId: ID;
  userId: ID;
  rating: number;
  texto: string;
  fotos?: ReviewFoto[];
}

export function createReview(input: CreateReviewInput): Review {
  if (!input.orderId || !input.userId) throw new Error('orderId e userId obrigatórios');
  const order = ordersStore.get(input.orderId);
  if (!order) throw new Error('Pedido não encontrado');
  if (order.userId !== input.userId) throw new Error('Pedido não pertence a este usuário');
  if (order.status !== 'concluido' && order.status !== 'pago' && order.status !== 'confirmado') {
    throw new Error(`Pedido em status ${order.status} não pode ser avaliado`);
  }
  const rating = clampRating(input.rating);
  if (rating < 1) throw new Error('Rating mínimo 1');
  if (rating > 5) throw new Error('Rating máximo 5');
  const texto = validarString(input.texto, 2000, 10);
  const fotos = (input.fotos ?? []).slice(0, REVIEW_FOTOS_MAX);

  // Anti-spam: 1 review por (user, practitioner)
  for (const item of order.itens) {
    const jaExiste = Array.from(reviewsStore.values()).find(
      (r) => r.userId === input.userId && r.practitionerId === item.practitionerId,
    );
    if (jaExiste) {
      throw new Error('Você já avaliou este praticante');
    }
  }

  const review: Review = {
    id: uid('rev'),
    orderId: order.id,
    userId: input.userId,
    practitionerId: order.itens[0].practitionerId,
    rating,
    texto,
    fotos,
    helpfulCount: 0,
    helpfulVoters: [],
    flagCount: 0,
    visible: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  reviewsStore.set(review.id, review);
  recomputarRatingPraticante(review.practitionerId);
  return clone(review);
}

export function responderReview(input: {
  reviewId: ID;
  practitionerId: ID;
  resposta: string;
}): Review {
  const r = reviewsStore.get(input.reviewId);
  if (!r) throw new Error('Review não encontrada');
  if (r.practitionerId !== input.practitionerId) {
    throw new Error('Review não pertence a este praticante');
  }
  if (r.practitionerResponse) {
    throw new Error('Resposta já registrada (1× por review)');
  }
  const texto = validarString(input.resposta, 1000, 5);
  r.practitionerResponse = texto;
  r.practitionerResponseAt = nowISO();
  r.updatedAt = r.practitionerResponseAt;
  reviewsStore.set(r.id, r);
  return clone(r);
}

export function updateReview(input: {
  reviewId: ID;
  userId: ID;
  rating?: number;
  texto?: string;
  fotos?: ReviewFoto[];
}): Review {
  const r = reviewsStore.get(input.reviewId);
  if (!r) throw new Error('Review não encontrada');
  if (r.userId !== input.userId) throw new Error('Sem permissão');
  const idadeHoras = diffHoras(nowISO(), r.createdAt);
  if (idadeHoras > REVIEW_EDIT_WINDOW_HORAS) {
    throw new Error(`Janela de edição (${REVIEW_EDIT_WINDOW_HORAS}h) expirada`);
  }
  if (input.rating !== undefined) r.rating = clampRating(input.rating);
  if (input.texto !== undefined) r.texto = validarString(input.texto, 2000, 10);
  if (input.fotos !== undefined) r.fotos = input.fotos.slice(0, REVIEW_FOTOS_MAX);
  r.updatedAt = nowISO();
  reviewsStore.set(r.id, r);
  recomputarRatingPraticante(r.practitionerId);
  return clone(r);
}

export function voteHelpful(reviewId: ID, userId: ID): Review {
  const r = reviewsStore.get(reviewId);
  if (!r) throw new Error('Review não encontrada');
  if (r.userId === userId) throw new Error('Não pode votar no próprio review');
  if (r.helpfulVoters.includes(userId)) {
    // toggle off
    r.helpfulVoters = r.helpfulVoters.filter((u) => u !== userId);
    r.helpfulCount = Math.max(0, r.helpfulCount - 1);
  } else {
    r.helpfulVoters.push(userId);
    r.helpfulCount += 1;
  }
  reviewsStore.set(r.id, r);
  return clone(r);
}

export function flagReview(reviewId: ID, userId: ID, motivo: string): Review {
  const r = reviewsStore.get(reviewId);
  if (!r) throw new Error('Review não encontrada');
  if (!motivo || motivo.length < 3) throw new Error('Motivo obrigatório');
  r.flagCount += 1;
  if (r.flagCount >= 3) r.visible = false;
  reviewsStore.set(r.id, r);
  return clone(r);
}

function recomputarRatingPraticante(practitionerId: ID): void {
  const reviews = Array.from(reviewsStore.values()).filter(
    (r) => r.practitionerId === practitionerId && r.visible,
  );
  if (reviews.length === 0) return;
  const soma = reviews.reduce((acc, r) => acc + r.rating, 0);
  const media = Math.round((soma / reviews.length) * 10) / 10;
  // atualiza listings do praticante (denormalizado)
  for (const l of listingsStore.values()) {
    if (l.practitionerId === practitionerId) {
      l.avaliacaoMedia = media;
      l.totalReviews = reviews.length;
    }
  }
}

// ============================================================================
// 10. BUSCA E FILTROS
// ============================================================================

export interface SearchInput {
  query?: string;
  tradicoes?: Tradicao[];
  precoMin?: Centavos;
  precoMax?: Centavos;
  niveis?: Nivel[];
  ratingMin?: number;
  idiomas?: Idioma[];
  modalidades?: Modalidade[];
  apenasComSlot?: boolean;
  tags?: string[];
  ordenarPor?: 'relevancia' | 'preco_asc' | 'preco_desc' | 'rating' | 'vendas';
  limite?: number;
  offset?: number;
}

export function searchListings(input: SearchInput): { total: number; resultados: Listing[] } {
  let arr = Array.from(listingsStore.values()).filter((l) => l.status === 'publicado');

  if (input.tradicoes?.length) {
    arr = arr.filter((l) => input.tradicoes!.includes(l.tradicao));
  }
  if (input.precoMin !== undefined) arr = arr.filter((l) => l.precoBRL >= input.precoMin!);
  if (input.precoMax !== undefined) arr = arr.filter((l) => l.precoBRL <= input.precoMax!);
  if (input.niveis?.length) arr = arr.filter((l) => input.niveis!.includes(l.nivel));
  if (input.ratingMin !== undefined) arr = arr.filter((l) => l.avaliacaoMedia >= input.ratingMin!);
  if (input.idiomas?.length) {
    arr = arr.filter((l) => l.idiomas.some((i) => input.idiomas!.includes(i)));
  }
  if (input.modalidades?.length) {
    arr = arr.filter((l) => input.modalidades!.includes(l.modalidade));
  }
  if (input.tags?.length) {
    const wanted = new Set(input.tags.map(normalizarTag));
    arr = arr.filter((l) => l.tags.some((t) => wanted.has(t)));
  }
  if (input.query) {
    const q = input.query.toLowerCase();
    arr = arr.filter(
      (l) => l.titulo.toLowerCase().includes(q) || l.descricao.toLowerCase().includes(q),
    );
  }

  const total = arr.length;
  const ord = input.ordenarPor ?? 'relevancia';
  arr.sort((a, b) => {
    switch (ord) {
      case 'preco_asc':
        return a.precoBRL - b.precoBRL;
      case 'preco_desc':
        return b.precoBRL - a.precoBRL;
      case 'rating':
        return b.avaliacaoMedia - a.avaliacaoMedia;
      case 'vendas':
        return b.totalVendas - a.totalVendas;
      case 'relevancia':
      default:
        return b.totalVendas - a.totalVendas || b.avaliacaoMedia - a.avaliacaoMedia;
    }
  });

  const offset = Math.max(0, input.offset ?? 0);
  const limite = Math.min(100, Math.max(1, input.limite ?? 20));
  return { total, resultados: arr.slice(offset, offset + limite).map(clone) };
}

export function listarPorTradicao(t: Tradicao): Listing[] {
  return Array.from(listingsStore.values())
    .filter((l) => l.status === 'publicado' && l.tradicao === t)
    .map(clone);
}

export function listarPorPraticante(practitionerId: ID): Listing[] {
  return Array.from(listingsStore.values())
    .filter((l) => l.practitionerId === practitionerId && l.status !== 'removido')
    .map(clone);
}

// ============================================================================
// 11. PERFIL DO PRATICANTE
// ============================================================================

export function upsertPractitioner(p: Practitioner): Practitioner {
  if (!p.id || !p.handle) throw new Error('id e handle obrigatórios');
  practitionerStore.set(p.id, p);
  return clone(p);
}

export function getPractitioner(id: ID): Practitioner | null {
  const p = practitionerStore.get(id);
  return p ? clone(p) : null;
}

export interface PractitionerProfilePublico {
  practitioner: Practitioner;
  listings: Listing[];
  metricas: {
    avaliacaoMedia: number;
    totalReviews: number;
    totalListings: number;
    vendasConcluidas: number;
    tempoRespostaHoras: number;
    taxaConclusao: number;
  };
}

export function getPublicProfile(practitionerId: ID): PractitionerProfilePublico | null {
  const p = practitionerStore.get(practitionerId);
  if (!p) return null;
  const listings = listarPorPraticante(practitionerId).filter((l) => l.status === 'publicado');
  const reviews = Array.from(reviewsStore.values()).filter(
    (r) => r.practitionerId === practitionerId && r.visible,
  );
  const media =
    reviews.length === 0
      ? 0
      : Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10;
  const vendas = Array.from(ordersStore.values()).filter(
    (o) => o.status === 'concluido' && o.itens.some((i) => i.practitionerId === practitionerId),
  ).length;

  return {
    practitioner: clone(p),
    listings,
    metricas: {
      avaliacaoMedia: media,
      totalReviews: reviews.length,
      totalListings: listings.length,
      vendasConcluidas: vendas,
      tempoRespostaHoras: p.tempoRespostaHoras,
      taxaConclusao: p.taxaConclusao,
    },
  };
}

// ============================================================================
// 12. CUPONS
// ============================================================================

export interface CreateCouponInput {
  code: string;
  tipo: CouponTipo;
  valor: number;
  limiteUsos?: number;
  tradicoes?: Tradicao[];
  listingIds?: ID[];
  userIds?: ID[];
  apenasPrimeiraCompra?: boolean;
  minCarrinho?: Centavos;
  validoDe: ISODate;
  validoAte: ISODate;
}

export function createCoupon(input: CreateCouponInput): Coupon {
  const code = input.code.toUpperCase().trim();
  if (code.length < 3 || code.length > 32) throw new Error('Code 3-32 chars');
  if (couponStore.has(code)) throw new Error('Cupom já existe');
  if (input.tipo === 'percentual' && (input.valor <= 0 || input.valor > 100)) {
    throw new Error('Percentual 1-100');
  }
  if (input.tipo === 'fixo' && input.valor <= 0) throw new Error('Valor fixo > 0');
  if (input.validoAte <= input.validoDe) throw new Error('Validade inválida');

  const coupon: Coupon = {
    code,
    tipo: input.tipo,
    valor: Math.round(input.valor),
    limiteUsos: Math.max(0, input.limiteUsos ?? 0),
    usosAtuais: 0,
    tradicoes: input.tradicoes,
    listingIds: input.listingIds,
    userIds: input.userIds,
    apenasPrimeiraCompra: input.apenasPrimeiraCompra,
    minCarrinho: input.minCarrinho,
    validoDe: input.validoDe,
    validoAte: input.validoAte,
    ativo: true,
  };
  couponStore.set(code, coupon);
  return clone(coupon);
}

export function getCoupon(code: string): Coupon | null {
  const c = couponStore.get(code.toUpperCase());
  return c ? clone(c) : null;
}

export function deactivateCoupon(code: string): Coupon {
  const c = couponStore.get(code.toUpperCase());
  if (!c) throw new Error('Cupom não encontrado');
  c.ativo = false;
  couponStore.set(c.code, c);
  return clone(c);
}

export function listCoupons(): Coupon[] {
  return Array.from(couponStore.values()).map(clone);
}

// ============================================================================
// 13. REEMBOLSOS
// ============================================================================

export interface CreateRefundInput {
  orderId: ID;
  motivo: string;
  solicitadoPor: ID;
  papelSolicitante: 'consulente' | 'praticante' | 'plataforma';
  valorBRL?: Centavos;
}

export function createRefundRequest(input: CreateRefundInput): Refund {
  const order = ordersStore.get(input.orderId);
  if (!order) throw new Error('Pedido não encontrado');
  if (order.status === 'reembolsado') throw new Error('Pedido já reembolsado');

  const motivo = validarString(input.motivo, 500, 5);
  const isTotal = input.valorBRL === undefined || input.valorBRL >= order.totalBRL;
  const valor = isTotal ? order.totalBRL : Math.round(input.valorBRL!);

  if (!isTotal && valor <= 0) throw new Error('Valor inválido para refund parcial');
  if (!isTotal && valor > order.totalBRL) {
    throw new Error('Valor excede total do pedido');
  }

  const refund: Refund = {
    id: uid('rfd'),
    orderId: order.id,
    tipo: isTotal ? 'total' : 'parcial',
    valorBRL: valor,
    motivo,
    status: 'solicitado',
    solicitadoPor: input.solicitadoPor,
    papelSolicitante: input.papelSolicitante,
    emDisputa: false,
    createdAt: nowISO(),
  };
  refundStore.set(refund.id, refund);
  order.status = 'disputa';
  order.updatedAt = refund.createdAt;
  ordersStore.set(order.id, order);
  return clone(refund);
}

export function approveRefund(refundId: ID, processadoPor: ID): Refund {
  const r = refundStore.get(refundId);
  if (!r) throw new Error('Reembolso não encontrado');
  if (r.status === 'processado') throw new Error('Reembolso já processado');
  r.status = 'aprovado';
  r.processedAt = nowISO();
  const order = ordersStore.get(r.orderId);
  if (order) {
    order.status = r.tipo === 'total' ? 'reembolsado' : 'pago';
    order.updatedAt = r.processedAt;
    ordersStore.set(order.id, order);
  }
  refundStore.set(r.id, r);
  return clone(r);
}

export function openDispute(refundId: ID, notas: string): Refund {
  const r = refundStore.get(refundId);
  if (!r) throw new Error('Reembolso não encontrado');
  if (r.status === 'processado' || r.status === 'rejeitado') {
    throw new Error('Refund já encerrado');
  }
  r.emDisputa = true;
  r.notasInternas = notas;
  refundStore.set(r.id, r);
  return clone(r);
}

export function checkAutoRefund(orderId: ID, agora: ISODate = nowISO()): Refund | null {
  const order = ordersStore.get(orderId);
  if (!order) return null;
  if (order.status !== 'pago') return null;
  if (!order.autoRefundAte) return null;
  if (new Date(agora).getTime() < new Date(order.autoRefundAte).getTime()) return null;
  // Janela passou sem practitioner action → refund total automático
  const refund: Refund = {
    id: uid('rfd'),
    orderId: order.id,
    tipo: 'total',
    valorBRL: order.totalBRL,
    motivo: 'Auto-refund: practitioner não respondeu dentro da janela',
    status: 'processado',
    solicitadoPor: 'platform',
    papelSolicitante: 'plataforma',
    emDisputa: false,
    createdAt: agora,
    processedAt: agora,
  };
  refundStore.set(refund.id, refund);
  order.status = 'reembolsado';
  order.updatedAt = agora;
  ordersStore.set(order.id, order);
  return clone(refund);
}

// ============================================================================
// 14. BOOKING CALENDAR
// ============================================================================

export interface Slot {
  inicio: ISODate;
  fim: ISODate;
  listingId: ID;
  practitionerId: ID;
  capacidade: number;
  ocupacao: number;
}

export function generateSlots(input: {
  listingId: ID;
  /** Data inicial (inclusive). */
  de: DateKey;
  /** Data final (inclusive). */
  ate: DateKey;
  /** Granularidade em minutos (default = duração do listing). */
  granularidadeMin?: number;
}): Slot[] {
  const l = listingsStore.get(input.listingId);
  if (!l) throw new Error('Listing não encontrado');
  const ini = new Date(input.de + 'T00:00:00Z');
  const fim = new Date(input.ate + 'T23:59:59Z');
  if (isNaN(ini.getTime()) || isNaN(fim.getTime())) throw new Error('Datas inválidas');
  if (fim.getTime() <= ini.getTime()) throw new Error('Data final > inicial');
  const horizonMs = BOOKING_HORIZONTE_DIAS * 86_400_000;
  if (fim.getTime() - ini.getTime() > horizonMs) {
    throw new Error(`Horizonte máximo ${BOOKING_HORIZONTE_DIAS} dias`);
  }

  const gran = input.granularidadeMin ?? l.duracaoMin;
  if (gran < DURACAO_MINIMA_MIN) throw new Error(`Granularidade mínima ${DURACAO_MINIMA_MIN} min`);
  const slots: Slot[] = [];
  const dia = new Date(ini);

  while (dia.getTime() <= fim.getTime()) {
    const diaKey = dia.toISOString().slice(0, 10);
    const dow = dia.getUTCDay();
    const janela = l.disponibilidade.find((j) => j.dia === dow);
    const ex = l.excecoes.find((e) => e.data === diaKey);

    let ativo = !!janela;
    let inicioHHMM = janela?.inicio;
    let fimHHMM = janela?.fim;
    if (ex) {
      if (ex.liberar) {
        ativo = true;
        if (ex.inicio) inicioHHMM = ex.inicio;
        if (ex.fim) fimHHMM = ex.fim;
      } else {
        ativo = false;
      }
    }

    if (ativo && inicioHHMM && fimHHMM) {
      const a = parseHHMM(inicioHHMM);
      const b = parseHHMM(fimHHMM);
      if (a && b) {
        let cursor = new Date(dia);
        cursor.setUTCHours(a.h, a.m, 0, 0);
        const endOfWindow = new Date(dia);
        endOfWindow.setUTCHours(b.h, b.m, 0, 0);

        while (cursor.getTime() + l.duracaoMin * 60_000 <= endOfWindow.getTime()) {
          const slotFim = new Date(cursor.getTime() + l.duracaoMin * 60_000);
          const ocup = countBookingsOverlapping({
            listingId: l.id,
            slotInicio: cursor.toISOString(),
            slotFim: slotFim.toISOString(),
          });
          slots.push({
            inicio: cursor.toISOString(),
            fim: slotFim.toISOString(),
            listingId: l.id,
            practitionerId: l.practitionerId,
            capacidade: l.maxConcorrentes,
            ocupacao: ocup,
          });
          cursor = new Date(cursor.getTime() + gran * 60_000);
        }
      }
    }

    dia.setUTCDate(dia.getUTCDate() + 1);
  }

  return slots;
}

function countBookingsOverlapping(input: {
  listingId: ID;
  slotInicio: ISODate;
  slotFim: ISODate;
}): number {
  const ini = new Date(input.slotInicio).getTime();
  const fim = new Date(input.slotFim).getTime();
  let count = 0;
  for (const b of bookingStore.values()) {
    if (b.listingId !== input.listingId) continue;
    if (b.status === 'cancelado' || b.status === 'no_show') continue;
    const bIni = new Date(b.slotInicio).getTime();
    const bFim = new Date(b.slotFim).getTime();
    if (bIni < fim && bFim > ini) count += 1;
  }
  return count;
}

export function detectConflict(input: {
  listingId: ID;
  slotInicio: ISODate;
  slotFim: ISODate;
  ignoreBookingId?: ID;
}): boolean {
  for (const b of bookingStore.values()) {
    if (b.id === input.ignoreBookingId) continue;
    if (b.listingId !== input.listingId) continue;
    if (b.status === 'cancelado' || b.status === 'no_show') continue;
    const bIni = new Date(b.slotInicio).getTime();
    const bFim = new Date(b.slotFim).getTime();
    const sIni = new Date(input.slotInicio).getTime();
    const sFim = new Date(input.slotFim).getTime();
    if (bIni < sFim && bFim > sIni) return true;
  }
  return false;
}

export interface CreateBookingInput {
  orderId: ID;
  listingId: ID;
  userId: ID;
  slotInicio: ISODate;
  slotFim: ISODate;
  notasConsulente?: string;
}

export function createBooking(input: CreateBookingInput): Booking {
  const l = listingsStore.get(input.listingId);
  if (!l) throw new Error('Listing não encontrado');
  const order = ordersStore.get(input.orderId);
  if (!order) throw new Error('Pedido não encontrado');
  if (order.userId !== input.userId) throw new Error('Pedido não pertence ao usuário');
  if (order.status !== 'pago' && order.status !== 'confirmado') {
    throw new Error(`Pedido em status ${order.status} não pode ser agendado`);
  }
  const slotIni = new Date(input.slotInicio);
  const slotFim = new Date(input.slotFim);
  if (isNaN(slotIni.getTime()) || isNaN(slotFim.getTime()) || slotFim <= slotIni) {
    throw new Error('Slot inválido');
  }
  const antecedenciaHoras = (slotIni.getTime() - Date.now()) / 3_600_000;
  if (antecedenciaHoras < BOOKING_ANTECEDENCIA_HORAS) {
    throw new Error(`Antecedência mínima ${BOOKING_ANTECEDENCIA_HORAS}h`);
  }
  const horizonteDias = (slotIni.getTime() - Date.now()) / 86_400_000;
  if (horizonteDias > BOOKING_HORIZONTE_DIAS) {
    throw new Error(`Horizonte máximo ${BOOKING_HORIZONTE_DIAS} dias`);
  }
  if (detectConflict({ listingId: l.id, slotInicio: input.slotInicio, slotFim: input.slotFim })) {
    throw new Error('Conflito com outro booking');
  }
  if (countBookingsOverlapping({
    listingId: l.id, slotInicio: input.slotInicio, slotFim: input.slotFim,
  }) >= l.maxConcorrentes) {
    throw new Error('Capacidade esgotada neste horário');
  }

  const booking: Booking = {
    id: uid('bkg'),
    orderId: order.id,
    listingId: l.id,
    practitionerId: l.practitionerId,
    userId: input.userId,
    slotInicio: input.slotInicio,
    slotFim: input.slotFim,
    status: 'reservado',
    notasConsulente: input.notasConsulente,
    reagendamentos: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  bookingStore.set(booking.id, booking);
  return clone(booking);
}

export function rescheduleBooking(input: {
  bookingId: ID;
  novoInicio: ISODate;
  novoFim: ISODate;
  motivo: string;
  por: ID;
}): Booking {
  const b = bookingStore.get(input.bookingId);
  if (!b) throw new Error('Booking não encontrado');
  if (b.status === 'cancelado' || b.status === 'concluido') {
    throw new Error(`Não pode reagendar booking ${b.status}`);
  }
  const novoIni = new Date(input.novoInicio);
  const novoFim = new Date(input.novoFim);
  if (isNaN(novoIni.getTime()) || isNaN(novoFim.getTime()) || novoFim <= novoIni) {
    throw new Error('Slot inválido');
  }
  if (
    detectConflict({
      listingId: b.listingId,
      slotInicio: input.novoInicio,
      slotFim: input.novoFim,
      ignoreBookingId: b.id,
    })
  ) {
    throw new Error('Conflito no novo horário');
  }
  const antecedenciaHoras = (novoIni.getTime() - Date.now()) / 3_600_000;
  if (antecedenciaHoras < BOOKING_ANTECEDENCIA_HORAS) {
    throw new Error(`Antecedência mínima ${BOOKING_ANTECEDENCIA_HORAS}h`);
  }
  b.reagendamentos.push({
    de: b.slotInicio,
    para: input.novoInicio,
    motivo: input.motivo,
    por: input.por,
    em: nowISO(),
  });
  b.slotInicio = input.novoInicio;
  b.slotFim = input.novoFim;
  b.updatedAt = nowISO();
  bookingStore.set(b.id, b);
  return clone(b);
}

export function cancelBooking(input: { bookingId: ID; por: ID; motivo: string }): Booking {
  const b = bookingStore.get(input.bookingId);
  if (!b) throw new Error('Booking não encontrado');
  if (b.status === 'cancelado') throw new Error('Já cancelado');
  if (b.status === 'concluido') throw new Error('Não pode cancelar concluído');
  b.status = 'cancelado';
  b.canceladoEm = nowISO();
  b.canceladoPor = input.por;
  b.motivoCancelamento = input.motivo;
  b.updatedAt = b.canceladoEm;
  bookingStore.set(b.id, b);
  return clone(b);
}

export function listBookings(filter: { userId?: ID; practitionerId?: ID; listingId?: ID }): Booking[] {
  return Array.from(bookingStore.values())
    .filter((b) => !filter.userId || b.userId === filter.userId)
    .filter((b) => !filter.practitionerId || b.practitionerId === filter.practitionerId)
    .filter((b) => !filter.listingId || b.listingId === filter.listingId)
    .map(clone);
}

export function getBooking(id: ID): Booking | null {
  const b = bookingStore.get(id);
  return b ? clone(b) : null;
}

// ============================================================================
// 15. UTILITÁRIOS DE ORDEM (lifecycle helpers)
// ============================================================================

export function marcarConcluido(orderId: ID): Order {
  const o = ordersStore.get(orderId);
  if (!o) throw new Error('Pedido não encontrado');
  if (o.status !== 'confirmado' && o.status !== 'em_andamento' && o.status !== 'pago') {
    throw new Error(`Não é possível concluir a partir de ${o.status}`);
  }
  o.status = 'concluido';
  o.updatedAt = nowISO();
  ordersStore.set(o.id, o);
  for (const item of o.itens) {
    const l = listingsStore.get(item.listingId);
    if (l) {
      l.totalVendas += 1;
      listingsStore.set(l.id, l);
    }
  }
  return clone(o);
}

export function iniciarAtendimento(orderId: ID): Order {
  const o = ordersStore.get(orderId);
  if (!o) throw new Error('Pedido não encontrado');
  if (o.status !== 'confirmado' && o.status !== 'pago') {
    throw new Error(`Não pode iniciar a partir de ${o.status}`);
  }
  o.status = 'em_andamento';
  o.updatedAt = nowISO();
  ordersStore.set(o.id, o);
  return clone(o);
}

// ============================================================================
// 16. EXPORTS PARA TESTES / INTEGRAÇÃO
// ============================================================================

/** Reset completo — apenas para testes. */
export function _resetEngine(): void {
  listingsStore.clear();
  cartStore.clear();
  ordersStore.clear();
  ordersByOperationKey.clear();
  reviewsStore.clear();
  refundStore.clear();
  bookingStore.clear();
  practitionerStore.clear();
  couponStore.clear();
  firstPurchaseTracker.clear();
}

/** Snapshot de contadores — útil para health checks e dashboards. */
export interface EngineCounts {
  listings: number;
  carts: number;
  orders: number;
  reviews: number;
  refunds: number;
  bookings: number;
  practitioners: number;
  coupons: number;
}

export function getEngineCounts(): EngineCounts {
  return {
    listings: listingsStore.size,
    carts: cartStore.size,
    orders: ordersStore.size,
    reviews: reviewsStore.size,
    refunds: refundStore.size,
    bookings: bookingStore.size,
    practitioners: practitionerStore.size,
    coupons: couponStore.size,
  };
}
