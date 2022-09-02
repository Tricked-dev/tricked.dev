<script context="module">
	export function load({ params }) {
		return {
			status: 307,
			redirect: `https://github.com/tricked-dev/${params.repo}`
		};
	}
</script>
