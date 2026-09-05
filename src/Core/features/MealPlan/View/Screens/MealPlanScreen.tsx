import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../Theme/colors';
import { spacing, radius } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';
import { FloatingIngredients } from '../../../../Components/FloatingIngredients';
import { CartIcon } from '../Components/CartIcon';
import { DayTabs } from '../Components/DayTabs';
import { MealCard } from '../Components/MealCard';
import { MealFeedbackButtons } from '../Components/MealFeedbackButtons';
import { MealPagerDots } from '../Components/MealPagerDots';
import { mealFeedbackKey, type MealFeedback } from '../../State/mealFeedbackAtoms';
import type { MealPlanViewModelDTO } from '../../ViewModel/MealPlanViewModel';
import { DAY_LABELS_IT } from '../../../../Llm/dayLabels';

export interface MealPlanScreenProps extends MealPlanViewModelDTO {
  onSelectDay: (index: number) => void;
  onRetry: () => void;
  onOpenShoppingList: () => void;
  onSetMealFeedback: (mealKey: string, feedback: MealFeedback) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PEEK = 20;
const GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - PEEK * 2;
const SNAP_INTERVAL = CARD_WIDTH + GAP;

export function MealPlanScreen({
  loadState,
  selectedDayIndex,
  feedbackByMealKey,
  onSelectDay,
  onRetry,
  onOpenShoppingList,
  onSetMealFeedback,
}: MealPlanScreenProps) {
  // Fires once, the first time a plan finishes loading: the orbiting icons
  // burst outward instead of just vanishing, then the plan fades in.
  const [showBurst, setShowBurst] = useState(false);
  const [readyToReveal, setReadyToReveal] = useState(false);
  const wasLoadingRef = useRef(false);
  const contentFade = useRef(new Animated.Value(1)).current;
  const prevStatusRef = useRef(loadState.status);

  // Tracks horizontal scroll position of the meal pager so the dots above
  // it can grow/shrink smoothly as the user drags between cards.
  const scrollX = useRef(new Animated.Value(0)).current;
  const prevDayIndexRef = useRef(selectedDayIndex);
  if (prevDayIndexRef.current !== selectedDayIndex) {
    prevDayIndexRef.current = selectedDayIndex;
    scrollX.setValue(0);
  }

  // Detected and handled synchronously during render (not in a useEffect) so
  // the burst starts on the very same commit the data arrives — a useEffect
  // here would let one frame of the finished plan flash through first.
  if (prevStatusRef.current !== loadState.status) {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = loadState.status;
    if (prevStatus === 'loading' && loadState.status === 'success' && !readyToReveal) {
      contentFade.setValue(0);
      setShowBurst(true);
    }
  }

  const handleExplodeEnd = () => {
    setShowBurst(false);
    setReadyToReveal(true);
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  if (loadState.status === 'loading' || showBurst) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingOrbit}>
          <FloatingIngredients orbitRadius={80} exploding={showBurst} onExplodeEnd={handleExplodeEnd} />
        </View>
        {!showBurst && <Text style={styles.loadingLabel}>Stiamo preparando il tuo piano…</Text>}
      </SafeAreaView>
    );
  }

  if (loadState.status === 'error') {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorTitle}>Impossibile generare il piano</Text>
        <Text style={styles.errorMessage}>{loadState.message}</Text>
        <TouchableOpacity style={styles.retry} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryLabel}>Riprova</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { plan } = loadState;
  const selectedDay = plan.days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.container, { opacity: contentFade }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>Buon appetito!</Text>
        <TouchableOpacity style={styles.cartButton} onPress={onOpenShoppingList} activeOpacity={0.7}>
          <CartIcon color={colors.background} size={19} />
        </TouchableOpacity>
      </View>
      <View style={styles.costCard}>
        <Text style={styles.costLabel}>Costo stimato</Text>
        <Text style={styles.costAmount}>
          €{Math.round(plan.totalPrice)} <Text style={styles.costUnit}>/ settimana</Text>
        </Text>
      </View>
      <DayTabs
        days={plan.days.map(day => DAY_LABELS_IT[day.day])}
        selectedIndex={selectedDayIndex}
        onSelect={onSelectDay}
      />

      <Text style={styles.dayHeading}>{DAY_LABELS_IT[selectedDay.day]}</Text>
      <Text style={styles.swipeHint}>Scorri le card a destra o sinistra per scoprire i pasti del giorno</Text>
      <MealPagerDots count={selectedDay.meals.length} scrollX={scrollX} snapInterval={SNAP_INTERVAL} />

      <ScrollView
        key={selectedDay.day}
        horizontal
        pagingEnabled={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.pagerContent}
        style={styles.pager}
      >
        {selectedDay.meals.map(meal => {
          const key = mealFeedbackKey(selectedDay.day, meal.name);
          return (
            <View key={meal.name} style={styles.mealPage}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.mealPageContent}
              >
                <MealCard meal={meal} />
              </ScrollView>
              <MealFeedbackButtons
                feedback={feedbackByMealKey[key] ?? null}
                onSetFeedback={feedback => onSetMealFeedback(key, feedback)}
              />
            </View>
          );
        })}
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  loadingOrbit: {
    width: 200,
    height: 200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.screenPadding,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    ...typography.title,
    fontSize: 32,
    color: colors.background,
    textAlign: 'center',
    flex: 1,
  },
  errorTitle: {
    ...typography.title,
    color: colors.background,
    textAlign: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  costCard: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  costLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  costAmount: {
    ...typography.subtitle,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  costUnit: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pager: {
    flex: 1,
    marginTop: spacing.md,
  },
  pagerContent: {
    paddingLeft: PEEK,
    paddingBottom: spacing.lg,
  },
  mealPage: {
    width: CARD_WIDTH,
    marginRight: GAP,
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.card * 1.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  mealPageContent: {
    paddingBottom: spacing.lg,
  },
  dayHeading: {
    ...typography.title,
    color: colors.background,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  swipeHint: {
    ...typography.caption,
    color: colors.onPrimaryMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  loadingLabel: {
    ...typography.subtitle,
    color: colors.background,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  errorMessage: {
    ...typography.body,
    color: colors.background,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  retry: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  retryLabel: {
    ...typography.button,
    color: colors.primary,
  },
});
