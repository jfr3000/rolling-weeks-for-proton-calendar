# Rolling Weeks for Proton Calendar

Browser extension that shows the next few weeks in the Proton Calendar web app, instead of the fixed calendar month, like you can on Google Calendar.

Unofficial, not affiliated with Proton AG.

## Install

Store links coming once they're approved.

Until then, build it yourself (see [Development](#development)) and load it:

- **Chrome, Brave** `chrome://extensions` → Developer mode → Load unpacked → `dist/chrome`
- **Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `dist/firefox/manifest.json`. Annoyingly, Firefox removes temporary add-ons on restart, so for a permanent install you'll want the store version.

## Usage

Open calendar.proton.me and you get the rolling view. Click the toolbar icon to change:

- **Number of weeks:** 1–6, default 3. 1 is just Proton's normal week view; 2–6 use its month view with a range.
- **Start:** this week or last week
- **Apply automatically on load:** on/off

Changes save right away. **Apply now** (or `Alt+Shift+R`) re-applies the view, e.g. after you've jumped to some other date.

Tested in Firefox.

## No extension? Use a bookmark

Proton Calendar reads the view from the URL:

```
https://calendar.proton.me/u/0/month/2026/10/19/2
```

That shows the week of 19 Oct 2026 plus 2 more weeks. The last number is the extra weeks (max 5). Use the `/u/<n>` number from your own address bar.

This is also why the "click a date in the mini calendar" trick only works sometimes: a click keeps whatever range the app already has, and after a fresh load there isn't one. The URL sets it directly.

## Privacy

The extension makes no network requests, has no analytics and never reads your events. It only changes the calendar page's URL. Your settings are stored with `storage.sync`, so your browser syncs them across devices if you use browser sync.

## When Proton changes something

This relies on undocumented behavior, so a Proton update could break it. If that happens you'll see a small "Couldn't set rolling view" message, plus details in the console (prefixed `[Rolling Weeks]`). Everything Proton-specific is in `src/config.js`; check it against `getUrlHelper.ts` and `getDateRange.ts` in [ProtonMail/WebClients](https://github.com/ProtonMail/WebClients/tree/main/applications/calendar/src/app/containers/calendar).

Web app only, not Proton's mobile or desktop apps.

## Development

Needs Node 20+ and `zip`.

```
npm install
npm test
npm run build
npm run package
```

`build` writes `dist/chrome` and `dist/firefox`. `package` also writes the store zips plus a source zip for Firefox's review. Bump `version` in `static/manifest.base.json` for each release, and don't change the Firefox add-on ID in `scripts/build.mjs`, or updates won't reach existing users.

## License

MIT
