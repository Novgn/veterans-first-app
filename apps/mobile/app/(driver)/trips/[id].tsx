/**
 * Trip Detail / Active Trip Screen (driver)
 *
 * Shows the assigned trip with rider info, route, and the primary status
 * action (Start Route → Arrived → Start Trip → Complete Trip). Each tap
 * captures GPS and writes a ride_event.
 *
 * Stories wiring in here:
 *   3.2 — rider profile & trip fetch (already present)
 *   3.4 — status transitions + location capture (this story)
 *   3.5 — map/navigation placeholder remains
 */

import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isTomorrow } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  ContactRiderSheet,
  NavigationButton,
  NoShowTimer,
  RiderProfileCard,
  StatusActionButton,
  TripStatusBadge,
} from '@/components/trips';
import type { RideStatusKey } from '@/components/trips/TripStatusBadge';
import {
  useArrivalPhotoUpload,
  useLocationCapture,
  useMarkNoShow,
  useTrip,
  useRiderHistory,
  useTripStatus,
} from '@/hooks';
import type { RideStatus } from '@/hooks/useTripStatus';

function formatPickupTime(dateString: string): string {
  const date = new Date(dateString);
  const time = format(date, 'h:mm a');

  if (isToday(date)) return `Today at ${time}`;
  if (isTomorrow(date)) return `Tomorrow at ${time}`;
  return format(date, 'EEEE, MMMM d') + ` at ${time}`;
}

const DRIVER_TRANSITIONABLE: readonly RideStatus[] = [
  'assigned',
  'en_route',
  'arrived',
  'in_progress',
] as const;

function isDriverTransitionable(status: string): status is RideStatus {
  return (DRIVER_TRANSITIONABLE as readonly string[]).includes(status);
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: trip, isLoading, error } = useTrip(id ?? '');
  const { data: relationshipCount = 0 } = useRiderHistory(trip?.rider?.id ?? '');

  const tripStatus = useTripStatus();
  const markNoShow = useMarkNoShow();
  const { captureLocation } = useLocationCapture();
  const { captureAndUpload: capturePhoto } = useArrivalPhotoUpload();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [arrivedAt, setArrivedAt] = useState<string | null>(null);

  const handleTransition = async (nextStatus: RideStatus) => {
    if (!trip) return;

    if (nextStatus === 'completed') {
      Alert.alert('Complete Trip?', 'This will mark the trip as completed. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: () => void performTransition(nextStatus),
        },
      ]);
      return;
    }

    await performTransition(nextStatus);
  };

  const performTransition = async (nextStatus: RideStatus) => {
    if (!trip) return;
    setIsTransitioning(true);
    try {
      const location = await captureLocation();
      // Story 3.9: on arrival, optionally capture a confirmation photo.
      // Upload is best-effort — transition proceeds even if photo fails/cancels.
      let photoUrl: string | null = null;
      if (nextStatus === 'arrived') {
        photoUrl = await capturePhoto(trip.id).catch(() => null);
      }
      await tripStatus.mutateAsync({
        rideId: trip.id,
        newStatus: nextStatus,
        location,
        photoUrl,
      });
      if (nextStatus === 'arrived') {
        setArrivedAt(new Date().toISOString());
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update trip status';
      Alert.alert('Update Failed', message);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleMarkNoShow = () => {
    if (!trip) return;
    Alert.alert(
      'Mark No-Show?',
      'This will end the trip as a no-show. Only do this after waiting at the pickup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark No-Show',
          style: 'destructive',
          onPress: async () => {
            try {
              const location = await captureLocation();
              await markNoShow.mutateAsync({ rideId: trip.id, location });
            } catch (err) {
              Alert.alert(
                'Update Failed',
                err instanceof Error ? err.message : 'Could not mark no-show'
              );
            }
          },
        },
      ]
    );
  };

  const handleContactRider = () => {
    if (!trip?.rider?.phone) {
      Alert.alert('Unavailable', 'Rider phone number is not available.');
      return;
    }
    setShowContactSheet(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="border-hairline flex-row items-center border-b px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-4 min-h-touch min-w-touch items-center justify-center"
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color="#1F3A5F" />
          </Pressable>
          <Text className="font-sans-bold text-title-3 text-foreground">Trip Details</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F3A5F" />
          <Text className="mt-4 font-sans text-body text-ink-secondary">
            Loading trip details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !trip) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="border-hairline flex-row items-center border-b px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-4 min-h-touch min-w-touch items-center justify-center"
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color="#1F3A5F" />
          </Pressable>
          <Text className="font-sans-bold text-title-3 text-foreground">Trip Details</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-error-100">
            <Ionicons name="alert-circle" size={32} color="#A83A35" />
          </View>
          <Text className="font-sans-semibold text-headline text-foreground">Trip not found</Text>
          <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
            This trip may have been cancelled or doesn&apos;t exist.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-8 min-h-touch flex-row items-center justify-center rounded-md bg-primary px-8"
            accessibilityLabel="Return to home"
            accessibilityRole="button">
            <Ionicons name="home" size={20} color="#FFFFFF" />
            <Text className="ml-2 font-sans-semibold text-white">Return Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus = trip.status as RideStatusKey;
  const showActionButton = isDriverTransitionable(trip.status);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="border-hairline flex-row items-center border-b px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 min-h-touch min-w-touch items-center justify-center"
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#1F3A5F" />
        </Pressable>
        <View className="flex-1">
          <Text className="font-sans-bold text-title-3 text-foreground">Trip Details</Text>
          <Text className="font-sans text-caption text-ink-secondary">
            {formatPickupTime(trip.scheduledPickupTime)}
          </Text>
        </View>
        <TripStatusBadge status={currentStatus} testID="trip-status-badge" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <RiderProfileCard
          rider={trip.rider}
          preferences={trip.riderPreferences}
          relationshipCount={relationshipCount}
          testID="rider-profile-card"
        />

        {/* Contact Rider (Story 3.6) — outlined navy secondary */}
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={handleContactRider}
            className="min-h-touch flex-1 flex-row items-center justify-center rounded-md border border-primary bg-card"
            accessibilityLabel="Contact rider"
            accessibilityRole="button"
            accessibilityHint="Opens options to call or text the rider"
            testID="contact-rider-button">
            <Ionicons name="call" size={20} color="#1F3A5F" />
            <Text className="ml-2 font-sans-semibold text-primary">Contact Rider</Text>
          </Pressable>
        </View>

        {/* Addresses Section */}
        <View className="border-hairline mt-4 rounded-lg border bg-card p-6 shadow-card">
          <Text className="mb-3 font-sans-semibold text-title-3 text-foreground">Trip Route</Text>

          {/* Pickup Address */}
          <View className="mb-4">
            <View className="flex-row items-start">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-success-100">
                <Ionicons name="location" size={18} color="#356046" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-caption uppercase text-ink-secondary">
                  Pickup
                </Text>
                <Text className="mt-1 font-sans text-body text-foreground">
                  {trip.pickupAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Route line */}
          <View className="border-hairline ml-4 h-6 border-l-2 border-dashed" />

          {/* Dropoff Address */}
          <View className="mt-2">
            <View className="flex-row items-start">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                <Ionicons name="flag" size={18} color="#1F3A5F" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-caption uppercase text-ink-secondary">
                  Dropoff
                </Text>
                <Text className="mt-1 font-sans text-body text-foreground">
                  {trip.dropoffAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* No-show timer (Story 3.10) — only visible once the driver is at the pickup */}
        {trip.status === 'arrived' ? (
          <View className="mt-4">
            <NoShowTimer
              arrivedAt={arrivedAt}
              onMarkNoShow={handleMarkNoShow}
              isMarking={markNoShow.isPending}
              testID="no-show-timer"
            />
          </View>
        ) : null}

        {/* Turn-by-turn navigation (Story 3.5) */}
        <View className="mt-4">
          {trip.status === 'in_progress' ? (
            <NavigationButton
              label="Navigate to Dropoff"
              address={trip.dropoffAddress}
              testID="nav-dropoff-button"
            />
          ) : (
            <NavigationButton
              label="Navigate to Pickup"
              address={trip.pickupAddress}
              testID="nav-pickup-button"
            />
          )}
        </View>

        {/* Spacer so sticky action doesn't cover content */}
        <View className="h-24" />
      </ScrollView>

      {/* Sticky primary action */}
      {showActionButton ? (
        <View className="border-hairline border-t bg-card p-4">
          <StatusActionButton
            currentStatus={trip.status as RideStatus}
            onPress={handleTransition}
            isLoading={isTransitioning || tripStatus.isPending}
            testID="status-action-button"
          />
        </View>
      ) : null}

      {/* Contact rider sheet (Story 3.6) */}
      <ContactRiderSheet
        visible={showContactSheet}
        onClose={() => setShowContactSheet(false)}
        riderName={trip.rider?.firstName ?? 'Rider'}
        riderPhone={trip.rider?.phone ?? ''}
        testID="contact-rider-sheet"
      />
    </SafeAreaView>
  );
}
