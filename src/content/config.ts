import { defineCollection, z } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";

const starlightSchema = defineCollection({
  schema: docsSchema({
    extend: z.object({
      image: z.string().optional(),
    }),
  }),
});

export const collections = {
  docs: starlightSchema,
};
