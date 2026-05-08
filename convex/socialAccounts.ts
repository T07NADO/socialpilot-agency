import { mutation, query, internalQuery } from "./_generated/server";
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

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("socialAccounts")
      .withIndex("by_client", (q: any) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const save = mutation({
  args: {
    clientId: v.id("clients"),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    profileId: v.string(),
    profileName: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await getAgency(ctx);
    // Remove any existing account for this client+platform before inserting
    const existing = await ctx.db
      .query("socialAccounts")
      .withIndex("by_client", (q: any) => q.eq("clientId", args.clientId))
      .collect();
    for (const acc of existing) {
      if (acc.platform === args.platform) {
        await ctx.db.delete(acc._id);
      }
    }
    return ctx.db.insert("socialAccounts", { ...args, isActive: true });
  },
});

export const remove = mutation({
  args: { accountId: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    await getAgency(ctx);
    await ctx.db.delete(args.accountId);
  },
});

// Used by LinkedIn/Instagram publish actions to retrieve stored tokens
export const getForPublish = internalQuery({
  args: {
    clientId: v.id("clients"),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
  },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_client", (q: any) => q.eq("clientId", args.clientId))
      .collect();
    return accounts.find((a) => a.platform === args.platform && a.isActive) ?? null;
  },
});
