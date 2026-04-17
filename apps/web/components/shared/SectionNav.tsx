/**
 * SectionNav — sidebar nav for the dispatch / admin / business consoles.
 *
 * Story 3.12: Dispatch console shell & navigation.
 * Story 5.x: Admin/business consoles will extend this once their pages exist.
 */

import Link from 'next/link';
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
  return (
    <nav
      aria-label="Section navigation"
      className="w-56 shrink-0 border-r border-zinc-200 pr-4"
      data-testid={testId}
    >
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-[40px] items-center rounded-md px-3 text-sm ${
                  isActive
                    ? 'bg-blue-100 font-semibold text-blue-800'
                    : 'text-zinc-700 hover:bg-zinc-100'
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
