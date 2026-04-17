/**
 * RideDetailScreen
 *
 * Displays ride details with modification and cancellation actions.
 * Shows ride summary, driver info, status, and action buttons based on ride state.
 *
 * Features:
 * - Full ride details display
 * - Driver info with DriverCard when assigned
 * - Real-time driver tracking with map and ETA (Story 2.10)
 * - Contact Driver with call/text options (Story 2.11)
 * - Modify button (enabled for pending/assigned)
 * - Cancel button with confirmation modal
 * - 60-second undo after cancellation
 * - Full accessibility support
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 * Story 2.10: Implement Real-Time Driver Tracking
 * Story 2.11: Implement Contact Driver Feature
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView, ActivityIndicator } from 'react-native';

import { Header } from '@rider/components/Header';
import { DriverCard } from '@rider/drivers';
import {
  useRide,
  useCancelRide,
  ConfirmationModal,
  CancellationSuccessScreen,
  ContactDriverSheet,
  RideDetailCard,
} from '@rider/rides';
import {
  DriverTrackingMap,
  ETADisplay,
  DriverArrivedBanner,
  useDriverLocation,
} from '@rider/tracking';

// TODO: In production, geocode pickup address to get coordinates
// For MVP, using mock coordinates for San Francisco area
const MOCK_PICKUP_COORDINATES = {
  latitude: 37.7849,
  longitude: -122.4094,
};

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ride, isLoading, error } = useRide(id);
  const cancelMutation = useCancelRide();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string>('pending');

  // Real-time driver location tracking (Story 2.10)
  const { location: driverLocation, isConnected: isTrackingConnected } = useDriverLocation(
    ride?.driver_id ?? null
  );

  // Determine if ride can be modified/cancelled
  const canModify = ride?.status === 'pending' || ride?.status === 'assigned';

  // Determine if contact is available (assigned, in_progress, or arrived) - Story 2.11
  const canContact = ride?.driver && ['assigned', 'in_progress', 'arrived'].includes(ride.status);

  // Determine if we should show tracking (in_progress or arrived)
  const showTracking = ride?.status === 'in_progress' || ride?.status === 'arrived';
  const showArrivedBanner = ride?.status === 'arrived';

  const handleModify = () => {
    router.push(`/rides/modify/${id}`);
  };

  const handleCancelPress = () => {
    if (ride) {
      setPreviousStatus(ride.status);
    }
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async (reason?: string) => {
    if (!id) return;

    try {
      await cancelMutation.mutateAsync({
        rideId: id,
        reason,
      });
      setShowCancelModal(false);
      setShowCancelSuccess(true);
    } catch (error) {
      // Error handled by mutation
      console.error('Cancel failed:', error);
    }
  };

  // Show cancellation success screen with undo option
  if (showCancelSuccess && ride) {
    return (
      <CancellationSuccessScreen
        rideId={id!}
        destinationName={ride.dropoff_address}
        previousStatus={previousStatus}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Header showBackButton onBack={() => router.back()} title="Ride Details" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="mt-4 text-lg text-gray-600">Loading ride details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !ride) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Header showBackButton onBack={() => router.back()} title="Ride Details" />
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Ionicons name="alert-circle" size={40} color="#DC2626" />
          </View>
          <Text className="mt-4 text-xl font-bold text-foreground">Unable to Load Ride</Text>
          <Text className="mt-2 text-center text-lg text-gray-600">
            We couldn&apos;t load the ride details. Please try again.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 min-h-[56px] items-center justify-center rounded-xl bg-primary px-8 active:opacity-80"
            accessibilityLabel="Go back to My Rides"
            accessibilityRole="button">
            <Text className="text-lg font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <Header showBackButton onBack={() => router.back()} title="Ride Details" />

      <ScrollView className="flex-1 px-6 pt-4">
        {/* Driver Arrived Banner - shown when driver has arrived */}
        {showArrivedBanner && ride.driver && (
          <DriverArrivedBanner
            driver={{
              firstName: ride.driver.firstName,
              vehicleColor: ride.driver.vehicleColor ?? 'Unknown',
              vehicleMake: ride.driver.vehicleMake ?? 'Vehicle',
              vehicleModel: ride.driver.vehicleModel ?? '',
            }}
            className="mb-4"
            testID="driver-arrived-banner"
          />
        )}

        {/* Real-Time Driver Tracking Map - shown when en_route or arrived */}
        {showTracking && driverLocation && (
          <View className="mb-4">
            <Text className="mb-3 text-lg font-semibold text-foreground">Driver Location</Text>
            <DriverTrackingMap
              driverLocation={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                heading: driverLocation.heading,
              }}
              pickupLocation={{
                latitude: MOCK_PICKUP_COORDINATES.latitude,
                longitude: MOCK_PICKUP_COORDINATES.longitude,
                address: ride.pickup_address,
              }}
              className="h-64 overflow-hidden rounded-xl"
              testID="driver-tracking-map"
            />
            {/* ETA Display */}
            <ETADisplay
              driverLocation={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
              pickupLocation={MOCK_PICKUP_COORDINATES}
              className="mt-3"
              testID="eta-display"
            />
            {/* Connection status indicator */}
            {!isTrackingConnected && (
              <View className="mt-2 flex-row items-center">
                <View className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                <Text className="text-sm text-yellow-700">Reconnecting to driver...</Text>
              </View>
            )}
          </View>
        )}

        {/* Ride Details Card */}
        <RideDetailCard ride={ride} />

        {/* Driver Info Section - shown when driver is assigned */}
        {ride.driver && (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">Your Driver</Text>
            <DriverCard
              driver={{
                id: ride.driver.id,
                firstName: ride.driver.firstName,
                profilePhotoUrl: ride.driver.profilePhotoUrl,
                vehicleMake: ride.driver.vehicleMake,
                vehicleModel: ride.driver.vehicleModel,
                vehicleColor: ride.driver.vehicleColor,
              }}
              rideCount={ride.driverRideCount ?? 0}
              testID="ride-detail-driver-card"
            />

            {/* Contact Driver Button - Story 2.11 */}
            {canContact && (
              <Pressable
                onPress={() => setShowContactSheet(true)}
                className="mt-4 min-h-[56px] flex-row items-center justify-center rounded-xl border-2 border-primary active:bg-primary/5"
                accessibilityLabel={`Contact ${ride.driver.firstName}`}
                accessibilityRole="button"
                accessibilityHint="Opens options to call or text driver">
                <Ionicons name="call-outline" size={24} color="#1E40AF" />
                <Text className="ml-3 text-lg font-bold text-primary">
                  Contact {ride.driver.firstName}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Action Buttons - only for modifiable rides */}
        {canModify && (
          <View className="mt-8">
            {/* Modify Ride button */}
            <Pressable
              onPress={handleModify}
              className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary active:opacity-80"
              accessibilityLabel="Modify this ride"
              accessibilityRole="button"
              accessibilityHint="Opens screen to change time or destination">
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
              <Text className="ml-3 text-lg font-bold text-white">Modify Ride</Text>
            </Pressable>

            {/* Cancel Ride button */}
            <Pressable
              onPress={handleCancelPress}
              className="min-h-[56px] flex-row items-center justify-center rounded-xl border-2 border-red-600 active:bg-red-50"
              accessibilityLabel="Cancel this ride"
              accessibilityRole="button"
              accessibilityHint="Opens cancellation confirmation">
              <Ionicons name="close-circle-outline" size={24} color="#DC2626" />
              <Text className="ml-3 text-lg font-bold text-red-600">Cancel Ride</Text>
            </Pressable>
          </View>
        )}

        {/* Non-modifiable status message */}
        {!canModify && (
          <View className="mt-8 rounded-xl bg-gray-100 p-4">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={24} color="#6B7280" />
              <Text className="ml-2 flex-1 text-base text-gray-600">
                This ride cannot be modified because it is{' '}
                <Text className="font-semibold">{ride.status}</Text>.
              </Text>
            </View>
          </View>
        )}

        {/* Spacing at bottom */}
        <View className="h-8" />
      </ScrollView>

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel This Ride?"
        message="This will cancel your scheduled ride. You can undo within 60 seconds if you change your mind."
        confirmText="Cancel Ride"
        cancelText="Go Back"
        isDestructive
        showReasonInput
        reasonPlaceholder="Why are you cancelling? (optional)"
        isLoading={cancelMutation.isPending}
      />

      {/* Contact Driver Sheet - Story 2.11 */}
      {ride?.driver && (
        <ContactDriverSheet
          driverName={ride.driver.firstName}
          driverPhone={ride.driver.phone}
          visible={showContactSheet}
          onClose={() => setShowContactSheet(false)}
          testID="contact-driver-sheet"
        />
      )}
    </SafeAreaView>
  );
}
