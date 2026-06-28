// ============================================================================
// ES — Traducción canónica (Wave 18)
// ============================================================================
// Tono: universalista, respetuoso, mobile-first (cadenas cortas).
// Español neutro latino (sin vosotros; "tú" como forma estándar).
// Términos culturales preservados en su idioma original: "Akasha",
// "Cigano Ramiro", "axé", "Odu", "Candomblé", "Umbanda", "Ifá", "Cabala".
// "Numerología Tántrica" se mantiene como nombre propio del sistema.
// ============================================================================

export const es = {
  // -----------------------------------------------------------------------
  // Nav
  // -----------------------------------------------------------------------
  nav: {
    home: 'Inicio',
    explore: 'Explorar',
    library: 'Biblioteca',
    akashic: 'Akasha IA',
    notifications: 'Notificaciones',
    profile: 'Perfil',
    login: 'Iniciar sesión',
    searchOpen: 'Abrir búsqueda',
    searchClose: 'Cerrar búsqueda',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    profileMenu: 'Abrir menú de perfil',
    logoAriaLabel: 'Akasha Portal - Inicio',
    searchPlaceholder: 'Buscar contenido',
    searchHeroPlaceholder: 'Buscar tradiciones, personas, artículos...',
    unreadSuffix: 'no leídas',
    myProfile: 'Mi perfil',
    settings: 'Configuración',
    myMap: 'Mi mapa espiritual',
    logout: 'Cerrar sesión',
  },

  // -----------------------------------------------------------------------
  // Auth
  // -----------------------------------------------------------------------
  auth: {
    signupTitle: 'Crear cuenta',
    signupSubtitle: 'Únete a la comunidad Akasha',
    loginTitle: 'Iniciar sesión',
    loginSubtitle: 'Accede a tu cuenta',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Mínimo 8 caracteres',
    confirmPasswordLabel: 'Confirmar contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    forgotPasswordTitle: 'Recuperar contraseña',
    forgotPasswordDescription: 'Te enviaremos un enlace de recuperación a tu correo.',
    resetLinkSent: 'Enlace de recuperación enviado. Revisa tu bandeja de entrada.',
    fullNameLabel: 'Nombre completo',
    fullNamePlaceholder: '¿Cómo quieres que te llamemos?',
    acceptTerms: 'Acepto los términos de uso y la política de privacidad',
    submitSignup: 'Crear cuenta',
    submitLogin: 'Iniciar sesión',
    submitLogout: 'Cerrar sesión',
    orDivider: 'o',
    continueWithGoogle: 'Continuar con Google',
    continueWithApple: 'Continuar con Apple',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    dontHaveAccount: '¿Aún no tienes cuenta?',
    createOne: 'Crea una',
    signInHere: 'Inicia sesión aquí',
    sessionExpired: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    accountCreated: '¡Cuenta creada con éxito!',
    invalidCredentials: 'Correo o contraseña incorrectos.',
    emailAlreadyInUse: 'Este correo ya está registrado.',
    weakPassword: 'La contraseña debe tener al menos 8 caracteres.',
  },

  // -----------------------------------------------------------------------
  // Onboarding
  // -----------------------------------------------------------------------
  onboarding: {
    welcomeTitle: 'Bienvenido a Akasha',
    welcomeSubtitle: 'Vamos a personalizar tu viaje en pocos pasos',
    stepProgress: 'Paso {current} de {total}',
    stepBasicsTitle: 'Sobre ti',
    stepBasicsSubtitle: 'Cuéntanos un poco sobre ti para comenzar',
    fieldFullName: 'Nombre completo',
    fieldBirthDate: 'Fecha de nacimiento',
    fieldBirthTime: 'Hora de nacimiento',
    fieldBirthPlace: 'Lugar de nacimiento',
    fieldTimeUnknown: 'No sé la hora',
    stepInterestsTitle: 'Tus tradiciones',
    stepInterestsSubtitle: 'Marca las tradiciones que te interesan',
    interestCandomble: 'Candomblé',
    interestUmbanda: 'Umbanda',
    interestIfa: 'Ifá',
    interestCabala: 'Cábala',
    interestAstrologia: 'Astrología',
    interestTantra: 'Numerología Tántrica',
    interestTarot: 'Tarot',
    interestMeditation: 'Meditación',
    stepGoalsTitle: 'Tus objetivos',
    stepGoalsSubtitle: '¿Qué buscas aquí? (elige hasta 3)',
    goalLearn: 'Aprender',
    goalConnect: 'Conectar con practicantes',
    goalEvolve: 'Crecer espiritualmente',
    goalStudy: 'Estudiar a fondo',
    goalCommunity: 'Ser parte de una comunidad',
    stepMapTitle: 'Tu mapa espiritual',
    stepMapSubtitle: 'Vamos a construir tu mapa inicial',
    mapReady: '¡Mapa generado! Mira lo que revela tu camino.',
    skipStep: 'Saltar este paso',
    nextStep: 'Continuar',
    finishOnboarding: 'Comenzar a explorar',
    saveAndExit: 'Guardar y salir',
    errorRequired: 'Campo obligatorio',
    errorDateInFuture: 'La fecha debe estar en el pasado',
    errorInvalidTime: 'Hora inválida',
  },

  // -----------------------------------------------------------------------
  // Feed
  // -----------------------------------------------------------------------
  feed: {
    title: '🌌 Akasha — Comunidad Viva',
    subtitle: 'Comparte, aprende y crece junto a otros',
    filterForYou: 'Para ti',
    filterAll: 'Todo',
    filterFollowing: 'Siguiendo',
    filterGroups: 'Mis grupos',
    filterTrending: 'Tendencias',
    composeDesktopAria: 'Crear nuevo post',
    composeSheetTitle: 'Comparte con la comunidad',
    composeSheetDescription: 'Tu práctica, duda o experiencia puede inspirar a alguien.',
    composeTextPlaceholder: '¿Qué estás pensando?',
    composePublish: 'Publicar',
    composeCancel: 'Cancelar',
    composeAddReference: 'Añadir referencia',
    composeAddTradition: 'Etiquetar tradición',
    emptyTitle: 'Aún no hay posts',
    emptyMessage: 'Sé el primero en compartir algo con la comunidad.',
    emptyForYouTitle: 'Aún no tenemos recomendaciones para ti',
    emptyForYouMessage: 'Sigue tradiciones o únete a grupos para personalizar tu feed ✨',
    loadMore: 'Cargar más',
    loadingMore: 'Cargando…',
    deleteConfirm: '¿Seguro que quieres eliminar este post?',
    deleteFailed: 'Error al eliminar:',
    publishSuccess: '¡Post publicado!',
  },

  // -----------------------------------------------------------------------
  // Post detail
  // -----------------------------------------------------------------------
  postDetail: {
    backToFeed: 'Volver al inicio',
    authorLabel: 'por',
    publishedOn: 'publicado el',
    editTitle: 'Editar post',
    editSave: 'Guardar cambios',
    editCancel: 'Cancelar',
    editSuccess: '¡Post actualizado!',
    commentsTitle: 'Comentarios',
    commentsEmpty: 'Sé el primero en comentar',
    commentPlaceholder: 'Escribe un comentario…',
    commentSubmit: 'Comentar',
    commentDelete: 'Eliminar comentario',
    referencesTitle: 'Referencias citadas',
    shareTitle: 'Compartir post',
    shareCopyLink: 'Copiar enlace',
    shareLinkCopied: '¡Enlace copiado!',
    reportTitle: 'Reportar post',
    reportReasonPlaceholder: '¿Por qué estás reportando este contenido?',
    reportSubmit: 'Enviar reporte',
    reportSuccess: 'Reporte enviado. Gracias por ayudar a mantener la comunidad sana.',
  },

  // -----------------------------------------------------------------------
  // Library
  // -----------------------------------------------------------------------
  library: {
    title: '📚 Biblioteca',
    subtitle: 'Artículos, papers y ensayos curados por la comunidad — clasificados por nivel de evidencia',
    searchPlaceholder: 'Buscar artículos...',
    traditionLabel: 'Tradición:',
    typeLabel: 'Tipo:',
    evidenceLabel: 'Evidencia:',
    filterAll: 'todas',
    filterAllTypes: 'todos',
    countOne: 'artículo',
    countMany: 'artículos',
    sortRecent: 'Reciente',
    sortPopular: 'Popular',
    emptyTitle: 'No hay artículos con estos filtros',
    emptyAction: 'Limpiar filtros',
    articleRead: 'Leer artículo',
    articleSave: 'Guardar',
    articleSaved: 'Guardado',
    articleOpenOriginal: 'Abrir fuente original',
    articleEvidenceHigh: 'Alta evidencia',
    articleEvidenceMedium: 'Media evidencia',
    articleEvidenceLow: 'Baja evidencia',
    articleEvidenceAnecdotal: 'Relato personal',
  },

  // -----------------------------------------------------------------------
  // Akashic chat
  // -----------------------------------------------------------------------
  akashic: {
    chatTitle: 'Akasha IA',
    chatSubtitle: 'Conversa con tu mapa espiritual',
    chatPlaceholder: 'Pregúntale algo a tu mapa...',
    chatSend: 'Enviar',
    chatThinking: 'Consultando los mapas...',
    chatWelcome: '¡Hola! Soy Akasha. Puedo ayudarte a entender mejor tu mapa espiritual.',
    chatSuggestionExplore: 'Háblame sobre mi sexualidad',
    chatSuggestionCareer: '¿Cómo está mi carrera?',
    chatSuggestionFamily: 'Háblame sobre mi familia',
    chatSuggestionHealth: '¿Qué dice mi mapa sobre la salud?',
    chatClearHistory: 'Limpiar conversación',
    chatHistoryCleared: 'Historial limpio',
    chatExportTitle: 'Exportar conversación',
    chatExportCopy: 'Copiar como texto',
    chatExported: 'Conversación copiada',
    chatErrorUnavailable: 'Akasha no está disponible ahora. Intenta de nuevo.',
    chatContextNote: 'Akasha lee tu mapa personal — las respuestas son únicas para ti.',
  },

  // -----------------------------------------------------------------------
  // Notifications
  // -----------------------------------------------------------------------
  notifications: {
    title: 'Notificaciones',
    empty: 'No hay notificaciones por aquí',
    markAllRead: 'Marcar todas como leídas',
    filterAll: 'Todas',
    filterMentions: 'Menciones',
    filterLikes: 'Me gusta',
    filterComments: 'Comentarios',
    filterFollows: 'Seguidores',
    newLike: 'A {name} le gustó tu post',
    newComment: '{name} comentó en tu post',
    newFollow: '{name} comenzó a seguirte',
    newMention: '{name} te mencionó',
    newReply: '{name} respondió a tu comentario',
    groupInvite: '{name} te invitó a {group}',
    timeJustNow: 'ahora',
    timeMinutesAgo: 'hace {n} min',
    timeHoursAgo: 'hace {n} h',
    timeDaysAgo: 'hace {n} d',
  },

  // -----------------------------------------------------------------------
  // PostCard
  // -----------------------------------------------------------------------
  post: {
    like: 'Me gusta',
    unlike: 'Quitar me gusta',
    liked: 'Te gusta',
    comment: 'Comentar',
    share: 'Compartir',
    bookmark: 'Guardar',
    unbookmark: 'Quitar de guardados',
    moreOptions: 'Más opciones',
    edit: 'Editar',
    delete: 'Eliminar',
    report: 'Reportar',
    referencesTitle: 'Referencias científicas',
    groupLabelPrefix: 'publicado en',
    justNow: 'ahora',
    suffixMin: 'min',
    suffixHour: 'h',
    suffixDay: 'd',
    suffixMonth: 'm',
    suffixYear: 'a',
    likeCountOne: '{n} me gusta',
    likeCountMany: '{n} me gusta',
    commentCountOne: '{n} comentario',
    commentCountMany: '{n} comentarios',
  },

  // -----------------------------------------------------------------------
  // Forms validation
  // -----------------------------------------------------------------------
  forms: {
    required: 'Campo obligatorio',
    minLength: 'Mínimo {n} caracteres',
    maxLength: 'Máximo {n} caracteres',
    emailInvalid: 'Correo inválido',
    urlInvalid: 'URL inválida',
    phoneInvalid: 'Teléfono inválido',
    passwordMismatch: 'Las contraseñas no coinciden',
    passwordTooWeak: 'La contraseña es muy débil',
    acceptTermsRequired: 'Debes aceptar los términos',
    dateInFuture: 'La fecha no puede estar en el futuro',
    dateInvalid: 'Fecha inválida',
    numberRange: 'El valor debe estar entre {min} y {max}',
    selectOption: 'Selecciona una opción',
    fileTooBig: 'Archivo demasiado grande (máx {n}MB)',
    fileTypeNotAllowed: 'Tipo de archivo no permitido',
  },

  // -----------------------------------------------------------------------
  // Errors
  // -----------------------------------------------------------------------
  errors: {
    generic: 'Algo salió mal. Inténtalo de nuevo.',
    network: 'Sin conexión. Revisa tu internet.',
    server: 'Error del servidor. Intenta en un momento.',
    timeout: 'La solicitud tardó demasiado. Inténtalo de nuevo.',
    notFound: 'Contenido no encontrado',
    forbidden: 'No tienes permiso para hacer esto',
    unauthorized: 'Inicia sesión para continuar',
    rateLimited: 'Demasiadas solicitudes. Espera un momento.',
    uploadFailed: 'Falló la carga. Inténtalo de nuevo.',
    invalidInput: 'Datos inválidos. Revisa los campos.',
    conflict: 'Este contenido ya existe',
    gone: 'Este contenido ya no está disponible',
    blocked: 'Has sido bloqueado para realizar esta acción',
    maintenanceTitle: 'En mantenimiento',
    maintenanceMessage: 'Estamos cuidando algo. Volvemos pronto.',
    retry: 'Reintentar',
    contactSupport: 'Contactar soporte',
  },

  // -----------------------------------------------------------------------
  // About
  // -----------------------------------------------------------------------
  about: {
    title: 'Sobre Akasha',
    intro:
      'Akasha es un sistema personal del practicante para juegos de oráculo guiados por las manos de axé — lectura cruzada de Numerología Cabalística, Astrología, Numerología Tántrica y Odu de Nacimiento.',
    method:
      'Cada casa de la Mesa Real cruza cuatro mapas: numerología cabalística, astrología, numerología tántrica y odu de nacimiento. La síntesis es quirúrgica, fundamentada y respetuosa con cada tradición.',
    principles:
      'No inventamos correspondencias. No reducimos tradición a algoritmo. No monetizamos el sistema. El valor de intercambio está en la lectura — no en la herramienta.',
    lineage: 'El juego es guiado por la entidad espiritual Cigano Ramiro, de la línea del Oriente.',
    closing: 'Úsalo con reverencia. Úsalo con estudio. Úsalo con responsabilidad.',
  },

  // -----------------------------------------------------------------------
  // Events (W20 — workshops, rituales, círculos, meditaciones)
  // -----------------------------------------------------------------------
  // Mirror of pt-BR `events` namespace. ES copy aligned with PT-BR meaning.
  // ============================================================================
  events: {
    // Página /workshops
    eyebrow: 'Eventos Akasha',
    title: 'Workshops, Rituales y Círculos',
    subtitle:
      'Catálogo completo de experiencias de la comunidad Akasha. Talleres prácticos, rituales guiados, círculos de estudio y meditaciones — en línea y presencial.',
    empty: 'No se encontraron eventos',
    emptyHint: 'Prueba con otro filtro o vuelve pronto.',
    seeOnlineCircles: 'Ver círculos en línea →',
    backToEvents: 'Eventos',
    upcomingCountOne: '{count} evento próximo',
    upcomingCountOther: '{count} eventos próximos',

    // EventCard
    badges: {
      full: 'Lleno',
      closed: 'Cerrado',
      free: 'Gratis',
    },
    card: {
      byHostPrefix: 'por',
    },
    capacity: {
      unlimited: 'Sin límite',
      remainingOne: '{n} plaza',
      remainingOther: '{n} plazas',
    },
    price: {
      free: 'Gratis',
    },
    relativeDay: {
      past: 'ya pasó',
      today: 'hoy',
      tomorrow: 'mañana',
      inDays: 'en {days} días',
      inWeeks: 'en {weeks} sem',
      inMonths: 'en {months} meses',
    },
    cta: {
      seeDetails: 'Ver detalles',
    },

    // Type labels
    types: {
      workshop: 'Workshop',
      ritual: 'Ritual',
      'study-circle': 'Círculo de Estudio',
      meditation: 'Meditación',
    },

    // Tradition labels
    traditions: {
      cabala: 'Cábala',
      ifa: 'Ifá',
      astrologia: 'Astrología',
      tantra: 'Tántrica',
      reiki: 'Reiki',
      meditacao: 'Meditación',
      xamanismo: 'Chamanismo',
      'cristianismo-mistico': 'Cristianismo Místico',
      sufismo: 'Sufismo',
      taoismo: 'Taoísmo',
      umbanda: 'Umbanda',
      candomble: 'Candomblé',
    },

    // EventList — filtros
    filters: {
      searchPlaceholder: 'Buscar eventos, facilitadores...',
      searchAriaLabel: 'Buscar eventos',
      clearSearch: 'Limpiar búsqueda',
      typeLabel: 'Tipo',
      locationLabel: 'Dónde',
      traditionLabel: 'Tradición',
      clearAll: 'Limpiar todo',
      clearFilters: 'Limpiar filtros',
      featured: 'Destacado',
      resultsCountOne: '{count} resultado',
      resultsCountOther: '{count} resultados',
      typeOptions: {
        all: 'Todos',
        workshop: 'Workshops',
        ritual: 'Rituales',
        'study-circle': 'Círculos',
        meditation: 'Meditaciones',
      },
      locationOptions: {
        all: 'Cualquiera',
        online: 'En línea',
        presencial: 'Presencial',
        hybrid: 'Híbrido',
      },
      traditionOptions: {
        all: 'Todas',
      },
    },

    // SignupButton — 4 estados
    signup: {
      login: 'Inicia sesión para participar',
      success: 'Inscripción confirmada ✓',
      full: 'Lleno',
      closed: 'Inscripciones cerradas',
      submitting: 'Confirmando...',
      waitlist: 'Entrar en lista de espera',
      join: 'Participar en el evento',
    },

    // Página /workshops/[slug] — detalle
    detail: {
      notFound: 'Evento no encontrado',
      aboutEvent: 'Sobre este evento',
      aboutHost: 'Sobre el facilitador',
      moreFromHost: 'Más con {name}',
      viewFullProfile: 'Ver perfil completo →',
      photoOfHost: 'Foto de {name}',
      meta: {
        date: 'Fecha',
        duration: 'Duración',
        platform: 'Plataforma',
        location: 'Lugar',
        modality: 'Modalidad',
        spots: 'Plazas',
      },
      duration: {
        minutes: '{min} min',
        hours: '{h}h',
        hoursMinutes: '{h}h{min}min',
      },
      spots: {
        filledCount: 'Lleno ({confirmed}/{capacity})',
        openWithRemaining: '{confirmed}/{capacity} · {remaining} restantes',
        openNoRemaining: '{confirmed}/{capacity}',
      },
      hints: {
        online:
          'Recibirás el enlace de acceso por email tras la inscripción.',
        presencial:
          'Confirmación enviada por email. Trae documento con foto.',
      },
      defaultLocation: {
        online: 'En línea',
        presencial: 'Presencial',
        hybrid: 'Híbrido',
      },
    },
  },

  // -----------------------------------------------------------------------
  // Common
  // -----------------------------------------------------------------------
  common: {
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    open: 'Abrir',
    yes: 'Sí',
    no: 'No',
    loading: 'Cargando…',
    error: 'Error',
    success: 'Éxito',
    optional: 'opcional',
    seeMore: 'Ver más',
    seeLess: 'Ver menos',
    skip: 'Saltar',
    done: 'Listo',
  },
};

export type EsTranslations = typeof es;