import { useState } from "react";
import { useForm } from "react-hook-form";
import SEO from "../components/SEO";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator as CalcIcon } from "lucide-react";
import { api } from "../lib/api";
import ROIResult from "../components/ROIResult";

const schema = z.object({
  monthlyBill: z.number({ invalid_type_error: "Enter your monthly bill" }).min(100, "Minimum R100").max(100000),
  includesBattery: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function Calculator() {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { includesBattery: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      const { data: roi } = await api.post("/calculator", data);
      setResult(roi);
    } catch {
      setError("Calculation failed. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="Solar ROI Calculator South Africa | SolMatch"
        description="Calculate your solar payback period, monthly savings, and 20-year return using South Africa's Eskom 2025/2026 residential tariff. Free, instant, SA-specific."
        canonical="/calculator"
      />
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-solar-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CalcIcon className="w-7 h-7 text-solar-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Solar ROI Calculator</h1>
        <p className="text-gray-500 mt-2">SA-specific numbers using Eskom's 2025/2026 residential tariff (R2.90/kWh)</p>
      </div>

      <div className="card p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Average Monthly Eskom Bill (R)</label>
            <input
              type="number"
              {...register("monthlyBill", { valueAsNumber: true })}
              className="input text-lg font-semibold"
              placeholder="e.g. 2500"
            />
            {errors.monthlyBill && <p className="text-xs text-red-500 mt-1">{errors.monthlyBill.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Check your latest Eskom or municipal electricity bill</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register("includesBattery")} className="w-4 h-4 accent-solar-500 rounded" />
            <div>
              <span className="text-sm font-medium text-gray-700">Include battery backup</span>
              <p className="text-xs text-gray-400">Adds lithium battery storage for load-shedding protection</p>
            </div>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center text-base !py-3">
            {isSubmitting ? "Calculating..." : "Calculate My Solar ROI"}
          </button>
        </form>
      </div>

      {result && <ROIResult data={result as Parameters<typeof ROIResult>[0]["data"]} />}

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 leading-relaxed">
        <strong>Disclaimer:</strong> These estimates are indicative only and based on Eskom's 2025/2026 residential tariff of R2.90/kWh, 5.5 peak sun hours (SA average), and installation costs of R18,000/kW. Actual costs and savings vary by location, installer, roof type, usage profile, and municipal tariff. SolMatch accepts no liability for financial decisions made based on these estimates. Always obtain at least three installer quotes before committing to a system.
      </div>
    </div>
  );
}
