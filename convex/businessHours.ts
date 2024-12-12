import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const setBusinessHours = mutation({
  args: {
    providerId: v.id("providers"),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if business hours already exist for this day
    const existing = await ctx.db
      .query("businessHours")
      .withIndex("by_providerId", (q) => q.eq("providerId", args.providerId))
      .filter((q) => q.eq(q.field("dayOfWeek"), args.dayOfWeek))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        startTime: args.startTime,
        endTime: args.endTime,
        isAvailable: args.isAvailable,
      });
    }

    return await ctx.db.insert("businessHours", args);
  },
});

export const getBusinessHours = query({
  args: { providerId: v.id("providers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businessHours")
      .withIndex("by_providerId", (q) => q.eq("providerId", args.providerId))
      .collect();
  },
});

export const updateBusinessHours = mutation({
  args: {
    id: v.id("businessHours"),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deleteBusinessHours = mutation({
  args: { id: v.id("businessHours") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
}); 