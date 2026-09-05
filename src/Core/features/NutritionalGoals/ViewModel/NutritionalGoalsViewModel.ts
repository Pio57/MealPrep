import { NUTRITIONAL_GOAL_OPTIONS } from '../../../Catalog/nutritionalGoals';

export interface NutritionalGoalItemDTO {
  id: string;
  label: string;
  emoji?: string;
  isSelected: boolean;
}

export interface NutritionalGoalsViewModelDTO {
  items: NutritionalGoalItemDTO[];
  isContinueEnabled: boolean;
}

export class NutritionalGoalsViewModel {
  public static create(selectedIds: readonly string[]): NutritionalGoalsViewModelDTO {
    return {
      items: NUTRITIONAL_GOAL_OPTIONS.map(option => ({
        id: option.id,
        label: option.label,
        emoji: option.emoji,
        isSelected: selectedIds.includes(option.id),
      })),
      isContinueEnabled: selectedIds.length > 0,
    };
  }
}
