import React from 'react';
import {ActivityIndicator} from 'react-native';
import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';
import {LinkingOptions, NavigationContainer} from '@react-navigation/native';
import {MainScreen} from '../screens/MainScreen';
import {ExampleScreen} from '../screens/Example';

export type RootStackParamList = {
  Main: undefined;
  Example: undefined;
};

export type ScreenName = keyof RootStackParamList;

const RootStack = createStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['nl.klve.tensorjspoc://'],
  config: {
    screens: {},
  },
};

export const RootNavigation = () => {
  const initialRouteName: ScreenName = 'Example';

  return (
    <NavigationContainer
      linking={linking}
      fallback={<ActivityIndicator color="blue" size="large" />}>
      <RootStack.Navigator initialRouteName={initialRouteName}>
        <RootStack.Group
          screenOptions={{
            headerShown: false,
            ...TransitionPresets.SlideFromRightIOS,
          }}>
          <RootStack.Screen
            name="Main"
            component={MainScreen}
            options={{animationEnabled: false}}
          />
          <RootStack.Screen
            name="Example"
            component={ExampleScreen}
            options={{animationEnabled: false}}
          />
        </RootStack.Group>
        <RootStack.Group
          screenOptions={{
            presentation: 'transparentModal',
            animationEnabled: false,
            headerShown: false,
          }}>
          {/* modal screens can be added here */}
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
