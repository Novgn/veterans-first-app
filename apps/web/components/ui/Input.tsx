// Input — Veteran Honor design system.
//
// 56px-tall (h-14) text field on a white surface with a perceivable
// border-strong boundary (hairline is too low-contrast for a control edge).
// Labels are ALWAYS visible — never placeholder-only — so this component
// renders an optional <label> above the field and wires it to the input via a
// generated id. Error text sits below the field in plain language (error color).
//
// Shadcn-style: forwardRef to the underlying <input>, `cn()` merge, full
// InputHTMLAttributes passthrough. The global 4px navy focus ring (tokens.css)
// handles focus-visible. Radius is rounded-sm (8px) per the DS input spec.

import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Always-visible field label (DS: never placeholder-only). */
  label?: string;
  /** Plain-language error message rendered below the field. */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, id, type = 'text', ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={inputId} className="text-callout font-semibold text-ink">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          'h-14 w-full rounded-sm border border-border-strong bg-card px-4 text-body text-ink placeholder:text-ink-secondary disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-error',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
});
