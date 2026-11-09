import type { Metadata } from 'next';
export const metadata: Metadata = {title: 'privacy and terms | MR. ASAD', alternates: {canonical: 'https://asadshah.co.uk/privacy'}};
const wrap = {maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px', lineHeight: 1.75, fontSize: 17, fontWeight: 300} as const;
export default function Privacy(){return <main style={wrap}>
{/* Full page load on purpose: "/" is rewritten by host in src/proxy.ts. */}
{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
<a href="/" style={{color: 'var(--ma-blue)', fontWeight: 900}}>← back to MR. ASAD</a>
<h1 style={{fontSize: 44, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.03em', margin: '28px 0'}}>consultation privacy and terms</h1>
<p>The consulting service is provided by Asad Social Media Ltd as a separate business from Huddle Duck Ltd. Registered in England and Wales, company number 11747989. Registered office: 22 Ventnor Road, Solihull, England, B92 9BU. Contact hello@asadshah.co.uk about your booking, personal information or a refund.</p>
<h2 style={{fontWeight: 900, marginTop: 40}}>your information</h2>
<p>We use your name, email, timezone, booking details and information you choose to share to arrange and provide your consultation. Stripe processes your payment, Cal.com arranges your appointment and meeting link, and our hosting and database providers store the booking record. These details are not a marketing subscription.</p>
<p>We retain the information needed to provide the service and maintain business records. Email hello@asadshah.co.uk to request access, correction or deletion of your information, subject to records we need to retain. You can complain to the Information Commissioner’s Office if you have concerns about how your information is handled.</p>
<h2 style={{fontWeight: 900, marginTop: 40}}>your booking</h2>
<p>The package details and one-time total appear before checkout. Extra sessions must be used within the period stated on the booking page. You can reschedule or cancel through your private link with at least 24 hours’ notice. Late cancellations and missed calls use a session. If Asad moves a call, your session is preserved.</p>
<p>If the first conversation does not give you a useful next step, email within 24 hours of its end for a full package refund. Remaining sessions are then cancelled. Statutory rights are unaffected.</p>
</main>}
