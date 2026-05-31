import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';
import { z } from 'zod';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, CartItem } from '@/lib/shop/cart';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().min(1).default(1),
  imageUrl: z.string().optional(),
});
const ShopActionSchema = z.object({
  action: z.enum(['add', 'remove', 'update', 'clear']),
  item: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    price: z.number().optional(),
    quantity: z.number().optional(),
    imageUrl: z.string().optional(),
  }).optional(),
});
export const GET = withErrorHandler(async () => {
  const cart = getCart();
  return NextResponse.json(cart);
});
export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const parseResult = ShopActionSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Dados inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }
  const { action, item } = parseResult.data;
  let cart;
  switch (action) {
    case 'add': {

  let cart;

  switch (action) {
    case 'add': {
      if (!item) {
        return NextResponse.json({ error: 'Item is required for add action' }, { status: 400 });
      }
      cart = addToCart(item);
      break;
    }
    case 'remove': {
      if (!item?.id) {
        return NextResponse.json({ error: 'Item id is required for remove action' }, { status: 400 });
      }
      cart = removeFromCart(item.id);
      break;
    }
    case 'update': {
      if (!item?.id || typeof item?.quantity !== 'number') {
        return NextResponse.json({ error: 'Item id and quantity are required for update action' }, { status: 400 });
      }
      cart = updateCartItemQuantity(item.id, item.quantity);
      break;
    }
    case 'clear': {
      cart = clearCart();
      break;
    }
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json(cart);
});