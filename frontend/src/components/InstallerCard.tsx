import { Link } from "react-router-dom";
import { Star, MapPin, ShieldCheck, Zap } from "lucide-react";

interface Installer {
  id: string;
  companyName: string;
  province: string;
  city: string;
  description: string;
  avgRating: number;
  totalReviews: number;
  yearsExperience: number;
  verified: boolean;
  badgeActive: boolean;
  systemTypes: string[];
  priceRangeMin?: number;
  priceRangeMax?: number;
  logoUrl?: string;
}

export default function InstallerCard({ installer }: { installer: Installer }) {
  return (
    <div className={`card p-5 hover:shadow-md transition-shadow flex flex-col gap-3 ${installer.badgeActive ? "ring-2 ring-solar-400" : ""}`}>
      {installer.badgeActive && (
        <div className="badge-featured self-start"><Zap className="w-3 h-3" /> Featured</div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {installer.logoUrl && (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 shrink-0">
              <img src={installer.logoUrl} alt={installer.companyName} className="w-full h-full object-contain" />
            </div>
          )}
          <div>
          <h3 className="font-bold text-gray-900">{installer.companyName}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {installer.city}, {installer.province}
          </div>
          </div>
        </div>
        {installer.verified && (
          <div className="badge-verified shrink-0"><ShieldCheck className="w-3 h-3" /> Verified</div>
        )}
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{installer.description}</p>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-yellow-400" />
          <span className="font-semibold text-gray-900">{installer.avgRating.toFixed(1)}</span>
          <span className="text-gray-400">({installer.totalReviews})</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">{installer.yearsExperience}+ yrs exp</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {installer.systemTypes.slice(0, 3).map((t) => (
          <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">{t}</span>
        ))}
      </div>

      {installer.priceRangeMin && (
        <p className="text-xs text-gray-500">
          From <span className="font-semibold text-gray-700">R{installer.priceRangeMin.toLocaleString()}</span>
        </p>
      )}

      <Link to={`/installers/${installer.id}`} className="btn-primary w-full justify-center mt-auto !text-sm">
        View Profile & Get Quote
      </Link>
    </div>
  );
}
