// ============================================================================
// DM SHARED — Tipos, marcas, stores in-memory, catálogo sagrado
// ============================================================================
// Arquivo único de fundação: tipos branded, Maps internos, e o índice de
// termos sagrados usados por todas as engines DM.
// ============================================================================
//
// IMPORTANTE: este arquivo NÃO exporta nada que toque Prisma/Redis/etc.
// Toda storage é in-memory. Persistência é responsabilidade do consumidor.
// ============================================================================

// ============================================================================
// BRANDED TYPES — segurança nominal em TSC strict
// ============================================================================

export type UserId = string & { readonly __brand: 'UserId' };
export type ConversationId = string & { readonly __brand: 'ConversationId' };
export type MessageId = string & { readonly __brand: 'MessageId' };
export type ConversationType = 'direct' | 'group';

export function toUserId(s: string): UserId {
  return s as UserId;
}
export function toConversationId(s: string): ConversationId {
  return s as ConversationId;
}
export function toMessageId(s: string): MessageId {
  return s as MessageId;
}

// ============================================================================
// DOMÍNIO — Tipos públicos (re-exportados via dm-engine.ts)
// ============================================================================

export interface DMSendOptions {
  mentions?: UserId[];
  attachments?: DMAttachment[];
  replyTo?: MessageId;
}

export interface DMAttachment {
  kind: 'image' | 'file' | 'audio' | 'video' | 'link';
  url: string;
  meta?: Record<string, string | number | boolean | null>;
}

export interface DMSacredHit {
  term: string;
  slug: string;
  tradition: string;
  matched: string;
  position: number;
}

export interface DirectMessage {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  content: string;
  createdAt: Date;
  readBy: UserId[];
  deliveredTo: UserId[];
  mentions: UserId[];
  attachments: DMAttachment[];
  replyToId: MessageId | null;
  sacredHits: DMSacredHit[];
}

export interface Conversation {
  id: ConversationId;
  type: ConversationType;
  title: string | null;
  participantIds: UserId[];
  createdAt: Date;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: number;
  createdBy: UserId;
  deletedBy: UserId[];
  metadata: Record<string, string | number | boolean | null>;
}

export interface CreateConversationOptions {
  title?: string | null;
  isGroup?: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface MessageSearchOptions {
  conversationId?: ConversationId;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  caseSensitive?: boolean;
}

// ============================================================================
// STORES — Maps internos (sem this, acesso via getters)
// ============================================================================

// mapa: ConversationId -> Conversation
let _conversations: Map<ConversationId, Conversation> | null = null;
export function getConversationStore(): Map<ConversationId, Conversation> {
  if (!_conversations) _conversations = new Map();
  return _conversations;
}

// mapa: ConversationId -> DirectMessage[]  (ordenado por createdAt)
let _messages: Map<ConversationId, DirectMessage[]> | null = null;
export function getMessageStore(): Map<ConversationId, DirectMessage[]> {
  if (!_messages) _messages = new Map();
  return _messages;
}

// mapa: UserId -> Set<ConversationId> (arquivadas)
let _archives: Map<UserId, Set<ConversationId>> | null = null;
export function getUserArchives(): Map<UserId, Set<ConversationId>> {
  if (!_archives) _archives = new Map();
  return _archives;
}

// mapa: UserId -> Set<ConversationId> (mutadas)
let _mutes: Map<UserId, Set<ConversationId>> | null = null;
export function getUserMutes(): Map<UserId, Set<ConversationId>> {
  if (!_mutes) _mutes = new Map();
  return _mutes;
}

// mapa: UserId -> Set<ConversationId> (soft-deleted)
let _deletes: Map<UserId, Set<ConversationId>> | null = null;
export function getUserSoftDeletes(): Map<UserId, Set<ConversationId>> {
  if (!_deletes) _deletes = new Map();
  return _deletes;
}

// mapa: ConversationId -> Set<slug> (sacred terms já mencionadas)
let _sacredIndex: Map<ConversationId, Set<string>> | null = null;
export function getSacredIndex(): Map<ConversationId, Set<string>> {
  if (!_sacredIndex) _sacredIndex = new Map();
  return _sacredIndex;
}

export function ensureSacredIndex(
  conversationId: ConversationId
): Set<string> {
  const idx = getSacredIndex();
  let set = idx.get(conversationId);
  if (!set) {
    set = new Set<string>();
    idx.set(conversationId, set);
  }
  return set;
}

// ============================================================================
// REINICIO — apenas para testes (NÃO chamar em produção)
// ============================================================================

export function __resetAllStoresForTests(): void {
  getConversationStore().clear();
  getMessageStore().clear();
  getUserArchives().clear();
  getUserMutes().clear();
  getUserSoftDeletes().clear();
  getSacredIndex().clear();
}

// ============================================================================
// CATÁLOGO SAGRADO — 7 tradições, lookup O(n×entries) por detecção
// ============================================================================

export interface SacredCatalogEntry {
  term: string;
  slug: string;
  tradition: string;
  aliases?: string[];
}

export const SACRED_CATALOG: readonly SacredCatalogEntry[] = Object.freeze([
  // ----- CIGANO (Lenormand rebranded) -----
  { term: 'Cavaleiro', slug: 'cigano-cavaleiro', tradition: 'cigano' },
  { term: 'Cavaleira', slug: 'cigano-cavaleira', tradition: 'cigano' },
  { term: 'Trevo', slug: 'cigano-trevo', tradition: 'cigano' },
  { term: 'Navio', slug: 'cigano-navio', tradition: 'cigano' },
  { term: 'Casa', slug: 'cigano-casa', tradition: 'cigano' },
  { term: 'Nuvem', slug: 'cigano-nuvem', tradition: 'cigano' },
  { term: 'Cobra', slug: 'cigano-cobra', tradition: 'cigano' },
  { term: 'Caixão', slug: 'cigano-caixao', tradition: 'cigano' },
  { term: 'Buquê', slug: 'cigano-buque', tradition: 'cigano' },
  { term: 'Foice', slug: 'cigano-foice', tradition: 'cigano' },
  { term: 'Chicote', slug: 'cigano-chicote', tradition: 'cigano' },
  { term: 'Pássaros', slug: 'cigano-passaros', tradition: 'cigano' },
  { term: 'Criança', slug: 'cigano-crianca', tradition: 'cigano' },
  { term: 'Raposa', slug: 'cigano-raposa', tradition: 'cigano' },
  { term: 'Urso', slug: 'cigano-urso', tradition: 'cigano' },
  { term: 'Estrela', slug: 'cigano-estrela', tradition: 'cigano' },
  { term: 'Cegonha', slug: 'cigano-cegonha', tradition: 'cigano' },
  { term: 'Cão', slug: 'cigano-cao', tradition: 'cigano' },
  { term: 'Lua', slug: 'cigano-lua', tradition: 'cigano' },
  { term: 'Chave', slug: 'cigano-chave', tradition: 'cigano' },
  { term: 'Peixes', slug: 'cigano-peixes', tradition: 'cigano' },
  { term: 'Carta', slug: 'cigano-carta', tradition: 'cigano' },
  { term: 'Presente', slug: 'cigano-presente', tradition: 'cigano' },
  { term: 'Cigano', slug: 'cigano-cigano', tradition: 'cigano' },
  { term: 'Cigana', slug: 'cigano-cigana', tradition: 'cigano' },
  { term: 'Jardim', slug: 'cigano-jardim', tradition: 'cigano' },
  { term: 'Sol', slug: 'cigano-sol', tradition: 'cigano' },
  { term: 'Coração', slug: 'cigano-coracao', tradition: 'cigano' },

  // ----- ORIXÁS -----
  { term: 'Oxalá', slug: 'oxala', tradition: 'orixas' },
  { term: 'Ogum', slug: 'ogum', tradition: 'orixas' },
  { term: 'Iansã', slug: 'iansa', tradition: 'orixas' },
  { term: 'Oxóssi', slug: 'oxossi', tradition: 'orixas', aliases: ['Oxossi'] },
  { term: 'Xangô', slug: 'xango', tradition: 'orixas' },
  { term: 'Nanã', slug: 'nana', tradition: 'orixas' },
  { term: 'Obaluaiê', slug: 'obaluaie', tradition: 'orixas' },
  { term: 'Oxum', slug: 'oxum', tradition: 'orixas' },
  { term: 'Iemanjá', slug: 'iemanja', tradition: 'orixas' },
  { term: 'Exu', slug: 'exu', tradition: 'orixas' },
  { term: 'Pombagira', slug: 'pombagira', tradition: 'orixas' },
  { term: 'Oxumarê', slug: 'oxumare', tradition: 'orixas' },

  // ----- ASTROLOGIA -----
  { term: 'Sol', slug: 'astro-sol', tradition: 'astrologia' },
  { term: 'Lua', slug: 'astro-lua', tradition: 'astrologia' },
  { term: 'Mercúrio', slug: 'astro-mercurio', tradition: 'astrologia' },
  { term: 'Vênus', slug: 'astro-venus', tradition: 'astrologia' },
  { term: 'Marte', slug: 'astro-marte', tradition: 'astrologia' },
  { term: 'Júpiter', slug: 'astro-jupiter', tradition: 'astrologia' },
  { term: 'Saturno', slug: 'astro-saturno', tradition: 'astrologia' },
  { term: 'Ascendente', slug: 'astro-ascendente', tradition: 'astrologia' },
  { term: 'Meio do Céu', slug: 'astro-mc', tradition: 'astrologia' },
  { term: 'Lilith', slug: 'astro-lilith', tradition: 'astrologia' },
  { term: 'Quíron', slug: 'astro-quiron', tradition: 'astrologia' },
  { term: 'Nodo Norte', slug: 'astro-nodo-norte', tradition: 'astrologia' },

  // ----- CABALA / SEFIROT -----
  { term: 'Keter', slug: 'keter', tradition: 'cabala' },
  { term: 'Chokhmah', slug: 'chokhmah', tradition: 'cabala' },
  { term: 'Binah', slug: 'binah', tradition: 'cabala' },
  { term: 'Chesed', slug: 'chesed', tradition: 'cabala' },
  { term: 'Guevurah', slug: 'guevurah', tradition: 'cabala' },
  { term: 'Tiferet', slug: 'tiferet', tradition: 'cabala' },
  { term: 'Netzach', slug: 'netzach', tradition: 'cabala' },
  { term: 'Hod', slug: 'hod', tradition: 'cabala' },
  { term: 'Yesod', slug: 'yesod', tradition: 'cabala' },
  { term: 'Malkuth', slug: 'malkuth', tradition: 'cabala' },

  // ----- NUMEROLOGIA -----
  { term: 'Número da Alma', slug: 'numero-alma', tradition: 'numerologia' },
  { term: 'Número do Destino', slug: 'numero-destino', tradition: 'numerologia' },
  { term: 'Caminho de Vida', slug: 'caminho-vida', tradition: 'numerologia' },
  { term: 'Expressão', slug: 'expressao', tradition: 'numerologia' },
  { term: 'Missão', slug: 'missao', tradition: 'numerologia' },
  { term: 'Psíquico', slug: 'psiquico', tradition: 'numerologia' },
  { term: 'Maturidade', slug: 'maturidade', tradition: 'numerologia' },
  { term: 'Lei do Trio', slug: 'lei-trio', tradition: 'numerologia' },
  { term: 'Lei da Comissão', slug: 'lei-comissao', tradition: 'numerologia' },
  { term: 'Lei do Déficit', slug: 'lei-deficit', tradition: 'numerologia' },

  // ----- TANTRA -----
  { term: 'Kundalini', slug: 'kundalini', tradition: 'tantra' },
  { term: 'Chacra', slug: 'chacra', tradition: 'tantra' },
  { term: 'Muladhara', slug: 'muladhara', tradition: 'tantra' },
  { term: 'Svadhisthana', slug: 'svadhisthana', tradition: 'tantra' },
  { term: 'Manipura', slug: 'manipura', tradition: 'tantra' },
  { term: 'Anahata', slug: 'anahata', tradition: 'tantra' },
  { term: 'Vishuddha', slug: 'vishuddha', tradition: 'tantra' },
  { term: 'Ajna', slug: 'ajna', tradition: 'tantra' },
  { term: 'Sahasrara', slug: 'sahasrara', tradition: 'tantra' },
  { term: 'Prana', slug: 'prana', tradition: 'tantra' },

  // ----- TAROT -----
  { term: 'O Louco', slug: 'tarot-louco', tradition: 'tarot' },
  { term: 'O Mago', slug: 'tarot-mago', tradition: 'tarot' },
  { term: 'A Sacerdotisa', slug: 'tarot-sacerdotisa', tradition: 'tarot' },
  { term: 'A Imperatriz', slug: 'tarot-imperatriz', tradition: 'tarot' },
  { term: 'O Hierofante', slug: 'tarot-hierofante', tradition: 'tarot' },
  { term: 'Os Enamorados', slug: 'tarot-enamorados', tradition: 'tarot' },
  { term: 'O Carro', slug: 'tarot-carro', tradition: 'tarot' },
  { term: 'A Força', slug: 'tarot-forca', tradition: 'tarot' },
  { term: 'O Eremita', slug: 'tarot-eremita', tradition: 'tarot' },
  { term: 'A Roda da Fortuna', slug: 'tarot-roda', tradition: 'tarot' },
  { term: 'A Justiça', slug: 'tarot-justica', tradition: 'tarot' },
  { term: 'O Pendurado', slug: 'tarot-pendurado', tradition: 'tarot' },
  { term: 'A Morte', slug: 'tarot-morte', tradition: 'tarot' },
  { term: 'A Temperança', slug: 'tarot-temperanca', tradition: 'tarot' },
  { term: 'O Diabo', slug: 'tarot-diabo', tradition: 'tarot' },
  { term: 'A Torre', slug: 'tarot-torre', tradition: 'tarot' },
  { term: 'A Estrela', slug: 'tarot-estrela', tradition: 'tarot' },
  { term: 'A Lua', slug: 'tarot-lua', tradition: 'tarot' },
  { term: 'O Sol', slug: 'tarot-sol', tradition: 'tarot' },
  { term: 'O Julgamento', slug: 'tarot-julgamento', tradition: 'tarot' },
  { term: 'O Mundo', slug: 'tarot-mundo', tradition: 'tarot' },
]);

// ============================================================================
// TRADITION_PRIORITY — quando termo ambíguo (Sol, Lua, ...) resolve múltiplas
// ============================================================================

export const TRADITION_PRIORITY: readonly string[] = Object.freeze([
  'tarot',     // mais específico
  'cigano',    // iconografia própria
  'orixas',    // cultura própria
  'astrologia',
  'cabala',
  'numerologia',
  'tantra',
]);

// ============================================================================
// CONSTANTES — Exports auxiliares
// ============================================================================

export const SACRED_TOTAL = SACRED_CATALOG.length;
export const SACRED_TRADITIONS = 7;
