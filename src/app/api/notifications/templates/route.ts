import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/error-handling";
import {
  type NotificationTemplate,
  type TemplateCategory,
  getTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getHighPriorityTemplates,
} from "@/lib/notifications/templates";

export type { NotificationTemplate, TemplateCategory };

export const GET = withErrorHandler(async (req: NextRequest) => {
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
});