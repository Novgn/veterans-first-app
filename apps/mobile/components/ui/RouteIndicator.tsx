/**
 * RouteIndicator — vertical pickup-to-destination route visualization.
 * Renders a primary pickup dot and a secondary destination dot connected
 * by a vertical line, alongside a two-row address block. Used on ride
 * cards, detail cards, and booking summaries.
 *
 * @example
 * <RouteIndicator
 *   pickup={{ label: 'Home', address: '123 Main St' }}
 *   destination={{ label: 'VA Clinic', address: '456 Oak Ave' }}
 * />
 */

import { View, Text } from 'react-native';

export type RouteStop = {
  label: string;
  address?: string;
};

export type RouteIndicatorSize = 'sm' | 'md';

export type RouteIndicatorProps = {
  pickup: RouteStop;
  destination: RouteStop;
  size?: RouteIndicatorSize;
  testID?: string;
  className?: string;
};

type SizeTokens = {
  pickupDot: string;
  destinationDot: string;
  rowGap: string;
  labelClass: string;
};

const tokensBySize: Record<RouteIndicatorSize, SizeTokens> = {
  sm: {
    pickupDot: 'h-2 w-2',
    destinationDot: 'h-2.5 w-2.5',
    rowGap: 'mt-[10px]',
    labelClass: 'text-callout text-foreground font-semibold',
  },
  md: {
    pickupDot: 'h-2.5 w-2.5',
    destinationDot: 'h-3 w-3',
    rowGap: 'mt-[14px]',
    labelClass: 'text-headline text-foreground',
  },
};

const buildAccessibilityLabel = (pickup: RouteStop, destination: RouteStop): string => {
  const from = pickup.address ? `${pickup.label}, ${pickup.address}` : pickup.label;
  const to = destination.address
    ? `${destination.label}, ${destination.address}`
    : destination.label;
  return `From ${from}. To ${to}.`;
};

export function RouteIndicator({
  pickup,
  destination,
  size = 'md',
  testID,
  className,
}: RouteIndicatorProps) {
  const tokens = tokensBySize[size];
  const rootClass = `flex-row items-start gap-3${className ? ` ${className}` : ''}`;

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={buildAccessibilityLabel(pickup, destination)}
      className={rootClass}>
      {/* Left column: fixed 16px visual track */}
      <View
        className="w-4 items-center"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {/* Pickup dot */}
        <View className={`${tokens.pickupDot} rounded-full bg-primary`} />
        {/* Connecting line — flex-1 stretches to fill between rows */}
        <View className="bg-stone-300 my-1 w-[2px] flex-1" />
        {/* Destination dot */}
        <View className={`${tokens.destinationDot} rounded-full bg-secondary`} />
      </View>

      {/* Right column: address block */}
      <View
        className="flex-1"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <View>
          <Text className={tokens.labelClass} numberOfLines={1}>
            {pickup.label}
          </Text>
          {pickup.address ? (
            <Text className="text-stone-500 text-footnote" numberOfLines={1}>
              {pickup.address}
            </Text>
          ) : null}
        </View>
        <View className={tokens.rowGap}>
          <Text className={tokens.labelClass} numberOfLines={1}>
            {destination.label}
          </Text>
          {destination.address ? (
            <Text className="text-stone-500 text-footnote" numberOfLines={1}>
              {destination.address}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
