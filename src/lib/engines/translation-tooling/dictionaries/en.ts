/**
 * Translation Tooling — English Dictionary
 *
 * Mirror of PT-BR keys. EN is in the fallback chain between PT-BR and ES,
 * so missing keys degrade to PT-BR.
 */
import type { Dictionary } from '../types.ts'

const EN_RAW: Record<string, string> = {
  // ── common UI ───────────────────────────────────────────────────────────────
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong. Please try again.',
  'common.retry': 'Try again',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.close': 'Close',
  'common.search': 'Search',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.edit': 'Edit',

  // ── home ────────────────────────────────────────────────────────────────────
  'home.title': 'Kabbalah of the Paths',
  'home.subtitle': 'Traditions in dialogue',
  'home.welcome': 'Welcome, {name}',
  'home.featured': 'Featured',

  // ── mesa real ───────────────────────────────────────────────────────────────
  'mesa.title': 'Royal Table',
  'mesa.subtitle': '36 houses, infinite paths',
  'mesa.casa': 'House {n}',
  'mesa.cards_drawn':
    '{count, plural, one {1 card drawn} other {# cards drawn}}',
  'mesa.open_house': 'Open House {n}',
  'mesa.summary': 'Paths summary',

  // ── tradições ───────────────────────────────────────────────────────────────
  'trad.candomble': 'Candomblé',
  'trad.umbanda': 'Umbanda',
  'trad.ifa': 'Ifá',
  'trad.cabala': 'Kabbalah',
  'trad.astrologia': 'Astrology',
  'trad.tantra': 'Tantra',
  'trad.cigano': 'Romani',
  'trad.numerologia': 'Numerology',
  'trad.tarot': 'Tarot',

  // ── auth ────────────────────────────────────────────────────────────────────
  'auth.signin': 'Sign in',
  'auth.signout': 'Sign out',
  'auth.signup': 'Sign up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.forgot_password': 'Forgot my password',

  // ── navigation ──────────────────────────────────────────────────────────────
  'nav.home': 'Home',
  'nav.mesa': 'Royal Table',
  'nav.oraculo': 'Oracle',
  'nav.comunidade': 'Community',
  'nav.perfil': 'Profile',
  'nav.configuracoes': 'Settings',

  // ── erros / estados ─────────────────────────────────────────────────────────
  'error.network': 'No connection. Check your internet.',
  'error.unauthorized': 'You must be authenticated.',
  'error.not_found': 'Page not found',
  'state.empty': 'Nothing here yet',
  'state.saved': 'Saved successfully',
}

/** Deep-frozen English dictionary. */
export const EN: Dictionary = Object.freeze({ ...EN_RAW })