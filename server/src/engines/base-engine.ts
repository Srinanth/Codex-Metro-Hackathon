import type { Business } from "../models/business.model.js";
import type { BusinessRecord } from "../models/record.model.js";
import { RecordService } from "../services/record.service.js";
import type { FlexibleData } from "../types/business.js";
import type { OperationRequest, OperationResult } from "../types/operation.js";
import type { BusinessEngine } from "./engine.types.js";

export abstract class BaseEngine implements BusinessEngine {
  abstract readonly capability: string;
  protected readonly records: RecordService;

  constructor(records = new RecordService()) { this.records = records; }

  abstract query(request: OperationRequest, business: Business): Promise<OperationResult>;
  abstract mutate(request: OperationRequest, business: Business): Promise<OperationResult>;
  abstract suggest(request: OperationRequest, business: Business): Promise<OperationResult>;

  protected supported(business: Business): OperationResult | null {
    return business.capabilities.includes(this.capability) ? null : this.failure(`This business does not support ${this.capability}.`);
  }

  protected async recordsFor(business: Business): Promise<BusinessRecord[]> {
    return this.records.findByBusinessIdAndEntityType(String((business as { _id?: unknown })._id ?? ""), this.entityType());
  }

  protected entityType(): string { return this.capability.endsWith("s") ? this.capability.slice(0, -1) : this.capability; }
  protected success(message: string, operation: FlexibleData | null, metadata: FlexibleData = {}): OperationResult { return { success: true, message, operation, metadata }; }
  protected failure(message: string, metadata: FlexibleData = {}): OperationResult { return { success: false, message, operation: null, metadata }; }
  protected serialize(record: BusinessRecord): FlexibleData { return JSON.parse(JSON.stringify(record)) as FlexibleData; }
  protected active(record: BusinessRecord): boolean { return !["cancelled", "completed", "delivered"].includes(record.status.toLowerCase()); }
}
