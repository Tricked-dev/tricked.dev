const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: [
		'mr-1',
		'opacity-20',
		'hover:opacity-60',
		'text-base',
		'font-bold',
		'inline-block',
		'align-middle',
		'relative',
		'-mt-1',
		'animate-pulse-slow'
	],
	theme: {
		extend: {}
	},
	daisyui: {
		themes: [
			{
				TrickedOntop: {
					primary: '#1EB854',
					secondary: '#1FD65F',
					accent: '#D99330',
					neutral: '#110E0E',
					'base-100': '#171212',
					info: '#3ABFF8',
					success: '#36D399',
					warning: '#FBBD23',
					error: '#F87272'
				}
			}
		]
	},
	plugins: [forms, typography, require('daisyui')]
};

module.exports = config;
