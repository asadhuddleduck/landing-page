import type { Metadata, Viewport } from "next";
import Image from "next/image";
import ClientLogoBar from "@/components/huddle/ClientLogoBar";
import CampaignNumbers from "@/components/huddle/CampaignNumbers";
import FoundersLetter from "@/components/huddle/FoundersLetter";
import PrimaryAction from "@/components/huddle/PrimaryAction";
import { HUDDLE_START } from "@/lib/huddle-start";
import styles from "./start.module.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://huddleduck.co.uk"),
  title: HUDDLE_START.title,
  description: HUDDLE_START.description,
  alternates: { canonical: HUDDLE_START.canonicalUrl },
  openGraph: {
    title: HUDDLE_START.title,
    description: HUDDLE_START.description,
    url: HUDDLE_START.canonicalUrl,
    siteName: "Huddle Duck",
    type: "website",
    images: [
      {
        url: "/start/opengraph-image",
        width: 1200,
        height: 630,
        alt: HUDDLE_START.headline,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HUDDLE_START.title,
    description: HUDDLE_START.description,
    images: ["/start/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const proof = [
  {
    number: "12,000",
    metric: "followers before the first pizza was served.",
    brand: "Dough Club",
    logo: "/logos/doughclub-new.png",
    detail:
      "A local audience built before opening. The client reported selling out for weeks afterwards.",
  },
  {
    number: "4,000+",
    metric: "people at one new-location launch.",
    brand: "Shakedown",
    logo: "/logos/shakedown.png",
    detail:
      "Pre-launch awareness for the Newcastle opening, as the brand grew from one site to five.",
  },
  {
    number: "676",
    metric: "franchise enquiries through the pipeline.",
    brand: "Chai Green",
    logo: "/logos/chai-green.png",
    detail:
      "A campaign and enquiry flow built around the next stage of the brand's growth.",
  },
];

const deliverables = [
  {
    number: "01",
    title: "A reason to stop scrolling.",
    text: "The offer, audience and angles. The hooks that make the right person pay attention, and a clear reason to act.",
  },
  {
    number: "02",
    title: "Every word. Every frame.",
    text: "What the video looks like. What the voiceover says. The captions, copy and CTA. A proper plan for the whole ad.",
  },
  {
    number: "03",
    title: "The conversation after the click.",
    text: "What someone receives when they comment a keyword or send a DM. The reply, the offer and the next step, thought through together.",
  },
  {
    number: "04",
    title: "Someone to get it out the door.",
    text: "Creative built from your supplied content. Facebook and Instagram campaigns launched, managed and optimised across your locations.",
  },
];

const steps = [
  {
    title: "Set up your Direct Debit.",
    text: "A simple first commitment so we know you're ready to move forward. No payment is taken at this step.",
  },
  {
    title: "Message us. Then let's talk strategy.",
    text: "Tell us you've done it and include your business name. We'll arrange your strategy call and get clear on your offer, audience and goals.",
  },
  {
    title: "We work out the whole campaign.",
    text: "We go away and put together your copywriting and creative documents: hooks, video direction, voiceover, captions, CTA and the follow-up conversation.",
  },
  {
    title: "Bring it to life. Keep improving it.",
    text: "We work through the plan with you, prepare the ads from your supplied content, then launch, manage and optimise the campaigns.",
  },
];

const faqs = [
  {
    question: "Will I be charged when I set up my Direct Debit?",
    answer:
      "No. This step sets up the authorisation only. It shows us you're ready to move forward. Message us afterwards and we'll arrange the strategy call. The amount and timing of any future payment will be confirmed before it is taken.",
  },
  {
    question: "What will we cover on the strategy call?",
    answer:
      "Your goals, your locations, the offer you want to promote, the people you want to reach and the content you already have. We use that brief to build the campaign plan.",
  },
  {
    question: "What exactly is in the campaign plan?",
    answer:
      "The campaign idea, audience, hooks, ad copy, video direction, voiceover scripts, captions and calls to action. Where the campaign uses a comment keyword or DM, we also plan what the person receives and where the conversation goes next.",
  },
  {
    question: "Is advertising spend included?",
    answer:
      "The £1,300 + VAT monthly fee covers Huddle Duck's service. Your advertising budget is separate and paid directly to Meta through your own ad account. We'll discuss the budget around your goals and locations.",
  },
  {
    question: "Do you film new content or manage our social accounts?",
    answer:
      "We build ads from your existing or newly supplied photos and footage, and give you clear creative direction. Fresh filming, day-to-day social posting and Meta account setup or troubleshooting are separate from this service.",
  },
  {
    question: "Can we use this across all our locations?",
    answer:
      "Yes. The monthly service fee covers all your locations. We can work on offers, new openings, franchise enquiries and recruitment, depending on your priorities. Always-on local awareness through SuperPulse is also included.",
  },
  {
    question: "Are we tied into a long contract?",
    answer:
      "No. It's £1,300 + VAT per month, month to month. You can cancel at any time. The service fee is paid monthly in advance, with no minimum tie-in beyond the month paid for.",
  },
];

function SetupNote() {
  return (
    <p className={styles.setupNote}>
      <span aria-hidden="true">↳</span> No payment taken at this step.
    </p>
  );
}

export default function StartPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <a
          href="#"
          aria-label="Huddle Duck, back to top"
          className={styles.wordmark}
        >
          <Image
            src="/brand/huddle/wordmark-white.png"
            alt="Huddle Duck"
            width={174}
            height={42}
            priority
          />
        </a>
        <div className={styles.headerRight}>
          <span>Good food deserves a full house.</span>
          <a href="#how-it-works">
            How we start <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroTop}>
            <span className={styles.eyebrow}>
              <span className={styles.greenDot} /> HUDDLE DUCK AGENCY SERVICE
            </span>
            <span className={styles.heroIndex}>
              STRATEGY. CREATIVE. CAMPAIGNS.
            </span>
          </div>
          <h1 id="hero-title">
            When a branch is quiet,
            <br />
            <span>everyone looks at you.</span>
          </h1>
          <div className={styles.heroBottom}>
            <div className={styles.heroCopy}>
              <p>
                You&apos;ve got content going out. Offers to promote. Another
                opening coming up. But when someone asks what marketing is doing
                to bring people in, you need more than a busy content calendar.
              </p>
              <p className={styles.heroPromise}>
                Give us the brief. We&apos;ll take care of the campaign.
              </p>
            </div>
            <div className={styles.heroAction}>
              <PrimaryAction />
              <SetupNote />
              <a href="#the-work" className={styles.quietLink}>
                See exactly what we do <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className={styles.heroFoot}>
            <span>BUILT FOR RESTAURANT MARKETING TEAMS</span>
            <span>YOUR NEXT CAMPAIGN. TAKEN CARE OF.</span>
          </div>
        </section>

        <section className={styles.trust}>
          <ClientLogoBar />
        </section>

        <section
          className={`${styles.section} ${styles.pressure}`}
          aria-labelledby="pressure-title"
        >
          <div className={styles.sectionLabel}>
            <span>01 / THE PRESSURE</span>
            <span>WE KNOW THE BRIEF BEHIND THE BRIEF.</span>
          </div>
          <div className={styles.pressureGrid}>
            <h2 id="pressure-title">
              The hardest part?
              <br />
              <span>
                It all comes
                <br className={styles.desktopBreak} /> back to you.
              </span>
            </h2>
            <div className={styles.pressureCopy}>
              <p>
                The launch date won&apos;t move. The offer needs to work in
                every location. Your team is already stretched. And you&apos;re
                the one who has to explain where the budget went.
              </p>
              <p>
                So you chase the edit. Rewrite the caption. Wonder if the hook
                is strong enough. And hope the person who comments
                &ldquo;interested&rdquo; actually gets a reply.
              </p>
              <p>
                Then a competitor opens down the road. There&apos;s a queue
                outside. Someone drops their Instagram into the group chat.
              </p>
              <p className={styles.pressurePunch}>
                You don&apos;t need another thing to manage.
                <br />
                You need a campaign you can feel confident putting your name to.
              </p>
            </div>
          </div>
        </section>

        <section
          id="the-work"
          className={`${styles.section} ${styles.work}`}
          aria-labelledby="work-title"
        >
          <div className={styles.sectionLabel}>
            <span>02 / THE WORK</span>
            <span>FROM THE FIRST HOOK TO THE NEXT MESSAGE.</span>
          </div>
          <div className={styles.workHeading}>
            <h2 id="work-title">
              A whole campaign.
              <br />
              <span>With the detail handled.</span>
            </h2>
            <p>
              Huddle Duck is your specialist advertising partner. We plan,
              write, build and manage your campaigns, working alongside your
              marketing team.
            </p>
          </div>
          <div className={styles.workGrid}>
            <div className={styles.deliverables}>
              {deliverables.map((item) => (
                <article key={item.number} className={styles.deliverable}>
                  <span>{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <aside
              className={styles.blueprint}
              aria-label="Illustration of the campaign planning documents"
            >
              <div className={styles.blueprintTop}>
                <span>HUDDLE DUCK / CAMPAIGN PLAN</span>
                <span aria-hidden="true">↗</span>
              </div>
              <h3>
                The offer is
                <br />
                only the <em>start.</em>
              </h3>
              <p className={styles.blueprintIntro}>
                Every part of the campaign. Working together.
              </p>
              <div className={styles.documentRows}>
                {[
                  ["01", "The hook", "Why they stop scrolling."],
                  ["02", "The video", "What they see. What they hear."],
                  ["03", "The copy & CTA", "Why they act. What they do."],
                  ["04", "The follow-up", "What happens when they respond."],
                ].map(([n, title, text]) => (
                  <div key={n}>
                    <span>{n}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                    <span aria-hidden="true">↗</span>
                  </div>
                ))}
              </div>
              <div className={styles.blueprintFoot}>
                <span>YOUR BRIEF. OUR HOMEWORK.</span>
                <Image src="/duck-logo.png" alt="" width={36} height={36} />
              </div>
            </aside>
          </div>
          <div className={styles.awareness}>
            <span className={styles.plus}>+</span>
            <p>
              <strong>Keep showing up between campaigns.</strong> SuperPulse
              local awareness is included, keeping your brand in front of people
              around your locations.
            </p>
            <span className={styles.includedLabel}>INCLUDED</span>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.proof}`}
          aria-labelledby="proof-title"
        >
          <div className={styles.sectionLabel}>
            <span>03 / THE PROOF</span>
            <span>REAL BRANDS. SPECIFIC OUTCOMES.</span>
          </div>
          <div className={styles.proofHeading}>
            <h2 id="proof-title">
              You need something
              <br />
              <span>you can point to.</span>
            </h2>
            <p>
              These are outcomes clients reported from campaigns we worked on.
              Different briefs, different results.
            </p>
          </div>
          <div className={styles.proofGrid}>
            {proof.map((item) => (
              <article key={item.brand} className={styles.proofItem}>
                <div className={styles.proofNumber}>{item.number}</div>
                <h3>{item.metric}</h3>
                <p>{item.detail}</p>
                <div className={styles.proofBrand}>
                  <Image src={item.logo} alt="" width={75} height={35} />
                  <span>{item.brand}</span>
                </div>
              </article>
            ))}
          </div>
          <figure className={styles.testimonial}>
            <div className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </div>
            <div>
              <figcaption>
                WHEN ASKED TO RATE THE EXPERIENCE OUT OF 10
              </figcaption>
              <blockquote>&ldquo;Is 20 an option?&rdquo;</blockquote>
              <p>
                <strong>Adam</strong>{" "}
                <span>Marketing Manager, Burger &amp; Sauce</span>
              </p>
            </div>
            <Image
              src="/logos/burger-and-sauce.png"
              alt="Burger & Sauce"
              width={130}
              height={60}
            />
          </figure>
        </section>

        <section
          id="how-it-works"
          className={`${styles.section} ${styles.process}`}
          aria-labelledby="process-title"
        >
          <div className={styles.sectionLabel}>
            <span>04 / THE FIRST STEP</span>
            <span>NO PAYMENT TAKEN AT SETUP.</span>
          </div>
          <div className={styles.processGrid}>
            <div className={styles.processIntro}>
              <h2 id="process-title">
                First, a little
                <br />
                <span>commitment.</span>
                <br />
                Then, a proper plan.
              </h2>
              <p>
                Start by setting up your Direct Debit. It tells us you&apos;re
                serious about moving forward. We don&apos;t take a payment at
                this stage.
              </p>
              <PrimaryAction />
              <SetupNote />
            </div>
            <ol className={styles.steps}>
              {steps.map((step, i) => (
                <li key={step.title}>
                  <span className={styles.stepNumber}>0{i + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                    {i === 1 && (
                      <a
                        href={HUDDLE_START.whatsappUrl}
                        className={styles.messageLink}
                      >
                        I&apos;ve set up my Direct Debit{" "}
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <CampaignNumbers />

        <section
          className={`${styles.section} ${styles.pricing}`}
          aria-labelledby="pricing-title"
        >
          <div className={styles.sectionLabel}>
            <span>06 / THE INVESTMENT</span>
            <span>ONE FEE. ALL YOUR LOCATIONS.</span>
          </div>
          <div className={styles.priceGrid}>
            <div>
              <h2 id="pricing-title">
                Your team has
                <br />
                enough on its plate.
                <br />
                <span>
                  Put the campaigns
                  <br />
                  on ours.
                </span>
              </h2>
              <p className={styles.priceLead}>
                One specialist partner for the planning, creative and campaign
                management. Across every location.
              </p>
              <div className={styles.terms}>
                Month to month. No lock-in. Cancel any time.
              </div>
            </div>
            <div className={styles.priceCard}>
              <span className={styles.priceEyebrow}>
                HUDDLE DUCK AGENCY SERVICE
              </span>
              <div className={styles.priceAmount}>
                £{HUDDLE_START.monthlyFee.toLocaleString("en-GB")}
                <span>+ VAT / month</span>
              </div>
              <div className={styles.priceRule} />
              <ul>
                {[
                  "Strategy call & detailed campaign planning",
                  "Hooks, scripts, video direction & captions",
                  "CTA & comment / DM follow-up planning",
                  "Creative from your supplied content",
                  "Managed Facebook & Instagram campaigns",
                  "All locations & ongoing optimisation",
                  "SuperPulse local awareness included",
                ].map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">↗</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className={styles.adSpend}>
                Ad spend is separate, paid directly to Meta.
              </p>
              <PrimaryAction />
              <SetupNote />
              <p className={styles.paymentNote}>
                Authorisation first. Strategy call next.
                <br />
                Future payment details confirmed before collection.
              </p>
            </div>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.faq}`}
          aria-labelledby="faq-title"
        >
          <div className={styles.faqIntro}>
            <span className={styles.eyebrow}>A FEW THINGS WORTH KNOWING</span>
            <h2 id="faq-title">
              Before you
              <br />
              <span>take the next step.</span>
            </h2>
            <p>
              Already set up?{" "}
              <a href={HUDDLE_START.whatsappUrl}>
                Message us on WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </p>
          </div>
          <div className={styles.questions}>
            {faqs.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <div className={styles.closingTop}>
            <div className={styles.founder}>
              <Image
                src="/asad-shah.jpg"
                alt="Asad Shah, founder of Huddle Duck"
                width={64}
                height={64}
              />
              <p>
                <strong>Asad Shah</strong>
                <span>Founder, Huddle Duck</span>
              </p>
            </div>
            <span className={styles.eyebrow}>LET&apos;S GET TO WORK.</span>
          </div>
          <h2 id="closing-title">
            Imagine the next campaign
            <br />
            <span>is already taken care of.</span>
          </h2>
          <p>
            The brief is clear. The copy is written. The creative has a
            direction.
            <br />
            And you know who&apos;s getting it live.
          </p>
          <PrimaryAction />
          <SetupNote />
          <p className={styles.closingNext}>
            Set up your Direct Debit. Message us. Let&apos;s plan your next
            campaign.
          </p>
        </section>
        <FoundersLetter />
      </main>

      <footer className={styles.footer}>
        <Image
          src="/brand/huddle/wordmark-green.png"
          alt="Huddle Duck"
          width={150}
          height={36}
        />
        <p>
          © {new Date().getFullYear()} Huddle Duck Ltd. Built for the people
          behind the brand.
        </p>
        <div>
          <a href="/privacy">Privacy</a>
          <a
            href="https://pages.huddleduck.co.uk/ai-ad-engine/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Service terms{" "}
            <span className={styles.srOnly}>(opens in a new tab)</span>
          </a>
          <a href={HUDDLE_START.whatsappUrl}>
            Say hello <span aria-hidden="true">↗</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
