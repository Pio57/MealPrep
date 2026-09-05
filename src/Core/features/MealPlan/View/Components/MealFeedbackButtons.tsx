import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../Theme/colors';
import { spacing } from '../../../../Theme/spacing';
import type { MealFeedback } from '../../State/mealFeedbackAtoms';

export interface MealFeedbackButtonsProps {
  feedback: MealFeedback;
  onSetFeedback: (feedback: MealFeedback) => void;
}

/**
 * Pinned over the card (outside the scrollable body) so voting never
 * requires scrolling to the bottom of a long recipe first.
 */
export function MealFeedbackButtons({ feedback, onSetFeedback }: MealFeedbackButtonsProps) {
  return (
    <View style={styles.pill}>
      <TouchableOpacity
        style={[styles.button, feedback === 'like' && styles.buttonActive]}
        onPress={() => onSetFeedback('like')}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.emoji}>👍</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, feedback === 'dislike' && styles.buttonActive]}
        onPress={() => onSetFeedback('dislike')}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.emoji}>👎</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: 'rgba(253,255,251,0.88)',
    borderRadius: 999,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  emoji: {
    fontSize: 16,
  },
});
