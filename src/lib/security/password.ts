// ============================================================================
// PASSWORD COMPLEXITY + ENTROPY — Wave 34 / Security Hardening 6/8
// ============================================================================
// Regras (NIST SP 800-63B + OWASP ASVS V2.1):
//   - Mínimo 12 caracteres (não máximo — comprimentos arbitrários enfraquecem).
//   - Entropia mínima de ~50 bits = ~14 chars random de alfabeto completo.
//   - Bloqueio de senhas vazadas via hash (lista top-10k do Have I Been Pwned
//     via k-anonymity API — opcional, gatilho em produção).
//   - Sem exigência cega de símbolos/números: NIST derruba em 2024. Mas
//     verificamos charset diversity mínima (3 de 4 classes).
//   - Email como senha é proibido (case-insensitive).
//   - Nome do usuário / displayName como senha é proibido.
//
// LGPD Art. 46 — medidas técnicas adequadas para proteger dados pessoais,
// incluindo credenciais.
// ============================================================================

// ============================================================================
// Common top-passwords (sanitized subset — em prod, consultar HIBP k-anonymity)
// ============================================================================
const COMMON_PASSWORDS = new Set([
  'password', '12345678', 'qwertyuiop', 'admin1234',
  'iloveyou12', 'welcome123', 'sunshine12', 'password12',
  'qwerty1234', 'abcdefghij', 'letmein12345', 'monkey12345',
  '1111111111', 'asdfghjkl1', 'zaq12wsxcde', 'password12345',
  'qwertyuiop12', 'passw0rd12', 'p@ssw0rd12',
]);

// ============================================================================
// Entropy (Shannon) — caracteres únicos vs comprimento
// ============================================================================
// Rough estimate: bits = len * log2(charset). Limitamos a 80 bits como
// máximo teórico para evitar overflow em senhas absurdas.

function charsetSize(pwd: string): number {
  let size = 0;
  if (/[a-z]/.test(pwd)) size += 26;
  if (/[A-Z]/.test(pwd)) size += 26;
  if (/[0-9]/.test(pwd)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) size += 33; // símbolos comuns
  if (/\s/.test(pwd)) size += 1;
  return Math.max(1, size);
}

export function estimateEntropyBits(password: string): number {
  if (password.length === 0) return 0;
  const size = charsetSize(password);
  return Math.min(80, Math.log2(size) * password.length);
}

// ============================================================================
// Classes de charset presentes
// ============================================================================
export function charsetDiversity(password: string): number {
  let classes = 0;
  if (/[a-z]/.test(password)) classes++;
  if (/[A-Z]/.test(password)) classes++;
  if (/[0-9]/.test(password)) classes++;
  if (/[^a-zA-Z0-9]/.test(password)) classes++;
  return classes;
}

// ============================================================================
// Issue shapes
// ============================================================================

export type PasswordIssueCode =
  | 'too_short'
  | 'too_long'
  | 'low_entropy'
  | 'low_diversity'
  | 'common'
  | 'contains_email'
  | 'contains_display_name'
  | 'sequential_chars'
  | 'all_same_char';

export interface PasswordIssue {
  code: PasswordIssueCode;
  message: string;
}

export interface PasswordValidationResult {
  ok: boolean;
  entropyBits: number;
  diversity: number;
  issues: PasswordIssue[];
}

// ============================================================================
// Constantes de política
// ============================================================================
export const PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  minEntropyBits: 50,
  minCharsetDiversity: 3,
  rejectSequential: true,
} as const;

// ============================================================================
// Main: validatePassword
// ============================================================================
export function validatePassword(
  password: string,
  context?: { email?: string; displayName?: string }
): PasswordValidationResult {
  const issues: PasswordIssue[] = [];

  // 1. Comprimento
  if (password.length < PASSWORD_POLICY.minLength) {
    issues.push({
      code: 'too_short',
      message: `Mínimo ${PASSWORD_POLICY.minLength} caracteres (atual: ${password.length}).`,
    });
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    issues.push({
      code: 'too_long',
      message: `Máximo ${PASSWORD_POLICY.maxLength} caracteres.`,
    });
  }

  // 2. Entropia
  const entropy = estimateEntropyBits(password);
  if (
    password.length >= PASSWORD_POLICY.minLength &&
    entropy < PASSWORD_POLICY.minEntropyBits
  ) {
    issues.push({
      code: 'low_entropy',
      message: `Senha previsível. Use frases longas ou caracteres diversos (entropia: ${entropy.toFixed(0)} bits, mínimo: ${PASSWORD_POLICY.minEntropyBits}).`,
    });
  }

  // 3. Diversidade de charset
  const diversity = charsetDiversity(password);
  if (diversity < PASSWORD_POLICY.minCharsetDiversity) {
    issues.push({
      code: 'low_diversity',
      message: `Use ao menos ${PASSWORD_POLICY.minCharsetDiversity} das 4 classes: minúsculas, MAIÚSCULAS, números e símbolos.`,
    });
  }

  // 4. Lista comum (case-insensitive, normalizada)
  const normalized = password.toLowerCase().trim();
  if (COMMON_PASSWORDS.has(normalized)) {
    issues.push({
      code: 'common',
      message: 'Esta senha está em listas públicas de vazamentos. Escolha outra.',
    });
  }

  // 5. Sequências (abc, 123, qwerty)
  if (PASSWORD_POLICY.rejectSequential && hasSequentialChars(password)) {
    issues.push({
      code: 'sequential_chars',
      message: 'Evite sequências óbvias como "abcd", "1234" ou "qwerty".',
    });
  }

  // 6. Tudo igual
  if (/^(.)\1+$/.test(password)) {
    issues.push({
      code: 'all_same_char',
      message: 'A senha não pode ser composta por caracteres repetidos.',
    });
  }

  // 7. Contém email (local-part) — case-insensitive
  if (context?.email) {
    const local = context.email.split('@')[0]?.toLowerCase();
    if (local && local.length >= 4 && normalized.includes(local)) {
      issues.push({
        code: 'contains_email',
        message: 'A senha não pode conter seu próprio email.',
      });
    }
  }

  // 8. Contém displayName (mínimo 4 chars)
  if (context?.displayName) {
    const name = context.displayName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    if (name.length >= 4 && normalized.includes(name)) {
      issues.push({
        code: 'contains_display_name',
        message: 'A senha não pode conter seu nome.',
      });
    }
  }

  return {
    ok: issues.length === 0,
    entropyBits: entropy,
    diversity,
    issues,
  };
}

// ============================================================================
// Sequential detector — 4+ caracteres consecutivos em teclado ou alfabeto
// ============================================================================

const SEQUENCES = [
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
];

function hasSequentialChars(pwd: string): boolean {
  const lower = pwd.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const chunk = seq.slice(i, i + 4);
      if (lower.includes(chunk)) return true;
      // Reverso (ex.: 4321)
      if (lower.includes(chunk.split('').reverse().join(''))) return true;
    }
  }
  return false;
}
