import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api";

const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"] as const;
const SYSTEM_TYPES = ["residential","commercial","agricultural","off-grid","hybrid"] as const;
const CERTS = ["SAPVIA","SAQCC","PV GreenCard","ECSA","NERSA"] as const;

const schema = z.object({
  companyName: z.string().min(2, "Required").max(100),
  registrationNo: z.string().optional(),
  vatNo: z.string().optional(),
  description: z.string().min(20, "Min 20 characters — describe your business").max(1000),
  province: z.enum(PROVINCES),
  city: z.string().min(2, "Required"),
  address: z.string().optional(),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Valid email required"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  yearsExperience: z.number({ invalid_type_error: "Required" }).int().min(0).max(50),
  systemTypes: z.array(z.enum(SYSTEM_TYPES)).min(1, "Select at least one"),
  certifications: z.array(z.enum(CERTS)).default([]),
  minSystemSize: z.number().optional(),
  maxSystemSize: z.number().optional(),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function CreateInstallerProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoData, setLogoData] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3_000_000) { setError("Logo must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setLogoData(result);
    };
    reader.readAsDataURL(file);
  };

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { systemTypes: [], certifications: [] },
  });

  const selectedTypes = watch("systemTypes");
  const selectedCerts = watch("certifications");

  const toggleArray = (field: "systemTypes" | "certifications", val: string) => {
    const current = (field === "systemTypes" ? selectedTypes : selectedCerts) as string[];
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    setValue(field, next as never, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await api.post("/installers", { ...data, logoUrl: logoData ?? undefined });
      navigate("/installer-dashboard");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || "Failed to create profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create Installer Profile</h1>
      <p className="text-gray-500 text-sm mb-8">Your profile is how homeowners find and evaluate you. Fill it in completely to maximise leads.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo Upload */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Company Logo</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {logoPreview
                ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                : <span className="text-xs text-gray-400 text-center px-2">No logo</span>}
            </div>
            <div>
              <label className="btn-secondary cursor-pointer text-sm">
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG · Max 3MB</p>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Business Details</h2>
          <Field label="Company Name *" error={errors.companyName?.message}>
            <input {...register("companyName")} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CIPC Registration No." error={errors.registrationNo?.message}>
              <input {...register("registrationNo")} className="input" placeholder="2020/123456/07" />
            </Field>
            <Field label="VAT Number" error={errors.vatNo?.message}>
              <input {...register("vatNo")} className="input" placeholder="4012345678" />
            </Field>
          </div>
          <Field label="Business Description *" error={errors.description?.message} hint="Describe your experience, specialisations, and what sets you apart">
            <textarea {...register("description")} className="input !h-28 resize-none" />
          </Field>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Location</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Province *" error={errors.province?.message}>
              <select {...register("province")} className="input">
                <option value="">Select...</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="City *" error={errors.city?.message}>
              <input {...register("city")} className="input" />
            </Field>
          </div>
          <Field label="Street Address" error={errors.address?.message}>
            <input {...register("address")} className="input" />
          </Field>
        </div>

        {/* Contact */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Contact Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone *" error={errors.phone?.message}>
              <input {...register("phone")} className="input" placeholder="021 555 0100" />
            </Field>
            <Field label="Business Email *" error={errors.email?.message}>
              <input type="email" {...register("email")} className="input" />
            </Field>
          </div>
          <Field label="Website" error={errors.website?.message}>
            <input {...register("website")} className="input" placeholder="https://yoursite.co.za" />
          </Field>
        </div>

        {/* Expertise */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Expertise</h2>
          <Field label="Years in Business *" error={errors.yearsExperience?.message}>
            <input type="number" {...register("yearsExperience", { valueAsNumber: true })} className="input !w-32" min={0} max={50} />
          </Field>

          <Field label="System Types *" error={errors.systemTypes?.message}>
            <div className="flex flex-wrap gap-2 mt-1">
              {SYSTEM_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => toggleArray("systemTypes", t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${selectedTypes.includes(t) ? "bg-solar-500 text-white border-solar-500" : "bg-white text-gray-600 border-gray-200 hover:border-solar-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Certifications">
            <div className="flex flex-wrap gap-2 mt-1">
              {CERTS.map(c => (
                <button key={c} type="button"
                  onClick={() => toggleArray("certifications", c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedCerts.includes(c) ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
                  {c}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Pricing & System Size</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min System Size (kW)" error={errors.minSystemSize?.message}>
              <input type="number" step="0.5" {...register("minSystemSize", { valueAsNumber: true })} className="input" placeholder="3" />
            </Field>
            <Field label="Max System Size (kW)" error={errors.maxSystemSize?.message}>
              <input type="number" {...register("maxSystemSize", { valueAsNumber: true })} className="input" placeholder="500" />
            </Field>
            <Field label="Price Range Min (R)" error={errors.priceRangeMin?.message}>
              <input type="number" {...register("priceRangeMin", { valueAsNumber: true })} className="input" placeholder="50000" />
            </Field>
            <Field label="Price Range Max (R)" error={errors.priceRangeMax?.message}>
              <input type="number" {...register("priceRangeMax", { valueAsNumber: true })} className="input" placeholder="500000" />
            </Field>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center text-base !py-3">
          {isSubmitting ? "Creating Profile..." : "Create Installer Profile"}
        </button>
      </form>
    </div>
  );
}
