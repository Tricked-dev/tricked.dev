<script lang="ts">
  import { onMount } from "svelte";
  import Chevron from "./icons/Chevron.svelte";

  let releases: Release[];

  interface Release {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    author: Author;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    assets: Asset[];
    tarball_url: string;
    zipball_url: string;
    body: string;
    reactions?: Reactions;
  }

  interface Author {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  }

  interface Asset {
    url: string;
    id: number;
    node_id: string;
    name: string;
    label: string;
    uploader: Uploader;
    content_type: string;
    state: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
  }

  interface Uploader {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  }

  interface Reactions {
    url: string;
    total_count: number;
    "+1": number;
    "-1": number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  }

  let timer: any;
  let repo = "tricked-dev/desktoppetRS";

  $: {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fetchReleases();
    }, 750);
  }

  async function fetchReleases() {
    //https://api.github.com/repos/ShareX/ShareX/releases
    const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      method: "GET",
    }).then((res) => res.json());
    releases = res;
    expandedRow = releases[0]?.id ?? null;
  }

  onMount(fetchReleases);

  let expandedRow: number | null = null;

  function toggleRow(id: number) {
    expandedRow = expandedRow === id ? null : id;
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
    );
  }

  function formatNumber(num: number, decimals = 1) {
    if (num === 0) return "0";

    const k = 1000;
    const sizes = ["", "K", "M", "B", "T"];
    const i = Math.floor(Math.log(num) / Math.log(k));

    if (i === 0) return num.toString();

    return parseFloat((num / Math.pow(k, i)).toFixed(decimals)) + sizes[i]!;
  }
</script>

<div>
  <input
    type="text"
    class="input input-bordered w-full my-2"
    bind:value={repo}
  />

  <table class="table w-full">
    <thead>
      <tr>
        <th>Release Name</th>
        <th>Release Date</th>
        <th>Downloads</th>
      </tr>
    </thead>
    <tbody>
      {#each releases ?? [] as row}
        <tr
          on:click={() => toggleRow(row.id)}
          class="hover:bg-base-300"
          class:bg-base-300={expandedRow === row.id}
        >
          <td class="flex gap-2">
            <div
              class="duration-200 scale-150"
              class:rotate-90={expandedRow !== row.id}
              class:rotate-180={expandedRow === row.id}
            >
              <Chevron></Chevron>
            </div>

            {row.name}</td
          >
          <td>{row.created_at.slice(0, "0000-00-00".length)}</td>
          <td
            >{formatNumber(
              row.assets.reduce((v, c) => v + c.download_count, 0)
            )}</td
          >
        </tr>
        {#if expandedRow === row.id}
          <tr class="bg-accent">
            <td colspan="100%" class="">
              <div class="flex flex-col gap-4">
                {#each row.assets as asset}
                  <a
                    href={asset.browser_download_url}
                    class="no-underline text-base-content hover:text-base-content bg-base-200 hover:bg-base-300 w-auto p-2"
                    >{asset.name}
                    <span class="bg-accent text-accent-content p-1">
                      {formatBytes(asset.size)}
                    </span>
                    <span class="bg-accent text-accent-content p-1">
                      {formatNumber(asset.download_count)}
                    </span>
                  </a>
                {/each}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>

  <style>
    .collapse-content {
      padding: 1rem;
      background-color: #f3f4f6;
    }
  </style>
</div>
