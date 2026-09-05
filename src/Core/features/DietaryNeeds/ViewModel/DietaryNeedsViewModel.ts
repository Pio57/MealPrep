import { DIETARY_NEED_OPTIONS } from '../../../Catalog/dietaryNeeds';

export interface DietaryNeedItemDTO {
  id: string;
  label: string;
  emoji?: string;
  isSelected: boolean;
}

export interface DietaryNeedsViewModelDTO {
  items: DietaryNeedItemDTO[];
  isContinueEnabled: boolean;
}

export class DietaryNeedsViewModel {
  public static create(selectedIds: readonly string[]): DietaryNeedsViewModelDTO {
    return {
      items: DIETARY_NEED_OPTIONS.map(option => ({
        id: option.id,
        label: option.label,
        emoji: option.emoji,
        isSelected: selectedIds.includes(option.id),
      })),
      isContinueEnabled: selectedIds.length > 0,
    };
  }
}
