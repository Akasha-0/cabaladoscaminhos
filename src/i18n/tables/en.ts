/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — EN TRANSLATION TABLE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * English translations of the canonical PT-BR keys.
 *
 * Sacred-cultural sensitivity (cycle W86-C):
 *   - Sacred terms (sacred.*) are preserved VERBATIM — orixá, caboclo,
 *     babalaô, sefirá, tarô, etc. We DO NOT translate these to "orisha"
 *     or "sephirah" — the practice names travel as-is.
 *   - This is a deliberate choice: each tradição has its OWN vocabulary,
 *     and forcing English cognates erases that identity (cycle W85 lesson).
 *   - If a string mentions a sacred term in body text (e.g. "Concilio de
 *     Orixás"), the Orixá stays untranslated.
 *
 * Parity: every key in pt-BR.ts MUST have a counterpart here. The spec
 * asserts this.
 */

import type { LocaleModule, TranslationTable } from '../types.ts';

const TABLE_RAW: TranslationTable = Object.freeze({
  // ── nav ────────────────────────────────────────────────────────────────
  'nav.home': 'Home',
  'nav.library': 'Library',
  'nav.community': 'Community',
  'nav.akashic': 'Akashic',
  'nav.events': 'Events',
  'nav.profile': 'Profile',
  'nav.settings': 'Settings',
  'nav.signOut': 'Sign out',

  // ── auth ───────────────────────────────────────────────────────────────
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': 'At least 8 characters',
  'auth.displayName': 'Display name',
  'auth.bio': 'Bio',
  'auth.bioPlaceholder': 'Share a bit about your spiritual path',
  'auth.login.title': 'Step into your journey',
  'auth.login.subtitle': 'Access Mesa Real, Akashic records and your library',
  'auth.login.submit': 'Sign in',
  'auth.login.magicLink': 'Send magic link',
  'auth.login.noAccount': "Don't have an account yet?",
  'auth.login.createAccount': 'Create account',
  'auth.signup.title': 'Create your account',
  'auth.signup.step1': 'Identity',
  'auth.signup.step2': 'Tradition',
  'auth.signup.step3': 'Profile',
  'auth.signup.submit': 'Create account',
  'auth.signup.lgpdConsent': 'I agree to the LGPD terms',
  'auth.magicLink.sent': 'Magic link sent to {{email}}',
  'auth.magicLink.checkInbox': 'Check your inbox',
  'auth.error.invalidEmail': 'Invalid email',
  'auth.error.passwordTooShort': 'Password must be at least 8 characters',
  'auth.error.required': 'Required field',
  'auth.error.consentRequired': 'You must accept the LGPD terms',
  'auth.error.network': 'Connection failed — please try again',

  // ── errors ─────────────────────────────────────────────────────────────
  'errors.generic': 'Something went wrong. Try again.',
  'errors.notFound': "We couldn't find this page",
  'errors.unauthorized': 'You need to be signed in',
  'errors.forbidden': 'Access denied',
  'errors.timeout': 'The operation took too long',

  // ── content ────────────────────────────────────────────────────────────
  'content.dailyReading': 'Daily reading',
  'content.mesaReal': 'Mesa Real',
  'content.mesaRealDescription': '36 Baralho Cigano houses crossed with your chart',
  'content.akashaDescription': 'Akashic memories in seconds',
  'content.libraryDescription': 'Articles, practices and tradition studies',
  'content.communityDescription': 'Share your path with fellow practitioners',

  // ── sacred (PRESERVED VERBATIM — do not translate practice names) ──────
  'sacred.orixa': 'Orixá',
  'sacred.caboclo': 'Caboclo',
  'sacred.balabao': 'Babalaô',
  'sacred.sefira': 'Sefirá',
  'sacred.tarot': 'Tarô',
  'sacred.baralhoCigano': 'Baralho Cigano',
  'sacred.mesaReal': 'Mesa Real',
  'sacred.axé': 'Axé',
  'sacred.candomble': 'Candomblé',
  'sacred.umbanda': 'Umbanda',
  'sacred.ifa': 'Ifá',
  'sacred.cabala': 'Cabala',
  'sacred.astrologia': 'Astrologia',
  'sacred.tantra': 'Tantra',

  // ── cta ────────────────────────────────────────────────────────────────
  'cta.start': 'Start',
  'cta.continue': 'Continue',
  'cta.save': 'Save',
  'cta.cancel': 'Cancel',
  'cta.close': 'Close',
  'cta.try': 'Try again',
  'cta.learnMore': 'Learn more',

  // ── settings ───────────────────────────────────────────────────────────
  'settings.title': 'Settings',
  'settings.subtitle': 'Your account preferences',
  'settings.section.account': 'Account',
  'settings.section.privacy': 'Privacy',
  'settings.section.preferences': 'Preferences',

  // ── settings.locale ────────────────────────────────────────────────────
  'settings.locale.title': 'Language',
  'settings.locale.subtitle': 'Choose the interface language',
  'settings.locale.preview': 'Preview',
  'settings.locale.persistNote': 'Your choice is saved on this browser',
  'settings.locale.fallbackNote': 'If a sentence is not translated, we show it in Portuguese',
  'settings.locale.card.pt': 'This is the interface in Portuguese (Brazil)',
  'settings.locale.card.en': 'This is the interface in English',
  'settings.locale.card.es': 'This is the interface in Spanish',
});

export const table: TranslationTable = Object.freeze({ ...TABLE_RAW });

export const locale: 'en' = 'en';
export const name = 'English';

export const en: LocaleModule = Object.freeze({ locale, name, table });

export default en;
