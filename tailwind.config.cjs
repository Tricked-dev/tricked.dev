const daisyui = require("daisyui");
const themes = require("daisyui/src/theming/themes");

const basic = {
  ...themes["business"],
  ...themes["forest"],
  neutral: themes["black"].neutral,
  accent: themes["black"].accent,
  secondary: themes["acid"].secondary,
  ["base-100"]: themes["halloween"]["base-100"],
  ["base-300"]: themes["black"]["base-300"],
  "--rounded-btn": "0.4rem",
};

const black = {
  ...basic,
  ["base-100"]: themes["black"]["base-100"],
  ["base-200"]: themes["black"]["base-200"],
  ["base-300"]: themes["black"]["base-300"],
};

const light = {
  ...basic,
  ["base-100"]: themes["light"]["base-100"],
  ["base-200"]: themes["light"]["base-200"],
  ["base-300"]: themes["light"]["base-300"],
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
        basic,
      },
      {
        black,
      },
      {
        light,
      },
    ],
  },
  plugins: [daisyui],
};
