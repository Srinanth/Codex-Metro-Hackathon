import { Schema, model } from "mongoose";
import type { FlexibleData } from "../types/business.js";

export interface BusinessRecord {
  businessId: Schema.Types.ObjectId;
  entityType: string;
  status: string;
  data: FlexibleData;
  metadata: FlexibleData;
  createdAt: Date;
  updatedAt: Date;
}

const recordSchema = new Schema<BusinessRecord>({
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
  entityType: { type: String, required: true, trim: true, index: true },
  status: { type: String, required: true, trim: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true, toJSON: { virtuals: true, versionKey: false } });

export const RecordModel = model<BusinessRecord>("Record", recordSchema);
