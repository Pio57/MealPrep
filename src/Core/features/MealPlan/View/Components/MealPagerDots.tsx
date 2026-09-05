import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../../../Theme/colors';
import { spacing } from '../../../../Theme/spacing';

export interface MealPagerDotsProps {
  count: number;
  scrollX: Animated.Value;
  snapInterval: number;
}

const DOT_SIZE = 8;
const DOT_ACTIVE_WIDTH = 24;

export function MealPagerDots({ count, scrollX, snapInterval }: MealPagerDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => {
        const center = index * snapInterval;
        const width = scrollX.interpolate({
          inputRange: [center - snapInterval, center, center + snapInterval],
          outputRange: [DOT_SIZE, DOT_ACTIVE_WIDTH, DOT_SIZE],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange: [center - snapInterval, center, center + snapInterval],
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });
        return <Animated.View key={index} style={[styles.dot, { width, opacity }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.background,
  },
});
