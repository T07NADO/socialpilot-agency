import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("agencies")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("agencies", {
      clerkUserId: identity.subject,
      name: args.name,
      email: args.email,
      plan: "FREE",
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const agency = await ctx.db
      .query("agencies")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!agency) return null;

    const logoUrl = agency.logoStorageId
      ? await ctx.storage.getUrl(agency.logoStorageId)
      : null;

    return { ...agency, logoUrl };
  },
});

export const update = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const agency = await ctx.db
      .query("agencies")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!agency) throw new Error("Agency not found");
    await ctx.db.patch(agency._id, { name: args.name });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const agency = await ctx.db
      .query("agencies")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!agency) throw new Error("Agency not found");

    const patch: Record<string, any> = { name: args.name };
    if (args.logoStorageId !== undefined) {
      patch.logoStorageId = args.logoStorageId;
    }

    await ctx.db.patch(agency._id, patch);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
