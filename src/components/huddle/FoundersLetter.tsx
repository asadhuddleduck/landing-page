import { HUDDLE_START } from "@/lib/huddle-start";
import styles from "./FoundersLetter.module.css";

function StartLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={HUDDLE_START.directDebitUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className={styles.srOnly}> (opens GoCardless in a new tab)</span>
    </a>
  );
}

export default function FoundersLetter() {
  return (
    <section className={styles.section} aria-labelledby="letter-title">
      <div className={styles.layout}>
        <div className={styles.byline}>
          <span>A FEW WORDS FROM ASAD</span>
          <h2 id="letter-title">
            The part I’d
            <br />
            tell you in person.
          </h2>
          <p>
            Asad Shah
            <br />
            <span>Founder, Huddle Duck</span>
          </p>
        </div>
        <div className={styles.letter}>
          <article>
            <h3>
              <span>P.S.</span> I know whose reputation is on the line.
            </h3>
            <p>
              When you recommend someone to work with your brand, you’re lending
              them a little of your own credibility. You’ve told the team this
              is a good decision. You’ve put your name beside it. I take that
              seriously.
            </p>
            <p>
              There are things a proposal can’t tell me. The campaign that
              looked fine on paper but caused a headache internally. The tone
              your founder hates. The branch that needs a little more care. The
              promise you’ve already made to your team.
            </p>
            <p>I want to hear those things.</p>
            <p>
              Tell me when a line feels wrong. Tell me what your team is nervous
              about. Tell me where a previous experience made you cautious.
              Those details help me understand what doing a good job actually
              means for you.
            </p>
            <p>
              You should feel comfortable asking why we’ve chosen an angle,
              where the work has got to, or what we’re learning from a campaign.
              I want the conversation to be that straightforward.
            </p>
            <p>
              If that sounds like a working relationship you’d value,{" "}
              <StartLink>you can take the first step here</StartLink>. Setting
              up the Direct Debit takes no payment at this stage.
            </p>
          </article>
          <article>
            <h3>
              <span>P.P.S.</span> You know things about your brand that I can’t
              find online.
            </h3>
            <p>
              You know the order people come back for. The little detail they
              mention at the counter. The reason a regular brings their cousin
              in on a Saturday and says, “You’ve got to try this.”
            </p>
            <p>That is useful material.</p>
            <p>
              When we talk, bring the things that feel too ordinary to put in a
              marketing brief. The question customers keep asking. The dish you
              think deserves more attention. The bit of the experience your best
              people make special without even thinking about it.
            </p>
            <p>
              Those details give us somewhere honest to start. They help us
              write something that belongs to your business and gives the right
              local person a reason to care.
            </p>
            <p>
              I want you to recognise your brand in the work. Your team should
              recognise it too. The words, the pace and the personality all
              matter, because someone arriving after seeing an ad still has to
              meet the real business.
            </p>
            <p>
              That’s why{" "}
              <a href="#how-it-works">we start with a proper conversation</a>.
              Your knowledge of the business is part of what makes the work
              good.
            </p>
          </article>
          <article>
            <h3>
              <span>P.P.P.S.</span> You can be completely straight with me.
            </h3>
            <p>
              You don’t need to arrive with a polished brief or pretend you’ve
              got every answer. “We know this location should be doing better”
              is a useful place to begin. So is “We’ve got an offer, but we
              haven’t worked out how to sell it.”
            </p>
            <p>
              Tell me what you need the campaign to do. Tell me the limits we
              need to work within. And if something doesn’t sit right as we work
              through it, say so.
            </p>
            <p>
              Good feedback is a sign that you care about the business. I want
              to make it easy for you to give it. That’s how we get closer to
              work you feel comfortable sharing with the people whose opinion
              matters to you.
            </p>
            <p>
              I want to earn your next brief. The one after this campaign. The
              next opening. The idea you mention before it’s fully formed
              because you trust us to help think it through.
            </p>
            <p>
              That’s the kind of relationship I want Huddle Duck to build with
              your team.
            </p>
            <p>
              If you can picture us working together like that,{" "}
              <StartLink>set up your Direct Debit</StartLink> and{" "}
              <a href={HUDDLE_START.whatsappUrl}>send us your business name</a>.
              We’ll arrange the strategy call from there.
            </p>
          </article>
          <div className={styles.signature}>
            <p>Speak soon,</p>
            <strong>Asad</strong>
            <span>Asad Shah · Founder, Huddle Duck</span>
          </div>
        </div>
      </div>
    </section>
  );
}
