import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getServices = query({
  args: { providerId: v.id("providers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_providerId", (q) => q.eq("providerId", args.providerId))
      .collect();
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deleteService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    duration: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const provider = await ctx.db
      .query("providers")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!provider) {
      throw new Error("Provider not found");
    }

    // Check for existing service with same name
    const existingService = await ctx.db
      .query("services")
      .withIndex("by_providerId", q => q.eq("providerId", provider._id))
      .filter(q => q.eq(q.field("name"), args.name))
      .first();

    if (existingService) {
      throw new Error(`A service named "${args.name}" already exists`);
    }

    const service = await ctx.db.insert("services", {
      providerId: provider._id,
      name: args.name,
      description: args.description,
      duration: args.duration,
      price: args.price,
      isActive: true,
    });

    return service;
  },
}); 