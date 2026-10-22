import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPath, getPrefix, isRewritable, parsePath } from '../src/route.js';

test('parsePath: the URL confirmed to work in the app', () => {
  assert.deepEqual(parsePath('/u/3/month/2026/10/22/2'), {
    prefix: '/u/3',
    view: 'month',
    date: { y: 2026, m: 10, d: 22 },
    range: 2,
  });
});

test('parsePath: bare and partial paths', () => {
  assert.equal(parsePath('/').prefix, '');
  assert.equal(parsePath('/u/3').prefix, '/u/3');
  assert.equal(parsePath('/u/3/week').view, 'week');
  assert.equal(parsePath('/u/3/week/2026/10/22').range, undefined);
});

test('isRewritable: only fresh pages without a date', () => {
  assert.equal(isRewritable(parsePath('/u/3')), true);
  assert.equal(isRewritable(parsePath('/u/3/')), true);
  assert.equal(isRewritable(parsePath('/u/3/month')), true);
  assert.equal(isRewritable(parsePath('/u/3/week')), true);
  assert.equal(isRewritable(parsePath('/u/3/week/2026/10/22')), false);
  assert.equal(isRewritable(parsePath('/u/3/month/2026/10/19/2')), false);
  assert.equal(isRewritable(parsePath('/u/3/settings')), false);
  assert.equal(isRewritable(parsePath('/u/3/search')), false);
  assert.equal(isRewritable(parsePath('/u/3/a/b/c/d')), false);
});

test('buildPath', () => {
  const date = { y: 2026, m: 10, d: 19 };
  assert.equal(buildPath('/u/3', { view: 'month', date, range: 2 }), '/u/3/month/2026/10/19/2');
  assert.equal(buildPath('/u/3', { view: 'week', date, range: undefined }), '/u/3/week/2026/10/19');
  assert.equal(buildPath('', { view: 'month', date, range: 3 }), '/month/2026/10/19/3');
});

test('getPrefix', () => {
  assert.equal(getPrefix('/u/12/settings/foo'), '/u/12');
  assert.equal(getPrefix('/month'), '');
});
