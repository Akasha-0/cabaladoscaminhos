/**
 * Wave 17 — Notifications route loading skeleton.
 */

import { NotificationItemSkeleton } from '@/components/design-system/skeleton';

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-8">
      <NotificationItemSkeleton />
      <NotificationItemSkeleton />
      <NotificationItemSkeleton />
      <NotificationItemSkeleton />
    </div>
  );
}
