import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { createClient } from "redis";

export const config = {
  api: {
    bodyParser: false,
  },
};

const PAID_REPORT_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

async function getRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is missing");
  const client = createClient({ url });
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();
  return client;
}

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

function isValidSignature(rawBody: Buffer, secret: string, signature: string): boolean {
  const digestHex = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(digestHex, "hex");
  const received = Buffer.from(signature, "hex");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

type LemonWebhookBody = {
  meta?: {
    event_name?: string;
    custom_data?: { report_id?: string };
  };
  data?: {
    id?: string | number;
    attributes?: {
      user_email?: string;
      first_order_item?: {
        product_name?: string;
        variant_name?: string;
      };
      total?: number | string;
      total_formatted?: string;
    };
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({
      error: "LEMONSQUEEZY_WEBHOOK_SECRET is missing.",
    });
  }

  const signatureHeader = req.headers["x-signature"];
  const signature =
    typeof signatureHeader === "string" ? signatureHeader : signatureHeader?.[0] ?? "";

  if (!signature) {
    return res.status(401).json({ error: "Missing webhook signature." });
  }

  try {
    const rawBody = await readRawBody(req);

    if (!isValidSignature(rawBody, secret, signature)) {
      return res.status(401).json({ error: "Invalid webhook signature." });
    }

    const body = JSON.parse(rawBody.toString("utf8")) as LemonWebhookBody;

    const eventName = body.meta?.event_name ?? "unknown_event";
    const reportId = body.meta?.custom_data?.report_id;

    if (eventName === "order_created") {
      const orderId = body.data?.id;
      const customerEmail = body.data?.attributes?.user_email;
      const productName = body.data?.attributes?.first_order_item?.product_name;
      const variantName = body.data?.attributes?.first_order_item?.variant_name;
      const total = body.data?.attributes?.total_formatted ?? body.data?.attributes?.total;

      if (reportId) {
        let client;
        try {
          client = await getRedisClient();
          const key = `paid_report:${reportId}`;
          await client.set(key, "true", { EX: PAID_REPORT_TTL_SECONDS });
          console.log("Lemon order_created: marked paid_report", {
            paidReportId: reportId,
            orderId,
            customerEmail,
            productName,
            variantName,
            total,
          });
          return res.status(200).json({ ok: true, paidReportId: reportId });
        } catch (redisError) {
          console.error("Lemon webhook Redis error:", redisError);
          return res.status(500).json({
            error: "Redis error while marking report paid.",
            details: redisError instanceof Error ? redisError.message : String(redisError),
          });
        } finally {
          if (client) {
            try {
              await client.quit();
            } catch {
              /* ignore */
            }
          }
        }
      }

      console.warn("Lemon order_created webhook missing report_id", {
        orderId,
        customerEmail,
        productName,
        variantName,
        total,
      });
      return res.status(200).json({ ok: true, warning: "missing report_id" });
    }

    return res.status(200).json({ ok: true, ignored: eventName });
  } catch (error) {
    return res.status(400).json({
      error: "Invalid webhook payload",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
