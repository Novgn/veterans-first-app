/**
 * Family dashboard home (Story 4.1, 4.3).
 *
 * Shows pending invitations at the top with approve/decline buttons,
 * followed by the list of linked riders. Tapping a linked rider
 * navigates to the per-rider ride list (Story 4.3).
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import {
  useFamilyLinks,
  useRespondToFamilyInvite,
  type FamilyLinkView,
} from '@/hooks/useFamilyLinks';

function riderName(link: FamilyLinkView): string {
  if (!link.counterpart) return 'Rider';
  return `${link.counterpart.first_name} ${link.counterpart.last_name}`.trim();
}

export default function FamilyHome() {
  const { data: links = [], isLoading } = useFamilyLinks('family');
  const respond = useRespondToFamilyInvite();

  const pending = links.filter((l) => l.status === 'pending');
  const approved = links.filter((l) => l.status === 'approved');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pb-2 pt-6">
        <Text className="text-3xl font-bold text-foreground">Family Dashboard</Text>
        <Text className="mt-1 text-base text-gray-600">
          Stay close to the rides that matter to you.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E40AF" className="mt-12" />
      ) : (
        <FlatList
          ListHeaderComponent={
            pending.length > 0 ? (
              <View className="mb-4 px-6">
                <Text className="mb-2 text-lg font-semibold text-foreground">
                  Invitations ({pending.length})
                </Text>
                {pending.map((link) => (
                  <View
                    key={link.id}
                    className="mb-3 rounded-xl bg-white p-4 shadow-sm"
                    testID={`family-invite-${link.id}`}>
                    <Text className="text-base font-semibold text-foreground">
                      {riderName(link)}
                    </Text>
                    {link.relationship ? (
                      <Text className="text-sm text-gray-500">{link.relationship}</Text>
                    ) : null}
                    <Text className="mt-1 text-sm text-gray-600">
                      {riderName(link)} has invited you to view their rides.
                    </Text>
                    <View className="mt-3 flex-row gap-3">
                      <Pressable
                        onPress={() => respond.mutate({ linkId: link.id, action: 'decline' })}
                        disabled={respond.isPending}
                        className="min-h-[44px] flex-1 items-center justify-center rounded-lg border border-gray-300"
                        accessibilityLabel={`Decline invitation from ${riderName(link)}`}
                        accessibilityRole="button"
                        testID={`family-invite-decline-${link.id}`}>
                        <Text className="font-semibold text-gray-700">Decline</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => respond.mutate({ linkId: link.id, action: 'approve' })}
                        disabled={respond.isPending}
                        className="min-h-[44px] flex-1 items-center justify-center rounded-lg bg-primary"
                        accessibilityLabel={`Approve invitation from ${riderName(link)}`}
                        accessibilityRole="button"
                        testID={`family-invite-approve-${link.id}`}>
                        <Text className="font-semibold text-white">Approve</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : null
          }
          data={approved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={
            pending.length === 0 ? (
              <View className="mt-8 items-center px-6">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                  <Ionicons name="people" size={36} color="#1E40AF" />
                </View>
                <Text className="text-center text-base text-gray-600">
                  You&apos;re not linked to any riders yet. Ask them to add your phone number from
                  Profile → Family Access.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              className="flex-row items-center rounded-xl bg-white p-4 shadow-sm"
              testID={`family-linked-rider-${item.id}`}>
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="person" size={22} color="#1E40AF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">{riderName(item)}</Text>
                {item.relationship ? (
                  <Text className="text-sm text-gray-500">{item.relationship}</Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
