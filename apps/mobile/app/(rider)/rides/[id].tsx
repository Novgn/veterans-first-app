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
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert as RNAlert,
  Linking,
} from 'react-native';

import { PriceLockBadge, WaitTimeIndicator } from '@/components/booking';
import { DriverCard } from '@/components/drivers';
import { PhoneButton } from '@/components/PhoneButton';
import {
  CancellationSuccessScreen,
  ConfirmationModal,
  ContactDriverSheet,
  RideDetailCard,
  StatusTimeline,
} from '@/components/rides';
import { DriverArrivedBanner } from '@/components/tracking';
import {
  Alert,
  AppHeader,
  BottomActionBar,
  Button,
  Card,
  StatusBadge,
  type StatusBadgeStatus,
} from '@/components/ui';
import { useCancelRide, useDriverLocation, useRide } from '@/hooks';
import type { Ride } from '@/hooks/useRide';
import { SUPPORT_PHONE } from '@/lib/constants';

/** Mock locked price in cents for MVP — mirrors the booking flow's price-lock. */
const MOCK_PRICE_CENTS = 4500; // $45

/** Default included wait time in minutes (counts up calmly, never a countdown). */
const DEFAULT_WAIT_MINUTES = 20;

/**
 * Maps a ride status from the data layer to a status supported by StatusBadge.
 * The data layer has an additional `'arrived'` status that we present as
 * `in_progress` with an explicit "Driver arrived" label.
 */
function toBadgeStatus(status: Ride['status']): {
  status: StatusBadgeStatus;
  label?: string;
} {
  if (status === 'arrived') {
    return { status: 'in_progress', label: 'Driver arrived' };
  }
  return { status };
}

/**
 * Formats a scheduled pickup ISO timestamp into a concise "Today at 3:45 PM"
 * style label for display next to the status badge. Falls back to "ASAP" when
 * no scheduled time is set.
 */
function formatScheduledTimeLabel(isoString: string | null): string {
  if (!isoString) return 'ASAP';

  const date = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rideDate = new Date(date);
  rideDate.setHours(0, 0, 0, 0);

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (rideDate.getTime() === today.getTime()) return `Today at ${time}`;
  if (rideDate.getTime() === tomorrow.getTime()) return `Tomorrow at ${time}`;

  const day = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${day} at ${time}`;
}

async function callDispatch() {
  const url = `tel:${SUPPORT_PHONE}`;
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return;
    }
  } catch {
    // fall through to alert
  }
  RNAlert.alert('Unable to Call', `Please call ${SUPPORT_PHONE} to reach dispatch.`, [
    { text: 'OK' },
  ]);
}

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
    } catch (cancelError) {
      // Error handled by mutation
      console.error('Cancel failed:', cancelError);
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
        <AppHeader mode="screen" title="Ride details" rightSlot={<PhoneButton />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F3A5F" />
          <Text className="mt-4 font-sans text-body text-ink-secondary">
            Loading ride details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !ride) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <AppHeader mode="screen" title="Ride details" rightSlot={<PhoneButton />} />
        <View className="flex-1 items-center justify-center px-6">
          <Alert
            variant="error"
            title="Unable to load ride"
            message="We couldn't load the ride details. Your ride is still on — call us anytime."
            action={{ label: 'Call us', onPress: callDispatch }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const badge = toBadgeStatus(ride.status);
  const scheduledLabel = formatScheduledTimeLabel(ride.scheduled_pickup_time);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader mode="screen" title="Ride details" rightSlot={<PhoneButton />} />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pt-4 pb-6">
        {/* Status hero — badge + scheduled time */}
        <Card variant="flat" padding="md" className="mb-4">
          <View className="flex-row items-center justify-between">
            <StatusBadge
              status={badge.status}
              label={badge.label}
              variant="subtle"
              size="md"
              withDot
              testID="ride-status-badge"
            />
            <Text className="ml-3 font-sans text-footnote text-ink-secondary" numberOfLines={1}>
              {scheduledLabel}
            </Text>
          </View>
        </Card>

        {/*
         * Status timeline — the canonical, text-labeled progression and the
         * screen-reader text equivalent for the (secondary) live map. Hidden
         * for completed/cancelled rides (timeline renders null there).
         */}
        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <Card variant="outlined" padding="md" className="mb-4">
            <StatusTimeline currentStatus={ride.status} />
          </Card>
        )}

        {/* Driver Arrived Banner — shown when driver has arrived */}
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

        {/*
         * Real-time driver tracking status.
         *
         * The map + ETA surfaces (DriverTrackingMap / ETADisplay) require real
         * pickup coordinates, which the ride data layer does not yet expose
         * (only the pickup address string is available). Until Phase 3 wires
         * up geocoded pickup coordinates end-to-end, we intentionally do not
         * render the mock-coordinate map here; we surface tracking state via
         * an Alert so older riders always see a clear status message.
         */}
        {showTracking && !driverLocation && (
          <Alert
            variant="info"
            title="Connecting to driver"
            message="We'll show the live location once your driver is en route."
            className="mb-4"
            testID="tracking-connecting-alert"
          />
        )}
        {showTracking && driverLocation && !isTrackingConnected && (
          <Alert
            variant="warning"
            title="Connection lost"
            message="We're trying to reach your driver..."
            className="mb-4"
            testID="tracking-reconnecting-alert"
          />
        )}

        {/* Ride Details Card — kept as-is for Phase 2. */}
        <RideDetailCard ride={ride} />

        {/* Trust signals — locked price + included wait time, always visible. */}
        <Card variant="flat" padding="md" className="mt-4">
          <View className="gap-3">
            <PriceLockBadge priceCents={MOCK_PRICE_CENTS} />
            <WaitTimeIndicator waitMinutes={DEFAULT_WAIT_MINUTES} />
          </View>
        </Card>

        {/* Driver Info Section — shown when driver is assigned */}
        {ride.driver && (
          <View className="mt-6">
            <Text className="mb-3 font-sans-semibold text-headline text-foreground">
              Your driver
            </Text>
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
                className="mt-4 min-h-touch-lg flex-row items-center justify-center rounded-md border-2 border-primary active:bg-primary-50"
                accessibilityLabel={`Call ${ride.driver.firstName}`}
                accessibilityRole="button"
                accessibilityHint="Opens options to call or text driver">
                <Ionicons name="call-outline" size={24} color="#1F3A5F" />
                <Text className="ml-3 font-sans-semibold text-headline text-primary">
                  Call {ride.driver.firstName}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Non-modifiable: inline Alert explaining why + CTA to dispatch */}
        {!canModify && (
          <View className="mt-6">
            <Alert
              variant="info"
              title="Can't modify"
              message="Contact dispatch if you need to make changes."
              action={{ label: 'Call dispatch', onPress: callDispatch }}
              testID="ride-cannot-modify-alert"
            />
          </View>
        )}
      </ScrollView>

      {/* Action bar — only for modifiable rides, pinned to safe area */}
      {canModify && (
        <BottomActionBar>
          <Button
            label="Modify ride"
            variant="secondary"
            size="lg"
            leftIcon={<Ionicons name="create-outline" size={22} color="#1F3A5F" />}
            onPress={handleModify}
            accessibilityHint="Opens screen to change time or destination"
            testID="ride-detail-modify-button"
          />
          <Pressable
            onPress={handleCancelPress}
            accessibilityLabel="Cancel this ride"
            accessibilityRole="button"
            accessibilityHint="Opens cancellation confirmation"
            className="mt-2 min-h-touch items-center justify-center rounded-md active:bg-error-100"
            testID="ride-detail-cancel-button">
            <Text className="font-sans-semibold text-body text-error">Cancel ride</Text>
          </Pressable>
        </BottomActionBar>
      )}

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
