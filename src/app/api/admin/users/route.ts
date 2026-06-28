// ============================================================================
// GET /api/admin/users — listagem paginada de usuários (Wave 20)
// ============================================================================
// Query params:
//   q          — busca por nome ou email (case-insensitive)
//   banned     — true|false (filtra por existência de ADMIN_USER_BAN em AuditLog)
//   mentor     — true|false
//   tradition  — slug canônico (cabala, ifa, ...)
//   sort       — recent | name | engagement
//   page       — 1-based
//   pageSize   — default 20, max 100
//
// Retorna: { data: AdminUserListItem[], total, page, pageSize }
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { getAdminUsers } from '@/lib/admin/metrics';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  banned: z.enum(['true', 'false']).optional(),
  mentor: z.enum(['true', 'false']).optional(),
  tradition: z.string().trim().max(50).optional(),
  sort: z.enum(['recent', 'name', 'engagement']).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(403, ErrorCode.FORBIDDEN, `Admin required (${session.reason})`);
    }

    const sp = request.nextUrl.searchParams;
    const parsed = QuerySchema.safeParse({
      q: sp.get('q') ?? undefined,
      banned: sp.get('banned') ?? undefined,
      mentor: sp.get('mentor') ?? undefined,
      tradition: sp.get('tradition') ?? undefined,
      sort: sp.get('sort') ?? undefined,
      page: sp.get('page') ?? undefined,
      pageSize: sp.get('pageSize') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const filters = {
      q: parsed.data.q,
      mentor: parsed.data.mentor === 'true' ? true : parsed.data.mentor === 'false' ? false : undefined,
      tradition: parsed.data.tradition,
      sort: parsed.data.sort,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    };

    const result = await getAdminUsers(filters);

    return ok(result.data, {
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        filters: parsed.data,
      },
      // Mutações (ban/promote) invalidam naturalmente; listagem muda devagar
      cache: { sMaxage: 30, staleWhileRevalidate: 60 },
    });
  } catch (err) {
    return handleError(err, 'GET /api/admin/users');
  }
}
