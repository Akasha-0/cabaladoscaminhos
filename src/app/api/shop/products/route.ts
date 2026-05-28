import { NextResponse } from 'next/server';
import { getCatalog, getProductById, getProductsByCategory, type Product } from '@/lib/shop/catalog';

type ProductCategory = 'rituals' | 'amulets' | 'books';

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category') as ProductCategory | null;
  const id = searchParams.get('id');

  if (id) {
    const product = getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  if (category) {
    return NextResponse.json(getProductsByCategory(category));
  }

  return NextResponse.json(getCatalog());
}