// RoleSwitcher — header chip switcher for multi-role users.
//
// Single-role users auto-route at sign-in, so this renders `null` unless the
// user holds two or more roles. Multi-role users get a horizontal row of pill
// chips: the active role inverts to a filled sage fill with a white label, while
// resting chips show a sage border on the stone canvas with an ink label.
//
// Per DESIGN.md {components.role-switcher} + EXPERIENCE.md § Role Switching.
//
// Usage:
//   <RoleSwitcher
//     roles={[{ key: 'rider', label: 'Rider' }, { key: 'driver', label: 'Driver' }]}
//     currentRole="rider"
//     onSelect={setRole}
//   />

import { Pressable, Text, View } from 'react-native';

export interface RoleSwitcherRole {
  /** Stable role identifier (e.g. 'rider', 'driver') passed back to onSelect. */
  key: string;
  /** Human-readable chip label. */
  label: string;
}

export interface RoleSwitcherProps {
  /** Available roles. With <= 1 role the switcher renders nothing. */
  roles: RoleSwitcherRole[];
  /** The currently active role key — drives the inverted/filled chip. */
  currentRole: string;
  /** Fired with the selected role key when a chip is pressed. */
  onSelect: (key: string) => void;
  /** Optional testID forwarded to the root View. */
  testID?: string;
}

export function RoleSwitcher({ roles, currentRole, onSelect, testID }: RoleSwitcherProps) {
  // Single-role users auto-route — no switcher chrome.
  if (roles.length <= 1) {
    return null;
  }

  return (
    <View testID={testID} accessibilityRole="tablist" className="flex-row items-center">
      {roles.map((role) => {
        const selected = role.key === currentRole;
        // Active inverts to a filled sage chip with a white label; resting chips
        // carry a sage border on the stone canvas with an ink label.
        const chipClass = selected
          ? 'bg-secondary border-2 border-secondary'
          : 'bg-background border-2 border-secondary active:bg-secondary-100';
        const labelClass = selected ? 'text-white' : 'text-foreground';

        return (
          <Pressable
            key={role.key}
            onPress={() => onSelect(role.key)}
            accessibilityRole="button"
            accessibilityLabel={role.label}
            accessibilityState={{ selected }}
            // rounded-full pill; min-h-touch (48dp) keeps the tap target accessible.
            className={`mr-2 min-h-touch items-center justify-center rounded-full px-4 ${chipClass}`}>
            <Text className={`font-sans-medium text-callout ${labelClass}`}>{role.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
