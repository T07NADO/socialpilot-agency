import { query } from "./_generated/server";
import { v } from "convex/values";

export const getClientStats = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    const published = posts.filter((p) => p.status === "PUBLISHED");
    const totalLikes = published.reduce((s, p) => s + (p.likes ?? 0), 0);
    const totalComments = published.reduce((s, p) => s + (p.comments ?? 0), 0);
    const totalImpressions = published.reduce((s, p) => s + (p.impressions ?? 0), 0);

    const byPlatform = {
      LINKEDIN: published.filter((p) => p.platform === "LINKEDIN").length,
    };

    // Last 8 weeks
    const now = Date.now();
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = now - (7 - i) * 7 * 24 * 60 * 60 * 1000;
      const end = start + 7 * 24 * 60 * 60 * 1000;
      const weekPosts = published.filter(
        (p) => p.publishedAt && p.publishedAt >= start && p.publishedAt < end
      );
      return {
        week: `W${i + 1}`,
        LINKEDIN: weekPosts.filter((p) => p.platform === "LINKEDIN").length,
      };
    });

    return {
      totalPosts: posts.length,
      publishedPosts: published.length,
      pendingApproval: posts.filter((p) => p.status === "PENDING_APPROVAL").length,
      scheduled: posts.filter((p) => p.status === "SCHEDULED").length,
      totalLikes,
      totalComments,
      totalImpressions,
      byPlatform,
      weeklyBreakdown: weeks,
    };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const agency = await ctx.db
      .query("agencies")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    if (!agency) return null;

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_agency", (q) => q.eq("agencyId", agency._id))
      .collect();

    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_agency", (q) => q.eq("agencyId", agency._id))
      .collect();

    return {
      totalClients: clients.filter((c) => c.isActive).length,
      totalPosts: allPosts.length,
      pendingApprovals: allPosts.filter((p) => p.status === "PENDING_APPROVAL").length,
      scheduledPosts: allPosts.filter((p) => p.status === "SCHEDULED").length,
      publishedThisMonth: allPosts.filter(
        (p) =>
          p.status === "PUBLISHED" &&
          p.publishedAt &&
          p.publishedAt > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
    };
  },
});
