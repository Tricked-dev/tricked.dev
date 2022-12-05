const themes = require("daisyui/src/colors/themes");
const daisyui = require("daisyui");

const theme = {
  ...themes["[data-theme=business]"],
  ...themes["[data-theme=forest]"],
  neutral: themes["[data-theme=black]"].neutral,
  accent: themes["[data-theme=black]"].accent,
  ["base-100"]: themes["[data-theme=black]"]["base-100"],
  secondary: "#6593ed",
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
