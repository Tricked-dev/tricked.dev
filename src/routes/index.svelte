<script context="module">
	export const router = false;
	export const hydrate = true;
	export const prerender = true;
</script>

<script lang="ts">
	import Discord from '@svicons/fa-brands/discord.svelte';
	import Github from '@svicons/fa-brands/github.svelte';
	import Twitter from '@svicons/fa-brands/twitter.svelte';
	import Social from '../components/social.svelte';
	import DDG from '../components/ddg.svelte';
	import ElementApp from '../components/element.svelte';
	import '../app.css';
	let tech = {
		Rust: 90,
		Actix: 100,
		Typescript: 100,
		Flutter: 70,
		Dart: 70,
		React: 70,
		Deno: 100,
		Node: 100,
		Postgresql: 70,
		MongoDB: 70,
		Rest: 70,
		Git: 70,
		Docker: 50,
		Linux: 90,
		Grafana: 70,
		CSS3: 70,
		HTML5: 100,
		Discord: 100,
		VScode: 70
	};
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row">
		<div>
			<h1 class="text-5xl font-bold">Tricked.pro</h1>
			<p class="py-6">Welcome to my place in the internet</p>
		</div>
		<div>
			<div class="card w-96 bg-neutral text-neutral-content py-4">
				<div class="items-center text-center card-body">
					<div class="flex gap-1">
						<Social link="https://discord.gg/hkS3YDh" tooltip="tricked#3777" icon={Discord} />
						<Social
							link="https://github.com/tricked-dev"
							tooltip="You can find all my cool projects there"
							icon={Github}
						/>
						<Social link="https://twitter.com/TrickedDev" tooltip="trickedDev" icon={Twitter} />
						<Social link="mailto:tricked@duck.com" tooltip="tricked@duck.com" icon={DDG} />
						<Social
							link="https://matrix.to/#/#tricked-hangout:matrix.org"
							tooltip="tricked"
							icon={ElementApp}
						/>
					</div>
				</div>
			</div>
			<div class="card w-96 bg-neutral text-neutral-content my-2">
				<div class="card-body items-center text-center">
					<h2 class="card-title">Sponsor me on Github</h2>
					<a
						href="https://github.com/sponsors/Tricked-dev"
						class="link-accent btn btn-outline btn-primary">github.com/sponsors/Tricked-dev</a
					>
				</div>
			</div>
			<div class="card w-96 bg-neutral text-neutral-content">
				<div class="card-body items-center text-center">
					<h2 class="card-title">Skillz/Tools</h2>
					<p class="text-sm">
						{#each Object.entries(tech) as [k, v]}
							<span class="tooltip px-1 hover:text-secondary duration-100" data-tip={`${v} %`}>
								{k},
							</span>
						{/each}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
