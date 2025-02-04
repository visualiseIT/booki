import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./providers";

export const list = query({
  args: {
    providerId: v.id("providers"),
  },
  handler: async (ctx, args) => {
    const fields = await ctx.db
      .query("formFields")
      .withIndex("by_providerId", q => q.eq("providerId", args.providerId))
      .collect();

    return fields;
  },
});

export const create = mutation({
  args: {
    label: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("email"),
      v.literal("phone"),
      v.literal("textarea"),
      v.literal("select"),
      v.literal("checkbox"),
      v.literal("radio")
    ),
    required: v.boolean(),
    placeholder: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    defaultValue: v.optional(v.string()),
    serviceId: v.optional(v.id("services")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first();

    if (!provider) throw new Error("Provider not found");

    // Get the current highest order
    const lastField = await ctx.db
      .query("formFields")
      .withIndex("by_providerId", q => q.eq("providerId", provider._id))
      .order("desc")
      .first();

    const order = lastField ? lastField.order + 1 : 0;

    // If serviceId is "_all", set it to null
    const serviceId = args.serviceId === "_all" ? null : args.serviceId;

    const fieldId = await ctx.db.insert("formFields", {
      ...args,
      serviceId,
      providerId: provider._id,
      order,
      isActive: true,
    });

    return fieldId;
  },
});

export const update = mutation({
  args: {
    id: v.id("formFields"),
    label: v.string(),
    type: v.string(),
    required: v.boolean(),
    placeholder: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    defaultValue: v.optional(v.string()),
    serviceId: v.optional(v.id("services")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first();
    if (!provider) throw new Error("Provider not found");

    const field = await ctx.db.get(args.id);
    if (!field) throw new Error("Field not found");

    // Ensure the field belongs to this provider
    if (field.providerId !== provider._id) {
      throw new Error("Not authorized to update this field");
    }

    // If serviceId is "_all", set it to null
    const serviceId = args.serviceId === "_all" ? null : args.serviceId;

    return await ctx.db.patch(args.id, {
      label: args.label,
      type: args.type,
      required: args.required,
      placeholder: args.placeholder,
      options: args.options,
      defaultValue: args.defaultValue,
      serviceId,
    });
  },
});

export const toggleStatus = mutation({
  args: {
    id: v.id("formFields"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const field = await ctx.db.get(args.id);
    if (!field) throw new Error("Field not found");

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first();

    if (!provider || provider._id !== field.providerId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      isActive: !field.isActive,
    });
  },
});

export const getFieldsForService = query({
  args: {
    serviceId: v.optional(v.id("services")),
  },
  async handler(ctx, args) {
    if (!args.serviceId) return [];

    // Get the service to find its provider
    const service = await ctx.db.get(args.serviceId);
    if (!service) return [];

    // Get all fields for this provider
    return await ctx.db
      .query("formFields")
      .withIndex("by_providerId", q => q.eq("providerId", service.providerId))
      .filter(q => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.or(
            q.eq(q.field("serviceId"), args.serviceId),
            q.eq(q.field("serviceId"), null),
            q.eq(q.field("serviceId"), undefined)
          )
        )
      )
      .collect();
  },
});

export const deleteField = mutation({
  args: { id: v.id("formFields") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const field = await ctx.db.get(args.id);
    if (!field) throw new Error("Field not found");

    // Get the provider to verify ownership
    const provider = await ctx.db
      .query("providers")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first();
    
    if (!provider || field.providerId !== provider._id) {
      throw new Error("Not authorized to delete this field");
    }

    await ctx.db.delete(args.id);
  },
}); 