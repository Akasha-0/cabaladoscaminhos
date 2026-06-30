/**
 * Translation Tooling — Spanish Dictionary
 *
 * Mirror of PT-BR keys. ES is the last fallback before PT-BR.
 */
import type { Dictionary } from '../types.ts'

const ES_RAW: Record<string, string> = {
  // ── common UI ───────────────────────────────────────────────────────────────
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.loading': 'Cargando...',
  'common.error': 'Algo salió mal. Inténtalo de nuevo.',
  'common.retry': 'Reintentar',
  'common.back': 'Volver',
  'common.next': 'Siguiente',
  'common.close': 'Cerrar',
  'common.search': 'Buscar',
  'common.yes': 'Sí',
  'common.no': 'No',
  'common.confirm': 'Confirmar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',

  // ── home ────────────────────────────────────────────────────────────────────
  'home.title': 'Cábala de los Caminos',
  'home.subtitle': 'Tradiciones en diálogo',
  'home.welcome': 'Bienvenido/a, {name}',
  'home.featured': 'Destacado',

  // ── mesa real ───────────────────────────────────────────────────────────────
  'mesa.title': 'Mesa Real',
  'mesa.subtitle': '36 casas, infinitos caminos',
  'mesa.casa': 'Casa {n}',
  'mesa.cards_drawn':
    '{count, plural, one {1 carta sacada} other {# cartas sacadas}}',
  'mesa.open_house': 'Abrir Casa {n}',
  'mesa.summary': 'Síntesis de los caminos',

  // ── tradições ───────────────────────────────────────────────────────────────
  'trad.candomble': 'Candomblé',
  'trad.umbanda': 'Umbanda',
  'trad.ifa': 'Ifá',
  'trad.cabala': 'Cábala',
  'trad.astrologia': 'Astrología',
  'trad.tantra': 'Tantra',
  'trad.cigano': 'Gitano',
  'trad.numerologia': 'Numerología',
  'trad.tarot': 'Tarot',

  // ── auth ────────────────────────────────────────────────────────────────────
  'auth.signin': 'Iniciar sesión',
  'auth.signout': 'Cerrar sesión',
  'auth.signup': 'Registrarse',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.forgot_password': 'Olvidé mi contraseña',

  // ── navigation ──────────────────────────────────────────────────────────────
  'nav.home': 'Inicio',
  'nav.mesa': 'Mesa Real',
  'nav.oraculo': 'Oráculo',
  'nav.comunidade': 'Comunidad',
  'nav.perfil': 'Perfil',
  'nav.configuracoes': 'Configuración',

  // ── erros / estados ─────────────────────────────────────────────────────────
  'error.network': 'Sin conexión. Verifica tu internet.',
  'error.unauthorized': 'Necesitas estar autenticado.',
  'error.not_found': 'Página no encontrada',
  'state.empty': 'Nada por aquí aún',
  'state.saved': 'Guardado con éxito',
}

/** Deep-frozen Spanish dictionary. */
export const ES: Dictionary = Object.freeze({ ...ES_RAW })