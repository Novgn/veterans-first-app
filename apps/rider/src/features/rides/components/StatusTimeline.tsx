/**
 * StatusTimeline Component
 *
 * Visual progression component showing ride status:
 * Booked → Confirmed → Assigned → En Route → Arrived
 *
 * Features:
 * - Completed steps shown with filled dots
 * - Current step highlighted with primary color
 * - Future steps shown as gray outline
 * - Connecting lines between steps
 * - Full accessibility support with progressbar role
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { View, Text } from 'react-native';

/**
 * Ride status types from database
 */
export type RideStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in_progress'
  | 'arrived'
  | 'completed'
  | 'cancelled';

interface StatusTimelineProps {
  /** Current ride status */
  currentStatus: RideStatus;
  /** Additional NativeWind classes */
  className?: string;
}

/**
 * Timeline steps mapping DB status to UX-friendly labels
 */
const TIMELINE_STEPS = [
  { status: 'pending', label: 'Booked' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'in_progress', label: 'En Route' },
  { status: 'arrived', label: 'Arrived' },
] as const;

/**
 * Gets the index of the current status in the timeline
 */
function getStepIndex(status: RideStatus): number {
  const index = TIMELINE_STEPS.findIndex((step) => step.status === status);
  return index >= 0 ? index : 0;
}

/**
 * Gets the display label for a status
 */
function getStatusLabel(status: RideStatus): string {
  const step = TIMELINE_STEPS.find((s) => s.status === status);
  return step?.label || 'Unknown';
}

/**
 * StatusTimeline displays the visual progression of a ride's status.
 *
 * Shows 5 steps: Booked → Confirmed → Assigned → En Route → Arrived
 *
 * - Completed steps: Filled primary color dot
 * - Current step: Border with light fill, bold label
 * - Future steps: Gray border, empty
 *
 * Returns null for completed or cancelled rides (no timeline needed).
 *
 * @example
 * ```tsx
 * <StatusTimeline currentStatus="assigned" />
 * // Shows: Booked ● Confirmed ● Assigned ○ En Route ○ Arrived
 * ```
 */
export function StatusTimeline({ currentStatus, className = '' }: StatusTimelineProps) {
  // For cancelled/completed, don't show timeline
  if (currentStatus === 'cancelled' || currentStatus === 'completed') {
    return null;
  }

  const currentIndex = getStepIndex(currentStatus);
  const currentLabel = getStatusLabel(currentStatus);

  return (
    <View
      className={`flex-row items-start justify-between ${className}`}
      accessibilityLabel={`Ride progress: ${currentLabel}`}
      accessibilityRole="progressbar">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <View key={step.status} className="relative flex-1 items-center">
            {/* Connecting line (before dot) - spans from previous dot to current */}
            {index > 0 && (
              <View
                className={`absolute -left-1/2 top-[7px] h-[2px] w-full ${
                  isCompleted ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Status dot */}
            <View
              className={`z-10 h-4 w-4 rounded-full ${
                isCompleted
                  ? 'bg-primary'
                  : isCurrent
                    ? 'border-2 border-primary bg-primary/20'
                    : 'border-2 border-gray-300 bg-white'
              }`}
            />

            {/* Label */}
            <Text
              className={`mt-1 text-center text-xs ${
                isCurrent ? 'font-semibold text-primary' : 'text-gray-500'
              }`}
              numberOfLines={1}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
