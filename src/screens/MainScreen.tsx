import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton} from '../components/AppButton';
import {BaseColors} from '../components/colors';

export function MainScreen() {
  const insets = useSafeAreaInsets();

  const [count, setCount] = useState(0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={{height: insets.top + 24}} />

      <View style={{marginHorizontal: 24, flexGrow: 1}}>
        <Text style={styles.title}>Hello world!</Text>

        <Text style={styles.paragraph}>
          This is a stripped-down version of the current app, with the same
          dependencies and versions, but without all the actual content.
        </Text>

        <Text style={styles.paragraph}>
          This way, it should work well to test whether: (1) installing
          TensorFlow JS is not too hard and maintainable, (2) it can also be
          used for training the model.
        </Text>

        <View style={{flexGrow: 1}} />

        <AppButton
          title={`Press me! ${count}`}
          onPress={() => {
            setCount(n => n + 1);
          }}
        />
      </View>

      <View style={{height: insets.bottom + 24}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: BaseColors.offwhite,
  },
  content: {
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 50,
    fontFamily: 'Rubik-Bold',
    color: BaseColors.deepblue,
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Rubik',
    color: BaseColors.deepblue,
    marginBottom: 12,
  },
});
