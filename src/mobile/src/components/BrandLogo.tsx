import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

export function BrandLogo({
  compact = false,
  size = 58,
}: {
  compact?: boolean;
  size?: number;
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { width: size, height: size }]}>
        <MaterialCommunityIcons
          name="car-outline"
          size={size * 0.68}
          color={colors.primary}
        />
      </View>
      {!compact ? (
        <Text style={styles.wordmark}>VAGA LIVRE</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
