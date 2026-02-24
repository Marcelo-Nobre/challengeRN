import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import { WordListItem } from '../components/WordListItem';

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
      <WordListItem
        word={item}
        onPress={() => navigation.navigate('WordDetail', { word: item })}
      />
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
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
});
