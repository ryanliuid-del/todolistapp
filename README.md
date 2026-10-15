# Daylist

A responsive todo app built with vanilla JavaScript and Vite. Create tasks, mark them complete, filter your list, delete tasks, and clear completed work. Tasks are saved in local storage on the current browser and synchronize between open tabs on the same origin. No account or backend is required.

## Development

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

## Checks

```sh
npm test
npm run build
```

`npm run preview` serves the production build. Google Fonts are optional; the app uses local fallback fonts when offline. Browser storage may be cleared by your browser; this app does not provide cloud backup.

Run `npm run test:e2e` for browser workflow and mobile layout checks. These use `/usr/bin/chromium` by default; set `CHROMIUM_PATH` to your Chromium executable on other systems. If the default npm cache is not writable, use `npm ci --cache /tmp/todolistapp-npm-cache`.
