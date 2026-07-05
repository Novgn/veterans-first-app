'use client';

/**
 * SectionNav — mobile pill-row nav for the dispatch / admin / business
 * consoles.
 *
 * Story 3.12: Dispatch console shell & navigation.
 * Story 5.x (dashboard shell): the `sm`+ vertical sidebar this component
 * used to render is now ConsoleShell's navy grouped sidebar — SectionNav is
 * composed *inside* ConsoleShell and only renders below the `sm` breakpoint
 * (a horizontally scrollable pill row; small viewports can't afford a
 * persistent sidebar). The active-pill scroll-into-view behavior is
 * unchanged and still lives here so ConsoleShell doesn't duplicate it.
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
      className="flex gap-2 overflow-x-auto border-b border-border-hairline px-4 pb-3 sm:hidden"
      data-testid={testId}
    >
      <ul className="flex gap-2">
        {items.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                ref={isActive ? activeRef : undefined}
                href={item.href}
                className={`flex min-h-12 items-center whitespace-nowrap rounded-md px-4 text-body transition-colors ${
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
