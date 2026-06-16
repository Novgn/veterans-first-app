/**
 * Profile stack navigator layout.
 *
 * Handles navigation between Profile tab and nested screens:
 * - saved-places: List of saved destinations
 * - add-place: Add/edit destination form
 */

import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="saved-places"
        options={{
          title: 'Saved Places',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F4F1EA',
          },
          headerTintColor: '#1F3A5F',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      />
      <Stack.Screen
        name="add-place"
        options={{
          title: 'Add Place',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F4F1EA',
          },
          headerTintColor: '#1F3A5F',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit-place"
        options={{
          title: 'Edit Place',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F4F1EA',
          },
          headerTintColor: '#1F3A5F',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="family-access/index"
        options={{
          title: 'Family Access',
          headerShown: true,
          headerStyle: { backgroundColor: '#F4F1EA' },
          headerTintColor: '#1F3A5F',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        }}
      />
      <Stack.Screen
        name="family-access/add"
        options={{
          title: 'Add Family Member',
          headerShown: true,
          headerStyle: { backgroundColor: '#F4F1EA' },
          headerTintColor: '#1F3A5F',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerShown: true,
          headerStyle: { backgroundColor: '#F4F1EA' },
          headerTintColor: '#1F3A5F',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        }}
      />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
    </Stack>
  );
}
