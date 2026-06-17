export interface PushSubscription {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}

export async function upsertPushSubscription(
  _userId: string,
  subscription: PushSubscription,
  _userAgent?: string | null
): Promise<void> {
  // stub
}

export async function deletePushSubscription(_endpoint: string): Promise<void> {
  // stub
}

export async function getUserPushSubscriptions(_userId: string): Promise<PushSubscription[]> {
  return [];
}
