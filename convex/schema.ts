import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agencies: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    plan: v.union(v.literal("FREE"), v.literal("PRO"), v.literal("AGENCY")),
  }).index("by_clerk_user", ["clerkUserId"]),

  clients: defineTable({
    agencyId: v.id("agencies"),
    name: v.string(),
    industry: v.string(),
    website: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_agency", ["agencyId"]),

  brandVoices: defineTable({
    clientId: v.id("clients"),
    tone: v.string(),
    targetAudience: v.string(),
    callToActionStyle: v.string(),
    bannedWords: v.array(v.string()),
    examplePosts: v.array(v.string()),
  }).index("by_client", ["clientId"]),

  socialAccounts: defineTable({
    clientId: v.id("clients"),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    profileId: v.string(),
    profileName: v.string(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_client", ["clientId"]),

  posts: defineTable({
    clientId: v.id("clients"),
    agencyId: v.id("agencies"),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
    contentText: v.string(),
    hashtags: v.array(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("PENDING_APPROVAL"),
      v.literal("APPROVED"),
      v.literal("SCHEDULED"),
      v.literal("PUBLISHED"),
      v.literal("FAILED")
    ),
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    platformPostId: v.optional(v.string()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    impressions: v.optional(v.number()),
    scheduledJobId: v.optional(v.id("_scheduled_functions")),
  })
    .index("by_client", ["clientId"])
    .index("by_agency", ["agencyId"])
    .index("by_agency_status", ["agencyId", "status"]),

  engagementRules: defineTable({
    clientId: v.id("clients"),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
    ruleType: v.union(
      v.literal("AUTO_REPLY"),
      v.literal("AUTO_LIKE"),
      v.literal("AUTO_FOLLOW")
    ),
    enabled: v.boolean(),
  }).index("by_client", ["clientId"]),

  engagementLogs: defineTable({
    clientId: v.id("clients"),
    platform: v.union(v.literal("LINKEDIN"), v.literal("INSTAGRAM")),
    action: v.string(),
    targetId: v.string(),
    response: v.optional(v.string()),
    success: v.boolean(),
  }).index("by_client", ["clientId"]),
});
