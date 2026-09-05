export interface ProductDepartment {
  id: string;
  name: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductAmount {
  amount: number;
  currency?: string;
  unit?: string;
}

export interface ProductNetContent {
  value: number;
  unit: string;
}

export interface ProductNutrition {
  energyKcal100g: number;
  fat100g: number;
  saturatedFat100g: number;
  carbohydrates100g: number;
  sugars100g: number;
  fiber100g: number;
  proteins100g: number;
  salt100g: number;
}

export interface ProductLabel {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  department: ProductDepartment;
  category: ProductCategory;
  quantity: string;
  netContent: ProductNetContent;
  price: ProductAmount;
  unitPrice: ProductAmount;
  nutrition: ProductNutrition;
  nutriScore: string;
  novaGroup: number;
  labels: ProductLabel[];
  allergens: string[];
}
