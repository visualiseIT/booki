import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getUser } from "./providers";

export const create = mutation({
  args: {
    providerId: v.id("providers"),
    serviceId: v.id("services"),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    date: v.string(),
    time: v.string(),
    notes: v.optional(v.string()),
    customFields: v.array(
      v.object({
        fieldId: v.id("formFields"),
        value: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify the provider exists
    const provider = await ctx.db.get(args.providerId);
    if (!provider) throw new Error("Provider not found");

    // Verify the service exists and belongs to the provider
    const service = await ctx.db.get(args.serviceId);
    if (!service || service.providerId !== args.providerId) {
      throw new Error("Service not found");
    }

    // Verify all required custom fields are provided
    const requiredFields = await ctx.db
      .query("formFields")
      .withIndex("by_providerId", q => q.eq("providerId", args.providerId))
      .filter(q => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("required"), true),
          q.or(
            q.eq(q.field("serviceId"), null),
            q.eq(q.field("serviceId"), args.serviceId)
          )
        )
      )
      .collect();

    const providedFieldIds = new Set(args.customFields.map(f => f.fieldId));
    for (const field of requiredFields) {
      if (!providedFieldIds.has(field._id)) {
        throw new Error(`Required field "${field.label}" is missing`);
      }
    }

    // Create the appointment
    const appointmentId = await ctx.db.insert("appointments", {
      providerId: args.providerId,
      serviceId: args.serviceId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      date: args.date,
      time: args.time,
      notes: args.notes,
      status: "confirmed",
      customFields: args.customFields,
    });

    return appointmentId;
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
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
    
    if (!provider) return null;

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_providerId", (q) => q.eq("providerId", provider._id))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .order("desc")
      .collect();

    return appointments.map(appointment => ({
      ...appointment,
      date: appointment.startTime.split('T')[0],
      time: appointment.startTime.split('T')[1].substring(0, 5)
    }));
  },
});

export const getAppointmentDetails = query({
  args: { appointmentId: v.id("appointments") },
  async handler(ctx, args) {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) return null;

    // Get the associated service
    const service = await ctx.db.get(appointment.serviceId);
    if (!service) return null;

    return {
      ...appointment,
      service,
      date: appointment.startTime.split('T')[0],
      time: appointment.startTime.split('T')[1].substring(0, 5)
    };
  },
});

export const getAppointmentsForDay = query({
  args: {
    providerId: v.id("providers"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("providerId"), args.providerId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    return appointments;
  },
}); 