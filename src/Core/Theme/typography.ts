import { Platform } from 'react-native';

/**
 * The Promo font ships as one static-weight .ttf per style (no variable font).
 * On iOS, RN resolves `fontFamily` against the font's internal PostScript
 * name (not the filename); on Android it resolves against the asset
 * filename. Both happen to match here, so a single map covers both platforms.
 * If a weight ever renders as system-default on iOS, check the real
 * PostScript name in Font Book and adjust the iOS branch below.
 */
const promoFamily = {
  thin: 'Promo-Thin',
  extraLight: 'Promo-ExtraLight',
  light: 'Promo-Light',
  normal: 'Promo-Normal',
  regular: 'Promo-Regular',
  medium: 'Promo-Medium',
  semiBold: 'Promo-SemiBold',
  bold: 'Promo-Bold',
} as const;

export type PromoWeight = keyof typeof promoFamily;

export function promoFont(weight: PromoWeight): string {
  return Platform.select({
    ios: promoFamily[weight],
    android: promoFamily[weight],
    default: promoFamily[weight],
  });
}

/** Every headline in the Figma file uses the Bold cut — the type scale is size/line-height only. */
export const typography = {
  display: { fontFamily: promoFont('bold'), fontSize: 56, lineHeight: 64 },
  title: { fontFamily: promoFont('bold'), fontSize: 30, lineHeight: 36 },
  subtitle: { fontFamily: promoFont('bold'), fontSize: 20, lineHeight: 26 },
  cardLabel: { fontFamily: promoFont('bold'), fontSize: 16, lineHeight: 20 },
  button: { fontFamily: promoFont('bold'), fontSize: 17, lineHeight: 22 },
  body: { fontFamily: promoFont('medium'), fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: promoFont('medium'), fontSize: 13, lineHeight: 18 },
} as const;
