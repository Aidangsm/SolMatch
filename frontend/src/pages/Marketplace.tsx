import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "../lib/api";
import InstallerCard from "../components/InstallerCard";

const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];

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
}

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [province, setProvince] = useState(searchParams.get("province") || "");
  const [city, setCity] = useState("");
  const [verified, setVerified] = useState(false);

  const fetchInstallers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (province) params.set("province", province);
      if (city) params.set("city", city);
      if (verified) params.set("verified", "true");
      const { data } = await api.get(`/installers?${params}`);
      setInstallers(data.installers);
      setTotal(data.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [province, city, verified, page]);

  useEffect(() => { fetchInstallers(); }, [fetchInstallers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Find Verified Solar Installers South Africa | SolMatch"
        description="Browse verified solar installation companies across South Africa. Filter by province, read real reviews, and get free quotes from SAPVIA-aware installers."
        canonical="/installers"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Find Solar Installers</h1>
        <p className="text-gray-500 mt-1">Verified, rated solar installers across South Africa</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <SlidersHorizontal className="w-4 h-4 text-gray-400 self-center" />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
          <select value={province} onChange={e => { setProvince(e.target.value); setPage(1); }} className="input !w-auto !py-2 text-sm">
            <option value="">All Provinces</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={city} onChange={e => { setCity(e.target.value); setPage(1); }} className="input !pl-9 !w-40 !py-2 text-sm" placeholder="Search city..." />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 pb-1">
          <input type="checkbox" checked={verified} onChange={e => { setVerified(e.target.checked); setPage(1); }} className="w-4 h-4 accent-solar-500 rounded" />
          Verified only
        </label>
        <p className="text-sm text-gray-400 self-center ml-auto">{total} installer{total !== 1 ? "s" : ""} found</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-64 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : installers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No installers found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {installers.map(i => <InstallerCard key={i.id} installer={i} />)}
        </div>
      )}

      {total > 12 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-40">Previous</button>
          <span className="flex items-center text-sm text-gray-500">Page {page} of {Math.ceil(total / 12)}</span>
          <button disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)} className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
