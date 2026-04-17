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
            backgroundColor: '#FAFAF9',
          },
          headerTintColor: '#1E40AF',
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
            backgroundColor: '#FAFAF9',
          },
          headerTintColor: '#1E40AF',
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
            backgroundColor: '#FAFAF9',
          },
          headerTintColor: '#1E40AF',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
