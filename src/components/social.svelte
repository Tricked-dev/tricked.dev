<script>
	export let tooltip;
	export let link;
	export let icon;
</script>

<a
	href={link}
	class={`flex justify-center hover:text-accent duration-100 ${tooltip ? 'tooltip' : ''}`}
	data-tip={tooltip}
	target="_blank"
	rel="nofollow"
>
	<svelte:component this={icon} width="3em" />
</a>
