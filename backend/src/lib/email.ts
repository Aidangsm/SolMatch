import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "SolMatch <noreply@solmatch.co.za>";
const REPLY_TO = "aidan@solmatch.co.za";
const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function wrap(body: string) {
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Inter,Arial,sans-serif;background:#f9fafb;margin:0;padding:0;}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;}
  .header{background:#ff7c0a;padding:28px 32px;}
  .header h1{color:#fff;margin:0;font-size:22px;font-weight:800;}
  .body{padding:32px;}
  .body p{color:#374151;line-height:1.6;margin:0 0 16px;}
  .btn{display:inline-block;background:#ff7c0a;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;}
  .footer{padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;}
  .footer p{color:#9ca3af;font-size:12px;margin:0;}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>☀️ SolMatch</h1></div>
  <div class="body">${body}</div>
  <div class="footer"><p>SolMatch (Pty) Ltd · Cape Town, South Africa · <a href="${BASE_URL}/privacy">Privacy Policy</a></p></div>
</div></body></html>`;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM, to, replyTo: REPLY_TO,
    subject: "Welcome to SolMatch ☀️",
    html: wrap(`
      <p>Hi ${firstName},</p>
      <p>Welcome to SolMatch — South Africa's solar installer marketplace.</p>
      <p>You can now calculate your solar ROI and connect with verified installers near you.</p>
      <p><a href="${BASE_URL}/calculator" class="btn">Calculate My Savings</a></p>
      <p>If you did not create this account, please <a href="mailto:privacy@solmatch.co.za">contact us</a> immediately.</p>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, firstName: string, token: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM, to, replyTo: REPLY_TO,
    subject: "Reset your SolMatch password",
    html: wrap(`
      <p>Hi ${firstName},</p>
      <p>We received a request to reset your SolMatch password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
      <p><a href="${link}" class="btn">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email. Your password has not been changed.</p>
      <p style="color:#9ca3af;font-size:12px;">If the button doesn't work, paste this link into your browser:<br>${link}</p>
    `),
  });
}

export async function sendNewLeadEmail(to: string, installerName: string, homeownerCity: string, systemKw: number) {
  await resend.emails.send({
    from: FROM, to, replyTo: REPLY_TO,
    subject: "New quote request on SolMatch",
    html: wrap(`
      <p>Hi ${installerName},</p>
      <p>You have a new quote request from a homeowner in <strong>${homeownerCity}</strong> looking for a <strong>${systemKw} kW system</strong>.</p>
      <p><a href="${BASE_URL}/installer-dashboard" class="btn">View Lead</a></p>
      <p>Respond promptly — homeowners typically choose the first installer who contacts them.</p>
    `),
  });
}

export async function sendInstallerWelcomeEmail(to: string, companyName: string, installerId: string) {
  const profileUrl = `${BASE_URL}/installers/${installerId}`;
  await resend.emails.send({
    from: FROM, to, replyTo: REPLY_TO,
    subject: "Your SolMatch profile is live ☀️",
    html: wrap(`
      <p>Hi ${companyName},</p>
      <p>Your SolMatch installer profile is now live. Here's what happens next:</p>
      <p style="margin:0 0 8px;"><strong>1. Homeowners find you</strong><br>
      Homeowners in your area use our ROI calculator, then browse verified installers. Your profile will appear in their results.</p>
      <p style="margin:0 0 8px;"><strong>2. They request a quote</strong><br>
      When a homeowner requests a quote from you, you'll get an email notification with their system size, location and requirements.</p>
      <p style="margin:0 0 8px;"><strong>3. You choose whether to respond</strong><br>
      If the lead looks right for you, pay a once-off R200 lead fee to unlock their contact details. No monthly fees, no commitment — you're in full control.</p>
      <p><a href="${BASE_URL}/installer-dashboard" class="btn">Go to your dashboard</a></p>
      <p style="margin-top:24px;"><strong>💡 Tips to get more leads:</strong></p>
      <ul style="color:#374151;line-height:1.8;padding-left:20px;margin:0 0 16px;">
        <li>Add a company description — homeowners read these before choosing</li>
        <li>Upload your logo so your profile stands out</li>
        <li>Add your certifications (SAPVIA, ECSA, etc.)</li>
        <li>Set your system size range so you only get relevant leads</li>
      </ul>
      <p><a href="${profileUrl}">View your public profile →</a></p>
      <p>If you have any questions, just reply to this email.</p>
      <p>Welcome aboard,<br>Aidan<br>Founder, SolMatch</p>
    `),
  });
}

export async function sendQuoteStatusEmail(to: string, firstName: string, installerName: string, status: "ACCEPTED" | "DECLINED") {
  const accepted = status === "ACCEPTED";
  await resend.emails.send({
    from: FROM, to, replyTo: REPLY_TO,
    subject: accepted ? `${installerName} accepted your quote request` : `Update on your quote request`,
    html: wrap(`
      <p>Hi ${firstName},</p>
      ${accepted
        ? `<p><strong>${installerName}</strong> has accepted your quote request and will be in touch shortly. You can find their contact details in your dashboard.</p>
           <p><a href="${BASE_URL}/dashboard" class="btn">View Dashboard</a></p>`
        : `<p>Unfortunately, <strong>${installerName}</strong> is unable to assist with your request at this time. Don't worry — there are plenty of other verified installers available.</p>
           <p><a href="${BASE_URL}/installers" class="btn">Browse Other Installers</a></p>`
      }
    `),
  });
}
