# Onda website

The marketing, support and legal site for [Onda](https://testflight.apple.com/join/d16Kf9Zn) (App Store: Onda Player; formerly Aether), built with [Astro](https://astro.build) and React.

Pages are static HTML. Interactive parts are React components ("islands") that only load in the browser when they scroll into view, so the site stays fast and search engines see every word.

```bash
npm install
npm run dev       # http://localhost:4321, reloads as you edit
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
npm test          # link-recognition tests
```

Needs Node 22.12 or later (`.nvmrc` pins one).

## Settings

Everything site-wide is in **`site.config.mjs`**:

| Setting | Used for |
|---|---|
| `url` | Canonical links, social previews, `sitemap-index.xml`, `robots.txt` |
| `supportEmail` | Support, Privacy and Anti-piracy pages |
| `testFlightURL` | Download buttons (the public TestFlight beta) |
| `androidAPKURL`, `androidReleasesURL` | Android download buttons, the setup guide and FAQ. The APK lives in the public `RobertAidenSchofield/Aether-Releases` repo (the source repo is private); `public/_redirects` also serves it at `/android`, a short address to type with a TV remote |
| `discordURL` | Footer and Support |

Set `url` and `supportEmail` before publishing. Both still hold `example.com` placeholders.

## Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Features, Live TV, the player, setup, platforms, privacy, FAQ |
| `/setup/` | `src/pages/setup.astro` | Guides for every source type; the table of contents highlights the section you're reading |
| `/support/` | `src/pages/support.astro` | Contact, and searchable troubleshooting |
| `/privacy/` | `src/pages/privacy.astro` | The App Store's **Privacy Policy URL** |
| `/anti-piracy/` | `src/pages/anti-piracy.astro` | |
| `/add/` | `src/pages/add.astro` | Where the Apple TV "Set Up with iPhone" QR code points (universal link) |
| `/robots.txt`, `/sitemap-index.xml` | generated | `/add` is kept out of both |

Shared frame: `src/layouts/Base.astro` (head, header, footer, menu and scroll-reveal scripts). Styles: `src/styles/global.css`, which uses the app's brand tokens.

## Interactive components

All in `src/components/`. Each is a React component placed in a page with a `client:` directive.

| Component | What it does |
|---|---|
| `HeroTV` | The Apple TV home screen: the hero cycles through titles like the app's carousel, and focus moves along Continue Watching. Click a card or use ← →. It pauses on hover, has a pause button, and stays still when the viewer prefers reduced motion. |
| `GuideDemo` | A TV guide laid out around the visitor's own clock. The "now" line moves, and a programme opens its details, with catch-up for ones that already aired. |
| `EngineDemo` | Plays out engine fallback ("Stream fails") and the Onda Engine riding out a live dropout ("Live dropout"), with live telemetry and an event log. |
| `LinkPhone` | Paste a provider link and an iPhone fills in Onda's add form exactly as the app would. It runs in the browser only. |
| `PlatformTabs` | iPhone, iPad, Mac, Apple TV and Vision Pro, each framed with what Onda does best there. |
| `Troubleshooting` | The support topics, filtered as you type. |

`src/lib/iptvLink.ts` is a TypeScript port of the app's `IPTVLink` and `ServerAddressHelp`. Its tests mirror the app's `OnboardingSetupTests`. **If the app's link recognition changes, change both.**

Every title, channel and image in the demos is made up and drawn in CSS. The site deliberately shows no real film, series or channel artwork, because that would need the rights holders' permission.

## Hosting

**Cloudflare Pages** (recommended) or **Netlify**: connect the repo, use build command `npm run build` and output directory `dist`. Both read `public/_headers`, which serves the universal-link file as `application/json`. Then add your domain.

Once the site is live, set these in App Store Connect under App Information:

- Privacy Policy URL: `https://<domain>/privacy/`
- Support URL: `https://<domain>/support/`
- Marketing URL: `https://<domain>/`

## Universal link for the Apple TV QR code

`public/.well-known/apple-app-site-association` gives `/add` to the app `HP29QFDGT9.com.robertschofield.onda`. To use it, change the app:

1. Add the **Associated Domains** capability with `applinks:<domain>`.
2. Map an incoming `https://<domain>/add` (`onContinueUserActivity(NSUserActivityTypeBrowsingWeb)`) to `DeepLink.addSource`.
3. Change `OnboardingView.phoneSetupLink` to `https://<domain>/add`.

The QR code then opens the add form when Onda is installed, and this site's `/add` page, with a TestFlight link, when it isn't.

## Before publishing

- Set `url` and `supportEmail` in `site.config.mjs`.
- The home page lists iPhone, iPad, Mac, Apple TV and Apple Vision Pro. Remove any that aren't on the App Store yet: the hero note in `index.astro`, and `PlatformTabs.tsx`.
- Optionally, swap the text download buttons for Apple's official badge from [Apple's marketing tools](https://toolbox.marketingtools.apple.com/en-us/app-store/).
