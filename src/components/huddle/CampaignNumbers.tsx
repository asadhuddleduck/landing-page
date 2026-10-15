import { CAMPAIGN_ECONOMICS as n, pounds } from "@/lib/campaign-economics";
import styles from "./CampaignNumbers.module.css";

export default function CampaignNumbers() {
  return (
    <section
      id="the-numbers"
      className={styles.section}
      aria-labelledby="numbers-title"
    >
      <div className={styles.label}>
        <span>05 / THE SIMPLE MATHS</span>
        <span>SMALL STARTS CAN GO A LONG WAY.</span>
      </div>
      <div className={styles.intro}>
        <h2 id="numbers-title">
          Put the fee
          <br />
          <span>in perspective.</span>
        </h2>
        <div className={styles.daily}>
          <span className={styles.about}>ABOUT</span>
          <p>
            <strong>{pounds(n.dailyFee)}</strong>
            <span>a day.</span>
          </p>
          <p className={styles.hourly}>
            Or <strong>£{n.hourlyFee.toFixed(2)}</strong> an hour.
          </p>
          <p className={styles.feeBasis}>
            Rounded over a 31-day month and 24-hour days, excluding VAT. Billed
            monthly. One service fee across all your locations.
          </p>
        </div>
      </div>

      <article className={styles.loyalty} aria-labelledby="loyalty-title">
        <div className={styles.exampleLabel}>
          ILLUSTRATION 01 / THE REGULARS
        </div>
        <h3 id="loyalty-title">
          What if just five new people
          <br />
          became the start of something bigger?
        </h3>
        <p className={styles.lead}>
          They love the food. They come back. They bring someone. When the food
          and the experience give people a reason to recommend you, the first
          visit can be the start of a much longer story.
        </p>
        <div
          className={styles.chain}
          aria-label="Five original regulars plus twenty friends plus forty friends of friends makes sixty-five regulars"
        >
          <div>
            <strong>{n.originalRegulars}</strong>
            <span>
              new regulars
              <br />
              in month one
            </span>
          </div>
          <span className={styles.operator} aria-hidden="true">
            +
          </span>
          <div>
            <strong>{n.friends}</strong>
            <span>
              friends join
              <br />
              in month two
            </span>
          </div>
          <span className={styles.operator} aria-hidden="true">
            +
          </span>
          <div>
            <strong>{n.friendsOfFriends}</strong>
            <span>
              their friends join
              <br />
              in month three
            </span>
          </div>
          <span className={styles.operator} aria-hidden="true">
            =
          </span>
          <div className={styles.total}>
            <strong>{n.totalRegulars}</strong>
            <span>
              local people
              <br />
              who keep coming back
            </span>
          </div>
        </div>
        <div className={styles.assumptions}>
          <p>
            <strong>{pounds(n.averageOrder)}</strong> average sale
          </p>
          <p>
            <strong>{n.visitsPerMonth} visits</strong> per person, per month
          </p>
          <p>
            <strong>{pounds(n.contributionPerVisit)}</strong> left per visit
            after variable costs
          </p>
        </div>
        <div className={styles.payback}>
          <div>
            <span>CONTRIBUTION OVER THE YEAR</span>
            <strong>{pounds(n.yearlyContribution)}</strong>
          </div>
          <p>
            In this illustration, the contribution covers{" "}
            <strong>a whole year of our service fees.</strong>
            <br />
            <span>
              It started with five people. The referrals and repeat visits do
              the rest.
            </span>
          </p>
        </div>
        <p className={styles.contributionNote}>
          Illustrative contribution, excluding VAT. Ad spend and fixed overheads
          are separate. Actual referrals and repeat visits vary.
        </p>
        <details className={styles.workings}>
          <summary>
            See the simple workings <span aria-hidden="true">+</span>
          </summary>
          <div>
            <p>
              The original five each bring four new people. Those twenty each
              bring two more. All 65 are new regulars in this example.
            </p>
            <p>
              The first five visit for 12 months, the next twenty for 11 months
              and the final forty for 10 months. At three visits a month, that
              is {n.yearlyVisits.toLocaleString("en-GB")} visits. With £10 left
              after per-order costs on each visit, the contribution is{" "}
              {pounds(n.yearlyContribution)}. A year of service fees is{" "}
              {pounds(n.annualFee)}.
            </p>
            <p>
              These are assumptions, not a forecast. All figures exclude VAT.
              The example pays back the service fee; your ad spend and fixed
              overheads are separate. Your actual repeat visits, referrals,
              margins and customer timing determine your result.
            </p>
          </div>
        </details>
      </article>

      <article className={styles.franchise} aria-labelledby="franchise-title">
        <div>
          <div className={styles.exampleLabel}>
            ILLUSTRATION 02 / THE BIGGER OPPORTUNITY
          </div>
          <h3 id="franchise-title">
            One franchisee.
            <br />
            <span>Across an entire year.</span>
          </h3>
          <p>
            We can also build campaigns for franchise enquiries. If one
            completed franchise sale leaves your business with{" "}
            {pounds(n.franchiseContribution)} after the other acquisition and
            onboarding costs, that one deal covers a year of our service fees.
          </p>
        </div>
        <div className={styles.franchiseMath}>
          <span className={styles.one}>1</span>
          <p>completed franchise sale</p>
          <div>
            <strong>{pounds(n.franchiseContribution)}</strong>
            <span>illustrative contribution</span>
          </div>
          <p className={styles.franchiseNote}>
            Your own franchise fee and costs decide the maths. An enquiry still
            has to become a signed deal.
          </p>
        </div>
      </article>

      <article className={styles.media} aria-labelledby="media-title">
        <div className={styles.exampleLabel}>
          ILLUSTRATION 03 / MAKE THE MEDIA BUDGET TRAVEL
        </div>
        <div className={styles.mediaHeading}>
          <h3 id="media-title">
            The same £100.
            <br />
            <span>Very different possibilities.</span>
          </h3>
          <p>
            Print, delivery and the location of a billboard all affect what your
            budget buys. Local digital ads let us test the message, choose the
            area and adjust the spend as response data comes in.
          </p>
        </div>
        <p className={styles.mediaAssumption}>
          An illustrative £100 media budget, using the assumed prices below:
        </p>
        <div className={styles.comparisons}>
          {n.mediaExamples.map((item, i) => (
            <div className={styles.comparison} key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>
                  {item.count.toLocaleString("en-GB")}{" "}
                  <small>{item.unit}</small>
                </span>
              </div>
              <div className={styles.barTrack} aria-hidden="true">
                <div
                  className={i === 0 ? styles.digitalBar : styles.otherBar}
                  style={{ width: item.width }}
                />
              </div>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
        <p className={styles.mediaNote}>
          Illustrative prices only, not supplier quotes or measured campaign
          results. Ad impressions, delivered leaflets and estimated billboard
          views are different measures; they are not unique customers. This
          compares media spend only, excluding service fees. Actual costs and
          results vary.
        </p>
      </article>
    </section>
  );
}
