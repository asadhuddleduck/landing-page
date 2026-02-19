import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Huddle Duck",
  description:
    "Privacy policy for Huddle Duck Ltd. How we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Last updated: February 2025</p>

        <section>
          <h2>1. Who We Are</h2>
          <p>
            Huddle Duck Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is
            a digital advertising company registered in England and Wales. We
            provide AI-powered advertising services for food and beverage
            businesses.
          </p>
          <p>
            <strong>Registered address:</strong> Ventnor Road, Solihull, B92 9BU,
            United Kingdom
          </p>
          <p>
            <strong>Contact:</strong>{" "}
            <a href="mailto:privacy@huddleduck.co.uk">
              privacy@huddleduck.co.uk
            </a>
          </p>
        </section>

        <section>
          <h2>2. What Data We Collect</h2>
          <p>We may collect the following information:</p>
          <ul>
            <li>
              <strong>Contact information:</strong> name, email address, and
              business name when you enquire about or purchase our services.
            </li>
            <li>
              <strong>Payment information:</strong> processed securely via Stripe.
              We do not store your full card details on our servers.
            </li>
            <li>
              <strong>Usage data:</strong> anonymised analytics about how you
              interact with our website, including pages visited, time on site,
              and referring source. This is collected via Vercel Analytics.
            </li>
            <li>
              <strong>Conversation data:</strong> if you use our AI chat on this
              website, the contents of your conversation may be processed to
              provide you with relevant information about our services.
            </li>
            <li>
              <strong>Advertising data:</strong> if you become a client, we
              process data necessary to run advertising campaigns on your behalf,
              including audience targeting parameters and ad performance metrics.
            </li>
            <li>
              <strong>Cookies:</strong> we use essential cookies and, with your
              consent, analytics and advertising cookies. See Section 7 for
              details.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide and manage our advertising services.</li>
            <li>Process payments and manage your account.</li>
            <li>Communicate with you about your campaigns and our services.</li>
            <li>Improve our website and services through anonymised analytics.</li>
            <li>
              Comply with legal obligations, including tax and accounting
              requirements.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Legal Basis for Processing (GDPR)</h2>
          <p>We process your personal data under the following legal bases:</p>
          <ul>
            <li>
              <strong>Contract:</strong> processing necessary to fulfil our
              services to you.
            </li>
            <li>
              <strong>Legitimate interest:</strong> improving our services,
              website analytics, and business communications.
            </li>
            <li>
              <strong>Consent:</strong> where you have given consent, such as for
              marketing communications or non-essential cookies.
            </li>
            <li>
              <strong>Legal obligation:</strong> where processing is required by
              law.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Data Sharing</h2>
          <p>
            We do not sell your personal data to third parties. We may share data
            with:
          </p>
          <ul>
            <li>
              <strong>Stripe:</strong> for secure payment processing.
            </li>
            <li>
              <strong>Advertising platforms:</strong> where necessary to run
              campaigns on your behalf as part of our service. This is done under
              a data processing agreement with the relevant platform.
            </li>
            <li>
              <strong>Service providers:</strong> hosting (Vercel), analytics
              (Vercel Analytics), and other tools essential to delivering our
              services. These providers process data on our behalf under
              appropriate safeguards.
            </li>
            <li>
              <strong>Legal authorities:</strong> if required by law, regulation,
              or legal process.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfil
            the purposes for which it was collected:
          </p>
          <ul>
            <li>
              <strong>Client data:</strong> for the duration of our business
              relationship and up to 6 years afterwards for tax and legal
              compliance.
            </li>
            <li>
              <strong>Website analytics:</strong> anonymised data retained
              indefinitely.
            </li>
            <li>
              <strong>Chat conversations:</strong> retained for up to 12 months
              for service improvement purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>Our website uses the following cookies:</p>
          <ul>
            <li>
              <strong>Essential cookies:</strong> required for the website to
              function (e.g. payment processing).
            </li>
            <li>
              <strong>Analytics cookies:</strong> Vercel Analytics to understand
              website usage patterns. These are privacy-focused and do not track
              individual users across sites.
            </li>
            <li>
              <strong>Advertising cookies:</strong> Meta Pixel for measuring the
              effectiveness of our own advertising. These are only set with your
              consent.
            </li>
          </ul>
          <p>
            You can manage your cookie preferences at any time through your
            browser settings.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>
            Under the UK GDPR, you have the right to:
          </p>
          <ul>
            <li>
              <strong>Access</strong> the personal data we hold about you.
            </li>
            <li>
              <strong>Rectify</strong> inaccurate or incomplete data.
            </li>
            <li>
              <strong>Erase</strong> your personal data in certain circumstances.
            </li>
            <li>
              <strong>Restrict</strong> processing of your data.
            </li>
            <li>
              <strong>Data portability:</strong> receive your data in a
              structured, commonly used format.
            </li>
            <li>
              <strong>Object</strong> to processing based on legitimate interest.
            </li>
            <li>
              <strong>Withdraw consent</strong> at any time where processing is
              based on consent.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please email{" "}
            <a href="mailto:privacy@huddleduck.co.uk">
              privacy@huddleduck.co.uk
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2>9. International Transfers</h2>
          <p>
            Some of our service providers (such as Vercel and Stripe) may process
            data outside the UK. Where this occurs, we ensure appropriate
            safeguards are in place, including Standard Contractual Clauses or
            adequacy decisions, to protect your data in accordance with UK GDPR.
          </p>
        </section>

        <section>
          <h2>10. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to
            protect your personal data against unauthorised access, alteration,
            disclosure, or destruction. This includes encryption in transit
            (HTTPS), secure payment processing via Stripe, and access controls on
            our systems.
          </p>
        </section>

        <section>
          <h2>11. Complaints</h2>
          <p>
            If you are unhappy with how we handle your data, you have the right
            to lodge a complaint with the Information Commissioner&apos;s Office
            (ICO):
          </p>
          <p>
            <a
              href="https://ico.org.uk/make-a-complaint/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ico.org.uk/make-a-complaint
            </a>
          </p>
        </section>

        <section>
          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will
            be posted on this page with an updated revision date. We encourage
            you to review this policy periodically.
          </p>
        </section>

        <div className="privacy-footer">
          <p>
            &copy; {new Date().getFullYear()} Huddle Duck Ltd. All rights
            reserved.
          </p>
          <a href="/" className="privacy-back">
            &larr; Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
