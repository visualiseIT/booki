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
    try {
      // Validate provider exists
      const provider = await ctx.db.get(args.providerId);
      if (!provider) {
        throw new Error("Provider not found");
      }

      // Validate service exists and belongs to provider
      const service = await ctx.db.get(args.serviceId);
      if (!service) {
        throw new Error("Service not found");
      }
      if (service.providerId !== args.providerId) {
        throw new Error("Service does not belong to provider");
      }

      // Validate appointment times
      const startTime = new Date(args.startTime);
      const endTime = new Date(args.endTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error("Invalid appointment times");
      }
      
      if (startTime >= endTime) {
        throw new Error("End time must be after start time");
      }

      // Create the appointment
      const appointment = await ctx.db.insert("appointments", {
        providerId: args.providerId,
        serviceId: args.serviceId,
        customerName: args.customerName,
        customerEmail: args.customerEmail,
        startTime: args.startTime,
        endTime: args.endTime,
        notes: args.notes,
        status: "confirmed",
      });

      return appointment;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
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