import { getCatalog, getProductsByCategory as _getProductsByCategory, type Product } from './catalog';

export type { Product };
export type ProductCategory = 'rituals' | 'amulets' | 'books';

export interface ProductInfo {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  inStock: boolean;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'rituals', label: 'Rituais' },
  { id: 'amulets', label: 'Amuletos' },
  { id: 'books', label: 'Livros' },
];

/**
 * Get all product categories
 */
export function getCategories(): ProductCategory[] {
  return CATEGORIES.map(c => c.id);
}

/**
 * Get category info by id
 */
export function getCategoryInfo(id: ProductCategory) {
  return CATEGORIES.find(c => c.id === id);
}

/**
 * Get all products
 */
export function getProducts(): Product[] {
  const catalog = getCatalog();
  return catalog.products;
}

/**
 * Filter products by category
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return _getProductsByCategory(category);
}

/**
 * Get available products (in stock)
 */
export function getAvailableProducts(): Product[] {
  const catalog = getCatalog();
  return catalog.products.filter((p) => p.inStock);
}