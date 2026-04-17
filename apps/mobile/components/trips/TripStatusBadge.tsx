/**
 * TripStatusBadge — compact pill showing the current ride status (Story 3.4)
 *
 * Used wherever the driver needs to see a status at a glance:
 * trip queue cards, trip detail header, ride-offer modals.
 */

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export type RideStatusKey =
  | 'pending'
  | 'confirmed'
  | 'pending_acceptance'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface StatusStyle {
  label: string;
  icon: IconName;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

const STATUS_STYLES: Record<RideStatusKey, StatusStyle> = {
  pending: {
    label: 'Pending',
    icon: 'time-outline',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    iconColor: '#6B7280',
  },
  confirmed: {
    label: 'Confirmed',
    icon: 'checkmark',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: '#1D4ED8',
  },
  pending_acceptance: {
    label: 'Awaiting Response',
    icon: 'hourglass-outline',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    iconColor: '#D97706',
  },
  assigned: {
    label: 'Assigned',
    icon: 'person-outline',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: '#1D4ED8',
  },
  en_route: {
    label: 'En Route',
    icon: 'navigate',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    iconColor: '#D97706',
  },
  arrived: {
    label: 'Arrived',
    icon: 'location',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    iconColor: '#059669',
  },
  in_progress: {
    label: 'In Progress',
    icon: 'car',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    iconColor: '#7C3AED',
  },
  completed: {
    label: 'Completed',
    icon: 'checkmark-circle',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    iconColor: '#6B7280',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'close-circle',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    iconColor: '#DC2626',
  },
};

const SIZE_STYLES = {
  sm: { container: 'px-2 py-1', text: 'text-xs', icon: 14 },
  md: { container: 'px-3 py-1', text: 'text-sm', icon: 16 },
  lg: { container: 'px-4 py-2', text: 'text-base', icon: 20 },
} as const;

export interface TripStatusBadgeProps {
  status: RideStatusKey;
  size?: keyof typeof SIZE_STYLES;
  testID?: string;
}

export function TripStatusBadge({ status, size = 'md', testID }: TripStatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <View
      className={`flex-row items-center rounded-full ${styles.bgColor} ${sizeStyles.container}`}
      accessibilityLabel={`Status: ${styles.label}`}
      accessibilityRole="text"
      testID={testID}>
      <Ionicons name={styles.icon} size={sizeStyles.icon} color={styles.iconColor} />
      <Text className={`ml-1 font-semibold ${styles.textColor} ${sizeStyles.text}`}>
        {styles.label}
      </Text>
    </View>
  );
}
