import { applyToActiveTab } from './apply.js';

const api = globalThis.browser ?? globalThis.chrome;

api.commands.onCommand.addListener((command) => {
  if (command === 'apply-rolling-view') applyToActiveTab();
});
