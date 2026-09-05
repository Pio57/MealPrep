export interface LanderViewModelDTO {
  title: string;
  ctaLabel: string;
}

/**
 * Static and stateless for now — the lander has no async/reactive input.
 * Kept as a class per the MVVM convention so copy (and later localization)
 * has one obvious place to live without reshaping the ScreenLoader.
 */
export class LanderViewModel {
  public static create(): LanderViewModelDTO {
    return {
      title: 'MealPrep',
      ctaLabel: 'Crea il tuo piano pasti',
    };
  }
}
