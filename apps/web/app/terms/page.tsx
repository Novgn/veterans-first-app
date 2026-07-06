import type { Metadata } from 'next';

import { LegalScaffold } from '@/components/marketing/LegalScaffold';

// DRAFT scaffold — noindex until counsel finalizes the copy. Liability,
// arbitration, and governing-law sections in particular MUST be drafted/reviewed
// by an attorney before this is published or relied upon.
export const metadata: Metadata = {
  title: 'Terms of Service — Veterans 1st Transportation',
  description: 'The terms that govern your use of Veterans 1st Transportation.',
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <LegalScaffold title="Terms of Service" updated="Draft — last updated [DATE]">
      <p>
        These Terms govern your use of the website and transportation services offered by [LEGAL
        ENTITY NAME] (&ldquo;Veterans 1st,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). By using the
        service you agree to these Terms.
      </p>

      <h2>The service</h2>
      <p>
        Veterans 1st arranges non-emergency, door-to-door transportation. We do <strong>not</strong>{' '}
        provide emergency medical services or medical care. In an emergency, call 911. Veterans in
        crisis can reach the Veterans Crisis Line by dialing 988 then pressing 1.
      </p>

      <h2>Eligibility &amp; accounts</h2>
      <p>
        You must be able to form a binding contract to use the service. Keep your account
        information accurate and your credentials secure; you are responsible for activity under
        your account.
      </p>

      <h2>Booking, pricing &amp; payment</h2>
      <p>
        You will see the price before you confirm a ride. At launch, rides are private-pay and
        charged through our payment provider. [CONFIRM pricing model, taxes, and any future
        Medicaid/VA/insurance billing terms.]
      </p>

      <h2>Cancellations &amp; no-shows</h2>
      <p>[CANCELLATION / NO-SHOW POLICY — fees, windows, and rider protections to be finalized.]</p>

      <h2>Rider conduct &amp; safety</h2>
      <p>
        Riders and drivers must treat one another with respect. We may decline or end service for
        unsafe or abusive behavior. Service animals are welcome, and we do not charge extra for
        disability-related accommodations.
      </p>

      <h2>Accessibility</h2>
      <p>
        We are committed to accessible transportation and to our website meeting WCAG 2.2 AA. See
        our <a href="/accessibility">Accessibility statement</a>.
      </p>

      <h2>Disclaimers &amp; limitation of liability</h2>
      <p>[ATTORNEY-DRAFTED — disclaimers and any limitation of liability go here.]</p>

      <h2>Dispute resolution</h2>
      <p>
        [ATTORNEY-DECISION — whether disputes are resolved by arbitration and whether a class-action
        waiver applies. Do not publish boilerplate here without review.]
      </p>

      <h2>Changes &amp; governing law</h2>
      <p>
        We may update these Terms and will post changes here with a new date. These Terms are
        governed by the laws of [STATE].
      </p>

      <h2>Contact us</h2>
      <p>Questions? Email [SUPPORT/LEGAL EMAIL] or write to [POSTAL ADDRESS].</p>
    </LegalScaffold>
  );
}
