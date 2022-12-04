import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";

// https://astro.build/config
export default defineConfig({
  site: "https://tricked.pro",
  integrations: [mdx(), sitemap(), tailwind()],
  vite: {
    plugins: [cloudflareRedirect()],
  },
});
