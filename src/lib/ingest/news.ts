import Parser from "rss-parser";
import { Mention } from "@/types/mentions";

const parser = new Parser();

export async function searchNews(query: string): Promise<Mention[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const feed = await parser.parseURL(url);
    const items = feed.items || [];

    return items.map((item) => {
      const title = item.title || "";
      // Extract publisher source from the end of the title (e.g., "Story Title - TechCrunch")
      const sourceMatch = title.match(/ - ([^-]+)$/);
      const author = sourceMatch ? sourceMatch[1].trim() : "Google News";
      const cleanTitle = sourceMatch
        ? title.substring(0, title.lastIndexOf(" - ")).trim()
        : title;

      return {
        source: "news" as const,
        author,
        title: cleanTitle || title,
        text: item.contentSnippet || item.content || cleanTitle || title,
        url: item.link || "",
        subreddit: null,
        score: null,
        created_at: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error(`Error searching Google News for query "${query}":`, error);
    return [];
  }
}
