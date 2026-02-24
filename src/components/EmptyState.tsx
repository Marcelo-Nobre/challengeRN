import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../app/styles/theme';
import { Icon } from './Icon';

type EmptyStateProps = {
  iconName?: string;
  title?: string;
  message: string;
  submessage?: string;
};

export function EmptyState({
  iconName,
  title,
  message,
  submessage,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {iconName && (
        <Icon
          name={iconName}
          size={56}
          color={theme.colors.textMuted}
          style={styles.icon}
        />
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.message}>{message}</Text>
      {submessage && <Text style={styles.submessage}>{submessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.section,
    alignItems: 'center',
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: theme.spacing.md,
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  submessage: {
    marginTop: theme.spacing.sm,
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
