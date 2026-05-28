// ============================================================
// PUSH NOTIFICATIONS SERVICE - CABALA DOS CAMINHOS
// ============================================================
// WebPush-based push notification service for user subscriptions
// ============================================================

import * as webpush from 'web-push';

// VAPID keys configuration
// Generate keys using: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@cabaladoscaminhos.com';

// Configure web-push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Use webpush's PushSubscription type
type WebPushSubscription = webpush.PushSubscription;

// In-memory subscription store (userId -> PushSubscription)
const subscriptionStore = new Map<string, WebPushSubscription>();

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
}

export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors?: string[];
}

interface PushNotificationService {
  subscribe(userId: string, subscription: WebPushSubscription): Promise<boolean>;
  unsubscribe(userId: string): Promise<boolean>;
  sendToUser(userId: string, notification: PushNotificationPayload): Promise<NotificationResult>;
  sendToAll(notification: PushNotificationPayload): Promise<NotificationResult>;
  getSubscription(userId: string): WebPushSubscription | undefined;
  getAllSubscriptions(): Map<string, WebPushSubscription>;
}

class PushNotificationServiceImpl implements PushNotificationService {
  /**
   * Subscribe a user to push notifications
   */
  async subscribe(userId: string, subscription: WebPushSubscription): Promise<boolean> {
    try {
      subscriptionStore.set(userId, subscription);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unsubscribe a user from push notifications
   */
  async unsubscribe(userId: string): Promise<boolean> {
    return subscriptionStore.delete(userId);
  }

  /**
   * Send a notification to a specific user
   */
  async sendToUser(
    userId: string,
    notification: PushNotificationPayload
  ): Promise<NotificationResult> {
    const subscription = subscriptionStore.get(userId);

    if (!subscription) {
      return {
        success: false,
        sent: 0,
        failed: 1,
        errors: ['User not subscribed to push notifications']
      };
    }

    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify(notification)
      );

      return {
        success: true,
        sent: 1,
        failed: 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Remove invalid subscriptions (410 Gone indicates subscription expired)
      if (errorMessage.includes('410') || errorMessage.includes('notFound')) {
        subscriptionStore.delete(userId);
      }

      return {
        success: false,
        sent: 0,
        failed: 1,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Send a notification to all subscribed users
   */
  async sendToAll(
    notification: PushNotificationPayload
  ): Promise<NotificationResult> {
    const results: { success: boolean; error?: string }[] = [];
    const invalidSubscriptions: string[] = [];

    const sendPromises = Array.from(subscriptionStore.entries()).map(
      async ([userId, subscription]) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify(notification)
          );
          results.push({ success: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({ success: false, error: errorMessage });

          // Track invalid subscriptions for cleanup
          if (errorMessage.includes('410') || errorMessage.includes('notFound')) {
            invalidSubscriptions.push(userId);
          }
        }
      }
    );

    await Promise.all(sendPromises);

    // Clean up invalid subscriptions
    invalidSubscriptions.forEach((userId) => {
      subscriptionStore.delete(userId);
    });

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      success: failed === 0,
      sent,
      failed,
      errors: results.filter((r) => r.error).map((r) => r.error!)
    };
  }

  /**
   * Get a user's push subscription
   */
  getSubscription(userId: string): WebPushSubscription | undefined {
    return subscriptionStore.get(userId);
  }

  /**
   * Get all subscriptions (for admin purposes)
   */
  getAllSubscriptions(): Map<string, WebPushSubscription> {
    return new Map(subscriptionStore);
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationServiceImpl();

// Export VAPID public key getter for client-side subscription
export function getVAPIDPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
