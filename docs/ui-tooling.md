# UI tooling notes

Source: https://daisyui.com/llms.txt

## Tailwind + daisyUI

This lab uses Tailwind CSS 4 and daisyUI 5.

Keep the setup simple:

```css
@import 'tailwindcss';
@plugin "daisyui";
```

Do not add `tailwind.config.js` unless there is a real need. Tailwind v4 does not need it for normal use.

## Usage rules

- Prefer daisyUI component classes and Tailwind utilities over custom CSS.
- Use daisyUI semantic colors (`base-*`, `primary`, `secondary`, `accent`, `neutral`, `success`, `warning`, `error`) instead of fixed Tailwind color names when the color is part of the UI language.
- Avoid `dark:` variants for daisyUI semantic colors; the theme should carry that work.
- Use responsive Tailwind prefixes for layout (`sm:`, `md:`, `lg:`, etc.).
- If a daisyUI component is close enough, use it and tune with utilities.
- If a component does not exist, build it with Tailwind utilities before writing broad custom CSS.
- Use `!` overrides only as a last resort for specificity fights.

## Lifelines-specific bias

The design lab should still feel like Lifelines, not like generic daisyUI demo paste. Use daisyUI as scaffolding and interaction vocabulary; keep the spatial/object/state language custom where it carries design meaning.
