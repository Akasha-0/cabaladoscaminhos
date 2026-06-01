import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCatalog, getProductById, getProductsByCategory, type Product } from '@/lib/shop/catalog';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ShopProductsQuerySchema = z.object({
  category: z.enum(['rituals', 'amulets', 'books']).optional(),
  id: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Shop Products ──────────────────────────────────────────
const PRODUCT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  rituals: {
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O ritual me conecta às forças sagradas',
    frequency: '528 Hz',
  },
  amulets: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A proteção sagrada me envolve',
    frequency: '396 Hz',
  },
  books: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria dos livros me ilumina',
    frequency: '741 Hz',
  },
};

type ProductCategory = 'rituals' | 'amulets' | 'books';

interface EnhancedProduct extends Product {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parseResult = ShopProductsQuerySchema.safeParse({
    category: searchParams.get('category'),
    id: searchParams.get('id'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { category, id, sefirot, chakra, element, orixa } = parseResult.data;

  try {
    if (id) {
      const product = getProductById(id);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      // Determine category from product
      const productCategory = (product as EnhancedProduct).category as ProductCategory || 'rituals';
      const correlations = PRODUCT_SPIRITUAL_CORRELATIONS[productCategory] || PRODUCT_SPIRITUAL_CORRELATIONS.rituals;
      return NextResponse.json({
        success: true,
        product: {
          ...product,
          ...correlations,
          spiritualCorrelations: correlations,
        },
        spiritualCorrelations: correlations,
      });
    }

    let products: Product[];

    if (category) {
      products = getProductsByCategory(category);
    } else {
      products = getCatalog().products;
    }

    // Add spiritual correlations to all products
    const enhancedProducts = products.map(p => {
      const productCategory = (p as EnhancedProduct).category as ProductCategory || 'rituals';
      const correlations = PRODUCT_SPIRITUAL_CORRELATIONS[productCategory] || PRODUCT_SPIRITUAL_CORRELATIONS.rituals;
      return {
        ...p,
        ...correlations,
        spiritualCorrelations: correlations,
      } as EnhancedProduct;
    });

    // Filter by spiritual dimensions
    let filteredProducts = enhancedProducts;

    if (sefirot) {
      filteredProducts = filteredProducts.filter(p => p.spiritualCorrelations.sefirot.includes(sefirot));
    }

    if (chakra) {
      filteredProducts = filteredProducts.filter(p => p.spiritualCorrelations.chakra === chakra);
    }

    if (element) {
      filteredProducts = filteredProducts.filter(p => p.spiritualCorrelations.element === element);
    }

    if (orixa) {
      filteredProducts = filteredProducts.filter(p => p.spiritualCorrelations.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byCategory: filteredProducts.reduce((acc, p) => {
        const cat = (p as EnhancedProduct).category as ProductCategory || 'rituals';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: filteredProducts.reduce((acc, p) => {
        p.spiritualCorrelations.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: filteredProducts.reduce((acc, p) => {
        const c = p.spiritualCorrelations.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: filteredProducts.reduce((acc, p) => {
        const e = p.spiritualCorrelations.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: filteredProducts.reduce((acc, p) => {
        const o = p.spiritualCorrelations.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      count: filteredProducts.length,
      spiritualCorrelations: PRODUCT_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { category, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}