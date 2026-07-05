'use client';

import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';

import { BrandLogo } from '@/components/shared/BrandLogo';
import { cn } from '@/lib/cn';
import { isItemActive } from '@/components/shared/console-nav';

/**
 * ConsoleSidebar — the collapsible chrome inside ConsoleShell's `sm`+ navy
 * sidebar (brand mark, section label, grouped nav, collapse toggle).
 *
 * Owns the collapsed/expanded client state so ConsoleShell itself can stay a
 * server component. `initialCollapsed` comes from the `console-sidebar`
 * cookie (read server-side in ConsoleShell) so the very first paint already
 * has the right width — no expand→collapse flash on reload. Toggling writes
 * that same cookie back so the choice survives both client-side navigation
 * (this component doesn't unmount across sibling /admin/* routes — the
 * layout persists) and full reloads.
 *
 * Animation is CSS-only: the aside's width transitions over ~220ms
 * ease-in-out; labels/group headers/wordmark use a shorter 150ms
 * opacity+translate-x fade (via `overflow-hidden` + `max-width` collapse) so
 * text never overflows the shrinking rail mid-transition. Reduced-motion
 * users get all of this for free from the global
 * `@media (prefers-reduced-motion: reduce)` rule in tokens.css, which forces
 * every transition-duration to ~0 — the same mechanism the marketing pages
 * rely on, so there's no separate motion-reduce class needed here.
 */

const COOKIE_NAME = 'console-sidebar';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const NAV_ID = 'console-sidebar-nav';

function persistCollapsed(collapsed: boolean) {
  // `Secure` when served over https (production); omitted on http localhost
  // where a Secure cookie would be silently dropped.
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${COOKIE_NAME}=${collapsed ? 'collapsed' : 'expanded'}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

/**
 * Client-safe nav shapes: `icon` is a pre-rendered ReactNode (built server-side
 * in ConsoleShell via `<item.icon .../>`) rather than the `LucideIcon`
 * component reference itself — passing a component/function reference as a
 * prop from a Server Component to a Client Component isn't serializable and
 * throws ("Functions cannot be passed directly to Client Components").
 * Rendering the icon element on the server side and handing down the result
 * sidesteps that boundary while keeping the public `ConsoleNavGroup` API
 * (used by the /admin, /dispatch, /business layouts) unchanged.
 */
export interface ConsoleSidebarNavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export interface ConsoleSidebarNavGroup {
  label?: string;
  items: ConsoleSidebarNavItem[];
}

export interface ConsoleSidebarProps {
  sectionLabel: string;
  navGroups: ConsoleSidebarNavGroup[];
  activePath: string;
  initialCollapsed: boolean;
}

export function ConsoleSidebar({
  sectionLabel,
  navGroups,
  activePath,
  initialCollapsed,
}: ConsoleSidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      persistCollapsed(next);
      return next;
    });
  }, []);

  return (
    <aside
      aria-label="Console sidebar"
      className={cn(
        'hidden shrink-0 flex-col bg-navy transition-[width] duration-[220ms] ease-in-out sm:sticky sm:top-0 sm:flex sm:h-screen',
        collapsed ? 'sm:w-16' : 'sm:w-60',
      )}
    >
      <div
        className={cn(
          'flex items-center pb-4 pt-6 transition-[padding] duration-[220ms] ease-in-out',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        {/* Constant mark size in both states: `size` sets SVG width/height
            attributes, which don't transition — varying it per-state made the
            mark pop while everything else eased. 32px fits the collapsed
            rail's 48px content width (64px minus px-2) with room to spare,
            and keeps the expanded lockup exactly as before. */}
        <BrandLogo variant="reversed" size={32} collapsible markOnly={collapsed} />
      </div>
      <div
        className={cn(
          'overflow-hidden px-5 transition-all duration-150 ease-in-out',
          collapsed ? 'max-h-0 pb-0 opacity-0' : 'max-h-6 pb-4 opacity-100',
        )}
      >
        <span className="whitespace-nowrap text-caption font-semibold uppercase tracking-widest text-white/50">
          {sectionLabel}
        </span>
      </div>
      <nav
        id={NAV_ID}
        aria-label="Console navigation"
        className="flex-1 space-y-6 overflow-y-auto px-3 pb-6"
      >
        {navGroups.map((group, groupIndex) => (
          <div key={group.label ?? `group-${groupIndex}`}>
            {group.label ? (
              <div
                className={cn(
                  'overflow-hidden px-3 text-caption font-semibold uppercase tracking-widest text-white/40 transition-all duration-150 ease-in-out',
                  collapsed ? 'max-h-0 opacity-0' : 'mb-2 max-h-6 opacity-100',
                )}
              >
                <span className="whitespace-nowrap">{group.label}</span>
              </div>
            ) : null}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = isItemActive(item, activePath);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-md text-body transition-[padding] duration-[220ms] ease-in-out',
                        collapsed ? 'justify-center px-2' : 'px-3',
                        isActive
                          ? 'bg-white/10 font-semibold text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      {item.icon}
                      <span
                        className={cn(
                          'overflow-hidden whitespace-nowrap transition-all duration-150 ease-in-out',
                          collapsed
                            ? 'max-w-0 -translate-x-2 opacity-0'
                            : 'max-w-[160px] translate-x-0 opacity-100',
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls={NAV_ID}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex min-h-11 w-full items-center gap-3 rounded-md text-body text-white/70 transition-[padding] duration-[220ms] ease-in-out hover:bg-white/5 hover:text-white',
            collapsed ? 'justify-center px-2' : 'px-3',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          <span
            className={cn(
              'overflow-hidden whitespace-nowrap transition-all duration-150 ease-in-out',
              collapsed
                ? 'max-w-0 -translate-x-2 opacity-0'
                : 'max-w-[160px] translate-x-0 opacity-100',
            )}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
