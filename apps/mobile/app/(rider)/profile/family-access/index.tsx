/**
 * Rider-facing Family Access screen (Story 4.1, 4.2).
 *
 * Lists the rider's linked family members with status + permissions and
 * provides an entry point to invite a new member.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import { ConfirmRevokeModal } from '@/components/family/ConfirmRevokeModal';
import { useFamilyLinks, useRevokeFamilyLink, type FamilyLinkView } from '@/hooks/useFamilyLinks';

function displayName(link: FamilyLinkView): string {
  if (link.counterpart) {
    return `${link.counterpart.first_name} ${link.counterpart.last_name}`.trim();
  }
  return link.invited_phone ?? 'Family member';
}

function statusLabel(status: FamilyLinkView['status']): { text: string; tone: string } {
  switch (status) {
    case 'approved':
      return { text: 'Approved', tone: 'bg-green-100 text-green-800' };
    case 'pending':
      return { text: 'Pending', tone: 'bg-yellow-100 text-yellow-800' };
    case 'revoked':
      return { text: 'Revoked', tone: 'bg-gray-100 text-gray-600' };
  }
}

export default function FamilyAccessScreen() {
  const { data: links = [], isLoading } = useFamilyLinks('rider');
  const revoke = useRevokeFamilyLink();
  const [confirming, setConfirming] = useState<FamilyLinkView | null>(null);

  const handleRevoke = async () => {
    if (!confirming) return;
    await revoke.mutateAsync({ linkId: confirming.id });
    setConfirming(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Family Access' }} />

      <View className="flex-1 px-6 pt-4">
        <Text className="mb-2 text-lg font-semibold text-foreground">Your family members</Text>
        <Text className="mb-4 text-sm text-gray-600">
          Family members you&apos;ve invited can view your rides. You stay in control — revoke
          access any time.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1E40AF" className="mt-8" />
        ) : links.length === 0 ? (
          <View className="items-center rounded-xl bg-white p-6 shadow-sm">
            <Ionicons name="people-outline" size={40} color="#6B7280" />
            <Text className="mt-3 text-center text-base text-gray-600">
              You haven&apos;t invited anyone yet. Tap &quot;Add Family Member&quot; to share
              access.
            </Text>
          </View>
        ) : (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => {
              const name = displayName(item);
              const status = statusLabel(item.status);
              return (
                <View
                  className="flex-row items-center rounded-xl bg-white p-4 shadow-sm"
                  testID={`family-link-${item.id}`}>
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Ionicons name="person" size={22} color="#1E40AF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{name}</Text>
                    {item.relationship ? (
                      <Text className="text-sm text-gray-500">{item.relationship}</Text>
                    ) : null}
                    <View className={`mt-1 self-start rounded-full px-2 py-0.5 ${status.tone}`}>
                      <Text className="text-xs font-medium">{status.text}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => setConfirming(item)}
                    className="min-h-[44px] min-w-[44px] items-center justify-center"
                    accessibilityLabel={`Remove ${name}`}
                    accessibilityRole="button"
                    testID={`family-link-remove-${item.id}`}>
                    <Ionicons name="trash-outline" size={20} color="#DC2626" />
                  </Pressable>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}

        <Link href="/profile/family-access/add" asChild>
          <Pressable
            className="min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary"
            accessibilityLabel="Add family member"
            accessibilityRole="button"
            testID="family-access-add-button">
            <Ionicons name="person-add" size={22} color="#ffffff" />
            <Text className="ml-2 text-lg font-semibold text-white">Add Family Member</Text>
          </Pressable>
        </Link>
      </View>

      <ConfirmRevokeModal
        visible={confirming !== null}
        memberName={confirming ? displayName(confirming) : ''}
        onCancel={() => setConfirming(null)}
        onConfirm={handleRevoke}
        isLoading={revoke.isPending}
      />
    </SafeAreaView>
  );
}
