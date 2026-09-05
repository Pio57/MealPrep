import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../Theme/colors';
import { spacing } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';

export interface ShoppingListItemRowProps {
  name: string;
  quantityLabel: string;
  isChecked: boolean;
  onPress: () => void;
}

export function ShoppingListItemRow({ name, quantityLabel, isChecked, onPress }: ShoppingListItemRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        {isChecked && <View style={styles.checkboxDot} />}
      </View>
      <View style={styles.textBlock}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {isChecked && <View style={styles.strikeLine} />}
        </View>
        {!!quantityLabel && <Text style={styles.quantity}>{quantityLabel}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background,
  },
  textBlock: {
    flex: 1,
  },
  nameRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
  },
  quantity: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  strikeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: typography.body.lineHeight / 2 - 1,
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
});
