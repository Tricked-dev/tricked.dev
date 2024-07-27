import daisyui from "daisyui";
import { dark, black, light } from "./themes";
import starlightPlugin from "@astrojs/starlight-tailwind";
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  safelist: ["bg-base-300", "py-2"],
  daisyui: {
    logs: false,
    themes: [
      {
        dark,
        black,
        light,
      },
    ],
  },
  plugins: [daisyui, starlightPlugin({})],
};
