import { cookies } from 'next/headers';
import { UserButton } from '@clerk/nextjs';
import type { ReactNode } from 'react';

import { BrandLogo } from '@/components/shared/BrandLogo';
import { ConsoleSidebar } from '@/components/shared/ConsoleSidebar';
import { SectionNav, type SectionNavItem } from '@/components/shared/SectionNav';
import {
  flattenNavItems,
  resolvePageTitle,
  type ConsoleNavGroup,
} from '@/components/shared/console-nav';

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
 *
 * The sidebar itself is collapsible (icon-only ~64px rail vs ~240px
 * expanded). ConsoleShell stays a server component and only reads the
 * `console-sidebar` cookie to know which width to render first — the actual
 * collapsed/expanded state + toggle lives in the client ConsoleSidebar so SSR
 * paints the right width immediately (no hydration flash) while still being
 * interactive. Reading `cookies()` here makes the route dynamic, which the
 * console layouts already are (they call `getCurrentUserWithRole()` for
 * auth), so this doesn't change caching behavior.
 */

export type { ConsoleNavItem, ConsoleNavGroup } from '@/components/shared/console-nav';

export interface ConsoleShellProps {
  /** Small-caps label under the brand mark: ADMIN / DISPATCH / BUSINESS. */
  sectionLabel: string;
  navGroups: ConsoleNavGroup[];
  activePath: string;
  testId: string;
  children: ReactNode;
}

export async function ConsoleShell({
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

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get('console-sidebar')?.value === 'collapsed';

  // ConsoleSidebar is a Client Component, so nav items can't carry the raw
  // `LucideIcon` component reference across the server/client boundary
  // (passing a function/component as a prop to a Client Component isn't
  // serializable). Render each icon element here on the server instead and
  // hand down the resulting ReactNode.
  const sidebarNavGroups = navGroups.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      href: item.href,
      label: item.label,
      icon: <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />,
    })),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-stone sm:flex-row" data-testid={testId}>
      {/* Desktop navy sidebar (sm+) */}
      <ConsoleSidebar
        sectionLabel={sectionLabel}
        navGroups={sidebarNavGroups}
        activePath={activePath}
        initialCollapsed={initialCollapsed}
      />

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
