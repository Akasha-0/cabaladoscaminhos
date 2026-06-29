/**
 * w31/auth-pages-ui
 *
 * UI helpers + state shapes for the /login and /signup pages. Extends
 * w28/auth-login-signup (the auth API contract) with page-level
 * concerns: form validation, error formatting, locale-aware labels,
 * and a "social login" CTA order.
 *
 * PURE module. No DOM, no fetch, no router.
 */

export type AuthProvider = "google" | "apple" | "facebook";

export interface AuthSession {
  userId: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "RATE_LIMITED"
  | "NETWORK"
  | "MFA_REQUIRED"
  | "SERVER";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
}

export type AuthPage = "login" | "signup" | "forgot" | "reset";

export type AuthLocale = "pt-BR" | "en" | "es";

export interface AuthLabels {
  pageTitle: Record<AuthPage, string>;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  displayNameLabel: string;
  submitButton: Record<AuthPage, string>;
  switchPrompt: Record<AuthPage, string>;
  switchLink: Record<AuthPage, { label: string; target: AuthPage }>;
  forgotLink: string;
  socialSectionTitle: string;
  mfaPrompt: string;
  errors: {
    emailInvalid: string;
    passwordTooShort: string;
    passwordsDontMatch: string;
    displayNameRequired: string;
    network: string;
    rateLimited: string;
    generic: string;
  };
}

export const LABELS: Record<AuthLocale, AuthLabels> = {
  "pt-BR": {
    pageTitle: {
      login: "Entrar",
      signup: "Criar conta",
      forgot: "Recuperar senha",
      reset: "Definir nova senha",
    },
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    confirmPasswordLabel: "Confirmar senha",
    displayNameLabel: "Como podemos te chamar?",
    submitButton: {
      login: "Entrar",
      signup: "Criar conta",
      forgot: "Enviar link de recuperação",
      reset: "Salvar nova senha",
    },
    switchPrompt: {
      login: "Ainda não tem conta?",
      signup: "Já tem conta?",
      forgot: "Lembrou a senha?",
      reset: "",
    },
    switchLink: {
      login: { label: "Criar conta", target: "signup" },
      signup: { label: "Entrar", target: "login" },
      forgot: { label: "Entrar", target: "login" },
      reset: { label: "Entrar", target: "login" },
    },
    forgotLink: "Esqueci minha senha",
    socialSectionTitle: "ou continue com",
    mfaPrompt: "Confirme o código do seu aplicativo autenticador",
    errors: {
      emailInvalid: "Informe um e-mail válido",
      passwordTooShort: "Sua senha precisa ter pelo menos 8 caracteres",
      passwordsDontMatch: "As senhas não conferem",
      displayNameRequired: "Como podemos te chamar?",
      network: "Sem conexão. Tente novamente.",
      rateLimited: "Muitas tentativas. Aguarde um instante.",
      generic: "Algo deu errado. Tente de novo.",
    },
  },
  en: {
    pageTitle: {
      login: "Sign in",
      signup: "Create your account",
      forgot: "Reset your password",
      reset: "Set a new password",
    },
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    displayNameLabel: "What should we call you?",
    submitButton: {
      login: "Sign in",
      signup: "Create account",
      forgot: "Send reset link",
      reset: "Save new password",
    },
    switchPrompt: {
      login: "Don't have an account?",
      signup: "Already have an account?",
      forgot: "Remembered your password?",
      reset: "",
    },
    switchLink: {
      login: { label: "Create account", target: "signup" },
      signup: { label: "Sign in", target: "login" },
      forgot: { label: "Sign in", target: "login" },
      reset: { label: "Sign in", target: "login" },
    },
    forgotLink: "Forgot password",
    socialSectionTitle: "or continue with",
    mfaPrompt: "Enter the code from your authenticator app",
    errors: {
      emailInvalid: "Please enter a valid email",
      passwordTooShort: "Password must be at least 8 characters",
      passwordsDontMatch: "Passwords do not match",
      displayNameRequired: "What should we call you?",
      network: "No connection. Please try again.",
      rateLimited: "Too many attempts. Please wait a moment.",
      generic: "Something went wrong. Please try again.",
    },
  },
  es: {
    pageTitle: {
      login: "Iniciar sesión",
      signup: "Crear cuenta",
      forgot: "Recuperar contraseña",
      reset: "Definir nueva contraseña",
    },
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    confirmPasswordLabel: "Confirmar contraseña",
    displayNameLabel: "¿Cómo podemos llamarte?",
    submitButton: {
      login: "Entrar",
      signup: "Crear cuenta",
      forgot: "Enviar enlace de recuperación",
      reset: "Guardar nueva contraseña",
    },
    switchPrompt: {
      login: "¿Aún no tienes cuenta?",
      signup: "¿Ya tienes cuenta?",
      forgot: "¿Recordaste la contraseña?",
      reset: "",
    },
    switchLink: {
      login: { label: "Crear cuenta", target: "signup" },
      signup: { label: "Entrar", target: "login" },
      forgot: { label: "Entrar", target: "login" },
      reset: { label: "Entrar", target: "login" },
    },
    forgotLink: "Olvidé mi contraseña",
    socialSectionTitle: "o continúa con",
    mfaPrompt: "Confirma el código de tu app autenticadora",
    errors: {
      emailInvalid: "Ingresa un correo válido",
      passwordTooShort: "La contraseña debe tener al menos 8 caracteres",
      passwordsDontMatch: "Las contraseñas no coinciden",
      displayNameRequired: "¿Cómo podemos llamarte?",
      network: "Sin conexión. Inténtalo de nuevo.",
      rateLimited: "Demasiados intentos. Espera un momento.",
      generic: "Algo salió mal. Inténtalo de nuevo.",
    },
  },
};

export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  if (email.length < 3 || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  locale: AuthLocale;
}

export interface LoginForm {
  email: string;
  password: string;
  locale: AuthLocale;
}

export interface ForgotForm {
  email: string;
  locale: AuthLocale;
}

export interface ResetForm {
  password: string;
  confirmPassword: string;
  token: string;
  locale: AuthLocale;
}

export type FormErrors = Partial<Record<string, string>>;

export function validateSignup(form: SignupForm, labels: AuthLabels): FormErrors {
  const errors: FormErrors = {};
  if (!isValidEmail(form.email)) errors.email = labels.errors.emailInvalid;
  if (!form.password || form.password.length < 8) errors.password = labels.errors.passwordTooShort;
  if (form.password !== form.confirmPassword) errors.confirmPassword = labels.errors.passwordsDontMatch;
  if (!form.displayName || form.displayName.trim().length < 2) errors.displayName = labels.errors.displayNameRequired;
  return errors;
}

export function validateLogin(form: LoginForm, labels: AuthLabels): FormErrors {
  const errors: FormErrors = {};
  if (!isValidEmail(form.email)) errors.email = labels.errors.emailInvalid;
  if (!form.password) errors.password = labels.errors.passwordTooShort;
  return errors;
}

export function validateReset(form: ResetForm, labels: AuthLabels): FormErrors {
  const errors: FormErrors = {};
  if (!form.password || form.password.length < 8) errors.password = labels.errors.passwordTooShort;
  if (form.password !== form.confirmPassword) errors.confirmPassword = labels.errors.passwordsDontMatch;
  return errors;
}

export function validateForgot(form: ForgotForm, labels: AuthLabels): FormErrors {
  const errors: FormErrors = {};
  if (!isValidEmail(form.email)) errors.email = labels.errors.emailInvalid;
  return errors;
}

export function labelsFor(locale: AuthLocale): AuthLabels {
  return LABELS[locale] ?? LABELS["pt-BR"];
}

export function socialCtaOrder(locale: AuthLocale): AuthProvider[] {
  if (locale === "pt-BR") return ["google", "apple", "facebook"];
  if (locale === "es") return ["google", "apple", "facebook"];
  return ["apple", "google", "facebook"];
}

export function authErrorToMessageKey(err: AuthError, labels: AuthLabels): string {
  switch (err.code) {
    case "INVALID_CREDENTIALS":
      return labels.errors.generic;
    case "EMAIL_TAKEN":
      return labels.errors.generic;
    case "RATE_LIMITED":
      return labels.errors.rateLimited;
    case "NETWORK":
      return labels.errors.network;
    case "MFA_REQUIRED":
      return labels.errors.generic;
    case "SERVER":
    default:
      return labels.errors.generic;
  }
}

export function shouldShowVerifyEmailBanner(session: AuthSession | null): boolean {
  if (!session) return false;
  if (session.emailVerified) return false;
  return true;
}
