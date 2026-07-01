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
import { renderWaitlistWelcome, type WaitlistWelcomeData } from '@/lib/email/templates/waitlist-welcome';
import { renderWaitlistConfirmation, type WaitlistConfirmationData } from '@/lib/email/templates/waitlist-confirmation';
import { renderWaitlistReminder, type WaitlistReminderData } from '@/lib/email/templates/waitlist-reminder';
import { renderWaitlistWaveInvite, type WaitlistWaveInviteData } from '@/lib/email/templates/waitlist-wave-invite';
import { renderWaitlistWaveClosed, type WaitlistWaveClosedData } from '@/lib/email/templates/waitlist-wave-closed';
import { renderBetaInvite, type BetaInviteData } from '@/lib/email/templates/beta-invite';

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
  | 'event-reminder'
  | 'waitlist-welcome'
  | 'waitlist-confirmation'
  | 'waitlist-reminder'
  | 'waitlist-wave-invite'
  | 'waitlist-wave-closed'
  | 'beta-invite';

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
  'waitlist-welcome': WaitlistWelcomeData;
  'waitlist-confirmation': WaitlistConfirmationData;
  'waitlist-reminder': WaitlistReminderData;
  'waitlist-wave-invite': WaitlistWaveInviteData;
  'waitlist-wave-closed': WaitlistWaveClosedData;
  'beta-invite': BetaInviteData;
  'curator-invite': CuratorInviteData;
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
    case 'waitlist-welcome':
      return renderWaitlistWelcome(data as WaitlistWelcomeData, opts);
    case 'waitlist-confirmation':
      return renderWaitlistConfirmation(data as WaitlistConfirmationData, opts);
    case 'waitlist-reminder':
      return renderWaitlistReminder(data as WaitlistReminderData, opts);
    case 'waitlist-wave-invite':
      return renderWaitlistWaveInvite(data as WaitlistWaveInviteData, opts);
    case 'waitlist-wave-closed':
      return renderWaitlistWaveClosed(data as WaitlistWaveClosedData, opts);
    case 'beta-invite':
      return renderBetaInvite(data as BetaInviteData, opts);
    case 'curator-invite':
      return renderCuratorInvite(data as CuratorInviteData, opts);
    default: {
      // Exhaustiveness check — TS error se algum case faltar
      const _exhaustive: never = templateId;
      throw new Error(`Template não implementado: ${templateId as string}`);
    }
  }
}
