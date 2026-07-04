-- Staff users authenticate via Google/email in the web console and have no
-- phone number. users.phone was UNIQUE NOT NULL (built for phone-auth
-- riders), so the Clerk webhook mapped missing phones to '' — and the
-- UNIQUE index then rejected every email-only user after the first one.
-- Make phone nullable (UNIQUE treats NULLs as distinct) and convert the
-- existing ''-phone rows so they no longer occupy the one allowed slot.

ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;

UPDATE public.users SET phone = NULL WHERE phone = '';
