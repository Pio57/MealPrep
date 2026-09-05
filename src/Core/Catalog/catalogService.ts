import catalogJson from '../../Assets/data/product_catalog_en.json';
import { matchesDietaryNeeds } from './dietaryNeeds';
import { matchesNutritionalGoals } from './nutritionalGoals';
import type { Product } from './types';

const catalog = catalogJson as unknown as Product[];
const catalogById = new Map(catalog.map(product => [product.id, product]));

export function getAllProducts(): Product[] {
  return catalog;
}

export function getProductById(id: string): Product | undefined {
  return catalogById.get(id);
}

export interface CatalogFilters {
  dietaryNeeds: readonly string[];
  nutritionalGoals: readonly string[];
}

/** Products that satisfy every selected dietary need and nutritional goal. */
export function getMatchingProducts(filters: CatalogFilters): Product[] {
  return catalog.filter(
    product =>
      matchesDietaryNeeds(product, filters.dietaryNeeds) &&
      matchesNutritionalGoals(product, filters.nutritionalGoals),
  );
}
