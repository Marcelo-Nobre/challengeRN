import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/routes/types';
import { ErrorState, LoadingState, Icon } from '../../../components';
import { theme } from '../../../app/styles/theme';
import { useWordDetail } from '../store/useWordDetail';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetail'>;

export function WordDetailScreen({ route }: Props) {
  const { word } = route.params;
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

  if (loading) {
    return <LoadingState message="Carregando..." />;
  }

  if (error || !entry) {
    return (
      <ErrorState message={error ?? 'Palavra não encontrada.'} />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.word}>{entry.word}</Text>
        {entry.phonetic && (
          <View style={styles.phoneticWrap}>
            <Text style={styles.phonetic}>{entry.phonetic}</Text>
          </View>
        )}
        <View style={styles.actions}>
          {firstAudioUrl && (
            <Pressable
              style={({ pressed }) => [
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
                style={styles.audioBtnIcon}
              />
              <Text style={styles.audioBtnText}>
                {playingAudio ? 'Abrindo...' : 'Ouvir pronúncia'}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
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
              style={styles.favBtnIcon}
            />
            <Text style={[styles.favBtnText, favorited && styles.favBtnTextActive]}>
              {favorited ? 'Favorita' : 'Favoritar'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Significados</Text>

      {entry.meanings?.map((meaning, idx) => (
        <View key={idx} style={styles.section}>
          <View style={styles.partOfSpeechBadge}>
            <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
          </View>
          <View style={styles.definitions}>
            {meaning.definitions?.slice(0, 6).map((def, i, arr) => (
              <View
                key={i}
                style={[styles.definition, i === arr.length - 1 && styles.definitionLast]}
              >
                <Text style={styles.definitionText}>{def.definition}</Text>
                {def.example && (
                  <Text style={styles.example}>«{def.example}»</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.section + theme.spacing.xxl,
  },
  hero: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md,
  },
  word: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  phoneticWrap: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  phonetic: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl,
    flexWrap: 'wrap',
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md + 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  audioBtnDisabled: {
    opacity: 0.7,
  },
  audioBtnIcon: {
    marginRight: theme.spacing.sm,
  },
  audioBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  favBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md + 2,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  favBtnIcon: {
    marginRight: theme.spacing.sm,
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
  sectionTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
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
    marginTop: theme.spacing.lg,
    marginLeft: theme.spacing.lg,
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
    marginBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primaryLight,
  },
  definitionLast: {
    marginBottom: 0,
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
