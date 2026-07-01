// ============================================================================
// API /api/notifications/v2/templates — lista e renderiza templates
// ============================================================================
// GET  — listar templates (todos) ou filtrar por categoria
// POST — renderizar template com vars
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireViewer } from '@/lib/community/auth';
import { fail, handleError, ok } from '@/lib/community/api';
import {
  TEMPLATE_CATALOG,
  renderTemplate,
  type NotificationCategory,
} from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';

const CATEGORIES: readonly NotificationCategory[] = [
  'mention', 'reply', 'follow', 'akasha', 'marketplace',
  'mentorship', 'event', 'system', 'marketing',
];

export async function GET(req: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, 'UNAUTHORIZED', 'Não autenticado');
    }

    const url = new URL(req.url);
    const category = url.searchParams.get('category') as NotificationCategory | null;

    if (category) {
      if (!CATEGORIES.includes(category)) {
        return fail(400, 'INVALID_CATEGORY', 'categoria inválida');
      }
      const t = TEMPLATE_CATALOG[category];
      return ok({
        userId: viewer.id,
        category,
        template: {
          key: t.key,
          version: t.version,
          requiredVars: t.requiredVars,
          smsEligible: t.smsEligible,
        },
      });
    }

    return ok({
      userId: viewer.id,
      templates: Object.entries(TEMPLATE_CATALOG).map(([cat, t]) => ({
        category: cat,
        key: t.key,
        version: t.version,
        requiredVars: t.requiredVars,
        smsEligible: t.smsEligible,
      })),
      categories: CATEGORIES,
    });
  } catch (err) {
    return handleError(err);
  }
}

interface RenderBody {
  category: NotificationCategory;
  vars: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, 'UNAUTHORIZED', 'Não autenticado');
    }

    let body: RenderBody;
    try {
      body = (await req.json()) as RenderBody;
    } catch {
      return fail(400, 'INVALID_JSON', 'Body inválido');
    }

    if (!CATEGORIES.includes(body.category)) {
      return fail(400, 'INVALID_CATEGORY', 'categoria inválida');
    }
    if (!body.vars || typeof body.vars !== 'object') {
      return fail(400, 'INVALID_VARS', 'vars deve ser objeto');
    }

    const rendered = renderTemplate(body.category, body.vars);
    if (!rendered.ok) {
      return fail(400, 'MISSING_VARS', `vars faltando: ${rendered.missing.join(', ')}`);
    }

    return ok({
      userId: viewer.id,
      category: body.category,
      message: rendered.message,
    });
  } catch (err) {
    return handleError(err);
  }
}
