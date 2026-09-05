import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../Theme/colors';
import { radius, layout } from '../Theme/spacing';
import { typography } from '../Theme/typography';

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PillButton({ label, onPress, disabled }: PillButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: layout.ctaHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.surface,
  },
  label: {
    ...typography.button,
    color: colors.background,
  },
  labelDisabled: {
    color: colors.disabledText,
  },
});
