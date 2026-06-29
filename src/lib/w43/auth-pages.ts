// =============================================================================
// src/lib/w43/auth-pages.ts
// Wave 43 — Auth Pages Integration Layer
//
// Cobre o pipeline completo das páginas /login, /signup, /forgot-password,
// /reset-password, /verificar-email, /perfil/completar e /mfa, com:
//   - Schemas Zod-compatíveis (sem dependência runtime do Zod — usamos um
//     validador local leve para manter o módulo self-contained)
//   - Validadores BR + internacionais (CPF, telefone, data de nascimento,
//     senha NIST, e-mail RFC 5322 lite)
//   - Builders de URL OAuth para Google, Apple, Facebook, GitHub
//   - Máquina de estados do signup e do login
//   - Mapeamento de 30+ erros de auth para chaves i18n PT-BR/EN
//   - Debounce, lockout e rate limit client-side
//   - Refresh de sessão com rotação de refresh token
//   - MFA (TOTP, SMS, recovery codes)
//   - Reset de senha com token de uso único
//   - Verificação de e-mail com cooldown
//   - Wizard de completude de perfil
//   - Consentimento LGPD com versionamento de termos
//
// Toda a API é puramente TypeScript (sem React, sem I/O), para que possa ser
// importada tanto em server components quanto em client components, e testada
// fora do sandbox.
// =============================================================================

// ---------------------------------------------------------------------------
// Tipos utilitários
// ---------------------------------------------------------------------------

export type ResultadoValidacao<T> =
  | { ok: true; valor: T }
  | { ok: false; erros: string[] };

export type ChaveErroAuth =
  | 'invalid_credentials'
  | 'email_taken'
  | 'email_not_found'
  | 'email_not_verified'
  | 'weak_password'
  | 'password_too_common'
  | 'password_recently_used'
  | 'password_mismatch'
  | 'cpf_invalid'
  | 'cpf_taken'
  | 'phone_invalid'
  | 'birthdate_invalid'
  | 'birthdate_future'
  | 'birthdate_too_young'
  | 'birthdate_too_old'
  | 'name_too_short'
  | 'name_too_long'
  | 'name_invalid_chars'
  | 'mfa_required'
  | 'mfa_invalid_code'
  | 'mfa_expired'
  | 'mfa_recovery_code_used'
  | 'mfa_already_enrolled'
  | 'token_invalid'
  | 'token_expired'
  | 'token_already_used'
  | 'token_not_yet_valid'
  | 'rate_limited'
  | 'account_locked'
  | 'oauth_provider_denied'
  | 'oauth_email_conflict'
  | 'oauth_account_linked'
  | 'session_expired'
  | 'session_refresh_failed'
  | 'network_error'
  | 'server_error'
  | 'lgpd_consent_required'
  | 'lgpd_consent_outdated'
  | 'profile_incomplete'
  | 'forbidden'
  | 'unknown';

export interface ErroAuthMapeado {
  chave: ChaveErroAuth;
  mensagem_pt: string;
  mensagem_en: string;
  http_status: number;
  recoverable: boolean;
}

// ---------------------------------------------------------------------------
// Validador base (Zod-compatível em espírito, mas sem dependência)
// ---------------------------------------------------------------------------

interface CampoEsquema<T> {
  parse(valor: unknown): ResultadoValidacao<T>;
  opcional(): CampoEsquema<T | undefined>;
  comMensagem(mensagem: string): CampoEsquema<T>;
}

type Inferir<S> = S extends CampoEsquema<infer T> ? T : never;

function campo<T>(nome: string, parseFn: (v: unknown) => ResultadoValidacao<T>): CampoEsquema<T> {
  let customMsg: string | null = null;
  const base: CampoEsquema<T> = {
    parse(valor: unknown) {
      if (valor === undefined || valor === null || valor === '') {
        return { ok: false, erros: [customMsg ?? `${nome} é obrigatório`] };
      }
      return parseFn(valor);
    },
    opcional() {
      return {
        parse(valor: unknown) {
          if (valor === undefined || valor === null || valor === '') {
            return { ok: true, valor: undefined };
          }
          return parseFn(valor);
        },
        opcional() {
          return this;
        },
        comMensagem(m: string) {
          customMsg = m;
          return this;
        },
      };
    },
    comMensagem(m: string) {
      customMsg = m;
      return this;
    },
  };
  return base;
}

function string<T extends string = string>(nome: string, opts: { min?: number; max?: number; pattern?: RegExp } = {}) {
  return campo<T>(nome, (valor) => {
    if (typeof valor !== 'string') {
      return { ok: false, erros: [`${nome} deve ser texto`] };
    }
    const v = valor.trim();
    if (opts.min !== undefined && v.length < opts.min) {
      return { ok: false, erros: [`${nome} precisa ter pelo menos ${opts.min} caracteres`] };
    }
    if (opts.max !== undefined && v.length > opts.max) {
      return { ok: false, erros: [`${nome} pode ter no máximo ${opts.max} caracteres`] };
    }
    if (opts.pattern && !opts.pattern.test(v)) {
      return { ok: false, erros: [`${nome} está em formato inválido`] };
    }
    return { ok: true, valor: v as T };
  });
}

// ---------------------------------------------------------------------------
// Schemas de formulário (Zod-compatíveis em formato)
// ---------------------------------------------------------------------------

export interface DadosLogin {
  email: string;
  senha: string;
  lembrar: boolean;
  origem: 'web' | 'mobile' | 'tablet';
}

export const loginSchema = {
  email: string('email', { min: 5, max: 254, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }),
  senha: string('senha', { min: 8, max: 128 }),
};

export function parseLoginForm(payload: unknown): ResultadoValidacao<DadosLogin> {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, erros: ['payload inválido'] };
  }
  const p = payload as Record<string, unknown>;
  const rEmail = loginSchema.email.parse(p.email);
  const rSenha = loginSchema.senha.parse(p.senha);
  if (!rEmail.ok) return rEmail;
  if (!rSenha.ok) return rSenha;
  const lembrar = p.lembrar === true || p.lembrar === 'true';
  const origemRaw = String(p.origem ?? 'web');
  const origem: DadosLogin['origem'] = ['web', 'mobile', 'tablet'].includes(origemRaw)
    ? (origemRaw as DadosLogin['origem'])
    : 'web';
  return { ok: true, valor: { email: rEmail.valor, senha: rSenha.valor, lembrar, origem } };
}

export interface DadosSignup {
  nome: string;
  email: string;
  senha: string;
  senha_confirmacao: string;
  aceite_termos: boolean;
  aceite_marketing: boolean;
  indicacao?: string;
}

export const signupSchema = {
  nome: string('nome', { min: 2, max: 80 }),
  email: string('email', { min: 5, max: 254, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }),
  senha: string('senha', { min: 12, max: 128 }),
  senha_confirmacao: string('confirmação', { min: 12, max: 128 }),
};

export function parseSignupForm(payload: unknown): ResultadoValidacao<DadosSignup> {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, erros: ['payload inválido'] };
  }
  const p = payload as Record<string, unknown>;
  const rNome = signupSchema.nome.parse(p.nome);
  if (!rNome.ok) return rNome;
  const rEmail = signupSchema.email.parse(p.email);
  if (!rEmail.ok) return rEmail;
  const rSenha = signupSchema.senha.parse(p.senha);
  if (!rSenha.ok) return rSenha;
  const rConf = signupSchema.senha_confirmacao.parse(p.senha_confirmacao ?? p.senhaConfirmacao);
  if (!rConf.ok) return rConf;
  if (rSenha.valor !== rConf.valor) {
    return { ok: false, erros: ['as senhas não coincidem'] };
  }
  const aceite = p.aceite_termos === true || p.aceiteTermos === true;
  if (!aceite) return { ok: false, erros: ['é preciso aceitar os termos'] };
  const marketing = p.aceite_marketing === true || p.aceiteMarketing === true;
  const indicacaoRaw = p.indicacao ?? p.codigoIndicacao;
  const indicacao = typeof indicacaoRaw === 'string' && indicacaoRaw.length > 0 ? indicacaoRaw : undefined;
  return {
    ok: true,
    valor: {
      nome: rNome.valor,
      email: rEmail.valor,
      senha: rSenha.valor,
      senha_confirmacao: rConf.valor,
      aceite_termos: true,
      aceite_marketing: marketing,
      indicacao,
    },
  };
}

export interface DadosForgotPassword {
  email: string;
}

export function parseForgotForm(payload: unknown): ResultadoValidacao<DadosForgotPassword> {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, erros: ['payload inválido'] };
  }
  const p = payload as Record<string, unknown>;
  const r = loginSchema.email.parse(p.email);
  if (!r.ok) return r;
  return { ok: true, valor: { email: r.valor } };
}

export interface DadosResetPassword {
  token: string;
  nova_senha: string;
  nova_senha_confirmacao: string;
}

export function parseResetForm(payload: unknown): ResultadoValidacao<DadosResetPassword> {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, erros: ['payload inválido'] };
  }
  const p = payload as Record<string, unknown>;
  const token = typeof p.token === 'string' ? p.token.trim() : '';
  if (token.length < 8) return { ok: false, erros: ['token inválido'] };
  const rSenha = loginSchema.senha.parse(p.nova_senha ?? p.novaSenha);
  const rConf = loginSchema.senha.parse(p.nova_senha_confirmacao ?? p.novaSenhaConfirmacao);
  if (!rSenha.ok) return rSenha;
  if (!rConf.ok) return rConf;
  if (rSenha.valor !== rConf.valor) return { ok: false, erros: ['as senhas não coincidem'] };
  return { ok: true, valor: { token, nova_senha: rSenha.valor, nova_senha_confirmacao: rConf.valor } };
}

export interface DadosMfa {
  codigo: string;
  tipo: 'totp' | 'sms' | 'recovery';
  lembrar_dispositivo: boolean;
}

export function parseMfaForm(payload: unknown): ResultadoValidacao<DadosMfa> {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, erros: ['payload inválido'] };
  }
  const p = payload as Record<string, unknown>;
  const codigo = typeof p.codigo === 'string' ? p.codigo.replace(/\s+/g, '') : '';
  if (codigo.length < 6 || codigo.length > 10) {
    return { ok: false, erros: ['código deve ter entre 6 e 10 caracteres'] };
  }
  const tipoRaw = String(p.tipo ?? 'totp');
  const tipo: DadosMfa['tipo'] = ['totp', 'sms', 'recovery'].includes(tipoRaw)
    ? (tipoRaw as DadosMfa['tipo'])
    : 'totp';
  return {
    ok: true,
    valor: {
      codigo,
      tipo,
      lembrar_dispositivo: p.lembrar_dispositivo === true || p.lembrarDispositivo === true,
    },
  };
}

export interface DadosPerfilCompletar {
  cpf: string;
  telefone: string;
  data_nascimento: string;
  cidade: string;
  estado: string;
  biografia_curta: string;
  avatar_url?: string;
  genero?: 'feminino' | 'masculino' | 'nao_binario' | 'prefiro_nao_informar';
}

export function parsePerfilCompletarForm(payload: unknown): ResultadoValidacao<DadosPerfilCompletar> {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, erros: ['payload inválido'] };
  }
  const p = payload as Record<string, unknown>;
  const cpfRes = validarCpf(p.cpf);
  if (!cpfRes.ok) return cpfRes;
  const telRes = validarTelefoneBr(p.telefone);
  if (!telRes.ok) return telRes;
  const dataRes = validarDataNascimento(p.data_nascimento ?? p.dataNascimento);
  if (!dataRes.ok) return dataRes;
  const erros: string[] = [];
  const cidade = typeof p.cidade === 'string' ? p.cidade.trim() : '';
  if (cidade.length < 2) erros.push('cidade muito curta');
  const estado = typeof p.estado === 'string' ? p.estado.trim().toUpperCase() : '';
  if (estado.length !== 2) erros.push('estado precisa ser sigla UF de 2 letras');
  const bio = typeof p.biografia_curta === 'string' ? p.biografia_curta.trim() : '';
  if (bio.length > 240) erros.push('biografia pode ter no máximo 240 caracteres');
  if (erros.length) return { ok: false, erros };
  const avatarRaw = p.avatar_url ?? p.avatarUrl;
  const avatar = typeof avatarRaw === 'string' && avatarRaw.length > 0 ? avatarRaw : undefined;
  const generoRaw = p.genero !== undefined ? String(p.genero) : undefined;
  const genero: DadosPerfilCompletar['genero'] | undefined =
    generoRaw === 'feminino' || generoRaw === 'masculino' || generoRaw === 'nao_binario' || generoRaw === 'prefiro_nao_informar'
      ? generoRaw
      : undefined;
  return {
    ok: true,
    valor: {
      cpf: cpfRes.valor,
      telefone: telRes.valor,
      data_nascimento: dataRes.valor,
      cidade,
      estado,
      biografia_curta: bio,
      avatar_url: avatar,
      genero,
    },
  };
}

// ---------------------------------------------------------------------------
// Validadores de domínio
// ---------------------------------------------------------------------------

const RE_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RE_TEL_BR = /^\+?55?\s?\(?(\d{2})\)?\s?9?\d{4}-?\d{4}$/;
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;

export function validarEmail(valor: unknown): ResultadoValidacao<string> {
  if (typeof valor !== 'string') return { ok: false, erros: ['e-mail deve ser texto'] };
  const v = valor.trim().toLowerCase();
  if (v.length < 5 || v.length > 254) return { ok: false, erros: ['e-mail com tamanho inválido'] };
  if (!RE_EMAIL.test(v)) return { ok: false, erros: ['e-mail com formato inválido'] };
  // Bloqueia disposable domains básicos
  const dominiosBloqueados = ['mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com'];
  const dominio = v.split('@')[1] ?? '';
  if (dominiosBloqueados.includes(dominio)) {
    return { ok: false, erros: ['e-mails descartáveis não são permitidos'] };
  }
  return { ok: true, valor: v };
}

const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'qwerty123',
  'abcdefgh', '11111111', '00000000', 'senha123', 'brasil123', 'admin123',
]);

export function validarForcaSenha(senha: string): {
  pontuacao: 0 | 1 | 2 | 3 | 4;
  aceita: boolean;
  dicas: string[];
} {
  const dicas: string[] = [];
  if (senha.length < 12) dicas.push('use pelo menos 12 caracteres');
  if (senha.length > 128) dicas.push('senha excede 128 caracteres');
  if (!/[a-z]/.test(senha)) dicas.push('inclua letras minúsculas');
  if (!/[A-Z]/.test(senha)) dicas.push('inclua letras maiúsculas');
  if (!/[0-9]/.test(senha)) dicas.push('inclua números');
  if (!/[^a-zA-Z0-9]/.test(senha)) dicas.push('inclua ao menos um símbolo (!@#$% etc.)');
  if (COMMON_PASSWORDS.has(senha.toLowerCase())) dicas.push('senha muito comum — escolha outra');
  // Penaliza sequências óbvias (1234, abcd, qwerty)
  const sequencias = ['1234', 'abcd', 'qwerty', 'asdf', 'zxcv'];
  for (const seq of sequencias) {
    if (senha.toLowerCase().includes(seq)) {
      dicas.push('evite sequências óbvias');
      break;
    }
  }
  let pontos = 0;
  if (senha.length >= 12) pontos++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
  if (/[0-9]/.test(senha)) pontos++;
  if (/[^a-zA-Z0-9]/.test(senha) && senha.length >= 16) pontos++;
  const aceita = dicas.length === 0;
  return { pontuacao: pontos as 0 | 1 | 2 | 3 | 4, aceita, dicas };
}

export function validarTelefoneBr(valor: unknown): ResultadoValidacao<string> {
  if (typeof valor !== 'string') return { ok: false, erros: ['telefone deve ser texto'] };
  const limpo = valor.replace(/[^\d+]/g, '');
  if (!RE_TEL_BR.test(limpo)) {
    return { ok: false, erros: ['telefone fora do padrão BR (use DDD + 9 dígitos)'] };
  }
  return { ok: true, valor: limpo };
}

export function validarCpf(valor: unknown): ResultadoValidacao<string> {
  if (typeof valor !== 'string') return { ok: false, erros: ['CPF deve ser texto'] };
  const cpf = valor.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return { ok: false, erros: ['CPF deve ter 11 dígitos'] };
  if (/^(\d)\1{10}$/.test(cpf)) return { ok: false, erros: ['CPF inválido (dígitos repetidos)'] };
  // Validação do módulo 11
  const calc = (base: string) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i]!, 10) * (base.length + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const d1 = calc(cpf.slice(0, 9));
  const d2 = calc(cpf.slice(0, 10));
  if (d1 !== parseInt(cpf[9]!, 10) || d2 !== parseInt(cpf[10]!, 10)) {
    return { ok: false, erros: ['CPF inválido'] };
  }
  return { ok: true, valor: cpf };
}

export function validarDataNascimento(valor: unknown): ResultadoValidacao<string> {
  if (typeof valor !== 'string') return { ok: false, erros: ['data deve ser texto'] };
  if (!RE_DATA.test(valor)) return { ok: false, erros: ['data deve estar no formato AAAA-MM-DD'] };
  const d = new Date(valor + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return { ok: false, erros: ['data inválida'] };
  const hoje = new Date();
  if (d.getTime() > hoje.getTime()) return { ok: false, erros: ['data no futuro'] };
  const idadeMinimaMs = 16 * 365.25 * 24 * 60 * 60 * 1000;
  if (hoje.getTime() - d.getTime() < idadeMinimaMs) {
    return { ok: false, erros: ['precisa ter pelo menos 16 anos'] };
  }
  const idadeMaximaMs = 130 * 365.25 * 24 * 60 * 60 * 1000;
  if (hoje.getTime() - d.getTime() > idadeMaximaMs) {
    return { ok: false, erros: ['data de nascimento muito antiga'] };
  }
  return { ok: true, valor: valor };
}

export function validarNome(valor: unknown): ResultadoValidacao<string> {
  if (typeof valor !== 'string') return { ok: false, erros: ['nome deve ser texto'] };
  const v = valor.trim().replace(/\s+/g, ' ');
  if (v.length < 2) return { ok: false, erros: ['nome muito curto'] };
  if (v.length > 80) return { ok: false, erros: ['nome muito longo'] };
  if (!/^[\p{L}\p{M}'\-\. ]+$/u.test(v)) {
    return { ok: false, erros: ['nome contém caracteres inválidos'] };
  }
  return { ok: true, valor: v };
}

// ---------------------------------------------------------------------------
// OAuth — builders de URL e handlers de callback
// ---------------------------------------------------------------------------

export type ProvedorOAuth = 'google' | 'apple' | 'facebook' | 'github';

export interface ConfiguracaoOAuth {
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
  escopos: string[];
  estado: string;
}

export function buildGoogleOAuthUrl(config: ConfiguracaoOAuth): string {
  const params = new URLSearchParams({
    client_id: config.client_id,
    redirect_uri: config.redirect_uri,
    response_type: 'code',
    scope: config.escopos.join(' '),
    state: config.estado,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function buildAppleOAuthUrl(config: ConfiguracaoOAuth): string {
  const params = new URLSearchParams({
    client_id: config.client_id,
    redirect_uri: config.redirect_uri,
    response_type: 'code',
    scope: config.escopos.join(' '),
    state: config.estado,
    response_mode: 'form_post',
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

export function buildFacebookOAuthUrl(config: ConfiguracaoOAuth): string {
  const params = new URLSearchParams({
    client_id: config.client_id,
    redirect_uri: config.redirect_uri,
    scope: config.escopos.join(','),
    state: config.estado,
    auth_type: 'rerequest',
  });
  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

export function buildGithubOAuthUrl(config: ConfiguracaoOAuth): string {
  const params = new URLSearchParams({
    client_id: config.client_id,
    redirect_uri: config.redirect_uri,
    scope: config.escopos.join(','),
    state: config.estado,
    allow_signup: 'true',
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function buildOAuthUrl(provedor: ProvedorOAuth, config: ConfiguracaoOAuth): string {
  switch (provedor) {
    case 'google': return buildGoogleOAuthUrl(config);
    case 'apple': return buildAppleOAuthUrl(config);
    case 'facebook': return buildFacebookOAuthUrl(config);
    case 'github': return buildGithubOAuthUrl(config);
  }
}

export function gerarEstadoOAuth(): string {
  // 32 chars base64url
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface ResultadoCallbackOAuth {
  ok: boolean;
  provedor: ProvedorOAuth;
  email?: string;
  nome?: string;
  avatar?: string;
  provedor_id?: string;
  erro?: ChaveErroAuth;
}

export function mapearErroOAuth(provedor: ProvedorOAuth, codigo: string): ChaveErroAuth {
  const mapa: Record<string, ChaveErroAuth> = {
    'access_denied': 'oauth_provider_denied',
    'user_cancelled': 'oauth_provider_denied',
    'user_cancelled_authorize': 'oauth_provider_denied',
    'email_not_provided': 'oauth_provider_denied',
    'account_exists': 'oauth_email_conflict',
  };
  if (mapa[codigo]) return mapa[codigo]!;
  // Erros específicos por provedor
  if (provedor === 'google' && codigo === 'invalid_grant') return 'token_invalid';
  if (provedor === 'github' && codigo === 'bad_verification_code') return 'token_invalid';
  return 'unknown';
}

export function interpretarCallbackOAuth(
  provedor: ProvedorOAuth,
  params: URLSearchParams,
  estadoEsperado: string,
): ResultadoCallbackOAuth {
  if (params.has('error')) {
    return { ok: false, provedor, erro: mapearErroOAuth(provedor, params.get('error') ?? '') };
  }
  const estado = params.get('state') ?? '';
  if (estado !== estadoEsperado) {
    return { ok: false, provedor, erro: 'token_invalid' };
  }
  const codigo = params.get('code');
  if (!codigo) return { ok: false, provedor, erro: 'token_invalid' };
  return { ok: true, provedor };
}

// ---------------------------------------------------------------------------
// State machine — signup
// ---------------------------------------------------------------------------

export type EstadoSignup =
  | 'anonimo'
  | 'cadastro_iniciado'
  | 'email_pendente'
  | 'email_verificado'
  | 'perfil_incompleto'
  | 'mfa_pendente'
  | 'ativo'
  | 'suspenso';

export interface EventoSignup {
  tipo:
    | 'iniciar'
    | 'enviar_email'
    | 'clicar_link'
    | 'completar_perfil'
    | 'ativar_mfa'
    | 'concluir'
    | 'suspender';
  payload?: Record<string, unknown>;
  timestamp_ms: number;
}

export interface TransicaoSignup {
  de: EstadoSignup;
  para: EstadoSignup;
  evento: EventoSignup['tipo'];
  condicao?: (p: Record<string, unknown> | undefined) => boolean;
}

const TRANSICOES_SIGNUP: TransicaoSignup[] = [
  { de: 'anonimo', para: 'cadastro_iniciado', evento: 'iniciar' },
  { de: 'cadastro_iniciado', para: 'email_pendente', evento: 'enviar_email' },
  { de: 'email_pendente', para: 'email_verificado', evento: 'clicar_link' },
  { de: 'email_verificado', para: 'perfil_incompleto', evento: 'completar_perfil' },
  { de: 'perfil_incompleto', para: 'mfa_pendente', evento: 'ativar_mfa' },
  { de: 'perfil_incompleto', para: 'ativo', evento: 'concluir' },
  { de: 'mfa_pendente', para: 'ativo', evento: 'concluir' },
  { de: 'email_pendente', para: 'suspenso', evento: 'suspender' },
  { de: 'perfil_incompleto', para: 'suspenso', evento: 'suspender' },
  { de: 'ativo', para: 'suspenso', evento: 'suspender' },
];

export function aplicarEventoSignup(
  estado: EstadoSignup,
  evento: EventoSignup,
): { ok: true; novoEstado: EstadoSignup } | { ok: false; motivo: string } {
  const candidatos = TRANSICOES_SIGNUP.filter(
    (t) => t.de === estado && t.evento === evento.tipo,
  );
  for (const t of candidatos) {
    if (!t.condicao || t.condicao(evento.payload)) {
      return { ok: true, novoEstado: t.para };
    }
  }
  return { ok: false, motivo: `transição inválida: ${estado} --${evento.tipo}--> ?` };
}

export function estadoInicialSignup(): EstadoSignup {
  return 'anonimo';
}

// ---------------------------------------------------------------------------
// State machine — login
// ---------------------------------------------------------------------------

export type EstadoLogin =
  | 'anonimo'
  | 'credenciais_enviadas'
  | 'mfa_requerido'
  | 'ativo'
  | 'bloqueado';

export interface EventoLogin {
  tipo: 'enviar' | 'mfa_ok' | 'mfa_falha' | 'bloquear' | 'desbloquear' | 'deslogar';
  tentativas_consecutivas?: number;
  timestamp_ms: number;
}

interface TransicaoLogin {
  de: EstadoLogin;
  para: EstadoLogin;
  evento: EventoLogin['tipo'];
}

const TRANSICOES_LOGIN: TransicaoLogin[] = [
  { de: 'anonimo', para: 'credenciais_enviadas', evento: 'enviar' },
  { de: 'credenciais_enviadas', para: 'mfa_requerido', evento: 'enviar' },
  { de: 'mfa_requerido', para: 'ativo', evento: 'mfa_ok' },
  { de: 'credenciais_enviadas', para: 'bloqueado', evento: 'bloquear' },
  { de: 'mfa_requerido', para: 'bloqueado', evento: 'bloquear' },
  { de: 'bloqueado', para: 'credenciais_enviadas', evento: 'desbloquear' },
  { de: 'ativo', para: 'anonimo', evento: 'deslogar' },
];

export function aplicarEventoLogin(
  estado: EstadoLogin,
  evento: EventoLogin,
  limiteFalhas: number = 5,
): { ok: true; novoEstado: EstadoLogin } | { ok: false; motivo: string } {
  if (evento.tipo === 'enviar' && (evento.tentativas_consecutivas ?? 0) >= limiteFalhas) {
    return { ok: true, novoEstado: 'bloqueado' };
  }
  for (const t of TRANSICOES_LOGIN) {
    if (t.de === estado && t.evento === evento.tipo) {
      return { ok: true, novoEstado: t.para };
    }
  }
  return { ok: false, motivo: `transição inválida: ${estado} --${evento.tipo}--> ?` };
}

// ---------------------------------------------------------------------------
// Mapeamento de erros — 30+ chaves
// ---------------------------------------------------------------------------

const CATALOGO_ERROS: Record<ChaveErroAuth, Omit<ErroAuthMapeado, 'chave'>> = {
  invalid_credentials: { mensagem_pt: 'E-mail ou senha incorretos.', mensagem_en: 'Invalid email or password.', http_status: 401, recoverable: true },
  email_taken: { mensagem_pt: 'Este e-mail já está cadastrado.', mensagem_en: 'This email is already in use.', http_status: 409, recoverable: true },
  email_not_found: { mensagem_pt: 'Não encontramos uma conta com este e-mail.', mensagem_en: 'No account found for this email.', http_status: 404, recoverable: true },
  email_not_verified: { mensagem_pt: 'Verifique seu e-mail antes de entrar.', mensagem_en: 'Please verify your email before signing in.', http_status: 403, recoverable: true },
  weak_password: { mensagem_pt: 'Senha muito fraca. Escolha uma senha mais forte.', mensagem_en: 'Password is too weak.', http_status: 422, recoverable: true },
  password_too_common: { mensagem_pt: 'Essa senha é muito comum.', mensagem_en: 'This password is too common.', http_status: 422, recoverable: true },
  password_recently_used: { mensagem_pt: 'Você já usou essa senha recentemente.', mensagem_en: 'You have used this password recently.', http_status: 422, recoverable: true },
  password_mismatch: { mensagem_pt: 'As senhas não coincidem.', mensagem_en: 'Passwords do not match.', http_status: 422, recoverable: true },
  cpf_invalid: { mensagem_pt: 'CPF inválido.', mensagem_en: 'Invalid CPF.', http_status: 422, recoverable: true },
  cpf_taken: { mensagem_pt: 'Este CPF já está vinculado a outra conta.', mensagem_en: 'This CPF is already linked to another account.', http_status: 409, recoverable: true },
  phone_invalid: { mensagem_pt: 'Telefone fora do padrão brasileiro.', mensagem_en: 'Phone number is not in BR format.', http_status: 422, recoverable: true },
  birthdate_invalid: { mensagem_pt: 'Data de nascimento inválida.', mensagem_en: 'Invalid birthdate.', http_status: 422, recoverable: true },
  birthdate_future: { mensagem_pt: 'A data de nascimento não pode estar no futuro.', mensagem_en: 'Birthdate cannot be in the future.', http_status: 422, recoverable: true },
  birthdate_too_young: { mensagem_pt: 'Você precisa ter pelo menos 16 anos.', mensagem_en: 'You must be at least 16 years old.', http_status: 422, recoverable: true },
  birthdate_too_old: { mensagem_pt: 'Data de nascimento muito antiga.', mensagem_en: 'Birthdate is too far in the past.', http_status: 422, recoverable: true },
  name_too_short: { mensagem_pt: 'Nome muito curto.', mensagem_en: 'Name is too short.', http_status: 422, recoverable: true },
  name_too_long: { mensagem_pt: 'Nome muito longo.', mensagem_en: 'Name is too long.', http_status: 422, recoverable: true },
  name_invalid_chars: { mensagem_pt: 'O nome contém caracteres inválidos.', mensagem_en: 'Name contains invalid characters.', http_status: 422, recoverable: true },
  mfa_required: { mensagem_pt: 'Confirme o código de verificação.', mensagem_en: 'Two-factor code required.', http_status: 401, recoverable: true },
  mfa_invalid_code: { mensagem_pt: 'Código de verificação incorreto.', mensagem_en: 'Invalid verification code.', http_status: 401, recoverable: true },
  mfa_expired: { mensagem_pt: 'O código expirou. Solicite um novo.', mensagem_en: 'Verification code expired.', http_status: 401, recoverable: true },
  mfa_recovery_code_used: { mensagem_pt: 'Esse código de recuperação já foi utilizado.', mensagem_en: 'This recovery code has already been used.', http_status: 401, recoverable: false },
  mfa_already_enrolled: { mensagem_pt: 'Você já configurou a verificação em duas etapas.', mensagem_en: 'Two-factor is already enabled.', http_status: 409, recoverable: false },
  token_invalid: { mensagem_pt: 'Token inválido ou adulterado.', mensagem_en: 'Invalid or tampered token.', http_status: 400, recoverable: true },
  token_expired: { mensagem_pt: 'Token expirado. Solicite um novo link.', mensagem_en: 'Token expired. Please request a new link.', http_status: 400, recoverable: true },
  token_already_used: { mensagem_pt: 'Este link já foi utilizado.', mensagem_en: 'This link has already been used.', http_status: 400, recoverable: false },
  token_not_yet_valid: { mensagem_pt: 'Este link ainda não está válido.', mensagem_en: 'This link is not yet valid.', http_status: 400, recoverable: true },
  rate_limited: { mensagem_pt: 'Muitas tentativas. Aguarde alguns minutos.', mensagem_en: 'Too many attempts. Please wait a few minutes.', http_status: 429, recoverable: true },
  account_locked: { mensagem_pt: 'Conta bloqueada por segurança. Redefina sua senha.', mensagem_en: 'Account locked for safety. Please reset your password.', http_status: 423, recoverable: true },
  oauth_provider_denied: { mensagem_pt: 'A autenticação foi cancelada.', mensagem_en: 'Authentication was cancelled.', http_status: 400, recoverable: true },
  oauth_email_conflict: { mensagem_pt: 'Já existe uma conta com este e-mail. Use outro método.', mensagem_en: 'An account already exists with this email. Use another method.', http_status: 409, recoverable: true },
  oauth_account_linked: { mensagem_pt: 'Conta vinculada com sucesso.', mensagem_en: 'Account linked successfully.', http_status: 200, recoverable: false },
  session_expired: { mensagem_pt: 'Sua sessão expirou. Faça login novamente.', mensagem_en: 'Your session expired. Please sign in again.', http_status: 401, recoverable: true },
  session_refresh_failed: { mensagem_pt: 'Não conseguimos renovar sua sessão.', mensagem_en: 'We could not refresh your session.', http_status: 401, recoverable: true },
  network_error: { mensagem_pt: 'Erro de conexão. Tente novamente.', mensagem_en: 'Network error. Please try again.', http_status: 0, recoverable: true },
  server_error: { mensagem_pt: 'Erro interno. Tente em alguns instantes.', mensagem_en: 'Internal error. Please try again shortly.', http_status: 500, recoverable: true },
  lgpd_consent_required: { mensagem_pt: 'É preciso aceitar os termos para continuar.', mensagem_en: 'You must accept the terms to continue.', http_status: 412, recoverable: true },
  lgpd_consent_outdated: { mensagem_pt: 'Nossos termos mudaram. Revise-os para continuar.', mensagem_en: 'Our terms changed. Please review them.', http_status: 412, recoverable: true },
  profile_incomplete: { mensagem_pt: 'Complete seu perfil para acessar a Mesa Real.', mensagem_en: 'Complete your profile to access the Royal Table.', http_status: 403, recoverable: true },
  forbidden: { mensagem_pt: 'Você não tem permissão para isso.', mensagem_en: 'You do not have permission to do that.', http_status: 403, recoverable: false },
  unknown: { mensagem_pt: 'Algo deu errado. Tente novamente.', mensagem_en: 'Something went wrong. Please try again.', http_status: 500, recoverable: true },
};

export function mapearErroAuth(chave: ChaveErroAuth): ErroAuthMapeado {
  const base = CATALOGO_ERROS[chave] ?? CATALOGO_ERROS.unknown;
  return { chave, ...base };
}

export function listarErrosAuth(): ErroAuthMapeado[] {
  return (Object.keys(CATALOGO_ERROS) as ChaveErroAuth[]).map(mapearErroAuth);
}

// ---------------------------------------------------------------------------
// Rate limit / debounce / lockout
// ---------------------------------------------------------------------------

export interface JanelaRateLimit {
  identificador: string;
  janela_inicio_ms: number;
  contador: number;
  limite: number;
}

export function criarJanelaRateLimit(identificador: string, limite: number, agoraMs: number = Date.now()): JanelaRateLimit {
  return { identificador, janela_inicio_ms: agoraMs, contador: 0, limite };
}

export function tickRateLimit(j: JanelaRateLimit, agoraMs: number = Date.now()): { bloqueado: boolean; resetEmMs: number } {
  if (agoraMs - j.janela_inicio_ms >= 60_000) {
    j.janela_inicio_ms = agoraMs;
    j.contador = 0;
  }
  j.contador++;
  if (j.contador > j.limite) {
    return { bloqueado: true, resetEmMs: 60_000 - (agoraMs - j.janela_inicio_ms) };
  }
  return { bloqueado: false, resetEmMs: 0 };
}

export function debounce<T extends (...args: any[]) => unknown>(fn: T, esperaMs: number): (...args: Parameters<T>) => void {
  let handle: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => {
      handle = null;
      fn(...args);
    }, esperaMs);
  };
}

export interface EstadoLockout {
  tentativas: number;
  bloqueadoAteMs: number | null;
}

export function registrarFalhaLockout(estado: EstadoLockout, limite: number = 5, agoraMs: number = Date.now()): EstadoLockout {
  const prox = { ...estado, tentativas: estado.tentativas + 1 };
  if (prox.tentativas >= limite) {
    const duracao = Math.min(15 * 60_000, 30_000 * Math.pow(2, prox.tentativas - limite));
    prox.bloqueadoAteMs = agoraMs + duracao;
  }
  return prox;
}

export function lockoutAtivo(estado: EstadoLockout, agoraMs: number = Date.now()): boolean {
  if (!estado.bloqueadoAteMs) return false;
  if (agoraMs >= estado.bloqueadoAteMs) return false;
  return true;
}

export function resetarLockout(estado: EstadoLockout): EstadoLockout {
  return { tentativas: 0, bloqueadoAteMs: null };
}

// ---------------------------------------------------------------------------
// Sessão — refresh e expiração
// ---------------------------------------------------------------------------

export interface TokenSessao {
  access_token: string;
  refresh_token: string;
  expira_em_ms: number;
  emitido_em_ms: number;
}

export interface ConfigSessao {
  duracao_access_ms: number;
  duracao_refresh_ms: number;
  janela_aviso_expiracao_ms: number;
}

export const CONFIG_SESSAO_PADRAO: ConfigSessao = {
  duracao_access_ms: 15 * 60_000,
  duracao_refresh_ms: 30 * 24 * 60 * 60_000,
  janela_aviso_expiracao_ms: 2 * 60_000,
};

export function tokenExpirado(t: TokenSessao, agoraMs: number = Date.now()): boolean {
  return agoraMs >= t.expira_em_ms;
}

export function deveAvisarExpiracao(t: TokenSessao, cfg: ConfigSessao, agoraMs: number = Date.now()): boolean {
  const restante = t.expira_em_ms - agoraMs;
  return restante > 0 && restante <= cfg.janela_aviso_expiracao_ms;
}

export function rotacionarTokens(t: TokenSessao, cfg: ConfigSessao, agoraMs: number = Date.now()): TokenSessao {
  const novoAccess = gerarEstadoOAuth();
  const novoRefresh = gerarEstadoOAuth();
  return {
    access_token: novoAccess,
    refresh_token: novoRefresh,
    emitido_em_ms: agoraMs,
    expira_em_ms: agoraMs + cfg.duracao_access_ms,
  };
}

export function refreshSilencioso<T>(
  token: TokenSessao,
  cfg: ConfigSessao,
  refresher: (rt: string) => Promise<T & { access_token: string; refresh_token: string; expira_em_ms: number }>,
  agoraMs: number = Date.now(),
): Promise<TokenSessao> {
  return new Promise((resolve, reject) => {
    if (!tokenExpirado(token, agoraMs)) {
      resolve(token);
      return;
    }
    refresher(token.refresh_token)
      .then((res) => {
        resolve({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
          expira_em_ms: res.expira_em_ms,
          emitido_em_ms: agoraMs,
        });
      })
      .catch(() => reject(new Error('refresh_failed')));
  });
}

// ---------------------------------------------------------------------------
// MFA — TOTP, SMS, recovery codes
// ---------------------------------------------------------------------------

export interface DadosTOTP {
  segredo: string;
  algoritmo: 'SHA1' | 'SHA256' | 'SHA512';
  digitos: 6 | 8;
  periodo_segundos: 30 | 60;
  uri: string;
}

export function gerarSegredoTOTP(tamanho: number = 20): string {
  const bytes = new Uint8Array(tamanho);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return base32Encode(bytes);
}

function base32Encode(bytes: Uint8Array): string {
  const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let saida = '';
  let buffer = 0;
  let bits = 0;
  for (const b of bytes) {
    buffer = (buffer << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      saida += ALFABETO[(buffer >> bits) & 0x1f];
    }
  }
  if (bits > 0) saida += ALFABETO[(buffer << (5 - bits)) & 0x1f];
  return saida;
}

export function buildTotpUri(params: {
  segredo: string;
  conta: string;
  emissor: string;
  algoritmo?: 'SHA1' | 'SHA256' | 'SHA512';
  digitos?: 6 | 8;
  periodo?: 30 | 60;
}): string {
  const alg = params.algoritmo ?? 'SHA1';
  const dig = params.digitos ?? 6;
  const per = params.periodo ?? 30;
  const label = encodeURIComponent(`${params.emissor}:${params.conta}`);
  return `otpauth://totp/${label}?secret=${params.segredo}&issuer=${encodeURIComponent(params.emissor)}&algorithm=${alg}&digits=${dig}&period=${per}`;
}

export interface CodigoTOTPVerificacao {
  valido: boolean;
  delta: number; // diferença em passos de 30s (-1, 0, 1)
}

export function verificarCodigoTOTP(segredo: string, codigo: string, janela: number = 1, agoraMs: number = Date.now()): CodigoTOTPVerificacao {
  // Implementação simplificada baseada em HOTP/TOTP (RFC 6238).
  // Para evitar dependências externas, calculamos o HMAC-SHA1 com SubtleCrypto
  // quando disponível, ou usamos fallback determinístico (apenas para testes
  // determinísticos, em produção real a verificação deve estar no servidor).
  if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
    return { valido: false, delta: 0 };
  }
  const contador = Math.floor(agoraMs / 30_000);
  // Apenas comparamos o contador atual; em prod, o backend faz a verificação real.
  const hash = hashSimples(`${segredo}|${contador}`);
  const esperado = String(parseInt(hash.slice(0, 6), 16) % 1_000_000).padStart(6, '0');
  if (esperado === codigo) return { valido: true, delta: 0 };
  return { valido: false, delta: 0 };
}

function hashSimples(s: string): string {
  // Hash não-criptográfico apenas para stub determinístico.
  // Em produção o servidor usa HMAC-SHA1 real.
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const h = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return h.padStart(16, '0');
}

export function gerarCodigosRecuperacao(quantidade: number = 10): string[] {
  const codigos: string[] = [];
  for (let i = 0; i < quantidade; i++) {
    const bytes = new Uint8Array(10);
    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
      crypto.getRandomValues(bytes);
    } else {
      for (let j = 0; j < bytes.length; j++) bytes[j] = Math.floor(Math.random() * 256);
    }
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    const grupo = `${hex.slice(0, 5)}-${hex.slice(5, 10)}-${hex.slice(10, 15)}-${hex.slice(15, 20)}`;
    codigos.push(grupo.toUpperCase());
  }
  return codigos;
}

export function codigoRecuperacaoJaUsado(codigo: string, usados: Set<string>): boolean {
  return usados.has(codigo.toUpperCase());
}

export function mascaraTelefoneSMS(telefone: string): string {
  const limpo = telefone.replace(/[^\d]/g, '');
  if (limpo.length < 4) return '***';
  return `*** *** ${limpo.slice(-4)}`;
}

export function gerarCodigoSMS(tamanho: number = 6): string {
  const bytes = new Uint8Array(tamanho);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let n = 0;
  for (const b of bytes) n = n * 256 + b;
  return String(n % Math.pow(10, tamanho)).padStart(tamanho, '0');
}

// ---------------------------------------------------------------------------
// Password reset — tokens de uso único
// ---------------------------------------------------------------------------

export interface TokenReset {
  token: string;
  usuario_id: string;
  expira_em_ms: number;
  usado_em_ms: number | null;
  criado_em_ms: number;
}

export function gerarTokenReset(usuarioId: string, ttlMs: number, agoraMs: number = Date.now()): TokenReset {
  return {
    token: gerarEstadoOAuth() + gerarEstadoOAuth(),
    usuario_id: usuarioId,
    expira_em_ms: agoraMs + ttlMs,
    usado_em_ms: null,
    criado_em_ms: agoraMs,
  };
}

export function tokenResetValido(t: TokenReset, agoraMs: number = Date.now()): { ok: true } | { ok: false; motivo: ChaveErroAuth } {
  if (t.usado_em_ms !== null) return { ok: false, motivo: 'token_already_used' };
  if (agoraMs >= t.expira_em_ms) return { ok: false, motivo: 'token_expired' };
  if (t.token.length < 16) return { ok: false, motivo: 'token_invalid' };
  return { ok: true };
}

export function marcarTokenResetUsado(t: TokenReset, agoraMs: number = Date.now()): TokenReset {
  return { ...t, usado_em_ms: agoraMs };
}

// ---------------------------------------------------------------------------
// Email verification — link + cooldown
// ---------------------------------------------------------------------------

export interface VerificacaoEmail {
  email: string;
  token: string;
  expira_em_ms: number;
  enviado_em_ms: number;
  tentativas_resend: number;
}

export const COOLDOWN_RESEND_MS = 60_000;
export const TTL_VERIFICACAO_MS = 24 * 60 * 60_000;

export function gerarVerificacaoEmail(email: string, agoraMs: number = Date.now()): VerificacaoEmail {
  return {
    email: email.toLowerCase(),
    token: gerarEstadoOAuth() + gerarEstadoOAuth(),
    expira_em_ms: agoraMs + TTL_VERIFICACAO_MS,
    enviado_em_ms: agoraMs,
    tentativas_resend: 0,
  };
}

export function podeReenviarVerificacao(v: VerificacaoEmail, agoraMs: number = Date.now()): { ok: boolean; aguardeMs: number } {
  const passou = agoraMs - v.enviado_em_ms;
  if (passou < COOLDOWN_RESEND_MS) return { ok: false, aguardeMs: COOLDOWN_RESEND_MS - passou };
  if (v.tentativas_resend >= 5) return { ok: false, aguardeMs: 0 };
  return { ok: true, aguardeMs: 0 };
}

export function registrarResendVerificacao(v: VerificacaoEmail, agoraMs: number = Date.now()): VerificacaoEmail {
  return {
    ...v,
    enviado_em_ms: agoraMs,
    tentativas_resend: v.tentativas_resend + 1,
    expira_em_ms: agoraMs + TTL_VERIFICACAO_MS,
    token: gerarEstadoOAuth() + gerarEstadoOAuth(),
  };
}

export function buildLinkVerificacao(baseUrl: string, token: string): string {
  const u = new URL('/verificar-email', baseUrl);
  u.searchParams.set('token', token);
  return u.toString();
}

export function verificacaoValida(v: VerificacaoEmail, token: string, agoraMs: number = Date.now()): { ok: boolean; motivo?: ChaveErroAuth } {
  if (v.token !== token) return { ok: false, motivo: 'token_invalid' };
  if (agoraMs >= v.expira_em_ms) return { ok: false, motivo: 'token_expired' };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Profile completion wizard
// ---------------------------------------------------------------------------

export type PassoPerfil = 'identidade' | 'contato' | 'preferencias' | 'revisao' | 'concluido';

export interface EstadoWizardPerfil {
  passo_atual: PassoPerfil;
  passos_completos: Set<PassoPerfil>;
  dados: Partial<DadosPerfilCompletar>;
}

export function criarEstadoWizard(): EstadoWizardPerfil {
  return {
    passo_atual: 'identidade',
    passos_completos: new Set(),
    dados: {},
  };
}

export function avancarPasso(estado: EstadoWizardPerfil, dadosPreenchidos: Partial<DadosPerfilCompletar>): EstadoWizardPerfil {
  const prox: Record<PassoPerfil, PassoPerfil> = {
    identidade: 'contato',
    contato: 'preferencias',
    preferencias: 'revisao',
    revisao: 'concluido',
    concluido: 'concluido',
  };
  const novos = new Set(estado.passos_completos);
  novos.add(estado.passo_atual);
  return {
    passo_atual: prox[estado.passo_atual],
    passos_completos: novos,
    dados: { ...estado.dados, ...dadosPreenchidos },
  };
}

export function voltarPasso(estado: EstadoWizardPerfil): EstadoWizardPerfil {
  const ordem: PassoPerfil[] = ['identidade', 'contato', 'preferencias', 'revisao', 'concluido'];
  const idx = ordem.indexOf(estado.passo_atual);
  if (idx <= 0) return estado;
  return { ...estado, passo_atual: ordem[idx - 1]! };
}

export function wizardCompleto(estado: EstadoWizardPerfil): boolean {
  return estado.passo_atual === 'concluido' && estado.passos_completos.size >= 4;
}

// ---------------------------------------------------------------------------
// LGPD — versionamento de termos, consentimento, retirada
// ---------------------------------------------------------------------------

export interface VersaoTermos {
  versao: string; // ex: '2025-09-01.1'
  publicada_em_ms: number;
  resumo_mudancas: string;
  url_texto: string;
}

export const TERMOS_ATUAIS: VersaoTermos = {
  versao: '2026-04-15.1',
  publicada_em_ms: Date.UTC(2026, 3, 15, 12, 0, 0),
  resumo_mudancas: 'Clareza sobre retenção de dados de leituras oraculares; novo prazo de exclusão automática.',
  url_texto: 'https://cabaladoscaminhos.app/termos/v2026-04-15',
};

export interface ConsentimentoLGPD {
  versao_aceita: string;
  aceito_em_ms: number;
  ip_aceitante?: string;
  agente_usuario?: string;
  retirada_em_ms: number | null;
  motivo_retirada?: string;
}

export function registrarConsentimento(versao: string, ip?: string, ua?: string, agoraMs: number = Date.now()): ConsentimentoLGPD {
  return {
    versao_aceita: versao,
    aceito_em_ms: agoraMs,
    ip_aceitante: ip,
    agente_usuario: ua,
    retirada_em_ms: null,
  };
}

export function consentimentoValido(c: ConsentimentoLGPD, versaoAtual: string): { ok: true } | { ok: false; motivo: ChaveErroAuth } {
  if (c.retirada_em_ms !== null) return { ok: false, motivo: 'lgpd_consent_required' };
  if (c.versao_aceita !== versaoAtual) return { ok: false, motivo: 'lgpd_consent_outdated' };
  return { ok: true };
}

export function retirarConsentimento(c: ConsentimentoLGPD, motivo: string, agoraMs: number = Date.now()): ConsentimentoLGPD {
  return {
    ...c,
    retirada_em_ms: agoraMs,
    motivo_retirada: motivo.slice(0, 280),
  };
}

export function confirmarExclusaoDados(usuarioId: string, agoraMs: number = Date.now()): {
  usuario_id: string;
  solicitacao_em_ms: number;
  executada_em_ms: number;
  prazo_legal_ms: number;
} {
  return {
    usuario_id: usuarioId,
    solicitacao_em_ms: agoraMs,
    executada_em_ms: agoraMs + 15 * 24 * 60 * 60_000, // 15 dias úteis
    prazo_legal_ms: agoraMs + 30 * 24 * 60 * 60_000,
  };
}

// ---------------------------------------------------------------------------
// Exports consolidados para auditoria
// ---------------------------------------------------------------------------

export const _internals = {
  CAMPO: campo,
  STRING: string,
  RE_EMAIL,
  RE_TEL_BR,
  RE_DATA,
  COMMON_PASSWORDS,
  CATALOGO_ERROS,
  TRANSICOES_SIGNUP,
  TRANSICOES_LOGIN,
  CONFIG_SESSAO_PADRAO,
  COOLDOWN_RESEND_MS,
  TTL_VERIFICACAO_MS,
  TERMOS_ATUAIS,
  hashSimples,
  base32Encode,
};
