export interface ComingSoonProps {
  title: string;
  story: string;
  description?: string;
}

export function ComingSoon({ title, story, description }: ComingSoonProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">
        {description ?? 'This section is under construction.'}
      </p>
      <p className="mt-2 text-xs text-zinc-500">Lands in {story}.</p>
    </div>
  );
}
