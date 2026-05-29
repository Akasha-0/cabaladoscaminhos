// ============================================================
// LOJA DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for loja (shop) data access
// - Retrieve all products
// - Get products by category
// - Get specific product by ID
// - Get catalog categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getCatalog,
  getProductById,
  getProductsByCategory,
  type Product,
  type Category,
} from '@/lib/shop/catalog';

interface LojaCatalog {
  categories: Category[];
  products: Product[];
  totalProducts: number;
}

interface ProductFilter {
  category?: string;
  inStock?: boolean;
}

// GET /api/loja/data - Get loja data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const product = searchParams.get('product');
    const inStock = searchParams.get('inStock');

    const catalog = getCatalog();
    const allProducts = catalog.products;

    // Return specific product by ID
    if (product) {
      const productData = getProductById(product);
      if (!productData) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: productData });
    }

    // Return products filtered by category
    if (category) {
      const categoryProducts = getProductsByCategory(category);
      if (categoryProducts.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Category not found or has no products' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: categoryProducts });
    }

    // Return specific loja data by ID
    if (id) {
      // Check special IDs
      if (id === 'all' || id === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            categories: catalog.categories,
            products: allProducts,
            totalProducts: allProducts.length,
          } as LojaCatalog,
        });
      }
      if (id === 'categories' || id === 'categorias') {
        return NextResponse.json({ success: true, data: catalog.categories });
      }
      if (id === 'products' || id === 'produtos') {
        return NextResponse.json({ success: true, data: allProducts });
      }
      if (id === 'total' || id === 'totalProdutos') {
        return NextResponse.json({
          success: true,
          data: {
            totalProducts: allProducts.length,
            totalCategories: catalog.categories.length,
          },
        });
      }

      // Try finding product by ID
      const productData = getProductById(id);
      if (productData) {
        return NextResponse.json({ success: true, data: productData });
      }

      // Try finding category
      const categoryData = catalog.categories.find(
        (c) => c.id === id || c.name.toLowerCase() === id.toLowerCase()
      );
      if (categoryData) {
        const categoryProducts = getProductsByCategory(categoryData.id);
        return NextResponse.json({
          success: true,
          data: {
            ...categoryData,
            products: categoryProducts,
            productCount: categoryProducts.length,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: 'Loja data not found' },
        { status: 404 }
      );
    }

    // Return specific type of loja data
    if (type) {
      if (type === 'all' || type === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            categories: catalog.categories,
            products: allProducts,
            totalProducts: allProducts.length,
          } as LojaCatalog,
        });
      }
      if (type === 'categories' || type === 'categorias') {
        return NextResponse.json({ success: true, data: catalog.categories });
      }
      if (type === 'products' || type === 'produtos') {
        return NextResponse.json({ success: true, data: allProducts });
      }
      if (type === 'total' || type === 'totalProdutos') {
        return NextResponse.json({
          success: true,
          data: {
            totalProducts: allProducts.length,
            totalCategories: catalog.categories.length,
          },
        });
      }
    }

    // Filter by stock availability
    if (inStock !== null) {
      const inStockFilter = inStock === 'true';
      const filteredProducts = allProducts.filter(
        (p) => p.inStock === inStockFilter
      );
      return NextResponse.json({
        success: true,
        data: filteredProducts,
      });
    }

    // Default: return all loja data
    return NextResponse.json({
      success: true,
      data: {
        categories: catalog.categories,
        products: allProducts,
        totalProducts: allProducts.length,
      } as LojaCatalog,
    });
 } catch (_error) {
    console.error('Loja Data API error:', _error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
