/** Screen horizontal margin, card gaps and the CTA/back-button geometry are all measured off the Figma exports. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 20,
  cardGap: 16,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  card: 20,
  pill: 999,
} as const;

export const layout = {
  backButtonSize: 28,
  ctaHeight: 72,
  progressTrackHeight: 12,
} as const;
