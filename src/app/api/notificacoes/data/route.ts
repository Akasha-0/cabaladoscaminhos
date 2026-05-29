// ============================================================
// NOTIFICACOES DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for notification data access
// - Notification templates
// - Notification history
// - Scheduled notifications
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── IMPORT NOTIFICATION MODULES ──────────────────────────────────────────────

import { getTemplates, getTemplateById, NotificationTemplate, NotificationType } from '@/lib/notifications/notification-templates';
import { loadHistory, clearHistory, NotificationEntry } from '@/lib/notifications/notification-history';
import { getScheduled, getDue, ScheduledNotification, scheduleNotification } from '@/lib/notifications/notification-scheduling';

import { performPractice, NotificacoesPracticeResult } from '@/lib/orixa/notificacoes-practice';

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────────

interface NotificacoesStats {
  templatesCount: number;
  scheduledCount: number;
  dueCount: number;
}

interface NotificacoesData {
  templates: NotificationTemplate[];
  history: NotificationEntry[];
  scheduled: ScheduledNotification[];
  due: ScheduledNotification[];
  stats: NotificacoesStats;
  practice: NotificacoesPracticeResult;
}

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/notificacoes/data - Get notification data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    // Get all templates
    const templates = getTemplates();
    const scheduled = getScheduled();
    const due = getDue();
    const history = loadHistory();

    // Build stats
    const stats: NotificacoesStats = {
      templatesCount: templates.length,
      scheduledCount: scheduled.length,
      dueCount: due.length,
    };

    // Return based on type parameter
    if (type === 'templates') {
      if (id) {
        const template = getTemplateById(id as NotificationType);
        if (!template) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json({ template });
      }
      return NextResponse.json({ templates });
    }

    if (type === 'history') {
      return NextResponse.json({ history });
    }

    if (type === 'scheduled') {
      if (id) {
        const item = scheduled.find((s) => s.id === id);
        if (!item) {
          return NextResponse.json({ error: 'Scheduled notification not found' }, { status: 404 });
        }
        return NextResponse.json({ scheduled: item });
      }
      return NextResponse.json({ scheduled });
    }

    if (type === 'due') {
      return NextResponse.json({ due });
    }

    if (type === 'stats') {
      return NextResponse.json({ stats });
    }

    if (type === 'practice') {
      return NextResponse.json({ practice: performPractice() });
    }

    // Default: return all notification data
    const data: NotificacoesData = {
      templates,
      history,
      scheduled,
      due,
      stats,
      practice: performPractice(),
    };

    return NextResponse.json(data);
} catch (error) {
    console.error('Notificacoes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification data' },
      { status: 500 }
    );
  }
}
