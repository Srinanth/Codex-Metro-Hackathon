import type { Request, Response } from "express";
import { AgentService } from "../services/agent.service.js";
import type { InteractionInput } from "../types/interaction.js";
import { sendSuccess } from "../utils/api-response.js";

const agentService = new AgentService();

export async function createInteraction(request: Request, response: Response): Promise<void> {
  const result = await agentService.respond(request.body as InteractionInput);
  sendSuccess(response, 200, "AI response generated.", result);
}

export async function extractBusiness(request: Request, response: Response): Promise<void> {
  const result = await agentService.extractBusiness((request.body as { description: string }).description);
  sendSuccess(response, 200, "Business information extracted.", result);
}
