import type { MealPlan } from '../../../Llm/mealPlanTypes';
import { getProductById } from '../../../Catalog/catalogService';

export interface ShoppingListItemDTO {
  key: string;
  name: string;
  quantityLabel: string;
  isChecked: boolean;
}

export interface ShoppingListSectionDTO {
  id: string;
  title: string;
  items: ShoppingListItemDTO[];
}

export type ShoppingListLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; sections: ShoppingListSectionDTO[] };

export interface ShoppingListViewModelDTO {
  loadState: ShoppingListLoadState;
}

interface QueryLikeState {
  status: 'pending' | 'error' | 'success';
  data: MealPlan | undefined;
  error: unknown;
}

/**
 * Mirrors a typical large-supermarket walk: fresh departments first (so
 * nothing perishable sits in the cart too long), dry/pantry goods in the
 * middle, drinks and baby products last.
 */
const DEPARTMENT_ORDER = [
  'ortofrutta',
  'panetteria',
  'latticini',
  'carne',
  'salumi',
  'pesce',
  'surgelati',
  'pasta-riso',
  'dispensa',
  'conserve',
  'condimenti',
  'colazione',
  'snack',
  'dietetici',
  'bevande',
  'vini-birre',
  'infanzia',
];

/**
 * Il catalogo prodotti ha i nomi dei reparti in inglese; qui li traduciamo
 * per mostrarli in italiano come il resto dell'app.
 */
const DEPARTMENT_NAME_IT: Record<string, string> = {
  ortofrutta: 'Frutta e Verdura',
  panetteria: 'Panetteria e Pasticceria',
  latticini: 'Latticini e Uova',
  carne: 'Carne',
  salumi: 'Salumi e Affettati',
  pesce: 'Pesce',
  surgelati: 'Surgelati',
  'pasta-riso': 'Pasta, Riso e Sughi',
  dispensa: 'Dispensa',
  conserve: 'Conserve',
  condimenti: 'Olio, Aceto e Condimenti',
  colazione: 'Colazione e Dolci',
  snack: 'Snack e Aperitivi',
  dietetici: 'Biologico e Dietetico',
  bevande: 'Bevande',
  'vini-birre': 'Vini e Birre',
  infanzia: 'Prima Infanzia',
  other: 'Altro',
};

const UNIT_ALIASES: Record<string, string> = {
  gram: 'g',
  grams: 'g',
  g: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  kg: 'kg',
  milliliter: 'ml',
  milliliters: 'ml',
  ml: 'ml',
  liter: 'l',
  liters: 'l',
  litre: 'l',
  litres: 'l',
  l: 'l',
};

interface ParsedQuantity {
  amount: number | null;
  unit: string | null;
  raw: string;
}

/**
 * Ingredient quantities are free text from the LLM ("125 g", "1 x 200 g",
 * "a few crackers"). We only merge the numeric, unit-bearing ones — anything
 * else is kept as its own readable fallback line rather than dropped.
 */
function parseQuantity(raw: string): ParsedQuantity {
  const trimmed = raw.trim();

  const timesMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (timesMatch) {
    const count = parseFloat(timesMatch[1]);
    const each = parseFloat(timesMatch[2]);
    const unit = UNIT_ALIASES[timesMatch[3].toLowerCase()] ?? timesMatch[3].toLowerCase();
    return { amount: count * each, unit, raw: trimmed };
  }

  const simpleMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (simpleMatch) {
    const amount = parseFloat(simpleMatch[1]);
    const unit = UNIT_ALIASES[simpleMatch[2].toLowerCase()] ?? simpleMatch[2].toLowerCase();
    return { amount, unit, raw: trimmed };
  }

  return { amount: null, unit: null, raw: trimmed };
}

interface AggregatedEntry {
  productId: string;
  name: string;
  departmentId: string;
  departmentName: string;
  amount: number | null;
  unit: string | null;
  fallbackLabels: string[];
}

function aggregateIngredients(plan: MealPlan): AggregatedEntry[] {
  const entries = new Map<string, AggregatedEntry>();

  for (const day of plan.days) {
    for (const meal of day.meals) {
      for (const ingredient of meal.ingredients) {
        const parsed = parseQuantity(ingredient.quantity);
        const product = getProductById(ingredient.productId);
        const bucketKey = `${ingredient.productId}|${parsed.unit ?? 'text'}`;
        const existing = entries.get(bucketKey);

        if (existing) {
          if (parsed.amount !== null && existing.amount !== null) {
            existing.amount += parsed.amount;
          } else if (parsed.amount === null) {
            existing.fallbackLabels.push(parsed.raw);
          }
          continue;
        }

        const departmentId = product?.department.id ?? 'other';
        entries.set(bucketKey, {
          productId: ingredient.productId,
          name: ingredient.name,
          departmentId,
          departmentName: DEPARTMENT_NAME_IT[departmentId] ?? DEPARTMENT_NAME_IT.other,
          amount: parsed.amount,
          unit: parsed.unit,
          fallbackLabels: parsed.amount === null ? [parsed.raw] : [],
        });
      }
    }
  }

  return [...entries.values()];
}

function formatQuantityLabel(entry: AggregatedEntry): string {
  if (entry.amount !== null && entry.unit) {
    const rounded = Math.round(entry.amount * 100) / 100;
    return `${rounded} ${entry.unit}`;
  }
  return entry.fallbackLabels.join(', ');
}

export class ShoppingListViewModel {
  public static create(query: QueryLikeState, checkedKeys: ReadonlySet<string>): ShoppingListViewModelDTO {
    if (query.status === 'error') {
      const message = query.error instanceof Error ? query.error.message : 'Qualcosa è andato storto.';
      return { loadState: { status: 'error', message } };
    }
    if (query.status !== 'success' || !query.data) {
      return { loadState: { status: 'loading' } };
    }

    const aggregated = aggregateIngredients(query.data);

    const byDepartment = new Map<string, AggregatedEntry[]>();
    for (const entry of aggregated) {
      const bucket = byDepartment.get(entry.departmentId) ?? [];
      bucket.push(entry);
      byDepartment.set(entry.departmentId, bucket);
    }

    const orderedDepartmentIds = [
      ...DEPARTMENT_ORDER.filter(id => byDepartment.has(id)),
      ...[...byDepartment.keys()].filter(id => !DEPARTMENT_ORDER.includes(id)),
    ];

    const sections: ShoppingListSectionDTO[] = orderedDepartmentIds.map(departmentId => {
      const entriesForDept = [...byDepartment.get(departmentId)!].sort((a, b) => a.name.localeCompare(b.name));
      return {
        id: departmentId,
        title: entriesForDept[0].departmentName,
        items: entriesForDept.map(entry => {
          const key = `${entry.productId}|${entry.unit ?? 'text'}`;
          return {
            key,
            name: entry.name,
            quantityLabel: formatQuantityLabel(entry),
            isChecked: checkedKeys.has(key),
          };
        }),
      };
    });

    return { loadState: { status: 'success', sections } };
  }
}
