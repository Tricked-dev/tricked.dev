import cloudflare from "@astrojs/cloudflare";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://tricked.dev",
  prefetch: true,
  integrations: [
    mdx({
      extendPlugins: false,
    }),
    sitemap({
      changefreq: "weekly",
    }),
    tailwind(),
    svelte(),
  ],
  experimental: {},
  output: "hybrid",
  adapter: cloudflare(),
  markdown: {
    remarkPlugins: [
      [
        remarkToc,
        {
          tight: true,
          ordered: true,
        },
      ],
    ],
    rehypePlugins: [[rehypeSlug, {}]],
  },
  trailingSlash: "ignore",
  vite: {
    plugins: [cloudflareRedirect()],
  },
});
