// Alert — inline banner for info/warning/error/success messaging.
// Renders an icon, optional title, message, optional CTA link, and an
// optional dismiss affordance. Announces itself to screen readers as an
// alert with the combined title + message.
//
// Usage:
//   <Alert variant="error" title="Ride cancelled" message="Your driver could not reach you." />
//   <Alert message="Location updated" variant="success" onDismiss={() => setShown(false)} />

import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertAction {
  /** Visible button label (e.g., "Retry"). */
  label: string;
  /** Press handler for the CTA. */
  onPress: () => void;
}

export interface AlertProps {
  /** Severity variant. Default: 'info'. */
  variant?: AlertVariant;
  /** Optional bold title rendered above the message. */
  title?: string;
  /** Required message body. */
  message: string;
  /** Override the default Ionicons leading icon (e.g., a custom illustration). */
  icon?: ReactNode;
  /** If provided, renders a trailing dismiss (X) button that calls this on press. */
  onDismiss?: () => void;
  /** If provided, renders a small text-button CTA under the message. */
  action?: AlertAction;
  /** Optional testID forwarded to the root View. */
  testID?: string;
  /** Additional classes appended to the root container. */
  className?: string;
}

interface VariantStyle {
  /** Container background + border classes. */
  container: string;
  /** Ionicons glyph name for this variant. */
  iconName: keyof typeof Ionicons.glyphMap;
  /** Icon tint (hex). */
  iconColor: string;
}

const VARIANT_STYLES: Record<AlertVariant, VariantStyle> = {
  info: {
    container: 'bg-primary-50 border border-primary-200',
    iconName: 'information-circle',
    iconColor: '#1D4ED8', // primary-700
  },
  warning: {
    container: 'bg-accent-50 border border-accent-200',
    iconName: 'alert-circle',
    iconColor: '#B45309', // accent-700
  },
  error: {
    container: 'bg-red-50 border border-red-200',
    iconName: 'close-circle',
    iconColor: '#DC2626', // error
  },
  success: {
    container: 'bg-secondary-50 border border-secondary-200',
    iconName: 'checkmark-circle',
    iconColor: '#047857', // secondary-700
  },
};

export function Alert({
  variant = 'info',
  title,
  message,
  icon,
  onDismiss,
  action,
  testID,
  className,
}: AlertProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const accessibilityLabel = title ? `${title}. ${message}` : message;
  const extraClass = className ? ` ${className}` : '';

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row items-start gap-3 rounded-xl p-4 ${variantStyle.container}${extraClass}`}>
      {/* Leading icon */}
      <View className="shrink-0">
        {icon ?? <Ionicons name={variantStyle.iconName} size={24} color={variantStyle.iconColor} />}
      </View>

      {/* Body: title + message + optional action */}
      <View className="flex-1">
        {title ? <Text className="text-headline text-foreground">{title}</Text> : null}
        <Text className={`text-footnote text-stone-700${title ? ' mt-0.5' : ''}`}>{message}</Text>
        {action ? (
          <Pressable
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="mt-2 self-start">
            <Text className="text-footnote font-semibold text-primary-700">{action.label}</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Trailing dismiss button */}
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={8}
          className="shrink-0">
          <Ionicons name="close" size={20} color="#57534E" />
        </Pressable>
      ) : null}
    </View>
  );
}
