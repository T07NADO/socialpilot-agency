"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Called from the Analytics tab — fetches latest stats from LinkedIn for all
// published posts for a client and writes them back to the database.
export const syncClientStats = action({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    // 1. Get all published posts that have a LinkedIn post ID
    let posts: any[];
    try {
      posts = await ctx.runQuery(
        internal.posts.listPublishedWithPlatformId,
        { clientId: args.clientId }
      );
    } catch (e: any) {
      console.error("[syncClientStats] Failed to list posts:", e?.message);
      throw new ConvexError("Failed to list posts: " + (e?.message ?? "unknown"));
    }

    console.log(`[syncClientStats] Found ${posts.length} published posts with platform IDs`);

    if (posts.length === 0) {
      console.log("[syncClientStats] No published posts — nothing to sync");
      return { synced: 0, message: "No published posts to sync" };
    }

    // 2. Get the LinkedIn account for this client
    let account: any;
    try {
      account = await ctx.runQuery(
        internal.socialAccounts.getForPublish,
        { clientId: args.clientId, platform: "LINKEDIN" }
      );
    } catch (e: any) {
      console.error("[syncClientStats] Failed to get social account:", e?.message);
      throw new ConvexError("Failed to get LinkedIn account: " + (e?.message ?? "unknown"));
    }

    console.log(`[syncClientStats] Account found: ${!!account}, profileId: ${account?.profileId ?? "none"}`);

    if (!account?.accessToken) {
      throw new ConvexError("No LinkedIn account connected for this client. Please connect a LinkedIn account in the Settings tab.");
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${account.accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
    };

    let synced = 0;
    let errors: string[] = [];

    // 3. For each post, fetch stats and update
    for (const post of posts) {
      let likes = 0;
      let comments = 0;
      let impressions = 0;

      const platformPostId = post.platformPostId as string;
      console.log(`[syncClientStats] Processing post ${post._id}, platformPostId: ${platformPostId}`);

      // Fetch likes + comments
      try {
        const encodedUrn = encodeURIComponent(platformPostId);
        const url = `https://api.linkedin.com/v2/socialActions/${encodedUrn}`;
        const res = await fetch(url, { headers });
        console.log(`[syncClientStats] socialActions status: ${res.status}`);
        if (res.ok) {
          const d = await res.json();
          likes    = d.likesSummary?.totalLikes ?? 0;
          comments = d.commentsSummary?.totalFirstLevelComments ?? 0;
          console.log(`[syncClientStats] likes=${likes}, comments=${comments}`);
        } else {
          const body = await res.text();
          console.warn(`[syncClientStats] socialActions ${res.status}: ${body.slice(0, 200)}`);
        }
      } catch (e: any) {
        console.warn(`[syncClientStats] socialActions fetch error: ${e?.message}`);
      }

      // Fetch impressions via Share Statistics
      try {
        const encodedUrn = encodeURIComponent(platformPostId);
        const url = `https://api.linkedin.com/v2/socialMetadata/(threadUrn:${encodedUrn})?projection=(totalShareStatistics)`;
        const res = await fetch(url, { headers });
        console.log(`[syncClientStats] socialMetadata status: ${res.status}`);
        if (res.ok) {
          const d = await res.json();
          impressions = d.totalShareStatistics?.impressionCount ?? 0;
          console.log(`[syncClientStats] impressions=${impressions}`);
        } else {
          const body = await res.text();
          console.warn(`[syncClientStats] socialMetadata ${res.status}: ${body.slice(0, 200)}`);
        }
      } catch (e: any) {
        console.warn(`[syncClientStats] socialMetadata fetch error: ${e?.message}`);
      }

      // Save stats back to DB
      try {
        await ctx.runMutation(internal.posts.updateStats, {
          postId: post._id,
          likes,
          comments,
          impressions,
        });
        synced++;
        console.log(`[syncClientStats] Updated post ${post._id}: likes=${likes}, comments=${comments}, impressions=${impressions}`);
      } catch (e: any) {
        const msg = `Failed to update post ${post._id}: ${e?.message}`;
        console.error(`[syncClientStats] ${msg}`);
        errors.push(msg);
      }
    }

    console.log(`[syncClientStats] Done. synced=${synced}, errors=${errors.length}`);

    if (errors.length > 0 && synced === 0) {
      throw new ConvexError("Sync failed for all posts: " + errors[0]);
    }

    return { synced, errors };
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
