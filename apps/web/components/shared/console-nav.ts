import type { LucideIcon } from 'lucide-react';

/**
 * Shared nav-item/group types + pure helpers for the console shell.
 *
 * Split out of ConsoleShell.tsx so both the server-rendered shell (which
 * reads the sidebar-collapsed cookie) and the client-side ConsoleSidebar
 * (which owns the collapse toggle) can share the same logic without an
 * import cycle between the two components.
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

export function flattenNavItems(navGroups: ConsoleNavGroup[]): ConsoleNavItem[] {
  return navGroups.flatMap((group) => group.items);
}

export function isItemActive(item: { href: string }, activePath: string): boolean {
  return activePath === item.href || activePath.startsWith(`${item.href}/`);
}

// Most-specific (longest href) match wins, so e.g. `/admin/drivers/123` shows
// "Drivers" as the page title rather than falling back to the first item
// ("Overview") whose `/admin` prefix also matches.
export function resolvePageTitle(
  items: ConsoleNavItem[],
  activePath: string,
  fallback: string,
): string {
  const matches = items.filter((item) => isItemActive(item, activePath));
  if (matches.length === 0) return fallback;
  return [...matches].sort((a, b) => b.href.length - a.href.length)[0]!.label;
}
