import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { RideCard, type RideWithDriver } from '@/components/rides/RideCard';
import { AppHeader, Button, Card, ListRow, SectionGroup, SectionHeader } from '@/components/ui';
import { useDestinations, type SavedDestination } from '@/hooks/useDestinations';
import { useRides } from '@/hooks/useRides';
import { SUPPORT_PHONE } from '@/lib/constants';
import { useBookingStore, type Destination } from '@/stores/bookingStore';

type QuickActionTint = 'primary' | 'secondary' | 'accent' | 'success';

interface QuickAction {
  key: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: QuickActionTint;
  accessibilityHint: string;
  onPress: () => void;
}

const TINT_CONTAINER: Record<QuickActionTint, string> = {
  primary: 'bg-primary-100',
  secondary: 'bg-secondary-100',
  accent: 'bg-accent-100',
  success: 'bg-secondary-100',
};

// Veteran Honor icon tints: navy (primary), sage (secondary/success),
// brass (accent — NON-TEXT, used here only as an icon tint).
const TINT_ICON_COLOR: Record<QuickActionTint, string> = {
  primary: '#1F3A5F',
  secondary: '#4A6B54',
  accent: '#9A7B3F',
  success: '#356046',
};

/**
 * Returns the time-of-day-aware greeting for the current device clock.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Upcoming statuses that should surface a ride preview on the home screen.
 */
const UPCOMING_STATUSES: ReadonlyArray<RideWithDriver['status']> = [
  'pending',
  'assigned',
  'confirmed',
  'in_progress',
];

/**
 * Finds the nearest upcoming ride (earliest scheduled pickup, ASAP rides first).
 */
function selectNextUpcomingRide(rides: RideWithDriver[] | undefined): RideWithDriver | undefined {
  if (!rides || rides.length === 0) return undefined;

  const upcoming = rides.filter((ride) => UPCOMING_STATUSES.includes(ride.status));
  if (upcoming.length === 0) return undefined;

  return [...upcoming].sort((a, b) => {
    // ASAP rides (no scheduled time) get highest priority.
    if (!a.scheduled_pickup_time && !b.scheduled_pickup_time) return 0;
    if (!a.scheduled_pickup_time) return -1;
    if (!b.scheduled_pickup_time) return 1;
    return (
      new Date(a.scheduled_pickup_time).getTime() - new Date(b.scheduled_pickup_time).getTime()
    );
  })[0];
}

/**
 * Produces the friendly "Next ride" supporting line below the greeting.
 * Format: "Next ride: Tomorrow 9:00 AM to VA Clinic".
 */
function formatNextRideSubline(ride: RideWithDriver): string {
  const dropoff = ride.dropoff_address?.split(',')[0]?.trim() || 'your destination';

  if (!ride.scheduled_pickup_time) {
    return `Next ride: ASAP to ${dropoff}`;
  }

  const pickup = new Date(ride.scheduled_pickup_time);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rideDay = new Date(pickup);
  rideDay.setHours(0, 0, 0, 0);

  let dayLabel: string;
  if (rideDay.getTime() === today.getTime()) {
    dayLabel = 'Today';
  } else if (rideDay.getTime() === tomorrow.getTime()) {
    dayLabel = 'Tomorrow';
  } else {
    dayLabel = pickup.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  const timeLabel = pickup.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `Next ride: ${dayLabel} ${timeLabel} to ${dropoff}`;
}

/**
 * Max Quick Book rows shown on the home screen. Keeps the screen scannable.
 */
const MAX_QUICK_BOOK_DESTINATIONS = 3;

/**
 * Converts a database SavedDestination into the booking-store Destination shape.
 * Mirrors the mapping used in DestinationPicker so the booking flow treats
 * home-screen selections identically to in-flow selections.
 */
function toBookingDestination(saved: SavedDestination): Destination {
  return {
    id: saved.id,
    name: saved.label,
    address: saved.address,
    latitude: saved.lat,
    longitude: saved.lng,
    placeId: saved.place_id ?? undefined,
    isDefaultPickup: saved.is_default_pickup,
    isDefaultDropoff: saved.is_default_dropoff,
  };
}

/**
 * Sorts saved destinations the same way DestinationPicker does so the
 * "most likely destination" lands on top: default dropoff, then default pickup,
 * then API order (which is created_at DESC).
 */
function selectQuickBookDestinations(saved: SavedDestination[] | undefined): SavedDestination[] {
  if (!saved || saved.length === 0) return [];
  return [...saved]
    .sort((a, b) => {
      if (a.is_default_dropoff && !b.is_default_dropoff) return -1;
      if (!a.is_default_dropoff && b.is_default_dropoff) return 1;
      if (a.is_default_pickup && !b.is_default_pickup) return -1;
      if (!a.is_default_pickup && b.is_default_pickup) return 1;
      return 0;
    })
    .slice(0, MAX_QUICK_BOOK_DESTINATIONS);
}

/**
 * Quick-action card used in the 2x2 grid. Outlined card with a tinted icon
 * circle, title, and optional subtitle. Haptic on press.
 */
function QuickActionCard({ action }: { action: QuickAction }) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress();
  };

  return (
    <View className="w-1/2 p-1">
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={action.title}
        accessibilityHint={action.accessibilityHint}
        className="active:opacity-80">
        <Card variant="outlined" padding="md" className="min-h-[104px]">
          <View className="flex-1 items-start justify-between">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${TINT_CONTAINER[action.tint]}`}>
              <Ionicons name={action.icon} size={20} color={TINT_ICON_COLOR[action.tint]} />
            </View>
            <View className="mt-3">
              <Text className="font-sans-semibold text-callout text-foreground">
                {action.title}
              </Text>
              {action.subtitle ? (
                <Text className="mt-0.5 font-sans text-footnote text-ink-secondary">
                  {action.subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    </View>
  );
}

export default function Home() {
  const { user } = useUser();
  const { data: rides } = useRides();
  const { data: savedDestinations } = useDestinations();
  const { setDropoffDestination, setCurrentStep } = useBookingStore();

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.firstName?.trim();

  const nextRide = useMemo(() => selectNextUpcomingRide(rides), [rides]);

  const quickBookDestinations = useMemo(
    () => selectQuickBookDestinations(savedDestinations),
    [savedDestinations]
  );

  const supportingLine = nextRide ? formatNextRideSubline(nextRide) : 'Ready when you are';

  const handleBookRide = () => {
    router.push('/booking');
  };

  const handleQuickBook = (saved: SavedDestination) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDropoffDestination(toBookingDestination(saved));
    setCurrentStep(2);
    router.push('/booking/time');
  };

  const handleCallDispatch = async () => {
    const phoneUrl = `tel:${SUPPORT_PHONE}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
      return;
    }
    Alert.alert('Unable to Call', `Please call ${SUPPORT_PHONE} to reach dispatch.`, [
      { text: 'OK' },
    ]);
  };

  const quickActions: QuickAction[] = [
    {
      key: 'schedule',
      title: 'Schedule a ride',
      subtitle: 'Plan ahead',
      icon: 'calendar',
      tint: 'primary',
      accessibilityHint: 'Opens the booking wizard to schedule a new ride',
      onPress: () => router.push('/booking'),
    },
    {
      key: 'saved-places',
      title: 'My saved places',
      subtitle: 'Home, clinic & more',
      icon: 'bookmark',
      tint: 'secondary',
      accessibilityHint: 'View and manage your saved addresses',
      onPress: () => router.push('/profile/saved-places'),
    },
    {
      key: 'recent-rides',
      title: 'Recent rides',
      subtitle: 'Trip history',
      icon: 'time',
      tint: 'accent',
      accessibilityHint: 'View your ride history on the My Rides tab',
      onPress: () => router.push('/rides'),
    },
    {
      key: 'call-dispatch',
      title: 'Call dispatch',
      subtitle: 'Speak to a person',
      icon: 'call',
      tint: 'success',
      accessibilityHint: 'Calls Veterans 1st dispatch for immediate help',
      onPress: handleCallDispatch,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader mode="brand" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-4 pb-8"
        showsVerticalScrollIndicator={false}>
        {/* Personalized greeting */}
        <View className="mb-6" accessible accessibilityRole="header">
          <Text className="font-sans-bold text-title-2 text-foreground">
            {greeting}
            {firstName ? `, ${firstName}` : ''}
          </Text>
          <Text className="mt-1 font-sans text-callout text-ink-secondary">{supportingLine}</Text>
        </View>

        {/* Primary CTA */}
        <View className="mb-8">
          <Button
            label="Book a ride"
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Ionicons name="car" size={22} color="#FFFFFF" />}
            onPress={handleBookRide}
            accessibilityLabel="Book a ride"
            accessibilityHint="Opens the booking wizard to schedule a new ride"
          />
        </View>

        {/* Upcoming ride preview */}
        {nextRide ? (
          <View className="mb-8">
            <SectionHeader title="Your next ride" />
            <RideCard ride={nextRide} onPress={() => router.push(`/rides/${nextRide.id}`)} />
          </View>
        ) : null}

        {/* Quick book — one-tap rebook to a saved destination */}
        {quickBookDestinations.length > 0 ? (
          <View className="mb-8">
            <SectionHeader title="Quick book" hint="Tap a place to book in one step" />
            <SectionGroup>
              {quickBookDestinations.map((saved) => {
                const iconName: keyof typeof Ionicons.glyphMap = saved.is_default_pickup
                  ? 'home'
                  : 'location';
                const shortAddress = saved.address.split(',')[0]?.trim() ?? saved.address;
                return (
                  <ListRow
                    key={saved.id}
                    leading={<Ionicons name={iconName} size={22} color="#1F3A5F" />}
                    leadingTint="primary"
                    title={saved.label}
                    subtitle={shortAddress}
                    onPress={() => handleQuickBook(saved)}
                    accessibilityHint={`Book a ride to ${saved.label} in one tap`}
                  />
                );
              })}
            </SectionGroup>
          </View>
        ) : null}

        {/* Quick actions grid (2x2) */}
        <View className="mb-8">
          <SectionHeader title="Quick actions" />
          <View className="-mx-1 flex-row flex-wrap">
            {quickActions.map((action) => (
              <QuickActionCard key={action.key} action={action} />
            ))}
          </View>
        </View>

        {/* Always-visible human escalation — a feature, never a fallback */}
        <Card variant="outlined" padding="lg" className="items-center">
          <Text className="font-sans-semibold text-headline text-foreground">Call us anytime</Text>
          <Text className="mb-4 mt-1 text-center font-sans text-callout text-ink-secondary">
            A real person is here to help with anything you need.
          </Text>
          <Button
            label="Call us anytime"
            variant="secondary"
            size="lg"
            fullWidth
            leftIcon={<Ionicons name="call" size={22} color="#1F3A5F" />}
            onPress={() => void handleCallDispatch()}
            accessibilityLabel="Call us anytime"
            accessibilityHint="Calls Veterans 1st to reach a person"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
