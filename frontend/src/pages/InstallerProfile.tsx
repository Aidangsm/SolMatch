import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe, ShieldCheck, Star, Zap, Calendar, Award } from "lucide-react";
import { api } from "../lib/api";
import QuoteModal from "../components/QuoteModal";
import SEO from "../components/SEO";

interface InstallerDetail {
  id: string;
  companyName: string;
  province: string;
  city: string;
  address?: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  avgRating: number;
  totalReviews: number;
  yearsExperience: number;
  verified: boolean;
  badgeActive: boolean;
  systemTypes: string[];
  certifications: string[];
  priceRangeMin?: number;
  priceRangeMax?: number;
  reviews: { id: string; rating: number; reviewerName: string; comment?: string; createdAt: string }[];
  user: { firstName: string; lastName: string; createdAt: string };
}

export default function InstallerProfile() {
  const { id } = useParams<{ id: string }>();
  const [installer, setInstaller] = useState<InstallerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/installers/${id}`)
      .then(({ data }) => setInstaller(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><div className="card p-8 animate-pulse h-96 bg-gray-50" /></div>;
  if (!installer) return <div className="text-center py-20 text-gray-500">Installer not found. <Link to="/installers" className="text-solar-500 underline">Browse all</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <SEO
        title={`${installer.companyName} — Solar Installer in ${installer.city}, ${installer.province}`}
        description={`${installer.companyName} is a ${installer.verified ? "verified " : ""}solar installer based in ${installer.city}, ${installer.province}. ${installer.yearsExperience}+ years experience. ${installer.totalReviews} reviews. Get a free quote today.`}
        canonical={`/installers/${installer.id}`}
      />
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 bg-solar-100 rounded-2xl flex items-center justify-center text-solar-600 font-bold text-2xl shrink-0">
            {installer.companyName[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{installer.companyName}</h1>
              {installer.verified && <span className="badge-verified"><ShieldCheck className="w-3 h-3" /> Verified</span>}
              {installer.badgeActive && <span className="badge-featured"><Zap className="w-3 h-3" /> Featured</span>}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{installer.city}, {installer.province}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{installer.yearsExperience}+ years experience</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(installer.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
              ))}
              <span className="text-sm font-semibold text-gray-900 ml-1">{installer.avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({installer.totalReviews} reviews)</span>
            </div>
          </div>
          <button onClick={() => setShowQuote(true)} className="btn-primary shrink-0">Get Free Quote</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{installer.description}</p>
          </div>

          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {installer.certifications.map(c => (
                <span key={c} className="flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 text-sm font-medium rounded-full">
                  <Award className="w-3 h-3" />{c}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4">Customer Reviews</h2>
            {installer.reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {installer.reviews.map(r => (
                  <div key={r.id} className="pb-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}</div>
                      <span className="text-sm font-medium text-gray-700">{r.reviewerName}</span>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-ZA")}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contact</h3>
            <div className="space-y-2 text-sm">
              <a href={`tel:${installer.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-solar-500"><Phone className="w-4 h-4" />{installer.phone}</a>
              <a href={`mailto:${installer.email}`} className="flex items-center gap-2 text-gray-600 hover:text-solar-500"><Mail className="w-4 h-4" />{installer.email}</a>
              {installer.website && <a href={installer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-solar-500"><Globe className="w-4 h-4" />Website</a>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">System Types</h3>
            <div className="flex flex-wrap gap-1">
              {installer.systemTypes.map(t => <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">{t}</span>)}
            </div>
          </div>

          {installer.priceRangeMin && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Pricing</h3>
              <p className="text-lg font-bold text-gray-900">R{installer.priceRangeMin.toLocaleString()} – R{installer.priceRangeMax?.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Typical system range</p>
            </div>
          )}

          <button onClick={() => setShowQuote(true)} className="btn-primary w-full justify-center">
            Request Free Quote
          </button>
        </div>
      </div>

      {showQuote && <QuoteModal installerId={installer.id} installerName={installer.companyName} onClose={() => setShowQuote(false)} />}
    </div>
  );
}
