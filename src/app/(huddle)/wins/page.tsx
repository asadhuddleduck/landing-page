import type { Metadata, Viewport } from "next";
import Image from "next/image";
import ClientLogoBar from "@/components/huddle/ClientLogoBar";
import PrimaryAction from "@/components/huddle/PrimaryAction";
import { HUDDLE_START } from "@/lib/huddle-start";
import {
  EARLY_REVIEWS,
  FOOTAGE,
  GOOGLE_REVIEWS,
  MESSAGES,
  NUMBERS,
  QUOTES,
  SCORES,
  STORIES,
  VIDEOS,
  winCount,
  type WinReview,
} from "@/lib/wins";
import styles from "./wins.module.css";

const TITLE = "Wins | Huddle Duck";
const DESCRIPTION =
  "Real results from real food brands, in their own words. Launches, queues, numbers, videos, messages and reviews from Huddle Duck and SuperPulse clients.";
const CANONICAL = "https://huddleduck.co.uk/wins";

export const metadata: Metadata = {
  metadataBase: new URL("https://huddleduck.co.uk"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: "Huddle Duck",
    type: "website",
    images: [{ url: "/wins/opengraph-image", width: 1200, height: 630, alt: "Huddle Duck wins" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/wins/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const JUMPS = [
  ["numbers", "Numbers"],
  ...(FOOTAGE.length ? [["footage", "Queues"]] : []),
  ["videos", "Videos"],
  ["messages", "Messages"],
  ["words", "In their words"],
  ["scores", "Scores"],
  ["stories", "Stories"],
  ["reviews", "Reviews"],
] as const;

function Stars({ count = 5 }: { count?: number }) {
  return (
    <span className={styles.stars} aria-label={`${count} out of 5 stars`}>
      {"★".repeat(count)}
    </span>
  );
}

function ReviewList({ items }: { items: WinReview[] }) {
  return (
    <div className={styles.reviews}>
      {items.map((item) => (
        <figure key={item.name} className={styles.review}>
          {item.stars ? <Stars count={item.stars} /> : null}
          <blockquote>{item.text}</blockquote>
          <figcaption>
            <strong>{item.name}</strong>
            <span>{item.source}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Label({ n, title, aside }: { n: number; title: string; aside: string }) {
  return (
    <div className={styles.sectionLabel}>
      <span>
        {String(n).padStart(2, "0")} / {title}
      </span>
      <span>{aside}</span>
    </div>
  );
}

export default function WinsPage() {
  const total = winCount();
  const q = FOOTAGE.length ? 1 : 0;
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <a href="#" aria-label="Huddle Duck, back to top" className={styles.wordmark}>
          <Image src="/brand/huddle/wordmark-white.png" alt="Huddle Duck" width={174} height={42} priority />
        </a>
        <div className={styles.headerRight}>
          <span>Good food deserves a full house.</span>
          <a href="/start">
            How we work <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroTop}>
            <span className={styles.eyebrow}>
              <span className={styles.greenDot} /> HUDDLE DUCK AND SUPERPULSE
            </span>
            <span className={styles.heroIndex}>{total} WINS AND COUNTING</span>
          </div>
          <h1 id="hero-title">
            Wins.
            <br />
            <span>In their own words.</span>
          </h1>
          <p className={styles.heroCopy}>
            Real food brands. Real launches, queues, numbers and messages. Everything here
            came from a client, a campaign or a review. Where a number is the client&apos;s own
            report, we say so.
          </p>
          <nav className={styles.jumps} aria-label="Jump to a section">
            {JUMPS.map(([id, name]) => (
              <a key={id} href={`#${id}`}>
                {name}
              </a>
            ))}
          </nav>
        </section>

        <section className={styles.trust}>
          <ClientLogoBar exclude={["OGS", "BellaMira", "Bella Mira"]} />
        </section>

        <section id="numbers" className={styles.section} aria-labelledby="numbers-title">
          <Label n={1} title="THE NUMBERS" aside="WHAT HAPPENED, BRAND BY BRAND." />
          <h2 id="numbers-title" className={styles.srOnly}>
            The numbers
          </h2>
          <ol className={styles.numbers}>
            {NUMBERS.map((item) => (
              <li key={item.client + item.figure}>
                <div className={styles.figure}>{item.figure}</div>
                <div className={styles.figureText}>
                  <p>{item.what}</p>
                  <p className={styles.meta}>
                    <strong>{item.client}</strong>
                    <span>{item.brand}</span>
                    <span>{item.label}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {FOOTAGE.length > 0 && (
          <section id="footage" className={`${styles.section} ${styles.dark}`} aria-labelledby="footage-title">
            <Label n={2} title="THE QUEUES" aside="FILMED OUTSIDE OUR CLIENTS' DOORS." />
            <h2 id="footage-title">
              Lines down the street.
              <br />
              <span>Filmed on the day.</span>
            </h2>
            <div className={styles.footage}>
              {FOOTAGE.map((item) => (
                <figure key={item.src}>
                  <video controls muted playsInline preload="none" poster={item.poster}>
                    <source src={item.src} type="video/mp4" />
                  </video>
                  <figcaption>
                    <strong>{item.client}</strong>
                    <span>{item.note}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section id="videos" className={styles.section} aria-labelledby="videos-title">
          <Label n={2 + q} title="THE VIDEOS" aside="CLIENTS ON CAMERA. FULL LENGTH." />
          <h2 id="videos-title">
            Don&apos;t take our word for it.
            <br />
            <span>Take theirs.</span>
          </h2>
          <div className={styles.videos}>
            {VIDEOS.map((item) => (
              <figure key={item.src}>
                <video controls playsInline preload="none" poster={item.poster} aria-label={item.title}>
                  <source src={item.src} type="video/mp4" />
                  <track kind="captions" src={item.captions} srcLang="en" label="English" default />
                </video>
                <figcaption>
                  <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
                  <p className={styles.meta}>
                    <strong>{item.person}</strong>
                    <span>{item.client}</span>
                    <span>{item.duration}</span>
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="messages" className={`${styles.section} ${styles.sage}`} aria-labelledby="messages-title">
          <Label n={3 + q} title="THE MESSAGES" aside="SCREENSHOTS, AS THEY ARRIVED." />
          <h2 id="messages-title">
            The messages
            <br />
            <span>speak for themselves.</span>
          </h2>
          <div className={styles.messages}>
            {MESSAGES.map((item) => (
              <figure key={item.image}>
                <Image src={item.image} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 760px) 92vw, 380px" />
                <figcaption>
                  <strong>{item.title}</strong>
                  <span>{item.client}</span>
                  {item.note ? <span>{item.note}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="words" className={styles.section} aria-labelledby="words-title">
          <Label n={4 + q} title="IN THEIR WORDS" aside="WORD FOR WORD. SPELLING AND ALL." />
          <h2 id="words-title" className={styles.srOnly}>
            In their words
          </h2>
          <div className={styles.quotes}>
            {QUOTES.map((item) => (
              <figure key={item.person + item.quote.slice(0, 12)} className={styles.quote}>
                <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
                <figcaption>
                  <strong>{item.person}</strong>
                  <span>{item.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="scores" className={`${styles.section} ${styles.dark}`} aria-labelledby="scores-title">
          <Label n={5 + q} title="THE SCORES" aside="EVERY CHECK-IN WE'VE RECORDED." />
          <div className={styles.scores}>
            <div>
              <h2 id="scores-title">
                Out of 10,
                <br />
                <span>nobody gave us less than 7.</span>
              </h2>
              <p className={styles.scoreLead}>
                We ask our agency clients how likely they are to recommend us, out of 10.
                Across {SCORES.checkIns} check-ins with {SCORES.clients} clients,{" "}
                {SCORES.nineOrTen} scored us 9 or 10 and {SCORES.sevenOrEight} scored 7 or 8.
                Every score, not an average.
              </p>
            </div>
            <ul className={styles.tens}>
              {SCORES.tens.map((item) => (
                <li key={item.client}>
                  <span className={styles.ten}>10</span>
                  <strong>{item.client}</strong>
                  <span>{item.times > 1 ? `${item.times} times` : "once"}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="stories" className={styles.section} aria-labelledby="stories-title">
          <Label n={6 + q} title="THE STORIES" aside="THE BRIEF. THE WORK. WHAT HAPPENED." />
          <h2 id="stories-title">
            Different briefs.
            <br />
            <span>Different wins.</span>
          </h2>
          <div className={styles.stories}>
            {STORIES.map((item) => (
              <article key={item.client} className={styles.story}>
                <div className={styles.storyHead}>
                  <h3>{item.client}</h3>
                  <span>{item.brand}</span>
                </div>
                <dl>
                  <div>
                    <dt>The brief</dt>
                    <dd>{item.brief}</dd>
                  </div>
                  <div>
                    <dt>What we did</dt>
                    <dd>{item.did}</dd>
                  </div>
                  <div>
                    <dt>What happened</dt>
                    <dd>
                      {item.happened}
                      {item.label ? <span className={styles.storyLabel}>{item.label}</span> : null}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section id="reviews" className={`${styles.section} ${styles.sage}`} aria-labelledby="reviews-title">
          <Label n={7 + q} title="BEFORE HUDDLE DUCK" aside="MR. ASAD, BACK IN THE DAY." />
          <h2 id="reviews-title">
            Before the agency,
            <br />
            <span>there was MR. ASAD.</span>
          </h2>
          <p className={styles.sectionLead}>
            Asad started out teaching business owners how to grow on Instagram and run their own ads.
            These are the reviews and messages people sent him.
          </p>
          <h3 className={styles.subhead}>Google reviews</h3>
          <ReviewList items={GOOGLE_REVIEWS} />
          <h3 className={styles.subhead}>Messages and course reviews</h3>
          <ReviewList items={EARLY_REVIEWS} />
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <span className={styles.eyebrow}>YOUR BRAND COULD BE NEXT.</span>
          <h2 id="closing-title">
            Want the next win
            <br />
            <span>to be yours?</span>
          </h2>
          <p>Three or more sites and a launch, offer or opening coming up? See how our team works.</p>
          <PrimaryAction href="/start">See how we work</PrimaryAction>
          <a className={styles.quietLink} href="https://www.superpulse.io/grow">
            Just want local ads? SuperPulse, £590 a year per location <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <Image src="/brand/huddle/wordmark-green.png" alt="Huddle Duck" width={150} height={36} />
        <p>
          © {new Date().getFullYear()} Huddle Duck Ltd. Results are historical and specific to each
          client. They are not a promise of future results.
        </p>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/start">How we work</a>
          <a href={HUDDLE_START.whatsappUrl}>
            Say hello <span aria-hidden="true">↗</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
