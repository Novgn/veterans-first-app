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

// Veteran Honor status pills: stone neutral for resting states, navy for the
// active in-flight node, sage for supportive/assigned, success for arrived/done,
// error for cancelled. Each pill always carries icon + label — color alone is
// never the signal. Tints use the *-100 surface families with on-surface ink
// (≥7:1) so the caption text stays AAA-legible.
const STATUS_STYLES: Record<RideStatusKey, StatusStyle> = {
  pending: {
    label: 'Pending',
    icon: 'time-outline',
    bgColor: 'bg-background',
    textColor: 'text-ink-secondary',
    iconColor: '#6E685E', // border-strong
  },
  confirmed: {
    label: 'Confirmed',
    icon: 'checkmark',
    bgColor: 'bg-secondary-100',
    textColor: 'text-foreground',
    iconColor: '#4A6B54', // sage
  },
  pending_acceptance: {
    label: 'Awaiting Response',
    icon: 'hourglass-outline',
    bgColor: 'bg-warning-100',
    textColor: 'text-foreground',
    iconColor: '#8A6420', // warning
  },
  assigned: {
    label: 'Assigned',
    icon: 'person-outline',
    bgColor: 'bg-secondary-100',
    textColor: 'text-foreground',
    iconColor: '#4A6B54', // sage
  },
  en_route: {
    label: 'En Route',
    icon: 'navigate',
    bgColor: 'bg-primary-100',
    textColor: 'text-foreground',
    iconColor: '#1F3A5F', // navy — active node
  },
  arrived: {
    label: 'Arrived',
    icon: 'location',
    bgColor: 'bg-success-100',
    textColor: 'text-foreground',
    iconColor: '#356046', // success
  },
  in_progress: {
    label: 'In Progress',
    icon: 'car',
    bgColor: 'bg-primary-100',
    textColor: 'text-foreground',
    iconColor: '#1F3A5F', // navy — active node
  },
  completed: {
    label: 'Completed',
    icon: 'checkmark-circle',
    bgColor: 'bg-success-100',
    textColor: 'text-foreground',
    iconColor: '#356046', // success
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'close-circle',
    bgColor: 'bg-error-100',
    textColor: 'text-foreground',
    iconColor: '#A83A35', // error
  },
};

const SIZE_STYLES = {
  sm: { container: 'px-2 py-1', text: 'text-caption', icon: 14 },
  md: { container: 'px-3 py-1', text: 'text-caption', icon: 16 },
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
      <Text className={`ml-1 font-sans-semibold ${styles.textColor} ${sizeStyles.text}`}>
        {styles.label}
      </Text>
    </View>
  );
}
