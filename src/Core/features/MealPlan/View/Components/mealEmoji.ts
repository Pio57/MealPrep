/**
 * The catalog has no product photography, so meal cards use a keyword-matched
 * emoji as a stand-in "image" — consistent with the emoji iconography already
 * used across onboarding (dietary needs, nutritional goals, floating ingredients).
 */
const KEYWORD_EMOJI: Array<[RegExp, string]> = [
  [/chicken/i, '🍗'],
  [/salmon|tuna|fish/i, '🐟'],
  [/shrimp|prawn/i, '🍤'],
  [/beef|steak|burger/i, '🍔'],
  [/pork|bacon|ham/i, '🥓'],
  [/pasta|spaghetti|noodle/i, '🍝'],
  [/pizza/i, '🍕'],
  [/rice/i, '🍚'],
  [/salad/i, '🥗'],
  [/soup|stew/i, '🍲'],
  [/egg/i, '🥚'],
  [/toast|bread|sandwich/i, '🥪'],
  [/yogurt|yoghurt|oat/i, '🥣'],
  [/peanut|almond|nut/i, '🥜'],
  [/smoothie|juice|shake/i, '🥤'],
  [/pancake|waffle/i, '🥞'],
  [/cheese/i, '🧀'],
  [/soy|tofu/i, '🌱'],
];

export function mealEmoji(name: string): string {
  const match = KEYWORD_EMOJI.find(([pattern]) => pattern.test(name));
  return match ? match[1] : '🍽️';
}
