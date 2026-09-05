import Svg, { Path, Circle } from 'react-native-svg';

interface CartIconProps {
  size?: number;
  color?: string;
}

export function CartIcon({ size = 20, color = '#FFFFFF' }: CartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 3H4.5L5.4 5M5.4 5L7.2 14.2C7.35 15 8.05 15.6 8.86 15.6H18.1C18.9 15.6 19.6 15.02 19.75 14.24L21.2 6.7C21.35 5.9 20.73 5.15 19.91 5.15H5.4Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9.5" cy="19.5" r="1.5" fill={color} />
      <Circle cx="17.5" cy="19.5" r="1.5" fill={color} />
    </Svg>
  );
}
