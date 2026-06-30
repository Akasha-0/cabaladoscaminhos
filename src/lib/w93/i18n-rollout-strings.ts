// ============================================================================
// Wave 93 — i18n Rollout Strings (extended set, 80+ keys × 3 locales)
// ============================================================================
// Estende o catálogo W92-C (41 keys) com 40+ chaves adicionais cobrindo:
//   • Landing page (home.*)
//   • Onboarding flow (onboarding.*)
//   • Reading detail (reading.*, odu.*, orixa.*)
//
// PT-BR é a fonte da verdade. EN/ES são curados à mão para falantes nativos
// de prática espiritual, NÃO tradução automática.
//
// TERMOS SAGRADOS — preservados verbatim em todos os locales:
//   • "orixás"  → "orixás" (NÃO "orishas" / "orishás" — grafia portuguesa)
//   • "axé"     → "axé"    (NÃO "ashé" / "axe" — termo yorubá)
//   • "Odu"     → "Odu"    (sistema de Ifá, capital O)
//   • "Odus"    → "Odus"   (plural)
//   • "Cigano Ramiro" → nome próprio, NÃO traduzir
//   • "Akasha"  → nome próprio, NÃO traduzir
//   • "Candomblé", "Umbanda", "Ifá", "Cabala" → grafia local de cada prática
//   • "Iemanjá" (NÃO "Yemanjá"), "Oxalá" (NÃO "Obatala"), "pemba" (NÃO "cal")
//
// Convenções:
//   • "n" usado em plurais → "{n} comentários" / "{n} comments" / "{n} comentarios"
//   • Strings de plural usam CLDR via pluralRules no engine (não `|` simples)
//   • Variáveis em chaves simples: {name}, {n}, {group}, {locale}
//   • Strings curtas (mobile-first 44px targets)
// ============================================================================

/**
 * Locales suportados pelo tooling W93.
 * Mantido alinhado com `src/lib/w92/translation-strings.ts` (SUPPORTED_LOCALES).
 */
export const SUPPORTED_LOCALES_W93 = ['pt-BR', 'en', 'es'] as const;
export type SupportedLocaleW93 = (typeof SUPPORTED_LOCALES_W93)[number];

/**
 * Shape do objeto de strings.
 * Cada chave do PRIMEIRO nível é uma string registrada; cada uma DEVE
 * ter as 3 locales. O type-check em `i18n-rollout-engine.ts` valida isso.
 */
type StringEntry = { 'pt-BR': string; en: string; es: string };

/**
 * Catálogo W93 — 80+ strings curadas à mão cobrindo:
 *   1. Landing page / home (8)
 *   2. Onboarding flow steps (12)
 *   3. Reading detail (10)
 *   4. Odu interpretation (10)
 *   5. Orixá presentation (5)
 *   6. Counter/plural CLDR examples (8)
 *   7. Error states (5)
 *   8. Accessibility (6)
 *   9. CTAs primários estendidos (5)
 *  10. Sacred-tradition copy (4)
 *  11. Navigation labels estendidos (4)
 *  12. Status feedback (3)
 *  Total: 80 strings
 */
export const W93_STRINGS = {
  // -----------------------------------------------------------------------
  // 1. Landing page / home (8)
  // -----------------------------------------------------------------------
  'home.hero.badge': {
    'pt-BR': 'Comunidade + IA co-evoluindo',
    en: 'Community + AI co-evolving',
    es: 'Comunidad + IA co-evolucionando',
  },
  'home.hero.titleAccent': {
    'pt-BR': 'Comunidade Viva de Espiritualidade',
    en: 'Living Community of Spirituality',
    es: 'Comunidad Viva de Espiritualidad',
  },
  'home.hero.subtitle': {
    'pt-BR': 'Compartilhe, aprenda e evolua com uma comunidade de praticantes, guiado por uma IA curadora alimentada por tradições ancestrais e artigos científicos.',
    en: 'Share, learn and evolve with a community of practitioners, guided by a curator AI fed by ancestral traditions and scientific articles.',
    es: 'Comparte, aprende y evoluciona con una comunidad de practicantes, guiado por una IA curadora alimentada por tradiciones ancestrales y artículos científicos.',
  },
  'home.hero.ctaPrimary': {
    'pt-BR': 'Entrar na lista de espera',
    en: 'Join the waitlist',
    es: 'Entrar en la lista de espera',
  },
  'home.hero.ctaSecondary': {
    'pt-BR': 'Explorar tradições',
    en: 'Explore traditions',
    es: 'Explorar tradiciones',
  },
  'home.stats.practitioners': {
    'pt-BR': '{n} praticantes',
    en: '{n} practitioners',
    es: '{n} practicantes',
  },
  'home.stats.articles': {
    'pt-BR': '{n} artigos curados',
    en: '{n} curated articles',
    es: '{n} artículos curados',
  },
  'home.stats.traditions': {
    'pt-BR': '{n} tradições representadas',
    en: '{n} traditions represented',
    es: '{n} tradiciones representadas',
  },

  // -----------------------------------------------------------------------
  // 2. Onboarding flow (12)
  // -----------------------------------------------------------------------
  'onboarding.step.name.title': {
    'pt-BR': 'Seu Nome',
    en: 'Your Name',
    es: 'Tu Nombre',
  },
  'onboarding.step.name.subtitle': {
    'pt-BR': 'Como aparece no documento',
    en: 'As it appears on your ID',
    es: 'Como aparece en tu documento',
  },
  'onboarding.step.traditions.title': {
    'pt-BR': 'Tradições',
    en: 'Traditions',
    es: 'Tradiciones',
  },
  'onboarding.step.traditions.subtitle': {
    'pt-BR': 'Quais caminhos te chamam',
    en: 'Which paths call to you',
    es: 'Qué caminos te llaman',
  },
  'onboarding.step.birthdate.title': {
    'pt-BR': 'Nascimento',
    en: 'Birth',
    es: 'Nacimiento',
  },
  'onboarding.step.birthdate.subtitle': {
    'pt-BR': 'Data do seu despertar',
    en: 'Date of your awakening',
    es: 'Fecha de tu despertar',
  },
  'onboarding.step.birthtime.title': {
    'pt-BR': 'Hora',
    en: 'Time',
    es: 'Hora',
  },
  'onboarding.step.birthtime.subtitle': {
    'pt-BR': 'O instante exato (opcional)',
    en: 'The exact moment (optional)',
    es: 'El instante exacto (opcional)',
  },
  'onboarding.step.birthplace.title': {
    'pt-BR': 'Local',
    en: 'Place',
    es: 'Lugar',
  },
  'onboarding.step.birthplace.subtitle': {
    'pt-BR': 'Onde a alma escolheu encarnar',
    en: 'Where the soul chose to incarnate',
    es: 'Donde el alma eligió encarnar',
  },
  'onboarding.error.minOneTradition': {
    'pt-BR': 'Escolha ao menos uma tradição',
    en: 'Choose at least one tradition',
    es: 'Elige al menos una tradición',
  },
  'onboarding.success.welcomeMessage': {
    'pt-BR': 'Bem-vindo(a), {name}! Sua jornada começa agora.',
    en: 'Welcome, {name}! Your journey begins now.',
    es: '¡Bienvenido(a), {name}! Tu viaje comienza ahora.',
  },

  // -----------------------------------------------------------------------
  // 3. Reading detail (10)
  // -----------------------------------------------------------------------
  'reading.title.fallback': {
    'pt-BR': 'Leitura Espiritual',
    en: 'Spiritual Reading',
    es: 'Lectura Espiritual',
  },
  'reading.subtitle.consult': {
    'pt-BR': 'Consulta de {date}',
    en: 'Reading from {date}',
    es: 'Consulta del {date}',
  },
  'reading.section.summary': {
    'pt-BR': 'Resumo',
    en: 'Summary',
    es: 'Resumen',
  },
  'reading.section.interpretation': {
    'pt-BR': 'Interpretação',
    en: 'Interpretation',
    es: 'Interpretación',
  },
  'reading.section.recommendations': {
    'pt-BR': 'Recomendações',
    en: 'Recommendations',
    es: 'Recomendaciones',
  },
  'reading.disclaimer': {
    'pt-BR': 'Esta leitura é um espelho, não um destino. Use-a com reverência.',
    en: 'This reading is a mirror, not a destiny. Use it with reverence.',
    es: 'Esta lectura es un espejo, no un destino. Úsala con reverencia.',
  },
  'reading.cta.save': {
    'pt-BR': 'Salvar leitura',
    en: 'Save reading',
    es: 'Guardar lectura',
  },
  'reading.cta.share': {
    'pt-BR': 'Compartilhar leitura',
    en: 'Share reading',
    es: 'Compartir lectura',
  },
  'reading.cta.newReading': {
    'pt-BR': 'Nova leitura',
    en: 'New reading',
    es: 'Nueva lectura',
  },
  'reading.empty.odudrawn': {
    'pt-BR': 'Nenhum Odu sorteado ainda',
    en: 'No Odu drawn yet',
    es: 'Ningún Odu sorteado todavía',
  },

  // -----------------------------------------------------------------------
  // 4. Odu interpretation (10) — preserves Odu/orixás verbatim
  // -----------------------------------------------------------------------
  'odu.label.header': {
    'pt-BR': 'Odu sorteado: {name}',
    en: 'Drawn Odu: {name}',
    es: 'Odu sorteado: {name}',
  },
  'odu.label.essence': {
    'pt-BR': 'Palavra-força',
    en: 'Core word',
    es: 'Palabra-fuerza',
  },
  'odu.label.orixas': {
    'pt-BR': 'Orixás regentes',
    en: 'Ruling orixás',
    es: 'Orixás regentes',
  },
  'odu.interpretation.intro': {
    'pt-BR': 'O Odu {name} traz a energia de {essence}. Os orixás regentes — {orixas} — iluminam este caminho.',
    en: 'The Odu {name} brings the energy of {essence}. The ruling orixás — {orixas} — illuminate this path.',
    es: 'El Odu {name} trae la energía de {essence}. Los orixás regentes — {orixas} — iluminan este camino.',
  },
  'odu.interpretation.advice': {
    'pt-BR': 'Reflita sobre {essence} nas próximas {n} luas.',
    en: 'Reflect on {essence} over the next {n} moons.',
    es: 'Reflexiona sobre {essence} durante las próximas {n} lunas.',
  },
  'odu.interpretation.caution': {
    'pt-BR': 'Cuidado com a pressa — {name} pede pés firmes.',
    en: 'Beware of haste — {name} asks for steady feet.',
    es: 'Cuidado con la prisa — {name} pide pies firmes.',
  },
  'odu.interpretation.opening': {
    'pt-BR': 'Portas se abrem para quem cultiva {essence} com disciplina.',
    en: 'Doors open for those who cultivate {essence} with discipline.',
    es: 'Las puertas se abren para quien cultiva {essence} con disciplina.',
  },
  'odu.cross.axis.feminine': {
    'pt-BR': 'Eixo feminino',
    en: 'Feminine axis',
    es: 'Eje femenino',
  },
  'odu.cross.axis.masculine': {
    'pt-BR': 'Eixo masculino',
    en: 'Masculine axis',
    es: 'Eje masculino',
  },
  'odu.cross.house.label': {
    'pt-BR': 'Casa {n}',
    en: 'House {n}',
    es: 'Casa {n}',
  },

  // -----------------------------------------------------------------------
  // 5. Orixá presentation (5)
  // -----------------------------------------------------------------------
  'orixa.label.greeting': {
    'pt-BR': 'Saudações a {name}',
    en: 'Greetings to {name}',
    es: 'Saludos a {name}',
  },
  'orixa.domain': {
    'pt-BR': 'Domínio: {domain}',
    en: 'Domain: {domain}',
    es: 'Dominio: {domain}',
  },
  'orixa.element.water': {
    'pt-BR': 'Água',
    en: 'Water',
    es: 'Agua',
  },
  'orixa.element.fire': {
    'pt-BR': 'Fogo',
    en: 'Fire',
    es: 'Fuego',
  },
  'orixa.element.earth': {
    'pt-BR': 'Terra',
    en: 'Earth',
    es: 'Tierra',
  },

  // -----------------------------------------------------------------------
  // 6. Counter/plural CLDR (8) — {n} triggers pluralRules in engine
  // -----------------------------------------------------------------------
  'counter.readings': {
    'pt-BR': '{n} leitura',
    en: '{n} reading',
    es: '{n} lectura',
  },
  'counter.readingsPlural': {
    'pt-BR': '{n} leituras',
    en: '{n} readings',
    es: '{n} lecturas',
  },
  'counter.practitionersWithCount': {
    'pt-BR': '{n} praticante',
    en: '{n} practitioner',
    es: '{n} practicante',
  },
  'counter.practitionersPluralWithCount': {
    'pt-BR': '{n} praticantes',
    en: '{n} practitioners',
    es: '{n} practitioners',
  },
  'counter.messages': {
    'pt-BR': '{n} mensagem',
    en: '{n} message',
    es: '{n} mensaje',
  },
  'counter.messagesPlural': {
    'pt-BR': '{n} mensagens',
    en: '{n} messages',
    es: '{n} mensajes',
  },
  'counter.luas': {
    'pt-BR': '{n} lua',
    en: '{n} moon',
    es: '{n} luna',
  },
  'counter.luasPlural': {
    'pt-BR': '{n} luas',
    en: '{n} moons',
    es: '{n} lunas',
  },

  // -----------------------------------------------------------------------
  // 7. Error states (5)
  // -----------------------------------------------------------------------
  'error.reading.failed': {
    'pt-BR': 'Não foi possível gerar a leitura. Tente novamente.',
    en: 'Could not generate the reading. Please try again.',
    es: 'No fue posible generar la lectura. Inténtalo de nuevo.',
  },
  'error.reading.missingId': {
    'pt-BR': 'ID da leitura ausente',
    en: 'Missing reading ID',
    es: 'Falta ID de lectura',
  },
  'error.reading.notFound': {
    'pt-BR': 'Leitura não encontrada',
    en: 'Reading not found',
    es: 'Lectura no encontrada',
  },
  'error.profile.saveFailed': {
    'pt-BR': 'Erro ao salvar perfil. Verifique sua conexão.',
    en: 'Could not save profile. Check your connection.',
    es: 'No se pudo guardar el perfil. Verifica tu conexión.',
  },
  'error.locale.unsupported': {
    'pt-BR': 'Idioma não suportado',
    en: 'Unsupported language',
    es: 'Idioma no soportado',
  },

  // -----------------------------------------------------------------------
  // 8. Accessibility (6)
  // -----------------------------------------------------------------------
  'aria.reading.share': {
    'pt-BR': 'Compartilhar leitura sobre {name}',
    en: 'Share reading about {name}',
    es: 'Compartir lectura sobre {name}',
  },
  'aria.reading.save': {
    'pt-BR': 'Salvar leitura sobre {name}',
    en: 'Save reading about {name}',
    es: 'Guardar lectura sobre {name}',
  },
  'aria.tradition.toggle': {
    'pt-BR': 'Alternar tradição {name}',
    en: 'Toggle tradition {name}',
    es: 'Alternar tradición {name}',
  },
  'aria.odu.image': {
    'pt-BR': 'Imagem simbólica do Odu {name}',
    en: 'Symbolic image of Odu {name}',
    es: 'Imagen simbólica del Odu {name}',
  },
  'aria.phase.progress': {
    'pt-BR': 'Passo {current} de {total}',
    en: 'Step {current} of {total}',
    es: 'Paso {current} de {total}',
  },
  'aria.reading.duration': {
    'pt-BR': 'Leitura com {n} parágrafo',
    en: 'Reading with {n} paragraph',
    es: 'Lectura con {n} párrafo',
  },
  'aria.reading.durationPlural': {
    'pt-BR': 'Leitura com {n} parágrafos',
    en: 'Reading with {n} paragraphs',
    es: 'Lectura con {n} párrafos',
  },

  // -----------------------------------------------------------------------
  // 9. CTAs primários estendidos (5)
  // -----------------------------------------------------------------------
  'button.continue': {
    'pt-BR': 'Continuar',
    en: 'Continue',
    es: 'Continuar',
  },
  'button.back': {
    'pt-BR': 'Voltar',
    en: 'Back',
    es: 'Volver',
  },
  'button.finish': {
    'pt-BR': 'Finalizar',
    en: 'Finish',
    es: 'Finalizar',
  },
  'button.tryAgain': {
    'pt-BR': 'Tentar novamente',
    en: 'Try again',
    es: 'Intentar de nuevo',
  },
  'button.learnMore': {
    'pt-BR': 'Saiba mais',
    en: 'Learn more',
    es: 'Saber más',
  },

  // -----------------------------------------------------------------------
  // 10. Sacred-tradition copy (4) — preserves Odu / orixás / axé / pemba
  // -----------------------------------------------------------------------
  'tradition.akashaGreeting': {
    'pt-BR': 'Axé — que Akasha ilumine sua busca',
    en: 'Axé — may Akasha illuminate your search',
    es: 'Axé — que Akasha ilumine tu búsqueda',
  },
  'tradition.ciganoRamiroAttribution': {
    'pt-BR': 'Método Cigano Ramiro',
    en: 'Cigano Ramiro method',
    es: 'Método Cigano Ramiro',
  },
  'tradition.pembaNote': {
    'pt-BR': 'A pemba risca o axé no chão — não substitui a palavra do terreiro.',
    en: 'The pemba traces the axé on the ground — it does not replace the word of the terreiro.',
    es: 'La pemba traza el axé en el suelo — no reemplaza la palabra del terreiro.',
  },
  'tradition.oduMethodNote': {
    'pt-BR': 'Este Odu é parte do jogo de Ifá — preserve o respeito à casa que te ensinou.',
    en: 'This Odu is part of the Ifá game — preserve respect for the house that taught you.',
    es: 'Este Odu es parte del juego de Ifá — preserva el respeto a la casa que te enseñó.',
  },

  // -----------------------------------------------------------------------
  // 11. Navigation labels estendidos (4)
  // -----------------------------------------------------------------------
  'nav.readings': {
    'pt-BR': 'Leituras',
    en: 'Readings',
    es: 'Lecturas',
  },
  'nav.community': {
    'pt-BR': 'Comunidade',
    en: 'Community',
    es: 'Comunidad',
  },
  'nav.profile': {
    'pt-BR': 'Perfil',
    en: 'Profile',
    es: 'Perfil',
  },
  'nav.settings': {
    'pt-BR': 'Configurações',
    en: 'Settings',
    es: 'Configuración',
  },

  // -----------------------------------------------------------------------
  // 12. Status feedback (3)
  // -----------------------------------------------------------------------
  'status.loadingProfile': {
    'pt-BR': 'Carregando perfil…',
    en: 'Loading profile…',
    es: 'Cargando perfil…',
  },
  'status.readingComplete': {
    'pt-BR': 'Leitura concluída com axé',
    en: 'Reading completed with axé',
    es: 'Lectura completada con axé',
  },
  'status.profileSaved': {
    'pt-BR': 'Perfil salvo com sucesso',
    en: 'Profile saved successfully',
    es: 'Perfil guardado con éxito',
  },
} as const satisfies Record<string, StringEntry>;

/**
 * Tipo derivado das chaves do objeto W93_STRINGS.
 * Garante que só chaves registradas sejam usadas no `t()`.
 * (Branded via símbolo de tipo único — ver i18n-rollout-engine.ts.)
 */
export type W93StringKey = keyof typeof W93_STRINGS;

/**
 * Total de strings curadas (sanity-check usado em testes).
 * Recalculado automaticamente pelo módulo — NÃO hard-coded.
 */
export const W93_STRING_COUNT = Object.keys(W93_STRINGS).length;

/**
 * Sanity-check em tempo de módulo:
 * Se W93_STRINGS cair abaixo de 80 entradas, falha na import.
 * Isso é INTENCIONAL — protege contra regressões silenciosas.
 *
 * Cobre: 8 (home) + 12 (onboarding) + 10 (reading) + 10 (odu) +
 *        5 (orixa) + 8 (counter) + 5 (error) + 7 (aria) +
 *        5 (button) + 4 (tradition) + 4 (nav) + 3 (status) = 81
 */
if (Object.keys(W93_STRINGS).length < 80) {
  throw new Error(
    `W93_STRINGS should have at least 80 entries (brief W93-C), found ${Object.keys(W93_STRINGS).length}`,
  );
}