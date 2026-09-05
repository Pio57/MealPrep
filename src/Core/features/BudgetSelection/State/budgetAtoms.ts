import { atom } from 'jotai';

export const BUDGET_MIN = 25;
export const BUDGET_MAX = 150;
export const BUDGET_STEP = 5;
const BUDGET_DEFAULT = 75;

export const weeklyBudgetAtom = atom<number>(BUDGET_DEFAULT);
