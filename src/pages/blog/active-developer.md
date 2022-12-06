---
layout: "../../layouts/BlogPost.astro"
title: "How i got the active developer badge"
description: "Post how i got the active developer badge on Discord"
pubDate: "Nov 12 2022"
heroImage: "/img/blog/active-developer.png"
---

I got the active developer badge by making the bot [Aethor](https://aethor.xyz/), you can get the badge by having a bot that ran a slash command in the past 30 days and claiming it on the [Discord Developer Portal](https://discord.com/developers/active-developer).

## Guide

Make a bot on the [Discord Developer Portal](https://discord.com/developers/applications) and invite it to your server.

Install [Deno](https://deno.land/) and make a file called `mod.ts` with the following content:

```ts
import {
  createBot,
  Intents,
  startBot,
} from "https://deno.land/x/discordeno@13.0.0/mod.ts";

const bot = createBot({
  token: "YOUR_BOT_TOKEN",
  intents: Intents.Guilds | Intents.GuildMessages,
  events: {
    ready() {
      console.log("Successfully connected to gateway");
    },
    interactionCreate(bot, interaction) {
      bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: 4,
        data: {
          content: `Hello ${interaction.user.username}`,
        },
      });
    },
  },
});

await bot.helpers.upsertApplicationCommands([
  {
    name: "hi",
    description: "Say hi to the bot",
  },
]);

await startBot(bot);
```

Replace `YOUR_BOT_TOKEN` with your bot token and run `deno run -A mod.ts` in the same directory as the file.

And if you did everything correctly you should see `Successfully connected to gateway` in the console and your bot should now have a command called `/hi` run it and then go to the [Discord Developer Portal](https://discord.com/developers/active-developer) and claim your badge!

## Why does discord give out this new badge?

Discord is trying to make people start to learn programming and rewarding people for doing so with a badge is a good way to do it.

![](https://camo.githubusercontent.com/2396b5224a807ce6baf26214c3f219eb615ecba2923cfc3554740c7c889e9419/68747470733a2f2f692e696d6775722e636f6d2f7a366a7a7734432e706e67)

## See also

- [hackermondev's guide](https://github.com/hackermondev/discord-active-developer)
