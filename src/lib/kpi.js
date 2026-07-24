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

export const HEALTH_COLOR = { good: "var(--good)", warn: "var(--warn)", bad: "var(--bad)" };

export const STATUS_LEVELS = ["GOOD", "WATCH", "RISK"];

export const STATUS_LABEL = { GOOD: "On Track", WATCH: "Watch", RISK: "Red Flag" };

export function statusHealth(status) {
  if (status === "RISK") return "bad";
  if (status === "WATCH") return "warn";
  return "good";
}
