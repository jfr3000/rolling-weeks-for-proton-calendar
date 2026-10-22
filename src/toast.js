// Small dismissible notice, isolated from the page's styles via shadow DOM.
export function showToast(text) {
  try {
    if (document.getElementById('rolling-weeks-toast')) return;
    const host = document.createElement('div');
    host.id = 'rolling-weeks-toast';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        .t { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; max-width: 320px;
             display: flex; gap: 12px; align-items: flex-start; padding: 10px 12px;
             background: #2b2b33; color: #fff; border-radius: 8px; font: 13px/1.4 system-ui, sans-serif;
             box-shadow: 0 4px 16px rgba(0,0,0,.3); }
        button { all: unset; cursor: pointer; font-size: 16px; line-height: 1; padding: 0 2px; }
      </style>
      <div class="t" role="status"><span></span><button type="button" aria-label="Dismiss">×</button></div>`;
    root.querySelector('span').textContent = text;
    root.querySelector('button').addEventListener('click', () => host.remove());
    (document.body || document.documentElement).append(host);
  } catch (err) {
    console.warn('[Rolling Weeks] could not show toast', err);
  }
}
