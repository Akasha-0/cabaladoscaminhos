// src/lib/w28/mfa-enrollment.ts
// Cycle 28 — MFA enrollment flow (TOTP + recovery codes).
// Pure types + stub functions; consumer wires to speakeasy/otplib and storage.

import { z } from "zod";

/** TOTP secret + otpauth URL returned by /api/auth/mfa/enroll. */
export interface MfaEnrollmentChallenge {
  /** Base32 TOTP secret (user stores in authenticator app). */
  secret: string;
  /** otpauth:// URI for QR code generation. */
  otpauthUrl: string;
  /** Server-issued challenge id, valid for 5 minutes. */
  challengeId: string;
}

/** 6-digit TOTP code typed by the user to confirm enrollment. */
export const TotpCodeSchema = z.string().regex(/^\d{6}$/, "Código de 6 dígitos");

/** One-time recovery code (10 chars, base32). */
export const RecoveryCodeSchema = z.string().regex(/^[A-Z0-9]{10}$/);

export interface MfaEnrollmentResult {
  enrolledAt: string; // ISO timestamp
  recoveryCodes: string[]; // 10 single-use codes
}

export type MfaStatus = "disabled" | "enrolling" | "enabled" | "locked";

export interface MfaState {
  status: MfaStatus;
  enrolledAt: string | null;
  recoveryCodesRemaining: number;
}

/** Stub — server-side enrollment challenge generation. */
export async function startMfaEnrollment(userId: string): Promise<MfaEnrollmentChallenge> {
  return {
    secret: "",
    otpauthUrl: "",
    challengeId: "",
  };
}

/** Stub — confirm enrollment with 6-digit code. */
export async function confirmMfaEnrollment(
  challengeId: string,
  code: string
): Promise<MfaEnrollmentResult> {
  return {
    enrolledAt: new Date().toISOString(),
    recoveryCodes: [],
  };
}
