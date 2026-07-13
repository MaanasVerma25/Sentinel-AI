import { Mention } from "@/types/mentions";

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function searchReddit(
  keyword: string,
  limit = 25,
  type: "posts" | "comments" | "all" = "all"
): Promise<Mention[]> {
  const userAgent = "brand-monitor-agent/0.1";
  const encodedKeyword = encodeURIComponent(keyword);
  const headers = { "User-Agent": userAgent };
  const mentions: Mention[] = [];

  const fetchFromUrl = async (url: string, isComment: boolean): Promise<Mention[]> => {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        console.error(`Reddit search failed for URL: ${url}. Status: ${response.status}`);
        return [];
      }
      const json = await response.json();
      const children = json?.data?.children || [];

      return children.map((child: any) => {
        const data = child.data || {};
        if (isComment) {
          return {
            source: "reddit" as const,
            author: data.author || "[deleted]",
            title: data.link_title ? `Comment on: ${data.link_title}` : "Reddit Comment",
            text: data.body || "",
            url: data.permalink ? `https://www.reddit.com${data.permalink}` : "",
            subreddit: data.subreddit || null,
            score: typeof data.score === "number" ? data.score : null,
            created_at: data.created_utc
              ? new Date(data.created_utc * 1000).toISOString()
              : new Date().toISOString(),
          };
        } else {
          return {
            source: "reddit" as const,
            author: data.author || "[deleted]",
            title: data.title || "Reddit Post",
            text: data.selftext || data.title || "",
            url: data.permalink ? `https://www.reddit.com${data.permalink}` : (data.url || ""),
            subreddit: data.subreddit || null,
            score: typeof data.score === "number" ? data.score : null,
            created_at: data.created_utc
              ? new Date(data.created_utc * 1000).toISOString()
              : new Date().toISOString(),
          };
        }
      });
    } catch (error) {
      console.error(
        `Error searching Reddit for keyword "${keyword}" (isComment: ${isComment}):`,
        error
      );
      return [];
    }
  };

  if (type === "posts" || type === "all") {
    const postsUrl = `https://www.reddit.com/search.json?q=${encodedKeyword}&sort=new&limit=${limit}`;
    const posts = await fetchFromUrl(postsUrl, false);
    mentions.push(...posts);
  }

  if (type === "all") {
    await delay(1000); // Respect Reddit API rate limits between calls
  }

  if (type === "comments" || type === "all") {
    const commentsUrl = `https://www.reddit.com/search.json?q=${encodedKeyword}&sort=new&limit=${limit}&type=comment`;
    const comments = await fetchFromUrl(commentsUrl, true);
    mentions.push(...comments);
  }

  return mentions;
}
