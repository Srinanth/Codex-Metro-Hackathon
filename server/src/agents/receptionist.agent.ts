import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { env } from "../config/env.js";
import { explainTool, mutateTool, queryTool, suggestTool } from "../tools/business-tools.js";

const google = createGoogleGenerativeAI({ apiKey: env.geminiApiKey });

export const receptionistAgent = new Agent({
  id: "bizzai-receptionist",
  name: "BizzAI Receptionist",
  description: "A reusable AI receptionist that delegates deterministic work through four backend tools.",
  model: google(env.geminiModel),
  instructions: ({ requestContext }) => {
    const systemPrompt = requestContext.get("systemPrompt");
    return typeof systemPrompt === "string" ? systemPrompt : "You are BizzAI, a helpful business receptionist.";
  },
  tools: { query: queryTool, mutate: mutateTool, explain: explainTool, suggest: suggestTool },
});
