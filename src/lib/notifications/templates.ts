// Notification templates for email/push notifications
export interface NotificationTemplate {
  id: string;
  type: 'appointment' | 'reminder' | 'marketing' | 'system';
  subject: string;
  body: string;
  variables: string[];
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  appointment_confirmed: {
    id: 'appointment_confirmed',
    type: 'appointment',
    subject: 'Consulta agendada com sucesso',
    body: 'Sua consulta foi confirmada para {{date}} às {{time}}.',
    variables: ['date', 'time'],
  },
  appointment_reminder: {
    id: 'appointment_reminder',
    type: 'reminder',
    subject: 'Lembrete de consulta',
    body: 'Você tem uma consulta amanhã às {{time}}.',
    variables: ['time'],
  },
};