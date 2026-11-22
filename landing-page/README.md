# SyncMySkills landing page

A single static page: `index.html` with inline CSS and vanilla JavaScript. There is no framework, no dependencies and no build step.

Live preview: https://syncmyskills.vercel.app

## Run it locally

The page uses root-relative paths (`/brand/...`, `/photos/...`), so serve this folder as the web root. Opening the file directly won't load those assets.

```bash
cd landing-page
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static server works, for example `npx serve .`.

## Deploy

The page is set up for Vercel.

- In the Vercel project, set **Root Directory** to `landing-page`. No framework preset and no build command are needed.
- `vercel.json` does two things:
  - It caches `/brand/*` for a year.
  - It sends an `X-Robots-Tag: noindex` header so the preview isn't indexed. **Remove that header** when the page moves to the real domain.
- `<link rel="canonical">` and `og:url` already point to `https://syncmyskills.ai/`.
- `og:image` points to the Vercel preview. Update it once the page is on the final domain.

## Folder layout

```
landing-page/
├── index.html            the whole page: markup, styles in <style>, scripts at the end
├── vercel.json           cache and robots headers
├── brand/                files from the brand handover, kept as-is
│   ├── tokens/brand.css  colour and font tokens (--sms-*) and the Inter @font-face rules
│   ├── fonts/            Inter SemiBold and Bold (woff2) and the Inter licence
│   ├── logos/            SyncMySkills wordmark: ink and white SVG, ink PNG
│   └── favicons/         favicon, app icons and site.webmanifest
└── photos/
    ├── people/           portraits for the example profiles (AI-generated, not real people)
    ├── logos/            company logos shown on the page (transparent PNG)
    └── photo-portfolio.jpg   social preview image
```

## Brand rules used on the page

- **Headlines:** Georgia Regular 400.
- **Body text:** Inter 400 and 500 from Google Fonts. Inter 600 and 700 come from `brand/fonts` and are used for emphasis.
- **Colours:** only the brand palette in `brand/tokens/brand.css`, aliased in `:root` as `--blue`, `--orange`, `--moss`, `--ink`, `--paper` and so on.
- **Text contrast:** text on brand colours stays at WCAG AA. Dark text is used on orange and moss, and white only on the deeper button blue.
- **Brand motif:** translucent brand colour blocks at 84% opacity.
- **3D buttons:** primary calls to action use `.cbtn`. Variants: orange (default), `.c-b` blue, `.c-p` cream (used on blue backgrounds), `.mini` for the nav. Secondary actions use `.btn-line`.

## Page sections (top to bottom)

1. **Nav.** Fixed, turns dark over dark sections, and has a scroll progress bar.
2. **Hero.** Headline, résumé or LinkedIn input, benefit points, and a scrolling strip of company logos and role names.
3. **How it works** (dark). Three steps; on desktop the product card changes as you scroll.
4. **Stories.** An auto-playing carousel of example before-and-after profiles.
5. **Features.** Résumé insight, apply options and a job-support chat.
6. **Roles.** A role explorer: a list of example roles next to a stacked card deck. It auto-advances and has family tabs.
7. **Pricing and get started** (blue). Two paths, job seekers (free) and hiring teams (custom), fading into a starry night.
8. **Footer.** Links, contact, a small runner game, and the wordmark.

On phones, a compact "Analyze my résumé" button appears when you scroll back up and hides near the end of the page.

## Where to edit content

All copy is plain HTML in `index.html`. The interactive parts are driven by small data arrays in the `<script>` at the bottom:

| Array | Controls |
| --- | --- |
| `S` | Story carousel profiles and before/after text |
| `PR` | "Know where you stand" profiles (skills, gaps, ATS score) |
| `FR` | Example roles per family (product, tech, data, design) |
| `CO` and `LR` | Companies in the role explorer and their logo aspect ratios, used for optical sizing |
| `CITIES` | Locations shown on role cards |
| `CM` | Job-support chat messages |
| `roles` / `LOGOS` | Hero strip role names and company logos |

## Links and what is still placeholder

- All calls to action go to the live app:
  - `https://syncmyskills.ai/auth/signup`
  - `https://syncmyskills.ai/auth/login`
  - `https://syncmyskills.ai/contact`
  - `https://syncmyskills.ai/employers/`
  - `https://syncmyskills.ai/about`, `/blogs`, `/privacy` and `/students/`
- **Hero form.** It sends people to sign-up. The pasted URL and any attached file are **not** uploaded anywhere. Wiring this to the real résumé-upload flow is the main integration task.
- **Example content.** All people, stories, roles, fit scores and numbers are illustrative, and the page labels them that way. The portraits are AI-generated. Replace them with real, consented stories before launch.
- **Company logos.** These are trademarks of their owners. Confirm SyncMySkills may show them, and in this way ("matched to roles at teams like…"), before launch.

## Accessibility and behaviour notes

- **Reduced motion.** `prefers-reduced-motion` turns off animations, auto-advance, parallax and the drifting clouds.
- **Touch devices.** Hover-only effects (card tilt, magnetic buttons, cursor glow) run only on devices with a precise pointer and hover.
- **Keyboard shortcuts.** The labelled buttons work with **A** (analyze), **D** (demo) and **F** (find roles). They're ignored while typing in a field.
- **Footer game.** Space or tap to jump. The best score is saved in `localStorage` under `sms-best`.
