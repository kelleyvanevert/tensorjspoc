import {useEffect} from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  EasingFn,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  ZoomIn,
  Keyframe,
} from 'react-native-reanimated';

export const magic = {
  damping: 50,
  mass: 0.2,
  stiffness: 200,
  overshootClamping: true,
  restSpeedThreshold: 0.3,
  restDisplacementThreshold: 0.3,
  velocity: 1,
};

export function useSpringFollowDerived(derived: Animated.DerivedValue<number>) {
  const follow = useSharedValue(derived.value);

  useAnimatedReaction(
    () => derived.value,
    newDerivedValue => {
      cancelAnimation(follow);
      follow.value = withSpring(newDerivedValue, magic);
    },
  );

  return follow;
}

export function useSpringFollow(value: number) {
  const follow = useSharedValue(value);

  useEffect(() => {
    cancelAnimation(follow);
    follow.value = withSpring(value, magic);
  }, [value]);

  return follow;
}

export function startEasingAt(offset: number, easing: EasingFn): EasingFn {
  'worklet';
  return (t: number) => {
    'worklet';
    return easing(t * (1 - offset) + offset);
  };
}

export function bubbleZoomEnter(startAt = 0.3) {
  return ZoomIn.easing(
    startEasingAt(startAt, Easing.bezier(0.25, 0.1, 0.25, 1).factory()),
  );
}

export function enterFadeSlideUp({startTranslateY = 25}) {
  return new Keyframe({
    from: {
      opacity: 1,
      transform: [
        {
          translateY: startTranslateY,
        },
      ],
    },
    to: {
      opacity: 1,
      transform: [
        {
          translateY: 0,
        },
      ],
      easing: Easing.bezier(0.25, 0.1, 0.25, 1).factory(),
    },
  });
}

export function exitFadeSlideDown({targetTranslateY = 25}) {
  return new Keyframe({
    from: {
      opacity: 1,
      transform: [
        {
          translateY: 0,
        },
      ],
    },
    to: {
      opacity: 1,
      transform: [
        {
          translateY: targetTranslateY,
        },
      ],
      easing: Easing.bezier(0.25, 0.1, 0.25, 1).factory(),
    },
  });
}
