/** Calendar "today" aligned with Sudan (+02:00) — matches production DB_SERVICE_TIMEZONE. */
export function serviceTodayYmd() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Khartoum",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysYmd(ymd, delta) {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isServiceDayInWindow(ymd, maxOff, anchor = serviceTodayYmd()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const end = addDaysYmd(anchor, maxOff);
  return ymd >= anchor && ymd <= end;
}

export function isoDateKey(rowDay) {
  if (!rowDay) return "";
  if (rowDay instanceof Date) {
    const y = rowDay.getFullYear();
    const m = String(rowDay.getMonth() + 1).padStart(2, "0");
    const d = String(rowDay.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(rowDay);
  return s.length >= 10 ? s.slice(0, 10) : s;
}
