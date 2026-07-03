// Site-wide marketing config. Swap the support number at launch by setting
// NEXT_PUBLIC_SUPPORT_PHONE; the placeholder keeps pre-launch builds working.
export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '(919) 555-0100';

// Derived `tel:` href so raw phone anchors dial the same configured number as
// the display text — a 10-digit US number gets a +1 prefix, anything else is
// assumed already country-coded. For the placeholder this is `tel:+19195550100`.
const digits = SUPPORT_PHONE.replace(/\D/g, '');
export const SUPPORT_PHONE_TEL = `tel:${digits.length === 10 ? `+1${digits}` : `+${digits}`}`;

// Production hosts for host-based canonicalization (middleware.ts).
// Consoles live on the admin host; marketing on www. Any other host
// (previews, localhost) is intentionally left untouched, so these are
// plain constants — no env override needed.
export const MARKETING_HOST = 'www.vf1st.com';
export const ADMIN_HOST = 'admin.vf1st.com';
