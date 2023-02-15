import React from 'react';
import {Text, StyleProp, ViewStyle} from 'react-native';
import {Touchable} from './Touchable';
import {BaseColors} from './colors';
import {StyleSheet} from 'react-native';

type Props = {
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function AppButton({title, style, onPress}: Props) {
  return (
    <Touchable onPress={onPress} style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BaseColors.green,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  title: {
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    color: BaseColors.deepblue,
    textAlign: 'center',
  },
});
