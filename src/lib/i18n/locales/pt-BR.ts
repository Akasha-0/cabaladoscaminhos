// ============================================================================
// PT-BR — Traduções canônicas (fonte da verdade)
// ============================================================================
// Mantenha chaves semânticas e agrupadas por domínio (nav/feed/library/post/about
// /auth/onboarding/akashic/notifications/forms/errors).
// Componentes importam `ptBR` via `@/lib/i18n` e fazem lookup via `useT()`.
// ============================================================================

export const ptBR = {
  // -----------------------------------------------------------------------
  // Nav (CommunityNav.tsx + BottomNav)
  // -----------------------------------------------------------------------
  nav: {
    home: 'Feed',
    explore: 'Explorar',
    library: 'Biblioteca',
    akashic: 'Akasha IA',
    notifications: 'Notificações',
    profile: 'Perfil',
    login: 'Entrar',
    searchOpen: 'Abrir busca',
    searchClose: 'Fechar busca',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    profileMenu: 'Abrir menu de perfil',
    logoAriaLabel: 'Akasha Portal - Página inicial',
    searchPlaceholder: 'Buscar conteúdo',
    searchHeroPlaceholder: 'Buscar tradições, pessoas, artigos...',
    unreadSuffix: 'não lidas',
    myProfile: 'Meu perfil',
    settings: 'Configurações',
    myMap: 'Meu mapa espiritual',
    logout: 'Sair',
  },

  // -----------------------------------------------------------------------
  // Auth (login / signup / signout / recovery)
  // -----------------------------------------------------------------------
  auth: {
    signupTitle: 'Criar conta',
    signupSubtitle: 'Entre para a comunidade Akasha',
    loginTitle: 'Entrar',
    loginSubtitle: 'Acesse sua conta',
    emailLabel: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    passwordLabel: 'Senha',
    passwordPlaceholder: 'Mínimo 8 caracteres',
    confirmPasswordLabel: 'Confirmar senha',
    forgotPassword: 'Esqueceu a senha?',
    forgotPasswordTitle: 'Recuperar senha',
    forgotPasswordDescription:
      'Enviaremos um link de recuperação para o seu e-mail.',
    resetLinkSent: 'Link de recuperação enviado. Verifique sua caixa de entrada.',
    fullNameLabel: 'Nome completo',
    fullNamePlaceholder: 'Como devemos te chamar?',
    acceptTerms: 'Aceito os termos de uso e a política de privacidade',
    submitSignup: 'Criar conta',
    submitLogin: 'Entrar',
    submitLogout: 'Sair',
    orDivider: 'ou',
    continueWithGoogle: 'Continuar com Google',
    continueWithApple: 'Continuar com Apple',
    alreadyHaveAccount: 'Já tem conta?',
    dontHaveAccount: 'Ainda não tem conta?',
    createOne: 'Criar uma',
    signInHere: 'Entrar aqui',
    sessionExpired: 'Sua sessão expirou. Faça login novamente.',
    accountCreated: 'Conta criada com sucesso!',
    invalidCredentials: 'E-mail ou senha incorretos.',
    emailAlreadyInUse: 'Este e-mail já está cadastrado.',
    weakPassword: 'A senha deve ter pelo menos 8 caracteres.',
  },

  // -----------------------------------------------------------------------
  // Onboarding (4 steps × ~5 fields)
  // -----------------------------------------------------------------------
  onboarding: {
    welcomeTitle: 'Bem-vindo ao Akasha',
    welcomeSubtitle: 'Vamos personalizar sua jornada em poucos passos',
    stepProgress: 'Passo {current} de {total}',
    stepBasicsTitle: 'Sobre você',
    stepBasicsSubtitle: 'Conta um pouco sobre você pra começarmos',
    fieldFullName: 'Nome completo',
    fieldBirthDate: 'Data de nascimento',
    fieldBirthTime: 'Hora de nascimento',
    fieldBirthPlace: 'Local de nascimento',
    fieldTimeUnknown: 'Não sei a hora',
    stepInterestsTitle: 'Suas tradições',
    stepInterestsSubtitle: 'Marque as tradições que te interessam',
    interestCandomble: 'Candomblé',
    interestUmbanda: 'Umbanda',
    interestIfa: 'Ifá',
    interestCabala: 'Cabala',
    interestAstrologia: 'Astrologia',
    interestTantra: 'Numerologia Tântrica',
    interestTarot: 'Tarot',
    interestMeditation: 'Meditação',
    stepGoalsTitle: 'Seus objetivos',
    stepGoalsSubtitle: 'O que você busca aqui? (escolha até 3)',
    goalLearn: 'Aprender',
    goalConnect: 'Conectar com praticantes',
    goalEvolve: 'Evoluir espiritualmente',
    goalStudy: 'Estudar com profundidade',
    goalCommunity: 'Fazer parte de uma comunidade',
    stepMapTitle: 'Seu mapa espiritual',
    stepMapSubtitle: 'Vamos montar seu mapa inicial',
    mapReady: 'Mapa gerado! Veja o que sua jornada revela.',
    skipStep: 'Pular este passo',
    nextStep: 'Continuar',
    finishOnboarding: 'Começar a explorar',
    saveAndExit: 'Salvar e sair',
    errorRequired: 'Campo obrigatório',
    errorDateInFuture: 'Data deve estar no passado',
    errorInvalidTime: 'Hora inválida',
  },

  // -----------------------------------------------------------------------
  // Feed
  // -----------------------------------------------------------------------
  feed: {
    title: '🌌 Akasha — Comunidade Viva',
    subtitle: 'Compartilhe, aprenda e evolua junto',
    filterForYou: 'Para você',
    filterAll: 'Tudo',
    filterFollowing: 'Seguindo',
    filterGroups: 'Meus grupos',
    filterTrending: 'Tendências',
    composeDesktopAria: 'Compor novo post',
    composeSheetTitle: 'Compartilhe com a comunidade',
    composeSheetDescription: 'Sua prática, dúvida ou experiência pode inspirar alguém.',
    composeTextPlaceholder: 'No que você está pensando?',
    composePublish: 'Publicar',
    composeCancel: 'Cancelar',
    composeAddReference: 'Adicionar referência',
    composeAddTradition: 'Marcar tradição',
    emptyTitle: 'Nenhum post ainda',
    emptyMessage: 'Seja o primeiro a compartilhar algo com a comunidade.',
    emptyForYouTitle: 'Ainda não temos recomendações pra você',
    emptyForYouMessage: 'Siga algumas tradições ou entre em grupos pra personalizar seu feed ✨',
    loadMore: 'Carregar mais',
    loadingMore: 'Carregando…',
    deleteConfirm: 'Tem certeza que deseja deletar este post?',
    deleteFailed: 'Falha ao deletar:',
    publishSuccess: 'Post publicado!',
  },

  // -----------------------------------------------------------------------
  // Post detail
  // -----------------------------------------------------------------------
  postDetail: {
    backToFeed: 'Voltar ao feed',
    authorLabel: 'por',
    publishedOn: 'publicado em',
    editTitle: 'Editar post',
    editSave: 'Salvar alterações',
    editCancel: 'Cancelar',
    editSuccess: 'Post atualizado!',
    commentsTitle: 'Comentários',
    commentsEmpty: 'Seja o primeiro a comentar',
    commentPlaceholder: 'Escreva um comentário…',
    commentSubmit: 'Comentar',
    commentDelete: 'Deletar comentário',
    referencesTitle: 'Referências citadas',
    shareTitle: 'Compartilhar post',
    shareCopyLink: 'Copiar link',
    shareLinkCopied: 'Link copiado!',
    reportTitle: 'Reportar post',
    reportReasonPlaceholder: 'Por que você está reportando este conteúdo?',
    reportSubmit: 'Enviar report',
    reportSuccess: 'Report enviado. Obrigado por ajudar a manter a comunidade saudável.',
  },

  // -----------------------------------------------------------------------
  // Library
  // -----------------------------------------------------------------------
  library: {
    title: '📚 Biblioteca',
    subtitle: 'Artigos, papers e ensaios curados pela comunidade — classificados por nível de evidência',
    searchPlaceholder: 'Buscar artigos...',
    traditionLabel: 'Tradição:',
    typeLabel: 'Tipo:',
    evidenceLabel: 'Evidência:',
    filterAll: 'todas',
    filterAllTypes: 'todos',
    countOne: 'artigo',
    countMany: 'artigos',
    sortRecent: 'Recente',
    sortPopular: 'Popular',
    emptyTitle: 'Nenhum artigo encontrado com esses filtros',
    emptyAction: 'Limpar filtros',
    articleRead: 'Ler artigo',
    articleSave: 'Salvar',
    articleSaved: 'Salvo',
    articleOpenOriginal: 'Abrir fonte original',
    articleEvidenceHigh: 'Alta evidência',
    articleEvidenceMedium: 'Média evidência',
    articleEvidenceLow: 'Baixa evidência',
    articleEvidenceAnecdotal: 'Relato pessoal',
  },

  // -----------------------------------------------------------------------
  // Akashic chat (IA conversacional)
  // -----------------------------------------------------------------------
  akashic: {
    chatTitle: 'Akasha IA',
    chatSubtitle: 'Converse com seu mapa espiritual',
    chatPlaceholder: 'Pergunte algo ao seu mapa...',
    chatSend: 'Enviar',
    chatThinking: 'Consultando os mapas...',
    chatWelcome: 'Olá! Sou Akasha. Posso te ajudar a entender melhor seu mapa espiritual.',
    chatSuggestionExplore: 'Me conte sobre minha sexualidade',
    chatSuggestionCareer: 'Como está minha carreira?',
    chatSuggestionFamily: 'Fale sobre minha família',
    chatSuggestionHealth: 'O que meu mapa diz sobre saúde?',
    chatClearHistory: 'Limpar conversa',
    chatHistoryCleared: 'Histórico limpo',
    chatExportTitle: 'Exportar conversa',
    chatExportCopy: 'Copiar como texto',
    chatExported: 'Conversa copiada',
    chatErrorUnavailable: 'Akasha está indisponível no momento. Tente novamente.',
    chatContextNote: 'Akasha lê seu mapa pessoal — respostas são únicas pra você.',
  },

  // -----------------------------------------------------------------------
  // Notifications
  // -----------------------------------------------------------------------
  notifications: {
    title: 'Notificações',
    empty: 'Nenhuma notificação por aqui',
    markAllRead: 'Marcar todas como lidas',
    filterAll: 'Todas',
    filterMentions: 'Menções',
    filterLikes: 'Curtidas',
    filterComments: 'Comentários',
    filterFollows: 'Seguidores',
    newLike: '{name} curtiu seu post',
    newComment: '{name} comentou em seu post',
    newFollow: '{name} começou a te seguir',
    newMention: '{name} mencionou você',
    newReply: '{name} respondeu seu comentário',
    groupInvite: '{name} te convidou para {group}',
    timeJustNow: 'agora',
    timeMinutesAgo: 'há {n} min',
    timeHoursAgo: 'há {n} h',
    timeDaysAgo: 'há {n} d',
  },

  // -----------------------------------------------------------------------
  // PostCard (ações do card)
  // -----------------------------------------------------------------------
  post: {
    like: 'Curtir',
    unlike: 'Descurtir',
    liked: 'Curtido',
    comment: 'Comentar',
    share: 'Compartilhar',
    bookmark: 'Salvar',
    unbookmark: 'Remover dos salvos',
    moreOptions: 'Mais opções',
    edit: 'Editar',
    delete: 'Deletar',
    report: 'Reportar',
    referencesTitle: 'Referências científicas',
    groupLabelPrefix: 'postado em',
    justNow: 'agora',
    suffixMin: 'min',
    suffixHour: 'h',
    suffixDay: 'd',
    suffixMonth: 'm',
    suffixYear: 'a',
    likeCountOne: '{n} curtida',
    likeCountMany: '{n} curtidas',
    commentCountOne: '{n} comentário',
    commentCountMany: '{n} comentários',
  },

  // -----------------------------------------------------------------------
  // Forms (validation messages — genéricos reutilizáveis)
  // -----------------------------------------------------------------------
  forms: {
    required: 'Campo obrigatório',
    minLength: 'Mínimo de {n} caracteres',
    maxLength: 'Máximo de {n} caracteres',
    emailInvalid: 'E-mail inválido',
    urlInvalid: 'URL inválida',
    phoneInvalid: 'Telefone inválido',
    passwordMismatch: 'As senhas não coincidem',
    passwordTooWeak: 'Senha muito fraca',
    acceptTermsRequired: 'Você precisa aceitar os termos',
    dateInFuture: 'Data não pode estar no futuro',
    dateInvalid: 'Data inválida',
    numberRange: 'Valor deve estar entre {min} e {max}',
    selectOption: 'Selecione uma opção',
    fileTooBig: 'Arquivo muito grande (máx {n}MB)',
    fileTypeNotAllowed: 'Tipo de arquivo não permitido',
  },

  // -----------------------------------------------------------------------
  // Errors (genéricos — API, rede, permissões)
  // -----------------------------------------------------------------------
  errors: {
    generic: 'Algo deu errado. Tente novamente.',
    network: 'Sem conexão. Verifique sua internet.',
    server: 'Erro no servidor. Tente em alguns instantes.',
    timeout: 'A requisição demorou demais. Tente novamente.',
    notFound: 'Conteúdo não encontrado',
    forbidden: 'Você não tem permissão para isso',
    unauthorized: 'Faça login para continuar',
    rateLimited: 'Muitas requisições. Aguarde um momento.',
    uploadFailed: 'Falha no upload. Tente novamente.',
    invalidInput: 'Dados inválidos. Revise os campos.',
    conflict: 'Este conteúdo já existe',
    gone: 'Este conteúdo não está mais disponível',
    blocked: 'Você foi bloqueado de realizar esta ação',
    maintenanceTitle: 'Em manutenção',
    maintenanceMessage: 'Estamos cuidando de algo. Voltamos em breve.',
    retry: 'Tentar novamente',
    contactSupport: 'Contatar suporte',
  },

  // -----------------------------------------------------------------------
  // About (página institucional)
  // -----------------------------------------------------------------------
  about: {
    title: 'Sobre o Akasha',
    intro:
      'O Akasha é um sistema pessoal do praticante para jogos de oráculo guiados pelas mãos de axé — leitura cruzada de Numerologia Cabalística, Astrologia, Numerologia Tântrica e Odu de Nascimento.',
    method:
      'Cada casa da Mesa Real cruza quatro mapas: numerologia cabalística, astrologia, numerologia tântrica e odu de nascimento. A síntese é cirúrgica, fundamentada e respeitosa com cada tradição.',
    principles:
      'Não inventamos correspondências. Não reduzimos tradição a algoritmo. Não monetizamos sistema. O valor de troca está na leitura — não na ferramenta.',
    lineage: 'O jogo é guiado pela entidade espiritual Cigano Ramiro, da linha do Oriente.',
    closing: 'Use com reverência. Use com estudo. Use com responsabilidade.',
  },

  // -----------------------------------------------------------------------
  // Events (W20 — workshops, rituais, círculos, meditações)
  // -----------------------------------------------------------------------
  // Cobre /workshops, /workshops/[slug], e componentes:
  //   - EventCard (badges, preço, capacidade, data relativa)
  //   - EventList (filtros, search, featured, empty)
  //   - SignupButton (4 estados: login / sucesso / fechado / cta)
  // Chave plana para types/traditions para lookup via `t('events.types.workshop')`.
  // Pluralização PT-BR: sufixos `One` / `Other` (1 resultado vs N resultados).
  // ============================================================================
  events: {
    // Página /workshops
    eyebrow: 'Eventos Akasha',
    title: 'Workshops, Rituais e Círculos',
    subtitle:
      'Catálogo completo de vivências da comunidade Akasha. ' +
      'Workshops práticos, rituais guiados, círculos de estudo e meditações — online e presencial.',
    empty: 'Nenhum evento encontrado',
    emptyHint: 'Tente outro filtro ou volte em breve.',
    seeOnlineCircles: 'Ver círculos online →',
    backToEvents: 'Eventos',
    // Plural — header da lista
    upcomingCountOne: '{count} evento futuro',
    upcomingCountOther: '{count} eventos futuros',

    // EventCard
    badges: {
      full: 'Lotado',
      closed: 'Fechado',
      free: 'Gratuito',
    },
    card: {
      byHostPrefix: 'por',
    },
    capacity: {
      unlimited: 'Sem limite',
      remainingOne: '{n} vaga',
      remainingOther: '{n} vagas',
    },
    price: {
      free: 'Gratuito',
    },
    relativeDay: {
      past: 'já passou',
      today: 'hoje',
      tomorrow: 'amanhã',
      inDays: 'em {days} dias',
      inWeeks: 'em {weeks} sem',
      inMonths: 'em {months} meses',
    },
    cta: {
      seeDetails: 'Ver detalhes',
    },

    // Type labels (lookup em EventCard)
    types: {
      workshop: 'Workshop',
      ritual: 'Ritual',
      'study-circle': 'Círculo de Estudo',
      meditation: 'Meditação',
    },

    // Tradition labels (lookup em EventCard)
    traditions: {
      cabala: 'Cabala',
      ifa: 'Ifá',
      astrologia: 'Astrologia',
      tantra: 'Tântrica',
      reiki: 'Reiki',
      meditacao: 'Meditação',
      xamanismo: 'Xamanismo',
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
      clearSearch: 'Limpar busca',
      typeLabel: 'Tipo',
      locationLabel: 'Onde',
      traditionLabel: 'Tradição',
      clearAll: 'Limpar tudo',
      clearFilters: 'Limpar filtros',
      featured: 'Em destaque',
      // Plural — chip "N resultados"
      resultsCountOne: '{count} resultado',
      resultsCountOther: '{count} resultados',
      typeOptions: {
        all: 'Todos',
        workshop: 'Workshops',
        ritual: 'Rituais',
        'study-circle': 'Círculos',
        meditation: 'Meditações',
      },
      locationOptions: {
        all: 'Qualquer',
        online: 'Online',
        presencial: 'Presencial',
        hybrid: 'Híbrido',
      },
      traditionOptions: {
        all: 'Todas',
      },
    },

    // SignupButton — 4 estados
    signup: {
      login: 'Entrar para participar',
      success: 'Inscrição confirmada ✓',
      full: 'Lotado',
      closed: 'Inscrições fechadas',
      submitting: 'Confirmando...',
      waitlist: 'Entrar na lista de espera',
      join: 'Participar do evento',
    },

    // Página /workshops/[slug] — detalhe
    detail: {
      notFound: 'Evento não encontrado',
      aboutEvent: 'Sobre este evento',
      aboutHost: 'Sobre o facilitador',
      moreFromHost: 'Mais com {name}',
      viewFullProfile: 'Ver perfil completo →',
      photoOfHost: 'Foto de {name}',
      meta: {
        date: 'Data',
        duration: 'Duração',
        platform: 'Plataforma',
        location: 'Local',
        modality: 'Modalidade',
        spots: 'Vagas',
      },
      duration: {
        minutes: '{min} min',
        hours: '{h}h',
        hoursMinutes: '{h}h{min}min',
      },
      spots: {
        filledCount: 'Lotado ({confirmed}/{capacity})',
        openWithRemaining: '{confirmed}/{capacity} · {remaining} restantes',
        openNoRemaining: '{confirmed}/{capacity}',
      },
      hints: {
        online:
          'Você receberá o link de acesso por email após a inscrição.',
        presencial:
          'Confirmação enviada por email. Traga documento com foto.',
      },
      defaultLocation: {
        online: 'Online',
        presencial: 'Presencial',
        hybrid: 'Híbrido',
      },
    },
  },

  // -----------------------------------------------------------------------
  // Common (compartilhado)
  // -----------------------------------------------------------------------
  common: {
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    save: 'Salvar',
    delete: 'Deletar',
    edit: 'Editar',
    close: 'Fechar',
    open: 'Abrir',
    yes: 'Sim',
    no: 'Não',
    loading: 'Carregando…',
    error: 'Erro',
    success: 'Sucesso',
    optional: 'opcional',
    seeMore: 'Ver mais',
    seeLess: 'Ver menos',
    skip: 'Pular',
    done: 'Concluído',
  },
};

export type PtBRTranslations = typeof ptBR;