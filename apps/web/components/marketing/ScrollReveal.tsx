'use client';

import { useEffect } from 'react';

// Cross-browser scroll reveal for the marketing site.
//
// The original design used the CSS `animation-timeline: view()` API, which only
// animates in Chromium — Safari and Firefox showed no motion at all. This drives
// the same [data-reveal] / [data-reveal-fade] hooks with an IntersectionObserver
// instead: visible in every browser, fires once per element, and is skipped
// entirely when the visitor prefers reduced motion. Renders nothing.
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal],[data-reveal-fade]'),
    );
    if (els.length === 0) return;

    // Opt in to the hidden start state only now that JS is running.
    const root = document.documentElement;
    root.classList.add('reveal-on');

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    // Elements already on-screen at load reveal immediately (no flash, no
    // gratuitous animation); everything below the fold animates as it scrolls in.
    const viewportH = window.innerHeight;
    for (const el of els) {
      if (el.getBoundingClientRect().top < viewportH) {
        el.classList.add('is-revealed');
      } else {
        io.observe(el);
      }
    }

    return () => {
      io.disconnect();
      root.classList.remove('reveal-on');
    };
  }, []);

  return null;
}
