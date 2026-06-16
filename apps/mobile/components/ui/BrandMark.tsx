import { Image, Text, View } from 'react-native';

export type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
};

// The Road Ahead mark: a navy disc with a white road receding to a brass
// guiding star (the one place the brass accent earns its keep). Rendered from
// the 1024px app icon — react-native-svg is not available in this app, so the
// raster mark is the source of truth (matches assets/logo/road-ahead-mark.svg).
const ROAD_AHEAD_MARK = require('../../assets/logo/app-icon-1024.png');

const sizeMap = {
  sm: { mark: 40, wordmark: 'text-headline' },
  md: { mark: 56, wordmark: 'text-title-2' },
  lg: { mark: 80, wordmark: 'text-title-1' },
} as const;

export function BrandMark({ size = 'md', showWordmark = true }: BrandMarkProps) {
  const { mark, wordmark } = sizeMap[size];

  return (
    <View className="items-center">
      <Image
        source={ROAD_AHEAD_MARK}
        accessibilityRole="image"
        accessibilityLabel="Veterans 1st"
        resizeMode="contain"
        style={{ width: mark, height: mark }}
        className="rounded-full"
      />
      {showWordmark ? (
        <Text className={`mt-2 font-sans-bold tracking-tight text-primary ${wordmark}`}>
          Veterans 1st
        </Text>
      ) : null}
    </View>
  );
}
