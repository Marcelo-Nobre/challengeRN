/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { App } from '../src/app';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  useNavigation: () => ({}),
  useFocusEffect: () => {},
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  }),
}));

jest.mock('../src/app/routes', () => ({
  AppStack: () => null,
  MainTabs: () => null,
}));

jest.mock('../src/app/context/FavoritesContext', () => ({
  FavoritesProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
