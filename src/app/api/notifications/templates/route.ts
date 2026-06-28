// ============================================================================
// GET /api/notifications/templates — Lista templates de notificação (Wave 12)
// ============================================================================
// Query params (todos opcionais, exclusivos — primeiro que casar vence):
//   - id=string        → retorna 1 template (404 se não existe)
//   - category=string  → lista filtrada por categoria
//   - highPriority=true→ lista só templates de alta prioridade
//   - all=true         → lista completa (equivale ao default)
//   - (default)        → lista completa
//
// Auth: público (templates são metadata do produto — não há dados sensíveis).
//
// Wave 25 fix: substituído `withErrorHandler(...)` pelo padrão canônico
// `try { ... } catch (err) { return handleError(err); }` para alinhar com
// o restante das routes e deixar o error path explícito.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/error-handling";
import {
  type NotificationTemplate,
  type TemplateCategory,
  getTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getHighPriorityTemplates,
} from "@/lib/notifications/templates";

export type { NotificationTemplate, TemplateCategory };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    if (id) {
      const template = getTemplateById(id);
      if (!template) {
        return NextResponse.json(
          { error: { code: 4001, message: "Template not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json(template);
    }

    const category = searchParams.get("category") as TemplateCategory | null;
    if (category) {
      const templates = getTemplatesByCategory(category);
      return NextResponse.json({ templates, count: templates.length });
    }

    const highPriority = searchParams.get("highPriority");
    if (highPriority === "true") {
      const templates = getHighPriorityTemplates();
      return NextResponse.json({ templates, count: templates.length });
    }

    const all = searchParams.get("all");
    if (all === "true") {
      const templates = getTemplates();
      return NextResponse.json({ templates, count: templates.length });
    }

    const templates = getTemplates();
    return NextResponse.json({ templates, count: templates.length });
  } catch (err) {
    return handleError(err);
  }
}