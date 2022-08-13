import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

/** @type {import('vite').UserConfig} */
const config = {
	build: {
		minify: 'esnext',
		target: 'es2020'
	},
	plugins: [VitePWA(), sveltekit()]
};

export default config;
