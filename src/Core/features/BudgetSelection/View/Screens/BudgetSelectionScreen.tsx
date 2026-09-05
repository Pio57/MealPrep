import { useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../Theme/colors';
import { spacing } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';
import { ProgressHeader } from '../../../../Components/ProgressHeader';
import { PillButton } from '../../../../Components/PillButton';
import { GradientAmountText } from '../Components/GradientAmountText';
import type { BudgetSelectionViewModelDTO } from '../../ViewModel/BudgetSelectionViewModel';

export interface BudgetSelectionScreenProps extends BudgetSelectionViewModelDTO {
  onBudgetChange: (value: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function BudgetSelectionScreen({
  budget,
  min,
  max,
  step,
  onBudgetChange,
  onBack,
  onContinue,
}: BudgetSelectionScreenProps) {
  // Local echo so the amount label updates in the same frame as the thumb —
  // driving it off `budget` alone meant waiting on a round trip through the
  // Jotai atom, which was a visible beat behind the native slider.
  const [liveBudget, setLiveBudget] = useState(budget);

  const handleValueChange = (value: number) => {
    setLiveBudget(value);
    onBudgetChange(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader step={1} totalSteps={4} onBack={onBack} />
      <Text style={styles.title}>Qual è il tuo budget?</Text>
      <View style={styles.amountBlock}>
        <GradientAmountText text={`€${Math.round(liveBudget)}`} />
        <Text style={styles.caption}>a settimana</Text>
        <View style={styles.sliderWrap}>
          <View style={styles.trackBackground} />
          {/* The fill is drawn by the native slider itself (minimumTrackTintColor),
              not a JS-side overlay, so it tracks the thumb with zero lag. */}
          <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={budget}
            onValueChange={handleValueChange}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="transparent"
            thumbTintColor={colors.primary}
            thumbSize={THUMB_SIZE}
          />
        </View>
      </View>
      <PillButton label="Continua" onPress={onContinue} />
    </SafeAreaView>
  );
}

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  amountBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  sliderWrap: {
    width: '78%',
    height: THUMB_SIZE,
    marginTop: spacing.xl,
    justifyContent: 'center',
  },
  trackBackground: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.surface,
  },
  slider: {
    width: '100%',
    height: THUMB_SIZE,
  },
});
