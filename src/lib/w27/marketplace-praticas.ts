// w27/marketplace-praticas.ts — marketplace leitura/praticas stub
// Feature: marketplace de leituras e praticas (consultor oferece, consulente compra)
// Status: STUB — integracao com Stripe Connect + escrow pendente

export type OfferType = 'leitura-individual' | 'mentoria' | 'pratica-grupo' | 'curso-assincrono';

export interface MarketplaceOffer {
  id: string;
  consultantId: string;
  type: OfferType;
  title: string;
  description: string;
  trilha: 'tarot' | 'astrologia' | 'numerologia' | 'cigano' | 'mediunidade' | 'holistica';
  priceCents: number;
  durationMinutes: number;
  modality: 'presencial' | 'online' | 'assincrono';
  capacity: number; // 1 = individual
  isActive: boolean;
  rating: number; // 0-5
  totalSales: number;
  createdAt: string;
}

export interface OfferOrder {
  id: string;
  offerId: string;
  buyerId: string;
  status: 'pendente' | 'confirmado' | 'em-andamento' | 'concluido' | 'cancelado' | 'reembolsado';
  amountCents: number;
  paymentIntentId?: string;
  scheduledFor?: string;
  completedAt?: string;
  rating?: number;
  review?: string;
  createdAt: string;
}

export function calculateConsultantEarnings(order: OfferOrder, platformFeeBps: number = 1500): number {
  // bps = basis points (1500 = 15% fee)
  const fee = Math.floor((order.amountCents * platformFeeBps) / 10000);
  return order.amountCents - fee;
}

