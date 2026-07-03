// HowItWorks — "Booking a ride takes three taps" (or one phone call).
//
// Three numbered step cards on the stone canvas. Each card scroll-reveals
// (fade) and lifts gently on hover. Numbered chips use navy-100 / navy.

import { Card } from '@/components/ui/Card';

const STEPS = [
  {
    n: '1',
    title: 'Tell us where',
    body: 'Pick from your saved places: home, your clinic, the grocery store. Or tell us a new one.',
  },
  {
    n: '2',
    title: 'We send your driver',
    body: 'Someone you know by name, not a stranger from a lottery. We match the right vehicle to your needs.',
  },
  {
    n: '3',
    title: 'Arrive with care',
    body: 'Door-to-door help, every time. Your family can be notified the moment you arrive safely.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-stone" aria-labelledby="how-heading">
      <div className="mx-auto max-w-6xl px-6 py-18 md:px-8 md:py-20">
        <div data-reveal className="mx-auto mb-12 max-w-2xl text-center">
          <h2 id="how-heading" className="text-[36px] font-bold leading-tight text-ink">
            Booking a ride takes three taps
          </h2>
          <p className="mt-3.5 text-[19px] leading-relaxed text-ink-secondary">
            Or one phone call. Whatever&rsquo;s easiest for you.
          </p>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n}>
              <Card
                data-reveal-fade
                className="h-full p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-raised"
              >
                <span
                  aria-hidden="true"
                  className="flex h-13 w-13 items-center justify-center rounded-[14px] bg-navy-100 text-[22px] font-bold text-navy"
                >
                  {step.n}
                </span>
                <h3 className="mt-5 text-[23px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2.5 text-[17px] leading-relaxed text-ink-secondary">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
