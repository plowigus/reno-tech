import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { pl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDatePL(
  date: string | Date | null | undefined,
  formatStr: string = "dd.MM.yyyy, HH:mm"
): string {
  if (!date) return "-";

  const timeZone = "Europe/Warsaw";
  const inputDate = new Date(date);

  // Convert UTC date to Zoned Date (Polish Time)
  const zonedDate = toZonedTime(inputDate, timeZone);

  return format(zonedDate, formatStr, { locale: pl });
}
