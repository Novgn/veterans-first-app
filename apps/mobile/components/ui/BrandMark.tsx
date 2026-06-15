import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
};

const sizeMap = {
  sm: { icon: 24, wordmark: 'text-base' },
  md: { icon: 32, wordmark: 'text-lg' },
  lg: { icon: 48, wordmark: 'text-2xl' },
} as const;

export function BrandMark({ size = 'md', showWordmark = true }: BrandMarkProps) {
  const { icon, wordmark } = sizeMap[size];

  return (
    <View className="items-center">
      <View className="items-center justify-center rounded-full bg-primary/10 p-3">
        <Ionicons name="shield-checkmark" size={icon} color="#1E40AF" />
      </View>
      {showWordmark ? (
        <Text className={`mt-2 font-bold tracking-tight text-primary ${wordmark}`}>
          Veterans First
        </Text>
      ) : null}
    </View>
  );
}
