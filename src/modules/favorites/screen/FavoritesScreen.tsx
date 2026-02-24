import { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/routes/types';
import { BackgroundBubbles, EmptyState, Icon } from '../../../components';
import { theme } from '../../../app/styles/theme';
import { useFavoritesList } from '../store/useFavoritesList';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { favorites } = useFavoritesList();

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => navigation.navigate('WordDetail', { word: item })}
      >
        <Icon
          name="star"
          size={20}
          color={theme.colors.accent}
          style={styles.starIcon}
        />
        <Text style={styles.wordText} numberOfLines={1}>
          {item}
        </Text>
        <Icon
          name="chevron-forward"
          size={22}
          color={theme.colors.textMuted}
          style={styles.chevronIcon}
        />
      </Pressable>
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <BackgroundBubbles>
      <View style={styles.container}>
        <FlashList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              iconName="star-outline"
              title="No favourites yet"
              message="Tap a word in the List tab and add it to favourites from the details screen."
            />
          }
        />
      </View>
    </BackgroundBubbles>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: theme.colors.borderLight,
  },
  starIcon: {
    marginRight: theme.spacing.md,
  },
  wordText: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: theme.spacing.sm,
  },
});
