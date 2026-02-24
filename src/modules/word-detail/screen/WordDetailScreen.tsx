import { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/routes/types';
import { BackgroundBubbles, ErrorState, LoadingState, Icon } from '../../../components';
import { theme } from '../../../app/styles/theme';
import type { Meaning } from '../../../api/types';
import { useWordDetail } from '../store/useWordDetail';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetail'>;

type MeaningListItem =
  | { type: 'section'; id: string; title: string }
  | { type: 'meaning'; id: string; meaning: Meaning };

function isAcronymMeaning(meaning: Meaning): boolean {
  const pattern = /^(initialism of|abbreviation of|short for|acronym for|abbrev\. of)/i;
  const defs = meaning.definitions ?? [];
  if (defs.length === 0) return false;
  const matchCount = defs.filter((d) => pattern.test((d.definition ?? '').trim())).length;
  return matchCount > defs.length / 2;
}

function buildMeaningsList(meanings: Meaning[]): MeaningListItem[] {
  const acronymMeanings = meanings.filter(isAcronymMeaning);
  const wordMeanings = meanings.filter((m) => !isAcronymMeaning(m));
  const items: MeaningListItem[] = [];
  if (acronymMeanings.length > 0) {
    items.push({ type: 'section', id: 'section-acronym', title: 'As acronym / initialism' });
    acronymMeanings.forEach((m, i) => items.push({ type: 'meaning', id: `acronym-${i}`, meaning: m }));
  }
  if (wordMeanings.length > 0) {
    items.push({ type: 'section', id: 'section-word', title: 'As word' });
    wordMeanings.forEach((m, i) => items.push({ type: 'meaning', id: `word-${i}`, meaning: m }));
  }
  if (items.length === 0) {
    items.push({ type: 'section', id: 'section-meanings', title: 'Meanings' });
    meanings.forEach((m, i) => items.push({ type: 'meaning', id: `meaning-${i}`, meaning: m }));
  }
  return items;
}

export function WordDetailScreen({ route, navigation }: Props) {
  const { word } = route.params;
  const insets = useSafeAreaInsets();
  const {
    loading,
    error,
    entry,
    firstAudioUrl,
    playingAudio,
    favorited,
    playAudio,
    toggleFavorite,
  } = useWordDetail(word);

  const headerPaddingTop = Platform.OS === 'ios' ? insets.top : insets.top + 8;

  const meaningsListData = useMemo(
    () => buildMeaningsList(entry?.meanings ?? []),
    [entry?.meanings]
  );

  const renderListItem = useCallback(
    ({ item }: { item: MeaningListItem }) => {
      if (item.type === 'section') {
        return (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleLine} />
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
        );
      }
      const meaning = item.meaning;
      const defs = meaning.definitions?.slice(0, 6) ?? [];
      return (
        <View style={styles.section}>
          <View style={styles.partOfSpeechBadge}>
            <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
          </View>
          <View style={styles.definitions}>
            {defs.map((def, i, arr) => (
              <View
                key={i}
                style={[styles.definition, i === arr.length - 1 && styles.definitionLast]}
              >
                <Text style={styles.definitionIndex}>{i + 1}</Text>
                <View style={styles.definitionContent}>
                  <Text style={styles.definitionText}>{def.definition}</Text>
                  {def.example ? (
                    <Text style={styles.example}>«{def.example}»</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    },
    []
  );

  if (loading) {
    return (
      <BackgroundBubbles>
        <LoadingState message="Loading..." />
      </BackgroundBubbles>
    );
  }

  if (error || !entry) {
    return (
      <BackgroundBubbles>
        <View style={styles.wrapper}>
          <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="arrow-back" size={24} color={theme.colors.primary} />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Details
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          <ErrorState message={error ?? 'Word not found.'} />
        </View>
      </BackgroundBubbles>
    );
  }

  const listHeader = (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <Text style={styles.wordLabel}>Word:</Text>
        <Text style={styles.word} numberOfLines={1}>
          {entry.word}
        </Text>
        {entry.phonetic ? (
          <View style={styles.phoneticWrap}>
            <Text style={styles.phonetic}>{entry.phonetic}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        {firstAudioUrl ? (
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              styles.audioBtn,
              playingAudio && styles.audioBtnDisabled,
              pressed && !playingAudio && styles.btnPressed,
            ]}
            onPress={() => playAudio(firstAudioUrl)}
            disabled={playingAudio}
          >
            <Icon
              name={playingAudio ? 'hourglass-outline' : 'play'}
              size={20}
              color="#fff"
              style={styles.actionBtnIcon}
            />
            <Text style={styles.audioBtnText} numberOfLines={1}>
              {playingAudio ? 'Opening...' : 'Play'}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            styles.favBtn,
            favorited && styles.favBtnActive,
            pressed && styles.btnPressed,
          ]}
          onPress={() => toggleFavorite(word)}
        >
          <Icon
            name={favorited ? 'star' : 'star-outline'}
            size={20}
            color={favorited ? theme.colors.accent : theme.colors.text}
            style={styles.actionBtnIcon}
          />
          <Text style={[styles.favBtnText, favorited && styles.favBtnTextActive]} numberOfLines={1}>
            {favorited ? 'Favourite' : 'Add to favourites'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <BackgroundBubbles>
      <View style={styles.wrapper}>
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Details
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlashList
          data={meaningsListData}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          getItemType={(item) => item.type}
          ListHeaderComponent={listHeader}
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: theme.spacing.section + insets.bottom + theme.spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BackgroundBubbles>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 56,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...theme.typography.title,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  headerSpacer: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  hero: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  wordLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  word: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  phoneticWrap: {
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  phonetic: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md + 4,
    borderRadius: theme.radius.md,
  },
  audioBtn: {
    backgroundColor: theme.colors.primary,
  },
  audioBtnDisabled: {
    opacity: 0.7,
  },
  actionBtnIcon: {
    marginRight: theme.spacing.sm,
  },
  audioBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  favBtn: {
    backgroundColor: theme.colors.borderLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  favBtnActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  favBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  favBtnTextActive: {
    color: theme.colors.text,
  },
  btnPressed: {
    opacity: 0.85,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitleLine: {
    width: 4,
    height: 22,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  partOfSpeechBadge: {
    alignSelf: 'flex-start',
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  partOfSpeech: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  definitions: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  definition: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  definitionLast: {
    marginBottom: 0,
  },
  definitionIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  definitionContent: {
    flex: 1,
  },
  definitionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  example: {
    marginTop: theme.spacing.sm,
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    paddingLeft: theme.spacing.xs,
  },
});
