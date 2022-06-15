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
	import { default as tiers } from './_tiers.json';
	import '../app.css';

	let tech = {
		Rust: 90,
		Actix: 90,
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
		Kotlin: 50,
		Grafana: 70,
		CSS3: 70,
		HTML5: 100,
		Discord: 100,
		VScode: 70
	};
	let display = false;
	let mode: string | number = 2;
	let text = 'Welcome to Tricked.pro this is a awesome site';
	let slide = 5;
	let title = text.substring(0, slide);
	let length = 8;
	setInterval(() => {
		if (slide < text.length + 1) {
			title = text.substring(slide - length, slide);
			slide++;
			if (title.endsWith(' ')) {
				title = text.substring(slide - length, slide);
				slide++;
			}
		} else {
			slide = 5;
		}
	}, 300);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row gap-10">
		<div>
			<h1 class="text-5xl font-bold">Tricked.pro</h1>
			<p class="py-6">Welcome to my place in the internet</p>
			<button
				class="btn"
				on:click={() => {
					display = !display;
					setTimeout(() => document.getElementById('hire').scrollIntoView(), 50);
				}}>Sponsor Tiers</button
			>
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
{#if display}
	<div class="bg-base-300 m-h-screen py-5" id="hire">
		<div class="flex-col lg:flex-row">
			<div class="flex justify-center">
				<div class="card">
					<div class="card-body w-96">
						<h2 class="text-3xl font-bold">hire me</h2>
						<p class="py-6">
							If you want to hire me please contact me on discord or email. Otherwise if you just
							want to support my work you can view my github sponsor tiers below and on my gihtub
							profile!
						</p>
					</div>
				</div>
			</div>

			<div class="justify-center flex flex-col ">
				<h2 class="prose max-w-none text-center">Github Sponsor Tiers</h2>
				<div class="tabs justify-center">
					{#each [[1, 'All'], [2, 'OneTime'], [3, 'Monthly']] as i}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class={`tab ${mode == i[0] ? 'tab-active' : ''}`} on:click={() => (mode = i[0])}
							>{i[1]}</a
						>
					{/each}
				</div>
				<div class="grid justify-center gap-4 auto-rows-min">
					{#each tiers.data.user.sponsorsListing.tiers.edges.filter( (x) => (mode == 1 ? true : mode == 2 ? x.node.isOneTime : !x.node.isOneTime) ) as tier}
						<div class="card w-96 bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">{tier.node.name}</h2>
								<p class="text-start prose">
									{@html tier.node.descriptionHTML}
								</p>
								<div class="card-actions justify-end mt-auto">
									<a
										href={`https://github.com/sponsors/Tricked-dev${
											tier.node.isOneTime ? '?frequency=one-time' : ''
										}`}
									>
										<button class="btn btn-primary">View on Github!</button>
									</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
