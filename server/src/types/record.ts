import type { FlexibleData } from "./business.js";

export type CreateRecordInput = {
  businessId: string;
  entityType: string;
  status: string;
  data: FlexibleData;
  metadata?: FlexibleData;
};

export type UpdateRecordInput = Partial<Omit<CreateRecordInput, "businessId">> & { businessId?: string };
