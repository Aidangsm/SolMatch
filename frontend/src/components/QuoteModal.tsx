import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Send } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  monthlyBill: z.number({ invalid_type_error: "Required" }).min(100, "Minimum R100"),
  systemSizeKw: z.number({ invalid_type_error: "Required" }).min(0.5),
  province: z.string().min(1, "Required"),
  city: z.string().min(2, "Required"),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL", "AGRICULTURAL"]),
  roofType: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];

export default function QuoteModal({ installerId, installerName, onClose }: {
  installerId: string;
  installerName: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { propertyType: "RESIDENTIAL" },
  });

  if (!user) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-6">
          <p className="text-gray-700 mb-4">You need to be logged in to request a quote.</p>
          <button onClick={() => { onClose(); navigate("/login"); }} className="btn-primary">Login to Continue</button>
        </div>
      </Modal>
    );
  }

  if (user.role !== "HOMEOWNER") {
    return (
      <Modal onClose={onClose}>
        <p className="text-center text-gray-600 py-4">Only homeowner accounts can request quotes.</p>
      </Modal>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await api.post("/quotes", { ...data, installerId });
      setSuccess(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || "Failed to send quote request");
    }
  };

  if (success) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-7 h-7 text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Quote Request Sent!</h3>
          <p className="text-gray-600 mb-4">{installerName} will contact you shortly. Track your quotes in your dashboard.</p>
          <button onClick={() => { onClose(); navigate("/dashboard"); }} className="btn-primary">View Dashboard</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Request a Quote</h2>
      <p className="text-sm text-gray-500 mb-5">From <span className="font-medium text-gray-700">{installerName}</span></p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly Eskom Bill (R)" error={errors.monthlyBill?.message}>
            <input type="number" {...register("monthlyBill", { valueAsNumber: true })} className="input" placeholder="e.g. 2500" />
          </Field>
          <Field label="System Size (kW)" error={errors.systemSizeKw?.message}>
            <input type="number" step="0.1" {...register("systemSizeKw", { valueAsNumber: true })} className="input" placeholder="e.g. 5" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Province" error={errors.province?.message}>
            <select {...register("province")} className="input">
              <option value="">Select...</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input {...register("city")} className="input" placeholder="e.g. Cape Town" />
          </Field>
        </div>
        <Field label="Property Type" error={errors.propertyType?.message}>
          <select {...register("propertyType")} className="input">
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="AGRICULTURAL">Agricultural</option>
          </select>
        </Field>
        <Field label="Roof Type (optional)">
          <input {...register("roofType")} className="input" placeholder="e.g. IBr, Tiles, Flat" />
        </Field>
        <Field label="Additional Notes (optional)">
          <textarea {...register("notes")} className="input !h-20 resize-none" placeholder="Any special requirements..." />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
          {isSubmitting ? "Sending..." : "Send Quote Request"}
        </button>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-1">
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
