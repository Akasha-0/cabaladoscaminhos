// ============================================================================
// GROUPS — /api/groups
// ============================================================================
// GET  → lista de grupos (com filtros: tradição, busca, meus grupos)
// POST → cria novo grupo (autenticado; criador vira ADMIN)
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { GroupListQuerySchema, CreateGroupSchema } from '@/lib/validators/groups';
import { listGroups, createGroup } from '@/lib/community/groups';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = GroupListQuerySchema.safeParse({
      tradition: sp.get('tradition') ?? undefined,
      isPublic: sp.get('isPublic') ?? undefined,
      mine: sp.get('mine') ?? undefined,
      search: sp.get('search') ?? undefined,
      limit: sp.get('limit') ?? undefined,
    });

    if (!parsed.success) return fromZodError(parsed.error);

    const viewer = await getViewer();

    const groups = await listGroups({
      tradition: parsed.data.tradition,
      isPublic: parsed.data.isPublic,
      mineOnly: parsed.data.mine === true,
      search: parsed.data.search,
      viewerId: viewer?.id ?? null,
      limit: parsed.data.limit,
    });

    return ok(groups, {
      meta: {
        count: groups.length,
        viewerId: viewer?.id ?? null,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado para criar um grupo');
    }

    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = CreateGroupSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      const group = await createGroup({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        longDescription: parsed.data.longDescription ?? null,
        rules: parsed.data.rules ?? [],
        iconUrl: parsed.data.iconUrl ?? null,
        bannerUrl: parsed.data.bannerUrl ?? null,
        tradition: parsed.data.tradition,
        isPublic: parsed.data.isPublic ?? true,
        requireApproval: parsed.data.requireApproval ?? false,
        createdBy: viewer.id,
      });
      return ok(group, { status: 201 });
    } catch (err) {
      // Prisma P2002 = unique constraint (slug duplicado)
      const e = err as { code?: string };
      if (e.code === 'P2002') {
        return fail(
          409,
          ErrorCode.CONFLICT,
          'Já existe um grupo com esse slug'
        );
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}
