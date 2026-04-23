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
    subject: "You're in — let's find you the perfect solar installer ☀️",
    html: wrap(`
      <p>Hi ${firstName},</p>
      <p>Welcome aboard — really glad you made it here.</p>
      <p>SolMatch was built because finding a trustworthy solar installer in South Africa felt like a gamble. Too many homeowners were getting burnt by dodgy quotes, fly-by-night companies, and zero accountability. We decided to fix that.</p>
      <p>Every installer on our platform is verified, rated by real homeowners, and competes for your business — which means you get better prices, faster responses, and installers who actually show up.</p>
      <p>Start by running your personalised solar savings calculation. It takes about 2 minutes and gives you a real picture of what going solar means for your electricity bill.</p>
      <p><a href="${BASE_URL}/calculator" class="btn">Calculate My Savings</a></p>
      <p>If you have any questions at all, just reply to this email — I read every one.</p>
      <p>Aidan<br><span style="color:#9ca3af;font-size:13px;">Founder, SolMatch</span></p>
      <p style="color:#9ca3af;font-size:12px;">If you didn't create this account, please <a href="mailto:privacy@solmatch.co.za">let us know</a> immediately.</p>
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
