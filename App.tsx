import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {RootNavigation} from './src/routing/RootNavigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <RootNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
