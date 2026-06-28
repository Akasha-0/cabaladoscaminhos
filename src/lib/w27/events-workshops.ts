// w27/events-workshops.ts — events/workshops feature stub
// Feature: Workshops + rituais + círculos de estudo com inscrições pagas e gratuitas
// Status: STUB — domínio definido, integração com prisma pendente

export type EventType = 'workshop' | 'ritual' | 'study-circle' | 'meditation';
export type EventModality = 'presencial' | 'online' | 'hibrido';

export interface WorkshopEvent {
  id: string;
  slug: string;
  type: EventType;
  title: string;
  description: string;
  facilitatorId: string;
  startsAt: string; // ISO 8601
  durationMinutes: number;
  capacity: number;
  modality: EventModality;
  trilha: 'tarot' | 'astrologia' | 'numerologia' | 'cigano' | 'mediunidade' | 'geral';
  priceCents: number; // 0 = gratuito
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopRegistration {
  id: string;
  eventId: string;
  participantId: string;
  status: 'confirmado' | 'lista-espera' | 'cancelado' | 'presente' | 'faltou';
  paymentStatus: 'gratis' | 'pago' | 'pendente' | 'reembolsado';
  registeredAt: string;
}

export function isUpcoming(event: WorkshopEvent, now: Date = new Date()): boolean {
  return new Date(event.startsAt) > now;
}

export function isFree(event: WorkshopEvent): boolean {
  return event.priceCents === 0;
}

