import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

async function getRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is missing");
  const client = createClient({ url });
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();
  return client;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const reportIdParam = req.query.report_id;
  const reportId = Array.isArray(reportIdParam) ? reportIdParam[0] : reportIdParam;
  if (!reportId || typeof reportId !== "string") {
    return res.status(400).json({ error: "report_id query parameter is required." });
  }

  let client;
  try {
    client = await getRedisClient();
    const key = `paid_report:${reportId}`;
    const exists = await client.exists(key);
    return res.status(200).json({ paid: exists === 1 });
  } catch (error) {
    console.error("check-paid Redis error:", error);
    return res.status(500).json({
      error: "Unable to verify payment status.",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (client) {
      try {
        await client.quit();
      } catch {
        // ignore quit errors
      }
    }
  }
}
