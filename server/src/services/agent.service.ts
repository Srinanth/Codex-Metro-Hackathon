import { RequestContext } from "@mastra/core/request-context";
import type { CoreMessageV4 } from "@mastra/core/agent/message-list";
import { z } from "zod";
import { receptionistAgent } from "../agents/receptionist.agent.js";
import { generateBusinessPrompt } from "../agents/prompt-generator.js";
import { createEngineRegistry } from "../engines/registered-engines.js";
import { DispatcherService } from "./dispatcher.service.js";
import { BusinessService } from "./business.service.js";
import { RecordService } from "./record.service.js";
import type { AgentInteraction, BusinessExtraction, InteractionInput } from "../types/interaction.js";
import type { OperationResult } from "../types/operation.js";

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

    const operationResult = requestContext.get("operationResult");
    const validatedOperationResult = isOperationResult(operationResult) ? operationResult : null;

    // A factual tool result is already customer-ready and authoritative. Returning it
    // directly prevents the model from replying with a progress message such as
    // "I am checking" after it has completed the tool call.
    if (result.object.tool === "explain" && validatedOperationResult?.success) {
      return {
        ...result.object,
        intent: "tool_call",
        response: validatedOperationResult.message,
        operationResult: validatedOperationResult,
      };
    }

    return { ...result.object, operationResult: validatedOperationResult };
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
}

function isOperationResult(value: unknown): value is OperationResult {
  return typeof value === "object" && value !== null && "success" in value && "message" in value && "operation" in value && "metadata" in value;
}
