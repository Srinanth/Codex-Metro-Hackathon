import type { FlexibleData } from "./business.js";

export type OperationRequest = {
  action: string;
  capability: string;
  payload: FlexibleData;
};

export type OperationResult = {
  success: boolean;
  message: string;
  operation: FlexibleData | null;
  metadata: FlexibleData;
};

export type EngineMethod = "query" | "mutate" | "suggest";
