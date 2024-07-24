<script lang="ts">
  import { onMount } from "svelte";
  import PocketBase from "pocketbase";
  import { POCKETBASE_URL } from "../config";

  export let tips: any[];

  onMount(async () => {
    const pb = new PocketBase(POCKETBASE_URL);
    const resultList = await pb.collection("tips").getList(1, 500, {});
    if (resultList.items.length > 0) {
      tips = resultList.items;
    }
  });

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  function formatRelativeDate(date: Date) {
    const now = new Date();
    const diffInSeconds = (+date - +now) / 1000;

    const times = [
      { unit: "year", value: diffInSeconds / (60 * 60 * 24 * 365) },
      { unit: "month", value: diffInSeconds / (60 * 60 * 24 * 30) },
      { unit: "week", value: diffInSeconds / (60 * 60 * 24 * 7) },
      { unit: "day", value: diffInSeconds / (60 * 60 * 24) },
      { unit: "hour", value: diffInSeconds / (60 * 60) },
      { unit: "minute", value: diffInSeconds / 60 },
      { unit: "second", value: diffInSeconds },
    ] as const;

    for (let { unit, value } of times) {
      if (Math.abs(value) >= 1) {
        return rtf.format(Math.round(value), unit);
      }
    }
    return rtf.format(0, "second"); // for very small differences
  }
</script>

<div class="flex gap-8 flex-col">
  {#each tips as tip}
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body p-4">
        <h2 class="card-title my-0" id={tip.tip_number}>
          <a class="text-base-content/70 no-underline" href="#{tip.tip_number}"
            >#{tip.tip_number}</a
          >
          {tip.summary}
        </h2>
        <time datetime={tip.created} class="text-sm text-base-content/70">
          created {formatRelativeDate(new Date(tip.created))}
          {tip.updated != tip.created
            ? `updated ${formatRelativeDate(new Date(tip.updated))}`
            : ""}
        </time>
        <section>
          {@html tip.content.trim()}
        </section>
      </div>
    </div>
  {/each}
</div>
