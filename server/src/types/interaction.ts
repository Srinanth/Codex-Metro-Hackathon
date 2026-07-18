import type { OperationRequest } from "./operation.js";
import type { OperationResult } from "./operation.js";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type InteractionInput = {
  businessId: string;
  message: string;
  history?: ConversationMessage[];
};

export type AgentToolArguments = OperationRequest | { topic: string };

export type AgentInteraction = {
  intent: "conversation" | "clarification" | "tool_call";
  tool: "query" | "mutate" | "explain" | "suggest" | null;
  arguments: AgentToolArguments | null;
  response: string;
  operationResult: OperationResult | null;
};

export type BusinessExtraction = {
  status: "complete" | "needs_more_info";
  business: {
    name: string;
    businessType: string;
    configuration: Record<string, unknown>;
    capabilities: string[];
    rules: string[];
  } | null;
  missingInformation: string[];
  message: string;
};
