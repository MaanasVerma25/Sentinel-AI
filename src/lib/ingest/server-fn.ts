import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ingestForCompany } from "./index";

/**
 * Server function to trigger ingestion for a specific company.
 * Can be called from any client component via:
 *   import { ingestForCompanyFn } from "@/lib/ingest/server-fn";
 *   const summary = await ingestForCompanyFn({ data: { companyId: "..." } });
 */
export const ingestForCompanyFn = createServerFn({ method: "POST" })
  .validator(z.object({ companyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { companyId } = data;

    try {
      const summary = await ingestForCompany(companyId);
      return summary;
    } catch (error: any) {
      console.error("Server ingestion function failed:", error);
      throw new Error(error.message || "Internal server error during ingestion");
    }
  });
