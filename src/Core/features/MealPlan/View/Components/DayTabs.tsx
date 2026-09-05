import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../../../Theme/colors';
import { spacing, radius } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';

export interface DayTabsProps {
  days: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const EDGE_FADE_WIDTH = 32;

export function DayTabs({ days, selectedIndex, onSelect }: DayTabsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {days.map((day, index) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.tab, isSelected ? styles.tabActive : styles.tabInactive]}
              onPress={() => onSelect(index)}
              activeOpacity={0.85}
            >
              <Text style={[styles.label, isSelected ? styles.labelActive : styles.labelInactive]}>
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Fades the trailing edge so a partly-hidden pill reads as "more to scroll" rather than a layout cut-off. */}
      <View pointerEvents="none" style={styles.edgeFade}>
        <Svg width={EDGE_FADE_WIDTH} height="100%">
          <Defs>
            <LinearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={EDGE_FADE_WIDTH} height="100%" fill="url(#fade)" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.screenPadding,
    paddingRight: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  edgeFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: EDGE_FADE_WIDTH,
  },
  tab: {
    minWidth: 56,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.dayPillActive,
  },
  tabInactive: {
    backgroundColor: colors.dayPillInactive,
  },
  label: {
    ...typography.cardLabel,
  },
  labelActive: {
    color: colors.dayPillInactive,
  },
  labelInactive: {
    color: colors.dayPillActive,
  },
});
