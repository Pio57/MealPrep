import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../Theme/colors';
import { spacing } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';
import { PillButton } from '../../../../Components/PillButton';
import { FloatingIngredients } from '../../../../Components/FloatingIngredients';
import type { LanderViewModelDTO } from '../../ViewModel/LanderViewModel';

export interface LanderScreenProps extends LanderViewModelDTO {
  onGetStarted: () => void;
}

export function LanderScreen({ title, ctaLabel, onGetStarted }: LanderScreenProps) {
  const [exploding, setExploding] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.illustrationBox}>
        <FloatingIngredients exploding={exploding} onExplodeEnd={onGetStarted} />
        <Image
          source={require('../../../../../Assets/images/esselunga-bag.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
      <PillButton label={ctaLabel} onPress={() => setExploding(true)} disabled={exploding} />
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
    fontSize: 36,
    lineHeight: 42,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  illustrationBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: 180,
    height: 180,
  },
});
