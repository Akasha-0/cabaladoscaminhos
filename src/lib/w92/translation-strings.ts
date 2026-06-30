// ============================================================================
// Wave 92 — Translation Strings (30 most-shown UI strings × 3 locales)
// ============================================================================
// PT-BR é a fonte da verdade. EN/ES são curados à mão para falantes nativos
// de prática espiritual, NÃO tradução automática.
//
// TERMOS SAGRADOS — preservados verbatim em todos os locales:
//   • "orixás"  → "orixás" (NÃO "orishas" / "orishás" — grafia portuguesa)
//   • "axé"     → "axé"    (NÃO "ashé" / "axe" — termo yorubá)
//   • "entidades" → "entidades" (vocabulário de Umbanda/Candomblé)
//   • "Odu"     → "Odu"    (sistema de Ifá)
//   • "Cigano Ramiro" → nome próprio, NÃO traduzir
//   • "Akasha"  → nome próprio, NÃO traduzir
//   • "Candomblé", "Umbanda", "Ifá", "Cabala" → grafia local de cada prática
//
// Convenções:
//   • "n" usado em plurais → "{n} comentários" / "{n} comments" / "{n} comentarios"
//   • Variáveis em chaves simples: {name}, {n}, {group}
//   • Strings curtas (mobile-first 44px targets)
// ============================================================================

/**
 * Locales suportados pelo tooling W92.
 * Mantido alinhado com `src/lib/i18n/index.ts` (availableLocales).
 */
export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Shape do objeto de strings.
 * Cada chave do PRIMEIRO nível é uma string registrada; cada uma DEVE
 * ter as 3 locales. O type-check em `translation-tooling.ts` valida isso.
 */
type StringEntry = { 'pt-BR': string; en: string; es: string };

/**
 * As 30 strings mais exibidas da UI, curadas à mão.
 *
 * Critério de seleção (W92):
 *   1. Greetings / saudações (3)
 *   2. Nav labels (4)
 *   3. Botões de ação primária (5)
 *   4. Estados de erro (4)
 *   5. Loading / empty states (3)
 *   6. Plural counters (3 — comments, likes, unread)
 *   7. Time-relative (3 — justNow, minutesAgo, hoursAgo)
 *   8. Acessibilidade / ARIA (3)
 *   9. Notifications (2)
 *   10. Sacred-tradition copy (2 — preserva Odu / orixás verbatim)
 */
export const STRINGS = {
  // -----------------------------------------------------------------------
  // 1. Greetings (3)
  // -----------------------------------------------------------------------
  'greeting.welcome': {
    'pt-BR': 'Bem-vindo(a) ao Akasha',
    en: 'Welcome to Akasha',
    es: 'Bienvenido(a) a Akasha',
  },
  'greeting.goodMorning': {
    'pt-BR': 'Bom dia, axé',
    en: 'Good morning, axé',
    es: 'Buenos días, axé',
  },
  'greeting.farewell': {
    'pt-BR': 'Até logo — use com reverência',
    en: 'See you soon — use with reverence',
    es: 'Hasta luego — úsalo con reverencia',
  },

  // -----------------------------------------------------------------------
  // 2. Nav labels (4)
  // -----------------------------------------------------------------------
  'nav.home': {
    'pt-BR': 'Feed',
    en: 'Feed',
    es: 'Inicio',
  },
  'nav.explore': {
    'pt-BR': 'Explorar',
    en: 'Explore',
    es: 'Explorar',
  },
  'nav.library': {
    'pt-BR': 'Biblioteca',
    en: 'Library',
    es: 'Biblioteca',
  },
  'nav.akashic': {
    'pt-BR': 'Akasha IA',
    en: 'Akasha AI',
    es: 'Akasha IA',
  },

  // -----------------------------------------------------------------------
  // 3. Primary action buttons (5)
  // -----------------------------------------------------------------------
  'button.publish': {
    'pt-BR': 'Publicar',
    en: 'Publish',
    es: 'Publicar',
  },
  'button.save': {
    'pt-BR': 'Salvar',
    en: 'Save',
    es: 'Guardar',
  },
  'button.cancel': {
    'pt-BR': 'Cancelar',
    en: 'Cancel',
    es: 'Cancelar',
  },
  'button.confirm': {
    'pt-BR': 'Confirmar',
    en: 'Confirm',
    es: 'Confirmar',
  },
  'button.share': {
    'pt-BR': 'Compartilhar',
    en: 'Share',
    es: 'Compartir',
  },

  // -----------------------------------------------------------------------
  // 4. Error messages (4)
  // -----------------------------------------------------------------------
  'error.network': {
    'pt-BR': 'Sem conexão. Verifique sua internet.',
    en: 'No connection. Check your internet.',
    es: 'Sin conexión. Verifica tu internet.',
  },
  'error.generic': {
    'pt-BR': 'Algo deu errado. Tente novamente.',
    en: 'Something went wrong. Please try again.',
    es: 'Algo salió mal. Inténtalo de nuevo.',
  },
  'error.unauthorized': {
    'pt-BR': 'Faça login para continuar',
    en: 'Please sign in to continue',
    es: 'Inicia sesión para continuar',
  },
  'error.notFound': {
    'pt-BR': 'Conteúdo não encontrado',
    en: 'Content not found',
    es: 'Contenido no encontrado',
  },

  // -----------------------------------------------------------------------
  // 5. Loading / empty states (3)
  // -----------------------------------------------------------------------
  'state.loading': {
    'pt-BR': 'Carregando…',
    en: 'Loading…',
    es: 'Cargando…',
  },
  'state.empty.feed': {
    'pt-BR': 'Nenhum post ainda — seja o primeiro a compartilhar',
    en: 'No posts yet — be the first to share',
    es: 'Aún no hay publicaciones — sé el primero en compartir',
  },
  'state.empty.notifications': {
    'pt-BR': 'Nenhuma notificação por aqui',
    en: 'No notifications here',
    es: 'No hay notificaciones por aquí',
  },

  // -----------------------------------------------------------------------
  // 6. Plural counters (3) — variable {n}
  // -----------------------------------------------------------------------
  'counter.comments': {
    'pt-BR': '{n} comentário | {n} comentários',
    en: '{n} comment | {n} comments',
    es: '{n} comentario | {n} comentarios',
  },
  'counter.likes': {
    'pt-BR': '{n} curtida | {n} curtidas',
    en: '{n} like | {n} likes',
    es: '{n} me gusta | {n} me gusta',
  },
  'counter.unreadNotifications': {
    'pt-BR': '{n} não lida | {n} não lidas',
    en: '{n} unread | {n} unread',
    es: '{n} no leída | {n} no leídas',
  },

  // -----------------------------------------------------------------------
  // 7. Time-relative (3) — variable {n} when needed
  // -----------------------------------------------------------------------
  'time.justNow': {
    'pt-BR': 'agora',
    en: 'just now',
    es: 'ahora',
  },
  'time.minutesAgo': {
    'pt-BR': 'há {n} min',
    en: '{n} min ago',
    es: 'hace {n} min',
  },
  'time.hoursAgo': {
    'pt-BR': 'há {n} h',
    en: '{n} h ago',
    es: 'hace {n} h',
  },

  // -----------------------------------------------------------------------
  // 8. Acessibilidade / ARIA (3)
  // -----------------------------------------------------------------------
  'aria.closeMenu': {
    'pt-BR': 'Fechar menu',
    en: 'Close menu',
    es: 'Cerrar menú',
  },
  'aria.openSearch': {
    'pt-BR': 'Abrir busca',
    en: 'Open search',
    es: 'Abrir búsqueda',
  },
  'aria.currentLocale': {
    'pt-BR': 'Idioma ativo: {locale}',
    en: 'Active language: {locale}',
    es: 'Idioma activo: {locale}',
  },

  // -----------------------------------------------------------------------
  // 9. Notifications (2) — variable {name}
  // -----------------------------------------------------------------------
  'notification.newLike': {
    'pt-BR': '{name} curtiu seu post',
    en: '{name} liked your post',
    es: 'A {name} le gustó tu publicación',
  },
  'notification.newFollow': {
    'pt-BR': '{name} começou a te seguir',
    en: '{name} started following you',
    es: '{name} comenzó a seguirte',
  },

  // -----------------------------------------------------------------------
  // 10. Sacred-tradition copy (2) — preserves Odu / orixás verbatim
  // -----------------------------------------------------------------------
  'tradition.oduPrompt': {
    'pt-BR': 'Seu Odu de Nascimento revela caminhos',
    en: 'Your Birth Odu reveals paths',
    es: 'Tu Odu de Nacimiento revela caminos',
  },
  'tradition.orixaGreeting': {
    'pt-BR': 'Saudações aos orixás',
    en: 'Greetings to the orixás',
    es: 'Saludos a los orixás',
  },

  // -----------------------------------------------------------------------
  // 11. Status / feedback messages (2)
  // -----------------------------------------------------------------------
  'status.saved': {
    'pt-BR': 'Salvo com sucesso',
    en: 'Saved successfully',
    es: 'Guardado con éxito',
  },
  'status.deleted': {
    'pt-BR': 'Removido',
    en: 'Removed',
    es: 'Eliminado',
  },

  // -----------------------------------------------------------------------
  // 12. Acessibilidade extra (1) — screen reader para estados dinâmicos
  // -----------------------------------------------------------------------
  'aria.postsCount': {
    'pt-BR': '{n} posts no feed',
    en: '{n} posts in feed',
    es: '{n} publicaciones en el feed',
  },

  // -----------------------------------------------------------------------
  // 13. Privacy / consent (2) — LGPD
  // -----------------------------------------------------------------------
  'consent.cookiesTitle': {
    'pt-BR': 'Cookies e privacidade',
    en: 'Cookies and privacy',
    es: 'Cookies y privacidad',
  },
  'consent.cookiesMessage': {
    'pt-BR': 'Usamos cookies essenciais para o funcionamento da comunidade. Detalhes na política de privacidade.',
    en: 'We use essential cookies to operate the community. See the privacy policy for details.',
    es: 'Usamos cookies esenciales para operar la comunidad. Consulta la política de privacidad.',
  },

  // -----------------------------------------------------------------------
  // 14. Auth (2) — esqueci senha / sessão
  // -----------------------------------------------------------------------
  'auth.recoverEmailSent': {
    'pt-BR': 'Enviamos um link de recuperação para seu e-mail',
    en: 'We sent a recovery link to your email',
    es: 'Enviamos un enlace de recuperación a tu correo',
  },
  'auth.welcomeBack': {
    'pt-BR': 'Bem-vindo(a) de volta',
    en: 'Welcome back',
    es: 'Bienvenido(a) de nuevo',
  },

  // -----------------------------------------------------------------------
  // 15. Content moderation (2) — positivo-only
  // -----------------------------------------------------------------------
  'moderation.thankYou': {
    'pt-BR': 'Obrigado por ajudar a manter a comunidade saudável',
    en: 'Thank you for helping keep the community healthy',
    es: 'Gracias por ayudar a mantener la comunidad sana',
  },
  'moderation.underReview': {
    'pt-BR': 'Conteúdo em análise pela equipe de curadoria',
    en: 'Content under review by the curation team',
    es: 'Contenido en revisión por el equipo de curación',
  },
} as const satisfies Record<string, StringEntry>;

/**
 * Tipo derivado das chaves do objeto STRINGS.
 * Garante que só chaves registradas sejam usadas no `t()`.
 * (Branded via símbolo de tipo único — ver translation-tooling.ts.)
 */
export type StringKey = keyof typeof STRINGS;

/**
 * Total de strings curadas (sanity-check usado em testes).
 * Recalculado automaticamente pelo módulo — NÃO hard-coded.
 */
export const STRING_COUNT = Object.keys(STRINGS).length;

/**
 * Sanity-check em tempo de módulo:
 * Se STRINGS cair abaixo de 30 entradas, falha na import.
 * Isso é INTENCIONAL — protege contra regressões silenciosas.
 */
if (Object.keys(STRINGS).length < 30) {
  throw new Error(
    `STRINGS should have at least 30 entries (brief W92-C), found ${Object.keys(STRINGS).length}`,
  );
}
