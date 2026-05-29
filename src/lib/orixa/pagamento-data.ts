// @ts-nocheck
// SKIP_LINT

/**
 * Pagamento Data Module
 * Spiritual payment data for Ifá practice offerings and transactions
 */

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  recommended?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'pix' | 'bank_transfer' | 'crypto';
  lastDigits?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  planName: string;
  paymentMethod: string;
  receiptUrl?: string;
}

export interface OfferingsPrice {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: 'herb_bundle' | 'candle_set' | 'divination_kit' | 'ritual_blessing' | 'consultation';
  available: boolean;
}

export interface PagamentoData {
  plans: PaymentPlan[];
  defaultPaymentMethods: PaymentMethod[];
  recentTransactions: Transaction[];
  offeringsPrices: OfferingsPrice[];
  stats: {
    totalTransactions: number;
    activeSubscriptions: number;
    totalRevenue: number;
    currency: string;
  };
  acceptedCurrencies: string[];
}

const PAGAMENTO_DATA: PagamentoData = {
  plans: [
    {
      id: 'basic-monthly',
      name: 'Caminho Básico',
      description: 'Acesso fundamental às práticas espirituais e orientações do Ifá',
      price: 29.90,
      currency: 'BRL',
      interval: 'monthly',
      features: [
        'Acesso ao mapa astral pessoal',
        '3 consultas de divinação por mês',
        'Ritual de proteção diário',
        'Calendário de祭祀 sagrados'
      ]
    },
    {
      id: 'practitioner-monthly',
      name: 'Praticante',
      description: 'Para praticantes comprometidos com o caminho de Ifá',
      price: 59.90,
      currency: 'BRL',
      interval: 'monthly',
      features: [
        'Tudo do plano Básico',
        'Divinação ilimitada',
        'Acesso completo à numerologia',
        'Ritual personalizado',
        'Comunidade de praticantes'
      ],
      recommended: true
    },
    {
      id: 'mestre-yearly',
      name: 'Caminho do Mestre',
      description: 'Transformação completa com acompanhamento personalizado',
      price: 499.90,
      currency: 'BRL',
      interval: 'yearly',
      features: [
        'Tudo do plano Praticante',
        'Consultoria mensal 1:1',
        'Ofertas espirituais personalizadas',
        'Acesso vitalício às atualizações',
        'Mentoria em rituais avançados'
      ]
    }
  ],
  defaultPaymentMethods: [
    {
      id: 'pix-default',
      type: 'pix',
      isDefault: true
    },
    {
      id: 'credit-card-default',
      type: 'credit_card',
      lastDigits: '4242',
      expiryDate: '12/2027',
      isDefault: false
    }
  ],
  recentTransactions: [
    {
      id: 'txn-001',
      date: '2026-05-28',
      amount: 59.90,
      currency: 'BRL',
      status: 'completed',
      planName: 'Praticante',
      paymentMethod: 'PIX'
    },
    {
      id: 'txn-002',
      date: '2026-05-15',
      amount: 29.90,
      currency: 'BRL',
      status: 'completed',
      planName: 'Caminho Básico',
      paymentMethod: 'Cartão de Crédito'
    },
    {
      id: 'txn-003',
      date: '2026-05-01',
      amount: 89.90,
      currency: 'BRL',
      status: 'completed',
      planName: 'Oferta Ritual',
      paymentMethod: 'PIX'
    }
  ],
  offeringsPrices: [
    {
      id: 'herb-bundle-basic',
      name: 'Feixe de Ervas Sagradas',
      description: 'Ervas selecionados para proteção e limpeza espiritual',
      price: 49.90,
      currency: 'BRL',
      category: 'herb_bundle',
      available: true
    },
    {
      id: 'candle-sete-poderes',
      name: 'Velas dos Sete Poderes',
      description: 'Velas ritualísticas para cada Orixá',
      price: 39.90,
      currency: 'BRL',
      category: 'candle_set',
      available: true
    },
    {
      id: 'divination-kit',
      name: 'Kit de Divinação Ifá',
      description: 'Equipamento completo para prática de Opelê Ifá',
      price: 199.90,
      currency: 'BRL',
      category: 'divination_kit',
      available: true
    },
    {
      id: 'ritual-blessing',
      name: 'Abençoar de Orixá',
      description: 'Cerimônia de bênção personalizada',
      price: 299.90,
      currency: 'BRL',
      category: 'ritual_blessing',
      available: true
    },
    {
      id: 'consultation-mestre',
      name: 'Consulta com Mestre',
      description: 'Orientação espiritual personalizada',
      price: 150.00,
      currency: 'BRL',
      category: 'consultation',
      available: true
    }
  ],
  stats: {
    totalTransactions: 156,
    activeSubscriptions: 89,
    totalRevenue: 12450.00,
    currency: 'BRL'
  },
  acceptedCurrencies: ['BRL', 'USD', 'EUR']
};

export function getData(): PagamentoData {
  return PAGAMENTO_DATA;
}

export function getPlans(): PaymentPlan[] {
  return PAGAMENTO_DATA.plans;
}

export function getDefaultPaymentMethods(): PaymentMethod[] {
  return PAGAMENTO_DATA.defaultPaymentMethods;
}

export function getRecentTransactions(): Transaction[] {
  return PAGAMENTO_DATA.recentTransactions;
}

export function getOfferingsPrices(): OfferingsPrice[] {
  return PAGAMENTO_DATA.offeringsPrices;
}

export function getStats() {
  return PAGAMENTO_DATA.stats;
}

export function getAcceptedCurrencies(): string[] {
  return PAGAMENTO_DATA.acceptedCurrencies;
}