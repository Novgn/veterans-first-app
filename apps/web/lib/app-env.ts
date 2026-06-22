// Single source of truth for which environment the web app is running in.
//
// Backends (Supabase, Clerk) are shared across environments today; this is the
// seam that lets code branch on environment (banners, analytics tags, prod
// guardrails) and makes a future per-environment backend split a config-only
// change. The value comes from NEXT_PUBLIC_APP_ENV, set per Vercel environment.
export type AppEnv = 'production' | 'staging' | 'development';

const raw = process.env.NEXT_PUBLIC_APP_ENV;

export const APP_ENV: AppEnv = raw === 'production' || raw === 'staging' ? raw : 'development';

export const isProduction = APP_ENV === 'production';
