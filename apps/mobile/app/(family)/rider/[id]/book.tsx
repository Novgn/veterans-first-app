/**
 * Minimal family booking form (Story 4.4).
 *
 * Three fields: pickup address, drop-off address, pickup time (ISO string
 * entered directly). Richer destination autocomplete is reserved for a
 * follow-up (tracked in deferred-findings) — keeping parity with the
 * rider-side wizard is out of scope for this story.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFamilyBookRide } from '@/hooks/useFamilyBookRide';
import { useFamilyLinks } from '@/hooks/useFamilyLinks';

export default function FamilyBookRideScreen() {
  const { id: riderId } = useLocalSearchParams<{ id: string }>();
  const { data: links = [] } = useFamilyLinks('family');
  const book = useFamilyBookRide();

  const link = links.find((l) => l.rider_id === riderId && l.status === 'approved');
  const canBook = !!link?.permissions?.book_rides;

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
          <Ionicons name="lock-closed" size={36} color="#6B7280" />
          <Text className="mt-3 text-center text-base text-gray-600">
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
        <Text className="mb-4 text-sm text-gray-600">
          Booking for {link?.counterpart?.first_name ?? 'your loved one'}. They will receive a
          confirmation once the ride is scheduled.
        </Text>

        <Text className="mb-2 text-base font-semibold text-foreground">Pickup address</Text>
        <TextInput
          value={pickup}
          onChangeText={setPickup}
          placeholder="123 Main St, Austin TX"
          className="mb-4 min-h-[48px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
          accessibilityLabel="Pickup address"
          testID="family-book-pickup"
        />

        <Text className="mb-2 text-base font-semibold text-foreground">Drop-off address</Text>
        <TextInput
          value={dropoff}
          onChangeText={setDropoff}
          placeholder="Austin VA Clinic"
          className="mb-4 min-h-[48px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
          accessibilityLabel="Drop-off address"
          testID="family-book-dropoff"
        />

        <Text className="mb-2 text-base font-semibold text-foreground">Pickup time</Text>
        <TextInput
          value={scheduledPickupTime}
          onChangeText={setScheduledPickupTime}
          placeholder="2026-05-01T10:30:00Z"
          autoCapitalize="none"
          autoCorrect={false}
          className="mb-4 min-h-[48px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
          accessibilityLabel="Scheduled pickup time in ISO format"
          testID="family-book-time"
        />
        <Text className="mb-6 text-xs text-gray-500">
          Use ISO format (e.g. 2026-05-01T10:30:00Z).
        </Text>

        {error ? (
          <View className="mb-4 flex-row items-center rounded-lg bg-red-50 p-3">
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text className="ml-2 flex-1 text-sm text-red-700">{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={book.isPending}
          className={`min-h-[56px] flex-row items-center justify-center rounded-xl ${
            book.isPending ? 'bg-gray-300' : 'bg-primary'
          }`}
          accessibilityLabel="Book ride"
          accessibilityRole="button"
          testID="family-book-submit">
          {book.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="car" size={20} color="#ffffff" />
              <Text className="ml-2 text-lg font-semibold text-white">Book Ride</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
