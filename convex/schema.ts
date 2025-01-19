import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    notes: v.optional(v.string()),
  })
    .index("by_providerId", ["providerId"])
    .index("by_serviceId", ["serviceId"]),
}); 