"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { trackPixelEvent } from "@/components/MetaPixel";
import styles from "./agency.module.css";
import action from "@/components/huddle/PrimaryAction.module.css";

type Receipt = { status: string; start: string; end: string | null; meetingUrl: string | null };
const formatTime = (time: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(new Date(time));
function attribution() {
  const params = new URLSearchParams(location.search), output: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "campaign_id", "adset_id", "ad_id", "fbclid"]) { const value = params.get(key); if (value) output[key] = value.slice(0, 1000); }
  const cookie = (key: string) => document.cookie.split("; ").find(c => c.startsWith(key + "="))?.slice(key.length + 1);
  output.fbp = cookie("_fbp") ?? "";
  output.fbc = cookie("_fbc") ?? (output.fbclid ? `fb.1.${Date.now()}.${output.fbclid}` : "");
  output.referrer = document.referrer.slice(0, 1000);
  try {
    const visitor = localStorage.getItem("hd_agency_visitor") ?? crypto.randomUUID(); localStorage.setItem("hd_agency_visitor", visitor); output.visitor_id = visitor;
    const first = localStorage.getItem("hd_agency_first_touch") ?? JSON.stringify({ at: new Date().toISOString(), ...output });
    localStorage.setItem("hd_agency_first_touch", first); output.first_touch = first.slice(0, 1000);
  } catch { /* The form also works when storage is disabled. */ }
  return output;
}
export default function AgencyEnquiry() {
  const [step, setStep] = useState<"form" | "booking" | "review">("form"), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [token, setToken] = useState(""), [slots, setSlots] = useState<string[]>([]), [booking, setBooking] = useState<Receipt | null>(null);
  const key = useRef<string>("");
  const source = useRef<Record<string, string> | null>(null);
  async function api(path: string, options: RequestInit = {}, bearer = token) {
    const response = await fetch(`/api/agency/${path}`, { ...options, headers: { "Content-Type": "application/json", ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}), ...options.headers } });
    const body = await response.json();
    if (!response.ok) { const issue = body.issues?.[0]; throw new Error(issue ? `${issue.field}: ${issue.message}` : body.error ?? "Please try again shortly."); }
    return body;
  }
  async function loadSlots(bearer: string) {
    const body = await api("slots", {}, bearer); setSlots(body.slots ?? []); setBooking(body.booking ?? null);
  }
  useEffect(() => {
    let saved = ""; try { saved = sessionStorage.getItem("hd_agency_booking") ?? ""; } catch { /* Optional storage. */ }
    if (saved) { setToken(saved); setStep("booking"); loadSlots(saved).catch(() => { setError("Your enquiry is saved. Refresh the available times or submit a new enquiry if your booking session has expired."); }); }
    // Restore only an opaque booking token, never the enquiry's contact details.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setError("");
    const form = new FormData(event.currentTarget); key.current ||= crypto.randomUUID();
    const value = (name: string) => String(form.get(name) ?? "");
    try {
      const body = await api("applications", { method: "POST", body: JSON.stringify({ submissionKey: key.current, personName: value("personName"), email: value("email"), phone: value("phone"), businessName: value("businessName"), instagram: value("instagram"), foodBusiness: value("foodBusiness") === "yes", openLocations: Number(value("openLocations")), role: value("role"), decisionMaker: value("decisionMaker"), marketingSpend: value("marketingSpend"), challenge: value("challenge"), startTiming: value("startTiming"), website_url_confirm: value("website_url_confirm"), attribution: (source.current ??= attribution()) }) });
      if (body.eventId) trackPixelEvent("Lead", { content_name: "Huddle Duck agency enquiry" }, body.eventId);
      if (body.qualified && body.bookingToken) {
        setToken(body.bookingToken); setStep("booking"); try { sessionStorage.setItem("hd_agency_booking", body.bookingToken); } catch { /* Optional storage. */ }
        await loadSlots(body.bookingToken);
      } else { setStep("review"); }
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again shortly."); } finally { setBusy(false); }
  }
  async function choose(start: string) {
    if (busy) return; setBusy(true); setError("");
    try {
      const body = await api("bookings", { method: "POST", body: JSON.stringify({ start }) }); setBooking(body.booking);
      if (body.eventId) trackPixelEvent("Schedule", {}, body.eventId);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again shortly."); await loadSlots(token).catch(() => {}); } finally { setBusy(false); }
  }
  async function refresh() {
    setBusy(true); setError("");
    try { const body = await api("bookings"); setBooking(body.booking); if (!body.booking || body.booking.status === "failed") await loadSlots(token); }
    catch (e) { setError(e instanceof Error ? e.message : "Please try again shortly."); } finally { setBusy(false); }
  }
  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" aria-label="Huddle Duck home">huddle duck<span aria-hidden="true">.</span></Link><span>For food brands ready to grow</span></header>
    <div className={styles.layout}>
      <section className={styles.intro}><p className={styles.eyebrow}>More people through your doors</p><h1>Good food.<br />Fuller tables.<br /><em>Your next chapter.</em></h1><p>Our team helps food brands bring more local customers through the door. Tell us where you are today and what you want to change.</p><div className={styles.expect}><span>01</span><p><strong>A few details about your business</strong>So we can understand your locations and goals.</p><span>02</span><p><strong>A proper conversation</strong>If you have three or more locations open, choose a 30-minute call with Asad.</p><span>03</span><p><strong>A clear next step</strong>We will talk through whether our team is the right fit.</p></div></section>
      <section className={styles.card} aria-label="Agency enquiry">
        {step === "form" && <><p className={styles.eyebrow}>Start here</p><h2>Tell us about your brand.</h2><p className={styles.muted}>About two minutes. No obligation.</p><form onSubmit={submit}>
          <fieldset disabled={busy}><legend>Your business</legend><label>Business name<input required maxLength={200} name="businessName" autoComplete="organization" /></label><div className={styles.row}><label>Is this a food or drink business?<select name="foodBusiness" required defaultValue=""><option value="" disabled>Choose one</option><option value="yes">Yes</option><option value="no">No</option></select></label><label>Locations currently open<input name="openLocations" type="number" min="0" max="10000" required placeholder="3" /><small>Count locations trading today.</small></label></div><label>Instagram or website <span>(optional)</span><input name="instagram" maxLength={300} /></label></fieldset>
          <fieldset disabled={busy}><legend>What you need</legend><div className={styles.row}><label>Your role<input name="role" maxLength={160} required placeholder="Owner, marketing manager..." /></label><label>Do you make marketing decisions?<select name="decisionMaker" defaultValue="" required><option value="" disabled>Choose one</option><option value="yes">Yes</option><option value="involved">I am involved</option><option value="no">No</option></select></label></div><label>Current monthly marketing spend<select name="marketingSpend" defaultValue="" required><option value="" disabled>Choose one</option>{["Under £1,000", "£1,000 to £2,499", "£2,500 to £4,999", "£5,000 to £9,999", "£10,000 or more", "Not sure yet"].map(v => <option key={v}>{v}</option>)}</select></label><label>What is the main thing you want to improve?<textarea name="challenge" required maxLength={2000} rows={3} placeholder="Tell us what is happening and what you want to change." /></label><label>When would you like to start?<select name="startTiming" defaultValue="" required><option value="" disabled>Choose one</option>{["As soon as possible", "Within a month", "In one to three months", "Just exploring"].map(v => <option key={v}>{v}</option>)}</select></label></fieldset>
          <fieldset disabled={busy}><legend>How to reach you</legend><label>Your name<input name="personName" autoComplete="name" required maxLength={120} /></label><div className={styles.row}><label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40} placeholder="+44..." /></label></div></fieldset>
          <div className={styles.trap} aria-hidden="true"><label>Leave this blank<input name="website_url_confirm" tabIndex={-1} autoComplete="off" /></label></div>
          <p className={styles.privacy}>We will use these details to respond to this enquiry and arrange your call. This does not sign you up for marketing messages. <a href="/privacy">Privacy policy</a>.</p>
          <button className={`sp-primary sp-coin ${action.action}`} disabled={busy} aria-busy={busy}>{busy ? "Saving your enquiry..." : "Find my next step"}<span aria-hidden="true">↗</span></button>
        </form></>}
        {step === "review" && <><p className={styles.eyebrow}>Enquiry saved</p><h2>Thanks for telling us about your business.</h2><p>Our agency calls are for food brands with at least three locations currently open. We have saved your details for review.</p><p>For a practical first step, get a free report on your local marketing.</p><a className={`sp-primary sp-coin ${action.action}`} href="https://www.superpulse.io/audit">Get my free report ↗</a></>}
        {step === "booking" && <>
          <p className={styles.eyebrow}>Enquiry saved</p>
          {booking?.status === "accepted" ? <><h2>Your call is booked.</h2><p className={styles.time}>{formatTime(booking.start)}</p><p>30 minutes with Asad. Your calendar invitation has the details and options to reschedule or cancel.</p>{booking.meetingUrl && <a className={styles.quietLink} href={booking.meetingUrl} target="_blank" rel="noreferrer">Open meeting details ↗</a>}</> : booking?.status === "cancelled" ? <><h2>Your call has been cancelled.</h2><p>Your enquiry is still saved. Reply to your calendar invitation if you need help arranging another time.</p></> : booking && ["attempting", "uncertain", "pending"].includes(booking.status) ? <><h2>We are checking your booking.</h2><p>Your enquiry is saved. Please check the booking status before choosing another time.</p><button className={`sp-primary sp-coin ${action.action}`} disabled={busy} onClick={refresh}>{busy ? "Checking..." : "Check booking status"}</button></> : <><h2>Let’s talk about your next step.</h2><p>Choose a 30-minute call with Asad. All times are UK time.</p><div className={styles.slots}>{slots.map(s => <button key={s} disabled={busy} onClick={() => choose(s)}>{formatTime(s)}<span aria-hidden="true">↗</span></button>)}</div>{!slots.length && <p>No times are available right now. Your enquiry is saved, so we can follow up to arrange a time.</p>}<button className={styles.quietButton} disabled={busy} onClick={() => { setBusy(true); setError(""); loadSlots(token).catch(e => setError(e.message)).finally(() => setBusy(false)); }}>{busy ? "Checking..." : "Refresh available times"}</button></>}
        </>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {step !== "form" && <button className={styles.quietButton} onClick={() => { try { sessionStorage.removeItem("hd_agency_booking"); } catch {} key.current = ""; setBooking(null); setToken(""); setError(""); setStep("form"); }}>Start a new enquiry</button>}
      </section>
    </div><footer className={styles.footer}>Huddle Duck · Local customers. Lasting growth.<a href="/privacy">Privacy</a></footer>
  </main>;
}
