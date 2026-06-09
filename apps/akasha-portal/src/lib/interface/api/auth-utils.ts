// ============================================================
// AUTH UTILITIES - CABALA DOS CAMINHOS
// ============================================================
// Shared authentication utilities for API routes.
//
// Clone group: 5267e65b (36 lines, 3 instances)
// Pattern: Token validation middleware pattern
// Files: auth/login, mfa/recovery, mfa/verify routes
// ============================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Create Supabase server client with cookie handling
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore errors from read-only context
          }
        },
      },
    }
  );
}

async function validateAuthToken(): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: error?.message || 'Usuário não autenticado',
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        role: user.role,
      },
      error: null,
    };
  } catch (err) {
    console.error('[Auth validation error]', err);
    return {
      user: null,
      error: 'Erro na validação do token',
    };
  }
}

async function requireAuth(): Promise<AuthResult> {
  const result = await validateAuthToken();

  if (result.error) {
    return result;
  }

  return result;
}

async function checkAuth(): Promise<AuthUser | null> {
  const result = await validateAuthToken();
  return result.user;
}

function unauthorizedResponse(message = 'Não autorizado'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
function forbiddenResponse(message = 'Acesso negado'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'FORBIDDEN',
    },
    { status: 403 }
  );
}
