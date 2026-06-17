/**
 * Re-export from application/push (tests/lib/push/ uses this alias).
 * @see application/push/web-push-server
 */
export {
  generateVapidKeys,
  getPublicVapidKey,
  sendPush,
  type PushSubscriptionJSON,
  type PushPayload,
} from '../application/push/web-push-server';
