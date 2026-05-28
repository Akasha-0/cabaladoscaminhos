import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/shop/catalog';

export function GET() {
  const catalog = getCatalog();
  return NextResponse.json({ categories: [] });
}
