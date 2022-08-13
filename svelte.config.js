import { mdsvex } from 'mdsvex';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import headingSlugs from 'rehype-slug';
import linkHeadings from 'rehype-autolink-headings';

const rehypePlugins = [
	headingSlugs,
	[
		linkHeadings,
		{
			behavior: 'prepend',
			content: {
				type: 'element',
				tagName: 'span',
				properties: {
					className: [
						'mr-1 opacity-20 hover:opacity-60 text-base-100 font-bold inline-block align-middle relative -mt-1 text-sm'
					]
				},
				children: [
					{
						type: 'text',
						value: '#'
					}
				]
			}
		}
	]
];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		inlineStyleThreshold: 1024 * 64 * 64,
		adapter: adapter()
	},

	preprocess: [
		preprocess({
			postcss: true
		}),
		mdsvex({
			extensions: ['.svelte.md', '.md'],
			rehypePlugins: rehypePlugins,
			layout: {}
		})
	]
};

export default config;
