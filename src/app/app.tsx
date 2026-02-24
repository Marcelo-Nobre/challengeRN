import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritesProvider } from './context/FavoritesContext';
import { AppStack } from './routes';
import { theme } from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <FavoritesProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.surface}
        />
        <NavigationContainer
          theme={{
            dark: false,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.background,
              card: theme.colors.surface,
              text: theme.colors.text,
              border: theme.colors.border,
              notification: theme.colors.accent,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}
        >
          <AppStack />
        </NavigationContainer>
        </FavoritesProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
