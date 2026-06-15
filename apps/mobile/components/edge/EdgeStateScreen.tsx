import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { AuthScaffold, BrandMark, Button, Link } from '@/components/ui';

export type EdgeStateIconTone = 'primary' | 'warning' | 'error';

export type EdgeStateScreenProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  iconTone?: EdgeStateIconTone;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    onPress: () => void | Promise<void>;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
    tone?: 'primary' | 'accent';
  };
};

const toneContainerClass: Record<EdgeStateIconTone, string> = {
  primary: 'bg-primary/10',
  warning: 'bg-warning/10',
  error: 'bg-error/10',
};

const toneIconColor: Record<EdgeStateIconTone, string> = {
  primary: '#1E40AF',
  warning: '#F59E0B',
  error: '#DC2626',
};

export function EdgeStateScreen({
  iconName,
  iconTone = 'primary',
  title,
  description,
  primaryAction,
  secondaryAction,
}: EdgeStateScreenProps) {
  return (
    <AuthScaffold>
      <View className="items-center">
        <BrandMark size="sm" />
      </View>

      <View className="mt-10 items-center">
        <View
          className={`h-24 w-24 items-center justify-center rounded-full ${toneContainerClass[iconTone]}`}>
          <Ionicons name={iconName} size={56} color={toneIconColor[iconTone]} />
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-center text-title-1 text-foreground">{title}</Text>
        <Text
          className="text-stone-600 mt-3 self-center text-center text-body"
          style={{ maxWidth: 320 }}>
          {description}
        </Text>
      </View>

      <View className="mt-10 gap-5">
        <Button
          label={primaryAction.label}
          onPress={primaryAction.onPress}
          loading={primaryAction.loading}
        />
        {secondaryAction ? (
          <View className="items-center">
            <Link
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              tone={secondaryAction.tone ?? 'primary'}
            />
          </View>
        ) : null}
      </View>
    </AuthScaffold>
  );
}
