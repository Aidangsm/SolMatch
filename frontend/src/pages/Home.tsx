import { Link } from "react-router-dom";
import { Sun, ShieldCheck, Calculator, Star, ArrowRight, Zap, TrendingUp, Users } from "lucide-react";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <div>
      <SEO
        title="SolMatch — Solar Installer Marketplace South Africa"
        description="Find verified solar installers in South Africa. Calculate your ROI, compare quotes, and go solar with confidence. SA-specific Eskom tariff calculations."
        canonical="/"
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #ff7c0a 0%, transparent 60%), radial-gradient(circle at 80% 20%, #ffc06d 0%, transparent 40%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-solar-500/20 border border-solar-500/30 rounded-full text-solar-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> South Africa's Solar Marketplace
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Go solar with <span className="text-solar-400">confidence</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Calculate your exact ROI, then connect with verified solar installers near you. No guesswork — just data, trust, and savings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/calculator" className="btn-primary text-base !px-6 !py-3">
                Calculate My Savings <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/installers" className="btn-secondary text-base !px-6 !py-3 !bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                Browse Installers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-solar-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { val: "500+", label: "Verified Installers" },
            { val: "R2.90", label: "Per kWh (Eskom 2025)" },
            { val: "1GW+", label: "Private Solar Added in 2024" },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold">{val}</p>
              <p className="text-solar-100 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">How SolMatch Works</h2>
          <p className="text-gray-500 mt-2">Three steps from curious to solar-powered</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Calculator className="w-7 h-7 text-solar-500" />, step: "1", title: "Calculate Your ROI", desc: "Enter your Eskom bill. Our SA-specific calculator shows payback period, monthly savings, and 20-year returns in seconds." },
            { icon: <Users className="w-7 h-7 text-solar-500" />, step: "2", title: "Match With Installers", desc: "Browse verified, rated installers filtered by province, system type, and budget. Every installer is vetted and SAPVIA-aware." },
            { icon: <TrendingUp className="w-7 h-7 text-solar-500" />, step: "3", title: "Get Competing Quotes", desc: "Request quotes from multiple installers and compare. No obligation — you choose who to work with." },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-solar-50 rounded-xl flex items-center justify-center">{icon}</div>
                <span className="text-3xl font-black text-gray-100">0{step}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Built on Trust</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck className="w-6 h-6 text-brand-600" />, title: "POPIA Compliant", desc: "Your personal data is protected under the Protection of Personal Information Act. We never sell your data." },
              { icon: <Star className="w-6 h-6 text-yellow-500" />, title: "Verified Reviews", desc: "All reviews are from confirmed customers. Star ratings are calculated from real, completed installations." },
              { icon: <Sun className="w-6 h-6 text-solar-500" />, title: "SAPVIA-Aware Vetting", desc: "Installer verification checks SAPVIA membership, PV GreenCard status, and SAQCC registration." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to slash your electricity bill?</h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">Most SA homeowners save 60–80% on electricity costs after going solar. Find out your number in 30 seconds.</p>
        <Link to="/calculator" className="btn-primary text-lg !px-8 !py-4">
          Start Free Calculator <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
