/** Границы календарного дня в Москве (UTC+3, без DST). */
export function dayStartMoscow(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00+03:00`);
}

export function dayEndMoscow(isoDate: string): Date {
  return new Date(`${isoDate}T23:59:59.999+03:00`);
}

const moscowDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Moscow",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Сегодняшняя дата YYYY-MM-DD по Москве. */
export function todayIsoMoscow(): string {
  return moscowDateFormatter.format(new Date());
}

/** Календарное смещение ISO-даты (без привязки к TZ суток). */
export function addDaysIsoMoscow(isoDate: string, deltaDays: number): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const utc = Date.UTC(y, mo - 1, d + deltaDays);
  const nd = new Date(utc);
  return `${nd.getUTCFullYear()}-${String(nd.getUTCMonth() + 1).padStart(2, "0")}-${String(
    nd.getUTCDate()
  ).padStart(2, "0")}`;
}

/** Первый день месяца для даты YYYY-MM-DD (по полям строки). */
export function firstDayOfMonthIso(isoDate: string): string {
  const [y, m] = isoDate.split("-").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

export type RangePreset = "today" | "week" | "month";

export function resolveRangeFromSearchParams(searchParams: {
  get: (k: string) => string | null;
}): { from: string; to: string; preset: RangePreset | "custom" } {
  const fromParam = searchParams.get("from")?.trim();
  const toParam = searchParams.get("to")?.trim();
  const presetRaw = searchParams.get("preset")?.trim() as RangePreset | "custom" | null;

  const today = todayIsoMoscow();

  if (fromParam && toParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam) && /^\d{4}-\d{2}-\d{2}$/.test(toParam)) {
    return { from: fromParam, to: toParam, preset: "custom" };
  }

  const preset: RangePreset =
    presetRaw === "today" || presetRaw === "month" ? presetRaw : "week";

  if (preset === "today") {
    return { from: today, to: today, preset: "today" };
  }
  if (preset === "month") {
    return { from: firstDayOfMonthIso(today), to: today, preset: "month" };
  }
  // week: последние 7 календарных дней включительно
  return { from: addDaysIsoMoscow(today, -6), to: today, preset: "week" };
}

/** Все календарные дни от from до to включительно. */
export function enumerateDaysInclusive(fromIso: string, toIso: string): string[] {
  const days: string[] = [];
  let cur = fromIso;
  while (cur <= toIso) {
    days.push(cur);
    cur = addDaysIsoMoscow(cur, 1);
  }
  return days;
}

export function countDaysInclusive(fromIso: string, toIso: string): number {
  return enumerateDaysInclusive(fromIso, toIso).length;
}

/** Date из БД → YYYY-MM-DD по Москве. */
export function isoDateFromDbDate(d: Date): string {
  return moscowDateFormatter.format(d);
}

export function previousPeriodSameLength(fromIso: string, toIso: string): {
  from: string;
  to: string;
} {
  const startMs = dayStartMoscow(fromIso).getTime();
  const endDayMs = dayStartMoscow(toIso).getTime();
  const inclusiveDays =
    Math.floor((endDayMs - startMs) / 86400000) + 1;
  const prevToIso = addDaysIsoMoscow(fromIso, -1);
  const prevFromIso = addDaysIsoMoscow(fromIso, -inclusiveDays);
  return { from: prevFromIso, to: prevToIso };
}
