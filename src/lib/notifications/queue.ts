// Notifications queue helper
export type NotificationKind = "comment" | "mention" | "follow" | "event" | "live" | "reflection"

export interface Notification {
  id: string
  userId: string
  kind: NotificationKind
  title: string
  body: string
  link?: string
  readAt: Date | null
  createdAt: Date
}

export class NotificationQueue {
  private items: Notification[] = []

  enqueue(n: Omit<Notification, "id" | "readAt" | "createdAt">): Notification {
    const item: Notification = {
      ...n,
      id: crypto.randomUUID(),
      readAt: null,
      createdAt: new Date(),
    }
    this.items.push(item)
    return item
  }

  unreadFor(userId: string): Notification[] {
    return this.items.filter(n => n.userId === userId && !n.readAt)
  }

  markRead(id: string): void {
    const n = this.items.find(x => x.id === id)
    if (n) n.readAt = new Date()
  }
}
