/**
 * Family dashboard home (Story 4.1, 4.3).
 *
 * Shows pending invitations at the top with approve/decline buttons,
 * followed by the list of linked riders. Tapping a linked rider
 * navigates to the per-rider ride list (Story 4.3).
 *
 * Veteran Honor: warm-stone canvas, white cards (rounded-lg + shadow-card),
 * navy/sage controls, brass non-text accents, Lexend type, warm read-only
 * voice. Family is read-only — no rider-modify affordances here.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
        <Text className="font-sans-bold text-title-1 text-foreground">Family</Text>
        <Text className="mt-1 font-sans text-body text-ink-secondary">
          Stay close to the rides that matter to you.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#1F3A5F" className="mt-12" />
      ) : (
        <FlatList
          ListHeaderComponent={
            pending.length > 0 ? (
              <View className="mb-4 px-6">
                <Text className="mb-3 font-sans-semibold text-title-3 text-foreground">
                  Invitations ({pending.length})
                </Text>
                {pending.map((link) => (
                  <Card
                    key={link.id}
                    variant="elevated"
                    padding="lg"
                    className="mb-3"
                    testID={`family-invite-${link.id}`}>
                    <Text className="font-sans-semibold text-headline text-foreground">
                      {riderName(link)}
                    </Text>
                    {link.relationship ? (
                      <Text className="mt-0.5 font-sans text-caption text-ink-secondary">
                        {link.relationship}
                      </Text>
                    ) : null}
                    <Text className="mt-1 font-sans text-body text-ink-secondary">
                      {riderName(link)} has invited you to view their rides.
                    </Text>
                    <View className="mt-4 flex-row gap-3">
                      <Button
                        label="Decline"
                        variant="secondary"
                        onPress={() => respond.mutate({ linkId: link.id, action: 'decline' })}
                        disabled={respond.isPending}
                        accessibilityLabel={`Decline invitation from ${riderName(link)}`}
                        className="flex-1"
                        testID={`family-invite-decline-${link.id}`}
                      />
                      <Button
                        label="Approve"
                        variant="primary"
                        onPress={() => respond.mutate({ linkId: link.id, action: 'approve' })}
                        disabled={respond.isPending}
                        accessibilityLabel={`Approve invitation from ${riderName(link)}`}
                        className="flex-1"
                        testID={`family-invite-approve-${link.id}`}
                      />
                    </View>
                  </Card>
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
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-secondary-100">
                  <Ionicons name="people" size={36} color="#4A6B54" />
                </View>
                <Text className="text-center font-sans text-body text-ink-secondary">
                  You&apos;re not linked to any riders yet. Ask them to add your phone number from
                  Profile → Family Access.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Link href={{ pathname: '/rider/[id]', params: { id: item.rider_id } }} asChild>
              <Pressable
                className="border-hairline flex-row items-center rounded-lg border bg-card p-6 shadow-card active:bg-background"
                accessibilityLabel={`View rides for ${riderName(item)}`}
                accessibilityRole="button"
                testID={`family-linked-rider-${item.id}`}>
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-secondary-100">
                  <Ionicons name="person" size={22} color="#4A6B54" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-semibold text-headline text-foreground">
                    {riderName(item)}
                  </Text>
                  {item.relationship ? (
                    <Text className="mt-0.5 font-sans text-caption text-ink-secondary">
                      {item.relationship}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6E685E" />
              </Pressable>
            </Link>
          )}
        />
      )}
    </SafeAreaView>
  );
}
