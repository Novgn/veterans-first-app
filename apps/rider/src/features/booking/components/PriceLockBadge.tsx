/**
 * PriceLockBadge Component
 *
 * Trust-building badge that displays the locked price.
 * Core element of Veterans 1st's "No Surge Pricing" value proposition.
 *
 * Features:
 * - Shield icon for visual trust indicator
 * - "$XX locked" prominent text
 * - "No surge. Ever." tagline
 * - Accent gold color (#D97706) for badge styling
 * - Full accessibility support
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

interface PriceLockBadgeProps {
  /** Price in cents (e.g., 4500 = $45) */
  priceCents: number;
  /** Additional NativeWind classes */
  className?: string;
}

/**
 * Formats price from cents to display string.
 * Shows whole dollars for even amounts, includes cents otherwise.
 * @param cents - Price in cents
 * @returns Formatted price string (e.g., "$45" or "$45.50")
 */
function formatPrice(cents: number): string {
  const dollars = cents / 100;
  // Show cents only if there's a fractional amount
  if (cents % 100 === 0) {
    return `$${dollars.toFixed(0)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

export function PriceLockBadge({ priceCents, className = '' }: PriceLockBadgeProps) {
  const priceFormatted = formatPrice(priceCents);

  return (
    <View
      className={`flex-row items-center rounded-xl bg-amber-50 px-4 py-3 ${className}`}
      accessibilityLabel={`Price locked at ${priceFormatted}. No surge pricing, ever`}
      accessibilityRole="text">
      <Ionicons name="shield-checkmark" size={28} color="#D97706" />
      <View className="ml-3 flex-1">
        <View className="flex-row items-baseline">
          <Text className="text-2xl font-bold text-foreground">{priceFormatted}</Text>
          <Text className="ml-2 text-lg font-semibold text-amber-600">locked</Text>
        </View>
        <Text className="text-base text-gray-600">No surge. Ever.</Text>
      </View>
    </View>
  );
}
