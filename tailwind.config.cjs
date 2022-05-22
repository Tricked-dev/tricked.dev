const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},
	  daisyui: {
    themes: ["business"],
  },
	plugins: [forms, typography, require('daisyui')]
};

module.exports = config;
