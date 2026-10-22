// Everything that depends on Proton Calendar's current markup or routing lives here.
// If Proton changes something, this is the only file that should need editing.

export const SELECTORS = {
  // Present once the calendar UI has rendered (mini calendar "today" button in the sidebar).
  appReady: '[data-testid="minicalendar:today"]',
};

export const ROUTE = {
  // Optional account prefix, e.g. "/u/3".
  prefixPattern: /^\/u\/\d+/,
  // View names the app accepts in its URL (see getUrlHelper.ts in ProtonMail/WebClients).
  // Only these are treated as "a plain calendar page" that may be rewritten.
  rewritableViews: ['month', 'week', 'day', 'year', 'agenda'],
  // View used for the rolling range. Range N shows N+1 weeks (max N = 5).
  rollingView: 'month',
  singleWeekView: 'week',
  maxRange: 5,
};

export const TIMEOUTS = {
  // Max time to wait for the app to render / for the account prefix to appear.
  appReadyMs: 15000,
  prefixMs: 10000,
};

export const DEFAULT_SETTINGS = {
  weeks: 3, // 1-6
  startWeeksBack: 0, // 0 = this week, 1 = last week
  autoApply: true,
};

export const PENDING_KEY = 'rollingWeeks.pending';
export const MESSAGE_APPLY = 'rollingWeeks.apply';
export const TOAST_TEXT = "Couldn't set rolling view – Proton may have changed";
