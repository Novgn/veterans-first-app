# Story 5.1: Create Business Operations Shell

**Status:** done

## Story

As an admin, I want a dedicated business operations section in the web console with a sidebar covering billing, drivers, compliance, and settings, so I can manage the non-ops side of the business from one place.

## Acceptance Criteria

1. **Given** an authenticated admin visits `/business`, **Then** they see a sidebar nav with Dashboard / Billing / Drivers / Compliance / Settings links, mirroring the dispatch console shell.
2. **Given** an authenticated non-admin (rider, driver, dispatcher, family) visits `/business`, **Then** they are redirected away (existing layout already redirects — shell must not weaken this).
3. **Given** the sidebar links point at routes that will land in later Story 5 work, **Then** clicking a link either shows the real screen (when the downstream story is done in this batch) or a clearly-labeled "coming soon" card.
4. **Given** the admin console (`/admin`) is separate from business ops but shares the same nav pattern, **Then** `/admin` gets an equivalent sidebar (Overview / Drivers / Credentials / Users / Configuration) so Story 5 work can split across the two sections without duplicating scaffolding.

## Implementation

- Replace the scaffolded `/business/layout.tsx` and `/admin/layout.tsx` with SectionNav-backed layouts (reusing the existing `SectionNav` component from Story 3.12).
- Add stub pages for the sections that later stories in this batch will fill in (billing, drivers, compliance, settings for business; drivers, credentials, users, configuration for admin). Each stub renders a "coming soon" card until the dedicated story lands.
- `/business` and `/admin` home pages get a real dashboard grid — business shows revenue / outstanding / rides placeholders, admin shows driver / credential / open-alerts placeholders. Real numbers are wired up by Stories 5.10 / 5.11.

## Tests

- Layout redirect behavior is already covered by the existing admin/business layout (Story 3.12). This story is scaffolding only; no new unit tests required.

## Dev Notes

- Safer choice: keeping `/admin` and `/business` physically separate matches the PRD's role split (business is the admin's financial lens, admin is the operational lens) even though both are `role=admin` today. A future `business_admin` role could split them.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
