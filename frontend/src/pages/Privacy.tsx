import SEO from "../components/SEO";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <SEO title="Privacy Policy" description="SolMatch's Privacy Policy — how we collect, use, and protect your personal information in compliance with POPIA." canonical="/privacy" />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-1">Compliant with the Protection of Personal Information Act 4 of 2013 (POPIA)</p>
      <p className="text-gray-500 text-sm mb-8">Last updated: 22 April 2026 · Version 1.0</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Responsible Party</h2>
          <p>SolMatch (Pty) Ltd ("SolMatch") is the responsible party under POPIA for personal information collected through the SolMatch Platform. Contact our Information Officer at: aidangsmit@gmail.com</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Information We Collect</h2>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li><strong>Account information:</strong> Name, email address, phone number, and role (homeowner or installer)</li>
            <li><strong>Quote request data:</strong> Monthly electricity bill, system size, property location, property type, and any notes provided</li>
            <li><strong>Installer profile data:</strong> Company name, registration number, VAT number, address, certifications, and pricing</li>
            <li><strong>Usage data:</strong> Pages visited, features used, and technical identifiers (IP address, browser type) for security purposes</li>
            <li><strong>Consent records:</strong> Timestamps and version of terms accepted</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Purpose of Processing</h2>
          <p className="text-sm">We process your personal information only for the following purposes:</p>
          <ul className="list-disc ml-5 space-y-1 text-sm mt-1">
            <li>Providing and improving the SolMatch Platform</li>
            <li>Connecting homeowners with appropriate solar installers</li>
            <li>Processing and managing quote requests</li>
            <li>Security, fraud prevention, and rate limiting</li>
            <li>Compliance with legal obligations</li>
            <li>Communicating important account or service updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Lawful Basis</h2>
          <p>We process your personal information based on: (a) your explicit consent given at registration; (b) the performance of a contract to which you are a party; and (c) compliance with a legal obligation.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Data Sharing</h2>
          <p>When a homeowner submits a quote request, their name, contact details, and property information are shared with the specific installer(s) selected. We do not sell, rent, or otherwise disclose your personal information to third parties for marketing purposes. We may disclose information where required by South African law or court order.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Data Retention</h2>
          <p>We retain personal information for as long as your account is active, plus a period of 3 years for legal compliance purposes, unless you request deletion earlier. Quote data is retained for 2 years for dispute resolution purposes.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Your Rights Under POPIA</h2>
          <p>You have the right to:</p>
          <ul className="list-disc ml-5 space-y-1 text-sm mt-1">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (right to be forgotten). You may delete your account via Settings, which immediately anonymises all identifying data</li>
            <li><strong>Objection:</strong> Object to processing of your personal information</li>
            <li><strong>Withdrawal of consent:</strong> Withdraw consent at any time, without affecting the lawfulness of processing prior to withdrawal</li>
            <li><strong>Lodge a complaint:</strong> Lodge a complaint with the Information Regulator of South Africa at inforeg.org.za</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Security</h2>
          <p>We implement appropriate technical and organisational measures to protect your personal information, including: bcrypt password hashing (cost factor 12), JWT-based authentication with short-lived tokens, HTTPS-only data transmission, rate limiting, and input validation. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Cookies</h2>
          <p>We use essential session cookies required for authentication. We do not use advertising or tracking cookies. You may decline non-essential cookies via the cookie banner without affecting your ability to use the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">10. Contact the Information Officer</h2>
          <p>For any privacy-related requests or complaints: <strong>aidangsmit@gmail.com</strong><br />
          SolMatch (Pty) Ltd, Cape Town, Western Cape, South Africa</p>
          <p className="mt-2 text-sm">Information Regulator of South Africa: <strong>inforeg.org.za</strong> · complaints.IR@justice.gov.za</p>
        </section>
      </div>
    </div>
  );
}
