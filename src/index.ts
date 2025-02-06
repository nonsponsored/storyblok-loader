import StoryblokClient from "storyblok-js-client";

interface StoryblokLoaderOptions {
  /** Storyblok API token */
  accessToken: string;
  /** Storyblok version ("published" or "draft") */
  version?: "published" | "draft";
  /** Storyblok region ("us" or "eu") */
  region?: "us" | "eu";
  /** Language/locale code (e.g., "en", "de", "fr") */
  language?: string;
  /** Include specific content types only */
  contentType?: string;
  /** Sort entries by a specific field */
  sort_by?: string;
  /** Filter by field values */
  filter_query?: Record<string, any>;
  /** Whether to resolve relationships */
  resolve_relations?: string[];
  /** Whether to resolve links to other stories */
  resolve_links?: "url" | "story" | "0" | "1" | "2";
}

interface StoryblokStory {
  uuid: string;
  full_slug: string;
  content: unknown;
  name: string;
  created_at: string;
  published_at: string;
  _editable?: string;
  is_folder?: boolean;
  lang?: string;
  translated_slugs?: Array<{
    lang: string;
    name: string;
    path: string;
  }>;
}

/**
 * Fetches and loads Storyblok content for Astro content collections.
 * @param options - Configuration options for the Storyblok loader
 * @returns An async loader function compatible with Astro content collections
 * @example
 * ```ts
 * import { defineCollection } from 'astro:content';
 * import { storyblokLoader } from '@nonsponsored/storyblok-loader';
 * 
 * const storyblokCollection = defineCollection({
 *   loader: storyblokLoader({
 *     accessToken: import.meta.env.STORYBLOK_API_KEY,
 *     version: import.meta.env.MODE === "production" ? "published" : import.meta.env.STORYBLOK_API_VERSION,
 *     region: "us",
 *     language: "en",
 *     contentType: "blog",
 *     resolve_relations: ["author.posts", "related_posts"],
 *     resolve_links: "url",
 *     sort_by: "content.published_date:desc",
 *     filter_query: {
 *       "content.category": "technology"
 *     }
 *   })
 * });
 * ```
 */
export const storyblokLoader = ({
  accessToken,
  version = "published",
  region = "us",
  language,
  contentType,
  sort_by,
  filter_query,
  resolve_relations,
  resolve_links
}: StoryblokLoaderOptions) => {
  return async () => {
    const storyblokApi = new StoryblokClient({ 
      accessToken, 
      region 
    });

    try {
      const perPage = 100;
      let page = 1;
      const stories: StoryblokStory[] = [];

      while (true) {
        const { data: { stories: pageStories } } = await storyblokApi.get("cdn/stories", {
          version,
          per_page: perPage,
          page,
          ...(language && { language }),
          ...(contentType && { content_type: contentType }),
          ...(sort_by && { sort_by }),
          ...(filter_query && { filter_query }),
          ...(resolve_relations && { resolve_relations }),
          ...(resolve_links && { resolve_links }),
        });

        if (!pageStories.length) break;
        stories.push(...pageStories);
        if (pageStories.length < perPage) break;
        page++;
      }

      return stories.map((story) => ({
        id: story.uuid,
        slug: story.full_slug,
        content: story.content,
        name: story.name,
        created_at: story.created_at,
        published_at: story.published_at,
        _editable: story._editable,
        is_folder: story.is_folder,
        full_slug: story.full_slug,
        language: story.lang,
        translated_slugs: story.translated_slugs,
      }));
    } catch (error) {
      console.error("Error fetching Storyblok content:", error instanceof Error ? error.message : error);
      return [];
    }
  };
};
