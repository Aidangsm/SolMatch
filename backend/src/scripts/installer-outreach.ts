import { Resend } from "resend";
import * as dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const SIGNUP_URL = "https://solmatch.co.za/register";

// ─── ADD YOUR INSTALLER CONTACTS HERE ────────────────────────────────────────
// Fields: firstName, companyName, city, email
// The more detail the better — city and company are used to personalise each email.
const installers: Installer[] = [
  // { firstName: "Johan", companyName: "SunPower Installations", city: "Pretoria", email: "johan@sunpowerinstallations.co.za" },
  // { firstName: "Pieter", companyName: "Cape Solar", city: "Cape Town", email: "pieter@capesolar.co.za" },
];
// ─────────────────────────────────────────────────────────────────────────────

interface Installer {
  firstName: string;
  companyName: string;
  city: string;
  email: string;
}

function buildEmail(installer: Installer): string {
  const { firstName, companyName, city } = installer;

  // Vary the opening line so batch doesn't feel templated
  const openings = [
    `I came across ${companyName} while looking for solar installers in ${city} and wanted to reach out directly.`,
    `I was researching solar installers in the ${city} area and ${companyName} came up — glad I found you.`,
    `Found ${companyName} while doing some research on installers in ${city} and thought it was worth getting in touch.`,
  ];
  const opening = openings[Math.floor(Math.random() * openings.length)];

  return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: Georgia, 'Times New Roman', serif; background: #ffffff; margin: 0; padding: 0; }
  .wrap { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
  p { color: #1a1a1a; line-height: 1.75; margin: 0 0 18px; font-size: 16px; }
  .cta-wrap { margin: 32px 0; }
  .btn { display: inline-block; background: #ff7c0a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; font-family: Arial, sans-serif; }
  .sig { margin-top: 32px; }
  .sig p { margin: 0; font-size: 15px; }
  .sig .name { font-weight: bold; font-size: 16px; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  .footer p { font-size: 12px; color: #9ca3af; }
</style></head><body>
<div class="wrap">

  <p>Hi ${firstName},</p>

  <p>${opening}</p>

  <p>I'm Aidan — I started SolMatch because I kept hearing the same story from homeowners: they wanted to go solar, had the budget, but had no reliable way to find a trustworthy installer. Too many bad experiences with companies that overpromised, underdelivered, or disappeared after installation.</p>

  <p>So I built a marketplace that fixes that. Homeowners come to SolMatch, run a savings calculation, and request quotes from verified installers in their area. No cold calling, no ad spend on your end — just warm leads from people who are already ready to buy.</p>

  <p>Right now I'm bringing on a small number of installers in ${city} and I'd love ${companyName} to be one of them. Creating a profile takes about 10 minutes, it's completely free to get started, and you only pay a small lead fee when you win business.</p>

  <p>If this sounds like it could work for you, you can set up your profile here:</p>

  <div class="cta-wrap">
    <a href="${SIGNUP_URL}" class="btn">Create Your Free Profile →</a>
  </div>

  <p>Happy to answer any questions — just reply to this email and you'll get me directly.</p>

  <div class="sig">
    <p class="name">Aidan Smit</p>
    <p>Founder, SolMatch</p>
    <p><a href="mailto:aidan@solmatch.co.za" style="color:#ff7c0a;">aidan@solmatch.co.za</a></p>
    <p style="color:#9ca3af;font-size:13px;">solmatch.co.za</p>
  </div>

  <div class="footer">
    <p>You're receiving this because we believe ${companyName} would be a great fit for our platform. If you'd rather not hear from us, just reply and I'll remove you from our list — no hard feelings.</p>
  </div>

</div>
</body></html>`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  if (installers.length === 0) {
    console.log("⚠️  No installers in the list. Add contacts to the installers array and run again.");
    return;
  }

  console.log(`📤 Starting outreach to ${installers.length} installer(s)...\n`);
  let sent = 0;
  let failed = 0;

  for (const installer of installers) {
    try {
      await resend.emails.send({
        from: "Aidan from SolMatch <aidan@solmatch.co.za>",
        to: installer.email,
        replyTo: "aidan@solmatch.co.za",
        subject: `${installer.companyName} + SolMatch — worth a quick look`,
        html: buildEmail(installer),
      });

      console.log(`✅ Sent to ${installer.firstName} @ ${installer.companyName} (${installer.email})`);
      sent++;

      // 1.5s delay between sends to stay well within rate limits
      await sleep(1500);
    } catch (err: any) {
      console.error(`❌ Failed for ${installer.email}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`Done. ${sent} sent, ${failed} failed.`);
}

run();
