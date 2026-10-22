import { MESSAGE_APPLY } from './config.js';

const api = globalThis.browser ?? globalThis.chrome;

/** Asks the content script in the active tab to apply the view. Resolves false if it isn't a Proton Calendar tab. */
export async function applyToActiveTab() {
  try {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    if (tab?.id == null) return false;
    await api.tabs.sendMessage(tab.id, { type: MESSAGE_APPLY });
    return true;
  } catch (err) {
    // No content script in that tab (not Proton Calendar).
    console.debug('[Rolling Weeks] not applied', err);
    return false;
  }
}
