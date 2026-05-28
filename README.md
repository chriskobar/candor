# Candor

**Honest design critique. No agenda, no filters.**

Candor is a design audit tool that uses Claude's vision API to give structured, opinionated feedback on any design screenshot — without the diplomatic softening that makes most design feedback useless.

**[candor.chriskobar.com](https://candor.chriskobar.com)**

---

## What it does

Paste, drag, or upload a design screenshot. Candor analyzes it across six human dimensions and returns a scored audit with a direct designer's read and concrete next steps.

**Standard critique** — 6 dimensions, ~30–60 seconds:
- Clarity & hierarchy
- Visual trust
- Audience resonance
- Emotional tone
- Message legibility
- Inclusivity signals

**Deep critique** — 11 dimensions, ~60–90 seconds. Adds:
- Usability heuristics
- Cognitive load
- AI transparency & trust
- AI control & agency
- Interaction & affordance

Results are stored in `sessionStorage` only — nothing is logged or retained server-side.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` file in the project root:

```env
# Required — your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-...

# Optional — password-protect the entire app
SITE_PASSWORD=your-password-here
```

If `ANTHROPIC_API_KEY` is not set, the app enters fallback mode and prompts visitors to supply their own key. If `SITE_PASSWORD` is set, a login gate is shown before the app loads.

---

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Claude Sonnet 4.6](https://anthropic.com) — multimodal vision via the Anthropic SDK
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vercel](https://vercel.com) for deployment

---

## Project structure

```
app/
  page.tsx              # Landing page and upload form
  results/page.tsx      # Audit results display
  layout.tsx            # Root layout and font config
  globals.css           # Global styles and animations
  api/
    audit/              # Sends image + prompt to Claude, returns JSON
    config/             # Reports whether a server API key is set
    validate-key/       # Validates a user-supplied API key
    auth/               # Site password authentication
lib/
  auditPrompt.ts        # System prompts and prompt assembly
  tokens.ts             # Design token constants (single source of truth)
types/
  audit.ts              # TypeScript types for audit results
public/
  videos/               # Demo video
middleware.ts           # Site password gate (optional)
```

---

## Contributing

Contributions are welcome. A few things worth knowing:

- The audit prompt lives in `lib/auditPrompt.ts`. The dimensions, weights, and heuristics are all editable there.
- Design tokens are in `lib/tokens.ts` — add colors there first before using them anywhere.
- `results/page.tsx` uses inline styles with the `c` token object. `page.tsx` uses Tailwind inline values — a future pass could unify these.
- The `prototypes/` folder contains standalone JSX artifacts used to iterate on UI decisions. Not part of the build.

---

## License

MIT
