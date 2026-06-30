/**
 * Translation Tooling — PT-BR Dictionary (source-of-truth)
 *
 * 50+ keys covering UI chrome, navigation, sacred-content domain terms,
 * and a few plural-sensitive messages. Every key here MUST also exist in
 * `en.ts` and `es.ts` (fallback chain relies on parity).
 */
import type { Dictionary } from '../types.ts'

const PT_BR_RAW: Record<string, string> = {
  // ── common UI ───────────────────────────────────────────────────────────────
  'common.save': 'Salvar',
  'common.cancel': 'Cancelar',
  'common.loading': 'Carregando...',
  'common.error': 'Algo deu errado. Tente novamente.',
  'common.retry': 'Tentar novamente',
  'common.back': 'Voltar',
  'common.next': 'Próximo',
  'common.close': 'Fechar',
  'common.search': 'Buscar',
  'common.yes': 'Sim',
  'common.no': 'Não',
  'common.confirm': 'Confirmar',
  'common.delete': 'Excluir',
  'common.edit': 'Editar',

  // ── home ────────────────────────────────────────────────────────────────────
  'home.title': 'Cabala dos Caminhos',
  'home.subtitle': 'Tradições em diálogo',
  'home.welcome': 'Bem-vindo(a), {name}',
  'home.featured': 'Em destaque',

  // ── mesa real ───────────────────────────────────────────────────────────────
  'mesa.title': 'Mesa Real',
  'mesa.subtitle': '36 casas, infinitos caminhos',
  'mesa.casa': 'Casa {n}',
  'mesa.cards_drawn':
    '{count, plural, one {1 carta sorteada} other {# cartas sorteadas}}',
  'mesa.open_house': 'Abrir Casa {n}',
  'mesa.summary': 'Síntese dos caminhos',

  // ── tradições ───────────────────────────────────────────────────────────────
  'trad.candomble': 'Candomblé',
  'trad.umbanda': 'Umbanda',
  'trad.ifa': 'Ifá',
  'trad.cabala': 'Cabala',
  'trad.astrologia': 'Astrologia',
  'trad.tantra': 'Tantra',
  'trad.cigano': 'Cigano',
  'trad.numerologia': 'Numerologia',
  'trad.tarot': 'Tarot',

  // ── auth ────────────────────────────────────────────────────────────────────
  'auth.signin': 'Entrar',
  'auth.signout': 'Sair',
  'auth.signup': 'Cadastrar',
  'auth.email': 'E-mail',
  'auth.password': 'Senha',
  'auth.forgot_password': 'Esqueci minha senha',

  // ── navigation ──────────────────────────────────────────────────────────────
  'nav.home': 'Início',
  'nav.mesa': 'Mesa Real',
  'nav.oraculo': 'Oráculo',
  'nav.comunidade': 'Comunidade',
  'nav.perfil': 'Perfil',
  'nav.configuracoes': 'Configurações',

  // ── erros / estados ─────────────────────────────────────────────────────────
  'error.network': 'Sem conexão. Verifique sua internet.',
  'error.unauthorized': 'Você precisa estar autenticado.',
  'error.not_found': 'Página não encontrada',
  'state.empty': 'Nada por aqui ainda',
  'state.saved': 'Salvo com sucesso',
}

/** Deep-frozen PT-BR dictionary. Single source of truth. */
export const PT_BR: Dictionary = Object.freeze({ ...PT_BR_RAW })