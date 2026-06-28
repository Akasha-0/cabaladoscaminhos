// ============================================================================
// EVENTS — Tipos compartilhados (W26)
// ----------------------------------------------------------------------------
// Cobre os modelos de domínio para workshops, rituais e círculos de estudo
// públicos exibidos no portal Akasha. NÃO inclui `OnlineCircle` (que vive
// em `src/lib/community/events.ts` como W13) — estes são eventos com capa,
// bio do facilitador, localização física/virtual e capacidade.
//
// Decisões:
//   - Datas como ISO 8601 string (compatível com `new Date(...)`)
//   - `slug` único para URL (URL semântica, melhor que [id])
//   - `signupStatus` é derivado do usuário logado (client-side resolve)
//   - `paid | free` num mesmo campo `priceCents` (null = free)
// ============================================================================

/** Tipos de evento que o portal Akasha oferece */
export type EventType = 'workshop' | 'ritual' | 'study-circle' | 'meditation';

/** Modalidade: online (link), presencial (endereço) ou híbrido */
export type EventLocationKind = 'online' | 'presencial' | 'hybrid';

/** Status de signup de um usuário em relação a um evento */
export type SignupStatus = 'open' | 'closed' | 'waitlist' | 'full';

/** Tradição espiritual — espelha o enum usado em PostCard/groupList */
export type Tradition =
  | 'cabala'
  | 'ifa'
  | 'astrologia'
  | 'tantra'
  | 'reiki'
  | 'meditacao'
  | 'xamanismo'
  | 'cristianismo-mistico'
  | 'sufismo'
  | 'taoismo'
  | 'umbanda'
  | 'candomble';

/** Facilitador / anfitrião do evento */
export interface Host {
  /** ID único do host (UUID ou handle) */
  id: string;
  /** Nome de exibição (ex: "Mago Hermes") */
  displayName: string;
  /** URL da foto de perfil (opcional — avatar cai pro initials se ausente) */
  avatarUrl?: string;
  /** Linha curta da tradição/linhagem (ex: "Cabala, Ifá") */
  traditionLine?: string;
  /** Bio completa — exibida na página de detalhe */
  bio: string;
  /** @handle (sem @) — usado em links para /u/[handle] */
  handle?: string;
}

/**
 * Estrutura canônica de um evento/workshop exibido pelo portal.
 * Compatível com mocks e (futuramente) com o payload da API `/api/events/v2`.
 */
export interface Event {
  /** Slug único para URL (ex: "kabalat-shabbat-setembro-2026") */
  slug: string;
  /** Título do evento */
  title: string;
  /** Descrição completa (markdown simples — sem HTML) */
  description: string;
  /** Tipo de evento */
  type: EventType;
  /** Tradição espiritual principal */
  tradition: Tradition;
  /** ISO 8601 — data/hora de início (sempre local do evento, com offset) */
  startsAt: string;
  /** ISO 8601 — data/hora de fim (sempre local do evento, com offset) */
  endsAt: string;
  /** Duração em minutos (derivada de startsAt/endsAt, mas cacheada pra UI) */
  durationMin: number;
  /** Modalidade */
  locationKind: EventLocationKind;
  /** Cidade/país (para presencial/híbrido) */
  city?: string;
  /** Bairro ou endereço curto (sem expor rua) */
  neighborhood?: string;
  /** Link da reunião online (Zoom, Google Meet, Jitsi) — só pra online/hybrid */
  onlineUrl?: string;
  /** Texto curto da plataforma (ex: "Zoom", "Google Meet") */
  platform?: string;
  /** Capacidade total (0 = ilimitado) */
  capacity: number;
  /** Quantos já confirmaram presença (mock agora, real depois) */
  confirmedCount: number;
  /** Preço em centavos BRL. `null` = gratuito (free) */
  priceCents: number | null;
  /** URL da imagem de capa (16:9 recomendado) — usa next/image */
  coverImage: string;
  /** Texto alternativo da imagem (acessibilidade) */
  coverAlt: string;
  /** Tags/labels secundárias (ex: "iniciantes", "100% prático") */
  tags?: string[];
  /** Status geral do signup */
  signupStatus: SignupStatus;
  /** Anfitrião */
  host: Host;
  /** Idioma do evento (default 'pt-BR') */
  language: 'pt-BR' | 'en' | 'es';
}

/** Inscrição de um usuário em um evento */
export interface Signup {
  /** ID do evento (slug) */
  eventSlug: string;
  /** ID do usuário (Supabase user.id) */
  userId: string;
  /** ISO 8601 do momento da inscrição */
  createdAt: string;
  /** Status da inscrição */
  status: 'confirmed' | 'waitlist' | 'cancelled' | 'attended';
}