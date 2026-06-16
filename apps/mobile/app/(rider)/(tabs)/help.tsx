import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, View, Text, Pressable, SafeAreaView, ScrollView } from 'react-native';

import { AppHeader, Card, SectionHeader } from '@/components/ui';
import { SUPPORT_PHONE } from '@/lib/constants';

export default function Help() {
  const handleCallSupport = async () => {
    const phoneUrl = `tel:${SUPPORT_PHONE}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Unable to Call', `Please call ${SUPPORT_PHONE} to reach support.`, [
        { text: 'OK' },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader mode="brand" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-4 pb-8"
        showsVerticalScrollIndicator={false}>
        <Text
          accessibilityRole="header"
          className="mb-6 font-sans-bold text-title-1 text-foreground">
          Help
        </Text>

        {/* Prominent human escalation — celebrated as a feature */}
        <Card variant="elevated" padding="lg" className="mb-6 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-secondary-100">
            <Ionicons name="call" size={32} color="#4A6B54" />
          </View>
          <Text className="font-sans-semibold text-title-3 text-foreground">
            We're here for you
          </Text>
          <Text className="mb-6 mt-1 text-center font-sans text-callout text-ink-secondary">
            A real person can help you book a ride, answer questions, or anything else you need.
            Take your time.
          </Text>

          {/* Sage "Call us anytime" — always-reachable phone button (56dp) */}
          <Pressable
            onPress={handleCallSupport}
            className="min-h-touch-lg w-full flex-row items-center justify-center rounded-md bg-secondary px-6 active:bg-secondary-700"
            accessibilityLabel="Call us anytime"
            accessibilityRole="button"
            accessibilityHint="Opens your phone to call Veterans 1st support">
            <Ionicons name="call" size={24} color="#FFFFFF" />
            <Text className="ml-3 font-sans-semibold text-headline text-white">
              Call us anytime
            </Text>
          </Pressable>
        </Card>

        {/* Operating hours */}
        <SectionHeader title="Operating hours" />
        <Card variant="outlined" padding="lg" className="mb-6">
          <View className="flex-row justify-between">
            <Text className="font-sans text-body text-ink-secondary">Monday – Friday</Text>
            <Text className="font-sans-medium text-body text-foreground">6:00 AM – 8:00 PM</Text>
          </View>
          <View className="mt-3 flex-row justify-between">
            <Text className="font-sans text-body text-ink-secondary">Saturday – Sunday</Text>
            <Text className="font-sans-medium text-body text-foreground">8:00 AM – 6:00 PM</Text>
          </View>
        </Card>

        {/* FAQ placeholder */}
        <Card variant="flat" padding="lg">
          <Text className="text-center font-sans text-callout text-ink-secondary">
            FAQ and additional help resources coming soon.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
