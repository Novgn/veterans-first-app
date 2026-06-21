# Maestro UI test harness (mobile)

On-device UI flows for the Veterans 1st mobile app — the mobile counterpart to Playwright on web. They launch the real native build on a simulator and capture screenshots, so the Veteran Honor design-system restyle can be verified visually on iOS/Android.

---

## Prerequisites

1. **Maestro** — `curl -Ls https://get.maestro.mobile.dev | bash` (needs JDK 11+). Add `~/.maestro/bin` to `PATH`.
2. **A native dev build on a simulator** (the app uses native modules — `react-native-maps`, `react-native-svg`, `clerk-expo` — so Expo Go won't work):
   ```bash
   cd apps/mobile
   xcrun simctl boot "iPhone 16 Pro"   # or any installed simulator
   npx expo run:ios                     # prebuild + pod install + build + install + launch
   ```
   App id: **`com.novagen.veteransfirst`** (from `app.config.ts`). The generated `ios/` is gitignored.
3. **Test data (seed)** — authenticated flows require seeded Clerk + Supabase test users:

   ```bash
   npm run e2e:seed          # provisions users + fixtures
   npm run e2e:seed:teardown # removes them when done
   ```

   The seed creates three test phones (all use OTP `424242`):
   | Role | Phone |
   |--------|------------|
   | rider | 2015550100 |
   | driver | 2015550101 |
   | family | 2015550102 |

   Gotcha: the Clerk webhook pre-creates the Supabase `users` row with `role = 'rider'`; the seed script reconciles it. Test phones must be allow-listed in Clerk **test mode** for the OTP `424242` to work.

---

## Running flows

### All flows (npm script)

```bash
npm run e2e:ios
```

### By tag

```bash
npm run e2e:ios:tag rider       # rider flows only
npm run e2e:ios:tag driver
npm run e2e:ios:tag family
npm run e2e:ios:tag pre-auth
npm run e2e:ios:tag onboarding
npm run e2e:ios:tag edge        # edge-state + legal render-checks
```

### Direct Maestro invocations

```bash
export PATH="$PATH:$HOME/.maestro/bin"
cd apps/mobile

maestro test .maestro                               # all flows
maestro test --include-tags edge .maestro           # edge/legal only
maestro test .maestro/pre-auth/welcome.yaml         # single flow
```

Screenshots are written under `~/.maestro/tests/<timestamp>/` (Maestro prints the path). Use `maestro studio` to interactively inspect selectors.

---

## Folder taxonomy

```
.maestro/
  config.yaml               # global Maestro config (appId, env defaults)
  subflows/
    deep-link.yaml          # openLink: ${LINK}
    reset-app.yaml          # launchApp with clearState: true
    sign-in-as-rider.yaml   # full OTP sign-in for rider test user
    sign-in-as-driver.yaml  # full OTP sign-in for driver test user
    sign-in-as-family.yaml  # full OTP sign-in for family test user
  pre-auth/                 # unauthenticated screens (welcome, sign-in, OTP)
  onboarding/               # first-run onboarding flow
  rider/                    # rider role: home, booking, ride detail, my rides, profile
  driver/                   # driver role: status toggle, active ride, history
  family/                   # family role: dashboard, linked rider tracking
  edge-and-legal/           # render-check flows (deep-link, assert, screenshot only)
```

### Behavioral flows vs. render-checks

- **Behavioral flows** (`pre-auth/`, `onboarding/`, `rider/`, `driver/`, `family/`) simulate real user interactions — taps, inputs, navigation — and verify the result.
- **Render-check flows** (`edge-and-legal/`) deep-link directly to a screen that has no behavioral trigger (edge states, legal, support, 404), assert one stable visible element, and take a screenshot. They confirm the screen mounts and renders correctly without exercising its actions.

---

## Dev-client (`expo run:ios`): load the bundle first

A dev-client build opens the **expo launcher** (server menu), not the app, and the expo **dev menu** can overlay the UI — both occlude Maestro's view. Before running flows against a dev build, load the Metro bundle and dismiss the dev menu:

```bash
# 1) load the app bundle into the dev client (replace IP:port with your Metro server)
xcrun simctl openurl booted "veterans-first://expo-development-client/?url=http%3A%2F%2F<LAN-IP>%3A8081"
#    → tap "Open" on the confirmation (Maestro: - tapOn: { text: "Open", optional: true })
# 2) dismiss the expo dev menu if it's showing (top-right ✕, or the "Tools" gear toggles it)
```

For unattended/CI runs, prefer a **release or preview build** (`eas build --profile preview` or a Release scheme) — it launches straight into the app so flows run clean with no launcher/dev-menu dance.

---

## Verified log

| Date       | What                                                                                                                                                                                          | Status           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 2026-06-16 | Seed provisioning: Clerk + Supabase test users (rider/driver/family), OTP 424242, fixtures live-verified.                                                                                     | Confirmed        |
| 2026-06-16 | Welcome screen renders Veteran Honor restyle on iPhone 16 Pro (iOS 18.6, dev build): vector Road Ahead logo, "Veterans 1st" wordmark + "Welcome" in Lexend, stone canvas, navy/outlined CTAs. | Confirmed        |
| 2026-06-20 | Edge-and-legal YAML parse clean (8 flows). On-simulator flow runs pending.                                                                                                                    | Pending sim runs |

---

## Notes

- Selectors use visible text (resilient) + `optional: true` where the exact label/route may vary. Add stable `testID`s to key screens for tighter assertions.
- Authenticated flows depend on the Clerk **development** instance having test mode enabled. If your dev instance differs from the seed phones, update the subflow files.
- Android: `npx expo run:android`, then the same `maestro test` commands — Maestro is cross-platform.
