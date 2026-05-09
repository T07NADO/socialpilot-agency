"use node";

import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

export const syncClientStats = action({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const identity = await (ctx as any).auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const posts: any[] = await ctx.runQuery(api.posts.listByClient, { clientId: args.clientId });
    const toSync = posts.filter((p) => p.status === "PUBLISHED" && p.platformPostId);

    await Promise.all(toSync.map((post) =>
      ctx.runAction(internal.linkedin.syncPostStats, { postId: post._id })
    ));
  },
});

export const syncPostStats = internalAction({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.runQuery(internal.posts.getById, { postId: args.postId });
    if (!post?.platformPostId) return;

    const account = await ctx.runQuery(internal.socialAccounts.getForPublish, {
      clientId: post.clientId,
      platform: "LINKEDIN",
    });
    if (!account?.accessToken) return;

    const urn = post.platformPostId; // e.g. "urn:li:ugcPost:12345"
    const encodedUrn = encodeURIComponent(urn);
    const headers = {
      Authorization: `Bearer ${account.accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
    };

    let likes = 0;
    let comments = 0;
    let impressions = 0;

    // Social actions: likes + comments
    try {
      const res = await fetch(`https://api.linkedin.com/v2/socialActions/${encodedUrn}`, { headers });
      if (res.ok) {
        const d = await res.json();
        likes       = d.likesSummary?.totalLikes ?? d.reactions?.paging?.total ?? 0;
        comments    = d.commentsSummary?.totalFirstLevelComments ?? d.comments?.paging?.total ?? 0;
      }
    } catch (_) {}

    // Share statistics: impressions
    try {
      const res = await fetch(
        `https://api.linkedin.com/v2/socialMetadata/(threadUrn:${encodedUrn})?projection=(totalShareStatistics)`,
        { headers }
      );
      if (res.ok) {
        const d = await res.json();
        impressions = d.totalShareStatistics?.impressionCount ?? 0;
      }
    } catch (_) {}

    await ctx.runMutation(internal.posts.updateStats, {
      postId: args.postId,
      likes,
      comments,
      impressions,
    });
  },
});

export const publishPost = internalAction({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.runQuery(internal.posts.getById, { postId: args.postId });
    if (!post || post.status !== "SCHEDULED") return;

    const account = await ctx.runQuery(internal.socialAccounts.getForPublish, {
      clientId: post.clientId,
      platform: "LINKEDIN",
    });

    if (!account) {
      await ctx.runMutation(internal.posts.markFailed, {
        postId: args.postId,
        error: "No LinkedIn account connected for this client",
      });
      return;
    }

    const hashtagLine = post.hashtags.length > 0
      ? "\n\n" + post.hashtags.map((h: string) => `#${h}`).join(" ")
      : "";
    const content = `${post.contentText}${hashtagLine}`;

    try {
      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: `urn:li:person:${account.profileId}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`LinkedIn API ${res.status}: ${errText}`);
      }

      const data = await res.json();
      await ctx.runMutation(internal.posts.markPublished, {
        postId: args.postId,
        platformPostId: data.id ?? "",
      });
    } catch (e: any) {
      await ctx.runMutation(internal.posts.markFailed, {
        postId: args.postId,
        error: e.message,
      });
    }
  },
});
