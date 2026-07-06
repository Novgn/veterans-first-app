// Site-wide marketing config.
//
// Support phone comes ONLY from NEXT_PUBLIC_SUPPORT_PHONE. There is deliberately
// no hard-coded fallback: an unset env yields `null`, and every consumer hides
// its phone affordance rather than render a fictional number. (A placeholder
// 555 number previously shipped as the default — a fake dialable number in
// front of real users is a trust and deception hazard, so it was removed.) Set
// the real dispatch line per environment before launch.
const rawSupportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
export const SUPPORT_PHONE: string | null =
  rawSupportPhone && rawSupportPhone.length > 0 ? rawSupportPhone : null;

// Derived `tel:` href so raw phone anchors dial the same configured number as
// the display text — a 10-digit US number gets a +1 prefix, anything else is
// assumed already country-coded. `null` when the phone is unconfigured.
function toTelHref(display: string): string {
  const digits = display.replace(/\D/g, '');
  return `tel:${digits.length === 10 ? `+1${digits}` : `+${digits}`}`;
}
export const SUPPORT_PHONE_TEL: string | null = SUPPORT_PHONE ? toTelHref(SUPPORT_PHONE) : null;

// Veterans Crisis Line — official public contacts (do NOT use VA seal/flag
// imagery; 38 CFR 1.9 restricts it). "Dial 988 then Press 1" and text 838255
// are the current official channels. These are constants, not env-driven.
export const VETERANS_CRISIS_LINE = {
  callInstruction: 'Dial 988 then Press 1',
  callHref: 'tel:988',
  textNumber: '838255',
  textHref: 'sms:838255',
  chatUrl: 'https://www.veteranscrisisline.net/get-help-now/chat/',
} as const;

// Production hosts for host-based canonicalization (middleware.ts).
// Consoles live on the admin host; marketing on www. Any other host
// (previews, localhost) is intentionally left untouched, so these are
// plain constants — no env override needed.
export const MARKETING_HOST = 'www.vf1st.com';
export const ADMIN_HOST = 'admin.vf1st.com';
