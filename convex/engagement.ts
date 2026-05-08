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

export const getRules = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("engagementRules")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const toggleRule = mutation({
  args: { ruleId: v.id("engagementRules"), enabled: v.boolean() },
  handler: async (ctx, args) => {
    await getAgency(ctx);
    await ctx.db.patch(args.ruleId, { enabled: args.enabled });
  },
});

export const getLogs = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("engagementLogs")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .take(50);
  },
});
