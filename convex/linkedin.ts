"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Called from the Analytics tab — fetches latest stats from LinkedIn for all
// published posts for a client and writes them back to the database.
export const syncClientStats = action({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    // 1. Get all published posts that have a LinkedIn post ID
    const posts: any[] = await ctx.runQuery(
      internal.posts.listPublishedWithPlatformId,
      { clientId: args.clientId }
    );

    if (posts.length === 0) return;

    // 2. Get the LinkedIn account for this client
    const account: any = await ctx.runQuery(
      internal.socialAccounts.getForPublish,
      { clientId: args.clientId, platform: "LINKEDIN" }
    );

    if (!account?.accessToken) {
      throw new Error("No LinkedIn account connected for this client");
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${account.accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
    };

    // 3. For each post, fetch stats and update
    for (const post of posts) {
      let likes = 0;
      let comments = 0;
      let impressions = 0;

      const encodedUrn = encodeURIComponent(post.platformPostId);

      try {
        const res = await fetch(
          `https://api.linkedin.com/v2/socialActions/${encodedUrn}`,
          { headers }
        );
        if (res.ok) {
          const d = await res.json();
          likes    = d.likesSummary?.totalLikes ?? 0;
          comments = d.commentsSummary?.totalFirstLevelComments ?? 0;
        }
      } catch (_) {}

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
        postId: post._id,
        likes,
        comments,
        impressions,
      });
    }
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
