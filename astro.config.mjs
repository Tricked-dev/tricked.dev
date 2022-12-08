import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import tailwind from "@astrojs/tailwind";
import remarkToc from "remark-toc";
import rehypeToc from "rehype-toc";
import rehypeSlug from "rehype-slug";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";

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
  markdown: {
    remarkPlugins: [[remarkToc, { tight: true, ordered: true }]],
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
    build: {
      minify: "esbuild",
    },
  },
});
