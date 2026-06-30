// InMemoryMentionsAdapter.ts — 8 sample users across the 7 tradição spectrum.
// Cycle 82 pattern: Object.freeze on every export, branded IDs at construction.

import {
  asMentionHandle,
  asUsuarioId,
  type MentionsAdapter,
  type MentionHandle,
  type Usuario,
  type UsuarioId,
} from './types.ts';
import { matchSuggestions } from './mentions.ts';

function makeUsuario(args: {
  readonly id: string;
  readonly handle: string;
  readonly nome: string;
  readonly tradicao: Usuario['tradicaoPrincipal'];
  readonly bio: string;
}): Usuario {
  return Object.freeze({
    id: asUsuarioId(args.id),
    handle: asMentionHandle(args.handle),
    nome: Object.freeze(args.nome),
    tradicaoPrincipal: args.tradicao,
    bio: Object.freeze(args.bio),
  });
}

export const SAMPLE_USUARIOS: ReadonlyArray<Usuario> = Object.freeze([
  makeUsuario({
    id: 'u-1',
    handle: 'cigano_ramiro',
    nome: 'Cigano Ramiro',
    tradicao: 'cigano',
    bio: 'Fundador do método Cruzamento por Casa.',
  }),
  makeUsuario({
    id: 'u-2',
    handle: 'mae_iya',
    nome: 'Mãe Iyá Omim',
    tradicao: 'candomble',
    bio: 'Yalorixá do terreiro Ilê Axé Opô Afonjá.',
  }),
  makeUsuario({
    id: 'u-3',
    handle: 'pai_ogum',
    nome: 'Pai Ogum de Iansã',
    tradicao: 'umbanda',
    bio: 'Caboclo de Umbanda, entidade de Ogum.',
  }),
  makeUsuario({
    id: 'u-4',
    handle: 'baba_ifa',
    nome: 'Babá Ifá Oluwo',
    tradicao: 'ifa',
    bio: 'Babalorixá de Ifá, Olodumare.',
  }),
  makeUsuario({
    id: 'u-5',
    handle: 'rabino_moshe',
    nome: 'Rabino Moshe Ben David',
    tradicao: 'cabala',
    bio: 'Árvore da Vida, Sefirot, Gematria.',
  }),
  makeUsuario({
    id: 'u-6',
    handle: 'astrologo_stella',
    nome: 'Astróloga Stella Vega',
    tradicao: 'astrologia',
    bio: 'Carta Natal, Trânsitos, Sinastria.',
  }),
  makeUsuario({
    id: 'u-7',
    handle: 'swami_ananda',
    nome: 'Swami Ananda Devi',
    tradicao: 'tantra',
    bio: 'Kundalini, respiração holotrópica.',
  }),
  makeUsuario({
    id: 'u-8',
    handle: 'tarologa_luna',
    nome: 'Taróloga Luna Salles',
    tradicao: 'tarot',
    bio: 'Tarot Marselha, Cruz Celta.',
  }),
]);

export function createInMemoryMentionsAdapter(
  initial?: ReadonlyArray<Usuario>,
): MentionsAdapter {
  const users: Usuario[] = [
    ...(initial ?? SAMPLE_USUARIOS),
  ];

  function findByHandle(h: MentionHandle): Usuario | null {
    for (const u of users) if (u.handle === h) return u;
    return null;
  }

  function findById(id: UsuarioId): Usuario | null {
    for (const u of users) if (u.id === id) return u;
    return null;
  }

  return Object.freeze({
    listActive(): ReadonlyArray<Usuario> {
      return Object.freeze([...users]);
    },
    getByHandle(handle: MentionHandle): Usuario | null {
      return findByHandle(handle);
    },
    getById(id: UsuarioId): Usuario | null {
      return findById(id);
    },
    search(prefix: string, limit: number = 6): ReadonlyArray<Usuario> {
      return matchSuggestions(prefix, users, limit).map((m) => m.usuario);
    },
  });
}

export const defaultMentionsAdapter: MentionsAdapter =
  createInMemoryMentionsAdapter();