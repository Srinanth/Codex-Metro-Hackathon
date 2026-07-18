export type UserRole = "owner" | "customer";

export type BusinessProfile = {
  name: string;
  businessType: string;
  configuration: Record<string, unknown>;
  capabilities: string[];
  rules: string[];
};

export type Business = BusinessProfile & {
  id?: string;
  _id?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
};

export type Operation = {
  id?: string;
  _id?: string;
  businessId: string;
  entityType: string;
  status: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type OperationResult = { success: boolean; message: string; operation: Record<string, unknown> | null; metadata: Record<string, unknown> };

export type ReceptionistReply = {
  intent: "conversation" | "clarification" | "tool_call";
  tool: "query" | "mutate" | "explain" | "suggest" | null;
  arguments: ({ action: string; capability: string; payload: Record<string, unknown> } | { topic: string }) | null;
  response: string;
  operationResult: OperationResult | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  operation?: ReceptionistReply["operationResult"];
  operationRequest?: ReceptionistReply["arguments"];
};

export type BusinessExtraction = {
  status: "complete" | "needs_more_info";
  business: BusinessProfile | null;
  missingInformation: string[];
  message: string;
};
