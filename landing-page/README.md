# SyncMySkills landing page and sign-up flow

Static pages with vanilla CSS and JavaScript. There is no framework, no dependencies and no build step.

- `index.html`: the landing page (inline CSS and JS).
- `signin.html`, `signup.html`, `onboarding.html`: the account flow, sharing `auth/auth.css` and `auth/auth.js`.

Live preview: https://syncmyskills.vercel.app

## Run it locally

The page uses root-relative paths (`/brand/...`, `/photos/...`), so serve this folder as the web root. Opening the file directly won't load those assets.

```bash
cd landing-page
npx serve .
```

Then open http://localhost:3000. Links use clean URLs (`/signin`, `/signup`, `/onboarding`), which `npx serve` and Vercel both handle. With a plain server such as `python3 -m http.server`, open the `.html` files directly (`/signin.html`).

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
├── index.html            the landing page: markup, styles in <style>, scripts at the end
├── signin.html           sign in, forgot password, reset link sent, set a new password
├── signup.html           create account, then verify email with a 6-digit code
├── onboarding.html       four setup steps, then the first report
├── auth/
│   ├── auth.css          styles for the three account pages (same tokens and 3D buttons as the landing page)
│   ├── auth.js           shared helpers: validation, password strength, code input, brand panel
│   └── onboarding.js     onboarding steps, live profile preview, results
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

## Sign-in, sign-up and onboarding

The flow is fully designed and clickable, but it is **front end only**. Every place that needs the backend is marked `TODO(api)` in the code.

**Journey**

1. **Landing page.** "Sign in" goes to `/signin`. "Get started" and the other main buttons go to `/signup`. The hero form passes what was entered as `/signup?profile=<url>` or `?file=<name>`, and the sign-up page shows "We'll analyse … as soon as you're in".
2. **`/signup`.**
   - Sign-up options: Google, LinkedIn, or name, email and password.
   - The password field has a strength meter and a checklist of rules.
   - Typos in the email domain are caught, for example "gmial.com" prompts "Did you mean gmail.com?".
   - There's an optional checkbox for email updates.
   - The next step asks for a **6-digit email code**. It supports pasting and one-time-code autofill, and lets the person resend after 30 seconds or change the email.
3. **`/onboarding`.**
   - About you: goal and experience.
   - Résumé: drag and drop a PDF or Word file up to 5 MB, paste a LinkedIn URL, or skip with "I don't have one yet".
   - Target roles: up to 5, with autocomplete and suggestions.
   - Locations: cities worldwide or Remote, plus work setup, start date and relocation.
   - A live profile card on the right fills in as the person answers.
   - An analysis screen, then the first report: score, top matches and skill gaps.
   - The final button goes to `SMS.DASHBOARD_URL`.
4. **`/signin`.**
   - Google, LinkedIn, or email and password, with a "keep me signed in" option.
   - The wrong-password error state is built in.
   - Forgot password leads to "Check your inbox", with Gmail and Outlook shortcuts and a 30-second resend.
   - The reset link should open `/signin?view=reset&token=…`. That view sets a new password and then confirms it changed.

**For the developer**

- Set `SMS.DASHBOARD_URL` at the top of `auth/auth.js` to the real app.
- Wire up each `TODO(api)`:
  - **OAuth:** Google and LinkedIn.
  - **Account:** create the account, check the code, resend the code.
  - **Sign in:** sign in, request a reset, set the new password.
  - **Onboarding:** upload the résumé, save each step, fetch the report.
- Show the error states that are already in the markup:
  - `#signinErr`: wrong email or password.
  - `#existsErr`: an account already exists for this email.
  - `#otpErr`: the code is wrong or has expired.
- The reset request should give the same response whether or not the account exists.
- Onboarding answers are kept in `sessionStorage` under `sms-onboarding`, so a refresh or "Save and exit" doesn't lose them. Replace this with server-side saves.
- Demo behaviour to remove:
  - Any 6-digit code is accepted except `000000`, which shows the error state.
  - Results are sample data, and the page says so.
- The account pages send `noindex`.
- **A Terms of Service page is needed.** The sign-up legal line mentions it but has nothing to link to yet.

## Links and what is still placeholder

- Sign-up and sign-in buttons go to the new `/signup` and `/signin` pages in this folder. Other links go to the live site:
  - `https://syncmyskills.ai/contact`
  - `https://syncmyskills.ai/employers/`
  - `https://syncmyskills.ai/about`, `/blogs`, `/privacy` and `/students/`
- **Hero form.** It sends people to `/signup`, passing along the LinkedIn URL or the file name. The file itself is **not** uploaded anywhere yet.
- **Example content.** All people, stories, roles, fit scores and numbers are illustrative, and the page labels them that way. The portraits are AI-generated. Replace them with real, consented stories before launch.
- **Company logos.** These are trademarks of their owners. Confirm SyncMySkills may show them, and in this way ("matched to roles at teams like…"), before launch.

## Accessibility and behaviour notes

- **Reduced motion.** `prefers-reduced-motion` turns off animations, auto-advance, parallax and the drifting clouds.
- **Touch devices.** Hover-only effects (card tilt, magnetic buttons, cursor glow) run only on devices with a precise pointer and hover.
- **Keyboard shortcuts.** The labelled buttons work with **A** (analyze), **D** (demo) and **F** (find roles). They're ignored while typing in a field.
- **Footer game.** Space or tap to jump. The best score is saved in `localStorage` under `sms-best`.
