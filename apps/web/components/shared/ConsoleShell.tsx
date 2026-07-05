import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { BrandLogo } from '@/components/shared/BrandLogo';
import { SectionNav, type SectionNavItem } from '@/components/shared/SectionNav';
import { cn } from '@/lib/cn';

/**
 * ConsoleShell — the shared dashboard-app chrome for /admin, /dispatch, and
 * /business (dashboard-shell pivot, per Mobbin references: Squarespace admin's
 * slim full-height sidebar + KPI cards, Whop's grouped nav w/ icons + topbar
 * search/avatar, Grok's sectioned sidebar groups).
 *
 * Desktop (`sm`+): fixed-width navy sidebar (brand mark, section label,
 * icon'd nav groups) down the left; a slim white topbar (page title derived
 * from the active nav item + Clerk UserButton) across the top of the content
 * column.
 *
 * Mobile (<`sm`): sidebar is hidden entirely; the topbar shows the brand mark
 * (there's no sidebar to carry it) + UserButton; SectionNav's horizontal pill
 * row renders directly below it — same component/behavior PR #44 verified
 * has no page-level horizontal scroll at 390px, just composed here instead of
 * duplicated per-console.
 */

export interface ConsoleNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ConsoleNavGroup {
  /** Small-caps group header. Omit for the top, ungrouped item(s) (e.g. Overview). */
  label?: string;
  items: ConsoleNavItem[];
}

export interface ConsoleShellProps {
  /** Small-caps label under the brand mark: ADMIN / DISPATCH / BUSINESS. */
  sectionLabel: string;
  navGroups: ConsoleNavGroup[];
  activePath: string;
  testId: string;
  children: ReactNode;
}

function flattenNavItems(navGroups: ConsoleNavGroup[]): ConsoleNavItem[] {
  return navGroups.flatMap((group) => group.items);
}

function isItemActive(item: { href: string }, activePath: string): boolean {
  return activePath === item.href || activePath.startsWith(`${item.href}/`);
}

// Most-specific (longest href) match wins, so e.g. `/admin/drivers/123` shows
// "Drivers" as the page title rather than falling back to the first item
// ("Overview") whose `/admin` prefix also matches.
function resolvePageTitle(items: ConsoleNavItem[], activePath: string, fallback: string): string {
  const matches = items.filter((item) => isItemActive(item, activePath));
  if (matches.length === 0) return fallback;
  return [...matches].sort((a, b) => b.href.length - a.href.length)[0]!.label;
}

export function ConsoleShell({
  sectionLabel,
  navGroups,
  activePath,
  testId,
  children,
}: ConsoleShellProps) {
  const flatItems = flattenNavItems(navGroups);
  const mobileNavItems: SectionNavItem[] = flatItems.map((item) => ({
    href: item.href,
    label: item.label,
  }));
  const pageTitle = resolvePageTitle(flatItems, activePath, sectionLabel);

  return (
    <div className="flex min-h-screen flex-col bg-stone sm:flex-row" data-testid={testId}>
      {/* Desktop navy sidebar (sm+) */}
      <aside
        aria-label="Console sidebar"
        className="hidden shrink-0 flex-col bg-navy sm:sticky sm:top-0 sm:flex sm:h-screen sm:w-60"
      >
        <div className="px-5 pb-4 pt-6">
          <BrandLogo variant="reversed" size={32} />
        </div>
        <div className="px-5 pb-4">
          <span className="text-caption font-semibold uppercase tracking-widest text-white/50">
            {sectionLabel}
          </span>
        </div>
        <nav aria-label="Console navigation" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {navGroups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`}>
              {group.label ? (
                <div className="mb-2 px-3 text-caption font-semibold uppercase tracking-widest text-white/40">
                  {group.label}
                </div>
              ) : null}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = isItemActive(item, activePath);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex min-h-11 items-center gap-3 rounded-md px-3 text-body transition-colors',
                          isActive
                            ? 'bg-white/10 font-semibold text-white'
                            : 'text-white/70 hover:bg-white/5 hover:text-white',
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border-hairline bg-white px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile: brand mark carries the identity the sidebar would. */}
            <span className="sm:hidden">
              <BrandLogo size={28} />
            </span>
            {/* Desktop: sidebar already carries the brand mark, so the
                topbar's left slot is the active page's title instead. */}
            <h1 className="hidden text-title-3 font-semibold text-ink sm:block">{pageTitle}</h1>
          </div>
          {/* Sign-out redirect is configured once on <ClerkProvider afterSignOutUrl>
              in the root layout (this Clerk major dropped the per-component
              prop in favor of that global option). */}
          <UserButton />
        </header>

        {/* Mobile pill-row nav (SectionNav renders nothing at sm+) */}
        <SectionNav items={mobileNavItems} activePath={activePath} testId={`${testId}-mobile`} />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
