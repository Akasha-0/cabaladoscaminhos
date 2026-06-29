// src/lib/w33/marketplace-checkout.ts
// Cycle 33 worker F — marketplace leitura checkout flow
// Composes w28/marketplace-stripe-connect + w31/marketplace-leitura + w32/marketplace-reviews
// Scope: cart, pricing, checkout steps, payment validation, receipt
// Namespace: w33 — self-contained, type-only deps on other waves

export type CartItemKind = "leitura" | "pratica" | "ebook" | "consultoria" | "membership";
export type CheckoutStep = "cart" | "details" | "payment" | "review" | "processing" | "done" | "failed";
export type PaymentMethod = "card" | "pix" | "boleto" | "paypal" | "apple_pay" | "google_pay";
export type CurrencyCode = "BRL" | "USD" | "EUR";

export interface CartItem {
  readonly id: string;
  readonly kind: CartItemKind;
  readonly title: string;
  readonly sellerId: string;
  readonly sellerDisplayName: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly thumbnailUrl: string | null;
  readonly traditionTags: ReadonlyArray<string>;
  readonly maxQuantity: number;
}

export interface PriceBreakdown {
  readonly subtotalCents: number;
  readonly discountCents: number;
  readonly taxCents: number;
  readonly platformFeeCents: number;
  readonly totalCents: number;
  readonly currency: CurrencyCode;
}

export interface DiscountRule {
  readonly code: string;
  readonly kind: "percent" | "fixed";
  readonly value: number; // percent (0-100) or fixed cents
  readonly minSubtotalCents: number;
  readonly maxUses: number;
  readonly usedCount: number;
  readonly expiresAt: number | null;
}

export function priceCart(
  items: ReadonlyArray<CartItem>,
  discount: DiscountRule | null,
  currency: CurrencyCode,
  platformFeePercent: number = 8,
  taxPercent: number = 0,
): PriceBreakdown {
  const subtotalCents = items.reduce(
    (sum, it) => sum + it.unitPriceCents * it.quantity,
    0,
  );
  let discountCents = 0;
  if (discount && subtotalCents >= discount.minSubtotalCents) {
    if (discount.kind === "percent") {
      discountCents = Math.floor((subtotalCents * discount.value) / 100);
    } else {
      discountCents = Math.min(subtotalCents, discount.value);
    }
  }
  const taxableBase = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.floor((taxableBase * taxPercent) / 100);
  const platformFeeCents = Math.floor((taxableBase * platformFeePercent) / 100);
  const totalCents = Math.max(0, subtotalCents - discountCents + taxCents);
  return {
    subtotalCents,
    discountCents,
    taxCents,
    platformFeeCents,
    totalCents,
    currency,
  };
}

export function formatPrice(breakdown: PriceBreakdown, locale: string = "pt-BR"): string {
  const value = breakdown.totalCents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: breakdown.currency,
  }).format(value);
}

export interface CartValidation {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<string>;
}

export function validateCart(items: ReadonlyArray<CartItem>): CartValidation {
  const errors: string[] = [];
  if (items.length === 0) errors.push("Carrinho vazio");
  for (const it of items) {
    if (it.quantity <= 0) errors.push(`${it.title}: quantidade inválida`);
    if (it.quantity > it.maxQuantity) {
      errors.push(`${it.title}: máximo de ${it.maxQuantity} por pedido`);
    }
    if (it.unitPriceCents < 0) errors.push(`${it.title}: preço inválido`);
  }
  const sellerIds = new Set(items.map((it) => it.sellerId));
  if (sellerIds.size > 1) {
    errors.push("Itens de vendedores diferentes não podem ser combinados");
  }
  return { valid: errors.length === 0, errors };
}

export interface BuyerDetails {
  readonly fullName: string;
  readonly email: string;
  readonly cpfCnpj: string | null; // for BRL Pix/boleto
  readonly phone: string | null;
  readonly acceptTerms: boolean;
  readonly receiveUpdates: boolean;
}

export function validateBuyerDetails(d: BuyerDetails): {
  valid: boolean;
  errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  if (d.fullName.trim().length < 3) errors.push("Nome completo obrigatório");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.push("Email inválido");
  if (!d.acceptTerms) errors.push("É preciso aceitar os termos");
  return { valid: errors.length === 0, errors };
}

export interface PaymentIntent {
  readonly intentId: string;
  readonly method: PaymentMethod;
  readonly amountCents: number;
  readonly currency: CurrencyCode;
  readonly status: "created" | "requires_action" | "processing" | "succeeded" | "failed";
  readonly clientSecret: string | null;
  readonly pixQrCode: string | null;
  readonly boletoUrl: string | null;
  readonly expiresAt: number;
}

export function isPaymentExpired(intent: PaymentIntent, now: number): boolean {
  return now > intent.expiresAt;
}

export interface Receipt {
  readonly orderId: string;
  readonly buyerEmail: string;
  readonly items: ReadonlyArray<CartItem>;
  readonly price: PriceBreakdown;
  readonly payment: PaymentIntent;
  readonly issuedAt: number;
  readonly downloadUrl: string | null;
}

export function buildReceipt(
  orderId: string,
  buyer: BuyerDetails,
  items: ReadonlyArray<CartItem>,
  price: PriceBreakdown,
  payment: PaymentIntent,
  now: number,
): Receipt {
  return {
    orderId,
    buyerEmail: buyer.email,
    items,
    price,
    payment,
    issuedAt: now,
    downloadUrl: null,
  };
}

export function nextCheckoutStep(
  current: CheckoutStep,
  paymentStatus: PaymentIntent["status"] | null,
): CheckoutStep {
  if (current === "failed") return "failed";
  if (current === "done") return "done";
  if (paymentStatus === "succeeded") return "done";
  if (paymentStatus === "failed") return "failed";
  switch (current) {
    case "cart":
      return "details";
    case "details":
      return "payment";
    case "payment":
      return "review";
    case "review":
      return "processing";
    case "processing":
      // success/failed already returned above; otherwise stay in processing
      return "processing";
    default:
      return current;
  }
}

export function isMethodAvailableForCurrency(
  method: PaymentMethod,
  currency: CurrencyCode,
): boolean {
  if (currency === "BRL") return true;
  if (currency === "USD" || currency === "EUR") {
    return method !== "pix" && method !== "boleto";
  }
  return false;
}

export function availableMethods(
  currency: CurrencyCode,
  hasSavedCard: boolean,
): ReadonlyArray<PaymentMethod> {
  const all: ReadonlyArray<PaymentMethod> = ["card", "pix", "boleto", "paypal", "apple_pay", "google_pay"];
  return all.filter((m) => isMethodAvailableForCurrency(m, currency) && (m !== "card" || hasSavedCard || true));
}
