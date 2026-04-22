import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => { localStorage.setItem("cookieConsent", "accepted"); setVisible(false); };
  const decline = () => { localStorage.setItem("cookieConsent", "declined"); setVisible(false); };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 card p-4 shadow-xl border border-gray-200">
      <div className="flex gap-3">
        <Cookie className="w-5 h-5 text-solar-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">
            We use essential cookies to keep you logged in and improve your experience. See our{" "}
            <Link to="/privacy" className="text-solar-500 underline">Privacy Policy</Link> for details.
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={accept} className="btn-primary !text-xs !py-1.5 !px-3">Accept</button>
            <button onClick={decline} className="btn-secondary !text-xs !py-1.5 !px-3">Decline</button>
          </div>
        </div>
      </div>
    </div>
  );
}
