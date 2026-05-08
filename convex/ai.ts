"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const generatePost = action({
  args: {
    clientName: v.string(),
    industry: v.string(),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
    brief: v.string(),
    brandVoice: v.optional(
      v.object({
        tone: v.string(),
        targetAudience: v.string(),
        callToActionStyle: v.string(),
        bannedWords: v.array(v.string()),
        examplePosts: v.array(v.string()),
      })
    ),
  },
  handler: async (_ctx, args) => {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const brandContext = args.brandVoice
      ? `Brand Voice:
- Tone: ${args.brandVoice.tone}
- Target Audience: ${args.brandVoice.targetAudience}
- CTA Style: ${args.brandVoice.callToActionStyle}
${args.brandVoice.bannedWords.length ? `- NEVER use: ${args.brandVoice.bannedWords.join(", ")}` : ""}
${args.brandVoice.examplePosts.length ? `\nExample posts:\n${args.brandVoice.examplePosts.map((p, i) => `${i + 1}. ${p}`).join("\n")}` : ""}`
      : `Writing for ${args.clientName}, a ${args.industry} brand.`;

    const platformGuide =
      args.platform === "LINKEDIN"
        ? "LinkedIn: 150-300 words, professional tone, strong hook, 3-5 hashtags, line breaks for readability."
        : "Instagram: 50-100 words, energetic, 3-5 emojis, up to 30 hashtags after the caption, scroll-stopping opener.";

    const prompt = `You are a social media content writer.

${brandContext}

Platform: ${platformGuide}
Brief: ${args.brief}

Generate 3 post variations as JSON:
{
  "versions": [
    { "contentText": "...", "hashtags": ["tag1","tag2"], "callToAction": "..." },
    { "contentText": "...", "hashtags": ["tag1","tag2"], "callToAction": "..." },
    { "contentText": "...", "hashtags": ["tag1","tag2"], "callToAction": "..." }
  ]
}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0]?.message?.content ?? "{}");
  },
});
