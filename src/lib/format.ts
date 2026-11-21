const timeFmt = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" });
const dateFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" });

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** เวลาในรายการห้อง: วันนี้ = เวลา, เมื่อวาน = "เมื่อวาน", เก่ากว่านั้น = วันที่ */
export function formatListTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (isSameDay(d, today)) return timeFmt.format(d);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, yesterday)) return "เมื่อวาน";
  return shortDateFmt.format(d);
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export function formatDate(iso: string | null): string {
  return iso ? dateFmt.format(new Date(iso)) : "-";
}

/** หัวคั่นวันในห้องแชต */
export function formatDayDivider(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (isSameDay(d, today)) return "วันนี้";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, yesterday)) return "เมื่อวาน";
  return dateFmt.format(d);
}

export function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}
