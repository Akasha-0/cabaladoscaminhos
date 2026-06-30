/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — PT-BR BASE TABLE (canonical source of truth)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Base translation table — Portuguese (Brazil). This is the SOURCE OF TRUTH
 * for every string in the app. EN/ES tables mirror these keys.
 *
 * Sacred-cultural sensitivity (cycle W86-C):
 *   - All Portuguese sacred terms (orixá, caboclo, babalaô, sefirá, etc) are
 *     preserved VERBATIM in this table.
 *   - Other locales MUST keep these terms verbatim too — they are not
 *     "translated" into English/Spanish cognates.
 *
 * Naming convention: <area>.<semantic_key>
 *   - nav.*       — top nav, footer, breadcrumbs
 *   - auth.*      — login, signup, magic link, password
 *   - errors.*    — validation, network, auth errors
 *   - content.*   — long-form labels for cards, sections
 *   - sacred.*    — sacred-term gloss (these never get translated)
 *   - cta.*       — call-to-action button labels
 *   - settings.*  — settings page labels
 *   - settings.locale.* — locale-specific labels
 */

import type { LocaleModule, TranslationTable } from '../types.ts';

const TABLE_RAW: TranslationTable = Object.freeze({
  // ── nav ────────────────────────────────────────────────────────────────
  'nav.home': 'Início',
  'nav.library': 'Biblioteca',
  'nav.community': 'Comunidade',
  'nav.akashic': 'Akáshico',
  'nav.events': 'Eventos',
  'nav.profile': 'Perfil',
  'nav.settings': 'Configurações',
  'nav.signOut': 'Sair',

  // ── auth ───────────────────────────────────────────────────────────────
  'auth.email': 'E-mail',
  'auth.password': 'Senha',
  'auth.passwordPlaceholder': 'Mínimo 8 caracteres',
  'auth.displayName': 'Nome de exibição',
  'auth.bio': 'Bio',
  'auth.bioPlaceholder': 'Conte um pouco sobre sua caminhada espiritual',
  'auth.login.title': 'Entre na sua jornada',
  'auth.login.subtitle': 'Acesse a Mesa Real, Akáshico e sua biblioteca',
  'auth.login.submit': 'Entrar',
  'auth.login.magicLink': 'Enviar link mágico',
  'auth.login.noAccount': 'Ainda não tem conta?',
  'auth.login.createAccount': 'Criar conta',
  'auth.signup.title': 'Crie sua conta',
  'auth.signup.step1': 'Identidade',
  'auth.signup.step2': 'Tradição',
  'auth.signup.step3': 'Perfil',
  'auth.signup.submit': 'Criar conta',
  'auth.signup.lgpdConsent': 'Concordo com os termos da LGPD',
  'auth.magicLink.sent': 'Link mágico enviado para {{email}}',
  'auth.magicLink.checkInbox': 'Verifique sua caixa de entrada',
  'auth.error.invalidEmail': 'E-mail inválido',
  'auth.error.passwordTooShort': 'Senha deve ter pelo menos 8 caracteres',
  'auth.error.required': 'Campo obrigatório',
  'auth.error.consentRequired': 'É preciso aceitar os termos da LGPD',
  'auth.error.network': 'Falha de conexão — tente novamente',

  // ── errors ─────────────────────────────────────────────────────────────
  'errors.generic': 'Algo deu errado. Tente novamente.',
  'errors.notFound': 'Não encontramos essa página',
  'errors.unauthorized': 'Você precisa estar logado',
  'errors.forbidden': 'Acesso negado',
  'errors.timeout': 'A operação demorou demais',

  // ── content ────────────────────────────────────────────────────────────
  'content.dailyReading': 'Leitura do dia',
  'content.mesaReal': 'Mesa Real',
  'content.mesaRealDescription': '36 casas do Baralho Cigano cruzadas com seu mapa',
  'content.akashaDescription': 'Memórias akáshicas acessíveis em segundos',
  'content.libraryDescription': 'Artigos, práticas e estudos das tradições',
  'content.communityDescription': 'Compartilhe sua jornada com praticantes',

  // ── sacred (PRESERVED VERBATIM across all locales) ───────────────────
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
  'cta.start': 'Começar',
  'cta.continue': 'Continuar',
  'cta.save': 'Salvar',
  'cta.cancel': 'Cancelar',
  'cta.close': 'Fechar',
  'cta.try': 'Tentar novamente',
  'cta.learnMore': 'Saiba mais',

  // ── settings ───────────────────────────────────────────────────────────
  'settings.title': 'Configurações',
  'settings.subtitle': 'Preferências da sua conta',
  'settings.section.account': 'Conta',
  'settings.section.privacy': 'Privacidade',
  'settings.section.preferences': 'Preferências',

  // ── settings.locale (this page's labels) ───────────────────────────────
  'settings.locale.title': 'Idioma',
  'settings.locale.subtitle': 'Escolha o idioma da interface',
  'settings.locale.preview': 'Pré-visualização',
  'settings.locale.persistNote': 'Sua escolha é salva neste navegador',
  'settings.locale.fallbackNote': 'Se uma frase não estiver traduzida, mostramos em português',
  'settings.locale.card.pt': 'Esta é a interface em português do Brasil',
  'settings.locale.card.en': 'This is the interface in English',
  'settings.locale.card.es': 'Esta es la interfaz en español',
});

export const table: TranslationTable = Object.freeze({ ...TABLE_RAW });

export const locale: 'pt-BR' = 'pt-BR';
export const name = 'Português (Brasil)';

export const ptBR: LocaleModule = Object.freeze({ locale, name, table });

export default ptBR;
