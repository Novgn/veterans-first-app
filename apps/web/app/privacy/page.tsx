import type { Metadata } from 'next';

import { LegalScaffold } from '@/components/marketing/LegalScaffold';

// DRAFT scaffold — noindex until counsel finalizes the copy. Flip robots to
// index and set `draft={false}` on <LegalScaffold> once reviewed.
export const metadata: Metadata = {
  title: 'Privacy Policy — Veterans 1st Transportation',
  description: 'How Veterans 1st Transportation collects, uses, and protects your information.',
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalScaffold title="Privacy Policy" updated="Draft — last updated [DATE]">
      <p>
        This Privacy Policy explains how [LEGAL ENTITY NAME] (&ldquo;Veterans 1st,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses, and shares information about you when
        you visit our website, join our waitlist, or use our transportation services. Because we
        arrange transportation to and from medical and other destinations, some information we
        handle can be sensitive; we treat it accordingly.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Waitlist:</strong> the email address you submit to be notified at launch.
        </li>
        <li>
          <strong>Account &amp; contact:</strong> at launch — name, phone number, email, and
          emergency contact.
        </li>
        <li>
          <strong>Trip information:</strong> pickup and drop-off addresses, scheduled times, and
          ride history.
        </li>
        <li>
          <strong>Accessibility &amp; comfort needs:</strong> mobility aids and assistance
          preferences you choose to provide so we can serve you safely.
        </li>
        <li>
          <strong>Payment:</strong> processed by our payment provider; we do not store full card
          numbers.
        </li>
        <li>
          <strong>Device &amp; usage:</strong> basic technical data needed to operate and secure the
          service. [CONFIRM analytics/cookies once added — this section must list them and any
          consent mechanism.]
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>
        To arrange and provide rides, communicate with you about trips and launch, process payments,
        keep riders and drivers safe, meet legal and regulatory obligations, and improve the
        service.
      </p>

      <h2>How we share information</h2>
      <p>
        With the driver assigned to your trip (only what is needed to complete it safely); with
        service providers who work on our behalf under contract; and when required by law. We do{' '}
        <strong>not</strong> sell your personal information. [CONFIRM: any sharing with healthcare
        partners or payers requires appropriate agreements and disclosure here.]
      </p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>Unsubscribe from marketing email at any time using the link in each message.</li>
        <li>
          Request access to, correction of, or deletion of your information by contacting us below.
        </li>
        <li>[State-specific privacy rights — to be completed for applicable states.]</li>
      </ul>

      <h2>Data retention &amp; security</h2>
      <p>
        We keep information for as long as needed to provide the service and meet legal obligations,
        then delete or de-identify it. We use administrative, technical, and physical safeguards to
        protect it. [CONFIRM retention periods and safeguards with counsel.]
      </p>

      <h2>Children</h2>
      <p>
        The service is not directed to children under 13, and we do not knowingly collect their
        data.
      </p>

      <h2>Changes to this policy</h2>
      <p>We will post any changes here and update the date above.</p>

      <h2>Contact us</h2>
      <p>Questions? Email [PRIVACY CONTACT EMAIL] or write to [POSTAL ADDRESS].</p>
    </LegalScaffold>
  );
}
