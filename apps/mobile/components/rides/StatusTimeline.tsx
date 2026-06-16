/**
 * StatusTimeline Component
 *
 * Visual progression component showing ride status:
 * Booked → Confirmed → Assigned → En Route → Arrived
 *
 * Features:
 * - Completed steps shown as success-green nodes with a checkmark glyph
 * - Current (active) step highlighted in navy (primary)
 * - Future (pending) steps shown as a hairline outline
 * - Connecting lines between steps
 * - Color is never the sole signal — node + checkmark/label carry the state
 * - Full accessibility support with progressbar role
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { Ionicons } from '@expo/vector-icons';
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

        // A node is "reached" (line filled to it) once the prior step is done.
        const lineReached = index <= currentIndex;

        return (
          <View key={step.status} className="relative flex-1 items-center">
            {/* Connecting line (before dot) - spans from previous dot to current */}
            {index > 0 && (
              <View
                className={`absolute -left-1/2 top-[9px] h-[2px] w-full ${
                  lineReached ? 'bg-success' : 'bg-border-hairline'
                }`}
              />
            )}

            {/* Status node — completed (success + check), active (navy), pending (hairline) */}
            <View
              className={`z-10 h-5 w-5 items-center justify-center rounded-full ${
                isCompleted
                  ? 'bg-success'
                  : isCurrent
                    ? 'border-2 border-primary bg-primary'
                    : 'border-2 border-border-hairline bg-card'
              }`}>
              {isCompleted ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
            </View>

            {/* Label */}
            <Text
              className={`mt-1 text-center text-caption ${
                isCurrent
                  ? 'font-sans-semibold text-primary'
                  : isCompleted
                    ? 'font-sans-medium text-success'
                    : 'font-sans text-ink-secondary'
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
