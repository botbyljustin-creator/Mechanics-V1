export function formatValue(v, unit) {
  if (unit === "$") return "$" + Number(v).toLocaleString();
  if (unit === "%") return Number(v).toLocaleString() + "%";
  return Number(v).toLocaleString() + (unit ? " " + unit : "");
}

export function healthOf(kpi) {
  const { target, actual, higherBetter } = kpi;
  if (target === 0) return "warn";
  const ratio = higherBetter ? actual / target : target / actual;
  if (ratio >= 1) return "good";
  if (ratio >= 0.8) return "warn";
  return "bad";
}

export const HEALTH_COLOR = { good: "var(--green)", warn: "var(--amber)", bad: "var(--red)" };

export const FLOW_CHAIN = ["Business Development", "Operations", "Billing", "Collections", "Cash Flow", "Hiring Capacity", "Growth"];
