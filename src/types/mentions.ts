export interface Mention {
  source: "reddit" | "news";
  author: string;
  title: string;
  text: string;
  url: string;
  subreddit?: string | null;
  score?: number | null;
  created_at: string; // ISO timestamp
}

export interface IngestSummary {
  totalFound: number;
  newInserted: number;
  bySource: {
    reddit: number;
    news: number;
  };
}
