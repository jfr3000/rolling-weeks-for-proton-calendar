// Pure date logic. Dates are plain {y, m, d} calendar dates (no time, no zone).
import { DEFAULT_SETTINGS, ROUTE } from './config.js';

export function todayInZone(now = new Date(), timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

const toUtc = ({ y, m, d }) => Date.UTC(y, m - 1, d);

export function addDays(date, n) {
  const t = new Date(toUtc(date) + n * 86400000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** 0 = Monday ... 6 = Sunday */
export function weekdayIndex(date) {
  return (new Date(toUtc(date)).getUTCDay() + 6) % 7;
}

export function mondayOf(date) {
  return addDays(date, -weekdayIndex(date));
}

const clampInt = (value, min, max, fallback) => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function normalizeSettings(raw = {}) {
  return {
    weeks: clampInt(raw.weeks, 1, ROUTE.maxRange + 1, DEFAULT_SETTINGS.weeks),
    startWeeksBack: clampInt(raw.startWeeksBack, 0, 1, DEFAULT_SETTINGS.startWeeksBack),
    autoApply: typeof raw.autoApply === 'boolean' ? raw.autoApply : DEFAULT_SETTINGS.autoApply,
  };
}

/**
 * Which route to open. We pass the Monday of the first week: Proton snaps to the
 * user's own week start (Monday or Sunday etc.), and a Monday lies in the intended
 * week for every setting.
 * Returns { view, date, range } where range is undefined for a single week.
 */
export function computeTarget(now, rawSettings, timeZone) {
  const { weeks, startWeeksBack } = normalizeSettings(rawSettings);
  const date = addDays(mondayOf(todayInZone(now, timeZone)), -7 * startWeeksBack);
  if (weeks === 1) return { view: ROUTE.singleWeekView, date, range: undefined };
  return { view: ROUTE.rollingView, date, range: weeks - 1 };
}
