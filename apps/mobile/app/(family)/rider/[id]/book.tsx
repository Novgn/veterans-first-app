/**
 * Minimal family booking form (Story 4.4).
 *
 * Three fields: pickup address, drop-off address, pickup time (ISO string
 * entered directly). Richer destination autocomplete is reserved for a
 * follow-up (tracked in deferred-findings) — keeping parity with the
 * rider-side wizard is out of scope for this story.
 *
 * Veteran Honor: stone canvas, white TextField inputs (border-strong edge,
 * always-visible labels), navy primary CTA, plain-language error, warm
 * "Booking for {Rider}" voice.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Alert as AlertBanner } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useFamilyBookRide } from '@/hooks/useFamilyBookRide';
import { useFamilyLinks } from '@/hooks/useFamilyLinks';

export default function FamilyBookRideScreen() {
  const { id: riderId } = useLocalSearchParams<{ id: string }>();
  const { data: links = [] } = useFamilyLinks('family');
  const book = useFamilyBookRide();

  const link = links.find((l) => l.rider_id === riderId && l.status === 'approved');
  const canBook = !!link?.permissions?.book_rides;
  const riderName = link?.counterpart?.first_name ?? 'your loved one';

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [scheduledPickupTime, setScheduledPickupTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!riderId) return;
    setError(null);
    try {
      await book.mutateAsync({
        riderId,
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        scheduledPickupTime,
      });
      Alert.alert('Ride booked', 'Your loved one will receive a confirmation.');
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book ride');
    }
  };

  if (!canBook) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Book a Ride' }} />
        <View className="mt-12 items-center px-6">
          <Ionicons name="lock-closed" size={36} color="#6E685E" />
          <Text className="mt-3 text-center font-sans text-body text-ink-secondary">
            You don&apos;t have permission to book rides for this rider. Ask them to enable booking
            on your family link.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Book a Ride' }} />

      <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="mb-1 font-sans-semibold text-title-3 text-foreground">
          Booking for {riderName}
        </Text>
        <Text className="mb-6 font-sans text-body text-ink-secondary">
          They will receive a confirmation once the ride is scheduled.
        </Text>

        <View className="mb-4">
          <TextField
            label="Pickup address"
            value={pickup}
            onChangeText={setPickup}
            placeholder="123 Main St, Austin TX"
            accessibilityLabel="Pickup address"
            testID="family-book-pickup"
          />
        </View>

        <View className="mb-4">
          <TextField
            label="Drop-off address"
            value={dropoff}
            onChangeText={setDropoff}
            placeholder="Austin VA Clinic"
            accessibilityLabel="Drop-off address"
            testID="family-book-dropoff"
          />
        </View>

        <View className="mb-6">
          <TextField
            label="Pickup time"
            value={scheduledPickupTime}
            onChangeText={setScheduledPickupTime}
            placeholder="2026-05-01T10:30:00Z"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Scheduled pickup time in ISO format"
            helperText="Use ISO format (e.g. 2026-05-01T10:30:00Z)."
            testID="family-book-time"
          />
        </View>

        {error ? <AlertBanner variant="error" message={error} className="mb-4" /> : null}

        <Button
          label="Book Ride"
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          loading={book.isPending}
          disabled={book.isPending}
          leftIcon={<Ionicons name="car" size={20} color="#FFFFFF" />}
          accessibilityLabel="Book ride"
          testID="family-book-submit"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
