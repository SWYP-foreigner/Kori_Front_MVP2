import Icon from '@/components/common/Icon';
import { theme } from '@/src/styles/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SkipHeaderProps {
  onSkip?: () => void;
}

export default function SkipHeader({ onSkip }: SkipHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      console.warn('기본 동작이 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.left}>
        <Icon type="previous" size={24} color={theme.colors.primary.white} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} style={styles.right}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  skipText: {
    fontSize: 16,
    color: '#949899',
  },
});
