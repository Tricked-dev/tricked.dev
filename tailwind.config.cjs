const themes = require("daisyui/src/colors/themes");
const daisyui = require("daisyui");

const theme = {
  ...themes["[data-theme=forest]"],
  neutral: themes["[data-theme=black]"].neutral,
  accent: themes["[data-theme=black]"].accent,
  secondary: "#6593ed",
  ["base-100"]: themes["[data-theme=black]"]["base-100"],
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
