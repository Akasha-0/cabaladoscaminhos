// ============================================================
// EMAIL SCHEDULING - CABALA DOS CAMINHOS
// ============================================================
// Time-based email scheduling
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// TYPES
// ============================================================

export interface ScheduledEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  scheduledAt: number; // Unix timestamp in ms
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface ScheduleEmailInput {
  to: string;
  subject: string;
  body: string;
  scheduledAt: number; // Unix timestamp in ms
  metadata?: Record<string, unknown>;
}

// ============================================================
// STORAGE
// ============================================================

const STORAGE_KEY = 'cabala_email_schedules';

function generateId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function getSchedules(): ScheduledEmail[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSchedules(schedules: ScheduledEmail[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch {
    // Storage full or unavailable
  }
}

// ============================================================
// CORE SCHEDULING
// ============================================================

/**
 * Schedule an email for a future time
 */
export function scheduleEmail(input: ScheduleEmailInput): ScheduledEmail {
  const now = Date.now();
  
  if (input.scheduledAt <= now) {
    throw new Error('scheduledAt must be in the future');
  }

  const email: ScheduledEmail = {
    id: generateId(),
    to: input.to,
    subject: input.subject,
    body: input.body,
    scheduledAt: input.scheduledAt,
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    createdAt: now,
    metadata: input.metadata,
  };

  const schedules = getSchedules();
  schedules.push(email);
  saveSchedules(schedules);

  return email;
}

/**
 * Get all scheduled emails
 */
export function getScheduledEmails(): ScheduledEmail[] {
  return getSchedules().filter((e) => e.status === 'pending');
}

/**
 * Get emails that are due (scheduledAt <= now)
 */
export function getDueEmails(): ScheduledEmail[] {
  const now = Date.now();
  return getSchedules().filter(
    (e) => e.status === 'pending' && e.scheduledAt <= now
  );
}

/**
 * Cancel a scheduled email by id
 */
export function cancelScheduledEmail(id: string): boolean {
  const schedules = getSchedules();
  const index = schedules.findIndex((e) => e.id === id);
  
  if (index === -1) return false;
  
  schedules[index].status = 'cancelled';
  saveSchedules(schedules);
  return true;
}

/**
 * Mark an email as sent
 */
export function markEmailSent(id: string): boolean {
  const schedules = getSchedules();
  const email = schedules.find((e) => e.id === id);
  
  if (!email) return false;
  
  email.status = 'sent';
  saveSchedules(schedules);
  return true;
}

/**
 * Mark an email as failed
 */
export function markEmailFailed(id: string): boolean {
  const schedules = getSchedules();
  const email = schedules.find((e) => e.id === id);
  
  if (!email) return false;
  
  email.retryCount += 1;
  
  if (email.retryCount >= email.maxRetries) {
    email.status = 'failed';
  } else {
    // Reschedule for retry in 5 minutes
    email.scheduledAt = Date.now() + 5 * 60 * 1000;
  }
  
  saveSchedules(schedules);
  return true;
}

/**
 * Clear old emails older than maxAgeMs
 */
export function clearOldEmails(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): void {
  const cutoff = Date.now() - maxAgeMs;
  const schedules = getSchedules().filter(
    (e) => e.createdAt > cutoff || e.status === 'pending'
  );
  saveSchedules(schedules);
}

/**
 * Process all due emails (returns them for external sending)
 */
export function processDueEmails(): ScheduledEmail[] {
  return getDueEmails();
}