import type { Business } from "../models/business.model.js";
import type { EngineMethod, OperationRequest, OperationResult } from "../types/operation.js";

export interface BusinessEngine {
  readonly capability: string;
  query(request: OperationRequest, business: Business): Promise<OperationResult>;
  mutate(request: OperationRequest, business: Business): Promise<OperationResult>;
  suggest(request: OperationRequest, business: Business): Promise<OperationResult>;
}

export type DispatchRequest = OperationRequest & { method: EngineMethod };
