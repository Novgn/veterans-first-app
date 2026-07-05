'use client';

import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { BrandLogo } from '@/components/shared/BrandLogo';
import { cn } from '@/lib/cn';
import { isItemActive } from '@/components/shared/console-nav';

/**
 * ConsoleSidebar — the collapsible chrome inside ConsoleShell's `sm`+ navy
 * sidebar (brand mark, section label + collapse toggle, grouped nav).
 *
 * Owns the collapsed/expanded client state so ConsoleShell itself can stay a
 * server component. `initialCollapsed` comes from the `console-sidebar`
 * cookie (read server-side in ConsoleShell) so the very first paint already
 * has the right width — no expand→collapse flash on reload. Toggling writes
 * that same cookie back so the choice survives both client-side navigation
 * (this component doesn't unmount across sibling /admin/* routes — the
 * layout persists) and full reloads.
 *
 * Three ways to toggle:
 *   • the PanelLeftClose/Open button in the header row (the conventional
 *     top-of-sidebar position users look for), beside the section label;
 *   • ⌘B (mac) / Ctrl+B anywhere on the page, unless focus is in an
 *     input/textarea/select/contentEditable;
 *   • when collapsed, clicking any empty (non-link, non-button) area of the
 *     rail expands it — the rail gets `cursor-pointer` in that state only.
 *
 * Collapsed-rail alignment: every row centers on the rail's vertical axis.
 * Nav links deliberately avoid flex `gap` between icon and label — a gap
 * still occupies its 12px next to the label even once the label animates to
 * `max-width: 0`, which shifted every icon ~6px left of the rail's center.
 * The label carries `ml-3` instead (the margin collapses along with the
 * max-width — same pattern BrandLogo uses for its wordmark). Group breaks
 * show a white/10 hairline while collapsed instead of the vanished headers'
 * ghost whitespace.
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

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

// SSR-safe mac detection for the toggle tooltip's shortcut hint: the server
// snapshot says "not mac" (Ctrl+B) and the client snapshot corrects it right
// after hydration — useSyncExternalStore is the sanctioned way to read a
// browser-only value without a setState-in-effect cascade or hydration
// mismatch warnings.
const emptySubscribe = () => () => {};
function useIsMacPlatform(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
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
  const shortcutHint = useIsMacPlatform() ? '⌘B' : 'Ctrl+B';

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      persistCollapsed(next);
      return next;
    });
  }, []);

  // ⌘B / Ctrl+B toggles the sidebar from anywhere except editable controls.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b') return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      toggleCollapsed();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleCollapsed]);

  // Collapsed rail: a click on any empty (non-interactive) area expands it.
  // Link/button clicks pass through untouched via the closest() guard.
  const expandFromRail = (event: MouseEvent<HTMLElement>) => {
    if (!collapsed) return;
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    setCollapsed(false);
    persistCollapsed(false);
  };

  return (
    <aside
      aria-label="Console sidebar"
      onClick={expandFromRail}
      className={cn(
        'hidden shrink-0 flex-col bg-navy transition-[width] duration-[220ms] ease-in-out sm:sticky sm:top-0 sm:flex sm:h-screen',
        collapsed ? 'cursor-pointer sm:w-16' : 'sm:w-60',
      )}
    >
      <div
        className={cn(
          'flex items-center pb-2 pt-6 transition-[padding] duration-[220ms] ease-in-out',
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
      {/* Section label + collapse toggle share the header's second row: the
          label collapses away exactly like the nav labels, leaving the toggle
          centered on the rail's icon axis. */}
      <div
        className={cn(
          'flex items-center pb-3 transition-[padding] duration-[220ms] ease-in-out',
          collapsed ? 'justify-center px-2' : 'justify-between pl-5 pr-3',
        )}
      >
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap text-caption font-semibold uppercase tracking-widest text-white/50 transition-all duration-150 ease-in-out',
            collapsed
              ? 'max-w-0 -translate-x-2 opacity-0'
              : 'max-w-[140px] translate-x-0 opacity-100',
          )}
        >
          {sectionLabel}
        </span>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls={NAV_ID}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={`${collapsed ? 'Expand' : 'Collapse'} sidebar (${shortcutHint})`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>
      <nav id={NAV_ID} aria-label="Console navigation" className="flex-1 overflow-y-auto px-3 pb-6">
        {navGroups.map((group, groupIndex) => (
          <div
            key={group.label ?? `group-${groupIndex}`}
            className={cn(
              // Collapsed group breaks read as a subtle hairline rather than
              // the ghost whitespace the vanished headers used to leave.
              groupIndex > 0 && 'border-t transition-all duration-[220ms] ease-in-out',
              groupIndex > 0 &&
                (collapsed ? 'mt-3 border-white/10 pt-3' : 'mt-6 border-transparent'),
            )}
          >
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
                        // No flex gap between icon and label: the gap keeps
                        // its 12px beside the label even at max-w-0, pushing
                        // the icon ~6px off the rail's center. The label's
                        // ml-3 collapses with it instead. Collapsed, the link
                        // reads as a centered 40x44 rounded tile.
                        'flex min-h-11 items-center rounded-md text-body transition-[padding] duration-[220ms] ease-in-out',
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
                            : 'ml-3 max-w-[160px] translate-x-0 opacity-100',
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
    </aside>
  );
}
