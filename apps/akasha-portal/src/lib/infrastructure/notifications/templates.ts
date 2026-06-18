export type TemplateCategory = 'reminder' | 'insight' | 'ritual' | 'general';

export interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  category: TemplateCategory;
  priority: 'high' | 'medium' | 'low';
  variables?: string[];
}

const TEMPLATES: NotificationTemplate[] = [];

export function getTemplates(): NotificationTemplate[] {
  return TEMPLATES;
}
export function getTemplateById(id: string): NotificationTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
export function getTemplatesByCategory(category: TemplateCategory): NotificationTemplate[] {
  return TEMPLATES.filter((t) => t.category === category);
}
export function getHighPriorityTemplates(): NotificationTemplate[] {
  return TEMPLATES.filter((t) => t.priority === 'high');
}
function formatTemplate(
  template: NotificationTemplate,
  vars: Record<string, string> = {}
): NotificationTemplate {
  let body = template.body;
  for (const [k, v] of Object.entries(vars)) body = body.replace(new RegExp(`{{${k}}}`, 'g'), v);
  return { ...template, body };
}
