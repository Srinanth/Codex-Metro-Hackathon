import type { BusinessEngine } from "./engine.types.js";

export class EngineRegistry {
  private readonly engines = new Map<string, BusinessEngine>();

  register(engine: BusinessEngine): this {
    this.engines.set(engine.capability, engine);
    return this;
  }

  get(capability: string): BusinessEngine | undefined {
    return this.engines.get(capability);
  }

  capabilities(): string[] {
    return [...this.engines.keys()];
  }
}
