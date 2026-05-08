import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
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
  args: { clientId: v.id("clients"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_client", (q: any) => q.eq("clientId", args.clientId));

    const posts = await postsQuery.collect();
    return args.status
      ? posts.filter((p: any) => p.status === args.status)
      : posts;
  },
});

export const listPendingApprovals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const agency = await ctx.db
      .query("agencies")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    if (!agency) return [];

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_agency_status", (q) =>
        q.eq("agencyId", agency._id).eq("status", "PENDING_APPROVAL")
      )
      .collect();

    return Promise.all(
      posts.map(async (post) => {
        const client = await ctx.db.get(post.clientId);
        return { ...post, client };
      })
    );
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
    contentText: v.string(),
    hashtags: v.array(v.string()),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("PENDING_APPROVAL")
    ),
  },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    return ctx.db.insert("posts", {
      ...args,
      agencyId: agency._id,
      mediaUrls: [],
      likes: 0,
      comments: 0,
      shares: 0,
      impressions: 0,
    });
  },
});

export const approve = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.agencyId !== agency._id) throw new Error("Not found");
    await ctx.db.patch(args.postId, { status: "APPROVED" });
  },
});

export const reject = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.agencyId !== agency._id) throw new Error("Not found");
    await ctx.db.patch(args.postId, { status: "DRAFT" });
  },
});

export const schedule = mutation({
  args: { postId: v.id("posts"), scheduledAt: v.number() },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.agencyId !== agency._id) throw new Error("Not found");

    // Cancel existing job if rescheduling
    if (post.scheduledJobId) {
      await ctx.scheduler.cancel(post.scheduledJobId);
    }

    const jobId = await ctx.scheduler.runAt(
      args.scheduledAt,
      internal.posts.publishScheduled,
      { postId: args.postId }
    );

    await ctx.db.patch(args.postId, {
      status: "SCHEDULED",
      scheduledAt: args.scheduledAt,
      scheduledJobId: jobId,
    });
  },
});

export const unschedule = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.agencyId !== agency._id) throw new Error("Not found");

    if (post.scheduledJobId) {
      await ctx.scheduler.cancel(post.scheduledJobId);
    }

    await ctx.db.patch(args.postId, {
      status: "APPROVED",
      scheduledAt: undefined,
      scheduledJobId: undefined,
    });
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.agencyId !== agency._id) throw new Error("Not found");

    if (post.scheduledJobId) {
      await ctx.scheduler.cancel(post.scheduledJobId);
    }

    await ctx.db.delete(args.postId);
  },
});

export const update = mutation({
  args: {
    postId: v.id("posts"),
    contentText: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("DRAFT"),
        v.literal("PENDING_APPROVAL"),
        v.literal("APPROVED"),
        v.literal("SCHEDULED"),
        v.literal("PUBLISHED"),
        v.literal("FAILED")
      )
    ),
  },
  handler: async (ctx, args) => {
    const agency = await getAgency(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.agencyId !== agency._id) throw new Error("Not found");
    const { postId, ...rest } = args;
    await ctx.db.patch(postId, rest);
  },
});

// Internal: called by Convex scheduler at the scheduled time
export const publishScheduled = internalMutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.status !== "SCHEDULED") return;
    // In production this would call the LinkedIn/Instagram API
    // For now mark as published
    await ctx.db.patch(args.postId, {
      status: "PUBLISHED",
      publishedAt: Date.now(),
      scheduledJobId: undefined,
    });
  },
});
