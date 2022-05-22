import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		inlineStyleThreshold: 1024 * 64 * 64,
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
