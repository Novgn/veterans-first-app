// StatusBadge — accessible ride-status pill for the Veterans 1st app.
// Supports the six canonical ride statuses with `subtle` / `solid` visual
// variants and `sm` / `md` sizes. Screen readers read the plain label
// (e.g., "Pending") rather than announcing "Pill: Pending".
//
// Usage:
//   <StatusBadge status="in_progress" variant="solid" withDot />
//   <StatusBadge status="completed" size="sm" label="Done" />

import { View, Text } from 'react-native';

export type StatusBadgeStatus =
  | 'pending'
  | 'assigned'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type StatusBadgeVariant = 'subtle' | 'solid';
export type StatusBadgeSize = 'sm' | 'md';

export interface StatusBadgeProps {
  /** The ride status to render. Drives color, default label, and dot color. */
  status: StatusBadgeStatus;
  /** Visual variant. Subtle uses a tinted background; solid uses a filled pill. Default: 'subtle'. */
  variant?: StatusBadgeVariant;
  /** Size of the pill. Default: 'md'. */
  size?: StatusBadgeSize;
  /** Override the default label text (e.g., "Done" instead of "Completed"). */
  label?: string;
  /** When true, renders a colored dot (in the solid color) to the left of the label. Default: false. */
  withDot?: boolean;
  /** Optional testID forwarded to the root View. */
  testID?: string;
}

interface StatusStyle {
  /** Subtle background className. */
  subtleBg: string;
  /** Subtle text-color className. */
  subtleText: string;
  /** Solid background className. */
  solidBg: string;
  /** Solid text-color className. */
  solidText: string;
  /** Dot background className — always the solid background color. */
  dot: string;
  /** Default human-readable label. */
  defaultLabel: string;
}

// Veteran Honor status semantics (per DESIGN.md StatusTimeline + Status Badge):
// pending → calm warning, assigned/confirmed → navy (active/trust),
// in_progress → sage (supportive), completed → success, cancelled → error.
// Subtle = tinted -100 surface with ink label; solid = filled DEFAULT with white.
// Color is never the sole signal — the label text always carries the meaning.
const STATUS_STYLES: Record<StatusBadgeStatus, StatusStyle> = {
  pending: {
    subtleBg: 'bg-warning-100',
    subtleText: 'text-foreground',
    solidBg: 'bg-warning',
    solidText: 'text-white',
    dot: 'bg-warning',
    defaultLabel: 'Pending',
  },
  assigned: {
    subtleBg: 'bg-primary-100',
    subtleText: 'text-foreground',
    solidBg: 'bg-primary',
    solidText: 'text-white',
    dot: 'bg-primary',
    defaultLabel: 'Driver Assigned',
  },
  confirmed: {
    subtleBg: 'bg-primary-100',
    subtleText: 'text-foreground',
    solidBg: 'bg-primary-700',
    solidText: 'text-white',
    dot: 'bg-primary-700',
    defaultLabel: 'Confirmed',
  },
  in_progress: {
    subtleBg: 'bg-secondary-100',
    subtleText: 'text-foreground',
    solidBg: 'bg-secondary',
    solidText: 'text-white',
    dot: 'bg-secondary',
    defaultLabel: 'In Progress',
  },
  completed: {
    subtleBg: 'bg-success-100',
    subtleText: 'text-foreground',
    solidBg: 'bg-success',
    solidText: 'text-white',
    dot: 'bg-success',
    defaultLabel: 'Completed',
  },
  cancelled: {
    subtleBg: 'bg-error-100',
    subtleText: 'text-foreground',
    solidBg: 'bg-error',
    solidText: 'text-white',
    dot: 'bg-error',
    defaultLabel: 'Cancelled',
  },
};

interface SizeStyle {
  /** Container sizing + rounding classes. */
  container: string;
  /** Text sizing/weight classes (md includes font-semibold per spec). */
  text: string;
}

const SIZE_STYLES: Record<StatusBadgeSize, SizeStyle> = {
  sm: {
    container: 'px-2 py-0.5 rounded-full',
    text: 'text-caption font-sans-medium',
  },
  md: {
    container: 'px-3 py-1 rounded-full',
    text: 'text-caption font-sans-semibold',
  },
};

export function StatusBadge({
  status,
  variant = 'subtle',
  size = 'md',
  label,
  withDot = false,
  testID,
}: StatusBadgeProps) {
  const statusStyle = STATUS_STYLES[status];
  const sizeStyle = SIZE_STYLES[size];
  const displayLabel = label ?? statusStyle.defaultLabel;

  const bgClass = variant === 'solid' ? statusStyle.solidBg : statusStyle.subtleBg;
  const textColorClass = variant === 'solid' ? statusStyle.solidText : statusStyle.subtleText;

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={displayLabel}
      className={`flex-row items-center self-start ${sizeStyle.container} ${bgClass}`}>
      {withDot ? <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} /> : null}
      <Text className={`${sizeStyle.text} ${textColorClass}`}>{displayLabel}</Text>
    </View>
  );
}
