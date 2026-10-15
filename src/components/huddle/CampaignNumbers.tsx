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
            One fee for all your locations. Billed monthly, plus VAT.
            Daily and hourly figures use a 31-day month.
          </p>
        </div>
      </div>

      <article className={styles.loyalty} aria-labelledby="loyalty-title">
        <div className={styles.exampleLabel}>
          01 / FIVE NEW REGULARS
        </div>
        <h3 id="loyalty-title">
          Five people love your food.
          <br />
          Word gets around.
        </h3>
        <p className={styles.lead}>
          They come back. They bring their mates. Their mates bring family.
          If five new regulars each bring four people, and those people each
          bring two more, here&apos;s where you could end up.
        </p>
        <div
          className={styles.chain}
          aria-label="Five original regulars plus twenty friends plus forty friends of friends makes sixty-five regulars"
        >
          <div>
            <strong>{n.originalRegulars}</strong>
            <span>new regulars</span>
          </div>
          <span className={styles.operator} aria-hidden="true">
            +
          </span>
          <div>
            <strong>{n.friends}</strong>
            <span>friends</span>
          </div>
          <span className={styles.operator} aria-hidden="true">
            +
          </span>
          <div>
            <strong>{n.friendsOfFriends}</strong>
            <span>
              friends of
              <br />
              friends
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
            <strong>{pounds(n.averageOrder)}</strong> spent each visit
          </p>
          <p>
            <strong>{n.visitsPerMonth} visits</strong> per person, per month
          </p>
          <p>
            <strong>{pounds(n.contributionPerVisit)}</strong> left after the
            cost of each order
          </p>
        </div>
        <div className={styles.payback}>
          <div>
            <span>LEFT FROM THEIR ORDERS IN A YEAR</span>
            <strong>{pounds(n.yearlyContribution)}</strong>
          </div>
          <p>
            That could cover <strong>a whole year of our fees.</strong>
            <br />
            <span>
              All starting with five people who loved what you do.
            </span>
          </p>
        </div>
        <p className={styles.contributionNote}>
          Based on the visits and referrals above. Before VAT, ad spend and
          your day-to-day running costs.
        </p>
        <details className={styles.workings}>
          <summary>
            How the maths works <span aria-hidden="true">+</span>
          </summary>
          <div>
            <p>
              Five new regulars join in month one. Each brings four friends
              in month two. Those twenty each bring two more in month three.
              That makes 65 regulars.
            </p>
            <p>
              The first five visit for 12 months, the next twenty for 11 months
              and the final forty for 10 months. At three visits a month, that
              is {n.yearlyVisits.toLocaleString("en-GB")} visits. With £10 left
              after the cost of each order, that leaves{" "}
              {pounds(n.yearlyContribution)}. A year of our fees is{" "}
              {pounds(n.annualFee)}.
            </p>
            <p>
              This needs those people to keep visiting and recommending you.
              What you actually earn depends on how often they return, who
              they bring and how much you make on each order. VAT, ad spend
              and day-to-day running costs are separate.
            </p>
          </div>
        </details>
      </article>

      <article className={styles.franchise} aria-labelledby="franchise-title">
        <div>
          <div className={styles.exampleLabel}>
            02 / ONE NEW FRANCHISEE
          </div>
          <h3 id="franchise-title">
            One franchisee could
            <br />
            <span>cover the whole year.</span>
          </h3>
          <p>
            Looking for franchisees? We can run those campaigns too. If one
            new franchisee brings in {pounds(n.franchiseContribution)} after
            your costs, that one deal covers a year of our fees.
          </p>
        </div>
        <div className={styles.franchiseMath}>
          <span className={styles.one}>1</span>
          <p>completed franchise sale</p>
          <div>
            <strong>{pounds(n.franchiseContribution)}</strong>
            <span>left after your costs</span>
          </div>
          <p className={styles.franchiseNote}>
            It has to be a completed sale. Your franchise fee and costs decide
            what&apos;s left.
          </p>
        </div>
      </article>

      <article className={styles.media} aria-labelledby="media-title">
        <div className={styles.exampleLabel}>
          03 / MAKE YOUR BUDGET GO FURTHER
        </div>
        <div className={styles.mediaHeading}>
          <h3 id="media-title">
            The same £100.
            <br />
            <span>How far could it go?</span>
          </h3>
          <p>
            With local ads, we choose the area, test what gets attention and
            put more of your budget behind what works.
          </p>
        </div>
        <p className={styles.mediaAssumption}>
          Here&apos;s what £100 buys at the rates below. Actual costs vary.
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
          These rates are for the maths, not live quotes or past results.
          Ad views, leaflet deliveries and estimated billboard views count
          different things. They don&apos;t tell you how many people will buy.
          This is the media budget only. Our fee is separate.
        </p>
      </article>
    </section>
  );
}
