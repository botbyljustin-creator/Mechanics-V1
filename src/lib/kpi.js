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

export function sparklinePoints(values, width = 120, height = 32, pad = 4) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((v, i) => {
    const x = values.length > 1 ? i * stepX : width;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return { x, y };
  });
}

export function trendDirection(values, higherBetter) {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const threshold = Math.max(Math.abs(first), Math.abs(last)) * 0.03 || 0.5;
  if (Math.abs(delta) < threshold) {
    return { arrow: "→", word: "flat / choppy", tone: "muted" };
  }
  const improving = higherBetter ? delta > 0 : delta < 0;
  return {
    arrow: delta > 0 ? "↑" : "↓",
    word: improving ? "improving" : "worsening",
    tone: improving ? "good" : "bad",
  };
}
