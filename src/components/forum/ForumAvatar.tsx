import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FONT_WEIGHTS } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

interface ForumAvatarProps {
  name?: string;
  uri?: string;
  size?: number;
}

export function ForumAvatar({ name = 'Người dùng', uri, size = 42 }: ForumAvatarProps) {
  const colors = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [uri]);

  const initials = useMemo(
    () =>
      name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ND',
    [name],
  );

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryDim,
          borderColor: colors.primary,
        },
      ]}
    >
      {uri && !imageFailed ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Text style={{ color: colors.primary, fontSize: size * 0.34, fontWeight: FONT_WEIGHTS.bold }}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
});
