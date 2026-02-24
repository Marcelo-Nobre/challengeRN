import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../app/styles/theme';

type LoadingStateProps = {
  message?: string;
  submessage?: string;
  inCard?: boolean;
};

export function LoadingState({
  message = 'Loading...',
  submessage,
  inCard = true,
}: LoadingStateProps) {
  const content = (
    <>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.message}>{message}</Text>
      {submessage && <Text style={styles.submessage}>{submessage}</Text>}
    </>
  );

  return (
    <View style={styles.centered}>
      {inCard ? (
        <View style={styles.card}>{content}</View>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.section,
    alignItems: 'center',
    minWidth: 280,
    ...theme.shadow.md,
  },
  message: {
    marginTop: theme.spacing.lg,
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  submessage: {
    marginTop: theme.spacing.xs,
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
