---
layout: "../../layouts/BlogPost.astro"
title: "Combining daisyui and starlight"
description: "My (hacks) to make daisyui and starlight work together pretty nicely"
pubDate: "Sep 27 2024"
heroImage: "/assets/tricked.dev_wiki(Nest Hub).png"
---

:::tip
## update 13-07-2025: with the new daisyui and tailwind versions this no longer works i have not bothered to upgrade this to the new daisyui version yet 
:::

To use the new [starlight docs](https://starlight.astro.build/) with daisyui and make the colors integrate you only have to do a couple of things, first you obviously need daisyui and tailwindcss installed. `bunx astro add tailwind` then you will need to add daisyui to the tailwindcss config <https://daisyui.com/docs/install/> or in the `tailwind.config.mjs`

```js
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    // try a couple themes out https://daisyui.com/docs/themes/
    //themes: ["synthwave"]
  },
};
```

Then you will need to overwrite the starlight styles using our own custom styles based on the daisyui styles. You can place this file in `src/styles/global.css`
All the color variables you see here `--b1`, `--bc`, `--p` etc come from daisyui and we basically make them to starlight variables we use the data-theme attributes to increase priority of our styles

```css
:root,
:root[data-theme="dark"],
:root[data-theme="light"],
:root[data-theme="black"] {
  --bg: oklch(var(--b1));
  --text: oklch(var(--bc));
  --sl-color-accent-low: color-mix(in oklch, oklch(var(--p)) 60%, black 40%);
  --sl-color-accent: oklch(var(--p) / 1);
  --sl-color-accent-high: color-mix(in oklch, oklch(var(--p)) 80%, white 20%);
  --sl-color-white: oklch(var(--bc) / 1);
  --sl-color-gray-1: color-mix(in oklch, var(--bg) 10%, var(--text) 90%);
  --sl-color-gray-2: color-mix(in oklch, var(--bg) 20%, var(--text) 80%);
  --sl-color-gray-3: color-mix(in oklch, var(--bg) 50%, var(--text) 50%);
  --sl-color-gray-4: color-mix(in oklch, var(--bg) 60%, var(--text) 40%);
  --sl-color-gray-5: color-mix(in oklch, var(--bg) 70%, var(--text) 30%);
  --sl-color-gray-6: color-mix(in oklch, var(--bg) 90%, var(--text) 10%);
  --sl-color-black: oklch(var(--b1) / 1);
}
```

After this you can add this to your starlight config in the `astro.config.mjs`

```js
export default defineConfig({
  integrations: [
    starlight({
      customCss: ["./src/styles/global.css"],
      //... rest of config
    }),
    tailwind(),
  ],
});
```

And the docs should now play nice with the daisyui styling and it works with basically every theme while keeping things mostly readable if you have improvements feel free to submit a pr to this post or comment your improvements.

Keep in mind the theme switcher of starlight will not play nicely with the new daisyui themes and you will have to [overwrite it](https://starlight.astro.build/guides/overriding-components/), i have applied those changes to my [personal website](https://github.com/Tricked-dev/tricked.dev/blob/2e804113660f41faa7f6b3651d5d2bd1e73aacaf/astro.config.mjs#L62-L66) and you can view them here to add them yourself too. or you can just disable the theme switcher.
