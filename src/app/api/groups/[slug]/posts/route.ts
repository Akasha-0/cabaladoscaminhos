// ============================================================================
// GROUPS — /api/groups/[slug]/posts
// ============================================================================
// GET  → lista posts do grupo (cursor pagination)
// ============================================================================

import { NextRequest } from 'next/server';
import {
  ok, fail, handleError, ErrorCode,
} from '@/lib/community/api';
import { getViewer } from '@/lib/community/auth';
import {
  listGroupPosts,
  GroupNotFoundError, GroupForbiddenError,
} from '@/lib/community/groups';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sp = request.nextUrl.searchParams;
    const viewer = await getViewer();

    const result = await listGroupPosts({
      slug,
      viewerId: viewer?.id ?? null,
      cursor: sp.get('cursor') ?? null,
      limit: sp.get('limit') ? Number(sp.get('limit')) : undefined,
    });

    return ok(result.posts, {
      meta: {
        groupSlug: result.groupSlug,
        groupName: result.groupName,
        nextCursor: result.nextCursor,
        count: result.posts.length,
      },
    });
  } catch (err) {
    if (err instanceof GroupNotFoundError) {
      return fail(404, ErrorCode.NOT_FOUND, err.message);
    }
    if (err instanceof GroupForbiddenError) {
      return fail(403, ErrorCode.FORBIDDEN, err.message);
    }
    return handleError(err);
  }
}
