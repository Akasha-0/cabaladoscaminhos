// ============================================================================
// LGPD PUBLIC API — Wave 37 / Compliance 7/8
// ============================================================================
// Public surface de `src/lib/lgpd/*`.
//
// Filosofia:
//   - import { recordConsent, requestDataExport, ... } from '@/lib/lgpd'
//   - 6 módulos: consent, data-export, data-deletion, data-minimization,
//     audit-logger (privacy/data-deletion.ts de W11 preservado).
//
// NÃO importar arquivos individuais diretamente — passar pelo barrel.
// ============================================================================

// Consent management
export {
  recordConsent,
  withdrawConsent,
  getConsentState,
  getCurrentConsentVersion,
  hasConsent,
  publishConsentTextVersion,
  reconsentQueueSize,
  CURRENT_CONSENT_VERSION,
  DEFAULT_DENIED,
  type ConsentCategory,
  type SpecificConsents,
  type ConsentState,
  type ConsentInput,
  type ConsentRecordWithdrawal,
} from './consent';

// Data export (LGPD Art. 18, V)
export {
  requestDataExport,
  processDataExport,
  aggregateUserData,
  expireOldExports,
  listExportRequestsForUser,
  encryptExportWithPassword,
  type ExportFormat,
  type ExportStatus,
  type ExportRequestInput,
  type ExportRequestResult,
  type ExportedData,
} from './data-export';

// Right to be forgotten (LGPD Art. 18, VI)
export {
  requestDataDeletion,
  cancelDataDeletion,
  executeHardDelete,
  pendingHardDeletes,
  pendingDeletionRequestsCount,
  type DeletionRequestInput,
  type DeletionRequestResult,
  type HardDeleteResult,
} from './data-deletion';

// Data minimization (LGPD Art. 6°, 9°, 12)
export {
  detectExcessiveFields,
  redactPII,
  setupLogRedaction,
  aggregateAnalyticsOnly,
  findUnusedPIIFields,
  REQUIRED_FIELDS_BY_PURPOSE,
  type ExcessiveFieldReport,
  type AggregateOptions,
  type AggregateResult,
} from './data-minimization';

// Audit logger (LGPD Art. 37)
export {
  logSensitiveAction,
  verifyAuditChain,
  pruneExpiredAuditLogs,
  auditStats,
  type SensitiveAction,
  type AuditLogInput,
  type AuditLogResult,
  type AuditVerifyResult,
  type AuditStats,
} from './audit-logger';

// ============================================================================
// Compliance version snapshot
// ============================================================================

export const LGPD_COMPLIANCE_VERSION = 'W37-7.0.0';

/** Articles of LGPD covered by this module. */
export const COVERED_LGPD_ARTICLES = [
  { article: 5, title: 'Definições', note: 'PII, dado sensível, tratamento' },
  { article: 6, title: 'Princípios', note: 'necessidade, adequação, finalidade' },
  { article: 7, title: 'Bases legais', note: 'consentimento + legítimo interesse' },
  { article: 8, title: 'Consentimento', note: 'granular + versionado + revogável' },
  { article: 9, title: 'Princípio da necessidade', note: 'data minimization' },
  { article: 12, title: 'Minimização', note: 'aggregate-only analytics' },
  { article: 14, title: 'Informação ao titular', note: 'privacy policy + cookie banner' },
  { article: 16, title: 'Retenção', note: '5 anos audit, 30d soft delete' },
  { article: 18, title: 'Direitos do titular', note: 'acesso, correção, exclusão, portabilidade' },
  { article: 19, title: 'Portabilidade', note: 'export JSON/CSV/PDF, 7d expiry' },
  { article: 37, title: 'Registro de operações', note: 'audit log + hash chain' },
  { article: 38, title: 'Boas práticas', note: 'ISO 27000, NIST 800-53' },
  { article: 46, title: 'Segurança técnica', note: 'AES-256-GCM, PBKDF2, hash IP' },
];