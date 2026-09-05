import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../../Theme/colors';
import { spacing, radius } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';

export interface SelectableCardProps {
  label: string;
  emoji?: string;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * The Figma file only shows the neutral (unselected) state — the selected
 * state is one of the "small parts" the brief calls out as intentionally
 * left for us to design. A primary-green border + tint keeps it inside the
 * existing palette instead of introducing a new accent.
 *
 * The tint/border animate in on selection (instead of snapping) so toggling
 * feels like a smooth fill rather than a hard color swap.
 */
export function SelectableCard({ label, emoji, isSelected, onPress }: SelectableCardProps) {
  const selection = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selection, {
      toValue: isSelected ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isSelected, selection]);

  const backgroundColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, '#E9F9EE'],
  });
  const borderColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.primary],
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor, borderColor }]}>
      <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.8}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    minHeight: 104,
    borderRadius: radius.card,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: spacing.cardGap,
  },
  touchable: {
    flex: 1,
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.cardLabel,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
