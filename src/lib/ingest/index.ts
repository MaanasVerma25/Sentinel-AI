import { supabase } from "@/lib/supabase";
import { Mention, IngestSummary } from "@/types/mentions";
import { searchReddit, delay } from "./reddit";
import { searchNews } from "./news";

export async function ingestForCompany(companyId: string): Promise<IngestSummary> {
  // a. Fetch the company's name + aliases from Supabase
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("name, aliases")
    .eq("id", companyId)
    .maybeSingle();

  if (companyError) {
    throw new Error(`Failed to fetch company details: ${companyError.message}`);
  }

  if (!company) {
    throw new Error(`Company with ID ${companyId} not found`);
  }

  // Keywords to search: company name plus any aliases
  const keywords = [company.name, ...(company.aliases || [])].filter(Boolean);
  const allMentions: (Mention & { text_hash: string; company_id: string })[] = [];

  // b. Loop over each keyword, calling both searchReddit and searchNews with pacing delays
  for (const keyword of keywords) {
    // Search Reddit
    try {
      const redditResults = await searchReddit(keyword);
      for (const m of redditResults) {
        const textHash = m.text.toLowerCase().trim().slice(0, 120);
        allMentions.push({
          ...m,
          text_hash: textHash,
          company_id: companyId,
        });
      }
    } catch (err) {
      console.error(
        `Failed to ingest Reddit mentions for company ${companyId} and keyword "${keyword}":`,
        err,
      );
    }

    await delay(1000); // 1s delay

    // Search News
    try {
      const newsResults = await searchNews(keyword);
      for (const m of newsResults) {
        const textHash = m.text.toLowerCase().trim().slice(0, 120);
        allMentions.push({
          ...m,
          text_hash: textHash,
          company_id: companyId,
        });
      }
    } catch (err) {
      console.error(
        `Failed to ingest News mentions for company ${companyId} and keyword "${keyword}":`,
        err,
      );
    }

    await delay(1000); // 1s delay
  }

  // d. Query existing text_hashes for that company_id from Supabase to filter out duplicates
  const { data: existingRecords, error: hashQueryError } = await supabase
    .from("mentions")
    .select("text_hash")
    .eq("company_id", companyId);

  if (hashQueryError) {
    console.error(
      `Error checking existing mentions in database for company ${companyId}:`,
      hashQueryError,
    );
  }

  const existingHashes = new Set(existingRecords?.map((r: any) => r.text_hash) || []);

  // Filter out database duplicates
  const newMentions = allMentions.filter((m) => !existingHashes.has(m.text_hash));

  // Deduplicate within the newly fetched batch itself
  const uniqueBatchMentionsMap = new Map<string, (typeof newMentions)[number]>();
  for (const m of newMentions) {
    if (!uniqueBatchMentionsMap.has(m.text_hash)) {
      uniqueBatchMentionsMap.set(m.text_hash, m);
    }
  }
  const finalMentionsToInsert = Array.from(uniqueBatchMentionsMap.values());

  let redditCount = 0;
  let newsCount = 0;

  // e. Bulk insert new mentions into the mentions table
  if (finalMentionsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("mentions").insert(finalMentionsToInsert);

    if (insertError) {
      throw new Error(`Failed to bulk insert mentions: ${insertError.message}`);
    }

    for (const m of finalMentionsToInsert) {
      if (m.source === "reddit") {
        redditCount++;
      } else if (m.source === "news") {
        newsCount++;
      }
    }
  }

  // f. Return the summary
  return {
    totalFound: allMentions.length,
    newInserted: finalMentionsToInsert.length,
    bySource: {
      reddit: redditCount,
      news: newsCount,
    },
  };
}
