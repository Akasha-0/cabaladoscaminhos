import { NextResponse } from 'next/server';

/**
 * GET /api/email/data
 * Returns email-related data and metadata
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  const emailData = {
    templates: [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Bem-vindo à Cabala dos Caminhos',
        description: 'Email de boas-vindas para novos usuários',
      },
      {
        id: 'reminder',
        name: 'Daily Reminder',
        subject: 'Sua diária espiritual',
        description: 'Lembrete diário de rituais e práticas',
      },
      {
        id: 'notification',
        name: 'Notification',
        subject: 'Nova atualização disponível',
        description: 'Notificação sobre novas funcionalidades',
      },
      {
        id: 'insight',
        name: 'Daily Insight',
        subject: 'Seu insight diário',
        description: 'Insight personalizado baseado no mapa natal',
      },
    ],
    settings: {
      fromEmail: 'contato@cabaladoscaminhos.com',
      fromName: 'Cabala dos Caminhos',
      replyTo: 'suporte@cabaladoscaminhos.com',
    },
    status: {
      active: true,
      lastSync: new Date().toISOString(),
    },
  };

  switch (type) {
    case 'templates':
      return NextResponse.json({
        data: emailData.templates,
        meta: { total: emailData.templates.length },
      });

    case 'settings':
      return NextResponse.json({ data: emailData.settings });

    case 'status':
      return NextResponse.json({ data: emailData.status });

    default:
      return NextResponse.json({
        data: emailData,
        meta: {
          types: ['templates', 'settings', 'status'],
          total: emailData.templates.length,
        },
      });
  }
}