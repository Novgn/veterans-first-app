export interface ComingSoonProps {
  title: string;
  story: string;
  description?: string;
}

// Veteran Honor empty state: stone canvas inside a hairline-dashed card,
// generous padding, ink title with ink-secondary supporting copy. Calm and
// matter-of-fact — no urgency, no clinical tone.
export function ComingSoon({ title, story, description }: ComingSoonProps) {
  return (
    <div className="rounded-lg border border-dashed border-border-hairline bg-stone p-8 text-center">
      <h2 className="text-title-2 font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-body text-ink-secondary">
        {description ?? 'This section is under construction.'}
      </p>
      <p className="mt-2 text-caption text-ink-secondary">Lands in {story}.</p>
    </div>
  );
}
