// types.ts — branded IDs + DM domain types
// W83-A dm-messages-ui engine.
// Mirrors the W68 dm-engine contract so the UI can be wired to it later.

export type UsuarioId = string & { readonly __brand: 'UsuarioId' };
export type ConversaId = string & { readonly __brand: 'ConversaId' };
export type MensagemId = string & { readonly __brand: 'MensagemId' };

export function toUsuarioId(s: string): UsuarioId {
  return s as UsuarioId;
}
export function toConversaId(s: string): ConversaId {
  return s as ConversaId;
}
export function toMensagemId(s: string): MensagemId {
  return s as MensagemId;
}

// 7-tradição enum (matches W82-C catalog).
export type Tradicao =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'tarot';

export const TRADICOES: ReadonlyArray<Tradicao> = Object.freeze([
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
  'tarot',
] as Tradicao[]);

export type TipoConversa = 'direct' | 'group';

export type StatusMensagem = 'sent' | 'delivered' | 'read';

export interface Usuario {
  readonly id: UsuarioId;
  readonly nome: string;
  readonly handle: string; // for @mentions e.g. "@ramiro"
  readonly avatarInicial: string;
  readonly online: boolean;
  readonly tradicaoPrincipal: Tradicao;
  readonly bio?: string;
}

export interface Mensagem {
  readonly id: MensagemId;
  readonly conversaId: ConversaId;
  readonly remetenteId: UsuarioId;
  readonly conteudo: string;
  readonly createdAt: string; // ISO
  readonly mentions: ReadonlyArray<UsuarioId>;
  readonly replyToId: MensagemId | null;
  readonly readBy: ReadonlyArray<UsuarioId>;
  readonly status: StatusMensagem;
  readonly sacredHits: ReadonlyArray<SacredHit>;
}

export interface SacredHit {
  readonly term: string;
  readonly slug: string;
  readonly tradicao: Tradicao;
  readonly matched: string;
  readonly position: number;
}

export interface Conversa {
  readonly id: ConversaId;
  readonly tipo: TipoConversa;
  readonly titulo: string | null;
  readonly participanteIds: ReadonlyArray<UsuarioId>;
  readonly criadoEm: string;
  readonly ultimaMensagemEm: string;
  readonly ultimaMensagemPreview: string;
  readonly unreadCount: number;
  readonly topicosTradicao: ReadonlyArray<Tradicao>; // tagged topics
  readonly isMuted: boolean;
  readonly isArchived: boolean;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ConsentRecord {
  readonly usuarioId: UsuarioId;
  readonly aceitoEm: string;
  readonly versao: string;
  readonly scopes: ReadonlyArray<'message_read' | 'message_send' | 'presence'>;
}

// LGPD consent gate — must be accepted before composing messages.
export type ConsentStatus = 'unknown' | 'pending' | 'accepted' | 'declined';

// Quote-reply attachment (used by MessageComposer when user clicks Reply).
export interface QuoteReply {
  readonly mensagemId: MensagemId;
  readonly autorNome: string;
  readonly preview: string; // first 60 chars
}

// Composer draft state — what user has typed.
export interface ComposerDraft {
  readonly texto: string;
  readonly mentions: ReadonlyArray<UsuarioId>;
  readonly replyTo: QuoteReply | null;
  readonly sacredHits: ReadonlyArray<SacredHit>;
}