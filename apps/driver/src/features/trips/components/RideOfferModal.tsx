/**
 * RideOfferModal component for displaying new ride offers to drivers
 *
 * Features:
 * - Shows trip details (pickup time, rider, addresses)
 * - Countdown timer for response deadline
 * - Accept button (prominent, green)
 * - Decline button (secondary, triggers reason sheet)
 * - Accessibility badges for rider needs
 * - 48dp+ touch targets
 */

import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { View, Text, Modal, Pressable, Image, Alert, ActivityIndicator } from 'react-native';

import { useRideOffer, useAcceptRide, useDeclineRide } from '../hooks';

import { AccessibilityBadges } from './AccessibilityBadges';
import { CountdownTimer } from './CountdownTimer';
import { DeclineReasonSheet } from './DeclineReasonSheet';

interface RideOfferModalProps {
  /** Test ID for testing */
  testID?: string;
}

/**
 * Modal for displaying and responding to ride offers
 */
export function RideOfferModal({ testID }: RideOfferModalProps) {
  const { data: offer, timeRemaining } = useRideOffer();
  const acceptRide = useAcceptRide();
  const declineRide = useDeclineRide();
  const [showDeclineSheet, setShowDeclineSheet] = useState(false);

  // Don't render if no pending offer
  if (!offer || offer.status !== 'pending') return null;

  const riderName = `${offer.ride.rider.firstName} ${offer.ride.rider.lastName}`;
  const initials =
    `${offer.ride.rider.firstName.charAt(0)}${offer.ride.rider.lastName.charAt(0)}`.toUpperCase();
  const pickupTime = format(new Date(offer.ride.scheduledPickupTime), 'h:mm a');

  const handleAccept = async () => {
    try {
      await acceptRide.mutateAsync({
        offerId: offer.id,
        rideId: offer.rideId,
      });
      Alert.alert('Accepted', 'Ride added to your queue');
    } catch {
      Alert.alert('Error', 'Could not accept ride. Please try again.');
    }
  };

  const handleDecline = () => {
    setShowDeclineSheet(true);
  };

  const handleDeclineSubmit = async (reason?: string) => {
    setShowDeclineSheet(false);
    try {
      await declineRide.mutateAsync({
        offerId: offer.id,
        rideId: offer.rideId,
        reason,
      });
    } catch {
      Alert.alert('Error', 'Could not decline ride. Please try again.');
    }
  };

  const handleExpire = () => {
    // Offer expired - will auto-refetch and close
    Alert.alert('Offer Expired', 'This ride offer has expired.');
  };

  const isProcessing = acceptRide.isPending || declineRide.isPending;

  return (
    <>
      <Modal
        visible={true}
        transparent
        animationType="slide"
        accessibilityViewIsModal
        testID={testID}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-white p-6">
            {/* Header with Timer */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">New Ride Offer</Text>
              <CountdownTimer
                seconds={timeRemaining ?? 0}
                onExpire={handleExpire}
                testID="offer-countdown"
              />
            </View>

            {/* Pickup Time */}
            <View className="mb-4 rounded-xl bg-blue-50 p-4">
              <Text
                className="text-center text-2xl font-bold text-primary"
                accessibilityLabel={`Pickup time ${pickupTime}`}>
                {pickupTime}
              </Text>
              <Text className="text-center text-sm text-gray-600">Pickup Time</Text>
            </View>

            {/* Rider Info */}
            <View className="mb-4 flex-row items-center">
              {offer.ride.rider.profilePhotoUrl ? (
                <Image
                  source={{ uri: offer.ride.rider.profilePhotoUrl }}
                  className="h-16 w-16 rounded-full"
                  accessibilityLabel={`Photo of ${riderName}`}
                />
              ) : (
                <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                  <Text className="text-xl font-bold text-gray-600">{initials}</Text>
                </View>
              )}
              <View className="ml-4 flex-1">
                <Text
                  className="text-lg font-semibold text-foreground"
                  accessibilityLabel={`Rider: ${riderName}`}>
                  {riderName}
                </Text>
                {offer.ride.riderPreferences && (
                  <AccessibilityBadges preferences={offer.ride.riderPreferences} size="sm" />
                )}
              </View>
            </View>

            {/* Addresses */}
            <View className="mb-6">
              <View className="mb-2 flex-row items-start">
                <Ionicons name="location" size={20} color="#059669" />
                <Text
                  className="ml-2 flex-1 text-sm text-gray-700"
                  accessibilityLabel={`Pickup: ${offer.ride.pickupAddress}`}>
                  {offer.ride.pickupAddress}
                </Text>
              </View>
              <View className="ml-2.5 h-4 border-l border-dashed border-gray-300" />
              <View className="flex-row items-start">
                <Ionicons name="flag" size={20} color="#DC2626" />
                <Text
                  className="ml-2 flex-1 text-sm text-gray-700"
                  accessibilityLabel={`Dropoff: ${offer.ride.dropoffAddress}`}>
                  {offer.ride.dropoffAddress}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-4">
              <Pressable
                onPress={handleDecline}
                disabled={isProcessing}
                className={`min-h-[56px] flex-1 items-center justify-center rounded-xl border-2 border-red-500 bg-white ${
                  isProcessing ? 'opacity-50' : ''
                }`}
                accessibilityLabel="Decline ride"
                accessibilityRole="button"
                accessibilityState={{ disabled: isProcessing }}
                testID="decline-button">
                {declineRide.isPending ? (
                  <ActivityIndicator color="#EF4444" />
                ) : (
                  <Text className="text-lg font-bold text-red-500">Decline</Text>
                )}
              </Pressable>
              <Pressable
                onPress={handleAccept}
                disabled={isProcessing}
                className={`min-h-[56px] flex-1 items-center justify-center rounded-xl bg-green-500 ${
                  isProcessing ? 'opacity-50' : ''
                }`}
                accessibilityLabel="Accept ride"
                accessibilityRole="button"
                accessibilityState={{ disabled: isProcessing }}
                testID="accept-button">
                {acceptRide.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-lg font-bold text-white">Accept</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Decline Reason Sheet */}
      <DeclineReasonSheet
        visible={showDeclineSheet}
        onClose={() => setShowDeclineSheet(false)}
        onSubmit={handleDeclineSubmit}
        testID="decline-reason-sheet"
      />
    </>
  );
}
