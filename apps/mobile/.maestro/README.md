# Maestro UI test harness (mobile)

On-device UI flows for the Veterans 1st mobile app — the mobile counterpart to Playwright on web. They launch the real native build on a simulator and capture screenshots, so the Veteran Honor design-system restyle can be verified visually on iOS/Android.

## Prerequisites

1. **Maestro** — `curl -Ls https://get.maestro.mobile.dev | bash` (needs JDK 11+). Add `~/.maestro/bin` to `PATH`.
2. **A native dev build on a simulator** (the app uses native modules — `react-native-maps`, `react-native-svg`, `clerk-expo` — so Expo Go won't work):
   ```bash
   cd apps/mobile
   xcrun simctl boot "iPhone 16 Pro"     # or any installed simulator
   npx expo run:ios                       # prebuild + pod install + build + install + launch
   ```
   App id: **`com.novagen.veteransfirst`** (from `app.config.ts`). The generated `ios/` is gitignored.

## Run the flows

```bash
export PATH="$PATH:$HOME/.maestro/bin"
cd apps/mobile

maestro test .maestro/smoke-welcome.yaml      # unauthenticated — always runnable
maestro test .maestro/rider-tour.yaml         # authenticated — needs Clerk dev test mode
```

Screenshots are written under `~/.maestro/tests/<timestamp>/` (Maestro prints the path). Use `maestro studio` to interactively inspect selectors.

## Flows

| Flow                 | Auth                   | What it does                                                                                                                                                         |
| -------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smoke-welcome.yaml` | none                   | Launches the app, asserts the brand wordmark, screenshots welcome → sign-in. Proves the app boots + renders the restyle.                                             |
| `rider-tour.yaml`    | Clerk dev test sign-in | **Best-effort.** Signs in via test phone + code `424242`, screenshots rider Home / Booking / My Rides. Adjust `TEST_PHONE` and selectors to your Clerk dev settings. |

## Dev-client (`expo run:ios`): load the bundle first

A dev-client build opens the **expo launcher** (server menu), not the app, and the expo **dev menu** can overlay the UI — both occlude Maestro's view. Before running flows against a dev build, load the Metro bundle and dismiss the dev menu:

```bash
# 1) load the app bundle into the dev client (replace IP:port with your Metro server)
xcrun simctl openurl booted "veterans-first://expo-development-client/?url=http%3A%2F%2F<LAN-IP>%3A8081"
#    → tap "Open" on the confirmation (Maestro: - tapOn: { text: "Open", optional: true })
# 2) dismiss the expo dev menu if it's showing (top-right ✕, or the "Tools" gear toggles it)
```

For unattended/CI runs, prefer a **release or preview build** (`eas build --profile preview` or a Release scheme) — it launches straight into the app, so `maestro test .maestro/smoke-welcome.yaml` runs clean with no launcher/dev-menu dance.

## Verified

`smoke-welcome.yaml` was run on **iPhone 16 Pro (iOS 18.6)** against the `expo run:ios` dev build (2026-06-16): the Welcome screen renders the Veteran Honor restyle on-device — **vector Road Ahead logo** (navy disc / white road / brass star, via react-native-svg), "Veterans 1st" wordmark + "Welcome" in Lexend, stone canvas, navy "Get started" / outlined "I already have an account" / "Call us anytime". This is the mobile counterpart to the web Playwright checks.

## Notes / TODO

- Selectors use visible text (resilient) + `optional: true` where the exact label/route may vary. Add stable `testID`s to key screens for tighter assertions.
- `rider-tour` depends on the Clerk **development** instance having test mode + an allow-listed test phone; if your dev instance differs, update the flow.
- Android: `npx expo run:android` then the same `maestro test` commands (Maestro is cross-platform).
