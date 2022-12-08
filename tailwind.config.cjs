const themes = require("daisyui/src/colors/themes");
const daisyui = require("daisyui");

const theme = {
  ...themes["[data-theme=business]"],
  ...themes["[data-theme=forest]"],
  neutral: themes["[data-theme=black]"].neutral,
  accent: themes["[data-theme=black]"].accent,
  secondary: themes["[data-theme=acid]"].secondary,
  ["base-100"]: themes["[data-theme=halloween]"]["base-100"],
  ["base-200"]: themes["[data-theme=halloween]"]["base-200"],
  ["base-300"]: themes["[data-theme=black]"]["base-300"],
  "--rounded-btn": "0.4rem",
};

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
        forest: theme,
      },
    ],
  },
  plugins: [daisyui],
};
