import { applyToActiveTab } from './apply.js';
import { DEFAULT_SETTINGS } from './config.js';
import { normalizeSettings } from './dates.js';

const api = globalThis.browser ?? globalThis.chrome;
const $ = (id) => document.getElementById(id);
const status = $('status');

function flash(text) {
  status.textContent = text;
  setTimeout(() => { status.textContent = ''; }, 2000);
}

function render(settings) {
  $('weeks').value = String(settings.weeks);
  $('startWeeksBack').value = String(settings.startWeeksBack);
  $('autoApply').checked = settings.autoApply;
}

async function save() {
  const settings = normalizeSettings({
    weeks: $('weeks').value,
    startWeeksBack: $('startWeeksBack').value,
    autoApply: $('autoApply').checked,
  });
  await api.storage.sync.set(settings);
  flash('Saved');
}

api.storage.sync
  .get(DEFAULT_SETTINGS)
  .then((raw) => render(normalizeSettings(raw)))
  .catch(() => render(normalizeSettings()));

for (const id of ['weeks', 'startWeeksBack', 'autoApply']) {
  $(id).addEventListener('change', () => save().catch(() => flash('Could not save')));
}

$('apply').addEventListener('click', async () => {
  if (await applyToActiveTab()) window.close();
  else flash('Open Proton Calendar in this tab first');
});
