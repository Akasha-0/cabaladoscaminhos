// ============================================================================
// SECURITY INDEX — Wave 34 / Security Hardening 6/8
// ============================================================================
// Public surface de `src/lib/security/*`. Mantém os imports do app limpos:
//   import { checkRateLimitV2, validatePassword } from '@/lib/security';
//
// LGPD Art. 37 (registro de operações) + Art. 46 (segurança técnica) +
// OWASP Top 10 2023 + ASVS V2.1 (Level 2 target).
// ============================================================================

export {
  checkRateLimitV2,
  assertAllowed,
  getClientIp,
  RATE_LIMIT_PRESETS,
  type RateLimitPresetKey,
  type RateLimitVerdict,
  type TokenBucketConfig,
} from './rate-limit-v2';

export {
  validatePassword,
  estimateEntropyBits,
  charsetDiversity,
  PASSWORD_POLICY,
  type PasswordIssue,
  type PasswordIssueCode,
  type PasswordValidationResult,
} from './password';

export {
  SESSION_POLICY,
  isSessionExpired,
  recordFailedLogin,
  isAccountLocked,
  clearFailedLogins,
  generateTOTPSecret,
  verifyTOTPCode,
  generateCSRFToken,
  verifyCSRFToken,
  IDORError,
  assertOwnerOrAdmin,
  type SessionTimestamps,
  type SessionExpiryReason,
} from './session';

// ============================================================================
// Security policy snapshot — usado em admin/diagnostics
// ============================================================================
export const SECURITY_POLICY_VERSION = 'W34-6.8.0';
