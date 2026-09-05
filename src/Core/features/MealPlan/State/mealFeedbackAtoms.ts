import { atom } from 'jotai';

export type MealFeedback = 'like' | 'dislike' | null;

/**
 * A single map atom (not `atomFamily`) so the number of Jotai subscriptions
 * stays constant regardless of how many meals the current plan has — an
 * `atomFamily` read per-meal in a variable-length loop would change the
 * ScreenLoader's hook count across query refetches.
 */
export const mealFeedbackMapAtom = atom<Record<string, MealFeedback>>({});

export function mealFeedbackKey(day: string, mealName: string): string {
  return `${day}::${mealName}`;
}
