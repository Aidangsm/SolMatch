import { TrendingUp, Zap, Leaf, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface ROIData {
  monthlyBillZar: number;
  estimatedKwhPerMonth: number;
  recommendedSystemKw: number;
  estimatedSystemCost: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  paybackYears: number;
  tenYearSavings: number;
  twentyYearSavings: number;
  co2OffsetKgPerYear: number;
  co2EquivTrees: number;
  systemComponents: {
    panels: number;
    panelWatts: number;
    inverterKw: number;
    batteryKwh?: number;
  };
}

export default function ROIResult({ data }: { data: ROIData }) {
  const fmt = (n: number) => `R${Math.abs(n).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat icon={<DollarSign className="w-5 h-5 text-solar-500" />} label="Monthly Savings" value={fmt(data.estimatedMonthlySavings)} sub="estimated" />
        <Stat icon={<Clock className="w-5 h-5 text-brand-500" />} label="Payback Period" value={`${data.paybackYears} yrs`} sub="break-even" />
        <Stat icon={<TrendingUp className="w-5 h-5 text-blue-500" />} label="10-Year Savings" value={fmt(data.tenYearSavings)} sub={data.tenYearSavings >= 0 ? "profit" : "deficit"} />
        <Stat icon={<Leaf className="w-5 h-5 text-green-500" />} label="CO₂ Offset" value={`${data.co2EquivTrees} trees`} sub="equivalent/yr" />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Recommended System</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500">System Size</p><p className="font-bold text-lg">{data.recommendedSystemKw} kW</p></div>
          <div><p className="text-gray-500">Panels</p><p className="font-bold text-lg">{data.systemComponents.panels}× {data.systemComponents.panelWatts}W</p></div>
          <div><p className="text-gray-500">Inverter</p><p className="font-bold text-lg">{data.systemComponents.inverterKw} kW</p></div>
          {data.systemComponents.batteryKwh && (
            <div><p className="text-gray-500">Battery</p><p className="font-bold text-lg">{data.systemComponents.batteryKwh} kWh</p></div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Estimated Install Cost</p>
            <p className="font-bold text-2xl text-gray-900">{fmt(data.estimatedSystemCost)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">20-Year Return</p>
            <p className={`font-bold text-2xl ${data.twentyYearSavings >= 0 ? "text-brand-600" : "text-red-500"}`}>{fmt(data.twentyYearSavings)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-solar-50 rounded-xl text-sm text-solar-800">
        <Zap className="w-4 h-4 shrink-0" />
        Estimates use Eskom's 2025/2026 residential tariff (R2.90/kWh) with 8% annual increases. Actual savings depend on your usage profile and installer pricing.
      </div>

      <Link to={`/installers?minKw=${data.recommendedSystemKw}`} className="btn-primary w-full justify-center">
        Find Installers for a {data.recommendedSystemKw} kW System
      </Link>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500 font-medium">{label}</span></div>
      <p className="font-bold text-xl text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 capitalize">{sub}</p>
    </div>
  );
}
