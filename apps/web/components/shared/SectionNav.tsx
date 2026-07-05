'use client';

/**
 * SectionNav — section nav for the dispatch / admin / business consoles.
 *
 * Story 3.12: Dispatch console shell & navigation.
 * Story 5.x: Admin/business consoles will extend this once their pages exist.
 *
 * Responsive: a horizontally scrollable pill row below the `sm` breakpoint
 * (small viewports can't afford a persistent 224px sidebar), and the
 * original vertical sidebar list at `sm` and up.
 */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export interface SectionNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
}

export interface SectionNavProps {
  items: SectionNavItem[];
  activePath: string;
  testId?: string;
}

export function SectionNav({ items, activePath, testId }: SectionNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const active = activeRef.current;
    if (!nav || !active) return;
    // Keep the active pill in view on the mobile horizontal-scroll layout
    // without disturbing page scroll (scoped to the nav's own scrollLeft).
    const target = active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2;
    nav.scrollLeft = Math.max(0, target);
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Section navigation"
      className="-mx-4 flex gap-2 overflow-x-auto border-b border-border-hairline px-4 pb-3 sm:mx-0 sm:w-56 sm:shrink-0 sm:overflow-visible sm:border-b-0 sm:border-r sm:px-0 sm:pb-0 sm:pr-4"
      data-testid={testId}
    >
      <ul className="flex gap-2 sm:block sm:space-y-1">
        {items.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0 sm:shrink">
              <Link
                ref={isActive ? activeRef : undefined}
                href={item.href}
                className={`flex min-h-12 items-center whitespace-nowrap rounded-md px-4 text-body transition-colors sm:px-3 ${
                  isActive ? 'bg-navy font-semibold text-white' : 'text-ink hover:bg-navy-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon ? <span className="mr-2">{item.icon}</span> : null}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
