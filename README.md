# @nonsponsored/storyblok-loader

A content loader for Astro Content Layer that fetches content from Storyblok's API.

## Requirements

- Astro 5.2.0 or higher (required for Content Layer API)
- @storyblok/astro 6.0.0 or higher

## Important Notes

- Intended to be used for build process, not in development mode or using Storyblok's Live Preview.
- Internationalization support has not been tested. Use with caution and please report any issues you encounter.

## Installation

Using npm:
```
npm install @nonsponsored/storyblok-loader
```

Using yarn:
```
yarn add @nonsponsored/storyblok-loader
```

## Usage

1. Set up your environment variables in `.env`:
- `STORYBLOK_API_KEY`: Your Storyblok API token
- `STORYBLOK_API_VERSION`: "draft" or "published"

Note: In production, the loader will always use the "published" version regardless of the `STORYBLOK_API_VERSION` setting.

2. Configure your content collection in `src/content/config.ts`:
```
import { defineCollection } from "astro:content";
import { storyblokLoader } from "@nonsponsored/storyblok-loader";

const storyblokCollection = defineCollection({
    loader: storyblokLoader({
        accessToken: import.meta.env.STORYBLOK_API_KEY,
        version: import.meta.env.MODE === "production" ? "published" : import.meta.env.STORYBLOK_API_VERSION,
        region: "us",
        language: "en",
        contentType: "blog",
        resolve_relations: ["author.posts", "related_posts"],
        resolve_links: "url",
        sort_by: "content.published_date:desc",
        filter_query: {
            "content.category": "technology"
        }
    })
});

export const collections = {
    storyblok: storyblokCollection,
};
```

## Configuration Options

The loader accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accessToken` | `string` | Required | Your Storyblok API token |
| `version` | `"published"` \| `"draft"` | `"published"` | Content version to fetch |
| `region` | `"us"` \| `"eu"` | `"us"` | Storyblok API region |
| `language` | `string` | undefined | Language/locale code (e.g., "en", "de") |
| `contentType` | `string` | undefined | Filter by content type |
| `sort_by` | `string` | undefined | Sort entries by field |
| `filter_query` | `Record<string, any>` | undefined | Filter by field values |
| `resolve_relations` | `string[]` | undefined | Resolve relationships |
| `resolve_links` | `"url"` \| `"story"` \| "0" \| "1" \| "2" | undefined | Resolve links to other stories |

## Returned Data Structure

The loader returns an array of stories with the following structure:
```
interface Story {
    id: string;
    slug: string;
    content: unknown;
    name: string;
    created_at: string;
    published_at: string;
    editable?: string;
    is_folder?: boolean;
    full_slug: string;
    language?: string;
    translated_slugs?: Array<{
        lang: string;
        name: string;
        path: string;
    }>;
}
```

## Examples

### Basic Usage
```
const storyblokCollection = defineCollection({
    loader: storyblokLoader({
        accessToken: import.meta.env.STORYBLOK_API_KEY,
        version: import.meta.env.MODE === "production" ? "published" : "draft",
        region: "us"
    })
});

export const collections = {
    storyblok: storyblokCollection,
};
```
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
