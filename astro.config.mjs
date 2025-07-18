import cloudflare from "@astrojs/cloudflare";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";
import rss from '@astrojs/rss';
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import themes from "./themes";
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'

const site = "https://tricked.dev";

// https://astro.build/config
export default defineConfig({
  site: site,
  prefetch: true,
  integrations: [
    expressiveCode({
      plugins: [
        pluginCollapsibleSections()
      ]
    }),
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
      favicon: "/favicon.png",
      tableOfContents: true,
      social: {
        discord: site + "/discord",
        twitter: site + "/twitter",
        github: site + "/github",
      },
      disable404Route: true,
      sidebar: [
        // A collapsed group of links.
        {
          label: "Welcome",
          collapsed: false,
          items: ["wiki/index"],
        },
        // An expanded group containing collapsed autogenerated subgroups.
        {
          label: "PaperTimeSeries",
          autogenerate: {
            directory: "wiki/papertimeseries",
            collapsed: false,
          },
        },
      ],

      editLink: {
        baseUrl: "https://github.com/tricked-dev/tricked.dev/blob/master/",
      },
      plugins: [],
      components: {
        Head: "./src/components/starlight/Head.astro",
        ThemeSelect: "./src/components/ThemeSwitcher.astro",
        ThemeProvider: "./src/components/starlight/Clear.astro",
      },
    }),
  ],
  experimental: {},
  output: "hybrid",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
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
      external: ["node:url", "node:path", "node:child_process", "node:fs", "node:fs/promises"],
    },
  },
});
