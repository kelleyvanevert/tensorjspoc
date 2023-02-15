import React, {MutableRefObject, useEffect, useRef} from 'react';
import {ViewStyle, StyleProp} from 'react-native';
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  TapGestureHandlerProperties,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  runOnJS,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {useRefCallback} from '../lib/useRefCallback';

import {magic} from './magic';

export type TouchableProps = {
  // Just a little helper for debugging purposes
  debug?: boolean;

  // Visually & interactively disable the touchable
  disabled?: boolean;
  // Interactively disable the touchable, as if it wasn't even there
  inactive?: boolean;

  // The amount (in px) by which the touchable should shrink if pressed. Defaults to a reasonable number based on the layouted width
  subtractedWidth?: number;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: StyleProp<ViewStyle> | StyleProp<Animated.AnimateStyle<ViewStyle>>;
  styleWorkletFn?: (pressed: number, activated: number) => ViewStyle;
  accessibilityLabel?: string;
  minPressDuration?: number; // in ms
  preventAccidentalMultiTap?: boolean;
  allowReleaseOutside?: boolean;
  gestureHandlerRef?: MutableRefObject<unknown>;
  waitFor?: TapGestureHandlerProperties['waitFor'];
  maxDurationMs?: number;
  children?: React.ReactNode;
};

const PRETTY_MUCH_FOREVER = 10000000;

const DETECT_TAP_ON_UI_THREAD = false;

// TODO:
// - refactor to new `Gesture.Tap()` API of RNGH, so that it's easier to add options like `minPressDuration` for things like the hold button
export function Touchable({
  debug,
  disabled,
  inactive,
  subtractedWidth,
  children,
  style,
  styleWorkletFn,
  accessibilityLabel,
  onPress,
  onPressIn,
  onPressOut,
  minPressDuration, // TODO
  allowReleaseOutside,
  preventAccidentalMultiTap = true,
  gestureHandlerRef,
  maxDurationMs,
  waitFor,
}: TouchableProps) {
  // (not doing anything different here yet, but, a half transparent state or smth does often make sense for "visually disabled", so I'm leaving that room open here)
  const behaviorallyDisabled = disabled || inactive;
  // const visuallyDisabled = disabled;

  const pressed = useSharedValue(0); // smooth between 0 and 1
  const activated = useSharedValue(0); // either 0 or 1
  const width = useSharedValue(200);

  const startTapAt = useSharedValue(0);
  const previousTapAt = useSharedValue(0);

  const _onPressIn = useRefCallback(onPressIn);
  const _onPressOut = useRefCallback(onPressOut);
  const _onPress = useRefCallback(onPress);

  const animatedStyle = useAnimatedStyle(() => {
    if (subtractedWidth === 0) return {};

    const f = interpolate(
      width.value,
      [400, 40],
      [0.03, 0.1],
      Extrapolate.CLAMP,
    );
    const pressedWidth = width.value - (subtractedWidth ?? width.value * f);

    // if (debug) {
    //   console.log('f', f, 'w', width.value, '->', pressedWidth);
    // }

    const styles = {
      transform: [
        {
          // scale: 1,
          scale: interpolate(
            pressed.value,
            [0, 1],
            [1, pressedWidth / width.value],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };

    if (styleWorkletFn) {
      Object.assign(styles, styleWorkletFn(pressed.value, activated.value));
    }

    return styles;
  }, [pressed, activated, width, styleWorkletFn]);

  const handleGesture =
    useAnimatedGestureHandler<TapGestureHandlerGestureEvent>(
      {
        onStart() {
          if (behaviorallyDisabled) return;
          runOnJS(_onPressIn)();
          pressed.value = withSpring(1, magic);
        },
        // onActive() {},
        onEnd() {
          if (behaviorallyDisabled) return;

          if (DETECT_TAP_ON_UI_THREAD) {
            const time = Date.now();
            const dt = time - previousTapAt.value;
            if (preventAccidentalMultiTap && dt < 250) {
              // noop -- this is an accidental double-tap
            } else {
              previousTapAt.value = time;
              runOnJS(_onPress)();
            }
          }

          activated.value = 1;
        },
        // onCancel() {},
        // onFail() {},
        onFinish() {
          if (behaviorallyDisabled) return;
          runOnJS(_onPressOut)();
          pressed.value = withSpring(0, magic);
        },
      },
      [
        behaviorallyDisabled,
        _onPressIn,
        pressed,
        previousTapAt,
        activated,
        _onPressOut,
        _onPress,
        preventAccidentalMultiTap,
      ],
    );

  useEffect(() => {
    if (behaviorallyDisabled) {
      cancelAnimation(pressed);
      pressed.value = withSpring(0, magic);
    }
  }, [behaviorallyDisabled]);

  const lastTap = useRef(-Infinity);
  const onTap = useRefCallback(() => {
    if (behaviorallyDisabled) return;

    if (!DETECT_TAP_ON_UI_THREAD) {
      const time = Date.now();
      const dt = time - lastTap.current;
      if (preventAccidentalMultiTap && dt < 250) {
        // noop -- this is an accidental double-tap
      } else {
        lastTap.current = time;
        onPress?.();
      }
    }
  });

  return (
    <TapGestureHandler
      enabled={!behaviorallyDisabled}
      onGestureEvent={handleGesture}
      onActivated={onTap}
      waitFor={waitFor}
      shouldCancelWhenOutside={false}
      ref={gestureHandlerRef}
      {...(allowReleaseOutside
        ? {
            // shouldCancelWhenOutside: true,
            maxDurationMs: PRETTY_MUCH_FOREVER,
            maxDist: PRETTY_MUCH_FOREVER,
          }
        : {
            maxDist: 50,
            maxDurationMs: 1000,
          })}
      {...{maxDurationMs}}>
      <Animated.View
        style={[style, animatedStyle]}
        onLayout={e => {
          width.value = e.nativeEvent.layout.width;
        }}
        accessible
        accessibilityLabel={accessibilityLabel}>
        {children}
      </Animated.View>
    </TapGestureHandler>
  );
}
