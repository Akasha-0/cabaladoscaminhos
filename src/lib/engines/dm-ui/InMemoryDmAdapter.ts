// InMemoryDmAdapter.ts — sample DM adapter mirroring W68 dm-engine contract
// W83-A dm-messages-ui engine.
// 8 sample conversations + ~28 sample messages + 12 sample users.
// Pure in-memory; no Prisma/Redis; LGPD-consent-aware.

import type {
  ConsentRecord,
  ConsentStatus,
  Conversa,
  ConversaId,
  Mensagem,
  MensagemId,
  SacredHit,
  StatusMensagem,
  Tradicao,
  Usuario,
  UsuarioId,
} from './types.ts';

import {
  toConversaId,
  toMensagemId,
  toUsuarioId,
} from './types.ts';

// ============================================================================
// CONSTANTS — sample data
// ============================================================================

const NOW = '2026-06-30T09:00:00.000Z';

// 12 sample users across 7 tradições
export const SAMPLE_USUARIOS: ReadonlyArray<Usuario> = Object.freeze([
  {
    id: toUsuarioId('u-1'),
    nome: 'Cigano Ramiro',
    handle: '@ramiro',
    avatarInicial: 'R',
    online: true,
    tradicaoPrincipal: 'candomble',
    bio: 'Fundador do metodo Cruzamento por Casa',
  },
  {
    id: toUsuarioId('u-2'),
    nome: 'Mae Iya Omim',
    handle: '@iya',
    avatarInicial: 'I',
    online: true,
    tradicaoPrincipal: 'candomble',
  },
  {
    id: toUsuarioId('u-3'),
    nome: 'Pai Ogum de Iansa',
    handle: '@ogum',
    avatarInicial: 'O',
    online: false,
    tradicaoPrincipal: 'umbanda',
  },
  {
    id: toUsuarioId('u-4'),
    nome: 'Astrologa Stella Vega',
    handle: '@stella',
    avatarInicial: 'S',
    online: true,
    tradicaoPrincipal: 'astrologia',
  },
  {
    id: toUsuarioId('u-5'),
    nome: 'Rabino Moshe Ben David',
    handle: '@moshe',
    avatarInicial: 'M',
    online: false,
    tradicaoPrincipal: 'cabala',
  },
  {
    id: toUsuarioId('u-6'),
    nome: 'Numerologa Beatriz Luz',
    handle: '@beatriz',
    avatarInicial: 'B',
    online: true,
    tradicaoPrincipal: 'astrologia',
  },
  {
    id: toUsuarioId('u-7'),
    nome: 'Mestra Tantrica Ananda',
    handle: '@ananda',
    avatarInicial: 'A',
    online: false,
    tradicaoPrincipal: 'tantra',
  },
  {
    id: toUsuarioId('u-8'),
    nome: 'Tarologo Rafael Cruz',
    handle: '@rafael',
    avatarInicial: 'R',
    online: true,
    tradicaoPrincipal: 'tarot',
  },
  {
    id: toUsuarioId('u-9'),
    nome: 'Pai Joaquim de Aruanda',
    handle: '@joaquim',
    avatarInicial: 'J',
    online: false,
    tradicaoPrincipal: 'umbanda',
  },
  {
    id: toUsuarioId('u-10'),
    nome: 'Babalao Adebayo Ogun',
    handle: '@adebayo',
    avatarInicial: 'A',
    online: true,
    tradicaoPrincipal: 'ifa',
  },
  {
    id: toUsuarioId('u-11'),
    nome: 'Mestra Zahara',
    handle: '@zahara',
    avatarInicial: 'Z',
    online: false,
    tradicaoPrincipal: 'cabala',
  },
  {
    id: toUsuarioId('u-12'),
    nome: 'Joana (voce)',
    handle: '@joana',
    avatarInicial: 'J',
    online: true,
    tradicaoPrincipal: 'candomble',
  },
]);

// 8 sample conversations
// Joana (u-12) is the current user. Each conversa includes Joana + at least 1 other.
export const SAMPLE_CONVERSAS: ReadonlyArray<Conversa> = Object.freeze([
  {
    id: toConversaId('c-1'),
    tipo: 'direct',
    titulo: null,
    participanteIds: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-1')]) as ReadonlyArray<UsuarioId>,
    criadoEm: '2026-06-25T14:00:00.000Z',
    ultimaMensagemEm: '2026-06-30T08:55:00.000Z',
    ultimaMensagemPreview: 'Ramiro: Bora fechar a Mesa Real de amanha?',
    unreadCount: 2,
    topicosTradicao: Object.freeze(['candomble', 'astrologia']) as ReadonlyArray<Tradicao>,
    isMuted: false,
    isArchived: false,
    metadata: Object.freeze({ origem: 'mesa-real' }),
  },
  {
    id: toConversaId('c-2'),
    tipo: 'direct',
    titulo: null,
    participanteIds: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-2')]) as ReadonlyArray<UsuarioId>,
    criadoEm: '2026-06-26T10:00:00.000Z',
    ultimaMensagemEm: '2026-06-30T08:30:00.000Z',
    ultimaMensagemPreview: 'Iya: Recebi o Odu de Nascimento, vamos marcar bori',
    unreadCount: 0,
    topicosTradicao: Object.freeze(['candomble']) as ReadonlyArray<Tradicao>,
    isMuted: false,
    isArchived: false,
    metadata: Object.freeze({ origem: 'odu-nascimento' }),
  },
  {
    id: toConversaId('c-3'),
    tipo: 'direct',
    titulo: null,
    participanteIds: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-4')]) as ReadonlyArray<UsuarioId>,
    criadoEm: '2026-06-27T15:00:00.000Z',
    ultimaMensagemEm: '2026-06-30T07:45:00.000Z',
    ultimaMensagemPreview: 'Stella: Lua nova em Cancer — emocao a flor da pele',
    unreadCount: 1,
    topicosTradicao: Object.freeze(['astrologia']) as ReadonlyArray<Tradicao>,
    isMuted: false,
    isArchived: false,
    metadata: Object.freeze({ origem: 'trânsitos' }),
  },
  {
    id: toConversaId('c-4'),
    tipo: 'direct',
    titulo: null,
    participanteIds: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-5')]) as ReadonlyArray<UsuarioId>,
    criadoEm: '2026-06-24T11:00:00.000Z',
    ultimaMensagemEm: '2026-06-30T06:20:00.000Z',
    ultimaMensagemPreview: 'Moshe: A sefira Tiferet pediu mais um pouco de meditacao',
    unreadCount: 0,
    topicosTradicao: Object.freeze(['cabala']) as ReadonlyArray<Tradicao>,
    isMuted: true,
    isArchived: false,
    metadata: Object.freeze({ origem: 'arvore-vida' }),
  },
  {
    id: toConversaId('c-5'),
    tipo: 'direct',
    titulo: null,
    participanteIds: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-8')]) as ReadonlyArray<UsuarioId>,
    criadoEm: '2026-06-28T19:00:00.000Z',
    ultimaMensagemEm: '2026-06-29T22:10:00.000Z',
    ultimaMensagemPreview: 'Rafael: Tirei a Carta do Louco — saltos de fe!',
    unreadCount: 0,
    topicosTradicao: Object.freeze(['tarot']) as ReadonlyArray<Tradicao>,
    isMuted: false,
    isArchived: false,
    metadata: Object.freeze({ origem: 'mandala-astrologica' }),
  },
  {
    id: toConversaId('c-6'),
    tipo: 'group',
    titulo: 'Grupo de Estudos — Ifa & Numerologia',
    participanteIds: Object.freeze([
      toUsuarioId('u-12'),
      toUsuarioId('u-10'),
      toUsuarioId('u-6'),
    ]),
    criadoEm: '2026-06-20T09:00:00.000Z',
    ultimaMensagemEm: '2026-06-29T18:00:00.000Z',
    ultimaMensagemPreview: 'Adebayo: Hoje o Odu 7 - Okana pediu firmeza',
    unreadCount: 3,
    topicosTradicao: Object.freeze(['ifa', 'astrologia']) as ReadonlyArray<Tradicao>,
    isMuted: false,
    isArchived: false,
    metadata: Object.freeze({ origem: 'grupo-estudos' }),
  },
  {
    id: toConversaId('c-7'),
    tipo: 'direct',
    titulo: null,
    participanteIds: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-7')]) as ReadonlyArray<UsuarioId>,
    criadoEm: '2026-06-22T20:00:00.000Z',
    ultimaMensagemEm: '2026-06-28T22:00:00.000Z',
    ultimaMensagemPreview: 'Ananda: Kundalini sobe devagar, sem pressa',
    unreadCount: 0,
    topicosTradicao: Object.freeze(['tantra']) as ReadonlyArray<Tradicao>,
    isMuted: false,
    isArchived: false,
    metadata: Object.freeze({ origem: 'praticas-tantricas' }),
  },
  {
    id: toConversaId('c-8'),
    tipo: 'direct',
    titulo: null,
    participanteIds: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-3')]) as ReadonlyArray<UsuarioId>,
    criadoEm: '2026-06-15T16:00:00.000Z',
    ultimaMensagemEm: '2026-06-25T12:30:00.000Z',
    ultimaMensagemPreview: 'Pai Ogum: A gira de domingo pede firmeza',
    unreadCount: 0,
    topicosTradicao: Object.freeze(['umbanda']) as ReadonlyArray<Tradicao>,
    isMuted: true,
    isArchived: true,
    metadata: Object.freeze({ origem: 'gira' }),
  },
]);

// ~28 sample messages spread across conversations
export const SAMPLE_MENSAGENS: ReadonlyArray<Mensagem> = Object.freeze([
  // c-1 — Ramiro (recent, with sacred hits)
  {
    id: toMensagemId('m-1-1'),
    conversaId: toConversaId('c-1'),
    remetenteId: toUsuarioId('u-1'),
    conteudo: 'Joana, a Mesa Real de amanha vai ser pesada — Odu 7 - Okana',
    createdAt: '2026-06-30T08:50:00.000Z',
    mentions: Object.freeze([toUsuarioId('u-12')]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-1')]),
    status: 'delivered',
    sacredHits: Object.freeze([
      { term: 'Mesa Real', slug: 'mesa-real', tradicao: 'candomble', matched: 'Mesa Real', position: 13 },
      { term: 'Odu', slug: 'odu-nascimento', tradicao: 'candomble', matched: 'Odu 7', position: 47 },
      { term: 'Okana', slug: 'odu-okana', tradicao: 'ifa', matched: 'Okana', position: 56 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-1-2'),
    conversaId: toConversaId('c-1'),
    remetenteId: toUsuarioId('u-12'),
    conteudo: 'Perfeito! Posso levar a Carta Natal pra cruzar?',
    createdAt: '2026-06-30T08:52:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-1')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Carta Natal', slug: 'carta-natal', tradicao: 'astrologia', matched: 'Carta Natal', position: 17 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-1-3'),
    conversaId: toConversaId('c-1'),
    remetenteId: toUsuarioId('u-1'),
    conteudo: 'Bora fechar a Mesa Real de amanha?',
    createdAt: '2026-06-30T08:55:00.000Z',
    mentions: Object.freeze([toUsuarioId('u-12')]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-1')]),
    status: 'delivered',
    sacredHits: Object.freeze([]) as ReadonlyArray<SacredHit>,
  },
  // c-2 — Mae Iya Omim
  {
    id: toMensagemId('m-2-1'),
    conversaId: toConversaId('c-2'),
    remetenteId: toUsuarioId('u-2'),
    conteudo: 'Filha, o Bori vai ser no terreiro de Sao Bartolomeu',
    createdAt: '2026-06-30T07:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-2'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Bori', slug: 'bori', tradicao: 'candomble', matched: 'Bori', position: 13 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-2-2'),
    conversaId: toConversaId('c-2'),
    remetenteId: toUsuarioId('u-12'),
    conteudo: 'Obrigada Mae! Levo o Odu de Nascimento pra apresentar',
    createdAt: '2026-06-30T08:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-2')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Odu de Nascimento', slug: 'odu-nascimento', tradicao: 'candomble', matched: 'Odu de Nascimento', position: 22 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-2-3'),
    conversaId: toConversaId('c-2'),
    remetenteId: toUsuarioId('u-2'),
    conteudo: 'Recebi o Odu de Nascimento, vamos marcar bori',
    createdAt: '2026-06-30T08:30:00.000Z',
    mentions: Object.freeze([toUsuarioId('u-12')]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-2'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([]) as ReadonlyArray<SacredHit>,
  },
  // c-3 — Stella Vega
  {
    id: toMensagemId('m-3-1'),
    conversaId: toConversaId('c-3'),
    remetenteId: toUsuarioId('u-4'),
    conteudo: 'A Lua nova em Cancer mexe com seu mapa astral — Mc em Peixes',
    createdAt: '2026-06-30T07:30:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-4')]),
    status: 'delivered',
    sacredHits: Object.freeze([
      { term: 'Lua', slug: 'astro-lua', tradicao: 'astrologia', matched: 'Lua', position: 2 },
      { term: 'Cancer', slug: 'astro-cancer', tradicao: 'astrologia', matched: 'Cancer', position: 15 },
      { term: 'mapa astral', slug: 'mapa-astral', tradicao: 'astrologia', matched: 'mapa astral', position: 41 },
      { term: 'Mc', slug: 'astro-mc', tradicao: 'astrologia', matched: 'Mc', position: 55 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-3-2'),
    conversaId: toConversaId('c-3'),
    remetenteId: toUsuarioId('u-4'),
    conteudo: 'Lua nova em Cancer — emocao a flor da pele',
    createdAt: '2026-06-30T07:45:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-4')]),
    status: 'delivered',
    sacredHits: Object.freeze([
      { term: 'Lua', slug: 'astro-lua', tradicao: 'astrologia', matched: 'Lua', position: 0 },
      { term: 'Cancer', slug: 'astro-cancer', tradicao: 'astrologia', matched: 'Cancer', position: 13 },
    ]) as ReadonlyArray<SacredHit>,
  },
  // c-4 — Rabino Moshe
  {
    id: toMensagemId('m-4-1'),
    conversaId: toConversaId('c-4'),
    remetenteId: toUsuarioId('u-5'),
    conteudo: 'Meditamos em Tiferet hoje, Joana — beleza e misericordia',
    createdAt: '2026-06-29T20:00:00.000Z',
    mentions: Object.freeze([toUsuarioId('u-12')]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-5'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Tiferet', slug: 'tiferet', tradicao: 'cabala', matched: 'Tiferet', position: 12 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-4-2'),
    conversaId: toConversaId('c-4'),
    remetenteId: toUsuarioId('u-5'),
    conteudo: 'A sefira Tiferet pediu mais um pouco de meditacao',
    createdAt: '2026-06-30T06:20:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-5'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'sefira', slug: 'sefirot', tradicao: 'cabala', matched: 'sefira', position: 2 },
      { term: 'Tiferet', slug: 'tiferet', tradicao: 'cabala', matched: 'Tiferet', position: 9 },
    ]) as ReadonlyArray<SacredHit>,
  },
  // c-5 — Rafael (Tarot)
  {
    id: toMensagemId('m-5-1'),
    conversaId: toConversaId('c-5'),
    remetenteId: toUsuarioId('u-12'),
    conteudo: 'Rafael, posso marcar uma consulta de Tarot?',
    createdAt: '2026-06-29T18:00:00.000Z',
    mentions: Object.freeze([toUsuarioId('u-8')]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-12'), toUsuarioId('u-8')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Tarot', slug: 'tarot-mago', tradicao: 'tarot', matched: 'Tarot', position: 24 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-5-2'),
    conversaId: toConversaId('c-5'),
    remetenteId: toUsuarioId('u-8'),
    conteudo: 'Claro! Vou tirar 3 cartas da Cruz Celta pra voce',
    createdAt: '2026-06-29T20:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-8'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Cruz Celta', slug: 'cruz-celta', tradicao: 'tarot', matched: 'Cruz Celta', position: 19 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-5-3'),
    conversaId: toConversaId('c-5'),
    remetenteId: toUsuarioId('u-8'),
    conteudo: 'Tirei a Carta do Louco — saltos de fe!',
    createdAt: '2026-06-29T22:10:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-8'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Louco', slug: 'tarot-louco', tradicao: 'tarot', matched: 'Louco', position: 19 },
    ]) as ReadonlyArray<SacredHit>,
  },
  // c-6 — Grupo Ifa & Numerologia
  {
    id: toMensagemId('m-6-1'),
    conversaId: toConversaId('c-6'),
    remetenteId: toUsuarioId('u-10'),
    conteudo: 'Bom dia comunidade! Odu 7 - Okana hoje',
    createdAt: '2026-06-29T09:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-10'), toUsuarioId('u-6'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Odu', slug: 'odu-nascimento', tradicao: 'candomble', matched: 'Odu 7', position: 21 },
      { term: 'Okana', slug: 'odu-okana', tradicao: 'ifa', matched: 'Okana', position: 27 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-6-2'),
    conversaId: toConversaId('c-6'),
    remetenteId: toUsuarioId('u-6'),
    conteudo: 'Hoje o ano pessoal 5 da galera vai pedir movimento',
    createdAt: '2026-06-29T15:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-6'), toUsuarioId('u-10'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'ano pessoal', slug: 'ano-pessoal', tradicao: 'astrologia', matched: 'ano pessoal 5', position: 8 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-6-3'),
    conversaId: toConversaId('c-6'),
    remetenteId: toUsuarioId('u-10'),
    conteudo: 'Odu 7 - Okana pediu firmeza — nao vacila',
    createdAt: '2026-06-29T17:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-10'), toUsuarioId('u-6')]),
    status: 'delivered',
    sacredHits: Object.freeze([
      { term: 'Okana', slug: 'odu-okana', tradicao: 'ifa', matched: 'Okana', position: 9 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-6-4'),
    conversaId: toConversaId('c-6'),
    remetenteId: toUsuarioId('u-10'),
    conteudo: 'Hoje o Odu 7 - Okana pediu firmeza',
    createdAt: '2026-06-29T18:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-10')]),
    status: 'sent',
    sacredHits: Object.freeze([]) as ReadonlyArray<SacredHit>,
  },
  // c-7 — Ananda (Tantra)
  {
    id: toMensagemId('m-7-1'),
    conversaId: toConversaId('c-7'),
    remetenteId: toUsuarioId('u-7'),
    conteudo: 'Joana, hoje a pratica foi de Sahasrara — coroa',
    createdAt: '2026-06-28T18:00:00.000Z',
    mentions: Object.freeze([toUsuarioId('u-12')]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-7'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Sahasrara', slug: 'sahasrara', tradicao: 'tantra', matched: 'Sahasrara', position: 32 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-7-2'),
    conversaId: toConversaId('c-7'),
    remetenteId: toUsuarioId('u-7'),
    conteudo: 'Kundalini sobe devagar, sem pressa',
    createdAt: '2026-06-28T22:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-7'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'Kundalini', slug: 'kundalini', tradicao: 'tantra', matched: 'Kundalini', position: 0 },
    ]) as ReadonlyArray<SacredHit>,
  },
  // c-8 — Pai Ogum (Umbanda, archived/muted)
  {
    id: toMensagemId('m-8-1'),
    conversaId: toConversaId('c-8'),
    remetenteId: toUsuarioId('u-3'),
    conteudo: 'A gira de domingo vai ser no terreiro',
    createdAt: '2026-06-25T10:00:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-3'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'gira', slug: 'gira-umbanda', tradicao: 'umbanda', matched: 'gira', position: 2 },
    ]) as ReadonlyArray<SacredHit>,
  },
  {
    id: toMensagemId('m-8-2'),
    conversaId: toConversaId('c-8'),
    remetenteId: toUsuarioId('u-3'),
    conteudo: 'A gira de domingo pede firmeza',
    createdAt: '2026-06-25T12:30:00.000Z',
    mentions: Object.freeze([]),
    replyToId: null,
    readBy: Object.freeze([toUsuarioId('u-3'), toUsuarioId('u-12')]),
    status: 'read',
    sacredHits: Object.freeze([
      { term: 'gira', slug: 'gira-umbanda', tradicao: 'umbanda', matched: 'gira', position: 2 },
    ]) as ReadonlyArray<SacredHit>,
  },
]);

// 28 sample sacred terms (normalized NFD-stripped for matching)
export const SACRED_CATALOG_DM: ReadonlyArray<{ term: string; slug: string; tradicao: Tradicao }> = Object.freeze([
  // Candomble
  { term: 'Mesa Real', slug: 'mesa-real', tradicao: 'candomble' },
  { term: 'Odu', slug: 'odu-nascimento', tradicao: 'candomble' },
  { term: 'Odu de Nascimento', slug: 'odu-nascimento', tradicao: 'candomble' },
  { term: 'Bori', slug: 'bori', tradicao: 'candomble' },
  { term: 'terreiro', slug: 'terreiro', tradicao: 'candomble' },
  { term: 'Oxala', slug: 'oxala', tradicao: 'candomble' },
  { term: 'Iemanja', slug: 'iemanja', tradicao: 'candomble' },
  // Umbanda
  { term: 'gira', slug: 'gira-umbanda', tradicao: 'umbanda' },
  { term: 'Pombagira', slug: 'pombagira', tradicao: 'umbanda' },
  { term: 'Caboclo', slug: 'caboclo', tradicao: 'umbanda' },
  // Ifa
  { term: 'Okana', slug: 'odu-okana', tradicao: 'ifa' },
  { term: 'Ifa', slug: 'ifa', tradicao: 'ifa' },
  { term: 'Babalao', slug: 'babalao', tradicao: 'ifa' },
  // Cabala
  { term: 'Tiferet', slug: 'tiferet', tradicao: 'cabala' },
  { term: 'sefira', slug: 'sefirot', tradicao: 'cabala' },
  { term: 'Keter', slug: 'keter', tradicao: 'cabala' },
  { term: 'meditacao', slug: 'meditacao-cabala', tradicao: 'cabala' },
  // Astrologia
  { term: 'Carta Natal', slug: 'carta-natal', tradicao: 'astrologia' },
  { term: 'mapa astral', slug: 'mapa-astral', tradicao: 'astrologia' },
  { term: 'Lua', slug: 'astro-lua', tradicao: 'astrologia' },
  { term: 'Sol', slug: 'astro-sol', tradicao: 'astrologia' },
  { term: 'Cancer', slug: 'astro-cancer', tradicao: 'astrologia' },
  { term: 'ano pessoal', slug: 'ano-pessoal', tradicao: 'astrologia' },
  // Tantra
  { term: 'Kundalini', slug: 'kundalini', tradicao: 'tantra' },
  { term: 'Sahasrara', slug: 'sahasrara', tradicao: 'tantra' },
  // Tarot
  { term: 'Tarot', slug: 'tarot-mago', tradicao: 'tarot' },
  { term: 'Cruz Celta', slug: 'cruz-celta', tradicao: 'tarot' },
  { term: 'Louco', slug: 'tarot-louco', tradicao: 'tarot' },
]);

// ============================================================================
// SACRED DETECTION (NFD-normalized substring, cycle 79/82 lesson)
// ============================================================================

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export interface DetectedSacredHit {
  readonly term: string;
  readonly slug: string;
  readonly tradicao: Tradicao;
  readonly matched: string;
  readonly position: number;
}

export function detectSacredTermsInMessage(content: string): DetectedSacredHit[] {
  if (!content || content.length === 0) return [];
  const normContent = normalize(content);
  const hits: DetectedSacredHit[] = [];
  for (const entry of SACRED_CATALOG_DM) {
    const normTerm = normalize(entry.term);
    let pos = 0;
    while (true) {
      const idx = normContent.indexOf(normTerm, pos);
      if (idx < 0) break;
      hits.push({
        term: entry.term,
        slug: entry.slug,
        tradicao: entry.tradicao,
        matched: content.slice(idx, idx + normTerm.length),
        position: idx,
      });
      pos = idx + normTerm.length;
    }
  }
  // dedup by slug@position
  const seen = new Set<string>();
  return hits.filter((h) => {
    const key = `${h.slug}@${h.position}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// @MENTION EXTRACTION (from message text)
// ============================================================================

export function extractMentions(
  content: string,
  usuariosConhecidos: ReadonlyArray<Usuario>
): ReadonlyArray<UsuarioId> {
  if (!content || content.length === 0) return [];
  const norm = normalize(content);
  const handles = new Map<string, UsuarioId>();
  for (const u of usuariosConhecidos) {
    handles.set(normalize(u.handle), u.id);
    handles.set(normalize(u.nome), u.id);
  }
  const found = new Set<UsuarioId>();
  for (const [key, id] of handles) {
    let pos = 0;
    while (true) {
      const idx = norm.indexOf(key, pos);
      if (idx < 0) break;
      found.add(id);
      pos = idx + key.length;
    }
  }
  return Array.from(found);
}

// ============================================================================
// ADAPTER — pure in-memory DM surface (mirrors W68 dm-engine)
// ============================================================================

export interface DmAdapter {
  listConversas(usuarioId: UsuarioId, opts?: { incluirArquivadas?: boolean; apenasComUnread?: boolean }): ReadonlyArray<Conversa>;
  getConversa(conversaId: ConversaId): Conversa | null;
  getMensagens(conversaId: ConversaId, opts?: { limit?: number }): ReadonlyArray<Mensagem>;
  sendMensagem(args: { conversaId: ConversaId; remetenteId: UsuarioId; conteudo: string; mentions?: ReadonlyArray<UsuarioId>; replyToId?: MensagemId | null }): Mensagem;
  markAsRead(args: { conversaId: ConversaId; usuarioId: UsuarioId }): Conversa;
  markConversaMutada(args: { conversaId: ConversaId; usuarioId: UsuarioId; mutada: boolean }): Conversa;
  archiveConversa(args: { conversaId: ConversaId; usuarioId: UsuarioId }): Conversa;
  unarchiveConversa(args: { conversaId: ConversaId; usuarioId: UsuarioId }): Conversa;
  searchConversas(args: { usuarioId: UsuarioId; query: string }): ReadonlyArray<Conversa>;
  getOutrosParticipantes(conversaId: ConversaId, viewerId: UsuarioId): ReadonlyArray<Usuario>;
  getUsuario(id: UsuarioId): Usuario | null;
  // LGPD consent
  getConsentStatus(usuarioId: UsuarioId): ConsentStatus;
  acceptConsent(usuarioId: UsuarioId, scopes: ReadonlyArray<'message_read' | 'message_send' | 'presence'>): ConsentRecord;
  declineConsent(usuarioId: UsuarioId): void;
  hasConsent(usuarioId: UsuarioId, scope: 'message_read' | 'message_send' | 'presence'): boolean;
}

export function createInMemoryDmAdapter(): DmAdapter {
  const conversas: Conversa[] = SAMPLE_CONVERSAS.map((c: Conversa) => {
    return {
      ...c,
      topicosTradicao: c.topicosTradicao as ReadonlyArray<Tradicao>,
    };
  });
  const mensagens: Mensagem[] = SAMPLE_MENSAGENS.map((m: Mensagem) => {
    return {
      ...m,
      sacredHits: m.sacredHits as ReadonlyArray<SacredHit>,
    };
  });
  const usuarios: Usuario[] = SAMPLE_USUARIOS.map((u: Usuario) => ({ ...u }));
  const consents: Map<string, ConsentRecord> = new Map();
  const declineFlags: Set<string> = new Set();
  let msgCounter = 1000;

  function otherParticipant(conversa: Conversa, viewerId: UsuarioId): Usuario | null {
    const otherId = conversa.participanteIds.find((id) => id !== viewerId);
    if (!otherId) return null;
    return usuarios.find((u) => u.id === otherId) ?? null;
  }

  function nextMsgId(): MensagemId {
    msgCounter += 1;
    return toMensagemId('m-new-' + msgCounter.toString(36));
  }

  function previewOf(content: string): string {
    if (content.length <= 80) return content;
    return content.slice(0, 79) + '\u2026';
  }

  function recuentaUnread(conversa: Conversa, viewerId: UsuarioId): number {
    const msgs = mensagens.filter((m) => m.conversaId === conversa.id);
    let count = 0;
    for (const m of msgs) {
      if (m.remetenteId !== viewerId && !m.readBy.includes(viewerId)) {
        count += 1;
      }
    }
    return count;
  }

  return {
    listConversas(usuarioId, opts) {
      const incluir = opts?.incluirArquivadas ?? false;
      const apenasUnread = opts?.apenasComUnread ?? false;
      let result: Conversa[] = [];
      for (const c of conversas) {
        if (!c.participanteIds.includes(usuarioId)) continue;
        if (!incluir && c.isArchived) continue;
        if (apenasUnread && recuentaUnread(c, usuarioId) === 0) continue;
        result.push(c);
      }
      result.sort((a, b) => (a.ultimaMensagemEm < b.ultimaMensagemEm ? 1 : -1));
      return Object.freeze(result.slice());
    },

    getConversa(conversaId) {
      return conversas.find((c) => c.id === conversaId) ?? null;
    },

    getMensagens(conversaId, opts) {
      const limit = opts?.limit ?? 100;
      const all = mensagens
        .filter((m) => m.conversaId === conversaId)
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
      return Object.freeze(all.slice(-limit));
    },

    sendMensagem(args) {
      const conversa = conversas.find((c) => c.id === args.conversaId);
      if (!conversa) throw new Error('CONVERSA_NOT_FOUND');
      if (!conversa.participanteIds.includes(args.remetenteId)) {
        throw new Error('NOT_PARTICIPANT');
      }
      const trimmed = args.conteudo.trim();
      if (trimmed.length === 0) throw new Error('EMPTY_MESSAGE');
      if (trimmed.length > 4000) throw new Error('MESSAGE_TOO_LONG');
      const detected = detectSacredTermsInMessage(trimmed);
      const mentioned = args.mentions ?? extractMentions(trimmed, usuarios);
      const now = new Date().toISOString();
      const id = nextMsgId();
      const msg: Mensagem = Object.freeze({
        id,
        conversaId: args.conversaId,
        remetenteId: args.remetenteId,
        conteudo: trimmed,
        createdAt: now,
        mentions: Object.freeze(mentioned.slice()),
        replyToId: args.replyToId ?? null,
        readBy: Object.freeze([args.remetenteId]),
        status: 'sent' as StatusMensagem,
        sacredHits: Object.freeze(detected.slice()) as ReadonlyArray<SacredHit>,
      });
      mensagens.push(msg);
      // Update conversa last message
      const idx = conversas.indexOf(conversa);
      if (idx >= 0) {
        const updated: Conversa = Object.freeze({
          ...conversa,
          ultimaMensagemEm: now,
          ultimaMensagemPreview: previewOf(trimmed),
          unreadCount: conversa.participanteIds.length - 1,
        });
        conversas[idx] = updated;
      }
      return msg;
    },

    markAsRead(args) {
      const conversa = conversas.find((c) => c.id === args.conversaId);
      if (!conversa) throw new Error('CONVERSA_NOT_FOUND');
      // Mark all messages in conversa as read by user
      for (let i = 0; i < mensagens.length; i += 1) {
        const m = mensagens[i]!;
        if (m.conversaId !== args.conversaId) continue;
        if (m.remetenteId === args.usuarioId) continue;
        if (!m.readBy.includes(args.usuarioId)) {
          mensagens[i] = Object.freeze({
            ...m,
            readBy: Object.freeze([...m.readBy, args.usuarioId]),
            status: 'read',
          });
        }
      }
      const idx = conversas.indexOf(conversa);
      if (idx >= 0) {
        const updated: Conversa = Object.freeze({
          ...conversa,
          unreadCount: 0,
        });
        conversas[idx] = updated;
        return updated;
      }
      return conversa;
    },

    markConversaMutada(args) {
      const conversa = conversas.find((c) => c.id === args.conversaId);
      if (!conversa) throw new Error('CONVERSA_NOT_FOUND');
      const idx = conversas.indexOf(conversa);
      if (idx < 0) return conversa;
      const updated: Conversa = Object.freeze({
        ...conversa,
        isMuted: args.mutada,
      });
      conversas[idx] = updated;
      return updated;
    },

    archiveConversa(args) {
      const conversa = conversas.find((c) => c.id === args.conversaId);
      if (!conversa) throw new Error('CONVERSA_NOT_FOUND');
      const idx = conversas.indexOf(conversa);
      if (idx < 0) return conversa;
      const updated: Conversa = Object.freeze({
        ...conversa,
        isArchived: true,
      });
      conversas[idx] = updated;
      return updated;
    },

    unarchiveConversa(args) {
      const conversa = conversas.find((c) => c.id === args.conversaId);
      if (!conversa) throw new Error('CONVERSA_NOT_FOUND');
      const idx = conversas.indexOf(conversa);
      if (idx < 0) return conversa;
      const updated: Conversa = Object.freeze({
        ...conversa,
        isArchived: false,
      });
      conversas[idx] = updated;
      return updated;
    },

    searchConversas(args) {
      if (!args.query || args.query.trim().length === 0) return Object.freeze([]);
      const q = normalize(args.query);
      const result: Conversa[] = [];
      for (const c of conversas) {
        if (!c.participanteIds.includes(args.usuarioId)) continue;
        const inPreview = normalize(c.ultimaMensagemPreview).includes(q);
        const inTopicos = c.topicosTradicao.some((t) => normalize(t).includes(q));
        const inTitulo = c.titulo ? normalize(c.titulo).includes(q) : false;
        const other = otherParticipant(c, args.usuarioId);
        const inOtherName = other ? normalize(other.nome).includes(q) : false;
        if (inPreview || inTopicos || inTitulo || inOtherName) {
          result.push(c);
        }
      }
      return Object.freeze(result.slice());
    },

    getOutrosParticipantes(conversaId, viewerId) {
      const conversa = conversas.find((c) => c.id === conversaId);
      if (!conversa) return Object.freeze([]);
      const result: Usuario[] = [];
      for (const id of conversa.participanteIds) {
        if (id === viewerId) continue;
        const u = usuarios.find((x) => x.id === id);
        if (u) result.push(u);
      }
      return Object.freeze(result.slice());
    },

    getUsuario(id) {
      return usuarios.find((u) => u.id === id) ?? null;
    },

    getConsentStatus(usuarioId) {
      const key = String(usuarioId);
      if (declineFlags.has(key)) return 'declined';
      const c = consents.get(key);
      if (!c) return 'unknown';
      return 'accepted';
    },

    acceptConsent(usuarioId, scopes) {
      const key = String(usuarioId);
      declineFlags.delete(key);
      const rec: ConsentRecord = Object.freeze({
        usuarioId,
        aceitoEm: new Date().toISOString(),
        versao: 'lgpd-2026-v1',
        scopes: Object.freeze(scopes.slice()),
      });
      consents.set(key, rec);
      return rec;
    },

    declineConsent(usuarioId) {
      const key = String(usuarioId);
      consents.delete(key);
      declineFlags.add(key);
    },

    hasConsent(usuarioId, scope) {
      const key = String(usuarioId);
      const c = consents.get(key);
      if (!c) return false;
      return c.scopes.includes(scope);
    },
  };
}

// ============================================================================
// DEFAULT CURRENT-USER ID — used by the chatReducer and pages
// ============================================================================

export const DEFAULT_CURRENT_USER_ID: UsuarioId = toUsuarioId('u-12');