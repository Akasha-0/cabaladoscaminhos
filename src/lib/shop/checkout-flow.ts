import type { CartItem } from './cart';

// ============================================================
// CHECKOUT FLOW TYPES
// ============================================================

export type CheckoutStep =
  | 'cart_review'
  | 'shipping'
  | 'payment'
  | 'confirmation';

export interface CheckoutStepData {
  cart_review?: {
    items: CartItem[];
    subtotal: number;
    itemCount: number;
  };
  shipping?: {
    address: ShippingAddress;
    selectedMethod: ShippingMethod;
    estimatedDays: number;
  };
  payment?: {
    method: PaymentMethod;
    sessionId?: string;
    paymentIntentId?: string;
  };
  confirmation?: {
    orderId: string;
    orderNumber: string;
    email: string;
    total: number;
  };
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
}

export interface PaymentMethod {
  type: 'stripe' | 'pix' | 'boleto';
  stripePaymentMethodId?: string;
}

export interface CheckoutFlowState {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  data: CheckoutStepData;
  userId?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProcessCheckoutOptions {
  items: CartItem[];
  userId?: string;
  email?: string;
  shippingAddress?: ShippingAddress;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
}

export interface ProcessCheckoutResult {
  success: boolean;
  flowState: CheckoutFlowState;
  nextStep: CheckoutStep | null;
  redirectUrl?: string;
  error?: string;
}

// ============================================================
// CHECKOUT FLOW STATE STORE
// ============================================================

const activeFlows = new Map<string, CheckoutFlowState>();

function generateFlowId(): string {
  return `flow_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createInitialFlow(
  items: CartItem[],
  userId?: string
): CheckoutFlowState {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    currentStep: 'cart_review',
    completedSteps: [],
    data: {
      cart_review: {
        items,
        subtotal,
        itemCount,
      },
    },
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ============================================================
// STEP VALIDATORS
// ============================================================

function validateShippingAddress(address: ShippingAddress): void {
  if (!address.fullName?.trim()) {
    throw new Error('Nome completo é obrigatório');
  }
  if (!address.street?.trim()) {
    throw new Error('Endereço é obrigatório');
  }
  if (!address.city?.trim()) {
    throw new Error('Cidade é obrigatória');
  }
  if (!address.state?.trim()) {
    throw new Error('Estado é obrigatório');
  }
  if (!address.postalCode?.trim()) {
    throw new Error('CEP é obrigatório');
  }
  if (!address.country?.trim()) {
    throw new Error('País é obrigatório');
  }
}

function validateCartReview(flowState: CheckoutFlowState): void {
  const cartData = flowState.data.cart_review;
  if (!cartData?.items?.length) {
    throw new Error('Carrinho vazio');
  }
  if (cartData.itemCount <= 0) {
    throw new Error('Nenhum item no carrinho');
  }
}

function validateShipping(flowState: CheckoutFlowState): void {
  if (!flowState.data.shipping?.address) {
    throw new Error('Endereço de entrega não configurado');
  }
  if (!flowState.data.shipping?.selectedMethod) {
    throw new Error('Método de entrega não selecionado');
  }
}

// ============================================================
// STEP HANDLERS
// ============================================================

async function handleCartReviewStep(
  flowState: CheckoutFlowState
): Promise<ProcessCheckoutResult> {
  validateCartReview(flowState);

  return {
    success: true,
    flowState: {
      ...flowState,
      completedSteps: [...flowState.completedSteps, 'cart_review'],
      currentStep: 'shipping',
      updatedAt: Date.now(),
    },
    nextStep: 'shipping',
  };
}

async function handleShippingStep(
  flowState: CheckoutFlowState,
  address: ShippingAddress,
  method: ShippingMethod
): Promise<ProcessCheckoutResult> {
  validateShippingAddress(address);

  if (!flowState.completedSteps.includes('cart_review')) {
    return {
      success: false,
      flowState,
      nextStep: 'cart_review',
      error: 'Revise o carrinho antes de continuar',
    };
  }

  const shippingData = {
    address,
    selectedMethod: method,
    estimatedDays: method.estimatedDays,
  };

  return {
    success: true,
    flowState: {
      ...flowState,
      completedSteps: [...flowState.completedSteps, 'shipping'],
      currentStep: 'payment',
      data: {
        ...flowState.data,
        shipping: shippingData,
      },
      updatedAt: Date.now(),
    },
    nextStep: 'payment',
  };
}

async function handlePaymentStep(
  flowState: CheckoutFlowState,
  paymentMethod: PaymentMethod
): Promise<ProcessCheckoutResult> {
  if (!flowState.completedSteps.includes('shipping')) {
    return {
      success: false,
      flowState,
      nextStep: 'shipping',
      error: 'Configure o envio antes de pagar',
    };
  }

  const total = calculateTotal(flowState);

  if (paymentMethod.type === 'stripe' && paymentMethod.stripePaymentMethodId) {
    return {
      success: true,
      flowState: {
        ...flowState,
        completedSteps: [...flowState.completedSteps, 'payment'],
        currentStep: 'confirmation',
        data: {
          ...flowState.data,
          payment: {
            method: paymentMethod,
            paymentIntentId: paymentMethod.stripePaymentMethodId,
          },
          confirmation: {
            orderId: generateFlowId(),
            orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
            email: '',
            total,
          },
        },
        updatedAt: Date.now(),
      },
      nextStep: 'confirmation',
    };
  }

  return {
    success: true,
    flowState: {
      ...flowState,
      completedSteps: [...flowState.completedSteps, 'payment'],
      currentStep: 'confirmation',
      data: {
        ...flowState.data,
        payment: {
          method: paymentMethod,
        },
      },
      updatedAt: Date.now(),
    },
    nextStep: 'confirmation',
  };
}

async function handleConfirmationStep(
  flowState: CheckoutFlowState,
  email: string
): Promise<ProcessCheckoutResult> {
  if (!flowState.completedSteps.includes('payment')) {
    return {
      success: false,
      flowState,
      nextStep: 'payment',
      error: 'Complete o pagamento antes de confirmar',
    };
  }

  if (!email?.includes('@')) {
    return {
      success: false,
      flowState,
      nextStep: 'confirmation',
      error: 'Email inválido',
    };
  }

  const total = calculateTotal(flowState);

  const confirmedFlow: CheckoutFlowState = {
    ...flowState,
    completedSteps: [...flowState.completedSteps, 'confirmation'],
    data: {
      ...flowState.data,
      confirmation: {
        orderId: generateFlowId(),
        orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
        email,
        total,
      },
    },
    updatedAt: Date.now(),
  };

  activeFlows.delete(flowState.userId ?? '');

  return {
    success: true,
    flowState: confirmedFlow,
    nextStep: null,
  };
}

// ============================================================
// HELPERS
// ============================================================

function calculateTotal(flowState: CheckoutFlowState): number {
  const subtotal = flowState.data.cart_review?.subtotal ?? 0;
  const shippingCost = flowState.data.shipping?.selectedMethod?.price ?? 0;
  return subtotal + shippingCost;
}

function getNextStepOrder(current: CheckoutStep): CheckoutStep | null {
  const order: CheckoutStep[] = [
    'cart_review',
    'shipping',
    'payment',
    'confirmation',
  ];
  const currentIndex = order.indexOf(current);
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
}

// ============================================================
// MAIN EXPORT
// ============================================================

/**
 * Process a multi-step checkout flow.
 *
 * @example
 * // Start checkout
 * const result = await processCheckout({ items: cartItems, userId: '123' });
 *
 * // Continue with shipping
 * const shippingResult = await processCheckout({
 *   flowId: result.flowState.userId,
 *   shippingAddress: address,
 *   shippingMethod: method
 * });
 *
 * // Complete with payment
 * const paymentResult = await processCheckout({
 *   flowId: shippingResult.flowState.userId,
 *   paymentMethod: { type: 'stripe', stripePaymentMethodId: 'pm_xxx' }
 * });
 */
export async function processCheckout(
  options:
    | (ProcessCheckoutOptions & { flowId?: never })
    | ({ flowId: string } & Partial<ProcessCheckoutOptions>)
): Promise<ProcessCheckoutResult> {
  const { flowId, ...restOptions } = options as {
    flowId?: string;
  } & ProcessCheckoutOptions;

  // Start new flow
  if (!flowId) {
    const { items, userId, email, shippingAddress, shippingMethod, paymentMethod } =
      restOptions;

    if (!items?.length) {
      return {
        success: false,
        flowState: {} as CheckoutFlowState,
        nextStep: null,
        error: 'Carrinho vazio',
      };
    }

    const newFlowId = generateFlowId();
    const flowState = createInitialFlow(items, userId ?? newFlowId);
    activeFlows.set(flowState.userId!, flowState);

    // Auto-advance if minimum data provided
    if (shippingAddress && shippingMethod) {
      return handleShippingStep(flowState, shippingAddress, shippingMethod);
    }

    return {
      success: true,
      flowState,
      nextStep: 'shipping',
    };
  }

  // Resume existing flow
  const existingFlow = activeFlows.get(flowId);
  if (!existingFlow) {
    return {
      success: false,
      flowState: {} as CheckoutFlowState,
      nextStep: null,
      error: 'Sessão de checkout expirada',
    };
  }

  const { shippingAddress, shippingMethod, paymentMethod, email } = restOptions;

  switch (existingFlow.currentStep) {
    case 'cart_review':
      return handleCartReviewStep(existingFlow);

    case 'shipping':
      if (shippingAddress && shippingMethod) {
        return handleShippingStep(existingFlow, shippingAddress, shippingMethod);
      }
      return {
        success: false,
        flowState: existingFlow,
        nextStep: 'shipping',
        error: 'Endereço e método de entrega são obrigatórios',
      };

    case 'payment':
      if (paymentMethod) {
        return handlePaymentStep(existingFlow, paymentMethod);
      }
      return {
        success: false,
        flowState: existingFlow,
        nextStep: 'payment',
        error: 'Método de pagamento é obrigatório',
      };

    case 'confirmation':
      if (email) {
        return handleConfirmationStep(existingFlow, email);
      }
      return {
        success: false,
        flowState: existingFlow,
        nextStep: 'confirmation',
        error: 'Email é obrigatório para confirmação',
      };

    default:
      return {
        success: false,
        flowState: existingFlow,
        nextStep: null,
        error: 'Passo desconhecido',
      };
  }
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Get current checkout flow state.
 */
export function getCheckoutFlow(flowId: string): CheckoutFlowState | null {
  return activeFlows.get(flowId) ?? null;
}

/**
 * Cancel and remove a checkout flow.
 */
export function cancelCheckoutFlow(flowId: string): boolean {
  return activeFlows.delete(flowId);
}

/**
 * Get available shipping methods based on address.
 */
export function getShippingMethods(
  _address: ShippingAddress
): ShippingMethod[] {
  return [
    {
      id: 'sedex',
      name: 'SEDEX',
      price: 25.9,
      estimatedDays: 3,
    },
    {
      id: 'pac',
      name: 'PAC',
      price: 15.9,
      estimatedDays: 7,
    },
    {
      id: 'retirada',
      name: 'Retirada na Loja',
      price: 0,
      estimatedDays: 0,
    },
  ];
}

/**
 * Get checkout progress as percentage.
 */
export function getCheckoutProgress(flowState: CheckoutFlowState): number {
  const steps: CheckoutStep[] = [
    'cart_review',
    'shipping',
    'payment',
    'confirmation',
  ];
  const completedCount = flowState.completedSteps.length;
  return Math.round((completedCount / steps.length) * 100);
}
