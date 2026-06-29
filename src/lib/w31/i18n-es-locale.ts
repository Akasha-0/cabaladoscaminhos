/**
 * w31/i18n-es-locale
 *
 * Spanish (es) locale bundle. Mirrors w30/i18n-en-locale but with
 * culturally appropriate translations for the Akasha Portal. Covers
 * the 12 namespaces used across the app.
 *
 * PURE module: constant object. No imports beyond w30's locale type
 * (when consumed together).
 */

export type EsTranslationValue = string;
export type EsNamespace = string;
export type EsTranslations = Record<EsNamespace, Record<string, EsTranslationValue>>;

export const esLocale: EsTranslations = {
  common: {
    appName: "Akasha Portal",
    tagline: "Tu mapa vivo de las tradiciones",
    loading: "Cargando…",
    save: "Guardar",
    cancel: "Cancelar",
    close: "Cerrar",
    yes: "Sí",
    no: "No",
    back: "Volver",
    next: "Siguiente",
    done: "Listo",
    edit: "Editar",
    delete: "Eliminar",
    share: "Compartir",
    search: "Buscar",
    more: "Más",
    less: "Menos",
    seeAll: "Ver todo",
  },
  nav: {
    home: "Inicio",
    feed: "Comunidad",
    events: "Encuentros",
    marketplace: "Mercado",
    library: "Biblioteca",
    profile: "Perfil",
    settings: "Ajustes",
    voice: "Akasha habla",
    notifications: "Notificaciones",
  },
  auth: {
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    signOut: "Cerrar sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    forgotPassword: "Olvidé mi contraseña",
    verifyEmail: "Verifica tu correo",
    verificationSent: "Te enviamos un enlace de verificación",
  },
  profile: {
    editProfile: "Editar perfil",
    displayName: "¿Cómo podemos llamarte?",
    bio: "Sobre ti",
    traditions: "Tradiciones que caminas",
    birthDate: "Fecha de nacimiento",
    birthTime: "Hora de nacimiento",
    birthPlace: "Lugar de nacimiento",
    publicProfile: "Perfil público",
  },
  feed: {
    newPost: "Nueva publicación",
    whatsHappening: "¿Qué quieres compartir?",
    publish: "Publicar",
    comment: "Comentar",
    reply: "Responder",
    like: "Me toca",
    liked: "Te toca",
    share: "Compartir",
    save: "Guardar",
    pinnedPost: "Publicación fijada",
    threadAncestor: "Ver hilo completo",
  },
  events: {
    upcoming: "Próximos encuentros",
    past: "Encuentros pasados",
    live: "En vivo ahora",
    join: "Unirme",
    register: "Reservar plaza",
    facilitator: "Guía",
    schedule: "Agenda",
    location: "Lugar",
    online: "En línea",
    inPerson: "Presencial",
    hybrid: "Híbrido",
    soldOut: "Agotado",
    free: "Gratuito",
  },
  marketplace: {
    title: "Mercado de consultas y prácticas",
    consultations: "Consultas",
    practices: "Prácticas",
    workshops: "Talleres",
    book: "Reservar",
    duration: "Duración",
    price: "Valor",
    guide: "Guía",
    reviews: "Testimonios",
    about: "Sobre la práctica",
  },
  community: {
    groups: "Círculos",
    mentors: "Mentores",
    circles: "Ruedas",
    joinCircle: "Unirme a la rueda",
    leaveCircle: "Salir de la rueda",
    invite: "Invitar",
  },
  voice: {
    startListening: "Empezar a escuchar",
    stopListening: "Dejar de escuchar",
    speaking: "Akasha está hablando…",
    ready: "Akasha lista",
    paused: "Akasha en pausa",
    chooseVoice: "Elegir voz",
  },
  notifications: {
    mentioned: "te mencionó en un comentario",
    newFollower: "comenzó a seguirte",
    eventReminder: "Recordatorio de encuentro",
    bookingConfirmed: "Reserva confirmada",
    newMessage: "Nuevo mensaje",
  },
  errors: {
    generic: "Algo salió mal. Inténtalo de nuevo.",
    network: "Sin conexión. Comprueba tu red.",
    notFound: "No encontramos esa página.",
    unauthorized: "Inicia sesión para continuar.",
    forbidden: "No tienes permiso para esto.",
    rateLimited: "Demasiados intentos. Espera un momento.",
  },
  a11y: {
    skipToContent: "Saltar al contenido",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    increaseFont: "Aumentar texto",
    decreaseFont: "Reducir texto",
    highContrast: "Alto contraste",
    screenReader: "Lector de pantalla",
  },
};

export default esLocale;

export function esLocaleKeyCount(): number {
  let n = 0;
  for (const ns of Object.values(esLocale)) n += Object.keys(ns).length;
  return n;
}

export function esT(ns: EsNamespace, key: string, fallback = ""): string {
  return esLocale[ns]?.[key] ?? fallback;
}
