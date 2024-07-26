import { defineCollection, z } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";

const starlightSchema = defineCollection({
  schema: docsSchema({}),
});

export const collections = {
  docs: starlightSchema,
};
