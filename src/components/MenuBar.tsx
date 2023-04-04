import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ScreenName} from '../routing/RootNavigation';
import {AppButton} from './AppButton';
import {BaseColors} from './colors';

export function MenuBar() {
  const nav = useNavigation();
  const [page, setPage] = useState('');
  function go(p: ScreenName) {
    setPage(p);
    nav.navigate(p);
  }
  return (
    <View style={{flexDirection: 'row'}}>
      <AppButton
        style={styles.button}
        title="DEMO"
        onPress={() => go('Main')}
      />
      <AppButton
        style={styles.button}
        title="Example"
        onPress={() => go('Example')}
      />
      <Text style={styles.label}>{page}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    color: BaseColors.deepblue,
  },
  button: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    marginHorizontal: 10,
    backgroundColor: BaseColors.lila,
  },
});
