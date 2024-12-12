import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createAppointment = mutation({
  args: {
    providerId: v.id("providers"),
    serviceId: v.id("services"),
    customerName: v.string(),
    customerEmail: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add validation for time slot availability
    return await ctx.db.insert("appointments", {
      ...args,
      status: "pending",
    });
  },
});

export const getProviderAppointments = query({
  args: { providerId: v.id("providers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_providerId", (q) => q.eq("providerId", args.providerId))
      .collect();
  },
});

export const getCustomerAppointments = query({
  args: { customerEmail: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_customerEmail", (q) => q.eq("customerEmail", args.customerEmail))
      .collect();
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});

export const getUpcomingAppointments = query({
  args: { providerId: v.id("providers") },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db
      .query("appointments")
      .withIndex("by_providerId", (q) => q.eq("providerId", args.providerId))
      .filter((q) => q.gt(q.field("startTime"), now))
      .order("asc")
      .collect();
  },
}); 