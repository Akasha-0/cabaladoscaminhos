// ============================================================================
// W72 Auth Pages — In-process user store (server-side)
// ----------------------------------------------------------------------------
// Mirrors the password-recovery engine's _userRegistry. The w68 engine
// already maintains an in-memory user registry; we extend it with extra
// profile fields (displayName, birthDate, createdAt) and email-verification
// status. Production swaps this for Prisma.
// ============================================================================

export interface UserRecord {
  userId: string;
  email: string;
  passwordHash: string;
  displayName: string;
  birthDate: string | null;
  birthDataOptIn: boolean;
  emailVerified: boolean;
  totpEnabled: boolean;
  createdAt: number;
}

const _users = new Map<string, UserRecord>(); // userId -> record
const _userIndexByEmail = new Map<string, string>(); // email -> userId

let _userCounter = 0;
function nextUserId(): string {
  _userCounter = (_userCounter + 1) >>> 0;
  return `usr_${Date.now().toString(36)}${_userCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName: string;
  birthDate?: string | null;
  birthDataOptIn?: boolean;
}

export function createUser(input: CreateUserInput): { ok: true; user: UserRecord } | { ok: false; reason: 'EMAIL_TAKEN' } {
  const email = input.email.toLowerCase();
  if (_userIndexByEmail.has(email)) {
    return { ok: false, reason: 'EMAIL_TAKEN' };
  }
  const userId = nextUserId();
  const record: UserRecord = {
    userId,
    email,
    passwordHash: input.passwordHash,
    displayName: input.displayName,
    birthDate: input.birthDate ?? null,
    birthDataOptIn: input.birthDataOptIn ?? false,
    emailVerified: false,
    totpEnabled: false,
    createdAt: Date.now(),
  };
  _users.set(userId, record);
  _userIndexByEmail.set(email, userId);
  return { ok: true, user: record };
}

export function findUserByEmail(email: string): UserRecord | null {
  const norm = email.toLowerCase();
  const id = _userIndexByEmail.get(norm);
  if (!id) return null;
  return _users.get(id) ?? null;
}

export function findUserById(userId: string): UserRecord | null {
  return _users.get(userId) ?? null;
}

export function markEmailVerified(userId: string): boolean {
  const rec = _users.get(userId);
  if (!rec) return false;
  rec.emailVerified = true;
  return true;
}

export function clearAllUsersForTest(): void {
  _users.clear();
  _userIndexByEmail.clear();
  _userCounter = 0;
}

export const __ALL_EXPORTS = {
  functions: ['createUser', 'findUserByEmail', 'findUserById', 'markEmailVerified', 'clearAllUsersForTest'],
} as const;
