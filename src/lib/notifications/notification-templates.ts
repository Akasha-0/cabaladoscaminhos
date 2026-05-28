// Notification templates

export type NotificationType =
  | 'daily_reading'
  | 'cycle_transition'
  | 'compatibility_update'
  | 'new_feature'
  | 'security_alert'
  | 'reminder';

export interface NotificationTemplate {
  id: NotificationType;
  title: Record<string, string>;
  body: Record<string, string>;
  icon: string;
  actionUrl?: string;
}

const templates: NotificationTemplate[] = [
  {
    id: 'daily_reading',
    title: {
      pt: 'Leitura Diária',
      en: 'Daily Reading',
    },
    body: {
      pt: 'Sua leitura diária está pronta. Descubra o que os astros revelam hoje.',
      en: 'Your daily reading is ready. Discover what the stars reveal today.',
    },
    icon: '/icons/daily.svg',
    actionUrl: '/dashboard/leitura-diaria',
  },
  {
    id: 'cycle_transition',
    title: {
      pt: 'Transição de Ciclo',
      en: 'Cycle Transition',
    },
    body: {
      pt: 'Um novo ciclo está começando. Prepare-se para novas energias.',
      en: 'A new cycle is beginning. Prepare for new energies.',
    },
    icon: '/icons/cycle.svg',
    actionUrl: '/dashboard/ciclos',
  },
  {
    id: 'compatibility_update',
    title: {
      pt: 'Atualização de Compatibilidade',
      en: 'Compatibility Update',
    },
    body: {
      pt: 'As energias com seu parceiro mudaram. Veja a nova análise.',
      en: 'Your energy compatibility with your partner has changed. View the new analysis.',
    },
    icon: '/icons/compat.svg',
    actionUrl: '/dashboard/compatibilidade',
  },
  {
    id: 'new_feature',
    title: {
      pt: 'Nova Funcionalidade',
      en: 'New Feature',
    },
    body: {
      pt: 'Descubra as novas ferramentas disponíveis no seu painel.',
      en: 'Discover the new tools available on your dashboard.',
    },
    icon: '/icons/feature.svg',
    actionUrl: '/dashboard',
  },
  {
    id: 'security_alert',
    title: {
      pt: 'Alerta de Segurança',
      en: 'Security Alert',
    },
    body: {
      pt: 'Detectamos uma atividade incomum na sua conta. Verifique agora.',
      en: 'We detected unusual activity on your account. Verify now.',
    },
    icon: '/icons/security.svg',
    actionUrl: '/dashboard/seguranca',
  },
  {
    id: 'reminder',
    title: {
      pt: 'Lembrete',
      en: 'Reminder',
    },
    body: {
      pt: 'Você tem um compromisso agendado. Não se esqueça.',
      en: 'You have a scheduled appointment. Do not forget.',
    },
    icon: '/icons/reminder.svg',
  },
];

export function getTemplates(): NotificationTemplate[] {
  return templates;
}

export function getTemplateById(id: NotificationType): NotificationTemplate | undefined {
  return templates.find((t) => t.id === id);
}
