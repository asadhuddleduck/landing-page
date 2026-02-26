import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Huddle Duck",
  description:
    "Privacy policy for Huddle Duck Ltd. How we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <div className="privacy-content">
        <h1>Privacy Policy</h1>
        <p className="privacy-subtitle">
          <strong>Huddle Duck Ltd</strong>
        </p>
        <p className="privacy-updated">Last updated: 19 February 2026</p>
        <p>
          <strong>URL:</strong>{" "}
          <a href="https://huddleduck.co.uk/privacy">
            https://huddleduck.co.uk/privacy
          </a>
        </p>

        <hr />

        <section>
          <h2>1. Who We Are</h2>
          <p>
            Huddle Duck Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is
            a company registered in England and Wales.
          </p>
          <p>
            <strong>Registered address:</strong> Huddle Duck Ltd, Ventnor Road,
            Solihull, B92 9BU, United Kingdom
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:privacy@huddleduck.co.uk">privacy@huddleduck.co.uk</a>
          </p>
          <p>
            <strong>Data Controller:</strong> Asad Shah, Founder
          </p>
          <p>
            We are an AI-powered advertising tool built for multi-location
            food and beverage brands. We build and manage advertising campaigns
            using Meta platforms (Facebook and Instagram), automated messaging
            tools, and related technologies.
          </p>
          <p>
            This privacy policy explains how we collect, use, store, share, and
            protect personal data in accordance with the UK General Data
            Protection Regulation (UK GDPR), the Data Protection Act 2018, and
            the Meta Platform Terms.
          </p>
        </section>

        <hr />

        <section>
          <h2>2. What Data We Collect</h2>
          <p>
            We may collect and process the following categories of personal data:
          </p>

          <h3>2.1 Prospective Clients and Leads</h3>
          <ul>
            <li>
              <strong>Contact details:</strong> name, email address, phone number
            </li>
            <li>
              <strong>Business details:</strong> company name, job title, brand
              name, number of locations
            </li>
            <li>
              <strong>Booking information:</strong> date, time, and details
              submitted via our scheduling forms (Calendly)
            </li>
            <li>
              <strong>Form submissions:</strong> information you provide through
              enquiry or campaign request forms (Tally)
            </li>
            <li>
              <strong>Communication records:</strong> emails, call notes, and
              meeting transcripts
            </li>
          </ul>

          <h3>2.2 Clients</h3>
          <ul>
            <li>
              <strong>Account and billing information:</strong> company name,
              address, payment details (processed securely via Stripe)
            </li>
            <li>
              <strong>Campaign data:</strong> brand assets, ad copy, creative
              materials, target audience details, performance metrics
            </li>
            <li>
              <strong>Dashboard access data:</strong> login credentials and usage
              activity
            </li>
            <li>
              <strong>Communication records:</strong> emails, messages, meeting
              notes, and call recordings
            </li>
          </ul>

          <h3>2.3 End Users (Customers of Our Clients)</h3>
          <p>
            When running campaigns on behalf of clients, we may process:
          </p>
          <ul>
            <li>
              <strong>Engagement data:</strong> ad interactions, click-throughs,
              form submissions
            </li>
            <li>
              <strong>Direct message data:</strong> Instagram DM conversations
              handled through ManyChat automation flows
            </li>
            <li>
              <strong>Lead information:</strong> name, email, phone number, and
              responses submitted through ad lead forms or landing pages
            </li>
          </ul>
          <p>
            <em>
              In these cases, our client is typically the data controller and
              Huddle Duck acts as a data processor.
            </em>
          </p>

          <h3>2.4 Data Received from Meta Platforms</h3>
          <p>
            Through our use of the Meta Platform APIs (including the Facebook
            Marketing API, Instagram API, and related services), we may receive
            and process:
          </p>
          <ul>
            <li>
              <strong>Ad account data:</strong> campaign performance metrics, ad
              spend, impressions, reach, clicks, conversions, and cost data
            </li>
            <li>
              <strong>Page and profile data:</strong> Facebook Page insights,
              Instagram business profile information, follower counts, and
              engagement metrics
            </li>
            <li>
              <strong>Lead data:</strong> information submitted by users through
              Meta Lead Ads forms, including name, email address, phone number,
              and custom question responses
            </li>
            <li>
              <strong>Messaging data:</strong> Instagram Direct Message
              conversations initiated through ad interactions, processed via
              authorised automation tools (ManyChat)
            </li>
            <li>
              <strong>Audience data:</strong> custom audience parameters,
              lookalike audience configurations, and targeting criteria (we do
              not receive or store individual user profiles from Meta)
            </li>
            <li>
              <strong>Creative performance data:</strong> ad-level metrics
              showing which creative assets perform best
            </li>
            <li>
              <strong>Conversion data:</strong> event data from Meta Pixel and
              Conversions API tracking user actions on client websites (e.g. page
              views, form submissions, purchases)
            </li>
          </ul>
          <p>
            We access this data solely to manage, optimise, and report on
            advertising campaigns for our clients. We do not sell, license, or
            otherwise commercialise any data received from Meta.
          </p>

          <h3>2.5 Website Visitors</h3>
          <ul>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device
              information
            </li>
            <li>
              <strong>Usage data:</strong> pages visited, time on site, referral
              source
            </li>
            <li>
              <strong>Cookie data:</strong> see Section 9 below
            </li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>3. How We Use Your Data</h2>
          <p>
            We process personal data for the following purposes:
          </p>

          <div className="privacy-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Lawful Basis (UK GDPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Responding to enquiries and booking calls</td>
                  <td>Legitimate interest</td>
                </tr>
                <tr>
                  <td>Delivering our advertising services to clients</td>
                  <td>Performance of a contract</td>
                </tr>
                <tr>
                  <td>Processing payments</td>
                  <td>Performance of a contract</td>
                </tr>
                <tr>
                  <td>
                    Managing and optimising Meta ad campaigns on behalf of
                    clients
                  </td>
                  <td>Performance of a contract / Legitimate interest</td>
                </tr>
                <tr>
                  <td>
                    Processing lead data received through Meta Lead Ads
                  </td>
                  <td>
                    Legitimate interest / Consent (obtained by client via lead
                    form)
                  </td>
                </tr>
                <tr>
                  <td>
                    Processing Instagram DM conversations via ManyChat on behalf
                    of clients
                  </td>
                  <td>Legitimate interest / Contract</td>
                </tr>
                <tr>
                  <td>
                    Generating campaign performance reports and dashboards
                  </td>
                  <td>Performance of a contract</td>
                </tr>
                <tr>
                  <td>
                    Sending marketing emails (e.g. newsletters, offers)
                  </td>
                  <td>Consent</td>
                </tr>
                <tr>
                  <td>Improving our services and internal analytics</td>
                  <td>Legitimate interest</td>
                </tr>
                <tr>
                  <td>Complying with legal or regulatory obligations</td>
                  <td>Legal obligation</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>3.1 How We Use Meta Platform Data Specifically</h3>
          <p>
            Data received from Meta Platform APIs is used exclusively to:
          </p>
          <ul>
            <li>
              Create, manage, and optimise advertising campaigns on Facebook and
              Instagram
            </li>
            <li>
              Monitor campaign performance and generate reports for our clients
            </li>
            <li>
              Process and deliver leads generated through Meta Lead Ads to our
              clients
            </li>
            <li>
              Manage automated Instagram DM flows on behalf of our clients
            </li>
            <li>
              Build and manage custom and lookalike audiences for campaign
              targeting
            </li>
            <li>
              Track conversions and attribute results to specific campaigns
            </li>
          </ul>
          <p>
            We do <strong>not</strong> use Meta Platform data to:
          </p>
          <ul>
            <li>
              Sell, rent, lease, or otherwise transfer data to third parties
            </li>
            <li>
              Build independent user profiles or databases unrelated to our
              advertising services
            </li>
            <li>Conduct surveillance or monitoring of individuals</li>
            <li>
              Discriminate against individuals based on protected characteristics
            </li>
            <li>
              Contact individuals directly for our own marketing purposes
            </li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>4. Who We Share Data With</h2>
          <p>
            We do not sell your personal data. We may share data with the
            following categories of third parties, solely for the purposes
            described above:
          </p>
          <ul>
            <li>
              <strong>Meta Platforms (Facebook/Instagram):</strong> campaign
              delivery, ad management, and API integrations
            </li>
            <li>
              <strong>ManyChat:</strong> automated direct message flows on behalf
              of clients
            </li>
            <li>
              <strong>Stripe:</strong> secure payment processing
            </li>
            <li>
              <strong>Calendly:</strong> meeting scheduling
            </li>
            <li>
              <strong>Tally:</strong> form collection
            </li>
            <li>
              <strong>Google (Analytics, Meet):</strong> website analytics and
              video calls
            </li>
            <li>
              <strong>Notion:</strong> internal project and client management
            </li>
            <li>
              <strong>Xero:</strong> invoicing and accounting
            </li>
            <li>
              <strong>Email service providers:</strong> marketing communications
            </li>
            <li>
              <strong>Professional advisers:</strong> accountants, legal counsel
              (where required)
            </li>
          </ul>
          <p>
            All third-party processors are required to handle data in accordance
            with UK GDPR. Where data is transferred outside the UK, appropriate
            safeguards (such as Standard Contractual Clauses) are in place.
          </p>
          <p>
            We do not share Meta Platform data with any parties other than the
            specific client on whose behalf the data was collected, and the
            sub-processors listed above that are strictly necessary to deliver
            our services.
          </p>
        </section>

        <hr />

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain personal data only for as long as necessary to fulfil the
            purposes for which it was collected:
          </p>
          <ul>
            <li>
              <strong>Client data:</strong> retained for the duration of our
              contract plus 6 years (to meet legal and accounting obligations)
            </li>
            <li>
              <strong>Lead and enquiry data:</strong> retained for up to 2 years
              from last contact, then deleted unless you become a client
            </li>
            <li>
              <strong>Meta Platform data:</strong> retained only for the duration
              of our active service agreement with the relevant client. Upon
              termination of a client contract, all Meta Platform data associated
              with that client is deleted within 90 days unless retention is
              required by law.
            </li>
            <li>
              <strong>Campaign and end-user data:</strong> retained in line with
              our client&apos;s instructions and applicable data processing
              agreement
            </li>
            <li>
              <strong>Marketing data:</strong> retained until you unsubscribe or
              withdraw consent
            </li>
            <li>
              <strong>Website analytics data:</strong> retained for up to 26
              months
            </li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>6. Your Rights</h2>
          <p>Under the UK GDPR, you have the following rights:</p>
          <ul>
            <li>
              <strong>Access:</strong> request a copy of the personal data we
              hold about you
            </li>
            <li>
              <strong>Rectification:</strong> request correction of inaccurate or
              incomplete data
            </li>
            <li>
              <strong>Erasure:</strong> request deletion of your data
              (&quot;right to be forgotten&quot;)
            </li>
            <li>
              <strong>Restriction:</strong> request that we limit how we use your
              data
            </li>
            <li>
              <strong>Portability:</strong> request your data in a structured,
              machine-readable format
            </li>
            <li>
              <strong>Objection:</strong> object to processing based on
              legitimate interest, including direct marketing
            </li>
            <li>
              <strong>Withdraw consent:</strong> where processing is based on
              consent, you can withdraw it at any time
            </li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:privacy@huddleduck.co.uk">
              <strong>privacy@huddleduck.co.uk</strong>
            </a>
            . We will respond within one month.
          </p>
          <p>
            If you are not satisfied with how we handle your request, you have
            the right to lodge a complaint with the{" "}
            <strong>Information Commissioner&apos;s Office (ICO)</strong>:
          </p>
          <ul>
            <li>
              Website:{" "}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
              >
                ico.org.uk
              </a>
            </li>
            <li>Phone: 0303 123 1113</li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>7. Data Deletion</h2>
          <p>
            You may request deletion of your personal data at any time. Here is
            how:
          </p>

          <h3>7.1 How to Request Data Deletion</h3>
          <ol>
            <li>
              Send an email to{" "}
              <a href="mailto:privacy@huddleduck.co.uk">
                <strong>privacy@huddleduck.co.uk</strong>
              </a>{" "}
              with the subject line: <strong>&quot;Data Deletion Request&quot;</strong>
            </li>
            <li>
              In the body of the email, include:
              <ul>
                <li>Your full name</li>
                <li>
                  Your email address (the one associated with the data you want
                  deleted)
                </li>
                <li>
                  The name of the business or brand you are associated with (if
                  applicable)
                </li>
                <li>A description of what data you would like deleted</li>
              </ul>
            </li>
            <li>
              We will acknowledge your request within{" "}
              <strong>5 business days</strong>
            </li>
            <li>
              We will complete the deletion within <strong>30 days</strong> of
              receiving your request
            </li>
            <li>
              We will send you a confirmation email once deletion is complete
            </li>
          </ol>

          <h3>7.2 Data Deletion for Meta Platform Users</h3>
          <p>
            If you have interacted with one of our advertising campaigns on
            Facebook or Instagram (for example, by submitting a lead form,
            engaging with a direct message flow, or clicking on an ad), you can
            request deletion of any data we hold about you by following the steps
            in Section 7.1 above.
          </p>
          <p>
            If you wish to manage or revoke permissions granted to our
            application via your Facebook or Instagram account, you can do so
            directly through your Meta account settings:
          </p>
          <ol>
            <li>
              Go to <strong>Settings &amp; Privacy</strong> on Facebook
            </li>
            <li>
              Select <strong>Settings</strong>, then{" "}
              <strong>Apps and Websites</strong>
            </li>
            <li>
              Find our application and click <strong>Remove</strong>
            </li>
            <li>
              Select <strong>Delete</strong> to request deletion of data the app
              may have received
            </li>
          </ol>
          <p>
            Upon receiving a deletion request (whether directly from you or via
            Meta&apos;s data deletion callback), we will:
          </p>
          <ul>
            <li>
              Delete all personal data associated with you from our systems
            </li>
            <li>
              Confirm deletion to you via email (if contact details are
              available)
            </li>
            <li>
              Notify any sub-processors who may hold your data to delete it
            </li>
          </ul>

          <h3>7.3 Exceptions</h3>
          <p>
            We may retain certain data where required by law (for example,
            financial transaction records required for tax purposes). In such
            cases, we will inform you of the specific data retained and the legal
            basis for retention.
          </p>
        </section>

        <hr />

        <section>
          <h2>8. Data Security</h2>
          <p>
            We take appropriate technical and organisational measures to protect
            personal data, including:
          </p>
          <ul>
            <li>Encrypted data transmission (SSL/TLS)</li>
            <li>Secure, access-controlled cloud storage</li>
            <li>Limited access on a need-to-know basis within the team</li>
            <li>
              Regular review of third-party processor security practices
            </li>
            <li>
              Strong password policies and two-factor authentication where
              available
            </li>
            <li>Secure handling of API credentials and access tokens</li>
            <li>Regular audits of data access and processing activities</li>
          </ul>
          <p>
            In the event of a personal data breach, we will notify the ICO
            within 72 hours where required by law and inform affected individuals
            without undue delay.
          </p>
        </section>

        <hr />

        <section>
          <h2>9. Cookies</h2>
          <p>
            Our website may use cookies and similar technologies to improve your
            browsing experience and analyse site usage. Types of cookies we may
            use:
          </p>
          <ul>
            <li>
              <strong>Essential cookies:</strong> required for the site to
              function
            </li>
            <li>
              <strong>Analytics cookies:</strong> help us understand how visitors
              use the site (e.g. Google Analytics)
            </li>
            <li>
              <strong>Marketing cookies:</strong> used to deliver relevant
              advertising (e.g. Meta Pixel)
            </li>
          </ul>
          <p>
            You can manage cookie preferences through your browser settings.
            Disabling certain cookies may affect site functionality.
          </p>
        </section>

        <hr />

        <section>
          <h2>10. Data Processing on Behalf of Clients</h2>
          <p>
            When we run advertising campaigns, manage Instagram DM flows, or
            process lead data on behalf of our clients, we act as a{" "}
            <strong>data processor</strong>. In these cases:
          </p>
          <ul>
            <li>
              The client is the <strong>data controller</strong> and determines
              the purpose and means of processing
            </li>
            <li>
              We process data only in accordance with the client&apos;s
              instructions and our data processing agreement
            </li>
            <li>
              We implement appropriate technical and organisational security
              measures
            </li>
            <li>
              We do not engage additional sub-processors without the
              client&apos;s prior authorisation
            </li>
            <li>
              We assist the client in responding to data subject requests
            </li>
            <li>
              We delete or return all personal data at the end of the service
              agreement, at the client&apos;s choice
            </li>
            <li>
              End users should refer to the relevant client&apos;s own privacy
              policy for details on how their data is handled
            </li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>11. Meta Platform Terms Compliance</h2>
          <p>
            Our use of Meta Platform data is governed by the{" "}
            <a
              href="https://developers.facebook.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta Platform Terms
            </a>{" "}
            and the{" "}
            <a
              href="https://developers.facebook.com/devpolicy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta Developer Policies
            </a>
            . We are committed to full compliance with these terms, including:
          </p>
          <ul>
            <li>
              Only requesting permissions that are necessary for the services we
              provide
            </li>
            <li>
              Using Meta Platform data solely for the purposes described in this
              privacy policy
            </li>
            <li>
              Not selling, licensing, or otherwise transferring Meta Platform
              data to data brokers, information brokers, or any other third
              parties
            </li>
            <li>Not using Meta Platform data to conduct surveillance</li>
            <li>
              Not using Meta Platform data to discriminate against individuals
            </li>
            <li>
              Promptly deleting Meta Platform data upon user request or upon
              revocation of access
            </li>
            <li>
              Maintaining appropriate data security measures to protect Meta
              Platform data
            </li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>12. International Transfers</h2>
          <p>
            Some of our third-party service providers are based outside the UK
            (primarily in the United States). Where personal data is transferred
            internationally, we ensure appropriate safeguards are in place, such
            as:
          </p>
          <ul>
            <li>UK International Data Transfer Agreements</li>
            <li>Standard Contractual Clauses approved by the ICO</li>
            <li>Adequacy decisions where applicable</li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>13. Children&apos;s Data</h2>
          <p>
            Our services are not directed at children under the age of 16. We do
            not knowingly collect personal data from children. If you believe we
            have inadvertently collected data from a child, please contact us
            immediately at{" "}
            <a href="mailto:privacy@huddleduck.co.uk">
              <strong>privacy@huddleduck.co.uk</strong>
            </a>{" "}
            and we will delete the data promptly.
          </p>
        </section>

        <hr />

        <section>
          <h2>14. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will
            be posted at{" "}
            <a href="https://huddleduck.co.uk/privacy">
              https://huddleduck.co.uk/privacy
            </a>{" "}
            with an updated &quot;Last updated&quot; date. We encourage you to
            review this policy periodically.
          </p>
        </section>

        <hr />

        <section>
          <h2>15. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, how we handle
            your personal data, or wish to make a data deletion request, contact
            us:
          </p>
          <p>
            <strong>Huddle Duck Ltd</strong>
            <br />
            Ventnor Road, Solihull, B92 9BU, United Kingdom
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:privacy@huddleduck.co.uk">privacy@huddleduck.co.uk</a>
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
