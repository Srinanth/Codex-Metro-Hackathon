import { Schema, model } from "mongoose";
import type { FlexibleData } from "../types/business.js";

export interface Business {
  name: string;
  businessType: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  configuration: FlexibleData;
  capabilities: string[];
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<Business>({
  name: { type: String, required: true, trim: true },
  businessType: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  logo: { type: String, trim: true },
  configuration: { type: Schema.Types.Mixed, default: {} },
  capabilities: { type: [String], default: [] },
  rules: { type: [String], default: [] },
}, { timestamps: true, toJSON: { virtuals: true, versionKey: false } });

export const BusinessModel = model<Business>("Business", businessSchema);
