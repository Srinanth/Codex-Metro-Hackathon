import { z } from "zod";

const text = z.string().trim().min(1);
const objectId = z.string().trim().regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB object ID.");
const flexibleObject = z.record(z.string(), z.unknown());
const stringList = z.array(text);

export const idParamsSchema = z.object({ id: objectId });

export const createBusinessSchema = z.object({
  name: text,
  businessType: text,
  description: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  address: z.string().trim().optional(),
  logo: z.string().trim().url().optional(),
  configuration: flexibleObject.optional(),
  capabilities: stringList.optional(),
  rules: stringList.optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "Provide at least one field to update.",
);

export const createRecordSchema = z.object({
  businessId: objectId,
  entityType: text,
  status: text,
  data: flexibleObject,
  metadata: flexibleObject.optional(),
});

export const updateRecordSchema = createRecordSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "Provide at least one field to update.",
);

export const createInteractionSchema = z.object({
  businessId: objectId,
  message: text,
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: text,
  })).optional(),
});

export const extractBusinessSchema = z.object({
  description: z.string().trim().min(20, "Please provide a little more detail about your business.").max(8_000),
});
