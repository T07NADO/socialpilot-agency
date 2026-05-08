"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

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
