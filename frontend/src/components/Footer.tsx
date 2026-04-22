import { Link } from "react-router-dom";
import { Sun } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-7 h-7 bg-solar-500 rounded-lg flex items-center justify-center">
                <Sun className="w-4 h-4 text-white" />
              </div>
              SolMatch
            </div>
            <p className="text-sm leading-relaxed">South Africa's solar installer marketplace. Find verified installers, calculate your ROI, and go solar with confidence.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/calculator" className="hover:text-white transition-colors">ROI Calculator</Link></li>
              <li><Link to="/installers" className="hover:text-white transition-colors">Find Installers</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">List Your Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy (POPIA)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:aidangsmit@gmail.com" className="hover:text-white transition-colors">aidangsmit@gmail.com</a></li>
              <li>Cape Town, South Africa</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} SolMatch (Pty) Ltd. All rights reserved.</p>
          <p>Protected under the Protection of Personal Information Act (POPIA) No. 4 of 2013</p>
        </div>
      </div>
    </footer>
  );
}
