import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createProvider = mutation({
  args: {
    name: v.string(),
    businessName: v.string(),
    bio: v.optional(v.string()),
    contactEmail: v.string(),
    timezone: v.string(),
    customUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Check if provider already exists
    const existingProvider = await ctx.db
      .query("providers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProvider) {
      throw new Error("Provider profile already exists");
    }

    // Check if customUrl is unique
    const existingUrl = await ctx.db
      .query("providers")
      .withIndex("by_customUrl", (q) => q.eq("customUrl", args.customUrl))
      .first();

    if (existingUrl) {
      throw new Error("Custom URL already taken");
    }

    return await ctx.db.insert("providers", {
      userId,
      ...args,
    });
  },
});

export async function getUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return identity;
}

export const getProvider = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("providers")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

export const getProviderByUrl = query({
  args: { customUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("providers")
      .withIndex("by_customUrl", (q) => q.eq("customUrl", args.customUrl))
      .first();
  },
});

export const updateProvider = mutation({
  args: {
    id: v.id("providers"),
    name: v.optional(v.string()),
    businessName: v.optional(v.string()),
    bio: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    timezone: v.optional(v.string()),
    customUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    if (updates.customUrl) {
      // Check if custom URL is taken by another provider
      const urlExists = await ctx.db
        .query("providers")
        .withIndex("by_customUrl", (q) => q.eq("customUrl", updates.customUrl))
        .first();

      if (urlExists && urlExists._id !== id) {
        throw new Error("Custom URL is already taken");
      }
    }

    return await ctx.db.patch(id, updates);
  },
}); 