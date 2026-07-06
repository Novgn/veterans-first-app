import type { Metadata } from 'next';

import { LegalScaffold } from '@/components/marketing/LegalScaffold';

// DRAFT scaffold — content is substantive and accurate, but the contact
// details, effective date, and known-limitations list need a real audit before
// this is finalized (then set draft={false} and allow indexing).
export const metadata: Metadata = {
  title: 'Accessibility — Veterans 1st Transportation',
  description:
    'Our commitment to accessible transportation and an accessible website (WCAG 2.2 AA).',
  robots: { index: false, follow: false },
};

export default function AccessibilityPage() {
  return (
    <LegalScaffold title="Accessibility statement" updated="Draft — last updated [DATE]">
      <p>
        Veterans 1st Transportation serves veterans, seniors, and people with disabilities.
        Accessibility is central to what we do — both in the rides we provide and on this website.
      </p>

      <h2>Our website</h2>
      <p>
        We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. Measures
        in place include:
      </p>
      <ul>
        <li>Semantic landmarks and a &ldquo;skip to main content&rdquo; link.</li>
        <li>Full keyboard operability with a visible focus indicator on interactive elements.</li>
        <li>Form fields with persistent labels and clearly announced errors.</li>
        <li>Respect for the &ldquo;reduce motion&rdquo; system setting.</li>
        <li>Text and interface colors chosen to meet AA contrast.</li>
      </ul>

      <h2>Getting a ride</h2>
      <p>
        You do not need the app or an account to book — you can call us and a person will arrange
        everything. In keeping with the Americans with Disabilities Act:
      </p>
      <ul>
        <li>Wheelchair-accessible rides are available.</li>
        <li>Drivers assist riders to and from the vehicle.</li>
        <li>Service animals are welcome.</li>
        <li>
          We do not charge extra for wheelchair use or other disability-related accommodations.
        </li>
      </ul>

      <h2>Known limitations</h2>
      <p>
        [PENDING AUDIT — list any known gaps and target remediation dates here after a formal
        accessibility review.]
      </p>

      <h2>Give us feedback</h2>
      <p>
        If you encounter a barrier on this site or with our service, please tell us at
        [ACCESSIBILITY CONTACT EMAIL] or [SUPPORT PHONE]. We aim to respond within [N] business days
        and will work with you to provide the information or service you need.
      </p>
    </LegalScaffold>
  );
}
