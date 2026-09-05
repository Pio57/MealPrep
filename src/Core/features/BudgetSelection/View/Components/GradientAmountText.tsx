import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors } from '../../../../Theme/colors';
import { promoFont } from '../../../../Theme/typography';

export interface GradientAmountTextProps {
  text: string;
}

const WIDTH = 340;
const HEIGHT = 110;
const FONT_SIZE = 80;

/**
 * The Figma export shows "€82" fading from green into near-black,
 * left to right. RN's <Text> can't fill with a gradient, but
 * react-native-svg (already a dependency) can — no extra native module.
 */
export function GradientAmountText({ text }: GradientAmountTextProps) {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs>
        <LinearGradient id="amountGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.primary} />
          <Stop offset="1" stopColor={colors.primaryGradientEnd} />
        </LinearGradient>
      </Defs>
      <SvgText
        x={WIDTH / 2}
        y={HEIGHT - 26}
        fontSize={FONT_SIZE}
        fontFamily={promoFont('bold')}
        fill="url(#amountGradient)"
        textAnchor="middle"
      >
        {text}
      </SvgText>
    </Svg>
  );
}
