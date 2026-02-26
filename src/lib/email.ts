import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY env var is not set");
    resendClient = new Resend(key);
  }
  return resendClient;
}

// --- HTML template ---

function purchaseConfirmationHtml(vars: {
  firstName: string;
  product: string;
  amount: string;
}): string {
  const { firstName, product, amount } = vars;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,'SF Pro Display','Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000;min-height:100vh;">
<tr><td align="center" style="padding:40px 16px 60px;">

<!-- Main card -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#0D0D0D;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">

<!-- Logo -->
<tr><td align="center" style="padding:40px 32px 0;">
  <img src="https://start.huddleduck.co.uk/duck-logo.png" width="48" height="48" alt="Huddle Duck" style="display:block;border-radius:12px;" />
</td></tr>

<!-- Checkmark -->
<tr><td align="center" style="padding:24px 32px 0;">
  <table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:56px;height:56px;border-radius:50%;background:rgba(30,186,143,0.15);text-align:center;vertical-align:middle;">
    <span style="font-size:28px;line-height:56px;">&#10003;</span>
  </td></tr></table>
</td></tr>

<!-- Heading -->
<tr><td align="center" style="padding:24px 32px 0;">
  <h1 style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;line-height:1.3;">
    You're in, ${firstName}!
  </h1>
</td></tr>

<!-- Subheading -->
<tr><td align="center" style="padding:8px 32px 0;">
  <p style="margin:0;font-size:16px;color:#999999;line-height:1.5;">
    Your <strong style="color:#FFFFFF;">${product}</strong> order for <strong style="color:#1EBA8F;">${amount}</strong> is confirmed.
  </p>
</td></tr>

<!-- Divider -->
<tr><td style="padding:28px 32px 0;">
  <div style="height:1px;background:rgba(255,255,255,0.08);"></div>
</td></tr>

<!-- What happens next -->
<tr><td style="padding:28px 32px 0;">
  <h2 style="margin:0 0 20px;font-size:16px;font-weight:700;color:#FFFFFF;text-transform:uppercase;letter-spacing:0.5px;">
    What happens next
  </h2>

  <!-- Step 1 -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="36" valign="top">
      <div style="width:28px;height:28px;border-radius:50%;background:rgba(30,186,143,0.15);color:#1EBA8F;font-size:13px;font-weight:700;line-height:28px;text-align:center;">1</div>
    </td>
    <td style="padding-left:12px;">
      <p style="margin:0;font-size:15px;font-weight:600;color:#FFFFFF;">Book your onboarding call</p>
      <p style="margin:4px 0 0;font-size:14px;color:#999999;line-height:1.5;">Akmal, your account manager, will walk you through everything.</p>
      <a href="https://calendly.com/akmalhd/30min" style="display:inline-block;margin-top:8px;padding:8px 20px;background:#1EBA8F;color:#000000;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;">Book a call &rarr;</a>
    </td>
  </tr>
  </table>

  <!-- Step 2 -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="36" valign="top">
      <div style="width:28px;height:28px;border-radius:50%;background:rgba(30,186,143,0.15);color:#1EBA8F;font-size:13px;font-weight:700;line-height:28px;text-align:center;">2</div>
    </td>
    <td style="padding-left:12px;">
      <p style="margin:0;font-size:15px;font-weight:600;color:#FFFFFF;">Give us access to your Business Manager</p>
      <p style="margin:4px 0 0;font-size:14px;color:#999999;line-height:1.5;">Watch this 2-minute video &mdash; it takes 2 minutes.</p>
      <a href="https://drive.google.com/file/d/1svszwBC3QZsV6OCCNqFwHiEkrtpbVeM5/view" style="display:inline-block;margin-top:8px;padding:8px 20px;background:transparent;color:#1EBA8F;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;border:1px solid rgba(30,186,143,0.3);">Watch video &rarr;</a>
    </td>
  </tr>
  </table>

  <!-- Step 3 -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="36" valign="top">
      <div style="width:28px;height:28px;border-radius:50%;background:rgba(30,186,143,0.15);color:#1EBA8F;font-size:13px;font-weight:700;line-height:28px;text-align:center;">3</div>
    </td>
    <td style="padding-left:12px;">
      <p style="margin:0;font-size:15px;font-weight:600;color:#FFFFFF;">We start building</p>
      <p style="margin:4px 0 0;font-size:14px;color:#999999;line-height:1.5;">The AI researches your market and crafts your campaign strategy. First campaign assets within 72 hours.</p>
    </td>
  </tr>
  </table>

</td></tr>

<!-- Divider -->
<tr><td style="padding:28px 32px 0;">
  <div style="height:1px;background:rgba(255,255,255,0.08);"></div>
</td></tr>

<!-- Footer -->
<tr><td align="center" style="padding:24px 32px 40px;">
  <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
    Questions? Just reply to this email.
  </p>
  <p style="margin:12px 0 0;font-size:13px;color:#333333;">
    Huddle Duck Ltd &middot; London, UK
  </p>
</td></tr>

</table>
<!-- End main card -->

</td></tr>
</table>
</body>
</html>`;
}

// --- Public API ---

export async function sendPurchaseConfirmation(params: {
  email: string;
  firstName: string;
  product: string;
  amount: string;
}): Promise<void> {
  const resend = getResend();

  const html = purchaseConfirmationHtml({
    firstName: params.firstName,
    product: params.product,
    amount: params.amount,
  });

  const { error } = await resend.emails.send({
    from: "Huddle Duck <hello@huddleduck.co.uk>",
    to: params.email,
    subject: `You're in! Here's what happens next`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`[email] Purchase confirmation sent to ${params.email}`);
}
