import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/routes/types';
import { BackgroundBubbles, EmptyState, LoadingState, Icon } from '../../../components';
import { theme } from '../../../app/styles/theme';
import { useWordList } from '../store/useWordList';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function WordListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    words,
    searchTerm,
    setSearchTerm,
    loading,
    seeding,
    loadMore,
    totalWhenSearch,
  } = useWordList();

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => navigation.navigate('WordDetail', { word: item })}
      >
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

  if (seeding) {
    return (
      <BackgroundBubbles>
        <LoadingState
          message="Preparing word list…"
          submessage="This only happens the first time"
        />
      </BackgroundBubbles>
    );
  }

  return (
    <BackgroundBubbles>
      <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Icon
          name="search"
          size={22}
          color={theme.colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a word in English..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {searchTerm.trim() !== '' && totalWhenSearch !== null && (
        <View style={styles.countWrap}>
          <Text style={styles.countHint}>
            {totalWhenSearch} resultado{totalWhenSearch !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <FlashList
        data={words}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              iconName="book-outline"
              message={
                searchTerm.trim() === ''
                  ? 'No words in the list'
                  : 'No results for this search'
              }
              submessage={
                searchTerm.trim() === ''
                  ? 'The list will load shortly.'
                  : 'Try another term.'
              }
            />
          ) : null
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
    ...theme.shadow.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 0,
  },
  countWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  countHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  wordText: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
});
