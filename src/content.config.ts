import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    navLabel: z.string(),
    order: z.number().int(),
    source: z.string().url(),
  }),
});

export const collections = { pages };