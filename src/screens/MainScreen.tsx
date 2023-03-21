import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BaseColors } from '../components/colors';
import { RoomOracle } from '../components/RoomOracle';


export function MainScreen() {
  const insets = useSafeAreaInsets();

  const [count, setCount] = useState(0);

  return (
       <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={{ height: insets.top + 24 }} />

          <View style={{ marginHorizontal: 24, flexGrow: 1 }}>
            <RoomOracle />
          </View>

        <View style={{ height: insets.bottom + 24 }} />
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
