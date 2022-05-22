import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import { viteSingleFile } from "vite-plugin-singlefile"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		inlineStyleThreshold: 1024 * 64,
		adapter: adapter(),
		vite: {
		},
	},

	preprocess: [
		preprocess({
			postcss: true
		})
	]
};

export default config;
