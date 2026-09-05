import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../../Theme/colors';
import { spacing, radius } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';
import type { MealPlanMeal } from '../../../../Llm/mealPlanTypes';
import { mealEmoji } from './mealEmoji';

export interface MealCardProps {
  meal: MealPlanMeal;
}

const MEAL_TYPE_LABELS_IT: Record<MealPlanMeal['mealType'], string> = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  dinner: 'Cena',
};

export function MealCard({ meal }: MealCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        <Text style={styles.imageEmoji}>{mealEmoji(meal.name)}</Text>
      </View>

      <Text style={styles.mealType}>{MEAL_TYPE_LABELS_IT[meal.mealType]}</Text>
      <Text style={styles.name}>{meal.name}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>⏱ {meal.prepTimeMinutes} min</Text>
        <Text style={styles.meta}>🍽 1 persona</Text>
        <Text style={styles.meta}>€{meal.price.toFixed(2)} / persona</Text>
      </View>

      <Text style={styles.sectionTitle}>Ingredienti</Text>
      {meal.ingredients.map(ingredient => (
        <Text key={`${ingredient.productId}-${ingredient.name}`} style={styles.body}>
          •  {ingredient.name} — {ingredient.quantity}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Ricetta</Text>
      {meal.steps.map(step => (
        <Text key={step.step} style={styles.body}>
          {step.step}. {step.instruction}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  imageBox: {
    height: 160,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  imageEmoji: {
    fontSize: 64,
  },
  mealType: {
    ...typography.cardLabel,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.cardLabel,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
