import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabsParamList } from './types';
import { WordListScreen } from '../../modules/word-list/screen/WordListScreen';
import { FavoritesScreen } from '../../modules/favorites/screen/FavoritesScreen';
import { Icon } from '../../components';
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator<MainTabsParamList>();

function TabIconList({ focused, color, size }: { focused: boolean; color: string; size: number }) {
  return (
    <Icon
      name={focused ? 'book' : 'book-outline'}
      size={size ?? 22}
      color={color}
    />
  );
}

function TabIconFavorites({ focused, color, size }: { focused: boolean; color: string; size: number }) {
  return (
    <Icon
      name={focused ? 'star' : 'star-outline'}
      size={size ?? 22}
      color={color}
    />
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: theme.colors.text,
        },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="WordList"
        component={WordListScreen}
        options={{
          title: 'Lista',
          tabBarLabel: 'Lista',
          tabBarIcon: TabIconList,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
          tabBarIcon: TabIconFavorites,
        }}
      />
    </Tab.Navigator>
  );
}
