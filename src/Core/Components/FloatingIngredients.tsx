import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/**
 * The brief explicitly hands us full ownership of the assets/emojis around
 * the bag illustration, so this is our own composition, not a Figma trace.
 * Icons sit at even angles on a fixed-radius circle and orbit the bag
 * together; each icon counter-rotates against the shared drive value so it
 * stays upright while it travels around the ring.
 */
const INGREDIENTS: { emoji: string; fontSize: number }[] = [
  { emoji: '🍎', fontSize: 36 },
  { emoji: '🥩', fontSize: 36 },
  { emoji: '🥕', fontSize: 36 },
  { emoji: '🧀', fontSize: 36 },
  { emoji: '🌽', fontSize: 36 },
  { emoji: '🫒', fontSize: 32 },
  { emoji: '🍆', fontSize: 34 },
];

const DEFAULT_ORBIT_RADIUS = 135;
const ICON_BOX = 56;
const STEP_DEG = 360 / INGREDIENTS.length;
const ORBIT_DURATION_MS = 24000;

export interface FloatingIngredientsProps {
  /** Distance of each icon from the center. Defaults to the Lander's ring size. */
  orbitRadius?: number;
  /** When set true, icons fly outward and fade out once, then call `onExplodeEnd`. */
  exploding?: boolean;
  onExplodeEnd?: () => void;
}

const EXPLODE_DISTANCE = 260;
const EXPLODE_DURATION_MS = 550;

export function FloatingIngredients({
  orbitRadius = DEFAULT_ORBIT_RADIUS,
  exploding = false,
  onExplodeEnd,
}: FloatingIngredientsProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const explode = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: ORBIT_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  useEffect(() => {
    if (!exploding) {
      return;
    }
    Animated.timing(explode, {
      toValue: 1,
      duration: EXPLODE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onExplodeEnd?.();
      }
    });
  }, [exploding, explode, onExplodeEnd]);

  const extraRadius = explode.interpolate({ inputRange: [0, 1], outputRange: [0, EXPLODE_DISTANCE] });
  const explodeScale = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const opacity = explode.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {INGREDIENTS.map((ingredient, index) => {
        const baseAngle = index * STEP_DEG;
        const rotate = spin.interpolate({
          inputRange: [0, 1],
          outputRange: [`${baseAngle}deg`, `${baseAngle + 360}deg`],
        });
        const counterRotate = spin.interpolate({
          inputRange: [0, 1],
          outputRange: [`${-baseAngle}deg`, `${-baseAngle - 360}deg`],
        });

        return (
          <Animated.View key={index} style={[styles.pivot, { transform: [{ rotate }] }]}>
            <Animated.View
              style={[
                styles.arm,
                { transform: [{ translateX: Animated.add(orbitRadius, extraRadius) }, { scale: explodeScale }] },
              ]}
            >
              <Animated.Text
                style={[
                  styles.emoji,
                  { fontSize: ingredient.fontSize, transform: [{ rotate: counterRotate }] },
                ]}
              >
                {ingredient.emoji}
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pivot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
  },
  arm: {
    width: ICON_BOX,
    height: ICON_BOX,
    marginLeft: -ICON_BOX / 2,
    marginTop: -ICON_BOX / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
