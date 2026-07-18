import { RequestContext } from "@mastra/core/request-context";
import type { CoreMessageV4 } from "@mastra/core/agent/message-list";
import { z } from "zod";
import { receptionistAgent } from "../agents/receptionist.agent.js";
import { generateBusinessPrompt } from "../agents/prompt-generator.js";
import { createEngineRegistry } from "../engines/registered-engines.js";
import { isValidCustomerName } from "../engines/engine-utils.js";
import { explainBusinessInformation } from "../tools/business-tools.js";
import { DispatcherService } from "./dispatcher.service.js";
import { BusinessService } from "./business.service.js";
import { RecordService } from "./record.service.js";
import type { AgentInteraction, BusinessExtraction, InteractionInput } from "../types/interaction.js";
import type { OperationRequest, OperationResult } from "../types/operation.js";

const operationSchema = z.object({
  action: z.string(),
  capability: z.string(),
  payload: z.record(z.string(), z.unknown()),
});
const explainSchema = z.object({ topic: z.string() });

const agentInteractionSchema = z.object({
  intent: z.enum(["conversation", "clarification", "tool_call"]),
  tool: z.enum(["query", "mutate", "explain", "suggest"]).nullable(),
  arguments: z.union([operationSchema, explainSchema]).nullable(),
  response: z.string(),
});

const businessExtractionSchema = z.object({
  status: z.enum(["complete", "needs_more_info"]),
  business: z.object({
    name: z.string().min(1),
    businessType: z.string().min(1),
    configuration: z.record(z.string(), z.unknown()),
    capabilities: z.array(z.string().min(1)),
    rules: z.array(z.string()),
  }).nullable(),
  missingInformation: z.array(z.string()),
  message: z.string(),
});

export class AgentService {
  private readonly businessService = new BusinessService();
  private readonly recordService = new RecordService();
  private readonly dispatcher = new DispatcherService(createEngineRegistry());

  async respond(input: InteractionInput): Promise<AgentInteraction> {
    const business = await this.businessService.findById(input.businessId);
    const operations = await this.recordService.findByBusinessId(input.businessId);
    const systemPrompt = generateBusinessPrompt(business, operations);
    const messages: CoreMessageV4[] = [
      ...(input.history ?? []).map(({ role, content }): CoreMessageV4 => {
        if (role === "user") return { role: "user", content };
        return { role: "assistant", content };
      }),
      { role: "user", content: input.message },
    ];
    const requestContext = new RequestContext([
      ["systemPrompt", systemPrompt],
      ["dispatcher", this.dispatcher],
      ["business", business],
    ]);

    const result = await receptionistAgent.generate(messages, {
      requestContext,
      maxSteps: 4,
      structuredOutput: { schema: agentInteractionSchema },
    });

    const contextualOperationResult = requestContext.get("operationResult");
    const operationResult = isOperationResult(contextualOperationResult)
      ? contextualOperationResult
      : await this.executeDeclaredTool(result.object.tool, result.object.arguments, business, input.message, input.history ?? []);

    // Tool output is authoritative. Returning it directly prevents the model from
    // emitting a progress update after declaring (or executing) a tool request.
    if (operationResult && result.object.tool) {
      return {
        ...result.object,
        intent: "tool_call",
        // Tools are an internal implementation detail. Only mutations need a
        // customer-visible confirmation card; read operations are plain replies.
        tool: null,
        arguments: null,
        response: formatOperationResponse(operationResult),
        // The chat card needs only confirmation state and a customer-facing message.
        // Never expose database records, internal IDs, or metadata to customers.
        operationResult: result.object.tool === "mutate"
          ? { ...operationResult, operation: null, metadata: {} }
          : null,
      };
    }

    return { ...result.object, operationResult: null };
  }

  async extractBusiness(description: string): Promise<BusinessExtraction> {
    const onboardingPrompt = `You extract a local business profile from an owner's natural-language description.

Return structured JSON only. Never guess or fabricate required information. A person's name is not the business name unless they explicitly say it is the business name.

Required information for a complete profile: an explicit business name and an explicit business type. If either is absent or unclear, return status "needs_more_info", business null, identify the missing information, and ask one concise question.

When complete, return status "complete" and a business object with:
- name: the explicitly provided business name
- businessType: a concise type such as barber shop, bakery, gaming cafe, or restaurant
- configuration: a flexible object containing only details explicitly stated, including workingHours when supplied
- capabilities: infer only appropriate generic capabilities. Typical mappings are barber shop → appointments/faq, bakery → orders/faq, gaming cafe → reservations/faq, restaurant → orders/reservations. Include faq when appropriate.
- rules: an array of explicit operational rules.

Do not include the raw owner description in the output. Do not invoke tools. This extracted data will be reviewed by the owner before it can be saved.

Owner description:
${description}`;

    const requestContext = new RequestContext([["systemPrompt", onboardingPrompt]]);
    const result = await receptionistAgent.generate("Extract the business profile.", {
      requestContext,
      toolChoice: "none",
      structuredOutput: { schema: businessExtractionSchema },
    });
    return result.object;
  }

  private async executeDeclaredTool(
    tool: AgentInteraction["tool"],
    arguments_: AgentInteraction["arguments"],
    business: Awaited<ReturnType<BusinessService["findById"]>>,
    customerMessage: string,
    history: NonNullable<InteractionInput["history"]>,
  ): Promise<OperationResult | null> {
    if (!tool || !arguments_) return null;

    if (tool === "explain") {
      return "topic" in arguments_ ? explainBusinessInformation(business, arguments_.topic) : null;
    }

    if (!("capability" in arguments_)) return null;
    const conversationText = [...history.map(({ content }) => content), customerMessage].join("\n");
    const normalizedRequest = normalizeDatePayload(arguments_, conversationText);
    const appointmentRequest = completeAppointmentPayload(normalizedRequest, customerMessage, conversationText);

    return this.dispatcher.dispatch({
      ...appointmentRequest,
      method: tool,
    }, business);
  }
}

function normalizeDatePayload(request: OperationRequest, customerMessage: string, now = new Date()): OperationRequest {
  const payload = { ...request.payload };
  const suppliedDate = typeof payload.date === "string" ? payload.date.trim().toLowerCase() : "";
  const inferredDate = relativeDateFromText(suppliedDate || customerMessage, now);

  if (inferredDate) payload.date = inferredDate;
  return { ...request, payload };
}

function completeAppointmentPayload(request: OperationRequest, customerMessage: string, conversationText: string): OperationRequest {
  if (request.capability !== "appointments" || request.action !== "create") return request;

  const payload = { ...request.payload };
  if (typeof payload.startTime !== "string" || payload.startTime.trim().length === 0) {
    const startTime = findTime(conversationText);
    if (startTime) payload.startTime = startTime;
  }

  if (typeof payload.customer !== "string" || !isValidCustomerName(payload.customer)) {
    const customer = customerNameFromMessage(customerMessage);
    if (customer) payload.customer = customer;
    else delete payload.customer;
  }

  return { ...request, payload };
}

function findTime(value: string): string | null {
  const matches = [...value.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/gi)];
  const match = matches.at(-1);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const meridiem = match[3]?.toLowerCase();
  if (!meridiem || hour < 1 || hour > 12 || minute > 59) return null;
  const normalizedHour = (hour % 12) + (meridiem === "pm" ? 12 : 0);
  return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function customerNameFromMessage(message: string): string | null {
  const trimmed = message.trim();
  const explicitName = trimmed.match(/^(?:my name is|i am|i'm)\s+(.+)$/i)?.[1]?.trim() ?? trimmed;
  return isValidCustomerName(explicitName) ? explicitName : null;
}

function relativeDateFromText(value: string, now: Date): string | null {
  const normalized = value.toLowerCase();
  const offset = normalized.includes("tomorrow") ? 1 : normalized.includes("today") ? 0 : null;
  if (offset === null) return null;

  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatOperationResponse(result: OperationResult): string {
  if (!result.success) return result.message;

  const slots = result.metadata.slots;
  if (Array.isArray(slots)) {
    const formattedSlots = slots.map((slot) => typeof slot === "string" ? formatCustomerTime(slot) : String(slot));
    return slots.length > 0
      ? `Available times: ${formattedSlots.join(", ")}.`
      : "No times are available for that date.";
  }

  const appointments = result.metadata.appointments;
  if (Array.isArray(appointments)) {
    return appointments.length === 0
      ? "There are no appointments on the schedule yet. What date would you like to book?"
      : `I found ${appointments.length} appointment${appointments.length === 1 ? "" : "s"} on the schedule.`;
  }

  return result.message;
}

function formatCustomerTime(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = match[2];
  if (hour > 23 || minute === undefined) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function isOperationResult(value: unknown): value is OperationResult {
  return typeof value === "object" && value !== null && "success" in value && "message" in value && "operation" in value && "metadata" in value;
}
