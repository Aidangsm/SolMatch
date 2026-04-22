import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Calculator, Search, Clock, CheckCircle, XCircle } from "lucide-react";

interface Quote {
  id: string;
  status: string;
  monthlyBill: number;
  systemSizeKw: number;
  estimatedCost?: number;
  province: string;
  city: string;
  createdAt: string;
  installer: { companyName: string; phone: string; email: string; avgRating: number; verified: boolean };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   color: "bg-yellow-50 text-yellow-700",  icon: <Clock className="w-3.5 h-3.5" /> },
  ACCEPTED:  { label: "Accepted",  color: "bg-brand-50 text-brand-700",    icon: <CheckCircle className="w-3.5 h-3.5" /> },
  DECLINED:  { label: "Declined",  color: "bg-red-50 text-red-600",        icon: <XCircle className="w-3.5 h-3.5" /> },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-600",     icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

export default function HomeownerDashboard() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/quotes/mine")
      .then(({ data }) => setQuotes(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {user?.firstName}</h1>
        <p className="text-gray-500 mt-1">Manage your solar quote requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/calculator" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 bg-solar-100 rounded-xl flex items-center justify-center"><Calculator className="w-5 h-5 text-solar-600" /></div>
          <div><p className="font-semibold text-gray-900">ROI Calculator</p><p className="text-sm text-gray-500">Recalculate your savings</p></div>
        </Link>
        <Link to="/installers" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 bg-brand-100 rounded-xl flex items-center justify-center"><Search className="w-5 h-5 text-brand-600" /></div>
          <div><p className="font-semibold text-gray-900">Find Installers</p><p className="text-sm text-gray-500">Browse &amp; request more quotes</p></div>
        </Link>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">My Quote Requests <span className="text-gray-400 font-normal text-base">({quotes.length})</span></h2>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-5 h-24 animate-pulse bg-gray-50" />)}</div>
      ) : quotes.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <p className="mb-3">No quote requests yet.</p>
          <Link to="/installers" className="btn-primary">Browse Installers</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => {
            const s = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.PENDING;
            return (
              <div key={q.id} className="card p-5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900">{q.installer.companyName}</p>
                    <p className="text-sm text-gray-500">{q.city}, {q.province} · {q.systemSizeKw} kW system</p>
                    <p className="text-sm text-gray-500">Monthly bill: <strong>R{q.monthlyBill.toLocaleString()}</strong>
                      {q.estimatedCost && <> · Quoted: <strong className="text-brand-600">R{q.estimatedCost.toLocaleString()}</strong></>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${s.color}`}>{s.icon}{s.label}</span>
                    <span className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString("en-ZA")}</span>
                  </div>
                </div>
                {q.status === "ACCEPTED" && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex gap-3 text-sm">
                    <a href={`tel:${q.installer.phone}`} className="text-solar-500 hover:underline">Call {q.installer.phone}</a>
                    <a href={`mailto:${q.installer.email}`} className="text-solar-500 hover:underline">{q.installer.email}</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
