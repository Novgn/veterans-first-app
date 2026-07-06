'use client';

// WaitlistForm — the "Be first to ride" launch-notify capture (marketing).
//
// One email field + submit, posting to /api/waitlist. On success the form is
// replaced by a calm confirmation chip (mirrors the PricingFamily success
// pattern). Includes a visually-hidden honeypot field for basic bot defense.
// Labels are always visible (DS Input); the button never traps focus while
// submitting.

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot — stays empty for humans
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, source: 'marketing-get-the-app' }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-lg border border-success bg-stone p-4"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="text-body text-ink">
          You&rsquo;re on the list. We&rsquo;ll email you the day we launch.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Honeypot: off-screen, not announced, not tabbable. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company-website">Company website</label>
        <input
          id="company-website"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={status === 'error' ? (error ?? undefined) : undefined}
          className="sm:min-w-[260px]"
        />
        <Button
          type="submit"
          size="lg"
          disabled={status === 'submitting'}
          className="w-full shrink-0 sm:w-auto"
        >
          {status === 'submitting' ? 'Joining…' : 'Notify me at launch'}
        </Button>
      </div>
      <p className="mt-2.5 text-caption text-ink-secondary">
        We&rsquo;ll only email you about the launch. No spam. See our{' '}
        <a href="/privacy" className="font-medium text-navy underline hover:text-navy-700">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
