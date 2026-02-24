import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../app/styles/theme';

type BackgroundBubblesProps = {
  children: ReactNode;
};

type BubbleStyle = {
  left: number;
  top: number;
};

export function BackgroundBubbles({ children }: BackgroundBubblesProps) {
  const dimensions = useWindowDimensions();
  const [bubbleStyles, setBubbleStyles] = useState<BubbleStyle[]>([]);

  const minBubbles = 4;
  const maxBubbles = 14;

  const createBubbleStyle = useCallback(
    (): BubbleStyle => ({
      left: Math.random() * dimensions.width - 40,
      top: Math.random() * dimensions.height - 40,
    }),
    [dimensions.width, dimensions.height]
  );

  useEffect(() => {
    const numberOfBubbles =
      Math.floor(Math.random() * (maxBubbles - minBubbles + 1)) + minBubbles;

    const newBubbleStyles = Array.from({ length: numberOfBubbles }, () =>
      createBubbleStyle()
    );
    setBubbleStyles(newBubbleStyles);
  }, [createBubbleStyle]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.bubblesLayer]}>
        {bubbleStyles.map((style, index) => (
          <View
            key={index}
            style={[
              styles.bubble,
              { left: style.left, top: style.top },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  bubblesLayer: {
    zIndex: 0,
  },
  bubble: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    opacity: 0.12,
  },
  content: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});
