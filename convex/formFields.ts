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

    const fieldId = await ctx.db.insert("formFields", {
      ...args,
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

    return await ctx.db.patch(args.id, {
      label: args.label,
      type: args.type,
      required: args.required,
      placeholder: args.placeholder,
      options: args.options,
      defaultValue: args.defaultValue,
      serviceId: args.serviceId,
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
    providerId: v.id("providers"),
    serviceId: v.optional(v.id("services")),
  },
  handler: async (ctx, args) => {
    const fields = await ctx.db
      .query("formFields")
      .withIndex("by_providerId", q => q.eq("providerId", args.providerId))
      .filter(q => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.or(
            q.eq(q.field("serviceId"), null),
            args.serviceId ? q.eq(q.field("serviceId"), args.serviceId) : q.eq(q.field("serviceId"), null)
          )
        )
      )
      .order("asc")
      .collect();

    return fields;
  },
}); 