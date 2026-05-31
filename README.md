# Lifelines Design Lab

HTML/React design lab for testing Lifelines systems faster than Godot.

Pinned rule:

> This lab exists to test Lifelines design decisions faster than Godot, not to become a second game implementation.

## First slice

Phone Practice Lab:

```text
current state → approach → die → vignette → evidence/report → next approach → second attempt
```

## Stack

- Vite
- React
- TypeScript
- MobX
- Tailwind CSS 4
- daisyUI 5
- Prettier
- PM CLI for project management

## Commands

```sh
npm run dev
npm run build
npm run lint
npm run format
npm test
```

## UI tooling

See `docs/ui-tooling.md` for the daisyUI/Tailwind rules. Short version: Tailwind v4 + daisyUI 5, no `tailwind.config.js` by default, prefer daisyUI component classes and semantic colors, and only write custom CSS when the Lifelines-specific spatial language needs it.
