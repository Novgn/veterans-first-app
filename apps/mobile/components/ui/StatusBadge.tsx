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

const STATUS_STYLES: Record<StatusBadgeStatus, StatusStyle> = {
  pending: {
    subtleBg: 'bg-accent-100',
    subtleText: 'text-accent-800',
    solidBg: 'bg-accent-600',
    solidText: 'text-white',
    dot: 'bg-accent-600',
    defaultLabel: 'Pending',
  },
  assigned: {
    subtleBg: 'bg-primary-100',
    subtleText: 'text-primary-800',
    solidBg: 'bg-primary-600',
    solidText: 'text-white',
    dot: 'bg-primary-600',
    defaultLabel: 'Driver Assigned',
  },
  confirmed: {
    subtleBg: 'bg-primary-100',
    subtleText: 'text-primary-800',
    solidBg: 'bg-primary-700',
    solidText: 'text-white',
    dot: 'bg-primary-700',
    defaultLabel: 'Confirmed',
  },
  in_progress: {
    subtleBg: 'bg-secondary-100',
    subtleText: 'text-secondary-800',
    solidBg: 'bg-secondary-600',
    solidText: 'text-white',
    dot: 'bg-secondary-600',
    defaultLabel: 'In Progress',
  },
  completed: {
    subtleBg: 'bg-stone-200',
    subtleText: 'text-stone-700',
    solidBg: 'bg-stone-600',
    solidText: 'text-white',
    dot: 'bg-stone-600',
    defaultLabel: 'Completed',
  },
  cancelled: {
    subtleBg: 'bg-stone-200',
    subtleText: 'text-stone-600',
    solidBg: 'bg-stone-500',
    solidText: 'text-white',
    dot: 'bg-stone-500',
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
    container: 'px-2 py-0.5 rounded-md',
    text: 'text-caption',
  },
  md: {
    container: 'px-3 py-1 rounded-full',
    text: 'text-footnote font-semibold',
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
