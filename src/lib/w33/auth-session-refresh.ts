// src/lib/w33/auth-session-refresh.ts
// Cycle 33 worker A — auth session refresh + remember-me + 2FA recovery
// Composes w28/auth-login-signup + w28/mfa-enrollment + w31/auth-pages-ui
// Scope: token refresh, persistent session cookie, recovery codes UI helpers
// Namespace: w33 — self-contained, type-only deps on other waves

export type SessionTier = "anonymous" | "remembered" | "elevated" | "mfa_active";
export type RecoveryCodeStatus = "unused" | "used" | "revoked";

export interface SessionConfig {
  readonly accessTokenTtlSeconds: number;
  readonly refreshTokenTtlSeconds: number;
  readonly rememberMeTtlSeconds: number;
  readonly elevatedSessionTtlSeconds: number; // for sensitive ops
  readonly mfaSessionTtlSeconds: number; // for MFA-gated sessions
  readonly absoluteMaxSessionSeconds: number; // hard cap regardless of activity
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  accessTokenTtlSeconds: 60 * 15, // 15 min
  refreshTokenTtlSeconds: 60 * 60 * 24 * 30, // 30 days
  rememberMeTtlSeconds: 60 * 60 * 24 * 90, // 90 days
  elevatedSessionTtlSeconds: 60 * 15,
  mfaSessionTtlSeconds: 60 * 60 * 12, // 12 hours
  absoluteMaxSessionSeconds: 60 * 60 * 24 * 365, // 1 year hard cap
};

export interface SessionState {
  readonly userId: string;
  readonly tier: SessionTier;
  readonly issuedAt: number; // epoch seconds
  readonly lastRefreshedAt: number;
  readonly expiresAt: number;
  readonly absoluteExpiresAt: number;
  readonly mfaVerifiedAt: number | null;
  readonly fingerprint: string; // device fingerprint hash
  readonly rememberMe: boolean;
}

export interface RefreshDecision {
  readonly shouldRefresh: boolean;
  readonly shouldForceRelogin: boolean;
  readonly reason:
    | "fresh"
    | "ttl_threshold"
    | "ttl_expired"
    | "absolute_expired"
    | "fingerprint_mismatch"
    | "tier_promotion_needed";
  readonly secondsUntilExpiry: number;
}

const REFRESH_THRESHOLD_RATIO = 0.25; // refresh when 25% TTL remains

export function decideRefresh(
  session: SessionState,
  now: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
): RefreshDecision {
  const secondsUntilExpiry = session.expiresAt - now;
  const secondsUntilAbsolute = session.absoluteExpiresAt - now;

  if (secondsUntilAbsolute <= 0) {
    return {
      shouldRefresh: false,
      shouldForceRelogin: true,
      reason: "absolute_expired",
      secondsUntilExpiry: Math.max(0, secondsUntilExpiry),
    };
  }

  const totalTtl = session.expiresAt - session.issuedAt;
  const threshold = totalTtl * REFRESH_THRESHOLD_RATIO;
  if (secondsUntilExpiry <= 0) {
    return {
      shouldRefresh: false,
      shouldForceRelogin: true,
      reason: "ttl_expired",
      secondsUntilExpiry: 0,
    };
  }

  if (secondsUntilExpiry <= threshold) {
    return {
      shouldRefresh: true,
      shouldForceRelogin: false,
      reason: "ttl_threshold",
      secondsUntilExpiry,
    };
  }

  return {
    shouldRefresh: false,
    shouldForceRelogin: false,
    reason: "fresh",
    secondsUntilExpiry,
  };
}

export interface RefreshResult {
  readonly newSession: SessionState;
  readonly rotatedRefreshToken: boolean;
}

export function refreshSession(
  session: SessionState,
  now: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
): RefreshResult {
  const totalTtl = session.expiresAt - session.issuedAt;
  const newIssuedAt = now;
  const newExpiresAt = now + totalTtl;
  const newSession: SessionState = {
    ...session,
    issuedAt: newIssuedAt,
    lastRefreshedAt: now,
    expiresAt: newExpiresAt,
  };
  return { newSession, rotatedRefreshToken: true };
}

export interface RecoveryCode {
  readonly id: string;
  readonly code: string; // xxxx-xxxx-xxxx
  readonly status: RecoveryCodeStatus;
  readonly usedAt: number | null;
  readonly usedFromIp: string | null;
}

export interface RecoveryCodeValidation {
  readonly valid: boolean;
  readonly reason: "ok" | "not_found" | "already_used" | "revoked" | "format_invalid";
  readonly remainingUnused: number;
}

const RECOVERY_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function validateRecoveryCode(
  input: string,
  codes: ReadonlyArray<RecoveryCode>,
): RecoveryCodeValidation {
  const normalized = input.trim().toUpperCase();
  if (!RECOVERY_CODE_PATTERN.test(normalized)) {
    const remaining = codes.filter((c) => c.status === "unused").length;
    return { valid: false, reason: "format_invalid", remainingUnused: remaining };
  }
  const found = codes.find((c) => c.code === normalized);
  if (!found) {
    const remaining = codes.filter((c) => c.status === "unused").length;
    return { valid: false, reason: "not_found", remainingUnused: remaining };
  }
  if (found.status === "used") {
    const remaining = codes.filter((c) => c.status === "unused").length;
    return { valid: false, reason: "already_used", remainingUnused: remaining };
  }
  if (found.status === "revoked") {
    const remaining = codes.filter((c) => c.status === "unused").length;
    return { valid: false, reason: "revoked", remainingUnused: remaining };
  }
  const remaining = codes.filter((c) => c.status === "unused").length - 1;
  return { valid: true, reason: "ok", remainingUnused: Math.max(0, remaining) };
}

export function generateRecoveryCodes(count: number = 10): ReadonlyArray<RecoveryCode> {
  const out: RecoveryCode[] = [];
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
  for (let i = 0; i < count; i++) {
    const segments: string[] = [];
    for (let s = 0; s < 3; s++) {
      let seg = "";
      for (let c = 0; c < 4; c++) {
        seg += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      segments.push(seg);
    }
    out.push({
      id: `rc_${i.toString().padStart(2, "0")}_${Date.now()}`,
      code: segments.join("-"),
      status: "unused",
      usedAt: null,
      usedFromIp: null,
    });
  }
  return out;
}

export function tierForOperation(
  op: "view_public" | "post_content" | "edit_profile" | "delete_account" | "change_password" | "view_recovery_codes" | "transfer_funds",
  mfaEnabled: boolean,
): SessionTier {
  if (op === "view_public") return "anonymous";
  if (op === "post_content" || op === "edit_profile") {
    return mfaEnabled ? "elevated" : "remembered";
  }
  if (op === "delete_account" || op === "change_password" || op === "view_recovery_codes" || op === "transfer_funds") {
    return mfaEnabled ? "mfa_active" : "elevated";
  }
  return "anonymous";
}
