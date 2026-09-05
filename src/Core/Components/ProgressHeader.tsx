import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../Theme/colors';
import { spacing, radius, layout } from '../Theme/spacing';

export interface ProgressHeaderProps {
  /** 1-based index of the current step out of `totalSteps` (Budget=1, Dietary=2, Nutritional=3). */
  step: number;
  totalSteps: number;
  onBack: () => void;
}

/** Back chevron + step-progress pill, shared by the three middle screens of the flow. */
export function ProgressHeader({ step, totalSteps, onBack }: ProgressHeaderProps) {
  const fillFraction = Math.min(1, Math.max(0, step / totalSteps));
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: fillFraction,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [fillFraction, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
        <ChevronLeft />
      </TouchableOpacity>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

function ChevronLeft() {
  return <View style={styles.chevron} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: layout.backButtonSize,
    height: layout.backButtonSize,
    borderRadius: layout.backButtonSize / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    width: 7,
    height: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.textPrimary,
    transform: [{ rotate: '45deg' }],
    marginLeft: 3,
  },
  track: {
    flex: 1,
    height: layout.progressTrackHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
});
