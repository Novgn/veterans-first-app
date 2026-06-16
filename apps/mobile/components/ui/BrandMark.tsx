import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  /**
   * Render the reversed mark (white disc / navy road) and white wordmark text,
   * for use on navy surfaces. Defaults to false to preserve existing call sites.
   */
  reversed?: boolean;
};

// Road Ahead palette (see assets/logo/road-ahead-mark.svg). Brass (#9A7B3F)
// earns its keep only on the guiding star — never on text.
const NAVY = '#1F3A5F';
const WHITE = '#FFFFFF';
const BRASS = '#9A7B3F';

// Mark footprint matches the prior PNG logo (40/56/80) so this is a fidelity
// upgrade, not a size regression — the self-contained disc replaces the old
// PNG at the same dimensions.
const sizeMap = {
  sm: { mark: 40, wordmark: 'text-headline' },
  md: { mark: 56, wordmark: 'text-title-2' },
  lg: { mark: 80, wordmark: 'text-title-1' },
} as const;

// Star path is shared between default and reversed marks — brass in both.
const STAR_PATH = 'M32 11 l1.7 3.5 3.9 .4 -2.9 2.6 .8 3.8 -3.5-2 -3.5 2 .8-3.8 -2.9-2.6 3.9-.4 z';
const ROAD_PATH = 'M23 47 L41 47 L36.5 25 L27.5 25 Z';
const MARKINGS_PATH = 'M32 44 L32 40 M32 36.5 L32 32.5 M32 29.5 L32 27';

export function BrandMark({ size = 'md', showWordmark = true, reversed = false }: BrandMarkProps) {
  const { mark, wordmark } = sizeMap[size];

  // Reversed: white disc + navy road/markings. Default: navy disc + white road.
  const discFill = reversed ? WHITE : NAVY;
  const roadFill = reversed ? NAVY : WHITE;
  const markingsStroke = reversed ? WHITE : NAVY;

  return (
    <View className="items-center">
      <Svg
        width={mark}
        height={mark}
        viewBox="0 0 64 64"
        accessibilityRole="image"
        accessibilityLabel="Veterans 1st">
        {/* Disc */}
        <Circle cx={32} cy={32} r={28} fill={discFill} />
        {/* Road receding to the horizon */}
        <Path d={ROAD_PATH} fill={roadFill} />
        {/* Lane markings */}
        <Path d={MARKINGS_PATH} stroke={markingsStroke} strokeWidth={2.4} strokeLinecap="round" />
        {/* Guiding star — the one brass accent */}
        <Path d={STAR_PATH} fill={BRASS} />
      </Svg>
      {showWordmark ? (
        <Text
          className={`mt-2 font-sans-bold tracking-tight ${reversed ? 'text-white' : 'text-primary'} ${wordmark}`}>
          Veterans 1st
        </Text>
      ) : null}
    </View>
  );
}
