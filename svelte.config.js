import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import headingSlugs from 'rehype-slug';
import linkHeadings from 'rehype-autolink-headings';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		inlineStyleThreshold: 1024 * 64 * 64,
		adapter: adapter()
	},

	preprocess: [
		preprocess({
			postcss: true
		})
	]
};

export default config;
