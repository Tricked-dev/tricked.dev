import cloudflare from "@astrojs/cloudflare";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import starlight from "@astrojs/starlight";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://tricked.dev",
  prefetch: true,
  integrations: [
    expressiveCode(),
    mdx({
      extendPlugins: false,
    }),
    sitemap({
      changefreq: "weekly",
    }),
    tailwind(),
    svelte(),
    starlight({
      customCss: ["./src/styles/global.css"],
      title: "Tricked.dev",
      tableOfContents: true,
      social: {},
      disable404Route: true,
      head: [
        {
          tag: "script",
          attrs: {
            "data-goatcounter": "https://stats.tricked.dev/count",
            async: true,
            src: "//stats.tricked.dev/count.js",
          },
        },
        {
          tag: "style",
          content: "* { --width: auto }",
        },
      ],
      plugins: [],
    }),
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
    ssr: {
      external: ["node:url", "node:path", "node:child_process", "node:fs"],
    },
  },
});
