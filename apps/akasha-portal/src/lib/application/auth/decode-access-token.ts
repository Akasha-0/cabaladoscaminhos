/**
 * decode-access-token.ts
 *
 * Edge-Runtime-compatible JWT access token expiry extraction.
 * Decodes the base64url payload WITHOUT cryptographic verification — only reads the `exp` claim.
 *
 * Why not `jwt.decode()`? `jsonwebtoken` uses `Buffer`, unavailable in Edge Runtime.
 * `atob()` is the Edge-native base64 decoder.
 *
 * Security note: decoding without verification is safe here ONLY because we use this
 * to check *expiry*, not to grant access. Cryptographic verification happens later
 * in the RSC via `verifyAkashaToken()` which IS cryptographic.
 */

/**
 * Decode the `exp` claim from an access token without verification.
 * Returns Unix timestamp (seconds) or null if token is absent/unparseable.
 */
export function decodeAccessTokenExp(accessToken: string | undefined): number | null {
 if (!accessToken) return null;
 try {
  const parts = accessToken.split('.');
  if (parts.length !== 3) return null;
  // atob() is available in Edge Runtime (not Buffer)
  const payload = JSON.parse(atob(parts[1]));
  return typeof payload.exp === 'number' ? payload.exp : null;
 } catch {
  return null;
 }
}
