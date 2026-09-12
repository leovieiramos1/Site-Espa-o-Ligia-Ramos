export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Domingo como início de semana. */
export function startOfWeek(d: Date) {
  const s = startOfDay(d);
  return addDays(s, -s.getDay());
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfNextMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

/** Formata uma data local como "YYYY-MM-DD" sem passar por UTC (evita off-by-one). */
export function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Interpreta um "YYYY-MM-DD" como data local (não UTC). */
export function parseDateParam(value?: string): Date {
  if (!value) return startOfDay(new Date());
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return startOfDay(new Date());
  return new Date(y, m - 1, d);
}

export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
