import { z } from "zod";

export const APP_TIME_ZONE = "Asia/Kolkata";
const APP_TIME_ZONE_OFFSET_MINUTES = 330;

const currentYear = new Date().getFullYear();

export const periodSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce
    .number()
    .int()
    .min(2000)
    .max(currentYear + 5),
});

export const chartRangeSchema = z.enum([
  "last7Days",
  "selectedMonth",
  "last3Months",
  "last6Months",
  "allTime",
]);

export const DEFAULT_CHART_RANGE = "selectedMonth";

export function getCurrentPeriod(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function parseSelectedPeriod(searchParams = {}) {
  const fallback = getCurrentPeriod();
  const result = periodSchema.safeParse({
    month: searchParams?.month,
    year: searchParams?.year,
  });

  return result.success ? result.data : fallback;
}

export function parseChartRange(searchParams = {}) {
  const result = chartRangeSchema.safeParse(searchParams?.chartRange);

  return result.success ? result.data : DEFAULT_CHART_RANGE;
}

export function getMonthDateRange({ month, year }) {
  const startUtc = Date.UTC(year, month - 1, 1, 0, 0, 0, 0);
  const endUtc = Date.UTC(year, month, 1, 0, 0, 0, 0);
  const offsetMs = APP_TIME_ZONE_OFFSET_MINUTES * 60 * 1000;

  return {
    startDate: new Date(startUtc - offsetMs),
    endDate: new Date(endUtc - offsetMs),
  };
}

export function getSelectedMonthRange(period) {
  return getMonthDateRange(period);
}

export function comparePeriods(a, b) {
  if (a.year !== b.year) {
    return a.year - b.year;
  }

  return a.month - b.month;
}

export function shiftPeriod({ month, year }, offsetMonths) {
  const shifted = new Date(Date.UTC(year, month - 1 + offsetMonths, 1));

  return {
    month: shifted.getUTCMonth() + 1,
    year: shifted.getUTCFullYear(),
  };
}

export function getAppDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date(date));

  const valueByType = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    day: Number(valueByType.day),
    month: Number(valueByType.month),
    year: Number(valueByType.year),
  };
}

export function getAppDateKeyFromParts({ day, month, year }) {
  return [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

export function addDaysToAppDateParts({ day, month, year }, days) {
  const shifted = new Date(Date.UTC(year, month - 1, day + days));

  return {
    day: shifted.getUTCDate(),
    month: shifted.getUTCMonth() + 1,
    year: shifted.getUTCFullYear(),
  };
}

export function getAppDayStartDate({ day, month, year }) {
  const startUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const offsetMs = APP_TIME_ZONE_OFFSET_MINUTES * 60 * 1000;

  return new Date(startUtc - offsetMs);
}

export function getChartAnchorDate(period, now = new Date()) {
  const today = getAppDateParts(now);
  const currentPeriod = {
    month: today.month,
    year: today.year,
  };

  if (comparePeriods(period, currentPeriod) >= 0) {
    return today;
  }

  const nextMonthStart = {
    day: 1,
    ...shiftPeriod(period, 1),
  };

  return addDaysToAppDateParts(nextMonthStart, -1);
}

export function getChartDateRange(period, chartRange, now = new Date()) {
  const range = chartRangeSchema.safeParse(chartRange).success
    ? chartRange
    : DEFAULT_CHART_RANGE;
  const selectedMonthRange = getSelectedMonthRange(period);

  if (range === "last7Days") {
    const anchorDate = getChartAnchorDate(period, now);
    const startDateParts = addDaysToAppDateParts(anchorDate, -6);
    const endDateParts = addDaysToAppDateParts(anchorDate, 1);

    return {
      anchorDate,
      endDate: getAppDayStartDate(endDateParts),
      groupBy: "day",
      range,
      startDate: getAppDayStartDate(startDateParts),
      startDateParts,
    };
  }

  if (range === "last3Months") {
    return {
      endDate: selectedMonthRange.endDate,
      groupBy: "month",
      range,
      startDate: getMonthDateRange(shiftPeriod(period, -2)).startDate,
      startPeriod: shiftPeriod(period, -2),
    };
  }

  if (range === "last6Months") {
    return {
      endDate: selectedMonthRange.endDate,
      groupBy: "month",
      range,
      startDate: getMonthDateRange(shiftPeriod(period, -5)).startDate,
      startPeriod: shiftPeriod(period, -5),
    };
  }

  if (range === "allTime") {
    return {
      endDate: selectedMonthRange.endDate,
      groupBy: "month",
      range,
      startDate: new Date(0),
    };
  }

  return {
    endDate: selectedMonthRange.endDate,
    groupBy: "day",
    range: DEFAULT_CHART_RANGE,
    startDate: selectedMonthRange.startDate,
  };
}

export function getPreviousPeriod({ month, year }) {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }

  return { month: month - 1, year };
}

export function formatSelectedMonth({ month, year }, style = "short") {
  return new Intl.DateTimeFormat("en-US", {
    month: style,
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(Date.UTC(year, month - 1, 15)));
}

export function formatDateKeyInAppTimeZone(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date(date));

  const valueByType = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${valueByType.year}-${valueByType.month}-${valueByType.day}`;
}

export function getPeriodKey({ month, year }) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getDaysRemainingInPeriod(period, now = new Date()) {
  const current = getCurrentPeriod(now);
  const { endDate } = getMonthDateRange(period);

  if (period.month !== current.month || period.year !== current.year) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  );
}

export function createPeriodSearchParams(searchParams, period) {
  const params = new URLSearchParams(searchParams?.toString?.() || "");
  params.set("month", String(period.month));
  params.set("year", String(period.year));
  return params;
}
