import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScaffold, BrandMark, Button, Link } from '@/components/ui';

export default function Welcome() {
  const router = useRouter();

  const onGetStarted = () => router.push('/(auth)/sign-up');
  const onSignIn = () => router.push('/(auth)/sign-in');

  const onNeedHelp = () => router.push('/support');

  return (
    <AuthScaffold
      footer={
        <View className="items-center">
          <Link label="Call us anytime" onPress={onNeedHelp} />
        </View>
      }>
      <View className="items-center">
        <BrandMark size="lg" />
      </View>

      <View className="mt-12">
        <Text className="text-center font-sans-bold text-display text-foreground">Welcome</Text>
        <Text className="mt-4 text-center font-sans text-body text-ink-secondary">
          Safe, dignified rides for veterans — booked by you or a family member. No surge, ever.
        </Text>
      </View>

      <View className="mt-12 gap-4">
        <Button label="Get started" onPress={onGetStarted} />
        <Button label="I already have an account" variant="secondary" onPress={onSignIn} />
      </View>
    </AuthScaffold>
  );
}
