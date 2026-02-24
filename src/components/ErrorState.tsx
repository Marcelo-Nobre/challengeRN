import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../app/styles/theme';
import { Icon } from './Icon';

type ErrorStateProps = {
  message: string;
  iconName?: string;
};

export function ErrorState({
  message,
  iconName = 'sad-outline',
}: ErrorStateProps) {
  return (
    <View style={styles.centered}>
      <View style={styles.card}>
        <Icon
          name={iconName}
          size={48}
          color={theme.colors.error}
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
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
    minWidth: 260,
    ...theme.shadow.md,
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
