# SyncMySkills landing page and account flow

Static pages written in plain HTML, CSS and JavaScript. There is no framework, no dependencies and no build step.

| Page | File | What it is |
| --- | --- | --- |
| `/` | `index.html` | The landing page. Its CSS is inline in `<style>` and its scripts are at the end of the file. |
| `/signin` | `signin.html` | Sign in, forgot password, "check your inbox", and set a new password. |
| `/signup` | `signup.html` | Create an account, then verify the email with a 6-digit code. |
| `/onboarding` | `onboarding.html` | Four setup steps, an analysis screen, then the first report. |

The three account pages share `auth/auth.css`, `auth/auth.js` and `auth/onboarding.js`.

Live preview: https://syncmyskills.vercel.app

## Before launch: checklist

1. **Connect the account flow to the backend.** Search the code for `TODO(api)`. The section [Sign-in, sign-up and onboarding](#sign-in-sign-up-and-onboarding) explains each one.
2. **Set `SMS.DASHBOARD_URL`** at the top of `auth/auth.js` to the real app. People land there after signing in or finishing onboarding.
3. **Wire up the hero résumé form.** It passes the LinkedIn URL or file name to `/signup`, but it doesn't upload the file.
4. **Add a Terms of Service page.** The sign-up page mentions one, but there's nothing to link to yet.
5. **Replace the example content.** All people, stories, roles, scores and numbers are illustrative, and the portraits are AI-generated. Use real stories, with permission.
6. **Confirm logo usage.** Google, Microsoft and the other company logos are their owners' trademarks. Check that SyncMySkills may show them this way.
7. **Move to the real domain:**
   - Remove the `X-Robots-Tag: noindex` header from `vercel.json`.
   - Point `og:image` at the new domain.
   - Keep `noindex` on the three account pages.

## Run it locally

All paths start at the site root (`/brand/...`, `/photos/...`), so this folder has to be served as the web root. Opening the HTML files directly won't load images or styles.

```bash
cd landing-page
npx serve .
```

Then open http://localhost:3000.

Links use clean URLs (`/signin`, `/signup`, `/onboarding`). `npx serve` and Vercel both handle them. A plain server such as `python3 -m http.server` doesn't, so with one of those, open `/signin.html` and the other pages by their file names.

## Deploy

The site is set up for Vercel.

- In the Vercel project, set **Root Directory** to `landing-page`. There's no framework preset and no build command.
- `vercel.json` turns on clean URLs and caches `/brand/*` for a year. It also sends `X-Robots-Tag: noindex` so the preview isn't indexed (see the checklist).
- `<link rel="canonical">` and `og:url` already point to `https://syncmyskills.ai/`.

## Folder layout

```
landing-page/
├── index.html            landing page
├── signin.html           sign in and password reset
├── signup.html           create account and verify email
├── onboarding.html       setup steps and first report
├── auth/
│   ├── auth.css          styles for the account pages (same tokens and 3D buttons as the landing page)
│   ├── auth.js           shared helpers: validation, password strength, code input, brand side panel
│   └── onboarding.js     onboarding steps, live profile preview, results
├── vercel.json           clean URLs, cache and robots headers
├── brand/                files from the brand handover, unchanged
│   ├── tokens/brand.css  colour and font tokens (--sms-*) and the Inter @font-face rules
│   ├── fonts/            Inter SemiBold and Bold (woff2), plus the licence
│   ├── logos/            SyncMySkills wordmark (ink SVG and PNG, white SVG)
│   └── favicons/         favicon, app icons, site.webmanifest
└── photos/
    ├── people/           20 portraits (AI-generated, not real people), 320 px JPG
    ├── logos/            10 company logos, transparent PNG, 96 px tall
    └── photo-portfolio.jpg   social preview image
```

## Brand rules

- **Headlines:** Georgia Regular 400 everywhere, including the hero headline. Section headings use the same font, weight and ink colour.
- **Body text:** Inter 400 and 500, loaded from Google Fonts. Inter 600 and 700 come from `brand/fonts` and are used for emphasis.
- **Colours:** only the brand palette from `brand/tokens/brand.css`, aliased in `:root` as `--blue`, `--orange`, `--moss`, `--sky`, `--ink`, `--paper` and so on.
- **Contrast:** text on brand colours meets WCAG AA. Use dark text on orange and moss, and white only on the deeper button blue (`#2A6BE6`).
- **Brand motif:** translucent brand colour blocks at 84% opacity, plus pixel dither bands between sections.
- **Buttons:**
  - Main calls to action use the 3D `.cbtn`. Variants:
    - orange (the default)
    - `.c-b` blue
    - `.c-p` cream, for use on blue backgrounds
    - `.mini` for the nav
    - `.sm` inside the hero form
  - Secondary actions use `.btn-line`.

## Landing page sections (top to bottom)

1. **Nav.** Fixed. It turns dark over dark sections and has a scroll progress bar.
2. **Hero.**
   - **Layout:** on desktop the hero fills the first screen. The headline, description and résumé/LinkedIn form sit centred, and the strip at the bottom reads "Our users get matched to roles at teams like…", followed by moving rows of company logos and role names.
   - **Faces:** round photos pop in to the left and right of the headline, each with a name chip like "Maya got an offer".
   - **Ripple field:** each new face sends a ripple of small squares across a pixel field behind the content. See [Hero faces and ripple field](#hero-faces-and-ripple-field).
3. **How it works** (dark). Three steps. On desktop the product card changes as you scroll.
4. **Stories.** An auto-playing carousel of example before-and-after profiles.
5. **Features.** Résumé insight, apply options and a job-support chat.
6. **Roles.** A role explorer: a list of example roles next to a stacked card deck. It auto-advances and has family tabs.
7. **Pricing and get started** (blue). Two paths: job seekers (free) and hiring teams (custom). The blue fades into a starry night.
8. **Footer.** Links, contact details, a small runner game, and the wordmark.

On phones, a compact "Analyze my résumé" button appears when you scroll back up. It hides near pricing and the footer.

## Where to edit content

All copy is plain HTML in `index.html`. The interactive parts read from small data arrays in the scripts at the end of the file:

| Array | Controls |
| --- | --- |
| `HERO_PEOPLE` | Faces around the hero headline: `[name, what happened, photo file name]` |
| `LOGOS` / `roles` | Company logos and role names in the hero strip |
| `S` | Story carousel: profiles and before/after text |
| `PR` | "Know where you stand" profiles: skills, gaps, ATS score |
| `FR` | Example roles per family (product, tech, data, design) |
| `CO` and `LR` | Companies in the role explorer, and logo aspect ratios used to size logos so they look the same size |
| `CITIES` | Locations shown on role cards |
| `CM` | Job-support chat messages |

To add a company logo, add a transparent PNG to `photos/logos/`. Then add its width-to-height ratio to `LR` so it's sized to match the others.

## Hero faces and ripple field

This is the script after the `/* people shown around the hero headline */` comment in `index.html`. The pattern follows unfair.so.

**Faces**
- Up to 4 are visible at once. A new one appears about every 1.7 seconds and stays for 6–9 seconds.
- Faces alternate between the left and right of the headline. They avoid the text, the form and each other, and the same person doesn't come back too soon.
- They only show on screens 1000 px and wider.
- **People:** the faces come from `HERO_PEOPLE`. Portraits are in `photos/people/`:
  - 12 candid photos, used in the hero: Maya, Jake, Lena, Diego, Yuki, Tom, Tobi, Camila, Min-jun, Elsa, Nour, Julien.
  - 8 earlier studio portraits, used in the stories and cards. Four of them (Meera, Kabir, Sana, Rohan) also appear in the hero.
- The entrance, exit, pulse ring and name chip are CSS animations: `cw-in`, `cw-out`, `cw-ping` and `cw-chip`.

**Ripple field**
- **Grid:** a canvas (`#heroFx`) covers the hero with 7 px squares on a 9 px grid.
- **Ripples:** when a face appears, a ripple spreads out from it at 380 px/s and lights about half the squares it passes. Each lit square fades over about 0.4 seconds and leaves a faint afterglow that twinkles.
- **Colours:** each ripple uses a brand colour in turn (blue, orange, sky, moss), and the resting field is blue and sky.
- **Mask:** the field stays clear around the headline, description, form and caption. It fades in at the top and fades out across the logo row.
- **Tuning:** settings are at the top of the script:
  - `TONES` and `RIPC`: colours and the order ripples use them.
  - `SPEED`: how fast a ripple spreads.
  - `F`: the share of squares a ripple lights.
  - In `step()`, the fade time (`420`) and the afterglow time (`22000`), both in milliseconds.
- **Phones and reduced motion:** the field is drawn once, faint and still. It pauses when the hero is off screen or the tab is hidden.

## Motion and micro-interactions

- **Easing:** everything uses one ease-out curve, `--ease: cubic-bezier(.22,1,.36,1)`, in `:root`. `--ease-io` is the in-and-out version, used for exits. Change motion feel there rather than per element.
- **Scroll reveals:**
  - `.rv` elements fade and rise in as they enter the screen, and reset when they leave below.
  - Section headings reveal word by word.
- **Pointer effects:** card tilt and shine, magnetic 3D buttons and the hero glow ease toward the cursor rather than snapping. The `follow()` helper in the "interactions" script runs them. They're only on for devices with a precise pointer and hover.
- **Button presses:** 3D buttons press down quickly (0.12 s) and ease back.
- **Reduced motion:** `prefers-reduced-motion` turns off animations, auto-advance, parallax, drifting clouds and the ripple animation.

## Sign-in, sign-up and onboarding

The flow is fully designed and clickable, but it is **front end only**. Each place that needs the backend is marked `TODO(api)`.

**Journey**

1. **Landing page.** "Sign in" goes to `/signin`. "Get started" and the other main buttons go to `/signup`. The hero form sends `/signup?profile=<url>` or `?file=<name>`. The sign-up page then shows "We'll analyse … as soon as you're in".
2. **`/signup`.**
   - **Ways to sign up:** Google, LinkedIn, or name, email and password.
   - **Password:** a strength meter and a checklist of rules.
   - **Email:** typos in the domain are caught. For example, "gmial.com" gets "Did you mean gmail.com?".
   - **Updates:** an optional checkbox for email updates.
   - **Next screen:** a **6-digit email code**, with paste and one-time-code autofill, a resend after 30 seconds, and a link to change the email.
3. **`/onboarding`.**
   1. About you: goal and experience.
   2. Résumé: drag and drop a PDF or Word file up to 5 MB, paste a LinkedIn URL, or skip with "I don't have one yet".
   3. Target roles: up to 5, with autocomplete and suggestions.
   4. Locations: cities worldwide or Remote, plus work setup, start date and relocation.
   - A live profile card on the right fills in as the person answers.
   - Then an analysis screen and the first report: score, top matches and skill gaps.
   - The last button goes to `SMS.DASHBOARD_URL`.
4. **`/signin`.**
   - **Ways to sign in:** Google, LinkedIn, or email and password, with a "keep me signed in" option.
   - **Wrong password:** the error message is already built.
   - **Forgot password:** leads to "Check your inbox", with Gmail and Outlook shortcuts and a resend after 30 seconds.
   - **Reset link:** it should open `/signin?view=reset&token=…`, which sets a new password and confirms the change.

**To connect**

- **`TODO(api)` items:**
  - **OAuth:** Google and LinkedIn.
  - **Account:** create the account, check the code, resend the code.
  - **Sign in:** sign in, request a reset, set the new password.
  - **Onboarding:** upload the résumé, save each step, fetch the report.
- **Error states already in the markup:**
  - `#signinErr`: wrong email or password.
  - `#existsErr`: an account already exists for this email.
  - `#otpErr`: the code is wrong or has expired.
- **Reset requests:** give the same response whether or not an account exists.
- **Saved answers:** onboarding answers are kept in `sessionStorage` under `sms-onboarding`, so a refresh or "Save and exit" doesn't lose them. Replace this with server-side saves.
- **Demo behaviour to remove:**
  - Any 6-digit code is accepted except `000000`, which shows the error state.
  - The report uses sample data, and the page says so.

## Links

- **Account pages in this folder:** sign-up and sign-in buttons go to `/signup` and `/signin`.
- **Links to the live site:**
  - `https://syncmyskills.ai/contact`
  - `https://syncmyskills.ai/employers/`
  - `https://syncmyskills.ai/about`
  - `https://syncmyskills.ai/blogs`
  - `https://syncmyskills.ai/privacy`
  - `https://syncmyskills.ai/students/`

## Accessibility and behaviour notes

- **Touch devices:** hover-only effects (card tilt, magnetic buttons, cursor glow) are off.
- **Keyboard shortcuts:** the labelled 3D buttons respond to **A** (analyze), **D** (demo) and **F** (find roles). Shortcuts are ignored while typing in a field.
- **Decorative elements:** the hero faces and the pixel field are hidden from screen readers (`aria-hidden`).
- **Footer game:** press Space or tap to jump. The best score is saved in `localStorage` under `sms-best`.
