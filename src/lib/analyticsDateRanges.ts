import type { ClientEarning } from "@/hooks/useClientAnalytics";

export interface AnalyticsDateRange {
  timestampStart: string;
  timestampEnd: string;
  dateStart: string;
  dateEnd: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getAnalyticsDateRange = (year: number | null, month: number | null): AnalyticsDateRange | null => {
  if (!year) return null;

  const monthIndex = month ?? 1;
  const lastDay = month ? new Date(year, month, 0).getDate() : 31;
  const endMonth = month ?? 12;

  return {
    timestampStart: `${year}-${String(monthIndex).padStart(2, "0")}-01T00:00:00`,
    timestampEnd: `${year}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59`,
    dateStart: `${year}-${String(monthIndex).padStart(2, "0")}-01`,
    dateEnd: `${year}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
};

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const parseDateBoundary = (value: string) => startOfUtcDay(new Date(value));

const formatUtcDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const getInclusiveDayCount = (start: Date, end: Date) => {
  const normalizedStart = startOfUtcDay(start);
  const normalizedEnd = startOfUtcDay(end);
  if (normalizedEnd < normalizedStart) return 0;
  return Math.floor((normalizedEnd.getTime() - normalizedStart.getTime()) / MS_PER_DAY) + 1;
};

export const getPeriodDayCount = (range: AnalyticsDateRange | null, earnings: ClientEarning[]) => {
  if (range) {
    return getInclusiveDayCount(
      parseDateBoundary(`${range.dateStart}T00:00:00`),
      parseDateBoundary(`${range.dateEnd}T00:00:00`)
    );
  }

  const datedEarnings = earnings.filter((earning) => earning.earning_period_start && earning.earning_period_end);
  if (datedEarnings.length === 0) return 0;

  const firstStart = datedEarnings.reduce((earliest, earning) => {
    const start = new Date(earning.earning_period_start);
    return start < earliest ? start : earliest;
  }, new Date(datedEarnings[0].earning_period_start));

  const lastEnd = datedEarnings.reduce((latest, earning) => {
    const end = new Date(earning.earning_period_end);
    return end > latest ? end : latest;
  }, new Date(datedEarnings[0].earning_period_end));

  return getInclusiveDayCount(firstStart, lastEnd);
};

export const getActiveRentalDays = (earnings: ClientEarning[], range: AnalyticsDateRange | null) => {
  const activeDates = new Set<string>();
  const rangeStart = range ? parseDateBoundary(`${range.dateStart}T00:00:00`) : null;
  const rangeEnd = range ? parseDateBoundary(`${range.dateEnd}T00:00:00`) : null;

  earnings.forEach((earning) => {
    if (!earning.earning_period_start || !earning.earning_period_end) return;

    let current = startOfUtcDay(new Date(earning.earning_period_start));
    let end = startOfUtcDay(new Date(earning.earning_period_end));

    if (rangeStart && current < rangeStart) current = rangeStart;
    if (rangeEnd && end > rangeEnd) end = rangeEnd;
    if (end < current) return;

    while (current <= end) {
      activeDates.add(formatUtcDateKey(current));
      current = new Date(current.getTime() + MS_PER_DAY);
    }
  });

  return activeDates.size;
};