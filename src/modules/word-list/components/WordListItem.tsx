import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Icon } from '../../../components';
import { theme } from '../../../app/styles/theme';

type Props = {
  word: string;
  onPress: () => void;
};

export function WordListItem ({ word, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.wordText} numberOfLines={1}>
        {word}
      </Text>
      <Icon
        name="chevron-forward"
        size={22}
        color={theme.colors.textMuted}
        style={styles.chevronIcon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
