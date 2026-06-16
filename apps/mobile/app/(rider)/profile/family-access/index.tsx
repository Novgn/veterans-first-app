/**
 * Rider-facing Family Access screen (Story 4.1, 4.2).
 *
 * Lists the rider's linked family members with status + permissions and
 * provides an entry point to invite a new member. Revocation runs
 * through a 60-second undo window (Story 4.2).
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import { ConfirmRevokeModal } from '@/components/family/ConfirmRevokeModal';
import { UndoToast } from '@/components/family/UndoToast';
import { Button } from '@/components/ui';
import { useFamilyLinks, type FamilyLinkView } from '@/hooks/useFamilyLinks';
import { useRevokeWithUndo } from '@/hooks/useRevokeWithUndo';

function displayName(link: FamilyLinkView): string {
  if (link.counterpart) {
    return `${link.counterpart.first_name} ${link.counterpart.last_name}`.trim();
  }
  return link.invited_phone ?? 'Family member';
}

function statusLabel(status: FamilyLinkView['status']): { text: string; tone: string } {
  switch (status) {
    case 'approved':
      return { text: 'Approved', tone: 'bg-success-100 text-foreground' };
    case 'pending':
      return { text: 'Pending', tone: 'bg-warning-100 text-foreground' };
    case 'revoked':
      return { text: 'Revoked', tone: 'bg-background text-ink-secondary' };
  }
}

export default function FamilyAccessScreen() {
  const { data: links = [], isLoading } = useFamilyLinks('rider');
  const { queueRevocation, undo, flush, pending, isPending } = useRevokeWithUndo();
  const [confirming, setConfirming] = useState<FamilyLinkView | null>(null);

  // Flush any pending queue entries when the user navigates away so the
  // server-side delete definitely happens.
  useFocusEffect(
    useCallback(() => {
      return () => {
        Object.values(pending).forEach((entry) => {
          clearTimeout(entry.timer);
          void flush(entry.linkId);
        });
      };
    }, [pending, flush])
  );

  const handleConfirmRevoke = () => {
    if (!confirming) return;
    queueRevocation({ linkId: confirming.id, memberName: displayName(confirming) });
    setConfirming(null);
  };

  const visibleLinks = links.filter((link) => !isPending(link.id));
  const pendingEntries = Object.values(pending);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Family Access' }} />

      <View className="flex-1 px-6 pt-4">
        <Text className="mb-2 font-sans-semibold text-headline text-foreground">
          Your family members
        </Text>
        <Text className="mb-4 font-sans text-footnote text-ink-secondary">
          Family members you&apos;ve invited can view your rides. You stay in control — revoke
          access any time.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1F3A5F" className="mt-8" />
        ) : visibleLinks.length === 0 ? (
          <View className="border-hairline items-center rounded-lg border bg-card p-6 shadow-card">
            <Ionicons name="people-outline" size={40} color="#4F4A41" />
            <Text className="mt-3 text-center font-sans text-body text-ink-secondary">
              You haven&apos;t invited anyone yet. Tap &quot;Add Family Member&quot; to share
              access.
            </Text>
          </View>
        ) : (
          <FlatList
            data={visibleLinks}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => {
              const name = displayName(item);
              const status = statusLabel(item.status);
              return (
                <View
                  className="border-hairline flex-row items-center rounded-lg border bg-card p-4 shadow-card"
                  testID={`family-link-${item.id}`}>
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <Ionicons name="person" size={22} color="#1F3A5F" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-body text-foreground">{name}</Text>
                    {item.relationship ? (
                      <Text className="font-sans text-footnote text-ink-secondary">
                        {item.relationship}
                      </Text>
                    ) : null}
                    <View className={`mt-1 self-start rounded-full px-2 py-0.5 ${status.tone}`}>
                      <Text className="font-sans-medium text-caption">{status.text}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => setConfirming(item)}
                    className="min-h-[44px] min-w-[44px] items-center justify-center"
                    accessibilityLabel={`Remove ${name}`}
                    accessibilityRole="button"
                    testID={`family-link-remove-${item.id}`}>
                    <Ionicons name="trash-outline" size={20} color="#A83A35" />
                  </Pressable>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}

        <Link href="/profile/family-access/add" asChild>
          <Button
            label="Add Family Member"
            leftIcon={<Ionicons name="person-add" size={22} color="#ffffff" />}
            accessibilityLabel="Add family member"
            testID="family-access-add-button"
          />
        </Link>
      </View>

      {pendingEntries.map((entry) => (
        <UndoToast
          key={entry.linkId}
          memberName={entry.memberName}
          expiresAt={entry.expiresAt}
          onUndo={() => undo(entry.linkId)}
        />
      ))}

      <ConfirmRevokeModal
        visible={confirming !== null}
        memberName={confirming ? displayName(confirming) : ''}
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirmRevoke}
      />
    </SafeAreaView>
  );
}
