// Parsing and building Proton Calendar paths: /u/<n>/<view>/<y>/<m>/<d>/<range>
import { ROUTE } from './config.js';

const PATH_RE = /^(\/u\/\d+)?(?:\/([a-z]+))?(?:\/(\d{1,4})\/(\d{1,2})\/(\d{1,2})(?:\/(\d+))?)?\/?$/;

export function parsePath(pathname) {
  const m = PATH_RE.exec(pathname);
  if (!m) return null;
  const [, prefix = '', view, y, mo, d, range] = m;
  return {
    prefix,
    view,
    date: y ? { y: Number(y), m: Number(mo), d: Number(d) } : undefined,
    range: range ? Number(range) : undefined,
  };
}

export function getPrefix(pathname) {
  const m = ROUTE.prefixPattern.exec(pathname);
  return m ? m[0] : '';
}

/** A fresh calendar page with no explicit date: safe to replace with the rolling view. */
export function isRewritable(parsed) {
  if (!parsed || parsed.date) return false;
  return !parsed.view || ROUTE.rewritableViews.includes(parsed.view);
}

export function buildPath(prefix, { view, date, range }) {
  const segments = [view, date.y, date.m, date.d];
  if (range) segments.push(range);
  return `${prefix}/${segments.join('/')}`;
}
