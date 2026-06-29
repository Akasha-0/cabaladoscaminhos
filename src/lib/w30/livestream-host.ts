// src/lib/w30/livestream-host.ts
// Live stream host controls — extends w27/live-stream-room with moderator/host actions
// Hosts can: end stream, mute participants, pin messages, ban, hand-off to co-host

import type { LiveStreamRoom, StreamParticipant } from "../w27/live-stream-room";

export type HostAction =
  | "end-stream"
  | "mute-participant"
  | "unmute-participant"
  | "pin-message"
  | "unpin-message"
  | "ban-participant"
  | "promote-cohost"
  | "demote-cohost";

export interface HostActionRecord {
  readonly action: HostAction;
  readonly targetUserId?: string;
  readonly targetMessageId?: string;
  readonly performedBy: string; // host user id
  readonly at: string; // ISO
  readonly reason?: string;
}

export interface HostControls {
  /** End the stream entirely */
  endStream(room: LiveStreamRoom, hostId: string): LiveStreamRoom;
  /** Mute a participant (they can still watch, no mic) */
  muteParticipant(room: LiveStreamRoom, targetUserId: string, hostId: string): LiveStreamRoom;
  /** Ban from room (cannot rejoin this stream) */
  banParticipant(room: LiveStreamRoom, targetUserId: string, hostId: string, reason?: string): LiveStreamRoom;
  /** Promote to co-host (can moderate others) */
  promoteToCohost(room: LiveStreamRoom, targetUserId: string, hostId: string): LiveStreamRoom;
}

export class LiveStreamHostController implements HostControls {
  private auditLog: HostActionRecord[] = [];

  /** Verify caller is host or co-host */
  private isAuthorized(room: LiveStreamRoom, userId: string): boolean {
    if (room.hostId === userId) return true;
    return room.participants.some(
      (p) => p.userId === userId && p.role === "cohost",
    );
  }

  endStream(room: LiveStreamRoom, hostId: string): LiveStreamRoom {
    if (!this.isAuthorized(room, hostId)) {
      throw new Error("UNAUTHORIZED: only host/cohost can end stream");
    }
    this.auditLog.push({
      action: "end-stream",
      performedBy: hostId,
      at: new Date().toISOString(),
    });
    return { ...room, endedAt: new Date().toISOString(), status: "ended" };
  }

  muteParticipant(room: LiveStreamRoom, targetUserId: string, hostId: string): LiveStreamRoom {
    if (!this.isAuthorized(room, hostId)) {
      throw new Error("UNAUTHORIZED");
    }
    this.auditLog.push({
      action: "mute-participant",
      targetUserId,
      performedBy: hostId,
      at: new Date().toISOString(),
    });
    return {
      ...room,
      participants: room.participants.map((p) =>
        p.userId === targetUserId ? { ...p, muted: true } : p,
      ),
    };
  }

  banParticipant(
    room: LiveStreamRoom,
    targetUserId: string,
    hostId: string,
    reason?: string,
  ): LiveStreamRoom {
    if (!this.isAuthorized(room, hostId)) {
      throw new Error("UNAUTHORIZED");
    }
    if (targetUserId === room.hostId) {
      throw new Error("CANNOT_BAN_HOST");
    }
    this.auditLog.push({
      action: "ban-participant",
      targetUserId,
      performedBy: hostId,
      at: new Date().toISOString(),
      reason,
    });
    return {
      ...room,
      participants: room.participants.filter((p) => p.userId !== targetUserId),
    };
  }

  promoteToCohost(room: LiveStreamRoom, targetUserId: string, hostId: string): LiveStreamRoom {
    if (room.hostId !== hostId) {
      throw new Error("ONLY_HOST_CAN_PROMOTE");
    }
    this.auditLog.push({
      action: "promote-cohost",
      targetUserId,
      performedBy: hostId,
      at: new Date().toISOString(),
    });
    return {
      ...room,
      participants: room.participants.map((p) =>
        p.userId === targetUserId ? { ...p, role: "cohost" } : p,
      ),
    };
  }

  /** Read-only audit log (for moderator dashboard) */
  getAuditLog(): readonly HostActionRecord[] {
    return [...this.auditLog];
  }
}
