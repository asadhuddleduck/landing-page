import type { Metadata } from 'next';
import Image from 'next/image';
import ClientLogoBar from '@/components/huddle/ClientLogoBar';
import Booking from './booking';
import {consultationCheckoutReady} from '@/lib/consultation-stripe';
import styles from './talk.module.css';

// Served as the asadshah.co.uk home page (src/proxy.ts rewrites "/" here).
export const metadata: Metadata = {
  title: 'MR. ASAD | talk to Asad about your marketing',
  description: 'a private one to one call with Asad about your ads, your offer or your next move. from £250.',
  alternates: {canonical: 'https://asadshah.co.uk/'},
  openGraph: {
    title: 'know exactly what to fix before you spend another penny',
    description: 'a private one to one call with Asad about your marketing. from £250.',
    url: 'https://asadshah.co.uk/',
    siteName: 'MR. ASAD',
  },
};

const bullets = [
  '🔎 what your ad results might be hiding from you',
  '💸 what to fix before you put more money into ads',
  '🧲 why your offer could be the thing holding you back',
  '✂️ what you can stop wasting your time on',
  '📈 whether to fix it, test it or scale it',
  '🧭 what I’d do first if I were in your shoes',
];

const benefits = [
  ['🎯', 'a clear priority', 'you’ll know what deserves your attention first, so everything stops feeling equally urgent.'],
  ['🛠️', 'a practical next move', 'you’ll know exactly what to change, check or test, and why it matters.'],
  ['📝', 'something to come back to', 'I’ll send you a short written recap of the main points and the next steps we agreed.'],
] as const;

// Wins from the Proof Wall (Huddle Duck and SuperPulse clients), lightly reworded
// into the client's voice with Asad's approval (9 Nov 2026). Facts stay as recorded.
const proof = [
  ['Is 20 an option?', 'Adam, marketing manager at Burger & Sauce', 'when asked to rate us out of 10, after hundreds of new customers in 8 days'],
  ['What the hell have you done?', 'Phat Buns’ Uber Eats rep, one week after launch', 'sales jumped at every one of their 15+ locations'],
  ['Main man is Asad Shah.', 'Far East Kitchens', 'on camera, no script'],
  ['Please stop the ads, we can’t handle all these customers.', 'a burger restaurant owner', 'calling twice while we were at the gym'],
  ['12,000 followers before we’d sold a single pizza.', 'Dough Club', 'then a queue on day one at every new location'],
  ['We went from 1 location to 5, with a queue at every launch.', 'Shakedown', '4,000+ people at the Newcastle opening'],
  ['10 out of 10. We made a whole video about working with you.', 'Lunar Park', null],
  ['10/10, and we’ve sent two more businesses your way.', 'Boo Burger', null],
  ['thanks for your great service Asad ❤️', 'Yusuf, Ten Ten Burgers', null],
] as const;

const faqs = [
  ['who is this for?', 'business owners, founders and anyone responsible for marketing who wants help thinking through their ads, their offer, the journey people take to buy, or what to do next.'],
  ['will I speak with you personally?', 'yes, every session is with me.'],
  ['do I need to prepare anything?', 'just bring the question you want help with. you can send your main question and up to 3 links beforehand, and you don’t need a presentation.'],
  ['how do the extra calls work?', 'book your first call now and your confirmation includes a private link for the rest. the 1-month package gives you 3 calls within 30 days of your first call, and the 3-month package gives you 10 calls within 90 days.'],
  ['will you run my ads for me?', 'these sessions are for advice, planning and checking decisions. running campaigns is a separate service.'],
  ['can I change the time?', 'yes, your private booking link lets you reschedule with at least 24 hours’ notice. late cancellations and missed calls use up a session, and if I need to move a call, you keep that session.'],
  ['how does the refund promise work?', 'email hello@asadshah.co.uk within 24 hours of the end of your first conversation and I’ll refund the full package and cancel any remaining sessions. your statutory rights are unaffected.'],
] as const;

export default function Page(){return <main className={styles.page}>
<header className={styles.header}>
  {/* Full page load on purpose: "/" is rewritten by host in src/proxy.ts. */}
  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
  <a href="/" className={styles.brand} aria-label="MR. ASAD home"><Image src="/brand/mr-asad/logo-dark.png" alt="MR. ASAD" width={650} height={990} priority/></a>
  <a href="#book" className="ma-btn" data-tone="mint" data-size="sm">book a call 📅</a>
</header>

<section className={styles.hero}>
  <p className={styles.eyebrow}><span className="ma-float">🙋‍♂️</span> one to one with MR. ASAD</p>
  <h1>know exactly what to fix in your marketing <span className="ma-swipe">before you spend another penny.</span></h1>
  <p className={styles.intro}>I’ve run ads on budgets from <strong>£5 a day to £2 million a month</strong>. bring me the question that’s been sitting in your head for weeks, and we’ll work through it together until you know exactly what you’re doing on monday morning.</p>
  <a href="#book" className="ma-btn" data-tone="mint">pick your call 👇</a>
  <ul className={styles.bullets}>{bullets.map(b=><li key={b}>{b}</li>)}</ul>
</section>

<Booking enabled={consultationCheckoutReady()}/>

<section className={styles.logos}><ClientLogoBar tone="dark"/></section>

<section className={styles.split}>
  <p className={styles.eyebrow}>😮‍💨 sound familiar?</p>
  <div>
    <h2>you’ve had plenty of opinions and you’re still stuck on the same decision.</h2>
    <p>you’ve looked at the numbers, asked around and read the threads, and you’re still going round in circles.</p>
    <p>is it the ads, the offer or the page people land on? should you spend more, change direction or give it another month? meanwhile the bills still leave your account on the 1st whether the phone rings or not.</p>
    <p>that question takes up room in your head every single day. one proper conversation clears it, so you can get back to running the business instead of second-guessing it.</p>
  </div>
</section>

<section className={styles.about}>
  <Image src="/asad-shah.jpg" alt="Asad Shah" width={520} height={520}/>
  <div>
    <p className={styles.eyebrow}>👋 the person on the other end</p>
    <h2>hi, I’m Asad.</h2>
    <p>I run Huddle Duck and SuperPulse, and I’ve been sharing marketing lessons as MR. ASAD since 2018. I’ve worked with advertising budgets from £5 a day to £2 million a month.</p>
    <p>those budgets come with very different problems, but the useful questions are surprisingly similar: what are we asking people to buy, why should they care, where are we losing them and what are the numbers actually telling us?</p>
    <p>then comes the big one, which is what we should do next. <strong>that’s what I’ll help you work out.</strong></p>
  </div>
</section>

<section className={styles.benefits}>
  <h2>you leave with more than another opinion to think about.</h2>
  <div>{benefits.map(([e,t,d])=><article key={t}><span className={styles.emoji}>{e}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
  <p className={styles.note}>you can send me your main question and up to 3 links beforehand, so we spend our time on the useful part.</p>
</section>

<section className={styles.proof}>
  <p className={styles.eyebrow}>💬 from people my team and I have worked with</p>
  <div className={styles.proofGrid}>{proof.map(([q,who,note],n)=><figure key={who} data-tone={n%4}><blockquote>“{q}”</blockquote><figcaption>{who}{note&&<span>{note}</span>}</figcaption></figure>)}</div>
</section>

<section className={`${styles.promise} ma-grad-frame`}>
  <p className={styles.eyebrow}>🤝 my promise to you</p>
  <h2>if our first call doesn’t give you a useful next step, you get your money back.</h2>
  <p>tell me within 24 hours of the end of our first conversation and I’ll refund your whole package. any remaining sessions get cancelled.</p>
  <a href="#book" className="ma-btn" data-tone="mint">pick your call 👇</a>
</section>

<section className={styles.faq}>
  <h2>a few practical things 🧾</h2>
  {faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}
</section>

<section className={styles.letter}>
  <p><strong>p.s.</strong> you don’t have to fix your whole marketing strategy in one call. sometimes knowing which problem to tackle first is what gets everything moving again.</p>
  <p><strong>p.p.s.</strong> bring an idea you haven’t launched yet, ads that aren’t working, or a decision you want a second opinion on, and we’ll start wherever you are.</p>
  <p><strong>p.p.p.s.</strong> if you’ve been going round in circles, bring the question with you, <a href="#book">pick a time above</a> and let’s sort it out together.</p>
  <span>Asad 👋</span>
</section>

<footer className={styles.footer}>
  <span>© {new Date().getFullYear()} Asad Social Media Ltd, company 11747989</span>
  <a href="/privacy">privacy and terms</a>
  <a href="mailto:hello@asadshah.co.uk">get in touch</a>
</footer>
</main>}
