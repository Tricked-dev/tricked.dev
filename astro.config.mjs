import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import tailwind from "@astrojs/tailwind";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";

// https://astro.build/config
export default defineConfig({
  site: "https://tricked.dev",
  integrations: [mdx(), sitemap({
    changefreq: 'weekly'
  }), tailwind(), prefetch()],
  vite: {
    plugins: [cloudflareRedirect()]
  }
});