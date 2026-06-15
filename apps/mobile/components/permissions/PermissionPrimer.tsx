import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { AuthScaffold, Button, Link, ScreenHeader } from '@/components/ui';

export type PermissionPrimerBullet = {
  iconName: keyof typeof Ionicons.glyphMap;
  text: string;
};

export type PermissionPrimerProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  description: string;
  bullets: PermissionPrimerBullet[];
  continueLabel: string;
  onContinue: () => void | Promise<void>;
  skipLabel?: string;
  onSkip?: () => void;
  isLoading?: boolean;
};

const PRIMARY_NAVY = '#1E40AF';

export function PermissionPrimer({
  iconName,
  iconColor = PRIMARY_NAVY,
  title,
  description,
  bullets,
  continueLabel,
  onContinue,
  skipLabel,
  onSkip,
  isLoading = false,
}: PermissionPrimerProps) {
  return (
    <AuthScaffold header={<ScreenHeader showBack={false} />}>
      <View className="items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Ionicons name={iconName} size={48} color={iconColor} />
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-center text-title-1 text-foreground">{title}</Text>
        <Text className="text-stone-600 mt-3 text-center text-body">{description}</Text>
      </View>

      <View className="mt-10 gap-4">
        {bullets.map((bullet) => (
          <View key={bullet.text} className="flex-row items-start gap-3">
            <View className="mt-1">
              <Ionicons name={bullet.iconName} size={20} color={PRIMARY_NAVY} />
            </View>
            <Text className="flex-1 text-base text-foreground">{bullet.text}</Text>
          </View>
        ))}
      </View>

      <View className="mt-10 gap-4">
        <Button label={continueLabel} onPress={onContinue} loading={isLoading} />
        {skipLabel ? (
          <View className="items-center">
            <Link label={skipLabel} onPress={onSkip} />
          </View>
        ) : null}
      </View>
    </AuthScaffold>
  );
}
