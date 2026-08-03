export function toDayString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayString(): string {
  return toDayString(new Date());
}

export function isDayString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function addDays(day: string, delta: number): string {
  const [year, month, date] = day.split("-").map(Number);
  const next = new Date(year, month - 1, date + delta);
  return toDayString(next);
}
