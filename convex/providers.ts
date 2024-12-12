import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createProvider = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    businessName: v.string(),
    contactEmail: v.string(),
    timezone: v.string(),
    customUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if provider already exists
    const existing = await ctx.db
      .query("providers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("Provider already exists");
    }

    // Check if custom URL is taken
    const urlExists = await ctx.db
      .query("providers")
      .withIndex("by_customUrl", (q) => q.eq("customUrl", args.customUrl))
      .first();

    if (urlExists) {
      throw new Error("Custom URL is already taken");
    }

    return await ctx.db.insert("providers", {
      userId: args.userId,
      name: args.name,
      businessName: args.businessName,
      contactEmail: args.contactEmail,
      timezone: args.timezone,
      customUrl: args.customUrl,
    });
  },
});

export const getProvider = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("providers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
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