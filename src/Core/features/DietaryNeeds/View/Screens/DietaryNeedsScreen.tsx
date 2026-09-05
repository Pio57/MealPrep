import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../Theme/colors';
import { spacing } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';
import { ProgressHeader } from '../../../../Components/ProgressHeader';
import { PillButton } from '../../../../Components/PillButton';
import { SelectableCard } from '../Components/SelectableCard';
import type { DietaryNeedsViewModelDTO } from '../../ViewModel/DietaryNeedsViewModel';

export interface DietaryNeedsScreenProps extends DietaryNeedsViewModelDTO {
  onToggle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DietaryNeedsScreen({
  items,
  isContinueEnabled,
  onToggle,
  onBack,
  onContinue,
}: DietaryNeedsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader step={2} totalSteps={4} onBack={onBack} />
      <Text style={styles.title}>Hai esigenze alimentari?</Text>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {items.map(item => (
          <SelectableCard
            key={item.id}
            label={item.label}
            emoji={item.emoji}
            isSelected={item.isSelected}
            onPress={() => onToggle(item.id)}
          />
        ))}
      </ScrollView>
      <PillButton label="Continua" onPress={onContinue} disabled={!isContinueEnabled} />
    </SafeAreaView>
  );
}

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
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
