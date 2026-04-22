import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, XCircle, User, CreditCard } from "lucide-react";

interface Lead {
  id: string;
  status: string;
  leadFeePaid: boolean;
  monthlyBill: number;
  systemSizeKw: number;
  province: string;
  city: string;
  propertyType: string;
  notes?: string;
  createdAt: string;
  homeowner: { firstName: string; lastName: string; email: string; phone?: string };
}

export default function InstallerDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    const result = searchParams.get("payment");
    if (result === "success") setToast({ type: "success", msg: "Payment successful — lead accepted. The homeowner has been notified." });
    if (result === "cancelled") setToast({ type: "error", msg: "Payment cancelled. The lead is still available to accept." });
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    api.get("/quotes/leads")
      .then(({ data }) => setLeads(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const payToAccept = async (lead: Lead, estimatedCost?: number) => {
    setUpdating(lead.id);
    try {
      const { data } = await api.post(`/payments/lead/${lead.id}`, {});
      if (estimatedCost) {
        await api.patch(`/quotes/${lead.id}`, { estimatedCost }).catch(() => {});
      }
      // Build and submit form to PayFast
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.url;
      Object.entries(data.params).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      setToast({ type: "error", msg: "Could not initiate payment. Please try again." });
      setUpdating(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const { data } = await api.patch(`/quotes/${id}`, { status });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    } finally {
      setUpdating(null);
    }
  };

  const pending = leads.filter(l => l.status === "PENDING");
  const active = leads.filter(l => l.status === "ACCEPTED");
  const closed = leads.filter(l => ["DECLINED", "COMPLETED"].includes(l.status));

  if (!user?.installer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Set up your installer profile</h2>
        <p className="text-gray-500 mb-6">Create your profile to start receiving leads from homeowners.</p>
        <Link to="/installer-profile/new" className="btn-primary">Create Profile</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Installer Dashboard</h1>
          <p className="text-gray-500 mt-0.5">{user.installer.companyName}</p>
        </div>
        <div className="flex gap-2">
          <div className="card px-4 py-2 text-center"><p className="text-xl font-bold text-solar-500">{pending.length}</p><p className="text-xs text-gray-500">New Leads</p></div>
          <div className="card px-4 py-2 text-center"><p className="text-xl font-bold text-brand-600">{active.length}</p><p className="text-xs text-gray-500">Active</p></div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 h-24 animate-pulse bg-gray-50" />)}</div>
      ) : leads.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">No leads yet. Make sure your profile is complete and verified.</div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && <Section title="New Leads" leads={pending} onPayAccept={payToAccept} onUpdate={updateStatus} updating={updating} showActions />}
          {active.length > 0 && <Section title="Active Quotes" leads={active} onPayAccept={payToAccept} onUpdate={updateStatus} updating={updating} />}
          {closed.length > 0 && <Section title="Closed" leads={closed} onPayAccept={payToAccept} onUpdate={updateStatus} updating={updating} muted />}
        </div>
      )}
    </div>
  );
}

function Section({ title, leads, onPayAccept, onUpdate, updating, showActions, muted }: {
  title: string;
  leads: Lead[];
  onPayAccept: (lead: Lead, cost?: number) => void;
  onUpdate: (id: string, status: string) => void;
  updating: string | null;
  showActions?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <h2 className={`text-base font-bold mb-3 ${muted ? "text-gray-400" : "text-gray-900"}`}>{title} ({leads.length})</h2>
      <div className="space-y-3">
        {leads.map(l => (
          <LeadCard key={l.id} lead={l} onPayAccept={onPayAccept} onUpdate={onUpdate} updating={updating} showActions={showActions} />
        ))}
      </div>
    </div>
  );
}

function LeadCard({ lead, onPayAccept, onUpdate, updating, showActions }: {
  lead: Lead;
  onPayAccept: (lead: Lead, cost?: number) => void;
  onUpdate: (id: string, status: string) => void;
  updating: string | null;
  showActions?: boolean;
}) {
  const [cost, setCost] = useState("");
  const busy = updating === lead.id;

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
          <div>
            <p className="font-semibold text-gray-900">{lead.homeowner.firstName} {lead.homeowner.lastName}</p>
            <p className="text-sm text-gray-500">{lead.city}, {lead.province} · {lead.systemSizeKw} kW · R{lead.monthlyBill.toLocaleString()}/mo bill</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString("en-ZA")}</span>
      </div>

      {lead.notes && <p className="text-sm text-gray-600 mt-2 italic">"{lead.notes}"</p>}

      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-50">
        <a href={`mailto:${lead.homeowner.email}`} className="text-sm text-solar-500 hover:underline">{lead.homeowner.email}</a>
        {lead.homeowner.phone && <a href={`tel:${lead.homeowner.phone}`} className="text-sm text-solar-500 hover:underline">{lead.homeowner.phone}</a>}
      </div>

      {showActions && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            A once-off lead fee of <strong className="text-gray-600">R500</strong> is charged on acceptance via PayFast.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="input !w-36 !py-1.5 text-sm"
              placeholder="Quote amount (R)"
            />
            <button
              disabled={busy}
              onClick={() => onPayAccept(lead, cost ? Number(cost) : undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {busy ? "Redirecting…" : "Pay R500 & Accept"}
            </button>
            <button
              disabled={busy}
              onClick={() => onUpdate(lead.id, "DECLINED")}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      )}

      {lead.status === "ACCEPTED" && (
        <button onClick={() => onUpdate(lead.id, "COMPLETED")} disabled={busy}
          className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg">
          <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
        </button>
      )}
    </div>
  );
}
