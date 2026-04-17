import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import { PhoneButton } from './PhoneButton';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
}

export function Header({ showBackButton = false, onBack, title }: HeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between bg-background px-4 py-3"
      accessibilityRole="header">
      <View className="flex-row items-center">
        {showBackButton && (
          <Pressable
            onPress={onBack}
            className="mr-2 h-12 w-12 items-center justify-center rounded-full"
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous screen">
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </Pressable>
        )}
        <Text
          className="text-xl font-bold text-primary"
          accessibilityRole="header"
          accessibilityLabel={title ? `${title} - Veterans 1st` : 'Veterans 1st - App Header'}>
          {title || 'Veterans 1st'}
        </Text>
      </View>
      <PhoneButton />
    </View>
  );
}
