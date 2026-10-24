"use client";

import { useState } from "react";

interface Props {
  email: string;
}

type YesSometimesNo = "Yes" | "Sometimes" | "No" | "";
type CopyrightAnswer = "Yes" | "Mix" | "No" | "Unsure" | "";
type ContentWorking = "Yes" | "Somewhat" | "No" | "";

interface Stage2State {
  postingRegularly: YesSometimesNo;
  usesCopyrightedMusic: CopyrightAnswer;
  monthlyContentSpendGbp: string;
  hoursPerWeekOnContent: string;
  teamSizeOnContent: string;
  contentAlreadyWorking: ContentWorking;
  anythingElse: string;
}

const empty: Stage2State = {
  postingRegularly: "",
  usesCopyrightedMusic: "",
  monthlyContentSpendGbp: "",
  hoursPerWeekOnContent: "",
  teamSizeOnContent: "",
  contentAlreadyWorking: "",
  anythingElse: "",
};

export default function PriorityForm({ email }: Props) {
  const [form, setForm] = useState<Stage2State>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Stage2State>(key: K, value: Stage2State[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/waitlist/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          postingRegularly: form.postingRegularly || undefined,
          usesCopyrightedMusic: form.usesCopyrightedMusic || undefined,
          monthlyContentSpendGbp: form.monthlyContentSpendGbp
            ? Number(form.monthlyContentSpendGbp)
            : undefined,
          hoursPerWeekOnContent: form.hoursPerWeekOnContent
            ? Number(form.hoursPerWeekOnContent)
            : undefined,
          teamSizeOnContent: form.teamSizeOnContent
            ? Number(form.teamSizeOnContent)
            : undefined,
          contentAlreadyWorking: form.contentAlreadyWorking || undefined,
          anythingElse: form.anythingElse.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="waitlist-priority-done">
        <div className="waitlist-success-title">Priority application received.</div>
        <p className="waitlist-success-body">
          Thanks. We&apos;ll move you up the list and be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form className="waitlist-priority-form" onSubmit={onSubmit} noValidate>
      <div className="waitlist-priority-intro">
        Answer as many as you like. More detail helps us decide faster.
      </div>

      <div className="waitlist-grid">
        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="pf-posting">Are you already posting on social regularly?</label>
          <select
            id="pf-posting"
            value={form.postingRegularly}
            onChange={(e) => set("postingRegularly", e.target.value as YesSometimesNo)}
            disabled={submitting}
          >
            <option value="">Pick one…</option>
            <option value="Yes">Yes, at least weekly</option>
            <option value="Sometimes">Sometimes, when we can</option>
            <option value="No">No, barely posting</option>
          </select>
        </div>

        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="pf-music">Do your posts use copyrighted music (e.g. chart hits)?</label>
          <select
            id="pf-music"
            value={form.usesCopyrightedMusic}
            onChange={(e) => set("usesCopyrightedMusic", e.target.value as CopyrightAnswer)}
            disabled={submitting}
          >
            <option value="">Pick one…</option>
            <option value="Yes">Yes, most of them</option>
            <option value="Mix">Mix of copyrighted + royalty-free</option>
            <option value="No">No, only royalty-free or original</option>
            <option value="Unsure">Not sure</option>
          </select>
        </div>

        <div className="waitlist-field">
          <label htmlFor="pf-spend">Monthly content spend (£)</label>
          <input
            id="pf-spend"
            type="number"
            min={0}
            step={50}
            inputMode="decimal"
            value={form.monthlyContentSpendGbp}
            onChange={(e) => set("monthlyContentSpendGbp", e.target.value)}
            disabled={submitting}
            placeholder="e.g. 500"
          />
        </div>

        <div className="waitlist-field">
          <label htmlFor="pf-hours">Hours/week on content</label>
          <input
            id="pf-hours"
            type="number"
            min={0}
            step={1}
            inputMode="decimal"
            value={form.hoursPerWeekOnContent}
            onChange={(e) => set("hoursPerWeekOnContent", e.target.value)}
            disabled={submitting}
            placeholder="e.g. 8"
          />
        </div>

        <div className="waitlist-field">
          <label htmlFor="pf-team">Team size on content</label>
          <input
            id="pf-team"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={form.teamSizeOnContent}
            onChange={(e) => set("teamSizeOnContent", e.target.value)}
            disabled={submitting}
            placeholder="e.g. 2"
          />
        </div>

        <div className="waitlist-field">
          <label htmlFor="pf-working">Is content already working for you?</label>
          <select
            id="pf-working"
            value={form.contentAlreadyWorking}
            onChange={(e) => set("contentAlreadyWorking", e.target.value as ContentWorking)}
            disabled={submitting}
          >
            <option value="">Pick one…</option>
            <option value="Yes">Yes, bringing in customers</option>
            <option value="Somewhat">Somewhat</option>
            <option value="No">No, no measurable impact</option>
          </select>
        </div>

        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="pf-anything">Anything else we should know?</label>
          <textarea
            id="pf-anything"
            rows={3}
            value={form.anythingElse}
            onChange={(e) => set("anythingElse", e.target.value)}
            disabled={submitting}
            maxLength={2000}
          />
        </div>
      </div>

      {error && <div className="waitlist-error">{error}</div>}

      <button type="submit" className="waitlist-submit" disabled={submitting}>
        {submitting ? "Sending…" : "Submit priority application"}
      </button>
    </form>
  );
}
