// ============================================================================
// lib/support/types — TypeScript domain types for Wave 37 helpdesk
// ============================================================================
// Single source of truth para enums + DTOs do suporte. Os enums runtime
// vêm do Prisma (`TicketStatus`, `TicketPriority`, `TicketCategory`) —
// aqui só re-exportamos e adicionamos tipos compostos (DTO, SLA, routing).
//
// LGPD: DTOs públicos NÃO carregam IP/UA — só metadados agregados.
// ============================================================================

import type {
  SupportTicket,
  TicketMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '@prisma/client';

// Re-export Prisma enums for downstream imports
export type {
  SupportTicket,
  TicketMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
};

// ============================================================================
// Public DTOs (returned from API — no internal fields)
// ============================================================================
export interface TicketListItem {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string | null;
  team: string | null;
  messageCount: number;
  lastMessageAt: Date | null;
  satisfactionRating: number | null;
}

export interface TicketDetail extends TicketListItem {
  description: string;
  email: string | null;
  userId: string | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  satisfactionComment: string | null;
  satisfactionSubmittedAt: Date | null;
  tags: string[];
  messages: TicketMessageView[];
}

export interface TicketMessageView {
  id: string;
  body: string;
  isInternal: boolean;
  authorType: 'customer' | 'agent' | 'system';
  authorId: string | null;
  attachments: string[];
  createdAt: Date;
}

// ============================================================================
// SLA types (lib/support/sla.ts)
// ============================================================================
export type Plan = 'FREE' | 'PRO';

export interface SlaPolicy {
  firstResponseHours: number;
  resolutionHours: number;
}

export interface SlaStatus {
  firstResponseDueAt: Date | null;
  resolutionDueAt: Date;
  breached: boolean;
  atRisk: boolean; // dentro de 20% do limite
  hoursRemaining: number;
}

// ============================================================================
// Routing types (lib/support/auto-routing.ts)
// ============================================================================
export type SupportTeam = 'BILLING' | 'TECHNICAL' | 'CONTENT' | 'COMMUNITY' | 'ACCOUNT';

export interface RoutingDecision {
  team: SupportTeam;
  priority: TicketPriority;
  reason: string;
  matchedKeywords: string[];
}

// ============================================================================
// CSAT types (lib/support/csat.ts)
// ============================================================================
export interface CsatStats {
  total: number;
  average: number;
  promoters: number; // 5
  passives: number; // 4
  detractors: number; // 1-3
  csatScore: number; // 0-100 (% de 4-5)
}