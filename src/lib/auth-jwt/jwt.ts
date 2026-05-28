import jwt from 'jsonwebtoken';

const ALGORITHM = 'HS256';
const TOKEN_EXPIRY = '24h';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes for HS256');
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = getSecret();
  return jwt.sign(payload, secret, { algorithm: ALGORITHM, expiresIn: TOKEN_EXPIRY });
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecret();
    const payload = jwt.verify(token, secret, { algorithms: [ALGORITHM] }) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}
