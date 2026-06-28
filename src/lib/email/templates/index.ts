// ============================================================================
// EMAIL TEMPLATES — barrel export (Wave 20, 2026-06-28)
// ============================================================================
// Cada template exporta:
//   - data type (interface com os campos esperados)
//   - render(data, opts) → { subject, html, text }
//
// O renderTemplate() centraliza a resolução (templateId → função render).
// Adicionar um template novo:
//   1. Criar arquivo welcome-day2.ts (export const renderWelcomeDay2)
//   2. Adicionar ao map abaixo
//   3. Tipar em TemplateId union
// ============================================================================

import { renderWelcome, type WelcomeData } from '@/lib/email/templates/welcome';
import { renderWelcomeDay2, type WelcomeDay2Data } from '@/lib/email/templates/welcome-day2';
import { renderWelcomeDay7, type WelcomeDay7Data } from '@/lib/email/templates/welcome-day7';
import { renderVerifyEmail, type VerifyEmailData } from '@/lib/email/templates/verify-email';
import { renderPasswordReset, type PasswordResetData } from '@/lib/email/templates/password-reset';
import { renderCommentNotification, type CommentNotificationData } from '@/lib/email/templates/comment-notification';
import { renderLikeNotification, type LikeNotificationData } from '@/lib/email/templates/like-notification';
import { renderMentionNotification, type MentionNotificationData } from '@/lib/email/templates/mention-notification';
import { renderFollowNotification, type FollowNotificationData } from '@/lib/email/templates/follow-notification';
import { renderMentorshipRequest, type MentorshipRequestData } from '@/lib/email/templates/mentorship-request';
import { renderEventReminder, type EventReminderData } from '@/lib/email/templates/event-reminder';

export type TemplateId =
  | 'welcome'
  | 'welcome-day2'
  | 'welcome-day7'
  | 'verify-email'
  | 'password-reset'
  | 'comment-notification'
  | 'like-notification'
  | 'mention-notification'
  | 'follow-notification'
  | 'mentorship-request'
  | 'event-reminder';

export type TemplateDataMap = {
  welcome: WelcomeData;
  'welcome-day2': WelcomeDay2Data;
  'welcome-day7': WelcomeDay7Data;
  'verify-email': VerifyEmailData;
  'password-reset': PasswordResetData;
  'comment-notification': CommentNotificationData;
  'like-notification': LikeNotificationData;
  'mention-notification': MentionNotificationData;
  'follow-notification': FollowNotificationData;
  'mentorship-request': MentorshipRequestData;
  'event-reminder': EventReminderData;
};

export interface RenderOptions {
  /** Token de unsubscribe (injetado no footer). */
  unsubscribeToken?: string | null;
  /** Tipo de unsubscribe (ex: 'welcome', 'comment'). */
  unsubscribeType?: string;
}

export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

// ============================================================================
// renderTemplate — entry point (usado por send.ts e por testes)
// ============================================================================

export function renderTemplate<K extends TemplateId>(
  templateId: K,
  data: TemplateDataMap[K],
  options?: RenderOptions
): RenderedTemplate {
  const opts = options ?? {};
  switch (templateId) {
    case 'welcome':
      return renderWelcome(data as WelcomeData, opts);
    case 'welcome-day2':
      return renderWelcomeDay2(data as WelcomeDay2Data, opts);
    case 'welcome-day7':
      return renderWelcomeDay7(data as WelcomeDay7Data, opts);
    case 'verify-email':
      return renderVerifyEmail(data as VerifyEmailData, opts);
    case 'password-reset':
      return renderPasswordReset(data as PasswordResetData, opts);
    case 'comment-notification':
      return renderCommentNotification(data as CommentNotificationData, opts);
    case 'like-notification':
      return renderLikeNotification(data as LikeNotificationData, opts);
    case 'mention-notification':
      return renderMentionNotification(data as MentionNotificationData, opts);
    case 'follow-notification':
      return renderFollowNotification(data as FollowNotificationData, opts);
    case 'mentorship-request':
      return renderMentorshipRequest(data as MentorshipRequestData, opts);
    case 'event-reminder':
      return renderEventReminder(data as EventReminderData, opts);
    default: {
      // Exhaustiveness check — TS error se algum case faltar
      const _exhaustive: never = templateId;
      throw new Error(`Template não implementado: ${templateId as string}`);
    }
  }
}
