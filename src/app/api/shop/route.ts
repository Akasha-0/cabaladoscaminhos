import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, CartItem } from '@/lib/shop/cart';

export const GET = withErrorHandler(async () => {
  const cart = getCart();
  return NextResponse.json(cart);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { action, item } = body;

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

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