import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { getInitials } from '@utils/helpers';
import { COLORS } from '@constants/colors';

// ─── Avatar Component ─────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  style?: ViewStyle;
  isHead?: boolean;
}

const SIZES: Record<AvatarSize, number> = {
  xs: 32,
  sm: 44,
  md: 60,
  lg: 80,
  xl: 110,
};

const TEXT_SIZES: Record<AvatarSize, number> = {
  xs: 12,
  sm: 16,
  md: 22,
  lg: 30,
  xl: 40,
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  style,
  isHead = false,
}) => {
  const dimension = SIZES[size];
  const textSize = TEXT_SIZES[size];
  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <View
        style={[
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            overflow: 'hidden',
            borderWidth: isHead ? 2 : 1.5,
            borderColor: isHead ? COLORS.gold[500] : COLORS.cream[300],
          },
          style,
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={isHead ? ['#8B1A1A', '#3D0C11'] : ['#DEC58A', '#A07850']}
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: isHead ? 2 : 1,
          borderColor: isHead ? COLORS.gold[400] : COLORS.cream[300],
        },
        style,
      ]}
    >
      <Text
        style={{
          color: isHead ? COLORS.gold.light : '#FEFDF8',
          fontSize: textSize,
          fontWeight: '700',
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </LinearGradient>
  );
};

export default Avatar;
