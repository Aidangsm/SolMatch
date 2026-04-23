// SA-specific ROI calculation constants
const ESKOM_TARIFF_ZAR_PER_KWH = 2.9; // 2025/2026 residential rate
const PEAK_SUN_HOURS_SA = 5.5; // SA average daily peak sun hours
const COST_PER_KW_INSTALLED = 18000; // ZAR, mid-range residential install
const CO2_KG_PER_KWH_SA = 0.9; // SA grid emission factor
const ANNUAL_TARIFF_INCREASE = 0.08; // 8% annual Eskom tariff hike estimate
const PANEL_DEGRADATION = 0.005; // 0.5% per year

export interface ROIInput {
  monthlyBill: number; // ZAR
  roofAreaM2?: number;
  includesBattery?: boolean;
}

export interface ROIResult {
  monthlyBillZar: number;
  estimatedKwhPerMonth: number;
  estimatedKwhPerDay: number;
  estimatedKwhPerHour: number;
  estimatedKwhPerMinute: number;
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

export function calculateROI(input: ROIInput): ROIResult {
  const { monthlyBill, includesBattery = false } = input;

  const kwhPerMonth = monthlyBill / ESKOM_TARIFF_ZAR_PER_KWH;
  const kwhPerDay = kwhPerMonth / 30;
  const systemKw = Math.ceil((kwhPerDay / PEAK_SUN_HOURS_SA) * 10) / 10;

  const baseCost = systemKw * COST_PER_KW_INSTALLED;
  const batteryCost = includesBattery ? systemKw * 8000 : 0;
  const totalCost = baseCost + batteryCost;

  const annualSavings = kwhPerMonth * 12 * ESKOM_TARIFF_ZAR_PER_KWH;
  const monthlySavings = annualSavings / 12;
  const paybackYears = totalCost / annualSavings;

  // Project 10 and 20 year savings with tariff increases and panel degradation
  let cumulativeSavings = -totalCost;
  for (let year = 1; year <= 10; year++) {
    const degradationFactor = Math.pow(1 - PANEL_DEGRADATION, year);
    const tariffFactor = Math.pow(1 + ANNUAL_TARIFF_INCREASE, year);
    cumulativeSavings += annualSavings * degradationFactor * tariffFactor;
  }
  const tenYearSavings = cumulativeSavings;

  let cumulativeSavings20 = -totalCost;
  for (let year = 1; year <= 20; year++) {
    const degradationFactor = Math.pow(1 - PANEL_DEGRADATION, year);
    const tariffFactor = Math.pow(1 + ANNUAL_TARIFF_INCREASE, year);
    cumulativeSavings20 += annualSavings * degradationFactor * tariffFactor;
  }

  const co2PerYear = kwhPerMonth * 12 * CO2_KG_PER_KWH_SA;
  const trees = Math.round(co2PerYear / 21); // avg tree absorbs ~21kg CO2/year

  const panelWatts = 550;
  const panels = Math.ceil((systemKw * 1000) / panelWatts);

  const kwhPerHour = kwhPerDay / 24;
  const kwhPerMinute = kwhPerHour / 60;

  return {
    monthlyBillZar: monthlyBill,
    estimatedKwhPerMonth: Math.round(kwhPerMonth),
    estimatedKwhPerDay: Math.round(kwhPerDay * 10) / 10,
    estimatedKwhPerHour: Math.round(kwhPerHour * 100) / 100,
    estimatedKwhPerMinute: Math.round(kwhPerMinute * 10000) / 10000,
    recommendedSystemKw: systemKw,
    estimatedSystemCost: Math.round(totalCost),
    estimatedMonthlySavings: Math.round(monthlySavings),
    estimatedAnnualSavings: Math.round(annualSavings),
    paybackYears: Math.round(paybackYears * 10) / 10,
    tenYearSavings: Math.round(tenYearSavings),
    twentyYearSavings: Math.round(cumulativeSavings20),
    co2OffsetKgPerYear: Math.round(co2PerYear),
    co2EquivTrees: trees,
    systemComponents: {
      panels,
      panelWatts,
      inverterKw: systemKw,
      batteryKwh: includesBattery ? Math.ceil(systemKw * 2) : undefined,
    },
  };
}
