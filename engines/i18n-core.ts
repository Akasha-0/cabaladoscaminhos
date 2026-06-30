/**
 * i18n-core.ts — Translation table + locale resolution
 *
 * W71-A: PT-BR / EN / ES i18n engine
 * Cycle 60+ pattern: branded types, Object.freeze, frozen records,
 * explicit field declarations (no parameter property shorthand).
 *
 * Public API:
 *   - t(locale, key, vars?)
 *   - setLocale(locale), getLocale()
 *   - hasKey(locale, key)
 *   - Translation table (≥50 keys × 3 locales)
 *
 * Lookup chain (cycle 67 fallback pattern):
 *   locale.table[key] -> pt-BR.table[key] -> key string itself
 *
 * Interpolation: {name} / {count} / {value} style vars.
 */

// ────────────────────────────────────────────────────────────────────
// Branded types (cycle 65 lesson: prevents ID confusion at TSC level)
// ────────────────────────────────────────────────────────────────────

export type Locale = 'pt-BR' | 'en' | 'es';

export type TranslationKey = string & { readonly __brand: 'TranslationKey' };

/** Helper to build a brand-cast key from a literal string. */
export const tk = (k: string): TranslationKey => k as TranslationKey;

// ────────────────────────────────────────────────────────────────────
// Translation table — ≥50 keys × 3 locales
// ────────────────────────────────────────────────────────────────────

type Table = Readonly<Record<Locale, Readonly<Record<string, string>>>>;

const RAW: Table = {
  'pt-BR': {
    // nav
    'nav.home': 'Início',
    'nav.readings': 'Consultas',
    'nav.communities': 'Comunidades',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configurações',

    // common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.welcome': 'Bem-vindo',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.close': 'Fechar',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.today': 'Hoje',
    'common.yesterday': 'Ontem',
    'common.tomorrow': 'Amanhã',

    // reading
    'reading.tarot': 'Tarot',
    'reading.cigano': 'Baralho Cigano',
    'reading.astrology': 'Astrologia',
    'reading.numerology': 'Numerologia',
    'reading.cabala': 'Cabala',
    'reading.orixas': 'Orixás',
    'reading.tantra': 'Tantra',

    // auth
    'auth.login': 'Entrar',
    'auth.signup': 'Cadastrar',
    'auth.logout': 'Sair',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.forgot': 'Esqueci minha senha',

    // errors
    'errors.network': 'Erro de rede. Verifique sua conexão.',
    'errors.unauthorized': 'Não autorizado.',
    'errors.notFound': 'Não encontrado.',
    'errors.serverError': 'Erro no servidor.',
    'errors.validation': 'Verifique os campos.',

    // success
    'success.saved': 'Salvo com sucesso.',
    'success.deleted': 'Excluído com sucesso.',
    'success.updated': 'Atualizado com sucesso.',
    'success.created': 'Criado com sucesso.',

    // time
    'time.now': 'agora',
    'time.minute': 'minuto',
    'time.hour': 'hora',
    'time.day': 'dia',
    'time.week': 'semana',
    'time.month': 'mês',
    'time.year': 'ano',
  },
  en: {
    'nav.home': 'Home',
    'nav.readings': 'Readings',
    'nav.communities': 'Communities',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',

    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.welcome': 'Welcome',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.today': 'Today',
    'common.yesterday': 'Yesterday',
    'common.tomorrow': 'Tomorrow',

    'reading.tarot': 'Tarot',
    'reading.cigano': 'Gypsy Deck',
    'reading.astrology': 'Astrology',
    'reading.numerology': 'Numerology',
    'reading.cabala': 'Kabbalah',
    'reading.orixas': 'Orixás',
    'reading.tantra': 'Tantra',

    'auth.login': 'Log in',
    'auth.signup': 'Sign up',
    'auth.logout': 'Log out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot': 'Forgot my password',

    'errors.network': 'Network error. Check your connection.',
    'errors.unauthorized': 'Unauthorized.',
    'errors.notFound': 'Not found.',
    'errors.serverError': 'Server error.',
    'errors.validation': 'Check the fields.',

    'success.saved': 'Saved successfully.',
    'success.deleted': 'Deleted successfully.',
    'success.updated': 'Updated successfully.',
    'success.created': 'Created successfully.',

    'time.now': 'now',
    'time.minute': 'minute',
    'time.hour': 'hour',
    'time.day': 'day',
    'time.week': 'week',
    'time.month': 'month',
    'time.year': 'year',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.readings': 'Consultas',
    'nav.communities': 'Comunidades',
    'nav.profile': 'Perfil',
    'nav.settings': 'Ajustes',

    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.welcome': 'Bienvenido',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.close': 'Cerrar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.today': 'Hoy',
    'common.yesterday': 'Ayer',
    'common.tomorrow': 'Mañana',

    'reading.tarot': 'Tarot',
    'reading.cigano': 'Baraja Gitana',
    'reading.astrology': 'Astrología',
    'reading.numerology': 'Numerología',
    'reading.cabala': 'Cábala',
    'reading.orixas': 'Orixás',
    'reading.tantra': 'Tantra',

    'auth.login': 'Entrar',
    'auth.signup': 'Registrarse',
    'auth.logout': 'Salir',
    'auth.email': 'Correo',
    'auth.password': 'Contraseña',
    'auth.forgot': 'Olvidé mi contraseña',

    'errors.network': 'Error de red. Verifica tu conexión.',
    'errors.unauthorized': 'No autorizado.',
    'errors.notFound': 'No encontrado.',
    'errors.serverError': 'Error del servidor.',
    'errors.validation': 'Verifica los campos.',

    'success.saved': 'Guardado con éxito.',
    'success.deleted': 'Eliminado con éxito.',
    'success.updated': 'Actualizado con éxito.',
    'success.created': 'Creado con éxito.',

    'time.now': 'ahora',
    'time.minute': 'minuto',
    'time.hour': 'hora',
    'time.day': 'día',
    'time.week': 'semana',
    'time.month': 'mes',
    'time.year': 'año',
  },
};

// Freeze each locale table (cycle 65 lesson: freeze before private fields)
const TABLE: Table = Object.freeze({
  'pt-BR': Object.freeze({ ...RAW['pt-BR'] }),
  en: Object.freeze({ ...RAW.en }),
  es: Object.freeze({ ...RAW.es }),
});

// ────────────────────────────────────────────────────────────────────
// Locale resolution state
// ────────────────────────────────────────────────────────────────────

let currentLocale: Locale = 'pt-BR';

export function setLocale(locale: Locale): void {
  if (locale !== 'pt-BR' && locale !== 'en' && locale !== 'es') {
    throw new Error(`setLocale: invalid locale "${locale}"`);
  }
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

// ────────────────────────────────────────────────────────────────────
// Core translation + interpolation
// ────────────────────────────────────────────────────────────────────

/** Look up a key in the given locale, falling back to pt-BR, then to the key string itself. */
export function t(
  locale: Locale,
  key: TranslationKey,
  vars?: Readonly<Record<string, string | number>>,
): string {
  const rawKey = key as string;
  const localized = TABLE[locale][rawKey];
  const fallback = TABLE['pt-BR'][rawKey];
  const template = localized ?? fallback ?? rawKey;
  if (!vars) return template;
  return interpolate(template, vars);
}

/** Test if a key exists in the given locale (no fallback). */
export function hasKey(locale: Locale, key: TranslationKey): boolean {
  return Object.prototype.hasOwnProperty.call(TABLE[locale], key as string);
}

/** Total keys in the table for a given locale. */
export function countKeys(locale: Locale): number {
  return Object.keys(TABLE[locale]).length;
}

/** All known keys (union of pt-BR keys — pt-BR is canonical). */
export function listKeys(): string[] {
  return Object.keys(TABLE['pt-BR']);
}

// ────────────────────────────────────────────────────────────────────
// Interpolation helpers (cycle 67 canonical)
// ────────────────────────────────────────────────────────────────────

/** Replace {name} / {count} placeholders with var values. */
export function interpolate(
  template: string,
  vars: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      const v = vars[name];
      return v === undefined || v === null ? match : String(v);
    }
    return match;
  });
}

/** Reset module state — used by spec harness. */
export function resetI18nCore(): void {
  currentLocale = 'pt-BR';
}