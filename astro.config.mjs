import cloudflare from "@astrojs/cloudflare";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import prefetch from "@astrojs/prefetch";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";
import remarkToc from "remark-toc";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://tricked.dev",
  integrations: [
    mdx({
      extendPlugins: false,
    }),
    sitemap({
      changefreq: "weekly",
    }),
    tailwind(),
    prefetch(),
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
    rehypePlugins: [
      [rehypeSlug, {}],
      [
        rehypeToc,
        {
          headings: ["h1", "h2", "h3"],
          cssClasses: {
            toc: "bg-base-300 py-2",
            link: "link link-hover",
          },
        },
      ],
    ],
  },
  trailingSlash: "ignore",
  vite: {
    plugins: [cloudflareRedirect()],
  },
});
