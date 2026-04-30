import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

type Mode = "single" | "compatibility";

type AnalyzeRequestBody = {
  mode?: unknown;
  images?: unknown;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalizeJsonText(outputText: string): string {
  const trimmed = outputText.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  return trimmed;
}

const SINGLE_PROMPT = `You are PalmVibe, an AI palm reading and self-reflection assistant.

Analyze the uploaded palm photo for entertainment and self-reflection only.
Do not claim scientific certainty, medical diagnosis, legal advice, financial advice, psychological advice, or guaranteed future predictions.

Your job is not to "predict fate". Your job is to create a highly personalized, emotionally resonant reading based on visible hand features.

Use visible details from the image:
- hand shape
- palm width and length
- finger length and spacing
- thumb openness
- palm fullness
- visible major palm lines
- line depth, direction, and clarity if visible
- fine lines or texture if visible
- image quality limitations if any

Writing style:
- Specific, modern, intimate, and emotionally intelligent.
- Avoid vague phrases like "you may be thoughtful" or "you may seek balance".
- Avoid generic fortune-cookie lines.
- Make the user feel: "This sounds like me."
- Use cautious language: "this may suggest", "one possible pattern is", "this can point to".
- Do not say "guaranteed", "definitely", "destined", "fated", or "will happen".
- Do not mention that palmistry is not scientific more than once.
- Do not overuse "may"; vary phrasing naturally.
- No markdown. No code fences. Raw JSON only.

Content rules:
- palm_vibe should be a memorable archetype, e.g. "Quiet Strategist", "Soft-Guarded Romantic", "Independent Observer", "Calm Fire", "Sensitive Builder".
- one_sentence_summary should be emotionally strong and specific.
- free_preview should contain 3 strong insights that create curiosity and make the user want to unlock the full report.
- full_report should be detailed, not generic.
- love_style and emotional_pattern must be especially strong because they are the main commercial value.
- risks should be relationship/emotional risks, not scary predictions.
- advice should be practical and emotionally useful.

Return raw JSON only with this exact shape:
{
  "palm_vibe": "short label, 2-4 words",
  "one_sentence_summary": "a strong memorable sentence",
  "free_preview": ["specific insight 1", "specific insight 2", "specific insight 3"],
  "full_report": {
    "hand_shape": "specific analysis based on visible features",
    "personality": "specific analysis",
    "love_style": "specific relationship analysis",
    "emotional_pattern": "specific emotional pattern",
    "career_energy": "specific work/ambition style",
    "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
    "risks": ["specific emotional/relationship risk 1", "specific emotional/relationship risk 2", "specific emotional/relationship risk 3"],
    "advice": ["practical advice 1", "practical advice 2", "practical advice 3"],
    "final_summary": "final paragraph"
  },
  "share_card": {
    "title": "short viral title",
    "subtitle": "short emotional subtitle",
    "bullets": ["bullet 1", "bullet 2", "bullet 3"]
  }
}`;

const COMPATIBILITY_PROMPT = `You are PalmVibe, an AI palm reading and relationship compatibility assistant.

Analyze two uploaded palm photos for entertainment and self-reflection only.
Do not claim scientific certainty, medical diagnosis, legal advice, financial advice, psychological advice, or guaranteed future predictions.

Your job is to compare visible hand features and create a relationship compatibility report that feels specific, modern, and emotionally accurate.

For each palm, use visible details:
- hand shape
- finger length and spacing
- thumb openness
- palm fullness
- visible major lines
- line depth, direction, and clarity if visible
- fine lines or texture if visible
- image quality limitations if any

Writing style:
- Specific, emotionally intelligent, modern dating language.
- Avoid vague lines like "you communicate well" or "you need balance".
- Focus on attraction, emotional rhythm, conflict pattern, security needs, and long-term potential.
- Do not say someone will cheat, betray, or leave.
- Use "relationship stability risk", "emotional distance risk", "boundary risk", or "mismatch risk".
- No deterministic predictions.
- No markdown. No code fences. Raw JSON only.

Content rules:
- relationship_vibe must be specific and memorable. Avoid generic labels like "Balanced Connection", "Strong Bond", "Deep Love", or "Good Match".
- Prefer labels like: "Slow-Burn Chemistry", "Calm but Guarded", "Soft Power Match", "Magnetic but Misaligned", "Secure but Quiet", "Emotionally Close, Verbally Careful", "Warmth with Distance", "Gentle Push-Pull".
- relationship_vibe should stay memorable and slightly dramatic.
- one_sentence_summary must be emotionally sharp and specific about the core push-pull dynamic between the two people, not generic harmony language.
- free_preview must translate visible differences into relationship behavior, not technical palm observations.
- In free_preview, avoid overly technical palm language like "finger spacing", "major lines", "palm shape", "line depth", or "thumb openness".
- free_preview should focus on emotional rhythm, communication style, reassurance needs, distance/pursuit dynamic, conflict pattern, attraction reason, and slow-disconnect risk.
- Each free_preview item must be exactly 1 sentence and no more than 28 words.
- Keep free_preview punchy and curiosity-driven so users want to unlock the full report. Hint at hidden dynamics without fully explaining everything.
- compatibility_score must not always be high. Use:
  - 55-68 for difficult matches
  - 69-79 for workable but mixed matches
  - 80-89 for strong but imperfect matches
  - 90-94 only for rare highly aligned matches
- Make the report feel grounded in visible hand differences when possible, using cues like "the more open thumb", "the finer line texture", "the steadier palm shape", "the wider finger spacing", or "the softer-looking palm". Only mention a feature if it can be reasonably inferred from the image.
- It is acceptable to mention visible hand differences briefly in full_report, but keep free_preview behavior-first.
- The report should read like modern relationship analysis, not fortune telling.
- Avoid deterministic claims and forbidden words such as "will cheat", "will break up", "destined", "soulmate", "forever".
- Prefer risk framing such as: "emotional distance risk", "timing mismatch", "reassurance gap", "boundary risk", "communication lag", "slow-disconnect risk".
- attraction_pattern should explain why they may be drawn to each other.
- communication_dynamic should explain how misunderstanding builds over time.
- conflict_risk and stability_risk should be specific, practical, and non-accusatory.
- best_way_to_make_it_work should be actionable and emotionally useful.

Return raw JSON only with this exact shape:
{
  "compatibility_score": 82,
  "relationship_vibe": "short label, 2-5 words",
  "one_sentence_summary": "a strong memorable sentence",
  "free_preview": ["specific insight 1", "specific insight 2", "specific insight 3"],
  "full_report": {
    "person_a_profile": {
      "palm_vibe": "label",
      "emotional_style": "specific analysis",
      "relationship_need": "specific analysis"
    },
    "person_b_profile": {
      "palm_vibe": "label",
      "emotional_style": "specific analysis",
      "relationship_need": "specific analysis"
    },
    "attraction_pattern": "specific analysis",
    "communication_dynamic": "specific analysis",
    "conflict_risk": "specific analysis",
    "stability_risk": "specific analysis",
    "long_term_potential": "specific analysis",
    "best_way_to_make_it_work": ["advice 1", "advice 2", "advice 3"],
    "final_summary": "final paragraph"
  },
  "share_card": {
    "title": "short viral title",
    "subtitle": "short emotional subtitle",
    "bullets": ["bullet 1", "bullet 2", "bullet 3"]
  }
}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST.",
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is missing. Please check .env.local and restart npm run dev.",
    });
  }

  const body = (req.body ?? {}) as AnalyzeRequestBody;
  const mode = body.mode;
  const images = body.images;

  if (mode !== "single" && mode !== "compatibility") {
    return res.status(400).json({
      error: "Invalid mode. mode must be 'single' or 'compatibility'.",
    });
  }

  if (!Array.isArray(images) || !images.every((item) => typeof item === "string")) {
    return res.status(400).json({
      error: "Invalid images. images must be a string[] of data URLs.",
    });
  }

  if (mode === "single" && images.length !== 1) {
    return res.status(400).json({
      error: "Invalid images. single mode requires exactly 1 image.",
    });
  }

  if (mode === "compatibility" && images.length !== 2) {
    return res.status(400).json({
      error: "Invalid images. compatibility mode requires exactly 2 images.",
    });
  }

  const prompt = mode === "single" ? SINGLE_PROMPT : COMPATIBILITY_PROMPT;

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...images.map((imageUrl) => ({
              type: "input_image" as const,
              image_url: imageUrl,
              detail: "auto" as const,
            })),
          ],
        },
      ],
    });

    const outputText = response.output_text;
    const normalizedText = normalizeJsonText(outputText);

    try {
      const parsed = JSON.parse(normalizedText);
      return res.status(200).json(parsed);
    } catch {
      return res.status(500).json({
        error: "Failed to parse AI response as JSON",
        raw: outputText,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "OpenAI API request failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
