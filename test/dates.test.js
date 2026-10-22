import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, computeTarget, mondayOf, normalizeSettings, todayInZone, weekdayIndex } from '../src/dates.js';

const TZ = 'Europe/Berlin';
const D = (y, m, d) => ({ y, m, d });

test('todayInZone uses Berlin calendar day, not UTC (summer time, UTC+2)', () => {
  assert.deepEqual(todayInZone(new Date('2026-10-21T22:30:00Z'), TZ), D(2026, 10, 22));
  assert.deepEqual(todayInZone(new Date('2026-10-21T21:59:00Z'), TZ), D(2026, 10, 21));
});

test('todayInZone across the autumn DST change (2026-10-25, 03:00 -> 02:00)', () => {
  assert.deepEqual(todayInZone(new Date('2026-10-24T22:00:00Z'), TZ), D(2026, 10, 25)); // 00:00 CEST
  assert.deepEqual(todayInZone(new Date('2026-10-25T22:30:00Z'), TZ), D(2026, 10, 25)); // 23:30 CET
  assert.deepEqual(todayInZone(new Date('2026-10-25T23:00:00Z'), TZ), D(2026, 10, 26)); // 00:00 CET
});

test('weekdayIndex is Monday-based', () => {
  assert.equal(weekdayIndex(D(2026, 10, 19)), 0); // Monday
  assert.equal(weekdayIndex(D(2026, 10, 22)), 3); // Thursday
  assert.equal(weekdayIndex(D(2026, 10, 25)), 6); // Sunday
});

test('mondayOf: Monday, midweek, Sunday', () => {
  assert.deepEqual(mondayOf(D(2026, 10, 19)), D(2026, 10, 19));
  assert.deepEqual(mondayOf(D(2026, 10, 22)), D(2026, 10, 19));
  assert.deepEqual(mondayOf(D(2026, 10, 25)), D(2026, 10, 19));
});

test('mondayOf crosses year and leap-day boundaries', () => {
  assert.deepEqual(mondayOf(D(2027, 1, 1)), D(2026, 12, 28));
  assert.deepEqual(mondayOf(D(2028, 2, 29)), D(2028, 2, 28));
  assert.deepEqual(addDays(D(2028, 2, 28), 7), D(2028, 3, 6));
});

test('normalizeSettings clamps and falls back to defaults', () => {
  assert.deepEqual(normalizeSettings(), { weeks: 3, startWeeksBack: 0, autoApply: true });
  assert.equal(normalizeSettings({ weeks: 0 }).weeks, 1);
  assert.equal(normalizeSettings({ weeks: 99 }).weeks, 6);
  assert.equal(normalizeSettings({ weeks: '3' }).weeks, 3);
  assert.equal(normalizeSettings({ weeks: 'abc' }).weeks, 3);
  assert.equal(normalizeSettings({ startWeeksBack: 5 }).startWeeksBack, 1);
  assert.equal(normalizeSettings({ autoApply: false }).autoApply, false);
  assert.equal(normalizeSettings({ autoApply: 'no' }).autoApply, true);
});

test('computeTarget: 3 weeks starting this week (Thursday 2026-10-22, Berlin)', () => {
  const now = new Date('2026-10-22T10:00:00Z');
  assert.deepEqual(computeTarget(now, { weeks: 3, startWeeksBack: 0 }, TZ), {
    view: 'month',
    date: D(2026, 10, 19),
    range: 2, // range N shows N+1 weeks
  });
});

test('computeTarget: start one week back', () => {
  const now = new Date('2026-10-22T10:00:00Z');
  assert.deepEqual(computeTarget(now, { weeks: 4, startWeeksBack: 1 }, TZ), {
    view: 'month',
    date: D(2026, 10, 12),
    range: 3,
  });
});

test('computeTarget: 1 week is the plain week view, 6 weeks is range 5', () => {
  const now = new Date('2026-10-22T10:00:00Z');
  assert.deepEqual(computeTarget(now, { weeks: 1 }, TZ), { view: 'week', date: D(2026, 10, 19), range: undefined });
  assert.equal(computeTarget(now, { weeks: 6 }, TZ).range, 5);
});

test('computeTarget: just after midnight Berlin on a Monday uses the new day', () => {
  // 2026-10-25 23:30 UTC = Monday 2026-10-26 00:30 CET
  const t = computeTarget(new Date('2026-10-25T23:30:00Z'), { weeks: 4 }, TZ);
  assert.deepEqual(t.date, D(2026, 10, 26));
});
