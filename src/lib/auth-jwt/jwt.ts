import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const ALGORITHM = 'HS256';
const TOKEN_EXPIRY = '24h';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes for HS256');
  }
  return new TextEncoder().encode(secret);
}

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
}

export async function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = getSecret();
  
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALGORITHM] });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}