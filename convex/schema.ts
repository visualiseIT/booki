import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Custom field types supported in the booking form
const fieldTypes = v.union(
  v.literal("text"),
  v.literal("number"),
  v.literal("email"),
  v.literal("phone"),
  v.literal("textarea"),
  v.literal("select"),
  v.literal("checkbox"),
  v.literal("radio")
);

export default defineSchema({
  providers: defineTable({
    userId: v.string(),
    name: v.string(),
    businessName: v.string(),
    bio: v.optional(v.string()),
    contactEmail: v.string(),
    timezone: v.string(),
    customUrl: v.string(),
    profileImage: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_customUrl", ["customUrl"]),

  services: defineTable({
    providerId: v.id("providers"),
    name: v.string(),
    description: v.string(),
    duration: v.number(),
    price: v.number(),
    isActive: v.boolean(),
  })
    .index("by_providerId", ["providerId"]),

  businessHours: defineTable({
    providerId: v.id("providers"),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    isAvailable: v.boolean(),
  })
    .index("by_providerId", ["providerId"]),

  appointments: defineTable({
    providerId: v.id("providers"),
    serviceId: v.id("services"),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    date: v.string(),
    time: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    customFields: v.array(
      v.object({
        fieldId: v.id("formFields"),
        value: v.string(),
      })
    ),
  })
    .index("by_providerId", ["providerId"])
    .index("by_serviceId", ["serviceId"]),

  formFields: defineTable({
    providerId: v.id("providers"),
    serviceId: v.optional(v.id("services")),
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
    order: v.number(),
    isActive: v.boolean(),
  }).index("by_providerId", ["providerId"])
    .index("by_service", ["serviceId"]),

  formResponses: defineTable({
    appointmentId: v.id("appointments"),
    fieldId: v.id("formFields"),
    value: v.string(),
  }).index("by_appointment", ["appointmentId"]),
}); 