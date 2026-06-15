# AppHeader Migration Reference

`components/ui/AppHeader.tsx` unifies two legacy headers:

- `components/Header.tsx` — tab screens (wordmark + PhoneButton, no back).
- `components/ui/ScreenHeader.tsx` — sub-screens (back + centered title + right slot).

Both legacy components will be removed once all consumers migrate.

## Migrating a tab screen (was `<Header />`)

Before:

```tsx
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <Header />
      {/* ... */}
    </SafeAreaView>
  );
}
```

After:

```tsx
import { AppHeader } from '@/components/ui/AppHeader';

export default function Home() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <AppHeader mode="brand" />
      {/* ... */}
    </SafeAreaView>
  );
}
```

## Migrating a sub-screen (was `<ScreenHeader title="Foo" />`)

Before:

```tsx
import { ScreenHeader } from '@/components/ui/ScreenHeader';

<ScreenHeader title="Delete Account" />;
```

After:

```tsx
import { AppHeader } from '@/components/ui/AppHeader';

<AppHeader mode="screen" title="Delete Account" />;
```

- Optional: pass `subtitle`, `rightSlot`, `showBack={false}`, or a custom `onBack`.
- Default `onBack` calls `router.back()` from `expo-router`.
- Back button uses `chevron-back` at 28px in `primary` color with a 44x44 touch target.
