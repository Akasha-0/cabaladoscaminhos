import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/food/sacred-food-data';
import { performMedicine } from '@/lib/food/food-medicine';

describe('food/sacred-food-data', () => {
  it('returns sacred food data', () => {
    const foods = getData();
    expect(Array.isArray(foods)).toBe(true);
    expect(foods.length).toBeGreaterThan(0);
  });

  it('food items have required properties', () => {
    const foods = getData();
    const food = foods[0];
    expect(food).toHaveProperty('id');
    expect(food).toHaveProperty('name');
    expect(food).toHaveProperty('category');
  });
});

describe('food/food-medicine', () => {
  it('performMedicine runs without errors', () => {
    expect(() => performMedicine()).not.toThrow();
  });
});