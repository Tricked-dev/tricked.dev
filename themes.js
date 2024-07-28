import themes from "daisyui/src/theming/themes";
export const dark = {
  ...themes["business"],
  ...themes["forest"],
  neutral: themes["black"].neutral,
  accent: themes["black"].accent,
  secondary: themes["acid"].secondary,
  ["base-100"]: themes["halloween"]["base-100"],
  ["base-300"]: themes["black"]["base-300"],
  "--rounded-btn": "0.4rem",
};

export const black = {
  ...dark,
  ["base-100"]: themes["black"]["base-100"],
  ["base-200"]: themes["black"]["base-200"],
  ["base-300"]: themes["black"]["base-300"],
};

export const light = {
  ...dark,
  ["base-100"]: themes["light"]["base-100"],
  ["base-200"]: themes["light"]["base-200"],
  ["base-300"]: themes["light"]["base-300"],
};
