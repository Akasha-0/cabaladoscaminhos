/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — ES TRANSLATION TABLE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Spanish translations of the canonical PT-BR keys.
 *
 * Sacred-cultural sensitivity (cycle W86-C):
 *   - Sacred terms (sacred.*) preserved VERBATIM — same rule as EN table.
 *   - "Orixá" stays "Orixá" (not "Orisha"), "Babalaô" stays "Babalaô"
 *     (not "Babalawo") — these are the terms Cabala dos Caminhos uses
 *     and they travel.
 *   - Only UI chrome (nav, cta, errors) is translated.
 *
 * Parity: same keys as pt-BR.ts. The spec asserts this.
 */

import type { LocaleModule, TranslationTable } from '../types.ts';

const TABLE_RAW: TranslationTable = Object.freeze({
  // ── nav ────────────────────────────────────────────────────────────────
  'nav.home': 'Inicio',
  'nav.library': 'Biblioteca',
  'nav.community': 'Comunidad',
  'nav.akashic': 'Akáshico',
  'nav.events': 'Eventos',
  'nav.profile': 'Perfil',
  'nav.settings': 'Configuración',
  'nav.signOut': 'Salir',

  // ── auth ───────────────────────────────────────────────────────────────
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.passwordPlaceholder': 'Mínimo 8 caracteres',
  'auth.displayName': 'Nombre para mostrar',
  'auth.bio': 'Bio',
  'auth.bioPlaceholder': 'Comparte un poco sobre tu camino espiritual',
  'auth.login.title': 'Entra en tu camino',
  'auth.login.subtitle': 'Accede a la Mesa Real, registros akáshicos y tu biblioteca',
  'auth.login.submit': 'Entrar',
  'auth.login.magicLink': 'Enviar enlace mágico',
  'auth.login.noAccount': '¿Aún no tienes cuenta?',
  'auth.login.createAccount': 'Crear cuenta',
  'auth.signup.title': 'Crea tu cuenta',
  'auth.signup.step1': 'Identidad',
  'auth.signup.step2': 'Tradición',
  'auth.signup.step3': 'Perfil',
  'auth.signup.submit': 'Crear cuenta',
  'auth.signup.lgpdConsent': 'Acepto los términos de la LGPD',
  'auth.magicLink.sent': 'Enlace mágico enviado a {{email}}',
  'auth.magicLink.checkInbox': 'Revisa tu bandeja de entrada',
  'auth.error.invalidEmail': 'Correo inválido',
  'auth.error.passwordTooShort': 'La contraseña debe tener al menos 8 caracteres',
  'auth.error.required': 'Campo obligatorio',
  'auth.error.consentRequired': 'Es necesario aceptar los términos de la LGPD',
  'auth.error.network': 'Falló la conexión — inténtalo de nuevo',

  // ── errors ─────────────────────────────────────────────────────────────
  'errors.generic': 'Algo salió mal. Inténtalo de nuevo.',
  'errors.notFound': 'No encontramos esta página',
  'errors.unauthorized': 'Necesitas iniciar sesión',
  'errors.forbidden': 'Acceso denegado',
  'errors.timeout': 'La operación tardó demasiado',

  // ── content ────────────────────────────────────────────────────────────
  'content.dailyReading': 'Lectura del día',
  'content.mesaReal': 'Mesa Real',
  'content.mesaRealDescription': '36 casas del Baralho Cigano cruzadas con tu mapa',
  'content.akashaDescription': 'Memorias akáshicas en segundos',
  'content.libraryDescription': 'Artículos, prácticas y estudios de las tradiciones',
  'content.communityDescription': 'Comparte tu camino con otros practicantes',

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
  'cta.start': 'Comenzar',
  'cta.continue': 'Continuar',
  'cta.save': 'Guardar',
  'cta.cancel': 'Cancelar',
  'cta.close': 'Cerrar',
  'cta.try': 'Intentar de nuevo',
  'cta.learnMore': 'Saber más',

  // ── settings ───────────────────────────────────────────────────────────
  'settings.title': 'Configuración',
  'settings.subtitle': 'Preferencias de tu cuenta',
  'settings.section.account': 'Cuenta',
  'settings.section.privacy': 'Privacidad',
  'settings.section.preferences': 'Preferencias',

  // ── settings.locale ────────────────────────────────────────────────────
  'settings.locale.title': 'Idioma',
  'settings.locale.subtitle': 'Elige el idioma de la interfaz',
  'settings.locale.preview': 'Vista previa',
  'settings.locale.persistNote': 'Tu elección se guarda en este navegador',
  'settings.locale.fallbackNote': 'Si una frase no está traducida, la mostramos en portugués',
  'settings.locale.card.pt': 'Esta es la interfaz en portugués de Brasil',
  'settings.locale.card.en': 'Esta es la interfaz en inglés',
  'settings.locale.card.es': 'Esta es la interfaz en español',
});

export const table: TranslationTable = Object.freeze({ ...TABLE_RAW });

export const locale: 'es' = 'es';
export const name = 'Español';

export const es: LocaleModule = Object.freeze({ locale, name, table });

export default es;
