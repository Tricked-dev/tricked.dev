<script>
  import { onMount } from 'svelte';
  export let images = [];
  let shuffled = [];
  let visible = [];
  let container;
  let itemHeight = 0;
  let itemsPerRow = 1;
  let buffer = 4; // extra rows to render above and below
  let start = 0;
  let end = 0;
  let topSpacer = 0;
  let bottomSpacer = 0;

  // Fisher-Yates shuffle
  function shuffle(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function updateVisible() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    // Calculate how many fit per row (based on width)
    const width = rect.width;
    itemsPerRow = width > 600 ? 2 : 1;
    itemHeight = width > 600 ? width / 2 * 9 / 16 : width * 9 / 16;
    const rowHeight = itemHeight;
    const totalRows = Math.ceil(shuffled.length / itemsPerRow);
    const scrollTop = scrollY + rect.top;
    const startRow = Math.max(0, Math.floor((scrollTop - rect.top) / rowHeight) - buffer);
    const endRow = Math.min(totalRows, Math.ceil((scrollTop - rect.top + viewportHeight) / rowHeight) + buffer);
    start = startRow * itemsPerRow;
    end = Math.min(shuffled.length, endRow * itemsPerRow);
    visible = shuffled.slice(start, end);
    // Spacer heights
    topSpacer = startRow * rowHeight;
    bottomSpacer = (totalRows - endRow) * rowHeight;
  }

  onMount(() => {
    shuffled = shuffle(images);
    updateVisible();
    window.addEventListener('scroll', updateVisible);
    window.addEventListener('resize', updateVisible);
    return () => {
      window.removeEventListener('scroll', updateVisible);
      window.removeEventListener('resize', updateVisible);
    };
  });
</script>

<div bind:this={container} style="width: 100%;">
  <style>
  .bg-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 600px) {
    .bg-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .bg-item {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #181818;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    display: block;
  }
</style>
<div class="bg-grid" style="position:relative;">
  <div style="height: {topSpacer}px;"></div>
  {#each visible as name (name)}
    <div class="bg-item">
      <img src={`https://bg.tricked.dev/${name}`} alt={name} class="bg-img" loading="lazy" />
    </div>
  {/each}
  <div style="height: {bottomSpacer}px;"></div>
</div>
</div>
