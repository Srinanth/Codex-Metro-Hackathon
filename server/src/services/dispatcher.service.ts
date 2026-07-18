import type { Business } from "../models/business.model.js";
import type { OperationResult } from "../types/operation.js";
import type { DispatchRequest } from "../engines/engine.types.js";
import { EngineRegistry } from "../engines/engine-registry.js";

export class DispatcherService {
  constructor(private readonly registry: EngineRegistry) {}

  async dispatch(request: DispatchRequest, business: Business): Promise<OperationResult> {
    if (!business.capabilities.includes(request.capability)) return { success: false, message: `This business does not support ${request.capability}.`, operation: null, metadata: {} };
    const engine = this.registry.get(request.capability);
    if (!engine) return { success: false, message: `No engine is registered for ${request.capability}.`, operation: null, metadata: { availableCapabilities: this.registry.capabilities() } };
    try {
      return await engine[request.method](request, business);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown execution error.";
      return { success: false, message: `The requested operation could not be completed: ${message}`, operation: null, metadata: {} };
    }
  }
}
