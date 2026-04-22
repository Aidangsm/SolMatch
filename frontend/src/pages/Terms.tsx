import SEO from "../components/SEO";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <SEO title="Terms of Service" description="Read SolMatch's Terms of Service governing the use of South Africa's solar installer marketplace." canonical="/terms" />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: 22 April 2026 · Version 1.0</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using the SolMatch platform ("Platform"), operated by SolMatch (Pty) Ltd ("SolMatch", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Description of Service</h2>
          <p>SolMatch is an online marketplace that connects South African homeowners and property owners ("Homeowners") with solar energy installation companies ("Installers"). We provide tools including a solar ROI calculator, installer profiles, and a quote request system. SolMatch is not itself a solar installer and does not guarantee any installation outcome.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. ROI Calculator Disclaimer</h2>
          <p>The solar ROI calculator provides indicative estimates only, based on publicly available Eskom tariff data and industry averages. These estimates do not constitute financial advice. SolMatch accepts no liability for financial decisions made on the basis of calculator outputs. Actual savings, costs, and payback periods will vary based on individual circumstances, location, installer pricing, usage patterns, and future tariff changes.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. User Accounts</h2>
          <p>You must be 18 years or older and legally capable of entering contracts under South African law. You are responsible for maintaining the security of your account credentials. You may not share, sell, or transfer your account. You must provide accurate and complete registration information.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Installer Listings</h2>
          <p>SolMatch verifies certain installer information but does not warrant the accuracy, completeness, or quality of installer profiles. Verified badges indicate that we have reviewed submitted documentation — they are not endorsements or guarantees of workmanship. Homeowners should independently verify installer credentials, obtain multiple quotes, and conduct their own due diligence before engaging any installer.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Prohibited Conduct</h2>
          <p>You may not use the Platform to: submit false or misleading information; impersonate any person or entity; engage in spamming, scraping, or automated data collection; circumvent any security measures; post content that is defamatory, abusive, or unlawful; or violate any applicable South African law including the Electronic Communications and Transactions Act 25 of 2002.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Limitation of Liability</h2>
          <p>To the maximum extent permitted by South African law, SolMatch's aggregate liability for any claims arising out of or relating to these Terms or the Platform shall not exceed the amount paid by you to SolMatch in the 12 months preceding the claim, or R500 where no payments have been made. SolMatch is not liable for indirect, consequential, incidental, or punitive damages.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Governing Law</h2>
          <p>These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the exclusive jurisdiction of the courts of the Western Cape, South Africa.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Changes to Terms</h2>
          <p>We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance. We will notify registered users of material changes via email.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">10. Contact</h2>
          <p>Legal enquiries: legal@solmatch.co.za · SolMatch (Pty) Ltd, Cape Town, South Africa</p>
        </section>
      </div>
    </div>
  );
}
