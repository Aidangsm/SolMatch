import { Resend } from "resend";
import * as dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const SIGNUP_URL = "https://solmatch.co.za/register";

interface Installer {
  firstName?: string;
  companyName: string;
  city: string;
  email: string;
}

const installers: Installer[] = [
  // Cape Town / Western Cape
  { firstName: "Francois", companyName: "Lunar Solar",          city: "Cape Town",    email: "hello@lunarsolar.co.za" },
  { firstName: "Liam",     companyName: "CapeTown.Solar",        city: "Cape Town",    email: "Liam@capetown.solar" },
  { firstName: "Wouter",   companyName: "Winelands Solar",       city: "Stellenbosch", email: "wouter@winelandssolar.co.za" },
  { firstName: "Stephen",  companyName: "Stephen Solar",         city: "Cape Town",    email: "stephentimothy158@gmail.com" },
  {                         companyName: "Solar Specialist SA",   city: "Cape Town",    email: "Info@solarspecialist.co.za" },
  // Johannesburg / Gauteng
  { firstName: "Jaco",     companyName: "Solareff",              city: "Johannesburg", email: "info@solareff.co.za" },
  {                         companyName: "Sunor Energy",          city: "Johannesburg", email: "info@sunor.co.za" },
  // Durban / KZN
  { firstName: "Bernie",   companyName: "GC Solar KZN",          city: "Durban",       email: "bernie@gcsolarkzn.co.za" },
  {                         companyName: "DurbanSolar",           city: "Durban",       email: "info@durbansolar.co.za" },
  {                         companyName: "Solar Shine Energy",    city: "Durban",       email: "admin@solarshine.co.za" },
  {                         companyName: "Durban Solar Power",    city: "Ballito",      email: "info@durbansolarpower.co.za" },
  // Eastern Cape
  { firstName: "Nic",      companyName: "Ellies East London",    city: "East London",  email: "nic@elliesel.co.za" },
];

function buildEmail(installer: Installer): string {
  const { firstName, companyName, city } = installer;
  const greeting = firstName ? `Hi ${firstName},` : `Hi there,`;

  const openings = [
    `I came across ${companyName} while looking for solar installers in ${city} and wanted to reach out directly.`,
    `I was researching solar installers in the ${city} area and ${companyName} came up — really glad I found you.`,
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

  <p>${greeting}</p>

  <p>${opening}</p>

  <p>I'm Aidan — I started SolMatch because I kept hearing the same story from homeowners across South Africa: they wanted to go solar, had the budget, but had no reliable way to find a trustworthy installer. Too many bad experiences with companies that overpromised, underdelivered, or just disappeared after installation.</p>

  <p>So I built a marketplace that fixes that. Homeowners come to SolMatch, run a personalised savings calculation, and request quotes from verified installers in their area. No cold calling on your end, no ad spend — just warm leads from people who've already done their research and are ready to move forward.</p>

  <p>Right now I'm bringing on a small number of installers in ${city} and I'd love ${companyName} to be one of them. Setting up a profile takes about 10 minutes, it's completely free to get started, and you only pay a small lead fee when you actually win the business.</p>

  <p>If this sounds interesting, here's the link to get set up:</p>

  <div class="cta-wrap">
    <a href="${SIGNUP_URL}" class="btn">Create Your Free Profile →</a>
  </div>

  <p>If you have any questions at all, just email me directly at <a href="mailto:aidan@solmatch.co.za" style="color:#ff7c0a;">aidan@solmatch.co.za</a> — I'm always happy to chat.</p>

  <div class="sig">
    <p class="name">Aidan Smit</p>
    <p>Founder, SolMatch</p>
    <p><a href="mailto:aidan@solmatch.co.za" style="color:#ff7c0a;">aidan@solmatch.co.za</a></p>
    <p style="color:#9ca3af;font-size:13px;">solmatch.co.za</p>
  </div>

  <div class="footer">
    <p>You're receiving this because we think ${companyName} would be a great fit for our platform. If you'd rather not hear from us, just reply and I'll remove you from our list — no hard feelings at all.</p>
  </div>

</div>
</body></html>`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
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

      console.log(`✅ Sent → ${installer.firstName ?? "team"} @ ${installer.companyName} (${installer.email})`);
      sent++;

      await sleep(1500);
    } catch (err: any) {
      console.error(`❌ Failed → ${installer.email}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`Done. ${sent} sent, ${failed} failed.`);
}

run();
