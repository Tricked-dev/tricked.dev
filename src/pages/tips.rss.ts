import { POCKETBASE_URL } from "../config";
import PocketBase from "pocketbase";
import rss from "@astrojs/rss";

export async function GET(context: { site: string }) {
  const pb = new PocketBase(POCKETBASE_URL);
  const resultList = await pb.collection("tips").getList(1, 500, {});

  const items = resultList.items.map((tip) => ({
    title: tip.summary,
    pubDate: new Date(tip.created),
    description: tip.content,
    link: `/tips#${tip.tip_number}`,
  }));

  return rss({
    title: "Tips RSS Feed",
    description: "Latest tips from our collection.",
    site: context.site,
    trailingSlash: false,
    items,
  });
}
