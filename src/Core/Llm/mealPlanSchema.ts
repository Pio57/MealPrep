/**
 * JSON Schema handed to the OpenAI Chat Completions API via
 * `response_format: { type: 'json_schema', json_schema: { schema, strict: true } }`
 * so the model's output is guaranteed to parse straight into `MealPlan`
 * (see mealPlanTypes.ts) without free-form-text post-processing.
 */
export const MEAL_PLAN_JSON_SCHEMA = {
  name: 'meal_plan',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      totalPrice: { type: 'number' },
      currency: { type: 'string' },
      days: {
        type: 'array',
        minItems: 7,
        maxItems: 7,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            day: {
              type: 'string',
              enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            },
            meals: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner'] },
                  name: { type: 'string' },
                  prepTimeMinutes: { type: 'integer' },
                  servings: { type: 'integer' },
                  price: { type: 'number' },
                  ingredients: {
                    type: 'array',
                    minItems: 2,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        productId: { type: 'string' },
                        name: { type: 'string' },
                        quantity: { type: 'string' },
                      },
                      required: ['productId', 'name', 'quantity'],
                    },
                  },
                  steps: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        step: { type: 'integer' },
                        instruction: { type: 'string' },
                      },
                      required: ['step', 'instruction'],
                    },
                  },
                },
                required: ['mealType', 'name', 'prepTimeMinutes', 'servings', 'price', 'ingredients', 'steps'],
              },
            },
          },
          required: ['day', 'meals'],
        },
      },
    },
    required: ['days', 'totalPrice', 'currency'],
  },
} as const;
