import {
  DEFAULT_SETTINGS,
  MESSAGE_APPLY,
  PENDING_KEY,
  SELECTORS,
  TIMEOUTS,
  TOAST_TEXT,
} from './config.js';
import { computeTarget, normalizeSettings } from './dates.js';
import { buildPath, getPrefix, isRewritable, parsePath } from './route.js';
import { showToast } from './toast.js';

const api = globalThis.browser ?? globalThis.chrome;
const log = (...args) => console.warn('[Rolling Weeks]', ...args);

async function loadSettings() {
  try {
    return normalizeSettings(await api.storage.sync.get(DEFAULT_SETTINGS));
  } catch (err) {
    log('could not read settings, using defaults', err);
    return normalizeSettings();
  }
}

/** Resolves with the first value `check()` returns that is truthy, or null on timeout. */
function waitFor(check, timeoutMs) {
  return new Promise((resolve) => {
    const found = check();
    if (found) return resolve(found);
    const observer = new MutationObserver(() => {
      const result = check();
      if (result) done(result);
    });
    const timer = setTimeout(() => done(null), timeoutMs);
    function done(value) {
      observer.disconnect();
      clearTimeout(timer);
      resolve(value);
    }
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
}

const store = {
  get: () => { try { return sessionStorage.getItem(PENDING_KEY); } catch { return null; } },
  set: (v) => { try { sessionStorage.setItem(PENDING_KEY, v); } catch { /* ignore */ } },
  clear: () => { try { sessionStorage.removeItem(PENDING_KEY); } catch { /* ignore */ } },
};

async function navigateTo(prefix, how) {
  const settings = await loadSettings();
  const target = computeTarget(new Date(), settings);
  const path = buildPath(prefix, target);
  if (location.pathname === path) return;
  store.set(JSON.stringify({ path, range: target.range ?? null, view: target.view }));
  location[how](path);
}

/** After a rewrite: confirm the app rendered and kept the range in the URL. */
async function verifyPending(raw) {
  store.clear();
  let pending;
  try { pending = JSON.parse(raw); } catch { return; }
  const ready = await waitFor(() => document.querySelector(SELECTORS.appReady), TIMEOUTS.appReadyMs);
  const now = parsePath(location.pathname);
  const ok = ready && now && now.view === pending.view && (now.range ?? null) === pending.range;
  if (!ok) {
    log('rolling view not applied', { expected: pending, actualPath: location.pathname, appReady: !!ready });
    showToast(TOAST_TEXT);
  }
}

async function autoApply() {
  const pending = store.get();
  if (pending) return verifyPending(pending);

  const settings = await loadSettings();
  if (!settings.autoApply) return;

  let parsed = parsePath(location.pathname);
  if (parsed && !parsed.prefix) {
    // The app may add the /u/<n> account prefix itself shortly after start.
    await waitFor(() => getPrefix(location.pathname), TIMEOUTS.prefixMs);
    parsed = parsePath(location.pathname);
  }
  if (parsed?.prefix && isRewritable(parsed)) await navigateTo(parsed.prefix, 'replace');
}

api.runtime.onMessage.addListener((message) => {
  if (message?.type !== MESSAGE_APPLY) return;
  const prefix = getPrefix(location.pathname);
  if (!prefix) {
    log('no account prefix in URL; open a calendar page first', location.pathname);
    showToast(TOAST_TEXT);
    return;
  }
  navigateTo(prefix, 'assign').catch((err) => { log('apply failed', err); showToast(TOAST_TEXT); });
});

autoApply().catch((err) => {
  log('unexpected error', err);
  showToast(TOAST_TEXT);
});
