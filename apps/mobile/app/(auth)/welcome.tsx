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
          <Link tone="accent" label="Need help? Call us" onPress={onNeedHelp} />
        </View>
      }>
      <View className="items-center">
        <BrandMark size="lg" />
      </View>

      <View className="mt-12">
        <Text className="text-center text-display text-foreground">
          Rides for those who served.
        </Text>
        <Text className="text-stone-600 mt-4 text-center text-body">
          Safe, dignified rides for veterans, booked by you or a family member.
        </Text>
      </View>

      <View className="mt-12 gap-4">
        <Button label="Get Started" onPress={onGetStarted} />
        <Button label="I already have an account" variant="secondary" onPress={onSignIn} />
      </View>
    </AuthScaffold>
  );
}
