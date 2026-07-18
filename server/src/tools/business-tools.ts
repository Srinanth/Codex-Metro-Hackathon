import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { Business } from "../models/business.model.js";
import { DispatcherService } from "../services/dispatcher.service.js";
import type { FlexibleData } from "../types/business.js";
import type { OperationResult } from "../types/operation.js";

const operationInput = z.object({
  capability: z.string().trim().min(1),
  action: z.string().trim().min(1),
  payload: z.record(z.string(), z.unknown()),
});

const explainInput = z.object({ topic: z.string().trim().min(1) });

type ToolContext = {
  requestContext?: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
  };
};

async function dispatch(
  method: "query" | "mutate" | "suggest",
  input: z.infer<typeof operationInput>,
  context: ToolContext,
): Promise<OperationResult> {
  const dispatcher = context.requestContext?.get("dispatcher");
  const business = context.requestContext?.get("business");

  if (!(dispatcher instanceof DispatcherService) || !isBusiness(business)) {
    return unavailableContextResult();
  }

  const result = await dispatcher.dispatch({ ...input, method }, business);
  context.requestContext?.set("operationResult", result);
  return result;
}

export const queryTool = createTool({
  id: "query",
  description: "Read current business operations or availability. Never use this tool to change data.",
  inputSchema: operationInput,
  execute: (input, context) => dispatch("query", input, context),
});

export const mutateTool = createTool({
  id: "mutate",
  description: "Create, update, or cancel a business operation. Use only when the customer requests a change.",
  inputSchema: operationInput,
  execute: (input, context) => dispatch("mutate", input, context),
});

export const suggestTool = createTool({
  id: "suggest",
  description: "Request a deterministic suggestion such as next availability or estimated wait time.",
  inputSchema: operationInput,
  execute: (input, context) => dispatch("suggest", input, context),
});

export const explainTool = createTool({
  id: "explain",
  description: "Retrieve factual business information such as services, working hours, rules, pricing, or contact details. Call this before answering a factual business question, then give the customer the returned information rather than saying that you are checking.",
  inputSchema: explainInput,
  execute: async (input, context): Promise<OperationResult> => {
    const business = context.requestContext?.get("business");
    if (!isBusiness(business)) {
      return unavailableContextResult("Business context is unavailable.");
    }

    const result = explainBusinessInformation(business, input.topic);
    context.requestContext?.set("operationResult", result);
    return result;
  },
});

export function explainBusinessInformation(business: Business, topic: string): OperationResult {
  const normalizedTopic = topic.toLowerCase();
  const information = selectBusinessInformation(business, normalizedTopic);
  const label = topicLabel(normalizedTopic);
  const renderedInformation = renderInformation(information);

  return {
    success: true,
    message: renderedInformation === "Not configured"
      ? `${business.name} has not configured ${label} yet.`
      : `${business.name} ${label}: ${renderedInformation}`,
    operation: null,
    metadata: { topic, information: information ?? "Not configured" },
  };
}

function selectBusinessInformation(business: Business, topic: string): unknown {
  if (topic.includes("service") || topic.includes("treatment") || topic.includes("offer") || topic.includes("product")) {
    return business.configuration.services ?? business.configuration.treatments ?? business.configuration.products;
  }

  if (topic.includes("hour") || topic.includes("open") || topic.includes("close")) {
    return business.configuration.workingHours ?? business.configuration.hours;
  }

  if (topic.includes("rule") || topic.includes("policy") || topic.includes("walk-in")) {
    return business.rules;
  }

  if (topic.includes("contact") || topic.includes("phone") || topic.includes("email") || topic.includes("address")) {
    return compactContactInformation(business);
  }

  if (topic.includes("price") || topic.includes("cost")) {
    return business.configuration.pricing ?? business.configuration.prices;
  }

  if (topic.includes("capabil")) {
    return business.capabilities;
  }

  return business.configuration;
}

function compactContactInformation(business: Business): FlexibleData {
  return Object.fromEntries(
    Object.entries({ phone: business.phone, email: business.email, address: business.address })
      .filter(([, value]) => Boolean(value)),
  );
}

function topicLabel(topic: string): string {
  if (topic.includes("service") || topic.includes("treatment") || topic.includes("offer") || topic.includes("product")) return "offers";
  if (topic.includes("hour") || topic.includes("open") || topic.includes("close")) return "working hours are";
  if (topic.includes("rule") || topic.includes("policy") || topic.includes("walk-in")) return "rules are";
  if (topic.includes("contact") || topic.includes("phone") || topic.includes("email") || topic.includes("address")) return "contact details are";
  if (topic.includes("price") || topic.includes("cost")) return "pricing is";
  if (topic.includes("capabil")) return "available capabilities are";
  return "business information is";
}

function renderInformation(value: unknown): string {
  if (value === undefined || value === null) return "Not configured";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length > 0 ? value.map(renderInformation).join(", ") : "Not configured";
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.length > 0
      ? entries.map(([key, entryValue]) => `${humanizeKey(key)}: ${renderInformation(entryValue)}`).join("; ")
      : "Not configured";
  }
  return "Not configured";
}

function humanizeKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
}

function unavailableContextResult(message = "The business operation context is unavailable."): OperationResult {
  return { success: false, message, operation: null, metadata: {} };
}

function isBusiness(value: unknown): value is Business {
  return typeof value === "object" && value !== null && "name" in value && "capabilities" in value;
}
