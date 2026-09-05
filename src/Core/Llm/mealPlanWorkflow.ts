import { getMatchingProducts } from '../Catalog/catalogService';
import type { Product } from '../Catalog/types';
import { requestStructuredCompletion } from './openAiClient';
import { MEAL_PLAN_JSON_SCHEMA } from './mealPlanSchema';
import type { MealPlan } from './mealPlanTypes';

export interface GenerateMealPlanInput {
  weeklyBudget: number;
  dietaryNeeds: readonly string[];
  nutritionalGoals: readonly string[];
}

/** Condensed shape sent to the LLM — full nutrition/label objects would waste tokens the model doesn't need per-item. */
interface CatalogItemForPrompt {
  id: string;
  name: string;
  department: string;
  price: number;
  unit: string;
}

const MAX_ITEMS_PER_DEPARTMENT = 25;
const MAX_TOTAL_ITEMS = 220;

/**
 * Caps and diversifies the filtered catalog before it reaches the prompt:
 * an unbounded list would blow past a reasonable prompt-token budget, and
 * capping per-department keeps the LLM from building a plan out of only
 * the alphabetically-first category.
 */
function selectCatalogSubset(products: Product[]): CatalogItemForPrompt[] {
  const byDepartment = new Map<string, Product[]>();
  for (const product of products) {
    const bucket = byDepartment.get(product.department.name) ?? [];
    bucket.push(product);
    byDepartment.set(product.department.name, bucket);
  }

  const subset: CatalogItemForPrompt[] = [];
  for (const [, items] of byDepartment) {
    for (const product of items.slice(0, MAX_ITEMS_PER_DEPARTMENT)) {
      subset.push({
        id: product.id,
        name: product.name,
        department: product.department.name,
        price: product.price.amount,
        unit: product.quantity,
      });
      if (subset.length >= MAX_TOTAL_ITEMS) {
        return subset;
      }
    }
  }
  return subset;
}

function buildPrompt(input: GenerateMealPlanInput, catalogSubset: CatalogItemForPrompt[]) {
  const system = [
    'You are a meal-planning assistant for the MealPrep app, serving Italian users.',
    'RESPOND ENTIRELY IN ITALIAN. Every free-text field — the meal `name`, every ingredient\'s `name`, and every recipe step\'s `instruction` — must be written in natural Italian, with correct grammar and no English words. The catalog product names are in English and are matched ONLY via their exact `productId`; never copy an English catalog name into a `name` field — always give its natural Italian translation instead (e.g. catalog "White yogurt cream" → ingredient name "Yogurt bianco cremoso").',
    'Build a 7-day meal plan using ONLY the products listed in the provided catalog subset — never invent products or prices.',
    'Every meal must reference at least one catalog product via its exact `productId`.',
    'Every meal must include at least 2 ingredients, and 3 whenever practical — avoid single-ingredient meals.',
    'Every meal must be realistic and internally consistent: the `name` must accurately describe a real, well-known dish made from its own `ingredients`, and every recipe `step` must describe actually preparing that exact dish with only those ingredients — never name a dish after a food (e.g. "pasta", "zuppa", "risotto") that is not itself among its ingredients, never write steps that mention ingredients absent from the list, and never write steps that contradict the dish. Double-check before answering: if the `name` mentions an ingredient, that ingredient MUST appear in `ingredients`.',
    'Every meal must fit typical Italian conventions for its `mealType`: "breakfast" means things Italians actually eat in the morning (yogurt, cereal, fette biscottate/toast, fruit, latte, brioche, caffè) — never pasta, risotto, soup, or dinner dishes; "lunch" and "dinner" are proper savory meals.',
    `The plan's totalPrice must not exceed the user's weekly budget of ${input.weeklyBudget} EUR.`,
    'Each day must have exactly 3 meals, one each of mealType "breakfast", "lunch" and "dinner", listed in that order.',
    'Prefer variety across the week over repeating the same meal.',
  ].join(' ');

  const user = JSON.stringify({
    weeklyBudgetEur: input.weeklyBudget,
    dietaryNeeds: input.dietaryNeeds,
    nutritionalGoals: input.nutritionalGoals,
    catalog: catalogSubset,
  });

  return { system, user };
}

export async function generateMealPlan(input: GenerateMealPlanInput): Promise<MealPlan> {
  const matchingProducts = getMatchingProducts({
    dietaryNeeds: input.dietaryNeeds,
    nutritionalGoals: input.nutritionalGoals,
  });
  const catalogSubset = selectCatalogSubset(matchingProducts);

  const { system, user } = buildPrompt(input, catalogSubset);

  return requestStructuredCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    MEAL_PLAN_JSON_SCHEMA,
  );
}
