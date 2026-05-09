import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getAgency(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const agency = await ctx.db
    .query("agencies")
    .withIndex("by_clerk_user", (q: any) => q.eq("clerkUserId", identity.subject))
    .first();
  if (!agency) throw new Error("Agency not found");
  return agency;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const agency = await ctx.db
      .query("agencies")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    if (!agency) return [];

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_agency", (q) => q.eq("agencyId", agency._id))
      .collect();

    return Promise.all(
      clients.map(async (client) => {
        const socialAccounts = await ctx.db
          .query("socialAccounts")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .collect();
        const postCount = (
          await ctx.db
            .query("posts")
            .withIndex("by_client", (q) => q.eq("clientId", client._id))
            .collect()
        ).length;
        return { ...client, socialAccounts, postCount };
      })
    );
  },
});

export const get = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const client = await ctx.db.get(args.clientId);
    if (!client) return null;

    const agency = await ctx.db.get(client.agencyId);
    if (agency?.clerkUserId !== identity.subject) return null;

    const brandVoice = await ctx.db
      .query("brandVoices")
      .withIndex("by_client", (q) => q.eq("clientId", client._id))
      .first();

    const socialAccounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_client", (q) => q.eq("clientId", client._id))
      .collect();

    return { ...client, brandVoice, socialAccounts };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    industry: v.string(),
    website: v.optional(v.string()),
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
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);

    const clientId = await ctx.db.insert("clients", {
      agencyId: agency._id,
      name: args.name,
      industry: args.industry,
      website: args.website,
      isActive: true,
    });

    if (args.brandVoice) {
      await ctx.db.insert("brandVoices", {
        clientId,
        ...args.brandVoice,
      });
    }

    // Seed default engagement rules
    for (const platform of ["LINKEDIN", "INSTAGRAM"] as const) {
      for (const ruleType of ["AUTO_REPLY", "AUTO_LIKE", "AUTO_FOLLOW"] as const) {
        await ctx.db.insert("engagementRules", {
          clientId,
          platform,
          ruleType,
          enabled: false,
        });
      }
    }

    return clientId;
  },
});

export const update = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
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
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.agencyId !== agency._id) throw new Error("Not found");

    const { clientId, brandVoice, ...rest } = args;
    await ctx.db.patch(clientId, rest);

    if (brandVoice) {
      const existing = await ctx.db
        .query("brandVoices")
        .withIndex("by_client", (q) => q.eq("clientId", clientId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, brandVoice);
      } else {
        await ctx.db.insert("brandVoices", { clientId, ...brandVoice });
      }
    }
  },
});

const intakeFields = {
  fullName: v.optional(v.string()),
  roleAndCompany: v.optional(v.string()),
  dayToDay: v.optional(v.string()),
  yearsExperience: v.optional(v.string()),
  backgroundBefore: v.optional(v.string()),
  uniqueBackground: v.optional(v.string()),
  linkedinGoals: v.optional(v.array(v.string())),
  successMeasure: v.optional(v.string()),
  targetAudience: v.optional(v.string()),
  audiencePerception: v.optional(v.string()),
  communicationStyle: v.optional(v.array(v.string())),
  writingSamples: v.optional(v.string()),
  commonPhrases: v.optional(v.string()),
  cringeWords: v.optional(v.string()),
  resonantPost: v.optional(v.string()),
  controversialBeliefs: v.optional(v.string()),
  hardLesson: v.optional(v.string()),
  wishKnewEarlier: v.optional(v.string()),
  frequentQuestion: v.optional(v.string()),
  proudResult: v.optional(v.string()),
  failureMistake: v.optional(v.string()),
  cantTalkAbout: v.optional(v.string()),
  postsPerWeek: v.optional(v.string()),
  avoidFormats: v.optional(v.array(v.string())),
  admiredProfiles: v.optional(v.string()),
  anythingElse: v.optional(v.string()),
};

export const createWithIntake = mutation({
  args: { name: v.string(), industry: v.string(), intake: v.object(intakeFields) },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const clientId = await ctx.db.insert("clients", {
      agencyId: agency._id,
      name: args.name,
      industry: args.industry,
      isActive: true,
    });
    await ctx.db.insert("clientIntake", { clientId, ...args.intake });
    for (const ruleType of ["AUTO_REPLY", "AUTO_LIKE", "AUTO_FOLLOW"] as const) {
      await ctx.db.insert("engagementRules", { clientId, platform: "LINKEDIN", ruleType, enabled: false });
    }
    return clientId;
  },
});

export const getIntake = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("clientIntake")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .first();
  },
});

export const remove = mutation({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client || client.agencyId !== agency._id) throw new Error("Not found");
    await ctx.db.patch(args.clientId, { isActive: false });
  },
});
