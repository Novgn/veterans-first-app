/**
 * Veteran Honor design tokens — single source of truth.
 *
 * Consumed by apps/mobile (NativeWind / Tailwind 3) via `require()` and mirrored
 * for apps/web (Tailwind 4) in ./tokens.css. Keep the two in sync.
 *
 * Palette posture: a calm warm-stone canvas, one strong action color (navy),
 * one supportive color (sage), and a brass accent used like a medal — NON-TEXT
 * only (brass fails AA as text). Light mode only.
 */

// ---- Core palette (exact handoff values) ----
const palette = {
  navy: "#1F3A5F",
  navy700: "#18304E", // pressed / hover-deepen
  navy100: "#E4E9F0",
  sage: "#4A6B54",
  sage700: "#3C5745",
  sage100: "#E3EAE3",
  brass: "#9A7B3F", // NON-TEXT only (icon / border / badge accent)
  brass100: "#EDE5D3",
  stone: "#F4F1EA",
  white: "#FFFFFF",
  ink: "#1A1813", // body text — 15.7:1 on stone (AAA)
  inkSecondary: "#4F4A41", // secondary text — 7.8:1 on stone (AAA)
  success: "#356046",
  success100: "#DEE9E1",
  warning: "#8A6420",
  warning100: "#EDE3CF",
  error: "#A83A35",
  error100: "#F0DAD8",
  borderStrong: "#6E685E", // ~5:1 — the only valid control boundary
  borderHairline: "#DAD3C6", // 1.3:1 — dividers / decoration ONLY
};

// ---- Full numbered ramps ----
// Existing mobile screens use numbered utilities (bg-primary-100, text-primary-800,
// bg-accent-50, …). These ramps anchor those utilities onto the Veteran Honor
// families so a global re-tokenize re-skins them instead of blanking the element.
const primary = {
  50: "#EAEEF4",
  100: palette.navy100, // #E4E9F0
  200: "#C7D2E0",
  300: "#9DB0C6",
  400: "#5E7B9D",
  500: "#34557D",
  600: "#244A6B",
  700: palette.navy700, // #18304E
  800: "#16293F",
  900: "#101E2E",
  DEFAULT: palette.navy, // #1F3A5F
};
const secondary = {
  50: "#EDF1ED",
  100: palette.sage100, // #E3EAE3
  200: "#C9D6CB",
  300: "#A7BBAB",
  400: "#6E8E77",
  500: "#557E61",
  600: "#415F4A",
  700: palette.sage700, // #3C5745
  800: "#314838",
  900: "#25372B",
  DEFAULT: palette.sage, // #4A6B54
};
const accent = {
  50: "#F6F1E6",
  100: palette.brass100, // #EDE5D3
  200: "#DFD0AE",
  300: "#CBB37E",
  400: "#B2954F",
  500: palette.brass, // #9A7B3F
  600: "#856A36",
  700: "#6B552B",
  800: "#574623",
  900: "#43361B",
  DEFAULT: palette.brass, // #9A7B3F
};

// ---- Tailwind color map (semantic + Veteran Honor named tokens) ----
const colors = {
  primary,
  secondary,
  accent,
  background: palette.stone,
  foreground: palette.ink,
  success: { DEFAULT: palette.success, 100: palette.success100 },
  warning: { DEFAULT: palette.warning, 100: palette.warning100 },
  error: { DEFAULT: palette.error, 100: palette.error100 },
  // Veteran Honor named tokens — prefer these for new DS components.
  navy: { DEFAULT: palette.navy, 100: palette.navy100, 700: palette.navy700 },
  sage: { DEFAULT: palette.sage, 100: palette.sage100, 700: palette.sage700 },
  brass: { DEFAULT: palette.brass, 100: palette.brass100 },
  stone: palette.stone,
  ink: { DEFAULT: palette.ink, secondary: palette.inkSecondary },
  surface: { DEFAULT: palette.stone, raised: palette.white, sunken: palette.stone },
  card: palette.white,
  border: { strong: palette.borderStrong, hairline: palette.borderHairline },
  "border-strong": palette.borderStrong,
  "border-hairline": palette.borderHairline,
};

// ---- Type scale (Lexend, 18px base, 1.6 line-height everywhere) ----
// On mobile, weight is carried by the font FAMILY (fontFamily.* below); the
// fontWeight here is advisory for web parity and harmless to native.
const fontSize = {
  display: ["36px", { lineHeight: "1.6", letterSpacing: "0.01em", fontWeight: "700" }],
  "title-1": ["28px", { lineHeight: "1.6", letterSpacing: "0.01em", fontWeight: "700" }],
  "title-2": ["23px", { lineHeight: "1.6", fontWeight: "600" }],
  "title-3": ["18px", { lineHeight: "1.6", fontWeight: "600" }],
  headline: ["18px", { lineHeight: "1.6", fontWeight: "600" }],
  body: ["18px", { lineHeight: "1.6", fontWeight: "400" }],
  callout: ["16px", { lineHeight: "1.6" }],
  subheadline: ["15px", { lineHeight: "1.6" }],
  footnote: ["14px", { lineHeight: "1.6" }],
  caption: ["14px", { lineHeight: "1.6" }],
  // legacy numeric scale, remapped near the DS scale for migration safety
  sm: ["14px", { lineHeight: "1.6" }],
  base: ["18px", { lineHeight: "1.6" }],
  lg: ["18px", { lineHeight: "1.6", fontWeight: "600" }],
  xl: ["23px", { lineHeight: "1.6", fontWeight: "600" }],
  "2xl": ["28px", { lineHeight: "1.6", fontWeight: "700" }],
  "3xl": ["36px", { lineHeight: "1.6", fontWeight: "700" }],
};

// RN needs a distinct font family per weight (it does not synthesize weight on a
// custom face). @expo-google-fonts/lexend exposes these family names.
const fontFamily = {
  sans: ["Lexend_400Regular", "System", "sans-serif"],
  "sans-medium": ["Lexend_500Medium", "System", "sans-serif"],
  "sans-semibold": ["Lexend_600SemiBold", "System", "sans-serif"],
  "sans-bold": ["Lexend_700Bold", "System", "sans-serif"],
};

const spacing = {
  // 4px base scale extras (Tailwind already has most of these)
  "touch-gap": "8px",
  touch: "48px", // --touch-min
  "touch-lg": "56px", // --touch-cta
  "focus-ring": "4px",
};

const borderRadius = {
  sm: "8px", // inputs
  md: "12px", // default
  lg: "16px", // cards
  full: "9999px", // pills
};

const boxShadow = {
  card: "0 4px 16px rgba(26, 24, 19, 0.08)",
  raised: "0 6px 20px rgba(26, 24, 19, 0.10)",
  overlay: "0 12px 32px rgba(26, 24, 19, 0.14)",
};

const motion = {
  duration: "320ms",
  ease: "cubic-bezier(0.22, 0.61, 0.36, 1)",
};

module.exports = {
  palette,
  colors,
  fontSize,
  fontFamily,
  spacing,
  borderRadius,
  boxShadow,
  motion,
};
